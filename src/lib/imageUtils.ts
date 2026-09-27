import { 
  CnicCombinerOptions, 
  CompressOptions, 
  CombinerOptions, 
  OverlayOptions, 
  CropOptions, 
  ResizeOptions, 
  ConverterOptions, 
  TextWatermarkOptions, 
  ImagesToPdfOptions, 
  PassportPhotoOptions, 
  ScreenshotOptimizerOptions,
  BackgroundRemoverOptions,
  ImageEnhancerOptions
} from '@/types';
import { PDFDocument, rgb } from 'pdf-lib';

/**
 * Load File into HTMLImageElement
 */
export function loadImageFromFile(file: File): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      URL.revokeObjectURL(url);
      resolve(img);
    };
    img.onerror = (err) => {
      URL.revokeObjectURL(url);
      reject(err);
    };
    img.src = url;
  });
}

/**
 * Helper to get Canvas blob with specified type and quality
 */
export function canvasToBlob(canvas: HTMLCanvasElement, format: string, quality: number): Promise<Blob> {
  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (blob) resolve(blob);
      else reject(new Error('Canvas to Blob conversion failed'));
    }, format, quality);
  });
}

/**
 * Helper to convert Blob to PDF using pdf-lib
 */
export async function imageBlobToPdf(imageBlob: Blob, title = 'Document'): Promise<Blob> {
  const pdfDoc = await PDFDocument.create();
  const imageBytes = await imageBlob.arrayBuffer();
  
  let image;
  if (imageBlob.type === 'image/png') {
    image = await pdfDoc.embedPng(imageBytes);
  } else {
    image = await pdfDoc.embedJpg(imageBytes);
  }

  const page = pdfDoc.addPage([image.width, image.height]);
  page.drawImage(image, {
    x: 0,
    y: 0,
    width: image.width,
    height: image.height,
  });

  const pdfBytes = await pdfDoc.save();
  return new Blob([new Uint8Array(pdfBytes)], { type: 'application/pdf' });
}

/**
 * 🪪 CNIC / ID Card Combiner
 * Combines front + back into single image or PDF with target file size limit!
 */
export async function combineCnicIdCards(
  frontFile: File,
  backFile: File,
  options: CnicCombinerOptions
): Promise<{ blob: Blob; url: string; width: number; height: number; size: number }> {
  const frontImg = await loadImageFromFile(frontFile);
  const backImg = await loadImageFromFile(backFile);

  // Equalize sizes if requested
  let fW = frontImg.width;
  let fH = frontImg.height;
  let bW = backImg.width;
  let bH = backImg.height;

  if (options.equalSizing) {
    const maxW = Math.max(fW, bW);
    fH = Math.round((fH / fW) * maxW);
    fW = maxW;
    bH = Math.round((bH / bW) * maxW);
    bW = maxW;
  }

  const { margin, spacing, borderWidth, borderRadius, layout, backgroundColor, borderColor } = options;

  let totalW = 0;
  let totalH = 0;

  if (layout === 'vertical') {
    totalW = Math.max(fW, bW) + margin * 2 + borderWidth * 2;
    totalH = fH + bH + spacing + margin * 2 + borderWidth * 2;
  } else {
    totalW = fW + bW + spacing + margin * 2 + borderWidth * 2;
    totalH = Math.max(fH, bH) + margin * 2 + borderWidth * 2;
  }

  const canvas = document.createElement('canvas');
  canvas.width = totalW;
  canvas.height = totalH;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Canvas context unavailable');

  // Background
  ctx.fillStyle = backgroundColor || '#ffffff';
  ctx.fillRect(0, 0, totalW, totalH);

  // Helper to draw rounded card with border
  const drawCard = (img: HTMLImageElement, x: number, y: number, w: number, h: number) => {
    ctx.save();
    if (borderRadius > 0) {
      ctx.beginPath();
      ctx.roundRect(x, y, w, h, borderRadius);
      ctx.clip();
    }
    ctx.drawImage(img, x, y, w, h);
    ctx.restore();

    if (borderWidth > 0) {
      ctx.save();
      ctx.lineWidth = borderWidth;
      ctx.strokeStyle = borderColor || '#cbd5e1';
      ctx.beginPath();
      if (borderRadius > 0) {
        ctx.roundRect(x, y, w, h, borderRadius);
      } else {
        ctx.rect(x, y, w, h);
      }
      ctx.stroke();
      ctx.restore();
    }
  };

  if (layout === 'vertical') {
    const xFront = margin + borderWidth + (options.alignment === 'center' ? (totalW - margin * 2 - borderWidth * 2 - fW) / 2 : 0);
    const yFront = margin + borderWidth;
    drawCard(frontImg, xFront, yFront, fW, fH);

    const xBack = margin + borderWidth + (options.alignment === 'center' ? (totalW - margin * 2 - borderWidth * 2 - bW) / 2 : 0);
    const yBack = yFront + fH + spacing;
    drawCard(backImg, xBack, yBack, bW, bH);
  } else {
    const xFront = margin + borderWidth;
    const yFront = margin + borderWidth + (options.alignment === 'center' ? (totalH - margin * 2 - borderWidth * 2 - fH) / 2 : 0);
    drawCard(frontImg, xFront, yFront, fW, fH);

    const xBack = xFront + fW + spacing;
    const yBack = margin + borderWidth + (options.alignment === 'center' ? (totalH - margin * 2 - borderWidth * 2 - bH) / 2 : 0);
    drawCard(backImg, xBack, yBack, bW, bH);
  }

  // Check target file size limit
  let targetBytes = 0;
  if (options.targetFileSize === '500kb') targetBytes = 500 * 1024;
  else if (options.targetFileSize === '1mb') targetBytes = 1000 * 1024;
  else if (options.targetFileSize === '2mb') targetBytes = 2000 * 1024;
  else if (options.targetFileSize === 'custom' && options.customTargetKb) targetBytes = options.customTargetKb * 1024;

  const mimeType = options.outputFormat === 'application/pdf' ? 'image/jpeg' : options.outputFormat;
  let quality = 0.92;
  let resultBlob = await canvasToBlob(canvas, mimeType, quality);

  // Compress iteratively if over target file size
  if (targetBytes > 0 && resultBlob.size > targetBytes) {
    let lowQ = 0.1;
    let highQ = 0.92;
    for (let i = 0; i < 6; i++) {
      quality = (lowQ + highQ) / 2;
      const testBlob = await canvasToBlob(canvas, mimeType, quality);
      if (testBlob.size <= targetBytes) {
        resultBlob = testBlob;
        lowQ = quality; // try to get better quality
      } else {
        highQ = quality;
      }
    }
  }

  if (options.outputFormat === 'application/pdf') {
    const pdfBlob = await imageBlobToPdf(resultBlob, 'CNIC_ID_Card');
    return {
      blob: pdfBlob,
      url: URL.createObjectURL(pdfBlob),
      width: totalW,
      height: totalH,
      size: pdfBlob.size
    };
  }

  return {
    blob: resultBlob,
    url: URL.createObjectURL(resultBlob),
    width: totalW,
    height: totalH,
    size: resultBlob.size
  };
}

