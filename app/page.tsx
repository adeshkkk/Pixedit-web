'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Navbar } from '@/components/Navbar';
import { SidebarLeft } from '@/components/SidebarLeft';
import { CanvasArea } from '@/components/CanvasArea';
import { FiltersPanel } from '@/components/panels/FiltersPanel';
import { BackgroundPanel } from '@/components/panels/BackgroundPanel';
import { ResizePanel } from '@/components/panels/ResizePanel';
import { AIPanel } from '@/components/panels/AIPanel';
import { ExportModal } from '@/components/ExportModal';
import { Homepage } from '@/components/Homepage';
import {
  ActiveTool,
  EditorState,
  FilterAdjustments,
  CreativePresetId,
  BackgroundSettings,
  ResizeSettings,
  ComparisonMode,
  ImageMetadata,
} from '@/types/editor';
import {
  DEFAULT_ADJUSTMENTS,
  DEFAULT_BACKGROUND,
  calculateAutoEnhance,
  removeBackgroundLocally,
  loadImage,
} from '@/lib/image-processing';
import { Sparkles, Check, ChevronRight, Sliders } from 'lucide-react';

export default function PixEditPage() {
  // Theme state: dark default, with visible black high-contrast in light mode
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');

  // Loaded image metadata
  const [imageMeta, setImageMeta] = useState<ImageMetadata | null>(null);

  // Active Tool
  const [activeTool, setActiveTool] = useState<ActiveTool>('filters');

  // Comparison mode
  const [comparisonMode, setComparisonMode] = useState<ComparisonMode>('off');

  // Export Modal state
  const [isExportOpen, setIsExportOpen] = useState<boolean>(false);

  // Processing indicators
  const [isEnhancing, setIsEnhancing] = useState<boolean>(false);
  const [isRemovingBg, setIsRemovingBg] = useState<boolean>(false);
  const [autoEnhanceToast, setAutoEnhanceToast] = useState<string | null>(null);

  // Cached Background Cutout Canvas
  const [cutoutCanvas, setCutoutCanvas] = useState<HTMLCanvasElement | null>(null);

  // Mobile drawer state
  const [isMobilePanelOpen, setIsMobilePanelOpen] = useState<boolean>(true);

  // Default initial editor state builder
  const createInitialState = (width = 1920, height = 1080): EditorState => ({
    adjustments: { ...DEFAULT_ADJUSTMENTS },
    activePreset: 'none',
    presetIntensity: 100,
    background: { ...DEFAULT_BACKGROUND },
    resize: {
      unit: 'px',
      width,
      height,
      originalWidth: width,
      originalHeight: height,
      dpi: 72,
      lockAspectRatio: true,
      percentage: 100,
    },
  });

  const [editorState, setEditorState] = useState<EditorState>(createInitialState());

  // History system for Undo / Redo
  const [history, setHistory] = useState<EditorState[]>([]);
  const [historyIndex, setHistoryIndex] = useState<number>(-1);

  // Push new state to history (debounced or discrete changes)
  const pushState = useCallback((newState: EditorState) => {
    setHistory((prev) => {
      const upToCurrent = prev.slice(0, historyIndex + 1);
      return [...upToCurrent, JSON.parse(JSON.stringify(newState))].slice(-30); // keep last 30 states
    });
    setHistoryIndex((prev) => prev + 1);
  }, [historyIndex]);

  // Handle Theme Toggle
  const handleToggleTheme = () => {
    setTheme((prev) => {
      const nextTheme = prev === 'dark' ? 'light' : 'dark';
      if (typeof document !== 'undefined') {
        if (nextTheme === 'light') {
          document.documentElement.classList.add('theme-light');
        } else {
          document.documentElement.classList.remove('theme-light');
        }
      }
      return nextTheme;
    });
  };

  // When a user selects or uploads an image
  const handleImageSelected = async (meta: ImageMetadata) => {
    setImageMeta(meta);
    const initial = createInitialState(meta.originalWidth, meta.originalHeight);
    setEditorState(initial);
    setHistory([JSON.parse(JSON.stringify(initial))]);
    setHistoryIndex(0);
    setCutoutCanvas(null);
    setComparisonMode('off');

    // Notify user of Auto Enhance availability after upload
    setAutoEnhanceToast('✨ Photo ready! Click Auto Enhance to optimize lighting and color.');
    setTimeout(() => {
      setAutoEnhanceToast(null);
    }, 6000);
  };

  // Undo / Redo handlers
  const handleUndo = () => {
    if (historyIndex > 0) {
      const prevIdx = historyIndex - 1;
      const targetState = JSON.parse(JSON.stringify(history[prevIdx]));
      setEditorState(targetState);
      setHistoryIndex(prevIdx);
    }
  };

  const handleRedo = () => {
    if (historyIndex < history.length - 1) {
      const nextIdx = historyIndex + 1;
      const targetState = JSON.parse(JSON.stringify(history[nextIdx]));
      setEditorState(targetState);
      setHistoryIndex(nextIdx);
    }
  };

  const handleResetAll = () => {
    if (!imageMeta) return;
    const fresh = createInitialState(imageMeta.originalWidth, imageMeta.originalHeight);
    setEditorState(fresh);
    pushState(fresh);
    setCutoutCanvas(null);
  };

  // Auto-Enhance Feature (fast local algorithm)
  const handleAutoEnhance = async () => {
    if (!imageMeta) return;
    setIsEnhancing(true);

    try {
      const img = await loadImage(imageMeta.dataUrl);
      const enhancedAdjustments = calculateAutoEnhance(img);

      const nextState: EditorState = {
        ...editorState,
        adjustments: enhancedAdjustments,
        activePreset: 'vivid',
        presetIntensity: 70,
      };

      setEditorState(nextState);
      pushState(nextState);
      setAutoEnhanceToast('✨ Auto Enhance applied: optimized contrast, vibrance & clarity!');
      setTimeout(() => setAutoEnhanceToast(null), 3500);
    } catch (err) {
      console.error('Auto Enhance failed', err);
    } finally {
      setIsEnhancing(false);
    }
  };

  // AI Panel Results Handler
  const handleApplyAIResults = (
    adj: FilterAdjustments,
    presetId?: CreativePresetId
  ) => {
    const nextState: EditorState = {
      ...editorState,
      adjustments: { ...editorState.adjustments, ...adj },
      activePreset: presetId || editorState.activePreset,
    };
    setEditorState(nextState);
    pushState(nextState);
  };

  // Background Cutout Handler (fast local Canvas segmentation)
  const handleRemoveBackground = async () => {
    if (!imageMeta) return;
    setIsRemovingBg(true);

    try {
      const img = await loadImage(imageMeta.dataUrl);
      const cutout = removeBackgroundLocally(
        img,
        editorState.background.removalTolerance,
        editorState.background.edgeSmooth
      );
      setCutoutCanvas(cutout);

      const nextState: EditorState = {
        ...editorState,
        background: {
          ...editorState.background,
          isRemoved: true,
          mode:
            editorState.background.mode === 'original'
              ? 'removed'
              : editorState.background.mode,
        },
      };
      setEditorState(nextState);
      pushState(nextState);
    } catch (err) {
      console.error('Background removal failed', err);
      alert('Could not isolate background for this image.');
    } finally {
      setIsRemovingBg(false);
    }
  };

  const handleRestoreBackground = () => {
    const nextState: EditorState = {
      ...editorState,
      background: {
        ...editorState.background,
        isRemoved: false,
        mode: 'original',
      },
    };
    setEditorState(nextState);
    pushState(nextState);
  };

  // Filter Adjustments state change
  const handleChangeAdjustments = (adj: FilterAdjustments) => {
    setEditorState((prev) => ({ ...prev, adjustments: adj }));
  };

  const handleSelectPreset = (presetId: CreativePresetId, intensity = 100) => {
    const nextState: EditorState = {
      ...editorState,
      activePreset: presetId,
      presetIntensity: intensity,
    };
    setEditorState(nextState);
    pushState(nextState);
  };

  const handleChangeIntensity = (intensity: number) => {
    setEditorState((prev) => ({ ...prev, presetIntensity: intensity }));
  };

  const handleResetFilters = () => {
    const nextState: EditorState = {
      ...editorState,
      adjustments: { ...DEFAULT_ADJUSTMENTS },
      activePreset: 'none',
    };
    setEditorState(nextState);
    pushState(nextState);
  };

  // Background settings change
  const handleChangeBackground = (bg: BackgroundSettings) => {
    // If tolerance or edge smooth changed and background is already removed, re-run cutout
    const shouldRerunCutout =
      bg.isRemoved &&
      (bg.removalTolerance !== editorState.background.removalTolerance ||
        bg.edgeSmooth !== editorState.background.edgeSmooth);

    setEditorState((prev) => ({ ...prev, background: bg }));

    if (shouldRerunCutout && imageMeta) {
      loadImage(imageMeta.dataUrl).then((img) => {
        const cutout = removeBackgroundLocally(
          img,
          bg.removalTolerance,
          bg.edgeSmooth
        );
        setCutoutCanvas(cutout);
      });
    }
  };

  // Resize settings change
  const handleChangeResize = (resize: ResizeSettings) => {
    setEditorState((prev) => ({ ...prev, resize }));
  };

  const handleApplyResize = (w: number, h: number) => {
    const nextState: EditorState = {
      ...editorState,
      resize: {
        ...editorState.resize,
        width: w,
        height: h,
      },
    };
    setEditorState(nextState);
    pushState(nextState);
  };

  const handleResetResize = () => {
    if (!imageMeta) return;
    const nextState: EditorState = {
      ...editorState,
      resize: {
        ...editorState.resize,
        width: imageMeta.originalWidth,
        height: imageMeta.originalHeight,
        percentage: 100,
      },
    };
    setEditorState(nextState);
    pushState(nextState);
  };

  // Keyboard Shortcuts (Undo/Redo)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'z') {
        e.preventDefault();
        if (e.shiftKey) {
          handleRedo();
        } else {
          handleUndo();
        }
      } else if ((e.ctrlKey || e.metaKey) && e.key === 'y') {
        e.preventDefault();
        handleRedo();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  });

  const isLight = theme === 'light';

  // If no image is loaded yet, show the Homepage
  if (!imageMeta) {
    return (
      <Homepage
        onImageSelected={handleImageSelected}
        theme={theme}
        onToggleTheme={handleToggleTheme}
      />
    );
  }

  return (
    <div
      id="pix-edit-app"
      className={`h-screen flex flex-col overflow-hidden transition-colors ${
        isLight ? 'bg-white text-black' : 'bg-[#0d0f14] text-white'
      }`}
    >
      {/* Top Navigation Bar */}
      <Navbar
        theme={theme}
        onToggleTheme={handleToggleTheme}
        canUndo={historyIndex > 0}
        canRedo={historyIndex < history.length - 1}
        onUndo={handleUndo}
        onRedo={handleRedo}
        onReset={handleResetAll}
        onAutoEnhance={handleAutoEnhance}
        isEnhancing={isEnhancing}
        comparisonMode={comparisonMode}
        onSetComparisonMode={setComparisonMode}
        onOpenExport={() => setIsExportOpen(true)}
        onNewImage={() => setImageMeta(null)}
        imageLoaded={true}
      />

      {/* Auto Enhance Notification Toast */}
      {autoEnhanceToast && (
        <div
          id="toast-auto-enhance"
          className={`absolute top-18 left-1/2 -translate-x-1/2 z-40 px-4 py-2 rounded-xl border text-xs font-semibold shadow-lg backdrop-blur-md flex items-center gap-2 animate-in fade-in slide-in-from-top-2 duration-200 ${
            isLight
              ? 'bg-black text-white border-black'
              : 'bg-sky-500 text-slate-950 font-bold border-sky-400'
          }`}
        >
          <Sparkles className="w-4 h-4 shrink-0" />
          <span>{autoEnhanceToast}</span>
          <button
            onClick={() => setAutoEnhanceToast(null)}
            className="ml-2 font-bold opacity-70 hover:opacity-100"
          >
            ✕
          </button>
        </div>
      )}

      {/* Main Studio Workspace */}
      <div className="flex-1 flex flex-col md:flex-row overflow-hidden relative">
        {/* Left Sidebar - Tool Switcher */}
        <SidebarLeft
          activeTool={activeTool}
          onSelectTool={(tool) => {
            setActiveTool(tool);
            setIsMobilePanelOpen(true);
          }}
          theme={theme}
        />

        {/* Center - Interactive Image Canvas */}
        <CanvasArea
          imageMeta={imageMeta}
          editorState={editorState}
          cutoutCanvas={cutoutCanvas}
          comparisonMode={comparisonMode}
          onSetComparisonMode={setComparisonMode}
          onReset={handleResetAll}
          theme={theme}
        />

        {/* Right Sidebar - Tool Controls Panel */}
        <div
          id="right-sidebar-panel"
          className={`w-full md:w-80 lg:w-96 md:h-[calc(100vh-4rem)] border-t md:border-t-0 md:border-l flex flex-col shrink-0 z-20 transition-all ${
            isLight
              ? 'bg-white border-black text-black'
              : 'bg-[#12151c] border-[#222734] text-slate-200'
          } ${
            isMobilePanelOpen
              ? 'max-h-[45vh] md:max-h-none'
              : 'max-h-0 md:max-h-none overflow-hidden md:overflow-visible'
          }`}
        >
          {/* Active Tool Header */}
          <div
            className={`px-4 py-3 border-b flex items-center justify-between text-xs font-bold uppercase tracking-wider select-none ${
              isLight ? 'border-black bg-gray-50 text-black' : 'border-[#222734] bg-[#161a23] text-slate-300'
            }`}
          >
            <div className="flex items-center gap-2">
              <Sliders className="w-3.5 h-3.5" />
              <span>
                {activeTool === 'filters' && 'Filters & Adjustments'}
                {activeTool === 'background' && 'Background Studio'}
                {activeTool === 'resize' && 'Image Resizer'}
                {activeTool === 'ai' && 'AI Photo Assistant'}
              </span>
            </div>

            {/* Mobile toggle collapse button */}
            <button
              onClick={() => setIsMobilePanelOpen(!isMobilePanelOpen)}
              className="md:hidden text-xs font-semibold px-2 py-0.5 rounded border"
            >
              {isMobilePanelOpen ? 'Collapse' : 'Expand'}
            </button>
          </div>

          {/* Active Panel Component */}
          <div className="flex-1 overflow-y-auto">
            {activeTool === 'filters' && (
              <FiltersPanel
                adjustments={editorState.adjustments}
                onChangeAdjustments={handleChangeAdjustments}
                activePreset={editorState.activePreset}
                presetIntensity={editorState.presetIntensity}
                onSelectPreset={handleSelectPreset}
                onChangeIntensity={handleChangeIntensity}
                onResetFilters={handleResetFilters}
                previewThumbnailUrl={imageMeta.dataUrl}
                theme={theme}
              />
            )}

            {activeTool === 'background' && (
              <BackgroundPanel
                settings={editorState.background}
                onChangeSettings={handleChangeBackground}
                onRemoveBackground={handleRemoveBackground}
                onRestoreBackground={handleRestoreBackground}
                isRemoving={isRemovingBg}
                theme={theme}
              />
            )}

            {activeTool === 'resize' && (
              <ResizePanel
                resize={editorState.resize}
                imageMeta={imageMeta}
                onChangeResize={handleChangeResize}
                onApplyResize={handleApplyResize}
                onResetResize={handleResetResize}
                theme={theme}
              />
            )}

            {activeTool === 'ai' && (
              <AIPanel
                onAutoEnhance={handleAutoEnhance}
                isEnhancing={isEnhancing}
                onApplyAIResults={handleApplyAIResults}
                imageBase64={imageMeta.dataUrl}
                theme={theme}
              />
            )}
          </div>
        </div>
      </div>

      {/* Export & Download Modal */}
      <ExportModal
        isOpen={isExportOpen}
        onClose={() => setIsExportOpen(false)}
        editorState={editorState}
        imageMeta={imageMeta}
        cutoutCanvas={cutoutCanvas}
        theme={theme}
      />
    </div>
  );
}
