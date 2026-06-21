// app/components/ThemeToggle.tsx
"use client";

import { useTheme } from '../context/ThemeContext';
import { useState, useRef, useEffect } from 'react';

export default function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // 點擊外部關閉
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // 按鈕圖示
  const getToggleIcon = () => {
    if (theme === 'system') {
      return (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <rect x="2" y="3" width="20" height="14" rx="2" ry="2" />
          <line x1="8" y1="21" x2="16" y2="21" />
          <line x1="12" y1="17" x2="12" y2="21" />
        </svg>
      );
    } else if (theme === 'dark') {
      return (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M20.985 12.486a9 9 0 1 1-9.473-9.472c.405-.022.617.46.402.803a6 6 0 0 0 8.268 8.268c.344-.215.825-.004.803.401" />
        </svg>
      );
    } else if (theme === 'gray') {
      // 灰色主題圖示：Sun-Moon
      return (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 2v2" />
          <path d="M14.837 16.385a6 6 0 1 1-7.223-7.222c.624-.147.97.66.715 1.248a4 4 0 0 0 5.26 5.259c.589-.255 1.396.09 1.248.715" />
          <path d="M16 12a4 4 0 0 0-4-4" />
          <path d="m19 5-1.256 1.256" />
          <path d="M20 12h2" />
        </svg>
      );
    } else if (theme === 'star') {
      // 深藍太空主題圖示：Orbit
      return (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M20.341 6.484A10 10 0 0 1 10.266 21.85" />
          <path d="M3.659 17.516A10 10 0 0 1 13.74 2.152" />
          <circle cx="12" cy="12" r="3" />
          <circle cx="19" cy="5" r="2" />
          <circle cx="5" cy="19" r="2" />
        </svg>
      );
    } else {
      // light
      return (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="4" />
          <path d="M12 2v2" />
          <path d="M12 20v2" />
          <path d="m4.93 4.93 1.41 1.41" />
          <path d="m17.66 17.66 1.41 1.41" />
          <path d="M2 12h2" />
          <path d="M20 12h2" />
          <path d="m6.34 17.66-1.41 1.41" />
          <path d="m19.07 4.93-1.41 1.41" />
        </svg>
      );
    }
  };

  // 按鈕文字
  const getLabel = () => {
    if (theme === 'system') return '系統';
    if (theme === 'dark') return '暗色';
    if (theme === 'gray') return '灰色';
    if (theme === 'star') return '星空';
    return '亮色';
  };

  return (
    <div className="theme-selector" ref={dropdownRef}>
      <button
        className="theme-toggle"
        onClick={() => setIsOpen(!isOpen)}
        aria-label="切換主題"
        title="切換主題"
      >
        {getToggleIcon()}
        <span className="theme-label">{getLabel()}</span>
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginLeft: '4px' }}>
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </button>

      {isOpen && (
        <div className="theme-dropdown">
          <button
            className={`theme-option ${theme === 'light' ? 'active' : ''}`}
            onClick={() => { setTheme('light'); setIsOpen(false); }}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="4" />
              <path d="M12 2v2" />
              <path d="M12 20v2" />
              <path d="m4.93 4.93 1.41 1.41" />
              <path d="m17.66 17.66 1.41 1.41" />
              <path d="M2 12h2" />
              <path d="M20 12h2" />
              <path d="m6.34 17.66-1.41 1.41" />
              <path d="m19.07 4.93-1.41 1.41" />
            </svg>
            亮色
          </button>
          <button
            className={`theme-option ${theme === 'dark' ? 'active' : ''}`}
            onClick={() => { setTheme('dark'); setIsOpen(false); }}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M20.985 12.486a9 9 0 1 1-9.473-9.472c.405-.022.617.46.402.803a6 6 0 0 0 8.268 8.268c.344-.215.825-.004.803.401" />
            </svg>
            暗色
          </button>
          <button
            className={`theme-option ${theme === 'system' ? 'active' : ''}`}
            onClick={() => { setTheme('system'); setIsOpen(false); }}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="2" y="3" width="20" height="14" rx="2" ry="2" />
              <line x1="8" y1="21" x2="16" y2="21" />
              <line x1="12" y1="17" x2="12" y2="21" />
            </svg>
            系統
          </button>
          {/* 新增灰色 */}
          <button
            className={`theme-option ${theme === 'gray' ? 'active' : ''}`}
            onClick={() => { setTheme('gray'); setIsOpen(false); }}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 2v2" />
              <path d="M14.837 16.385a6 6 0 1 1-7.223-7.222c.624-.147.97.66.715 1.248a4 4 0 0 0 5.26 5.259c.589-.255 1.396.09 1.248.715" />
              <path d="M16 12a4 4 0 0 0-4-4" />
              <path d="m19 5-1.256 1.256" />
              <path d="M20 12h2" />
            </svg>
            灰色
          </button>
          {/* 新增太空 */}
          <button
            className={`theme-option ${theme === 'star' ? 'active' : ''}`}
            onClick={() => { setTheme('star'); setIsOpen(false); }}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M20.341 6.484A10 10 0 0 1 10.266 21.85" />
              <path d="M3.659 17.516A10 10 0 0 1 13.74 2.152" />
              <circle cx="12" cy="12" r="3" />
              <circle cx="19" cy="5" r="2" />
              <circle cx="5" cy="19" r="2" />
            </svg>
            星空
          </button>
        </div>
      )}
    </div>
  );
}