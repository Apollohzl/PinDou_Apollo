// ========== artkal-s.ts ==========
// Artkal S 系列 (5mm) 豆豆色卡数据
// 注意: 此处仅记录 rgb 与 hex, lab 值在 index.ts 中通过 rgbToLab 统一计算。

import type { RawBeadColor, RawPalette } from './index';

// Artkal S 系列 (5mm) 颜色列表
// index 与数组下标保持一致, 便于网格索引直接映射到 palette.colors[index]
export const artkalSColors: RawBeadColor[] = [
  { index: 0, code: 'S-01', name: '白色', nameEn: 'White', rgb: { r: 255, g: 255, b: 255 }, hex: '#FFFFFF', brand: 'artkal-s', size: '5mm' },
  { index: 1, code: 'S-02', name: '奶油色', nameEn: 'Cream', rgb: { r: 255, g: 244, b: 229 }, hex: '#FFF4E5', brand: 'artkal-s', size: '5mm' },
  { index: 2, code: 'S-03', name: '米色', nameEn: 'Beige', rgb: { r: 230, g: 210, b: 180 }, hex: '#E6D2B4', brand: 'artkal-s', size: '5mm' },
  { index: 3, code: 'S-04', name: '浅黄色', nameEn: 'Light Yellow', rgb: { r: 255, g: 236, b: 92 }, hex: '#FFEC5C', brand: 'artkal-s', size: '5mm' },
  { index: 4, code: 'S-05', name: '黄色', nameEn: 'Yellow', rgb: { r: 255, g: 213, b: 23 }, hex: '#FFD517', brand: 'artkal-s', size: '5mm' },
  { index: 5, code: 'S-06', name: '金黄色', nameEn: 'Gold', rgb: { r: 210, g: 170, b: 50 }, hex: '#D2AA32', brand: 'artkal-s', size: '5mm' },
  { index: 6, code: 'S-07', name: '橙色', nameEn: 'Orange', rgb: { r: 255, g: 149, b: 0 }, hex: '#FF9500', brand: 'artkal-s', size: '5mm' },
  { index: 7, code: 'S-08', name: '深橙色', nameEn: 'Deep Orange', rgb: { r: 230, g: 90, b: 0 }, hex: '#E65A00', brand: 'artkal-s', size: '5mm' },
  { index: 8, code: 'S-09', name: '红橙色', nameEn: 'Red Orange', rgb: { r: 230, g: 60, b: 0 }, hex: '#E63C00', brand: 'artkal-s', size: '5mm' },
  { index: 9, code: 'S-10', name: '红色', nameEn: 'Red', rgb: { r: 227, g: 0, b: 14 }, hex: '#E3000E', brand: 'artkal-s', size: '5mm' },
  { index: 10, code: 'S-11', name: '深红色', nameEn: 'Deep Red', rgb: { r: 170, g: 0, b: 0 }, hex: '#AA0000', brand: 'artkal-s', size: '5mm' },
  { index: 11, code: 'S-12', name: '玫瑰红', nameEn: 'Rose', rgb: { r: 200, g: 40, b: 80 }, hex: '#C82850', brand: 'artkal-s', size: '5mm' },
  { index: 12, code: 'S-13', name: '樱桃红', nameEn: 'Cherry', rgb: { r: 180, g: 30, b: 40 }, hex: '#B41E28', brand: 'artkal-s', size: '5mm' },
  { index: 13, code: 'S-14', name: '粉红色', nameEn: 'Pink', rgb: { r: 255, g: 153, b: 170 }, hex: '#FF99AA', brand: 'artkal-s', size: '5mm' },
  { index: 14, code: 'S-15', name: '浅粉色', nameEn: 'Light Pink', rgb: { r: 255, g: 200, b: 210 }, hex: '#FFC8D2', brand: 'artkal-s', size: '5mm' },
  { index: 15, code: 'S-16', name: '桃色', nameEn: 'Peach', rgb: { r: 255, g: 170, b: 140 }, hex: '#FFAA8C', brand: 'artkal-s', size: '5mm' },
  { index: 16, code: 'S-17', name: '紫红色', nameEn: 'Magenta', rgb: { r: 200, g: 0, b: 120 }, hex: '#C80078', brand: 'artkal-s', size: '5mm' },
  { index: 17, code: 'S-18', name: '紫色', nameEn: 'Purple', rgb: { r: 130, g: 0, b: 160 }, hex: '#8200A0', brand: 'artkal-s', size: '5mm' },
  { index: 18, code: 'S-19', name: '浅紫色', nameEn: 'Light Purple', rgb: { r: 170, g: 110, b: 200 }, hex: '#AA6EC8', brand: 'artkal-s', size: '5mm' },
  { index: 19, code: 'S-20', name: '蓝紫色', nameEn: 'Blue Violet', rgb: { r: 90, g: 70, b: 170 }, hex: '#5A46AA', brand: 'artkal-s', size: '5mm' },
  { index: 20, code: 'S-21', name: '薰衣草', nameEn: 'Lavender', rgb: { r: 180, g: 160, b: 220 }, hex: '#B4A0DC', brand: 'artkal-s', size: '5mm' },
  { index: 21, code: 'S-22', name: '蓝色', nameEn: 'Blue', rgb: { r: 0, g: 90, b: 200 }, hex: '#005AC8', brand: 'artkal-s', size: '5mm' },
  { index: 22, code: 'S-23', name: '浅蓝色', nameEn: 'Light Blue', rgb: { r: 100, g: 180, b: 240 }, hex: '#64B4F0', brand: 'artkal-s', size: '5mm' },
  { index: 23, code: 'S-24', name: '天蓝色', nameEn: 'Sky Blue', rgb: { r: 0, g: 160, b: 220 }, hex: '#00A0DC', brand: 'artkal-s', size: '5mm' },
  { index: 24, code: 'S-25', name: '深蓝色', nameEn: 'Dark Blue', rgb: { r: 0, g: 40, b: 120 }, hex: '#002878', brand: 'artkal-s', size: '5mm' },
  { index: 25, code: 'S-26', name: '青色', nameEn: 'Cyan', rgb: { r: 0, g: 180, b: 210 }, hex: '#00B4D2', brand: 'artkal-s', size: '5mm' },
  { index: 26, code: 'S-27', name: '青绿色', nameEn: 'Teal', rgb: { r: 0, g: 150, b: 150 }, hex: '#009696', brand: 'artkal-s', size: '5mm' },
  { index: 27, code: 'S-28', name: '绿色', nameEn: 'Green', rgb: { r: 0, g: 150, b: 60 }, hex: '#00963C', brand: 'artkal-s', size: '5mm' },
  { index: 28, code: 'S-29', name: '浅绿色', nameEn: 'Light Green', rgb: { r: 120, g: 200, b: 80 }, hex: '#78C850', brand: 'artkal-s', size: '5mm' },
  { index: 29, code: 'S-30', name: '深绿色', nameEn: 'Dark Green', rgb: { r: 0, g: 90, b: 40 }, hex: '#005A28', brand: 'artkal-s', size: '5mm' },
  { index: 30, code: 'S-31', name: '黄绿色', nameEn: 'Yellow Green', rgb: { r: 160, g: 200, b: 40 }, hex: '#A0C828', brand: 'artkal-s', size: '5mm' },
  { index: 31, code: 'S-32', name: '橄榄绿', nameEn: 'Olive', rgb: { r: 120, g: 110, b: 30 }, hex: '#786E1E', brand: 'artkal-s', size: '5mm' },
  { index: 32, code: 'S-33', name: '棕色', nameEn: 'Brown', rgb: { r: 120, g: 70, b: 30 }, hex: '#78461E', brand: 'artkal-s', size: '5mm' },
  { index: 33, code: 'S-34', name: '浅棕色', nameEn: 'Light Brown', rgb: { r: 180, g: 130, b: 80 }, hex: '#B48250', brand: 'artkal-s', size: '5mm' },
  { index: 34, code: 'S-35', name: '深棕色', nameEn: 'Dark Brown', rgb: { r: 80, g: 45, b: 20 }, hex: '#502D14', brand: 'artkal-s', size: '5mm' },
  { index: 35, code: 'S-36', name: '肉色', nameEn: 'Skin', rgb: { r: 255, g: 210, b: 170 }, hex: '#FFD2AA', brand: 'artkal-s', size: '5mm' },
  { index: 36, code: 'S-37', name: '浅灰色', nameEn: 'Light Gray', rgb: { r: 190, g: 190, b: 190 }, hex: '#BEBEBE', brand: 'artkal-s', size: '5mm' },
  { index: 37, code: 'S-38', name: '灰色', nameEn: 'Gray', rgb: { r: 130, g: 130, b: 130 }, hex: '#828282', brand: 'artkal-s', size: '5mm' },
  { index: 38, code: 'S-39', name: '深灰色', nameEn: 'Dark Gray', rgb: { r: 80, g: 80, b: 80 }, hex: '#505050', brand: 'artkal-s', size: '5mm' },
  { index: 39, code: 'S-40', name: '黑色', nameEn: 'Black', rgb: { r: 30, g: 30, b: 30 }, hex: '#1E1E1E', brand: 'artkal-s', size: '5mm' },
];

// Artkal S 系列色卡 (不含 lab, 由 index.ts 统一计算)
export const artkalSPalette: RawPalette = {
  id: 'artkal-s',
  name: 'Artkal S 系列 (5mm)',
  size: '5mm',
  colors: artkalSColors,
};
