'use client';

import React, { useState } from 'react';
import { Dropzone } from '../common/Dropzone';
import { signatureCleaner, formatBytes } from '@/lib/imageUtils';
import { PenTool, Download, Sparkles, RefreshCw, CheckCircle2 } from 'lucide-react';

export const SignatureTool: React.FC = () => {
  const [file, setFile] = useState<File | null>(null);
  const [threshold, setThreshold] = useState(210);
  const [isProcessing, setIsProcessing] = useState(false);
  const [result, setResult] = useState<{ url: string; size: number; width: number; height: number } | null>(null);

  const processSignature = async () => {
    if (!file) return;
    setIsProcessing(true);
    try {
      const res = await signatureCleaner(file, threshold);
      setResult(res);
    } catch (err) {
      console.error('Signature error:', err);
      alert('Error cleaning signature.');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="space-y-8">
      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <h1 className="text-2xl font-black text-slate-900 dark:text-white flex items-center gap-2">
          <PenTool className="h-6 w-6 text-blue-600" />
          Signature Background Remover & Auto-Cropper
        </h1>
        <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
          Upload a paper photo of a handwritten signature. Automatically strip white background, auto-crop whitespace, enhance stroke contrast, and download transparent PNG!
        </p>
      </div>

      {!file ? (
        <Dropzone onFilesAdded={(files) => setFile(files[0])} multiple={false} label="Upload Handwritten Signature Photo" />
      ) : (
        <div className="rounded-3xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900 space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">Signature Clean Settings</h3>
            <button onClick={() => { setFile(null); setResult(null); }} className="text-xs font-semibold text-red-500">Change Signature</button>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Background Sensitivity Threshold ({threshold})</label>
            <input type="range" min={150} max={250} value={threshold} onChange={(e) => setThreshold(Number(e.target.value))} className="w-full" />
          </div>

          <button
            disabled={isProcessing}
            onClick={processSignature}
            className="w-full rounded-2xl bg-blue-600 py-3 text-sm font-bold text-white shadow-lg hover:bg-blue-700 flex items-center justify-center gap-2"
          >
            {isProcessing ? <RefreshCw className="h-5 w-5 animate-spin" /> : <Sparkles className="h-5 w-5" />}
            <span>Clean Background & Auto-Crop</span>
          </button>
        </div>
      )}

      {result && (
        <div className="rounded-3xl border border-emerald-200 bg-emerald-50/40 p-6 dark:border-emerald-800/60 dark:bg-emerald-950/20">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                <CheckCircle2 className="h-5 w-5 text-emerald-500" /> Transparent Signature Ready
              </h3>
              <p className="text-xs text-slate-500">{result.width} × {result.height} px • {formatBytes(result.size)}</p>
            </div>
            <a
              href={result.url}
              download="Transparent_Signature.png"
              className="flex items-center gap-2 rounded-xl bg-emerald-600 px-5 py-2.5 text-xs font-bold text-white shadow hover:bg-emerald-700"
            >
              <Download className="h-4 w-4" /> Download PNG
            </a>
          </div>
          <div className="overflow-hidden rounded-2xl bg-[radial-gradient(#e2e8f0_1px,transparent_1px)] [background-size:16px_16px] p-8 dark:bg-[radial-gradient(#334155_1px,transparent_1px)] flex justify-center border border-slate-200 dark:border-slate-700">
            <img src={result.url} alt="Cleaned signature" className="max-h-48 object-contain" />
          </div>
        </div>
      )}
    </div>
  );
};
