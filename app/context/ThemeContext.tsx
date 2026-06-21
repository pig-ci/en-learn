// app/context/ThemeContext.tsx
"use client";

import { createContext, useContext, useEffect, useState, useCallback } from 'react';

type Theme = 'light' | 'dark' | 'system';

interface ThemeContextType {
  theme: Theme;
  resolvedTheme: 'light' | 'dark'; // 實際套用的主題（解析後）
  setTheme: (theme: Theme) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<Theme>('system');
  const [resolvedTheme, setResolvedTheme] = useState<'light' | 'dark'>('light');

  // 初始化：從 localStorage 讀取，若無則設為 'system'
  useEffect(() => {
    const stored = localStorage.getItem('theme') as Theme | null;
    if (stored && ['light', 'dark', 'system'].includes(stored)) {
      setTheme(stored);
    } else {
      setTheme('system');
    }
  }, []);

  // 監聽系統主題變化（僅在 theme === 'system' 時有效）
  useEffect(() => {
    const media = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = () => {
      if (theme === 'system') {
        setResolvedTheme(media.matches ? 'dark' : 'light');
      }
    };
    // 初次設定
    handleChange();
    media.addEventListener('change', handleChange);
    return () => media.removeEventListener('change', handleChange);
  }, [theme]);

  // 當 theme 或 resolvedTheme 變化時套用 data-theme
  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'system') {
      // 由系統決定，resolvedTheme 已更新
      root.setAttribute('data-theme', resolvedTheme);
    } else {
      root.setAttribute('data-theme', theme);
    }
    // 儲存偏好（但若為 system，可存 'system' 或清除？我們存 'system'）
    localStorage.setItem('theme', theme);
  }, [theme, resolvedTheme]);

  const handleSetTheme = useCallback((newTheme: Theme) => {
    setTheme(newTheme);
  }, []);

  // 計算實際套用的主題（給其他元件使用，如下拉選單標示）
  const effectiveTheme = theme === 'system' ? resolvedTheme : theme;

  return (
    <ThemeContext.Provider value={{ theme, resolvedTheme: effectiveTheme, setTheme: handleSetTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}