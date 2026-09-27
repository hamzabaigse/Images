# PixelForge - Modern Browser-Based Image Processing Suite

PixelForge is a privacy-first, client-side web application providing professional-grade image manipulation, conversion, and optimization tools directly in the browser.

## ✨ Features

- **Background Remover**: AI-powered browser-based background extraction and Chroma-keying with `@imgly/background-removal`.
- **Screenshot Optimizer**: Turn raw captures into presentation-ready visuals with customizable borders, shadows, and gradient backdrops.
- **Passport Photo Maker**: Compliant passport and visa photo presets for Pakistan, USA, UK, Canada, Australia, Schengen, UAE, and Saudi Arabia with 4x6 / A4 printable grids.
- **CNIC & Document Combiner**: Combine front and back IDs, licenses, and cards into aligned single images or PDFs.
- **Image Compression & Resizing**: Target exact KB limits, quality presets, and custom dimension scaling.
- **Format Converter**: Rapid conversion across JPEG, PNG, WebP, and AVIF.
- **Watermark & Annotation**: Custom text, logo overlays, stamps, and repeated tile watermarking.
- **Images to PDF**: Compile image collections into formatted multi-page PDFs.

## 🚀 Tech Stack

- **Framework**: [Next.js 14](https://nextjs.org/) (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS, Lucide Icons
- **Image & PDF Libraries**:
  - `@imgly/background-removal`
  - `pdf-lib` & `pdfjs-dist`
  - `tesseract.js`
  - `canvas-confetti`
  - `jszip`

## 🛠️ Getting Started

### Prerequisites

- Node.js 18+ installed
- npm, yarn, or pnpm

### Installation

```bash
# Clone the repository
git clone https://github.com/<your-username>/pixelforge-saas.git

# Navigate to project directory
cd pixelforge-saas

# Install dependencies
npm install
```

### Running Locally

```bash
# Start the development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser to view the application.

### Building for Production

```bash
npm run build
npm start
```

## 🔒 Privacy

All image processing runs client-side inside the user's browser canvas/WebAssembly sandbox without uploading private media to third-party servers.

## 📄 License

MIT
