'use client';

import React, { useState } from 'react';
import { Dropzone } from '../common/Dropzone';
import { BeforeAfterSlider } from '../common/BeforeAfterSlider';
import { CompressOptions } from '@/types';
import { smartCompressImage, formatBytes } from '@/lib/imageUtils';
import JSZip from 'jszip';
import { 
  Sliders, 
  Sparkles, 
  Download, 
  RefreshCw, 
  Layers, 
  CheckCircle2, 
  Zap, 
  FileCheck 
} from 'lucide-react';

interface CompressedItem {
  id: string;
  originalFile: File;
  originalUrl: string;
  processedUrl: string;
  processedBlob: Blob;
  originalSize: number;
  processedSize: number;
  originalDimensions: string;
  processedDimensions: string;
  savedPct: number;
}

export const SmartCompressor: React.FC = () => {
  const [files, setFiles] = useState<File[]>([]);
  const [options, setOptions] = useState<CompressOptions>({
    mode: 'balanced',
    targetSizeKb: 1000,
    outputFormat: 'auto',
    maxWidthOrHeight: 2000,
    quality: 0.85
  });

  const [isCompressing, setIsCompressing] = useState(false);
  const [results, setResults] = useState<CompressedItem[]>([]);
  const [selectedResultIndex, setSelectedResultIndex] = useState(0);

  const handleFilesAdded = (newFiles: File[]) => {
    setFiles((prev) => [...prev, ...newFiles]);
  };

  const processCompressAll = async () => {
    if (files.length === 0) return;
    setIsCompressing(true);
    const compressedItems: CompressedItem[] = [];

    try {
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const origUrl = URL.createObjectURL(file);
        const res = await smartCompressImage(file, options);
        
        compressedItems.push({
          id: `comp-${i}-${Date.now()}`,
          originalFile: file,
          originalUrl: origUrl,
          processedUrl: res.url,
          processedBlob: res.blob,
          originalSize: file.size,
          processedSize: res.size,
          originalDimensions: `Original (${file.name.substring(0, 15)})`,
          processedDimensions: `${res.width} × ${res.height} px`,
          savedPct: res.savedPct
        });
      }
      setResults(compressedItems);
    } catch (err) {
      console.error('Compression error:', err);
      alert('Error during image compression.');
    } finally {
      setIsCompressing(false);
    }
  };

  const downloadSingle = (item: CompressedItem) => {
    const a = document.createElement('a');
    a.href = item.processedUrl;
    a.download = `compressed_${item.originalFile.name}`;
    a.click();
  };

  const downloadAllZip = async () => {
    if (results.length === 0) return;
    const zip = new JSZip();
    results.forEach((item) => {
      zip.file(`compressed_${item.originalFile.name}`, item.processedBlob);
    });
    const content = await zip.generateAsync({ type: 'blob' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(content);
    a.download = `PixelForge_Compressed_Images.zip`;
    a.click();
  };

  return (
    <div className="space-y-8">
      
      {/* Title */}
      <div className="rounded-3xl border border-slate-200 bg-gradient-to-br from-blue-50/80 via-white to-indigo-50/30 p-6 dark:border-slate-800 dark:from-slate-900 dark:to-slate-900/50 sm:p-8">
        <div className="inline-flex items-center space-x-2 rounded-full bg-blue-100 px-3 py-1 text-xs font-bold text-blue-700 dark:bg-blue-900/60 dark:text-blue-300">
          <Zap className="h-3.5 w-3.5 fill-amber-300 text-amber-400" />
          <span>Intelligent Compression Engine</span>
        </div>
        <h1 className="mt-3 text-2xl font-black text-slate-900 dark:text-white sm:text-3xl">
          Smart Image Compressor (1–100 Images)
        </h1>
        <p className="mt-2 text-xs sm:text-sm text-slate-600 dark:text-slate-300 max-w-2xl leading-relaxed">
          Compress photos without losing clarity. Set a target file size (e.g. 1 MB, 500 KB) or mode. PixelForge automatically computes optimal dimensions, chroma settings, format, and quality.
        </p>
      </div>

      {/* Upload Zone */}
      <Dropzone
        onFilesAdded={handleFilesAdded}
        multiple={true}
        maxFiles={100}
        label="Upload 1–100 Images to Compress"
        sublabel="Supports JPG, PNG, WebP, GIF, BMP, HEIC up to 50 MB each"
      />

      {/* Selected Files List */}
      {files.length > 0 && (
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Layers className="h-4 w-4 text-blue-600" />
              Selected Files ({files.length})
            </h3>
            <button
              onClick={() => { setFiles([]); setResults([]); }}
              className="text-xs font-semibold text-red-500 hover:text-red-600"
            >
              Clear All
            </button>
          </div>

          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 md:grid-cols-6">
            {files.map((file, idx) => (
              <div key={idx} className="relative rounded-xl border border-slate-200 bg-slate-50 p-2 text-center text-xs dark:border-slate-700 dark:bg-slate-800">
                <div className="font-semibold text-slate-900 dark:text-white truncate">{file.name}</div>
                <div className="text-[10px] text-slate-500">{formatBytes(file.size)}</div>
              </div>
            ))}
          </div>

          {/* Options Bar */}
          <div className="mt-6 border-t border-slate-200 pt-6 dark:border-slate-700">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-4">Compression Settings</h4>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              {/* Compression Mode */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  Compression Mode
                </label>
                <select
                  value={options.mode}
                  onChange={(e) => setOptions({ ...options, mode: e.target.value as any })}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2 px-3 text-xs font-semibold text-slate-900 focus:border-blue-500 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                >
                  <option value="balanced">Balanced (Recommended)</option>
                  <option value="max_quality">Maximum Quality</option>
                  <option value="smallest_size">Smallest File Size</option>
                  <option value="target_size">Target File Size (e.g. 1MB)</option>
                </select>
              </div>

              {/* Target Size KB */}
              {options.mode === 'target_size' && (
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                    Target File Size (KB)
                  </label>
                  <input
                    type="number"
                    value={options.targetSizeKb}
                    onChange={(e) => setOptions({ ...options, targetSizeKb: Number(e.target.value) })}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2 px-3 text-xs font-semibold text-slate-900 focus:border-blue-500 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                    placeholder="e.g. 1000 for 1MB"
                  />
                </div>
              )}

              {/* Output Format */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  Format
                </label>
                <select
                  value={options.outputFormat}
                  onChange={(e) => setOptions({ ...options, outputFormat: e.target.value as any })}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2 px-3 text-xs font-semibold text-slate-900 focus:border-blue-500 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                >
                  <option value="auto">Auto Format (Smart WebP/JPG)</option>
                  <option value="image/webp">WebP (Smallest)</option>
                  <option value="image/jpeg">JPG</option>
                  <option value="image/png">PNG</option>
                </select>
              </div>
            </div>

            <button
              disabled={isCompressing}
              onClick={processCompressAll}
              className="mt-6 flex w-full items-center justify-center space-x-2 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 py-3.5 text-sm font-bold text-white shadow-xl shadow-blue-500/20 hover:from-blue-700 hover:to-indigo-700 transition-all"
            >
              {isCompressing ? (
                <>
                  <RefreshCw className="h-5 w-5 animate-spin" />
                  <span>Compressing {files.length} Images...</span>
                </>
              ) : (
                <>
                  <Sparkles className="h-5 w-5" />
                  <span>Compress {files.length} Images Now</span>
                </>
              )}
            </button>
          </div>
        </div>
      )}

      {/* Results Display */}
      {results.length > 0 && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <h3 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <CheckCircle2 className="h-6 w-6 text-emerald-500" />
              Compressed Results ({results.length})
            </h3>

            {results.length > 1 && (
              <button
                onClick={downloadAllZip}
                className="flex items-center justify-center space-x-2 rounded-xl bg-emerald-600 px-5 py-2.5 text-xs font-bold text-white shadow-md hover:bg-emerald-700 transition-all"
              >
                <Download className="h-4 w-4" />
                <span>Download All as ZIP</span>
              </button>
            )}
          </div>

          {/* Before & After Interactive Slider View */}
          {results[selectedResultIndex] && (
            <BeforeAfterSlider
              originalUrl={results[selectedResultIndex].originalUrl}
              processedUrl={results[selectedResultIndex].processedUrl}
              originalSize={results[selectedResultIndex].originalSize}
              processedSize={results[selectedResultIndex].processedSize}
              originalDimensions="Original Photo"
              processedDimensions={results[selectedResultIndex].processedDimensions}
              onDownload={() => downloadSingle(results[selectedResultIndex])}
            />
          )}

          {/* Thumbnails switcher for multi-images */}
          {results.length > 1 && (
            <div className="flex space-x-2 overflow-x-auto pb-2">
              {results.map((res, idx) => (
                <button
                  key={res.id}
                  onClick={() => setSelectedResultIndex(idx)}
                  className={`rounded-xl border p-2 text-left text-xs transition-all ${
                    selectedResultIndex === idx
                      ? 'border-blue-600 bg-blue-50 dark:bg-blue-950/40 font-bold'
                      : 'border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900'
                  }`}
                >
                  <div className="truncate max-w-[120px]">{res.originalFile.name}</div>
                  <div className="text-[10px] text-emerald-600 font-semibold">{res.savedPct}% smaller</div>
                </button>
              ))}
            </div>
          )}
        </div>
      )}

    </div>
  );
};
