// ========== SettingsPanel.tsx ==========
// 设置面板: 品牌选择、尺寸、抖动算法、颜色数量、后处理选项

import React from 'react';
import type { PatternConfig, BeadBrand, DitherAlgorithm, Palette } from '../lib/types';
import { getAllPalettes } from '../lib/palettes';

interface SettingsPanelProps {
  config: PatternConfig;
  onConfigChange: (config: PatternConfig) => void;
  onGenerate: () => void;
  isProcessing: boolean;
  hasImage: boolean;
  palettes: Palette[];
  onBack: () => void;
}

const BRAND_OPTIONS: { value: BeadBrand; label: string }[] = [
  { value: 'artkal-s', label: 'Artkal S (2.6mm)' },
  { value: 'artkal-m', label: 'Artkal M (5mm)' },
  { value: 'perler', label: 'Perler (5mm)' },
  { value: 'hama', label: 'Hama (5mm)' },
  { value: 'mard', label: 'Mard (5mm)' },
];

const DITHER_OPTIONS: { value: DitherAlgorithm; label: string; desc: string }[] = [
  { value: 'none', label: '无', desc: '直接取最近色, 无抖动' },
  { value: 'floyd-steinberg', label: 'Floyd-Steinberg', desc: '经典误差扩散, 效果自然' },
  { value: 'riemersma', label: 'Riemersma', desc: '螺旋路径误差扩散' },
  { value: 'bayer', label: 'Bayer', desc: '有序抖动, 规则网点' },
];

// 开关组件
const Toggle: React.FC<{
  checked: boolean;
  onChange: (v: boolean) => void;
  label: string;
  desc?: string;
}> = ({ checked, onChange, label, desc }) => (
  <div className="flex items-center justify-between gap-3 p-2">
    <div>
      <span className="font-bold text-sm">{label}</span>
      {desc && (
        <p className="text-xs" style={{ color: 'var(--color-text-light)' }}>
          {desc}
        </p>
      )}
    </div>
    <label className="toggle-switch">
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
      />
      <span className="toggle-slider" />
    </label>
  </div>
);

