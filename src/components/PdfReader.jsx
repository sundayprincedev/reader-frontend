import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useEventCallback, useInitialValue } from '../hooks/useEventCallback'
import * as pdfjs from 'pdfjs-dist'
import workerUrl from 'pdfjs-dist/build/pdf.worker.min.mjs?url'

pdfjs.GlobalWorkerOptions.workerSrc = workerUrl

const PAGE_GAP = 8
const RENDER_MARGIN = '200% 0px'
const MAX_LIVE_CANVASES = 10

export default function PdfReader({ file, startLocation, onLocationChange, onReady, onError, zoom }) {
  const initialLocation = useInitialValue(startLocation)
  const reportLocation = useEventCallback(onLocationChange)
  const reportReady = useEventCallback(onReady)
  const reportError = useEventCallback(onError)
  const scrollRef = useRef(null)
  const documentRef = useRef(null)
  const canvasRefs = useRef(new Map())
  const renderTasks = useRef(new Map())
  const liveOrder = useRef([])
  const restored = useRef(false)
  const anchorRef = useRef(null)

  const [basePages, setBasePages] = useState([])
  const [containerWidth, setContainerWidth] = useState(0)
  const [visiblePages, setVisiblePages] = useState(() => new Set())

  const fitScale = useMemo(() => {
    if (!containerWidth || basePages.length === 0) {
      return 0
    }
    const pad = containerWidth < 640 ? 12 : 28
    const widest = Math.max(...basePages.map((page) => page.width))
    return ((containerWidth - pad) / widest) * zoom
  }, [containerWidth, basePages, zoom])

  const layout = useMemo(() => {
    if (!fitScale) {
      return []
    }
    return basePages.map((page) => ({
      width: Math.floor(page.width * fitScale),
      height: Math.floor(page.height * fitScale),
    }))
  }, [basePages, fitScale])

  useEffect(() => {
    let cancelled = false
    let task = null

    async function load() {
      try {
        const buffer = await file.arrayBuffer()
        if (cancelled) {
          return
        }

        task = pdfjs.getDocument({ data: buffer })
        const pdf = await task.promise
        if (cancelled) {
          return
        }
        documentRef.current = pdf

        const sizes = []
        for (let index = 1; index <= pdf.numPages; index += 1) {
          const page = await pdf.getPage(index)
          const viewport = page.getViewport({ scale: 1 })
          sizes.push({ width: viewport.width, height: viewport.height })
          if (cancelled) {
            return
          }
        }

        setBasePages(sizes)
        reportReady?.({ pages: pdf.numPages })
      } catch (error) {
        if (!cancelled) {
          reportError?.(error)
        }
      }
    }

    load()

    return () => {
      cancelled = true
      renderTasks.current.forEach((entry) => entry.cancel())
      renderTasks.current.clear()
      task?.destroy?.()
      documentRef.current = null
    }
  }, [file, reportReady, reportError])

  useEffect(() => {
    const container = scrollRef.current
    if (!container) {
      return undefined
    }

    const observer = new ResizeObserver((entries) => {
      setContainerWidth(entries[0].contentRect.width)
    })
    observer.observe(container)
    setContainerWidth(container.clientWidth)

    return () => observer.disconnect()
  }, [])

  const readAnchor = useCallback(() => {
    const container = scrollRef.current
    if (!container || layout.length === 0) {
      return null
    }

    let top = 0
    for (let index = 0; index < layout.length; index += 1) {
      const height = layout[index].height
      if (container.scrollTop < top + height + PAGE_GAP || index === layout.length - 1) {
        return { page: index + 1, offset: Math.min(1, Math.max(0, (container.scrollTop - top) / height)) }
      }
      top += height + PAGE_GAP
    }
    return null
  }, [layout])

  const scrollToAnchor = useCallback(
    (anchor) => {
      const container = scrollRef.current
      if (!container || !anchor || layout.length === 0) {
        return
      }

      const index = Math.min(Math.max(anchor.page, 1), layout.length) - 1
      let top = 0
      for (let cursor = 0; cursor < index; cursor += 1) {
        top += layout[cursor].height + PAGE_GAP
      }

      container.scrollTop = top + layout[index].height * (anchor.offset || 0)
    },
    [layout],
  )

  useEffect(() => {
    if (layout.length === 0) {
      return
    }

    if (!restored.current) {
      restored.current = true
      if (initialLocation?.page > 0) {
        scrollToAnchor({ page: initialLocation.page, offset: initialLocation.offset })
      }
      return
    }

    if (anchorRef.current) {
      scrollToAnchor(anchorRef.current)
      anchorRef.current = null
    }
  }, [layout, initialLocation, scrollToAnchor])

  useEffect(() => {
    anchorRef.current = readAnchor()
  }, [zoom, readAnchor])

  useEffect(() => {
    const container = scrollRef.current
    if (!container || layout.length === 0) {
      return undefined
    }

    const observer = new IntersectionObserver(
      (entries) => {
        setVisiblePages((current) => {
          const next = new Set(current)
          entries.forEach((entry) => {
            const page = Number(entry.target.dataset.page)
            if (entry.isIntersecting) {
              next.add(page)
            } else {
              next.delete(page)
            }
          })
          return next
        })
      },
      { root: container, rootMargin: RENDER_MARGIN },
    )

    container.querySelectorAll('[data-page]').forEach((node) => observer.observe(node))
    return () => observer.disconnect()
  }, [layout.length])

  useEffect(() => {
    const pdf = documentRef.current
    if (!pdf || !fitScale) {
      return
    }

    visiblePages.forEach((pageNumber) => {
      const canvas = canvasRefs.current.get(pageNumber)
      if (!canvas || renderTasks.current.has(pageNumber) || canvas.dataset.scale === String(fitScale)) {
        return
      }

      let cancelled = false
      renderTasks.current.set(pageNumber, { cancel: () => { cancelled = true } })

      pdf
        .getPage(pageNumber)
        .then((page) => {
          if (cancelled) {
            return null
          }

          const viewport = page.getViewport({ scale: fitScale })
          const ratio = Math.min(window.devicePixelRatio || 1, 2)

          canvas.width = Math.floor(viewport.width * ratio)
          canvas.height = Math.floor(viewport.height * ratio)

          const context = canvas.getContext('2d', { alpha: false })
          context.setTransform(ratio, 0, 0, ratio, 0, 0)

          return page.render({ canvasContext: context, viewport }).promise
        })
        .then(() => {
          if (!cancelled) {
            canvas.dataset.scale = String(fitScale)
            liveOrder.current = [...liveOrder.current.filter((value) => value !== pageNumber), pageNumber]

            while (liveOrder.current.length > MAX_LIVE_CANVASES) {
              const evicted = liveOrder.current.shift()
              const stale = canvasRefs.current.get(evicted)
              if (stale && !visiblePages.has(evicted)) {
                stale.width = 0
                stale.height = 0
                delete stale.dataset.scale
              }
            }
          }
        })
        .catch(() => undefined)
        .finally(() => {
          renderTasks.current.delete(pageNumber)
        })
    })
  }, [visiblePages, fitScale])

  const handleScroll = useCallback(() => {
    const container = scrollRef.current
    const anchor = readAnchor()
    if (!container || !anchor) {
      return
    }

    const scrollable = container.scrollHeight - container.clientHeight
    const percent = scrollable > 0 ? (container.scrollTop / scrollable) * 100 : 0

    reportLocation?.({
      page: anchor.page,
      pages: layout.length,
      cfi: '',
      offset: anchor.offset,
      percent,
      label: `Page ${anchor.page} of ${layout.length}`,
    })
  }, [readAnchor, layout.length, reportLocation])

  return (
    <div
      ref={scrollRef}
      onScroll={handleScroll}
      className="h-full w-full overflow-y-auto overflow-x-hidden overscroll-none bg-ink-950 [scrollbar-width:none] [touch-action:pan-y] [&::-webkit-scrollbar]:hidden"
    >
      <div className="flex flex-col items-center gap-2 py-4 sm:gap-3 sm:py-6">
        {layout.map((page, index) => (
          <div
            key={index + 1}
            data-page={index + 1}
            style={{ width: page.width, height: page.height }}
            className="overflow-hidden bg-[#f4efe4]"
          >
            <canvas
              ref={(node) => {
                if (node) {
                  canvasRefs.current.set(index + 1, node)
                } else {
                  canvasRefs.current.delete(index + 1)
                }
              }}
              style={{ width: page.width, height: page.height }}
              className="block"
            />
          </div>
        ))}
      </div>
    </div>
  )
}
