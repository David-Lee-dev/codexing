import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./src/**/*.{js,ts,jsx,tsx,mdx}'],
  theme: {
    extend: {
      colors: {
        background: 'var(--background)',
        foreground: 'var(--foreground)',
        onboarding: {
          warm: '#f9f7f4',
          cream: '#fffdf9',
          'text-primary': '#2c2a27',
          'text-secondary': '#6b6560',
          'text-muted': '#9c9690',
          accent: '#c4a574',
          'accent-hover': '#b39464',
          'border-subtle': '#e8e4df',
        },
      },
      animation: {
        'card-reveal': 'cardReveal 0.8s cubic-bezier(0.22, 1, 0.36, 1) forwards',
        'fade-up-1': 'fadeUp 0.6s cubic-bezier(0.22, 1, 0.36, 1) 0.2s forwards',
        'fade-up-2': 'fadeUp 0.6s cubic-bezier(0.22, 1, 0.36, 1) 0.3s forwards',
        'fade-up-3': 'fadeUp 0.6s cubic-bezier(0.22, 1, 0.36, 1) 0.4s forwards',
        'fade-up-4': 'fadeUp 0.6s cubic-bezier(0.22, 1, 0.36, 1) 0.5s forwards',
        'fade-up-5': 'fadeUp 0.6s cubic-bezier(0.22, 1, 0.36, 1) 0.6s forwards',
      },
      keyframes: {
        cardReveal: {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        fadeUp: {
          '0%': { opacity: '0', transform: 'translateY(8px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
    },
  },
  plugins: [],
};

export default config;
