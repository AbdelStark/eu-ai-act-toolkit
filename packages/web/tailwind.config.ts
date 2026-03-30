import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './src/**/*.{ts,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        navy: '#1a1f36',
        'eu-blue': '#003399',
        tier: {
          prohibited: '#dc2626',
          'high-risk': '#ea580c',
          gpai: '#ca8a04',
          'gpai-systemic': '#c2410c',
          limited: '#2563eb',
          minimal: '#16a34a',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'Menlo', 'monospace'],
      },
    },
  },
  plugins: [],
};

export default config;
