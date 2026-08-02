# PinDou_Apollo - 智能拼豆图纸生成工具

> 基于 Web 的智能拼豆图纸生成与管理平台

## 项目简介

PinDou_Apollo 是一个智能拼豆图纸生成工具，通过先进的图像处理算法和 AI 技术，将任意图片一键转换为拼豆图纸，并支持多品牌色卡匹配、专业编辑、用量统计与导出功能。

## 核心特性

- **一键转图**：上传图片自动生成拼豆图纸，支持多品牌色卡
- **精准配色**：基于 CIEDE2000 色差算法的 Lab 色彩空间匹配
- **全链路服务**：图纸生成 → 色号标注 → 用量统计 → 采购清单 → 制作引导
- **隐私优先**：图像处理在浏览器本地完成，零后端 API 成本
- **多品牌支持**：Artkal、Perler、Hama、MARD 等主流色卡

## 技术栈

- React 19 + TypeScript
- Tailwind CSS 4
- Canvas API + Web Workers
- Three.js（3D 预览）
- Next.js / Vite

## 文档

详细技术文档请参阅 [Wiki](./wiki.md)。

## 许可证

MIT License
