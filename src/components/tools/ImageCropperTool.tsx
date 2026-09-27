'use client';

import React, { useState } from 'react';
import { Dropzone } from '../common/Dropzone';
import { CropOptions } from '@/types';
import { cropImage, formatBytes, loadImageFromFile } from '@/lib/imageUtils';
import { Crop, Download, Sparkles, RefreshCw, RotateCw, FlipHorizontal } from 'lucide-react';

export const ImageCropperTool: React.FC = () => {
  const [file, setFile] = useState<File | null>(null);
  const [filePreview, setFilePreview] = useState<string | null>(null);

  const [options, setOptions] = useState<CropOptions>({
    aspectRatioName: 'Freeform',
    aspectRatio: null,
    rotation: 0,
    flipH: false,
    flipV: false,
    zoom: 1
  });

  const [isProcessing, setIsProcessing] = useState(false);
  const [result, setResult] = useState<{ url: string; size: number; width: number; height: number } | null>(null);

  const presets = [
    { name: 'Freeform', ratio: null },
    { name: 'Square (1:1)', ratio: 1 },
    { name: 'IG Story (9:16)', ratio: 9 / 16 },
    { name: 'YouTube (16:9)', ratio: 16 / 9 },
    { name: 'LinkedIn Banner (4:1)', ratio: 4 / 1 },
    { name: 'Passport Photo (3.5:4.5)', ratio: 3.5 / 4.5 },
    { name: 'Visa Photo (2:2)', ratio: 1 },
  ];

  const handleUpload = (files: File[]) => {
    if (files[0]) {
      setFile(files[0]);
      setFilePreview(URL.createObjectURL(files[0]));
      setResult(null);
    }
  };

  const processCrop = async () => {
    if (!file) return;
    setIsProcessing(true);
    try {
      const img = await loadImageFromFile(file);
      let cropW = img.width;
      let cropH = img.height;

      if (options.aspectRatio) {
        if (img.width / img.height > options.aspectRatio) {
          cropW = Math.round(img.height * options.aspectRatio);
        } else {
          cropH = Math.round(img.width / options.aspectRatio);
        }
      }

      const cropArea = {
        x: Math.round((img.width - cropW) / 2),
        y: Math.round((img.height - cropH) / 2),
        width: cropW,
        height: cropH
      };

      const res = await cropImage(file, cropArea, options);
      setResult(res);
    } catch (err) {
      console.error('Crop error:', err);
      alert('Error cropping image.');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="space-y-8">
      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <h1 className="text-2xl font-black text-slate-900 dark:text-white flex items-center gap-2">
          <Crop className="h-6 w-6 text-blue-600" />
          Image Cropper & Social Presets
        </h1>
        <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
          Crop images with aspect ratios for Instagram, YouTube, Passport, Visa, LinkedIn, X, TikTok, or custom dimensions.
        </p>
      </div>

      {!filePreview ? (
        <Dropzone onFilesAdded={handleUpload} multiple={false} label="Upload Image to Crop" />
      ) : (
        <div className="rounded-3xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900 space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">Crop Presets & Adjustments</h3>
            <button onClick={() => { setFile(null); setFilePreview(null); setResult(null); }} className="text-xs font-semibold text-red-500">
              Change Image
            </button>
          </div>

          <div className="flex flex-wrap gap-2">
            {presets.map((p) => (
              <button
                key={p.name}
                onClick={() => setOptions({ ...options, aspectRatioName: p.name, aspectRatio: p.ratio })}
                className={`rounded-xl px-3 py-1.5 text-xs font-semibold transition-all ${
                  options.aspectRatioName === p.name
                    ? 'bg-blue-600 text-white shadow'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300'
                }`}
              >
                {p.name}
              </button>
            ))}
          </div>

          <div className="flex items-center space-x-4">
            <button
              onClick={() => setOptions({ ...options, flipH: !options.flipH })}
              className="flex items-center gap-1.5 rounded-xl border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300"
            >
              <FlipHorizontal className="h-4 w-4" /> Flip Horizontal
            </button>
          </div>

          <button
            disabled={isProcessing}
            onClick={processCrop}
            className="w-full rounded-2xl bg-blue-600 py-3 text-sm font-bold text-white shadow-lg hover:bg-blue-700 flex items-center justify-center gap-2"
          >
            {isProcessing ? <RefreshCw className="h-5 w-5 animate-spin" /> : <Sparkles className="h-5 w-5" />}
            <span>Crop & Process Image</span>
          </button>
        </div>
      )}

      {result && (
        <div className="rounded-3xl border border-emerald-200 bg-emerald-50/40 p-6 dark:border-emerald-800/60 dark:bg-emerald-950/20">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">Cropped Result</h3>
              <p className="text-xs text-slate-500">{result.width} × {result.height} px • {formatBytes(result.size)}</p>
            </div>
            <a
              href={result.url}
              download="Cropped_Image.png"
              className="flex items-center gap-2 rounded-xl bg-emerald-600 px-5 py-2.5 text-xs font-bold text-white shadow hover:bg-emerald-700"
            >
              <Download className="h-4 w-4" /> Download Cropped Image
            </a>
          </div>
          <div className="overflow-hidden rounded-2xl bg-white p-3 shadow-inner dark:bg-slate-900 flex justify-center">
            <img src={result.url} alt="Cropped result" className="max-h-96 object-contain" />
          </div>
        </div>
      )}
    </div>
  );
};
