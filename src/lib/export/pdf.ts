// ========== pdf.ts ==========
// PDF 导出: 使用 jsPDF 生成包含图纸页与用量清单页的 PDF
//
// 约定: grid.data 中的值是 palette.colors 的数组下标, -1 表示空格。
//
// 中文支持: jsPDF 默认字体 (Helvetica 等) 不支持中文字符, 会导致乱码。
// 本模块使用 Canvas 渲染所有包含中文的文本, 再以图片形式插入 PDF,
// 利用浏览器原生字体渲染能力正确显示中文, 无需嵌入大型字体文件。

import { jsPDF } from 'jspdf';
import type { PatternGrid, Palette, UsageItem, BeadColor } from '../types';

/** 每包豆子数量 (用于估算包数) */
const BEADS_PER_PACK = 1000;

/**
 * 统计图纸中各颜色的用量。
 * 结果按用量从多到少排序, 便于清单阅读与采购。
 */
export function computeUsage(grid: PatternGrid, palette: Palette): UsageItem[] {
  const colors = palette.colors;
  const counts = new Map<number, number>();
  const n = grid.data.length;
  for (let i = 0; i < n; i++) {
    const idx = grid.data[i];
    if (idx < 0 || idx >= colors.length) continue;
    counts.set(idx, (counts.get(idx) ?? 0) + 1);
  }

  const items: UsageItem[] = [];
  for (const [idx, count] of counts) {
    items.push({
      bead: colors[idx],
      count,
      packs: Math.ceil(count / BEADS_PER_PACK),
    });
  }
  items.sort((a, b) => b.count - a.count);
  return items;
}

/** 根据豆子颜色亮度选择文字颜色 (0=黑, 255=白) */
function textRgb(bead: BeadColor): [number, number, number] {
  const lum = 0.299 * bead.rgb.r + 0.587 * bead.rgb.g + 0.114 * bead.rgb.b;
  return lum > 140 ? [0, 0, 0] : [255, 255, 255];
}

// ========== Canvas 文本渲染辅助 ==========
// 将文本渲染到 Canvas (利用浏览器原生中文字体), 再转为 PNG dataURL 插入 PDF。

/**
 * 将文本渲染到 Canvas 并返回 dataURL。
 * 使用浏览器原生字体渲染, 完美支持中文。
 *
 * @param text     要渲染的文本
 * @param fontPx   字体像素大小 (px)
 * @param color    文字颜色 (CSS 颜色字符串)
 * @param weight   字重 (默认 normal)
 * @returns PNG 格式的 dataURL
 */
function renderTextToDataURL(
  text: string,
  fontPx: number,
  color: string,
  weight: string = 'normal'
): string {
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Canvas 2D context 不可用');

  // 使用系统中文字体, 确保中文正确渲染
  const fontStack = `${weight} ${fontPx}px "ZCOOL KuaiLe", "Microsoft YaHei", "PingFang SC", "Hiragino Sans GB", "Noto Sans CJK SC", "WenQuanYi Micro Hei", sans-serif`;
  ctx.font = fontStack;

  // 测量文本宽高
  const metrics = ctx.measureText(text);
  const textWidth = Math.ceil(metrics.width);
  const textHeight = Math.ceil(fontPx * 1.3);

  // 设置 canvas 尺寸 (加 padding 避免文字被裁剪)
  const padding = 2;
  canvas.width = textWidth + padding * 2;
  canvas.height = textHeight + padding * 2;

  // 重新设置 font (canvas 尺寸变化后 context 会重置)
  ctx.font = fontStack;
  ctx.fillStyle = color;
  ctx.textBaseline = 'middle';
  ctx.textAlign = 'left';
  ctx.fillText(text, padding, canvas.height / 2);

  return canvas.toDataURL('image/png');
}

