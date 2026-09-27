'use client';

import React from 'react';
import Link from 'next/link';
import { ShieldCheck, Lock, Heart, CheckCircle2, Globe2 } from 'lucide-react';
import { TOOLS_CATALOG, CATEGORIES } from '@/lib/toolsCatalog';

interface FooterProps {
  onSelectTool?: (slug: string) => void;
}

export const Footer: React.FC<FooterProps> = ({ onSelectTool }) => {
  return (
    <footer className="border-t border-slate-200 bg-slate-900 text-slate-300 dark:border-slate-800">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8 lg:py-16">
        
        {/* Top privacy guarantee box */}
        <div className="mb-12 rounded-2xl bg-slate-800/80 p-6 border border-slate-700/60 shadow-lg">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-start space-x-4">
              <div className="rounded-full bg-emerald-500/10 p-3 text-emerald-400 border border-emerald-500/20">
                <Lock className="h-6 w-6" />
              </div>
              <div>
                <h4 className="text-base font-bold text-white flex items-center gap-2">
                  Zero Upload Privacy Guarantee
                  <span className="rounded-full bg-emerald-500/20 px-2 py-0.5 text-[10px] text-emerald-300 font-semibold border border-emerald-500/30">
                    Client Canvas & Wasm
                  </span>
                </h4>
                <p className="mt-1 text-xs text-slate-400 max-w-2xl">
                  Your CNICs, passport photos, documents, and private images are processed <strong>100% locally inside your web browser</strong>. No files leave your device or get uploaded to external cloud servers.
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3 text-xs text-slate-300">
              <div className="flex items-center gap-1.5"><CheckCircle2 className="h-4 w-4 text-emerald-400" /> Auto-Cleaned</div>
              <div className="flex items-center gap-1.5"><CheckCircle2 className="h-4 w-4 text-emerald-400" /> HTTPS Encrypted</div>
              <div className="flex items-center gap-1.5"><CheckCircle2 className="h-4 w-4 text-emerald-400" /> No AI Training</div>
            </div>
          </div>
        </div>

        {/* Categories & Tools Grid */}
        <div className="grid grid-cols-2 gap-8 md:grid-cols-4 lg:grid-cols-5">
          <div className="col-span-2">
            <div className="flex items-center space-x-2">
              <span className="text-xl font-bold tracking-tight text-white">PixelForge</span>
              <span className="rounded bg-blue-500/20 px-2 py-0.5 text-[10px] font-bold text-blue-400">SaaS</span>
            </div>
            <p className="mt-3 text-xs text-slate-400 leading-relaxed max-w-sm">
              All-in-one online image tools for everyday document and photo tasks. Compress, resize, crop, combine CNICs, generate passport photos, remove signatures, convert formats, and optimize images without installing software.
            </p>
            <div className="mt-4 flex items-center space-x-2 text-xs text-slate-400">
              <Globe2 className="h-4 w-4 text-blue-400" />
              <span>Optimized for Pakistan, India & Global Document Users</span>
            </div>
          </div>

          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-white">Popular Tools</h3>
            <ul className="mt-4 space-y-2 text-xs">
              {TOOLS_CATALOG.filter(t => t.isPopular).slice(0, 5).map(t => (
                <li key={t.id}>
                  <button 
                    onClick={() => onSelectTool && onSelectTool(t.slug)} 
                    className="hover:text-blue-400 transition-colors flex items-center gap-1.5"
                  >
                    <span>{t.icon}</span>
                    <span>{t.title}</span>
                  </button>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-white">Document Tools</h3>
            <ul className="mt-4 space-y-2 text-xs">
              {TOOLS_CATALOG.filter(t => t.category === 'documents').map(t => (
                <li key={t.id}>
                  <button 
                    onClick={() => onSelectTool && onSelectTool(t.slug)} 
                    className="hover:text-blue-400 transition-colors flex items-center gap-1.5"
                  >
                    <span>{t.icon}</span>
                    <span>{t.title}</span>
                  </button>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-white">Optimization</h3>
            <ul className="mt-4 space-y-2 text-xs">
              {TOOLS_CATALOG.filter(t => t.category === 'optimization').slice(0, 5).map(t => (
                <li key={t.id}>
                  <button 
                    onClick={() => onSelectTool && onSelectTool(t.slug)} 
                    className="hover:text-blue-400 transition-colors flex items-center gap-1.5"
                  >
                    <span>{t.icon}</span>
                    <span>{t.title}</span>
                  </button>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-12 border-t border-slate-800 pt-6 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500">
          <p>© {new Date().getFullYear()} PixelForge Utility SaaS. All rights reserved.</p>
          <div className="mt-2 sm:mt-0 flex items-center space-x-4">
            <span className="hover:text-slate-300">Privacy Policy</span>
            <span>•</span>
            <span className="hover:text-slate-300">Terms of Service</span>
            <span>•</span>
            <span className="hover:text-slate-300">API Documentation</span>
          </div>
        </div>

      </div>
    </footer>
  );
};
