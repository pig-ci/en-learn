// app/layout.tsx
import type { Metadata, Viewport } from 'next';
import { SpeedInsights } from '@vercel/speed-insights/next';
import './style.css';
import './dark-style.css';

// 💡 根據新版 Next.js 規範，將 viewport 獨立導出，解決 500/警告問題
export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
};

// 💡 網站基本 Meta 設定
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
      </head>
      <body suppressHydrationWarning>
        {children}
        <SpeedInsights />
      </body>
    </html>
  );
}