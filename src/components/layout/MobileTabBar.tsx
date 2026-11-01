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
    { to: '/dashboard', label: 'Sadhana', icon: <LayoutDashboard className="w-5 h-5" /> },
    { to: '/learn', label: 'Learn', icon: <GraduationCap className="w-5 h-5" /> },
    { to: '/practice/interview', label: 'Interview', icon: <Briefcase className="w-5 h-5" /> },
    { to: '/progress', label: 'Progress', icon: <BarChart3 className="w-5 h-5" /> },
    { to: '/profile', label: 'Settings', icon: <UserCheck className="w-5 h-5" /> },
  ];

  return (
    <nav
      aria-label="Mobile Navigation"
      className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-[#FFF9EF]/95 dark:bg-[#201B18]/95 backdrop-blur-md border-t border-[#E8D5B5] dark:border-[#3D352F] px-2 py-1.5 shadow-lg"
    >
      <div className="flex items-center justify-around">
        {tabs.map((tab) => (
          <NavLink
            key={tab.to}
            to={tab.to}
            className={({ isActive }) =>
              `flex flex-col items-center justify-center py-1 px-2.5 rounded-lg text-[10px] font-medium transition-colors min-h-[44px] min-w-[52px] ${
                isActive
                  ? 'text-[#C66A18] dark:text-[#E68A24] font-bold'
                  : 'text-[#6B5E55] dark:text-[#B8A89A] hover:text-[#201B18] dark:hover:text-[#FFF9EF]'
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
