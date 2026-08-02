// ========== 基础类型 ==========

export interface RGB {
  r: number;
  g: number;
  b: number;
}

export interface LabColor {
  L: number;
  a: number;
  b: number;
}

export type BeadBrand = 'artkal-s' | 'artkal-m' | 'perler' | 'hama' | 'mard';
export type BeadSize = '5mm' | '2.6mm' | '10mm';
export type DitherAlgorithm = 'none' | 'floyd-steinberg' | 'riemersma' | 'bayer';

// ========== 色卡类型 ==========

export interface BeadColor {
  index: number;
  code: string;
  name: string;
  nameEn: string;
  rgb: RGB;
  hex: string;
  lab: LabColor;
  brand: BeadBrand;
  size: BeadSize;
}

export interface Palette {
  id: BeadBrand;
  name: string;
  size: BeadSize;
  colors: BeadColor[];
}

// ========== 图纸类型 ==========

export interface PatternGrid {
  width: number;
  height: number;
  data: Int32Array; // 每格存储色号索引，-1 表示空
}

export interface PatternConfig {
  beadSize: BeadSize;
  brand: BeadBrand;
  width: number;
  height: number;
  dither: DitherAlgorithm;
  maxColors: number;
  removeBackground: boolean;
  backgroundThreshold: number;
  denoise: boolean;
  minArea: number;
  enhanceContours: boolean;
}

// ========== 编辑器类型 ==========

export type ToolType = 'brush' | 'eraser' | 'fill' | 'eyedropper' | 'replace' | 'hand';

export interface EditorState {
  grid: PatternGrid;
  palette: Palette;
  currentTool: ToolType;
  currentColor: number;
  showGrid: boolean;
  showColorCode: boolean;
  zoom: number;
  history: HistoryEntry[];
  historyIndex: number;
}

export interface HistoryEntry {
  before: Int32Array;
  after: Int32Array;
  action: string;
}

// ========== 用量统计 ==========

export interface UsageItem {
  bead: BeadColor;
  count: number;
  packs: number;
}

// ========== 导出选项 ==========

export interface ExportOptions {
  cellSize: number;
  showGrid: boolean;
  showColorCode: boolean;
  background: 'white' | 'transparent';
}

// ========== 项目文件 ==========

export interface ProjectFile {
  version: string;
  project: {
    id: string;
    title: string;
    createdAt: string;
    updatedAt: string;
  };
  config: PatternConfig;
  grid: {
    width: number;
    height: number;
    data: number[];
  };
}

// ========== 制作引导 ==========

export interface GuideState {
  mode: 'row' | 'color' | 'none';
  currentStep: number;
  completedSteps: Set<number>;
}

// ========== 3D 预览 ==========

export interface Preview3DConfig {
  beadSize: number;
  showHoles: boolean;
  autoRotate: boolean;
  showGrid: boolean;
}
