// ========== background.ts ==========
// 背景去除
// 采用从图像四角出发的 Flood-Fill 算法, 将与角落种子颜色足够接近的连通区域
// 判定为背景并置为透明 (alpha=0)。支持轻微渐变背景。

import type { RGB } from '../types';

/** RGB 欧氏距离 */
function colorDistance(
  r1: number,
  g1: number,
  b1: number,
  r2: number,
  g2: number,
  b2: number
): number {
  const dr = r1 - r2;
  const dg = g1 - g2;
  const db = b1 - b2;
  return Math.sqrt(dr * dr + dg * dg + db * db);
}

/**
 * Flood-Fill 背景去除。
 *
 * @param imageData 输入图像 (RGBA)
 * @param threshold 颜色距离阈值, 像素与种子颜色距离小于该值视为背景。默认 30。
 *                  同时, 像素与传播来源像素距离小于 threshold*0.5 时也视为背景,
 *                  以容忍缓慢渐变的背景。
 * @returns 新的 ImageData, 背景像素 alpha 置 0
 */
export function removeBackground(imageData: ImageData, threshold: number = 30): ImageData {
  const { width, height, data } = imageData;

  // 复制一份, 避免修改原始数据
  const out = new Uint8ClampedArray(data);
  const visited = new Uint8Array(width * height);

  // 四角作为种子点
  const corners = [0, width - 1, (height - 1) * width, height * width - 1];
  const seedColors: RGB[] = [];
  for (let i = 0; i < corners.length; i++) {
    const base = corners[i] * 4;
    seedColors.push({ r: data[base], g: data[base + 1], b: data[base + 2] });
  }

  const neighborThreshold = threshold * 0.5;

  for (let c = 0; c < corners.length; c++) {
    const start = corners[c];
    if (visited[start]) continue;
    const seed = seedColors[c];

    // 使用 head 指针的队列, 避免 shift() 的 O(n) 开销
    const queue: number[] = [start];
    let head = 0;
    visited[start] = 1;
    out[start * 4 + 3] = 0;

    while (head < queue.length) {
      const p = queue[head++];
      const px = p % width;
      const py = (p - px) / width;
      const pbase = p * 4;
      const pr = data[pbase];
      const pg = data[pbase + 1];
      const pb = data[pbase + 2];

      // 4 邻接
      const candidates: number[] = [];
      if (px > 0) candidates.push(p - 1);
      if (px < width - 1) candidates.push(p + 1);
      if (py > 0) candidates.push(p - width);
      if (py < height - 1) candidates.push(p + width);

      for (let k = 0; k < candidates.length; k++) {
        const np = candidates[k];
        if (visited[np]) continue;
        const nbase = np * 4;
        const nr = data[nbase];
        const ng = data[nbase + 1];
        const nb = data[nbase + 2];

        const distToSeed = colorDistance(nr, ng, nb, seed.r, seed.g, seed.b);
        const distToNeighbor = colorDistance(nr, ng, nb, pr, pg, pb);

        if (distToSeed < threshold || distToNeighbor < neighborThreshold) {
          visited[np] = 1;
          out[nbase + 3] = 0;
          queue.push(np);
        }
      }
    }
  }

  return new ImageData(out, width, height);
}
