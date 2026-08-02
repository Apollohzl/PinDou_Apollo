// ========== index.ts ==========
// 色卡管理器
// 职责:
//   1. 定义原始色卡数据类型 (RawBeadColor / RawPalette)
//   2. 导入各品牌色卡数据
//   3. 通过 rgbToLab 统一为每个颜色计算 Lab 值, 组装成完整的 Palette
//   4. 对外提供 palettes / getPalette / getAllPalettes

import type { Palette, BeadBrand, BeadColor, BeadSize, RGB, LabColor } from '../types';
import { rgbToLab } from '../image/color';
import { artkalSPalette } from './artkal-s';
import { artkalMPalette } from './artkal-m';
import { perlerPalette } from './perler';
import { hamaPalette } from './hama';
import { mardPalette } from './mard';

// ---------- 原始色卡类型 ----------
// 原始数据不含 lab (lab 在本文件统一计算), 其余字段与 BeadColor 一致。
export type RawBeadColor = Omit<BeadColor, 'lab'>;

export interface RawPalette {
  id: BeadBrand;
  name: string;
  size: BeadSize;
  colors: RawBeadColor[];
}

// ---------- Lab 计算 & Palette 组装 ----------

/**
 * 将原始色卡 (无 lab) 转换为完整 Palette。
 * 每个颜色的 lab 由其 rgb 通过 rgbToLab 实时计算。
 */
function buildPalette(raw: RawPalette): Palette {
  const colors: BeadColor[] = raw.colors.map((c) => {
    const lab: LabColor = rgbToLab(c.rgb as RGB);
    return { ...c, lab };
  });
  return {
    id: raw.id,
    name: raw.name,
    size: raw.size,
    colors,
  };
}

// 一次性构建所有品牌的完整色卡 (含 lab)
const _palettes: Record<BeadBrand, Palette> = {
  'artkal-s': buildPalette(artkalSPalette),
  'artkal-m': buildPalette(artkalMPalette),
  perler: buildPalette(perlerPalette),
  hama: buildPalette(hamaPalette),
  mard: buildPalette(mardPalette),
};

/** 所有品牌色卡 (按品牌索引) */
export const palettes: Record<BeadBrand, Palette> = _palettes;

/** 根据品牌获取色卡 */
export function getPalette(brand: BeadBrand): Palette {
  return _palettes[brand];
}

/** 获取所有色卡列表 */
export function getAllPalettes(): Palette[] {
  return [
    _palettes['mard'],
    _palettes['artkal-s'],
    _palettes['artkal-m'],
    _palettes['perler'],
    _palettes['hama'],
  ];
}
