// ========== PaletteSelector.tsx ==========
// 色卡选择器: 显示所有颜色, 支持点击选择, 标记已使用/未使用

import React, { useMemo } from 'react';
import type { Palette } from '../lib/types';

interface PaletteSelectorProps {
  palette: Palette;
  currentColor: number;
  onColorSelect: (index: number) => void;
  usedIndices: Set<number>;
}

const PaletteSelector: React.FC<PaletteSelectorProps> = ({
  palette,
  currentColor,
  onColorSelect,
  usedIndices,
}) => {
  const stats = useMemo(() => {
    const total = palette.colors.length;
    const used = usedIndices.size;
    return { total, used, unused: total - used };
  }, [palette, usedIndices]);

  return (
    <div className="pixel-card">
      <div className="flex items-center justify-between mb-2 flex-wrap gap-2">
        <h3 className="text-lg" style={{ color: 'var(--color-text)' }}>
          色卡选择
        </h3>
        <div className="flex gap-2 flex-wrap">
          <span className="pixel-tag" style={{ borderColor: 'var(--color-green)', color: 'var(--color-green)' }}>
            已用 {stats.used}
          </span>
          <span className="pixel-tag" style={{ borderColor: 'var(--color-text-light)', color: 'var(--color-text-light)' }}>
            未用 {stats.unused}
          </span>
          <span className="pixel-tag" style={{ borderColor: 'var(--color-border-dark)', color: 'var(--color-text)' }}>
            共 {stats.total}
          </span>
        </div>
      </div>

      <div className="palette-grid">
        {palette.colors.map((color, idx) => {
          const isUsed = usedIndices.has(idx);
          const isSelected = idx === currentColor;

          return (
            <div
              key={`${color.index}-${idx}`}
              className="palette-item"
              style={{ position: 'relative' }}
              onClick={() => onColorSelect(idx)}
              title={`${color.code} ${color.name} (${color.nameEn})`}
            >
              <div
                className={`color-swatch ${isSelected ? 'selected' : ''}`}
                style={{
                  background: color.hex,
                  opacity: isUsed ? 1 : 0.4,
                }}
              />
              <span className="palette-item-code">{color.code}</span>
              {isUsed && (
                <span
                  style={{
                    position: 'absolute',
                    top: '-2px',
                    right: '-2px',
                    width: '8px',
                    height: '8px',
                    background: 'var(--color-green)',
                    borderRadius: '50%',
                    border: '1px solid white',
                  }}
                />
              )}
            </div>
          );
        })}
      </div>

      {currentColor >= 0 && currentColor < palette.colors.length && (
        <div
          className="mt-4 p-2"
          style={{
            background: 'var(--bg-secondary)',
            borderRadius: 'var(--radius-sm)',
            border: '2px solid var(--color-border)',
          }}
        >
          <div className="flex items-center gap-3">
            <div
              className="color-swatch selected"
              style={{ background: palette.colors[currentColor].hex }}
            />
            <div>
              <p className="font-bold text-sm">
                {palette.colors[currentColor].code} - {palette.colors[currentColor].name}
              </p>
              <p className="text-xs" style={{ color: 'var(--color-text-light)' }}>
                {palette.colors[currentColor].nameEn} · {palette.colors[currentColor].hex}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PaletteSelector;
