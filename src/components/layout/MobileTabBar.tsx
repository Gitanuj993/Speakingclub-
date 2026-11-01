/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  GraduationCap,
  Briefcase,
  BarChart3,
  UserCheck,
} from 'lucide-react';

export const MobileTabBar: React.FC = () => {
  const tabs = [
    { to: '/dashboard', label: 'Home', icon: <LayoutDashboard className="w-5 h-5" /> },
    { to: '/learn', label: 'Learn', icon: <GraduationCap className="w-5 h-5" /> },
    { to: '/practice/interview', label: 'Interview', icon: <Briefcase className="w-5 h-5" /> },
    { to: '/progress', label: 'Stats', icon: <BarChart3 className="w-5 h-5" /> },
    { to: '/profile', label: 'Profile', icon: <UserCheck className="w-5 h-5" /> },
  ];

  return (
    <nav
      aria-label="Mobile Navigation"
      className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 dark:bg-slate-950/95 backdrop-blur-md border-t border-slate-200/80 dark:border-slate-800/80 px-2 py-1.5"
    >
      <div className="flex items-center justify-around">
        {tabs.map((tab) => (
          <NavLink
            key={tab.to}
            to={tab.to}
            className={({ isActive }) =>
              `flex flex-col items-center justify-center py-1 px-2.5 rounded-lg text-[10px] font-medium transition-colors min-h-[44px] min-w-[52px] ${
                isActive
                  ? 'text-indigo-600 dark:text-indigo-400 font-bold'
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
              }`
            }
          >
            {tab.icon}
            <span className="mt-1">{tab.label}</span>
          </NavLink>
        ))}
      </div>
    </nav>
  );
};
