/**
 * Markdown Editor Component
 * 
 * A simple markdown editor with live preview.
 * Features:
 * - Textarea for markdown input
 * - Live preview with markdown rendering
 * - Split view (side-by-side)
 * - Toolbar with common markdown shortcuts
 */

import React, { useState } from 'react';

interface MarkdownEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

export default function MarkdownEditor({
  value,
  onChange,
  placeholder = 'Write your post content in Markdown...',
}: MarkdownEditorProps) {
  const [showPreview, setShowPreview] = useState(false);

  // Insert markdown syntax at cursor
  const insertMarkdown = (before: string, after: string = '') => {
    const textarea = document.getElementById('markdown-editor') as HTMLTextAreaElement;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = value.substring(start, end);
    const newText = value.substring(0, start) + before + selectedText + after + value.substring(end);
    
    onChange(newText);

    // Set cursor position
    setTimeout(() => {
      textarea.focus();
      const newPos = start + before.length + selectedText.length;
      textarea.setSelectionRange(newPos, newPos);
    }, 0);
  };

  // Toolbar buttons
  const toolbarButtons = [
    { label: 'H1', action: () => insertMarkdown('# ') },
    { label: 'H2', action: () => insertMarkdown('## ') },
    { label: 'H3', action: () => insertMarkdown('### ') },
    { label: 'Bold', action: () => insertMarkdown('**', '**') },
    { label: 'Italic', action: () => insertMarkdown('*', '*') },
    { label: 'Link', action: () => insertMarkdown('[', '](url)') },
    { label: 'Code', action: () => insertMarkdown('`', '`') },
    { label: 'Quote', action: () => insertMarkdown('> ') },
    { label: 'List', action: () => insertMarkdown('- ') },
    { label: 'Code Block', action: () => insertMarkdown('```\n', '\n```') },
  ];

  // Simple markdown to HTML converter (basic implementation)
  const renderMarkdown = (markdown: string) => {
    let html = markdown
      // Code blocks
      .replace(/```(\w+)?\n([\s\S]*?)```/g, '<pre><code>$2</code></pre>')
      // Headers
      .replace(/^### (.*$)/gim, '<h3>$1</h3>')
      .replace(/^## (.*$)/gim, '<h2>$1</h2>')
      .replace(/^# (.*$)/gim, '<h1>$1</h1>')
      // Bold
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      // Italic
      .replace(/\*(.*?)\*/g, '<em>$1</em>')
      // Links
      .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" rel="noopener">$1</a>')
      // Inline code
      .replace(/`([^`]+)`/g, '<code>$1</code>')
      // Line breaks
      .replace(/\n\n/g, '</p><p>')
      // Blockquote
      .replace(/^> (.*$)/gim, '<blockquote>$1</blockquote>')
      // Unordered list
      .replace(/^\- (.*$)/gim, '<li>$1</li>')
      // Wrap lists
      .replace(/(<li>.*<\/li>)/s, '<ul>$1</ul>');

    return `<p>${html}</p>`;
  };

  return (
    <div className="border rounded-lg overflow-hidden bg-white">
      {/* Toolbar */}
      <div className="border-b bg-gray-50 p-2 flex flex-wrap gap-2">
        {toolbarButtons.map((btn, index) => (
          <button
            key={index}
            type="button"
            onClick={btn.action}
            className="px-3 py-1 text-sm bg-white border border-gray-300 rounded hover:bg-gray-100"
          >
            {btn.label}
          </button>
        ))}
        <div className="ml-auto flex gap-2">
          <button
            type="button"
            onClick={() => setShowPreview(false)}
            className={`px-3 py-1 text-sm rounded ${
              !showPreview ? 'bg-indigo-600 text-white' : 'bg-white border border-gray-300'
            }`}
          >
            Edit
          </button>
          <button
            type="button"
            onClick={() => setShowPreview(true)}
            className={`px-3 py-1 text-sm rounded ${
              showPreview ? 'bg-indigo-600 text-white' : 'bg-white border border-gray-300'
            }`}
          >
            Preview
          </button>
        </div>
      </div>

      {/* Editor / Preview */}
      <div className="grid grid-cols-1 lg:grid-cols-2 divide-x">
        {/* Editor */}
        {!showPreview && (
          <div className="lg:col-span-2">
            <textarea
              id="markdown-editor"
              value={value}
              onChange={(e) => onChange(e.target.value)}
              placeholder={placeholder}
              className="w-full h-[600px] p-4 font-mono text-sm resize-none focus:outline-none"
              style={{ minHeight: '600px' }}
            />
          </div>
        )}

        {/* Preview */}
        {showPreview && (
          <div className="lg:col-span-2 p-4 prose max-w-none overflow-auto" style={{ minHeight: '600px' }}>
            <div
              className="markdown-preview"
              dangerouslySetInnerHTML={{ __html: renderMarkdown(value) }}
            />
          </div>
        )}
      </div>

      {/* Character count */}
      <div className="border-t bg-gray-50 px-4 py-2 text-xs text-gray-500 text-right">
        {value.length} characters
      </div>
    </div>
  );
}
