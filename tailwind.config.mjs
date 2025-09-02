import typography from '@tailwindcss/typography';

/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'media',
  content: ['./src/**/*.{astro,html,js,jsx,md,mdx,ts,tsx}'],
  theme: {
    extend: {
      typography: ({ theme }) => ({
        DEFAULT: {
          css: {
            a: {
              color: 'inherit',
              textDecoration: 'none',
              borderBottomWidth: '1px',
              borderBottomStyle: 'solid',
              borderBottomColor: theme('colors.zinc.300'),
              transitionProperty: 'color, border-color',
              transitionDuration: '150ms',
              textUnderlineOffset: '0.15em',
            },
            'a:hover': {
              borderBottomColor: theme('colors.zinc.400'),
            },
            'h1 a, h2 a, h3 a, h4 a, h5 a, h6 a': {
              textDecoration: 'none',
              borderBottomColor: 'transparent',
            },
            'h1 a:hover, h2 a:hover, h3 a:hover, h4 a:hover, h5 a:hover, h6 a:hover': {
              borderBottomColor: 'transparent',
            },
            pre: {
              backgroundColor: 'transparent',
              borderWidth: '1px',
              borderColor: theme('colors.gray.200'),
              borderRadius: theme('borderRadius.md'),
              padding: `${theme('spacing.4')} ${theme('spacing.5')}`,
              overflowX: 'auto',
              whiteSpace: 'pre',
            },
            code: {
              backgroundColor: 'transparent',
              fontWeight: '400',
            },
            'code::before': { content: 'none' },
            'code::after': { content: 'none' },
          },
        },
        invert: {
          css: {
            a: {
              borderBottomColor: theme('colors.zinc.700'),
            },
            'a:hover': {
              borderBottomColor: theme('colors.zinc.500'),
            },
            'h1 a, h2 a, h3 a, h4 a, h5 a, h6 a': {
              borderBottomColor: 'transparent',
            },
            'h1 a:hover, h2 a:hover, h3 a:hover, h4 a:hover, h5 a:hover, h6 a:hover': {
              borderBottomColor: 'transparent',
            },
            pre: {
              backgroundColor: 'transparent',
              borderColor: theme('colors.gray.700'),
              overflowX: 'auto',
              whiteSpace: 'pre',
            },
          },
        },
      }),
    },
  },
  plugins: [typography],
};
