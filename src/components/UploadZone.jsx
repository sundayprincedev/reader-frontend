import { useCallback, useRef, useState } from 'react'
import { PlusIcon } from './Icons'

export default function UploadZone({ onFiles, busy }) {
  const inputRef = useRef(null)
  const [dragging, setDragging] = useState(false)

  const handleFiles = useCallback(
    (fileList) => {
      const files = Array.from(fileList || [])
      if (files.length > 0) {
        onFiles(files)
      }
    },
    [onFiles],
  )

  return (
    <div
      onDragOver={(event) => {
        event.preventDefault()
        setDragging(true)
      }}
      onDragLeave={() => setDragging(false)}
      onDrop={(event) => {
        event.preventDefault()
        setDragging(false)
        handleFiles(event.dataTransfer.files)
      }}
      onClick={() => inputRef.current?.click()}
      className={`group flex cursor-pointer flex-col items-center justify-center gap-3 rounded-2xl border border-dashed p-8 text-center transition ${
        dragging ? 'border-amber bg-amber/5' : 'border-ink-600 bg-ink-900/60 hover:border-ink-400'
      }`}
    >
      <input
        ref={inputRef}
        type="file"
        accept=".pdf,.epub,application/pdf,application/epub+zip"
        multiple
        className="hidden"
        onChange={(event) => {
          handleFiles(event.target.files)
          event.target.value = ''
        }}
      />
      <span className="flex h-11 w-11 items-center justify-center rounded-full bg-ink-800 text-amber transition group-hover:scale-105">
        <PlusIcon />
      </span>
      <div>
        <p className="text-sm font-medium text-ink-200">
          {busy ? 'Preparing your books…' : 'Add PDF or EPUB'}
        </p>
        <p className="mt-1 text-xs text-ink-400">
          Files stay on this device. Only your reading position is synced.
        </p>
      </div>
    </div>
  )
}
