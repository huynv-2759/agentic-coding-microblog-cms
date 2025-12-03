/**
 * Comments List Component
 * 
 * Fetches and displays all approved comments for a post.
 * Supports nested comments (1 level threading).
 * 
 * Features:
 * - Fetches comments from API
 * - Loading states
 * - Error handling
 * - Comment count display
 * - Nested comment threading
 * - Reply functionality
 * - Empty state
 * 
 * Usage:
 * ```tsx
 * <CommentsList postSlug="my-post" onCommentAdded={() => refetch()} />
 * ```
 */

import React, { useState, useEffect } from 'react';
import CommentItem from './CommentItem';
import CommentForm from './CommentForm';

interface Comment {
  id: string;
  authorName: string;
  content: string;
  createdAt: string;
  parentId?: string | null;
}

interface CommentsListProps {
  postSlug: string;
  onCommentAdded?: () => void;
}

export default function CommentsList({
  postSlug,
  onCommentAdded,
}: CommentsListProps) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [replyingTo, setReplyingTo] = useState<string | null>(null);

  // Fetch comments
  const fetchComments = async () => {
    setLoading(true);
    setError('');

    try {
      const response = await fetch(`/api/comments/${postSlug}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch comments');
      }

      const data = await response.json();
      setComments(data.comments || []);
    } catch (err) {
      console.error('Comment fetch error:', err);
      setError('Failed to load comments. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchComments();
  }, [postSlug]);

  // Group comments by parent/child
  const parentComments = comments.filter(c => !c.parentId);
  const childComments = comments.filter(c => c.parentId);

  const getChildComments = (parentId: string) => {
    return childComments.filter(c => c.parentId === parentId);
  };

  const handleReply = (commentId: string) => {
    setReplyingTo(commentId);
  };

  const handleReplySuccess = () => {
    setReplyingTo(null);
    fetchComments(); // Refresh comments after new reply
    if (onCommentAdded) {
      onCommentAdded();
    }
  };

  const handleCancelReply = () => {
    setReplyingTo(null);
  };

  // Loading state
  if (loading) {
    return (
      <div className="py-8">
        <div className="animate-pulse space-y-4">
          <div className="h-4 bg-gray-200 rounded w-1/4"></div>
          <div className="space-y-3">
            <div className="h-20 bg-gray-200 rounded"></div>
            <div className="h-20 bg-gray-200 rounded"></div>
            <div className="h-20 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="py-8">
        <div className="rounded-md bg-red-50 p-4">
          <div className="flex">
            <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
            <div className="ml-3">
              <p className="text-sm font-medium text-red-800">{error}</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="py-8">
      {/* Header */}
      <h2 className="text-2xl font-bold text-gray-900 mb-6">
        Comments ({comments.length})
      </h2>

      {/* Empty state */}
      {comments.length === 0 && (
        <div className="text-center py-8 bg-gray-50 rounded-lg border border-gray-200">
          <svg
            className="mx-auto h-12 w-12 text-gray-400"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z"
            />
          </svg>
          <p className="mt-4 text-sm text-gray-500">
            No comments yet. Be the first to share your thoughts!
          </p>
        </div>
      )}

      {/* Comments list */}
      {comments.length > 0 && (
        <div className="space-y-6">
          {parentComments.map((comment) => (
            <div key={comment.id}>
              {/* Parent comment */}
              <CommentItem
                comment={comment}
                onReply={handleReply}
              />

              {/* Child comments */}
              {getChildComments(comment.id).map((childComment) => (
                <CommentItem
                  key={childComment.id}
                  comment={childComment}
                  isNested
                />
              ))}

              {/* Reply form */}
              {replyingTo === comment.id && (
                <div className="ml-8 mt-4">
                  <CommentForm
                    postSlug={postSlug}
                    parentId={comment.id}
                    onSuccess={handleReplySuccess}
                    onCancel={handleCancelReply}
                  />
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
