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
  Sparkles,
} from 'lucide-react';

export const Sidebar: React.FC = () => {
  const navItems = [
    {
      to: '/dashboard',
      label: 'Dashboard',
      icon: <LayoutDashboard className="w-5 h-5 shrink-0" />,
    },
    {
      to: '/learn',
      label: 'Learn & Drills',
      icon: <GraduationCap className="w-5 h-5 shrink-0" />,
    },
    {
      to: '/practice/interview',
      label: 'Interview Practice',
      icon: <Briefcase className="w-5 h-5 shrink-0" />,
    },
    {
      to: '/progress',
      label: 'Progress & Stats',
      icon: <BarChart3 className="w-5 h-5 shrink-0" />,
    },
    {
      to: '/profile',
      label: 'Profile & Settings',
      icon: <UserCheck className="w-5 h-5 shrink-0" />,
    },
  ];

  return (
    <aside className="hidden md:flex flex-col w-64 shrink-0 border-r border-slate-200/80 dark:border-slate-800/80 bg-white/50 dark:bg-slate-900/50 backdrop-blur-sm p-4 min-h-[calc(100vh-4rem)]">
      <div className="space-y-1.5 flex-1">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all ${
                isActive
                  ? 'bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 font-semibold shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-100/70 dark:hover:bg-slate-800/60'
              }`
            }
          >
            {item.icon}
            <span>{item.label}</span>
          </NavLink>
        ))}
      </div>

      {/* Client-side guarantee badge */}
      <div className="p-3 rounded-xl bg-slate-100/80 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/50 mt-4">
        <div className="flex items-center gap-2 text-indigo-600 dark:text-indigo-400 font-medium text-xs">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Local & Private</span>
        </div>
        <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
          Zero cloud servers. Your audio & recordings stay strictly on your device.
        </p>
      </div>
    </aside>
  );
};
