/**
 * Footer Component
 * 
 * Site footer with copyright and optional social links
 */

import Link from 'next/link';

export interface FooterProps {
  copyrightYear?: number;
  author?: string;
  socialLinks?: {
    platform: string;
    url: string;
  }[];
  className?: string;
}

export default function Footer({ 
  copyrightYear = new Date().getFullYear(),
  author = 'Microblog',
  socialLinks = [],
  className = '' 
}: FooterProps) {
  return (
    <footer className={`bg-gray-900 text-gray-300 py-8 mt-auto ${className}`}>
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          {/* Copyright */}
          <div className="text-center md:text-left">
            <p className="text-sm">
              © {copyrightYear} {author}. All rights reserved.
            </p>
          </div>

          {/* Social Links */}
          {socialLinks.length > 0 && (
            <div className="flex items-center gap-4">
              {socialLinks.map((link) => (
                <a
                  key={link.platform}
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gray-400 hover:text-white transition-colors"
                  aria-label={link.platform}
                >
                  {link.platform}
                </a>
              ))}
            </div>
          )}

          {/* Built with */}
          <div className="text-center md:text-right text-sm text-gray-400">
            <p>
              Built with{' '}
              <a 
                href="https://nextjs.org" 
                target="_blank" 
                rel="noopener noreferrer"
                className="hover:text-white transition-colors"
              >
                Next.js
              </a>
              {' & '}
              <a 
                href="https://tailwindcss.com" 
                target="_blank" 
                rel="noopener noreferrer"
                className="hover:text-white transition-colors"
              >
                TailwindCSS
              </a>
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
