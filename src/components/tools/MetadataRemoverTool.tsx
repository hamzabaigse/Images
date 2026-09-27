'use client';

import React, { useState } from 'react';
import { Dropzone } from '../common/Dropzone';
import { stripImageMetadata, formatBytes } from '@/lib/imageUtils';
import { ShieldCheck, Download, Sparkles, RefreshCw, EyeOff } from 'lucide-react';

export const MetadataRemoverTool: React.FC = () => {
  const [file, setFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [result, setResult] = useState<{ url: string; size: number } | null>(null);

  const processStrip = async () => {
    if (!file) return;
    setIsProcessing(true);
    try {
      const res = await stripImageMetadata(file);
      setResult(res);
    } catch (err) {
      console.error('Metadata error:', err);
      alert('Error stripping EXIF metadata.');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="space-y-8">
      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <h1 className="text-2xl font-black text-slate-900 dark:text-white flex items-center gap-2">
          <EyeOff className="h-6 w-6 text-blue-600" />
          Metadata & EXIF Location Data Remover
        </h1>
        <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
          Remove hidden GPS location tags, camera details, device serial numbers, and timestamps from photos before sharing online.
        </p>
      </div>

      {!file ? (
        <Dropzone onFilesAdded={(files) => setFile(files[0])} multiple={false} label="Upload Image to Strip Location & Camera EXIF Data" />
      ) : (
        <div className="rounded-3xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900 space-y-6">
          <div className="rounded-xl bg-amber-50 p-4 border border-amber-200 text-xs text-amber-900 space-y-1 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-800/60">
            <div className="font-bold flex items-center gap-1.5"><ShieldCheck className="h-4 w-4 text-amber-600" /> Detected EXIF Tags to Strip:</div>
            <div>• GPS Latitude & Longitude (Location metadata)</div>
            <div>• Camera Model & Lens serial number</div>
            <div>• Date & Timestamp of photo capture</div>
          </div>

          <button
            disabled={isProcessing}
            onClick={processStrip}
            className="w-full rounded-2xl bg-blue-600 py-3 text-sm font-bold text-white shadow-lg hover:bg-blue-700 flex items-center justify-center gap-2"
          >
            {isProcessing ? <RefreshCw className="h-5 w-5 animate-spin" /> : <Sparkles className="h-5 w-5" />}
            <span>Strip All EXIF Metadata for Privacy</span>
          </button>
        </div>
      )}

      {result && (
        <div className="rounded-3xl border border-emerald-200 bg-emerald-50/40 p-6 dark:border-emerald-800/60 dark:bg-emerald-950/20 text-center space-y-4">
          <ShieldCheck className="h-12 w-12 text-emerald-600 mx-auto" />
          <div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">Privacy Clean Image Ready</h3>
            <p className="text-xs text-slate-500">EXIF, GPS, and device serial tags 100% removed • {formatBytes(result.size)}</p>
          </div>
          <a
            href={result.url}
            download={`privacy_clean_${file?.name}`}
            className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-6 py-3 text-xs font-bold text-white shadow hover:bg-emerald-700"
          >
            <Download className="h-4 w-4" /> Download Privacy-Clean Image
          </a>
        </div>
      )}
    </div>
  );
};
