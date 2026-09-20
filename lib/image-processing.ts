import {
  FilterAdjustments,
  CreativePreset,
  CreativePresetId,
  BackgroundSettings,
  ResizeSettings,
  ResizeUnit,
} from '@/types/editor';

export const DEFAULT_ADJUSTMENTS: FilterAdjustments = {
  brightness: 0,
  contrast: 0,
  saturation: 0,
  exposure: 0,
  highlights: 0,
  shadows: 0,
  temperature: 0,
  tint: 0,
  sharpness: 0,
  blur: 0,
  opacity: 100,
  vignette: 0,
};

export const DEFAULT_BACKGROUND: BackgroundSettings = {
  mode: 'original',
  isRemoved: false,
  removalTolerance: 25,
  edgeSmooth: 2,
  solidColor: '#ffffff',
  gradient: {
    startColor: '#3b82f6',
    endColor: '#8b5cf6',
    direction: 'to bottom right',
  },
  blurIntensity: 15,
  image: {
    dataUrl: null,
    fileName: '',
    fit: 'cover',
    scale: 100,
    xOffset: 0,
    yOffset: 0,
  },
};

export const CREATIVE_PRESETS: CreativePreset[] = [
  {
    id: 'none',
    name: 'Original',
    category: 'Classic',
    description: 'No creative filter applied',
    adjustments: {},
  },
  {
    id: 'vivid',
    name: 'Vivid',
    category: 'Classic',
    description: 'Punchy saturation and crisp contrast',
    adjustments: { saturation: 40, contrast: 25, brightness: 5, sharpness: 20 },
  },
  {
    id: 'warm',
    name: 'Warm Sun',
    category: 'Tones',
    description: 'Golden hour warmth and soft highlights',
    adjustments: { temperature: 35, tint: 5, brightness: 8, saturation: 15 },
  },
  {
    id: 'cool',
    name: 'Cool Breeze',
    category: 'Tones',
    description: 'Crisp cold tones and serene clarity',
    adjustments: { temperature: -40, tint: -10, contrast: 15, brightness: 5 },
  },
  {
    id: 'cinematic',
    name: 'Cinematic',
    category: 'Cinematic',
    description: 'Teal & orange movie grade with moody shadows',
    adjustments: { contrast: 30, saturation: 10, shadows: -15, highlights: 10, temperature: 15, vignette: 25 },
  },
  {
    id: 'dramatic',
    name: 'Dramatic',
    category: 'Cinematic',
    description: 'High contrast and deep textured shadows',
    adjustments: { contrast: 50, exposure: 5, highlights: 25, shadows: -30, sharpness: 30, vignette: 35 },
  },
  {
    id: 'vintage',
    name: 'Vintage',
    category: 'Atmosphere',
    description: 'Nostalgic film look with muted tones',
    adjustments: { contrast: -10, saturation: -20, temperature: 25, brightness: 10, vignette: 20 },
  },
  {
    id: 'retro',
    name: 'Retro 80s',
    category: 'Atmosphere',
    description: 'Retro color palette with saturated highlights',
    adjustments: { saturation: 35, contrast: 20, tint: 20, temperature: 15, sharpness: 15 },
  },
  {
    id: 'fade',
    name: 'Matte Fade',
    category: 'Atmosphere',
    description: 'Lifted faded blacks for a dreamy matte finish',
    adjustments: { contrast: -25, brightness: 15, saturation: -15, highlights: -10 },
  },
  {
    id: 'noir',
    name: 'Film Noir',
    category: 'Classic',
    description: 'Dark, brooding, high-contrast black and white',
    adjustments: { saturation: -100, contrast: 65, brightness: -10, shadows: -25, vignette: 40, sharpness: 25 },
  },
  {
    id: 'blackAndWhite',
    name: 'B & W Classic',
    category: 'Classic',
    description: 'Balanced monochrome with rich midtones',
    adjustments: { saturation: -100, contrast: 20, brightness: 5, sharpness: 15 },
  },
  {
    id: 'grayscale',
    name: 'Grayscale',
    category: 'Classic',
    description: 'Pure neutral grayscale conversion',
    adjustments: { saturation: -100 },
  },
  {
    id: 'sepia',
    name: 'Sepia Tone',
    category: 'Atmosphere',
    description: 'Antique aged print with warm brown tones',
    adjustments: { saturation: -40, temperature: 50, tint: 10, contrast: 10 },
  },
  {
    id: 'vintageFilm',
    name: 'Vintage Film',
    category: 'Cinematic',
    description: 'Analog emulsion grain simulation and warm lift',
    adjustments: { contrast: 15, brightness: 8, temperature: 20, saturation: -10, vignette: 30 },
  },
  {
    id: 'soft',
    name: 'Soft Glow',
    category: 'Atmosphere',
    description: 'Ethereal diffused lighting and gentle contrast',
    adjustments: { contrast: -15, brightness: 12, saturation: 10, highlights: 15 },
  },
  {
    id: 'highContrast',
    name: 'High Contrast',
    category: 'Classic',
    description: 'Bold dynamic range punch for pop and clarity',
    adjustments: { contrast: 45, saturation: 15, sharpness: 25 },
  },
];

