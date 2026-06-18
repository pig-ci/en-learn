# English Reading Practice

一個基於 Next.js 和 Google Gemini AI 的英文閱讀練習平台，專為台灣國中生準備會考而設計。透過 AI 生成個人化文章與閱讀測驗，幫助學生提升英文閱讀能力。

[![Next.js](https://img.shields.io/badge/Next.js-15.2.7-blue?style=flat-square&logo=next.js)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19.0.0-blue?style=flat-square&logo=react)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.8.2-blue?style=flat-square&logo=typescript)](https://www.typescriptlang.org/)
[![Google Gemini](https://img.shields.io/badge/Google_Gemini-3.1_Flash-orange?style=flat-square&logo=google)](https://deepmind.google/technologies/gemini/)
[![License](https://img.shields.io/badge/License-GPLv3.0-green?style=flat-square)](LICENSE)

---

## 功能特色

- **AI 生成文章**：根據學生的程度（A1-B2）自動生成適合的閱讀文章
- **會考題型練習**：每篇文章包含 4 種會考題型（主旨題、細節題、推論題、詞彙題）
- **學習進度追蹤**：記錄答題正確率、連續學習天數、各題型表現
- **個人化學習**：根據弱點題型自動加強練習
- **響應式設計**：完美支援手機、平板、電腦裝置
- **本地資料儲存**：使用 LocalStorage 保存學習進度

---

## 快速開始

### 系統需求
- Node.js 18.0.0 以上
- npm 或 pnpm 套件管理器
- Google Gemini API Key

### 安裝步驟

1. **複製專案**
```bash
git clone https://github.com/pig-ci/en-learn.git
cd en-learn
```

2. **安裝依賴**
```bash
npm install
# 或使用 pnpm
pnpm install
```

3. **設定環境變數**
```bash
cp .env.example .env.local
```
編輯 `.env.local` 並填入你的 Gemini API Key：
```env
GEMINI_API_KEY=your-google-gemini-api-key
```

4. **啟動開發伺服器**
```bash
npm run dev
# 或
pnpm dev
```

5. **開啟瀏覽器**
訪問 [http://localhost:3000](http://localhost:3000)

---

## 技術棧

### 前端
- **框架**：Next.js 15.2.7 (App Router)
- **語言**：TypeScript 5.8.2
- **UI 框架**：React 19.0.0
- **樣式**：純 CSS（漸進式增強）

### 後端
- **API 路由**：Next.js API Routes
- **AI 模型**：Google Gemini 2.5 Flash
- **認證**：無（完全客戶端）

### 開發工具
- **套件管理**：pnpm
- **型別檢查**：TypeScript
- **代碼格式**：Prettier (建議)

---

## 專案結構

```
english-reading-practice/
├── app/
│   ├── generate/
│   │   └── route.ts          # Gemini API 路由
│   ├── layout.tsx            # 根布局
│   ├── page.tsx              # 主要頁面
│   └── global.css            # 全域樣式
├── public/                   # 靜態資源
├── .env.example              # 環境變數範例
├── next.config.js            # Next.js 配置
├── package.json              # 專案依賴
├── tsconfig.json             # TypeScript 配置
└── README.md                 # 專案說明
```

---

## 使用說明

### 儀表板 (Dashboard)
- 查看學習統計（文章數、正確率、連續天數）
- 顯示當前等級與各題型表現
- 點擊「Next Article」開始練習

### 閱讀練習 (Reading)
1. 閱讀 AI 生成的文章
2. 回答 4 道選擇題
3. 提交答案查看解析
4. 系統自動記錄成績並調整等級

### 等級系統
| 等級 | 說明 | 字數範圍 |
| :--- | :--- | :--- |
| A1 | 初級 Beginner | 100-130 字 |
| A2 | 基礎 Elementary | 140-170 字 |
| B1 | 中級 Intermediate | 180-230 字 |
| B1+ | 中高級 Upper-Intermediate | 220-260 字 |
| B2 | 高級 Advanced | 250-290 字 |

---

## 測試

### 本地測試 API
```bash
curl -X POST http://localhost:3000/generate \
  -H "Content-Type: application/json" \
  -d '{"level":"A2","topic":"how coffee is made","weakSkill":null,"isFirst":true}'
```

---

## 數據持久化

所有學習進度儲存在瀏覽器的 LocalStorage 中：
- `english_study_stats`：包含文章數、正確率、連續天數、各題型表現等

---

## 貢獻

歡迎提交 Issue 和 Pull Request！

1. Fork 專案
2. 建立功能分支 (`git checkout -b feature/AmazingFeature`)
3. 提交變更 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 開啟 Pull Request

---

## 授權

本專案採用 GPLv3.0 授權 - 詳見 [LICENSE](LICENSE) 檔案。

---

## 致謝

- [Next.js](https://nextjs.org/) - React 框架
- [Google Gemini](https://deepmind.google/technologies/gemini/) - AI 生成引擎
- [Google Fonts](https://fonts.google.com/) - 字型服務

---

## 聯絡

如有問題，請開啟 [Issue](https://github.com/your-username/english-reading-practice/issues) 或聯絡專案維護者。
