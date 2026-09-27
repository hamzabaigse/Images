'use client';

import React, { useState } from 'react';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { TierModal } from '@/components/common/TierModal';
import { ApiModal } from '@/components/common/ApiModal';
import { Dropzone } from '@/components/common/Dropzone';
import { TOOLS_CATALOG, CATEGORIES } from '@/lib/toolsCatalog';
import { ToolCategory, ToolCardInfo } from '@/types';

// Tool Components
import { CnicIdCombiner } from '@/components/tools/CnicIdCombiner';
import { SmartCompressor } from '@/components/tools/SmartCompressor';
import { ImageCombinerTool } from '@/components/tools/ImageCombinerTool';
import { ImageOverlayTool } from '@/components/tools/ImageOverlayTool';
import { ImageCropperTool } from '@/components/tools/ImageCropperTool';
import { ImageResizerTool } from '@/components/tools/ImageResizerTool';
import { ImageConverterTool } from '@/components/tools/ImageConverterTool';
import { AddTextWatermarkTool } from '@/components/tools/AddTextWatermarkTool';
import { ImagesToPdfTool } from '@/components/tools/ImagesToPdfTool';
import { PassportPhotoTool } from '@/components/tools/PassportPhotoTool';
import { SignatureTool } from '@/components/tools/SignatureTool';
import { ScreenshotOptimizerTool } from '@/components/tools/ScreenshotOptimizerTool';
import { MetadataRemoverTool } from '@/components/tools/MetadataRemoverTool';
import { BatchProcessorTool } from '@/components/tools/BatchProcessorTool';
import { AiToolsSandboxTool } from '@/components/tools/AiToolsSandboxTool';
import { BackgroundRemoverTool } from '@/components/tools/BackgroundRemoverTool';
import { PdfToImagesTool } from '@/components/tools/PdfToImagesTool';
import { ImageToBase64Tool } from '@/components/tools/ImageToBase64Tool';

import { 
  Sparkles, 
  ShieldCheck, 
  Zap, 
  ArrowRight, 
  CheckCircle2, 
  Layers, 
  CreditCard,
  X,
  Search
} from 'lucide-react';

