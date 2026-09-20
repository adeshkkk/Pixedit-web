'use client';

import React, { useState } from 'react';
import {
  FilterAdjustments,
  CreativePreset,
  CreativePresetId,
} from '@/types/editor';
import {
  DEFAULT_ADJUSTMENTS,
  CREATIVE_PRESETS,
  buildCssFilterString,
} from '@/lib/image-processing';
import {
  RotateCcw,
  Sparkles,
  Sliders,
  Palette,
  Check,
  Undo2,
  Redo2,
} from 'lucide-react';

interface FiltersPanelProps {
  adjustments: FilterAdjustments;
  onChangeAdjustments: (adj: FilterAdjustments) => void;
  activePreset: CreativePresetId;
  presetIntensity: number;
  onSelectPreset: (presetId: CreativePresetId, intensity?: number) => void;
  onChangeIntensity: (intensity: number) => void;
  onResetFilters: () => void;
  previewThumbnailUrl: string;
  theme: 'dark' | 'light';
}

export const FiltersPanel: React.FC<FiltersPanelProps> = ({
  adjustments,
  onChangeAdjustments,
  activePreset,
  presetIntensity,
  onSelectPreset,
  onChangeIntensity,
  onResetFilters,
  previewThumbnailUrl,
  theme,
}) => {
  const [tab, setTab] = useState<'basic' | 'presets'>('basic');
  const [categoryFilter, setCategoryFilter] = useState<string>('All');
  const isLight = theme === 'light';

  const handleSliderChange = (key: keyof FilterAdjustments, value: number) => {
    onChangeAdjustments({
      ...adjustments,
      [key]: value,
    });
  };

  const handleResetSingle = (key: keyof FilterAdjustments) => {
    onChangeAdjustments({
      ...adjustments,
      [key]: DEFAULT_ADJUSTMENTS[key],
    });
  };

  const basicSliders: Array<{
    key: keyof FilterAdjustments;
    label: string;
    min: number;
    max: number;
    step: number;
    unit?: string;
  }> = [
    { key: 'brightness', label: 'Brightness', min: -100, max: 100, step: 1 },
    { key: 'contrast', label: 'Contrast', min: -100, max: 100, step: 1 },
    { key: 'saturation', label: 'Saturation', min: -100, max: 100, step: 1 },
    { key: 'exposure', label: 'Exposure', min: -100, max: 100, step: 1 },
    { key: 'highlights', label: 'Highlights', min: -100, max: 100, step: 1 },
    { key: 'shadows', label: 'Shadows', min: -100, max: 100, step: 1 },
    { key: 'temperature', label: 'Temperature', min: -100, max: 100, step: 1 },
    { key: 'tint', label: 'Tint', min: -100, max: 100, step: 1 },
    { key: 'sharpness', label: 'Sharpness', min: 0, max: 100, step: 1 },
    { key: 'blur', label: 'Blur', min: 0, max: 30, step: 0.5, unit: 'px' },
    { key: 'opacity', label: 'Opacity', min: 0, max: 100, step: 1, unit: '%' },
    { key: 'vignette', label: 'Vignette', min: 0, max: 100, step: 1 },
  ];

  const categories = ['All', 'Classic', 'Cinematic', 'Tones', 'Atmosphere'];
  const filteredPresets =
    categoryFilter === 'All'
      ? CREATIVE_PRESETS
      : CREATIVE_PRESETS.filter((p) => p.category === categoryFilter || p.id === 'none');

  return (
    <div
      id="filters-panel"
      className="flex flex-col h-full overflow-y-auto p-4 space-y-5"
    >
      {/* Header & Sub-Tab Switcher */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1 p-1 rounded-lg border w-full">
          <button
            id="tab-basic-adjustments"
            onClick={() => setTab('basic')}
            className={`flex-1 py-1.5 text-xs font-semibold rounded-md flex items-center justify-center gap-1.5 transition-all ${
              tab === 'basic'
                ? isLight
                  ? 'bg-black text-white shadow-xs'
                  : 'bg-sky-600 text-white shadow-xs'
                : isLight
                ? 'text-black hover:bg-gray-100'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Sliders className="w-3.5 h-3.5" />
            <span>Basic Adjustments</span>
          </button>

          <button
            id="tab-creative-presets"
            onClick={() => setTab('presets')}
            className={`flex-1 py-1.5 text-xs font-semibold rounded-md flex items-center justify-center gap-1.5 transition-all ${
              tab === 'presets'
                ? isLight
                  ? 'bg-black text-white shadow-xs'
                  : 'bg-sky-600 text-white shadow-xs'
                : isLight
                ? 'text-black hover:bg-gray-100'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Palette className="w-3.5 h-3.5" />
            <span>Creative Filters</span>
          </button>
        </div>
      </div>

      {/* BASIC ADJUSTMENTS CONTENT */}
      {tab === 'basic' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between pb-1 border-b border-gray-200 dark:border-slate-800">
            <span
              className={`text-xs font-bold uppercase tracking-wider ${
                isLight ? 'text-black' : 'text-slate-300'
              }`}
            >
              Parameters
            </span>
            <button
              id="btn-reset-adjustments"
              onClick={onResetFilters}
              className={`text-xs font-medium flex items-center gap-1 transition-colors ${
                isLight
                  ? 'text-black hover:text-red-600'
                  : 'text-slate-400 hover:text-red-400'
              }`}
              title="Reset all basic sliders to 0"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Reset Filters</span>
            </button>
          </div>

          <div className="space-y-3.5">
            {basicSliders.map((item) => {
              const currentVal = adjustments[item.key];
              const isModified = currentVal !== DEFAULT_ADJUSTMENTS[item.key];

              return (
                <div key={item.key} className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span
                      className={`font-medium ${
                        isModified
                          ? isLight
                            ? 'text-black font-bold'
                            : 'text-sky-400 font-semibold'
                          : isLight
                          ? 'text-gray-800'
                          : 'text-slate-300'
                      }`}
                    >
                      {item.label}
                    </span>
                    <div className="flex items-center gap-1.5">
                      <span
                        className={`font-mono text-[11px] min-w-[32px] text-right ${
                          isModified
                            ? isLight
                              ? 'text-black font-bold'
                              : 'text-sky-400'
                            : 'opacity-60'
                        }`}
                      >
                        {currentVal > 0 && item.min < 0 ? `+${currentVal}` : currentVal}
                        {item.unit || ''}
                      </span>
                      {isModified && (
                        <button
                          onClick={() => handleResetSingle(item.key)}
                          className="text-[10px] opacity-60 hover:opacity-100 hover:text-red-500 p-0.5"
                          title="Reset this value"
                        >
                          ✕
                        </button>
                      )}
                    </div>
                  </div>

                  <input
                    type="range"
                    id={`slider-${item.key}`}
                    min={item.min}
                    max={item.max}
                    step={item.step}
                    value={currentVal}
                    onChange={(e) =>
                      handleSliderChange(item.key, parseFloat(e.target.value))
                    }
                    className="w-full"
                  />
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* CREATIVE FILTERS CONTENT */}
      {tab === 'presets' && (
        <div className="space-y-4">
          {/* Preset Intensity Slider (if preset selected) */}
          {activePreset !== 'none' && (
            <div
              className={`p-3 rounded-lg border space-y-2 ${
                isLight ? 'bg-gray-50 border-black' : 'bg-slate-900 border-slate-700'
              }`}
            >
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold">Preset Intensity</span>
                <span className="font-mono font-bold text-sky-500">
                  {presetIntensity}%
                </span>
              </div>
              <input
                type="range"
                id="slider-preset-intensity"
                min="0"
                max="100"
                value={presetIntensity}
                onChange={(e) => onChangeIntensity(parseInt(e.target.value, 10))}
                className="w-full"
              />
              <div className="flex justify-between text-[10px] opacity-60">
                <span>Subtle (20%)</span>
                <span>Default (100%)</span>
              </div>
            </div>
          )}

          {/* Category Filter Pills */}
          <div className="flex items-center gap-1 overflow-x-auto pb-1">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setCategoryFilter(cat)}
                className={`px-2.5 py-1 text-[11px] font-medium rounded-full border whitespace-nowrap transition-colors ${
                  categoryFilter === cat
                    ? isLight
                      ? 'bg-black text-white border-black'
                      : 'bg-sky-500 text-slate-950 font-bold border-sky-400'
                    : isLight
                    ? 'border-gray-300 text-black hover:bg-gray-100'
                    : 'border-slate-700 text-slate-400 hover:text-white'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Preset Cards Grid */}
          <div className="grid grid-cols-2 gap-2.5">
            {filteredPresets.map((preset) => {
              const isSelected = activePreset === preset.id;
              const sampleCssFilter = buildCssFilterString(
                DEFAULT_ADJUSTMENTS,
                preset.id,
                100
              );

              return (
                <div
                  key={preset.id}
                  id={`preset-card-${preset.id}`}
                  onClick={() => onSelectPreset(preset.id)}
                  className={`group cursor-pointer rounded-xl border p-2 flex flex-col items-center gap-2 transition-all relative overflow-hidden ${
                    isSelected
                      ? isLight
                        ? 'border-black ring-2 ring-black bg-gray-50'
                        : 'border-sky-500 ring-2 ring-sky-500/50 bg-sky-950/20'
                      : isLight
                      ? 'border-gray-200 hover:border-black hover:shadow-xs'
                      : 'border-slate-800 hover:border-slate-600 bg-slate-900/40'
                  }`}
                >
                  {/* Thumbnail with filter applied */}
                  <div className="w-full h-20 rounded-lg overflow-hidden relative bg-black/10">
                    <img
                      src={previewThumbnailUrl}
                      alt={preset.name}
                      style={{ filter: sampleCssFilter }}
                      className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                    {isSelected && (
                      <div className="absolute top-1.5 right-1.5 w-5 h-5 rounded-full bg-black text-white flex items-center justify-center text-[10px] font-bold shadow-md">
                        <Check className="w-3 h-3 text-white" />
                      </div>
                    )}
                  </div>

                  <div className="w-full text-center">
                    <div
                      className={`text-xs font-bold truncate ${
                        isSelected
                          ? isLight
                            ? 'text-black'
                            : 'text-sky-400'
                          : isLight
                          ? 'text-black'
                          : 'text-slate-200'
                      }`}
                    >
                      {preset.name}
                    </div>
                    <div className="text-[10px] opacity-60 truncate">
                      {preset.description}
                    </div>
                  </div>

                  {/* Apply Button */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onSelectPreset(preset.id);
                    }}
                    className={`w-full py-1 text-[11px] font-semibold rounded-md border transition-colors ${
                      isSelected
                        ? isLight
                          ? 'bg-black text-white border-black'
                          : 'bg-sky-500 text-slate-950 border-sky-400'
                        : isLight
                        ? 'border-black text-black hover:bg-black hover:text-white'
                        : 'border-slate-700 text-slate-300 hover:bg-slate-800'
                    }`}
                  >
                    {isSelected ? 'Applied' : 'Apply'}
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
