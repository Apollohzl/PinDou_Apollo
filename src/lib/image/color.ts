// ========== color.ts ==========
// 色彩空间转换与色差计算
// 包含: RGB <-> Lab, RGB <-> Hex, CIEDE2000 色差, 豆子色号匹配

import type { RGB, LabColor, BeadColor } from '../types';

// ---------- 基础工具 ----------

/** 将 0-255 的数值钳制到合法范围 */
function clamp255(v: number): number {
  if (v < 0) return 0;
  if (v > 255) return 255;
  return v;
}

/** 将单个 sRGB 通道 (0-255) 转换为线性光 (0-1) */
function srgbToLinear(c: number): number {
  const cs = c / 255;
  return cs <= 0.04045 ? cs / 12.92 : Math.pow((cs + 0.055) / 1.055, 2.4);
}

/**
 * atan2 结果转 0-360 度。
 * 当 x=y=0 时返回 0（无意义但避免 NaN）。
 */
function atan2deg(y: number, x: number): number {
  if (y === 0 && x === 0) return 0;
  let deg = (Math.atan2(y, x) * 180) / Math.PI;
  if (deg < 0) deg += 360;
  return deg;
}

// ---------- RGB <-> Hex ----------

/** RGB 转 Hex 字符串 (#rrggbb) */
export function rgbToHex(rgb: RGB): string {
  const toHex = (n: number): string => {
    const clamped = clamp255(Math.round(n));
    return clamped.toString(16).padStart(2, '0');
  };
  return `#${toHex(rgb.r)}${toHex(rgb.g)}${toHex(rgb.b)}`;
}

/** Hex 字符串转 RGB，支持 #rgb 与 #rrggbb 形式 */
export function hexToRgb(hex: string): RGB {
  let h = hex.replace('#', '').trim();
  if (h.length === 3) {
    h = h
      .split('')
      .map((c) => c + c)
      .join('');
  }
  if (h.length !== 6 || /[^0-9a-fA-F]/.test(h)) {
    throw new Error(`Invalid hex color: ${hex}`);
  }
  const r = parseInt(h.slice(0, 2), 16);
  const g = parseInt(h.slice(2, 4), 16);
  const b = parseInt(h.slice(4, 6), 16);
  return { r, g, b };
}

// ---------- RGB -> Lab ----------

/**
 * 将 RGB (0-255) 转换为 CIE L*a*b* 色彩空间 (D65 参考白)。
 * 使用 sRGB -> 线性 RGB -> XYZ (D65) -> Lab 的标准流程。
 */
export function rgbToLab(rgb: RGB): LabColor {
  const r = srgbToLinear(clamp255(rgb.r));
  const g = srgbToLinear(clamp255(rgb.g));
  const b = srgbToLinear(clamp255(rgb.b));

  // sRGB (线性) -> XYZ, 使用 D65 矩阵
  let x = r * 0.4124564 + g * 0.3575761 + b * 0.1804375;
  let y = r * 0.2126729 + g * 0.7151522 + b * 0.072175;
  let z = r * 0.0193339 + g * 0.119192 + b * 0.9503041;

  // D65 参考白点
  const Xn = 0.95047;
  const Yn = 1.0;
  const Zn = 1.08883;

  x /= Xn;
  y /= Yn;
  z /= Zn;

  const eps = 0.008856; // (6/29)^3
  const fx = x > eps ? Math.cbrt(x) : 7.787 * x + 16 / 116;
  const fy = y > eps ? Math.cbrt(y) : 7.787 * y + 16 / 116;
  const fz = z > eps ? Math.cbrt(z) : 7.787 * z + 16 / 116;

  return {
    L: 116 * fy - 16,
    a: 500 * (fx - fy),
    b: 200 * (fy - fz),
  };
}

// ---------- CIEDE2000 色差 ----------

/**
 * CIEDE2000 色差公式 (完整实现)。
 * 参考标准: Sharma, Wu, Dalal (2005) "The CIEDE2000 Color-Difference Formula"
 * 返回值越小表示两颜色越接近。kL=kC=kH=1 (标准条件)。
 */
