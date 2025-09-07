import * as React from 'react';

export interface CodeBlockProps {
  code: string;
  language?: string;
  filename?: string;
}

export function CodeBlock({ code, language, filename }: CodeBlockProps) {
  return (
    <figure>
      {filename && <figcaption>{filename}</figcaption>}
      <pre>
        <code className={language ? `language-${language}` : undefined}>{code}</code>
      </pre>
    </figure>
  );
}
