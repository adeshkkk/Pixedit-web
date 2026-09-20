'use client';

import React, { useRef, useState } from 'react';
import {
  BackgroundSettings,
  BackgroundMode,
} from '@/types/editor';
import {
  Scissors,
  RotateCcw,
  Palette,
  Sparkles,
  Image as ImageIcon,
  Droplets,
  Layers,
  Upload,
  Check,
  Compass,
} from 'lucide-react';

interface BackgroundPanelProps {
  settings: BackgroundSettings;
  onChangeSettings: (settings: BackgroundSettings) => void;
  onRemoveBackground: () => void;
  onRestoreBackground: () => void;
  isRemoving: boolean;
  theme: 'dark' | 'light';
}

export const BackgroundPanel: React.FC<BackgroundPanelProps> = ({
  settings,
  onChangeSettings,
  onRemoveBackground,
  onRestoreBackground,
  isRemoving,
  theme,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const isLight = theme === 'light';

  const solidPalette = [
    '#ffffff',
    '#000000',
    '#e2e8f0',
    '#64748b',
    '#ef4444',
    '#f97316',
    '#eab308',
    '#10b981',
    '#06b6d4',
    '#3b82f6',
    '#8b5cf6',
    '#ec4899',
  ];

  const handleModeChange = (mode: BackgroundMode) => {
    onChangeSettings({
      ...settings,
      mode,
      isRemoved: mode !== 'original',
    });
  };

  const handleCustomBgUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      onChangeSettings({
        ...settings,
        mode: 'image',
        isRemoved: true,
        image: {
          ...settings.image,
          dataUrl: reader.result as string,
          fileName: file.name,
        },
      });
    };
    reader.readAsDataURL(file);
  };

  return (
    <div
      id="background-panel"
      className="flex flex-col h-full overflow-y-auto p-4 space-y-5"
    >
      {/* 1. BACKGROUND REMOVAL SECTION */}
      <div
        className={`p-3.5 rounded-xl border space-y-3 ${
          isLight ? 'bg-gray-50 border-black' : 'bg-slate-900/70 border-slate-800'
        }`}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Scissors className="w-4 h-4 text-sky-500" />
            <span className="text-xs font-bold uppercase tracking-wider">
              Background Cutout
            </span>
          </div>
          {settings.isRemoved && (
            <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
              Active
            </span>
          )}
        </div>

        <p className="text-xs opacity-70">
          Isolate subject with automatic browser-based edge segmentation.
        </p>

        <div className="flex gap-2">
          <button
            id="btn-remove-background"
            onClick={onRemoveBackground}
            disabled={isRemoving}
            className={`flex-1 py-2 text-xs font-bold rounded-lg flex items-center justify-center gap-2 border transition-all ${
              isRemoving
                ? 'opacity-50 cursor-wait'
                : isLight
                ? 'bg-black text-white border-black hover:bg-gray-800'
                : 'bg-sky-500 text-slate-950 border-sky-400 hover:bg-sky-400'
            }`}
          >
            <Scissors className="w-4 h-4" />
            <span>{isRemoving ? 'Processing Cutout...' : 'Remove Background'}</span>
          </button>

          {settings.isRemoved && (
            <button
              id="btn-restore-background"
              onClick={onRestoreBackground}
              className={`px-3 py-2 text-xs font-semibold rounded-lg border transition-colors ${
                isLight
                  ? 'border-black text-black hover:bg-gray-200'
                  : 'border-slate-700 text-slate-300 hover:bg-slate-800'
              }`}
              title="Restore original background"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Removal Fine-Tuning Controls */}
        <div className="pt-2 border-t border-gray-200 dark:border-slate-800 space-y-2">
          <div className="flex justify-between text-[11px]">
            <span>Tolerance (Color Difference)</span>
            <span className="font-mono font-bold">{settings.removalTolerance}</span>
          </div>
          <input
            type="range"
            min="5"
            max="60"
            value={settings.removalTolerance}
            onChange={(e) =>
              onChangeSettings({
                ...settings,
                removalTolerance: parseInt(e.target.value, 10),
              })
            }
            className="w-full"
          />

          <div className="flex justify-between text-[11px]">
            <span>Edge Smoothing</span>
            <span className="font-mono font-bold">{settings.edgeSmooth}px</span>
          </div>
          <input
            type="range"
            min="0"
            max="5"
            value={settings.edgeSmooth}
            onChange={(e) =>
              onChangeSettings({
                ...settings,
                edgeSmooth: parseInt(e.target.value, 10),
              })
            }
            className="w-full"
          />
        </div>
      </div>

      {/* 2. BACKGROUND REPLACEMENT MODES */}
      <div className="space-y-3">
        <span className="text-xs font-bold uppercase tracking-wider block">
          Replace Background
        </span>

        <div className="grid grid-cols-2 gap-2">
          <button
            id="btn-bg-mode-transparent"
            onClick={() => handleModeChange('removed')}
            className={`p-2.5 rounded-lg border flex flex-col items-center gap-1.5 text-xs font-medium transition-all ${
              settings.mode === 'removed'
                ? isLight
                  ? 'bg-black text-white border-black font-bold'
                  : 'bg-sky-600 text-white border-sky-400 font-bold'
                : isLight
                ? 'border-gray-200 hover:border-black'
                : 'border-slate-800 hover:border-slate-600 bg-slate-900/40'
            }`}
          >
            <div className="w-5 h-5 rounded border border-gray-400 checkerboard-pattern" />
            <span>Transparent</span>
          </button>

          <button
            id="btn-bg-mode-color"
            onClick={() => handleModeChange('color')}
            className={`p-2.5 rounded-lg border flex flex-col items-center gap-1.5 text-xs font-medium transition-all ${
              settings.mode === 'color'
                ? isLight
                  ? 'bg-black text-white border-black font-bold'
                  : 'bg-sky-600 text-white border-sky-400 font-bold'
                : isLight
                ? 'border-gray-200 hover:border-black'
                : 'border-slate-800 hover:border-slate-600 bg-slate-900/40'
            }`}
          >
            <Palette className="w-5 h-5" />
            <span>Solid Color</span>
          </button>

          <button
            id="btn-bg-mode-gradient"
            onClick={() => handleModeChange('gradient')}
            className={`p-2.5 rounded-lg border flex flex-col items-center gap-1.5 text-xs font-medium transition-all ${
              settings.mode === 'gradient'
                ? isLight
                  ? 'bg-black text-white border-black font-bold'
                  : 'bg-sky-600 text-white border-sky-400 font-bold'
                : isLight
                ? 'border-gray-200 hover:border-black'
                : 'border-slate-800 hover:border-slate-600 bg-slate-900/40'
            }`}
          >
            <Layers className="w-5 h-5" />
            <span>Gradient</span>
          </button>

          <button
            id="btn-bg-mode-blur"
            onClick={() => handleModeChange('blur')}
            className={`p-2.5 rounded-lg border flex flex-col items-center gap-1.5 text-xs font-medium transition-all ${
              settings.mode === 'blur'
                ? isLight
                  ? 'bg-black text-white border-black font-bold'
                  : 'bg-sky-600 text-white border-sky-400 font-bold'
                : isLight
                ? 'border-gray-200 hover:border-black'
                : 'border-slate-800 hover:border-slate-600 bg-slate-900/40'
            }`}
          >
            <Droplets className="w-5 h-5" />
            <span>Blur Background</span>
          </button>

          <button
            id="btn-bg-mode-image"
            onClick={() => handleModeChange('image')}
            className={`col-span-2 p-2.5 rounded-lg border flex items-center justify-center gap-2 text-xs font-medium transition-all ${
              settings.mode === 'image'
                ? isLight
                  ? 'bg-black text-white border-black font-bold'
                  : 'bg-sky-600 text-white border-sky-400 font-bold'
                : isLight
                ? 'border-gray-200 hover:border-black'
                : 'border-slate-800 hover:border-slate-600 bg-slate-900/40'
            }`}
          >
            <ImageIcon className="w-4 h-4" />
            <span>Custom Background Image</span>
          </button>
        </div>
      </div>

      {/* 3. SOLID COLOR CONTROLS */}
      {settings.mode === 'color' && (
        <div className="space-y-3 p-3 rounded-lg border border-gray-200 dark:border-slate-800">
          <div className="flex items-center justify-between text-xs">
            <span className="font-semibold">Pick Color</span>
            <div className="flex items-center gap-2">
              <input
                type="color"
                id="bg-solid-color-input"
                value={settings.solidColor}
                onChange={(e) =>
                  onChangeSettings({ ...settings, solidColor: e.target.value })
                }
                className="w-7 h-7 rounded border border-gray-300 cursor-pointer p-0"
              />
              <span className="font-mono text-xs uppercase">{settings.solidColor}</span>
            </div>
          </div>

          <div className="grid grid-cols-6 gap-2 pt-1">
            {solidPalette.map((color) => (
              <button
                key={color}
                onClick={() => onChangeSettings({ ...settings, solidColor: color })}
                style={{ backgroundColor: color }}
                className={`w-7 h-7 rounded-md border transition-transform ${
                  settings.solidColor.toLowerCase() === color.toLowerCase()
                    ? 'scale-110 ring-2 ring-sky-500 border-white'
                    : 'border-gray-400/40 hover:scale-105'
                }`}
                title={color}
              />
            ))}
          </div>
        </div>
      )}

      {/* 4. GRADIENT CONTROLS */}
      {settings.mode === 'gradient' && (
        <div className="space-y-3 p-3 rounded-lg border border-gray-200 dark:border-slate-800">
          <div className="flex items-center justify-between text-xs">
            <span>Start Color</span>
            <input
              type="color"
              id="bg-gradient-start"
              value={settings.gradient.startColor}
              onChange={(e) =>
                onChangeSettings({
                  ...settings,
                  gradient: { ...settings.gradient, startColor: e.target.value },
                })
              }
              className="w-7 h-7 rounded border cursor-pointer"
            />
          </div>

          <div className="flex items-center justify-between text-xs">
            <span>End Color</span>
            <input
              type="color"
              id="bg-gradient-end"
              value={settings.gradient.endColor}
              onChange={(e) =>
                onChangeSettings({
                  ...settings,
                  gradient: { ...settings.gradient, endColor: e.target.value },
                })
              }
              className="w-7 h-7 rounded border cursor-pointer"
            />
          </div>

          <div className="space-y-1 text-xs">
            <span>Direction</span>
            <div className="grid grid-cols-4 gap-1.5 pt-1">
              {[
                { label: 'Right', val: 'to right' },
                { label: 'Down', val: 'to bottom' },
                { label: 'Diagonal', val: 'to bottom right' },
                { label: 'Radial', val: 'circle' },
              ].map((dir) => (
                <button
                  key={dir.val}
                  onClick={() =>
                    onChangeSettings({
                      ...settings,
                      gradient: {
                        ...settings.gradient,
                        direction: dir.val as any,
                      },
                    })
                  }
                  className={`py-1 text-[11px] rounded border ${
                    settings.gradient.direction === dir.val
                      ? isLight
                        ? 'bg-black text-white border-black font-semibold'
                        : 'bg-sky-600 text-white border-sky-400'
                      : isLight
                      ? 'border-gray-200 hover:bg-gray-100'
                      : 'border-slate-700 hover:bg-slate-800'
                  }`}
                >
                  {dir.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* 5. BACKGROUND BLUR CONTROLS */}
      {settings.mode === 'blur' && (
        <div className="space-y-3 p-3 rounded-lg border border-gray-200 dark:border-slate-800">
          <div className="flex justify-between text-xs">
            <span className="font-semibold">Blur Intensity</span>
            <span className="font-mono font-bold text-sky-500">
              {settings.blurIntensity}px
            </span>
          </div>
          <input
            type="range"
            id="slider-bg-blur"
            min="2"
            max="40"
            value={settings.blurIntensity}
            onChange={(e) =>
              onChangeSettings({
                ...settings,
                blurIntensity: parseInt(e.target.value, 10),
              })
            }
            className="w-full"
          />

          <div className="grid grid-cols-3 gap-2 pt-1">
            {[
              { label: 'Light', val: 8 },
              { label: 'Medium', val: 18 },
              { label: 'Strong', val: 32 },
            ].map((preset) => (
              <button
                key={preset.label}
                onClick={() =>
                  onChangeSettings({ ...settings, blurIntensity: preset.val })
                }
                className={`py-1 text-xs rounded border ${
                  settings.blurIntensity === preset.val
                    ? isLight
                      ? 'bg-black text-white border-black font-semibold'
                      : 'bg-sky-600 text-white border-sky-400 font-semibold'
                    : isLight
                    ? 'border-gray-200 hover:bg-gray-100'
                    : 'border-slate-700 hover:bg-slate-800'
                }`}
              >
                {preset.label}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* 6. BACKGROUND IMAGE CONTROLS */}
      {settings.mode === 'image' && (
        <div className="space-y-3 p-3 rounded-lg border border-gray-200 dark:border-slate-800">
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleCustomBgUpload}
            accept="image/*"
            className="hidden"
          />

          <button
            id="btn-upload-bg-image"
            onClick={() => fileInputRef.current?.click()}
            className={`w-full py-2 text-xs font-semibold rounded-lg border flex items-center justify-center gap-2 transition-colors ${
              isLight
                ? 'border-black text-black hover:bg-black hover:text-white'
                : 'border-sky-500 text-sky-400 hover:bg-sky-500/10'
            }`}
          >
            <Upload className="w-3.5 h-3.5" />
            <span>
              {settings.image.fileName ? 'Change Background' : 'Upload Background'}
            </span>
          </button>

          {settings.image.fileName && (
            <span className="text-[11px] block truncate opacity-70">
              Selected: {settings.image.fileName}
            </span>
          )}

          {/* Scale & Fit Controls */}
          <div className="space-y-2 pt-2 border-t border-gray-200 dark:border-slate-800">
            <div className="flex justify-between text-[11px]">
              <span>Scale</span>
              <span className="font-mono">{settings.image.scale || 100}%</span>
            </div>
            <input
              type="range"
              min="50"
              max="200"
              value={settings.image.scale || 100}
              onChange={(e) =>
                onChangeSettings({
                  ...settings,
                  image: {
                    ...settings.image,
                    scale: parseInt(e.target.value, 10),
                  },
                })
              }
              className="w-full"
            />

            <div className="flex gap-2 pt-1 text-xs">
              <button
                onClick={() =>
                  onChangeSettings({
                    ...settings,
                    image: { ...settings.image, fit: 'cover' },
                  })
                }
                className={`flex-1 py-1 rounded border text-[11px] ${
                  settings.image.fit === 'cover'
                    ? isLight
                      ? 'bg-black text-white border-black font-semibold'
                      : 'bg-sky-600 text-white'
                    : 'border-gray-300 dark:border-slate-700'
                }`}
              >
                Cover
              </button>
              <button
                onClick={() =>
                  onChangeSettings({
                    ...settings,
                    image: { ...settings.image, fit: 'contain' },
                  })
                }
                className={`flex-1 py-1 rounded border text-[11px] ${
                  settings.image.fit === 'contain'
                    ? isLight
                      ? 'bg-black text-white border-black font-semibold'
                      : 'bg-sky-600 text-white'
                    : 'border-gray-300 dark:border-slate-700'
                }`}
              >
                Contain
              </button>
              <button
                onClick={() =>
                  onChangeSettings({
                    ...settings,
                    image: {
                      ...settings.image,
                      scale: 100,
                      xOffset: 0,
                      yOffset: 0,
                    },
                  })
                }
                className="px-2 py-1 rounded border text-[11px] opacity-70 hover:opacity-100"
                title="Reset Image Position"
              >
                Reset
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
