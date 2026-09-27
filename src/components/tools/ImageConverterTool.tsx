'use client';

import React, { useState } from 'react';
import { Dropzone } from '../common/Dropzone';
import { ConverterOptions } from '@/types';
import { convertImageFormat, formatBytes } from '@/lib/imageUtils';
import { RefreshCw, Download, Sparkles, FileOutput } from 'lucide-react';

export const ImageConverterTool: React.FC = () => {
  const [files, setFiles] = useState<File[]>([]);
  const [options, setOptions] = useState<ConverterOptions>({
    targetFormat: 'image/webp',
    quality: 0.90,
    backgroundColor: '#ffffff'
  });

  const [isProcessing, setIsProcessing] = useState(false);
  const [results, setResults] = useState<{ name: string; url: string; size: number }[]>([]);

  const handleUpload = (newFiles: File[]) => {
    setFiles(newFiles);
    setResults([]);
  };

  const processConvert = async () => {
    if (files.length === 0) return;
    setIsProcessing(true);
    const list: { name: string; url: string; size: number }[] = [];
    try {
      for (const file of files) {
        const res = await convertImageFormat(file, options);
        const ext = options.targetFormat.split('/')[1];
        list.push({
          name: `${file.name.substring(0, file.name.lastIndexOf('.'))}.${ext}`,
          url: res.url,
          size: res.size
        });
      }
      setResults(list);
    } catch (err) {
      console.error('Convert error:', err);
      alert('Error converting files.');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="space-y-8">
      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <h1 className="text-2xl font-black text-slate-900 dark:text-white flex items-center gap-2">
          <FileOutput className="h-6 w-6 text-blue-600" />
          Image Format Converter (JPG ↔ PNG ↔ WebP ↔ AVIF)
        </h1>
        <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
          Convert images between JPG, PNG, WebP, GIF, BMP, HEIC & AVIF formats with custom background fill for transparent images.
        </p>
      </div>

      <Dropzone onFilesAdded={handleUpload} multiple={true} label="Upload Files to Convert" />

      {files.length > 0 && (
        <div className="rounded-3xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900 space-y-6">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Target Format</label>
              <select
                value={options.targetFormat}
                onChange={(e) => setOptions({ ...options, targetFormat: e.target.value as any })}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 px-3 text-xs font-semibold text-slate-900 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
              >
                <option value="image/webp">WebP (Modern & Small)</option>
                <option value="image/jpeg">JPG / JPEG (Universal)</option>
                <option value="image/png">PNG (Lossless Transparency)</option>
              </select>
            </div>

            {options.targetFormat === 'image/jpeg' && (
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Background Fill for Transparent PNG</label>
                <input
                  type="color"
                  value={options.backgroundColor}
                  onChange={(e) => setOptions({ ...options, backgroundColor: e.target.value })}
                  className="h-9 w-full rounded-xl border border-slate-200 p-1 dark:border-slate-700"
                />
              </div>
            )}
          </div>

          <button
            disabled={isProcessing}
            onClick={processConvert}
            className="w-full rounded-2xl bg-blue-600 py-3 text-sm font-bold text-white shadow-lg hover:bg-blue-700 flex items-center justify-center gap-2"
          >
            {isProcessing ? <RefreshCw className="h-5 w-5 animate-spin" /> : <Sparkles className="h-5 w-5" />}
            <span>Convert {files.length} Files</span>
          </button>
        </div>
      )}

      {results.length > 0 && (
        <div className="rounded-3xl border border-emerald-200 bg-emerald-50/40 p-6 dark:border-emerald-800/60 dark:bg-emerald-950/20 space-y-3">
          <h3 className="text-lg font-bold text-slate-900 dark:text-white">Converted Files ({results.length})</h3>
          {results.map((res, i) => (
            <div key={i} className="flex items-center justify-between rounded-xl bg-white p-3 shadow-sm dark:bg-slate-900">
              <div>
                <div className="text-xs font-bold text-slate-900 dark:text-white">{res.name}</div>
                <div className="text-[10px] text-slate-500">{formatBytes(res.size)}</div>
              </div>
              <a
                href={res.url}
                download={res.name}
                className="flex items-center gap-1.5 rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-bold text-white shadow hover:bg-emerald-700"
              >
                <Download className="h-3.5 w-3.5" /> Download
              </a>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
