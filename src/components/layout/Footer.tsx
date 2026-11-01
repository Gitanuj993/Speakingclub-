/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Link } from 'react-router-dom';
import { ShieldCheck, Heart } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="border-t border-[#E8D5B5] dark:border-[#3D352F] bg-[#F5EBDD]/50 dark:bg-[#201B18]/60 py-10 mt-auto transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex flex-col items-center md:items-start text-center md:text-left">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-[#E68A24] to-[#C66A18] flex items-center justify-center text-white text-xs font-serif font-bold shadow-xs">
                ॐ
              </div>
              <span className="font-extrabold text-base text-[#201B18] dark:text-[#FFF9EF] font-serif">
                SpeakingClub
              </span>
              <span className="text-[11px] text-[#C66A18] dark:text-[#D4AF65] font-serif ml-1">
                वाक् साधना
              </span>
            </div>
            <p className="text-xs text-[#6B5E55] dark:text-[#B8A89A] mt-1 max-w-sm leading-relaxed">
              Speak clearly. Think confidently. Interview better. Inspired by ancient wisdom,
              poise, and contemporary technical precision.
            </p>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-6 text-xs text-[#6B5E55] dark:text-[#B8A89A]">
            <Link to="/learn" className="hover:text-[#C66A18] dark:hover:text-[#D4AF65] transition-colors">
              Articulation Drills
            </Link>
            <Link to="/learn/alphabet" className="hover:text-[#C66A18] dark:hover:text-[#D4AF65] transition-colors">
              Alphabet Path
            </Link>
            <Link to="/practice/interview" className="hover:text-[#C66A18] dark:hover:text-[#D4AF65] transition-colors">
              Interview Questions
            </Link>
            <Link to="/profile" className="hover:text-[#C66A18] dark:hover:text-[#D4AF65] transition-colors">
              Privacy & Settings
            </Link>
          </div>

          <div className="flex items-center gap-1.5 text-xs text-[#77764B] dark:text-[#D4AF65] bg-[#FFF9EF] dark:bg-[#2A2420] px-3 py-1.5 rounded-full border border-[#D4AF65]/35 shadow-xs">
            <ShieldCheck className="w-3.5 h-3.5 text-[#C66A18] dark:text-[#E68A24]" />
            <span>100% Local & Client-Side Sanctum</span>
          </div>
        </div>

        {/* Sanskrit shloka inscription line */}
        <div className="text-center my-6 py-3 border-y border-[#E8D5B5]/60 dark:border-[#3D352F]">
          <p className="text-xs font-serif tracking-widest text-[#C66A18] dark:text-[#D4AF65]">
            " सत्यं ब्रूयात् प्रियं ब्रूयात् न ब्रूयात् सत्यमप्रियम् "
          </p>
          <p className="text-[10px] text-[#6B5E55] dark:text-[#B8A89A] mt-0.5">
            Speak the truth with grace, clarity, and kindness.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 text-[11px] text-[#6B5E55] dark:text-[#B8A89A]">
          <p>© {new Date().getFullYear()} SpeakingClub. Dedicated to authentic voice mastery.</p>
          <p className="flex items-center gap-1">
            Built with sacred attention to clarity & truth <Heart className="w-3 h-3 text-[#C64B32] fill-[#C64B32] inline" />
          </p>
        </div>
      </div>
    </footer>
  );
};
