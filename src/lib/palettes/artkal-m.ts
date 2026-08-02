// ========== artkal-m.ts ==========
// Artkal M 系列 (2.6mm) 豆豆色卡数据
// 注意: 此处仅记录 rgb 与 hex, lab 值在 index.ts 中通过 rgbToLab 统一计算。

import type { RawBeadColor, RawPalette } from './index';

// Artkal M 系列 (2.6mm) 颜色列表 — 提供更丰富的色彩选择
export const artkalMColors: RawBeadColor[] = [
  { index: 0, code: 'M-01', name: '白色', nameEn: 'White', rgb: { r: 255, g: 255, b: 255 }, hex: '#FFFFFF', brand: 'artkal-m', size: '2.6mm' },
  { index: 1, code: 'M-02', name: '奶油色', nameEn: 'Cream', rgb: { r: 255, g: 244, b: 229 }, hex: '#FFF4E5', brand: 'artkal-m', size: '2.6mm' },
  { index: 2, code: 'M-03', name: '象牙白', nameEn: 'Ivory', rgb: { r: 255, g: 250, b: 220 }, hex: '#FFFADC', brand: 'artkal-m', size: '2.6mm' },
  { index: 3, code: 'M-04', name: '浅黄色', nameEn: 'Light Yellow', rgb: { r: 255, g: 236, b: 92 }, hex: '#FFEC5C', brand: 'artkal-m', size: '2.6mm' },
  { index: 4, code: 'M-05', name: '黄色', nameEn: 'Yellow', rgb: { r: 255, g: 213, b: 23 }, hex: '#FFD517', brand: 'artkal-m', size: '2.6mm' },
  { index: 5, code: 'M-06', name: '金黄色', nameEn: 'Gold', rgb: { r: 210, g: 170, b: 50 }, hex: '#D2AA32', brand: 'artkal-m', size: '2.6mm' },
  { index: 6, code: 'M-07', name: '芥末黄', nameEn: 'Mustard', rgb: { r: 200, g: 160, b: 30 }, hex: '#C8A01E', brand: 'artkal-m', size: '2.6mm' },
  { index: 7, code: 'M-08', name: '橙色', nameEn: 'Orange', rgb: { r: 255, g: 149, b: 0 }, hex: '#FF9500', brand: 'artkal-m', size: '2.6mm' },
  { index: 8, code: 'M-09', name: '深橙色', nameEn: 'Deep Orange', rgb: { r: 230, g: 90, b: 0 }, hex: '#E65A00', brand: 'artkal-m', size: '2.6mm' },
  { index: 9, code: 'M-10', name: '红橙色', nameEn: 'Red Orange', rgb: { r: 230, g: 60, b: 0 }, hex: '#E63C00', brand: 'artkal-m', size: '2.6mm' },
  { index: 10, code: 'M-11', name: '红色', nameEn: 'Red', rgb: { r: 227, g: 0, b: 14 }, hex: '#E3000E', brand: 'artkal-m', size: '2.6mm' },
  { index: 11, code: 'M-12', name: '深红色', nameEn: 'Deep Red', rgb: { r: 170, g: 0, b: 0 }, hex: '#AA0000', brand: 'artkal-m', size: '2.6mm' },
  { index: 12, code: 'M-13', name: '红宝石', nameEn: 'Ruby', rgb: { r: 150, g: 10, b: 30 }, hex: '#960A1E', brand: 'artkal-m', size: '2.6mm' },
  { index: 13, code: 'M-14', name: '玫瑰红', nameEn: 'Rose', rgb: { r: 200, g: 40, b: 80 }, hex: '#C82850', brand: 'artkal-m', size: '2.6mm' },
  { index: 14, code: 'M-15', name: '樱桃红', nameEn: 'Cherry', rgb: { r: 180, g: 30, b: 40 }, hex: '#B41E28', brand: 'artkal-m', size: '2.6mm' },
  { index: 15, code: 'M-16', name: '粉红色', nameEn: 'Pink', rgb: { r: 255, g: 153, b: 170 }, hex: '#FF99AA', brand: 'artkal-m', size: '2.6mm' },
  { index: 16, code: 'M-17', name: '浅粉色', nameEn: 'Light Pink', rgb: { r: 255, g: 200, b: 210 }, hex: '#FFC8D2', brand: 'artkal-m', size: '2.6mm' },
  { index: 17, code: 'M-18', name: '热粉色', nameEn: 'Hot Pink', rgb: { r: 255, g: 80, b: 140 }, hex: '#FF508C', brand: 'artkal-m', size: '2.6mm' },
  { index: 18, code: 'M-19', name: '桃色', nameEn: 'Peach', rgb: { r: 255, g: 170, b: 140 }, hex: '#FFAA8C', brand: 'artkal-m', size: '2.6mm' },
  { index: 19, code: 'M-20', name: '鲑鱼色', nameEn: 'Salmon', rgb: { r: 240, g: 130, b: 110 }, hex: '#F0826E', brand: 'artkal-m', size: '2.6mm' },
  { index: 20, code: 'M-21', name: '紫红色', nameEn: 'Magenta', rgb: { r: 200, g: 0, b: 120 }, hex: '#C80078', brand: 'artkal-m', size: '2.6mm' },
  { index: 21, code: 'M-22', name: '紫色', nameEn: 'Purple', rgb: { r: 130, g: 0, b: 160 }, hex: '#8200A0', brand: 'artkal-m', size: '2.6mm' },
  { index: 22, code: 'M-23', name: '浅紫色', nameEn: 'Light Purple', rgb: { r: 170, g: 110, b: 200 }, hex: '#AA6EC8', brand: 'artkal-m', size: '2.6mm' },
  { index: 23, code: 'M-24', name: '深紫色', nameEn: 'Dark Purple', rgb: { r: 90, g: 20, b: 120 }, hex: '#5A1478', brand: 'artkal-m', size: '2.6mm' },
  { index: 24, code: 'M-25', name: '蓝紫色', nameEn: 'Blue Violet', rgb: { r: 90, g: 70, b: 170 }, hex: '#5A46AA', brand: 'artkal-m', size: '2.6mm' },
  { index: 25, code: 'M-26', name: '薰衣草', nameEn: 'Lavender', rgb: { r: 180, g: 160, b: 220 }, hex: '#B4A0DC', brand: 'artkal-m', size: '2.6mm' },
  { index: 26, code: 'M-27', name: '蓝色', nameEn: 'Blue', rgb: { r: 0, g: 90, b: 200 }, hex: '#005AC8', brand: 'artkal-m', size: '2.6mm' },
  { index: 27, code: 'M-28', name: '浅蓝色', nameEn: 'Light Blue', rgb: { r: 100, g: 180, b: 240 }, hex: '#64B4F0', brand: 'artkal-m', size: '2.6mm' },
  { index: 28, code: 'M-29', name: '天蓝色', nameEn: 'Sky Blue', rgb: { r: 0, g: 160, b: 220 }, hex: '#00A0DC', brand: 'artkal-m', size: '2.6mm' },
  { index: 29, code: 'M-30', name: '深蓝色', nameEn: 'Dark Blue', rgb: { r: 0, g: 40, b: 120 }, hex: '#002878', brand: 'artkal-m', size: '2.6mm' },
  { index: 30, code: 'M-31', name: '海军蓝', nameEn: 'Navy', rgb: { r: 0, g: 20, b: 70 }, hex: '#001446', brand: 'artkal-m', size: '2.6mm' },
  { index: 31, code: 'M-32', name: '青色', nameEn: 'Cyan', rgb: { r: 0, g: 180, b: 210 }, hex: '#00B4D2', brand: 'artkal-m', size: '2.6mm' },
  { index: 32, code: 'M-33', name: '青绿色', nameEn: 'Teal', rgb: { r: 0, g: 150, b: 150 }, hex: '#009696', brand: 'artkal-m', size: '2.6mm' },
  { index: 33, code: 'M-34', name: '绿色', nameEn: 'Green', rgb: { r: 0, g: 150, b: 60 }, hex: '#00963C', brand: 'artkal-m', size: '2.6mm' },
  { index: 34, code: 'M-35', name: '浅绿色', nameEn: 'Light Green', rgb: { r: 120, g: 200, b: 80 }, hex: '#78C850', brand: 'artkal-m', size: '2.6mm' },
  { index: 35, code: 'M-36', name: '深绿色', nameEn: 'Dark Green', rgb: { r: 0, g: 90, b: 40 }, hex: '#005A28', brand: 'artkal-m', size: '2.6mm' },
  { index: 36, code: 'M-37', name: '黄绿色', nameEn: 'Yellow Green', rgb: { r: 160, g: 200, b: 40 }, hex: '#A0C828', brand: 'artkal-m', size: '2.6mm' },
  { index: 37, code: 'M-38', name: '橄榄绿', nameEn: 'Olive', rgb: { r: 120, g: 110, b: 30 }, hex: '#786E1E', brand: 'artkal-m', size: '2.6mm' },
  { index: 38, code: 'M-39', name: '棕色', nameEn: 'Brown', rgb: { r: 120, g: 70, b: 30 }, hex: '#78461E', brand: 'artkal-m', size: '2.6mm' },
  { index: 39, code: 'M-40', name: '浅棕色', nameEn: 'Light Brown', rgb: { r: 180, g: 130, b: 80 }, hex: '#B48250', brand: 'artkal-m', size: '2.6mm' },
  { index: 40, code: 'M-41', name: '灰色', nameEn: 'Gray', rgb: { r: 130, g: 130, b: 130 }, hex: '#828282', brand: 'artkal-m', size: '2.6mm' },
  { index: 41, code: 'M-42', name: '黑色', nameEn: 'Black', rgb: { r: 30, g: 30, b: 30 }, hex: '#1E1E1E', brand: 'artkal-m', size: '2.6mm' },
];

// Artkal M 系列色卡 (不含 lab, 由 index.ts 统一计算)
export const artkalMPalette: RawPalette = {
  id: 'artkal-m',
  name: 'Artkal M 系列 (2.6mm)',
  size: '2.6mm',
  colors: artkalMColors,
};
