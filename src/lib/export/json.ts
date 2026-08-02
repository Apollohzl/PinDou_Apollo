// ========== json.ts ==========
// 项目文件 JSON 导入/导出
// 格式遵循 ProjectFile 接口 (version / project / config / grid)

import type { PatternGrid, PatternConfig, ProjectFile } from '../types';

/** 当前项目文件版本 */
const VERSION = '1.0.0';

/** 生成一个简易的唯一 ID (优先使用 crypto.randomUUID, 不可用时回退) */
function generateId(): string {
  const g: { randomUUID?: () => string } = (globalThis as { crypto?: { randomUUID?: () => string } }).crypto ?? {};
  if (typeof g.randomUUID === 'function') {
    return g.randomUUID();
  }
  return `pid-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
}

/**
 * 将图纸导出为 JSON 字符串。
 *
 * @param grid   图纸网格
 * @param config 图纸配置
 * @param title  项目标题
 */
export function exportJSON(grid: PatternGrid, config: PatternConfig, title: string): string {
  const now = new Date().toISOString();
  const project: ProjectFile = {
    version: VERSION,
    project: {
      id: generateId(),
      title,
      createdAt: now,
      updatedAt: now,
    },
    config,
    grid: {
      width: grid.width,
      height: grid.height,
      data: Array.from(grid.data),
    },
  };
  return JSON.stringify(project, null, 2);
}

/**
 * 从 JSON 字符串导入项目。
 * 会进行基本的结构校验, 校验失败时抛出错误。
 *
 * @param json JSON 字符串
 * @returns { grid, config, title }
 */
export function importJSON(json: string): {
  grid: PatternGrid;
  config: PatternConfig;
  title: string;
} {
  let obj: unknown;
  try {
    obj = JSON.parse(json);
  } catch (e) {
    throw new Error('importJSON: JSON 解析失败 — ' + (e instanceof Error ? e.message : String(e)));
  }

  if (!obj || typeof obj !== 'object') {
    throw new Error('importJSON: 根节点不是对象');
  }
  const root = obj as Record<string, unknown>;

  // 校验 grid
  const g = root.grid as Record<string, unknown> | undefined;
  if (
    !g ||
    typeof g.width !== 'number' ||
    typeof g.height !== 'number' ||
    !Array.isArray(g.data)
  ) {
    throw new Error('importJSON: grid 字段缺失或格式不正确');
  }
  const width = g.width as number;
  const height = g.height as number;
  const rawData = g.data as unknown[];

  if (rawData.length !== width * height) {
    throw new Error(
      `importJSON: grid.data 长度(${rawData.length})与尺寸(${width}×${height}=${width * height})不匹配`
    );
  }

  const data = new Int32Array(rawData.length);
  for (let i = 0; i < rawData.length; i++) {
    const v = rawData[i];
    const n = typeof v === 'number' ? v : Number(v);
    if (!Number.isFinite(n)) {
      throw new Error(`importJSON: grid.data[${i}] 不是有效数字`);
    }
    data[i] = Math.trunc(n);
  }

  const grid: PatternGrid = { width, height, data };

  // 校验 config
  const c = root.config as Record<string, unknown> | undefined;
  if (!c || typeof c !== 'object') {
    throw new Error('importJSON: config 字段缺失');
  }
  const config = c as unknown as PatternConfig;

  // 解析标题: 兼容 project.title 与顶层 title
  let title = '未命名';
  const proj = root.project as Record<string, unknown> | undefined;
  if (proj && typeof proj.title === 'string') {
    title = proj.title;
  } else if (typeof root.title === 'string') {
    title = root.title;
  }

  return { grid, config, title };
}