/**
 * Calculates responsive CSS filter string from current adjustments.
 * This runs on GPU for 60fps instant lag-free manipulation!
 */
export function buildCssFilterString(
  adj: FilterAdjustments,
  presetId?: CreativePresetId,
  presetIntensity = 100
): string {
  // Base values
  let brightnessVal = 100 + adj.brightness + adj.exposure * 0.5;
  let contrastVal = 100 + adj.contrast;
  let saturateVal = 100 + adj.saturation;
  let blurVal = adj.blur;
  let opacityVal = adj.opacity;
  let sepiaVal = 0;
  let hueVal = 0;

  // Temperature & Tint mapping
  if (adj.temperature !== 0) {
    // warm shifts towards red/amber, cool shifts towards blue
    sepiaVal += Math.max(0, adj.temperature) * 0.25;
    hueVal += adj.temperature > 0 ? -(adj.temperature * 0.2) : Math.abs(adj.temperature) * 0.3;
  }
  if (adj.tint !== 0) {
    hueVal += adj.tint * 0.6;
  }

  // Factor in preset if selected
  if (presetId && presetId !== 'none') {
    const preset = CREATIVE_PRESETS.find((p) => p.id === presetId);
    if (preset && preset.adjustments) {
      const factor = presetIntensity / 100;
      if (preset.adjustments.brightness) brightnessVal += preset.adjustments.brightness * factor;
      if (preset.adjustments.contrast) contrastVal += preset.adjustments.contrast * factor;
      if (preset.adjustments.saturation !== undefined) {
        if (preset.adjustments.saturation === -100) {
          saturateVal = Math.max(0, 100 - 100 * factor);
        } else {
          saturateVal += preset.adjustments.saturation * factor;
        }
      }
      if (presetId === 'sepia') {
        sepiaVal += 80 * factor;
      }
    }
  }

  // Clamping
  brightnessVal = Math.max(0, brightnessVal);
  contrastVal = Math.max(0, contrastVal);
  saturateVal = Math.max(0, saturateVal);

  const filters: string[] = [];
  filters.push(`brightness(${brightnessVal.toFixed(1)}%)`);
  filters.push(`contrast(${contrastVal.toFixed(1)}%)`);
  filters.push(`saturate(${saturateVal.toFixed(1)}%)`);

  if (sepiaVal > 0) {
    filters.push(`sepia(${Math.min(100, sepiaVal).toFixed(1)}%)`);
  }
  if (hueVal !== 0) {
    filters.push(`hue-rotate(${hueVal.toFixed(1)}deg)`);
  }
  if (blurVal > 0) {
    filters.push(`blur(${blurVal.toFixed(1)}px)`);
  }
  if (opacityVal < 100) {
    filters.push(`opacity(${(opacityVal / 100).toFixed(2)})`);
  }

  return filters.join(' ');
}

/**
 * Intelligent Auto-Enhance Analysis:
 * Quickly analyzes image pixel luminance & color histogram to produce optimal
 * brightness, contrast, saturation, exposure, and sharpness values.
 */
