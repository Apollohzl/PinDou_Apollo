<div align="center">

# 拼豆 Apollo

### 智能拼豆图纸生成工具

**上传图片 → 智能配色 → 像素编辑 → 一键导出**

[![React](https://img.shields.io/badge/React-18.3-61DAFB?logo=react&logoColor=white)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.6-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite-5.4-646CFF?logo=vite&logoColor=white)](https://vitejs.dev/)
[![Three.js](https://img.shields.io/badge/Three.js-0.169-000000?logo=threedotjs&logoColor=white)](https://threejs.org/)
[![License](https://img.shields.io/badge/License-MIT-yellow)](./LICENSE)
[![GitHub Pages](https://img.shields.io/badge/GitHub%20Pages-Live-brightgreen?logo=github&logoColor=white)](https://apollohzl.github.io/PinDou_Apollo/)

</div>

---

## 项目简介

**拼豆 Apollo** 是一个基于 Web 的智能拼豆图纸生成工具。它通过先进的图像处理算法，将任意图片一键转换为拼豆图纸，支持多品牌色卡精准匹配、像素级编辑、3D 预览、用量统计与多格式导出。

所有图像处理在浏览器本地完成，**零后端、零上传、隐私优先**。

---

## 核心特性

| 功能模块 | 说明 |
|----------|------|
| **图片上传** | 支持拖拽/点击上传 PNG/JPG/GIF/WebP，自动提取像素数据 |
| **智能配色** | CIEDE2000 色差算法 + Lab 色彩空间，精准匹配最接近的拼豆颜色 |
| **颜色量化** | Median Cut 中位切割算法，支持 2-64 色可调 |
| **抖动算法** | Floyd-Steinberg / Riemersma / Bayer 有序抖动，渐变过渡更自然 |
| **后处理** | BFS 去噪、Flood-fill 背景去除、轮廓增强 |
| **像素编辑** | 画笔/橡皮/填充/吸管/换色工具，撤销/重做（50步历史） |
| **3D 预览** | Three.js 渲染立体拼豆效果，支持旋转/缩放/自动旋转 |
| **用量统计** | 分色统计颗数与建议包数，支持颜色种类与图纸尺寸概览 |
| **制作引导** | 逐行/逐色引导模式，进度追踪，高亮当前步骤 |
| **多格式导出** | PNG（带色号网格）/ PDF（A4 横向图纸+清单）/ Excel（用量清单）/ JSON（项目文件） |
| **多品牌色卡** | Artkal S (2.6mm) / Artkal M (5mm) / Perler / Hama / Mard |
| **可爱像素风** | Press Start 2P + ZCOOL KuaiLe 字体，糖果色系像素 UI |

---

## 技术栈

| 类别 | 技术 | 说明 |
|------|------|------|
| **框架** | React 18 + TypeScript | 类型安全的组件化开发 |
| **构建** | Vite 5 | 快速构建，产物为纯静态文件 |
| **3D** | Three.js | 3D 拼豆预览（动态导入，按需加载） |
| **PDF** | jsPDF | 纯前端 PDF 生成 |
| **Excel** | SheetJS (xlsx) | 浏览器端 Excel 导出 |
| **样式** | 自定义 CSS + CSS 变量 | 像素风格精细控制 |
| **部署** | GitHub Pages + GitHub Actions | 自动构建部署 |

---

## 快速开始

### 在线使用

直接访问 **[GitHub Pages 部署地址](https://apollohzl.github.io/PinDou_Apollo/)**，无需安装。

### 本地开发

```bash
# 克隆仓库
git clone https://github.com/Apollohzl/PinDou_Apollo.git
cd PinDou_Apollo

# 安装依赖
npm install

# 启动开发服务器
npm run dev

# 构建生产版本
npm run build

# 预览构建结果
npm run preview
```

---

## 使用指南

### 五步完成拼豆图纸

```
Step 1: 上传图片    →  拖拽或点击上传你的图片
Step 2: 设置参数    →  选择品牌、尺寸、抖动算法、颜色数量
Step 3: 生成图纸    →  一键生成，自动配色匹配
Step 4: 编辑优化    →  像素级编辑、3D 预览、用量统计、制作引导
Step 5: 导出文件    →  PNG / PDF / Excel / JSON
```

### 编辑器工具

| 工具 | 快捷说明 | 功能描述 |
|------|----------|----------|
| 画笔 | 🖌️ | 在格子上绘制当前选中的颜色 |
| 橡皮 | 🧹 | 擦除格子（设为空格） |
| 填充 | 🪣 | 油漆桶填充连通区域 |
| 吸管 | 💧 | 吸取格子颜色为当前色 |
| 换色 | 🔄 | 全局替换同色格子 |

### 制作引导模式

- **逐行引导**：按行逐步排豆，高亮当前行，标记完成行
- **逐色引导**：按颜色逐步排豆，高亮当前颜色，进度追踪

---

## 项目结构

```
PinDou_Apollo/
├── .github/workflows/
│   └── deploy.yml                 # GitHub Actions 自动部署
├── public/
│   └── favicon.svg                # 像素风图标
├── src/
│   ├── components/                # React 组件
│   │   ├── Header.tsx             # 页头 + 步骤指示器
│   │   ├── Footer.tsx             # 页脚
│   │   ├── ImageUploader.tsx      # 图片上传（拖拽+预览）
│   │   ├── SettingsPanel.tsx      # 参数设置面板
│   │   ├── PatternCanvas.tsx      # Canvas 网格渲染器
│   │   ├── PatternEditor.tsx      # 图纸编辑器（工具栏+色卡）
│   │   ├── PaletteSelector.tsx    # 色卡选择器
│   │   ├── UsageStats.tsx         # 用量统计表格
│   │   ├── ThreeDPreview.tsx      # 3D 预览（Three.js）
│   │   ├── ProductionGuide.tsx    # 制作引导
│   │   └── ExportPanel.tsx        # 导出面板
│   ├── lib/
│   │   ├── types.ts               # TypeScript 类型定义
│   │   ├── image/                 # 图像处理核心
│   │   │   ├── color.ts           # 色彩空间转换 + CIEDE2000
│   │   │   ├── quantize.ts        # Median Cut 颜色量化
│   │   │   ├── dither.ts          # 抖动算法（FS/Riemersma/Bayer）
│   │   │   ├── denoise.ts         # BFS 去噪 + 轮廓增强
│   │   │   ├── background.ts      # Flood-fill 背景去除
│   │   │   └── pipeline.ts        # 完整处理流水线
│   │   ├── editor/
│   │   │   ├── tools.ts           # 编辑工具（画笔/填充/换色等）
│   │   │   └── history.ts         # 撤销/重做历史管理
│   │   ├── export/
│   │   │   ├── png.ts             # PNG 导出
│   │   │   ├── pdf.ts             # PDF 导出
│   │   │   ├── excel.ts           # Excel 导出
│   │   │   └── json.ts            # JSON 导入/导出
│   │   └── palettes/              # 品牌色卡数据
│   │       ├── index.ts           # 色卡管理器
│   │       ├── artkal-s.ts        # Artkal S 系列 (2.6mm)
│   │       ├── artkal-m.ts        # Artkal M 系列 (5mm)
│   │       ├── perler.ts          # Perler 系列
│   │       └── hama.ts            # Hama 系列
│   ├── utils/
│   │   └── palette.ts             # 色卡工具函数
│   ├── App.tsx                    # 主应用
│   ├── main.tsx                   # React 入口
│   └── index.css                  # 像素风全局样式
├── wiki.md                        # 技术调研文档
├── DECISION_LOG.md                # 开发决策日志
├── index.html                     # HTML 入口
├── package.json
├── tsconfig.json
├── vite.config.ts
└── README.md
```

---

## 核心算法

### 图像处理流水线

```
原始图片
    ↓
[预处理] 背景去除 → 尺寸调整
    ↓
[像素化] 网格划分 → 区域平均采样
    ↓
[颜色量化] Median Cut 中位切割
    ↓
[色板映射] RGB → Lab → CIEDE2000 最近邻匹配
    ↓
[后处理] 去噪 → 轮廓增强 → 抖动
    ↓
[输出] 网格图纸 + 预览图
```

### CIEDE2000 色差算法

采用国际照明委员会标准 ISO/CIE 11664-6:2014，在 Lab 色彩空间中计算感知色差，包含亮度、色度、色相权重修正及蓝色区域特殊修正，是目前最准确的色差公式。

### 抖动算法对比

| 算法 | 渐变效果 | 细节保留 | 适用场景 |
|------|----------|----------|----------|
| Floyd-Steinberg | 自然平滑 | 良好 | 通用场景（默认） |
| Riemersma | 极佳 | 优秀 | 高质量需求 |
| Bayer | 规则纹理 | 中等 | 风格化效果 |
| 无抖动 | 色带明显 | 原始 | 极简风格 |

---

## 部署

项目使用 GitHub Actions 自动部署到 GitHub Pages：

1. 推送代码到 `main` 分支
2. GitHub Actions 自动触发构建
3. 构建产物自动部署到 GitHub Pages
4. 访问 `https://<username>.github.io/PinDou_Apollo/`

如需手动部署：

```bash
npm run build
# 将 dist/ 目录内容部署到任意静态文件服务器
```

---

## 色卡数据

| 品牌 | 规格 | 颜色数 | 说明 |
|------|------|--------|------|
| Artkal S | 2.6mm | 90 色 | 小号拼豆，精细图案 |
| Artkal M | 5mm | 42 色 | 标准拼豆 |
| Perler | 5mm | 29 色 | 经典美国品牌 |
| Hama | 5mm | 25 色 | 丹麦品牌 |
| Mard | 5mm | 13 色 | 国产基础色卡 |

---

## 决策日志

所有开发过程中的关键技术决策均记录在 [DECISION_LOG.md](./DECISION_LOG.md) 中，涵盖技术栈选择、算法选型、UI 设计、部署策略等 20 项关键决策。

---

## 技术文档

详细的技术调研文档请参阅 [wiki.md](./wiki.md)，包含：

- 拼豆行业市场分析与用户画像
- 现有工具竞品深度分析
- 图像处理技术方案拆解
- 颜色量化与色差算法对比
- 抖动算法与后处理技术
- 完整技术管线设计

---

## 开发

### 环境要求

- Node.js >= 18
- npm >= 9

### 可用脚本

| 命令 | 说明 |
|------|------|
| `npm run dev` | 启动开发服务器（热重载） |
| `npm run build` | 类型检查 + 生产构建 |
| `npm run preview` | 预览构建结果 |

### 浏览器兼容性

- Chrome / Edge >= 90
- Firefox >= 88
- Safari >= 14
- 需要 WebGL 支持（3D 预览功能）

---

## 许可证

[MIT License](./LICENSE) - 自由使用、修改和分发

---

<div align="center">

**用拼豆创造你的像素世界**

Made with React + TypeScript + Three.js

</div>
