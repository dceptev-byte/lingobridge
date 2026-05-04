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
