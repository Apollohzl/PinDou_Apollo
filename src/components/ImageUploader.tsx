// ========== ImageUploader.tsx ==========
// 图片上传组件: 支持拖拽上传、点击上传、预览与尺寸设置
// 同时提供 JSON 项目文件导入入口 (首页即可导入已有项目)

import React, { useState, useCallback, useRef } from 'react';
import { fileToImageData } from '../utils/palette';
import { importJSON } from '../lib/export/json';
import type { PatternGrid, PatternConfig } from '../lib/types';

interface ImageUploaderProps {
  onImageLoaded: (
    imageData: ImageData,
    imageElement: HTMLImageElement,
    fileName: string,
    naturalWidth: number,
    naturalHeight: number
  ) => void;
  previewUrl: string | null;
  naturalSize: { width: number; height: number } | null;
  targetWidth: number;
  targetHeight: number;
  onTargetSizeChange: (width: number, height: number) => void;
  onNext: () => void;
  onImportJSON: (grid: PatternGrid, config: PatternConfig, title: string) => void;
}

const ImageUploader: React.FC<ImageUploaderProps> = ({
  onImageLoaded,
  previewUrl,
  naturalSize,
  targetWidth,
  targetHeight,
  onTargetSizeChange,
  onNext,
  onImportJSON,
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [importError, setImportError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const jsonInputRef = useRef<HTMLInputElement>(null);

  const handleFile = useCallback(
    async (file: File) => {
      if (!file.type.startsWith('image/')) {
        setError('请选择图片文件 (PNG, JPG, GIF 等)');
        return;
      }
      setLoading(true);
      setError(null);
      try {
        const { imageData, element } = await fileToImageData(file);
        onImageLoaded(
          imageData,
          element,
          file.name,
          element.naturalWidth,
          element.naturalHeight
        );
      } catch (err) {
        setError(err instanceof Error ? err.message : '图片加载失败');
      } finally {
        setLoading(false);
      }
    },
    [onImageLoaded]
  );

  // JSON 导入处理
  const handleImportJSON = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;
      setImportError(null);
      const reader = new FileReader();
      reader.onload = (ev) => {
        try {
          const json = ev.target?.result as string;
          const { grid, config: importedConfig, title } = importJSON(json);
          onImportJSON(grid, importedConfig, title);
        } catch (err) {
          setImportError(err instanceof Error ? err.message : 'JSON 导入失败');
        }
      };
      reader.onerror = () => setImportError('文件读取失败');
      reader.readAsText(file);
      // 重置 input 以便重复选择同一文件
      e.target.value = '';
    },
    [onImportJSON]
  );

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);
      const file = e.dataTransfer.files[0];
      if (file) handleFile(file);
    },
    [handleFile]
  );

  const handleClick = useCallback(() => {
    fileInputRef.current?.click();
  }, []);

  const handleFileChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) handleFile(file);
    },
    [handleFile]
  );

  // 保持宽高比
  const handleWidthChange = (w: number) => {
    const clamped = Math.max(4, Math.min(200, Math.floor(w || 1)));
    onTargetSizeChange(clamped, targetHeight);
  };

  const handleHeightChange = (h: number) => {
    const clamped = Math.max(4, Math.min(200, Math.floor(h || 1)));
    onTargetSizeChange(targetWidth, clamped);
  };

  // 自动按原图宽高比设置
  const autoFit = () => {
    if (!naturalSize) return;
    const ratio = naturalSize.width / naturalSize.height;
    let w = targetWidth;
    let h = Math.round(w / ratio);
    if (h > 200) {
      h = 200;
      w = Math.round(h * ratio);
    }
    onTargetSizeChange(Math.max(4, w), Math.max(4, h));
  };

  return (
    <div className="pixel-card" style={{ maxWidth: '800px', margin: '0 auto' }}>
      <h2 className="text-xl mb-4" style={{ color: 'var(--color-text)' }}>
        上传图片
      </h2>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        style={{ display: 'none' }}
        onChange={handleFileChange}
      />
      <input
        ref={jsonInputRef}
        type="file"
        accept=".json,application/json"
        style={{ display: 'none' }}
        onChange={handleImportJSON}
      />

      {!previewUrl && (
        <>
          <div
            className={`dropzone ${isDragging ? 'dragover' : ''}`}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={handleClick}
          >
            {loading ? (
              <>
                <div className="pixel-loader" />
                <p className="text-sm" style={{ color: 'var(--color-text-light)' }}>
                  正在加载图片...
                </p>
              </>
            ) : (
              <>
                <div className="dropzone-icon animate-float">🖼️</div>
                <p className="text-lg" style={{ color: 'var(--color-text)' }}>
                  拖拽图片到此处, 或点击选择文件
                </p>
                <p className="text-xs" style={{ color: 'var(--color-text-light)' }}>
                  支持 PNG / JPG / GIF / WebP
                </p>
              </>
            )}
          </div>

          {/* JSON 导入入口 */}
          <div
            className="mt-4"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              padding: '16px',
              background: 'var(--bg-secondary)',
              borderRadius: 'var(--radius-sm)',
              border: '3px dashed var(--color-border)',
              flexWrap: 'wrap',
            }}
          >
            <div style={{ fontSize: '28px' }}>💾</div>
            <div style={{ flex: '1', minWidth: '200px' }}>
              <p className="font-bold text-sm" style={{ color: 'var(--color-text)' }}>
                已有项目? 导入 JSON 文件
              </p>
              <p className="text-xs" style={{ color: 'var(--color-text-light)' }}>
                导入后可直接进入编辑或导出页面
              </p>
            </div>
            <button
              className="pixel-btn purple"
              onClick={() => jsonInputRef.current?.click()}
            >
              📂 导入 JSON
            </button>
          </div>

          {/* 导入错误提示 */}
          {importError && (
            <div
              className="pixel-card mt-4"
              style={{
                background: '#FFF0F0',
                borderColor: '#EF4444',
                color: '#DC2626',
              }}
            >
              <p className="text-sm">❌ {importError}</p>
            </div>
          )}
        </>
      )}

      {error && (
        <div
          className="pixel-card mt-4"
          style={{
            background: '#FFF0F0',
            borderColor: '#EF4444',
            color: '#DC2626',
          }}
        >
          <p className="text-sm">{error}</p>
        </div>
      )}

      {previewUrl && (
        <div className="flex flex-col gap-4 mt-4">
          {/* 图片预览 */}
          <div
            style={{
              border: '3px solid var(--color-border)',
              borderRadius: 'var(--radius-sm)',
              overflow: 'hidden',
              background: 'var(--bg-secondary)',
              padding: '8px',
              textAlign: 'center',
            }}
          >
            <img
              src={previewUrl}
              alt="预览"
              style={{
                maxWidth: '100%',
                maxHeight: '300px',
                objectFit: 'contain',
                borderRadius: '4px',
              }}
            />
          </div>

          {/* 图片信息 */}
          {naturalSize && (
            <div className="flex items-center gap-4 flex-wrap">
              <span className="pixel-tag" style={{ borderColor: 'var(--color-primary)', color: 'var(--color-primary)' }}>
                原始尺寸: {naturalSize.width} × {naturalSize.height}
              </span>
              <button className="pixel-btn text-sm" onClick={handleClick}>
                重新选择
              </button>
            </div>
          )}

          <hr className="pixel-divider" />

          {/* 目标尺寸设置 */}
          <div>
            <h3 className="text-lg mb-2" style={{ color: 'var(--color-text)' }}>
              目标图纸尺寸
            </h3>
            <p className="text-sm mb-4" style={{ color: 'var(--color-text-light)' }}>
              设置图纸的宽×高 (格数), 每格对应一颗拼豆
            </p>
            <div className="flex items-center gap-3 flex-wrap">
              <div className="flex items-center gap-2">
                <label className="text-sm font-bold">宽:</label>
                <input
                  type="number"
                  className="pixel-input"
                  style={{ width: '80px' }}
                  value={targetWidth}
                  min={4}
                  max={200}
                  onChange={(e) => handleWidthChange(Number(e.target.value))}
                />
                <span className="text-sm">格</span>
              </div>
              <span className="text-lg" style={{ color: 'var(--color-border-dark)' }}>
                ×
              </span>
              <div className="flex items-center gap-2">
                <label className="text-sm font-bold">高:</label>
                <input
                  type="number"
                  className="pixel-input"
                  style={{ width: '80px' }}
                  value={targetHeight}
                  min={4}
                  max={200}
                  onChange={(e) => handleHeightChange(Number(e.target.value))}
                />
                <span className="text-sm">格</span>
              </div>
              <button className="pixel-btn purple text-sm" onClick={autoFit}>
                按比例
              </button>
            </div>
            <p className="text-xs mt-2" style={{ color: 'var(--color-text-light)' }}>
              总计 {targetWidth * targetHeight} 颗拼豆
            </p>
          </div>

          {/* 下一步 */}
          <div className="flex justify-end mt-2">
            <button className="pixel-btn primary" onClick={onNext}>
              下一步: 设置参数 →
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ImageUploader;
