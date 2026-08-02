// ========== perler.ts ==========
// Perler 系列 (5mm) 豆豆色卡数据
// 注意: 此处仅记录 rgb 与 hex, lab 值在 index.ts 中通过 rgbToLab 统一计算。

import type { RawBeadColor, RawPalette } from './index';

// Perler 系列 (5mm) 颜色列表
export const perlerColors: RawBeadColor[] = [
  { index: 0, code: 'P-01', name: '白色', nameEn: 'White', rgb: { r: 255, g: 255, b: 255 }, hex: '#FFFFFF', brand: 'perler', size: '5mm' },
  { index: 1, code: 'P-02', name: '奶油色', nameEn: 'Cream', rgb: { r: 255, g: 244, b: 229 }, hex: '#FFF4E5', brand: 'perler', size: '5mm' },
  { index: 2, code: 'P-03', name: '浅黄色', nameEn: 'Light Yellow', rgb: { r: 255, g: 236, b: 92 }, hex: '#FFEC5C', brand: 'perler', size: '5mm' },
  { index: 3, code: 'P-04', name: '黄色', nameEn: 'Yellow', rgb: { r: 255, g: 213, b: 23 }, hex: '#FFD517', brand: 'perler', size: '5mm' },
  { index: 4, code: 'P-05', name: '芥末黄', nameEn: 'Butterscotch', rgb: { r: 200, g: 160, b: 30 }, hex: '#C8A01E', brand: 'perler', size: '5mm' },
  { index: 5, code: 'P-06', name: '橙色', nameEn: 'Orange', rgb: { r: 255, g: 149, b: 0 }, hex: '#FF9500', brand: 'perler', size: '5mm' },
  { index: 6, code: 'P-07', name: '锈色', nameEn: 'Rust', rgb: { r: 180, g: 70, b: 20 }, hex: '#B44614', brand: 'perler', size: '5mm' },
  { index: 7, code: 'P-08', name: '红色', nameEn: 'Red', rgb: { r: 227, g: 0, b: 14 }, hex: '#E3000E', brand: 'perler', size: '5mm' },
  { index: 8, code: 'P-09', name: '深红色', nameEn: 'Dark Red', rgb: { r: 170, g: 0, b: 0 }, hex: '#AA0000', brand: 'perler', size: '5mm' },
  { index: 9, code: 'P-10', name: '粉红色', nameEn: 'Pink', rgb: { r: 255, g: 153, b: 170 }, hex: '#FF99AA', brand: 'perler', size: '5mm' },
  { index: 10, code: 'P-11', name: '热珊瑚色', nameEn: 'Hot Coral', rgb: { r: 255, g: 90, b: 110 }, hex: '#FF5A6E', brand: 'perler', size: '5mm' },
  { index: 11, code: 'P-12', name: '紫红色', nameEn: 'Magenta', rgb: { r: 200, g: 0, b: 120 }, hex: '#C80078', brand: 'perler', size: '5mm' },
  { index: 12, code: 'P-13', name: '紫色', nameEn: 'Purple', rgb: { r: 130, g: 0, b: 160 }, hex: '#8200A0', brand: 'perler', size: '5mm' },
  { index: 13, code: 'P-14', name: '浅紫色', nameEn: 'Light Purple', rgb: { r: 170, g: 110, b: 200 }, hex: '#AA6EC8', brand: 'perler', size: '5mm' },
  { index: 14, code: 'P-15', name: '蓝色', nameEn: 'Blue', rgb: { r: 0, g: 90, b: 200 }, hex: '#005AC8', brand: 'perler', size: '5mm' },
  { index: 15, code: 'P-16', name: '浅蓝色', nameEn: 'Light Blue', rgb: { r: 100, g: 180, b: 240 }, hex: '#64B4F0', brand: 'perler', size: '5mm' },
  { index: 16, code: 'P-17', name: '深蓝色', nameEn: 'Dark Blue', rgb: { r: 0, g: 40, b: 120 }, hex: '#002878', brand: 'perler', size: '5mm' },
  { index: 17, code: 'P-18', name: '青色', nameEn: 'Cyan', rgb: { r: 0, g: 180, b: 210 }, hex: '#00B4D2', brand: 'perler', size: '5mm' },
  { index: 18, code: 'P-19', name: '绿色', nameEn: 'Green', rgb: { r: 0, g: 150, b: 60 }, hex: '#00963C', brand: 'perler', size: '5mm' },
  { index: 19, code: 'P-20', name: '猕猴桃绿', nameEn: 'Kiwi Lime', rgb: { r: 160, g: 210, b: 60 }, hex: '#A0D23C', brand: 'perler', size: '5mm' },
  { index: 20, code: 'P-21', name: '深绿色', nameEn: 'Dark Green', rgb: { r: 0, g: 90, b: 40 }, hex: '#005A28', brand: 'perler', size: '5mm' },
  { index: 21, code: 'P-22', name: '棕色', nameEn: 'Brown', rgb: { r: 120, g: 70, b: 30 }, hex: '#78461E', brand: 'perler', size: '5mm' },
  { index: 22, code: 'P-23', name: '浅棕色', nameEn: 'Light Brown', rgb: { r: 180, g: 130, b: 80 }, hex: '#B48250', brand: 'perler', size: '5mm' },
  { index: 23, code: 'P-24', name: '沙色', nameEn: 'Sand', rgb: { r: 210, g: 180, b: 130 }, hex: '#D2B482', brand: 'perler', size: '5mm' },
  { index: 24, code: 'P-25', name: '灰色', nameEn: 'Gray', rgb: { r: 130, g: 130, b: 130 }, hex: '#828282', brand: 'perler', size: '5mm' },
  { index: 25, code: 'P-26', name: '珍珠灰', nameEn: 'Pearl Gray', rgb: { r: 90, g: 90, b: 100 }, hex: '#5A5A64', brand: 'perler', size: '5mm' },
  { index: 26, code: 'P-27', name: '黑色', nameEn: 'Black', rgb: { r: 30, g: 30, b: 30 }, hex: '#1E1E1E', brand: 'perler', size: '5mm' },
  { index: 27, code: 'P-28', name: '桃色', nameEn: 'Peach', rgb: { r: 255, g: 170, b: 140 }, hex: '#FFAA8C', brand: 'perler', size: '5mm' },
  { index: 28, code: 'P-29', name: '蓝紫色', nameEn: 'Blue Violet', rgb: { r: 90, g: 70, b: 170 }, hex: '#5A46AA', brand: 'perler', size: '5mm' },
  { index: 29, code: 'P-30', name: '黄绿色', nameEn: 'Yellow Green', rgb: { r: 160, g: 200, b: 40 }, hex: '#A0C828', brand: 'perler', size: '5mm' },
];

// Perler 系列色卡 (不含 lab, 由 index.ts 统一计算)
export const perlerPalette: RawPalette = {
  id: 'perler',
  name: 'Perler 系列 (5mm)',
  size: '5mm',
  colors: perlerColors,
};
