import { GetStaticProps } from 'next';
import Layout from '@/components/layout/Layout';
import PostCard from '@/components/post/PostCard';
import Meta from '@/components/seo/Meta';
import { PostMetadata } from '@/lib/types';
import { getAllPostsMetadata } from '@/lib/posts';

interface HomeProps {
  posts: PostMetadata[];
}

export default function Home({ posts }: HomeProps) {
  return (
    <Layout>
      <Meta
        title="Home"
        description="Welcome to Microblog CMS - A modern, fast, and beautiful blogging platform built with Next.js"
        url="https://yourdomain.com"
      />

      <div className="bg-gray-50 min-h-screen">
        {/* Hero Section */}
        <section className="bg-gradient-to-r from-blue-600 to-blue-800 text-white py-16">
          <div className="container mx-auto px-4">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-4">
              Welcome to Microblog CMS
            </h1>
            <p className="text-xl md:text-2xl text-blue-100">
              A modern blogging platform built with Next.js, TypeScript, and TailwindCSS
            </p>
          </div>
        </section>

        {/* Posts Timeline */}
        <section className="container mx-auto px-4 py-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-8">Latest Posts</h2>

          {posts.length === 0 ? (
            <div className="text-center py-16">
              <p className="text-gray-600 text-lg mb-4">No posts yet. Create your first post!</p>
              <p className="text-gray-500">
                Add a new <code className="bg-gray-200 px-2 py-1 rounded">.md</code> file in the{' '}
                <code className="bg-gray-200 px-2 py-1 rounded">content/posts</code> directory.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {posts.map((post) => (
                <PostCard key={post.slug} post={post} />
              ))}
            </div>
          )}
        </section>
      </div>
    </Layout>
  );
}

export const getStaticProps: GetStaticProps<HomeProps> = async () => {
  const posts = await getAllPostsMetadata();

  return {
    props: {
      posts,
    },
    revalidate: 60, // Revalidate every 60 seconds
  };
}

