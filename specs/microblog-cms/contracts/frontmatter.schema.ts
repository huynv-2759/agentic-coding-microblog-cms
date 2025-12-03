/**
 * Front Matter Schema
 * 
 * Defines and validates the YAML front matter structure for Markdown blog posts.
 * Front matter appears at the top of each .md file between --- delimiters.
 */

/**
 * Front matter structure for blog posts
 * 
 * Example:
 * ---
 * title: "My Blog Post"
 * date: "2025-12-03"
 * tags: ["nextjs", "typescript"]
 * excerpt: "A short description"
 * author: "John Doe"
 * draft: false
 * ---
 */
export interface FrontMatter {
  /** Post title (required) */
  title: string;
  
  /** Publication date in YYYY-MM-DD format (required) */
  date: string;
  
  /** Array of topic tags (required, can be empty) */
  tags: string[];
  
  /** Short excerpt/description (optional, auto-generated if not provided) */
  excerpt?: string;
  
  /** Author name (optional) */
  author?: string;
  
  /** Draft status - if true, post is excluded from build (optional, default: false) */
  draft?: boolean;
}

/**
 * Validation error with details
 */
export class FrontMatterValidationError extends Error {
  constructor(
    message: string,
    public field?: string,
    public value?: unknown
  ) {
    super(message);
    this.name = 'FrontMatterValidationError';
  }
}

/**
 * Validates front matter data against schema
 * 
 * @param data - Unknown data to validate
 * @param filename - Optional filename for better error messages
 * @returns Validated FrontMatter object
 * @throws FrontMatterValidationError if validation fails
 */
export function validateFrontMatter(
  data: unknown,
  filename?: string
): FrontMatter {
  const fileContext = filename ? ` in file "${filename}"` : '';
  
  // Check if data exists and is an object
  if (!data || typeof data !== 'object') {
    throw new FrontMatterValidationError(
      `Front matter must be an object${fileContext}`
    );
  }
  
  const fm = data as Partial<FrontMatter>;
  
  // Validate title (required)
  if (!fm.title) {
    throw new FrontMatterValidationError(
      `Missing required field "title"${fileContext}`,
      'title',
      fm.title
    );
  }
  
  if (typeof fm.title !== 'string') {
    throw new FrontMatterValidationError(
      `Field "title" must be a string${fileContext}`,
      'title',
      fm.title
    );
  }
  
  if (fm.title.trim().length === 0) {
    throw new FrontMatterValidationError(
      `Field "title" cannot be empty${fileContext}`,
      'title',
      fm.title
    );
  }
  
  // Validate date (required)
  if (!fm.date) {
    throw new FrontMatterValidationError(
      `Missing required field "date"${fileContext}`,
      'date',
      fm.date
    );
  }
  
  if (typeof fm.date !== 'string') {
    throw new FrontMatterValidationError(
      `Field "date" must be a string${fileContext}`,
      'date',
      fm.date
    );
  }
  
  // Validate date format (YYYY-MM-DD)
  const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
  if (!dateRegex.test(fm.date)) {
    throw new FrontMatterValidationError(
      `Field "date" must be in YYYY-MM-DD format${fileContext}`,
      'date',
      fm.date
    );
  }
  
  // Validate date is a valid date
  const dateObj = new Date(fm.date);
  if (isNaN(dateObj.getTime())) {
    throw new FrontMatterValidationError(
      `Field "date" is not a valid date${fileContext}`,
      'date',
      fm.date
    );
  }
  
  // Validate tags (required)
  if (!fm.tags) {
    throw new FrontMatterValidationError(
      `Missing required field "tags"${fileContext}`,
      'tags',
      fm.tags
    );
  }
  
  if (!Array.isArray(fm.tags)) {
    throw new FrontMatterValidationError(
      `Field "tags" must be an array${fileContext}`,
      'tags',
      fm.tags
    );
  }
  
  // Validate each tag is a string
  fm.tags.forEach((tag, index) => {
    if (typeof tag !== 'string') {
      throw new FrontMatterValidationError(
        `Tag at index ${index} must be a string${fileContext}`,
        'tags',
        tag
      );
    }
  });
  
  // Validate excerpt (optional)
  if (fm.excerpt !== undefined && typeof fm.excerpt !== 'string') {
    throw new FrontMatterValidationError(
      `Field "excerpt" must be a string if provided${fileContext}`,
      'excerpt',
      fm.excerpt
    );
  }
  
  // Validate author (optional)
  if (fm.author !== undefined && typeof fm.author !== 'string') {
    throw new FrontMatterValidationError(
      `Field "author" must be a string if provided${fileContext}`,
      'author',
      fm.author
    );
  }
  
  // Validate draft (optional)
  if (fm.draft !== undefined && typeof fm.draft !== 'boolean') {
    throw new FrontMatterValidationError(
      `Field "draft" must be a boolean if provided${fileContext}`,
      'draft',
      fm.draft
    );
  }
  
  // Return validated and normalized front matter
  return {
    title: fm.title.trim(),
    date: fm.date,
    tags: fm.tags.map(tag => tag.trim()),
    excerpt: fm.excerpt?.trim(),
    author: fm.author?.trim(),
    draft: fm.draft ?? false,
  };
}

/**
 * Checks if front matter indicates a draft post
 */
export function isDraft(frontMatter: FrontMatter): boolean {
  return frontMatter.draft === true;
}

/**
 * Gets a default excerpt from content if not provided in front matter
 */
export function getExcerpt(
  frontMatter: FrontMatter,
  content: string,
  maxLength: number = 150
): string {
  if (frontMatter.excerpt) {
    return frontMatter.excerpt;
  }
  
  // Remove Markdown syntax for excerpt
  const plainText = content
    .replace(/^#+ /gm, '')           // Remove headings
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')  // Remove links, keep text
    .replace(/`{1,3}[^`]*`{1,3}/g, '')       // Remove code
    .replace(/[*_]{1,2}([^*_]+)[*_]{1,2}/g, '$1') // Remove emphasis
    .trim();
  
  if (plainText.length <= maxLength) {
    return plainText;
  }
  
  return plainText.slice(0, maxLength).trim() + '...';
}

/**
 * Sample front matter for documentation/testing
 */
export const SAMPLE_FRONT_MATTER: FrontMatter = {
  title: "Sample Blog Post",
  date: "2025-12-03",
  tags: ["nextjs", "typescript", "tutorial"],
  excerpt: "This is a sample blog post demonstrating the front matter structure.",
  author: "John Doe",
  draft: false,
};
