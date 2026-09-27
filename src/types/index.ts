export type ToolCategory = 
  | 'all'
  | 'documents'
  | 'optimization'
  | 'editing'
  | 'conversion'
  | 'ai';

export interface ToolCardInfo {
  id: string;
  slug: string;
  title: string;
  description: string;
  icon: string;
  category: ToolCategory;
  isPopular?: boolean;
  isStandout?: boolean;
  isAi?: boolean;
  seoTitle?: string;
  badge?: string;
}

export interface UploadedFileItem {
  id: string;
  file: File;
  previewUrl: string;
  name: string;
  size: number; // in bytes
  type: string;
  width?: number;
  height?: number;
  processedUrl?: string;
  processedSize?: number;
  processedWidth?: number;
  processedHeight?: number;
  processedType?: string;
}

export interface CnicCombinerOptions {
  layout: 'vertical' | 'horizontal';
  spacing: number;
  margin: number;
  backgroundColor: string;
  borderColor: string;
  borderWidth: number;
  borderRadius: number;
  alignment: 'center' | 'top' | 'bottom' | 'stretch';
  equalSizing: boolean;
  outputFormat: 'image/jpeg' | 'image/png' | 'application/pdf';
  targetFileSize: 'none' | '500kb' | '1mb' | '2mb' | 'custom';
  customTargetKb?: number;
}

export interface CompressOptions {
  mode: 'balanced' | 'max_quality' | 'smallest_size' | 'target_size';
  targetSizeKb: number;
  outputFormat: 'auto' | 'image/jpeg' | 'image/png' | 'image/webp';
  maxWidthOrHeight: number;
  quality: number; // 0.1 to 1.0
}

export interface CombinerOptions {
  layout: 'vertical' | 'horizontal' | 'grid';
  gridColumns: number;
  spacing: number;
  padding: number;
  backgroundColor: string;
  borderColor: string;
  borderWidth: number;
  borderRadius: number;
  alignment: 'center' | 'start' | 'end';
  imageFit: 'contain' | 'cover';
  outputFormat: 'image/jpeg' | 'image/png' | 'image/webp';
  quality: number;
}

export interface OverlayOptions {
  xPct: number; // 0 - 100
  yPct: number;
  scalePct: number; // 10 - 200
  opacityPct: number; // 0 - 100
  rotationDeg: number;
  blendMode: GlobalCompositeOperation;
}

export interface CropOptions {
  aspectRatioName: string;
  aspectRatio: number | null; // width / height, null for freeform
  rotation: number;
  flipH: boolean;
  flipV: boolean;
  zoom: number;
}

export interface ResizeOptions {
  mode: 'dimensions' | 'percentage' | 'filesize';
  width: number;
  height: number;
  lockAspectRatio: boolean;
  percentage: number;
  targetSizeKb: number;
}

export interface ConverterOptions {
  targetFormat: 'image/jpeg' | 'image/png' | 'image/webp' | 'image/avif';
  quality: number;
  backgroundColor: string;
}

export interface TextWatermarkOptions {
  mode: 'text' | 'image' | 'tiled';
  text: string;
  fontFamily: string;
  fontSize: number;
  isBold: boolean;
  isItalic: boolean;
  color: string;
  backgroundColor: string;
  outlineColor: string;
  outlineWidth: number;
  shadowColor: string;
  shadowBlur: number;
  opacityPct: number;
  rotationDeg: number;
  position: 'center' | 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right' | 'custom';
  xPct: number;
  yPct: number;
  tileSize: number;
  tileGap: number;
}

export interface ImagesToPdfOptions {
  pageSize: 'a4' | 'letter' | 'fit';
  orientation: 'portrait' | 'landscape';
  margin: number; // mm
  quality: number;
  onePerPage: boolean;
  title: string;
}

export interface PassportPhotoOptions {
  country: 'Pakistan' | 'USA' | 'UK' | 'Canada' | 'Australia' | 'Schengen' | 'UAE' | 'Saudi Arabia';
  bgColor: string;
  paperSize: 'single' | '4x6_grid' | 'a4_grid';
  border: boolean;
  removeBgFirst?: boolean;
}

export interface ScreenshotOptimizerOptions {
  padding: number;
  borderRadius: number;
  shadowBlur: number;
  bgGradient: string;
  outputFormat: 'image/webp' | 'image/png' | 'image/jpeg';
}

export interface BackgroundRemoverOptions {
  engine: 'ai' | 'color_key';
  tolerance: number; // 1 - 100
  featherRadius: number; // 0 - 10
  edgeOnly: boolean;
  keyColor?: { r: number; g: number; b: number } | null;
  bgType: 'transparent' | 'color' | 'gradient' | 'image';
  bgColor: string;
  bgGradient: string;
  bgImageFile?: File | null;
  addShadow: boolean;
  outputFormat: 'image/png' | 'image/webp' | 'image/jpeg';
}

export interface ImageEnhancerOptions {
  scale: 1 | 2 | 4;
  sharpness: number; // 0 - 100
  clarity: number; // 0 - 100
  contrast: number; // -50 to 50
  brightness: number; // -50 to 50
  saturation: number; // -50 to 50
  denoise: number; // 0 - 100
  outputFormat: 'image/jpeg' | 'image/png' | 'image/webp';
  quality: number;
}