/**
 * 在 PDF 中以 Canvas 图片方式渲染文本 (支持中文)。
 *
 * @param doc       jsPDF 实例
 * @param text      文本内容
 * @param x         PDF 中的 x 坐标 (mm, 左上角)
 * @param y         PDF 中的 y 坐标 (mm, 基线位置)
 * @param fontMm    字体大小 (mm)
 * @param color     文字颜色 (CSS 字符串, 如 '#000000' 或 'rgb(255,255,255)')
 * @param align     对齐方式: 'left' | 'center' | 'right'
 * @param weight    字重
 */
function addCanvasText(
  doc: jsPDF,
  text: string,
  x: number,
  y: number,
  fontMm: number,
  color: string = '#000000',
  align: 'left' | 'center' | 'right' = 'left',
  weight: string = 'normal'
): void {
  // mm 转 px (近似: 1mm ≈ 3.78px @96dpi, 但为清晰度使用更高 dpi)
  const dpiScale = 3; // 提高分辨率确保清晰
  const fontPx = Math.max(8, Math.round(fontMm * 3.78 * dpiScale));

  const dataURL = renderTextToDataURL(text, fontPx, color, weight);

  // 计算 PDF 中的图片尺寸 (保持文字宽高比)
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  if (!ctx) return;
  ctx.font = `${weight} ${fontPx}px sans-serif`;
  const metrics = ctx.measureText(text);
  const textWidthPx = Math.ceil(metrics.width);
  const textHeightPx = Math.ceil(fontPx * 1.3);

  // 转换为 mm
  const imgWidthMm = (textWidthPx / dpiScale) / 3.78;
  const imgHeightMm = (textHeightPx / dpiScale) / 3.78;

  // 根据对齐方式调整 x 坐标
  let imgX = x;
  if (align === 'center') {
    imgX = x - imgWidthMm / 2;
  } else if (align === 'right') {
    imgX = x - imgWidthMm;
  }

  // y 坐标: 转换为图片左上角 (PDF 中 y 是顶部, 我们希望文字基线在 y 附近)
  const imgY = y - imgHeightMm * 0.35;

  doc.addImage(dataURL, 'PNG', imgX, imgY, imgWidthMm, imgHeightMm);
}

/**
 * 导出 PDF: 第一页为带色号标注的图纸, 第二页起为用量清单。
 *
 * @param grid    图纸网格
 * @param palette 色卡
 * @param title   项目标题
 */
