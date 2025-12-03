/**
 * Layout Component
 * 
 * Main layout wrapper that includes Navbar and Footer
 */

import { ReactNode } from 'react';
import Navbar from './Navbar';
import Footer from './Footer';

export interface LayoutProps {
  children: ReactNode;
  className?: string;
}

export default function Layout({ children, className = '' }: LayoutProps) {
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar siteName="Microblog CMS" />
      
      <main className={`flex-1 ${className}`}>
        {children}
      </main>
      
      <Footer 
        author="Microblog CMS"
        socialLinks={[
          { platform: 'GitHub', url: 'https://github.com' },
          { platform: 'Twitter', url: 'https://twitter.com' },
        ]}
      />
    </div>
  );
}
