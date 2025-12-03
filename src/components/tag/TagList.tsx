/**
 * TagList Component
 * 
 * Displays a list of tags with post counts
 */

import Link from 'next/link';
import { TagSummary } from '@/lib/types';

export interface TagListProps {
  tags: TagSummary[];
  className?: string;
}

export default function TagList({ tags, className = '' }: TagListProps) {
  if (tags.length === 0) {
    return (
      <div className={`text-gray-500 text-center py-8 ${className}`}>
        <p>No tags found.</p>
      </div>
    );
  }

  return (
    <div className={`flex flex-wrap gap-3 ${className}`}>
      {tags.map((tag) => (
        <Link
          key={tag.name}
          href={`/tags/${tag.name}`}
          className="group"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-white rounded-lg shadow-md hover:shadow-lg transition-all duration-200 border-2 border-transparent hover:border-blue-500">
            <span className="text-lg font-semibold text-gray-800 group-hover:text-blue-600 transition-colors">
              #{tag.displayName}
            </span>
            <span className="px-2 py-1 text-xs font-bold text-white bg-blue-500 rounded-full group-hover:bg-blue-600 transition-colors">
              {tag.postCount}
            </span>
          </div>
        </Link>
      ))}
    </div>
  );
}
