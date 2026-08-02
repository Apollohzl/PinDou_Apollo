// ========== pipeline.ts ==========
// 主处理流水线
// 流程: 像素化采样 -> 颜色量化 -> 调色板匹配 -> 抖动处理 -> 后处理(去噪/轮廓增强)
//
// 内部采样像素缓冲采用 RGBA (stride=4) 布局, A 分量作为不透明度掩码,
// 与 dither.ts 的约定保持一致。

import type { RGB, BeadColor, PatternConfig, PatternGrid, DitherAlgorithm } from '../types';
import { medianCut } from './quantize';
import { matchBeadColor } from './color';
import {
  noDither,
  floydSteinbergDither,
  riemersmaDither,
  bayerDither,
} from './dither';
import { removeBackground } from './background';
import { denoise, enhanceContours } from './denoise';

const STRIDE = 4;

// ---------- 步骤 1: 像素化采样 ----------

/**
 * 将输入图像下采样到 outW x outH 的网格。
 * 每个输出格取对应源图像区块内不透明像素的 RGB 均值;
 * 若区块内不透明像素不足半数, 则该格视为空 (alpha=0)。
 * 返回 RGBA Float32 缓冲 (长度 outW*outH*4)。
 */
function sampleDown(src: ImageData, outW: number, outH: number): Float32Array {
  const { width: srcW, height: srcH, data } = src;
  const out = new Float32Array(outW * outH * STRIDE);

  const xRatio = srcW / outW;
  const yRatio = srcH / outH;

  for (let oy = 0; oy < outH; oy++) {
    for (let ox = 0; ox < outW; ox++) {
      const x0 = Math.floor(ox * xRatio);
      const x1 = Math.min(srcW, Math.floor((ox + 1) * xRatio));
      const y0 = Math.floor(oy * yRatio);
      const y1 = Math.min(srcH, Math.floor((oy + 1) * yRatio));

      let sumR = 0;
      let sumG = 0;
      let sumB = 0;
      let opaqueCount = 0;
      let totalCount = 0;

      for (let sy = y0; sy < y1; sy++) {
        for (let sx = x0; sx < x1; sx++) {
          const sbase = (sy * srcW + sx) * 4;
          const a = data[sbase + 3];
          totalCount++;
          if (a >= 128) {
            sumR += data[sbase];
            sumG += data[sbase + 1];
            sumB += data[sbase + 2];
            opaqueCount++;
          }
        }
      }

      const obase = (oy * outW + ox) * STRIDE;
      if (totalCount === 0 || opaqueCount === 0) {
        out[obase] = 0;
        out[obase + 1] = 0;
        out[obase + 2] = 0;
        out[obase + 3] = 0;
      } else {
        out[obase] = sumR / opaqueCount;
        out[obase + 1] = sumG / opaqueCount;
        out[obase + 2] = sumB / opaqueCount;
        // 不透明像素占多数时该格视为有效
        out[obase + 3] = opaqueCount * 2 >= totalCount ? 1 : 0;
      }
    }
  }

  return out;
}

// ---------- 步骤 2 辅助: 收集有效像素 ----------

/** 从 RGBA 采样缓冲中提取所有有效 (不透明) 像素为 RGB 列表, 供量化使用 */
function collectOpaquePixels(pixels: Float32Array): RGB[] {
  const list: RGB[] = [];
  const n = pixels.length / STRIDE;
  for (let i = 0; i < n; i++) {
    const base = i * STRIDE;
    if (pixels[base + 3] >= 0.5) {
      list.push({
        r: Math.round(pixels[base]),
        g: Math.round(pixels[base + 1]),
        b: Math.round(pixels[base + 2]),
      });
    }
  }
  return list;
}

// ---------- 步骤 3: 调色板匹配 (构建缩减调色板) ----------

/**
 * 将量化后的代表色逐一匹配到豆子调色板, 去重后得到实际使用的缩减调色板。
 * 去重依据为豆子色号 index。
 */
function buildReducedPalette(quantized: RGB[], palette: BeadColor[]): BeadColor[] {
  const result: BeadColor[] = [];
  const seen = new Set<number>();
  for (let i = 0; i < quantized.length; i++) {
    const bead = matchBeadColor(quantized[i], palette);
    if (!seen.has(bead.index)) {
      seen.add(bead.index);
      result.push(bead);
    }
  }
  return result;
}

