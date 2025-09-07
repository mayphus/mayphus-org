import type { CodeBlockProps } from './ui/code-block';
import { CodeBlock as ShadcnCodeBlock } from './ui/code-block';

export default function CodeBlock(props: CodeBlockProps) {
  return <ShadcnCodeBlock {...props} />;
}
