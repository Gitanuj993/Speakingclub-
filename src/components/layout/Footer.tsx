/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Link } from 'react-router-dom';
import { Shield, Sparkles, Heart } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="border-t border-slate-200/80 dark:border-slate-800/80 bg-white/40 dark:bg-slate-950/40 py-10 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex flex-col items-center md:items-start text-center md:text-left">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-lg bg-indigo-600 flex items-center justify-center text-white text-xs font-bold">
                <Sparkles className="w-3.5 h-3.5" />
              </div>
              <span className="font-extrabold text-sm text-slate-900 dark:text-slate-100">
                SpeakLab
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-sm">
              Speak clearly. Think confidently. Interview better. Designed for
              college engineers and job seekers.
            </p>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-6 text-xs text-slate-600 dark:text-slate-400">
            <Link to="/learn" className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">
              Articulation Drills
            </Link>
            <Link to="/learn/alphabet" className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">
              Alphabet Path
            </Link>
            <Link to="/practice/interview" className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">
              Interview Questions
            </Link>
            <Link to="/profile" className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">
              Privacy & Settings
            </Link>
          </div>

          <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400">
            <Shield className="w-3.5 h-3.5 text-emerald-500" />
            <span>100% Client-Side Private</span>
          </div>
        </div>

        <div className="border-t border-slate-200/60 dark:border-slate-850 mt-6 pt-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-[11px] text-slate-400">
          <p>© {new Date().getFullYear()} SpeakLab. Open client-side educational practice.</p>
          <p className="flex items-center gap-1">
            Built for structured speaking mastery <Heart className="w-3 h-3 text-rose-500 fill-rose-500 inline" />
          </p>
        </div>
      </div>
    </footer>
  );
};
