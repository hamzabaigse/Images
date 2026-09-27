'use client';

import React, { useState } from 'react';
import { Dropzone } from '../common/Dropzone';
import { formatBytes } from '@/lib/imageUtils';
import JSZip from 'jszip';
import { 
  FileText, 
  Download, 
  RefreshCw, 
  CheckCircle2, 
  Layers, 
  Archive, 
  Sparkles 
} from 'lucide-react';

interface RenderedPage {
  pageNum: number;
  dataUrl: string;
  blob: Blob;
  width: number;
  height: number;
}

export const PdfToImagesTool: React.FC = () => {
  const [file, setFile] = useState<File | null>(null);
  const [format, setFormat] = useState<'image/jpeg' | 'image/png'>('image/jpeg');
  const [scale, setScale] = useState<number>(2.0); // 2x for sharp 300DPI quality
  
  const [isProcessing, setIsProcessing] = useState(false);
  const [progressMsg, setProgressMsg] = useState('');
  const [pages, setPages] = useState<RenderedPage[]>([]);
  const [zipBlob, setZipBlob] = useState<Blob | null>(null);

  const handleUpload = (files: File[]) => {
    if (files[0]) {
      setFile(files[0]);
      setPages([]);
      setZipBlob(null);
    }
  };

  const convertPdf = async () => {
    if (!file) return;
    setIsProcessing(true);
    setProgressMsg('Loading PDF rendering engine...');
    setPages([]);
    setZipBlob(null);

    try {
      const pdfjs = await import('pdfjs-dist');
      // Set worker source
      pdfjs.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.js`;

      const arrayBuffer = await file.arrayBuffer();
      const pdf = await pdfjs.getDocument({ data: arrayBuffer }).promise;
      const totalPages = pdf.numPages;

      const renderedPages: RenderedPage[] = [];

      for (let i = 1; i <= totalPages; i++) {
        setProgressMsg(`Rendering Page ${i} of ${totalPages}...`);
        const page = await pdf.getPage(i);
        const viewport = page.getViewport({ scale });

        const canvas = document.createElement('canvas');
        canvas.width = viewport.width;
        canvas.height = viewport.height;
        const ctx = canvas.getContext('2d');

        if (!ctx) continue;

        // White background for JPEG
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        await page.render({ canvasContext: ctx, viewport }).promise;

        const mime = format;
        const blob: Blob = await new Promise((resolve) => {
          canvas.toBlob((b) => resolve(b || new Blob()), mime, 0.92);
        });

        renderedPages.push({
          pageNum: i,
          dataUrl: canvas.toDataURL(mime, 0.92),
          blob,
          width: viewport.width,
          height: viewport.height
        });
      }

      setPages(renderedPages);

      // Automatically generate ZIP for easy 1-click bulk download
      if (renderedPages.length > 0) {
        setProgressMsg('Packaging ZIP archive...');
        const zip = new JSZip();
        const ext = format === 'image/jpeg' ? 'jpg' : 'png';
        const baseName = file.name.replace(/\.[^/.]+$/, '');

        renderedPages.forEach((p) => {
          zip.file(`${baseName}_page_${p.pageNum}.${ext}`, p.blob);
        });

        const content = await zip.generateAsync({ type: 'blob' });
        setZipBlob(content);
      }

      setProgressMsg('Completed!');
    } catch (err: any) {
      console.error('PDF conversion error:', err);
      alert('Error converting PDF: ' + (err?.message || 'Unsupported PDF format'));
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="space-y-8">
      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <h1 className="text-2xl font-black text-slate-900 dark:text-white flex items-center gap-2">
          <FileText className="h-6 w-6 text-blue-600" />
          PDF to Images Converter (High Resolution)
        </h1>
        <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
          Extract each page of your PDF documents into crystal-clear JPG or PNG images. Download individual pages or entire documents as a ZIP archive.
        </p>
      </div>

      {!file ? (
        <Dropzone onFilesAdded={handleUpload} multiple={false} label="Upload PDF Document (Click or Drag & Drop)" />
      ) : (
        <div className="rounded-3xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900 space-y-6">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4 dark:border-slate-800">
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">Selected PDF: {file.name}</h3>
              <p className="text-xs text-slate-400">{formatBytes(file.size)}</p>
            </div>
            <button 
              onClick={() => { setFile(null); setPages([]); setZipBlob(null); }}
              className="text-xs font-semibold text-red-500 hover:underline"
            >
              Change PDF
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Output Image Format</label>
              <select
                value={format}
                onChange={(e) => setFormat(e.target.value as any)}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 px-3 text-xs font-semibold text-slate-900 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
              >
                <option value="image/jpeg">JPG (Compact File Size)</option>
                <option value="image/png">PNG (Lossless High Quality)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Rendering Quality</label>
              <select
                value={scale}
                onChange={(e) => setScale(Number(e.target.value))}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 px-3 text-xs font-semibold text-slate-900 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
              >
                <option value={1.5}>Standard Resolution (150 DPI)</option>
                <option value={2.0}>High Definition (300 DPI - Recommended)</option>
                <option value={3.0}>Ultra Crisp (450 DPI)</option>
              </select>
            </div>
          </div>

          <button
            disabled={isProcessing}
            onClick={convertPdf}
            className="w-full rounded-2xl bg-blue-600 py-3.5 text-sm font-bold text-white shadow-lg hover:bg-blue-700 flex items-center justify-center gap-2"
          >
            {isProcessing ? (
              <>
                <RefreshCw className="h-5 w-5 animate-spin" />
                <span>{progressMsg || 'Converting PDF Pages...'}</span>
              </>
            ) : (
              <>
                <Sparkles className="h-5 w-5" />
                <span>Extract All Pages to Images</span>
              </>
            )}
          </button>
        </div>
      )}

      {/* Results Grid */}
      {pages.length > 0 && (
        <div className="space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-4 rounded-3xl border border-emerald-200 bg-emerald-50/40 p-6 dark:border-emerald-800/60 dark:bg-emerald-950/20">
            <div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <CheckCircle2 className="h-5 w-5 text-emerald-600" />
                <span>{pages.length} Pages Extracted Successfully</span>
              </h3>
              <p className="text-xs text-slate-500">Ready to download individually or as a single ZIP archive</p>
            </div>

            {zipBlob && (
              <a
                href={URL.createObjectURL(zipBlob)}
                download={`${file?.name.replace(/\.[^/.]+$/, '')}_all_pages.zip`}
                className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-5 py-2.5 text-xs font-bold text-white shadow hover:bg-emerald-700"
              >
                <Archive className="h-4 w-4" />
                <span>Download All ({pages.length} Pages) as ZIP ({formatBytes(zipBlob.size)})</span>
              </a>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
            {pages.map((page) => (
              <div 
                key={page.pageNum}
                className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900 flex flex-col"
              >
                <div className="p-3 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
                  <span className="font-bold text-slate-900 dark:text-white">Page {page.pageNum}</span>
                  <span className="text-slate-400">{formatBytes(page.blob.size)}</span>
                </div>
                <div className="p-4 bg-slate-50 dark:bg-slate-950 flex-1 flex items-center justify-center">
                  <img src={page.dataUrl} alt={`Page ${page.pageNum}`} className="max-h-64 object-contain shadow rounded" />
                </div>
                <div className="p-3 border-t border-slate-100 dark:border-slate-800">
                  <a
                    href={page.dataUrl}
                    download={`${file?.name.replace(/\.[^/.]+$/, '')}_page_${page.pageNum}.${format === 'image/jpeg' ? 'jpg' : 'png'}`}
                    className="w-full inline-flex items-center justify-center gap-1.5 rounded-xl border border-slate-200 bg-slate-50 py-2 text-xs font-bold text-slate-700 hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
                  >
                    <Download className="h-3.5 w-3.5" />
                    <span>Download Page {page.pageNum}</span>
                  </a>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
