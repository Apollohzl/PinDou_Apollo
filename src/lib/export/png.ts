// ========== png.ts ==========
// PNG 导出: 使用 Canvas API 绘制完整导出图片
// 包含: 拼豆图案 + 四边序号 + 物料清单 + 网站 logo
//
// 约定: grid.data 中的值是 palette.colors 的数组下标, -1 表示空格。

import type { PatternGrid, Palette, ExportOptions, BeadColor, UsageItem } from '../types';
import { computeUsage } from './pdf';

/**
 * 根据相对亮度选择前景文字颜色 (黑或白), 保证色号在色块上可读。
 */
function pickTextColor(bead: BeadColor): string {
  const lum = 0.299 * bead.rgb.r + 0.587 * bead.rgb.g + 0.114 * bead.rgb.b;
  return lum > 140 ? '#000000' : '#FFFFFF';
}

/** 网站 logo 像素色块颜色 (3×3) */
const LOGO_COLORS = [
  '#FF6B9D', '#FFD93D', '#4ECDC4',
  '#A78BFA', '#FF6B9D', '#60A5FA',
  '#34D399', '#FFD93D', '#4ECDC4',
];

/** 网站 URL */
const SITE_URL = 'https://apollohzl.github.io/PinDou_Apollo/';

/**
 * 绘制网站 logo (3×3 像素色块) 到指定位置。
 */
function drawLogo(ctx: CanvasRenderingContext2D, x: number, y: number, size: number): void {
  const cellSize = Math.floor(size / 3);
  const gap = Math.max(1, Math.floor(cellSize * 0.1));
  const actualCell = cellSize - gap;

  for (let i = 0; i < 9; i++) {
    const row = Math.floor(i / 3);
    const col = i % 3;
    ctx.fillStyle = LOGO_COLORS[i];
    ctx.fillRect(
      x + col * cellSize + Math.floor(gap / 2),
      y + row * cellSize + Math.floor(gap / 2),
      actualCell,
      actualCell
    );
  }
}

/**
 * 将图纸导出为包含图案、序号、物料清单和 logo 的完整 PNG。
 *
 * @param grid    图纸网格
 * @param palette 色卡
 * @param options 导出选项 (格子尺寸 / 网格线 / 色号 / 背景)
 */
