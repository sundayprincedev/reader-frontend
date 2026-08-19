export default {
  darkMode: 'media',
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        paper: 'rgb(var(--paper) / <alpha-value>)',
        surface: 'rgb(var(--surface) / <alpha-value>)',
        raised: 'rgb(var(--raised) / <alpha-value>)',
        ink: 'rgb(var(--ink) / <alpha-value>)',
        muted: 'rgb(var(--muted) / <alpha-value>)',
        faint: 'rgb(var(--faint) / <alpha-value>)',
        line: 'rgb(var(--line) / <alpha-value>)',
        accent: 'rgb(var(--accent) / <alpha-value>)',
      },
      fontFamily: {
        sans: ['Source Sans 3', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        serif: ['Fraunces', 'Literata', 'Iowan Old Style', 'Georgia', 'ui-serif', 'serif'],
        reading: ['Literata', 'Georgia', 'ui-serif', 'serif'],
      },
      letterSpacing: {
        label: '0.09em',
      },
      boxShadow: {
        cover: '0 1px 2px rgb(0 0 0 / 0.10), 0 8px 24px -12px rgb(0 0 0 / 0.35)',
        lift: '0 2px 4px rgb(0 0 0 / 0.06), 0 16px 40px -20px rgb(0 0 0 / 0.40)',
        panel: '0 24px 70px -30px rgb(0 0 0 / 0.55)',
      },
      keyframes: {
        rise: {
          from: { opacity: '0', transform: 'translateY(8px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
        fade: {
          from: { opacity: '0' },
          to: { opacity: '1' },
        },
      },
      animation: {
        rise: 'rise 0.4s cubic-bezier(0.22, 1, 0.36, 1) both',
        fade: 'fade 0.3s ease-out both',
      },
    },
  },
  plugins: [],
}
