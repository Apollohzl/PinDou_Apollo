// ========== pdf.ts ==========
// PDF 导出: 使用 jsPDF 生成包含图纸页与用量清单页的 PDF
//
// 约定: grid.data 中的值是 palette.colors 的数组下标, -1 表示空格。

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
  doc.setFontSize(16);
  doc.setTextColor(0, 0, 0);
  doc.text(title, margin, margin + 2);

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

  // 色号 (格子足够大时才绘制, 避免重叠)
  if (cell >= 6) {
    const fs = Math.max(3, cell * 0.3);
    doc.setFontSize(fs);
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

  // 图纸尺寸标注
  doc.setTextColor(0, 0, 0);
  doc.setFontSize(9);
  doc.text(
    `尺寸: ${grid.width} × ${grid.height} 格   色卡: ${palette.name}`,
    margin,
    pageH - margin / 2
  );

  // ---------- 第 2 页: 用量清单 ----------
  doc.addPage();
  doc.setFontSize(16);
  doc.text(`${title} — 用量清单`, margin, margin + 2);

  const usage = computeUsage(grid, palette);
  const lineH = 6;
  let yy = margin + 12;

  // 表头
  doc.setFontSize(10);
  doc.setTextColor(0, 0, 0);
  const colCode = margin;
  const colName = margin + 25;
  const colEn = margin + 70;
  const colCount = margin + 120;
  const colPacks = margin + 145;

  doc.text('色号', colCode, yy);
  doc.text('颜色名称', colName, yy);
  doc.text('英文名称', colEn, yy);
  doc.text('数量(颗)', colCount, yy);
  doc.text(`包数(每包${BEADS_PER_PACK})`, colPacks, yy);
  yy += lineH;

  // 分隔线
  doc.setDrawColor(180, 180, 180);
  doc.line(margin, yy - 2, pageW - margin, yy - 2);

  for (const it of usage) {
    if (yy > pageH - margin) {
      doc.addPage();
      yy = margin + 6;
    }
    doc.text(it.bead.code, colCode, yy);
    doc.text(it.bead.name, colName, yy);
    doc.text(it.bead.nameEn, colEn, yy);
    doc.text(String(it.count), colCount, yy);
    doc.text(String(it.packs), colPacks, yy);
    yy += lineH;
  }

  // 总计
  yy += 2;
  doc.setDrawColor(180, 180, 180);
  doc.line(margin, yy - 4, pageW - margin, yy - 4);
  const total = usage.reduce((s, it) => s + it.count, 0);
  const totalPacks = usage.reduce((s, it) => s + it.packs, 0);
  doc.text(
    `总计: ${total} 颗  /  ${totalPacks} 包  /  ${usage.length} 种颜色`,
    margin,
    yy
  );

  return doc.output('blob');
}
