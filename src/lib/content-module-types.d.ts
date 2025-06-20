declare module 'astro:content' {
    interface Render {
      '.org': Promise<{
        Content: import('astro').MarkdownInstance<{}>['Content']
      }>
    }
  }