/**
 * Dynamic Tag Page
 * 
 * Displays all posts filtered by a specific tag
 */

import { GetStaticPaths, GetStaticProps } from 'next';
import Link from 'next/link';
import Layout from '@/components/layout/Layout';
import PostCard from '@/components/post/PostCard';
import Meta from '@/components/seo/Meta';
import { Tag } from '@/lib/types';
import { getAllTagNames, getPostsByTag } from '@/lib/tags';

interface TagPageProps {
  tag: Tag;
}

export default function TagPage({ tag }: TagPageProps) {
  return (
    <Layout>
      <Meta
        title={`Posts tagged "${tag.displayName}"`}
        description={`Browse all posts tagged with ${tag.displayName}`}
        url={`https://yourdomain.com/tags/${tag.name}`}
      />

      <div className="bg-gray-50 min-h-screen">
        {/* Header */}
        <section className="bg-gradient-to-r from-blue-600 to-blue-800 text-white py-16">
          <div className="container mx-auto px-4">
            <div className="mb-4">
              <Link 
                href="/tags"
                className="inline-flex items-center gap-2 text-blue-100 hover:text-white transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
                All Tags
              </Link>
            </div>

            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              #{tag.displayName}
            </h1>
            <p className="text-xl text-blue-100">
              {tag.postCount} post{tag.postCount !== 1 ? 's' : ''} tagged with {tag.displayName}
            </p>
          </div>
        </section>

        {/* Posts */}
        <section className="container mx-auto px-4 py-12">
          {tag.posts.length === 0 ? (
            <div className="text-center py-16">
              <p className="text-gray-600 text-lg">No posts found with this tag.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {tag.posts.map((post) => (
                <PostCard key={post.slug} post={post} />
              ))}
            </div>
          )}
        </section>
      </div>
    </Layout>
  );
}

export const getStaticPaths: GetStaticPaths = async () => {
  const tagNames = await getAllTagNames();

  return {
    paths: tagNames.map((tag) => ({
      params: { tag },
    })),
    fallback: 'blocking', // Use ISR for new tags
  };
};

export const getStaticProps: GetStaticProps<TagPageProps> = async ({ params }) => {
  const tagName = params?.tag as string;
  const tag = await getPostsByTag(tagName);

  return {
    props: {
      tag,
    },
    revalidate: 60, // Revalidate every minute
  };
};
