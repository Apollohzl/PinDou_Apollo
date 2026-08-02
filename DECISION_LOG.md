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

---

## 决策 23：PDF 中文乱码修复方案

**问题**：导出的 PDF 中所有中文显示为乱码（方框或不可读字符），如何修复？

**原因分析**：jsPDF 默认只内置 14 种标准 PDF 字体（Helvetica、Times、Courier 等），这些字体完全不支持 CJK（中日韩）字符。当 `doc.text()` 渲染中文时，因字体中无对应字形，显示为乱码。

**可选方案**：
1. **嵌入中文字体（TTF → Base64）**：将思源黑体/Noto Sans SC 等中文字体转为 Base64 编码，通过 `doc.addFileToVFS()` + `doc.addFont()` 注册到 jsPDF
2. **Canvas 渲染文本再插入 PDF**：利用浏览器原生 Canvas API 渲染中文文本为图片，再通过 `doc.addImage()` 插入 PDF
3. **PDF 中使用英文替代**：将所有中文文本替换为英文（如"尺寸"→"Size"）
4. **使用 html2canvas + jsPDF.html()**：通过 html2canvas 将 HTML 渲染为图片再插入 PDF

**各方案优缺点**：

| 方案 | 优点 | 缺点 | 风险 | 所需基础 |
|------|------|------|------|----------|
| 1. 嵌入字体 | 原生 PDF 文本可搜索、可选中 | 完整中文字体 10MB+，Base64 后更大，严重影响包体积和加载速度 | GitHub Pages 加载缓慢 | 字体子集化工具 |
| 2. Canvas 渲染 | 零额外依赖，包体积不变，利用浏览器原生字体渲染 | PDF 中文不可搜索/选中 | 高分辨率下文字清晰度 | 无 |
| 3. 英文替代 | 最简单 | 用户体验差，不符合中文应用定位 | 用户不满 | 无 |
| 4. html2canvas | 可渲染复杂布局 | 引入额外依赖（~200KB），html2canvas 兼容性问题多 | 渲染不一致 | html2canvas 库 |

**最终选择**：方案 2 - Canvas 渲染文本再插入 PDF

**理由**：
- 零额外依赖，不增加包体积，完美适配 GitHub Pages 静态部署
- 利用浏览器原生中文字体渲染（ZCOOL KuaiLe + 系统中文字体回退链），显示效果与网页一致
- 实现核心：`renderTextToDataURL()` 将文本渲染到 Canvas → `doc.addImage()` 插入 PDF
- 色号标注（如 "S-01"）为纯 ASCII，仍使用 jsPDF 原生文本渲染以保证性能（大网格可达上万格子）
- 仅中文文本（标题、表头、颜色名称、总计等）通过 Canvas 渲染，数量有限不影响性能
- 通过 3 倍 DPI 缩放确保文字在 PDF 中清晰
- 字体回退链覆盖所有主流操作系统：ZCOOL KuaiLe → Microsoft YaHei (Windows) → PingFang SC (macOS) → Noto Sans CJK SC (Linux) → WenQuanYi Micro Hei

---

## 决策 24：设置页输入框验证策略

**问题**：设置页画板尺寸输入框的实时数值检测（不能小于 4 等）体验不佳，如何改进？

**可选方案**：
1. **保持实时检测**：输入时立即 `Math.max(4, Math.min(200, value))` 强制限制
2. **仅正整数过滤 + 提交时校验**：输入时仅过滤非数字字符，在点击"生成"按钮时统一校验，不合法则弹窗提示
3. **失焦时校验**：输入框失去焦点时校验数值范围
4. **使用滑块替代**：用 range input 替代 number input

**最终选择**：方案 2 - 仅正整数过滤 + 提交时校验

**理由**：
- 实时检测会导致输入体验不自然（如想输入"32"，输入"3"时被强制改为"4"）
- 仅过滤非数字字符（`replace(/[^0-9]/g, '')`）允许用户自由输入正整数
- 右侧添加范围提示标签（"范围: 4 ~ 200"），用户可随时了解有效范围
- 点击"生成图纸"时统一校验，不合法则弹出与网站同风格的像素风弹窗（红色警告卡片 + bounce-in 动画）
- 弹窗支持点击遮罩关闭、点击"知道了"按钮关闭，交互友好
- 失焦校验方案在 Tab 切换时可能意外触发，体验不如提交时校验直观

