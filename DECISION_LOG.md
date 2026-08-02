# PinDou_Apollo 决策日志

> 本文档记录项目开发过程中所有关键决策，包括决策问题、可选方案、理由及最终选择。

---

## 决策 1：技术栈选择

**问题**：项目应使用什么前端技术栈？

**可选方案**：
1. Next.js 15 + React 19 + Tailwind CSS 4
2. Vite + React 18 + TypeScript + 自定义 CSS
3. 纯 HTML/CSS/JS（无框架）
4. Vue 3 + Vite

**最终选择**：方案 2 - Vite + React 18 + TypeScript + 自定义 CSS

**理由**：
- GitHub Pages 仅提供静态文件服务，Next.js 的 SSR/SSG 功能在此场景下优势不明显
- Vite 构建速度快，产物为纯静态文件，完美适配 GitHub Pages
- React 18 生态成熟，TypeScript 提供类型安全
- 自定义 CSS 可精确控制像素风格视觉效果，避免 Tailwind 的预设样式干扰
- 相比纯 HTML/CSS/JS，React 组件化架构更适合管理复杂的编辑器状态

---

## 决策 2：CSS 方案选择

**问题**：使用 Tailwind CSS 还是自定义 CSS？

**可选方案**：
1. Tailwind CSS 4
2. 自定义 CSS + CSS 变量
3. CSS-in-JS (styled-components)
4. CSS Modules

**最终选择**：方案 2 - 自定义 CSS + CSS 变量

**理由**：
- 像素风格需要精细控制的边框、阴影、圆角等视觉效果，自定义 CSS 更灵活
- CSS 变量便于统一管理主题色和设计令牌
- 无需额外构建步骤，减少依赖
- 文件体积更小，加载更快

---

## 决策 3：状态管理方案

**问题**：使用什么状态管理方案？

**可选方案**：
1. Zustand
2. React Context + useReducer
3. React useState + useCallback（原生方案）
4. Redux Toolkit

**最终选择**：方案 3 - React useState + useCallback

**理由**：
- 应用为纯客户端单页应用，状态结构相对扁平
- React 原生 Hooks 足以管理当前复杂度的状态
- 减少外部依赖，降低包体积
- 后续如需扩展可平滑迁移到 Zustand

---

## 决策 4：色彩匹配算法

**问题**：使用什么色彩匹配算法？

**可选方案**：
1. RGB 欧氏距离（最近邻）
2. CIEDE2000（Lab 色彩空间）
3. 加权 RGB 距离
4. CIE76（Lab ΔE）

**最终选择**：方案 2 - CIEDE2000

**理由**：
- CIEDE2000 是国际标准 ISO/CIE 11664-6:2014，业界最精准的感知色差算法
- 在 Lab 色彩空间中计算，更符合人眼感知
- 已用 Sharma 官方测试向量验证实现正确性
- 竞品工具（BeadsCanvas、Bead Art Maker、autoclaw）均采用此算法

---

## 决策 5：3D 预览加载策略

**问题**：Three.js 库体积大（~684KB），如何优化加载？

**可选方案**：
1. 静态导入，打包进主 bundle
2. 动态导入（lazy loading），按需加载
3. 使用 CDN 外部加载
4. 不实现 3D 预览

**最终选择**：方案 2 - 动态导入（lazy loading）

**理由**：
- 3D 预览是 P2 优先级功能，非首屏必需
- 动态导入将 Three.js 分离为独立 chunk，首屏不加载
- 用户点击 3D 预览标签时才加载，不影响初始页面性能
- 代码分割后首屏 JS 从 ~1.5MB 降至 ~864KB

---

## 决策 6：色卡数据管理

**问题**：色卡数据如何存储和管理 Lab 值？

**可选方案**：
1. 在数据文件中预计算并存储 Lab 值
2. 在运行时动态计算 Lab 值
3. 使用 JSON 外部文件加载
4. 使用数据库存储

**最终选择**：方案 2 - 运行时动态计算

**理由**：
- 避免存储冗余数据，RGB 和 Lab 可互相转换
- 在 index.ts 中统一计算，保证一致性
- 计算开销极小（137 种颜色 × 1 次转换），不影响性能
- 便于后续添加新色卡，只需提供 RGB 数据

---

## 决策 7：图像处理位置

**问题**：图像处理在客户端还是服务端进行？

**可选方案**：
1. 服务端处理（API + Worker）
2. 浏览器本地处理（Canvas API）
3. 混合模式（简单操作本地，复杂操作服务端）

**最终选择**：方案 2 - 浏览器本地处理

**理由**：
- 隐私优先：用户图片不上传服务器，保护隐私
- 零后端成本：无需服务器、无需 API 调用费用
- 响应速度快：无网络延迟
- GitHub Pages 仅支持静态文件，无后端能力
- 竞品（MakeBead、Jett-Wu、七卡瓦）均采用本地处理方案

---

## 决策 8：网格数据结构

**问题**：图纸网格使用什么数据结构？

