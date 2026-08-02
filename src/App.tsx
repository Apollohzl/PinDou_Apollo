// ========== App.tsx ==========
// 主应用: 管理全局状态, 步骤流程, 组件切换
// 步骤: 1.上传 → 2.设置 → 3.生成 → 4.编辑 → 5.导出

import React, { useState, useCallback, useRef, lazy, Suspense, useEffect } from 'react';
import type {
  PatternGrid,
  PatternConfig,
  Palette,
} from './lib/types';
import { processImage } from './lib/image/pipeline';
import { getPalette, getAllPalettes } from './lib/palettes';
import { HistoryManager } from './lib/editor/history';
import {
  buildReducedPalette,
  remapToFullPalette,
} from './utils/palette';

import Header from './components/Header';
import Footer from './components/Footer';
import ImageUploader from './components/ImageUploader';
import SettingsPanel from './components/SettingsPanel';
import PatternCanvas from './components/PatternCanvas';
import PatternEditor from './components/PatternEditor';
import UsageStats from './components/UsageStats';
import ExportPanel from './components/ExportPanel';
import ProductionGuide from './components/ProductionGuide';

// 懒加载 3D 预览组件 (内部动态导入 three)
const LazyThreeDPreview = lazy(() => import('./components/ThreeDPreview'));

// ---------- 默认配置 ----------
const initialPalette = getPalette('mard');

const DEFAULT_CONFIG: PatternConfig = {
  beadSize: initialPalette.size,
  brand: 'mard',
  width: 32,
  height: 32,
  dither: 'floyd-steinberg',
  maxColors: 16,
  removeBackground: false,
  backgroundThreshold: 30,
  denoise: false,
  minArea: 4,
  enhanceContours: false,
};

// ---------- 工作区标签类型 ----------
type WorkspaceTab = 'edit' | 'stats' | '3d' | 'guide';

const WORKSPACE_TABS: { id: WorkspaceTab; label: string; icon: string }[] = [
  { id: 'edit', label: '编辑图纸', icon: '🖌️' },
  { id: 'stats', label: '用量统计', icon: '📊' },
  { id: '3d', label: '3D预览', icon: '🧊' },
  { id: 'guide', label: '制作引导', icon: '📖' },
];

