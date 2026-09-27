'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { 
  ShieldCheck, 
  Zap, 
  Code2, 
  Search, 
  Sparkles, 
  Sliders, 
  Menu, 
  X,
  FileText,
  Lock
} from 'lucide-react';
import { TOOLS_CATALOG } from '@/lib/toolsCatalog';

interface HeaderProps {
  onOpenPricing?: () => void;
  onOpenApi?: () => void;
  onSelectTool?: (slug: string) => void;
}

export const Header: React.FC<HeaderProps> = ({ onOpenPricing, onOpenApi, onSelectTool }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  const filteredTools = searchQuery.trim() === '' 
    ? [] 
    : TOOLS_CATALOG.filter(t => 
        t.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.slug.includes(searchQuery.toLowerCase())
      );

  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-200 bg-white/90 backdrop-blur-md dark:border-slate-800 dark:bg-slate-900/90">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        
        {/* Logo & Privacy Badge */}
        <div className="flex items-center space-x-4">
          <Link href="/" className="flex items-center space-x-2 group">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white shadow-md shadow-blue-500/20 transition-transform group-hover:scale-105">
              <Sparkles className="h-5 w-5" />
            </div>
            <div className="flex flex-col">
              <span className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">
                Pixel<span className="text-blue-600 dark:text-blue-400">Forge</span>
              </span>
              <span className="text-[10px] font-medium text-slate-500 dark:text-slate-400">
                Privacy-First Image SaaS
              </span>
            </div>
          </Link>

          {/* Privacy Badge */}
          <div className="hidden md:flex items-center space-x-1.5 rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700 border border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-400 dark:border-emerald-800/60">
            <Lock className="h-3.5 w-3.5 text-emerald-600" />
            <span>100% Client-Side Private</span>
          </div>
        </div>

        {/* Global Search Bar */}
        <div className="relative flex-1 max-w-md mx-6 hidden sm:block">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search 20+ tools (e.g., CNIC combiner, compress 1MB, passport photo)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onFocus={() => setIsSearchOpen(true)}
              onBlur={() => setTimeout(() => setIsSearchOpen(false), 200)}
              className="w-full rounded-full border border-slate-200 bg-slate-50 py-2 pl-9 pr-4 text-xs text-slate-900 placeholder:text-slate-400 focus:border-blue-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:border-slate-700 dark:bg-slate-800 dark:text-white dark:placeholder:text-slate-500"
            />
          </div>

          {/* Search Dropdown */}
          {isSearchOpen && filteredTools.length > 0 && (
            <div className="absolute left-0 right-0 top-full mt-2 z-50 rounded-xl border border-slate-200 bg-white p-2 shadow-xl dark:border-slate-800 dark:bg-slate-900 max-h-80 overflow-y-auto">
              {filteredTools.map((tool) => (
                <button
                  key={tool.id}
                  onClick={() => {
                    if (onSelectTool) onSelectTool(tool.slug);
                    setSearchQuery('');
                  }}
                  className="flex w-full items-center space-x-3 rounded-lg p-2.5 text-left transition-colors hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                  <span className="text-xl">{tool.icon}</span>
                  <div className="flex-1 overflow-hidden">
                    <div className="text-xs font-semibold text-slate-900 dark:text-white">{tool.title}</div>
                    <div className="text-[11px] text-slate-500 dark:text-slate-400 truncate">{tool.description}</div>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Actions & Navigation */}
        <div className="flex items-center space-x-3">
          <button
            onClick={onOpenApi}
            className="hidden lg:flex items-center space-x-1.5 rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-100 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
          >
            <Code2 className="h-4 w-4 text-slate-500" />
            <span>Developer API</span>
          </button>

          <button
            onClick={onOpenPricing}
            className="flex items-center space-x-1.5 rounded-lg bg-gradient-to-r from-blue-600 to-indigo-600 px-3.5 py-1.5 text-xs font-semibold text-white shadow-sm hover:from-blue-700 hover:to-indigo-700"
          >
            <Zap className="h-4 w-4 fill-amber-300 text-amber-300" />
            <span>Upgrade to Pro</span>
          </button>
        </div>

      </div>
    </header>
  );
};
