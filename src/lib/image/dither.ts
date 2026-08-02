// ========== dither.ts ==========
// 抖动算法
// 包含: Floyd-Steinberg 误差扩散, Riemersma (Hilbert 曲线) 抖动,
//       Bayer 有序抖动, 无抖动直接匹配
//
// 像素缓冲区布局约定:
//   pixels: Float32Array, 每像素 4 个分量 (R, G, B, A), 长度 = width * height * 4
//   A 分量作为不透明度掩码: A >= 0.5 视为有效像素, 否则视为透明(背景) -> 输出 -1
// 返回值:
//   Int32Array, 长度 = width * height, 每个元素为调色板中的索引, -1 表示空格

import type { RGB, LabColor, BeadColor } from '../types';
import { rgbToLab, ciede2000 } from './color';

// ---------- 内部工具 ----------

const STRIDE = 4;
const ALPHA_THRESHOLD = 0.5;

function clamp255(v: number): number {
  if (v < 0) return 0;
  if (v > 255) return 255;
  return v;
}

/**
 * 在调色板中查找与指定 RGB 最接近的颜色索引。
 * 输入会先钳制到 [0,255], 使用 CIEDE2000 色差判定。
 */
function findClosestIndex(
  r: number,
  g: number,
  b: number,
  paletteLabs: LabColor[]
): number {
  const lab = rgbToLab({
    r: clamp255(r),
    g: clamp255(g),
    b: clamp255(b),
  });
  let best = 0;
  let bestDist = Infinity;
  for (let i = 0; i < paletteLabs.length; i++) {
    const d = ciede2000(lab, paletteLabs[i]);
    if (d < bestDist) {
      bestDist = d;
      best = i;
    }
  }
  return best;
}

/** 从调色板预取 Lab 与 RGB 数组, 避免重复访问对象属性 */
interface PreparedPalette {
  labs: LabColor[];
  rgbs: RGB[];
}

function preparePalette(palette: BeadColor[]): PreparedPalette {
  const labs: LabColor[] = new Array(palette.length);
  const rgbs: RGB[] = new Array(palette.length);
  for (let i = 0; i < palette.length; i++) {
    labs[i] = palette[i].lab;
    rgbs[i] = palette[i].rgb;
  }
  return { labs, rgbs };
}

// ---------- 无抖动 ----------

/** 无抖动: 每个像素直接匹配最近的调色板颜色 */
export function noDither(
  pixels: Float32Array,
  width: number,
  height: number,
  palette: BeadColor[]
): Int32Array {
  const result = new Int32Array(width * height);
  if (palette.length === 0) {
    result.fill(-1);
    return result;
  }

  const { labs } = preparePalette(palette);
  const n = width * height;

  for (let i = 0; i < n; i++) {
    const base = i * STRIDE;
    if (pixels[base + 3] < ALPHA_THRESHOLD) {
      result[i] = -1;
      continue;
    }
    result[i] = findClosestIndex(pixels[base], pixels[base + 1], pixels[base + 2], labs);
  }
  return result;
}

// ---------- Floyd-Steinberg 误差扩散 ----------

/**
 * Floyd-Steinberg 误差扩散抖动。
 * 误差分配: 右 7/16, 左下 3/16, 下 5/16, 右下 1/16。
 * 透明像素输出 -1 且不参与误差扩散。
 */
export function floydSteinbergDither(
  pixels: Float32Array,
  width: number,
  height: number,
  palette: BeadColor[]
): Int32Array {
  const result = new Int32Array(width * height);
  if (palette.length === 0) {
    result.fill(-1);
    return result;
  }

  const work = new Float32Array(pixels); // 含 alpha 的可写副本
  const { labs, rgbs } = preparePalette(palette);

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const idx = y * width + x;
      const base = idx * STRIDE;

      if (work[base + 3] < ALPHA_THRESHOLD) {
        result[idx] = -1;
        continue;
      }

      const oldR = work[base];
      const oldG = work[base + 1];
      const oldB = work[base + 2];

      const ci = findClosestIndex(oldR, oldG, oldB, labs);
      result[idx] = ci;
      const newRgb = rgbs[ci];

      const errR = oldR - newRgb.r;
      const errG = oldG - newRgb.g;
      const errB = oldB - newRgb.b;

      // 右 (7/16)
      if (x + 1 < width) {
        const ni = idx + 1;
        const nb = ni * STRIDE;
        work[nb] += (errR * 7) / 16;
        work[nb + 1] += (errG * 7) / 16;
        work[nb + 2] += (errB * 7) / 16;
      }
      // 左下 (3/16)
      if (y + 1 < height && x - 1 >= 0) {
        const ni = (y + 1) * width + (x - 1);
        const nb = ni * STRIDE;
        work[nb] += (errR * 3) / 16;
        work[nb + 1] += (errG * 3) / 16;
        work[nb + 2] += (errB * 3) / 16;
      }
      // 下 (5/16)
      if (y + 1 < height) {
        const ni = (y + 1) * width + x;
        const nb = ni * STRIDE;
        work[nb] += (errR * 5) / 16;
        work[nb + 1] += (errG * 5) / 16;
        work[nb + 2] += (errB * 5) / 16;
      }
      // 右下 (1/16)
      if (y + 1 < height && x + 1 < width) {
        const ni = (y + 1) * width + (x + 1);
        const nb = ni * STRIDE;
        work[nb] += (errR * 1) / 16;
        work[nb + 1] += (errG * 1) / 16;
        work[nb + 2] += (errB * 1) / 16;
      }
    }
  }
  return result;
}

