'use client';

import React from 'react';
import { X, Check, Zap, Sparkles, Building, ShieldCheck } from 'lucide-react';

interface TierModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const TierModal: React.FC<TierModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 p-4 backdrop-blur-sm">
      <div className="relative w-full max-w-4xl overflow-hidden rounded-3xl border border-slate-200 bg-white p-6 shadow-2xl dark:border-slate-800 dark:bg-slate-900 sm:p-8">
        
        <button
          onClick={onClose}
          className="absolute right-4 top-4 rounded-full p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-800"
        >
          <X className="h-5 w-5" />
        </button>

        <div className="text-center">
          <div className="inline-flex items-center space-x-2 rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-600 dark:bg-blue-950/50 dark:text-blue-400">
            <Zap className="h-3.5 w-3.5 fill-amber-300 text-amber-400" />
            <span>Monetization & Plans</span>
          </div>
          <h2 className="mt-3 text-2xl font-black tracking-tight text-slate-900 dark:text-white sm:text-3xl">
            Choose Your Image SaaS Plan
          </h2>
          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
            Free forever for basic tasks. Upgrade for bulk batch processing, custom file size targets & API access.
          </p>
        </div>

        <div className="mt-8 grid grid-cols-1 gap-6 md:grid-cols-3">
          
          {/* Free Tier */}
          <div className="rounded-2xl border border-slate-200 bg-slate-50/50 p-6 dark:border-slate-800 dark:bg-slate-800/30 flex flex-col justify-between">
            <div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">Free Plan</h3>
              <p className="mt-1 text-xs text-slate-500">Everyday quick tools</p>
              <div className="mt-4 text-3xl font-extrabold text-slate-900 dark:text-white">$0</div>
              <ul className="mt-6 space-y-2.5 text-xs text-slate-600 dark:text-slate-300">
                <li className="flex items-center gap-2"><Check className="h-4 w-4 text-emerald-500" /> 5 images per day</li>
                <li className="flex items-center gap-2"><Check className="h-4 w-4 text-emerald-500" /> Max 10 MB per image</li>
                <li className="flex items-center gap-2"><Check className="h-4 w-4 text-emerald-500" /> Basic compression & crop</li>
                <li className="flex items-center gap-2"><Check className="h-4 w-4 text-emerald-500" /> CNIC / ID Card Combiner</li>
                <li className="flex items-center gap-2"><Check className="h-4 w-4 text-emerald-500" /> 100% Browser Local Security</li>
              </ul>
            </div>
            <button
              onClick={onClose}
              className="mt-6 w-full rounded-xl border border-slate-300 py-2.5 text-xs font-bold text-slate-700 hover:bg-slate-100 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
            >
              Current Plan
            </button>
          </div>

          {/* Pro Tier */}
          <div className="relative rounded-2xl border-2 border-blue-600 bg-white p-6 shadow-xl dark:bg-slate-800 flex flex-col justify-between scale-[1.02]">
            <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 rounded-full bg-gradient-to-r from-blue-600 to-indigo-600 px-3 py-0.5 text-[10px] font-bold text-white uppercase tracking-wider shadow">
              Most Popular
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                Pro Plan <Sparkles className="h-4 w-4 text-amber-400 fill-amber-400" />
              </h3>
              <p className="mt-1 text-xs text-slate-500">For power users & freelancers</p>
              <div className="mt-4 flex items-baseline text-slate-900 dark:text-white">
                <span className="text-3xl font-extrabold">$9</span>
                <span className="text-xs text-slate-500 ml-1">/month</span>
              </div>
              <ul className="mt-6 space-y-2.5 text-xs text-slate-600 dark:text-slate-300">
                <li className="flex items-center gap-2"><Check className="h-4 w-4 text-blue-600 font-bold" /> 500 images per month</li>
                <li className="flex items-center gap-2"><Check className="h-4 w-4 text-blue-600 font-bold" /> Batch process up to 100 images</li>
                <li className="flex items-center gap-2"><Check className="h-4 w-4 text-blue-600 font-bold" /> Exact Target File Size (e.g. &lt;1MB)</li>
                <li className="flex items-center gap-2"><Check className="h-4 w-4 text-blue-600 font-bold" /> WebP & AVIF high performance</li>
                <li className="flex items-center gap-2"><Check className="h-4 w-4 text-blue-600 font-bold" /> Tiled Confidential Watermarks</li>
                <li className="flex items-center gap-2"><Check className="h-4 w-4 text-blue-600 font-bold" /> Priority local & Wasm speed</li>
              </ul>
            </div>
            <button
              onClick={() => {
                alert('Pro Plan activated! Unlimited batch & target file size unlocked.');
                onClose();
              }}
              className="mt-6 w-full rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 py-2.5 text-xs font-bold text-white shadow-lg shadow-blue-500/20 hover:from-blue-700 hover:to-indigo-700"
            >
              Start 7-Day Free Trial
            </button>
          </div>

          {/* Business Tier */}
          <div className="rounded-2xl border border-slate-200 bg-slate-50/50 p-6 dark:border-slate-800 dark:bg-slate-800/30 flex flex-col justify-between">
            <div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                Business & API <Building className="h-4 w-4 text-purple-500" />
              </h3>
              <p className="mt-1 text-xs text-slate-500">For teams & platforms</p>
              <div className="mt-4 flex items-baseline text-slate-900 dark:text-white">
                <span className="text-3xl font-extrabold">$29</span>
                <span className="text-xs text-slate-500 ml-1">/month</span>
              </div>
              <ul className="mt-6 space-y-2.5 text-xs text-slate-600 dark:text-slate-300">
                <li className="flex items-center gap-2"><Check className="h-4 w-4 text-emerald-500" /> 10,000 images per month</li>
                <li className="flex items-center gap-2"><Check className="h-4 w-4 text-emerald-500" /> Developer REST API Access</li>
                <li className="flex items-center gap-2"><Check className="h-4 w-4 text-emerald-500" /> Batch 1,000+ files per ZIP</li>
                <li className="flex items-center gap-2"><Check className="h-4 w-4 text-emerald-500" /> Custom branding & watermarks</li>
                <li className="flex items-center gap-2"><Check className="h-4 w-4 text-emerald-500" /> SLA & Dedicated Support</li>
              </ul>
            </div>
            <button
              onClick={() => {
                alert('Business API plan selected.');
                onClose();
              }}
              className="mt-6 w-full rounded-xl border border-slate-300 py-2.5 text-xs font-bold text-slate-700 hover:bg-slate-100 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
            >
              Contact Sales / Get API
            </button>
          </div>

        </div>
      </div>
    </div>
  );
};