export async function exportPNG(
  grid: PatternGrid,
  palette: Palette,
  options: ExportOptions
): Promise<Blob> {
  const cell = Math.max(8, Math.floor(options.cellSize));
  const padding = 24;

  // ---------- 计算用量 ----------
  const usage: UsageItem[] = computeUsage(grid, palette);
  const totalBeads = usage.reduce((sum, u) => sum + u.count, 0);

  // ---------- 1. 图案区域 (含序号格) ----------
  const axisCell = cell; // 序号格大小与图案格一致
  const patternW = grid.width * cell;
  const patternH = grid.height * cell;
  const patternAreaW = patternW + 2 * axisCell;
  const patternAreaH = patternH + 2 * axisCell;

  // ---------- 2. 物料清单区域 ----------
  const matSquareSize = Math.max(28, Math.floor(cell * 1.2));
  const matTextFontSize = Math.max(11, Math.floor(cell * 0.5));
  const matLineHeight = Math.floor(matTextFontSize * 1.5);
  const matEntryW = Math.max(80, matSquareSize + 24);
  const matEntryH = matSquareSize + 3 * matLineHeight + 8; // 方块 + 色号 + RGB + 数量
  const matTitleFontSize = Math.max(20, Math.floor(cell * 0.9));
  const matSubtitleFontSize = Math.max(14, Math.floor(cell * 0.6));
  const matGap = 20;

  // 物料清单可用宽度 (基于图案区域宽度)
  const matAvailableW = patternAreaW;
  const matCols = Math.max(1, Math.floor((matAvailableW - 2 * padding) / matEntryW));
  const matRows = Math.ceil(usage.length / matCols);

  const matTitleH = matTitleFontSize + matSubtitleFontSize + matGap;
  const matContentH = matRows * matEntryH + matGap;
  const matAreaH = matTitleH + matContentH;

  // ---------- 3. Logo 区域 ----------
  const logoSize = Math.max(32, Math.floor(cell * 1.5));
  const logoFontSize = Math.max(12, Math.floor(cell * 0.55));
  const logoAreaH = logoSize + padding;

  // ---------- 4. 总画布尺寸 ----------
  const totalW = patternAreaW + 2 * padding;
  const totalH = padding + patternAreaH + padding + matAreaH + padding + logoAreaH + padding;

  const canvas = document.createElement('canvas');
  canvas.width = totalW;
  canvas.height = totalH;
  const ctx = canvas.getContext('2d');
  if (!ctx) {
    throw new Error('exportPNG: 无法获取 Canvas 2D 上下文');
  }

  // ---------- 全局背景 ----------
  ctx.fillStyle = '#FFFFFF';
  ctx.fillRect(0, 0, totalW, totalH);

  const colors = palette.colors;

  // ========== 绘制图案区域 ==========
  const patternOriginX = padding;
  const patternOriginY = padding;

  // 序号格背景 (灰色)
  ctx.fillStyle = '#D9D9D9';
  // 上下边
  ctx.fillRect(patternOriginX, patternOriginY, patternAreaW, axisCell);
  ctx.fillRect(patternOriginX, patternOriginY + patternAreaH - axisCell, patternAreaW, axisCell);
  // 左右边
  ctx.fillRect(patternOriginX, patternOriginY + axisCell, axisCell, patternH);
  ctx.fillRect(patternOriginX + patternAreaW - axisCell, patternOriginY + axisCell, axisCell, patternH);

  // 序号文字
  const axisFontSize = Math.max(8, Math.floor(cell * 0.4));
  ctx.font = `bold ${axisFontSize}px sans-serif`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillStyle = '#333333';

  // 上边和下边: 列号
  for (let x = 0; x < grid.width; x++) {
    const cx = patternOriginX + axisCell + x * cell + cell / 2;
    const numStr = String(x + 1);
    ctx.fillText(numStr, cx, patternOriginY + axisCell / 2);
    ctx.fillText(numStr, cx, patternOriginY + patternAreaH - axisCell / 2);
  }
  // 左边和右边: 行号
  for (let y = 0; y < grid.height; y++) {
    const cy = patternOriginY + axisCell + y * cell + cell / 2;
    const numStr = String(y + 1);
    ctx.fillText(numStr, patternOriginX + axisCell / 2, cy);
    ctx.fillText(numStr, patternOriginX + patternAreaW - axisCell / 2, cy);
  }

  // 序号格边框线
  ctx.strokeStyle = '#999999';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(patternOriginX + axisCell + 0.5, patternOriginY);
  ctx.lineTo(patternOriginX + axisCell + 0.5, patternOriginY + patternAreaH);
  ctx.moveTo(patternOriginX + patternAreaW - axisCell + 0.5, patternOriginY);
  ctx.lineTo(patternOriginX + patternAreaW - axisCell + 0.5, patternOriginY + patternAreaH);
  ctx.moveTo(patternOriginX, patternOriginY + axisCell + 0.5);
  ctx.lineTo(patternOriginX + patternAreaW, patternOriginY + axisCell + 0.5);
  ctx.moveTo(patternOriginX, patternOriginY + patternAreaH - axisCell + 0.5);
  ctx.lineTo(patternOriginX + patternAreaW, patternOriginY + patternAreaH - axisCell + 0.5);
  ctx.stroke();

  // 图案偏移
  const ox = patternOriginX + axisCell;
  const oy = patternOriginY + axisCell;

  // 图案背景 (透明模式下不额外填充, 由全局白色背景提供底色)
  if (options.background === 'white') {
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(ox, oy, patternW, patternH);
  }

  // 绘制色块
  for (let y = 0; y < grid.height; y++) {
    for (let x = 0; x < grid.width; x++) {
      const idx = grid.data[y * grid.width + x];
      if (idx < 0 || idx >= colors.length) continue;
      ctx.fillStyle = colors[idx].hex;
      ctx.fillRect(ox + x * cell, oy + y * cell, cell, cell);
    }
  }

  // 网格线
  if (options.showGrid) {
    ctx.strokeStyle = '#CCCCCC';
    ctx.lineWidth = 1;
    ctx.beginPath();
    for (let x = 0; x <= grid.width; x++) {
      const px = ox + x * cell + 0.5;
      ctx.moveTo(px, oy);
      ctx.lineTo(px, oy + patternH);
    }
    for (let y = 0; y <= grid.height; y++) {
      const py = oy + y * cell + 0.5;
      ctx.moveTo(ox, py);
      ctx.lineTo(ox + patternW, py);
    }
    ctx.stroke();

    // 每 10 格加粗
    ctx.strokeStyle = '#B8860B';
    ctx.lineWidth = 2;
    ctx.beginPath();
    for (let x = 0; x <= grid.width; x += 10) {
      const px = ox + x * cell + 0.5;
      ctx.moveTo(px, oy);
      ctx.lineTo(px, oy + patternH);
    }
    for (let y = 0; y <= grid.height; y += 10) {
      const py = oy + y * cell + 0.5;
      ctx.moveTo(ox, py);
      ctx.lineTo(ox + patternW, py);
    }
    ctx.stroke();
  }

  // 色号标注
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
        ctx.fillText(bead.code, ox + x * cell + cell / 2, oy + y * cell + cell / 2);
      }
    }
  }

  // ========== 绘制物料清单区域 ==========
  const matOriginX = padding;
  const matOriginY = padding + patternAreaH + padding;

  // 标题: 物料清单 (粗体)
  ctx.font = `bold ${matTitleFontSize}px sans-serif`;
  ctx.textAlign = 'left';
  ctx.textBaseline = 'top';
  ctx.fillStyle = '#1a1a2e';
  ctx.fillText('物料清单', matOriginX, matOriginY);

  // 副标题: 像素总用量 (灰色)
  ctx.font = `${matSubtitleFontSize}px sans-serif`;
  ctx.fillStyle = '#888888';
  ctx.fillText(`像素总用量：${totalBeads}`, matOriginX, matOriginY + matTitleFontSize + 4);

  // 颜色条目
  const matContentStartY = matOriginY + matTitleH;
  for (let i = 0; i < usage.length; i++) {
    const item = usage[i];
    const col = i % matCols;
    const row = Math.floor(i / matCols);
    const entryX = matOriginX + col * matEntryW;
    const entryY = matContentStartY + row * matEntryH;

    // 颜色方块
    ctx.fillStyle = item.bead.hex;
    ctx.fillRect(entryX, entryY, matSquareSize, matSquareSize);
    // 方块边框
    ctx.strokeStyle = '#CCCCCC';
    ctx.lineWidth = 1;
    ctx.strokeRect(entryX + 0.5, entryY + 0.5, matSquareSize - 1, matSquareSize - 1);

    // 色号
    const textX = entryX + matSquareSize / 2;
    ctx.textAlign = 'center';
    ctx.font = `bold ${matTextFontSize}px sans-serif`;
    ctx.fillStyle = '#333333';
    ctx.fillText(item.bead.code, textX, entryY + matSquareSize + 4);

    // RGB
    ctx.font = `${matTextFontSize}px sans-serif`;
    ctx.fillStyle = '#666666';
    const rgbStr = `${item.bead.rgb.r},${item.bead.rgb.g},${item.bead.rgb.b}`;
    ctx.fillText(rgbStr, textX, entryY + matSquareSize + 4 + matLineHeight);

    // 数量
    ctx.font = `bold ${matTextFontSize}px sans-serif`;
    ctx.fillStyle = '#1a1a2e';
    ctx.fillText(`${item.count}颗`, textX, entryY + matSquareSize + 4 + 2 * matLineHeight);
  }

  // ========== 绘制 Logo 和 URL ==========
  const logoX = padding;
  const logoY = totalH - padding - logoSize;

  drawLogo(ctx, logoX, logoY, logoSize);

  // URL 文字
  ctx.font = `${logoFontSize}px sans-serif`;
  ctx.textAlign = 'left';
  ctx.textBaseline = 'middle';
  ctx.fillStyle = '#666666';
  ctx.fillText(SITE_URL, logoX + logoSize + 12, logoY + logoSize / 2);

  // ---------- 输出 Blob ----------
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
