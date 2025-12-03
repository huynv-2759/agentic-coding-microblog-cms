/**
 * Edit Post Page
 * 
 * Edit an existing blog post.
 */

import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import AdminLayout from '@/components/admin/AdminLayout';
import MarkdownEditor from '@/components/admin/MarkdownEditor';
import TagsInput from '@/components/admin/TagsInput';
import { withAuth } from '@/contexts/AuthContext';

interface FormData {
  title: string;
  slug: string;
  content: string;
  excerpt: string;
  tags: string[];
  status: 'draft' | 'published' | 'archived';
}

function EditPostPage() {
  const router = useRouter();
  const { id } = router.query;
  
  const [formData, setFormData] = useState<FormData>({
    title: '',
    slug: '',
    content: '',
    excerpt: '',
    tags: [],
    status: 'draft',
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [originalSlug, setOriginalSlug] = useState('');

  // Fetch post data
  useEffect(() => {
    if (!id) return;

    const fetchPost = async () => {
      try {
        const response = await fetch(`/api/admin/posts/${id}`);
        const data = await response.json();

        if (data.success && data.post) {
          const post = data.post;
          setFormData({
            title: post.title,
            slug: post.slug,
            content: post.content,
            excerpt: post.excerpt || '',
            tags: post.tags || [],
            status: post.status,
          });
          setOriginalSlug(post.slug);
        } else {
          setErrors({ fetch: data.message || 'Failed to load post' });
        }
      } catch (error) {
        setErrors({ fetch: 'An error occurred while loading the post' });
      } finally {
        setLoading(false);
      }
    };

    fetchPost();
  }, [id]);

  // Generate excerpt from content
  const generateExcerpt = () => {
    const plainText = formData.content
      .replace(/#{1,6}\s/g, '')
      .replace(/\*\*(.+?)\*\*/g, '$1')
      .replace(/\*(.+?)\*/g, '$1')
      .replace(/\[(.+?)\]\(.+?\)/g, '$1')
      .replace(/`(.+?)`/g, '$1')
      .replace(/```[\s\S]*?```/g, '')
      .trim();

    const excerpt = plainText.substring(0, 160).trim() + (plainText.length > 160 ? '...' : '');
    setFormData({ ...formData, excerpt });
  };

  // Validate form
  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.title.trim()) {
      newErrors.title = 'Title is required';
    }

    if (!formData.slug.trim()) {
      newErrors.slug = 'Slug is required';
    } else if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(formData.slug)) {
      newErrors.slug = 'Slug must contain only lowercase letters, numbers, and hyphens';
    }

    if (!formData.content.trim()) {
      newErrors.content = 'Content is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Submit form
  const handleSubmit = async (e: React.FormEvent, publishNow = false) => {
    e.preventDefault();

    if (!validate()) {
      return;
    }

    setSaving(true);
    setErrors({});

    try {
      const submitData = {
        ...formData,
        status: publishNow ? 'published' : formData.status,
        excerpt: formData.excerpt || formData.content.substring(0, 160) + '...',
      };

      const response = await fetch(`/api/admin/posts/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(submitData),
      });

      const data = await response.json();

      if (response.ok) {
        // If slug changed, redirect to new URL
        if (originalSlug !== formData.slug) {
          router.push('/admin/posts');
        } else {
          // Show success message and stay on page
          setErrors({ success: 'Post updated successfully' });
          setTimeout(() => setErrors({}), 3000);
        }
      } else {
        setErrors({ submit: data.message || 'Failed to update post' });
      }
    } catch (error) {
      setErrors({ submit: 'An error occurred while updating the post' });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-gray-500">Loading post...</div>
        </div>
      </AdminLayout>
    );
  }

  if (errors.fetch) {
    return (
      <AdminLayout>
        <div className="max-w-5xl mx-auto">
          <div className="rounded-md bg-red-50 p-4">
            <p className="text-sm text-red-800">{errors.fetch}</p>
          </div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <>
      <Head>
        <title>Edit Post - Admin | Microblog CMS</title>
      </Head>

      <AdminLayout>
        <div className="max-w-5xl mx-auto">
          {/* Header */}
          <div className="mb-6 flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Edit Post</h1>
              <p className="mt-1 text-sm text-gray-600">
                Update your blog post
              </p>
            </div>
            <button
              type="button"
              onClick={() => router.push('/admin/posts')}
              className="px-4 py-2 text-sm text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
            >
              Back to Posts
            </button>
          </div>

          {/* Success message */}
          {errors.success && (
            <div className="mb-6 rounded-md bg-green-50 p-4">
              <p className="text-sm text-green-800">{errors.success}</p>
            </div>
          )}

          {/* Error message */}
          {errors.submit && (
            <div className="mb-6 rounded-md bg-red-50 p-4">
              <p className="text-sm text-red-800">{errors.submit}</p>
            </div>
          )}

          <form onSubmit={(e) => handleSubmit(e, false)} className="space-y-6">
            {/* Title */}
            <div>
              <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
                Title *
              </label>
              <input
                type="text"
                id="title"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 ${
                  errors.title ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="Enter post title"
              />
              {errors.title && (
                <p className="mt-1 text-sm text-red-600">{errors.title}</p>
              )}
            </div>

            {/* Slug */}
            <div>
              <label htmlFor="slug" className="block text-sm font-medium text-gray-700 mb-2">
                Slug *
              </label>
              <input
                type="text"
                id="slug"
                value={formData.slug}
                onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 ${
                  errors.slug ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="post-url-slug"
              />
              {errors.slug && (
                <p className="mt-1 text-sm text-red-600">{errors.slug}</p>
              )}
              <p className="mt-1 text-sm text-gray-500">
                URL: /posts/{formData.slug || 'your-slug'}
              </p>
              {originalSlug !== formData.slug && (
                <p className="mt-1 text-sm text-orange-600">
                  ⚠️ Changing the slug will break existing links to this post
                </p>
              )}
            </div>

            {/* Content */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Content * 
                <span className="ml-2 text-xs text-gray-500">(Markdown supported)</span>
              </label>
              <MarkdownEditor
                value={formData.content}
                onChange={(content) => setFormData({ ...formData, content })}
              />
              {errors.content && (
                <p className="mt-1 text-sm text-red-600">{errors.content}</p>
              )}
            </div>

            {/* Excerpt */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label htmlFor="excerpt" className="block text-sm font-medium text-gray-700">
                  Excerpt
                </label>
                <button
                  type="button"
                  onClick={generateExcerpt}
                  className="text-sm text-indigo-600 hover:text-indigo-800"
                >
                  Generate from content
                </button>
              </div>
              <textarea
                id="excerpt"
                value={formData.excerpt}
                onChange={(e) => setFormData({ ...formData, excerpt: e.target.value })}
                rows={3}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                placeholder="Brief description of the post"
              />
              <p className="mt-1 text-sm text-gray-500">
                {formData.excerpt.length}/160 characters
              </p>
            </div>

            {/* Tags */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tags
              </label>
              <TagsInput
                value={formData.tags}
                onChange={(tags) => setFormData({ ...formData, tags })}
              />
            </div>

            {/* Status */}
            <div>
              <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-2">
                Status
              </label>
              <select
                id="status"
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              >
                <option value="draft">Draft</option>
                <option value="published">Published</option>
                <option value="archived">Archived</option>
              </select>
            </div>

            {/* Actions */}
            <div className="flex gap-4 pt-6 border-t">
              <button
                type="submit"
                disabled={saving}
                className="px-6 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 disabled:opacity-50"
              >
                {saving ? 'Saving...' : 'Save Changes'}
              </button>
              {formData.status !== 'published' && (
                <button
                  type="button"
                  onClick={(e) => handleSubmit(e, true)}
                  disabled={saving}
                  className="px-6 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:opacity-50"
                >
                  {saving ? 'Publishing...' : 'Publish Now'}
                </button>
              )}
              <a
                href={`/posts/${originalSlug}`}
                target="_blank"
                rel="noopener noreferrer"
                className="px-6 py-2 text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
              >
                Preview
              </a>
            </div>
          </form>
        </div>
      </AdminLayout>
    </>
  );
}

export default withAuth(EditPostPage, 'author');
