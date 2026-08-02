// ========== ProductionGuide.tsx ==========
// 制作引导: 逐行引导模式 / 逐色引导模式 / 进度追踪

import React, { useState, useMemo, useCallback } from 'react';
import type { PatternGrid, Palette, GuideState } from '../lib/types';
import PatternCanvas from './PatternCanvas';

interface ProductionGuideProps {
  grid: PatternGrid;
  palette: Palette;
}

type GuideMode = 'row' | 'color';

const ProductionGuide: React.FC<ProductionGuideProps> = ({ grid, palette }) => {
  const [mode, setMode] = useState<GuideMode>('row');
  const [currentStep, setCurrentStep] = useState(0);
  const [completedSteps, setCompletedSteps] = useState<Set<number>>(new Set());

  // 逐行模式: 总步数 = height
  // 逐色模式: 总步数 = 使用的颜色数
  const usedColorIndices = useMemo(() => {
    const used = new Set<number>();
    for (let i = 0; i < grid.data.length; i++) {
      if (grid.data[i] >= 0) used.add(grid.data[i]);
    }
    return Array.from(used).sort((a, b) => a - b);
  }, [grid]);

  const totalSteps = mode === 'row' ? grid.height : usedColorIndices.length;
  const safeStep = Math.min(currentStep, totalSteps - 1);
  const progress = totalSteps > 0 ? (completedSteps.size / totalSteps) * 100 : 0;

  // 当前高亮信息
  const highlightRow = mode === 'row' ? safeStep : null;
  const highlightColorIndices = useMemo(() => {
    if (mode !== 'color' || safeStep < 0 || safeStep >= usedColorIndices.length) {
      return null;
    }
    const colorIdx = usedColorIndices[safeStep];
    return new Set([colorIdx]);
  }, [mode, safeStep, usedColorIndices]);

  // 完成的行/颜色
  const completedRows = useMemo(() => {
    if (mode !== 'row') return null;
    return completedSteps;
  }, [mode, completedSteps]);

  const completedColorIndices = useMemo(() => {
    if (mode !== 'color') return null;
    const result = new Set<number>();
    for (const step of completedSteps) {
      if (step < usedColorIndices.length) {
        result.add(usedColorIndices[step]);
      }
    }
    return result;
  }, [mode, completedSteps, usedColorIndices]);

  // 切换模式时重置
  const handleModeChange = (newMode: GuideMode) => {
    setMode(newMode);
    setCurrentStep(0);
    setCompletedSteps(new Set());
  };

  // 标记当前步骤完成
  const toggleComplete = useCallback(() => {
    setCompletedSteps((prev) => {
      const next = new Set(prev);
      if (next.has(safeStep)) {
        next.delete(safeStep);
      } else {
        next.add(safeStep);
      }
      return next;
    });
  }, [safeStep]);

  // 上一步/下一步
  const goPrev = () => setCurrentStep((s) => Math.max(0, s - 1));
  const goNext = () => setCurrentStep((s) => Math.min(totalSteps - 1, s + 1));

  // 当前步骤信息
  const currentInfo = useMemo(() => {
    if (mode === 'row') {
      const row = safeStep;
      // 统计该行使用的颜色
      const rowColors = new Set<number>();
      let beadCount = 0;
      for (let x = 0; x < grid.width; x++) {
        const idx = grid.data[row * grid.width + x];
        if (idx >= 0) {
          rowColors.add(idx);
          beadCount++;
        }
      }
      return {
        label: `第 ${row + 1} 行 / 共 ${grid.height} 行`,
        detail: `${beadCount} 颗豆子, ${rowColors.size} 种颜色`,
        colors: Array.from(rowColors).sort((a, b) => a - b),
      };
    } else {
      const colorIdx = usedColorIndices[safeStep] ?? -1;
      if (colorIdx < 0 || colorIdx >= palette.colors.length) {
        return { label: '无数据', detail: '', colors: [] as number[] };
      }
      const bead = palette.colors[colorIdx];
      // 统计该颜色数量
      let count = 0;
      for (let i = 0; i < grid.data.length; i++) {
        if (grid.data[i] === colorIdx) count++;
      }
      return {
        label: `颜色 ${bead.code} - ${bead.name}`,
        detail: `${count} 颗, 英文名: ${bead.nameEn}`,
        colors: [colorIdx],
      };
    }
  }, [mode, safeStep, grid, usedColorIndices, palette]);

  const isCurrentCompleted = completedSteps.has(safeStep);

  return (
    <div className="flex flex-col gap-4">
      {/* 模式选择 */}
      <div className="pixel-card">
        <h2 className="text-xl mb-3" style={{ color: 'var(--color-text)' }}>
          📖 制作引导
        </h2>

        <div className="tab-bar">
          <button
            className={`tab-btn ${mode === 'row' ? 'active' : ''}`}
            onClick={() => handleModeChange('row')}
          >
            逐行引导
          </button>
          <button
            className={`tab-btn ${mode === 'color' ? 'active' : ''}`}
            onClick={() => handleModeChange('color')}
          >
            逐色引导
          </button>
        </div>

        {/* 进度条 */}
        <div className="mb-4">
          <div className="flex justify-between text-sm mb-1">
            <span className="font-bold">制作进度</span>
            <span style={{ color: 'var(--color-primary)' }}>
              {completedSteps.size} / {totalSteps} ({progress.toFixed(0)}%)
            </span>
          </div>
          <div
            style={{
              width: '100%',
              height: '20px',
              background: 'var(--bg-secondary)',
              border: '3px solid var(--color-border-dark)',
              borderRadius: 'var(--radius-sm)',
              overflow: 'hidden',
            }}
          >
            <div
              style={{
                width: `${progress}%`,
                height: '100%',
                background: 'linear-gradient(90deg, var(--color-green), var(--color-secondary))',
                transition: 'width 0.3s ease',
              }}
            />
          </div>
        </div>

        {/* 当前步骤信息 */}
        <div
          className="p-3 mb-3"
          style={{
            background: 'var(--bg-secondary)',
            borderRadius: 'var(--radius-sm)',
            border: '2px solid var(--color-border)',
          }}
        >
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div>
              <p className="font-bold text-lg" style={{ color: 'var(--color-text)' }}>
                {currentInfo.label}
              </p>
              <p className="text-sm" style={{ color: 'var(--color-text-light)' }}>
                {currentInfo.detail}
              </p>
            </div>
            <div className="flex items-center gap-2">
              {currentInfo.colors.slice(0, 5).map((ci) => (
                <div
                  key={ci}
                  style={{
                    width: '24px',
                    height: '24px',
                    borderRadius: '4px',
                    border: '2px solid var(--color-border-dark)',
                    background: palette.colors[ci]?.hex ?? '#ccc',
                  }}
                  title={`${palette.colors[ci]?.code} ${palette.colors[ci]?.name}`}
                />
              ))}
              {currentInfo.colors.length > 5 && (
                <span className="text-sm" style={{ color: 'var(--color-text-light)' }}>
                  +{currentInfo.colors.length - 5}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* 控制按钮 */}
        <div className="flex items-center gap-3 flex-wrap">
          <button
            className="pixel-btn"
            onClick={goPrev}
            disabled={safeStep <= 0}
            style={{ opacity: safeStep <= 0 ? 0.4 : 1 }}
          >
            ← 上一步
          </button>
          <button
            className="pixel-btn"
            onClick={toggleComplete}
            style={{
              background: isCurrentCompleted ? 'var(--color-green)' : 'var(--color-accent)',
              color: isCurrentCompleted ? 'white' : 'var(--color-text)',
            }}
          >
            {isCurrentCompleted ? '✓ 已完成' : '标记完成'}
          </button>
          <button
            className="pixel-btn primary"
            onClick={goNext}
            disabled={safeStep >= totalSteps - 1}
            style={{ opacity: safeStep >= totalSteps - 1 ? 0.4 : 1 }}
          >
            下一步 →
          </button>
        </div>

        {/* 步骤指示 */}
        <div className="flex gap-1 mt-3 flex-wrap">
          {Array.from({ length: totalSteps }, (_, i) => (
            <div
              key={i}
              onClick={() => setCurrentStep(i)}
              style={{
                width: '24px',
                height: '24px',
                borderRadius: '4px',
                border: '2px solid var(--color-border-dark)',
                background: completedSteps.has(i)
                  ? 'var(--color-green)'
                  : i === safeStep
                  ? 'var(--color-primary)'
                  : 'var(--bg-secondary)',
                color: completedSteps.has(i) || i === safeStep ? 'white' : 'var(--color-text)',
                fontSize: '11px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
              }}
              title={mode === 'row' ? `第 ${i + 1} 行` : `颜色 ${palette.colors[usedColorIndices[i]]?.code ?? ''}`}
            >
              {completedSteps.has(i) ? '✓' : i + 1}
            </div>
          ))}
        </div>
      </div>

      {/* Canvas 预览 */}
      <PatternCanvas
        grid={grid}
        palette={palette}
        showGrid={true}
        showColorCode={true}
        zoom={1}
        editable={false}
        highlightRow={highlightRow}
        highlightColorIndices={highlightColorIndices}
        completedRows={completedRows}
        completedColorIndices={completedColorIndices}
      />
    </div>
  );
};

export default ProductionGuide;
