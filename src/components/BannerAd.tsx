import React from 'react';
import { ExternalLink, Info } from 'lucide-react';

export default function BannerAd() {
  return (
    <div className="my-6 p-4 bg-gradient-to-r from-indigo-50 to-blue-50 dark:from-indigo-900/20 dark:to-blue-900/20 rounded-2xl border border-indigo-100 dark:border-indigo-800/50 relative overflow-hidden group">
      <div className="flex items-center justify-between relative z-10">
        <div className="flex items-center gap-3">
          <div className="bg-white dark:bg-slate-800 px-2 py-0.5 rounded text-[10px] font-bold text-slate-400 border border-slate-100 dark:border-slate-700">AD</div>
          <div>
            <p className="text-sm font-bold text-slate-900 dark:text-white">Upgrade to Real Society Pro</p>
            <p className="text-xs text-slate-500 dark:text-slate-400">Get unlimited AI, 10GB storage, and an ad-free experience.</p>
          </div>
        </div>
        <button className="flex items-center gap-1.5 px-4 py-2 bg-indigo-600 text-white text-xs font-bold rounded-xl hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-200 dark:shadow-none">
          Learn More
          <ExternalLink size={14} />
        </button>
      </div>
      <div className="absolute -right-4 -bottom-4 w-24 h-24 bg-indigo-500/10 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-700"></div>
    </div>
  );
}