---

## 决策 25：首页 JSON 导入与页面跳转控制

**问题**：首页缺少 JSON 文件导入入口（原导入入口仅在导出页面），且导入后需限制页面跳转范围。

**可选方案**：
1. **首页添加导入按钮 + 导入后仅允许编辑/导出页面**：在 ImageUploader 组件添加 JSON 导入口，导入后设置 `isImported` 状态，禁用步骤 1-3 的导航
2. **在 Header 添加全局导入按钮**：在页头添加导入按钮，随时可导入
3. **导入后允许访问所有页面**：导入后不限制页面跳转
4. **保持现状（仅在导出页导入）**：不改

**最终选择**：方案 1 - 首页添加导入按钮 + 导入后限制导航

**理由**：
- 首页是用户最先看到的页面，在此提供导入入口最符合用户直觉
- 导入按钮使用与网站一致的像素风格（紫色按钮 + 虚线边框区域 + 图标）
- 导入后设置 `isImported = true`，在 Header 中禁用步骤 1-3（上传/设置/生成）的点击
- 在 `handleStepClick` 中增加守卫：`if (isImported && targetStep < 4) return`
- 导入后默认跳转到编辑页面（step 4），用户可自由切换到导出页面（step 5）
- 上传新图片时重置 `isImported = false`，恢复正常导航
- 此方案满足用户需求"只能跳转打开到编辑页面和导出页面，不能在编辑页面返回设置页面"
- 导入口复用已有 `importJSON()` 函数，支持完整的 JSON 格式校验和错误提示

---

## 决策 26：制作引导页缩放控件

**问题**：制作引导页下方的预览图没有放大缩小功能，无法查看细节。

**可选方案**：
1. **添加与编辑页面同款缩放控件**：在预览图上方添加缩小/放大按钮和百分比显示
2. **鼠标滚轮缩放**：支持鼠标滚轮缩放预览图
3. **双击放大**：双击预览图切换放大/缩小
4. **固定缩放级别**：提供几个预设缩放级别按钮

**最终选择**：方案 1 - 添加与编辑页面同款缩放控件

**理由**：
- 与编辑页面保持一致的交互方式，降低用户学习成本
- 控件样式完全复用 `tool-btn` 类，视觉统一
- 缩放范围 25% ~ 400%，步进 25%，满足从全局预览到细节查看的需求
- 实现简单：仅添加 `zoom` 状态和两个按钮，传递给 PatternCanvas 的 `zoom` prop
- 额外添加"预览图"标题卡片，使布局更清晰
- 方案 2（滚轮缩放）在移动端不适用，且可能误触

---

## 决策 27：编辑页面色块点击操作

**问题**：编辑页面中点击色块仅选择颜色，需手动切换到画笔工具才能绘制，操作不够直接。

**可选方案**：
1. **左键选色 + 自动切换画笔**：点击色块时自动切换到画笔工具，可立即开始绘制
2. **左键选色 + 右键全局换色**：左键选色并切换画笔，右键选色并切换全局换色工具
3. **双击色块弹出编辑菜单**：双击弹出颜色修改、替换等操作菜单
4. **色块上添加操作按钮**：每个色块下方添加编辑/替换小按钮

**最终选择**：方案 2 - 左键选色 + 自动切换画笔，右键选色 + 切换全局换色

**理由**：
- 左键点击是最常见的操作，自动切换画笔工具让用户"点击即画"，极大提升效率
- 右键点击切换全局换色工具，提供快捷的批量修改入口，满足"修改等操作"需求
- 在 PaletteSelector 中添加操作提示文字："💡 左键点击选色并绘制 · 右键点击选色并全局换色"
- 色块 title 属性增加操作说明，鼠标悬停可见
- 方案 3（双击菜单）交互复杂，移动端双击不直观
- 方案 4（按钮）增加 UI 复杂度，色块区域拥挤
- `handleColorSelect` 和 `handleColorRightClick` 均使用 `useCallback` 包裹，避免不必要的重渲染
- `onColorRightClick` 为可选 prop，PaletteSelector 在未传入时不绑定 contextmenu 事件，保持向后兼容

