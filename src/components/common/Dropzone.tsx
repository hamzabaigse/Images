'use client';

import React, { useRef, useState } from 'react';
import { Upload, Image as ImageIcon, X, File, AlertCircle, Plus } from 'lucide-react';
import { formatBytes } from '@/lib/imageUtils';

interface DropzoneProps {
  onFilesAdded: (files: File[]) => void;
  accept?: string;
  multiple?: boolean;
  maxFiles?: number;
  label?: string;
  sublabel?: string;
  compact?: boolean;
}

export const Dropzone: React.FC<DropzoneProps> = ({
  onFilesAdded,
  accept = 'image/*',
  multiple = true,
  maxFiles = 100,
  label = 'Drag and drop your images here',
  sublabel = 'Supports JPG, PNG, WebP, GIF, BMP, HEIC & AVIF up to 50 MB each',
  compact = false
}) => {
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const files = Array.from(e.dataTransfer.files);
      onFilesAdded(files.slice(0, maxFiles));
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const files = Array.from(e.target.files);
      onFilesAdded(files.slice(0, maxFiles));
    }
  };

  return (
    <div
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      onClick={() => fileInputRef.current?.click()}
      className={`group relative cursor-pointer overflow-hidden rounded-2xl border-2 border-dashed transition-all duration-200 ${
        isDragOver
          ? 'border-blue-500 bg-blue-50/50 dark:border-blue-400 dark:bg-blue-950/20 shadow-lg scale-[1.005]'
          : 'border-slate-300 bg-slate-50/60 hover:border-blue-400 hover:bg-slate-100/80 dark:border-slate-700 dark:bg-slate-800/40 dark:hover:border-slate-600'
      } ${compact ? 'p-4' : 'p-8 sm:p-12'}`}
    >
      <input
        ref={fileInputRef}
        type="file"
        accept={accept}
        multiple={multiple}
        onChange={handleFileChange}
        className="hidden"
      />

      <div className="flex flex-col items-center justify-center text-center">
        <div className={`mb-3 flex items-center justify-center rounded-2xl bg-white shadow-sm ring-1 ring-slate-200 transition-transform group-hover:scale-110 dark:bg-slate-800 dark:ring-slate-700 ${compact ? 'h-10 w-10' : 'h-14 w-14'}`}>
          <Upload className={`text-blue-600 dark:text-blue-400 ${compact ? 'h-5 w-5' : 'h-7 w-7'}`} />
        </div>

        <h3 className={`font-bold text-slate-900 dark:text-white ${compact ? 'text-xs' : 'text-base sm:text-lg'}`}>
          {label}
        </h3>
        
        <p className={`mt-1 text-slate-500 dark:text-slate-400 ${compact ? 'text-[11px]' : 'text-xs sm:text-sm'}`}>
          {sublabel}
        </p>

        <div className="mt-4 inline-flex items-center space-x-2 rounded-xl bg-blue-600 px-4 py-2 text-xs font-semibold text-white shadow-md shadow-blue-500/20 hover:bg-blue-700 transition-all">
          <Plus className="h-4 w-4" />
          <span>Browse Files</span>
        </div>
      </div>
    </div>
  );
};