export function calculateAutoEnhance(imgElement: HTMLImageElement): FilterAdjustments {
  try {
    const canvas = document.createElement('canvas');
    // Sample down to 100x100 for near-instant execution (sub-5ms)
    const sampleSize = 100;
    canvas.width = sampleSize;
    canvas.height = sampleSize;
    const ctx = canvas.getContext('2d');
    if (!ctx) return { ...DEFAULT_ADJUSTMENTS, brightness: 10, contrast: 15, saturation: 18, sharpness: 25 };

    ctx.drawImage(imgElement, 0, 0, sampleSize, sampleSize);
    const imageData = ctx.getImageData(0, 0, sampleSize, sampleSize);
    const data = imageData.data;

    let totalLum = 0;
    let minLum = 255;
    let maxLum = 0;
    let totalR = 0, totalG = 0, totalB = 0;
    const pixelCount = sampleSize * sampleSize;

    for (let i = 0; i < data.length; i += 4) {
      const r = data[i];
      const g = data[i + 1];
      const b = data[i + 2];
      const lum = 0.299 * r + 0.587 * g + 0.114 * b;
      totalLum += lum;
      totalR += r;
      totalG += g;
      totalB += b;
      if (lum < minLum) minLum = lum;
      if (lum > maxLum) maxLum = lum;
    }

    const avgLum = totalLum / pixelCount;
    const contrastRange = maxLum - minLum;
    const avgR = totalR / pixelCount;
    const avgB = totalB / pixelCount;

    // Smart adjustment calculations
    let calculatedBrightness = 0;
    if (avgLum < 100) {
      calculatedBrightness = Math.min(30, Math.round((120 - avgLum) * 0.35));
    } else if (avgLum > 180) {
      calculatedBrightness = -Math.min(20, Math.round((avgLum - 180) * 0.25));
    } else {
      calculatedBrightness = 8;
    }

    let calculatedContrast = 15;
    if (contrastRange < 140) {
      calculatedContrast = 25;
    } else if (contrastRange > 220) {
      calculatedContrast = 10;
    }

    // Color balance
    let temp = 0;
    if (avgB > avgR + 15) {
      // Image is too blue/cold, add subtle warmth
      temp = 12;
    } else if (avgR > avgB + 20) {
      // Image is overly red/warm, cool down slightly
      temp = -8;
    }

    return {
      brightness: calculatedBrightness,
      contrast: calculatedContrast,
      saturation: 18,
      exposure: calculatedBrightness > 15 ? 8 : 4,
      highlights: -10,
      shadows: 14,
      temperature: temp,
      tint: 0,
      sharpness: 25,
      blur: 0,
      opacity: 100,
      vignette: 10,
    };
  } catch {
    return {
      ...DEFAULT_ADJUSTMENTS,
      brightness: 10,
      contrast: 15,
      saturation: 18,
      sharpness: 25,
      highlights: -8,
      shadows: 12,
    };
  }
}

/**
 * Fast client-side automatic background segmentation & cutout.
 * Uses edge-boundary color sampling, luminance variance, and spatial flood fill
 * to create a transparent alpha mask in pure browser Canvas.
 */
export function removeBackgroundLocally(
  sourceCanvas: HTMLCanvasElement | HTMLImageElement,
  tolerance = 25,
  edgeSmooth = 2
): HTMLCanvasElement {
  const w = 'naturalWidth' in sourceCanvas ? sourceCanvas.naturalWidth : sourceCanvas.width;
  const h = 'naturalHeight' in sourceCanvas ? sourceCanvas.naturalHeight : sourceCanvas.height;

  const canvas = document.createElement('canvas');
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext('2d', { willReadFrequently: true });
  if (!ctx) return canvas;

  ctx.drawImage(sourceCanvas, 0, 0, w, h);
  const imgData = ctx.getImageData(0, 0, w, h);
  const data = imgData.data;

  // Sample corner boundary colors (typical backdrop locations)
  const samplePoints = [
    { x: 2, y: 2 },
    { x: w - 3, y: 2 },
    { x: 2, y: h - 3 },
    { x: w - 3, y: h - 3 },
    { x: Math.floor(w / 2), y: 2 },
    { x: 2, y: Math.floor(h / 2) },
    { x: w - 3, y: Math.floor(h / 2) },
  ];

  const bgColors: [number, number, number][] = [];
  for (const pt of samplePoints) {
    if (pt.x >= 0 && pt.x < w && pt.y >= 0 && pt.y < h) {
      const idx = (pt.y * w + pt.x) * 4;
      bgColors.push([data[idx], data[idx + 1], data[idx + 2]]);
    }
  }

  // Calculate Euclidean color distance threshold
  const distThreshold = tolerance * 2.8;

  // Create visited mask
  const isBg = new Uint8Array(w * h);

  // Mark pixels matching sampled background colors
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const idx = (y * w + x) * 4;
      const r = data[idx];
      const g = data[idx + 1];
      const b = data[idx + 2];

      // Check distance to closest corner/edge background color
      let matched = false;
      for (const [br, bg, bb] of bgColors) {
        const d = Math.hypot(r - br, g - bg, b - bb);
        if (d <= distThreshold) {
          matched = true;
          break;
        }
      }

      // Edge proximity weight (pixels near boundary more likely background)
      const edgeDist = Math.min(x, y, w - 1 - x, h - 1 - y);
      if (matched && edgeDist < Math.min(w, h) * 0.35) {
        isBg[y * w + x] = 1;
      }
    }
  }

  // Apply alpha transparency with edge feathering
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const pIdx = y * w + x;
      const idx = pIdx * 4;

      if (isBg[pIdx] === 1) {
        // Look at neighborhood for smoothing
        if (edgeSmooth > 0) {
          let bgNeighbors = 0;
          let totalNeighbors = 0;
          for (let dy = -edgeSmooth; dy <= edgeSmooth; dy++) {
            for (let dx = -edgeSmooth; dx <= edgeSmooth; dx++) {
              const nx = x + dx;
              const ny = y + dy;
              if (nx >= 0 && nx < w && ny >= 0 && ny < h) {
                totalNeighbors++;
                if (isBg[ny * w + nx] === 1) bgNeighbors++;
              }
            }
          }
          const ratio = bgNeighbors / totalNeighbors;
          data[idx + 3] = Math.round((1 - ratio) * 255);
        } else {
          data[idx + 3] = 0; // completely transparent
        }
      }
    }
  }

  ctx.putImageData(imgData, 0, 0);
  return canvas;
}

