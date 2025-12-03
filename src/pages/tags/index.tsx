/**
 * All Tags Page
 * 
 * Displays all available tags with post counts
 */

import { GetStaticProps } from 'next';
import Layout from '@/components/layout/Layout';
import TagList from '@/components/tag/TagList';
import Meta from '@/components/seo/Meta';
import { TagSummary } from '@/lib/types';
import { getAllTags } from '@/lib/tags';

interface TagsPageProps {
  tags: TagSummary[];
}

export default function TagsPage({ tags }: TagsPageProps) {
  return (
    <Layout>
      <Meta
        title="All Tags"
        description="Browse all tags and discover content organized by topics"
        url="https://yourdomain.com/tags"
      />

      <div className="bg-gray-50 min-h-screen">
        {/* Header */}
        <section className="bg-gradient-to-r from-blue-600 to-blue-800 text-white py-16">
          <div className="container mx-auto px-4">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              Browse by Tags
            </h1>
            <p className="text-xl text-blue-100">
              Discover content organized by topics
            </p>
          </div>
        </section>

        {/* Tags List */}
        <section className="container mx-auto px-4 py-12">
          {tags.length === 0 ? (
            <div className="text-center py-16">
              <p className="text-gray-600 text-lg">No tags found yet.</p>
            </div>
          ) : (
            <>
              <div className="mb-8">
                <p className="text-gray-600 text-lg">
                  Found <span className="font-bold text-gray-900">{tags.length}</span> tag
                  {tags.length !== 1 ? 's' : ''}
                </p>
              </div>
              <TagList tags={tags} />
            </>
          )}
        </section>
      </div>
    </Layout>
  );
}

export const getStaticProps: GetStaticProps<TagsPageProps> = async () => {
  const tags = await getAllTags();

  return {
    props: {
      tags,
    },
    revalidate: 60, // Revalidate every minute
  };
};
