// ========== PatternEditor.tsx ==========
// 图纸编辑器: 工具栏 + 色卡面板 + Canvas 编辑 + 撤销/重做

import React, { useState, useCallback, useRef, useMemo, useEffect } from 'react';
import type { PatternGrid, Palette, ToolType, HistoryEntry } from '../lib/types';
import { applyTool, pickColorAt } from '../lib/editor/tools';
import { HistoryManager } from '../lib/editor/history';
import { getUsedColorIndices } from '../utils/palette';
import PatternCanvas from './PatternCanvas';
import PaletteSelector from './PaletteSelector';

interface PatternEditorProps {
  grid: PatternGrid;
  palette: Palette;
  onGridChange: (grid: PatternGrid) => void;
  historyRef: React.MutableRefObject<HistoryManager>;
}

interface ToolDef {
  type: ToolType;
  icon: string;
  label: string;
  desc: string;
}

const TOOLS: ToolDef[] = [
  { type: 'brush', icon: '🖌️', label: '画笔', desc: '在格子上绘制当前颜色' },
  { type: 'eraser', icon: '🧹', label: '橡皮', desc: '擦除格子 (设为空)' },
  { type: 'fill', icon: '🪣', label: '填充', desc: '填充连通区域' },
  { type: 'eyedropper', icon: '💧', label: '吸管', desc: '吸取格子颜色' },
  { type: 'replace', icon: '🔄', label: '换色', desc: '全局替换同色格子' },
];

