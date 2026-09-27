'use client';

import React, { useState } from 'react';
import { Dropzone } from '../common/Dropzone';
import { PassportPhotoOptions } from '@/types';
import { passportPhotoMaker, formatBytes } from '@/lib/imageUtils';
import { ShieldAlert, Download, Sparkles, RefreshCw, UserCheck } from 'lucide-react';

export const PassportPhotoTool: React.FC = () => {
  const [file, setFile] = useState<File | null>(null);
  const [options, setOptions] = useState<PassportPhotoOptions>({
    country: 'Pakistan',
    bgColor: '#ffffff',
    paperSize: '4x6_grid',
    border: true
  });

  const [isProcessing, setIsProcessing] = useState(false);
  const [result, setResult] = useState<{ url: string; size: number } | null>(null);

  const processPassport = async () => {
    if (!file) return;
    setIsProcessing(true);
    try {
      const res = await passportPhotoMaker(file, options);
      setResult(res);
    } catch (err) {
      console.error('Passport photo error:', err);
      alert('Error creating passport photo.');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="space-y-8">
      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <h1 className="text-2xl font-black text-slate-900 dark:text-white flex items-center gap-2">
          <UserCheck className="h-6 w-6 text-blue-600" />
          Passport & Visa Photo Maker
        </h1>
        <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
          Generate official passport photo dimension presets for Pakistan, USA, UK, Canada, Australia, Schengen, UAE & Saudi Arabia.
        </p>

        <div className="mt-4 flex items-center gap-2 rounded-xl bg-amber-50 p-3 text-xs text-amber-800 border border-amber-200 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-800/60">
          <ShieldAlert className="h-4 w-4 shrink-0" />
          <span>Note: Standard dimension presets provided for reference. Check specific official embassy guidelines before submission.</span>
        </div>
      </div>

      {!file ? (
        <Dropzone onFilesAdded={(files) => setFile(files[0])} multiple={false} label="Upload Portrait Photo" />
      ) : (
        <div className="rounded-3xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900 space-y-6">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Country Preset</label>
              <select
                value={options.country}
                onChange={(e) => setOptions({ ...options, country: e.target.value as any })}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2 px-3 text-xs font-semibold text-slate-900 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
              >
                <option value="Pakistan">Pakistan (35 × 45 mm)</option>
                <option value="USA">USA (2 × 2 inches)</option>
                <option value="UK">UK (35 × 45 mm)</option>
                <option value="Canada">Canada (50 × 70 mm)</option>
                <option value="Schengen">Schengen Visa (35 × 45 mm)</option>
                <option value="UAE">UAE (35 × 45 mm)</option>
                <option value="Saudi Arabia">Saudi Arabia (40 × 60 mm)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Background Color</label>
              <select
                value={options.bgColor}
                onChange={(e) => setOptions({ ...options, bgColor: e.target.value })}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2 px-3 text-xs font-semibold text-slate-900 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
              >
                <option value="#ffffff">Plain White</option>
                <option value="#e0f2fe">Light Blue</option>
                <option value="#f1f5f9">Light Grey</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Print Layout</label>
              <select
                value={options.paperSize}
                onChange={(e) => setOptions({ ...options, paperSize: e.target.value as any })}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2 px-3 text-xs font-semibold text-slate-900 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
              >
                <option value="4x6_grid">4×6 Inch Print Sheet (8 Photos Grid)</option>
                <option value="single">Single Photo Only</option>
              </select>
            </div>
          </div>

          <div className="rounded-xl border border-blue-100 bg-blue-50/50 p-3 dark:border-blue-900/40 dark:bg-blue-950/20">
            <label className="flex items-center gap-2 text-xs font-semibold text-slate-800 dark:text-slate-200 cursor-pointer">
              <input
                type="checkbox"
                checked={options.removeBgFirst || false}
                onChange={(e) => setOptions({ ...options, removeBgFirst: e.target.checked })}
                className="rounded accent-blue-600"
              />
              <span>Smart Background Cutout: Strip original room/outdoor background and replace with chosen color</span>
            </label>
          </div>

          <button
            disabled={isProcessing}
            onClick={processPassport}
            className="w-full rounded-2xl bg-blue-600 py-3 text-sm font-bold text-white shadow-lg hover:bg-blue-700 flex items-center justify-center gap-2"
          >
            {isProcessing ? <RefreshCw className="h-5 w-5 animate-spin" /> : <Sparkles className="h-5 w-5" />}
            <span>Generate Passport Photos</span>
          </button>
        </div>
      )}

      {result && (
        <div className="rounded-3xl border border-emerald-200 bg-emerald-50/40 p-6 dark:border-emerald-800/60 dark:bg-emerald-950/20">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">Passport Photo Sheet Ready</h3>
              <p className="text-xs text-slate-500">{formatBytes(result.size)}</p>
            </div>
            <a
              href={result.url}
              download="Passport_Photo_Sheet.jpg"
              className="flex items-center gap-2 rounded-xl bg-emerald-600 px-5 py-2.5 text-xs font-bold text-white shadow hover:bg-emerald-700"
            >
              <Download className="h-4 w-4" /> Download Photo Sheet
            </a>
          </div>
          <div className="overflow-hidden rounded-2xl bg-white p-3 shadow-inner dark:bg-slate-900 flex justify-center">
            <img src={result.url} alt="Passport result" className="max-h-96 object-contain" />
          </div>
        </div>
      )}
    </div>
  );
};
