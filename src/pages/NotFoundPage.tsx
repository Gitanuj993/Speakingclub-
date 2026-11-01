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
      <div className="w-16 h-16 rounded-3xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-extrabold text-2xl font-mono mb-6 shadow-sm">
        404
      </div>
      <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white">
        Page Not Found
      </h1>
      <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 leading-relaxed">
        The practice drill, category, or route you are looking for does not exist or has been relocated.
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