---

## 决策 28：Canvas 缩放后滚动条移动距离修复方案

### 问题描述
编辑图纸和制作引导两个页面中，当用户放大画布后，水平/垂直滚动条在滚动时移动距离有误，导致无法正确滚动观看到整个画布。放大倍数越大，问题越明显。

### 原因分析
`.canvas-wrapper` 使用了 `display: flex; justify-content: center;` 对 Canvas 进行居中。当 Canvas 放大后尺寸超过容器时，flexbox 的 `justify-content: center` 会将 Canvas 居中放置，导致 Canvas 在左侧产生负偏移（溢出到容器左边界之外）。然而滚动容器 (`overflow: auto`) 只能向右/下滚动，无法到达左侧溢出的部分，使得 Canvas 左侧和顶部区域无法查看。

### 可选选项

#### 选项 A：改用 `justify-content: safe center`
- **原理**：CSS Box Alignment Level 3 引入 `safe` 关键字，当内容溢出时回退到 `flex-start` 对齐，避免数据丢失
- **优点**：CSS 原生解决方案，代码改动最小（仅改一行 CSS）
- **缺点**：`safe` 关键字在旧版浏览器中支持有限（Chrome 93+、Firefox 63+、Safari 11+），虽然 2026 年大部分用户浏览器已支持，但仍有兼容风险
- **风险**：低风险，但兼容性边界不确定

#### 选项 B：改用 flex `margin: auto` 替代 `justify-content: center`（已选择）
- **原理**：将 `.canvas-wrapper` 的 `justify-content` 改为 `flex-start`，在 Canvas 元素上设置 `margin: 0 auto`。在 flexbox 中，`margin: auto` 会吸收剩余空间实现居中；当元素大于容器时，auto margin 解析为 0，元素从 flex-start 位置开始排列，滚动正常
- **优点**：
  - 所有浏览器完美支持，零兼容性问题
  - 行为可预测：小画布居中，大画布从左上角开始可滚动
  - 改动量小：CSS 改一行 + Canvas 内联样式加一个属性
- **缺点**：需要同时修改 CSS 和组件内联样式
- **风险**：极低风险

#### 选项 C：改用 CSS Grid `place-content: safe center`
- **原理**：类似选项 A，但使用 Grid 布局
- **优点**：现代 CSS 方案
- **缺点**：同样有 `safe` 关键字兼容性问题，且改为 Grid 布局改动更大
- **风险**：中等风险

### 最终选择：选项 B

### 选择理由
1. **零兼容性风险**：`margin: auto` 在 flexbox 中的行为是 CSS 规范明确定义的，所有浏览器（包括移动端）都完美支持
2. **行为精确可控**：
   - Canvas 小于容器时：`margin: 0 auto` 水平居中（保持原有视觉效果）
   - Canvas 大于容器时：margin 解析为 0，Canvas 从左侧开始，滚动条可正常滚动到所有区域
3. **改动最小**：仅需将 `.canvas-wrapper` 的 `justify-content: center` 改为 `flex-start`，并在 Canvas 的 inline style 中添加 `margin: '0 auto'`
4. **GitHub Pages 环境**：作为静态站点部署，需确保最大兼容性，选项 B 是最稳妥的方案
5. 垂直方向保持 `align-items: flex-start` 不变，Canvas 从顶部开始排列，垂直滚动始终正常

### 实现细节
- `src/index.css`：`.canvas-wrapper` 的 `justify-content` 从 `center` 改为 `flex-start`
- `src/components/PatternCanvas.tsx`：Canvas 的 inline style 添加 `margin: '0 auto'`
- 该修复对编辑图纸页和制作引导页同时生效，因为两者都使用 PatternCanvas 组件

---

