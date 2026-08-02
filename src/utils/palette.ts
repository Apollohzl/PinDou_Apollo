// ========== palette.ts ==========
// 色卡相关工具函数
// 用于在 UI 层处理 processImage 返回的网格数据与完整色卡之间的映射

import type { PatternGrid, Palette, BeadColor, RGB } from '../lib/types';
import { matchBeadColor } from '../lib/image/color';

/**
 * 从 processImage 的输出中重建实际使用的缩减色卡。
 *
 * processImage 内部会构建缩减色卡用于抖动, 网格 data 中的值是缩减色卡的下标。
 * 此函数通过 previewImageData 将每个下标映射回完整色卡中的 BeadColor,
 * 从而得到一个 colors 数组, 其下标与 grid.data 一致。
 *
 * @param grid            processImage 返回的网格 (data 为缩减色卡下标)
 * @param previewImageData processImage 返回的预览图 (网格分辨率, 每格一像素)
 * @param fullPalette     完整色卡颜色数组
 * @returns Palette 对象, colors 下标与 grid.data 一致
 */
export function buildReducedPalette(
  grid: PatternGrid,
  previewImageData: ImageData,
  fullPalette: BeadColor[]
): Palette {
  const colorMap = new Map<number, BeadColor>();

  for (let i = 0; i < grid.data.length; i++) {
    const ci = grid.data[i];
    if (ci < 0 || colorMap.has(ci)) continue;

    const base = i * 4;
    const rgb: RGB = {
      r: previewImageData.data[base],
      g: previewImageData.data[base + 1],
      b: previewImageData.data[base + 2],
    };
    colorMap.set(ci, matchBeadColor(rgb, fullPalette));
  }

  const maxIdx = Math.max(0, ...colorMap.keys());
  const colors: BeadColor[] = [];
  for (let i = 0; i <= maxIdx; i++) {
    if (colorMap.has(i)) {
      colors.push(colorMap.get(i)!);
    } else {
      colors.push(fullPalette[0]);
    }
  }

  return {
    id: fullPalette[0].brand,
    name: 'Used Colors',
    size: fullPalette[0].size,
    colors,
  };
}

/**
 * 将网格 data 中的缩减色卡下标重映射为完整色卡下标。
 * 重映射后, grid.data[i] 可直接作为 fullPalette.colors 的下标使用。
 *
 * @param grid            原始网格 (data 为缩减色卡下标)
 * @param reducedPalette  缩减色卡 (由 buildReducedPalette 得到)
 * @param fullPalette     完整色卡
 * @returns 新的 PatternGrid, data 为完整色卡下标
 */
export function remapToFullPalette(
  grid: PatternGrid,
  reducedPalette: BeadColor[],
  fullPalette: BeadColor[]
): PatternGrid {
  const mapping = new Map<number, number>();
  for (let i = 0; i < reducedPalette.length; i++) {
    const idx = fullPalette.findIndex(
      (c) => c.index === reducedPalette[i].index
    );
    mapping.set(i, idx >= 0 ? idx : 0);
  }

  const data = new Int32Array(grid.data.length);
  for (let i = 0; i < grid.data.length; i++) {
    const ci = grid.data[i];
    data[i] = ci < 0 ? -1 : mapping.get(ci) ?? -1;
  }

  return { width: grid.width, height: grid.height, data };
}

/**
 * 统计网格中实际使用的颜色下标集合。
 *
 * @param grid 图纸网格
 * @returns 已使用的颜色下标 Set
 */
export function getUsedColorIndices(grid: PatternGrid): Set<number> {
  const used = new Set<number>();
  for (let i = 0; i < grid.data.length; i++) {
    if (grid.data[i] >= 0) used.add(grid.data[i]);
  }
  return used;
}

/**
 * 下载 Blob 为文件。
 *
 * @param blob     Blob 数据
 * @param filename 文件名
 */
export function downloadBlob(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

/**
 * 将 File 转换为 ImageData 和 HTMLImageElement。
 *
 * @param file 图片文件
 * @returns { imageData, element }
 */
export function fileToImageData(
  file: File
): Promise<{ imageData: ImageData; element: HTMLImageElement }> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = img.naturalWidth;
      canvas.height = img.naturalHeight;
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        reject(new Error('无法获取 Canvas 2D 上下文'));
        return;
      }
      ctx.drawImage(img, 0, 0);
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      resolve({ imageData, element: img });
    };
    img.onerror = () => reject(new Error('图片加载失败'));
    img.src = URL.createObjectURL(file);
  });
}
