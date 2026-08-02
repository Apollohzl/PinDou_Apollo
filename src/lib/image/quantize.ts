// ========== quantize.ts ==========
// 颜色量化算法
// 包含: Median Cut 中位切割, K-Means 聚类

import type { RGB } from '../types';

// ---------- 通用工具 ----------

/** 两 RGB 颜色的平方欧氏距离 (避免开方, 用于比较) */
function squaredDist(a: RGB, b: RGB): number {
  const dr = a.r - b.r;
  const dg = a.g - b.g;
  const db = a.b - b.b;
  return dr * dr + dg * dg + db * db;
}

/** RGB 通道颜色分量索引 */
type Channel = 'r' | 'g' | 'b';

function channelValue(p: RGB, c: Channel): number {
  return c === 'r' ? p.r : c === 'g' ? p.g : p.b;
}

// ---------- Median Cut (中位切割) ----------

/** 颜色盒子: 持有像素集合与其在各通道的范围 */
interface ColorBox {
  pixels: RGB[];
  minR: number;
  maxR: number;
  minG: number;
  maxG: number;
  minB: number;
  maxB: number;
}

/** 根据像素集合计算包围盒 */
function computeBox(pixels: RGB[]): ColorBox {
  let minR = 255;
  let maxR = 0;
  let minG = 255;
  let maxG = 0;
  let minB = 255;
  let maxB = 0;
  for (let i = 0; i < pixels.length; i++) {
    const p = pixels[i];
    if (p.r < minR) minR = p.r;
    if (p.r > maxR) maxR = p.r;
    if (p.g < minG) minG = p.g;
    if (p.g > maxG) maxG = p.g;
    if (p.b < minB) minB = p.b;
    if (p.b > maxB) maxB = p.b;
  }
  return { pixels, minR, maxR, minG, maxG, minB, maxB };
}

/** 计算盒子最长的通道及其跨度 */
function longestChannel(box: ColorBox): { channel: Channel; range: number } {
  const rRange = box.maxR - box.minR;
  const gRange = box.maxG - box.minG;
  const bRange = box.maxB - box.minB;
  if (rRange >= gRange && rRange >= bRange) return { channel: 'r', range: rRange };
  if (gRange >= rRange && gRange >= bRange) return { channel: 'g', range: gRange };
  return { channel: 'b', range: bRange };
}

/**
 * Median Cut 中位切割量化算法。
 * 反复选取跨度最大的盒子, 沿其最长通道在中位数处切分为两个盒子,
 * 直到盒子数量达到 targetColors。最终取每个盒子像素均值作为代表色。
 */
export function medianCut(pixels: RGB[], targetColors: number): RGB[] {
  if (pixels.length === 0 || targetColors <= 0) return [];

  let boxes: ColorBox[] = [computeBox(pixels)];

  while (boxes.length < targetColors) {
    // 在所有可切分(像素数>1 且有跨度)的盒子中找跨度最大者
    let bestIdx = -1;
    let bestRange = 0;
    let bestChannel: Channel = 'r';

    for (let i = 0; i < boxes.length; i++) {
      const box = boxes[i];
      if (box.pixels.length <= 1) continue;
      const { channel, range } = longestChannel(box);
      if (range > bestRange) {
        bestRange = range;
        bestIdx = i;
        bestChannel = channel;
      }
    }

    if (bestIdx === -1) break; // 没有可继续切分的盒子

    const box = boxes[bestIdx];
    const ch = bestChannel;
    const sorted = box.pixels.slice().sort((a, b) => channelValue(a, ch) - channelValue(b, ch));
    const medianIdx = sorted.length >> 1;
    const left = sorted.slice(0, medianIdx);
    const right = sorted.slice(medianIdx);

    // 极端情况下两侧可能有一侧为空, 此时无法继续切分, 直接跳出
    if (left.length === 0 || right.length === 0) break;

    boxes.splice(bestIdx, 1, computeBox(left), computeBox(right));
  }

  // 每个盒子取均值作为代表色
  const result: RGB[] = [];
  for (let i = 0; i < boxes.length; i++) {
    const boxPixels = boxes[i].pixels;
    if (boxPixels.length === 0) continue;
    let sumR = 0;
    let sumG = 0;
    let sumB = 0;
    for (let j = 0; j < boxPixels.length; j++) {
      sumR += boxPixels[j].r;
      sumG += boxPixels[j].g;
      sumB += boxPixels[j].b;
    }
    const n = boxPixels.length;
    result.push({
      r: Math.round(sumR / n),
      g: Math.round(sumG / n),
      b: Math.round(sumB / n),
    });
  }
  return result;
}