const SettingsPanel: React.FC<SettingsPanelProps> = ({
  config,
  onConfigChange,
  onGenerate,
  isProcessing,
  hasImage,
  palettes,
  onBack,
}) => {
  const update = <K extends keyof PatternConfig>(key: K, value: PatternConfig[K]) => {
    onConfigChange({ ...config, [key]: value });
  };

  // 品牌变化时同步 beadSize
  const handleBrandChange = (brand: BeadBrand) => {
    const palette = getAllPalettes().find((p) => p.id === brand);
    onConfigChange({
      ...config,
      brand,
      beadSize: palette?.size ?? config.beadSize,
    });
  };

  const selectedPalette = palettes.find((p) => p.id === config.brand);
  const colorCount = selectedPalette?.colors.length ?? 0;

  return (
    <div className="pixel-card" style={{ maxWidth: '800px', margin: '0 auto' }}>
      <h2 className="text-xl mb-4" style={{ color: 'var(--color-text)' }}>
        设置参数
      </h2>

      {/* 品牌 */}
      <div className="mb-4">
        <label className="font-bold text-sm mb-2 block">拼豆品牌</label>
        <select
          className="pixel-select w-full"
          value={config.brand}
          onChange={(e) => handleBrandChange(e.target.value as BeadBrand)}
        >
          {BRAND_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
        <p className="text-xs mt-1" style={{ color: 'var(--color-text-light)' }}>
          该品牌色卡共 {colorCount} 种颜色
        </p>
      </div>

      {/* 尺寸 */}
      <div className="mb-4">
        <label className="font-bold text-sm mb-2 block">目标尺寸 (格数)</label>
        <div className="flex items-center gap-3 flex-wrap">
          <div className="flex items-center gap-2">
            <span className="text-sm">宽:</span>
            <input
              type="number"
              className="pixel-input"
              style={{ width: '80px' }}
              value={config.width}
              min={4}
              max={200}
              onChange={(e) => update('width', Math.max(4, Math.min(200, Number(e.target.value) || 4)))}
            />
          </div>
          <span className="text-lg">×</span>
          <div className="flex items-center gap-2">
            <span className="text-sm">高:</span>
            <input
              type="number"
              className="pixel-input"
              style={{ width: '80px' }}
              value={config.height}
              min={4}
              max={200}
              onChange={(e) => update('height', Math.max(4, Math.min(200, Number(e.target.value) || 4)))}
            />
          </div>
        </div>
        <p className="text-xs mt-1" style={{ color: 'var(--color-text-light)' }}>
          总计 {config.width * config.height} 颗 · 实际尺寸约{' '}
          {(config.width * (config.beadSize === '2.6mm' ? 2.6 : 5)).toFixed(0)}mm ×{' '}
          {(config.height * (config.beadSize === '2.6mm' ? 2.6 : 5)).toFixed(0)}mm
        </p>
      </div>

      {/* 抖动算法 */}
      <div className="mb-4">
        <label className="font-bold text-sm mb-2 block">抖动算法</label>
        <select
          className="pixel-select w-full"
          value={config.dither}
          onChange={(e) => update('dither', e.target.value as DitherAlgorithm)}
        >
          {DITHER_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label} - {opt.desc}
            </option>
          ))}
        </select>
      </div>

      {/* 最大颜色数 */}
      <div className="mb-4">
        <label className="font-bold text-sm mb-2 block">
          最大颜色数量: <span style={{ color: 'var(--color-primary)' }}>{config.maxColors}</span> 种
        </label>
        <input
          type="range"
          className="pixel-slider"
          min={2}
          max={Math.min(64, colorCount)}
          value={config.maxColors}
          onChange={(e) => update('maxColors', Number(e.target.value))}
        />
        <div className="flex justify-between text-xs mt-1" style={{ color: 'var(--color-text-light)' }}>
          <span>2</span>
          <span>越少颜色越简洁, 越多颜色越精细</span>
          <span>{Math.min(64, colorCount)}</span>
        </div>
      </div>

      <hr className="pixel-divider" />

      {/* 后处理选项 */}
      <div className="mb-4">
        <h3 className="text-lg mb-2" style={{ color: 'var(--color-text)' }}>
          后处理
        </h3>

        <Toggle
          label="背景去除"
          desc="自动去除与四角颜色相近的背景区域"
          checked={config.removeBackground}
          onChange={(v) => update('removeBackground', v)}
        />

        {config.removeBackground && (
          <div className="p-2" style={{ paddingLeft: '16px' }}>
            <label className="font-bold text-xs mb-1 block">
              背景阈值: {config.backgroundThreshold}
            </label>
            <input
              type="range"
              className="pixel-slider"
              min={10}
              max={80}
              value={config.backgroundThreshold}
              onChange={(e) => update('backgroundThreshold', Number(e.target.value))}
            />
            <p className="text-xs" style={{ color: 'var(--color-text-light)' }}>
              阈值越大, 去除范围越广
            </p>
          </div>
        )}

        <Toggle
          label="去噪"
          desc="移除面积过小的孤立色块"
          checked={config.denoise}
          onChange={(v) => update('denoise', v)}
        />

        {config.denoise && (
          <div className="p-2" style={{ paddingLeft: '16px' }}>
            <label className="font-bold text-xs mb-1 block">
              最小面积: {config.minArea} 像素
            </label>
            <input
              type="range"
              className="pixel-slider"
              min={1}
              max={20}
              value={config.minArea}
              onChange={(e) => update('minArea', Number(e.target.value))}
            />
          </div>
        )}

        <Toggle
          label="轮廓增强"
          desc="强化颜色边界, 使轮廓更清晰"
          checked={config.enhanceContours}
          onChange={(v) => update('enhanceContours', v)}
        />
      </div>

      {/* 操作按钮 */}
      <div className="flex items-center justify-between mt-6 gap-3 flex-wrap">
        <button className="pixel-btn" onClick={onBack} disabled={isProcessing}>
          ← 返回上传
        </button>
        <button
          className="pixel-btn primary"
          onClick={onGenerate}
          disabled={!hasImage || isProcessing}
          style={{ minWidth: '180px', justifyContent: 'center' }}
        >
          {isProcessing ? (
            <>
              <span className="pixel-loader" style={{ width: '20px', height: '20px', borderWidth: '3px' }} />
              生成中...
            </>
          ) : (
            '生成图纸 ✨'
          )}
        </button>
      </div>
    </div>
  );
};

export default SettingsPanel;
