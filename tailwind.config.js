/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{js,ts,jsx,tsx,mdx}'],
  theme: {
    extend: {
      colors: {
        primary: { DEFAULT: '#f4a900', light: '#FFC133', dark: '#d98b19' },
        brand: {
          bg: '#fdf4e3', bgDark: '#f3e6ce',
          text: '#1b1a18', textLight: '#543e35', textLighter: '#9B6E50',
          green: '#366025', lgreen: '#78C841', blue: '#33A1E0',
          red: '#E52020', gray: '#DDDAD0',
        },
      },
      fontFamily: {
        display: ['Fraunces', 'serif'],
        body: ['Nunito', 'sans-serif'],
      },
      animation: {
        float: 'float 6s ease-in-out infinite',
        marquee: 'marquee 25s linear infinite',
        shimmer: 'shimmer 2s linear infinite',
        'spin-slow': 'spin 8s linear infinite',
        'bounce-slow': 'bounce 3s ease-in-out infinite',
        'fade-up': 'fadeUp 0.6s ease forwards',
        'run-pet': 'runPet 15s linear infinite',
      },
      keyframes: {
        float: { '0%,100%': { transform: 'translateY(0)' }, '50%': { transform: 'translateY(-18px)' } },
        marquee: { '0%': { transform: 'translateX(0)' }, '100%': { transform: 'translateX(-50%)' } },
        shimmer: { '0%': { backgroundPosition: '200% 0' }, '100%': { backgroundPosition: '-200% 0' } },
        fadeUp: { from: { opacity: 0, transform: 'translateY(24px)' }, to: { opacity: 1, transform: 'translateY(0)' } },
        runPet: { '0%': { transform: 'translateX(-200px)' }, '100%': { transform: 'translateX(110vw)' } },
      },
    },
  },
  plugins: [],
};
