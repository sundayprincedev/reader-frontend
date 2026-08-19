const base = {
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 1.6,
  strokeLinecap: 'round',
  strokeLinejoin: 'round',
  viewBox: '0 0 24 24',
}

function Icon({ children, className = 'h-5 w-5' }) {
  return (
    <svg {...base} className={className} aria-hidden="true">
      {children}
    </svg>
  )
}

export const ArrowLeft = (props) => (
  <Icon {...props}>
    <path d="M15 5l-7 7 7 7" />
  </Icon>
)

export const Clock = (props) => (
  <Icon {...props}>
    <circle cx="12" cy="12" r="9" />
    <path d="M12 7v5.5l3.5 2" />
  </Icon>
)

export const Expand = (props) => (
  <Icon {...props}>
    <path d="M4 9V4h5M20 15v5h-5M15 4h5v5M9 20H4v-5" />
  </Icon>
)

export const Collapse = (props) => (
  <Icon {...props}>
    <path d="M9 4v5H4M15 20v-5h5M20 9h-5V4M4 15h5v5" />
  </Icon>
)

export const Plus = (props) => (
  <Icon {...props}>
    <path d="M12 5v14M5 12h14" />
  </Icon>
)

export const Trash = (props) => (
  <Icon {...props}>
    <path d="M4 7h16M10 11v6M14 11v6" />
    <path d="M6 7l1 12a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2l1-12" />
    <path d="M9 7V4h6v3" />
  </Icon>
)

export const Rewind = (props) => (
  <Icon {...props}>
    <path d="M20 12a8 8 0 1 1-2.3-5.6" />
    <path d="M20 4v5h-5" />
  </Icon>
)

export const Type = (props) => (
  <Icon {...props}>
    <path d="M4 6h16M7 12h10M9 18h6" />
  </Icon>
)

export const Check = (props) => (
  <Icon {...props}>
    <path d="M5 12.5l4.5 4.5L19 7" />
  </Icon>
)

export const Cloud = (props) => (
  <Icon {...props}>
    <path d="M7 18a4 4 0 0 1-.6-7.95 5.5 5.5 0 0 1 10.8-1.1A3.75 3.75 0 0 1 17.5 18z" />
  </Icon>
)