## 决策 29：3D 预览网格线实现方案

### 问题描述
3D 阅览图的底板没有网格线，用户无法直观看到每颗豆子的位置对应关系。需要在 3D 预览中添加网格线展示功能。

### 需求
- 添加网格线显示勾选框，用户可自由切换
- 网格线需与底板尺寸精确匹配（支持非正方形网格如 32×48）
- 网格线需正确渲染在底板表面，不与豆子产生视觉冲突

### 可选选项

#### 选项 A：使用 THREE.GridHelper
- **原理**：Three.js 内置的 `GridHelper(size, divisions)` 生成方形网格
- **优点**：API 简单，一行代码生成网格
- **缺点**：GridHelper 只支持正方形网格（size×size），对于非正方形图纸（如 32×48）会产生多余的线条或缺失线条
- **风险**：非正方形网格显示不正确

#### 选项 B：自定义 LineSegments 构建精确网格线（已选择）
- **原理**：使用 `THREE.BufferGeometry` + `THREE.LineBasicMaterial` + `THREE.LineSegments` 手动构建网格线，精确匹配图纸的 width×height
- **优点**：
  - 精确匹配任意尺寸的图纸网格（正方形和非正方形均可）
  - 完全控制线条颜色、透明度、位置
  - 性能优秀（所有线段合并为一个 LineSegments 对象，单次 draw call）
  - 可精确控制 y 坐标避免与底板的 z-fighting
- **缺点**：需要手动构建顶点数据，代码量略多
- **风险**：极低风险

#### 选项 C：在底板纹理上绘制网格线
- **原理**：创建 Canvas 纹理，在上面绘制网格线，然后作为底板的贴图
- **优点**：网格线与底板完美融合
- **缺点**：纹理分辨率限制可能导致线条模糊；切换网格线需重新生成纹理；实现复杂
- **风险**：中等风险（纹理分辨率和缩放问题）

### 最终选择：选项 B

### 选择理由
1. **精确性**：自定义 LineSegments 可以精确匹配任意 width×height 的图纸，每条线恰好对应一个网格行列，不会多也不会少
2. **性能优秀**：所有网格线合并到一个 `LineSegments` 对象中，仅占用一次 draw call，对 3D 渲染性能无影响
3. **视觉效果可控**：
   - 使用 `0x8b7355`（暗金色）线条颜色，与底板的奶油色 (`0xf5e6c8`) 形成适度对比
   - 设置 `transparent: true, opacity: 0.6` 使网格线不抢夺视觉焦点
   - `position.y = 0.01` 略高于底板表面，避免 z-fighting 闪烁
4. **生命周期管理完善**：
   - 通过 `gridLinesRef` 引用管理网格线对象
   - useEffect 依赖 `config.showGrid`、`grid.width`、`grid.height`，切换时自动移除旧网格并创建新网格
   - 移除时正确 dispose geometry 和 material，避免内存泄漏
5. **默认开启**：`showGrid: true` 默认勾选，用户首次进入 3D 预览即可看到网格线，了解豆子位置对应关系
6. **与现有 UI 风格一致**：勾选框与"自动旋转"、"显示孔洞"使用相同的 label + checkbox 样式

### 实现细节
- `src/lib/types.ts`：`Preview3DConfig` 接口添加 `showGrid: boolean` 字段
- `src/components/ThreeDPreview.tsx`：
  - 添加 `gridLinesRef` 用于引用网格线对象
  - 默认配置添加 `showGrid: true`
  - 添加 useEffect 管理网格线的创建/移除，依赖 `config.showGrid`、`grid.width`、`grid.height`
  - UI 添加"显示网格线"勾选框

---

## 决策 30：制作引导页 Canvas 拖拽平移实现方案

### 问题描述
制作引导页面的预览图只能通过滚动条滚动查看，交互死板不自然，用户希望可以通过点击拖拽来移动查看整个画布。

### 需求
- 在制作引导页的预览图中，用户可以点击拖拽画布来平移查看不同区域
- 需同时支持鼠标和触摸操作
- 不能影响现有的高亮、完成状态等显示功能

