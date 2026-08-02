// ========== png.ts ==========
// PNG 导出: 使用 Canvas API 绘制带色号标注的图纸 PNG
//
// 约定: grid.data 中的值是 palette.colors 的数组下标, -1 表示空格。

import type { PatternGrid, Palette, ExportOptions, BeadColor } from '../types';

/**
 * 根据相对亮度选择前景文字颜色 (黑或白), 保证色号在色块上可读。
 */
function pickTextColor(bead: BeadColor): string {
  // 使用感知亮度 (Rec. 601)
  const lum = 0.299 * bead.rgb.r + 0.587 * bead.rgb.g + 0.114 * bead.rgb.b;
  return lum > 140 ? '#000000' : '#FFFFFF';
}

/**
 * 将图纸导出为带色号标注的 PNG Blob。
 *
 * @param grid    图纸网格 (data 为 palette.colors 的下标)
 * @param palette 色卡
 * @param options 导出选项 (格子像素尺寸 / 是否显示网格线 / 是否显示色号 / 背景)
 */
export async function exportPNG(
  grid: PatternGrid,
  palette: Palette,
  options: ExportOptions
): Promise<Blob> {
  const cell = Math.max(1, Math.floor(options.cellSize));
  const canvasW = grid.width * cell;
  const canvasH = grid.height * cell;

  const canvas = document.createElement('canvas');
  canvas.width = canvasW;
  canvas.height = canvasH;
  const ctx = canvas.getContext('2d');
  if (!ctx) {
    throw new Error('exportPNG: 无法获取 Canvas 2D 上下文');
  }

  // 1. 背景
  ctx.clearRect(0, 0, canvasW, canvasH);
  if (options.background === 'white') {
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(0, 0, canvasW, canvasH);
  }

  const colors = palette.colors;

  // 2. 绘制色块
  for (let y = 0; y < grid.height; y++) {
    for (let x = 0; x < grid.width; x++) {
      const idx = grid.data[y * grid.width + x];
      if (idx < 0 || idx >= colors.length) continue;
      ctx.fillStyle = colors[idx].hex;
      ctx.fillRect(x * cell, y * cell, cell, cell);
    }
  }

  // 3. 网格线
  if (options.showGrid) {
    ctx.strokeStyle = '#CCCCCC';
    ctx.lineWidth = 1;
    ctx.beginPath();
    for (let x = 0; x <= grid.width; x++) {
      const px = x * cell + 0.5;
      ctx.moveTo(px, 0);
      ctx.lineTo(px, canvasH);
    }
    for (let y = 0; y <= grid.height; y++) {
      const py = y * cell + 0.5;
      ctx.moveTo(0, py);
      ctx.lineTo(canvasW, py);
    }
    ctx.stroke();
  }

  // 4. 色号标注
  if (options.showColorCode) {
    const fontSize = Math.max(6, Math.floor(cell * 0.22));
    ctx.font = `${fontSize}px sans-serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    for (let y = 0; y < grid.height; y++) {
      for (let x = 0; x < grid.width; x++) {
        const idx = grid.data[y * grid.width + x];
        if (idx < 0 || idx >= colors.length) continue;
        const bead = colors[idx];
        ctx.fillStyle = pickTextColor(bead);
        ctx.fillText(bead.code, x * cell + cell / 2, y * cell + cell / 2);
      }
    }
  }

  // 5. 输出 Blob
  return new Promise<Blob>((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (blob) {
        resolve(blob);
      } else {
        reject(new Error('exportPNG: toBlob 返回空值'));
      }
    }, 'image/png');
  });
}
