const base = {
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 1.7,
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

export const BackIcon = (props) => (
  <Icon {...props}>
    <path d="M15 5l-7 7 7 7" />
  </Icon>
)

export const HistoryIcon = (props) => (
  <Icon {...props}>
    <path d="M3 12a9 9 0 1 0 3-6.7L3 8" />
    <path d="M3 4v4h4" />
    <path d="M12 8v4l3 2" />
  </Icon>
)

export const ExpandIcon = (props) => (
  <Icon {...props}>
    <path d="M4 9V4h5" />
    <path d="M20 15v5h-5" />
    <path d="M15 4h5v5" />
    <path d="M9 20H4v-5" />
  </Icon>
)

export const CollapseIcon = (props) => (
  <Icon {...props}>
    <path d="M9 4v5H4" />
    <path d="M15 20v-5h5" />
    <path d="M20 9h-5V4" />
    <path d="M4 15h5v5" />
  </Icon>
)

export const PlusIcon = (props) => (
  <Icon {...props}>
    <path d="M12 5v14M5 12h14" />
  </Icon>
)

export const TrashIcon = (props) => (
  <Icon {...props}>
    <path d="M4 7h16M10 11v6M14 11v6" />
    <path d="M6 7l1 12a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2l1-12" />
    <path d="M9 7V4h6v3" />
  </Icon>
)

export const RefreshIcon = (props) => (
  <Icon {...props}>
    <path d="M20 12a8 8 0 1 1-2.3-5.6" />
    <path d="M20 4v5h-5" />
  </Icon>
)

export const TextIcon = (props) => (
  <Icon {...props}>
    <path d="M4 6h16M7 12h10M9 18h6" />
  </Icon>
)

export const BookIcon = (props) => (
  <Icon {...props}>
    <path d="M4 5a2 2 0 0 1 2-2h5v18H6a2 2 0 0 1-2-2z" />
    <path d="M20 5a2 2 0 0 0-2-2h-5v18h5a2 2 0 0 0 2-2z" />
  </Icon>
)

export const DevicesIcon = (props) => (
  <Icon {...props}>
    <rect x="3" y="4" width="12" height="16" rx="1.5" />
    <path d="M15 8h5v11a1.5 1.5 0 0 1-1.5 1.5H15" />
  </Icon>
)