export function ciede2000(lab1: LabColor, lab2: LabColor): number {
  const L1 = lab1.L;
  const a1 = lab1.a;
  const b1 = lab1.b;
  const L2 = lab2.L;
  const a2 = lab2.a;
  const b2 = lab2.b;

  const kL = 1;
  const kC = 1;
  const kH = 1;

  // 1. C_i 与 C_bar
  const C1 = Math.sqrt(a1 * a1 + b1 * b1);
  const C2 = Math.sqrt(a2 * a2 + b2 * b2);
  const Cbar = (C1 + C2) / 2;

  // 2. G 因子
  const Cbar7 = Math.pow(Cbar, 7);
  const pow25_7 = Math.pow(25, 7);
  const G = 0.5 * (1 - Math.sqrt(Cbar7 / (Cbar7 + pow25_7)));

  // 3. a'
  const a1p = (1 + G) * a1;
  const a2p = (1 + G) * a2;

  // 4. C' 与 h'
  const C1p = Math.sqrt(a1p * a1p + b1 * b1);
  const C2p = Math.sqrt(a2p * a2p + b2 * b2);
  const h1p = atan2deg(b1, a1p);
  const h2p = atan2deg(b2, a2p);

  // 5. ΔL'
  const dLp = L2 - L1;

  // 6. ΔC'
  const dCp = C2p - C1p;

  // 7. Δh'
  let dhp: number;
  if (C1p * C2p === 0) {
    dhp = 0;
  } else {
    const diff = h2p - h1p;
    if (Math.abs(diff) <= 180) {
      dhp = diff;
    } else if (diff > 180) {
      dhp = diff - 360;
    } else {
      dhp = diff + 360;
    }
  }

  // 8. ΔH'
  const dHp = 2 * Math.sqrt(C1p * C2p) * Math.sin((dhp * Math.PI) / 180 / 2);

  // 9. L_bar', C_bar'
  const Lbarp = (L1 + L2) / 2;
  const Cbarp = (C1p + C2p) / 2;

  // 10. h_bar'
  let hbarp: number;
  if (C1p * C2p === 0) {
    hbarp = h1p + h2p;
  } else {
    const absDiff = Math.abs(h1p - h2p);
    if (absDiff <= 180) {
      hbarp = (h1p + h2p) / 2;
    } else if (h1p + h2p < 360) {
      hbarp = (h1p + h2p + 360) / 2;
    } else {
      hbarp = (h1p + h2p - 360) / 2;
    }
  }

  // 11. T
  const T =
    1 -
    0.17 * Math.cos(((hbarp - 30) * Math.PI) / 180) +
    0.24 * Math.cos((2 * hbarp * Math.PI) / 180) +
    0.32 * Math.cos(((3 * hbarp + 6) * Math.PI) / 180) -
    0.2 * Math.cos(((4 * hbarp - 63) * Math.PI) / 180);

  // 12. Δθ
  const dTheta = 30 * Math.exp(-Math.pow((hbarp - 275) / 25, 2));

  // 13. R_C
  const Cbarp7 = Math.pow(Cbarp, 7);
  const RC = 2 * Math.sqrt(Cbarp7 / (Cbarp7 + pow25_7));

  // 14. S_L, S_C, S_H
  const SL = 1 + (0.015 * Math.pow(Lbarp - 50, 2)) / Math.sqrt(20 + Math.pow(Lbarp - 50, 2));
  const SC = 1 + 0.045 * Cbarp;
  const SH = 1 + 0.015 * Cbarp * T;

  // 15. R_T
  const RT = -Math.sin((2 * dTheta * Math.PI) / 180) * RC;

  // 16. ΔE
  const termL = dLp / (kL * SL);
  const termC = dCp / (kC * SC);
  const termH = dHp / (kH * SH);

  return Math.sqrt(termL * termL + termC * termC + termH * termH + RT * termC * termH);
}

// ---------- 豆子色号匹配 ----------

/**
 * 在豆子调色板中找到与给定像素颜色最接近的豆子色号。
 * 使用 CIEDE2000 色差作为匹配依据, 直接使用调色板预计算的 Lab 值。
 */
export function matchBeadColor(pixelRgb: RGB, palette: BeadColor[]): BeadColor {
  if (palette.length === 0) {
    throw new Error('matchBeadColor: 调色板为空');
  }

  const pixelLab = rgbToLab(pixelRgb);
  let best = palette[0];
  let bestDist = Infinity;

  for (let i = 0; i < palette.length; i++) {
    const bead = palette[i];
    const dist = ciede2000(pixelLab, bead.lab);
    if (dist < bestDist) {
      bestDist = dist;
      best = bead;
    }
  }

  return best;
}