### 可选选项

#### 选项 A：使用第三方库 (如 react-draggable / panzoom)
- **原理**：引入专门的手势/平移库处理拖拽
- **优点**：功能完善，支持惯性滚动等高级特性
- **缺点**：增加依赖包体积，与现有 Canvas 渲染和滚动容器集成可能冲突
- **风险**：中高风险（兼容性和集成成本）

#### 选项 B：在 PatternCanvas 中实现原生拖拽平移（已选择）
- **原理**：在 PatternCanvas 组件中添加 `panMode` prop，当启用时拦截鼠标/触摸事件，通过修改 `containerRef.scrollLeft/scrollTop` 实现平移
- **优点**：
  - 零依赖，纯原生实现
  - 与现有 Canvas 渲染逻辑完全解耦，panMode 只影响事件处理不影响绘制
  - 同时支持鼠标和触摸（移动端友好）
  - 代码集中在一个组件中，易于维护
- **缺点**：无惯性滚动效果（松手即停）
- **风险**：极低风险

#### 选项 C：在 ProductionGuide 中单独实现拖拽逻辑
- **原理**：不修改 PatternCanvas，在 ProductionGuide 组件中添加事件监听
- **缺点**：需要直接操作 DOM 获取滚动容器引用，与 PatternCanvas 内部结构耦合，不优雅
- **风险**：中等风险（DOM 结构变化时易碎）

### 最终选择：选项 B

### 选择理由
1. **零依赖**：不引入任何第三方库，对 GitHub Pages 静态部署零影响
2. **复用性强**：`panMode` 是 PatternCanvas 的通用 prop，制作引导页和编辑页均可使用
3. **实现简洁**：通过 `containerRef` 直接操作 `scrollLeft/scrollTop`，利用浏览器原生滚动能力，无需手动计算位移边界
4. **双端支持**：鼠标和触摸事件统一处理，`handlePanStart/Move/End` 三个函数接收 clientX/clientY，同时适配鼠标和触摸
5. **游标提示**：panMode 时游标变为 `grab`，直观告知用户可拖拽
6. **全局 mouseup 监听**：防止拖拽到 canvas 外部松开后状态未重置

### 实现细节
- `PatternCanvas` 新增 `panMode` prop（默认 false）
- 新增 `containerRef` 引用滚动容器 `.canvas-container`
- 新增 `isPanningRef` 和 `panStartRef` 记录拖拽起始状态（鼠标位置 + 滚动位置）
- `handlePanStart/Move/End` 三个函数处理平移逻辑
- 鼠标和触摸事件中优先判断 panMode，启用时走平移逻辑，否则走原有编辑逻辑
- `ProductionGuide` 传入 `panMode={true}` 始终启用拖拽平移
- 添加提示文字 "💡 拖拽预览图可移动查看 · 使用缩放按钮调整大小"

---

## 决策 31：编辑页抓取工具实现方案

### 问题描述
编辑页面在放大画布后，只能通过滚动条滚动查看，交互不够灵活。用户希望在工具栏中添加一个"抓取"按钮，点击后可以直接拖拽移动画布。

### 需求
- 工具栏新增"抓取"工具按钮
- 选中抓取工具时，鼠标拖拽画布可平移查看
- 选中其他工具时恢复正常编辑功能
- 抓取工具不应对网格数据产生任何修改

### 可选选项

#### 选项 A：使用空格键临时切换抓取模式
- **原理**：按住空格键临时启用平移，松开恢复
- **优点**：专业软件常用模式（如 Figma/Photoshop），效率高
- **缺点**：移动端无法使用空格键；用户不易发现此功能
- **风险**：低风险，但功能可发现性差

#### 选项 B：工具栏添加抓取工具按钮（已选择）
- **原理**：在 TOOLS 数组中添加 `hand` 类型工具，选中时 PatternCanvas 启用 panMode
- **优点**：
  - 功能可见，用户可直接看到"抓取"按钮
  - 与现有工具切换逻辑完全一致
  - 桌面端和移动端均可使用
- **缺点**：需要手动切换工具
- **风险**：极低风险

