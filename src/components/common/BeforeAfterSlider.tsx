'use client';

import React, { useState, useRef } from 'react';
import { Sparkles, ArrowRightLeft, Download, CheckCircle2 } from 'lucide-react';
import { formatBytes } from '@/lib/imageUtils';

interface BeforeAfterSliderProps {
  originalUrl: string;
  processedUrl: string;
  originalSize: number;
  processedSize: number;
  originalDimensions?: string;
  processedDimensions?: string;
  originalFormat?: string;
  processedFormat?: string;
  onDownload?: () => void;
}

export const BeforeAfterSlider: React.FC<BeforeAfterSliderProps> = ({
  originalUrl,
  processedUrl,
  originalSize,
  processedSize,
  originalDimensions = '4032 × 3024',
  processedDimensions = '2000 × 1500',
  originalFormat = 'JPG',
  processedFormat = 'WebP',
  onDownload
}) => {
  const [sliderPos, setSliderPos] = useState(50);
  const containerRef = useRef<HTMLDivElement>(null);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const pct = Math.max(0, Math.min(100, (x / rect.width) * 100));
    setSliderPos(pct);
  };

  const handleTouchMove = (e: React.TouchEvent<HTMLDivElement>) => {
    if (!containerRef.current || !e.touches[0]) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = e.touches[0].clientX - rect.left;
    const pct = Math.max(0, Math.min(100, (x / rect.width) * 100));
    setSliderPos(pct);
  };

  const savedPct = Math.max(0, Math.round(((originalSize - processedSize) / originalSize) * 100));

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">
      
      {/* Stats header bar */}
      <div className="mb-4 grid grid-cols-2 gap-4 rounded-xl bg-slate-50 p-3 dark:bg-slate-800/60">
        <div className="border-r border-slate-200 pr-3 dark:border-slate-700">
          <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Before Original</span>
          <div className="mt-1 font-bold text-slate-900 dark:text-white text-base">{formatBytes(originalSize)}</div>
          <div className="text-[11px] text-slate-500">{originalDimensions} • {originalFormat}</div>
        </div>

        <div>
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider flex items-center gap-1">
              <CheckCircle2 className="h-3.5 w-3.5" /> After Optimized
            </span>
            <span className="rounded-full bg-emerald-500/10 px-2 py-0.5 text-[10px] font-bold text-emerald-600 dark:text-emerald-400">
              {savedPct}% smaller
            </span>
          </div>
          <div className="mt-1 font-bold text-emerald-600 dark:text-emerald-400 text-base">{formatBytes(processedSize)}</div>
          <div className="text-[11px] text-slate-500">{processedDimensions} • {processedFormat}</div>
        </div>
      </div>

      {/* Interactive slider image container */}
      <div
        ref={containerRef}
        onMouseMove={handleMouseMove}
        onTouchMove={handleTouchMove}
        className="relative h-80 sm:h-96 w-full cursor-ew-resize overflow-hidden rounded-xl bg-slate-950 shadow-inner select-none"
      >
        {/* Processed (After) Image */}
        <img
          src={processedUrl}
          alt="Optimized"
          className="absolute inset-0 h-full w-full object-contain"
        />

        {/* Original (Before) Image overlaid with clip path */}
        <div
          className="absolute inset-0 h-full w-full overflow-hidden"
          style={{ clipPath: `inset(0 ${100 - sliderPos}% 0 0)` }}
        >
          <img
            src={originalUrl}
            alt="Original"
            className="absolute inset-0 h-full w-full object-contain"
          />
        </div>

        {/* Divider bar */}
        <div
          className="absolute bottom-0 top-0 w-0.5 bg-white shadow-[0_0_10px_rgba(0,0,0,0.5)]"
          style={{ left: `${sliderPos}%` }}
        >
          <div className="absolute top-1/2 -translate-x-1/2 -translate-y-1/2 flex h-8 w-8 items-center justify-center rounded-full bg-white text-slate-700 shadow-md ring-2 ring-blue-500">
            <ArrowRightLeft className="h-4 w-4" />
          </div>
        </div>

        {/* Labels on image */}
        <div className="absolute left-3 top-3 rounded-md bg-black/60 px-2.5 py-1 text-[11px] font-bold text-white backdrop-blur-sm">
          BEFORE
        </div>
        <div className="absolute right-3 top-3 rounded-md bg-blue-600/90 px-2.5 py-1 text-[11px] font-bold text-white backdrop-blur-sm">
          AFTER
        </div>
      </div>

      {/* Download button */}
      {onDownload && (
        <button
          onClick={onDownload}
          className="mt-4 flex w-full items-center justify-center space-x-2 rounded-xl bg-blue-600 py-3 text-sm font-bold text-white shadow-lg shadow-blue-500/20 hover:bg-blue-700 transition-all"
        >
          <Download className="h-4 w-4" />
          <span>Download Optimized Image ({formatBytes(processedSize)})</span>
        </button>
      )}
    </div>
  );
};
