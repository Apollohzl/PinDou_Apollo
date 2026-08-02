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

// ---------- 原始色卡类型 ----------
// 原始数据不含 lab (lab 在本文件统一计算), 其余字段与 BeadColor 一致。
export type RawBeadColor = Omit<BeadColor, 'lab'>;

export interface RawPalette {
  id: BeadBrand;
  name: string;
  size: BeadSize;
  colors: RawBeadColor[];
}

// ---------- Mard 色卡 (内置) ----------
// BeadBrand 包含 'mard', 为保证 Record<BeadBrand, Palette> 完整, 在此内置一份基础色卡。
const mardColors: RawBeadColor[] = [
  { index: 0, code: 'D-01', name: '白色', nameEn: 'White', rgb: { r: 255, g: 255, b: 255 }, hex: '#FFFFFF', brand: 'mard', size: '5mm' },
  { index: 1, code: 'D-02', name: '奶油色', nameEn: 'Cream', rgb: { r: 255, g: 244, b: 229 }, hex: '#FFF4E5', brand: 'mard', size: '5mm' },
  { index: 2, code: 'D-03', name: '黄色', nameEn: 'Yellow', rgb: { r: 255, g: 213, b: 23 }, hex: '#FFD517', brand: 'mard', size: '5mm' },
  { index: 3, code: 'D-04', name: '橙色', nameEn: 'Orange', rgb: { r: 255, g: 149, b: 0 }, hex: '#FF9500', brand: 'mard', size: '5mm' },
  { index: 4, code: 'D-05', name: '红色', nameEn: 'Red', rgb: { r: 227, g: 0, b: 14 }, hex: '#E3000E', brand: 'mard', size: '5mm' },
  { index: 5, code: 'D-06', name: '粉红色', nameEn: 'Pink', rgb: { r: 255, g: 153, b: 170 }, hex: '#FF99AA', brand: 'mard', size: '5mm' },
  { index: 6, code: 'D-07', name: '紫色', nameEn: 'Purple', rgb: { r: 130, g: 0, b: 160 }, hex: '#8200A0', brand: 'mard', size: '5mm' },
  { index: 7, code: 'D-08', name: '蓝色', nameEn: 'Blue', rgb: { r: 0, g: 90, b: 200 }, hex: '#005AC8', brand: 'mard', size: '5mm' },
  { index: 8, code: 'D-09', name: '浅蓝色', nameEn: 'Light Blue', rgb: { r: 100, g: 180, b: 240 }, hex: '#64B4F0', brand: 'mard', size: '5mm' },
  { index: 9, code: 'D-10', name: '绿色', nameEn: 'Green', rgb: { r: 0, g: 150, b: 60 }, hex: '#00963C', brand: 'mard', size: '5mm' },
  { index: 10, code: 'D-11', name: '棕色', nameEn: 'Brown', rgb: { r: 120, g: 70, b: 30 }, hex: '#78461E', brand: 'mard', size: '5mm' },
  { index: 11, code: 'D-12', name: '灰色', nameEn: 'Gray', rgb: { r: 130, g: 130, b: 130 }, hex: '#828282', brand: 'mard', size: '5mm' },
  { index: 12, code: 'D-13', name: '黑色', nameEn: 'Black', rgb: { r: 30, g: 30, b: 30 }, hex: '#1E1E1E', brand: 'mard', size: '5mm' },
];

const mardPalette: RawPalette = {
  id: 'mard',
  name: 'Mard 系列 (5mm)',
  size: '5mm',
  colors: mardColors,
};

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
    _palettes['artkal-s'],
    _palettes['artkal-m'],
    _palettes['perler'],
    _palettes['hama'],
    _palettes['mard'],
  ];
}