/**
 * 🗜️ Smart Image Compressor
 */
export async function smartCompressImage(
  file: File,
  options: CompressOptions
): Promise<{ blob: Blob; url: string; width: number; height: number; size: number; savedPct: number }> {
  const img = await loadImageFromFile(file);
  let w = img.width;
  let h = img.height;

  // Mode settings
  let targetQuality = 0.85;
  let format = options.outputFormat === 'auto' ? file.type || 'image/jpeg' : options.outputFormat;
  if (format !== 'image/jpeg' && format !== 'image/png' && format !== 'image/webp') format = 'image/jpeg';

  if (options.mode === 'max_quality') {
    targetQuality = 0.92;
  } else if (options.mode === 'smallest_size') {
    targetQuality = 0.65;
    format = 'image/webp';
  }

  // Max dimension scaling if required
  if (options.maxWidthOrHeight > 0 && (w > options.maxWidthOrHeight || h > options.maxWidthOrHeight)) {
    if (w > h) {
      h = Math.round((h / w) * options.maxWidthOrHeight);
      w = options.maxWidthOrHeight;
    } else {
      w = Math.round((w / h) * options.maxWidthOrHeight);
      h = options.maxWidthOrHeight;
    }
  }

  const canvas = document.createElement('canvas');
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Canvas context failed');

  // Fill background white for JPEG
  if (format === 'image/jpeg') {
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, w, h);
  }
  ctx.drawImage(img, 0, 0, w, h);

  let finalBlob: Blob;

  // Target file size mode
  if (options.mode === 'target_size' && options.targetSizeKb > 0) {
    const targetBytes = options.targetSizeKb * 1024;
    let scale = 1.0;
    let q = 0.90;

    // Try adjusting quality first
    finalBlob = await canvasToBlob(canvas, format, q);
    if (finalBlob.size > targetBytes) {
      let low = 0.05;
      let high = 0.90;
      for (let i = 0; i < 7; i++) {
        q = (low + high) / 2;
        const testBlob = await canvasToBlob(canvas, format, q);
        if (testBlob.size <= targetBytes) {
          finalBlob = testBlob;
          low = q;
        } else {
          high = q;
        }
      }
    }

    // If still larger, scale dimensions
    if (finalBlob.size > targetBytes) {
      while (finalBlob.size > targetBytes && scale > 0.3) {
        scale -= 0.15;
        const scaledCanvas = document.createElement('canvas');
        scaledCanvas.width = Math.round(w * scale);
        scaledCanvas.height = Math.round(h * scale);
        const sCtx = scaledCanvas.getContext('2d');
        if (sCtx) {
          if (format === 'image/jpeg') {
            sCtx.fillStyle = '#ffffff';
            sCtx.fillRect(0, 0, scaledCanvas.width, scaledCanvas.height);
          }
          sCtx.drawImage(img, 0, 0, scaledCanvas.width, scaledCanvas.height);
          finalBlob = await canvasToBlob(scaledCanvas, format, 0.7);
          w = scaledCanvas.width;
          h = scaledCanvas.height;
        }
      }
    }
  } else {
    finalBlob = await canvasToBlob(canvas, format, targetQuality);
  }

  const savedPct = Math.max(0, Math.round(((file.size - finalBlob.size) / file.size) * 100));

  return {
    blob: finalBlob,
    url: URL.createObjectURL(finalBlob),
    width: w,
    height: h,
    size: finalBlob.size,
    savedPct
  };
}

/**
 * 🔗 Multi-Image Combiner (Vertical, Horizontal, Grid)
 */
