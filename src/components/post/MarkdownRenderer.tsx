/**
 * MarkdownRenderer Component
 * 
 * Renders HTML content from Markdown with proper styling
 */

export interface MarkdownRendererProps {
  htmlContent: string;
  className?: string;
}

export default function MarkdownRenderer({ htmlContent, className = '' }: MarkdownRendererProps) {
  return (
    <div 
      className={`prose prose-lg max-w-none ${className}`}
      dangerouslySetInnerHTML={{ __html: htmlContent }}
    />
  );
}
