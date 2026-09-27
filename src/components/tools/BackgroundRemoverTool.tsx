'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Dropzone } from '../common/Dropzone';
import { BackgroundRemoverOptions } from '@/types';
import { 
  removeBackgroundAI, 
  removeBackgroundColorKey, 
  compositeBackground, 
  formatBytes,
  loadImageFromFile 
} from '@/lib/imageUtils';
import { 
  Sparkles, 
  Wand2, 
  Download, 
  RefreshCw, 
  CheckCircle2, 
  Layers, 
  Sliders, 
  Pipette, 
  Eye, 
  AlertCircle,
  Cpu,
  Image as ImageIcon
} from 'lucide-react';

const GRADIENT_PRESETS = [
  { id: 'studio', name: 'Studio Soft Glow', style: 'linear-gradient(135deg, #f8fafc, #cbd5e1)' },
  { id: 'sunset', name: 'Sunset Vibe', style: 'linear-gradient(135deg, #f97316, #ec4899)' },
  { id: 'ocean', name: 'Ocean Cyan', style: 'linear-gradient(135deg, #06b6d4, #3b82f6)' },
  { id: 'purple', name: 'Electric Purple', style: 'linear-gradient(135deg, #6366f1, #a855f7)' },
  { id: 'emerald', name: 'Deep Emerald', style: 'linear-gradient(135deg, #10b981, #047857)' },
  { id: 'dark', name: 'Dark Slate', style: 'linear-gradient(135deg, #0f172a, #1e293b)' },
];

const COLOR_SWATCHES = [
  { label: 'Pure White', value: '#ffffff' },
  { label: 'E-commerce Gray', value: '#f8fafc' },
  { label: 'Studio Blue', value: '#3b82f6' },
  { label: 'Passport Light Blue', value: '#e0f2fe' },
  { label: 'Midnight Black', value: '#0f172a' },
  { label: 'Emerald Mint', value: '#ecfdf5' },
  { label: 'Rose Blush', value: '#fff1f2' },
];

