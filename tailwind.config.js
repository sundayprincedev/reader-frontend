export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        ink: {
          50: '#f3ead8',
          100: '#e6d9c0',
          200: '#d4c8b4',
          400: '#8f816c',
          600: '#5c4f40',
          700: '#3d342a',
          800: '#26211b',
          900: '#1c1814',
          950: '#12100c',
        },
        rust: '#c24e2d',
      },
      fontFamily: {
        display: ['Fraunces', 'Georgia', 'ui-serif', 'serif'],
        sans: ['Source Sans 3', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        serif: ['Literata', 'Georgia', 'ui-serif', 'serif'],
      },
      keyframes: {
        slide: {
          '0%': { transform: 'translateX(-80%)' },
          '100%': { transform: 'translateX(180%)' },
        },
      },
      animation: {
        slide: 'slide 1.1s ease-in-out infinite',
      },
    },
  },
  plugins: [],
}
