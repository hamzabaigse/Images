import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'PixelForge - All-in-One Online Image Tools & CNIC Combiner',
  description: 'Compress, resize, crop, combine CNIC front+back under 1MB, convert JPG/PNG/WebP/PDF, annotate, remove metadata & optimize images online 100% locally in your browser.',
  keywords: 'CNIC combiner, ID card front back, image compressor, compress image under 1mb, resize photo, convert jpg to webp, images to pdf, passport photo maker, signature background remover',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="scroll-smooth">
      <body className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 antialiased selection:bg-blue-500 selection:text-white">
        {children}
      </body>
    </html>
  );
}
