// ========== denoise.ts ==========
// 去噪与后处理
// 包含: BFS 连通域去噪, 轮廓增强
//
// 网格约定: grid: Int32Array, 长度 = width * height, 每个元素为调色板索引, -1 表示空格。

import type { BeadColor } from '../types';

// ---------- BFS 连通域去噪 ----------

/** 收集 (x,y) 的 4 邻接合法索引 */
function neighbors4(x: number, y: number, width: number, height: number): number[] {
  const result: number[] = [];
  if (x > 0) result.push(y * width + (x - 1));
  if (x < width - 1) result.push(y * width + (x + 1));
  if (y > 0) result.push((y - 1) * width + x);
  if (y < height - 1) result.push((y + 1) * width + x);
  return result;
}

/**
 * BFS 连通域去噪。
 * 扫描整张网格, 对每个非空颜色 (color !== -1) 的连通域, 若其面积小于 minArea,
 * 则将该连通域替换为其周围出现次数最多的邻接颜色 (可为 -1, 即融入背景)。
 * 大面积背景 (-1) 区域不参与替换, 保持稳定。
 *
 * @param grid 原始网格
 * @param width 宽
 * @param height 高
 * @param minArea 最小保留面积, 小于该值的连通域被视为噪点。默认 8。
 */
export function denoise(
  grid: Int32Array,
  width: number,
  height: number,
  minArea: number = 8
): Int32Array {
  const result = new Int32Array(grid);
  const total = width * height;
  const visited = new Uint8Array(total);

  for (let start = 0; start < total; start++) {
    if (visited[start]) continue;
    const color = grid[start];
    // 背景连通域 (-1) 不做处理, 仅标记已访问
    if (color === -1) {
      // 标记整片背景已访问, 避免后续重复 BFS
      const queue: number[] = [start];
      let head = 0;
      visited[start] = 1;
      while (head < queue.length) {
        const p = queue[head++];
        const px = p % width;
        const py = (p - px) / width;
        const ns = neighbors4(px, py, width, height);
        for (let k = 0; k < ns.length; k++) {
          const np = ns[k];
          if (!visited[np] && grid[np] === -1) {
            visited[np] = 1;
            queue.push(np);
          }
        }
      }
      continue;
    }

    // 非空颜色连通域 BFS
    const component: number[] = [];
    const queue: number[] = [start];
    let head = 0;
    visited[start] = 1;

    while (head < queue.length) {
      const p = queue[head++];
      component.push(p);
      const px = p % width;
      const py = (p - px) / width;
      const ns = neighbors4(px, py, width, height);
      for (let k = 0; k < ns.length; k++) {
        const np = ns[k];
        if (!visited[np] && grid[np] === color) {
          visited[np] = 1;
          queue.push(np);
        }
      }
    }

    // 面积过小 -> 替换为周围最常见颜色
    if (component.length < minArea) {
      const colorCount = new Map<number, number>();
      for (let i = 0; i < component.length; i++) {
        const p = component[i];
        const px = p % width;
        const py = (p - px) / width;
        const ns = neighbors4(px, py, width, height);
        for (let k = 0; k < ns.length; k++) {
          const np = ns[k];
          const nc = grid[np]; // 使用原始网格读取邻接颜色
          if (nc === color) continue; // 跳过同色(同连通域)邻居
          colorCount.set(nc, (colorCount.get(nc) ?? 0) + 1);
        }
      }

      let replaceColor = -1;
      let maxCount = 0;
      colorCount.forEach((cnt, c) => {
        if (cnt > maxCount) {
          maxCount = cnt;
          replaceColor = c;
        }
      });

      for (let i = 0; i < component.length; i++) {
        result[component[i]] = replaceColor;
      }
    }
  }

  return result;
}

// ---------- 轮廓增强 ----------

/**
 * 轮廓增强。
 * 检测每个非空像素的 4 邻接中是否存在不同颜色 (含背景 -1) 的邻居, 若存在则该像素
 * 位于颜色边界, 将其替换为调色板中最暗的颜色 (作为描边色), 从而强化各色块轮廓,
 * 产生类似卡通线稿的视觉效果, 便于拼豆制作时辨认色块边界。
 *
 * 单趟扫描: 边界判定基于原始 grid, 写入独立 result, 避免级联扩散。
 *
 * @param grid 原始网格
 * @param width 宽
 * @param height 高
 * @param palette 当前使用的豆子调色板 (用于选取描边色)
 */
export function enhanceContours(
  grid: Int32Array,
  width: number,
  height: number,
  palette: BeadColor[]
): Int32Array {
  const result = new Int32Array(grid);
  if (palette.length === 0) return result;

  // 选取调色板中 L* 最暗者作为描边色索引
  let outlineIdx = 0;
  let minL = Infinity;
  for (let i = 0; i < palette.length; i++) {
    const L = palette[i].lab.L;
    if (L < minL) {
      minL = L;
      outlineIdx = i;
    }
  }

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const idx = y * width + x;
      const c = grid[idx];
      if (c === -1) continue; // 空格不处理

      let isBoundary = false;
      if (x > 0 && grid[idx - 1] !== c) isBoundary = true;
      else if (x < width - 1 && grid[idx + 1] !== c) isBoundary = true;
      else if (y > 0 && grid[idx - width] !== c) isBoundary = true;
      else if (y < height - 1 && grid[idx + width] !== c) isBoundary = true;

      if (isBoundary) {
        result[idx] = outlineIdx;
      }
    }
  }

  return result;
}
