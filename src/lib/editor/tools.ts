// ========== tools.ts ==========
// 编辑器绘图工具
// 支持: brush(画笔) / eraser(橡皮) / fill(油漆桶) / eyedropper(取色器) / replace(全局替换)
//
// 约定:
//   - grid.data 中的值是 palette 数组的下标, -1 表示空格
//   - 所有工具都返回新的 PatternGrid (不可变), 便于历史记录与 React 状态更新
//   - 取色器(eyedropper)不修改网格, 实际取色请使用 pickColorAt

import type { PatternGrid, ToolType, BeadColor } from '../types';

/** 判断坐标是否在网格范围内 */
function inBounds(grid: PatternGrid, x: number, y: number): boolean {
  return x >= 0 && y >= 0 && x < grid.width && y < grid.height;
}

/** 复制网格 (浅拷贝 data, 修改不影响原网格) */
function cloneGrid(grid: PatternGrid): PatternGrid {
  return {
    width: grid.width,
    height: grid.height,
    data: grid.data.slice(),
  };
}

/** 校验颜色索引是否在调色板有效范围内 */
function isValidColor(colorIndex: number, palette: BeadColor[]): boolean {
  return colorIndex >= 0 && colorIndex < palette.length;
}

/**
 * 应用绘图工具到网格, 返回新的 PatternGrid。
 *
 * @param grid        原始网格
 * @param tool        工具类型
 * @param x           目标格 x 坐标
 * @param y           目标格 y 坐标
 * @param colorIndex  当前颜色 (palette 下标); eraser 忽略此参数
 * @param palette     调色板 (用于校验 colorIndex 有效性)
 */
export function applyTool(
  grid: PatternGrid,
  tool: ToolType,
  x: number,
  y: number,
  colorIndex: number,
  palette: BeadColor[]
): PatternGrid {
  const next = cloneGrid(grid);

  // 越界: 直接返回副本
  if (!inBounds(next, x, y)) {
    return next;
  }

  const w = next.width;
  const pos = y * w + x;

  switch (tool) {
    case 'brush': {
      // 画笔: 在 (x,y) 设置 colorIndex (需为有效颜色)
      if (isValidColor(colorIndex, palette)) {
        next.data[pos] = colorIndex;
      }
      break;
    }

    case 'eraser': {
      // 橡皮: 在 (x,y) 设为 -1 (空格)
      next.data[pos] = -1;
      break;
    }

    case 'fill': {
      // 油漆桶: 4 连通区域填充
      if (!isValidColor(colorIndex, palette)) {
        break;
      }
      const target = next.data[pos];
      if (target === colorIndex) {
        break; // 同色无需填充
      }
      const stack: Array<[number, number]> = [[x, y]];
      while (stack.length > 0) {
        const [cx, cy] = stack.pop()!;
        if (!inBounds(next, cx, cy)) continue;
        const p = cy * w + cx;
        if (next.data[p] !== target) continue;
        next.data[p] = colorIndex;
        stack.push([cx + 1, cy]);
        stack.push([cx - 1, cy]);
        stack.push([cx, cy + 1]);
        stack.push([cx, cy - 1]);
      }
      break;
    }

    case 'replace': {
      // 全局替换: 将所有与 (x,y) 颜色相同的格子替换为 colorIndex
      if (!isValidColor(colorIndex, palette)) {
        break;
      }
      const target = next.data[pos];
      if (target === colorIndex) {
        break; // 目标色与新色相同, 无需替换
      }
      const len = next.data.length;
      for (let i = 0; i < len; i++) {
        if (next.data[i] === target) {
          next.data[i] = colorIndex;
        }
      }
      break;
    }

    case 'eyedropper': {
      // 取色器: 不修改网格, 取色请使用 pickColorAt
      break;
    }

    default: {
      // 未知工具, 不做任何修改
      break;
    }
  }

  return next;
}

/**
 * 取色器: 返回 (x,y) 处的颜色索引, 空格或越界返回 -1。
 */
export function pickColorAt(grid: PatternGrid, x: number, y: number): number {
  if (!inBounds(grid, x, y)) {
    return -1;
  }
  return grid.data[y * grid.width + x];
}

/**
 * 创建一个全空的网格 (所有格子为 -1)。
 */
export function createEmptyGrid(width: number, height: number): PatternGrid {
  return {
    width,
    height,
    data: new Int32Array(width * height).fill(-1),
  };
}

/**
 * 调整网格尺寸: 保留重叠区域的原有内容, 新增区域为 -1。
 */
export function resizeGrid(grid: PatternGrid, newWidth: number, newHeight: number): PatternGrid {
  const next = createEmptyGrid(newWidth, newHeight);
  const copyW = Math.min(grid.width, newWidth);
  const copyH = Math.min(grid.height, newHeight);
  for (let y = 0; y < copyH; y++) {
    for (let x = 0; x < copyW; x++) {
      next.data[y * newWidth + x] = grid.data[y * grid.width + x];
    }
  }
  return next;
}
