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
              borderBottomColor: 'transparent',
              transitionProperty: 'color, border-color',
              transitionDuration: '150ms',
              textUnderlineOffset: '0.15em',
            },
            'a:hover': {
              borderBottomColor: theme('colors.zinc.300'),
            },
            pre: {
              backgroundColor: 'transparent',
              borderWidth: '1px',
              borderColor: theme('colors.gray.200'),
              borderRadius: theme('borderRadius.md'),
              padding: `${theme('spacing.4')} ${theme('spacing.5')}`,
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
              borderBottomColor: 'transparent',
            },
            'a:hover': {
              borderBottomColor: theme('colors.zinc.600'),
            },
            pre: {
              backgroundColor: 'transparent',
              borderColor: theme('colors.gray.700'),
            },
          },
        },
      }),
    },
  },
  plugins: [typography],
};
