/**
 * Admin Posts Management Page
 * 
 * Manage all blog posts - list, create, edit, delete
 */

import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import AdminLayout from '@/components/admin/AdminLayout';
import { withAuth } from '@/contexts/AuthContext';

interface Post {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  status: 'draft' | 'published' | 'archived';
  tags: string[];
  published_at: string | null;
  created_at: string;
  updated_at: string;
  author: {
    id: string;
    full_name: string;
    email: string;
  };
}

interface Counts {
  total: number;
  draft: number;
  published: number;
  archived: number;
}

function AdminPostsPage() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [counts, setCounts] = useState<Counts>({
    total: 0,
    draft: 0,
    published: 0,
    archived: 0,
  });
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'draft' | 'published' | 'archived'>('all');
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Fetch posts
  const fetchPosts = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/admin/posts?status=${filter}&limit=100`);
      const data = await response.json();

      if (data.success) {
        setPosts(data.posts || []);
        setCounts(data.counts || counts);
      }
    } catch (error) {
      console.error('Failed to fetch posts:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPosts();
  }, [filter]);

  // Show message temporarily
  const showMessage = (type: 'success' | 'error', text: string) => {
    setMessage({ type, text });
    setTimeout(() => setMessage(null), 5000);
  };

  // Delete post
  const handleDelete = async (id: string, title: string) => {
    if (!confirm(`Delete post "${title}"? This cannot be undone.`)) {
      return;
    }

    try {
      const response = await fetch(`/api/admin/posts/${id}`, {
        method: 'DELETE',
      });

      const data = await response.json();

      if (response.ok) {
        showMessage('success', data.message);
        fetchPosts();
      } else {
        showMessage('error', data.message || 'Delete failed');
      }
    } catch (error) {
      showMessage('error', 'An error occurred');
    }
  };

  // Format date
  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'Not published';
    const date = new Date(dateString);
    return date.toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  return (
    <>
      <Head>
        <title>Posts - Admin | Microblog CMS</title>
      </Head>

      <AdminLayout>
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-6 flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Posts Management</h1>
              <p className="mt-1 text-sm text-gray-600">
                Create and manage blog posts
              </p>
            </div>
            <Link
              href="/admin/posts/new"
              className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 font-medium"
            >
              Create New Post
            </Link>
          </div>

          {/* Message */}
          {message && (
            <div className={`mb-4 rounded-md p-4 ${
              message.type === 'success' ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'
            }`}>
              {message.text}
            </div>
          )}

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-white rounded-lg shadow p-4">
              <div className="text-sm font-medium text-gray-500">Total</div>
              <div className="mt-1 text-3xl font-semibold text-gray-900">{counts.total}</div>
            </div>
            <div className="bg-white rounded-lg shadow p-4">
              <div className="text-sm font-medium text-gray-500">Draft</div>
              <div className="mt-1 text-3xl font-semibold text-gray-600">{counts.draft}</div>
            </div>
            <div className="bg-white rounded-lg shadow p-4">
              <div className="text-sm font-medium text-gray-500">Published</div>
              <div className="mt-1 text-3xl font-semibold text-green-600">{counts.published}</div>
            </div>
            <div className="bg-white rounded-lg shadow p-4">
              <div className="text-sm font-medium text-gray-500">Archived</div>
              <div className="mt-1 text-3xl font-semibold text-yellow-600">{counts.archived}</div>
            </div>
          </div>

          {/* Filters */}
          <div className="bg-white rounded-lg shadow mb-6">
            <div className="p-4 border-b border-gray-200">
              <div className="flex space-x-2">
                {(['all', 'draft', 'published', 'archived'] as const).map((status) => (
                  <button
                    key={status}
                    onClick={() => setFilter(status)}
                    className={`px-4 py-2 text-sm font-medium rounded-md ${
                      filter === status
                        ? 'bg-indigo-600 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {status.charAt(0).toUpperCase() + status.slice(1)}
                  </button>
                ))}
              </div>
            </div>

            {/* Posts Table */}
            {loading ? (
              <div className="p-8 text-center text-gray-500">Loading...</div>
            ) : posts.length === 0 ? (
              <div className="p-8 text-center text-gray-500">
                No posts found. <Link href="/admin/posts/new" className="text-indigo-600 hover:text-indigo-800">Create your first post</Link>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        Title
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        Author
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        Status
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        Tags
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        Published
                      </th>
                      <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {posts.map((post) => (
                      <tr key={post.id} className="hover:bg-gray-50">
                        <td className="px-4 py-4 max-w-md">
                          <div className="text-sm font-medium text-gray-900">{post.title}</div>
                          <div className="text-xs text-gray-500 line-clamp-1">{post.excerpt}</div>
                        </td>
                        <td className="px-4 py-4">
                          <div className="text-sm text-gray-900">{post.author.full_name}</div>
                          <div className="text-xs text-gray-500">{post.author.email}</div>
                        </td>
                        <td className="px-4 py-4">
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                            post.status === 'published' ? 'bg-green-100 text-green-800' :
                            post.status === 'draft' ? 'bg-gray-100 text-gray-800' :
                            'bg-yellow-100 text-yellow-800'
                          }`}>
                            {post.status}
                          </span>
                        </td>
                        <td className="px-4 py-4">
                          <div className="flex flex-wrap gap-1">
                            {post.tags.slice(0, 3).map((tag, i) => (
                              <span
                                key={i}
                                className="inline-flex px-2 py-0.5 text-xs bg-indigo-50 text-indigo-700 rounded"
                              >
                                {tag}
                              </span>
                            ))}
                            {post.tags.length > 3 && (
                              <span className="text-xs text-gray-500">+{post.tags.length - 3}</span>
                            )}
                          </div>
                        </td>
                        <td className="px-4 py-4 text-sm text-gray-500">
                          {formatDate(post.published_at)}
                        </td>
                        <td className="px-4 py-4 text-right text-sm space-x-2">
                          <a
                            href={`/posts/${post.slug}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-indigo-600 hover:text-indigo-800"
                          >
                            View
                          </a>
                          <Link
                            href={`/admin/posts/${post.id}/edit`}
                            className="text-blue-600 hover:text-blue-800"
                          >
                            Edit
                          </Link>
                          <button
                            onClick={() => handleDelete(post.id, post.title)}
                            className="text-red-600 hover:text-red-800"
                          >
                            Delete
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </AdminLayout>
    </>
  );
}

export default withAuth(AdminPostsPage, 'author');
