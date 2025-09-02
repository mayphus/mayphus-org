import typography from '@tailwindcss/typography';

/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'media',
  content: ['./src/**/*.{astro,html,js,jsx,md,mdx,ts,tsx}'],
  theme: {
    extend: {
      typography: () => ({
        DEFAULT: {
          css: {
            a: {
              color: 'inherit',
              textDecoration: 'underline',
              textDecorationThickness: '0.03em',
              textUnderlineOffset: '0.15em',
            },
            'a:hover': {
              textDecorationThickness: '0.04em',
            },
            'h1 a, h2 a, h3 a, h4 a, h5 a, h6 a': {
              textDecoration: 'none',
            },
            'h1 a:hover, h2 a:hover, h3 a:hover, h4 a:hover, h5 a:hover, h6 a:hover': {
              textDecoration: 'none',
            },
          },
        },
        invert: {
          css: {
            a: {
              textDecorationThickness: '0.03em',
            },
            'a:hover': {
              textDecorationThickness: '0.04em',
            },
            'h1 a, h2 a, h3 a, h4 a, h5 a, h6 a': {
              textDecoration: 'none',
            },
            'h1 a:hover, h2 a:hover, h3 a:hover, h4 a:hover, h5 a:hover, h6 a:hover': {
              textDecoration: 'none',
            },
          },
        },
      }),
    },
  },
  plugins: [typography],
};
