import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './src/**/*.{ts,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        navy: {
          DEFAULT: '#0f1225',
          50: '#eeeef5',
          100: '#d5d6e3',
          200: '#a8aac4',
          300: '#7b7ea5',
          400: '#4e5286',
          500: '#2a2e5e',
          600: '#1c2045',
          700: '#14172f',
          800: '#0f1225',
          900: '#080a18',
          950: '#04050d',
        },
        'eu-blue': {
          DEFAULT: '#003399',
          50: '#eef3ff',
          100: '#dae4fc',
          200: '#b3c7f9',
          300: '#7da0f2',
          400: '#4d7de8',
          500: '#003399',
          600: '#002b80',
          700: '#002266',
          800: '#001a4d',
          900: '#001133',
        },
        'eu-gold': {
          DEFAULT: '#c8a84e',
          50: '#fdf9ef',
          100: '#f9f0d5',
          200: '#f2dfa8',
          300: '#e8ca73',
          400: '#c8a84e',
          500: '#a88b35',
          600: '#8a6f28',
          700: '#6b5520',
          800: '#4d3d18',
          900: '#2e2510',
        },
        tier: {
          prohibited: '#dc2626',
          'high-risk': '#ea580c',
          gpai: '#ca8a04',
          'gpai-systemic': '#c2410c',
          limited: '#2563eb',
          minimal: '#16a34a',
        },
        // Navy-tinted neutrals — warmer than pure gray
        slate: {
          50: '#f7f8fb',
          100: '#eef0f6',
          200: '#dfe2ec',
          300: '#c5c9d8',
          400: '#959bb3',
          500: '#6b7190',
          600: '#4f5570',
          700: '#383d56',
          800: '#252940',
          900: '#171a2e',
        },
      },
      fontFamily: {
        sans: ['var(--font-sans)', 'DM Sans', 'system-ui', 'sans-serif'],
        display: ['var(--font-display)', 'DM Serif Display', 'Georgia', 'serif'],
        mono: ['JetBrains Mono', 'Menlo', 'monospace'],
      },
      fontSize: {
        // Fluid type scale
        'display-xl': ['clamp(2.5rem, 2rem + 2.5vw, 4.5rem)', { lineHeight: '1.05', letterSpacing: '-0.03em' }],
        'display-lg': ['clamp(2rem, 1.5rem + 2vw, 3.5rem)', { lineHeight: '1.1', letterSpacing: '-0.025em' }],
        'display': ['clamp(1.5rem, 1.25rem + 1.25vw, 2.5rem)', { lineHeight: '1.15', letterSpacing: '-0.02em' }],
        'display-sm': ['clamp(1.25rem, 1rem + 0.75vw, 1.75rem)', { lineHeight: '1.2', letterSpacing: '-0.015em' }],
      },
      borderRadius: {
        'xl': '0.75rem',
        '2xl': '1rem',
        '3xl': '1.5rem',
      },
      boxShadow: {
        'soft-sm': '0 1px 2px rgba(15,18,37,0.05)',
        'soft': '0 1px 3px rgba(15,18,37,0.06), 0 6px 16px rgba(15,18,37,0.04)',
        'soft-lg': '0 2px 4px rgba(15,18,37,0.03), 0 12px 28px rgba(15,18,37,0.06)',
        'soft-xl': '0 4px 8px rgba(15,18,37,0.03), 0 20px 40px rgba(15,18,37,0.08)',
        'glow-blue': '0 0 0 1px rgba(0,51,153,0.08), 0 8px 24px rgba(0,51,153,0.12)',
        'glow-gold': '0 0 0 1px rgba(200,168,78,0.1), 0 8px 24px rgba(200,168,78,0.08)',
        'inner-light': 'inset 0 1px 0 rgba(255,255,255,0.08)',
      },
      transitionTimingFunction: {
        'out-expo': 'cubic-bezier(0.16, 1, 0.3, 1)',
        'out-quart': 'cubic-bezier(0.25, 1, 0.5, 1)',
        'in-quart': 'cubic-bezier(0.5, 0, 0.75, 0)',
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-conic': 'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))',
      },
    },
  },
  plugins: [],
};

export default config;
