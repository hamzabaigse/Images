'use client';

import React, { useState } from 'react';
import { Dropzone } from '../common/Dropzone';
import { smartCompressImage, formatBytes } from '@/lib/imageUtils';
import JSZip from 'jszip';
import { Package, Download, Sparkles, RefreshCw, CheckCircle2 } from 'lucide-react';

export const BatchProcessorTool: React.FC = () => {
  const [files, setFiles] = useState<File[]>([]);
  const [targetFormat, setTargetFormat] = useState<'image/webp' | 'image/jpeg' | 'image/png'>('image/webp');
  const [maxWidth, setMaxWidth] = useState(1920);

  const [isProcessing, setIsProcessing] = useState(false);
  const [processedCount, setProcessedCount] = useState(0);
  const [zipBlob, setZipBlob] = useState<Blob | null>(null);

  const handleUpload = (newFiles: File[]) => {
    setFiles((prev) => [...prev, ...newFiles]);
    setZipBlob(null);
  };

  const processBatch = async () => {
    if (files.length === 0) return;
    setIsProcessing(true);
    setProcessedCount(0);

    const zip = new JSZip();

    try {
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const res = await smartCompressImage(file, {
          mode: 'balanced',
          targetSizeKb: 0,
          outputFormat: targetFormat,
          maxWidthOrHeight: maxWidth,
          quality: 0.85
        });

        const ext = targetFormat === 'image/webp' ? 'webp' : targetFormat === 'image/png' ? 'png' : 'jpg';
        const nameWithoutExt = file.name.substring(0, file.name.lastIndexOf('.')) || file.name;
        zip.file(`${nameWithoutExt}_batch.${ext}`, res.blob);

        setProcessedCount(i + 1);
      }

      const content = await zip.generateAsync({ type: 'blob' });
      setZipBlob(content);
    } catch (err) {
      console.error('Batch error:', err);
      alert('Error during batch processing.');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="space-y-8">
      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <h1 className="text-2xl font-black text-slate-900 dark:text-white flex items-center gap-2">
          <Package className="h-6 w-6 text-blue-600" />
          Batch Image Processor (1–100 Images)
        </h1>
        <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
          Bulk convert, resize, strip metadata, and compress up to 100 images simultaneously into a downloadable ZIP archive.
        </p>
      </div>

      <Dropzone onFilesAdded={handleUpload} multiple={true} maxFiles={100} label="Upload up to 100 Images for Bulk Batch Processing" />

      {files.length > 0 && (
        <div className="rounded-3xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900 space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">Batch Queue ({files.length} Files)</h3>
            <button onClick={() => { setFiles([]); setZipBlob(null); }} className="text-xs font-semibold text-red-500">Clear</button>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Target Format</label>
              <select
                value={targetFormat}
                onChange={(e) => setTargetFormat(e.target.value as any)}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 px-3 text-xs font-semibold text-slate-900 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
              >
                <option value="image/webp">WebP (Optimized)</option>
                <option value="image/jpeg">JPG</option>
                <option value="image/png">PNG</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Max Dimension ({maxWidth} px)</label>
              <select
                value={maxWidth}
                onChange={(e) => setMaxWidth(Number(e.target.value))}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 px-3 text-xs font-semibold text-slate-900 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
              >
                <option value={3840}>4K (3840 px)</option>
                <option value={1920}>Full HD (1920 px)</option>
                <option value={1200}>Blog / Web (1200 px)</option>
                <option value={800}>Thumbnail (800 px)</option>
              </select>
            </div>
          </div>

          <button
            disabled={isProcessing}
            onClick={processBatch}
            className="w-full rounded-2xl bg-blue-600 py-3.5 text-sm font-bold text-white shadow-lg hover:bg-blue-700 flex items-center justify-center gap-2"
          >
            {isProcessing ? (
              <>
                <RefreshCw className="h-5 w-5 animate-spin" />
                <span>Processing Batch ({processedCount} / {files.length})...</span>
              </>
            ) : (
              <>
                <Sparkles className="h-5 w-5" />
                <span>Process {files.length} Files into ZIP Archive</span>
              </>
            )}
          </button>
        </div>
      )}

      {zipBlob && (
        <div className="rounded-3xl border border-emerald-200 bg-emerald-50/40 p-6 dark:border-emerald-800/60 dark:bg-emerald-950/20 text-center space-y-4">
          <CheckCircle2 className="h-12 w-12 text-emerald-600 mx-auto" />
          <div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">Batch Processing Completed!</h3>
            <p className="text-xs text-slate-500">ZIP File Size: {formatBytes(zipBlob.size)}</p>
          </div>
          <a
            href={URL.createObjectURL(zipBlob)}
            download="Batch_Processed_Images.zip"
            className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-6 py-3 text-xs font-bold text-white shadow hover:bg-emerald-700"
          >
            <Download className="h-4 w-4" /> Download Batch ZIP Archive
          </a>
        </div>
      )}
    </div>
  );
};
