// ========== Footer.tsx ==========
// 页脚: 版权信息与 GitHub 链接

import React from 'react';

const Footer: React.FC = () => {
  const repoUrl = 'https://github.com/Apollohzl/PinDou_Apollo';

  return (
    <footer
      style={{
        background: 'var(--bg-secondary)',
        borderTop: '3px solid var(--color-border)',
        padding: '16px 20px',
        textAlign: 'center',
      }}
    >
      <div className="flex items-center justify-center gap-4 flex-wrap">
        <span className="text-sm" style={{ color: 'var(--color-text)' }}>
          © {new Date().getFullYear()} 拼豆 Apollo
        </span>
        <span style={{ color: 'var(--color-border-dark)' }}>|</span>
        <span className="text-sm" style={{ color: 'var(--color-text-light)' }}>
          智能拼豆图纸生成工具
        </span>
        <span style={{ color: 'var(--color-border-dark)' }}>|</span>
        <a
          href={repoUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="pixel-btn secondary text-sm"
          style={{ fontSize: '13px', padding: '6px 14px' }}
        >
          GitHub
        </a>
      </div>
    </footer>
  );
};

export default Footer;
