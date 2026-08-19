import { coverFor, initialsFor } from '../lib/cover'

export default function BookCover({ book, className = '' }) {
  const palette = coverFor(book.key)

  return (
    <div
      className={`relative isolate flex aspect-[2/3] items-center justify-center overflow-hidden rounded-[3px] shadow-cover ${className}`}
      style={{ backgroundColor: palette.light, containerType: 'inline-size' }}
    >
      <div
        className="absolute inset-0 hidden dark:block"
        style={{ backgroundColor: palette.dark }}
        aria-hidden="true"
      />
      <div
        className="absolute inset-y-0 left-0 w-[6%] bg-black/20 mix-blend-multiply"
        aria-hidden="true"
      />
      <span className="relative z-10 select-none font-serif text-[clamp(1.1rem,14cqw,2.6rem)] font-normal tracking-tight text-white/95">
        {initialsFor(book.title)}
      </span>
      <span className="absolute inset-x-0 bottom-0 z-10 truncate px-[7%] pb-[6%] text-center font-sans text-[clamp(0.4rem,5cqw,0.62rem)] uppercase tracking-label text-white/70">
        {book.format}
      </span>
    </div>
  )
}
