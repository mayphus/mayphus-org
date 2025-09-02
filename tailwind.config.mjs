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

