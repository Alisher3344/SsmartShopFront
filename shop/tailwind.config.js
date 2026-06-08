/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // #460087 (to'q binafsha-ko'k) asosidagi palitra
        primary: {
          50:  '#f4eefc',
          100: '#e7d8f8',
          200: '#cfb1f1',
          300: '#b083e9',
          400: '#8a4cdb',
          500: '#6a1cc7',  // o'rta
          600: '#5a10a8',  // tugmalar uchun asosiy
          700: '#460087',  // ⭐ KERAKLI RANG
          800: '#380070',
          900: '#2a0058',
        },
        accent: {
          500: '#f59e0b',
          600: '#d97706',
        },
      },
      fontFamily: {
        // sans o'zgarmaydi → admin Inter'da qoladi
        sans: ['Inter', 'system-ui', 'sans-serif'],
        // display — faqat do'kon (shop) sarlavhalarida ishlatiladi
        display: ['Unbounded', 'Inter', 'system-ui', 'sans-serif'],
      },
      transitionTimingFunction: {
        // "spring" — premium qatlamdagi egri bilan bir xil
        spring: 'cubic-bezier(0.22, 1, 0.36, 1)',
      },
      animation: {
        'fade-in': 'fadeIn 0.3s ease-in-out',
        'slide-up': 'slideUp 0.4s ease-out',
        'aurora-drift': 'auroraDrift 22s ease-in-out infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(20px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        auroraDrift: {
          '0%, 100%': { transform: 'translate3d(0, 0, 0) scale(1)' },
          '50%': { transform: 'translate3d(2%, -2%, 0) scale(1.06)' },
        },
      },
    },
  },
  plugins: [],
}