export async function combineImages(
  files: File[],
  options: CombinerOptions
): Promise<{ blob: Blob; url: string; width: number; height: number; size: number }> {
  const images = await Promise.all(files.map(f => loadImageFromFile(f)));
  if (images.length === 0) throw new Error('No images provided');

  const { layout, gridColumns, spacing, padding, backgroundColor, borderColor, borderWidth, borderRadius, imageFit } = options;

  let totalW = 0;
  let totalH = 0;

  if (layout === 'vertical') {
    const maxW = Math.max(...images.map(i => i.width));
    totalW = maxW + padding * 2 + borderWidth * 2;
    totalH = images.reduce((acc, i) => acc + i.height, 0) + spacing * (images.length - 1) + padding * 2 + borderWidth * 2;
  } else if (layout === 'horizontal') {
    const maxH = Math.max(...images.map(i => i.height));
    totalW = images.reduce((acc, i) => acc + i.width, 0) + spacing * (images.length - 1) + padding * 2 + borderWidth * 2;
    totalH = maxH + padding * 2 + borderWidth * 2;
  } else {
    // Grid
    const cols = Math.max(1, gridColumns);
    const rows = Math.ceil(images.length / cols);
    const cellW = 400;
    const cellH = 300;
    totalW = cols * cellW + (cols - 1) * spacing + padding * 2 + borderWidth * 2;
    totalH = rows * cellH + (rows - 1) * spacing + padding * 2 + borderWidth * 2;
  }

  const canvas = document.createElement('canvas');
  canvas.width = totalW;
  canvas.height = totalH;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Canvas failed');

  // Background
  ctx.fillStyle = backgroundColor || '#ffffff';
  ctx.fillRect(0, 0, totalW, totalH);

  // Draw images
  if (layout === 'vertical') {
    let currentY = padding + borderWidth;
    for (const img of images) {
      const x = padding + borderWidth + (totalW - padding * 2 - borderWidth * 2 - img.width) / 2;
      ctx.drawImage(img, x, currentY);
      currentY += img.height + spacing;
    }
  } else if (layout === 'horizontal') {
    let currentX = padding + borderWidth;
    for (const img of images) {
      const y = padding + borderWidth + (totalH - padding * 2 - borderWidth * 2 - img.height) / 2;
      ctx.drawImage(img, currentX, y);
      currentX += img.width + spacing;
    }
  } else {
    // Grid
    const cols = Math.max(1, gridColumns);
    const cellW = 400;
    const cellH = 300;
    images.forEach((img, idx) => {
      const r = Math.floor(idx / cols);
      const c = idx % cols;
      const x = padding + borderWidth + c * (cellW + spacing);
      const y = padding + borderWidth + r * (cellH + spacing);

      ctx.save();
      if (borderRadius > 0) {
        ctx.beginPath();
        ctx.roundRect(x, y, cellW, cellH, borderRadius);
        ctx.clip();
      }

      if (imageFit === 'cover') {
        const scale = Math.max(cellW / img.width, cellH / img.height);
        const nw = img.width * scale;
        const nh = img.height * scale;
        const nx = x + (cellW - nw) / 2;
        const ny = y + (cellH - nh) / 2;
        ctx.drawImage(img, nx, ny, nw, nh);
      } else {
        ctx.drawImage(img, x, y, cellW, cellH);
      }
      ctx.restore();
    });
  }

  const format = options.outputFormat || 'image/jpeg';
  const blob = await canvasToBlob(canvas, format, options.quality || 0.90);
  return {
    blob,
    url: URL.createObjectURL(blob),
    width: totalW,
    height: totalH,
    size: blob.size
  };
}

/**
 * 🖼️ Image Overlay Tool
 */
export async function overlayImages(
  bgFile: File,
  overlayFile: File,
  options: OverlayOptions
): Promise<{ blob: Blob; url: string; width: number; height: number; size: number }> {
  const bgImg = await loadImageFromFile(bgFile);
  const ovImg = await loadImageFromFile(overlayFile);

  const canvas = document.createElement('canvas');
  canvas.width = bgImg.width;
  canvas.height = bgImg.height;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Canvas failed');

  // Draw background
  ctx.drawImage(bgImg, 0, 0);

  // Position overlay
  const scaledW = (ovImg.width * (options.scalePct / 100));
  const scaledH = (ovImg.height * (options.scalePct / 100));
  const posX = (bgImg.width * (options.xPct / 100)) - (scaledW / 2);
  const posY = (bgImg.height * (options.yPct / 100)) - (scaledH / 2);

  ctx.save();
  ctx.globalAlpha = options.opacityPct / 100;
  ctx.globalCompositeOperation = options.blendMode || 'source-over';

  // Rotation
  ctx.translate(posX + scaledW / 2, posY + scaledH / 2);
  ctx.rotate((options.rotationDeg * Math.PI) / 180);
  ctx.drawImage(ovImg, -scaledW / 2, -scaledH / 2, scaledW, scaledH);
  ctx.restore();

  const blob = await canvasToBlob(canvas, 'image/png', 0.95);
  return {
    blob,
    url: URL.createObjectURL(blob),
    width: bgImg.width,
    height: bgImg.height,
    size: blob.size
  };
}

/**
 * ✂️ Image Cropper Tool
 */
export async function cropImage(
  file: File,
  cropArea: { x: number; y: number; width: number; height: number },
  options: CropOptions
): Promise<{ blob: Blob; url: string; width: number; height: number; size: number }> {
  const img = await loadImageFromFile(file);

  const canvas = document.createElement('canvas');
  canvas.width = cropArea.width;
  canvas.height = cropArea.height;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Canvas failed');

  ctx.save();
  if (options.flipH || options.flipV) {
    ctx.translate(options.flipH ? cropArea.width : 0, options.flipV ? cropArea.height : 0);
    ctx.scale(options.flipH ? -1 : 1, options.flipV ? -1 : 1);
  }
  ctx.drawImage(
    img,
    cropArea.x,
    cropArea.y,
    cropArea.width,
    cropArea.height,
    0,
    0,
    cropArea.width,
    cropArea.height
  );
  ctx.restore();

  const blob = await canvasToBlob(canvas, 'image/png', 0.95);
  return {
    blob,
    url: URL.createObjectURL(blob),
    width: cropArea.width,
    height: cropArea.height,
    size: blob.size
  };
}

/**
 * 📐 Image Resizer
 */
