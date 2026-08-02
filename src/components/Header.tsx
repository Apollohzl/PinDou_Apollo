// ========== Header.tsx ==========
// 页头: 项目 logo、名称与步骤指示器

import React from 'react';

interface HeaderProps {
  currentStep: number;
  maxStep: number;
  onStepClick: (step: number) => void;
}

const STEPS = [
  { num: 1, label: '上传' },
  { num: 2, label: '设置' },
  { num: 3, label: '生成' },
  { num: 4, label: '编辑' },
  { num: 5, label: '导出' },
];

const Header: React.FC<HeaderProps> = ({ currentStep, maxStep, onStepClick }) => {
  return (
    <header
      style={{
        background: 'var(--bg-card)',
        borderBottom: '3px solid var(--color-border)',
        padding: '12px 20px',
        boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
      }}
    >
      <div
        className="flex items-center justify-between flex-wrap gap-4"
        style={{ maxWidth: '1400px', margin: '0 auto' }}
      >
        {/* Logo & 名称 */}
        <div className="flex items-center gap-3">
          <div
            style={{
              width: '44px',
              height: '44px',
              display: 'grid',
              gridTemplateColumns: 'repeat(3, 1fr)',
              gridTemplateRows: 'repeat(3, 1fr)',
              gap: '2px',
              padding: '4px',
              background: 'var(--bg-secondary)',
              borderRadius: '8px',
              border: '3px solid var(--color-border-dark)',
            }}
          >
            {/* 像素风 logo - 3x3 色块 */}
            <div style={{ background: '#FF6B9D', borderRadius: '2px' }} />
            <div style={{ background: '#FFD93D', borderRadius: '2px' }} />
            <div style={{ background: '#4ECDC4', borderRadius: '2px' }} />
            <div style={{ background: '#A78BFA', borderRadius: '2px' }} />
            <div style={{ background: '#FF6B9D', borderRadius: '2px' }} />
            <div style={{ background: '#60A5FA', borderRadius: '2px' }} />
            <div style={{ background: '#34D399', borderRadius: '2px' }} />
            <div style={{ background: '#FFD93D', borderRadius: '2px' }} />
            <div style={{ background: '#4ECDC4', borderRadius: '2px' }} />
          </div>
          <div>
            <h1
              style={{
                fontSize: '24px',
                color: 'var(--color-text)',
                lineHeight: 1.2,
              }}
            >
              拼豆 Apollo
            </h1>
            <p
              className="text-xs"
              style={{ color: 'var(--color-text-light)' }}
            >
              智能拼豆图纸生成器
            </p>
          </div>
        </div>

        {/* 步骤指示器 */}
        <nav className="step-indicator">
          {STEPS.map((step, i) => {
            const isDisabled = step.num > maxStep;
            const isActive = step.num === currentStep;
            const isCompleted = step.num < currentStep;

            return (
              <React.Fragment key={step.num}>
                <div
                  className={`step-item ${isDisabled ? 'disabled' : ''}`}
                  onClick={() => !isDisabled && onStepClick(step.num)}
                >
                  <div
                    className={`step-number ${isActive ? 'active' : ''} ${
                      isCompleted ? 'completed' : ''
                    }`}
                  >
                    {isCompleted ? '✓' : step.num}
                  </div>
                  <span className="step-label">{step.label}</span>
                </div>
                {i < STEPS.length - 1 && <span className="step-arrow">→</span>}
              </React.Fragment>
            );
          })}
        </nav>
      </div>
    </header>
  );
};

export default Header;