// ---------- Riemersma 抖动 (Hilbert 曲线) ----------

/**
 * 将 Hilbert 序号 d (0..n*n-1) 映射为 n x n 网格上的 (x, y)。
 * n 必须为 2 的幂。标准 d2xy 算法。
 */
function hilbertD2XY(n: number, d: number): [number, number] {
  let x = 0;
  let y = 0;
  let t = d;
  for (let s = 1; s < n; s *= 2) {
    const rx = (t >>> 1) & 1;
    const ry = (t ^ rx) & 1;
    if (ry === 0) {
      if (rx === 1) {
        x = s - 1 - x;
        y = s - 1 - y;
      }
      const tmp = x;
      x = y;
      y = tmp;
    }
    x += s * rx;
    y += s * ry;
    t = t >>> 2;
  }
  return [x, y];
}

/**
 * 生成覆盖 width x height 图像的 Hilbert 遍历顺序。
 * 取大于等于 max(width,height) 的最小 2 的幂 n, 生成 n x n Hilbert 曲线,
 * 过滤掉落在图像范围外的点。结果为数组, 第 i 项为第 i 个访问像素的线性索引。
 */
function generateHilbertOrder(width: number, height: number): Int32Array {
  let n = 1;
  while (n < width || n < height) n *= 2;

  const total = n * n;
  const order: number[] = [];
  for (let d = 0; d < total; d++) {
    const [x, y] = hilbertD2XY(n, d);
    if (x < width && y < height) {
      order.push(y * width + x);
    }
  }
  return Int32Array.from(order);
}

/**
 * Riemersma 抖动: 沿 Hilbert 曲线遍历像素, 将每个像素的量化误差
 * 按指数衰减权重 (8, 4, 2, 1) 传播给曲线后续 4 个像素。
 * 透明像素输出 -1 且不参与误差扩散。
 */
export function riemersmaDither(
  pixels: Float32Array,
  width: number,
  height: number,
  palette: BeadColor[]
): Int32Array {
  const result = new Int32Array(width * height);
  if (palette.length === 0) {
    result.fill(-1);
    return result;
  }

  const work = new Float32Array(pixels);
  const { labs, rgbs } = preparePalette(palette);
  const order = generateHilbertOrder(width, height);

  // 误差传播权重 (向曲线后续 4 个像素), 归一化后总误差完整扩散
  const weights = [8, 4, 2, 1];
  const weightSum = weights.reduce((a, b) => a + b, 0); // 15

  for (let i = 0; i < order.length; i++) {
    const idx = order[i];
    const base = idx * STRIDE;

    if (work[base + 3] < ALPHA_THRESHOLD) {
      result[idx] = -1;
      continue;
    }

    const oldR = work[base];
    const oldG = work[base + 1];
    const oldB = work[base + 2];

    const ci = findClosestIndex(oldR, oldG, oldB, labs);
    result[idx] = ci;
    const newRgb = rgbs[ci];

    const errR = oldR - newRgb.r;
    const errG = oldG - newRgb.g;
    const errB = oldB - newRgb.b;

    for (let w = 0; w < weights.length; w++) {
      const ni = i + w + 1;
      if (ni >= order.length) break;
      const nidx = order[ni];
      const nb = nidx * STRIDE;
      const factor = weights[w] / weightSum;
      work[nb] += errR * factor;
      work[nb + 1] += errG * factor;
      work[nb + 2] += errB * factor;
    }
  }
  return result;
}

// ---------- Bayer 有序抖动 ----------

/** 4x4 Bayer 阈值矩阵 (阈值 0..15) */
const BAYER_4X4 = new Int8Array([
  0, 8, 2, 10,
  12, 4, 14, 6,
  3, 11, 1, 9,
  15, 7, 13, 5,
]);
const BAYER_SIZE = 4;
const BAYER_N = BAYER_SIZE * BAYER_SIZE; // 16

/**
 * Bayer 有序抖动: 依据像素位置查 Bayer 矩阵得到归一化阈值,
 * 将阈值偏移叠加到 RGB 后再匹配调色板, 产生规则的网纹抖动。
 * 透明像素输出 -1。抖动强度随调色板规模自适应, 保证视觉可见。
 */
export function bayerDither(
  pixels: Float32Array,
  width: number,
  height: number,
  palette: BeadColor[]
): Int32Array {
  const result = new Int32Array(width * height);
  if (palette.length === 0) {
    result.fill(-1);
    return result;
  }

  const { labs } = preparePalette(palette);
  // 强度自适应: 调色板越小则偏移越大, 但不低于 32 以保证可见
  const strength = Math.max(32, 256 / palette.length);

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const idx = y * width + x;
      const base = idx * STRIDE;

      if (pixels[base + 3] < ALPHA_THRESHOLD) {
        result[idx] = -1;
        continue;
      }

      const v = BAYER_4X4[(y % BAYER_SIZE) * BAYER_SIZE + (x % BAYER_SIZE)];
      // 阈值归一化到 [-0.5, 0.5)
      const t = (v + 0.5) / BAYER_N - 0.5;
      const offset = t * strength;

      const r = clamp255(pixels[base] + offset);
      const g = clamp255(pixels[base + 1] + offset);
      const b = clamp255(pixels[base + 2] + offset);

      result[idx] = findClosestIndex(r, g, b, labs);
    }
  }
  return result;
}