#### 选项 C：同时支持按钮和空格键
- **原理**：选项 A + B 的组合
- **优点**：兼顾可见性和效率
- **缺点**：实现复杂度增加，需处理空格键与其他输入框的冲突
- **风险**：中等风险

### 最终选择：选项 B

### 选择理由
1. **功能可见性**：工具栏中直观显示"✋ 抓取"按钮，用户容易发现
2. **一致性**：与画笔、橡皮等工具切换方式完全一致，学习成本低
3. **移动端友好**：不依赖键盘，触摸设备同样可用
4. **实现简洁**：
   - `ToolType` 类型添加 `'hand'`
   - `TOOLS` 数组添加 hand 工具定义
   - `PatternCanvas` 传入 `panMode={currentTool === 'hand'}`
   - `handleCellClick` 和 `handleCellDrag` 中 hand 工具直接 return，不修改网格
   - `applyTool` 的 default 分支已处理未知工具（不修改数据）
5. **游标反馈**：选中抓取工具时游标变为 `grab`，用户立即知道可以拖拽
6. **色卡选择兼容**：点击色卡仍会自动切换到画笔工具，用户可以快速从抓取模式回到绘制模式

### 实现细节
- `src/lib/types.ts`：`ToolType` 添加 `'hand'`
- `src/components/PatternEditor.tsx`：
  - `TOOLS` 数组添加 `{ type: 'hand', icon: '✋', label: '抓取', desc: '拖拽移动画布查看不同区域' }`
  - `handleCellClick` 和 `handleCellDrag` 开头添加 `if (currentTool === 'hand') return;`
  - `PatternCanvas` 传入 `panMode={currentTool === 'hand'}`
- `src/components/PatternCanvas.tsx`：`panMode` prop 已在决策 30 中实现，此处复用

---

## 决策 32：MARD 221 色标准色卡数据实现方案

### 问题描述
项目原有 MARD 色卡仅 13 色（D-01 到 D-13），作为 Artkal M 的近似子集内嵌在 `index.ts` 中。用户要求使用完整的 MARD 221 色标准色卡，并将其设为默认品牌。

### 需求
- 从网上搜索 MARD 221 色的完整 RGB 数据和色号
- 将 221 色数据写入项目色卡系统
- 将默认品牌从 `artkal-s` 改为 `mard`

### 可选选项

#### 选项 A：使用 MARD 291 色（含扩展系列）
- **原理**：MARD 完整色号库为 291 色（221 标准 + 70 扩展）
- **优点**：色彩最全
- **缺点**：扩展系列（P/Q/R/T/Y/ZG）在零售中较少见，用户难以购买对应颜色；数据量更大
- **风险**：用户使用扩展色但买不到对应豆子

#### 选项 B：使用 MARD 221 色标准系列（已选择）
- **原理**：使用 MARD 标准 221 色（A-H + M 共 9 个色系），覆盖市面常见零售包装
- **优点**：
  - 221 色覆盖绝大多数使用场景
  - 数据来源可靠（bitbead.app 和 pd.anqstar.com 两份独立数据源互验一致）
  - 9 个色系分类清晰：A(黄橙26) B(绿32) C(蓝青29) D(蓝紫26) E(粉玫24) F(红25) G(棕肤21) H(灰白23) M(大地15)
- **缺点**：少量稀有颜色可能缺失
- **风险**：极低风险

#### 选项 C：保持 13 色近似方案
- **原理**：维持原有 13 色 MARD 近似方案
- **缺点**：色彩严重不足，无法满足用户需求
- **风险**：不满足需求

### 最终选择：选项 B