/**
 * Master Canvas Rendering & Export Pipeline:
 * Renders the full image applying:
 * 1. Background layer (solid color, gradient, custom image, or blur)
 * 2. Cutout or original foreground image
 * 3. Color filters & adjustments (contrast, brightness, saturation, tint, temperature)
 * 4. Sharpness convolution kernel
 * 5. Vignette radial shading
 * 6. Target dimensions & aspect ratio
 */
export async function renderFinalCanvas(
  sourceImage: HTMLImageElement,
  cutoutCanvas: HTMLCanvasElement | null,
  adjustments: FilterAdjustments,
  presetId: CreativePresetId,
  presetIntensity: number,
  background: BackgroundSettings,
  resize: ResizeSettings
): Promise<HTMLCanvasElement> {
  const targetW = Math.max(1, Math.round(resize.width));
  const targetH = Math.max(1, Math.round(resize.height));

  const canvas = document.createElement('canvas');
  canvas.width = targetW;
  canvas.height = targetH;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Could not obtain canvas 2D context');

  // 1. Draw Background Layer if requested
  if (background.mode !== 'original' && background.isRemoved) {
    if (background.mode === 'color') {
      ctx.fillStyle = background.solidColor;
      ctx.fillRect(0, 0, targetW, targetH);
    } else if (background.mode === 'gradient') {
      let grad: CanvasGradient;
      if (background.gradient.direction === 'to right') {
        grad = ctx.createLinearGradient(0, 0, targetW, 0);
      } else if (background.gradient.direction === 'to bottom') {
        grad = ctx.createLinearGradient(0, 0, 0, targetH);
      } else if (background.gradient.direction === 'circle') {
        grad = ctx.createRadialGradient(
          targetW / 2,
          targetH / 2,
          10,
          targetW / 2,
          targetH / 2,
          Math.max(targetW, targetH) / 1.5
        );
      } else {
        grad = ctx.createLinearGradient(0, 0, targetW, targetH);
      }
      grad.addColorStop(0, background.gradient.startColor);
      grad.addColorStop(1, background.gradient.endColor);
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, targetW, targetH);
    } else if (background.mode === 'blur') {
      // Draw heavily blurred original image as background
      ctx.save();
      ctx.filter = `blur(${Math.max(4, background.blurIntensity)}px) brightness(95%)`;
      ctx.drawImage(sourceImage, -20, -20, targetW + 40, targetH + 40);
      ctx.restore();
    } else if (background.mode === 'image' && background.image.dataUrl) {
      // Load custom background image
      try {
        const bgImg = await loadImage(background.image.dataUrl);
        ctx.save();
        const scale = (background.image.scale || 100) / 100;
        const xOff = ((background.image.xOffset || 0) / 100) * targetW;
        const yOff = ((background.image.yOffset || 0) / 100) * targetH;

        if (background.image.fit === 'cover') {
          const bgAspect = bgImg.width / bgImg.height;
          const canvasAspect = targetW / targetH;
          let renderW = targetW * scale;
          let renderH = targetH * scale;
          if (canvasAspect > bgAspect) {
            renderH = (targetW / bgAspect) * scale;
          } else {
            renderW = (targetH * bgAspect) * scale;
          }
          const cx = (targetW - renderW) / 2 + xOff;
          const cy = (targetH - renderH) / 2 + yOff;
          ctx.drawImage(bgImg, cx, cy, renderW, renderH);
        } else {
          ctx.drawImage(bgImg, xOff, yOff, targetW * scale, targetH * scale);
        }
        ctx.restore();
      } catch (e) {
        console.warn('Could not load background image for rendering', e);
      }
    }
  }

  // 2. Prepare Foreground
  const foregroundSource: CanvasImageSource =
    background.isRemoved && cutoutCanvas ? cutoutCanvas : sourceImage;

  // 3. Apply Filters & Adjustments
  ctx.save();
  const cssFilter = buildCssFilterString(adjustments, presetId, presetIntensity);
  ctx.filter = cssFilter;

  // Draw foreground onto canvas
  ctx.drawImage(foregroundSource, 0, 0, targetW, targetH);
  ctx.restore();

  // 4. Sharpness filter (convolution) if specified
  if (adjustments.sharpness > 0) {
    applySharpness(ctx, targetW, targetH, adjustments.sharpness);
  }

  // 5. Vignette if specified
  if (adjustments.vignette > 0) {
    applyVignette(ctx, targetW, targetH, adjustments.vignette);
  }

  return canvas;
}