export async function exportPDF(
  grid: PatternGrid,
  palette: Palette,
  title: string
): Promise<Blob> {
  const doc = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' });
  const pageW = doc.internal.pageSize.getWidth();
  const pageH = doc.internal.pageSize.getHeight();
  const margin = 10;
  const colors = palette.colors;

  // ---------- 第 1 页: 图纸 ----------
  // 标题 (可能包含中文, 使用 Canvas 渲染)
  addCanvasText(doc, title, margin, margin + 4, 6, '#000000', 'left', 'bold');

  // 计算格子尺寸以居中适配页面
  const availW = pageW - margin * 2;
  const availH = pageH - margin * 2 - 10;
  const cell = Math.min(availW / grid.width, availH / grid.height);
  const totalW = cell * grid.width;
  const totalH = cell * grid.height;
  const offX = (pageW - totalW) / 2;
  const offY = margin + 10;

  // 色块
  for (let y = 0; y < grid.height; y++) {
    for (let x = 0; x < grid.width; x++) {
      const idx = grid.data[y * grid.width + x];
      if (idx < 0 || idx >= colors.length) continue;
      const bead = colors[idx];
      doc.setFillColor(bead.rgb.r, bead.rgb.g, bead.rgb.b);
      doc.rect(offX + x * cell, offY + y * cell, cell, cell, 'F');
    }
  }

  // 网格线
  doc.setDrawColor(200, 200, 200);
  doc.setLineWidth(0.1);
  for (let x = 0; x <= grid.width; x++) {
    doc.line(offX + x * cell, offY, offX + x * cell, offY + totalH);
  }
  for (let y = 0; y <= grid.height; y++) {
    doc.line(offX, offY + y * cell, offX + totalW, offY + y * cell);
  }

  // 色号标注 (色号为 ASCII 如 "S-01", 使用 jsPDF 原生文本渲染, 性能更优)
  if (cell >= 6) {
    const fs = Math.max(3, cell * 0.3);
    doc.setFontSize(fs);
    doc.setFont('helvetica', 'normal');
    for (let y = 0; y < grid.height; y++) {
      for (let x = 0; x < grid.width; x++) {
        const idx = grid.data[y * grid.width + x];
        if (idx < 0 || idx >= colors.length) continue;
        const bead = colors[idx];
        const [r, g, b] = textRgb(bead);
        doc.setTextColor(r, g, b);
        doc.text(bead.code, offX + x * cell + cell / 2, offY + y * cell + cell / 2, {
          align: 'center',
          baseline: 'middle',
        });
      }
    }
  }

  // 图纸尺寸标注 (包含中文, 使用 Canvas 渲染)
  const sizeText = `尺寸: ${grid.width} × ${grid.height} 格   色卡: ${palette.name}`;
  addCanvasText(doc, sizeText, margin, pageH - margin / 2, 3.5, '#000000');

  // ---------- 第 2 页: 用量清单 ----------
  doc.addPage();
  const listTitle = `${title} — 用量清单`;
  addCanvasText(doc, listTitle, margin, margin + 4, 6, '#000000', 'left', 'bold');

  const usage = computeUsage(grid, palette);
  const lineH = 6;
  let yy = margin + 12;

  // 表头 (中文, 使用 Canvas 渲染)
  const headerFontSize = 3.5;
  const colCode = margin;
  const colName = margin + 25;
  const colEn = margin + 70;
  const colCount = margin + 120;
  const colPacks = margin + 145;

  addCanvasText(doc, '色号', colCode, yy, headerFontSize, '#000000', 'left', 'bold');
  addCanvasText(doc, '颜色名称', colName, yy, headerFontSize, '#000000', 'left', 'bold');
  addCanvasText(doc, '英文名称', colEn, yy, headerFontSize, '#000000', 'left', 'bold');
  addCanvasText(doc, '数量(颗)', colCount, yy, headerFontSize, '#000000', 'left', 'bold');
  addCanvasText(doc, `包数(每包${BEADS_PER_PACK})`, colPacks, yy, headerFontSize, '#000000', 'left', 'bold');
  yy += lineH;

  // 分隔线
  doc.setDrawColor(180, 180, 180);
  doc.line(margin, yy - 2, pageW - margin, yy - 2);

  // 数据行
  const dataFontSize = 3.2;
  for (const it of usage) {
    if (yy > pageH - margin) {
      doc.addPage();
      yy = margin + 6;
    }
    // 色号 (ASCII, 可用原生渲染, 但为统一风格也用 Canvas)
    addCanvasText(doc, it.bead.code, colCode, yy, dataFontSize, '#000000');
    // 颜色名称 (中文, 使用 Canvas 渲染)
    addCanvasText(doc, it.bead.name, colName, yy, dataFontSize, '#000000');
    // 英文名称 (ASCII)
    addCanvasText(doc, it.bead.nameEn, colEn, yy, dataFontSize, '#000000');
    // 数量 (数字)
    addCanvasText(doc, String(it.count), colCount, yy, dataFontSize, '#000000');
    // 包数 (数字)
    addCanvasText(doc, String(it.packs), colPacks, yy, dataFontSize, '#000000');
    yy += lineH;
  }

  // 总计 (中文, 使用 Canvas 渲染)
  yy += 2;
  doc.setDrawColor(180, 180, 180);
  doc.line(margin, yy - 4, pageW - margin, yy - 4);
  const total = usage.reduce((s, it) => s + it.count, 0);
  const totalPacks = usage.reduce((s, it) => s + it.packs, 0);
  const totalText = `总计: ${total} 颗  /  ${totalPacks} 包  /  ${usage.length} 种颜色`;
  addCanvasText(doc, totalText, margin, yy, 3.5, '#000000', 'left', 'bold');

  return doc.output('blob');
}
