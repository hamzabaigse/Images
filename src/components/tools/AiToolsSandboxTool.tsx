'use client';

import React, { useState } from 'react';
import { Dropzone } from '../common/Dropzone';
import { 
  extractOcrText, 
  enhanceImage, 
  formatBytes 
} from '@/lib/imageUtils';
import { BackgroundRemoverTool } from './BackgroundRemoverTool';
import { ImageEnhancerOptions } from '@/types';
import { 
  Bot, 
  Sparkles, 
  RefreshCw, 
  Copy, 
  Check, 
  FileText, 
  Wand2, 
  Sliders, 
  Eye, 
  Download, 
  Languages, 
  CheckCircle2, 
  Zap,
  ZoomIn
} from 'lucide-react';

interface AiToolsSandboxToolProps {
  initialMode?: 'bg_remover' | 'enhancer' | 'ocr';
}

export const AiToolsSandboxTool: React.FC<AiToolsSandboxToolProps> = ({ initialMode = 'ocr' }) => {
  const [activeTab, setActiveTab] = useState<'bg_remover' | 'enhancer' | 'ocr'>(initialMode);
  const [file, setFile] = useState<File | null>(null);
  const [filePreview, setFilePreview] = useState<string | null>(null);

  // Common Processing State
  const [isProcessing, setIsProcessing] = useState(false);
  const [progressStatus, setProgressStatus] = useState<string>('');

  // OCR States
  const [ocrLanguage, setOcrLanguage] = useState<string>('eng');
  const [ocrResult, setOcrResult] = useState<{ text: string; confidence: number } | null>(null);
  const [copied, setCopied] = useState(false);

  // Enhancer States
  const [enhancerOptions, setEnhancerOptions] = useState<ImageEnhancerOptions>({
    scale: 2,
    sharpness: 65,
    clarity: 50,
    contrast: 15,
    brightness: 5,
    saturation: 15,
    denoise: 20,
    outputFormat: 'image/jpeg',
    quality: 0.95
  });
  const [enhancedResult, setEnhancedResult] = useState<{ url: string; size: number; width: number; height: number } | null>(null);
  const [showOriginal, setShowOriginal] = useState(false);

  const handleUpload = (files: File[]) => {
    if (files[0]) {
      setFile(files[0]);
      setFilePreview(URL.createObjectURL(files[0]));
      setOcrResult(null);
      setEnhancedResult(null);
    }
  };

  const runOcr = async () => {
    if (!file) return;
    setIsProcessing(true);
    setProgressStatus('Initializing Tesseract OCR engine...');
    try {
      const res = await extractOcrText(file, ocrLanguage, (pct, status) => {
        setProgressStatus(status);
      });
      setOcrResult(res);
    } catch (err: any) {
      console.error('OCR error:', err);
      alert('OCR processing failed: ' + (err?.message || 'Check image and try again'));
    } finally {
      setIsProcessing(false);
      setProgressStatus('');
    }
  };

  const runEnhancer = async () => {
    if (!file) return;
    setIsProcessing(true);
    setProgressStatus('Applying AI Super-Resolution & Unsharp Mask Filters...');
    try {
      const res = await enhanceImage(file, enhancerOptions);
      setEnhancedResult(res);
    } catch (err: any) {
      console.error('Enhancer error:', err);
      alert('Enhancement failed: ' + (err?.message || 'Error processing image'));
    } finally {
      setIsProcessing(false);
      setProgressStatus('');
    }
  };

  const handleCopyText = () => {
    if (ocrResult) {
      navigator.clipboard.writeText(ocrResult.text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleDownloadText = (extension: 'txt' | 'md') => {
    if (!ocrResult) return;
    const blob = new Blob([ocrResult.text], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `extracted_text_${file?.name.replace(/\.[^/.]+$/, '')}.${extension}`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // If Background Remover tab is active, deliver the full BackgroundRemoverTool!
  if (activeTab === 'bg_remover') {
    return (
      <div className="space-y-6">
        {/* Navigation Tabs */}
        <div className="flex space-x-2 border-b border-slate-200 dark:border-slate-800 pb-2">
          <button
            onClick={() => setActiveTab('bg_remover')}
            className="rounded-xl px-4 py-2 text-xs font-bold bg-blue-600 text-white shadow"
          >
            🔲 AI Background Remover
          </button>
          <button
            onClick={() => setActiveTab('enhancer')}
            className="rounded-xl px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800 transition-all"
          >
            ✨ AI 4K Upscaler & Enhancer
          </button>
          <button
            onClick={() => setActiveTab('ocr')}
            className="rounded-xl px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800 transition-all"
          >
            🔍 AI Document OCR Extractor
          </button>
        </div>

        <BackgroundRemoverTool />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Top Banner & Tabs */}
      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <div className="inline-flex items-center space-x-2 rounded-full bg-purple-100 px-3 py-1 text-xs font-bold text-purple-700 dark:bg-purple-900/60 dark:text-purple-300">
          <Bot className="h-3.5 w-3.5" />
          <span>Real Client-Side AI & Vision Suite</span>
        </div>
        <h1 className="mt-3 text-2xl font-black text-slate-900 dark:text-white sm:text-3xl">
          {activeTab === 'ocr' ? 'AI Document OCR Text Extractor' : 'AI Image Enhancer & 4K Super-Resolution'}
        </h1>
        <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
          {activeTab === 'ocr' 
            ? 'Extract editable text from CNICs, driver licenses, receipts, books, and invoices directly in your browser with high precision.'
            : 'Upscale low-resolution photos 2X or 4X, sharpen blurry edges, boost contrast, and recover fine textures.'}
        </p>

        {/* Tab Switchers */}
        <div className="mt-6 flex flex-wrap gap-2 border-b border-slate-200 dark:border-slate-800 pb-2">
          <button
            onClick={() => setActiveTab('bg_remover')}
            className="rounded-xl px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800 transition-all"
          >
            🔲 AI Background Remover
          </button>
          <button
            onClick={() => setActiveTab('enhancer')}
            className={`rounded-xl px-4 py-2 text-xs font-bold transition-all ${
              activeTab === 'enhancer' ? 'bg-purple-600 text-white shadow' : 'text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800'
            }`}
          >
            ✨ AI 4K Upscaler & Enhancer
          </button>
          <button
            onClick={() => setActiveTab('ocr')}
            className={`rounded-xl px-4 py-2 text-xs font-bold transition-all ${
              activeTab === 'ocr' ? 'bg-purple-600 text-white shadow' : 'text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800'
            }`}
          >
            🔍 AI Document OCR Extractor
          </button>
        </div>
      </div>

      {!filePreview ? (
        <Dropzone 
          onFilesAdded={handleUpload} 
          multiple={false} 
          label={activeTab === 'ocr' ? 'Upload Document Scan / Photo for OCR Extraction' : 'Upload Photo to Upscale & Enhance'} 
        />
      ) : (
        <div className="space-y-6">
          {/* Options Card */}
          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900 space-y-6">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4 dark:border-slate-800">
              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">Selected: {file?.name}</h3>
                <p className="text-xs text-slate-400">{file ? formatBytes(file.size) : ''}</p>
              </div>
              <button 
                onClick={() => { setFile(null); setFilePreview(null); setOcrResult(null); setEnhancedResult(null); }} 
                className="text-xs font-semibold text-red-500 hover:underline"
              >
                Change File
              </button>
            </div>

            {/* OCR Options */}
            {activeTab === 'ocr' && (
              <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5 flex items-center gap-1.5">
                      <Languages className="h-4 w-4 text-purple-600" />
                      <span>Document Language</span>
                    </label>
                    <select
                      value={ocrLanguage}
                      onChange={(e) => setOcrLanguage(e.target.value)}
                      className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2 px-3 text-xs font-semibold text-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-white focus:outline-none"
                    >
                      <option value="eng">English (General Documents, Receipts, Invoices)</option>
                      <option value="urd">Urdu (اردو - Official Documents, CNIC, Books)</option>
                      <option value="ara">Arabic (العربية)</option>
                      <option value="spa">Spanish (Español)</option>
                      <option value="fra">French (Français)</option>
                      <option value="deu">German (Deutsch)</option>
                    </select>
                  </div>

                  <div className="rounded-2xl bg-purple-50/50 p-3 border border-purple-100 text-[11px] text-purple-900 dark:bg-purple-950/20 dark:border-purple-900/40 dark:text-purple-300">
                    <div className="font-bold flex items-center gap-1 mb-1"><Zap className="h-3.5 w-3.5 text-purple-600" /> Privacy Guaranteed</div>
                    Tesseract.js runs 100% inside your browser WebAssembly sandbox. No document is ever sent to an external server.
                  </div>
                </div>

                <button
                  disabled={isProcessing}
                  onClick={runOcr}
                  className="w-full rounded-2xl bg-gradient-to-r from-purple-600 to-indigo-600 py-3.5 text-sm font-bold text-white shadow-lg hover:from-purple-700 hover:to-indigo-700 flex items-center justify-center gap-2"
                >
                  {isProcessing ? (
                    <>
                      <RefreshCw className="h-5 w-5 animate-spin" />
                      <span>{progressStatus || 'Recognizing Text...'}</span>
                    </>
                  ) : (
                    <>
                      <Wand2 className="h-5 w-5" />
                      <span>Extract Text from Document</span>
                    </>
                  )}
                </button>
              </div>
            )}

            {/* Enhancer & Upscaler Controls */}
            {activeTab === 'enhancer' && (
              <div className="space-y-6">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2">
                    Super-Resolution Scale Target
                  </label>
                  <div className="grid grid-cols-3 gap-3">
                    <button
                      type="button"
                      onClick={() => setEnhancerOptions({ ...enhancerOptions, scale: 1 })}
                      className={`rounded-2xl p-3 text-center border text-xs font-bold transition-all ${
                        enhancerOptions.scale === 1 
                          ? 'border-purple-600 bg-purple-50 text-purple-700 dark:bg-purple-950/40 dark:text-purple-300' 
                          : 'border-slate-200 text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300'
                      }`}
                    >
                      <div>1X Native</div>
                      <div className="text-[10px] font-normal text-slate-400 mt-0.5">Clarity & Sharpening</div>
                    </button>

                    <button
                      type="button"
                      onClick={() => setEnhancerOptions({ ...enhancerOptions, scale: 2 })}
                      className={`rounded-2xl p-3 text-center border text-xs font-bold transition-all ${
                        enhancerOptions.scale === 2 
                          ? 'border-purple-600 bg-purple-50 text-purple-700 dark:bg-purple-950/40 dark:text-purple-300' 
                          : 'border-slate-200 text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300'
                      }`}
                    >
                      <div className="flex items-center justify-center gap-1">2X HD <span className="rounded bg-purple-600 text-white px-1 text-[9px]">Popular</span></div>
                      <div className="text-[10px] font-normal text-slate-400 mt-0.5">Double Resolution</div>
                    </button>

                    <button
                      type="button"
                      onClick={() => setEnhancerOptions({ ...enhancerOptions, scale: 4 })}
                      className={`rounded-2xl p-3 text-center border text-xs font-bold transition-all ${
                        enhancerOptions.scale === 4 
                          ? 'border-purple-600 bg-purple-50 text-purple-700 dark:bg-purple-950/40 dark:text-purple-300' 
                          : 'border-slate-200 text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300'
                      }`}
                    >
                      <div>4X Ultra 4K</div>
                      <div className="text-[10px] font-normal text-slate-400 mt-0.5">Max Print Resolution</div>
                    </button>
                  </div>
                </div>

                {/* Sliders */}
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                  <div>
                    <div className="flex justify-between text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      <span>Sharpness</span>
                      <span>{enhancerOptions.sharpness}%</span>
                    </div>
                    <input
                      type="range"
                      min={0}
                      max={100}
                      value={enhancerOptions.sharpness}
                      onChange={(e) => setEnhancerOptions({ ...enhancerOptions, sharpness: Number(e.target.value) })}
                      className="w-full accent-purple-600"
                    />
                  </div>

                  <div>
                    <div className="flex justify-between text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      <span>Clarity & Micro-Contrast</span>
                      <span>{enhancerOptions.clarity}%</span>
                    </div>
                    <input
                      type="range"
                      min={0}
                      max={100}
                      value={enhancerOptions.clarity}
                      onChange={(e) => setEnhancerOptions({ ...enhancerOptions, clarity: Number(e.target.value) })}
                      className="w-full accent-purple-600"
                    />
                  </div>

                  <div>
                    <div className="flex justify-between text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      <span>Contrast</span>
                      <span>{enhancerOptions.contrast > 0 ? `+${enhancerOptions.contrast}` : enhancerOptions.contrast}</span>
                    </div>
                    <input
                      type="range"
                      min={-30}
                      max={50}
                      value={enhancerOptions.contrast}
                      onChange={(e) => setEnhancerOptions({ ...enhancerOptions, contrast: Number(e.target.value) })}
                      className="w-full accent-purple-600"
                    />
                  </div>

                  <div>
                    <div className="flex justify-between text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      <span>Brightness</span>
                      <span>{enhancerOptions.brightness > 0 ? `+${enhancerOptions.brightness}` : enhancerOptions.brightness}</span>
                    </div>
                    <input
                      type="range"
                      min={-30}
                      max={40}
                      value={enhancerOptions.brightness}
                      onChange={(e) => setEnhancerOptions({ ...enhancerOptions, brightness: Number(e.target.value) })}
                      className="w-full accent-purple-600"
                    />
                  </div>

                  <div>
                    <div className="flex justify-between text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      <span>Vibrance / Saturation</span>
                      <span>{enhancerOptions.saturation > 0 ? `+${enhancerOptions.saturation}` : enhancerOptions.saturation}%</span>
                    </div>
                    <input
                      type="range"
                      min={-40}
                      max={50}
                      value={enhancerOptions.saturation}
                      onChange={(e) => setEnhancerOptions({ ...enhancerOptions, saturation: Number(e.target.value) })}
                      className="w-full accent-purple-600"
                    />
                  </div>

                  <div>
                    <div className="flex justify-between text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      <span>Output Format</span>
                    </div>
                    <select
                      value={enhancerOptions.outputFormat}
                      onChange={(e) => setEnhancerOptions({ ...enhancerOptions, outputFormat: e.target.value as any })}
                      className="w-full rounded-xl border border-slate-200 bg-slate-50 py-1.5 px-2.5 text-xs font-semibold text-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                    >
                      <option value="image/jpeg">JPG (High Quality 95%)</option>
                      <option value="image/png">PNG (Lossless)</option>
                      <option value="image/webp">WebP (Compressed)</option>
                    </select>
                  </div>
                </div>

                <button
                  disabled={isProcessing}
                  onClick={runEnhancer}
                  className="w-full rounded-2xl bg-gradient-to-r from-purple-600 via-indigo-600 to-blue-600 py-3.5 text-sm font-bold text-white shadow-lg hover:from-purple-700 hover:to-blue-700 flex items-center justify-center gap-2"
                >
                  {isProcessing ? (
                    <>
                      <RefreshCw className="h-5 w-5 animate-spin" />
                      <span>{progressStatus || 'Enhancing & Upscaling Photo...'}</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="h-5 w-5" />
                      <span>Execute {enhancerOptions.scale}X AI Enhancement</span>
                    </>
                  )}
                </button>
              </div>
            )}
          </div>

          {/* OCR Result View */}
          {activeTab === 'ocr' && ocrResult && (
            <div className="rounded-3xl border border-purple-200 bg-white p-6 shadow-sm dark:border-purple-900/50 dark:bg-slate-900 space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-100 pb-4 dark:border-slate-800">
                <div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                    <FileText className="h-5 w-5 text-purple-600" /> 
                    <span>Extracted Text</span>
                    <span className="rounded-full bg-emerald-100 px-2.5 py-0.5 text-xs font-bold text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300">
                      {ocrResult.confidence}% Confidence
                    </span>
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    {ocrResult.text.split(/\s+/).filter(Boolean).length} words • {ocrResult.text.length} characters
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  <button
                    onClick={handleCopyText}
                    className="flex items-center gap-1.5 rounded-xl bg-purple-600 px-3.5 py-2 text-xs font-bold text-white shadow hover:bg-purple-700"
                  >
                    {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                    <span>{copied ? 'Copied!' : 'Copy to Clipboard'}</span>
                  </button>

                  <button
                    onClick={() => handleDownloadText('txt')}
                    className="flex items-center gap-1.5 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-bold text-slate-700 hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300"
                  >
                    <Download className="h-3.5 w-3.5" />
                    <span>Download .txt</span>
                  </button>
                </div>
              </div>

              <textarea
                rows={10}
                value={ocrResult.text}
                onChange={(e) => setOcrResult({ ...ocrResult, text: e.target.value })}
                className="w-full rounded-2xl border border-slate-200 bg-slate-50 p-4 font-mono text-xs text-slate-800 focus:outline-none dark:border-slate-700 dark:bg-slate-950 dark:text-purple-200 leading-relaxed"
              />
            </div>
          )}

          {/* Enhancer Result View */}
          {activeTab === 'enhancer' && enhancedResult && (
            <div className="rounded-3xl border border-emerald-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900 space-y-6">
              <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-100 pb-4 dark:border-slate-800">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-6 w-6 text-emerald-500" />
                  <div>
                    <h3 className="text-base font-bold text-slate-900 dark:text-white">Enhanced & Upscaled Result</h3>
                    <p className="text-xs text-slate-400">
                      {enhancedResult.width} × {enhancedResult.height} px • {formatBytes(enhancedResult.size)}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setShowOriginal(!showOriginal)}
                    className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300"
                  >
                    <Eye className="h-3.5 w-3.5" />
                    <span>{showOriginal ? 'Show Enhanced' : 'Hold to View Original'}</span>
                  </button>

                  <a
                    href={enhancedResult.url}
                    download={`enhanced_${enhancerOptions.scale}X_${file?.name}`}
                    className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-4 py-2 text-xs font-bold text-white shadow hover:bg-emerald-700"
                  >
                    <Download className="h-4 w-4" />
                    <span>Download Image</span>
                  </a>
                </div>
              </div>

              <div className="relative overflow-hidden rounded-2xl border border-slate-200 bg-slate-950 p-4 flex items-center justify-center min-h-[350px]">
                <img 
                  src={showOriginal && filePreview ? filePreview : enhancedResult.url} 
                  alt="Enhanced Result" 
                  className="max-h-[500px] w-auto max-w-full object-contain rounded-xl shadow-lg"
                />
                <div className="absolute top-3 left-3 rounded-lg bg-slate-900/80 backdrop-blur-md px-2.5 py-1 text-[11px] font-bold text-white">
                  {showOriginal ? 'Original Image' : `Enhanced ${enhancerOptions.scale}X`}
                </div>
              </div>
            </div>
          )}

          {/* Reference Preview when no result yet */}
          {!ocrResult && !enhancedResult && filePreview && (
            <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900 text-center">
              <h4 className="text-xs font-bold text-slate-500 mb-3 uppercase tracking-wider">Original Photo Preview</h4>
              <div className="flex justify-center">
                <img 
                  src={filePreview} 
                  alt="Original Preview" 
                  className="max-h-80 rounded-2xl object-contain shadow-md border border-slate-200 dark:border-slate-700" 
                />
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
