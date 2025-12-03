/**
 * Admin Tags Management Page
 * Manage all tags - rename, delete
 */

import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import AdminLayout from '@/components/admin/AdminLayout';
import { withAuth } from '@/contexts/AuthContext';

interface Tag {
  id: string;
  name: string;
  slug: string;
  post_count: number;
  created_at: string;
}

function AdminTagsPage() {
  const [tags, setTags] = useState<Tag[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Fetch tags
  const fetchTags = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/admin/tags');
      const data = await response.json();

      if (data.success) {
        setTags(data.tags || []);
      } else {
        showMessage('error', data.message || 'Failed to fetch tags');
      }
    } catch (error) {
      console.error('Failed to fetch tags:', error);
      showMessage('error', 'Failed to fetch tags');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTags();
  }, []);

  // Show message temporarily
  const showMessage = (type: 'success' | 'error', text: string) => {
    setMessage({ type, text });
    setTimeout(() => setMessage(null), 5000);
  };

  // Start editing
  const startEdit = (tag: Tag) => {
    setEditingId(tag.id);
    setEditName(tag.name);
  };

  // Cancel editing
  const cancelEdit = () => {
    setEditingId(null);
    setEditName('');
  };

  // Save rename
  const handleRename = async (id: string) => {
    if (!editName.trim()) {
      showMessage('error', 'Tag name cannot be empty');
      return;
    }

    try {
      const response = await fetch(`/api/admin/tags/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: editName }),
      });

      const data = await response.json();

      if (response.ok) {
        showMessage('success', data.message);
        setEditingId(null);
        fetchTags();
      } else {
        showMessage('error', data.message || 'Rename failed');
      }
    } catch (error) {
      showMessage('error', 'An error occurred');
    }
  };

  // Delete tag
  const handleDelete = async (id: string, name: string, postCount: number) => {
    if (postCount > 0) {
      showMessage('error', `Cannot delete "${name}". It is used by ${postCount} post(s).`);
      return;
    }

    if (!confirm(`Delete tag "${name}"? This cannot be undone.`)) {
      return;
    }

    try {
      const response = await fetch(`/api/admin/tags/${id}`, {
        method: 'DELETE',
      });

      const data = await response.json();

      if (response.ok) {
        showMessage('success', data.message);
        fetchTags();
      } else {
        showMessage('error', data.message || 'Delete failed');
      }
    } catch (error) {
      showMessage('error', 'An error occurred');
    }
  };

  return (
    <>
      <Head>
        <title>Tag Management - Admin</title>
      </Head>

      <AdminLayout>
        <div className="container mx-auto px-4 py-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900">Tag Management</h1>
            <p className="mt-2 text-gray-600">Manage all tags used in your blog posts</p>
          </div>

          {/* Message */}
          {message && (
            <div
              className={`mb-6 p-4 rounded-md ${
                message.type === 'success' ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'
              }`}
            >
              {message.text}
            </div>
          )}

          {/* Tags Table */}
          <div className="bg-white shadow-md rounded-lg overflow-hidden">
            {loading ? (
              <div className="p-8 text-center text-gray-500">Loading tags...</div>
            ) : tags.length === 0 ? (
              <div className="p-8 text-center text-gray-500">
                <p>No tags found. Tags are automatically created when you add them to posts.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Tag Name
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Slug
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Post Count
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {tags.map((tag) => (
                      <tr key={tag.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          {editingId === tag.id ? (
                            <input
                              type="text"
                              value={editName}
                              onChange={(e) => setEditName(e.target.value)}
                              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                              autoFocus
                            />
                          ) : (
                            <div className="text-sm font-medium text-gray-900">{tag.name}</div>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-500">{tag.slug}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                            {tag.post_count} {tag.post_count === 1 ? 'post' : 'posts'}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          {editingId === tag.id ? (
                            <div className="flex space-x-2">
                              <button
                                onClick={() => handleRename(tag.id)}
                                className="text-green-600 hover:text-green-900"
                              >
                                Save
                              </button>
                              <button
                                onClick={cancelEdit}
                                className="text-gray-600 hover:text-gray-900"
                              >
                                Cancel
                              </button>
                            </div>
                          ) : (
                            <div className="flex space-x-4">
                              <button
                                onClick={() => startEdit(tag)}
                                className="text-blue-600 hover:text-blue-900"
                              >
                                Rename
                              </button>
                              <button
                                onClick={() => handleDelete(tag.id, tag.name, tag.post_count)}
                                className={`${
                                  tag.post_count > 0
                                    ? 'text-gray-400 cursor-not-allowed'
                                    : 'text-red-600 hover:text-red-900'
                                }`}
                                disabled={tag.post_count > 0}
                                title={tag.post_count > 0 ? 'Cannot delete tag with posts' : 'Delete tag'}
                              >
                                Delete
                              </button>
                            </div>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Info box */}
          <div className="mt-6 p-4 bg-blue-50 rounded-lg">
            <p className="text-sm text-blue-800">
              <strong>Note:</strong> Tags are automatically created when you add them to posts. 
              You can only delete tags that are not used by any posts.
            </p>
          </div>
        </div>
      </AdminLayout>
    </>
  );
}

export default withAuth(AdminTagsPage, 'super_admin');
