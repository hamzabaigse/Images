import React from 'react';
import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { TOOLS_CATALOG } from '@/lib/toolsCatalog';

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
import Link from 'next/link';
import { ArrowLeft, CheckCircle2, ShieldCheck, Zap } from 'lucide-react';

interface PageProps {
  params: {
    slug: string;
  };
}

export async function generateStaticParams() {
  return TOOLS_CATALOG.map((tool) => ({
    slug: tool.slug,
  }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const tool = TOOLS_CATALOG.find((t) => t.slug === params.slug);
  if (!tool) {
    return {
      title: 'Tool Not Found - PixelForge',
    };
  }

  return {
    title: `${tool.seoTitle || tool.title} | Free Online PixelForge Tool`,
    description: tool.description,
    keywords: `${tool.title}, ${tool.slug.replace(/-/g, ' ')}, combine cnic front back, compress image under 1mb, privacy image saas`,
  };
}

export default function ToolSeoLandingPage({ params }: PageProps) {
  const tool = TOOLS_CATALOG.find((t) => t.slug === params.slug);
  if (!tool) return notFound();

  const renderTool = () => {
    switch (tool.slug) {
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
      <Header />

      <main className="flex-1 mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        
        {/* Breadcrumb Navigation */}
        <div className="mb-6 flex items-center space-x-2 text-xs text-slate-500">
          <Link href="/" className="hover:text-blue-600 flex items-center gap-1">
            <ArrowLeft className="h-3.5 w-3.5" /> Back to Dashboard
          </Link>
          <span>/</span>
          <span className="font-semibold text-slate-900 dark:text-white">{tool.title}</span>
        </div>

        {/* Real Interactive Tool Component */}
        <div className="mb-12">
          {renderTool()}
        </div>

        {/* SEO Landing Page Content & Usage Instructions */}
        <div className="mt-12 rounded-3xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900 sm:p-8 space-y-6">
          <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Zap className="h-5 w-5 text-blue-600" />
            How to use {tool.title}
          </h2>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3 text-xs text-slate-600 dark:text-slate-300">
            <div className="rounded-2xl bg-slate-50 p-4 border border-slate-100 dark:bg-slate-800/60 dark:border-slate-700">
              <div className="font-bold text-slate-900 dark:text-white mb-1">1. Select / Drop Files</div>
              Choose image files from your computer or mobile device.
            </div>
            <div className="rounded-2xl bg-slate-50 p-4 border border-slate-100 dark:bg-slate-800/60 dark:border-slate-700">
              <div className="font-bold text-slate-900 dark:text-white mb-1">2. Customize Settings</div>
              Adjust layout, target file size limits (&lt;1MB), quality or format.
            </div>
            <div className="rounded-2xl bg-slate-50 p-4 border border-slate-100 dark:bg-slate-800/60 dark:border-slate-700">
              <div className="font-bold text-slate-900 dark:text-white mb-1">3. Download 100% Private</div>
              Get your optimized file locally without any cloud uploads.
            </div>
          </div>

          <div className="border-t border-slate-200 pt-6 dark:border-slate-800 text-xs text-slate-500 leading-relaxed space-y-2">
            <h3 className="font-bold text-slate-900 dark:text-white text-sm">Why use PixelForge for {tool.title}?</h3>
            <p>
              PixelForge is designed for document-heavy users, freelancers, and businesses in Pakistan, India, and globally who need rapid, privacy-first online photo tools. Whether you are submitting a CNIC front & back photo to an online portal requiring a file under 1 MB, converting images to PDF, or creating passport photos, PixelForge handles processing 100% inside your web browser.
            </p>
          </div>
        </div>

      </main>

      <Footer />
    </div>
  );
}