### 选择理由
1. **数据准确性**：从 bitbead.app 和 pd.anqstar.com 两个独立来源获取 221 色 HEX 和 RGB 数据，交叉验证完全一致
2. **独立文件**：创建 `src/lib/palettes/mard.ts` 独立文件（而非内嵌 index.ts），与其他品牌数据文件保持一致的结构
3. **命名方案**：每个颜色按色系命名（如 "黄橙1" / "Yellow-Orange 1"），色号使用原始编号（A1, B1, C1...），无连字符
4. **默认品牌切换**：App.tsx 中 `DEFAULT_CONFIG.brand` 从 `'artkal-s'` 改为 `'mard'`，`getPalette('mard')` 获取初始色卡
5. **品牌选项顺序**：SettingsPanel 中 MARD 移至首位，标签更新为 "MARD 221色 (5mm)"
6. **getAllPalettes 顺序**：MARD 移至首位，与默认品牌一致
7. **向后兼容**：旧的 13 色 MARD 数据被替换，已保存的 JSON 项目中颜色索引可能不匹配，但这是更换色卡的预期行为
8. **Lab 值自动计算**：221 色的 Lab 值由 `buildPalette()` 通过 `rgbToLab` 统一计算，无需手动维护

### 实现细节
- `src/lib/palettes/mard.ts`：新建文件，221 条 `RawBeadColor` 记录 + `mardPalette` 导出
- `src/lib/palettes/index.ts`：删除内嵌 13 色 MARD 定义，改为 `import { mardPalette } from './mard'`
- `src/App.tsx`：`initialPalette = getPalette('mard')`，`brand: 'mard'`
- `src/components/SettingsPanel.tsx`：MARD 移至 BRAND_OPTIONS 首位，修正 Artkal S/M 尺寸标签

---

## 决策 33：制作引导页四边序号格实现方案

### 问题描述
制作引导页的预览图缺少坐标序号，用户在逐行/逐色制作时无法快速定位具体位置。需要在预览图四边外添加灰色序号格，序号从 1 开始向右和向下递增。

### 需求
- 预览图四边（上、下、左、右）外各添加一行/列灰色格
- 上边和下边：列号 1, 2, 3, ..., N（从左到右递增）
- 左边和右边：行号 1, 2, 3, ..., M（从上到下递增）
- 序号从左上角开始为 1

### 可选选项

#### 选项 A：使用 HTML 元素包裹 Canvas
- **原理**：在 Canvas 外用 div/span 渲染序号
- **优点**：不修改 Canvas 绘制逻辑
- **缺点**：滚动时序号与图案对齐困难，需要同步滚动位置；DOM 结构复杂
- **风险**：中高风险（对齐问题）

#### 选项 B：扩展 Canvas 尺寸，将序号绘制到 Canvas 上（已选择）
- **原理**：在 PatternCanvas 中添加 `showAxisNumbers` prop，启用时扩展 Canvas 尺寸（上下左右各增加一格），在扩展区域绘制灰色背景和序号文字
- **优点**：
  - 序号与图案在同一个 Canvas 中，滚动时自动同步
  - 复用现有 Canvas 绘制逻辑，只需添加偏移量
  - 零额外 DOM 元素
- **缺点**：Canvas 尺寸增大，鼠标坐标转换需要调整
- **风险**：低风险

#### 选项 C：使用 SVG 叠加层
- **原理**：在 Canvas 上方叠加一个 SVG 层渲染序号
- **缺点**：需要精确同步 SVG 和 Canvas 的尺寸和位置；增加复杂度
- **风险**：中等风险

### 最终选择：选项 B

### 选择理由
1. **同步性保证**：序号和图案在同一 Canvas 中渲染，滚动/缩放时始终对齐
2. **实现简洁**：
   - 新增 `showAxisNumbers` prop（默认 false）
   - 当启用时，`axisSize = cellSize`，Canvas 尺寸增加 `2 * axisSize`
   - 所有图案绘制添加 `ox = axisSize` / `oy = axisSize` 偏移
   - 序号区背景 `#D9D9D9`，文字 `#333333`，粗体
   - 序号区与图案区交界处绘制边框线
3. **坐标转换适配**：`getCellCoord` 函数在 `showAxisNumbers` 启用时，先计算鼠标在 Canvas 中的像素位置，再减去 `axisSize` 偏移后转换为网格坐标
4. **不影响编辑页**：`showAxisNumbers` 默认 false，编辑页不受影响
5. **仅在制作引导页启用**：`ProductionGuide` 传入 `showAxisNumbers={true}`

