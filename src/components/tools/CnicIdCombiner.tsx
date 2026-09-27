'use client';

import React, { useState } from 'react';
import { Dropzone } from '../common/Dropzone';
import { CnicCombinerOptions } from '@/types';
import { combineCnicIdCards, formatBytes } from '@/lib/imageUtils';
import { 
  CreditCard, 
  Download, 
  Settings2, 
  CheckCircle2, 
  FileText, 
  Sparkles, 
  Sliders, 
  ArrowDownUp, 
  ArrowLeftRight,
  ShieldCheck,
  RefreshCw
} from 'lucide-react';

export const CnicIdCombiner: React.FC = () => {
  const [frontFile, setFrontFile] = useState<File | null>(null);
  const [backFile, setBackFile] = useState<File | null>(null);
  const [frontPreview, setFrontPreview] = useState<string | null>(null);
  const [backPreview, setBackPreview] = useState<string | null>(null);

  const [options, setOptions] = useState<CnicCombinerOptions>({
    layout: 'vertical',
    spacing: 20,
    margin: 30,
    backgroundColor: '#ffffff',
    borderColor: '#cbd5e1',
    borderWidth: 2,
    borderRadius: 16,
    alignment: 'center',
    equalSizing: true,
    outputFormat: 'image/jpeg',
    targetFileSize: '1mb',
    customTargetKb: 800
  });

  const [isProcessing, setIsProcessing] = useState(false);
  const [result, setResult] = useState<{ url: string; size: number; width: number; height: number; blob: Blob } | null>(null);

  const handleFrontUpload = (files: File[]) => {
    if (files[0]) {
      setFrontFile(files[0]);
      setFrontPreview(URL.createObjectURL(files[0]));
      setResult(null);
    }
  };

  const handleBackUpload = (files: File[]) => {
    if (files[0]) {
      setBackFile(files[0]);
      setBackPreview(URL.createObjectURL(files[0]));
      setResult(null);
    }
  };

  const processCombine = async () => {
    if (!frontFile || !backFile) return;
    setIsProcessing(true);
    try {
      const res = await combineCnicIdCards(frontFile, backFile, options);
      setResult(res);
    } catch (err) {
      console.error('Failed to combine CNIC:', err);
      alert('Error combining CNIC images. Please ensure valid image files.');
    } finally {
      setIsProcessing(false);
    }
  };

  const downloadResult = () => {
    if (!result) return;
    const a = document.createElement('a');
    a.href = result.url;
    const ext = options.outputFormat === 'application/pdf' ? 'pdf' : options.outputFormat === 'image/png' ? 'png' : 'jpg';
    a.download = `CNIC_Combined_Document.${ext}`;
    a.click();
  };

  return (
    <div className="space-y-8">
      
      {/* Title & SEO Description */}
      <div className="rounded-3xl border border-slate-200 bg-gradient-to-br from-blue-50/80 via-indigo-50/30 to-white p-6 dark:border-slate-800 dark:from-slate-900 dark:to-slate-900/50 sm:p-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center space-x-2 rounded-full bg-blue-100 px-3 py-1 text-xs font-bold text-blue-700 dark:bg-blue-900/60 dark:text-blue-300">
              <CreditCard className="h-3.5 w-3.5" />
              <span>Dedicated Tool for Pakistan & India ID Cards</span>
            </div>
            <h1 className="mt-3 text-2xl font-black text-slate-900 dark:text-white sm:text-3xl">
              CNIC / ID Card Combiner (Front + Back → One Image or PDF)
            </h1>
            <p className="mt-2 text-xs sm:text-sm text-slate-600 dark:text-slate-300 max-w-2xl leading-relaxed">
              Upload CNIC Front and Back images. PixelForge automatically aligns, resizes, joins them into a single page, and compresses the final file to stay <strong>under 1 MB or 500 KB</strong> for official online portal submissions.
            </p>
          </div>

          <div className="flex items-center space-x-2 rounded-2xl bg-white/80 p-3 shadow-sm border border-slate-200 dark:bg-slate-800 dark:border-slate-700">
            <ShieldCheck className="h-5 w-5 text-emerald-500" />
            <div className="text-[11px] text-slate-600 dark:text-slate-300">
              <span className="font-bold block text-slate-900 dark:text-white">100% Private Local Browser</span>
              Zero uploads to cloud servers
            </div>
          </div>
        </div>
      </div>

      {/* Upload Boxes Row */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        {/* Front Upload */}
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <div className="mb-3 flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <span className="flex h-5 w-5 items-center justify-center rounded-full bg-blue-600 text-[10px] font-extrabold text-white">1</span>
              CNIC Front Image
            </h3>
            {frontFile && (
              <span className="text-xs text-slate-500">{formatBytes(frontFile.size)}</span>
            )}
          </div>

          {frontPreview ? (
            <div className="relative group overflow-hidden rounded-xl border border-slate-200 bg-slate-950/5 p-2 dark:border-slate-700">
              <img src={frontPreview} alt="CNIC Front" className="h-48 w-full object-contain rounded-lg" />
              <button
                onClick={() => { setFrontFile(null); setFrontPreview(null); setResult(null); }}
                className="absolute top-3 right-3 rounded-full bg-red-600 p-1.5 text-white shadow-md hover:bg-red-700"
              >
                ✕
              </button>
            </div>
          ) : (
            <Dropzone
              onFilesAdded={handleFrontUpload}
              multiple={false}
              label="Upload CNIC Front"
              sublabel="PNG, JPG, WebP photos"
              compact
            />
          )}
        </div>

        {/* Back Upload */}
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <div className="mb-3 flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <span className="flex h-5 w-5 items-center justify-center rounded-full bg-blue-600 text-[10px] font-extrabold text-white">2</span>
              CNIC Back Image
            </h3>
            {backFile && (
              <span className="text-xs text-slate-500">{formatBytes(backFile.size)}</span>
            )}
          </div>

          {backPreview ? (
            <div className="relative group overflow-hidden rounded-xl border border-slate-200 bg-slate-950/5 p-2 dark:border-slate-700">
              <img src={backPreview} alt="CNIC Back" className="h-48 w-full object-contain rounded-lg" />
              <button
                onClick={() => { setBackFile(null); setBackPreview(null); setResult(null); }}
                className="absolute top-3 right-3 rounded-full bg-red-600 p-1.5 text-white shadow-md hover:bg-red-700"
              >
                ✕
              </button>
            </div>
          ) : (
            <Dropzone
              onFilesAdded={handleBackUpload}
              multiple={false}
              label="Upload CNIC Back"
              sublabel="PNG, JPG, WebP photos"
              compact
            />
          )}
        </div>
      </div>

      {/* Controls & Options Bar */}
      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2 mb-6">
          <Settings2 className="h-5 w-5 text-blue-600" />
          Layout & Compression Settings
        </h3>

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          
          {/* Layout Orientation */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-2">
              Layout Direction
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => setOptions({ ...options, layout: 'vertical' })}
                className={`flex items-center justify-center gap-1.5 rounded-xl border py-2.5 text-xs font-bold transition-all ${
                  options.layout === 'vertical'
                    ? 'border-blue-600 bg-blue-50 text-blue-700 dark:bg-blue-950/50 dark:text-blue-400'
                    : 'border-slate-200 text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300'
                }`}
              >
                <ArrowDownUp className="h-4 w-4" /> Vertical
              </button>
              <button
                onClick={() => setOptions({ ...options, layout: 'horizontal' })}
                className={`flex items-center justify-center gap-1.5 rounded-xl border py-2.5 text-xs font-bold transition-all ${
                  options.layout === 'horizontal'
                    ? 'border-blue-600 bg-blue-50 text-blue-700 dark:bg-blue-950/50 dark:text-blue-400'
                    : 'border-slate-200 text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300'
                }`}
              >
                <ArrowLeftRight className="h-4 w-4" /> Horizontal
              </button>
            </div>
          </div>

          {/* Target File Size */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-2">
              Target File Size (Auto-Compress)
            </label>
            <select
              value={options.targetFileSize}
              onChange={(e) => setOptions({ ...options, targetFileSize: e.target.value as any })}
              className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 px-3 text-xs font-semibold text-slate-900 focus:border-blue-500 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
            >
              <option value="1mb">Make under 1 MB (Recommended)</option>
              <option value="500kb">Make under 500 KB</option>
              <option value="2mb">Make under 2 MB</option>
              <option value="none">No compression limit</option>
            </select>
          </div>

          {/* Output Format */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-2">
              Output Format
            </label>
            <select
              value={options.outputFormat}
              onChange={(e) => setOptions({ ...options, outputFormat: e.target.value as any })}
              className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 px-3 text-xs font-semibold text-slate-900 focus:border-blue-500 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
            >
              <option value="image/jpeg">JPG Image</option>
              <option value="image/png">PNG Image</option>
              <option value="application/pdf">PDF Document (.pdf)</option>
            </select>
          </div>

          {/* Equal Sizing Toggle */}
          <div className="flex flex-col justify-end">
            <label className="flex items-center space-x-2.5 rounded-xl border border-slate-200 p-2.5 dark:border-slate-700 cursor-pointer">
              <input
                type="checkbox"
                checked={options.equalSizing}
                onChange={(e) => setOptions({ ...options, equalSizing: e.target.checked })}
                className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                Equalize Front & Back Dimensions
              </span>
            </label>
          </div>

        </div>

        {/* Generate Button */}
        <div className="mt-8 flex justify-center">
          <button
            disabled={!frontFile || !backFile || isProcessing}
            onClick={processCombine}
            className={`flex items-center space-x-2 rounded-2xl px-8 py-3.5 text-sm font-bold text-white shadow-xl transition-all ${
              !frontFile || !backFile || isProcessing
                ? 'bg-slate-300 cursor-not-allowed dark:bg-slate-800 dark:text-slate-500'
                : 'bg-gradient-to-r from-blue-600 to-indigo-600 shadow-blue-500/25 hover:from-blue-700 hover:to-indigo-700 hover:scale-[1.02]'
            }`}
          >
            {isProcessing ? (
              <>
                <RefreshCw className="h-5 w-5 animate-spin" />
                <span>Processing CNIC...</span>
              </>
            ) : (
              <>
                <Sparkles className="h-5 w-5" />
                <span>Combine CNIC Front + Back</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Result Display Box */}
      {result && (
        <div className="rounded-3xl border border-emerald-200 bg-emerald-50/30 p-6 dark:border-emerald-800/60 dark:bg-emerald-950/20">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
            <div>
              <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-bold text-emerald-800 dark:bg-emerald-900/80 dark:text-emerald-300">
                Success! Combined CNIC Ready
              </span>
              <h3 className="mt-2 text-xl font-bold text-slate-900 dark:text-white">
                Combined File Details
              </h3>
              <p className="text-xs text-slate-500">
                Final Size: <strong className="text-emerald-600 dark:text-emerald-400">{formatBytes(result.size)}</strong> ({result.width} × {result.height} px)
              </p>
            </div>

            <button
              onClick={downloadResult}
              className="flex items-center justify-center space-x-2 rounded-xl bg-emerald-600 px-6 py-3 text-xs font-bold text-white shadow-md hover:bg-emerald-700 transition-all"
            >
              <Download className="h-4 w-4" />
              <span>Download Combined CNIC ({formatBytes(result.size)})</span>
            </button>
          </div>

          {/* Preview Canvas render */}
          <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white p-4 shadow-inner dark:border-slate-700 dark:bg-slate-900 flex justify-center">
            {options.outputFormat === 'application/pdf' ? (
              <div className="py-12 text-center">
                <FileText className="h-16 w-16 text-red-500 mx-auto" />
                <p className="mt-2 text-xs font-bold text-slate-700 dark:text-slate-300">PDF Document Ready for Download</p>
              </div>
            ) : (
              <img src={result.url} alt="CNIC Combined Preview" className="max-h-96 object-contain rounded-xl" />
            )}
          </div>
        </div>
      )}

    </div>
  );
};
