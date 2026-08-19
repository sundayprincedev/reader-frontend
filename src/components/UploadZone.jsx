import { useCallback, useRef, useState } from 'react'
import { PlusIcon } from './Icons'

export default function UploadZone({ onFiles, busy, compact = false }) {
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
      onKeyDown={(event) => {
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault()
          inputRef.current?.click()
        }
      }}
      role="button"
      tabIndex={0}
      className={
        compact
          ? 'flex min-h-12 w-full cursor-pointer items-center justify-center gap-2 bg-rust text-sm font-medium text-ink-50 active:brightness-110'
          : `flex w-full cursor-pointer flex-col items-start gap-1 border border-dashed px-5 py-6 text-left transition ${
              dragging ? 'border-rust bg-rust/10' : 'border-ink-600 hover:border-ink-400'
            }`
      }
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
      {compact ? (
        <>
          <PlusIcon className="h-4 w-4" />
          {busy ? 'Adding…' : 'Add a book'}
        </>
      ) : (
        <>
          <span className="font-display text-xl text-ink-50">{busy ? 'Preparing…' : 'Drop a PDF or EPUB'}</span>
          <span className="text-[12px] text-ink-400">
            Files stay on this device. Only your place in the book is synced.
          </span>
        </>
      )}
    </div>
  )
}
