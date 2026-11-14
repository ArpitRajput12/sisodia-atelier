import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        linen: {
          DEFAULT: '#FAF7F2',
          50: '#FDFCFB',
          100: '#FAF7F2',
          200: '#F7F4EE',
          300: '#F3EDE2',
          400: '#EAE1D2',
        },
        wood: {
          dark: '#1C1917',
          stone: '#292524',
          muted: '#44403C',
          subtle: '#78716C',
        },
        forest: {
          DEFAULT: '#1E392A',
          hover: '#162C20',
          light: '#284C38',
          subtle: '#EAEFEA',
        },
        brass: {
          DEFAULT: '#8B5E3C',
          gold: '#A37836',
          light: '#BA8F4D',
          pill: '#F1E8DC',
        },
        border: {
          linen: '#E7E0D3',
          secondary: '#DDD6C9',
        },
        species: {
          teak: '#7a5230',
          sheesham: '#4a2c11',
          walnut: '#382315',
          sandalwood: '#9c6d48',
          vijaysar: '#5e1914',
        },
      },
      fontFamily: {
        serif: ['"Cormorant Garamond"', 'Playfair Display', 'Georgia', 'serif'],
        sans: ['Jost', 'Montserrat', '-apple-system', 'system-ui', 'sans-serif'],
      },
      animation: {
        'marquee-infinite': 'marquee 40s linear infinite',
        'marquee-infinite-slow': 'marquee 60s linear infinite',
      },
      keyframes: {
        marquee: {
          '0%': { transform: 'translateX(0%)' },
          '100%': { transform: 'translateX(-50%)' },
        },
      },
    },
  },
  plugins: [],
};

export default config;
