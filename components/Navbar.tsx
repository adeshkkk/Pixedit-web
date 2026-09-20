'use client';

import React from 'react';
import {
  Sparkles,
  Undo2,
  Redo2,
  RotateCcw,
  Sun,
  Moon,
  Download,
  SplitSquareVertical,
  Columns,
  Eye,
  Sliders,
  Image as ImageIcon,
} from 'lucide-react';
import { ComparisonMode } from '@/types/editor';

interface NavbarProps {
  theme: 'dark' | 'light';
  onToggleTheme: () => void;
  canUndo: boolean;
  canRedo: boolean;
  onUndo: () => void;
  onRedo: () => void;
  onReset: () => void;
  onAutoEnhance: () => void;
  isEnhancing: boolean;
  comparisonMode: ComparisonMode;
  onSetComparisonMode: (mode: ComparisonMode) => void;
  onOpenExport: () => void;
  onNewImage: () => void;
  imageLoaded: boolean;
}

export const Navbar: React.FC<NavbarProps> = ({
  theme,
  onToggleTheme,
  canUndo,
  canRedo,
  onUndo,
  onRedo,
  onReset,
  onAutoEnhance,
  isEnhancing,
  comparisonMode,
  onSetComparisonMode,
  onOpenExport,
  onNewImage,
  imageLoaded,
}) => {
  const isLight = theme === 'light';

  return (
    <header
      id="navbar-header"
      className={`h-16 px-3 sm:px-5 flex items-center justify-between border-b transition-colors select-none z-30 ${
        isLight
          ? 'bg-white border-black text-black'
          : 'bg-[#12151c] border-[#222734] text-white'
      }`}
    >
      {/* Brand & Left Actions */}
      <div className="flex items-center gap-3 sm:gap-4">
        <button
          id="btn-brand-home"
          onClick={onNewImage}
          className="flex items-center gap-2.5 group focus:outline-none"
          title="Return to Upload / Open New Image"
        >
          <div
            className={`w-9 h-9 rounded-lg flex items-center justify-center font-bold text-lg shadow-sm transition-transform group-hover:scale-105 ${
              isLight
                ? 'bg-black text-white border border-black'
                : 'bg-sky-500 text-slate-950 font-black'
            }`}
          >
            P
          </div>
          <div className="flex flex-col text-left">
            <span
              className={`font-black text-base sm:text-lg tracking-tight ${
                isLight ? 'text-black' : 'text-white'
              }`}
            >
              PixEdit
            </span>
            <span
              className={`text-[10px] uppercase font-semibold tracking-wider -mt-1 hidden sm:block ${
                isLight ? 'text-gray-700' : 'text-slate-400'
              }`}
            >
              Photo Studio
            </span>
          </div>
        </button>

        {imageLoaded && (
          <button
            id="btn-change-image"
            onClick={onNewImage}
            className={`hidden md:flex items-center gap-1.5 text-xs font-medium px-2.5 py-1.5 rounded-md border transition-colors ${
              isLight
                ? 'border-black text-black hover:bg-black hover:text-white'
                : 'border-slate-700 text-slate-300 hover:bg-slate-800'
            }`}
            title="Replace current image"
          >
            <ImageIcon className="w-3.5 h-3.5" />
            <span>Replace</span>
          </button>
        )}
      </div>

      {/* Center Edit Actions (Undo, Redo, Auto Enhance, Comparison) */}
      {imageLoaded && (
        <div className="flex items-center gap-1 sm:gap-2">
          {/* 1-Click Auto Enhance */}
          <button
            id="btn-nav-auto-enhance"
            onClick={onAutoEnhance}
            disabled={isEnhancing}
            className={`flex items-center gap-1.5 text-xs font-semibold px-2.5 sm:px-3 py-1.5 rounded-md border shadow-xs transition-all ${
              isEnhancing
                ? 'opacity-60 cursor-not-allowed'
                : isLight
                ? 'bg-black text-white border-black hover:bg-gray-800'
                : 'bg-gradient-to-r from-sky-500 to-indigo-500 text-white border-sky-400/40 hover:opacity-95'
            }`}
            title="Intelligently auto balance exposure, color, contrast, and sharpness"
          >
            <Sparkles
              className={`w-3.5 h-3.5 ${isEnhancing ? 'animate-spin' : 'animate-pulse'}`}
            />
            <span className="hidden sm:inline">
              {isEnhancing ? 'Enhancing...' : 'Auto Enhance'}
            </span>
            <span className="sm:hidden">Auto</span>
          </button>

          {/* History Controls */}
          <div
            className={`flex items-center border rounded-md p-0.5 ${
              isLight ? 'border-black bg-gray-50' : 'border-slate-700 bg-slate-900/80'
            }`}
          >
            <button
              id="btn-nav-undo"
              onClick={onUndo}
              disabled={!canUndo}
              className={`p-1.5 rounded transition-colors ${
                !canUndo
                  ? 'opacity-30 cursor-not-allowed'
                  : isLight
                  ? 'text-black hover:bg-gray-200'
                  : 'text-slate-200 hover:bg-slate-800'
              }`}
              title="Undo (Ctrl+Z)"
            >
              <Undo2 className="w-4 h-4" />
            </button>
            <button
              id="btn-nav-redo"
              onClick={onRedo}
              disabled={!canRedo}
              className={`p-1.5 rounded transition-colors ${
                !canRedo
                  ? 'opacity-30 cursor-not-allowed'
                  : isLight
                  ? 'text-black hover:bg-gray-200'
                  : 'text-slate-200 hover:bg-slate-800'
              }`}
              title="Redo (Ctrl+Y)"
            >
              <Redo2 className="w-4 h-4" />
            </button>
          </div>

          {/* Reset All */}
          <button
            id="btn-nav-reset-all"
            onClick={onReset}
            className={`p-1.5 sm:px-2 sm:py-1.5 text-xs font-medium rounded-md border flex items-center gap-1 transition-colors ${
              isLight
                ? 'border-black text-black hover:bg-red-50 hover:text-red-700 hover:border-red-700'
                : 'border-slate-700 text-slate-300 hover:bg-red-950/40 hover:text-red-400 hover:border-red-800'
            }`}
            title="Reset All Adjustments"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span className="hidden md:inline">Reset</span>
          </button>

          {/* Comparison Modes */}
          <div
            className={`hidden lg:flex items-center border rounded-md p-0.5 ${
              isLight ? 'border-black bg-gray-50' : 'border-slate-700 bg-slate-900/80'
            }`}
          >
            <button
              id="btn-compare-split"
              onClick={() =>
                onSetComparisonMode(comparisonMode === 'split' ? 'off' : 'split')
              }
              className={`px-2 py-1 text-xs rounded flex items-center gap-1 font-medium transition-colors ${
                comparisonMode === 'split'
                  ? isLight
                    ? 'bg-black text-white'
                    : 'bg-sky-600 text-white'
                  : isLight
                  ? 'text-black hover:bg-gray-200'
                  : 'text-slate-300 hover:bg-slate-800'
              }`}
              title="Split-Screen Before / After Comparison Slider"
            >
              <SplitSquareVertical className="w-3.5 h-3.5" />
              <span>Split</span>
            </button>

            <button
              id="btn-compare-side"
              onClick={() =>
                onSetComparisonMode(
                  comparisonMode === 'sideBySide' ? 'off' : 'sideBySide'
                )
              }
              className={`px-2 py-1 text-xs rounded flex items-center gap-1 font-medium transition-colors ${
                comparisonMode === 'sideBySide'
                  ? isLight
                    ? 'bg-black text-white'
                    : 'bg-sky-600 text-white'
                  : isLight
                  ? 'text-black hover:bg-gray-200'
                  : 'text-slate-300 hover:bg-slate-800'
              }`}
              title="Side-by-Side Comparison"
            >
              <Columns className="w-3.5 h-3.5" />
              <span>Side-by-Side</span>
            </button>
          </div>
        </div>
      )}

      {/* Right Side (Theme Toggle & Export) */}
      <div className="flex items-center gap-2">
        {/* Theme Toggle with visible black styling on light mode */}
        <button
          id="btn-theme-toggle"
          onClick={onToggleTheme}
          className={`p-2 rounded-md border font-medium flex items-center justify-center transition-colors ${
            isLight
              ? 'border-black text-black bg-white hover:bg-black hover:text-white'
              : 'border-slate-700 text-slate-300 bg-slate-800/80 hover:bg-slate-700'
          }`}
          title={isLight ? 'Switch to Dark Mode' : 'Switch to Light Mode'}
        >
          {isLight ? (
            <Moon className="w-4 h-4 text-black group-hover:text-white" />
          ) : (
            <Sun className="w-4 h-4 text-amber-400" />
          )}
        </button>

        {/* Download & Export Button */}
        {imageLoaded && (
          <button
            id="btn-open-export-modal"
            onClick={onOpenExport}
            className={`flex items-center gap-1.5 text-xs sm:text-sm font-bold px-3 sm:px-4 py-1.5 sm:py-2 rounded-md shadow-sm transition-transform active:scale-95 ${
              isLight
                ? 'bg-black text-white border-2 border-black hover:bg-gray-900'
                : 'bg-sky-500 text-slate-950 hover:bg-sky-400 font-extrabold'
            }`}
            title="Export and download edited photo"
          >
            <Download className="w-4 h-4" />
            <span>Export</span>
          </button>
        )}
      </div>
    </header>
  );
};
