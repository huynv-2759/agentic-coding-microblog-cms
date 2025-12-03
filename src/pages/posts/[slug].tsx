/**
 * Dynamic Post Page
 * 
 * Displays individual blog posts with full content and comments
 */

import { GetStaticPaths, GetStaticProps } from 'next';
import Link from 'next/link';
import Layout from '@/components/layout/Layout';
import MarkdownRenderer from '@/components/post/MarkdownRenderer';
import Meta from '@/components/seo/Meta';
import CommentForm from '@/components/comments/CommentForm';
import CommentsList from '@/components/comments/CommentsList';
import { Post } from '@/lib/types';
import { getAllPostSlugs, getPostBySlug } from '@/lib/posts';
import { useState } from 'react';

interface PostPageProps {
  post: Post;
}

export default function PostPage({ post }: PostPageProps) {
  const [commentKey, setCommentKey] = useState(0);
  
  // Format date for display
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  // Refresh comments when new comment added
  const handleCommentAdded = () => {
    setCommentKey(prev => prev + 1);
  };

  return (
    <Layout>
      <Meta
        title={post.title}
        description={post.excerpt}
        url={`https://yourdomain.com/posts/${post.slug}`}
        type="article"
        publishedTime={post.date}
        tags={post.tags}
      />

      <article className="bg-white">
        {/* Post Header */}
        <header className="bg-gradient-to-r from-blue-600 to-blue-800 text-white py-16">
          <div className="container mx-auto px-4 max-w-4xl">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              {post.title}
            </h1>

            {/* Metadata */}
            <div className="flex flex-wrap items-center gap-4 text-blue-100">
              {/* Date */}
              <div className="flex items-center gap-2">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <time dateTime={post.date}>{formatDate(post.date)}</time>
              </div>

              {/* Reading Time */}
              {post.readingTime && (
                <div className="flex items-center gap-2">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span>{post.readingTime} min read</span>
                </div>
              )}

              {/* Author */}
              {post.author && (
                <div className="flex items-center gap-2">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                  <span>{post.author}</span>
                </div>
              )}
            </div>

            {/* Tags */}
            {post.tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-6">
                {post.tags.map((tag) => (
                  <Link
                    key={tag}
                    href={`/tags/${tag}`}
                    className="inline-block px-3 py-1 text-sm font-semibold text-blue-100 bg-blue-700 rounded-full hover:bg-blue-600 transition-colors"
                  >
                    #{tag}
                  </Link>
                ))}
              </div>
            )}
          </div>
        </header>

        {/* Post Content */}
        <div className="container mx-auto px-4 py-12 max-w-4xl">
          <MarkdownRenderer htmlContent={post.content} />
        </div>

        {/* Comments Section */}
        <div className="container mx-auto px-4 max-w-4xl">
          <div className="border-t border-gray-200 pt-8">
            {/* Comment Form */}
            <CommentForm 
              postSlug={post.slug} 
              onSuccess={handleCommentAdded}
            />

            {/* Comments List */}
            <CommentsList 
              key={commentKey}
              postSlug={post.slug} 
              onCommentAdded={handleCommentAdded}
            />
          </div>
        </div>

        {/* Navigation */}
        <div className="container mx-auto px-4 pb-12 max-w-4xl">
          <div className="border-t border-gray-200 pt-8">
            <Link 
              href="/"
              className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-800 font-medium transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              Back to Home
            </Link>
          </div>
        </div>
      </article>
    </Layout>
  );
}

export const getStaticPaths: GetStaticPaths = async () => {
  const slugs = await getAllPostSlugs();

  return {
    paths: slugs.map((slug) => ({
      params: { slug },
    })),
    fallback: 'blocking', // Use blocking fallback for new posts
  };
};

export const getStaticProps: GetStaticProps<PostPageProps> = async ({ params }) => {
  const slug = params?.slug as string;
  const post = await getPostBySlug(slug);

  return {
    props: {
      post,
    },
    revalidate: 60, // Revalidate every 60 seconds
  };
};