export const BackgroundRemoverTool: React.FC = () => {
  const [file, setFile] = useState<File | null>(null);
  const [filePreview, setFilePreview] = useState<string | null>(null);

  // Settings
  const [engine, setEngine] = useState<'ai' | 'color_key'>('ai');
  const [tolerance, setTolerance] = useState<number>(35);
  const [featherRadius, setFeatherRadius] = useState<number>(2);
  const [edgeOnly, setEdgeOnly] = useState<boolean>(true);
  const [keyColor, setKeyColor] = useState<{ r: number; g: number; b: number } | null>(null);

  // Background replacement
  const [bgType, setBgType] = useState<'transparent' | 'color' | 'gradient' | 'image'>('transparent');
  const [bgColor, setBgColor] = useState<string>('#ffffff');
  const [bgGradient, setBgGradient] = useState<string>('studio');
  const [bgImageFile, setBgImageFile] = useState<File | null>(null);
  const [addShadow, setAddShadow] = useState<boolean>(false);
  const [outputFormat, setOutputFormat] = useState<'image/png' | 'image/webp' | 'image/jpeg'>('image/png');

  // Processing state
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [progressMsg, setProgressMsg] = useState<string>('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Raw cutout blob (pure transparent PNG)
  const [cutoutBlob, setCutoutBlob] = useState<Blob | null>(null);
  const [cutoutUrl, setCutoutUrl] = useState<string | null>(null);

  // Final composited result
  const [finalResult, setFinalResult] = useState<{ url: string; size: number; width: number; height: number } | null>(null);
  const [showOriginal, setShowOriginal] = useState<boolean>(false);

  const previewCanvasRef = useRef<HTMLCanvasElement | null>(null);

  const handleUpload = (files: File[]) => {
    if (files[0]) {
      setFile(files[0]);
      setFilePreview(URL.createObjectURL(files[0]));
      setCutoutBlob(null);
      setCutoutUrl(null);
      setFinalResult(null);
      setErrorMsg(null);
      setKeyColor(null);
    }
  };

  // Step 1: Execute Background Removal
  const runBackgroundRemoval = async () => {
    if (!file) return;
    setIsProcessing(true);
    setErrorMsg(null);
    setProgressMsg('Starting background removal engine...');

    try {
      let transparentBlob: Blob;

      if (engine === 'ai') {
        setProgressMsg('Loading AI neural network model...');
        transparentBlob = await removeBackgroundAI(file, (status) => {
          setProgressMsg(status);
        });
      } else {
        setProgressMsg('Running edge flood-fill & color keying...');
        transparentBlob = await removeBackgroundColorKey(file, {
          tolerance,
          featherRadius,
          edgeOnly,
          keyColor
        });
      }

      setCutoutBlob(transparentBlob);
      const transparentUrl = URL.createObjectURL(transparentBlob);
      setCutoutUrl(transparentUrl);

      // Composite with current background options
      setProgressMsg('Compositing background & rendering output...');
      const comp = await compositeBackground(transparentBlob, {
        bgType,
        bgColor,
        bgGradient,
        bgImageFile,
        addShadow,
        outputFormat: bgType === 'transparent' ? 'image/png' : outputFormat
      });

      setFinalResult(comp);
      setProgressMsg('Completed successfully!');
    } catch (err: any) {
      console.error('Background removal error:', err);
      setErrorMsg(
        err?.message || 
        'Background removal encountered an issue. Try switching to the Instant Magic Key engine.'
      );
    } finally {
      setIsProcessing(false);
    }
  };

  // Re-composite whenever background choices change (without re-running the heavy AI model)
  useEffect(() => {
    if (!cutoutBlob) return;

    let isMounted = true;
    compositeBackground(cutoutBlob, {
      bgType,
      bgColor,
      bgGradient,
      bgImageFile,
      addShadow,
      outputFormat: bgType === 'transparent' ? 'image/png' : outputFormat
    }).then((comp) => {
      if (isMounted) {
        setFinalResult(comp);
      }
    }).catch(console.error);

    return () => {
      isMounted = false;
    };
  }, [bgType, bgColor, bgGradient, bgImageFile, addShadow, outputFormat, cutoutBlob]);

  // Click on original image to sample color for Magic Key
  const handleSampleCanvasClick = (e: React.MouseEvent<HTMLImageElement>) => {
    if (engine !== 'color_key') return;
    const imgElement = e.currentTarget;
    const rect = imgElement.getBoundingClientRect();
    const x = Math.floor(((e.clientX - rect.left) / rect.width) * imgElement.naturalWidth);
    const y = Math.floor(((e.clientY - rect.top) / rect.height) * imgElement.naturalHeight);

    const canvas = document.createElement('canvas');
    canvas.width = imgElement.naturalWidth;
    canvas.height = imgElement.naturalHeight;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.drawImage(imgElement, 0, 0);
    const pixel = ctx.getImageData(x, y, 1, 1).data;
    setKeyColor({ r: pixel[0], g: pixel[1], b: pixel[2] });
  };

  return (
    <div className="space-y-8">
      {/* Title & Header */}
      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <div className="inline-flex items-center space-x-2 rounded-full bg-blue-100 px-3 py-1 text-xs font-bold text-blue-700 dark:bg-blue-900/60 dark:text-blue-300">
          <Cpu className="h-3.5 w-3.5" />
          <span>Dual AI & High-Speed Magic Key Engine</span>
        </div>
        <h1 className="mt-3 text-2xl font-black text-slate-900 dark:text-white sm:text-3xl flex items-center gap-2">
          <span>AI Background Remover & Studio Replacement</span>
        </h1>
        <p className="mt-1 text-xs sm:text-sm text-slate-500 dark:text-slate-400">
          Extract people, products, pets, and cars from photos with zero loss in quality. Replace background with transparent alpha, solid studio colors, gradients, or custom scenery.
        </p>
      </div>

      {!filePreview ? (
        <Dropzone onFilesAdded={handleUpload} multiple={false} label="Upload Image to Remove Background" />
      ) : (
        <div className="space-y-6">
          {/* Main Controls Card */}
          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900 space-y-6">
            <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-100 pb-4 dark:border-slate-800">
              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">Selected Photo: {file?.name}</h3>
                <p className="text-xs text-slate-400">{file ? formatBytes(file.size) : ''}</p>
              </div>
              <button 
                onClick={() => { setFile(null); setFilePreview(null); setCutoutBlob(null); setFinalResult(null); }}
                className="rounded-xl border border-slate-200 px-3 py-1.5 text-xs font-semibold text-red-500 hover:bg-red-50 dark:border-slate-700 dark:hover:bg-red-950/20"
              >
                Change Photo
              </button>
            </div>

            {/* Engine Selector */}
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2">
                Extraction Engine
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setEngine('ai')}
                  className={`flex items-start gap-3 rounded-2xl p-4 border text-left transition-all ${
                    engine === 'ai'
                      ? 'border-blue-600 bg-blue-50/50 dark:border-blue-500 dark:bg-blue-950/30'
                      : 'border-slate-200 hover:bg-slate-50 dark:border-slate-800 dark:hover:bg-slate-800/40'
                  }`}
                >
                  <Sparkles className={`h-5 w-5 mt-0.5 ${engine === 'ai' ? 'text-blue-600' : 'text-slate-400'}`} />
                  <div>
                    <div className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                      <span>AI Neural Model (Recommended)</span>
                      <span className="rounded-md bg-blue-100 px-1.5 py-0.5 text-[10px] text-blue-700 font-bold dark:bg-blue-900 dark:text-blue-300">Smart</span>
                    </div>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 leading-snug">
                      Automatic foreground segmentation for complex portraits, hair, pets, products, and scenery.
                    </p>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => setEngine('color_key')}
                  className={`flex items-start gap-3 rounded-2xl p-4 border text-left transition-all ${
                    engine === 'color_key'
                      ? 'border-purple-600 bg-purple-50/50 dark:border-purple-500 dark:bg-purple-950/30'
                      : 'border-slate-200 hover:bg-slate-50 dark:border-slate-800 dark:hover:bg-slate-800/40'
                  }`}
                >
                  <Wand2 className={`h-5 w-5 mt-0.5 ${engine === 'color_key' ? 'text-purple-600' : 'text-slate-400'}`} />
                  <div>
                    <div className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                      <span>Instant Magic Key (100% Offline)</span>
                      <span className="rounded-md bg-purple-100 px-1.5 py-0.5 text-[10px] text-purple-700 font-bold dark:bg-purple-900 dark:text-purple-300">0.05s</span>
                    </div>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 leading-snug">
                      Ultra-fast edge flood-fill & chroma keying. Perfect for studio photos, e-commerce, logos, and signatures.
                    </p>
                  </div>
                </button>
              </div>
            </div>

            {/* Fine-Tuning Controls (When Magic Key Engine is Active) */}
            {engine === 'color_key' && (
              <div className="rounded-2xl border border-purple-200 bg-purple-50/40 p-4 dark:border-purple-900/50 dark:bg-purple-950/20 space-y-4">
                <div className="flex items-center justify-between text-xs font-bold text-purple-900 dark:text-purple-200">
                  <span className="flex items-center gap-1.5"><Sliders className="h-4 w-4" /> Magic Key Fine-Tuning</span>
                  <span className="text-[11px] font-normal text-purple-600 dark:text-purple-400">Click photo to sample color</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <div className="flex justify-between text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      <span>Sensitivity Tolerance: {tolerance}%</span>
                    </div>
                    <input 
                      type="range" 
                      min={5} 
                      max={90} 
                      value={tolerance} 
                      onChange={(e) => setTolerance(Number(e.target.value))} 
                      className="w-full accent-purple-600" 
                    />
                  </div>

                  <div>
                    <div className="flex justify-between text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      <span>Edge Feathering: {featherRadius}px</span>
                    </div>
                    <input 
                      type="range" 
                      min={0} 
                      max={8} 
                      value={featherRadius} 
                      onChange={(e) => setFeatherRadius(Number(e.target.value))} 
                      className="w-full accent-purple-600" 
                    />
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-4 text-xs">
                  <label className="flex items-center gap-2 font-semibold text-slate-700 dark:text-slate-300 cursor-pointer">
                    <input 
                      type="checkbox" 
                      checked={edgeOnly} 
                      onChange={(e) => setEdgeOnly(e.target.checked)}
                      className="rounded accent-purple-600" 
                    />
                    <span>Edge-Only Mode (Protects interior white/matching colors)</span>
                  </label>

                  {keyColor && (
                    <div className="flex items-center gap-2">
                      <span className="text-slate-500">Sampled Color:</span>
                      <div 
                        className="h-4 w-4 rounded-full border border-slate-300 shadow-sm" 
                        style={{ backgroundColor: `rgb(${keyColor.r}, ${keyColor.g}, ${keyColor.b})` }} 
                      />
                      <button 
                        onClick={() => setKeyColor(null)}
                        className="text-purple-600 font-bold hover:underline"
                      >
                        Reset to Auto
                      </button>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Run Button */}
            <button
              disabled={isProcessing}
              onClick={runBackgroundRemoval}
              className="w-full rounded-2xl bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 py-3.5 text-sm font-bold text-white shadow-lg hover:from-blue-700 hover:to-purple-700 transition-all flex items-center justify-center gap-2"
            >
              {isProcessing ? (
                <>
                  <RefreshCw className="h-5 w-5 animate-spin" />
                  <span>{progressMsg || 'Removing Background...'}</span>
                </>
              ) : (
                <>
                  <Sparkles className="h-5 w-5" />
                  <span>{cutoutBlob ? 'Re-Process Extraction' : 'Remove Background Now'}</span>
                </>
              )}
            </button>

            {errorMsg && (
              <div className="rounded-2xl bg-red-50 p-4 border border-red-200 text-xs text-red-700 dark:bg-red-950/40 dark:border-red-900/60 dark:text-red-300 flex items-start gap-2">
                <AlertCircle className="h-4 w-4 shrink-0 mt-0.5 text-red-500" />
                <div>
                  <div className="font-bold">Extraction notice:</div>
                  <div>{errorMsg}</div>
                </div>
              </div>
            )}
          </div>

          {/* Interactive Background Studio & Result (Shown once Cutout is Ready) */}
          {cutoutBlob && finalResult && (
            <div className="rounded-3xl border border-emerald-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900 space-y-6">
              
              <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-100 pb-4 dark:border-slate-800">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-6 w-6 text-emerald-500" />
                  <div>
                    <h3 className="text-base font-bold text-slate-900 dark:text-white">Cutout Ready</h3>
                    <p className="text-xs text-slate-400">
                      {finalResult.width} × {finalResult.height} px • {formatBytes(finalResult.size)}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setShowOriginal(!showOriginal)}
                    className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300"
                  >
                    <Eye className="h-3.5 w-3.5" />
                    <span>{showOriginal ? 'Show Cutout' : 'Hold to View Original'}</span>
                  </button>

                  <a
                    href={finalResult.url}
                    download={`pixelforge_${bgType === 'transparent' ? 'transparent' : 'studio'}_${file?.name.replace(/\.[^/.]+$/, '')}.${outputFormat === 'image/jpeg' ? 'jpg' : outputFormat === 'image/webp' ? 'webp' : 'png'}`}
                    className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-4 py-2 text-xs font-bold text-white shadow-md hover:bg-emerald-700"
                  >
                    <Download className="h-4 w-4" />
                    <span>Download Image</span>
                  </a>
                </div>
              </div>

              {/* Background Customizer Studio */}
              <div className="rounded-2xl border border-slate-200 bg-slate-50/60 p-4 dark:border-slate-800 dark:bg-slate-800/40 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-2">
                    <Layers className="h-4 w-4 text-blue-600" />
                    <span>Replace Background Backdrop</span>
                  </div>
                  <label className="flex items-center gap-1.5 text-xs font-semibold text-slate-600 dark:text-slate-400 cursor-pointer">
                    <input 
                      type="checkbox" 
                      checked={addShadow} 
                      onChange={(e) => setAddShadow(e.target.checked)}
                      className="rounded accent-blue-600" 
                    />
                    <span>Add Drop Shadow</span>
                  </label>
                </div>

                {/* Tabs */}
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() => setBgType('transparent')}
                    className={`rounded-xl px-3 py-1.5 text-xs font-bold transition-all ${
                      bgType === 'transparent' 
                        ? 'bg-blue-600 text-white shadow' 
                        : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-100 dark:bg-slate-900 dark:border-slate-700 dark:text-slate-300'
                    }`}
                  >
                    🏁 Transparent (Checkerboard)
                  </button>

                  <button
                    onClick={() => setBgType('color')}
                    className={`rounded-xl px-3 py-1.5 text-xs font-bold transition-all ${
                      bgType === 'color' 
                        ? 'bg-blue-600 text-white shadow' 
                        : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-100 dark:bg-slate-900 dark:border-slate-700 dark:text-slate-300'
                    }`}
                  >
                    🎨 Solid Colors
                  </button>

                  <button
                    onClick={() => setBgType('gradient')}
                    className={`rounded-xl px-3 py-1.5 text-xs font-bold transition-all ${
                      bgType === 'gradient' 
                        ? 'bg-blue-600 text-white shadow' 
                        : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-100 dark:bg-slate-900 dark:border-slate-700 dark:text-slate-300'
                    }`}
                  >
                    🌈 Studio Gradients
                  </button>

                  <button
                    onClick={() => setBgType('image')}
                    className={`rounded-xl px-3 py-1.5 text-xs font-bold transition-all ${
                      bgType === 'image' 
                        ? 'bg-blue-600 text-white shadow' 
                        : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-100 dark:bg-slate-900 dark:border-slate-700 dark:text-slate-300'
                    }`}
                  >
                    🏞️ Custom Backdrop Photo
                  </button>
                </div>

                {/* Solid Color Picker Bar */}
                {bgType === 'color' && (
                  <div className="flex flex-wrap items-center gap-3 pt-2">
                    <div className="flex flex-wrap items-center gap-2">
                      {COLOR_SWATCHES.map((swatch) => (
                        <button
                          key={swatch.value}
                          onClick={() => setBgColor(swatch.value)}
                          title={swatch.label}
                          style={{ backgroundColor: swatch.value }}
                          className={`h-7 w-7 rounded-full border border-slate-300 shadow-sm transition-transform hover:scale-110 ${
                            bgColor === swatch.value ? 'ring-2 ring-blue-600 ring-offset-2' : ''
                          }`}
                        />
                      ))}
                    </div>
                    <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-600 dark:text-slate-400">
                      <span>Custom:</span>
                      <input 
                        type="color" 
                        value={bgColor} 
                        onChange={(e) => setBgColor(e.target.value)}
                        className="h-7 w-9 cursor-pointer rounded border border-slate-300 bg-transparent p-0.5" 
                      />
                    </div>
                  </div>
                )}

                {/* Gradient Picker Bar */}
                {bgType === 'gradient' && (
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2 pt-2">
                    {GRADIENT_PRESETS.map((g) => (
                      <button
                        key={g.id}
                        onClick={() => setBgGradient(g.id)}
                        className={`h-10 rounded-xl border border-slate-300 shadow-sm transition-transform hover:scale-105 ${
                          bgGradient === g.id ? 'ring-2 ring-blue-600 ring-offset-2' : ''
                        }`}
                        style={{ background: g.style }}
                        title={g.name}
                      />
                    ))}
                  </div>
                )}

                {/* Custom Image Upload */}
                {bgType === 'image' && (
                  <div className="pt-2">
                    <input 
                      type="file" 
                      accept="image/*" 
                      onChange={(e) => {
                        if (e.target.files && e.target.files[0]) {
                          setBgImageFile(e.target.files[0]);
                        }
                      }}
                      className="text-xs text-slate-600 dark:text-slate-400 file:mr-2 file:rounded-xl file:border-0 file:bg-blue-600 file:px-3 file:py-1.5 file:text-xs file:font-semibold file:text-white hover:file:bg-blue-700" 
                    />
                  </div>
                )}

                {/* Output Format Picker */}
                <div className="flex flex-wrap items-center justify-between border-t border-slate-200 pt-3 dark:border-slate-700">
                  <span className="text-xs font-semibold text-slate-600 dark:text-slate-400">Download Format:</span>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => setOutputFormat('image/png')}
                      className={`rounded-lg px-2.5 py-1 text-xs font-bold ${
                        outputFormat === 'image/png' ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900' : 'bg-slate-200 text-slate-700 dark:bg-slate-700 dark:text-slate-300'
                      }`}
                    >
                      PNG (Lossless)
                    </button>
                    <button
                      onClick={() => setOutputFormat('image/webp')}
                      className={`rounded-lg px-2.5 py-1 text-xs font-bold ${
                        outputFormat === 'image/webp' ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900' : 'bg-slate-200 text-slate-700 dark:bg-slate-700 dark:text-slate-300'
                      }`}
                    >
                      WebP (Small)
                    </button>
                    {bgType !== 'transparent' && (
                      <button
                        onClick={() => setOutputFormat('image/jpeg')}
                        className={`rounded-lg px-2.5 py-1 text-xs font-bold ${
                          outputFormat === 'image/jpeg' ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900' : 'bg-slate-200 text-slate-700 dark:bg-slate-700 dark:text-slate-300'
                        }`}
                      >
                        JPG
                      </button>
                    )}
                  </div>
                </div>
              </div>

              {/* Live Preview Area with Checkerboard Background */}
              <div className="relative overflow-hidden rounded-2xl border border-slate-200 dark:border-slate-800 bg-[radial-gradient(#cbd5e1_1px,transparent_1px)] [background-size:16px_16px] p-6 dark:bg-[radial-gradient(#334155_1px,transparent_1px)] flex items-center justify-center min-h-[350px]">
                <img 
                  src={showOriginal && filePreview ? filePreview : finalResult.url} 
                  alt="Cutout Preview" 
                  className="max-h-[500px] w-auto max-w-full object-contain rounded-xl shadow-lg transition-all"
                />
                
                <div className="absolute top-3 left-3 rounded-lg bg-slate-900/75 backdrop-blur-md px-2.5 py-1 text-[11px] font-bold text-white shadow">
                  {showOriginal ? 'Original Photo' : bgType === 'transparent' ? 'Transparent Alpha' : 'Studio Composited'}
                </div>
              </div>

            </div>
          )}

          {/* Original Image Reference (Only shown before cutout is ready) */}
          {!cutoutBlob && filePreview && (
            <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900 text-center">
              <h4 className="text-xs font-bold text-slate-500 mb-3 uppercase tracking-wider">
                {engine === 'color_key' ? 'Original Photo (Click anywhere to sample background color)' : 'Original Photo Preview'}
              </h4>
              <div className="flex justify-center">
                <img 
                  src={filePreview} 
                  alt="Original Preview" 
                  onClick={handleSampleCanvasClick}
                  className={`max-h-96 rounded-2xl object-contain shadow-md border border-slate-200 dark:border-slate-700 ${engine === 'color_key' ? 'cursor-crosshair' : ''}`}
                />
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
