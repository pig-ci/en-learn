// app/context/ThemeContext.tsx
"use client";

import { createContext, useContext, useEffect, useState, useCallback } from 'react';

type Theme = 'light' | 'dark' | 'system' | 'gray' | 'star';

interface ThemeContextType {
  theme: Theme;
  resolvedTheme: Theme; // 改為 Theme，因為它可以是任何有效主題
  setTheme: (theme: Theme) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<Theme>('system');
  const [resolvedTheme, setResolvedTheme] = useState<Theme>('light');

  // 初始化：讀取 localStorage
  useEffect(() => {
    const stored = localStorage.getItem('theme') as Theme | null;
    if (stored && ['light', 'dark', 'system', 'gray', 'star'].includes(stored)) {
      setTheme(stored);
    } else {
      setTheme('system');
    }
  }, []);

  // 監聽系統主題（僅在 theme === 'system' 時）
  useEffect(() => {
    const media = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = () => {
      if (theme === 'system') {
        setResolvedTheme(media.matches ? 'dark' : 'light');
      }
    };
    // 初次設定
    if (theme === 'system') {
      setResolvedTheme(media.matches ? 'dark' : 'light');
    }
    media.addEventListener('change', handleChange);
    return () => media.removeEventListener('change', handleChange);
  }, [theme]);

  // 當 theme 改變時，若非 system，resolvedTheme 等於 theme；若為 system，上面 effect 已處理
  useEffect(() => {
    if (theme !== 'system') {
      setResolvedTheme(theme);
    }
    // 儲存偏好
    localStorage.setItem('theme', theme);
    // 套用 data-theme
    const root = document.documentElement;
    if (theme === 'system') {
      // resolvedTheme 已在另一 effect 更新，但為了確保，我們在這裡也設定一次
      const media = window.matchMedia('(prefers-color-scheme: dark)');
      const systemTheme = media.matches ? 'dark' : 'light';
      root.setAttribute('data-theme', systemTheme);
    } else {
      root.setAttribute('data-theme', theme);
    }
  }, [theme]);

  // 另外監聽 resolvedTheme 變化來確保 data-theme 同步（特別是 system 模式）
  useEffect(() => {
    if (theme === 'system') {
      document.documentElement.setAttribute('data-theme', resolvedTheme);
    }
  }, [resolvedTheme, theme]);

  const handleSetTheme = useCallback((newTheme: Theme) => {
    setTheme(newTheme);
  }, []);

  return (
    <ThemeContext.Provider value={{ theme, resolvedTheme, setTheme: handleSetTheme }}>
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