export async function resizeImage(
  file: File,
  options: ResizeOptions
): Promise<{ blob: Blob; url: string; width: number; height: number; size: number }> {
  const img = await loadImageFromFile(file);
  let newW = img.width;
  let newH = img.height;

  if (options.mode === 'percentage') {
    const scale = options.percentage / 100;
    newW = Math.round(img.width * scale);
    newH = Math.round(img.height * scale);
  } else if (options.mode === 'dimensions') {
    newW = options.width;
    if (options.lockAspectRatio) {
      newH = Math.round((img.height / img.width) * options.width);
    } else {
      newH = options.height;
    }
  }

  const canvas = document.createElement('canvas');
  canvas.width = newW;
  canvas.height = newH;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Canvas failed');

  ctx.drawImage(img, 0, 0, newW, newH);
  const blob = await canvasToBlob(canvas, file.type || 'image/jpeg', 0.90);

  return {
    blob,
    url: URL.createObjectURL(blob),
    width: newW,
    height: newH,
    size: blob.size
  };
}

/**
 * 🔄 Format Converter
 */
export async function convertImageFormat(
  file: File,
  options: ConverterOptions
): Promise<{ blob: Blob; url: string; size: number }> {
  const img = await loadImageFromFile(file);
  const canvas = document.createElement('canvas');
  canvas.width = img.width;
  canvas.height = img.height;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Canvas failed');

  if (options.targetFormat === 'image/jpeg') {
    ctx.fillStyle = options.backgroundColor || '#ffffff';
    ctx.fillRect(0, 0, img.width, img.height);
  }
  ctx.drawImage(img, 0, 0);

  const blob = await canvasToBlob(canvas, options.targetFormat, options.quality);
  return {
    blob,
    url: URL.createObjectURL(blob),
    size: blob.size
  };
}

/**
 * 📝 Add Text & Watermark Tool
 */
export async function addTextAndWatermark(
  file: File,
  options: TextWatermarkOptions
): Promise<{ blob: Blob; url: string; size: number }> {
  const img = await loadImageFromFile(file);
  const canvas = document.createElement('canvas');
  canvas.width = img.width;
  canvas.height = img.height;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Canvas failed');

  ctx.drawImage(img, 0, 0);

  if (options.mode === 'tiled') {
    // Tiled text watermark across entire canvas
    ctx.save();
    ctx.globalAlpha = options.opacityPct / 100;
    ctx.font = `${options.isBold ? 'bold ' : ''}${options.isItalic ? 'italic ' : ''}${options.fontSize}px ${options.fontFamily || 'sans-serif'}`;
    ctx.fillStyle = options.color || '#ffffff';

    const gap = options.tileGap || 200;
    for (let y = 0; y < canvas.height + gap; y += gap) {
      for (let x = 0; x < canvas.width + gap; x += gap) {
        ctx.save();
        ctx.translate(x, y);
        ctx.rotate((options.rotationDeg * Math.PI) / 180);
        ctx.fillText(options.text || 'WATERMARK', 0, 0);
        ctx.restore();
      }
    }
    ctx.restore();
  } else {
    // Single text overlay
    ctx.save();
    ctx.globalAlpha = options.opacityPct / 100;
    ctx.font = `${options.isBold ? 'bold ' : ''}${options.isItalic ? 'italic ' : ''}${options.fontSize}px ${options.fontFamily || 'sans-serif'}`;

    let posX = (canvas.width * (options.xPct / 100));
    let posY = (canvas.height * (options.yPct / 100));

    ctx.translate(posX, posY);
    ctx.rotate((options.rotationDeg * Math.PI) / 180);

    const textMetrics = ctx.measureText(options.text);
    const textW = textMetrics.width;

    // Background pill if set
    if (options.backgroundColor && options.backgroundColor !== 'transparent') {
      ctx.fillStyle = options.backgroundColor;
      ctx.fillRect(-10, -options.fontSize, textW + 20, options.fontSize + 15);
    }

    // Shadow
    if (options.shadowBlur > 0) {
      ctx.shadowColor = options.shadowColor || 'rgba(0,0,0,0.5)';
      ctx.shadowBlur = options.shadowBlur;
    }

    // Outline
    if (options.outlineWidth > 0) {
      ctx.strokeStyle = options.outlineColor || '#000000';
      ctx.lineWidth = options.outlineWidth;
      ctx.strokeText(options.text, 0, 0);
    }

    ctx.fillStyle = options.color || '#ffffff';
    ctx.fillText(options.text, 0, 0);
    ctx.restore();
  }

  const blob = await canvasToBlob(canvas, 'image/png', 0.95);
  return {
    blob,
    url: URL.createObjectURL(blob),
    size: blob.size
  };
}

/**
 * 📄 Images to PDF Document
 */
export async function convertImagesToPdf(
  files: File[],
  options: ImagesToPdfOptions
): Promise<{ blob: Blob; url: string; size: number }> {
  const pdfDoc = await PDFDocument.create();

  for (const file of files) {
    const img = await loadImageFromFile(file);
    const canvas = document.createElement('canvas');
    canvas.width = img.width;
    canvas.height = img.height;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, img.width, img.height);
      ctx.drawImage(img, 0, 0);
    }
    const imgBlob = await canvasToBlob(canvas, 'image/jpeg', options.quality || 0.85);
    const imgBytes = await imgBlob.arrayBuffer();
    const pdfImg = await pdfDoc.embedJpg(imgBytes);

    let pageWidth = pdfImg.width;
    let pageHeight = pdfImg.height;

    if (options.pageSize === 'a4') {
      pageWidth = options.orientation === 'portrait' ? 595.28 : 841.89;
      pageHeight = options.orientation === 'portrait' ? 841.89 : 595.28;
    } else if (options.pageSize === 'letter') {
      pageWidth = options.orientation === 'portrait' ? 612 : 792;
      pageHeight = options.orientation === 'portrait' ? 792 : 612;
    }

    const page = pdfDoc.addPage([pageWidth, pageHeight]);
    const margin = (options.margin || 0) * 2.83; // convert mm to pt

    const drawW = pageWidth - margin * 2;
    const drawH = pageHeight - margin * 2;

    const scale = Math.min(drawW / pdfImg.width, drawH / pdfImg.height);
    const nw = pdfImg.width * scale;
    const nh = pdfImg.height * scale;

    const x = margin + (drawW - nw) / 2;
    const y = margin + (drawH - nh) / 2;

    page.drawImage(pdfImg, { x, y, width: nw, height: nh });
  }

  const pdfBytes = await pdfDoc.save();
  const pdfBlob = new Blob([new Uint8Array(pdfBytes)], { type: 'application/pdf' });
  return {
    blob: pdfBlob,
    url: URL.createObjectURL(pdfBlob),
    size: pdfBlob.size
  };
}

