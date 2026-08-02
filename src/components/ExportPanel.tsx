// ========== ExportPanel.tsx ==========
// 导出面板: PNG / PDF / Excel / JSON 导出与 JSON 导入

import React, { useState, useCallback, useRef } from 'react';
import type { PatternGrid, Palette, PatternConfig, ExportOptions } from '../lib/types';
import { exportPNG } from '../lib/export/png';
import { exportPDF } from '../lib/export/pdf';
import { exportExcel } from '../lib/export/excel';
import { exportJSON, importJSON } from '../lib/export/json';
import { downloadBlob } from '../utils/palette';

interface ExportPanelProps {
  grid: PatternGrid;
  palette: Palette;
  config: PatternConfig;
  title: string;
  onImport: (grid: PatternGrid, config: PatternConfig, title: string) => void;
}

const ExportPanel: React.FC<ExportPanelProps> = ({
  grid,
  palette,
  config,
  title,
  onImport,
}) => {
  const [exporting, setExporting] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // PNG 导出选项
  const [pngOptions, setPngOptions] = useState<ExportOptions>({
    cellSize: 24,
    showGrid: true,
    showColorCode: true,
    background: 'white',
  });

  const fileInputRef = useRef<HTMLInputElement>(null);

  const safeTitle = title || 'pindou_project';

  // 导出 PNG
  const handleExportPNG = useCallback(async () => {
    setExporting('png');
    setError(null);
    try {
      const blob = await exportPNG(grid, palette, pngOptions);
      downloadBlob(blob, `${safeTitle}.png`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'PNG 导出失败');
    } finally {
      setExporting(null);
    }
  }, [grid, palette, pngOptions, safeTitle]);

  // 导出 PDF
  const handleExportPDF = useCallback(async () => {
    setExporting('pdf');
    setError(null);
    try {
      const blob = await exportPDF(grid, palette, safeTitle);
      downloadBlob(blob, `${safeTitle}.pdf`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'PDF 导出失败');
    } finally {
      setExporting(null);
    }
  }, [grid, palette, safeTitle]);

  // 导出 Excel
  const handleExportExcel = useCallback(async () => {
    setExporting('excel');
    setError(null);
    try {
      const blob = await exportExcel(grid, palette, safeTitle);
      downloadBlob(blob, `${safeTitle}.xlsx`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Excel 导出失败');
    } finally {
      setExporting(null);
    }
  }, [grid, palette, safeTitle]);

  // 导出 JSON
  const handleExportJSON = useCallback(() => {
    setExporting('json');
    setError(null);
    try {
      const jsonStr = exportJSON(grid, config, safeTitle);
      const blob = new Blob([jsonStr], { type: 'application/json' });
      downloadBlob(blob, `${safeTitle}.json`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'JSON 导出失败');
    } finally {
      setExporting(null);
    }
  }, [grid, config, safeTitle]);

  // 导入 JSON
  const handleImportJSON = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;
      setError(null);
      const reader = new FileReader();
      reader.onload = (ev) => {
        try {
          const json = ev.target?.result as string;
          const { grid: importedGrid, config: importedConfig, title: importedTitle } =
            importJSON(json);
          onImport(importedGrid, importedConfig, importedTitle);
        } catch (err) {
          setError(err instanceof Error ? err.message : 'JSON 导入失败');
        }
      };
      reader.onerror = () => setError('文件读取失败');
      reader.readAsText(file);
      // 重置 input 以便重复选择同一文件
      e.target.value = '';
    },
    [onImport]
  );

  const updatePngOption = <K extends keyof ExportOptions>(
    key: K,
    value: ExportOptions[K]
  ) => {
    setPngOptions((prev) => ({ ...prev, [key]: value }));
  };

  return (
    <div className="flex flex-col gap-4">
      {/* PNG 导出 */}
      <div className="pixel-card">
        <h3 className="text-lg mb-3" style={{ color: 'var(--color-text)' }}>
          📷 导出 PNG 图片
        </h3>
        <div className="flex flex-col gap-3">
          <div>
            <label className="font-bold text-sm mb-1 block">
              格子尺寸: {pngOptions.cellSize}px
            </label>
            <input
              type="range"
              className="pixel-slider"
              min={8}
              max={48}
              value={pngOptions.cellSize}
              onChange={(e) => updatePngOption('cellSize', Number(e.target.value))}
            />
            <p className="text-xs" style={{ color: 'var(--color-text-light)' }}>
              输出图片尺寸: {grid.width * pngOptions.cellSize} × {grid.height * pngOptions.cellSize} px
            </p>
          </div>

          <div className="flex gap-4 flex-wrap">
            <label className="flex items-center gap-2 cursor-pointer text-sm">
              <input
                type="checkbox"
                checked={pngOptions.showGrid}
                onChange={(e) => updatePngOption('showGrid', e.target.checked)}
              />
              网格线
            </label>
            <label className="flex items-center gap-2 cursor-pointer text-sm">
              <input
                type="checkbox"
                checked={pngOptions.showColorCode}
                onChange={(e) => updatePngOption('showColorCode', e.target.checked)}
              />
              色号标注
            </label>
          </div>

          <div>
            <label className="font-bold text-sm mb-1 block">背景</label>
            <select
              className="pixel-select"
              value={pngOptions.background}
              onChange={(e) =>
                updatePngOption('background', e.target.value as 'white' | 'transparent')
              }
            >
              <option value="white">白色背景</option>
              <option value="transparent">透明背景</option>
            </select>
          </div>

          <button
            className="pixel-btn primary"
            onClick={handleExportPNG}
            disabled={exporting === 'png'}
            style={{ justifyContent: 'center' }}
          >
            {exporting === 'png' ? '导出中...' : '下载 PNG'}
          </button>
        </div>
      </div>

      {/* PDF 导出 */}
      <div className="pixel-card">
        <h3 className="text-lg mb-3" style={{ color: 'var(--color-text)' }}>
          📄 导出 PDF 文档
        </h3>
        <p className="text-sm mb-3" style={{ color: 'var(--color-text-light)' }}>
          包含图纸页 (带色号标注) 和用量清单页, A4 横向
        </p>
        <button
          className="pixel-btn blue"
          onClick={handleExportPDF}
          disabled={exporting === 'pdf'}
          style={{ justifyContent: 'center' }}
        >
          {exporting === 'pdf' ? '导出中...' : '下载 PDF'}
        </button>
      </div>

      {/* Excel 导出 */}
      <div className="pixel-card">
        <h3 className="text-lg mb-3" style={{ color: 'var(--color-text)' }}>
          📊 导出 Excel 表格
        </h3>
        <p className="text-sm mb-3" style={{ color: 'var(--color-text-light)' }}>
          用量清单 (.xlsx), 包含色号、名称、数量、包数
        </p>
        <button
          className="pixel-btn green"
          onClick={handleExportExcel}
          disabled={exporting === 'excel'}
          style={{ justifyContent: 'center' }}
        >
          {exporting === 'excel' ? '导出中...' : '下载 Excel'}
        </button>
      </div>

      {/* JSON 导出/导入 */}
      <div className="pixel-card">
        <h3 className="text-lg mb-3" style={{ color: 'var(--color-text)' }}>
          💾 项目文件 (JSON)
        </h3>
        <p className="text-sm mb-3" style={{ color: 'var(--color-text-light)' }}>
          导出项目文件可在之后导入继续编辑, 包含网格数据与配置
        </p>
        <div className="flex gap-3 flex-wrap">
          <button
            className="pixel-btn purple"
            onClick={handleExportJSON}
            disabled={exporting === 'json'}
          >
            {exporting === 'json' ? '导出中...' : '导出 JSON'}
          </button>
          <button
            className="pixel-btn"
            onClick={() => fileInputRef.current?.click()}
          >
            导入 JSON
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept=".json,application/json"
            style={{ display: 'none' }}
            onChange={handleImportJSON}
          />
        </div>
      </div>

      {/* 错误提示 */}
      {error && (
        <div
          className="pixel-card"
          style={{
            background: '#FFF0F0',
            borderColor: '#EF4444',
          }}
        >
          <p className="text-sm" style={{ color: '#DC2626' }}>❌ {error}</p>
        </div>
      )}
    </div>
  );
};

export default ExportPanel;
