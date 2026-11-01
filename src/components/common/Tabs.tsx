/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { ReactNode } from 'react';

export interface TabItem {
  id: string;
  label: string;
  icon?: ReactNode;
  count?: number;
}

export interface TabsProps {
  tabs: TabItem[];
  activeTab: string;
  onChange: (id: string) => void;
  className?: string;
}

export const Tabs: React.FC<TabsProps> = ({
  tabs,
  activeTab,
  onChange,
  className = '',
}) => {
  return (
    <div
      role="tablist"
      className={`flex items-center gap-1.5 p-1.5 bg-[#F5EBDD]/90 dark:bg-[#2A2420] border border-[#E8D5B5] dark:border-[#3D352F] rounded-xl overflow-x-auto no-scrollbar ${className}`}
    >
      {tabs.map((tab) => {
        const isActive = activeTab === tab.id;
        return (
          <button
            key={tab.id}
            role="tab"
            aria-selected={isActive}
            aria-controls={`tabpanel-${tab.id}`}
            onClick={() => onChange(tab.id)}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-medium transition-all duration-200 whitespace-nowrap min-h-[38px] ${
              isActive
                ? 'bg-[#FFF9EF] dark:bg-[#201B18] text-[#C66A18] dark:text-[#D4AF65] border border-[#D4AF65]/40 shadow-xs font-bold'
                : 'text-[#6B5E55] dark:text-[#B8A89A] hover:text-[#201B18] dark:hover:text-[#FFF9EF]'
            }`}
          >
            {tab.icon && <span className="shrink-0">{tab.icon}</span>}
            <span>{tab.label}</span>
            {tab.count !== undefined && (
              <span
                className={`text-[10px] px-1.5 py-0.5 rounded-full font-mono ${
                  isActive
                    ? 'bg-[#FFF0DF] text-[#C66A18] dark:bg-[#C66A18]/25 dark:text-[#E68A24]'
                    : 'bg-[#E8D5B5]/60 dark:bg-[#342D28] text-[#6B5E55] dark:text-[#B8A89A]'
                }`}
              >
                {tab.count}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
};
