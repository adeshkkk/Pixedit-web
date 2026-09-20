'use client';

import React, { useRef, useState } from 'react';
import {
  Upload,
  SlidersHorizontal,
  Layers,
  Maximize2,
  Sparkles,
  FileImage,
  Sun,
  Moon,
  ArrowRight,
} from 'lucide-react';
import { ImageMetadata } from '@/types/editor';

interface HomepageProps {
  onImageSelected: (meta: ImageMetadata) => void;
  theme: 'dark' | 'light';
  onToggleTheme: () => void;
}

export const Homepage: React.FC<HomepageProps> = ({
  onImageSelected,
  theme,
  onToggleTheme,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [loadingSample, setLoadingSample] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const isLight = theme === 'light';

  const processFile = (file: File) => {
    setErrorMessage(null);
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (!validTypes.includes(file.type.toLowerCase())) {
      setErrorMessage(
        'Unsupported file format. Please upload a JPG, JPEG, PNG, or WEBP photo.'
      );
      return;
    }

    if (file.size > 50 * 1024 * 1024) {
      setErrorMessage(
        'Image too large. Please select an image under 50MB for optimal performance.'
      );
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const dataUrl = e.target?.result as string;
      const img = new Image();
      img.onload = () => {
        onImageSelected({
          name: file.name,
          originalWidth: img.naturalWidth,
          originalHeight: img.naturalHeight,
          fileSizeBytes: file.size,
          format: file.type.split('/')[1] || 'png',
          dataUrl,
        });
      };
      img.onerror = () => {
        setErrorMessage(
          'Corrupted or unreadable image. Please try another file.'
        );
      };
      img.src = dataUrl;
    };
    reader.onerror = () => {
      setErrorMessage('Could not read image file.');
    };
    reader.readAsDataURL(file);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      processFile(e.target.files[0]);
    }
  };

  // Sample photos to test immediately
  const samplePhotos = [
    {
      id: 'portrait',
      name: 'Portrait Model',
      category: 'Portrait',
      url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=1200&q=80',
    },
    {
      id: 'landscape',
      name: 'Mountain Sunrise',
      category: 'Nature',
      url: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1200&q=80',
    },
    {
      id: 'architecture',
      name: 'City Skyline',
      category: 'Architecture',
      url: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=1200&q=80',
    },
    {
      id: 'product',
      name: 'Studio Watch',
      category: 'Product',
      url: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=1200&q=80',
    },
  ];

  const loadSample = async (sample: typeof samplePhotos[0]) => {
    setLoadingSample(sample.id);
    setErrorMessage(null);
    try {
      const response = await fetch(sample.url, { mode: 'cors' });
      const blob = await response.blob();
      const reader = new FileReader();
      reader.onload = (e) => {
        const dataUrl = e.target?.result as string;
        const img = new Image();
        img.onload = () => {
          onImageSelected({
            name: `${sample.name}.jpg`,
            originalWidth: img.naturalWidth,
            originalHeight: img.naturalHeight,
            fileSizeBytes: blob.size,
            format: 'jpeg',
            dataUrl,
          });
        };
        img.src = dataUrl;
      };
      reader.readAsDataURL(blob);
    } catch {
      // Direct load fallback
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => {
        onImageSelected({
          name: `${sample.name}.jpg`,
          originalWidth: img.naturalWidth,
          originalHeight: img.naturalHeight,
          fileSizeBytes: 850000,
          format: 'jpeg',
          dataUrl: sample.url,
        });
      };
      img.onerror = () => {
        setErrorMessage('Could not load sample image. Please upload a local image.');
        setLoadingSample(null);
      };
      img.src = sample.url;
    }
  };

  return (
    <div
      id="pix-edit-homepage"
      className={`min-h-screen flex flex-col justify-between transition-colors ${
        isLight ? 'bg-[#f8fafc] text-black' : 'bg-[#0a0c10] text-white'
      }`}
    >
      {/* Top Simple Bar */}
      <header
        id="homepage-topbar"
        className={`h-16 px-6 sm:px-10 flex items-center justify-between border-b ${
          isLight ? 'bg-white border-black' : 'bg-[#10131a] border-[#222734]'
        }`}
      >
        <div className="flex items-center gap-2.5">
          <div
            className={`w-9 h-9 rounded-lg flex items-center justify-center font-black text-lg ${
              isLight
                ? 'bg-black text-white border border-black'
                : 'bg-sky-500 text-slate-950'
            }`}
          >
            P
          </div>
          <span className="font-black text-xl tracking-tight">PixEdit</span>
        </div>

        <button
          id="btn-homepage-theme-toggle"
          onClick={onToggleTheme}
          className={`p-2 rounded-lg border transition-colors ${
            isLight
              ? 'border-black text-black bg-white hover:bg-black hover:text-white'
              : 'border-slate-700 text-slate-300 bg-slate-800/80 hover:bg-slate-700'
          }`}
          title="Toggle Theme"
        >
          {isLight ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4 text-amber-400" />}
        </button>
      </header>

      {/* Main Upload Body */}
      <main className="flex-1 max-w-5xl mx-auto w-full px-4 sm:px-6 py-8 sm:py-12 flex flex-col items-center justify-center space-y-8 sm:space-y-12">
        {/* Title & Tagline */}
        <div className="text-center space-y-2">
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight uppercase">
            PixEdit
          </h1>
          <p
            className={`text-base sm:text-lg font-medium max-w-lg mx-auto ${
              isLight ? 'text-gray-700' : 'text-slate-400'
            }`}
          >
            Professional photo editing made simple.
          </p>
        </div>

        {/* Error Alert */}
        {errorMessage && (
          <div
            id="upload-error-alert"
            className="w-full max-w-xl p-3.5 rounded-xl border border-red-500/50 bg-red-500/10 text-red-500 text-xs font-semibold flex items-center justify-between"
          >
            <span>{errorMessage}</span>
            <button
              onClick={() => setErrorMessage(null)}
              className="text-sm font-bold px-2 py-0.5"
            >
              ✕
            </button>
          </div>
        )}

        {/* Large Central Upload Dropzone */}
        <div
          id="upload-dropzone"
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className={`w-full max-w-2xl p-8 sm:p-14 rounded-2xl border-2 border-dashed cursor-pointer transition-all flex flex-col items-center justify-center text-center space-y-4 shadow-sm relative group ${
            isDragging
              ? isLight
                ? 'border-black bg-gray-100 scale-[1.01]'
                : 'border-sky-400 bg-sky-950/20 scale-[1.01]'
              : isLight
              ? 'border-black bg-white hover:bg-gray-50'
              : 'border-slate-700 bg-[#121620] hover:border-sky-500/60 hover:bg-[#151a26]'
          }`}
        >
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            accept=".jpg,.jpeg,.png,.webp,image/jpeg,image/png,image/webp"
            className="hidden"
          />

          <div
            className={`w-16 h-16 sm:w-20 sm:h-20 rounded-2xl flex items-center justify-center transition-transform group-hover:scale-110 ${
              isLight
                ? 'bg-black text-white'
                : 'bg-gradient-to-tr from-sky-500 to-indigo-500 text-white shadow-lg shadow-sky-500/20'
            }`}
          >
            <Upload className="w-8 h-8 sm:w-10 sm:h-10" />
          </div>

          <div className="space-y-1">
            <h2 className="text-lg sm:text-xl font-bold">
              Drag & Drop Your Photo Here
            </h2>
            <p
              className={`text-xs sm:text-sm font-medium ${
                isLight ? 'text-gray-600' : 'text-slate-400'
              }`}
            >
              or click to browse from your computer
            </p>
          </div>

          <button
            id="btn-upload-photo"
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              fileInputRef.current?.click();
            }}
            className={`px-6 py-2.5 rounded-xl text-xs sm:text-sm font-bold border transition-transform group-hover:scale-105 active:scale-95 ${
              isLight
                ? 'bg-black text-white border-black hover:bg-gray-800'
                : 'bg-sky-500 text-slate-950 border-sky-400 hover:bg-sky-400'
            }`}
          >
            Upload Photo
          </button>

          <div
            className={`text-[11px] font-mono tracking-wider pt-2 ${
              isLight ? 'text-gray-500' : 'text-slate-500'
            }`}
          >
            Supports JPG, JPEG, PNG, WEBP • Processed 100% locally in your browser
          </div>
        </div>

        {/* Quick Sample Photos */}
        <div className="w-full max-w-2xl space-y-3">
          <div className="flex items-center justify-between text-xs px-1">
            <span
              className={`font-semibold uppercase tracking-wider ${
                isLight ? 'text-black' : 'text-slate-400'
              }`}
            >
              Or try with a sample photo:
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {samplePhotos.map((sample) => (
              <button
                key={sample.id}
                id={`btn-sample-${sample.id}`}
                onClick={() => loadSample(sample)}
                disabled={loadingSample !== null}
                className={`group p-2 rounded-xl border flex flex-col items-center gap-2 text-left transition-all ${
                  isLight
                    ? 'border-black bg-white hover:bg-gray-50 hover:shadow-xs'
                    : 'border-slate-800 bg-[#121620] hover:border-slate-600'
                }`}
              >
                <div className="w-full h-20 rounded-lg overflow-hidden relative bg-black/20">
                  <img
                    src={sample.url}
                    alt={sample.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  {loadingSample === sample.id && (
                    <div className="absolute inset-0 bg-black/60 flex items-center justify-center text-white text-xs font-bold">
                      Loading...
                    </div>
                  )}
                </div>
                <div className="w-full">
                  <div className="text-xs font-bold truncate">{sample.name}</div>
                  <div className="text-[10px] opacity-60">{sample.category}</div>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Three Main Feature Cards */}
        <div className="w-full max-w-4xl grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6 pt-4">
          {/* Feature 1: FILTERS */}
          <div
            id="feature-card-filters"
            className={`p-6 rounded-2xl border space-y-2.5 transition-all ${
              isLight
                ? 'bg-white border-black text-black'
                : 'bg-[#121620] border-slate-800 text-white'
            }`}
          >
            <div
              className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold ${
                isLight ? 'bg-black text-white' : 'bg-sky-500/20 text-sky-400'
              }`}
            >
              <SlidersHorizontal className="w-5 h-5" />
            </div>
            <h3 className="font-black text-sm uppercase tracking-wider">
              FILTERS
            </h3>
            <p
              className={`text-xs leading-relaxed ${
                isLight ? 'text-gray-700' : 'text-slate-400'
              }`}
            >
              Apply professional filters and image adjustments including exposure,
              highlights, shadows, temperature, and 16 creative color grades.
            </p>
          </div>

          {/* Feature 2: BACKGROUND */}
          <div
            id="feature-card-background"
            className={`p-6 rounded-2xl border space-y-2.5 transition-all ${
              isLight
                ? 'bg-white border-black text-black'
                : 'bg-[#121620] border-slate-800 text-white'
            }`}
          >
            <div
              className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold ${
                isLight ? 'bg-black text-white' : 'bg-indigo-500/20 text-indigo-400'
              }`}
            >
              <Layers className="w-5 h-5" />
            </div>
            <h3 className="font-black text-sm uppercase tracking-wider">
              BACKGROUND
            </h3>
            <p
              className={`text-xs leading-relaxed ${
                isLight ? 'text-gray-700' : 'text-slate-400'
              }`}
            >
              Remove, replace, blur, or customize your background with solid colors,
              vibrant gradients, custom images, or transparent PNG export.
            </p>
          </div>

          {/* Feature 3: RESIZE */}
          <div
            id="feature-card-resize"
            className={`p-6 rounded-2xl border space-y-2.5 transition-all ${
              isLight
                ? 'bg-white border-black text-black'
                : 'bg-[#121620] border-slate-800 text-white'
            }`}
          >
            <div
              className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold ${
                isLight ? 'bg-black text-white' : 'bg-emerald-500/20 text-emerald-400'
              }`}
            >
              <Maximize2 className="w-5 h-5" />
            </div>
            <h3 className="font-black text-sm uppercase tracking-wider">
              RESIZE
            </h3>
            <p
              className={`text-xs leading-relaxed ${
                isLight ? 'text-gray-700' : 'text-slate-400'
              }`}
            >
              Resize images using pixels, cm, mm, inches, DPI, or presets for
              Instagram, YouTube, Facebook, LinkedIn, A4, and Passport photos.
            </p>
          </div>
        </div>
      </main>

      {/* Clean Footer */}
      <footer
        id="homepage-footer"
        className={`h-12 border-t px-6 flex items-center justify-between text-xs select-none ${
          isLight
            ? 'bg-white border-black text-gray-700 font-medium'
            : 'bg-[#0e1117] border-[#222734] text-slate-500'
        }`}
      >
        <span>PixEdit Photo Studio • High-Performance Web Processing</span>
        <span>Zero Lag • Client-Side Canvas</span>
      </footer>
    </div>
  );
};
