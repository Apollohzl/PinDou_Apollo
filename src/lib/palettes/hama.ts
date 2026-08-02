// ========== hama.ts ==========
// Hama 系列 (5mm) 豆豆色卡数据
// 注意: 此处仅记录 rgb 与 hex, lab 值在 index.ts 中通过 rgbToLab 统一计算。

import type { RawBeadColor, RawPalette } from './index';

// Hama 系列 (5mm) 颜色列表
export const hamaColors: RawBeadColor[] = [
  { index: 0, code: 'H-01', name: '白色', nameEn: 'White', rgb: { r: 255, g: 255, b: 255 }, hex: '#FFFFFF', brand: 'hama', size: '5mm' },
  { index: 1, code: 'H-02', name: '奶油色', nameEn: 'Cream', rgb: { r: 255, g: 244, b: 229 }, hex: '#FFF4E5', brand: 'hama', size: '5mm' },
  { index: 2, code: 'H-03', name: '黄色', nameEn: 'Yellow', rgb: { r: 255, g: 213, b: 23 }, hex: '#FFD517', brand: 'hama', size: '5mm' },
  { index: 3, code: 'H-04', name: '橙色', nameEn: 'Orange', rgb: { r: 255, g: 149, b: 0 }, hex: '#FF9500', brand: 'hama', size: '5mm' },
  { index: 4, code: 'H-05', name: '红色', nameEn: 'Red', rgb: { r: 227, g: 0, b: 14 }, hex: '#E3000E', brand: 'hama', size: '5mm' },
  { index: 5, code: 'H-06', name: '浅红色', nameEn: 'Light Red', rgb: { r: 230, g: 80, b: 80 }, hex: '#E65050', brand: 'hama', size: '5mm' },
  { index: 6, code: 'H-07', name: '粉色', nameEn: 'Pink', rgb: { r: 255, g: 153, b: 170 }, hex: '#FF99AA', brand: 'hama', size: '5mm' },
  { index: 7, code: 'H-08', name: '紫色', nameEn: 'Purple', rgb: { r: 130, g: 0, b: 160 }, hex: '#8200A0', brand: 'hama', size: '5mm' },
  { index: 8, code: 'H-09', name: '浅紫色', nameEn: 'Lavender', rgb: { r: 180, g: 160, b: 220 }, hex: '#B4A0DC', brand: 'hama', size: '5mm' },
  { index: 9, code: 'H-10', name: '蓝色', nameEn: 'Blue', rgb: { r: 0, g: 90, b: 200 }, hex: '#005AC8', brand: 'hama', size: '5mm' },
  { index: 10, code: 'H-11', name: '浅蓝色', nameEn: 'Light Blue', rgb: { r: 100, g: 180, b: 240 }, hex: '#64B4F0', brand: 'hama', size: '5mm' },
  { index: 11, code: 'H-12', name: '深蓝色', nameEn: 'Dark Blue', rgb: { r: 0, g: 40, b: 120 }, hex: '#002878', brand: 'hama', size: '5mm' },
  { index: 12, code: 'H-13', name: '绿色', nameEn: 'Green', rgb: { r: 0, g: 150, b: 60 }, hex: '#00963C', brand: 'hama', size: '5mm' },
  { index: 13, code: 'H-14', name: '浅绿色', nameEn: 'Light Green', rgb: { r: 120, g: 200, b: 80 }, hex: '#78C850', brand: 'hama', size: '5mm' },
  { index: 14, code: 'H-15', name: '深绿色', nameEn: 'Dark Green', rgb: { r: 0, g: 90, b: 40 }, hex: '#005A28', brand: 'hama', size: '5mm' },
  { index: 15, code: 'H-16', name: '棕色', nameEn: 'Brown', rgb: { r: 120, g: 70, b: 30 }, hex: '#78461E', brand: 'hama', size: '5mm' },
  { index: 16, code: 'H-17', name: '浅棕色', nameEn: 'Light Brown', rgb: { r: 180, g: 130, b: 80 }, hex: '#B48250', brand: 'hama', size: '5mm' },
  { index: 17, code: 'H-18', name: '灰色', nameEn: 'Gray', rgb: { r: 130, g: 130, b: 130 }, hex: '#828282', brand: 'hama', size: '5mm' },
  { index: 18, code: 'H-19', name: '黑色', nameEn: 'Black', rgb: { r: 30, g: 30, b: 30 }, hex: '#1E1E1E', brand: 'hama', size: '5mm' },
  { index: 19, code: 'H-20', name: '桃色', nameEn: 'Peach', rgb: { r: 255, g: 170, b: 140 }, hex: '#FFAA8C', brand: 'hama', size: '5mm' },
  { index: 20, code: 'H-21', name: '青绿色', nameEn: 'Teal', rgb: { r: 0, g: 150, b: 150 }, hex: '#009696', brand: 'hama', size: '5mm' },
  { index: 21, code: 'H-22', name: '紫红色', nameEn: 'Magenta', rgb: { r: 200, g: 0, b: 120 }, hex: '#C80078', brand: 'hama', size: '5mm' },
  { index: 22, code: 'H-23', name: '橄榄绿', nameEn: 'Olive', rgb: { r: 120, g: 110, b: 30 }, hex: '#786E1E', brand: 'hama', size: '5mm' },
  { index: 23, code: 'H-24', name: '金色', nameEn: 'Gold', rgb: { r: 210, g: 170, b: 50 }, hex: '#D2AA32', brand: 'hama', size: '5mm' },
  { index: 24, code: 'H-25', name: '银色', nameEn: 'Silver', rgb: { r: 200, g: 200, b: 205 }, hex: '#C8C8CD', brand: 'hama', size: '5mm' },
];

// Hama 系列色卡 (不含 lab, 由 index.ts 统一计算)
export const hamaPalette: RawPalette = {
  id: 'hama',
  name: 'Hama 系列 (5mm)',
  size: '5mm',
  colors: hamaColors,
};