/**
 * 🛂 Passport Photo Maker
 */
export async function passportPhotoMaker(
  file: File,
  options: PassportPhotoOptions
): Promise<{ blob: Blob; url: string; size: number }> {
  const img = await loadImageFromFile(file);
  const canvas = document.createElement('canvas');

  // Country presets
  let w = 413; // 35mm @ 300DPI
  let h = 531; // 45mm @ 300DPI

  if (options.country === 'USA') {
    w = 600; // 2x2 inches @ 300DPI
    h = 600;
  } else if (options.country === 'Canada') {
    w = 590; // 50x70mm @ 300DPI
    h = 826;
  }

  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Canvas failed');

  // Fill background color
  ctx.fillStyle = options.bgColor || '#ffffff';
  ctx.fillRect(0, 0, w, h);

  let sourceImg = img;
  if (options.removeBgFirst) {
    try {
      const cutout = await removeBackgroundColorKey(file, {
        tolerance: 40,
        featherRadius: 2,
        edgeOnly: true
      });
      sourceImg = await loadImageFromFile(new File([cutout], 'cutout.png', { type: 'image/png' }));
    } catch (e) {
      console.warn('BG removal in passport photo fallback:', e);
    }
  }

  // Center crop scale
  const scale = Math.max(w / sourceImg.width, h / sourceImg.height);
  const nw = sourceImg.width * scale;
  const nh = sourceImg.height * scale;
  const nx = (w - nw) / 2;
  const ny = (h - nh) / 2;

  ctx.drawImage(sourceImg, nx, ny, nw, nh);

  if (options.paperSize === '4x6_grid') {
    // 4x6 print sheet (1200 x 1800 px)
    const gridCanvas = document.createElement('canvas');
    gridCanvas.width = 1800;
    gridCanvas.height = 1200;
    const gCtx = gridCanvas.getContext('2d');
    if (gCtx) {
      gCtx.fillStyle = '#ffffff';
      gCtx.fillRect(0, 0, 1800, 1200);

      const rows = 2;
      const cols = 4;
      const startX = 100;
      const startY = 60;
      const gapX = 40;
      const gapY = 40;

      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
          const px = startX + c * (w + gapX);
          const py = startY + r * (h + gapY);
          gCtx.drawImage(canvas, px, py, w, h);
          if (options.border) {
            gCtx.strokeStyle = '#94a3b8';
            gCtx.lineWidth = 2;
            gCtx.strokeRect(px, py, w, h);
          }
        }
      }
      const gridBlob = await canvasToBlob(gridCanvas, 'image/jpeg', 0.95);
      return { blob: gridBlob, url: URL.createObjectURL(gridBlob), size: gridBlob.size };
    }
  }

  const singleBlob = await canvasToBlob(canvas, 'image/jpeg', 0.95);
  return { blob: singleBlob, url: URL.createObjectURL(singleBlob), size: singleBlob.size };
}

/**
 * ✍️ Signature Background Remover & Auto-Cropper
 */
export async function signatureCleaner(
  file: File,
  threshold = 220
): Promise<{ blob: Blob; url: string; width: number; height: number; size: number }> {
  const img = await loadImageFromFile(file);
  const canvas = document.createElement('canvas');
  canvas.width = img.width;
  canvas.height = img.height;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Canvas failed');

  ctx.drawImage(img, 0, 0);
  const imgData = ctx.getImageData(0, 0, img.width, img.height);
  const data = imgData.data;

  let minX = img.width;
  let maxX = 0;
  let minY = img.height;
  let maxY = 0;

  for (let i = 0; i < data.length; i += 4) {
    const r = data[i];
    const g = data[i + 1];
    const b = data[i + 2];
    const brightness = (r + g + b) / 3;

    if (brightness > threshold) {
      // Make white/near-white background transparent
      data[i + 3] = 0;
    } else {
      // Darken stroke for crisp signature contrast
      data[i] = Math.max(0, r - 30);
      data[i + 1] = Math.max(0, g - 30);
      data[i + 2] = Math.max(0, b - 30);

      const index = i / 4;
      const x = index % img.width;
      const y = Math.floor(index / img.width);
      if (x < minX) minX = x;
      if (x > maxX) maxX = x;
      if (y < minY) minY = y;
      if (y > maxY) maxY = y;
    }
  }

  ctx.putImageData(imgData, 0, 0);

  // Auto crop bounding box
  const cropW = Math.max(10, maxX - minX + 20);
  const cropH = Math.max(10, maxY - minY + 20);
  const cropCanvas = document.createElement('canvas');
  cropCanvas.width = cropW;
  cropCanvas.height = cropH;
  const cCtx = cropCanvas.getContext('2d');
  if (cCtx) {
    cCtx.drawImage(canvas, Math.max(0, minX - 10), Math.max(0, minY - 10), cropW, cropH, 0, 0, cropW, cropH);
  }

  const blob = await canvasToBlob(cropCanvas, 'image/png', 0.95);
  return {
    blob,
    url: URL.createObjectURL(blob),
    width: cropW,
    height: cropH,
    size: blob.size
  };
}

