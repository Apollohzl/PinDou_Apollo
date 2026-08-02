// ========== PatternCanvas.tsx ==========
// Canvas 渲染图纸网格: 支持网格线、色号、缩放、鼠标编辑、高亮
// 支持拖拽平移模式 (panMode): 点击拖拽滚动容器, 适用于制作引导页和编辑页抓取工具
// 支持序号标注 (showAxisNumbers): 四边外显示灰色序号格, 序号从1开始递增

import React, { useEffect, useRef, useCallback } from 'react';
import type { PatternGrid, Palette, BeadColor } from '../lib/types';

interface PatternCanvasProps {
  grid: PatternGrid;
  palette: Palette;
  showGrid: boolean;
  showColorCode: boolean;
  zoom: number;
  editable?: boolean;
  /** 启用拖拽平移模式: 点击拖拽滚动容器, 而非编辑格子 */
  panMode?: boolean;
  /** 四边显示灰色序号格 (1开始递增), 用于制作引导页 */
  showAxisNumbers?: boolean;
  onCellClick?: (x: number, y: number) => void;
  onCellDrag?: (x: number, y: number) => void;
  onDragStart?: () => void;
  onDragEnd?: () => void;
  highlightRow?: number | null;
  highlightColorIndices?: Set<number> | null;
  completedRows?: Set<number> | null;
  completedColorIndices?: Set<number> | null;
}

/** 根据亮度选择前景文字颜色 */
function pickTextColor(bead: BeadColor): string {
  const lum = 0.299 * bead.rgb.r + 0.587 * bead.rgb.g + 0.114 * bead.rgb.b;
  return lum > 140 ? '#000000' : '#FFFFFF';
}