export default function Home() {
  const [selectedCategory, setSelectedCategory] = useState<ToolCategory>('all');
  const [activeToolSlug, setActiveToolSlug] = useState<string | null>(null);
  
  const [isPricingOpen, setIsPricingOpen] = useState(false);
  const [isApiOpen, setIsApiOpen] = useState(false);

  const filteredTools = selectedCategory === 'all'
    ? TOOLS_CATALOG
    : TOOLS_CATALOG.filter(t => t.category === selectedCategory);

  const activeToolObj = TOOLS_CATALOG.find(t => t.slug === activeToolSlug);

  const renderActiveTool = () => {
    if (!activeToolSlug) return null;

    switch (activeToolSlug) {
      case 'combine-cnic-front-back':
        return <CnicIdCombiner />;
      case 'image-compressor':
        return <SmartCompressor />;
      case 'combine-images':
        return <ImageCombinerTool />;
      case 'image-overlay':
        return <ImageOverlayTool />;
      case 'crop-image':
        return <ImageCropperTool />;
      case 'image-resizer':
        return <ImageResizerTool />;
      case 'image-converter':
        return <ImageConverterTool />;
      case 'add-text-to-image':
        return <AddTextWatermarkTool />;
      case 'image-to-pdf':
        return <ImagesToPdfTool />;
      case 'passport-photo-maker':
        return <PassportPhotoTool />;
      case 'signature-background-remover':
        return <SignatureTool />;
      case 'screenshot-optimizer':
        return <ScreenshotOptimizerTool />;
      case 'remove-exif-data':
        return <MetadataRemoverTool />;
      case 'batch-processor':
        return <BatchProcessorTool />;
      case 'remove-image-background':
        return <BackgroundRemoverTool />;
      case 'pdf-to-jpg':
        return <PdfToImagesTool />;
      case 'image-to-base64':
        return <ImageToBase64Tool />;
      case 'ai-image-enhancer':
        return <AiToolsSandboxTool initialMode="enhancer" />;
      case 'image-ocr-text-extractor':
        return <AiToolsSandboxTool initialMode="ocr" />;
      default:
        return <SmartCompressor />;
    }
  };

  return (
    <div className="flex min-h-screen flex-col bg-slate-50 dark:bg-slate-950">
      
      {/* Header */}
      <Header
        onOpenPricing={() => setIsPricingOpen(true)}
        onOpenApi={() => setIsApiOpen(true)}
        onSelectTool={(slug) => {
          setActiveToolSlug(slug);
          window.scrollTo({ top: 400, behavior: 'smooth' });
        }}
      />

      <main className="flex-1 pb-20">
        
        {/* Active Tool Workspace Section (If a tool is selected) */}
        {activeToolSlug ? (
          <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
            <div className="mb-4 flex items-center justify-between">
              <button
                onClick={() => setActiveToolSlug(null)}
                className="inline-flex items-center space-x-2 rounded-xl bg-white px-4 py-2 text-xs font-bold text-slate-700 shadow-sm border border-slate-200 hover:bg-slate-100 dark:bg-slate-900 dark:border-slate-800 dark:text-slate-300 dark:hover:bg-slate-800"
              >
                <span>← Back to All Tools</span>
              </button>
              <div className="text-xs font-semibold text-slate-500">
                Active Tool: <strong className="text-slate-900 dark:text-white">{activeToolObj?.title}</strong>
              </div>
            </div>

            {/* Tool Render Component */}
            {renderActiveTool()}
          </div>
        ) : (
          <>
            {/* Hero Section */}
            <div className="relative overflow-hidden border-b border-slate-200 bg-gradient-to-b from-blue-50/60 via-white to-slate-50 px-4 py-16 dark:border-slate-800 dark:from-slate-900 dark:to-slate-950 sm:px-6 lg:px-8 lg:py-24">
              <div className="mx-auto max-w-5xl text-center">
                
                {/* Standout Badge */}
                <button
                  onClick={() => setActiveToolSlug('combine-cnic-front-back')}
                  className="inline-flex items-center space-x-2 rounded-full bg-blue-100 px-4 py-1.5 text-xs font-bold text-blue-700 hover:bg-blue-200 dark:bg-blue-900/60 dark:text-blue-300 transition-transform hover:scale-105"
                >
                  <CreditCard className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                  <span>Popular Tool: Combine CNIC Front + Back Under 1 MB</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </button>

                <h1 className="mt-6 text-4xl font-black tracking-tight text-slate-900 dark:text-white sm:text-5xl lg:text-6xl">
                  Every Image Tool You Need. <br className="hidden sm:inline" />
                  <span className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent">
                    In One Privacy-First Place.
                  </span>
                </h1>

                <p className="mx-auto mt-4 max-w-2xl text-sm sm:text-base text-slate-600 dark:text-slate-300 leading-relaxed">
                  Compress, resize, crop, combine CNICs, convert formats, annotate, remove signatures & optimize photos online without installing software.
                </p>

                {/* Universal Dropzone Landing Area */}
                <div className="mx-auto mt-10 max-w-3xl">
                  <Dropzone
                    onFilesAdded={(files) => {
                      setActiveToolSlug('image-compressor');
                    }}
                    label="Drop your images here to start"
                    sublabel="Supports JPG, PNG, WebP, GIF, BMP, HEIC & AVIF. 100% Local Browser Security."
                  />
                </div>

                {/* Security bullets */}
                <div className="mt-6 flex flex-wrap items-center justify-center gap-6 text-xs text-slate-500 dark:text-slate-400">
                  <div className="flex items-center gap-1.5">
                    <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                    <span>Zero Upload Server Storage</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                    <span>Exact Target File Size (&lt; 1MB)</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                    <span>No Software Install Required</span>
                  </div>
                </div>

              </div>
            </div>

            {/* Featured Standout Banner: CNIC Combiner Spotlight */}
            <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
              <div 
                onClick={() => setActiveToolSlug('combine-cnic-front-back')}
                className="group cursor-pointer overflow-hidden rounded-3xl border border-blue-200 bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 p-6 sm:p-8 text-white shadow-xl hover:shadow-2xl transition-all"
              >
                <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
                  <div>
                    <div className="inline-flex items-center space-x-2 rounded-full bg-white/20 px-3 py-1 text-xs font-bold text-white backdrop-blur-sm">
                      <Sparkles className="h-3.5 w-3.5 text-amber-300" />
                      <span>Standout SEO Feature</span>
                    </div>
                    <h2 className="mt-3 text-2xl font-black sm:text-3xl">
                      🪪 CNIC / ID Card Combiner (Front + Back → 1 Page)
                    </h2>
                    <p className="mt-2 text-xs sm:text-sm text-blue-100 max-w-xl leading-relaxed">
                      Easily upload CNIC Front and Back images. SaaS automatically aligns them horizontally or vertically and compresses the output image until it meets your target limit (e.g. under 1 MB or 500 KB) for online document forms.
                    </p>
                  </div>

                  <button className="inline-flex items-center space-x-2 rounded-2xl bg-white px-6 py-3.5 text-xs font-extrabold text-blue-700 shadow-md group-hover:bg-blue-50 transition-colors shrink-0">
                    <span>Try CNIC Combiner Now</span>
                    <ArrowRight className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>

            {/* Dashboard Tools Grid Section */}
            <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
              
              {/* Category Filter Tabs */}
              <div className="flex items-center justify-between border-b border-slate-200 pb-4 dark:border-slate-800">
                <div className="flex space-x-1 sm:space-x-2 overflow-x-auto pb-2 sm:pb-0 scrollbar-none">
                  {CATEGORIES.map((cat) => (
                    <button
                      key={cat.id}
                      onClick={() => setSelectedCategory(cat.id as ToolCategory)}
                      className={`flex items-center space-x-1.5 rounded-xl px-3.5 py-2 text-xs font-bold transition-all whitespace-nowrap ${
                        selectedCategory === cat.id
                          ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20'
                          : 'bg-white text-slate-700 hover:bg-slate-100 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800'
                      }`}
                    >
                      <span>{cat.icon}</span>
                      <span>{cat.name}</span>
                    </button>
                  ))}
                </div>

                <div className="text-xs text-slate-500 hidden md:block">
                  Showing <strong>{filteredTools.length}</strong> image tools
                </div>
              </div>

              {/* Tools Card Grid */}
              <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {filteredTools.map((tool) => (
                  <div
                    key={tool.id}
                    onClick={() => setActiveToolSlug(tool.slug)}
                    className="group relative flex flex-col justify-between rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition-all duration-200 hover:-translate-y-1 hover:border-blue-400 hover:shadow-xl dark:border-slate-800 dark:bg-slate-900 dark:hover:border-blue-500/50 cursor-pointer"
                  >
                    <div>
                      <div className="flex items-start justify-between">
                        <span className="text-3xl p-2 rounded-xl bg-slate-50 dark:bg-slate-800 group-hover:scale-110 transition-transform">
                          {tool.icon}
                        </span>

                        {tool.badge ? (
                          <span className="rounded-full bg-blue-100 px-2.5 py-0.5 text-[10px] font-bold text-blue-700 dark:bg-blue-950 dark:text-blue-300">
                            {tool.badge}
                          </span>
                        ) : tool.isPopular ? (
                          <span className="rounded-full bg-amber-100 px-2.5 py-0.5 text-[10px] font-bold text-amber-800 dark:bg-amber-950 dark:text-amber-300 flex items-center gap-1">
                            <Zap className="h-3 w-3 fill-amber-500 text-amber-500" /> Popular
                          </span>
                        ) : tool.isAi ? (
                          <span className="rounded-full bg-purple-100 px-2.5 py-0.5 text-[10px] font-bold text-purple-700 dark:bg-purple-950 dark:text-purple-300">
                            AI Powered
                          </span>
                        ) : null}
                      </div>

                      <h3 className="mt-4 text-base font-bold text-slate-900 group-hover:text-blue-600 dark:text-white dark:group-hover:text-blue-400">
                        {tool.title}
                      </h3>

                      <p className="mt-1.5 text-xs text-slate-500 dark:text-slate-400 leading-relaxed line-clamp-3">
                        {tool.description}
                      </p>
                    </div>

                    <div className="mt-6 flex items-center justify-between border-t border-slate-100 pt-3 text-xs font-bold text-blue-600 dark:border-slate-800 dark:text-blue-400">
                      <span>Launch Tool</span>
                      <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                    </div>
                  </div>
                ))}
              </div>

            </div>
          </>
        )}

      </main>

      {/* Footer */}
      <Footer onSelectTool={(slug) => {
        setActiveToolSlug(slug);
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }} />

      {/* Pricing Tier Modal */}
      <TierModal isOpen={isPricingOpen} onClose={() => setIsPricingOpen(false)} />

      {/* Developer API Modal */}
      <ApiModal isOpen={isApiOpen} onClose={() => setIsApiOpen(false)} />

    </div>
  );
}
