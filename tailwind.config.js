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
        // Master Design Language: Calm Futurism x Ayurvedic Precision
        dravya: {
          bg: '#07100B',
          'bg-soft': '#0C1711',
          surface: 'rgba(255, 255, 255, 0.04)',
          'surface-elevated': 'rgba(255, 255, 255, 0.07)',
          border: 'rgba(255, 255, 255, 0.08)',
          'border-light': 'rgba(255, 255, 255, 0.14)',
          primary: '#3E7B4C',
          'primary-light': '#529662',
          'primary-dark': '#295433',
          amber: '#E0A03A',
          lime: '#B6F36A',
          text: '#EDEFE8',
          muted: '#8A968E',
          dim: '#4F5B53',
        },
        obsidian: '#07100B',
        void: '#040906',
        surface: 'rgba(255, 255, 255, 0.04)',
        'surface-hover': 'rgba(255, 255, 255, 0.08)',
        border: 'rgba(255, 255, 255, 0.08)',
        'border-strong': 'rgba(255, 255, 255, 0.16)',
        'border-glow': 'rgba(182, 243, 106, 0.35)',
        // Retain existing accents for dashboard compatibility
        teal: {
          light: '#2DD4BF',
          DEFAULT: '#0D9488',
          dark: '#115E59',
        },
        cyan: {
          light: '#38BDF8',
          DEFAULT: '#0284C7',
          dark: '#0369A1',
        },
        emerald: {
          light: '#34D399',
          DEFAULT: '#10B981',
          dark: '#059669',
        },
        amber: {
          light: '#FDE68A',
          DEFAULT: '#E0A03A',
          dark: '#B47B20',
        },
        lime: {
          light: '#D9F99D',
          DEFAULT: '#B6F36A',
          dark: '#84CC16',
        },
      },
      fontFamily: {
        display: ['Fraunces', 'Instrument Serif', 'serif'],
        serif: ['Instrument Serif', 'Fraunces', 'serif'],
        sans: ['Inter Tight', 'Inter', '-apple-system', 'BlinkMacSystemFont', 'sans-serif'],
        mono: ['Geist Mono', 'JetBrains Mono', 'ui-monospace', 'monospace'],
        devanagari: ['Noto Serif Devanagari', 'serif'],
      },
      borderRadius: {
        'card': '24px',
        'card-lg': '28px',
      },
      animation: {
        'spin-slow': 'spin 14s linear infinite',
        'pulse-slow': 'pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'float': 'float 6s ease-in-out infinite',
        'float-slow': 'float 9s ease-in-out infinite',
        'aurora': 'aurora 20s linear infinite',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        aurora: {
          '0%': { backgroundPosition: '0% 50%' },
          '50%': { backgroundPosition: '100% 50%' },
          '100%': { backgroundPosition: '0% 50%' },
        },
      },
    },
  },
  plugins: [],
}
