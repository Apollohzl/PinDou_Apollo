// ========== excel.ts ==========
// Excel 导出: 使用 xlsx 库导出用量清单 (xlsx 工作簿)
//
// 约定: grid.data 中的值是 palette.colors 的数组下标, -1 表示空格。

import * as XLSX from 'xlsx';
import type { PatternGrid, Palette, UsageItem } from '../types';

/** 每包豆子数量 (用于估算包数) */
const BEADS_PER_PACK = 1000;

/**
 * 统计图纸中各颜色的用量。
 * 结果按用量从多到少排序。
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

/**
 * 导出用量清单为 xlsx Blob。
 *
 * @param grid    图纸网格
 * @param palette 色卡
 * @param title   项目标题 (写入工作表首行标题区)
 */
export async function exportExcel(
  grid: PatternGrid,
  palette: Palette,
  title: string
): Promise<Blob> {
  const usage = computeUsage(grid, palette);

  // 以二维数组构建工作表, 便于控制表头与列宽
  const aoa: (string | number)[][] = [];
  aoa.push([`${title} — 用量清单`]);
  aoa.push([]);
  aoa.push(['色号', '颜色名称', '英文名称', '数量(颗)', `包数(每包${BEADS_PER_PACK})`]);

  for (const it of usage) {
    aoa.push([it.bead.code, it.bead.name, it.bead.nameEn, it.count, it.packs]);
  }

  const total = usage.reduce((s, it) => s + it.count, 0);
  const totalPacks = usage.reduce((s, it) => s + it.packs, 0);
  aoa.push([]);
  aoa.push(['总计', '', '', total, totalPacks]);
  aoa.push([]);
  aoa.push(['颜色种类', usage.length, '图纸尺寸', `${grid.width} × ${grid.height}`]);

  const ws = XLSX.utils.aoa_to_sheet(aoa);

  // 列宽
  ws['!cols'] = [
    { wch: 12 },
    { wch: 16 },
    { wch: 18 },
    { wch: 12 },
    { wch: 18 },
    { wch: 14 },
    { wch: 14 },
  ];

  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, '用量清单');

  const arr = XLSX.write(wb, { type: 'array', bookType: 'xlsx' });
  return new Blob([arr], {
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  });
}