### 实现细节
- `src/components/PatternCanvas.tsx`：
  - 新增 `showAxisNumbers?: boolean` prop
  - 绘制 useEffect 中：当 `showAxisNumbers` 为 true 时，先绘制灰色序号格背景和文字，再以 `ox/oy` 偏移绘制图案
  - `getCellCoord` 中：当 `showAxisNumbers` 为 true 时，计算偏移后的坐标
- `src/components/ProductionGuide.tsx`：`PatternCanvas` 传入 `showAxisNumbers={true}`

---

## 决策 34：导出图片物料清单+序号+Logo 实现方案

### 问题描述
导出的 PNG 图片仅有拼豆图案，缺少色号参考、物料清单和网站标识。用户导出后无法直接用于采购和制作参考。

### 需求
- 导出图片包含：拼豆图案 + 四边序号 + 物料清单 + 网站 logo
- 物料清单格式：粗体"物料清单"标题 → 灰色"像素总用量：{}" → 颜色方块+色号+RGB+数量（自动换行）
- 左下角显示网站 logo 图标和 URL 文字

### 可选选项

#### 选项 A：导出多个文件（图案 PNG + 清单 PDF）
- **原理**：图案和清单分开导出
- **缺点**：用户需要管理多个文件；不符合"一张图片包含所有信息"的需求
- **风险**：不满足需求

#### 选项 B：在单个 Canvas 上绘制完整图片（已选择）
- **原理**：重写 `exportPNG` 函数，在单个 Canvas 上从上到下依次绘制：图案区（含序号）→ 物料清单区 → Logo 区
- **优点**：
  - 一张 PNG 包含所有信息，便于打印和分享
  - 完全使用 Canvas API，零额外依赖
  - 物料清单自动换行，适应不同颜色数量
- **缺点**：图片尺寸增大（高度增加）
- **风险**：低风险

#### 选项 C：使用 html2canvas 截取页面
- **原理**：在页面上渲染完整的导出预览，用 html2canvas 截图
- **缺点**：引入额外依赖（html2canvas ~200KB）；截图质量不稳定；样式不一致
- **风险**：中等风险

### 最终选择：选项 B

### 选择理由
1. **零依赖**：完全使用 Canvas 2D API 绘制，不引入任何新依赖
2. **布局清晰**：
   - 图案区：与制作引导页一致的序号格布局，四边灰色序号
   - 物料清单区：粗体标题 + 灰色总用量 + 颜色条目（方块+色号+RGB+数量），自动换行
   - Logo 区：3×3 像素色块 logo + URL 文字
3. **自动换行**：物料清单列数 = `floor((可用宽度) / 条目宽度)`，超出列数自动换行到下一行
4. **尺寸自适应**：所有字体大小、方块大小基于 `cellSize` 按比例缩放，不同导出尺寸下保持视觉协调
5. **复用 computeUsage**：从 `pdf.ts` 导入 `computeUsage` 函数，避免重复实现
6. **Logo 复用**：使用与 Header 组件相同的 3×3 像素色块颜色和布局

### 实现细节
- `src/lib/export/png.ts`：完全重写 `exportPNG` 函数
  - 导入 `computeUsage` from `'./pdf'`
  - Canvas 总尺寸 = padding + 图案区 + padding + 物料清单区 + padding + Logo区 + padding
  - 图案区：四边序号格（与 PatternCanvas showAxisNumbers 逻辑一致）+ 色块 + 网格线 + 色号
  - 物料清单区：
    - 标题 "物料清单"：粗体，深色 `#1a1a2e`
    - 副标题 "像素总用量：{N}"：常规，灰色 `#888888`
    - 颜色条目：方块（`bead.hex`）+ 色号（粗体）+ RGB（灰色）+ 数量（粗体深色），居中对齐
  - Logo 区：`drawLogo()` 绘制 3×3 色块 + URL 文字 `https://apollohzl.github.io/PinDou_Apollo/`
- ExportPanel 无需修改，`exportPNG(grid, palette, pngOptions)` 接口不变
