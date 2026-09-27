'use client';

import React, { useState } from 'react';
import { Dropzone } from '../common/Dropzone';
import { OverlayOptions } from '@/types';
import { overlayImages, formatBytes } from '@/lib/imageUtils';
import { Image as ImageIcon, Download, Sparkles, Sliders, RefreshCw } from 'lucide-react';

export const ImageOverlayTool: React.FC = () => {
  const [bgFile, setBgFile] = useState<File | null>(null);
  const [overlayFile, setOverlayFile] = useState<File | null>(null);

  const [options, setOptions] = useState<OverlayOptions>({
    xPct: 50,
    yPct: 50,
    scalePct: 30,
    opacityPct: 100,
    rotationDeg: 0,
    blendMode: 'source-over'
  });

  const [isProcessing, setIsProcessing] = useState(false);
  const [result, setResult] = useState<{ url: string; size: number; width: number; height: number } | null>(null);

  const processOverlay = async () => {
    if (!bgFile || !overlayFile) return;
    setIsProcessing(true);
    try {
      const res = await overlayImages(bgFile, overlayFile, options);
      setResult(res);
    } catch (err) {
      console.error('Overlay error:', err);
      alert('Error overlaying images.');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="space-y-8">
      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <h1 className="text-2xl font-black text-slate-900 dark:text-white flex items-center gap-2">
          <ImageIcon className="h-6 w-6 text-blue-600" />
          Image Overlay & Watermark Tool
        </h1>
        <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
          Place a logo, signature, watermark, or screenshot over a background image with live scaling, opacity, rotation, and blend modes.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <div className="rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
          <h3 className="text-xs font-bold text-slate-700 dark:text-slate-300 mb-2">1. Background Image</h3>
          {bgFile ? (
            <div className="text-xs font-semibold text-emerald-600">Loaded: {bgFile.name}</div>
          ) : (
            <Dropzone onFilesAdded={(files) => setBgFile(files[0])} multiple={false} label="Upload Background Image" compact />
          )}
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
          <h3 className="text-xs font-bold text-slate-700 dark:text-slate-300 mb-2">2. Overlay Image (Logo / Signature)</h3>
          {overlayFile ? (
            <div className="text-xs font-semibold text-emerald-600">Loaded: {overlayFile.name}</div>
          ) : (
            <Dropzone onFilesAdded={(files) => setOverlayFile(files[0])} multiple={false} label="Upload Overlay Logo / Image" compact />
          )}
        </div>
      </div>

      {bgFile && overlayFile && (
        <div className="rounded-3xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900 space-y-6">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Sliders className="h-4 w-4 text-blue-600" />
            Position & Blending Controls
          </h3>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">X Position ({options.xPct}%)</label>
              <input type="range" min={0} max={100} value={options.xPct} onChange={(e) => setOptions({ ...options, xPct: Number(e.target.value) })} className="w-full" />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Y Position ({options.yPct}%)</label>
              <input type="range" min={0} max={100} value={options.yPct} onChange={(e) => setOptions({ ...options, yPct: Number(e.target.value) })} className="w-full" />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Scale ({options.scalePct}%)</label>
              <input type="range" min={5} max={200} value={options.scalePct} onChange={(e) => setOptions({ ...options, scalePct: Number(e.target.value) })} className="w-full" />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Opacity ({options.opacityPct}%)</label>
              <input type="range" min={0} max={100} value={options.opacityPct} onChange={(e) => setOptions({ ...options, opacityPct: Number(e.target.value) })} className="w-full" />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Rotation ({options.rotationDeg}°)</label>
              <input type="range" min={-180} max={180} value={options.rotationDeg} onChange={(e) => setOptions({ ...options, rotationDeg: Number(e.target.value) })} className="w-full" />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Blend Mode</label>
              <select
                value={options.blendMode}
                onChange={(e) => setOptions({ ...options, blendMode: e.target.value as any })}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2 px-3 text-xs font-semibold text-slate-900 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
              >
                <option value="source-over">Normal</option>
                <option value="multiply">Multiply</option>
                <option value="screen">Screen</option>
                <option value="overlay">Overlay</option>
                <option value="darken">Darken</option>
                <option value="lighten">Lighten</option>
              </select>
            </div>
          </div>

          <button
            disabled={isProcessing}
            onClick={processOverlay}
            className="w-full rounded-2xl bg-blue-600 py-3 text-sm font-bold text-white shadow-lg hover:bg-blue-700 flex items-center justify-center gap-2"
          >
            {isProcessing ? <RefreshCw className="h-5 w-5 animate-spin" /> : <Sparkles className="h-5 w-5" />}
            <span>Generate Overlay Image</span>
          </button>
        </div>
      )}

      {result && (
        <div className="rounded-3xl border border-emerald-200 bg-emerald-50/40 p-6 dark:border-emerald-800/60 dark:bg-emerald-950/20">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">Overlay Result</h3>
              <p className="text-xs text-slate-500">{result.width} × {result.height} px • {formatBytes(result.size)}</p>
            </div>
            <a
              href={result.url}
              download="Overlay_Image.png"
              className="flex items-center gap-2 rounded-xl bg-emerald-600 px-5 py-2.5 text-xs font-bold text-white shadow hover:bg-emerald-700"
            >
              <Download className="h-4 w-4" /> Download Overlay
            </a>
          </div>
          <div className="overflow-hidden rounded-2xl bg-white p-3 shadow-inner dark:bg-slate-900 flex justify-center">
            <img src={result.url} alt="Overlay result" className="max-h-96 object-contain" />
          </div>
        </div>
      )}
    </div>
  );
};
