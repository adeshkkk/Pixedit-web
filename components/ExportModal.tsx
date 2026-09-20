'use client';

import React, { useState, useEffect } from 'react';
import {
  X,
  Download,
  FileImage,
  Check,
  AlertCircle,
  Sparkles,
} from 'lucide-react';
import {
  EditorState,
  ImageMetadata,
  ExportSettings,
} from '@/types/editor';
import {
  renderFinalCanvas,
  formatBytes,
  loadImage,
} from '@/lib/image-processing';

interface ExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  editorState: EditorState;
  imageMeta: ImageMetadata;
  cutoutCanvas: HTMLCanvasElement | null;
  theme: 'dark' | 'light';
}

export const ExportModal: React.FC<ExportModalProps> = ({
  isOpen,
  onClose,
  editorState,
  imageMeta,
  cutoutCanvas,
  theme,
}) => {
  const [format, setFormat] = useState<'png' | 'jpeg' | 'webp'>('png');
  const [quality, setQuality] = useState<number>(90); // 10 - 100
  const [isExporting, setIsExporting] = useState<boolean>(false);

  const isLight = theme === 'light';

  // Estimate file size dynamically based on format and resolution
  const targetPixels = editorState.resize.width * editorState.resize.height;
  const baseBytes = targetPixels * 4; // Raw 32-bit RGBA
  let estimatedSize = imageMeta.fileSizeBytes;
  if (format === 'png') {
    estimatedSize = Math.round(baseBytes * 0.4);
  } else if (format === 'jpeg') {
    const qFactor = (quality / 100) * 0.15;
    estimatedSize = Math.round(baseBytes * Math.max(0.04, qFactor));
  } else {
    const qFactor = (quality / 100) * 0.11;
    estimatedSize = Math.round(baseBytes * Math.max(0.03, qFactor));
  }

  if (!isOpen) return null;

  const handleDownload = async (forceTransparentPng = false) => {
    setIsExporting(true);
    try {
      const activeFormat = forceTransparentPng ? 'png' : format;
      const mimeType =
        activeFormat === 'png'
          ? 'image/png'
          : activeFormat === 'jpeg'
          ? 'image/jpeg'
          : 'image/webp';

      // Load original image element
      const srcImg = await loadImage(imageMeta.dataUrl);

      // Render master canvas with exact resolution and all filters/backgrounds
      const renderedCanvas = await renderFinalCanvas(
        srcImg,
        cutoutCanvas,
        editorState.adjustments,
        editorState.activePreset,
        editorState.presetIntensity,
        forceTransparentPng
          ? { ...editorState.background, mode: 'removed', isRemoved: true }
          : editorState.background,
        editorState.resize
      );

      // Export blob at requested quality
      const qVal = activeFormat === 'png' ? undefined : quality / 100;
      const dataUrl = renderedCanvas.toDataURL(mimeType, qVal);

      // Trigger download
      const originalBaseName = imageMeta.name.replace(/\.[^/.]+$/, '');
      const ext = activeFormat === 'jpeg' ? 'jpg' : activeFormat;
      const filename = `${originalBaseName}_edited_${Math.round(
        editorState.resize.width
      )}x${Math.round(editorState.resize.height)}.${ext}`;

      const link = document.createElement('a');
      link.download = filename;
      link.href = dataUrl;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      onClose();
    } catch (err) {
      console.error('Export failed', err);
      alert('Error rendering image for export. Please try again.');
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div
      id="export-modal-backdrop"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150"
    >
      <div
        id="export-modal-card"
        className={`w-full max-w-lg rounded-2xl border shadow-2xl overflow-hidden flex flex-col ${
          isLight
            ? 'bg-white border-black text-black'
            : 'bg-[#141720] border-slate-700 text-white'
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-200 dark:border-slate-800">
          <div className="flex items-center gap-2.5">
            <div
              className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                isLight ? 'bg-black text-white' : 'bg-sky-500 text-slate-950 font-bold'
              }`}
            >
              <Download className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-base leading-tight">Export Photo</h3>
              <p className="text-xs opacity-60">
                Choose format, quality, and download
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg opacity-60 hover:opacity-100 transition-opacity"
            title="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 space-y-5">
          {/* Format Selector */}
          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-wider block">
              Image Format
            </label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { id: 'png', label: 'PNG', desc: 'Lossless & Transparency' },
                { id: 'jpeg', label: 'JPG', desc: 'Best for standard photos' },
                { id: 'webp', label: 'WEBP', desc: 'Modern high compression' },
              ].map((f) => (
                <button
                  key={f.id}
                  onClick={() => setFormat(f.id as any)}
                  className={`p-3 rounded-xl border flex flex-col items-center gap-1 transition-all ${
                    format === f.id
                      ? isLight
                        ? 'border-black bg-gray-50 ring-2 ring-black font-bold'
                        : 'border-sky-500 bg-sky-950/40 ring-2 ring-sky-500/50 font-bold'
                      : isLight
                      ? 'border-gray-200 hover:border-black'
                      : 'border-slate-800 hover:border-slate-600 bg-slate-900/30'
                  }`}
                >
                  <span className="text-sm font-bold">{f.label}</span>
                  <span className="text-[10px] opacity-60 text-center leading-tight">
                    {f.desc}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Quality Slider (for JPG & WEBP) */}
          {(format === 'jpeg' || format === 'webp') && (
            <div className="space-y-2 p-3.5 rounded-xl border border-gray-200 dark:border-slate-800">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold">Image Compression Quality</span>
                <span className="font-mono font-bold text-sky-500">{quality}%</span>
              </div>
              <input
                type="range"
                id="slider-export-quality"
                min="10"
                max="100"
                value={quality}
                onChange={(e) => setQuality(parseInt(e.target.value, 10))}
                className="w-full"
              />
              <div className="flex justify-between text-[10px] opacity-60">
                <span>Smaller File (10%)</span>
                <span>Maximum Fidelity (100%)</span>
              </div>
            </div>
          )}

          {/* Live Export Summary */}
          <div
            className={`p-3.5 rounded-xl border grid grid-cols-3 gap-2 text-center text-xs ${
              isLight ? 'bg-gray-50 border-black' : 'bg-slate-900/60 border-slate-800'
            }`}
          >
            <div>
              <span className="text-[10px] opacity-60 block">Format</span>
              <span className="font-bold uppercase">{format}</span>
            </div>
            <div>
              <span className="text-[10px] opacity-60 block">Output Dimensions</span>
              <span className="font-mono font-bold">
                {Math.round(editorState.resize.width)} ×{' '}
                {Math.round(editorState.resize.height)}
              </span>
            </div>
            <div>
              <span className="text-[10px] opacity-60 block">Estimated Size</span>
              <span className="font-mono font-bold text-emerald-500">
                ~{formatBytes(estimatedSize)}
              </span>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="px-5 py-4 border-t border-gray-200 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-end gap-2.5">
          {/* Download Transparent PNG option */}
          <button
            id="btn-download-transparent-png"
            onClick={() => handleDownload(true)}
            disabled={isExporting}
            className={`w-full sm:w-auto px-3.5 py-2 rounded-xl text-xs font-semibold border transition-colors ${
              isLight
                ? 'border-black text-black hover:bg-gray-100'
                : 'border-slate-700 text-slate-300 hover:bg-slate-800'
            }`}
            title="Export image with transparent background"
          >
            Download Transparent PNG
          </button>

          {/* Download Image Button */}
          <button
            id="btn-confirm-export"
            onClick={() => handleDownload(false)}
            disabled={isExporting}
            className={`w-full sm:w-auto px-5 py-2 rounded-xl text-xs font-bold border flex items-center justify-center gap-2 shadow-md transition-all ${
              isExporting
                ? 'opacity-60 cursor-wait'
                : isLight
                ? 'bg-black text-white border-black hover:bg-gray-800'
                : 'bg-sky-500 text-slate-950 border-sky-400 hover:bg-sky-400'
            }`}
          >
            <Download className="w-4 h-4" />
            <span>{isExporting ? 'Rendering Image...' : 'Download Image'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