// ---------- 主组件 ----------
const App: React.FC = () => {
  // 步骤状态
  const [step, setStep] = useState(1);
  const [maxStep, setMaxStep] = useState(1);
  // 导入模式: 从 JSON 导入的项目, 禁止返回步骤 1-3
  const [isImported, setIsImported] = useState(false);

  // 图片状态
  const [imageData, setImageData] = useState<ImageData | null>(null);
  const [imageElement, setImageElement] = useState<HTMLImageElement | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [naturalSize, setNaturalSize] = useState<{ width: number; height: number } | null>(null);
  const objectUrlRef = useRef<string | null>(null);

  // 配置与色卡
  const [config, setConfig] = useState<PatternConfig>(DEFAULT_CONFIG);
  const [palette, setPalette] = useState<Palette>(initialPalette);
  const allPalettes = useRef(getAllPalettes());

  // 图纸状态
  const [patternGrid, setPatternGrid] = useState<PatternGrid | null>(null);
  const [previewImageData, setPreviewImageData] = useState<ImageData | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [processError, setProcessError] = useState<string | null>(null);

  // 项目信息
  const [projectTitle, setProjectTitle] = useState('未命名项目');

  // 工作区标签
  const [workspaceTab, setWorkspaceTab] = useState<WorkspaceTab>('edit');

  // 历史管理
  const historyRef = useRef(new HistoryManager(50));

  // 步骤3结果预览选项
  const [previewShowGrid, setPreviewShowGrid] = useState(true);
  const [previewShowCode, setPreviewShowCode] = useState(false);
  const [previewZoom, setPreviewZoom] = useState(1);

  // ---------- 清理 object URL ----------
  useEffect(() => {
    return () => {
      if (objectUrlRef.current) {
        URL.revokeObjectURL(objectUrlRef.current);
      }
    };
  }, []);

  // ---------- 图片加载 ----------
  const handleImageLoaded = useCallback(
    (
      imgData: ImageData,
      imgElement: HTMLImageElement,
      fileName: string,
      natW: number,
      natH: number
    ) => {
      // 撤销旧的 object URL
      if (objectUrlRef.current) {
        URL.revokeObjectURL(objectUrlRef.current);
      }
      objectUrlRef.current = imgElement.src;

      setImageData(imgData);
      setImageElement(imgElement);
      setPreviewUrl(imgElement.src);
      setNaturalSize({ width: natW, height: natH });
      setProjectTitle(fileName.replace(/\.[^.]+$/, '') || '未命名项目');
      setMaxStep(2);
      setStep(2);
      setIsImported(false);
      setProcessError(null);
    },
    []
  );

  // ---------- 目标尺寸变化 ----------
  const handleTargetSizeChange = useCallback((w: number, h: number) => {
    setConfig((c) => ({ ...c, width: w, height: h }));
  }, []);

  // ---------- 生成图纸 ----------
  const handleGenerate = useCallback(() => {
    if (!imageData) return;
    setIsProcessing(true);
    setProcessError(null);

    // 使用双 rAF 确保 loading UI 先渲染
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        try {
          const fullPalette = getPalette(config.brand);
          const { grid: rawGrid, previewImageData: preview } = processImage(
            imageData,
            config,
            fullPalette.colors
          );

          // 从预览图重建缩减色卡
          const reducedPalette = buildReducedPalette(rawGrid, preview, fullPalette.colors);

          // 将网格下标重映射为完整色卡下标
          const grid = remapToFullPalette(rawGrid, reducedPalette.colors, fullPalette.colors);

          setPatternGrid(grid);
          setPreviewImageData(preview);
          setPalette(fullPalette);
          setMaxStep(5);
          setStep(3);
          setWorkspaceTab('edit');
          historyRef.current.clear();
        } catch (err) {
          setProcessError(
            err instanceof Error ? err.message : '图纸生成失败, 请重试'
          );
        } finally {
          setIsProcessing(false);
        }
      });
    });
  }, [imageData, config]);

  // ---------- 网格变化 (来自编辑器) ----------
  const handleGridChange = useCallback((grid: PatternGrid) => {
    setPatternGrid(grid);
  }, []);

  // ---------- JSON 导入 ----------
  const handleImport = useCallback(
    (grid: PatternGrid, importedConfig: PatternConfig, title: string) => {
      const fullPalette = getPalette(importedConfig.brand);
      setPatternGrid(grid);
      setConfig(importedConfig);
      setPalette(fullPalette);
      setProjectTitle(title);
      setMaxStep(5);
      setStep(4);
      setWorkspaceTab('edit');
      setIsImported(true);
      historyRef.current.clear();
      setProcessError(null);
    },
    []
  );

  // ---------- 步骤导航 ----------
  const handleStepClick = useCallback(
    (targetStep: number) => {
      // 导入模式下禁止访问步骤 1-3
      if (isImported && targetStep < 4) return;
      if (targetStep > maxStep) return;
      setStep(targetStep);
    },
    [maxStep, isImported]
  );

  // ---------- 渲染各步骤内容 ----------
  const renderStep = () => {
    switch (step) {
      case 1:
        return (
          <ImageUploader
            onImageLoaded={handleImageLoaded}
            previewUrl={previewUrl}
            naturalSize={naturalSize}
            targetWidth={config.width}
            targetHeight={config.height}
            onTargetSizeChange={handleTargetSizeChange}
            onNext={() => setStep(2)}
            onImportJSON={handleImport}
          />
        );

      case 2:
        return (
          <SettingsPanel
            config={config}
            onConfigChange={setConfig}
            onGenerate={handleGenerate}
            isProcessing={isProcessing}
            hasImage={!!imageData}
            palettes={allPalettes.current}
            onBack={() => setStep(1)}
          />
        );

      case 3:
        return (
          <div className="flex flex-col gap-4">
            {processError ? (
              <div
                className="pixel-card"
                style={{ background: '#FFF0F0', borderColor: '#EF4444' }}
              >
                <p className="text-lg" style={{ color: '#DC2626' }}>
                  生成失败
                </p>
                <p className="text-sm mt-2">{processError}</p>
                <button
                  className="pixel-btn primary mt-4"
                  onClick={() => setStep(2)}
                >
                  返回设置
                </button>
              </div>
            ) : patternGrid ? (
              <>
                <div className="pixel-card">
                  <div className="flex items-center justify-between flex-wrap gap-3 mb-4">
                    <div>
                      <h2 className="text-xl" style={{ color: 'var(--color-text)' }}>
                        图纸生成完成! 🎉
                      </h2>
                      <p className="text-sm mt-1" style={{ color: 'var(--color-text-light)' }}>
                        {projectTitle} · {config.width}×{config.height} 格 · {palette.name}
                      </p>
                    </div>
                    <div className="flex gap-2 flex-wrap">
                      <label className="flex items-center gap-2 cursor-pointer text-sm">
                        <input
                          type="checkbox"
                          checked={previewShowGrid}
                          onChange={(e) => setPreviewShowGrid(e.target.checked)}
                        />
                        网格线
                      </label>
                      <label className="flex items-center gap-2 cursor-pointer text-sm">
                        <input
                          type="checkbox"
                          checked={previewShowCode}
                          onChange={(e) => setPreviewShowCode(e.target.checked)}
                        />
                        色号
                      </label>
                      <div className="flex items-center gap-1">
                        <button
                          className="tool-btn"
                          style={{ width: '32px', height: '32px', fontSize: '14px' }}
                          onClick={() => setPreviewZoom((z) => Math.max(0.25, z - 0.25))}
                        >
                          −
                        </button>
                        <span className="text-sm font-bold" style={{ minWidth: '36px', textAlign: 'center' }}>
                          {Math.round(previewZoom * 100)}%
                        </span>
                        <button
                          className="tool-btn"
                          style={{ width: '32px', height: '32px', fontSize: '14px' }}
                          onClick={() => setPreviewZoom((z) => Math.min(4, z + 0.25))}
                        >
                          +
                        </button>
                      </div>
                    </div>
                  </div>

                  <PatternCanvas
                    grid={patternGrid}
                    palette={palette}
                    showGrid={previewShowGrid}
                    showColorCode={previewShowCode}
                    zoom={previewZoom}
                    editable={false}
                  />
                </div>

                <div className="flex justify-between gap-3 flex-wrap">
                  <button className="pixel-btn" onClick={() => setStep(2)}>
                    ← 返回重新设置
                  </button>
                  <button
                    className="pixel-btn primary"
                    onClick={() => {
                      setStep(4);
                      setWorkspaceTab('edit');
                    }}
                  >
                    进入编辑 →
                  </button>
                </div>
              </>
            ) : (
              <div className="pixel-card text-center">
                <div className="pixel-loader" style={{ margin: '0 auto 16px' }} />
                <p className="text-lg" style={{ color: 'var(--color-text)' }}>
                  正在生成图纸...
                </p>
                <p className="text-sm mt-2" style={{ color: 'var(--color-text-light)' }}>
                  这个过程可能需要几秒钟
                </p>
              </div>
            )}
          </div>
        );

      case 4:
        return patternGrid ? (
          <div className="flex flex-col gap-4">
            {/* 工作区标签栏 */}
            <div className="tab-bar">
              {WORKSPACE_TABS.map((tab) => (
                <button
                  key={tab.id}
                  className={`tab-btn ${workspaceTab === tab.id ? 'active' : ''}`}
                  onClick={() => setWorkspaceTab(tab.id)}
                >
                  {tab.icon} {tab.label}
                </button>
              ))}
              <button
                className="tab-btn"
                onClick={() => setStep(5)}
                style={{ marginLeft: 'auto', background: 'var(--color-accent)' }}
              >
                📤 导出
              </button>
            </div>

            {/* 标签内容 */}
            {workspaceTab === 'edit' && (
              <PatternEditor
                grid={patternGrid}
                palette={palette}
                onGridChange={handleGridChange}
                historyRef={historyRef}
              />
            )}

            {workspaceTab === 'stats' && (
              <UsageStats grid={patternGrid} palette={palette} />
            )}

            {workspaceTab === '3d' && (
              <Suspense
                fallback={
                  <div className="pixel-card text-center">
                    <div className="pixel-loader" style={{ margin: '0 auto 16px' }} />
                    <p className="text-sm" style={{ color: 'var(--color-text-light)' }}>
                      加载 3D 预览组件...
                    </p>
                  </div>
                }
              >
                <LazyThreeDPreview grid={patternGrid} palette={palette} />
              </Suspense>
            )}

            {workspaceTab === 'guide' && (
              <ProductionGuide grid={patternGrid} palette={palette} />
            )}
          </div>
        ) : null;

      case 5:
        return patternGrid ? (
          <div className="flex flex-col gap-4">
            <div className="flex items-center justify-between flex-wrap gap-3">
              <h2 className="text-xl" style={{ color: 'var(--color-text)' }}>
                📤 导出
              </h2>
              <button className="pixel-btn" onClick={() => setStep(4)}>
                ← 返回编辑
              </button>
            </div>

            {/* 项目标题编辑 */}
            <div className="pixel-card">
              <label className="font-bold text-sm mb-2 block">项目标题</label>
              <input
                type="text"
                className="pixel-input w-full"
                value={projectTitle}
                onChange={(e) => setProjectTitle(e.target.value)}
                placeholder="输入项目标题"
              />
            </div>

            <ExportPanel
              grid={patternGrid}
              palette={palette}
              config={config}
              title={projectTitle}
              onImport={handleImport}
            />
          </div>
        ) : null;

      default:
        return null;
    }
  };

  return (
    <div className="app-container">
      <Header currentStep={step} maxStep={maxStep} onStepClick={handleStepClick} isImported={isImported} />
      <main className="app-main">
        {isProcessing && step !== 3 ? (
          <div className="pixel-card text-center" style={{ padding: '48px' }}>
            <div className="pixel-loader" style={{ margin: '0 auto 16px' }} />
            <p className="text-lg" style={{ color: 'var(--color-text)' }}>
              正在处理图片...
            </p>
            <p className="text-sm mt-2" style={{ color: 'var(--color-text-light)' }}>
              像素化 → 量化 → 调色板匹配 → 抖动 → 后处理
            </p>
          </div>
        ) : (
          renderStep()
        )}
      </main>
      <Footer />
    </div>
  );
};

export default App;
