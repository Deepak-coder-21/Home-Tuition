/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Human-crafted natural brand palette (Strictly NO PURPLE/VIOLET)
        brand: {
          50: '#F2F8F5',
          100: '#E1EFEA',
          200: '#C3DFD5',
          300: '#96C6B5',
          400: '#64A691',
          500: '#338A73',
          600: '#23705C',
          700: '#1B5646',
          800: '#144135',
          900: '#0E2D25', // Deep Forest / Heritage Pine
          950: '#071A15',
        },
        terracotta: {
          50: '#FDF7F4',
          100: '#FAEDE7',
          200: '#F5DACF',
          300: '#EBBBAA',
          400: '#DD937B',
          500: '#CB6948',
          600: '#B64C2B',
          700: '#953B20',
          800: '#79321D',
          900: '#632C1C',
        },
        warm: {
          50: '#FBF9F5', // Cream Ivory background
          100: '#F6F2EA',
          200: '#EDE4D4',
          300: '#DECDB6',
          400: '#CBB194',
          500: '#BA9677',
          600: '#A78061',
          700: '#89654C',
          800: '#6F523F',
          900: '#5C4435',
        },
        surface: {
          DEFAULT: '#FFFFFF',
          muted: '#F8F6F1',
          card: '#FFFFFF',
          border: '#E8E3DA',
        }
      },
      fontFamily: {
        sans: ['"Plus Jakarta Sans"', 'system-ui', '-apple-system', 'sans-serif'],
        serif: ['"Instrument Serif"', 'Georgia', 'serif'],
      },
      boxShadow: {
        'soft': '0 2px 12px -2px rgba(14, 45, 37, 0.06), 0 1px 4px -1px rgba(14, 45, 37, 0.04)',
        'card': '0 8px 30px -4px rgba(14, 45, 37, 0.08)',
        'elevated': '0 20px 40px -10px rgba(14, 45, 37, 0.12)',
      }
    },
  },
  plugins: [],
}
