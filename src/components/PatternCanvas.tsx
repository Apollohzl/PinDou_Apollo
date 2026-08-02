// ========== PatternCanvas.tsx ==========
// Canvas 渲染图纸网格: 支持网格线、色号、缩放、鼠标编辑、高亮

import React, { useEffect, useRef, useCallback } from 'react';
import type { PatternGrid, Palette, BeadColor } from '../lib/types';

interface PatternCanvasProps {
  grid: PatternGrid;
  palette: Palette;
  showGrid: boolean;
  showColorCode: boolean;
  zoom: number;
  editable?: boolean;
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
  const isDraggingRef = useRef(false);
  const lastCellRef = useRef<{ x: number; y: number } | null>(null);

  // 绘制 Canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const cellSize = Math.max(4, Math.floor(16 * zoom));
    const canvasW = grid.width * cellSize;
    const canvasH = grid.height * cellSize;

    canvas.width = canvasW;
    canvas.height = canvasH;

    // 背景 (棋盘格表示透明)
    ctx.fillStyle = '#FFFBF0';
    ctx.fillRect(0, 0, canvasW, canvasH);
    ctx.fillStyle = '#F0E6D2';
    for (let y = 0; y < grid.height; y++) {
      for (let x = 0; x < grid.width; x++) {
        if ((x + y) % 2 === 0) {
          ctx.fillRect(x * cellSize, y * cellSize, cellSize, cellSize);
        }
      }
    }

    const colors = palette.colors;

    // 绘制色块
    for (let y = 0; y < grid.height; y++) {
      const isCompletedRow = completedRows?.has(y) ?? false;
      const isHighlightRow = highlightRow === y;

      for (let x = 0; x < grid.width; x++) {
        const idx = grid.data[y * grid.width + x];
        if (idx < 0 || idx >= colors.length) continue;

        const bead = colors[idx];
        const px = x * cellSize;
        const py = y * cellSize;

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
        ctx.fillRect(0, y * cellSize, canvasW, cellSize);
        ctx.strokeStyle = '#FF6B9D';
        ctx.lineWidth = 2;
        ctx.strokeRect(1, y * cellSize + 1, canvasW - 2, cellSize - 2);
      }
    }

    // 网格线
    if (showGrid) {
      ctx.strokeStyle = '#CCCCCC';
      ctx.lineWidth = 1;
      ctx.beginPath();
      for (let x = 0; x <= grid.width; x++) {
        const px = x * cellSize + 0.5;
        ctx.moveTo(px, 0);
        ctx.lineTo(px, canvasH);
      }
      for (let y = 0; y <= grid.height; y++) {
        const py = y * cellSize + 0.5;
        ctx.moveTo(0, py);
        ctx.lineTo(canvasW, py);
      }
      ctx.stroke();

      // 每 10 格加粗
      ctx.strokeStyle = '#B8860B';
      ctx.lineWidth = 2;
      ctx.beginPath();
      for (let x = 0; x <= grid.width; x += 10) {
        const px = x * cellSize + 0.5;
        ctx.moveTo(px, 0);
        ctx.lineTo(px, canvasH);
      }
      for (let y = 0; y <= grid.height; y += 10) {
        const py = y * cellSize + 0.5;
        ctx.moveTo(0, py);
        ctx.lineTo(canvasW, py);
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
            x * cellSize + cellSize / 2,
            y * cellSize + cellSize / 2
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
      const x = Math.floor(((e.clientX - rect.left) / rect.width) * grid.width);
      const y = Math.floor(((e.clientY - rect.top) / rect.height) * grid.height);
      if (x < 0 || x >= grid.width || y < 0 || y >= grid.height) return null;
      return { x, y };
    },
    [grid.width, grid.height]
  );

  const handleMouseDown = useCallback(
    (e: React.MouseEvent) => {
      if (!editable) return;
      const coord = getCellCoord(e);
      if (!coord) return;
      isDraggingRef.current = true;
      lastCellRef.current = coord;
      onDragStart?.();
      onCellClick?.(coord.x, coord.y);
    },
    [editable, getCellCoord, onCellClick, onDragStart]
  );

  const handleMouseMove = useCallback(
    (e: React.MouseEvent) => {
      if (!editable || !isDraggingRef.current) return;
      const coord = getCellCoord(e);
      if (!coord) return;
      if (lastCellRef.current && lastCellRef.current.x === coord.x && lastCellRef.current.y === coord.y) {
        return;
      }
      lastCellRef.current = coord;
      onCellDrag?.(coord.x, coord.y);
    },
    [editable, getCellCoord, onCellDrag]
  );

  const handleMouseUp = useCallback(() => {
    if (!isDraggingRef.current) return;
    isDraggingRef.current = false;
    lastCellRef.current = null;
    onDragEnd?.();
  }, [onDragEnd]);

  // 全局 mouseup 防止拖出 canvas 后无法结束
  useEffect(() => {
    if (!editable) return;
    const handler = () => handleMouseUp();
    window.addEventListener('mouseup', handler);
    window.addEventListener('touchend', handler);
    return () => {
      window.removeEventListener('mouseup', handler);
      window.removeEventListener('touchend', handler);
    };
  }, [editable, handleMouseUp]);

  const handleTouchStart = useCallback(
    (e: React.TouchEvent) => {
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
    [editable, getCellCoord, onCellClick, onDragStart]
  );

  const handleTouchMove = useCallback(
    (e: React.TouchEvent) => {
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
    [editable, getCellCoord, onCellDrag]
  );

  return (
    <div className="canvas-container">
      <div className="canvas-wrapper">
        <canvas
          ref={canvasRef}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          style={{
            cursor: editable ? 'crosshair' : 'default',
            imageRendering: 'pixelated',
            maxWidth: 'none',
            touchAction: 'none',
            margin: '0 auto',
          }}
        />
      </div>
    </div>
  );
};

export default PatternCanvas;
