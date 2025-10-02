/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}'],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        sans: ['var(--font-sans)', 'Inter', 'Comfortaa', 'sans-serif'],
        mono: ['var(--font-mono)', 'Fira Code', 'JetBrains Mono', 'monospace'],
        serif: ['var(--font-serif)', 'Playfair Display', 'serif'],
      },
      boxShadow: {
        'neo-2xs': 'var(--shadow-2xs)',
        'neo-xs': 'var(--shadow-xs)',
        'neo-sm': 'var(--shadow-sm)',
        'neo': 'var(--shadow)',
        'neo-md': 'var(--shadow-md)',
        'neo-lg': 'var(--shadow-lg)',
        'neo-xl': 'var(--shadow-xl)',
        'neo-2xl': 'var(--shadow-2xl)',
      },
      borderRadius: {
        'neo-sm': 'var(--radius-sm)',
        'neo': 'var(--radius)',
        'neo-md': 'var(--radius-md)',
        'neo-lg': 'var(--radius-lg)',
        'neo-xl': 'var(--radius-xl)'
      },
      colors: {
        background: 'var(--background)',
        foreground: 'var(--foreground)',
        primary: {
          DEFAULT: 'var(--primary)',
          foreground: 'var(--primary-foreground)'
        },
        secondary: {
          DEFAULT: 'var(--secondary)',
          foreground: 'var(--secondary-foreground)'
        },
        muted: {
          DEFAULT: 'var(--muted)',
          foreground: 'var(--muted-foreground)'
        },
        accent: {
          DEFAULT: 'var(--accent)',
          foreground: 'var(--accent-foreground)'
        },
        destructive: {
          DEFAULT: 'var(--destructive)',
          foreground: 'var(--destructive-foreground)'
        },
        border: 'var(--border)',
        input: 'var(--input)',
        ring: 'var(--ring)'
      }
    },
  },
  plugins: [
    require('@tailwindcss/typography'),
  ],
};
