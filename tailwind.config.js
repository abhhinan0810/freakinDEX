/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        dark: {
          main: '#0B0B0F',
          card: '#17171F',
          secondary: '#20202A',
          border: '#2A2A35',
        },
        accent: {
          purple: '#A855F7',
          pink: '#EC4899',
        },
        rating: {
          star: '#FFC857',
        },
        txt: {
          primary: '#FFFFFF',
          secondary: '#92929E',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
      },
      boxShadow: {
        'glow-purple': '0 0 20px -5px rgba(168, 85, 247, 0.4)',
        'glow-pink': '0 0 20px -5px rgba(236, 72, 153, 0.4)',
        'card': '0 4px 20px -2px rgba(0, 0, 0, 0.5)',
      }
    },
  },
  plugins: [],
}