**可选方案**：
1. 二维数组 `number[][]`
2. 一维 `Int32Array` + width/height
3. `Map<string, number>`（稀疏存储）
4. `Uint8Array`（限制色卡大小 ≤255）

**最终选择**：方案 2 - 一维 `Int32Array` + width/height

**理由**：
- 一维数组内存连续，CPU 缓存友好，访问速度快
- `Int32Array` 支持负值（-1 表示空格），且色卡大小不受 255 限制
- 比二维数组减少一层间接引用，序列化更简单
- 比 Map 更节省内存（密集网格场景）

---

## 决策 9：默认抖动算法

**问题**：默认使用哪种抖动算法？

**可选方案**：
1. 无抖动（直接匹配）
2. Floyd-Steinberg
3. Riemersma（Hilbert 曲线）
4. Bayer 有序抖动

**最终选择**：方案 2 - Floyd-Steinberg

**理由**：
- Floyd-Steinberg 是最经典的误差扩散算法，效果广泛认可
- 计算速度快，实现简单
- 竞品工具普遍以此为主流选择
- Riemersma 作为高级选项供进阶用户选择

---

## 决策 10：背景去除算法

**问题**：如何实现背景去除？

**可选方案**：
1. GrabCut 算法（需要 OpenCV.js）
2. Flood-fill 从边缘填充
3. ML 模型（如 U2Net）
4. 手动指定背景色

**最终选择**：方案 2 - Flood-fill 从边缘填充

**理由**：
- 无需引入 OpenCV.js 等重量级库
- 纯 Canvas API 实现，零依赖
- 对纯色/渐变背景效果良好
- 计算速度快，适合浏览器环境
- 后续可扩展支持手动指定背景色

---

## 决策 11：字体选择

**问题**：使用什么字体实现可爱像素风格？

**可选方案**：
1. "Press Start 2P" + 系统中文字体
2. "VT323" + "ZCOOL KuaiLe"
3. "Press Start 2P" + "ZCOOL KuaiLe"
4. 自定义像素字体

**最终选择**：方案 3 - "Press Start 2P" + "ZCOOL KuaiLe"

**理由**：
- "Press Start 2P" 是经典 8-bit 像素字体，完美契合像素风格主题
- "ZCOOL KuaiLe" 是站酷快乐体，可爱圆润，适合中文显示
- 两者均通过 Google Fonts 免费提供，无需自托管
- 组合使用：英文/数字用像素字体，中文用快乐体

---

## 决策 12：GitHub Pages 部署策略

**问题**：如何部署到 GitHub Pages？

**可选方案**：
1. 本地构建后提交 dist 文件夹
2. GitHub Actions 自动构建部署
3. 使用 `gh-pages` 分支
4. 使用 Vercel/Netlify 替代

**最终选择**：方案 2 - GitHub Actions 自动构建部署

**理由**：
- 自动化：push 代码后自动构建部署，无需手动操作
- 保持仓库整洁：dist 文件夹不提交到仓库
- GitHub 原生支持 Actions，免费额度充足
- 配置一次后永久生效

---

## 决策 13：颜色量化默认算法

**问题**：默认使用哪种颜色量化算法？

**可选方案**：
1. Median Cut（中位切割）
2. K-Means 聚类
3. 主色提取
4. 不量化（直接匹配全部调色板）

**最终选择**：方案 1 - Median Cut

**理由**：
- Median Cut 算法快速高效，适合实时处理
- 实现简单，递归切分逻辑清晰
- 效果接近 K-Means 但计算量更小
- K-Means 作为备选方案保留在代码中

---

## 决策 14：导出功能实现

**问题**：各导出格式如何实现？

**可选方案**：
1. PNG: Canvas API / PDF: jsPDF / Excel: SheetJS / JSON: 原生
2. 全部使用服务端生成
3. 使用第三方在线转换服务
4. 仅支持 PNG 导出

**最终选择**：方案 1 - 各格式使用最适合的库

**理由**：
- PNG：Canvas API 是浏览器原生能力，无需依赖
- PDF：jsPDF 是成熟的纯前端 PDF 生成库
- Excel：SheetJS (xlsx) 是业界标准的 Excel 处理库
- JSON：原生 `JSON.stringify`/`JSON.parse` 即可
- 全部在浏览器端完成，无需后端

---

## 决策 15：项目文件格式

**问题**：项目保存（JSON）使用什么格式？

**可选方案**：
1. 自定义格式
2. 遵循 wiki.md 中的 ProjectFile 规范
3. 使用 PNG 元数据嵌入
4. 使用 IndexedDB 存储

**最终选择**：方案 2 - 遵循 wiki.md 中的 ProjectFile 规范

**理由**：
- wiki.md 中已定义了规范格式，保持一致性
- 包含版本号、项目信息、配置、网格数据
- JSON 格式可读性好，便于调试和导入导出
- 支持未来版本迁移

---

## 决策 16：用量统计的包装规格

**问题**：建议购买包装数如何计算？

**可选方案**：
1. 每包 500 颗
2. 每包 1000 颗
3. 每包 2000 颗
4. 用户自定义每包数量