const PatternEditor: React.FC<PatternEditorProps> = ({
  grid,
  palette,
  onGridChange,
  historyRef,
}) => {
  const [currentTool, setCurrentTool] = useState<ToolType>('brush');
  const [currentColor, setCurrentColor] = useState(0);
  const [showGrid, setShowGrid] = useState(true);
  const [showColorCode, setShowColorCode] = useState(false);
  const [zoom, setZoom] = useState(1);
  const [canUndo, setCanUndo] = useState(false);
  const [canRedo, setCanRedo] = useState(false);
  const dragStartGridRef = useRef<PatternGrid | null>(null);

  const usedIndices = useMemo(() => getUsedColorIndices(grid), [grid]);

  // 点击色卡选择颜色时, 自动切换到画笔工具, 方便直接绘制
  const handleColorSelect = useCallback((idx: number) => {
    setCurrentColor(idx);
    setCurrentTool('brush');
  }, []);

  // 右键色卡: 切换到全局换色工具 (将该颜色替换为当前选中颜色)
  const handleColorRightClick = useCallback(
    (e: React.MouseEvent, idx: number) => {
      e.preventDefault();
      setCurrentColor(idx);
      setCurrentTool('replace');
    },
    []
  );

  // 更新撤销/重做可用状态
  const updateUndoRedoState = useCallback(() => {
    const hm = historyRef.current;
    setCanUndo(hm.canUndo());
    setCanRedo(hm.canRedo());
  }, [historyRef]);

  useEffect(() => {
    updateUndoRedoState();
  }, [updateUndoRedoState]);

  // 处理格子点击/拖拽
  const handleCellAction = useCallback(
    (x: number, y: number) => {
      if (currentTool === 'eyedropper') {
        const picked = pickColorAt(grid, x, y);
        if (picked >= 0 && picked < palette.colors.length) {
          setCurrentColor(picked);
        }
        return;
      }

      const next = applyTool(grid, currentTool, x, y, currentColor, palette.colors);
      if (next.data !== grid.data) {
        onGridChange(next);
      }
    },
    [grid, currentTool, currentColor, palette, onGridChange]
  );

  const handleDragStart = useCallback(() => {
    // 保存拖拽前的网格状态
    dragStartGridRef.current = {
      width: grid.width,
      height: grid.height,
      data: grid.data.slice(),
    };
  }, [grid]);

  const handleDragEnd = useCallback(() => {
    if (dragStartGridRef.current) {
      // 只有当数据真的变化了才记录历史
      const before = dragStartGridRef.current.data;
      const after = grid.data;
      let changed = false;
      if (before.length === after.length) {
        for (let i = 0; i < before.length; i++) {
          if (before[i] !== after[i]) {
            changed = true;
            break;
          }
        }
      } else {
        changed = true;
      }

      if (changed) {
        const entry: HistoryEntry = {
          before: before,
          after: after.slice(),
          action: `${currentTool} 拖拽`,
        };
        historyRef.current.push(entry);
        updateUndoRedoState();
      }
      dragStartGridRef.current = null;
    }
  }, [grid, currentTool, historyRef, updateUndoRedoState]);

  // 点击操作 (非拖拽场景: fill/replace/eyedropper)
  const handleCellClick = useCallback(
    (x: number, y: number) => {
      if (currentTool === 'eyedropper') {
        handleCellAction(x, y);
        return;
      }

      if (currentTool === 'fill' || currentTool === 'replace') {
        // 这些是单次操作, 需要记录历史
        const before = grid.data.slice();
        const next = applyTool(grid, currentTool, x, y, currentColor, palette.colors);
        if (next.data !== grid.data) {
          onGridChange(next);
          const entry: HistoryEntry = {
            before,
            after: next.data.slice(),
            action: currentTool,
          };
          historyRef.current.push(entry);
          updateUndoRedoState();
        }
      }
      // brush/eraser 的点击在拖拽开始时处理, 历史在 dragEnd 记录
    },
    [currentTool, grid, currentColor, palette, onGridChange, historyRef, updateUndoRedoState, handleCellAction]
  );

  // brush/eraser 拖拽时连续绘制
  const handleCellDrag = useCallback(
    (x: number, y: number) => {
      if (currentTool === 'brush' || currentTool === 'eraser') {
        handleCellAction(x, y);
      }
    },
    [currentTool, handleCellAction]
  );

  // 撤销
  const handleUndo = useCallback(() => {
    const entry = historyRef.current.undo();
    if (entry) {
      const restored: PatternGrid = {
        width: grid.width,
        height: grid.height,
        data: entry.before.slice(),
      };
      onGridChange(restored);
      updateUndoRedoState();
    }
  }, [grid, historyRef, onGridChange, updateUndoRedoState]);

  // 重做
  const handleRedo = useCallback(() => {
    const entry = historyRef.current.redo();
    if (entry) {
      const restored: PatternGrid = {
        width: grid.width,
        height: grid.height,
        data: entry.after.slice(),
      };
      onGridChange(restored);
      updateUndoRedoState();
    }
  }, [grid, historyRef, onGridChange, updateUndoRedoState]);

  // 清空 (全部擦除)
  const handleClear = useCallback(() => {
    const before = grid.data.slice();
    const next: PatternGrid = {
      width: grid.width,
      height: grid.height,
      data: new Int32Array(grid.width * grid.height).fill(-1),
    };
    onGridChange(next);
    const entry: HistoryEntry = {
      before,
      after: next.data.slice(),
      action: '清空',
    };
    historyRef.current.push(entry);
    updateUndoRedoState();
  }, [grid, onGridChange, historyRef, updateUndoRedoState]);

  return (
    <div className="flex flex-col gap-4">
      {/* 工具栏 */}
      <div className="pixel-card">
        <div className="flex items-center gap-3 flex-wrap">
          {/* 工具按钮 */}
          <div className="flex gap-2 flex-wrap">
            {TOOLS.map((tool) => (
              <button
                key={tool.type}
                className={`tool-btn ${currentTool === tool.type ? 'active' : ''}`}
                onClick={() => setCurrentTool(tool.type)}
                title={`${tool.label}: ${tool.desc}`}
              >
                <span>{tool.icon}</span>
              </button>
            ))}
          </div>

          <div style={{ width: '2px', height: '32px', background: 'var(--color-border)' }} />

          {/* 撤销/重做 */}
          <button
            className="tool-btn"
            onClick={handleUndo}
            disabled={!canUndo}
            title="撤销"
            style={{ opacity: canUndo ? 1 : 0.4 }}
          >
            ↩️
          </button>
          <button
            className="tool-btn"
            onClick={handleRedo}
            disabled={!canRedo}
            title="重做"
            style={{ opacity: canRedo ? 1 : 0.4 }}
          >
            ↪️
          </button>

          <div style={{ width: '2px', height: '32px', background: 'var(--color-border)' }} />

          {/* 显示选项 */}
          <label className="flex items-center gap-2 cursor-pointer text-sm">
            <input
              type="checkbox"
              checked={showGrid}
              onChange={(e) => setShowGrid(e.target.checked)}
            />
            网格线
          </label>
          <label className="flex items-center gap-2 cursor-pointer text-sm">
            <input
              type="checkbox"
              checked={showColorCode}
              onChange={(e) => setShowColorCode(e.target.checked)}
            />
            色号
          </label>

          <div style={{ width: '2px', height: '32px', background: 'var(--color-border)' }} />

          {/* 缩放 */}
          <div className="flex items-center gap-2">
            <button className="tool-btn" onClick={() => setZoom((z) => Math.max(0.25, z - 0.25))} title="缩小">
              🔍−
            </button>
            <span className="text-sm font-bold" style={{ minWidth: '40px', textAlign: 'center' }}>
              {Math.round(zoom * 100)}%
            </span>
            <button className="tool-btn" onClick={() => setZoom((z) => Math.min(4, z + 0.25))} title="放大">
              🔍+
            </button>
          </div>

          <div style={{ width: '2px', height: '32px', background: 'var(--color-border)' }} />

          {/* 清空 */}
          <button className="pixel-btn danger text-sm" onClick={handleClear} title="清空全部">
            清空
          </button>
        </div>

        {/* 当前工具说明 */}
        <p className="text-xs mt-2" style={{ color: 'var(--color-text-light)' }}>
          当前工具: {TOOLS.find((t) => t.type === currentTool)?.label} —{' '}
          {TOOLS.find((t) => t.type === currentTool)?.desc}
        </p>
      </div>

      {/* Canvas */}
      <PatternCanvas
        grid={grid}
        palette={palette}
        showGrid={showGrid}
        showColorCode={showColorCode}
        zoom={zoom}
        editable
        onCellClick={handleCellClick}
        onCellDrag={handleCellDrag}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      />

      {/* 色卡选择 */}
      <PaletteSelector
        palette={palette}
        currentColor={currentColor}
        onColorSelect={handleColorSelect}
        onColorRightClick={handleColorRightClick}
        usedIndices={usedIndices}
      />
    </div>
  );
};

export default PatternEditor;