function applyVignette(ctx: CanvasRenderingContext2D, w: number, h: number, intensity: number) {
  const radius = Math.sqrt(Math.pow(w / 2, 2) + Math.pow(h / 2, 2));
  const gradient = ctx.createRadialGradient(
    w / 2,
    h / 2,
    radius * 0.4,
    w / 2,
    h / 2,
    radius
  );
  const alpha = (intensity / 100) * 0.7;
  gradient.addColorStop(0, 'rgba(0,0,0,0)');
  gradient.addColorStop(0.6, `rgba(0,0,0,${(alpha * 0.3).toFixed(2)})`);
  gradient.addColorStop(1, `rgba(0,0,0,${alpha.toFixed(2)})`);

  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, w, h);
}

function applySharpness(ctx: CanvasRenderingContext2D, w: number, h: number, amount: number) {
  try {
    const imgData = ctx.getImageData(0, 0, w, h);
    const data = imgData.data;
    const factor = (amount / 100) * 0.6; // subtle, realistic sharpening

    // 3x3 sharpen kernel:
    // [  0, -f,  0 ]
    // [ -f, 1+4f, -f ]
    // [  0, -f,  0 ]
    const copy = new Uint8ClampedArray(data);

    for (let y = 1; y < h - 1; y++) {
      for (let x = 1; x < w - 1; x++) {
        const i = (y * w + x) * 4;
        const up = ((y - 1) * w + x) * 4;
        const down = ((y + 1) * w + x) * 4;
        const left = (y * w + (x - 1)) * 4;
        const right = (y * w + (x + 1)) * 4;

        for (let c = 0; c < 3; c++) {
          const val =
            copy[i + c] * (1 + 4 * factor) -
            factor * (copy[up + c] + copy[down + c] + copy[left + c] + copy[right + c]);
          data[i + c] = Math.min(255, Math.max(0, val));
        }
      }
    }
    ctx.putImageData(imgData, 0, 0);
  } catch (err) {
    console.warn('Canvas sharpness processing omitted due to security or memory bounds', err);
  }
}

export function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => resolve(img);
    img.onerror = (err) => reject(err);
    img.src = src;
  });
}

export function formatBytes(bytes: number, decimals = 1): string {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
}

/**
 * Dimension & Unit Converters
 */
export function convertUnit(
  value: number,
  fromUnit: ResizeUnit,
  toUnit: ResizeUnit,
  dpi: number,
  basePixels: number
): number {
  if (fromUnit === toUnit) return value;

  // Convert fromUnit to Pixels first
  let px = 0;
  switch (fromUnit) {
    case 'px':
      px = value;
      break;
    case 'in':
      px = value * dpi;
      break;
    case 'cm':
      px = (value / 2.54) * dpi;
      break;
    case 'mm':
      px = (value / 25.4) * dpi;
      break;
    case 'percent':
      px = (value / 100) * basePixels;
      break;
  }

  // Convert Pixels to toUnit
  switch (toUnit) {
    case 'px':
      return Math.round(px);
    case 'in':
      return parseFloat((px / dpi).toFixed(2));
    case 'cm':
      return parseFloat(((px / dpi) * 2.54).toFixed(2));
    case 'mm':
      return parseFloat(((px / dpi) * 25.4).toFixed(1));
    case 'percent':
      return Math.round((px / basePixels) * 100);
  }
}
