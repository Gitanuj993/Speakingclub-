/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { ReactNode } from 'react';
import { useLocation } from 'react-router-dom';
import { Navbar } from './Navbar';
import { Sidebar } from './Sidebar';
import { MobileTabBar } from './MobileTabBar';
import { Footer } from './Footer';

export interface LayoutProps {
  children: ReactNode;
}

export const Layout: React.FC<LayoutProps> = ({ children }) => {
  const location = useLocation();
  const isLanding = location.pathname === '/';
  const isOnboarding = location.pathname === '/onboarding';
  const isLesson = location.pathname.startsWith('/lesson/');

  const hideNavigationChrome = isLanding || isOnboarding;

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors">
      {/* Accessible skip link */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 z-50 px-4 py-2 bg-indigo-600 text-white rounded-xl shadow-lg text-sm font-semibold focus:outline-none"
      >
        Skip to main content
      </a>

      {/* Global Navbar */}
      <Navbar />

      <div className="flex-1 flex max-w-7xl w-full mx-auto">
        {!hideNavigationChrome && !isLesson && <Sidebar />}

        <main
          id="main-content"
          tabIndex={-1}
          className={`flex-1 min-w-0 focus:outline-none ${
            !hideNavigationChrome && !isLesson ? 'pb-24 md:pb-12' : ''
          }`}
        >
          {children}
        </main>
      </div>

      {!hideNavigationChrome && !isLesson && <MobileTabBar />}

      {(isLanding || (!isLesson && !isOnboarding)) && <Footer />}
    </div>
  );
};
