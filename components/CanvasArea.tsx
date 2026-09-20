'use client';

import React, { useRef, useState, useEffect, useCallback } from 'react';
import {
  ZoomIn,
  ZoomOut,
  Maximize,
  RotateCcw,
  Eye,
  Sliders,
  Sparkles,
} from 'lucide-react';
import {
  EditorState,
  ComparisonMode,
  ImageMetadata,
} from '@/types/editor';
import { buildCssFilterString, formatBytes } from '@/lib/image-processing';

interface CanvasAreaProps {
  imageMeta: ImageMetadata;
  editorState: EditorState;
  cutoutCanvas: HTMLCanvasElement | null;
  comparisonMode: ComparisonMode;
  onSetComparisonMode: (mode: ComparisonMode) => void;
  onReset: () => void;
  theme: 'dark' | 'light';
}

export const CanvasArea: React.FC<CanvasAreaProps> = ({
  imageMeta,
  editorState,
  cutoutCanvas,
  comparisonMode,
  onSetComparisonMode,
  onReset,
  theme,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [zoom, setZoom] = useState<number>(100);
  const [isHoldingBefore, setIsHoldingBefore] = useState<boolean>(false);
  const [splitPosition, setSplitPosition] = useState<number>(50); // percentage 0-100
  const [isDraggingSplit, setIsDraggingSplit] = useState<boolean>(false);

  // Pan state when zoomed in
  const [pan, setPan] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [isPanning, setIsPanning] = useState<boolean>(false);
  const [startPan, setStartPan] = useState<{ x: number; y: number }>({ x: 0, y: 0 });

  const isLight = theme === 'light';

  // Calculate live CSS filter string
  const cssFilter = buildCssFilterString(
    editorState.adjustments,
    editorState.activePreset,
    editorState.presetIntensity
  );

  // Reset pan when fit to screen
  const handleFitToScreen = useCallback(() => {
    setZoom(100);
    setPan({ x: 0, y: 0 });
  }, []);

  const handleZoomIn = () => {
    setZoom((prev) => Math.min(400, prev + 25));
  };

  const handleZoomOut = () => {
    setZoom((prev) => Math.max(25, prev - 25));
  };

  // Mouse pan handlers
  const handleMouseDown = (e: React.MouseEvent) => {
    if (isDraggingSplit) return;
    if (zoom > 100 || e.button === 1 || e.shiftKey) {
      setIsPanning(true);
      setStartPan({ x: e.clientX - pan.x, y: e.clientY - pan.y });
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isDraggingSplit) {
      if (!containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const pct = Math.max(0, Math.min(100, (x / rect.width) * 100));
      setSplitPosition(pct);
      return;
    }
    if (isPanning) {
      setPan({
        x: e.clientX - startPan.x,
        y: e.clientY - startPan.y,
      });
    }
  };

  const handleMouseUp = () => {
    setIsPanning(false);
    setIsDraggingSplit(false);
  };

  // Touch handlers for mobile
  const handleTouchMove = (e: React.TouchEvent) => {
    if (isDraggingSplit && e.touches[0] && containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      const x = e.touches[0].clientX - rect.left;
      const pct = Math.max(0, Math.min(100, (x / rect.width) * 100));
      setSplitPosition(pct);
    }
  };

  const handleTouchEnd = () => {
    setIsDraggingSplit(false);
  };

  // Determine current display source: cutout canvas or original image
  const displaySrc =
    editorState.background.isRemoved && cutoutCanvas
      ? cutoutCanvas.toDataURL('image/png')
      : imageMeta.dataUrl;

  // Background style if background is removed
  const getBackgroundStyle = (): React.CSSProperties => {
    const bg = editorState.background;
    if (!bg.isRemoved || bg.mode === 'original' || bg.mode === 'removed') {
      return {};
    }

    if (bg.mode === 'color') {
      return { backgroundColor: bg.solidColor };
    }

    if (bg.mode === 'gradient') {
      return {
        background: `linear-gradient(${bg.gradient.direction}, ${bg.gradient.startColor}, ${bg.gradient.endColor})`,
      };
    }

    if (bg.mode === 'image' && bg.image.dataUrl) {
      const scale = (bg.image.scale || 100) / 100;
      return {
        backgroundImage: `url(${bg.image.dataUrl})`,
        backgroundSize: bg.image.fit === 'cover' ? 'cover' : 'contain',
        backgroundPosition: `${50 + (bg.image.xOffset || 0)}% ${
          50 + (bg.image.yOffset || 0)
        }%`,
        backgroundRepeat: 'no-repeat',
      };
    }

    return {};
  };

  const bgStyle = getBackgroundStyle();

  return (
    <div
      ref={containerRef}
      id="editor-canvas-container"
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      className={`relative flex-1 h-[calc(100vh-8rem)] md:h-[calc(100vh-4rem)] flex items-center justify-center overflow-hidden select-none ${
        isLight ? 'bg-[#f1f4f9]' : 'bg-[#0b0d11]'
      } ${zoom > 100 ? (isPanning ? 'cursor-grabbing' : 'cursor-grab') : 'cursor-default'}`}
    >
      {/* Viewport Meta Info Tag */}
      <div
        id="canvas-meta-badge"
        className={`absolute top-4 left-4 z-10 px-3 py-1.5 rounded-lg border text-xs flex items-center gap-3 backdrop-blur-md shadow-xs ${
          isLight
            ? 'bg-white/95 border-black text-black font-semibold'
            : 'bg-slate-900/80 border-slate-700 text-slate-300'
        }`}
      >
        <span className="truncate max-w-[140px] sm:max-w-[200px]" title={imageMeta.name}>
          {imageMeta.name}
        </span>
        <span className="opacity-40">|</span>
        <span>
          {Math.round(editorState.resize.width)} × {Math.round(editorState.resize.height)} px
        </span>
        <span className="opacity-40 hidden sm:inline">|</span>
        <span className="hidden sm:inline">{formatBytes(imageMeta.fileSizeBytes)}</span>
      </div>

      {/* Main Image Viewport Area */}
      <div
        id="image-viewport-stage"
        style={{
          transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom / 100})`,
          transformOrigin: 'center center',
          transition: isPanning || isDraggingSplit ? 'none' : 'transform 0.15s ease-out',
        }}
        className="relative max-w-[90%] max-h-[85%] flex items-center justify-center"
      >
        {/* Transparent Canvas Checkerboard Wrapper */}
        <div
          className={`relative rounded shadow-xl overflow-hidden ${
            editorState.background.isRemoved ? 'checkerboard-pattern' : ''
          }`}
          style={bgStyle}
        >
          {/* Background Blur layer if mode is blur */}
          {editorState.background.isRemoved && editorState.background.mode === 'blur' && (
            <div
              className="absolute inset-0 z-0 bg-cover bg-center"
              style={{
                backgroundImage: `url(${imageMeta.dataUrl})`,
                filter: `blur(${Math.max(4, editorState.background.blurIntensity)}px) brightness(90%)`,
                transform: 'scale(1.1)',
              }}
            />
          )}

          {/* NORMAL OR TOGGLE VIEW */}
          {comparisonMode !== 'split' && comparisonMode !== 'sideBySide' && (
            <div className="relative z-10">
              <img
                id="main-preview-image"
                src={isHoldingBefore ? imageMeta.dataUrl : displaySrc}
                alt="Photo Editor Canvas"
                draggable={false}
                style={{
                  filter: isHoldingBefore ? 'none' : cssFilter,
                  maxWidth: '78vw',
                  maxHeight: '72vh',
                  objectFit: 'contain',
                }}
                className="block select-none pointer-events-none rounded transition-[filter] duration-75"
              />

              {/* Vignette Overlay for preview */}
              {!isHoldingBefore && editorState.adjustments.vignette > 0 && (
                <div
                  className="absolute inset-0 pointer-events-none rounded"
                  style={{
                    boxShadow: `inset 0 0 ${editorState.adjustments.vignette * 1.5}px rgba(0,0,0,${
                      (editorState.adjustments.vignette / 100) * 0.8
                    })`,
                  }}
                />
              )}
            </div>
          )}

          {/* SPLIT SCREEN COMPARISON VIEW */}
          {comparisonMode === 'split' && (
            <div className="relative z-10 select-none">
              {/* After / Edited Image (Full base) */}
              <img
                src={displaySrc}
                alt="Edited Version"
                draggable={false}
                style={{
                  filter: cssFilter,
                  maxWidth: '78vw',
                  maxHeight: '72vh',
                  objectFit: 'contain',
                }}
                className="block select-none pointer-events-none"
              />

              {/* Before / Original Image (Clipped overlay) */}
              <div
                className="absolute inset-0 overflow-hidden pointer-events-none"
                style={{ width: `${splitPosition}%` }}
              >
                <img
                  src={imageMeta.dataUrl}
                  alt="Original Version"
                  draggable={false}
                  style={{
                    filter: 'none',
                    maxWidth: '78vw',
                    maxHeight: '72vh',
                    objectFit: 'contain',
                  }}
                  className="block select-none"
                />
              </div>

              {/* Split Draggable Divider Line */}
              <div
                id="split-comparison-divider"
                onMouseDown={(e) => {
                  e.stopPropagation();
                  setIsDraggingSplit(true);
                }}
                onTouchStart={(e) => {
                  e.stopPropagation();
                  setIsDraggingSplit(true);
                }}
                style={{ left: `${splitPosition}%` }}
                className="absolute top-0 bottom-0 w-1 bg-white cursor-ew-resize z-20 flex items-center justify-center shadow-lg -ml-0.5"
              >
                <div className="w-7 h-7 rounded-full bg-white text-black text-[10px] font-bold shadow-md flex items-center justify-center border border-gray-300">
                  ↔
                </div>
              </div>

              {/* Labels */}
              <span className="absolute bottom-2 left-2 z-20 text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-black/70 text-white backdrop-blur-xs">
                Before
              </span>
              <span className="absolute bottom-2 right-2 z-20 text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-black/70 text-white backdrop-blur-xs">
                After
              </span>
            </div>
          )}

          {/* SIDE BY SIDE COMPARISON VIEW */}
          {comparisonMode === 'sideBySide' && (
            <div className="flex items-center gap-3 p-2 z-10">
              <div className="flex flex-col items-center">
                <span className="text-[10px] uppercase tracking-wider font-bold mb-1 opacity-80">
                  Original
                </span>
                <img
                  src={imageMeta.dataUrl}
                  alt="Original"
                  draggable={false}
                  style={{
                    maxWidth: '38vw',
                    maxHeight: '68vh',
                    objectFit: 'contain',
                  }}
                  className="block rounded select-none border border-black/10"
                />
              </div>
              <div className="flex flex-col items-center">
                <span className="text-[10px] uppercase tracking-wider font-bold mb-1 text-sky-500">
                  Edited
                </span>
                <img
                  src={displaySrc}
                  alt="Edited"
                  draggable={false}
                  style={{
                    filter: cssFilter,
                    maxWidth: '38vw',
                    maxHeight: '68vh',
                    objectFit: 'contain',
                  }}
                  className="block rounded select-none border border-black/10"
                />
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Floating Bottom Canvas Controls (Zoom, Fit, Hold Before/After) */}
      <div
        id="canvas-bottom-controls"
        className={`absolute bottom-4 z-20 flex items-center gap-1.5 px-3 py-2 rounded-xl border backdrop-blur-md shadow-md ${
          isLight
            ? 'bg-white/95 border-black text-black'
            : 'bg-slate-900/90 border-slate-700 text-slate-200'
        }`}
      >
        {/* Zoom Controls */}
        <button
          id="btn-zoom-out"
          onClick={handleZoomOut}
          className={`p-1.5 rounded-md transition-colors ${
            isLight ? 'hover:bg-gray-200 text-black' : 'hover:bg-slate-800'
          }`}
          title="Zoom Out"
        >
          <ZoomOut className="w-4 h-4" />
        </button>

        <span
          id="label-zoom-percent"
          className="text-xs font-semibold px-1 min-w-[40px] text-center select-none"
        >
          {zoom}%
        </span>

        <button
          id="btn-zoom-in"
          onClick={handleZoomIn}
          className={`p-1.5 rounded-md transition-colors ${
            isLight ? 'hover:bg-gray-200 text-black' : 'hover:bg-slate-800'
          }`}
          title="Zoom In"
        >
          <ZoomIn className="w-4 h-4" />
        </button>

        <div
          className={`h-4 w-px mx-1 ${isLight ? 'bg-black/30' : 'bg-slate-700'}`}
        />

        {/* Fit to Screen */}
        <button
          id="btn-fit-screen"
          onClick={handleFitToScreen}
          className={`p-1.5 rounded-md transition-colors ${
            isLight ? 'hover:bg-gray-200 text-black' : 'hover:bg-slate-800'
          }`}
          title="Fit to Screen (100%)"
        >
          <Maximize className="w-4 h-4" />
        </button>

        {/* Hold to Preview Before */}
        <button
          id="btn-hold-before-after"
          onMouseDown={() => setIsHoldingBefore(true)}
          onMouseUp={() => setIsHoldingBefore(false)}
          onMouseLeave={() => setIsHoldingBefore(false)}
          onTouchStart={() => setIsHoldingBefore(true)}
          onTouchEnd={() => setIsHoldingBefore(false)}
          className={`px-2 py-1 text-xs font-semibold rounded-md border flex items-center gap-1 transition-all select-none ${
            isHoldingBefore
              ? 'bg-amber-500 text-black border-amber-500'
              : isLight
              ? 'border-black text-black hover:bg-black hover:text-white'
              : 'border-slate-700 text-slate-300 hover:bg-slate-800'
          }`}
          title="Click and hold to compare with original image"
        >
          <Eye className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Hold for Original</span>
          <span className="sm:hidden">Original</span>
        </button>
      </div>
    </div>
  );
};
