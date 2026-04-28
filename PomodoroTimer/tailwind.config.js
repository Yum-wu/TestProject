/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        pomodoro: {
          red: '#E74C3C',
          darkRed: '#C0392B',
          green: '#27AE60',
          darkGreen: '#1E8449',
          bg: '#2C3E50',
          darkBg: '#1A252F',
          card: '#34495E',
          text: '#ECF0F1',
          muted: '#95A5A6',
        },
      },
      fontFamily: {
        display: ['"Nunito"', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'monospace'],
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'spin-slow': 'spin 3s linear infinite',
      },
    },
  },
  plugins: [],
}