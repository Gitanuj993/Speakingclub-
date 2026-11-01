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
  ShieldCheck,
} from 'lucide-react';

export const Sidebar: React.FC = () => {
  const navItems = [
    {
      to: '/dashboard',
      label: 'Sadhana Dashboard',
      icon: <LayoutDashboard className="w-5 h-5 shrink-0" />,
    },
    {
      to: '/learn',
      label: 'Learning & Drills',
      icon: <GraduationCap className="w-5 h-5 shrink-0" />,
    },
    {
      to: '/practice/interview',
      label: 'Interview Practice',
      icon: <Briefcase className="w-5 h-5 shrink-0" />,
    },
    {
      to: '/progress',
      label: 'Progress & Insights',
      icon: <BarChart3 className="w-5 h-5 shrink-0" />,
    },
    {
      to: '/profile',
      label: 'Profile & Settings',
      icon: <UserCheck className="w-5 h-5 shrink-0" />,
    },
  ];

  return (
    <aside className="hidden md:flex flex-col w-64 shrink-0 border-r border-[#E8D5B5] dark:border-[#3D352F] bg-[#FFF9EF]/60 dark:bg-[#201B18]/70 backdrop-blur-sm p-4 min-h-[calc(100vh-4rem)]">
      <div className="space-y-1.5 flex-1">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all ${
                isActive
                  ? 'bg-[#FFF0DF] dark:bg-[#C66A18]/15 text-[#C66A18] dark:text-[#E68A24] font-bold border border-[#E68A24]/30 shadow-xs'
                  : 'text-[#6B5E55] dark:text-[#B8A89A] hover:text-[#201B18] dark:hover:text-[#FFF9EF] hover:bg-[#F5EBDD]/70 dark:hover:bg-[#2A2420]'
              }`
            }
          >
            {item.icon}
            <span>{item.label}</span>
          </NavLink>
        ))}
      </div>

      {/* Sacred Sanctum Privacy Badge */}
      <div className="p-3.5 rounded-xl bg-[#F5EBDD]/90 dark:bg-[#2A2420] border border-[#E8D5B5] dark:border-[#3D352F] mt-4 shadow-xs">
        <div className="flex items-center gap-2 text-[#C66A18] dark:text-[#D4AF65] font-semibold text-xs">
          <ShieldCheck className="w-4 h-4 text-[#C66A18] dark:text-[#D4AF65]" />
          <span>पावनता • Sacred Privacy</span>
        </div>
        <p className="text-[11px] text-[#6B5E55] dark:text-[#B8A89A] mt-1.5 leading-relaxed">
          Zero remote servers. Your voice and recordings remain solely on your device.
        </p>
      </div>
    </aside>
  );
};