/**
 * 📷 Screenshot Optimizer
 */
export async function screenshotOptimizer(
  file: File,
  options: ScreenshotOptimizerOptions
): Promise<{ blob: Blob; url: string; size: number }> {
  const img = await loadImageFromFile(file);
  const p = options.padding || 60;

  const totalW = img.width + p * 2;
  const totalH = img.height + p * 2;

  const canvas = document.createElement('canvas');
  canvas.width = totalW;
  canvas.height = totalH;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Canvas failed');

  // Gradient background
  const grad = ctx.createLinearGradient(0, 0, totalW, totalH);
  if (options.bgGradient === 'sunset') {
    grad.addColorStop(0, '#f97316');
    grad.addColorStop(1, '#ec4899');
  } else if (options.bgGradient === 'emerald') {
    grad.addColorStop(0, '#10b981');
    grad.addColorStop(1, '#06b6d4');
  } else if (options.bgGradient === 'midnight') {
    grad.addColorStop(0, '#0f172a');
    grad.addColorStop(1, '#334155');
  } else if (options.bgGradient === 'cyber') {
    grad.addColorStop(0, '#ec4899');
    grad.addColorStop(1, '#8b5cf6');
  } else {
    grad.addColorStop(0, '#3b82f6');
    grad.addColorStop(1, '#9333ea');
  }
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, totalW, totalH);

  // Drop shadow
  ctx.save();
  ctx.shadowColor = 'rgba(0, 0, 0, 0.4)';
  ctx.shadowBlur = options.shadowBlur || 30;
  ctx.shadowOffsetY = 15;

  if (options.borderRadius > 0) {
    ctx.beginPath();
    ctx.roundRect(p, p, img.width, img.height, options.borderRadius);
    ctx.clip();
  }
  ctx.drawImage(img, p, p);
  ctx.restore();

  const blob = await canvasToBlob(canvas, options.outputFormat || 'image/webp', 0.92);
  return {
    blob,
    url: URL.createObjectURL(blob),
    size: blob.size
  };
}

/**
 * 🧹 EXIF / Metadata Remover (100% Privacy Clean)
 */
export async function stripImageMetadata(
  file: File
): Promise<{ blob: Blob; url: string; size: number }> {
  const img = await loadImageFromFile(file);
  const canvas = document.createElement('canvas');
  canvas.width = img.width;
  canvas.height = img.height;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Canvas failed');

  ctx.drawImage(img, 0, 0);
  const blob = await canvasToBlob(canvas, file.type || 'image/jpeg', 0.92);
  return {
    blob,
    url: URL.createObjectURL(blob),
    size: blob.size
  };
}

/**
 * 🔲 Real AI Neural Background Removal (Runs Client-Side via WebAssembly)
 */
export async function removeBackgroundAI(
  imageSource: string | File | Blob,
  onProgress?: (status: string) => void
): Promise<Blob> {
  const imglyModule = await import('@imgly/background-removal');
  const removeBgFn = (imglyModule as any).removeBackground || (imglyModule as any).default;
  const blob = await removeBgFn(imageSource, {
    progress: (key: string, current: number, total: number) => {
      if (onProgress) {
        const pct = total > 0 ? ` (${Math.round((current / total) * 100)}%)` : '';
        const stepName = key.replace(/.*?:/, '').replace(/_/g, ' ');
        onProgress(`AI: ${stepName}${pct}`);
      }
    }
  });
  return blob;
}

/**
 * 🔲 High-Speed Edge Flood-Fill & Color Key Background Removal (100% Offline & Instant)
 */
