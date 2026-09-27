'use client';

import React, { useState } from 'react';
import { Dropzone } from '../common/Dropzone';
import { ResizeOptions } from '@/types';
import { resizeImage, formatBytes } from '@/lib/imageUtils';
import { Scaling, Download, Sparkles, RefreshCw } from 'lucide-react';

export const ImageResizerTool: React.FC = () => {
  const [file, setFile] = useState<File | null>(null);
  const [options, setOptions] = useState<ResizeOptions>({
    mode: 'dimensions',
    width: 1920,
    height: 1080,
    lockAspectRatio: true,
    percentage: 50,
    targetSizeKb: 500
  });

  const [isProcessing, setIsProcessing] = useState(false);
  const [result, setResult] = useState<{ url: string; size: number; width: number; height: number } | null>(null);

  const processResize = async () => {
    if (!file) return;
    setIsProcessing(true);
    try {
      const res = await resizeImage(file, options);
      setResult(res);
    } catch (err) {
      console.error('Resize error:', err);
      alert('Error resizing image.');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="space-y-8">
      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <h1 className="text-2xl font-black text-slate-900 dark:text-white flex items-center gap-2">
          <Scaling className="h-6 w-6 text-blue-600" />
          Image Resizer (Pixels, Percentage, File Size)
        </h1>
        <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
          Resize photo dimensions by exact width/height, percentage scaling (50%, 75%), or target file size.
        </p>
      </div>

      {!file ? (
        <Dropzone onFilesAdded={(files) => setFile(files[0])} multiple={false} label="Upload Image to Resize" />
      ) : (
        <div className="rounded-3xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900 space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">Resize Options</h3>
            <button onClick={() => { setFile(null); setResult(null); }} className="text-xs font-semibold text-red-500">Change Image</button>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Resize Mode</label>
              <select
                value={options.mode}
                onChange={(e) => setOptions({ ...options, mode: e.target.value as any })}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2 px-3 text-xs font-semibold text-slate-900 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
              >
                <option value="dimensions">By Dimensions (Px)</option>
                <option value="percentage">By Percentage (%)</option>
              </select>
            </div>

            {options.mode === 'dimensions' ? (
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Target Width (Px)</label>
                <input
                  type="number"
                  value={options.width}
                  onChange={(e) => setOptions({ ...options, width: Number(e.target.value) })}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2 px-3 text-xs font-semibold text-slate-900 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                />
              </div>
            ) : (
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Scale ({options.percentage}%)</label>
                <input
                  type="range"
                  min={10}
                  max={200}
                  value={options.percentage}
                  onChange={(e) => setOptions({ ...options, percentage: Number(e.target.value) })}
                  className="w-full"
                />
              </div>
            )}
          </div>

          <button
            disabled={isProcessing}
            onClick={processResize}
            className="w-full rounded-2xl bg-blue-600 py-3 text-sm font-bold text-white shadow-lg hover:bg-blue-700 flex items-center justify-center gap-2"
          >
            {isProcessing ? <RefreshCw className="h-5 w-5 animate-spin" /> : <Sparkles className="h-5 w-5" />}
            <span>Resize Image</span>
          </button>
        </div>
      )}

      {result && (
        <div className="rounded-3xl border border-emerald-200 bg-emerald-50/40 p-6 dark:border-emerald-800/60 dark:bg-emerald-950/20">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">Resized Result</h3>
              <p className="text-xs text-slate-500">{result.width} × {result.height} px • {formatBytes(result.size)}</p>
            </div>
            <a
              href={result.url}
              download="Resized_Image.jpg"
              className="flex items-center gap-2 rounded-xl bg-emerald-600 px-5 py-2.5 text-xs font-bold text-white shadow hover:bg-emerald-700"
            >
              <Download className="h-4 w-4" /> Download Resized Image
            </a>
          </div>
          <div className="overflow-hidden rounded-2xl bg-white p-3 shadow-inner dark:bg-slate-900 flex justify-center">
            <img src={result.url} alt="Resized result" className="max-h-96 object-contain" />
          </div>
        </div>
      )}
    </div>
  );
};
