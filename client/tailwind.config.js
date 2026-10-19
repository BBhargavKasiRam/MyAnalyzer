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
        dark: {
          950: '#090d16',
          900: '#0f172a',
          850: '#131e36',
          800: '#1e293b',
          700: '#334155',
          600: '#475569'
        },
        platform: {
          codeforces: '#3b82f6', // blue
          leetcode: '#f59e0b',   // orange/gold
          codechef: '#9333ea',   // violet/purple
          cfBg: '#1e3a8a',
          lcBg: '#78350f',
          ccBg: '#581c87'
        },
        heat: {
          0: '#161e2e',
          1: '#0e4429',
          2: '#006d32',
          3: '#26a641',
          4: '#39d353'
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'monospace']
      }
    },
  },
  plugins: [],
};