// ---------- K-Means 聚类 ----------

/**
 * K-Means 颜色聚类量化。
 * 采用 K-Means++ 初始化以获得更稳定的聚类质量, 随后迭代指派+更新直到收敛或达到最大迭代次数。
 * 注意: 由于使用随机初始化, 结果具有非确定性; maxIterations 默认 20。
 */
export function kMeansQuantize(pixels: RGB[], k: number, maxIterations: number = 20): RGB[] {
  if (pixels.length === 0 || k <= 0) return [];

  const kk = Math.min(k, pixels.length);

  // ---- K-Means++ 初始化 ----
  const centroids: RGB[] = [];
  centroids.push({ ...pixels[Math.floor(Math.random() * pixels.length)] });

  while (centroids.length < kk) {
    const dists = new Array<number>(pixels.length);
    let total = 0;
    for (let i = 0; i < pixels.length; i++) {
      let minD = Infinity;
      for (let c = 0; c < centroids.length; c++) {
        const d = squaredDist(pixels[i], centroids[c]);
        if (d < minD) minD = d;
      }
      dists[i] = minD;
      total += minD;
    }

    let chosen: number;
    if (total === 0) {
      // 所有点均与已有中心重合, 随机补一个
      chosen = Math.floor(Math.random() * pixels.length);
    } else {
      let r = Math.random() * total;
      chosen = pixels.length - 1;
      for (let i = 0; i < pixels.length; i++) {
        r -= dists[i];
        if (r <= 0) {
          chosen = i;
          break;
        }
      }
    }
    centroids.push({ ...pixels[chosen] });
  }

  // ---- 迭代 ----
  const assignments = new Int32Array(pixels.length).fill(-1);

  for (let iter = 0; iter < maxIterations; iter++) {
    let changed = false;

    // 指派
    for (let i = 0; i < pixels.length; i++) {
      let minD = Infinity;
      let bestC = 0;
      for (let c = 0; c < centroids.length; c++) {
        const d = squaredDist(pixels[i], centroids[c]);
        if (d < minD) {
          minD = d;
          bestC = c;
        }
      }
      if (assignments[i] !== bestC) {
        assignments[i] = bestC;
        changed = true;
      }
    }

    // 首轮之后若指派未变则收敛
    if (!changed && iter > 0) break;

    // 更新中心
    const sums = new Array<{ r: number; g: number; b: number; count: number }>(centroids.length);
    for (let c = 0; c < centroids.length; c++) {
      sums[c] = { r: 0, g: 0, b: 0, count: 0 };
    }
    for (let i = 0; i < pixels.length; i++) {
      const s = sums[assignments[i]];
      s.r += pixels[i].r;
      s.g += pixels[i].g;
      s.b += pixels[i].b;
      s.count++;
    }
    for (let c = 0; c < centroids.length; c++) {
      const s = sums[c];
      if (s.count > 0) {
        centroids[c] = {
          r: Math.round(s.r / s.count),
          g: Math.round(s.g / s.count),
          b: Math.round(s.b / s.count),
        };
      }
      // count 为 0 的簇保留原中心
    }
  }

  return centroids;
}
