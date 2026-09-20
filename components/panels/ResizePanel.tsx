'use client';

import React, { useState, useEffect } from 'react';
import {
  ResizeSettings,
  ResizeUnit,
  ImageMetadata,
} from '@/types/editor';
import { formatBytes, convertUnit } from '@/lib/image-processing';
import {
  Lock,
  Unlock,
  RotateCcw,
  Maximize2,
  Check,
  Grid,
} from 'lucide-react';

interface ResizePanelProps {
  resize: ResizeSettings;
  imageMeta: ImageMetadata;
  onChangeResize: (settings: ResizeSettings) => void;
  onApplyResize: (w: number, h: number) => void;
  onResetResize: () => void;
  theme: 'dark' | 'light';
}

export const ResizePanel: React.FC<ResizePanelProps> = ({
  resize,
  imageMeta,
  onChangeResize,
  onApplyResize,
  onResetResize,
  theme,
}) => {
  const isLight = theme === 'light';

  const [activeUnit, setActiveUnit] = useState<ResizeUnit>(resize.unit || 'px');
  const [dpi, setDpi] = useState<number>(resize.dpi || 72);
  const [activePreset, setActivePreset] = useState<string>('custom');

  // Compute displayed values directly from resize state
  const displayWidth = convertUnit(
    resize.width,
    'px',
    activeUnit,
    dpi,
    resize.originalWidth
  );
  const displayHeight = convertUnit(
    resize.height,
    'px',
    activeUnit,
    dpi,
    resize.originalHeight
  );

  const handleUnitChange = (newUnit: ResizeUnit) => {
    setActiveUnit(newUnit);
    onChangeResize({ ...resize, unit: newUnit });
  };

  const handleDpiChange = (newDpi: number) => {
    setDpi(newDpi);
    onChangeResize({ ...resize, dpi: newDpi });
  };

  const handleWidthChange = (valStr: string) => {
    const num = parseFloat(valStr);
    if (isNaN(num) || num <= 0) return;

    // Convert back to px
    const pxW = convertUnit(num, activeUnit, 'px', dpi, resize.originalWidth);
    let pxH = resize.height;

    if (resize.lockAspectRatio) {
      const ratio = resize.originalHeight / resize.originalWidth;
      pxH = Math.round(pxW * ratio);
    }

    onChangeResize({
      ...resize,
      width: pxW,
      height: pxH,
    });
    setActivePreset('custom');
  };

  const handleHeightChange = (valStr: string) => {
    const num = parseFloat(valStr);
    if (isNaN(num) || num <= 0) return;

    // Convert back to px
    const pxH = convertUnit(num, activeUnit, 'px', dpi, resize.originalHeight);
    let pxW = resize.width;

    if (resize.lockAspectRatio) {
      const ratio = resize.originalWidth / resize.originalHeight;
      pxW = Math.round(pxH * ratio);
    }

    onChangeResize({
      ...resize,
      width: pxW,
      height: pxH,
    });
    setActivePreset('custom');
  };

  const handlePercentageClick = (pct: number) => {
    const pxW = Math.round((resize.originalWidth * pct) / 100);
    const pxH = Math.round((resize.originalHeight * pct) / 100);
    onChangeResize({
      ...resize,
      width: pxW,
      height: pxH,
      percentage: pct,
    });
    setActivePreset(`${pct}%`);
  };

  const presets = [
    { id: 'ig-post', label: 'Instagram Post', w: 1080, h: 1080, cat: 'Social' },
    { id: 'ig-story', label: 'Instagram Story', w: 1080, h: 1920, cat: 'Social' },
    { id: 'yt-thumb', label: 'YouTube Thumbnail', w: 1280, h: 720, cat: 'Social' },
    { id: 'yt-banner', label: 'YouTube Banner', w: 2560, h: 1440, cat: 'Social' },
    { id: 'fb-post', label: 'Facebook Post', w: 1200, h: 630, cat: 'Social' },
    { id: 'li-post', label: 'LinkedIn Post', w: 1200, h: 627, cat: 'Social' },
    { id: 'profile', label: 'Profile Picture', w: 800, h: 800, cat: 'Avatar' },
    { id: 'passport', label: 'Passport Photo (2x2")', w: 600, h: 600, cat: 'Print' },
    { id: 'a4', label: 'A4 Document (300 DPI)', w: 2480, h: 3508, cat: 'Print' },
    { id: 'a3', label: 'A3 Document (300 DPI)', w: 3508, h: 4960, cat: 'Print' },
  ];

  const handleApplyPreset = (w: number, h: number, id: string) => {
    setActivePreset(id);
    onChangeResize({
      ...resize,
      width: w,
      height: h,
    });
  };

  // Calculate Aspect Ratio string
  const gcd = (a: number, b: number): number => (b === 0 ? a : gcd(b, a % b));
  const divisor = gcd(Math.round(resize.width), Math.round(resize.height));
  const aspectW = Math.round(resize.width / divisor);
  const aspectH = Math.round(resize.height / divisor);
  const simplifiedAspect =
    aspectW < 100 && aspectH < 100
      ? `${aspectW}:${aspectH}`
      : `${(resize.width / resize.height).toFixed(2)}:1`;

  const megapixels = (
    (resize.width * resize.height) /
    1000000
  ).toFixed(1);

  return (
    <div
      id="resize-panel"
      className="flex flex-col h-full overflow-y-auto p-4 space-y-5"
    >
      {/* 1. CURRENT IMAGE METADATA CARD */}
      <div
        className={`p-3.5 rounded-xl border space-y-2.5 ${
          isLight ? 'bg-gray-50 border-black' : 'bg-slate-900/70 border-slate-800'
        }`}
      >
        <div className="flex items-center justify-between text-xs pb-1 border-b border-gray-200 dark:border-slate-800">
          <span className="font-bold uppercase tracking-wider">Image Statistics</span>
          <span className="font-mono text-sky-500 font-semibold">{megapixels} MP</span>
        </div>

        <div className="grid grid-cols-2 gap-2 text-xs">
          <div>
            <span className="text-[10px] opacity-60 block">Current Size</span>
            <span className="font-mono font-semibold">
              {Math.round(resize.width)} × {Math.round(resize.height)} px
            </span>
          </div>
          <div>
            <span className="text-[10px] opacity-60 block">Original Size</span>
            <span className="font-mono font-semibold">
              {resize.originalWidth} × {resize.originalHeight} px
            </span>
          </div>
          <div>
            <span className="text-[10px] opacity-60 block">Aspect Ratio</span>
            <span className="font-mono font-semibold">{simplifiedAspect}</span>
          </div>
          <div>
            <span className="text-[10px] opacity-60 block">File Size</span>
            <span className="font-mono font-semibold">
              {formatBytes(imageMeta.fileSizeBytes)}
            </span>
          </div>
        </div>
      </div>

      {/* 2. UNIT SWITCHER */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-xs">
          <span className="font-bold uppercase tracking-wider">Measurement Unit</span>
          <div className="flex items-center gap-1.5">
            <span className="text-[11px] opacity-70">DPI:</span>
            <select
              value={dpi}
              onChange={(e) => handleDpiChange(parseInt(e.target.value, 10))}
              className={`text-xs px-1.5 py-0.5 rounded border font-mono ${
                isLight ? 'bg-white border-black text-black' : 'bg-slate-800 border-slate-700 text-white'
              }`}
            >
              <option value={72}>72 (Screen)</option>
              <option value={150}>150 (Web HD)</option>
              <option value={300}>300 (Print High-Res)</option>
            </select>
          </div>
        </div>

        <div className="flex rounded-lg border p-1 gap-1">
          {(['px', 'cm', 'mm', 'in', 'percent'] as ResizeUnit[]).map((unit) => (
            <button
              key={unit}
              onClick={() => handleUnitChange(unit)}
              className={`flex-1 py-1 text-xs font-semibold rounded transition-colors ${
                activeUnit === unit
                  ? isLight
                    ? 'bg-black text-white'
                    : 'bg-sky-600 text-white'
                  : isLight
                  ? 'text-black hover:bg-gray-100'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              {unit === 'percent' ? '%' : unit}
            </button>
          ))}
        </div>
      </div>

      {/* 3. CUSTOM WIDTH & HEIGHT INPUTS */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold uppercase tracking-wider">
            Dimensions ({activeUnit})
          </span>

          <button
            onClick={() =>
              onChangeResize({
                ...resize,
                lockAspectRatio: !resize.lockAspectRatio,
              })
            }
            className={`flex items-center gap-1 text-xs px-2 py-1 rounded border transition-colors ${
              resize.lockAspectRatio
                ? isLight
                  ? 'bg-black text-white border-black'
                  : 'bg-sky-500/20 text-sky-400 border-sky-500/40'
                : 'opacity-60 border-transparent hover:opacity-100'
            }`}
            title={
              resize.lockAspectRatio
                ? 'Aspect Ratio Locked'
                : 'Aspect Ratio Unlocked'
            }
          >
            {resize.lockAspectRatio ? (
              <Lock className="w-3.5 h-3.5" />
            ) : (
              <Unlock className="w-3.5 h-3.5" />
            )}
            <span>Lock Ratio</span>
          </button>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1">
            <label className="text-[11px] font-medium opacity-70 block">
              Width ({activeUnit})
            </label>
            <input
              type="number"
              id="input-resize-width"
              value={displayWidth}
              onChange={(e) => handleWidthChange(e.target.value)}
              className={`w-full px-2.5 py-1.5 rounded-lg border text-sm font-mono ${
                isLight
                  ? 'bg-white border-black text-black font-semibold focus:ring-1 focus:ring-black'
                  : 'bg-slate-900 border-slate-700 text-white focus:border-sky-500'
              }`}
            />
          </div>

          <div className="space-y-1">
            <label className="text-[11px] font-medium opacity-70 block">
              Height ({activeUnit})
            </label>
            <input
              type="number"
              id="input-resize-height"
              value={displayHeight}
              onChange={(e) => handleHeightChange(e.target.value)}
              className={`w-full px-2.5 py-1.5 rounded-lg border text-sm font-mono ${
                isLight
                  ? 'bg-white border-black text-black font-semibold focus:ring-1 focus:ring-black'
                  : 'bg-slate-900 border-slate-700 text-white focus:border-sky-500'
              }`}
            />
          </div>
        </div>
      </div>

      {/* 4. PERCENTAGE QUICK BUTTONS */}
      <div className="space-y-2">
        <span className="text-xs font-bold uppercase tracking-wider block">
          Scale By Percentage
        </span>
        <div className="grid grid-cols-6 gap-1.5">
          {[25, 50, 75, 100, 150, 200].map((pct) => (
            <button
              key={pct}
              onClick={() => handlePercentageClick(pct)}
              className={`py-1.5 text-xs font-semibold rounded border transition-colors ${
                activePreset === `${pct}%`
                  ? isLight
                    ? 'bg-black text-white border-black'
                    : 'bg-sky-600 text-white border-sky-400'
                  : isLight
                  ? 'border-gray-300 text-black hover:bg-gray-100'
                  : 'border-slate-800 text-slate-300 hover:bg-slate-800'
              }`}
            >
              {pct}%
            </button>
          ))}
        </div>
      </div>

      {/* 5. COMMON PRESETS */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold uppercase tracking-wider">
            Standard Presets
          </span>
          <button
            onClick={onResetResize}
            className="text-[11px] opacity-70 hover:opacity-100 flex items-center gap-1"
            title="Reset to original dimensions"
          >
            <RotateCcw className="w-3 h-3" />
            <span>Reset Original</span>
          </button>
        </div>

        <div className="grid grid-cols-2 gap-2">
          {presets.map((preset) => {
            const isSelected = activePreset === preset.id;
            return (
              <button
                key={preset.id}
                onClick={() => handleApplyPreset(preset.w, preset.h, preset.id)}
                className={`p-2 rounded-lg border text-left flex flex-col justify-between transition-all ${
                  isSelected
                    ? isLight
                      ? 'border-black bg-gray-50 ring-1 ring-black'
                      : 'border-sky-500 bg-sky-950/30'
                    : isLight
                    ? 'border-gray-200 hover:border-black'
                    : 'border-slate-800 hover:border-slate-600 bg-slate-900/30'
                }`}
              >
                <div className="flex items-center justify-between w-full">
                  <span
                    className={`text-xs font-semibold truncate ${
                      isSelected
                        ? isLight
                          ? 'text-black'
                          : 'text-sky-400'
                        : ''
                    }`}
                  >
                    {preset.label}
                  </span>
                  {isSelected && <Check className="w-3 h-3 text-sky-500 shrink-0" />}
                </div>
                <span className="text-[10px] font-mono opacity-60">
                  {preset.w} × {preset.h}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
