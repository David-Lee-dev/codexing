import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./src/**/*.{js,ts,jsx,tsx,mdx}'],
  theme: {
    extend: {
      colors: {
        background: 'var(--background)',
        foreground: 'var(--foreground)',
        ctp: {
          base: '#1e1e2e',
          mantle: '#181825',
          crust: '#11111b',
          surface0: '#313244',
          surface1: '#45475a',
          surface2: '#585b70',
          text: '#cdd6f4',
          subtext1: '#bac2de',
          subtext0: '#a6adc8',
          overlay2: '#9399b2',
          overlay1: '#7f849c',
          overlay0: '#6c7086',
          lavender: '#b4befe',
          blue: '#89b4fa',
          sapphire: '#74c7ec',
          sky: '#89dceb',
          teal: '#94e2d5',
          green: '#a6e3a1',
          yellow: '#f9e2af',
          peach: '#fab387',
          maroon: '#eba0ac',
          red: '#f38ba8',
          mauve: '#cba6f7',
          pink: '#f5c2e7',
          flamingo: '#f2cdcd',
          rosewater: '#f5e0dc',
        },
        onboarding: {
          warm: '#1e1e2e',
          cream: '#181825',
          'text-primary': '#cdd6f4',
          'text-secondary': '#bac2de',
          'text-muted': '#7f849c',
          accent: '#b4befe',
          'accent-hover': '#89b4fa',
          'border-subtle': '#313244',
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
