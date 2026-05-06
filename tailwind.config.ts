import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        display: ['var(--font-baloo2)', 'sans-serif'],
        body: ['var(--font-be-vietnam-pro)', 'sans-serif'],
        hindi: ['var(--font-mukta)', 'sans-serif'],
      },
      keyframes: {
        'modal-in': {
          '0%': { opacity: '0', transform: 'scale(0.92)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
      },
      animation: {
        'pulse-slow': 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'modal-in': 'modal-in 0.2s ease-out forwards',
      },
      colors: {
        navy: {
          50: '#f0f4ff',
          100: '#e0e9ff',
          500: '#1e3a5f',
          600: '#162d4a',
          700: '#0f2035',
          800: '#0a1628',
          900: '#050b14',
        },
      },
    },
  },
  plugins: [],
}

export default config
