// app/layout.tsx
import type { Metadata, Viewport } from 'next';
import './style/style.css';
import './style/dark-style.css';
import './style/grey-style.css';      // 新增
import './style/star-style.css'; // 新增
import { ThemeProvider } from './context/ThemeContext';

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
};

export const metadata: Metadata = {
  title: 'English Reading Practice',
  description: 'Read interesting articles, answer questions, and get better every time.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="zh-TW" suppressHydrationWarning>
      <head>
        {/* 防止閃爍：僅在 localStorage 有明確主題時才套用，否則留給 Client 處理（系統預設） */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  const theme = localStorage.getItem('theme');
                  if (theme === 'light' || theme === 'dark' || theme === 'gray' || theme === 'star' || theme === 'deep-blue') {
                    document.documentElement.setAttribute('data-theme', theme);
                  } else if (theme === 'system') {
                    // 如果是 system，則不設置，讓瀏覽器預設（但我們希望跟隨系統，所以根據 prefers-color-scheme 設置）
                    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
                    document.documentElement.setAttribute('data-theme', prefersDark ? 'dark' : 'light');
                  }
                  // 若無 theme 鍵，則什麼都不做，等待 Context 初始化後設定（預設 system）
                } catch (e) {}
              })();
            `,
          }}
        />
      </head>
      <body suppressHydrationWarning>
        <ThemeProvider>
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}