**最终选择**：方案 2 - 每包 1000 颗

**理由**：
- 市场上拼豆常见包装规格为 1000 颗/包
- Artkal 官方零售包装约为 1000 颗
- 计算简单：`Math.ceil(count / 1000)`
- 后续可添加用户自定义包装规格的功能

---

## 决策 17：MARD 色卡处理

**问题**：wiki.md 中提到 MARD 色卡（221/291色），但缺乏官方 RGB 数据，如何处理？

**可选方案**：
1. 不提供 MARD 色卡
2. 使用 Artkal M 系列作为 MARD 的近似
3. 从网络搜索 MARD 色卡数据
4. 提供空框架，用户自行填充

**最终选择**：方案 2 - 使用 Artkal M 系列作为 MARD 近似

**理由**：
- MARD 色卡与 Artkal M 系列高度相似
- 缺乏 MARD 官方 RGB 数据，无法准确实现
- Artkal M 系列 42 种颜色已覆盖主要使用场景
- 在 palette index.ts 中将 MARD 映射到 Artkal M 数据

---

## 决策 18：去噪最小面积阈值

**问题**：BFS 连通域去噪的最小面积阈值设为多少？

**可选方案**：
1. minArea = 1（去除所有孤立像素）
2. minArea = 4（去除 2×2 以下的小块）
3. minArea = 8（去除 3×3 以下的小块）
4. minArea = 16（更激进的去噪）

**最终选择**：方案 3 - minArea = 8

**理由**：
- 8 格以下的色块在拼豆制作中难以操作且影响整体美观
- 保留 8 格以上的色块，兼顾细节保留和去噪效果
- 用户可在设置中关闭去噪或调整阈值
- 竞品 autoclaw 默认使用类似阈值

---

## 决策 19：编辑器历史管理策略

**问题**：撤销/重做历史如何管理？

**可选方案**：
1. 每次操作保存完整网格快照
2. 保存差异（diff）
3. 命令模式（Command Pattern）
4. 不支持撤销/重做

**最终选择**：方案 1 - 每次操作保存完整网格快照

**理由**：
- 实现简单直观，不易出错
- 拼豆图纸尺寸通常不大（最大 104×74 = 7696 格），Int32Array 快照内存开销可接受
- 限制历史记录数量（默认 50 步），避免内存无限增长
- 差异方案虽然省内存但实现复杂，收益不大

---

## 决策 20：移动端适配策略

**问题**：如何处理移动端适配？

**可选方案**：
1. 响应式设计（同一套代码适配所有设备）
2. 独立移动端页面
3. PWA + 响应式
4. 仅支持桌面端

**最终选择**：方案 1 - 响应式设计

**理由**：
- 响应式设计开发成本最低，维护最简单
- CSS 媒体查询可实现良好的移动端体验
- 拼豆图纸编辑器在小屏幕上使用触摸操作
- PWA 可作为后续增强（离线支持、可安装）

---

## 决策 21：实际部署方案调整

**问题**：GitHub Token 缺少 `workflow` scope，无法推送 `.github/workflows/` 目录下的文件，如何部署？

**可选方案**：
1. 等待用户提供具有 `workflow` scope 的 Token
2. 使用 `gh-pages` 分支手动部署构建产物
3. 使用 Vercel/Netlify 替代部署
4. 本地构建后提交 dist 文件夹到 main 分支

**最终选择**：方案 2 - 使用 `gh-pages` 分支手动部署

**理由**：
- 无需等待用户操作，可立即完成部署
- `gh-pages` 分支部署是 GitHub Pages 的经典方案，稳定可靠
- 构建产物与源码分离，仓库 main 分支保持整洁
- `.github/workflows/deploy.yml` 文件仍保留在仓库中，未来用户获得 `workflow` scope 后可直接推送启用 Actions 自动部署
- 部署后通过 GitHub API 验证 Pages 配置正确，站点已上线

---

## 决策 22：Favicon 路径处理

**问题**：Vite 配置了 `base: '/PinDou_Apollo/'`，favicon 引用路径如何处理？

**可选方案**：
1. 在 HTML 中写完整路径 `/PinDou_Apollo/favicon.svg`
2. 在 HTML 中写 `/favicon.svg`，让 Vite 自动添加 base 前缀
3. 在 HTML 中写相对路径 `favicon.svg`
4. 使用 Vite 的 import 方式引入

**最终选择**：方案 2 - 写 `/favicon.svg`

**理由**：
- Vite 会在 dev 和 production 环境自动为 public 目录资源添加 base 前缀
- 方案 1 会导致 dev server 路径重复（`/PinDou_Apollo/PinDou_Apollo/favicon.svg`）
- 方案 2 在 dev 中变为 `/PinDou_Apollo/favicon.svg`，在 production 中也为 `/PinDou_Apollo/favicon.svg`，行为一致
- 已通过 `curl` 验证 production 构建输出路径正确

---

> **文档维护**：本文档随项目开发持续更新，记录所有关键决策。
