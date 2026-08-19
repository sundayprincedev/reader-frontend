export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        ink: {
          950: '#080a0f',
          900: '#0d1017',
          800: '#141822',
          700: '#1d2230',
          600: '#2a3142',
          400: '#6b7488',
          200: '#b8bfcd',
        },
        amber: '#e8a33d',
      },
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        serif: ['Literata', 'Georgia', 'ui-serif', 'serif'],
      },
      keyframes: {
        rise: {
          '0%': { opacity: '0', transform: 'translateY(10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
      animation: {
        rise: 'rise 0.35s ease-out both',
      },
    },
  },
  plugins: [],
}
