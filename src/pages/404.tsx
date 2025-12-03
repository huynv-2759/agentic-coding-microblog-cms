/**
 * Custom 404 Page
 * 
 * Displayed when a page is not found
 */

import Link from 'next/link';
import Layout from '@/components/layout/Layout';
import Meta from '@/components/seo/Meta';

export default function Custom404() {
  return (
    <Layout>
      <Meta
        title="404 - Page Not Found"
        description="The page you're looking for doesn't exist"
        url="https://yourdomain.com/404"
      />

      <div className="bg-gray-50 min-h-screen flex items-center justify-center px-4">
        <div className="text-center max-w-2xl">
          {/* 404 Number */}
          <h1 className="text-9xl font-bold text-blue-600 mb-4">
            404
          </h1>

          {/* Message */}
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Page Not Found
          </h2>
          <p className="text-lg text-gray-600 mb-8">
            Sorry, the page you&apos;re looking for doesn&apos;t exist or has been moved.
          </p>

          {/* Navigation Links */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/"
              className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
              </svg>
              Go Home
            </Link>

            <Link
              href="/tags"
              className="inline-flex items-center gap-2 px-6 py-3 bg-white text-blue-600 font-medium rounded-lg border-2 border-blue-600 hover:bg-blue-50 transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
              </svg>
              Browse Tags
            </Link>
          </div>

          {/* Additional Help */}
          <div className="mt-12 p-6 bg-white rounded-lg shadow-md">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Looking for something specific?
            </h3>
            <p className="text-gray-600">
              Try browsing our latest posts or searching by tags to find what you need.
            </p>
          </div>
        </div>
      </div>
    </Layout>
  );
}
