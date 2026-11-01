/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '../components/common/Button';
import { ArrowLeft, Home, Sparkles } from 'lucide-react';

export const NotFoundPage: React.FC = () => {
  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center text-center p-6 max-w-md mx-auto">
      <div className="w-16 h-16 rounded-3xl bg-gradient-to-br from-[#E68A24] to-[#C66A18] text-white flex items-center justify-center font-serif font-extrabold text-2xl mb-6 shadow-md border border-[#D4AF65]">
        ४०४
      </div>
      <h1 className="text-2xl font-serif font-bold text-[#201B18] dark:text-[#FFF9EF]">
        पृष्ठम् न लब्धम् • Page Not Found
      </h1>
      <p className="text-xs text-[#722F37]/80 dark:text-[#E8D5B5]/80 mt-2 leading-relaxed">
        The practice drill, category, or route you are looking for does not exist or has been relocated within the learning sanctum.
      </p>

      <div className="flex items-center gap-3 mt-6">
        <Link to="/dashboard">
          <Button size="md" variant="primary" icon={<Home className="w-4 h-4" />}>
            Back to Dashboard
          </Button>
        </Link>
        <Link to="/learn">
          <Button size="md" variant="outline" icon={<ArrowLeft className="w-4 h-4" />}>
            Learning Hub
          </Button>
        </Link>
      </div>
    </div>
  );
};
