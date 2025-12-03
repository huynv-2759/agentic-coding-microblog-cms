/**
 * Markdown Processing Utilities
 * 
 * Handles parsing Markdown files, extracting front matter,
 * and converting Markdown to HTML with syntax highlighting.
 */

import matter from 'gray-matter';
import { remark } from 'remark';
import html from 'remark-html';
import { FrontMatter, validateFrontMatter } from './types';

/**
 * Parses Markdown file content into front matter and content
 * 
 * @param fileContent - Raw Markdown file content
 * @returns Validated front matter and Markdown content
 * @throws Error if front matter is invalid
 * 
 * @example
 * ```typescript
 * const fileContent = `---
 * title: "Hello World"
 * date: "2025-12-03"
 * tags: ["intro"]
 * ---
 * # Hello
 * 
 * This is my first post.`;
 * 
 * const { frontMatter, content } = parseMarkdown(fileContent);
 * console.log(frontMatter.title); // "Hello World"
 * console.log(content); // "# Hello\n\nThis is my first post."
 * ```
 */
export function parseMarkdown(fileContent: string): {
  frontMatter: FrontMatter;
  content: string;
} {
  const { data, content } = matter(fileContent);
  const frontMatter = validateFrontMatter(data);
  return { frontMatter, content };
}

/**
 * Converts Markdown content to HTML
 * 
 * @param markdown - Raw Markdown string
 * @returns HTML string
 * 
 * @example
 * ```typescript
 * const markdown = '# Hello\n\nThis is **bold** text.';
 * const html = await markdownToHtml(markdown);
 * console.log(html); // '<h1>Hello</h1>\n<p>This is <strong>bold</strong> text.</p>'
 * ```
 */
export async function markdownToHtml(markdown: string): Promise<string> {
  const result = await remark()
    .use(html, { sanitize: false })
    .process(markdown);
  return result.toString();
}

/**
 * Calculates estimated reading time for content
 * 
 * @param content - The content to analyze (Markdown or plain text)
 * @returns Estimated reading time in minutes
 * 
 * @example
 * ```typescript
 * const content = "This is a long article...";
 * const readingTime = calculateReadingTime(content);
 * console.log(readingTime); // 5
 * ```
 */
export function calculateReadingTime(content: string): number {
  const wordsPerMinute = 200;
  const words = content.trim().split(/\s+/).length;
  const minutes = Math.ceil(words / wordsPerMinute);
  return Math.max(1, minutes); // Minimum 1 minute
}