const PatternCanvas: React.FC<PatternCanvasProps> = ({
  grid,
  palette,
  showGrid,
  showColorCode,
  zoom,
  editable = false,
  panMode = false,
  showAxisNumbers = false,
  onCellClick,
  onCellDrag,
  onDragStart,
  onDragEnd,
  highlightRow = null,
  highlightColorIndices = null,
  completedRows = null,
  completedColorIndices = null,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const isDraggingRef = useRef(false);
  const lastCellRef = useRef<{ x: number; y: number } | null>(null);

  // 拖拽平移相关 ref
  const isPanningRef = useRef(false);
  const panStartRef = useRef<{ x: number; y: number; scrollLeft: number; scrollTop: number } | null>(null);

  // 绘制 Canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const cellSize = Math.max(4, Math.floor(16 * zoom));
    const axisSize = showAxisNumbers ? cellSize : 0;
    const patternW = grid.width * cellSize;
    const patternH = grid.height * cellSize;
    const canvasW = patternW + 2 * axisSize;
    const canvasH = patternH + 2 * axisSize;

    canvas.width = canvasW;
    canvas.height = canvasH;

    // 序号格背景 (灰色)
    if (showAxisNumbers) {
      ctx.fillStyle = '#D9D9D9';
      // 上下边
      ctx.fillRect(0, 0, canvasW, axisSize);
      ctx.fillRect(0, canvasH - axisSize, canvasW, axisSize);
      // 左右边 (不含角落已填充)
      ctx.fillRect(0, axisSize, axisSize, patternH);
      ctx.fillRect(canvasW - axisSize, axisSize, axisSize, patternH);

      // 绘制序号文字
      const axisFontSize = Math.max(8, Math.floor(cellSize * 0.4));
      ctx.font = `bold ${axisFontSize}px sans-serif`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillStyle = '#333333';

      // 上边和下边: 列号 1..width
      for (let x = 0; x < grid.width; x++) {
        const cx = axisSize + x * cellSize + cellSize / 2;
        const numStr = String(x + 1);
        // 上边
        ctx.fillText(numStr, cx, axisSize / 2);
        // 下边
        ctx.fillText(numStr, cx, canvasH - axisSize / 2);
      }
      // 左边和右边: 行号 1..height
      for (let y = 0; y < grid.height; y++) {
        const cy = axisSize + y * cellSize + cellSize / 2;
        const numStr = String(y + 1);
        // 左边
        ctx.fillText(numStr, axisSize / 2, cy);
        // 右边
        ctx.fillText(numStr, canvasW - axisSize / 2, cy);
      }

      // 序号格边框线
      ctx.strokeStyle = '#999999';
      ctx.lineWidth = 1;
      ctx.beginPath();
      // 序号区与图案区交界线
      ctx.moveTo(axisSize + 0.5, 0);
      ctx.lineTo(axisSize + 0.5, canvasH);
      ctx.moveTo(canvasW - axisSize + 0.5, 0);
      ctx.lineTo(canvasW - axisSize + 0.5, canvasH);
      ctx.moveTo(0, axisSize + 0.5);
      ctx.lineTo(canvasW, axisSize + 0.5);
      ctx.moveTo(0, canvasH - axisSize + 0.5);
      ctx.lineTo(canvasW, canvasH - axisSize + 0.5);
      ctx.stroke();
    }

    const colors = palette.colors;
    const ox = axisSize; // 图案绘制 x 偏移
    const oy = axisSize; // 图案绘制 y 偏移

    // 背景 (棋盘格表示透明)
    ctx.fillStyle = '#FFFBF0';
    ctx.fillRect(ox, oy, patternW, patternH);
    ctx.fillStyle = '#F0E6D2';
    for (let y = 0; y < grid.height; y++) {
      for (let x = 0; x < grid.width; x++) {
        if ((x + y) % 2 === 0) {
          ctx.fillRect(ox + x * cellSize, oy + y * cellSize, cellSize, cellSize);
        }
      }
    }

    // 绘制色块
    for (let y = 0; y < grid.height; y++) {
      const isCompletedRow = completedRows?.has(y) ?? false;
      const isHighlightRow = highlightRow === y;

      for (let x = 0; x < grid.width; x++) {
        const idx = grid.data[y * grid.width + x];
        if (idx < 0 || idx >= colors.length) continue;

        const bead = colors[idx];
        const px = ox + x * cellSize;
        const py = oy + y * cellSize;

        // 完成的行/颜色降低不透明度
        let alpha = 1;
        if (isCompletedRow) alpha = 0.35;
        if (completedColorIndices?.has(idx)) alpha = 0.35;

        ctx.globalAlpha = alpha;
        ctx.fillStyle = bead.hex;
        ctx.fillRect(px, py, cellSize, cellSize);
        ctx.globalAlpha = 1;

        // 高亮当前颜色
        if (highlightColorIndices?.has(idx)) {
          ctx.strokeStyle = '#FF6B9D';
          ctx.lineWidth = 3;
          ctx.strokeRect(px + 1.5, py + 1.5, cellSize - 3, cellSize - 3);
        }
      }

      // 高亮当前行
      if (isHighlightRow) {
        ctx.fillStyle = 'rgba(255,107,157,0.25)';
        ctx.fillRect(ox, oy + y * cellSize, patternW, cellSize);
        ctx.strokeStyle = '#FF6B9D';
        ctx.lineWidth = 2;
        ctx.strokeRect(ox + 1, oy + y * cellSize + 1, patternW - 2, cellSize - 2);
      }
    }

    // 网格线
    if (showGrid) {
      ctx.strokeStyle = '#CCCCCC';
      ctx.lineWidth = 1;
      ctx.beginPath();
      for (let x = 0; x <= grid.width; x++) {
        const px = ox + x * cellSize + 0.5;
        ctx.moveTo(px, oy);
        ctx.lineTo(px, oy + patternH);
      }
      for (let y = 0; y <= grid.height; y++) {
        const py = oy + y * cellSize + 0.5;
        ctx.moveTo(ox, py);
        ctx.lineTo(ox + patternW, py);
      }
      ctx.stroke();

      // 每 10 格加粗
      ctx.strokeStyle = '#B8860B';
      ctx.lineWidth = 2;
      ctx.beginPath();
      for (let x = 0; x <= grid.width; x += 10) {
        const px = ox + x * cellSize + 0.5;
        ctx.moveTo(px, oy);
        ctx.lineTo(px, oy + patternH);
      }
      for (let y = 0; y <= grid.height; y += 10) {
        const py = oy + y * cellSize + 0.5;
        ctx.moveTo(ox, py);
        ctx.lineTo(ox + patternW, py);
      }
      ctx.stroke();
    }

    // 色号标注
    if (showColorCode && cellSize >= 12) {
      const fontSize = Math.max(6, Math.floor(cellSize * 0.28));
      ctx.font = `${fontSize}px sans-serif`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      for (let y = 0; y < grid.height; y++) {
        for (let x = 0; x < grid.width; x++) {
          const idx = grid.data[y * grid.width + x];
          if (idx < 0 || idx >= colors.length) continue;
          ctx.fillStyle = pickTextColor(colors[idx]);
          ctx.fillText(
            colors[idx].code,
            ox + x * cellSize + cellSize / 2,
            oy + y * cellSize + cellSize / 2
          );
        }
      }
    }
  }, [
    grid,
    palette,
    showGrid,
    showColorCode,
    zoom,
    showAxisNumbers,
    highlightRow,
    highlightColorIndices,
    completedRows,
    completedColorIndices,
  ]);

  // 将鼠标坐标转换为网格坐标
  const getCellCoord = useCallback(
    (e: React.MouseEvent): { x: number; y: number } | null => {
      const canvas = canvasRef.current;
      if (!canvas) return null;
      const rect = canvas.getBoundingClientRect();
      if (rect.width === 0 || rect.height === 0) return null;

      // 当显示序号格时, canvas 实际尺寸比图案区大, 需要计算偏移比例
      if (showAxisNumbers) {
        const cellSize = Math.max(4, Math.floor(16 * zoom));
        const axisSize = cellSize;
        const patternW = grid.width * cellSize;
        const patternH = grid.height * cellSize;
        const canvasW = patternW + 2 * axisSize;
        const canvasH = patternH + 2 * axisSize;
        // 鼠标在 canvas 中的像素位置
        const mousePxX = ((e.clientX - rect.left) / rect.width) * canvasW;
        const mousePxY = ((e.clientY - rect.top) / rect.height) * canvasH;
        // 减去序号区偏移, 转换为网格坐标
        const x = Math.floor((mousePxX - axisSize) / cellSize);
        const y = Math.floor((mousePxY - axisSize) / cellSize);
        if (x < 0 || x >= grid.width || y < 0 || y >= grid.height) return null;
        return { x, y };
      }

      const x = Math.floor(((e.clientX - rect.left) / rect.width) * grid.width);
      const y = Math.floor(((e.clientY - rect.top) / rect.height) * grid.height);
      if (x < 0 || x >= grid.width || y < 0 || y >= grid.height) return null;
      return { x, y };
    },
    [grid.width, grid.height, zoom, showAxisNumbers]
  );

  // ========== 拖拽平移逻辑 ==========
  const handlePanStart = useCallback(
    (clientX: number, clientY: number) => {
      const container = containerRef.current;
      if (!container) return;
      isPanningRef.current = true;
      panStartRef.current = {
        x: clientX,
        y: clientY,
        scrollLeft: container.scrollLeft,
        scrollTop: container.scrollTop,
      };
    },
    []
  );

  const handlePanMove = useCallback(
    (clientX: number, clientY: number) => {
      if (!isPanningRef.current || !panStartRef.current || !containerRef.current) return;
      const dx = clientX - panStartRef.current.x;
      const dy = clientY - panStartRef.current.y;
      containerRef.current.scrollLeft = panStartRef.current.scrollLeft - dx;
      containerRef.current.scrollTop = panStartRef.current.scrollTop - dy;
    },
    []
  );

  const handlePanEnd = useCallback(() => {
    isPanningRef.current = false;
    panStartRef.current = null;
  }, []);

  // ========== 鼠标事件 ==========
  const handleMouseDown = useCallback(
    (e: React.MouseEvent) => {
      if (panMode) {
        handlePanStart(e.clientX, e.clientY);
        return;
      }
      if (!editable) return;
      const coord = getCellCoord(e);
      if (!coord) return;
      isDraggingRef.current = true;
      lastCellRef.current = coord;
      onDragStart?.();
      onCellClick?.(coord.x, coord.y);
    },
    [panMode, editable, getCellCoord, onCellClick, onDragStart, handlePanStart]
  );

  const handleMouseMove = useCallback(
    (e: React.MouseEvent) => {
      if (panMode) {
        handlePanMove(e.clientX, e.clientY);
        return;
      }
      if (!editable || !isDraggingRef.current) return;
      const coord = getCellCoord(e);
      if (!coord) return;
      if (lastCellRef.current && lastCellRef.current.x === coord.x && lastCellRef.current.y === coord.y) {
        return;
      }
      lastCellRef.current = coord;
      onCellDrag?.(coord.x, coord.y);
    },
    [panMode, editable, getCellCoord, onCellDrag, handlePanMove]
  );

  const handleMouseUp = useCallback(() => {
    if (panMode) {
      handlePanEnd();
      return;
    }
    if (!isDraggingRef.current) return;
    isDraggingRef.current = false;
    lastCellRef.current = null;
    onDragEnd?.();
  }, [panMode, onDragEnd, handlePanEnd]);

  // 全局 mouseup 防止拖出 canvas 后无法结束
  useEffect(() => {
    const handler = () => {
      if (panMode) {
        handlePanEnd();
      } else if (editable) {
        handleMouseUp();
      }
    };
    window.addEventListener('mouseup', handler);
    window.addEventListener('touchend', handler);
    return () => {
      window.removeEventListener('mouseup', handler);
      window.removeEventListener('touchend', handler);
    };
  }, [editable, panMode, handleMouseUp, handlePanEnd]);

  // ========== 触摸事件 ==========
  const handleTouchStart = useCallback(
    (e: React.TouchEvent) => {
      if (panMode) {
        e.preventDefault();
        const touch = e.touches[0];
        handlePanStart(touch.clientX, touch.clientY);
        return;
      }
      if (!editable) return;
      e.preventDefault();
      const touch = e.touches[0];
      const fakeEvent = {
        clientX: touch.clientX,
        clientY: touch.clientY,
      } as React.MouseEvent;
      const coord = getCellCoord(fakeEvent);
      if (!coord) return;
      isDraggingRef.current = true;
      lastCellRef.current = coord;
      onDragStart?.();
      onCellClick?.(coord.x, coord.y);
    },
    [panMode, editable, getCellCoord, onCellClick, onDragStart, handlePanStart]
  );

  const handleTouchMove = useCallback(
    (e: React.TouchEvent) => {
      if (panMode) {
        e.preventDefault();
        const touch = e.touches[0];
        handlePanMove(touch.clientX, touch.clientY);
        return;
      }
      if (!editable || !isDraggingRef.current) return;
      e.preventDefault();
      const touch = e.touches[0];
      const fakeEvent = {
        clientX: touch.clientX,
        clientY: touch.clientY,
      } as React.MouseEvent;
      const coord = getCellCoord(fakeEvent);
      if (!coord) return;
      if (lastCellRef.current && lastCellRef.current.x === coord.x && lastCellRef.current.y === coord.y) {
        return;
      }
      lastCellRef.current = coord;
      onCellDrag?.(coord.x, coord.y);
    },
    [panMode, editable, getCellCoord, onCellDrag, handlePanMove]
  );

  // 游标样式
  const cursorStyle = panMode
    ? 'grab'
    : editable
    ? 'crosshair'
    : 'default';

  return (
    <div className="canvas-container" ref={containerRef}>
      <div className="canvas-wrapper">
        <canvas
          ref={canvasRef}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          style={{
            cursor: cursorStyle,
            imageRendering: 'pixelated',
            maxWidth: 'none',
            touchAction: panMode ? 'none' : 'none',
            margin: '0 auto',
          }}
        />
      </div>
    </div>
  );
};

export default PatternCanvas;
