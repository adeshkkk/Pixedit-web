export interface FilterAdjustments {
  brightness: number; // -100 to 100 (default 0)
  contrast: number; // -100 to 100 (default 0)
  saturation: number; // -100 to 100 (default 0)
  exposure: number; // -100 to 100 (default 0)
  highlights: number; // -100 to 100 (default 0)
  shadows: number; // -100 to 100 (default 0)
  temperature: number; // -100 (cool) to 100 (warm) (default 0)
  tint: number; // -100 (green) to 100 (magenta) (default 0)
  sharpness: number; // 0 to 100 (default 0)
  blur: number; // 0 to 50px (default 0)
  opacity: number; // 0 to 100 (default 100)
  vignette: number; // 0 to 100 (default 0)
}

export type CreativePresetId =
  | 'none'
  | 'grayscale'
  | 'sepia'
  | 'vintage'
  | 'retro'
  | 'warm'
  | 'cool'
  | 'cinematic'
  | 'dramatic'
  | 'fade'
  | 'noir'
  | 'vintageFilm'
  | 'blackAndWhite'
  | 'soft'
  | 'vivid'
  | 'highContrast';

export interface CreativePreset {
  id: CreativePresetId;
  name: string;
  category: 'Classic' | 'Cinematic' | 'Tones' | 'Atmosphere';
  description: string;
  adjustments: Partial<FilterAdjustments>;
  cssFilterSnippet?: string;
  tintColor?: string;
  blendMode?: GlobalCompositeOperation;
}

export type ActiveTool = 'filters' | 'background' | 'resize' | 'ai';

export type BackgroundMode = 'original' | 'removed' | 'color' | 'gradient' | 'image' | 'blur';

export interface BackgroundSettings {
  mode: BackgroundMode;
  isRemoved: boolean;
  removalTolerance: number; // 5 to 60 (default 25)
  edgeSmooth: number; // 0 to 10 (default 2)
  solidColor: string; // hex
  gradient: {
    startColor: string;
    endColor: string;
    direction: 'to right' | 'to bottom' | 'to bottom right' | 'circle';
  };
  blurIntensity: number; // 0 to 40 px
  image: {
    dataUrl: string | null;
    fileName?: string;
    fit: 'cover' | 'contain' | 'center' | 'fill';
    scale: number; // 50 to 200%
    xOffset: number; // -100 to 100%
    yOffset: number; // -100 to 100%
  };
}

export type ResizeUnit = 'px' | 'cm' | 'mm' | 'in' | 'percent';

export interface ResizeSettings {
  unit: ResizeUnit;
  width: number;
  height: number;
  originalWidth: number;
  originalHeight: number;
  dpi: number; // 72, 150, 300
  lockAspectRatio: boolean;
  percentage: number;
}

export interface EditorState {
  adjustments: FilterAdjustments;
  activePreset: CreativePresetId;
  presetIntensity: number; // 0 to 100
  background: BackgroundSettings;
  resize: ResizeSettings;
}

export interface ImageMetadata {
  name: string;
  originalWidth: number;
  originalHeight: number;
  fileSizeBytes: number;
  format: string;
  dataUrl: string;
}

export type ComparisonMode = 'split' | 'sideBySide' | 'toggle' | 'off';

export interface ExportSettings {
  format: 'png' | 'jpeg' | 'webp';
  quality: number; // 0.1 to 1.0
  transparentPng: boolean;
}
