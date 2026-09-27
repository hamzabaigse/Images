import { ToolCardInfo } from '@/types';

export const TOOLS_CATALOG: ToolCardInfo[] = [
  {
    id: 'cnic-id-combiner',
    slug: 'combine-cnic-front-back',
    title: 'CNIC / ID Card Combiner',
    description: 'Merge front & back of CNIC or ID card into one single image or PDF. Target file size option (e.g. under 1MB).',
    icon: '🪪',
    category: 'documents',
    isPopular: true,
    isStandout: true,
    badge: 'Standout Feature',
    seoTitle: 'Combine CNIC / ID Card Front + Back Online Under 1MB'
  },
  {
    id: 'image-compressor',
    slug: 'image-compressor',
    title: 'Smart Image Compressor',
    description: 'Intelligent multi-image compressor. Reduce JPG/PNG/WebP file size to exact target size (e.g. 1MB, 500KB) with side-by-side preview.',
    icon: '🗜️',
    category: 'optimization',
    isPopular: true,
    seoTitle: 'Smart Image Compressor - Compress JPG, PNG, WebP to Target Size'
  },
  {
    id: 'image-combiner',
    slug: 'combine-images',
    title: 'Combine Images',
    description: 'Join multiple images vertically, horizontally, or in a grid layout with custom spacing and borders.',
    icon: '🔗',
    category: 'editing',
    isPopular: true,
    seoTitle: 'Combine Images Online - Merge Photos Vertically or Horizontally'
  },
  {
    id: 'image-overlay',
    slug: 'image-overlay',
    title: 'Image Overlay',
    description: 'Place one image on top of another with precision scale, opacity, rotation, and blend mode controls.',
    icon: '🖼️',
    category: 'editing',
    seoTitle: 'Image Overlay Tool - Place Image Over Another'
  },
  {
    id: 'image-cropper',
    slug: 'crop-image',
    title: 'Image Cropper',
    description: 'Crop photos to custom ratios or presets for Instagram, YouTube, LinkedIn, Passport & ID photos.',
    icon: '✂️',
    category: 'editing',
    isPopular: true,
    seoTitle: 'Free Online Image Cropper - Social Media & Document Presets'
  },
  {
    id: 'image-resizer',
    slug: 'image-resizer',
    title: 'Image Resizer',
    description: 'Resize image dimensions by exact pixels, percentage, or target file size.',
    icon: '📐',
    category: 'optimization',
    isPopular: true,
    seoTitle: 'Resize Image Online - By Pixels, Percentage or File Size'
  },
  {
    id: 'image-converter',
    slug: 'image-converter',
    title: 'Image Format Converter',
    description: 'Convert images instantly between JPG, PNG, WebP, GIF, BMP, and AVIF formats.',
    icon: '🔄',
    category: 'conversion',
    seoTitle: 'Image Format Converter - JPG, PNG, WebP, AVIF'
  },
  {
    id: 'add-text-watermark',
    slug: 'add-text-to-image',
    title: 'Add Text & Watermark',
    description: 'Add text, logos, or tiled confidential watermarks to your images with Canva-like custom styling.',
    icon: '📝',
    category: 'editing',
    seoTitle: 'Add Text & Watermark to Image Online'
  },
  {
    id: 'images-to-pdf',
    slug: 'image-to-pdf',
    title: 'Images → PDF',
    description: 'Convert JPG/PNG images into a single PDF document with custom margins, paper sizes, and compression.',
    icon: '📄',
    category: 'documents',
    isPopular: true,
    seoTitle: 'Convert Images to PDF Online - JPG/PNG to PDF'
  },
  {
    id: 'pdf-to-images',
    slug: 'pdf-to-jpg',
    title: 'PDF → Images',
    description: 'Extract PDF pages into high-resolution JPG or PNG images and download as a ZIP archive.',
    icon: '📑',
    category: 'documents',
    seoTitle: 'Convert PDF to Images (JPG/PNG) Online'
  },
  {
    id: 'passport-photo-maker',
    slug: 'passport-photo-maker',
    title: 'Passport Photo Maker',
    description: 'Crop and generate official passport/ID photo dimensions for Pakistan, USA, UK, Schengen, UAE, & more.',
    icon: '🛂',
    category: 'documents',
    isPopular: true,
    seoTitle: 'Online Passport Photo Maker - Official Country Size Presets'
  },
  {
    id: 'signature-remover',
    slug: 'signature-background-remover',
    title: 'Signature Clean & Crop',
    description: 'Upload handwritten signature, remove white background, auto-crop whitespace, and save transparent PNG.',
    icon: '✍️',
    category: 'documents',
    isPopular: true,
    seoTitle: 'Make Signature Background Transparent & Auto-Crop Online'
  },
  {
    id: 'screenshot-optimizer',
    slug: 'screenshot-optimizer',
    title: 'Screenshot Optimizer',
    description: 'Add beautiful gradient backgrounds, padding, drop shadows, and compress screenshots for blogs & docs.',
    icon: '📷',
    category: 'optimization',
    seoTitle: 'Screenshot Optimizer - Add Gradient Backgrounds & Padding'
  },
  {
    id: 'metadata-remover',
    slug: 'remove-exif-data',
    title: 'Metadata / EXIF Remover',
    description: 'Inspect and strip GPS location, camera information, and EXIF metadata from images for privacy.',
    icon: '🧹',
    category: 'optimization',
    seoTitle: 'Remove EXIF Metadata & GPS Location Data From Photos'
  },
  {
    id: 'image-to-base64',
    slug: 'image-to-base64',
    title: 'Image to Base64',
    description: 'Convert image files into Base64 data strings for HTML/CSS embedding.',
    icon: '🔢',
    category: 'conversion',
    seoTitle: 'Convert Image to Base64 String Online'
  },
  {
    id: 'batch-processor',
    slug: 'batch-processor',
    title: 'Batch Image Processor',
    description: 'Bulk process up to 100 images: batch resize, compress, format convert, and strip metadata into a ZIP.',
    icon: '📦',
    category: 'optimization',
    seoTitle: 'Batch Image Processor - Bulk Compress & Convert Images'
  },
  {
    id: 'bg-remover',
    slug: 'remove-image-background',
    title: 'Background Remover (AI)',
    description: 'Remove background from photos using smart edge extraction & background color replacement.',
    icon: '🔲',
    category: 'ai',
    isAi: true,
    seoTitle: 'AI Background Remover - Transparent Image Generator'
  },
  {
    id: 'ai-enhancer',
    slug: 'ai-image-enhancer',
    title: 'AI Image Enhancer & Upscaler',
    description: 'Upscale 2x/4x, sharpen, denoise, and improve brightness/contrast of photos.',
    icon: '✨',
    category: 'ai',
    isAi: true,
    seoTitle: 'AI Image Enhancer & 4K Upscaler'
  },
  {
    id: 'ai-ocr',
    slug: 'image-ocr-text-extractor',
    title: 'AI OCR Text Extractor',
    description: 'Extract editable text directly from document photos, receipts, or screenshots locally in your browser.',
    icon: '🔍',
    category: 'ai',
    isAi: true,
    seoTitle: 'Extract Text From Image Online - Free AI OCR Tool'
  }
];

export const CATEGORIES = [
  { id: 'all', name: 'All Tools', icon: '⚡' },
  { id: 'documents', name: 'ID & Documents', icon: '🪪' },
  { id: 'optimization', name: 'Optimization & Compress', icon: '🗜️' },
  { id: 'editing', name: 'Editing & Design', icon: '✂️' },
  { id: 'conversion', name: 'Format Conversion', icon: '🔄' },
  { id: 'ai', name: 'AI Powered', icon: '🤖' }
] as const;
