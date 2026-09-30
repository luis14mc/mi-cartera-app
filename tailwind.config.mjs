import daisyui from 'daisyui';

/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}'],
  theme: {
    extend: {
      colors: {
        cronos: {
          blue: '#1a73e8',
        },
      },
    },
  },
  plugins: [daisyui],
  daisyui: {
    themes: [
      {
        cronos: {
          primary: '#1a73e8',
          secondary: '#6366f1',
          accent: '#06b6d4',
          neutral: '#0f172a',
          'base-100': '#ffffff',
          'base-200': '#f8fafc',
          'base-300': '#e2e8f0',
          info: '#0284c7',
          success: '#10b981',
          warning: '#f59e0b',
          error: '#ef4444',
        },
      },
      'dark',
    ],
  },
};
