'use client';

import React, { useState } from 'react';
import { Dropzone } from '../common/Dropzone';
import { TextWatermarkOptions } from '@/types';
import { addTextAndWatermark, formatBytes } from '@/lib/imageUtils';
import { Type, Download, Sparkles, RefreshCw, Sliders } from 'lucide-react';

export const AddTextWatermarkTool: React.FC = () => {
  const [file, setFile] = useState<File | null>(null);
  const [options, setOptions] = useState<TextWatermarkOptions>({
    mode: 'text',
    text: 'CONFIDENTIAL',
    fontFamily: 'sans-serif',
    fontSize: 48,
    isBold: true,
    isItalic: false,
    color: '#ffffff',
    backgroundColor: 'transparent',
    outlineColor: '#000000',
    outlineWidth: 2,
    shadowColor: 'rgba(0,0,0,0.5)',
    shadowBlur: 10,
    opacityPct: 80,
    rotationDeg: -30,
    position: 'center',
    xPct: 50,
    yPct: 50,
    tileSize: 100,
    tileGap: 250
  });

  const [isProcessing, setIsProcessing] = useState(false);
  const [result, setResult] = useState<{ url: string; size: number } | null>(null);

  const processWatermark = async () => {
    if (!file) return;
    setIsProcessing(true);
    try {
      const res = await addTextAndWatermark(file, options);
      setResult(res);
    } catch (err) {
      console.error('Watermark error:', err);
      alert('Error adding watermark.');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="space-y-8">
      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <h1 className="text-2xl font-black text-slate-900 dark:text-white flex items-center gap-2">
          <Type className="h-6 w-6 text-blue-600" />
          Add Text & Watermark Tool
        </h1>
        <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
          Add custom styled text, logos, or tiled matrix watermarks (e.g. CONFIDENTIAL) to protect photos & documents.
        </p>
      </div>

      {!file ? (
        <Dropzone onFilesAdded={(files) => setFile(files[0])} multiple={false} label="Upload Image for Text / Watermark" />
      ) : (
        <div className="rounded-3xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900 space-y-6">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Watermark Mode</label>
              <select
                value={options.mode}
                onChange={(e) => setOptions({ ...options, mode: e.target.value as any })}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2 px-3 text-xs font-semibold text-slate-900 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
              >
                <option value="text">Single Text Overlay</option>
                <option value="tiled">Tiled Matrix Watermark</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Text String</label>
              <input
                type="text"
                value={options.text}
                onChange={(e) => setOptions({ ...options, text: e.target.value })}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2 px-3 text-xs font-semibold text-slate-900 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Text Color</label>
              <input
                type="color"
                value={options.color}
                onChange={(e) => setOptions({ ...options, color: e.target.value })}
                className="h-9 w-full rounded-xl border border-slate-200 p-1 dark:border-slate-700"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Font Size ({options.fontSize}px)</label>
              <input type="range" min={16} max={120} value={options.fontSize} onChange={(e) => setOptions({ ...options, fontSize: Number(e.target.value) })} className="w-full" />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Opacity ({options.opacityPct}%)</label>
              <input type="range" min={10} max={100} value={options.opacityPct} onChange={(e) => setOptions({ ...options, opacityPct: Number(e.target.value) })} className="w-full" />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Rotation ({options.rotationDeg}°)</label>
              <input type="range" min={-180} max={180} value={options.rotationDeg} onChange={(e) => setOptions({ ...options, rotationDeg: Number(e.target.value) })} className="w-full" />
            </div>
          </div>

          <button
            disabled={isProcessing}
            onClick={processWatermark}
            className="w-full rounded-2xl bg-blue-600 py-3 text-sm font-bold text-white shadow-lg hover:bg-blue-700 flex items-center justify-center gap-2"
          >
            {isProcessing ? <RefreshCw className="h-5 w-5 animate-spin" /> : <Sparkles className="h-5 w-5" />}
            <span>Apply Watermark</span>
          </button>
        </div>
      )}

      {result && (
        <div className="rounded-3xl border border-emerald-200 bg-emerald-50/40 p-6 dark:border-emerald-800/60 dark:bg-emerald-950/20">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">Watermarked Result</h3>
              <p className="text-xs text-slate-500">{formatBytes(result.size)}</p>
            </div>
            <a
              href={result.url}
              download="Watermarked_Image.png"
              className="flex items-center gap-2 rounded-xl bg-emerald-600 px-5 py-2.5 text-xs font-bold text-white shadow hover:bg-emerald-700"
            >
              <Download className="h-4 w-4" /> Download Watermarked Image
            </a>
          </div>
          <div className="overflow-hidden rounded-2xl bg-white p-3 shadow-inner dark:bg-slate-900 flex justify-center">
            <img src={result.url} alt="Watermarked result" className="max-h-96 object-contain" />
          </div>
        </div>
      )}
    </div>
  );
};
