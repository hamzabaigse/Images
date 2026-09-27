'use client';

import React, { useState } from 'react';
import { Dropzone } from '../common/Dropzone';
import { CombinerOptions } from '@/types';
import { combineImages, formatBytes } from '@/lib/imageUtils';
import { LayoutGrid, Download, RefreshCw, Sparkles, Layers } from 'lucide-react';

export const ImageCombinerTool: React.FC = () => {
  const [files, setFiles] = useState<File[]>([]);
  const [options, setOptions] = useState<CombinerOptions>({
    layout: 'grid',
    gridColumns: 2,
    spacing: 16,
    padding: 20,
    backgroundColor: '#ffffff',
    borderColor: '#e2e8f0',
    borderWidth: 2,
    borderRadius: 12,
    alignment: 'center',
    imageFit: 'cover',
    outputFormat: 'image/jpeg',
    quality: 0.90
  });

  const [isProcessing, setIsProcessing] = useState(false);
  const [result, setResult] = useState<{ url: string; size: number; width: number; height: number } | null>(null);

  const handleFilesAdded = (newFiles: File[]) => {
    setFiles((prev) => [...prev, ...newFiles].slice(0, 20));
  };

  const processCombine = async () => {
    if (files.length === 0) return;
    setIsProcessing(true);
    try {
      const res = await combineImages(files, options);
      setResult(res);
    } catch (err) {
      console.error('Combiner error:', err);
      alert('Error combining images.');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="space-y-8">
      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <h1 className="text-2xl font-black text-slate-900 dark:text-white flex items-center gap-2">
          <LayoutGrid className="h-6 w-6 text-blue-600" />
          Image Combiner & Grid Merger (1–20 Images)
        </h1>
        <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
          Merge photos side by side, stacked vertically, or in custom grid columns with spacing & border controls.
        </p>
      </div>

      <Dropzone
        onFilesAdded={handleFilesAdded}
        multiple={true}
        maxFiles={20}
        label="Upload 1–20 Images to Combine"
      />

      {files.length > 0 && (
        <div className="rounded-3xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900 space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Layers className="h-4 w-4 text-blue-600" />
              Uploaded Images ({files.length})
            </h3>
            <button onClick={() => setFiles([])} className="text-xs font-semibold text-red-500">Clear</button>
          </div>

          {/* Controls */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Layout Mode</label>
              <select
                value={options.layout}
                onChange={(e) => setOptions({ ...options, layout: e.target.value as any })}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2 px-3 text-xs font-semibold text-slate-900 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
              >
                <option value="vertical">Vertical Stack</option>
                <option value="horizontal">Horizontal Side-by-Side</option>
                <option value="grid">Grid Matrix</option>
              </select>
            </div>

            {options.layout === 'grid' && (
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Grid Columns ({options.gridColumns})</label>
                <input
                  type="range"
                  min={1}
                  max={6}
                  value={options.gridColumns}
                  onChange={(e) => setOptions({ ...options, gridColumns: Number(e.target.value) })}
                  className="w-full"
                />
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Image Fit</label>
              <select
                value={options.imageFit}
                onChange={(e) => setOptions({ ...options, imageFit: e.target.value as any })}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2 px-3 text-xs font-semibold text-slate-900 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
              >
                <option value="cover">Cover (Uniform Tiles)</option>
                <option value="contain">Contain (Original Ratios)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Background Color</label>
              <input
                type="color"
                value={options.backgroundColor}
                onChange={(e) => setOptions({ ...options, backgroundColor: e.target.value })}
                className="h-9 w-full rounded-xl border border-slate-200 p-1 dark:border-slate-700"
              />
            </div>
          </div>

          <button
            disabled={isProcessing}
            onClick={processCombine}
            className="w-full rounded-2xl bg-blue-600 py-3 text-sm font-bold text-white shadow-lg hover:bg-blue-700 flex items-center justify-center gap-2"
          >
            {isProcessing ? <RefreshCw className="h-5 w-5 animate-spin" /> : <Sparkles className="h-5 w-5" />}
            <span>Combine {files.length} Images</span>
          </button>
        </div>
      )}

      {result && (
        <div className="rounded-3xl border border-emerald-200 bg-emerald-50/40 p-6 dark:border-emerald-800/60 dark:bg-emerald-950/20">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">Combined Result</h3>
              <p className="text-xs text-slate-500">{result.width} × {result.height} px • {formatBytes(result.size)}</p>
            </div>
            <a
              href={result.url}
              download="Combined_Images.jpg"
              className="flex items-center gap-2 rounded-xl bg-emerald-600 px-5 py-2.5 text-xs font-bold text-white shadow hover:bg-emerald-700"
            >
              <Download className="h-4 w-4" /> Download Result
            </a>
          </div>
          <div className="overflow-hidden rounded-2xl bg-white p-3 shadow-inner dark:bg-slate-900 flex justify-center">
            <img src={result.url} alt="Combined result" className="max-h-96 object-contain" />
          </div>
        </div>
      )}
    </div>
  );
};
