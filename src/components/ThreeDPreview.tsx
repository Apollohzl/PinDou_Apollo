// ========== ThreeDPreview.tsx ==========
// 3D 拼豆预览: 使用 Three.js 渲染, 每颗豆子用圆柱体表示
// 动态导入 three 库, 支持旋转、缩放、自动旋转

import React, { useEffect, useRef, useState } from 'react';
import type { PatternGrid, Palette, Preview3DConfig } from '../lib/types';

interface ThreeDPreviewProps {
  grid: PatternGrid;
  palette: Palette;
}

const ThreeDPreview: React.FC<ThreeDPreviewProps> = ({ grid, palette }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const rendererRef = useRef<any>(null);
  const sceneRef = useRef<any>(null);
  const cameraRef = useRef<any>(null);
  const controlsRef = useRef<any>(null);
  const animationIdRef = useRef<number>(0);
  const beadGroupRef = useRef<any>(null);
  const gridLinesRef = useRef<any>(null);

  const [config, setConfig] = useState<Preview3DConfig>({
    beadSize: 1,
    showHoles: true,
    autoRotate: true,
    showGrid: true,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // 初始化 Three.js 场景
  useEffect(() => {
    let mounted = true;

    const initScene = async () => {
      try {
        // 动态导入 three
        const THREE = await import('three');
        const { OrbitControls } = await import(
          'three/examples/jsm/controls/OrbitControls.js'
        );

        if (!mounted || !containerRef.current) return;

        const container = containerRef.current;
        const width = container.clientWidth;
        const height = container.clientHeight;

        // 场景
        const scene = new THREE.Scene();
        scene.background = new THREE.Color(0x1a1a2e);

        // 相机
        const camera = new THREE.PerspectiveCamera(50, width / height, 0.1, 1000);
        const maxDim = Math.max(grid.width, grid.height);
        camera.position.set(maxDim * 1.2, maxDim * 1.5, maxDim * 1.2);
        camera.lookAt(grid.width / 2, 0, grid.height / 2);

        // 渲染器
        const renderer = new THREE.WebGLRenderer({ antialias: true });
        renderer.setSize(width, height);
        renderer.setPixelRatio(window.devicePixelRatio);
        container.appendChild(renderer.domElement);

        // 光照
        const ambient = new THREE.AmbientLight(0xffffff, 0.6);
        scene.add(ambient);

        const dirLight = new THREE.DirectionalLight(0xffffff, 0.8);
        dirLight.position.set(10, 20, 10);
        scene.add(dirLight);

        const dirLight2 = new THREE.DirectionalLight(0xffe0b0, 0.3);
        dirLight2.position.set(-10, 10, -10);
        scene.add(dirLight2);

        // 控制器
        const controls = new OrbitControls(camera, renderer.domElement);
        controls.enableDamping = true;
        controls.dampingFactor = 0.08;
        controls.target.set(grid.width / 2, 0, grid.height / 2);

        // 底板
        const baseGeo = new THREE.BoxGeometry(
          grid.width + 0.5,
          0.3,
          grid.height + 0.5
        );
        const baseMat = new THREE.MeshLambertMaterial({ color: 0xf5e6c8 });
        const base = new THREE.Mesh(baseGeo, baseMat);
        base.position.set(grid.width / 2, -0.15, grid.height / 2);
        scene.add(base);

        // 存储引用
        sceneRef.current = scene;
        cameraRef.current = camera;
        rendererRef.current = renderer;
        controlsRef.current = controls;

        setLoading(false);
      } catch (err) {
        console.error('Three.js 初始化失败:', err);
        setError(err instanceof Error ? err.message : '3D 渲染初始化失败');
        setLoading(false);
      }
    };

    initScene();

    // 清理
    return () => {
      mounted = false;
      if (animationIdRef.current) {
        cancelAnimationFrame(animationIdRef.current);
      }
      if (controlsRef.current) {
        controlsRef.current?.dispose?.();
      }
      if (rendererRef.current) {
        rendererRef.current.dispose?.();
        const container = containerRef.current;
        if (container && rendererRef.current.domElement) {
          container.removeChild(rendererRef.current.domElement);
        }
      }
      // 清理几何体和材质
      if (sceneRef.current) {
        sceneRef.current.traverse((obj: any) => {
          if (obj.geometry) obj.geometry.dispose?.();
          if (obj.material) {
            if (Array.isArray(obj.material)) {
              obj.material.forEach((m: any) => m.dispose?.());
            } else {
              obj.material.dispose?.();
            }
          }
        });
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // 构建/更新豆子
  useEffect(() => {
    if (!sceneRef.current || loading) return;

    let mounted = true;
    const buildBeads = async () => {
      const THREE = await import('three');
      if (!mounted || !sceneRef.current) return;

      // 移除旧的豆子组
      if (beadGroupRef.current) {
        sceneRef.current.remove(beadGroupRef.current);
        beadGroupRef.current.traverse((obj: any) => {
          if (obj.geometry) obj.geometry.dispose();
          if (obj.material) {
            if (Array.isArray(obj.material)) {
              obj.material.forEach((m: any) => m.dispose());
            } else {
              obj.material.dispose();
            }
          }
        });
      }

      const group = new THREE.Group();
      const colors = palette.colors;
      const beadRadius = 0.42;
      const beadHeight = 0.5;

      // 创建几何体 (可复用)
      const beadGeo = new THREE.CylinderGeometry(
        beadRadius,
        beadRadius,
        beadHeight,
        16
      );

      // 孔洞几何体
      let holeGeo: any = null;
      if (config.showHoles) {
        holeGeo = new THREE.CylinderGeometry(0.1, 0.1, beadHeight + 0.02, 8);
      }

      // 为每个颜色创建材质 (缓存)
      const materialCache = new Map<number, any>();

      for (let y = 0; y < grid.height; y++) {
        for (let x = 0; x < grid.width; x++) {
          const idx = grid.data[y * grid.width + x];
          if (idx < 0 || idx >= colors.length) continue;

          // 获取或创建材质
          let mat = materialCache.get(idx);
          if (!mat) {
            const c = colors[idx].rgb;
            mat = new THREE.MeshLambertMaterial({
              color: new THREE.Color(c.r / 255, c.g / 255, c.b / 255),
            });
            materialCache.set(idx, mat);
          }

          // 豆子主体
          const bead = new THREE.Mesh(beadGeo, mat);
          bead.position.set(x + 0.5, beadHeight / 2, y + 0.5);
          group.add(bead);

          // 孔洞 (深色圆柱)
          if (holeGeo) {
            const holeMat = new THREE.MeshLambertMaterial({
              color: 0x222222,
            });
            const hole = new THREE.Mesh(holeGeo, holeMat);
            hole.position.set(x + 0.5, beadHeight / 2, y + 0.5);
            group.add(hole);
          }
        }
      }

      sceneRef.current.add(group);
      beadGroupRef.current = group;
    };

    buildBeads();

    return () => {
      mounted = false;
    };
  }, [grid, palette, config.showHoles, loading]);

  // 自动旋转
  useEffect(() => {
    if (!controlsRef.current || loading) return;

    controlsRef.current.autoRotate = config.autoRotate;
    controlsRef.current.autoRotateSpeed = 1.5;
  }, [config.autoRotate, loading]);

  // 网格线显示/隐藏
  useEffect(() => {
    if (!sceneRef.current || loading) return;
    let mounted = true;

    const updateGrid = async () => {
      const THREE = await import('three');
      if (!mounted || !sceneRef.current) return;

      // 移除旧网格线
      if (gridLinesRef.current) {
        sceneRef.current.remove(gridLinesRef.current);
        gridLinesRef.current.geometry?.dispose?.();
        gridLinesRef.current.material?.dispose?.();
        gridLinesRef.current = null;
      }

      if (config.showGrid) {
        // 构建网格线段 (每条线两个端点)
        const points: number[] = [];
        // 垂直线 (沿 Z 轴方向)
        for (let x = 0; x <= grid.width; x++) {
          points.push(x, 0, 0, x, 0, grid.height);
        }
        // 水平线 (沿 X 轴方向)
        for (let y = 0; y <= grid.height; y++) {
          points.push(0, 0, y, grid.width, 0, y);
        }

        const geometry = new THREE.BufferGeometry();
        geometry.setAttribute('position', new THREE.Float32BufferAttribute(points, 3));
        const material = new THREE.LineBasicMaterial({
          color: 0x8b7355,
          transparent: true,
          opacity: 0.6,
        });
        const gridLines = new THREE.LineSegments(geometry, material);
        gridLines.position.y = 0.01; // 略高于底板避免 z-fighting
        sceneRef.current.add(gridLines);
        gridLinesRef.current = gridLines;
      }
    };

    updateGrid();

    return () => {
      mounted = false;
    };
  }, [config.showGrid, grid.width, grid.height, loading]);

  // 渲染循环
  useEffect(() => {
    if (!rendererRef.current || !sceneRef.current || !cameraRef.current || loading) return;

    const animate = () => {
      animationIdRef.current = requestAnimationFrame(animate);
      if (controlsRef.current) {
        controlsRef.current.update();
      }
      rendererRef.current.render(sceneRef.current, cameraRef.current);
    };
    animate();

    return () => {
      if (animationIdRef.current) {
        cancelAnimationFrame(animationIdRef.current);
      }
    };
  }, [loading]);

  // 窗口大小变化
  useEffect(() => {
    if (!rendererRef.current || !cameraRef.current) return;

    const handleResize = () => {
      const container = containerRef.current;
      if (!container) return;
      const width = container.clientWidth;
      const height = container.clientHeight;
      cameraRef.current.aspect = width / height;
      cameraRef.current.updateProjectionMatrix();
      rendererRef.current.setSize(width, height);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [loading]);

  if (error) {
    return (
      <div className="pixel-card text-center">
        <p className="text-lg" style={{ color: '#EF4444' }}>
          3D 预览加载失败
        </p>
        <p className="text-sm mt-2" style={{ color: 'var(--color-text-light)' }}>
          {error}
        </p>
      </div>
    );
  }

  return (
    <div className="pixel-card">
      <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
        <h2 className="text-xl" style={{ color: 'var(--color-text)' }}>
          🧊 3D 预览
        </h2>
        <div className="flex gap-3 flex-wrap">
          <label className="flex items-center gap-2 cursor-pointer text-sm">
            <input
              type="checkbox"
              checked={config.autoRotate}
              onChange={(e) => setConfig((c) => ({ ...c, autoRotate: e.target.checked }))}
            />
            自动旋转
          </label>
          <label className="flex items-center gap-2 cursor-pointer text-sm">
            <input
              type="checkbox"
              checked={config.showHoles}
              onChange={(e) => setConfig((c) => ({ ...c, showHoles: e.target.checked }))}
            />
            显示孔洞
          </label>
          <label className="flex items-center gap-2 cursor-pointer text-sm">
            <input
              type="checkbox"
              checked={config.showGrid}
              onChange={(e) => setConfig((c) => ({ ...c, showGrid: e.target.checked }))}
            />
            显示网格线
          </label>
        </div>
      </div>

      <div className="three-container" ref={containerRef}>
        {loading && (
          <div
            style={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              color: 'white',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '12px',
            }}
          >
            <div className="pixel-loader" />
            <span className="text-sm">加载 3D 引擎中...</span>
          </div>
        )}
      </div>

      <p className="text-xs mt-2" style={{ color: 'var(--color-text-light)' }}>
        鼠标拖拽旋转 · 滚轮缩放 · 右键平移
      </p>
    </div>
  );
};

export default ThreeDPreview;
