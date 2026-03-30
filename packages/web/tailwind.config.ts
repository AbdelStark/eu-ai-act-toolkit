import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './src/**/*.{ts,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        navy: {
          DEFAULT: '#1a1f36',
          50: '#f0f1f4',
          100: '#d9dce4',
          200: '#b3b8c9',
          300: '#8d94ae',
          400: '#676f93',
          500: '#414b78',
          600: '#2e3560',
          700: '#1a1f36',
          800: '#13172a',
          900: '#0c0f1e',
        },
        'eu-blue': {
          DEFAULT: '#003399',
          50: '#eef2ff',
          100: '#d9e2fc',
          200: '#b3c5f9',
          300: '#6b8fef',
          400: '#3366cc',
          500: '#003399',
          600: '#002b80',
          700: '#002266',
          800: '#001a4d',
          900: '#001133',
        },
        tier: {
          prohibited: '#b91c1c',
          'high-risk': '#c2410c',
          gpai: '#a16207',
          'gpai-systemic': '#9a3412',
          limited: '#1d4ed8',
          minimal: '#15803d',
        },
        // Tinted neutrals (navy-tinted instead of pure gray)
        slate: {
          50: '#f8f9fb',
          100: '#f0f1f5',
          200: '#e2e4eb',
          300: '#c8cbd6',
          400: '#9ea3b3',
          500: '#747a8f',
          600: '#565c71',
          700: '#3d4259',
          800: '#2a2f44',
          900: '#1a1f36',
        },
      },
      fontFamily: {
        sans: ['var(--font-sans)', 'DM Sans', 'system-ui', 'sans-serif'],
        display: ['var(--font-display)', 'DM Serif Display', 'Georgia', 'serif'],
        mono: ['JetBrains Mono', 'Menlo', 'monospace'],
      },
    },
  },
  plugins: [],
};

export default config;
