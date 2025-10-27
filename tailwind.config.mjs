/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        'main-bg': 'var(--main-bg)',
        'card-bg': 'var(--card-bg)',
        'text-main': 'var(--text-main)',
        'text-muted': 'var(--text-muted)',
        'accent': 'var(--accent)',
      },
      typography: (theme) => ({
        DEFAULT: {
          css: {
            color: 'var(--text-main)',
            a: {
              color: 'var(--accent)',
              '&:hover': {
                color: 'var(--accent)',
              },
            },
            h1: { color: 'var(--text-main)' },
            h2: { color: 'var(--text-main)' },
            h3: { color: 'var(--text-main)' },
            h4: { color: 'var(--text-main)' },
            h5: { color: 'var(--text-main)' },
            h6: { color: 'var(--text-main)' },
            strong: { color: 'var(--text-main)' },
            code: { color: 'var(--text-main)' },
            blockquote: {
              color: 'var(--text-muted)',
              borderLeftColor: 'var(--accent)',
            },
          },
        },
      }),
    },
  },
  plugins: [
    require('@tailwindcss/typography'),
  ],
};

