// ========== UsageStats.tsx ==========
// 用量统计: 表格显示每种颜色的用量与建议购买包数

import React, { useMemo } from 'react';
import type { PatternGrid, Palette } from '../lib/types';
import { computeUsage } from '../lib/export/pdf';

interface UsageStatsProps {
  grid: PatternGrid;
  palette: Palette;
}

const UsageStats: React.FC<UsageStatsProps> = ({ grid, palette }) => {
  const usage = useMemo(() => computeUsage(grid, palette), [grid, palette]);

  const totals = useMemo(() => {
    const totalBeads = usage.reduce((s, it) => s + it.count, 0);
    const totalPacks = usage.reduce((s, it) => s + it.packs, 0);
    return { totalBeads, totalPacks, colorCount: usage.length };
  }, [usage]);

  if (usage.length === 0) {
    return (
      <div className="pixel-card text-center">
        <p className="text-lg" style={{ color: 'var(--color-text-light)' }}>
          暂无数据, 请先生成图纸
        </p>
      </div>
    );
  }

  return (
    <div className="pixel-card">
      <h2 className="text-xl mb-4" style={{ color: 'var(--color-text)' }}>
        用量统计
      </h2>

      {/* 概览 */}
      <div className="flex gap-4 flex-wrap mb-4">
        <div className="pixel-card" style={{ flex: '1', minWidth: '120px', textAlign: 'center', padding: '12px' }}>
          <p className="text-2xl font-bold" style={{ color: 'var(--color-primary)' }}>
            {totals.colorCount}
          </p>
          <p className="text-sm" style={{ color: 'var(--color-text-light)' }}>颜色种类</p>
        </div>
        <div className="pixel-card" style={{ flex: '1', minWidth: '120px', textAlign: 'center', padding: '12px' }}>
          <p className="text-2xl font-bold" style={{ color: 'var(--color-secondary)' }}>
            {totals.totalBeads}
          </p>
          <p className="text-sm" style={{ color: 'var(--color-text-light)' }}>总颗数</p>
        </div>
        <div className="pixel-card" style={{ flex: '1', minWidth: '120px', textAlign: 'center', padding: '12px' }}>
          <p className="text-2xl font-bold" style={{ color: 'var(--color-purple)' }}>
            {totals.totalPacks}
          </p>
          <p className="text-sm" style={{ color: 'var(--color-text-light)' }}>建议包数</p>
        </div>
        <div className="pixel-card" style={{ flex: '1', minWidth: '120px', textAlign: 'center', padding: '12px' }}>
          <p className="text-2xl font-bold" style={{ color: 'var(--color-blue)' }}>
            {grid.width}×{grid.height}
          </p>
          <p className="text-sm" style={{ color: 'var(--color-text-light)' }}>图纸尺寸</p>
        </div>
      </div>

      {/* 表格 */}
      <div style={{ overflowX: 'auto' }}>
        <table className="stats-table">
          <thead>
            <tr>
              <th style={{ width: '40px' }}>#</th>
              <th style={{ width: '50px' }}>色块</th>
              <th>色号</th>
              <th>颜色名称</th>
              <th>英文名</th>
              <th style={{ textAlign: 'right' }}>数量(颗)</th>
              <th style={{ textAlign: 'right' }}>包数</th>
            </tr>
          </thead>
          <tbody>
            {usage.map((item, i) => (
              <tr key={item.bead.index}>
                <td style={{ color: 'var(--color-text-light)' }}>{i + 1}</td>
                <td>
                  <div
                    style={{
                      width: '24px',
                      height: '24px',
                      borderRadius: '4px',
                      border: '2px solid var(--color-border-dark)',
                      background: item.bead.hex,
                    }}
                  />
                </td>
                <td className="font-bold">{item.bead.code}</td>
                <td>{item.bead.name}</td>
                <td style={{ color: 'var(--color-text-light)' }}>{item.bead.nameEn}</td>
                <td style={{ textAlign: 'right' }}>{item.count}</td>
                <td style={{ textAlign: 'right' }}>{item.packs}</td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr className="total-row">
              <td colSpan={5}>总计</td>
              <td style={{ textAlign: 'right' }}>{totals.totalBeads}</td>
              <td style={{ textAlign: 'right' }}>{totals.totalPacks}</td>
            </tr>
          </tfoot>
        </table>
      </div>

      <p className="text-xs mt-4" style={{ color: 'var(--color-text-light)' }}>
        * 包数按每包 1000 颗计算, 向上取整。建议额外购买 10% 备用量。
      </p>
    </div>
  );
};

export default UsageStats;
