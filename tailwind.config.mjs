import typography from '@tailwindcss/typography';

/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'media',
  content: ['./src/**/*.{astro,html,js,jsx,md,mdx,ts,tsx}'],
  theme: {
    extend: {
      typography: {
        DEFAULT: {
          css: {
            maxWidth: '65ch',
            h1: {
              marginTop: '0',
              marginBottom: '2rem',
              fontSize: '2.25rem',
              fontWeight: '800',
              lineHeight: '1.1',
            },
            h2: {
              marginTop: '3rem',
              marginBottom: '1.25rem',
              fontSize: '1.875rem',
              fontWeight: '700',
              lineHeight: '1.2',
            },
            h3: {
              marginTop: '2.5rem',
              marginBottom: '1rem',
              fontSize: '1.5rem',
              fontWeight: '600',
              lineHeight: '1.25',
            },
            p: {
              marginTop: '1.25rem',
              marginBottom: '1.25rem',
              lineHeight: '1.75',
            },
            ul: {
              marginTop: '1.25rem',
              marginBottom: '1.25rem',
            },
            ol: {
              marginTop: '1.25rem',
              marginBottom: '1.25rem',
            },
            li: {
              marginTop: '0.5rem',
              marginBottom: '0.5rem',
            },
            'ul > li': {
              paddingLeft: '1.75rem',
            },
            'ol > li': {
              paddingLeft: '1.75rem',
            },
            'ul ul, ul ol, ol ul, ol ol': {
              marginTop: '0.75rem',
              marginBottom: '0.75rem',
            },
            blockquote: {
              marginTop: '2rem',
              marginBottom: '2rem',
              paddingLeft: '1.25rem',
              borderLeftWidth: '4px',
              borderLeftColor: '#e5e7eb',
              fontStyle: 'italic',
            },
            pre: {
              marginTop: '2rem',
              marginBottom: '2rem',
              padding: '1.25rem',
              borderRadius: '0.5rem',
            },
            code: {
              padding: '0.25rem 0.375rem',
              borderRadius: '0.25rem',
              backgroundColor: '#f3f4f6',
              fontSize: '0.875rem',
              fontWeight: '500',
            },
            'pre code': {
              padding: '0',
              backgroundColor: 'transparent',
              fontSize: '0.875rem',
              fontWeight: '400',
            },
            a: {
              color: '#2563eb',
              fontWeight: '500',
              transition: 'color 0.15s',
              '&:hover': {
                color: '#1d4ed8',
              },
            },
            strong: {
              fontWeight: '700',
            },
            hr: {
              marginTop: '3rem',
              marginBottom: '3rem',
              borderColor: '#e5e7eb',
            },
          },
        },
        dark: {
          css: {
            color: '#e5e7eb',
            blockquote: {
              borderLeftColor: '#4b5563',
              color: '#9ca3af',
            },
            'h1, h2, h3, h4, h5, h6': {
              color: '#f9fafb',
            },
            strong: {
              color: '#f9fafb',
            },
            code: {
              backgroundColor: '#1f2937',
              color: '#f3f4f6',
            },
            a: {
              color: '#60a5fa',
              '&:hover': {
                color: '#93bbfc',
              },
            },
            hr: {
              borderColor: '#374151',
            },
          },
        },
      },
    },
  },
  plugins: [typography],
};
