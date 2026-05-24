import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./src/**/*.{js,ts,jsx,tsx,mdx}'],
  theme: {
    extend: {
      fontFamily: {
        display: ['var(--font-display)', 'serif'],
        body: ['var(--font-body)', 'sans-serif'],
        mono: ['var(--font-mono)', 'monospace'],
      },
      colors: {
        ink: {
          50: '#f7f6f3',
          100: '#eae8e1',
          200: '#d5d0c3',
          300: '#b8b09e',
          400: '#9a8f79',
          500: '#7d7260',
          600: '#635a4d',
          700: '#504840',
          800: '#3d3733',
          900: '#2a2522',
          950: '#1a1715',
        },
        press: {
          DEFAULT: '#c4451a',
          light: '#e8652e',
          dark: '#8f3214',
          muted: '#d4815e',
        },
        paper: {
          DEFAULT: '#faf8f5',
          warm: '#f5f0e8',
          cream: '#f0ebe0',
        },
      },
      fontSize: {
        '2xs': ['0.65rem', { lineHeight: '1rem' }],
      },
      letterSpacing: {
        widest: '0.2em',
        display: '0.05em',
      },
      animation: {
        'fade-in': 'fadeIn 0.6s ease-out forwards',
        'slide-up': 'slideUp 0.5s ease-out forwards',
        'letter-spread': 'letterSpread 0.8s ease-out forwards',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        letterSpread: {
          '0%': { letterSpacing: '-0.05em', opacity: '0' },
          '100%': { letterSpacing: '0.2em', opacity: '1' },
        },
      },
    },
  },
  plugins: [],
};

export default config;
