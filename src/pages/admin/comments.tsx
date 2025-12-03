/**
 * Admin Comments Moderation Page
 * 
 * Allows admins and authors to moderate comments.
 * Features:
 * - List all comments with filters
 * - Approve/Reject/Delete actions
 * - Bulk moderation
 * - View comment details
 * - Filter by status
 */

import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import AdminLayout from '@/components/admin/AdminLayout';
import { withAuth } from '@/contexts/AuthContext';

interface Comment {
  id: string;
  post_slug: string;
  author_name: string;
  author_email: string;
  content: string;
  status: 'pending' | 'approved' | 'rejected';
  created_at: string;
}

interface Counts {
  total: number;
  pending: number;
  approved: number;
  rejected: number;
}

function AdminCommentsPage() {
  const [comments, setComments] = useState<Comment[]>([]);
  const [counts, setCounts] = useState<Counts>({
    total: 0,
    pending: 0,
    approved: 0,
    rejected: 0,
  });
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('all');
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [actionLoading, setActionLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Fetch comments
  const fetchComments = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/admin/comments?status=${filter}&limit=100`);
      const data = await response.json();

      if (data.success) {
        setComments(data.comments || []);
        setCounts(data.counts || counts);
      }
    } catch (error) {
      console.error('Failed to fetch comments:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchComments();
  }, [filter]);

  // Show message temporarily
  const showMessage = (type: 'success' | 'error', text: string) => {
    setMessage({ type, text });
    setTimeout(() => setMessage(null), 5000);
  };

  // Toggle selection
  const toggleSelect = (id: string) => {
    const newSelected = new Set(selectedIds);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedIds(newSelected);
  };

  // Select all visible
  const toggleSelectAll = () => {
    if (selectedIds.size === comments.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(comments.map(c => c.id)));
    }
  };

  // Single action
  const handleAction = async (id: string, action: 'approve' | 'reject' | 'delete') => {
    setActionLoading(true);
    try {
      const method = action === 'delete' ? 'DELETE' : 'PUT';
      const body = action !== 'delete' ? JSON.stringify({ action }) : undefined;

      const response = await fetch(`/api/admin/comments/${id}`, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body,
      });

      const data = await response.json();

      if (response.ok) {
        showMessage('success', data.message);
        fetchComments();
      } else {
        showMessage('error', data.message || 'Action failed');
      }
    } catch (error) {
      showMessage('error', 'An error occurred');
    } finally {
      setActionLoading(false);
    }
  };

  // Bulk action
  const handleBulkAction = async (action: 'approve' | 'reject' | 'delete') => {
    if (selectedIds.size === 0) return;

    if (action === 'delete' && !confirm(`Delete ${selectedIds.size} comment(s) permanently?`)) {
      return;
    }

    setActionLoading(true);
    try {
      const response = await fetch('/api/admin/comments/bulk', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          commentIds: Array.from(selectedIds),
          action,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        showMessage('success', data.message);
        setSelectedIds(new Set());
        fetchComments();
      } else {
        showMessage('error', data.message || 'Bulk action failed');
      }
    } catch (error) {
      showMessage('error', 'An error occurred');
    } finally {
      setActionLoading(false);
    }
  };

  // Format date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <>
      <Head>
        <title>Comments - Admin | Microblog CMS</title>
      </Head>

      <AdminLayout>
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-gray-900">Comments Moderation</h1>
            <p className="mt-1 text-sm text-gray-600">
              Review and moderate user comments
            </p>
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
              <div className="text-sm font-medium text-gray-500">Pending</div>
              <div className="mt-1 text-3xl font-semibold text-yellow-600">{counts.pending}</div>
            </div>
            <div className="bg-white rounded-lg shadow p-4">
              <div className="text-sm font-medium text-gray-500">Approved</div>
              <div className="mt-1 text-3xl font-semibold text-green-600">{counts.approved}</div>
            </div>
            <div className="bg-white rounded-lg shadow p-4">
              <div className="text-sm font-medium text-gray-500">Rejected</div>
              <div className="mt-1 text-3xl font-semibold text-red-600">{counts.rejected}</div>
            </div>
          </div>

          {/* Filters and Actions */}
          <div className="bg-white rounded-lg shadow mb-6">
            <div className="p-4 border-b border-gray-200">
              <div className="flex flex-wrap items-center justify-between gap-4">
                {/* Filters */}
                <div className="flex space-x-2">
                  {(['all', 'pending', 'approved', 'rejected'] as const).map((status) => (
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

                {/* Bulk Actions */}
                {selectedIds.size > 0 && (
                  <div className="flex items-center space-x-2">
                    <span className="text-sm text-gray-600">{selectedIds.size} selected</span>
                    <button
                      onClick={() => handleBulkAction('approve')}
                      disabled={actionLoading}
                      className="px-3 py-1 text-sm bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50"
                    >
                      Approve
                    </button>
                    <button
                      onClick={() => handleBulkAction('reject')}
                      disabled={actionLoading}
                      className="px-3 py-1 text-sm bg-yellow-600 text-white rounded hover:bg-yellow-700 disabled:opacity-50"
                    >
                      Reject
                    </button>
                    <button
                      onClick={() => handleBulkAction('delete')}
                      disabled={actionLoading}
                      className="px-3 py-1 text-sm bg-red-600 text-white rounded hover:bg-red-700 disabled:opacity-50"
                    >
                      Delete
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Comments Table */}
            {loading ? (
              <div className="p-8 text-center text-gray-500">Loading...</div>
            ) : comments.length === 0 ? (
              <div className="p-8 text-center text-gray-500">No comments found</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 text-left">
                        <input
                          type="checkbox"
                          checked={selectedIds.size === comments.length}
                          onChange={toggleSelectAll}
                          className="rounded border-gray-300"
                        />
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        Author
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        Comment
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        Post
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        Status
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        Date
                      </th>
                      <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {comments.map((comment) => (
                      <tr key={comment.id} className="hover:bg-gray-50">
                        <td className="px-4 py-4">
                          <input
                            type="checkbox"
                            checked={selectedIds.has(comment.id)}
                            onChange={() => toggleSelect(comment.id)}
                            className="rounded border-gray-300"
                          />
                        </td>
                        <td className="px-4 py-4">
                          <div className="text-sm font-medium text-gray-900">{comment.author_name}</div>
                          <div className="text-xs text-gray-500">{comment.author_email}</div>
                        </td>
                        <td className="px-4 py-4 max-w-md">
                          <div className="text-sm text-gray-900 line-clamp-2">{comment.content}</div>
                        </td>
                        <td className="px-4 py-4">
                          <a
                            href={`/posts/${comment.post_slug}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-sm text-indigo-600 hover:text-indigo-800"
                          >
                            {comment.post_slug}
                          </a>
                        </td>
                        <td className="px-4 py-4">
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                            comment.status === 'approved' ? 'bg-green-100 text-green-800' :
                            comment.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-red-100 text-red-800'
                          }`}>
                            {comment.status}
                          </span>
                        </td>
                        <td className="px-4 py-4 text-sm text-gray-500">
                          {formatDate(comment.created_at)}
                        </td>
                        <td className="px-4 py-4 text-right text-sm space-x-2">
                          {comment.status !== 'approved' && (
                            <button
                              onClick={() => handleAction(comment.id, 'approve')}
                              disabled={actionLoading}
                              className="text-green-600 hover:text-green-800 disabled:opacity-50"
                            >
                              Approve
                            </button>
                          )}
                          {comment.status !== 'rejected' && (
                            <button
                              onClick={() => handleAction(comment.id, 'reject')}
                              disabled={actionLoading}
                              className="text-yellow-600 hover:text-yellow-800 disabled:opacity-50"
                            >
                              Reject
                            </button>
                          )}
                          <button
                            onClick={() => handleAction(comment.id, 'delete')}
                            disabled={actionLoading}
                            className="text-red-600 hover:text-red-800 disabled:opacity-50"
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

export default withAuth(AdminCommentsPage, 'author');