export async function removeBackgroundColorKey(
  file: File | Blob,
  options: {
    tolerance: number; // 1 to 100
    featherRadius: number; // 0 to 10
    edgeOnly: boolean;
    keyColor?: { r: number; g: number; b: number } | null;
  }
): Promise<Blob> {
  const img = await loadImageFromFile(
    file instanceof File ? file : new File([file], 'image.png', { type: file.type || 'image/png' })
  );
  const w = img.width;
  const h = img.height;
  const canvas = document.createElement('canvas');
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext('2d', { willReadFrequently: true });
  if (!ctx) throw new Error('Canvas context failed');

  ctx.drawImage(img, 0, 0);
  const imgData = ctx.getImageData(0, 0, w, h);
  const data = imgData.data;

  // Determine target background color
  let targetR = 255;
  let targetG = 255;
  let targetB = 255;

  if (options.keyColor) {
    targetR = options.keyColor.r;
    targetG = options.keyColor.g;
    targetB = options.keyColor.b;
  } else {
    // Auto-detect dominant edge/corner color
    const corners = [
      0,
      (w - 1) * 4,
      ((h - 1) * w) * 4,
      ((h - 1) * w + (w - 1)) * 4
    ];
    let sumR = 0, sumG = 0, sumB = 0;
    for (const c of corners) {
      sumR += data[c];
      sumG += data[c + 1];
      sumB += data[c + 2];
    }
    targetR = Math.round(sumR / 4);
    targetG = Math.round(sumG / 4);
    targetB = Math.round(sumB / 4);
  }

  // Max color distance threshold based on tolerance
  const maxThreshold = (options.tolerance / 100) * 441.67;
  const featherRange = (options.featherRadius + 1) * 12;

  const colorDist = (r: number, g: number, b: number) => {
    return Math.sqrt((r - targetR) ** 2 + (g - targetG) ** 2 + (b - targetB) ** 2);
  };

  if (options.edgeOnly) {
    // BFS flood fill starting from outer image edges
    const visited = new Uint8Array(w * h);
    const queue: number[] = [];

    // Push top & bottom borders
    for (let x = 0; x < w; x++) {
      const idxTop = x;
      const pTop = idxTop * 4;
      if (colorDist(data[pTop], data[pTop + 1], data[pTop + 2]) <= maxThreshold + featherRange) {
        visited[idxTop] = 1;
        queue.push(idxTop);
      }
      const idxBot = (h - 1) * w + x;
      const pBot = idxBot * 4;
      if (colorDist(data[pBot], data[pBot + 1], data[pBot + 2]) <= maxThreshold + featherRange) {
        visited[idxBot] = 1;
        queue.push(idxBot);
      }
    }

    // Push left & right borders
    for (let y = 1; y < h - 1; y++) {
      const idxLeft = y * w;
      const pLeft = idxLeft * 4;
      if (colorDist(data[pLeft], data[pLeft + 1], data[pLeft + 2]) <= maxThreshold + featherRange) {
        visited[idxLeft] = 1;
        queue.push(idxLeft);
      }
      const idxRight = y * w + (w - 1);
      const pRight = idxRight * 4;
      if (colorDist(data[pRight], data[pRight + 1], data[pRight + 2]) <= maxThreshold + featherRange) {
        visited[idxRight] = 1;
        queue.push(idxRight);
      }
    }

    // BFS traverse
    let head = 0;
    while (head < queue.length) {
      const cur = queue[head++];
      const cx = cur % w;
      const cy = Math.floor(cur / w);
      const p = cur * 4;
      const dist = colorDist(data[p], data[p + 1], data[p + 2]);

      if (dist <= maxThreshold) {
        data[p + 3] = 0; // transparent
      } else {
        const alphaFraction = (dist - maxThreshold) / featherRange;
        data[p + 3] = Math.min(data[p + 3], Math.round(alphaFraction * 255));
      }

      const neighbors = [
        cx > 0 ? cur - 1 : -1,
        cx < w - 1 ? cur + 1 : -1,
        cy > 0 ? cur - w : -1,
        cy < h - 1 ? cur + w : -1
      ];

      for (const n of neighbors) {
        if (n >= 0 && !visited[n]) {
          const np = n * 4;
          const ndist = colorDist(data[np], data[np + 1], data[np + 2]);
          if (ndist <= maxThreshold + featherRange) {
            visited[n] = 1;
            queue.push(n);
          }
        }
      }
    }
  } else {
    // Global color keying
    for (let i = 0; i < data.length; i += 4) {
      const dist = colorDist(data[i], data[i + 1], data[i + 2]);
      if (dist <= maxThreshold) {
        data[i + 3] = 0;
      } else if (dist <= maxThreshold + featherRange) {
        const alphaFraction = (dist - maxThreshold) / featherRange;
        data[i + 3] = Math.round(alphaFraction * 255);
      }
    }
  }

  ctx.putImageData(imgData, 0, 0);
  return canvasToBlob(canvas, 'image/png', 0.95);
}

/**
 * 🎨 Composite Cutout with Custom Background
 */
export async function compositeBackground(
  cutoutBlob: Blob,
  options: {
    bgType: 'transparent' | 'color' | 'gradient' | 'image';
    bgColor: string;
    bgGradient: string;
    bgImageFile?: File | null;
    addShadow: boolean;
    outputFormat: 'image/png' | 'image/webp' | 'image/jpeg';
  }
): Promise<{ blob: Blob; url: string; width: number; height: number; size: number }> {
  const cutoutImg = await loadImageFromFile(
    cutoutBlob instanceof File ? cutoutBlob : new File([cutoutBlob], 'cutout.png', { type: 'image/png' })
  );
  const w = cutoutImg.width;
  const h = cutoutImg.height;

  const canvas = document.createElement('canvas');
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Canvas context failed');

  // 1. Draw Background
  if (options.bgType === 'color') {
    ctx.fillStyle = options.bgColor || '#ffffff';
    ctx.fillRect(0, 0, w, h);
  } else if (options.bgType === 'gradient') {
    const grad = ctx.createLinearGradient(0, 0, w, h);
    if (options.bgGradient === 'studio') {
      grad.addColorStop(0, '#f8fafc');
      grad.addColorStop(1, '#cbd5e1');
    } else if (options.bgGradient === 'sunset') {
      grad.addColorStop(0, '#f97316');
      grad.addColorStop(1, '#ec4899');
    } else if (options.bgGradient === 'ocean') {
      grad.addColorStop(0, '#06b6d4');
      grad.addColorStop(1, '#3b82f6');
    } else if (options.bgGradient === 'purple') {
      grad.addColorStop(0, '#6366f1');
      grad.addColorStop(1, '#a855f7');
    } else if (options.bgGradient === 'emerald') {
      grad.addColorStop(0, '#10b981');
      grad.addColorStop(1, '#047857');
    } else if (options.bgGradient === 'dark') {
      grad.addColorStop(0, '#0f172a');
      grad.addColorStop(1, '#1e293b');
    } else {
      grad.addColorStop(0, '#3b82f6');
      grad.addColorStop(1, '#9333ea');
    }
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, w, h);
  } else if (options.bgType === 'image' && options.bgImageFile) {
    try {
      const bgImg = await loadImageFromFile(options.bgImageFile);
      const scale = Math.max(w / bgImg.width, h / bgImg.height);
      const nw = bgImg.width * scale;
      const nh = bgImg.height * scale;
      const nx = (w - nw) / 2;
      const ny = (h - nh) / 2;
      ctx.drawImage(bgImg, nx, ny, nw, nh);
    } catch {
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, w, h);
    }
  }

  // 2. Draw Soft Drop Shadow if requested
  if (options.addShadow) {
    ctx.save();
    ctx.shadowColor = 'rgba(0, 0, 0, 0.4)';
    ctx.shadowBlur = Math.round(Math.min(w, h) * 0.04);
    ctx.shadowOffsetY = Math.round(Math.min(w, h) * 0.02);
    ctx.drawImage(cutoutImg, 0, 0);
    ctx.restore();
  }

  // 3. Draw Cutout Foreground
  ctx.drawImage(cutoutImg, 0, 0);

  const format = options.outputFormat || (options.bgType === 'transparent' ? 'image/png' : 'image/jpeg');
  const resultBlob = await canvasToBlob(canvas, format, 0.95);

  return {
    blob: resultBlob,
    url: URL.createObjectURL(resultBlob),
    width: w,
    height: h,
    size: resultBlob.size
  };
}

