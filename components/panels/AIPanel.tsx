'use client';

import React, { useState } from 'react';
import {
  Sparkles,
  Wand2,
  Check,
  RotateCcw,
  Sliders,
  Send,
  Zap,
} from 'lucide-react';
import { FilterAdjustments, CreativePresetId } from '@/types/editor';

interface AIPanelProps {
  onAutoEnhance: () => void;
  isEnhancing: boolean;
  onApplyAIResults: (
    adjustments: FilterAdjustments,
    preset?: CreativePresetId
  ) => void;
  imageBase64: string;
  theme: 'dark' | 'light';
}

export const AIPanel: React.FC<AIPanelProps> = ({
  onAutoEnhance,
  isEnhancing,
  onApplyAIResults,
  imageBase64,
  theme,
}) => {
  const isLight = theme === 'light';
  const [promptNote, setPromptNote] = useState<string>('');
  const [aiLoading, setAiLoading] = useState<boolean>(false);
  const [aiCritique, setAiCritique] = useState<string | null>(null);
  const [lastAppliedStyle, setLastAppliedStyle] = useState<string | null>(null);

  const aiStyles = [
    {
      name: 'Golden Hour Glow',
      desc: 'Warm sun kissed lighting & soft highlights',
      prompt: 'warm golden sunset lighting with lifted shadows',
      adjustments: {
        brightness: 12,
        contrast: 15,
        saturation: 22,
        exposure: 8,
        highlights: -15,
        shadows: 20,
        temperature: 30,
        tint: 5,
        sharpness: 20,
        blur: 0,
        opacity: 100,
        vignette: 15,
      },
      preset: 'warm' as CreativePresetId,
    },
    {
      name: 'Studio Commercial Pop',
      desc: 'Crisp commercial product clarity & true whites',
      prompt: 'commercial studio clarity with high dynamic range',
      adjustments: {
        brightness: 14,
        contrast: 22,
        saturation: 18,
        exposure: 10,
        highlights: -8,
        shadows: 16,
        temperature: -5,
        tint: 0,
        sharpness: 35,
        blur: 0,
        opacity: 100,
        vignette: 0,
      },
      preset: 'vivid' as CreativePresetId,
    },
    {
      name: 'Moody Cinema Grade',
      desc: 'Teal & orange film grade with deep blacks',
      prompt: 'cinematic teal and orange mood with textured darks',
      adjustments: {
        brightness: -5,
        contrast: 32,
        saturation: 12,
        exposure: -4,
        highlights: 14,
        shadows: -18,
        temperature: 16,
        tint: -8,
        sharpness: 28,
        blur: 0,
        opacity: 100,
        vignette: 30,
      },
      preset: 'cinematic' as CreativePresetId,
    },
    {
      name: 'Clean High-Key Dynamic',
      desc: 'Balanced exposure, vivid colors, and HDR clarity',
      prompt: 'bright HDR look with shadow detail and crisp texture',
      adjustments: {
        brightness: 16,
        contrast: 18,
        saturation: 25,
        exposure: 12,
        highlights: -20,
        shadows: 25,
        temperature: 0,
        tint: 0,
        sharpness: 30,
        blur: 0,
        opacity: 100,
        vignette: 8,
      },
      preset: 'highContrast' as CreativePresetId,
    },
  ];

  const handleDeepAIAnalyze = async (customPrompt?: string) => {
    setAiLoading(true);
    setAiCritique(null);

    try {
      const res = await fetch('/api/ai-enhance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          imageBase64,
          promptNote: customPrompt || promptNote,
        }),
      });

      const data = await res.json();
      if (data.adjustments) {
        onApplyAIResults(data.adjustments, data.preset);
        setAiCritique(data.critique || 'AI optimization applied successfully.');
        setLastAppliedStyle('Custom AI Optimization');
      }
    } catch (err) {
      console.error('AI call failed', err);
      // Fallback
      onAutoEnhance();
      setAiCritique('Auto-adjusted exposure, contrast, and color balance.');
    } finally {
      setAiLoading(false);
    }
  };

  return (
    <div
      id="ai-panel"
      className="flex flex-col h-full overflow-y-auto p-4 space-y-5"
    >
      {/* 1. Instant Auto-Enhance Card */}
      <div
        className={`p-4 rounded-xl border space-y-3 ${
          isLight
            ? 'bg-gray-50 border-black'
            : 'bg-gradient-to-b from-sky-950/30 to-slate-900/60 border-sky-500/30'
        }`}
      >
        <div className="flex items-center gap-2">
          <Zap className="w-4 h-4 text-sky-500" />
          <span className="text-xs font-bold uppercase tracking-wider">
            1-Click Smart Auto Enhance
          </span>
        </div>

        <p className="text-xs opacity-75">
          Instantly analyzes photo luminance, dynamic range, and color balance for
          optimal clarity in zero milliseconds.
        </p>

        <button
          id="btn-ai-instant-auto-enhance"
          onClick={onAutoEnhance}
          disabled={isEnhancing}
          className={`w-full py-2.5 text-xs font-bold rounded-lg border flex items-center justify-center gap-2 transition-all ${
            isEnhancing
              ? 'opacity-60 cursor-wait'
              : isLight
              ? 'bg-black text-white border-black hover:bg-gray-800'
              : 'bg-gradient-to-r from-sky-500 to-indigo-500 text-white border-sky-400/40 hover:opacity-95'
          }`}
        >
          <Sparkles className="w-4 h-4" />
          <span>{isEnhancing ? 'Optimizing...' : 'Apply Instant Auto Enhance'}</span>
        </button>
      </div>

      {/* 2. Gemini AI Photographic Colorist & Assistant */}
      <div
        className={`p-4 rounded-xl border space-y-3 ${
          isLight ? 'bg-white border-black' : 'bg-slate-900/70 border-slate-800'
        }`}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Wand2 className="w-4 h-4 text-purple-400" />
            <span className="text-xs font-bold uppercase tracking-wider">
              AI Intelligent Colorist
            </span>
          </div>
          <span className="text-[10px] px-2 py-0.5 rounded font-mono font-bold bg-purple-500/20 text-purple-400 border border-purple-500/30">
            Gemini
          </span>
        </div>

        <p className="text-xs opacity-70">
          Request custom mood or photographic retouching (e.g. &quot;vibrant tropical landscape&quot;, &quot;dark moody aesthetic&quot;):
        </p>

        <div className="flex gap-2">
          <input
            type="text"
            id="input-ai-prompt"
            value={promptNote}
            onChange={(e) => setPromptNote(e.target.value)}
            placeholder="e.g. Sunset glow, moody shadows..."
            className={`flex-1 px-3 py-1.5 text-xs rounded-lg border font-medium ${
              isLight
                ? 'bg-white border-black text-black'
                : 'bg-slate-900 border-slate-700 text-white'
            }`}
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleDeepAIAnalyze();
            }}
          />

          <button
            id="btn-ai-analyze-submit"
            onClick={() => handleDeepAIAnalyze()}
            disabled={aiLoading}
            className={`px-3 py-1.5 text-xs font-bold rounded-lg border flex items-center justify-center transition-all ${
              aiLoading
                ? 'opacity-50 cursor-wait'
                : isLight
                ? 'bg-black text-white border-black'
                : 'bg-purple-600 text-white border-purple-500'
            }`}
          >
            {aiLoading ? (
              <span className="animate-spin text-xs">⟳</span>
            ) : (
              <Send className="w-3.5 h-3.5" />
            )}
          </button>
        </div>

        {aiCritique && (
          <div
            className={`p-2.5 rounded-lg border text-xs space-y-1 ${
              isLight
                ? 'bg-gray-100 border-black text-black'
                : 'bg-slate-950 border-purple-500/40 text-slate-200'
            }`}
          >
            <div className="font-semibold flex items-center gap-1.5 text-purple-400">
              <Check className="w-3 h-3" />
              <span>AI Analysis Feedback:</span>
            </div>
            <p className="text-[11px] leading-relaxed">{aiCritique}</p>
          </div>
        )}
      </div>

      {/* 3. Curated AI Photography Styles */}
      <div className="space-y-3">
        <span className="text-xs font-bold uppercase tracking-wider block">
          One-Tap AI Styles
        </span>

        <div className="grid grid-cols-1 gap-2.5">
          {aiStyles.map((style) => {
            const isSelected = lastAppliedStyle === style.name;
            return (
              <div
                key={style.name}
                onClick={() => {
                  setLastAppliedStyle(style.name);
                  onApplyAIResults(style.adjustments, style.preset);
                }}
                className={`p-3 rounded-xl border cursor-pointer transition-all flex items-center justify-between ${
                  isSelected
                    ? isLight
                      ? 'border-black ring-2 ring-black bg-gray-50'
                      : 'border-sky-500 ring-2 ring-sky-500/40 bg-sky-950/20'
                    : isLight
                    ? 'border-gray-200 hover:border-black'
                    : 'border-slate-800 hover:border-slate-600 bg-slate-900/40'
                }`}
              >
                <div>
                  <div className="text-xs font-bold">{style.name}</div>
                  <div className="text-[10px] opacity-60">{style.desc}</div>
                </div>

                <button
                  className={`text-[11px] font-semibold px-2.5 py-1 rounded-md border transition-colors ${
                    isSelected
                      ? isLight
                        ? 'bg-black text-white border-black'
                        : 'bg-sky-500 text-slate-950'
                      : isLight
                      ? 'border-black text-black'
                      : 'border-slate-700 text-slate-300'
                  }`}
                >
                  {isSelected ? 'Applied' : 'Apply'}
                </button>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
