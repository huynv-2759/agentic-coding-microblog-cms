/**
 * Comment Item Component
 * 
 * Displays a single comment with author info, timestamp, and content.
 * Supports nested replies with indentation.
 * 
 * Features:
 * - Avatar (gravatar or default)
 * - Relative timestamps ("2 hours ago")
 * - Reply button for threading
 * - Nested comment styling
 * - Mobile responsive
 * 
 * Usage:
 * ```tsx
 * <CommentItem 
 *   comment={comment} 
 *   onReply={(id) => console.log('Reply to', id)}
 * />
 * ```
 */

import React from 'react';

interface Comment {
  id: string;
  authorName: string;
  content: string;
  createdAt: string;
  parentId?: string | null;
}

interface CommentItemProps {
  comment: Comment;
  onReply?: (commentId: string) => void;
  isNested?: boolean;
}

/**
 * Format date as relative time
 */
function formatRelativeTime(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (seconds < 60) return 'just now';
  if (seconds < 3600) return `${Math.floor(seconds / 60)} minutes ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)} hours ago`;
  if (seconds < 604800) return `${Math.floor(seconds / 86400)} days ago`;
  if (seconds < 2592000) return `${Math.floor(seconds / 604800)} weeks ago`;
  if (seconds < 31536000) return `${Math.floor(seconds / 2592000)} months ago`;
  return `${Math.floor(seconds / 31536000)} years ago`;
}

/**
 * Generate gravatar URL from email
 * Using a default avatar for now since we don't expose emails
 */
function getAvatarUrl(authorName: string): string {
  // For now, use default avatar
  // In future, could use gravatar with hashed email
  const initial = authorName.charAt(0).toUpperCase();
  const colors = [
    'bg-red-500',
    'bg-blue-500',
    'bg-green-500',
    'bg-yellow-500',
    'bg-purple-500',
    'bg-pink-500',
    'bg-indigo-500',
  ];
  const colorIndex = authorName.charCodeAt(0) % colors.length;
  
  return `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='40' height='40'%3E%3Crect width='40' height='40' fill='%23${
    ['ef4444', '3b82f6', '10b981', 'eab308', 'a855f7', 'ec4899', '6366f1'][colorIndex]
  }'/%3E%3Ctext x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' font-family='sans-serif' font-size='20' fill='white'%3E${initial}%3C/text%3E%3C/svg%3E`;
}

export default function CommentItem({
  comment,
  onReply,
  isNested = false,
}: CommentItemProps) {
  return (
    <div className={`flex space-x-3 ${isNested ? 'ml-8 mt-3' : 'mt-4'}`}>
      {/* Avatar */}
      <div className="flex-shrink-0">
        <img
          src={getAvatarUrl(comment.authorName)}
          alt={comment.authorName}
          className="h-10 w-10 rounded-full"
        />
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        {/* Header */}
        <div className="flex items-center space-x-2 mb-1">
          <p className="text-sm font-medium text-gray-900">
            {comment.authorName}
          </p>
          <span className="text-gray-400">•</span>
          <p className="text-sm text-gray-500">
            {formatRelativeTime(comment.createdAt)}
          </p>
        </div>

        {/* Comment text */}
        <div className="text-sm text-gray-700 whitespace-pre-wrap break-words">
          {comment.content}
        </div>

        {/* Actions */}
        {onReply && !isNested && (
          <div className="mt-2">
            <button
              onClick={() => onReply(comment.id)}
              className="text-sm font-medium text-indigo-600 hover:text-indigo-500 transition-colors"
            >
              Reply
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