// ---------- 步骤 4: 抖动处理 ----------

/** 根据配置选择抖动算法并执行 */
function applyDither(
  pixels: Float32Array,
  width: number,
  height: number,
  palette: BeadColor[],
  algo: DitherAlgorithm
): Int32Array {
  switch (algo) {
    case 'floyd-steinberg':
      return floydSteinbergDither(pixels, width, height, palette);
    case 'riemersma':
      return riemersmaDither(pixels, width, height, palette);
    case 'bayer':
      return bayerDither(pixels, width, height, palette);
    case 'none':
      return noDither(pixels, width, height, palette);
    default:
      return noDither(pixels, width, height, palette);
  }
}

// ---------- 步骤 6: 预览图构建 ----------

/** 根据网格与缩减调色板构建预览 ImageData (网格分辨率, 每格一像素) */
function buildPreview(
  grid: Int32Array,
  width: number,
  height: number,
  palette: BeadColor[]
): ImageData {
  const data = new Uint8ClampedArray(width * height * 4);
  const n = width * height;
  for (let i = 0; i < n; i++) {
    const ci = grid[i];
    const base = i * 4;
    if (ci < 0 || ci >= palette.length) {
      // 空格 -> 透明
      data[base] = 0;
      data[base + 1] = 0;
      data[base + 2] = 0;
      data[base + 3] = 0;
    } else {
      const rgb = palette[ci].rgb;
      data[base] = rgb.r;
      data[base + 1] = rgb.g;
      data[base + 2] = rgb.b;
      data[base + 3] = 255;
    }
  }
  return new ImageData(data, width, height);
}

// ---------- 主流程 ----------

/**
 * 完整图像处理流水线。
 *
 * 流程:
 *   1. (可选) 背景去除
 *   2. 像素化采样: 下采样到 config.width x config.height
 *   3. 颜色量化: Median Cut 量化到最多 maxColors 种代表色
 *   4. 调色板匹配: 代表色 -> 豆子色号, 去重得到缩减调色板
 *   5. 抖动处理: 按 config.dither 选择算法, 产出网格索引
 *   6. 后处理: (可选) 去噪 / 轮廓增强
 *   7. 构建预览图
 *
 * @param imageData 输入图像
 * @param config 图纸配置
 * @param palette 完整豆子调色板
 * @returns { grid: PatternGrid, previewImageData: ImageData }
 */
export function processImage(
  imageData: ImageData,
  config: PatternConfig,
  palette: BeadColor[]
): { grid: PatternGrid; previewImageData: ImageData } {
  const outW = config.width;
  const outH = config.height;

  // 1. 背景去除 (可选)
  let src = imageData;
  if (config.removeBackground) {
    src = removeBackground(imageData, config.backgroundThreshold);
  }

  // 2. 像素化采样
  const sampled = sampleDown(src, outW, outH);

  // 3. 颜色量化
  const pixelList = collectOpaquePixels(sampled);
  // 量化目标色数不超过调色板规模
  const targetColors = Math.min(config.maxColors, palette.length);

  let quantized: RGB[];
  if (pixelList.length === 0) {
    quantized = [];
  } else if (pixelList.length <= targetColors) {
    quantized = pixelList.slice();
  } else {
    quantized = medianCut(pixelList, targetColors);
  }

  // 4. 调色板匹配 -> 缩减调色板
  const reducedPalette = buildReducedPalette(quantized, palette);

  // 5. 抖动处理
  let gridData = applyDither(sampled, outW, outH, reducedPalette, config.dither);

  // 6. 后处理
  if (config.denoise) {
    gridData = denoise(gridData, outW, outH, config.minArea);
  }
  if (config.enhanceContours) {
    gridData = enhanceContours(gridData, outW, outH, reducedPalette);
  }

  const grid: PatternGrid = {
    width: outW,
    height: outH,
    data: gridData,
  };

  // 7. 预览图
  const previewImageData = buildPreview(gridData, outW, outH, reducedPalette);

  return { grid, previewImageData };
}
