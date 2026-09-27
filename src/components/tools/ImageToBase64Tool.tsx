'use client';

import React, { useState } from 'react';
import { Dropzone } from '../common/Dropzone';
import { formatBytes } from '@/lib/imageUtils';
import { 
  Binary, 
  Copy, 
  Check, 
  Download, 
  Code, 
  FileCode, 
  Sparkles,
  Info
} from 'lucide-react';

export const ImageToBase64Tool: React.FC = () => {
  const [file, setFile] = useState<File | null>(null);
  const [base64Uri, setBase64Uri] = useState<string>('');
  const [rawBase64, setRawBase64] = useState<string>('');
  const [activeFormat, setActiveFormat] = useState<'uri' | 'html' | 'css' | 'raw'>('uri');
  const [copied, setCopied] = useState<boolean>(false);

  const handleUpload = (files: File[]) => {
    if (files[0]) {
      const selected = files[0];
      setFile(selected);
      const reader = new FileReader();
      reader.onload = () => {
        const result = reader.result as string;
        setBase64Uri(result);
        const commaIdx = result.indexOf(',');
        setRawBase64(commaIdx !== -1 ? result.slice(commaIdx + 1) : result);
      };
      reader.readAsDataURL(selected);
    }
  };

  const getFormattedCode = () => {
    if (!file || !base64Uri) return '';
    switch (activeFormat) {
      case 'uri':
        return base64Uri;
      case 'html':
        return `<img src="${base64Uri}" alt="${file.name}" />`;
      case 'css':
        return `background-image: url('${base64Uri}');`;
      case 'raw':
        return rawBase64;
    }
  };

  const handleCopy = () => {
    const code = getFormattedCode();
    if (!code) return;
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadTxt = () => {
    const code = getFormattedCode();
    if (!code) return;
    const blob = new Blob([code], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${file?.name.replace(/\.[^/.]+$/, '')}_base64.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const base64Bytes = base64Uri ? base64Uri.length : 0;
  const overheadPct = file && base64Bytes ? Math.round(((base64Bytes - file.size) / file.size) * 100) : 0;

  return (
    <div className="space-y-8">
      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <h1 className="text-2xl font-black text-slate-900 dark:text-white flex items-center gap-2">
          <Binary className="h-6 w-6 text-blue-600" />
          Image to Base64 String Converter
        </h1>
        <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
          Encode JPG, PNG, SVG, WebP, and GIF images into Base64 data strings for inline HTML, CSS stylesheets, and JSON APIs without external hosting.
        </p>
      </div>

      {!file ? (
        <Dropzone onFilesAdded={handleUpload} multiple={false} label="Upload Image to Convert to Base64" />
      ) : (
        <div className="rounded-3xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900 space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-100 pb-4 dark:border-slate-800">
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">{file.name}</h3>
              <p className="text-xs text-slate-400">
                Original: {formatBytes(file.size)} • Base64: {formatBytes(base64Bytes)} (+{overheadPct}% overhead)
              </p>
            </div>
            <button
              onClick={() => { setFile(null); setBase64Uri(''); setRawBase64(''); }}
              className="text-xs font-semibold text-red-500 hover:underline"
            >
              Change File
            </button>
          </div>

          {/* Format Tabs */}
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setActiveFormat('uri')}
              className={`rounded-xl px-3.5 py-1.5 text-xs font-bold transition-all ${
                activeFormat === 'uri'
                  ? 'bg-blue-600 text-white shadow'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300'
              }`}
            >
              Data URI (<code className="text-[10px]">data:image/...</code>)
            </button>

            <button
              onClick={() => setActiveFormat('html')}
              className={`rounded-xl px-3.5 py-1.5 text-xs font-bold transition-all ${
                activeFormat === 'html'
                  ? 'bg-blue-600 text-white shadow'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300'
              }`}
            >
              HTML Image Tag (<code className="text-[10px]">&lt;img /&gt;</code>)
            </button>

            <button
              onClick={() => setActiveFormat('css')}
              className={`rounded-xl px-3.5 py-1.5 text-xs font-bold transition-all ${
                activeFormat === 'css'
                  ? 'bg-blue-600 text-white shadow'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300'
              }`}
            >
              CSS Background (<code className="text-[10px]">url(...)</code>)
            </button>

            <button
              onClick={() => setActiveFormat('raw')}
              className={`rounded-xl px-3.5 py-1.5 text-xs font-bold transition-all ${
                activeFormat === 'raw'
                  ? 'bg-blue-600 text-white shadow'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300'
              }`}
            >
              Raw Base64 Only
            </button>
          </div>

          {/* Action Bar */}
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-500 font-semibold">
              Length: {base64Bytes.toLocaleString()} characters
            </span>
            <div className="flex space-x-2">
              <button
                onClick={handleCopy}
                className="inline-flex items-center gap-1.5 rounded-xl bg-blue-600 px-4 py-2 text-xs font-bold text-white shadow hover:bg-blue-700"
              >
                {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                <span>{copied ? 'Copied!' : 'Copy Code'}</span>
              </button>

              <button
                onClick={handleDownloadTxt}
                className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2 text-xs font-bold text-slate-700 hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300"
              >
                <Download className="h-3.5 w-3.5" />
                <span>Save .txt</span>
              </button>
            </div>
          </div>

          {/* Code Viewer */}
          <div className="relative">
            <textarea
              readOnly
              rows={8}
              value={getFormattedCode()}
              className="w-full rounded-2xl border border-slate-200 bg-slate-50 p-4 font-mono text-xs text-slate-800 focus:outline-none dark:border-slate-700 dark:bg-slate-950 dark:text-blue-200 leading-relaxed overflow-x-auto"
            />
          </div>

          {/* Image Preview */}
          <div className="rounded-2xl border border-slate-100 bg-slate-50/50 p-4 dark:border-slate-800 dark:bg-slate-900/50 flex items-center justify-center">
            <img src={base64Uri} alt="Preview" className="max-h-48 object-contain rounded shadow" />
          </div>
        </div>
      )}
    </div>
  );
};