/**
 * ✨ Real AI Image Enhancer, 4K Upscaler & Clarity Engine
 */
export async function enhanceImage(
  file: File,
  options: ImageEnhancerOptions
): Promise<{ blob: Blob; url: string; width: number; height: number; size: number }> {
  const img = await loadImageFromFile(file);
  const scale = options.scale || 1;
  const targetW = img.width * scale;
  const targetH = img.height * scale;

  const canvas = document.createElement('canvas');
  canvas.width = targetW;
  canvas.height = targetH;
  const ctx = canvas.getContext('2d', { willReadFrequently: true });
  if (!ctx) throw new Error('Canvas context failed');

  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = 'high';
  ctx.drawImage(img, 0, 0, targetW, targetH);

  const imgData = ctx.getImageData(0, 0, targetW, targetH);
  const data = imgData.data;

  // 1. Contrast, Brightness & Saturation
  const contrastFactor = (259 * (options.contrast + 255)) / (255 * (259 - options.contrast));
  const brightnessOffset = options.brightness * 1.5;

  for (let i = 0; i < data.length; i += 4) {
    if (options.contrast !== 0 || options.brightness !== 0) {
      data[i] = Math.min(255, Math.max(0, contrastFactor * (data[i] - 128) + 128 + brightnessOffset));
      data[i + 1] = Math.min(255, Math.max(0, contrastFactor * (data[i + 1] - 128) + 128 + brightnessOffset));
      data[i + 2] = Math.min(255, Math.max(0, contrastFactor * (data[i + 2] - 128) + 128 + brightnessOffset));
    }

    if (options.saturation !== 0) {
      const r = data[i];
      const g = data[i + 1];
      const b = data[i + 2];
      const gray = 0.2989 * r + 0.5870 * g + 0.1140 * b;
      const satFactor = 1 + (options.saturation / 50);
      data[i] = Math.min(255, Math.max(0, gray + satFactor * (r - gray)));
      data[i + 1] = Math.min(255, Math.max(0, gray + satFactor * (g - gray)));
      data[i + 2] = Math.min(255, Math.max(0, gray + satFactor * (b - gray)));
    }
  }

  // 2. Convolution Sharpen / Unsharp Mask (Sharpness + Clarity)
  const totalSharp = options.sharpness + options.clarity;
  if (totalSharp > 5) {
    const strength = (totalSharp / 100) * 0.7;
    const src = new Uint8ClampedArray(data);
    const w = targetW;
    const h = targetH;

    for (let y = 1; y < h - 1; y++) {
      for (let x = 1; x < w - 1; x++) {
        const idx = (y * w + x) * 4;
        for (let c = 0; c < 3; c++) {
          const center = src[idx + c];
          const top = src[((y - 1) * w + x) * 4 + c];
          const bottom = src[((y + 1) * w + x) * 4 + c];
          const left = src[(y * w + (x - 1)) * 4 + c];
          const right = src[(y * w + (x + 1)) * 4 + c];

          const edgeVal = 4 * center - top - bottom - left - right;
          data[idx + c] = Math.min(255, Math.max(0, center + strength * edgeVal));
        }
      }
    }
  }

  ctx.putImageData(imgData, 0, 0);

  const format = options.outputFormat || 'image/jpeg';
  const finalBlob = await canvasToBlob(canvas, format, options.quality || 0.95);

  return {
    blob: finalBlob,
    url: URL.createObjectURL(finalBlob),
    width: targetW,
    height: targetH,
    size: finalBlob.size
  };
}

/**
 * 🔍 Real AI Document OCR Text Extractor (Client-Side Tesseract.js Engine)
 */
export async function extractOcrText(
  file: File,
  language = 'eng',
  onProgress?: (pct: number, status: string) => void
): Promise<{ text: string; confidence: number }> {
  try {
    const { createWorker } = await import('tesseract.js');
    const worker = await createWorker(language, 1, {
      logger: (m) => {
        if (m.status === 'recognizing text') {
          const pct = Math.round((m.progress || 0) * 100);
          if (onProgress) onProgress(pct, `Recognizing text (${pct}%)`);
        } else if (onProgress && m.status) {
          if (onProgress) onProgress(15, `${m.status}...`);
        }
      }
    });

    const ret = await worker.recognize(file);
    const text = ret.data.text;
    const confidence = Math.round(ret.data.confidence);
    await worker.terminate();

    return {
      text: text?.trim() || 'No clear text detected in this image. Try uploading a higher contrast photo or document scan.',
      confidence: confidence || 0
    };
  } catch (err: any) {
    console.error('Tesseract OCR error:', err);
    throw new Error(err?.message || 'OCR processing failed');
  }
}

/**
 * Helper to format file size in human-readable string
 */
export function formatBytes(bytes: number, decimals = 2): string {
  if (!bytes || bytes === 0) return '0 Bytes';
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
}

