'use client';

import React, { useState } from 'react';
import { Dropzone } from '../common/Dropzone';
import { ImagesToPdfOptions } from '@/types';
import { convertImagesToPdf, formatBytes } from '@/lib/imageUtils';
import { FileText, Download, Sparkles, RefreshCw, File } from 'lucide-react';

export const ImagesToPdfTool: React.FC = () => {
  const [files, setFiles] = useState<File[]>([]);
  const [options, setOptions] = useState<ImagesToPdfOptions>({
    pageSize: 'a4',
    orientation: 'portrait',
    margin: 10,
    quality: 0.85,
    onePerPage: true,
    title: 'Document'
  });

  const [isProcessing, setIsProcessing] = useState(false);
  const [result, setResult] = useState<{ url: string; size: number } | null>(null);

  const handleUpload = (newFiles: File[]) => {
    setFiles((prev) => [...prev, ...newFiles]);
  };

  const processPdf = async () => {
    if (files.length === 0) return;
    setIsProcessing(true);
    try {
      const res = await convertImagesToPdf(files, options);
      setResult(res);
    } catch (err) {
      console.error('PDF error:', err);
      alert('Error creating PDF.');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="space-y-8">
      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <h1 className="text-2xl font-black text-slate-900 dark:text-white flex items-center gap-2">
          <FileText className="h-6 w-6 text-red-600" />
          Images → PDF Document Converter
        </h1>
        <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
          Combine multiple JPG/PNG images into a single PDF document with page sizing (A4, Letter), margins, and orientation controls.
        </p>
      </div>

      <Dropzone onFilesAdded={handleUpload} multiple={true} label="Upload Images to Convert to PDF" />

      {files.length > 0 && (
        <div className="rounded-3xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900 space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">Selected Images ({files.length})</h3>
            <button onClick={() => setFiles([])} className="text-xs font-semibold text-red-500">Clear All</button>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Page Size</label>
              <select
                value={options.pageSize}
                onChange={(e) => setOptions({ ...options, pageSize: e.target.value as any })}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2 px-3 text-xs font-semibold text-slate-900 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
              >
                <option value="a4">A4 Paper</option>
                <option value="letter">US Letter</option>
                <option value="fit">Original Image Size</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Page Orientation</label>
              <select
                value={options.orientation}
                onChange={(e) => setOptions({ ...options, orientation: e.target.value as any })}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2 px-3 text-xs font-semibold text-slate-900 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
              >
                <option value="portrait">Portrait</option>
                <option value="landscape">Landscape</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Page Margin ({options.margin} mm)</label>
              <input type="range" min={0} max={30} value={options.margin} onChange={(e) => setOptions({ ...options, margin: Number(e.target.value) })} className="w-full" />
            </div>
          </div>

          <button
            disabled={isProcessing}
            onClick={processPdf}
            className="w-full rounded-2xl bg-red-600 py-3 text-sm font-bold text-white shadow-lg hover:bg-red-700 flex items-center justify-center gap-2"
          >
            {isProcessing ? <RefreshCw className="h-5 w-5 animate-spin" /> : <Sparkles className="h-5 w-5" />}
            <span>Generate PDF Document</span>
          </button>
        </div>
      )}

      {result && (
        <div className="rounded-3xl border border-emerald-200 bg-emerald-50/40 p-6 dark:border-emerald-800/60 dark:bg-emerald-950/20 text-center space-y-4">
          <File className="h-16 w-16 text-red-600 mx-auto" />
          <div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">PDF Document Ready!</h3>
            <p className="text-xs text-slate-500">{formatBytes(result.size)}</p>
          </div>
          <a
            href={result.url}
            download="Images_Document.pdf"
            className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-6 py-3 text-xs font-bold text-white shadow hover:bg-emerald-700"
          >
            <Download className="h-4 w-4" /> Download PDF File
          </a>
        </div>
      )}
    </div>
  );
};
