# English Reading & Listening Practice

一個基於 Next.js 和 Google Gemini AI 的英文閱讀、聽力與填空練習平台，專為台灣國中生準備會考而設計。透過 AI 生成個人化文章與多樣化測驗，全面提升英文能力。

[![Next.js](https://img.shields.io/badge/Next.js-15.2.7-blue?style=flat-square&logo=next.js)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19.0.0-blue?style=flat-square&logo=react)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.8.2-blue?style=flat-square&logo=typescript)](https://www.typescriptlang.org/)
[![Google Gemini](https://img.shields.io/badge/Google_Gemini-2.5_Flash-orange?style=flat-square&logo=google)](https://deepmind.google/technologies/gemini/)
[![License](https://img.shields.io/badge/License-GPLv3.0-green?style=flat-square)](LICENSE)

---

## 功能特色

- **三種練習模式**：閱讀測驗、聽力測驗（使用瀏覽器 TTS 朗讀）、填空測驗（關鍵詞填空）
- **AI 生成文章**：根據學生的程度（A1-B2）自動生成適合的文章，並根據弱點題型加強練習
- **會考題型練習**：每篇文章包含 4 種會考選擇題（主旨題、細節題、推論題、詞彙題）
- **填空專項訓練**：從文章中挖空 4-6 個關鍵詞，提供四個選項（A1/A2 選擇題形式），加強詞彙與上下文理解
- **學習進度追蹤**：記錄答題正確率、連續學習天數、各題型表現（閱讀與填空題皆歸入詞彙題統計）
- **個人化難度調整**：根據近期表現自動升降級（A1 ~ B2）
- **多種主題模式**：亮色、暗色、灰色、星空四種視覺主題，保護眼睛並提供個人化體驗
- **響應式設計**：完美支援手機、平板、電腦裝置
- **本地資料儲存**：使用 LocalStorage 保存學習進度，無需註冊即可使用

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
- **樣式**：純 CSS（支援亮色／暗色／灰色／星空主題）
- **語音合成**：Web Speech API（用於聽力模式）

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
en-learn/
├── app/
│   ├── generate/
│   │   └── route.ts              # Gemini API 路由（支援 reading/listening/fill 模式）
│   ├── components/
│   │   ├── Dashboard.tsx         # 儀表板（顯示統計、等級、各題型表現）
│   │   ├── ReadingScreen.tsx     # 閱讀與聽力共用畫面（含語音控制）
│   │   ├── FillScreen.tsx        # 填空測驗畫面
│   │   ├── SkeletonScreen.tsx    # 載入骨架
│   │   └── ThemeToggle.tsx       # 主題切換下拉選單
│   ├── context/
│   │   └── ThemeContext.tsx      # 主題狀態管理
│   ├── style/
│   │   ├── style.css             # 基礎樣式
│   │   ├── dark-style.css        # 暗色主題
│   │   ├── grey-style.css        # 灰色主題
│   │   └── star-style.css        # 星空主題
│   ├── types.ts                  # TypeScript 型別定義（含 FillBlank）
│   ├── layout.tsx                # 根布局（含主題初始化）
│   └── page.tsx                  # 主要頁面（切換模式與狀態管理）
├── public/                       # 靜態資源
├── .env.example                  # 環境變數範例
├── next.config.js                # Next.js 配置
├── package.json                  # 專案依賴
├── tsconfig.json                 # TypeScript 配置
└── README.md                     # 專案說明
```

---

## 使用說明

### 儀表板 (Dashboard)
- 查看學習統計（完成文章數、整體正確率、連續學習天數）
- 顯示當前等級與各題型表現（主旨、細節、推論、詞彙）
- 根據當前選擇的模式（閱讀／聽力／填空），點擊「Start First …」或「Next …」開始練習

### 閱讀測驗
1. 閱讀 AI 生成的文章（含重點詞彙標記 `<u>`）
2. 回答 4 道選擇題（主旨、細節、推論、詞彙）
3. 提交答案查看解析
4. 系統自動記錄成績並調整等級

### 聽力測驗
1. 頁面顯示文章標題與題目，但**文章內容隱藏**
2. 點擊「播放」按鈕，瀏覽器以英文朗讀全文（可使用 Chrome / Edge / Safari）
3. 聽完後回答相同的 4 道選擇題
4. 提交答案後獲得回饋，成績納入統計

### 填空測驗
1. 閱讀文章，其中 4-6 個關鍵詞被替換為 `____`
2. 每個空格提供四個選項（A/B/C/D），選出最合適的單詞
3. 所有空格填完後提交答案
4. 系統會顯示正確答案與錯誤解析，成績同時納入統計（計入詞彙題正確率）

### 主題切換
- 點擊導航列右側的主題圖示，可從下拉選單中選擇：
  - **亮色**（預設）
  - **暗色**（護眼）
  - **灰色**（低對比）
  - **星空**（深藍黑色背景，適合夜間）
- 選擇會立即套用，並儲存於 LocalStorage

### 等級系統
| 等級 | 說明 | 文章字數範圍 |
| :--- | :--- | :--- |
| A1   | 初級 Beginner       | 80–100 字 |
| A2   | 基礎 Elementary     | 100–130 字 |
| B1   | 中級 Intermediate   | 130–160 字 |
| B1+  | 中高級 Upper-Intermediate | 160–190 字 |
| B2   | 高級 Advanced       | 190–220 字 |
- 系統會根據最近答題正確率自動升降級（≥85% 升級，<50% 降級）

---

## 測試 API (本地)

```bash
curl -X POST http://localhost:3000/generate \
  -H "Content-Type: application/json" \
  -d '{"level":"A2","topic":"how coffee is made","weakSkill":null,"isFirst":true,"mode":"reading"}'
```
支援的 `mode` 參數：`reading`、`listening`、`fill`

---

## 數據持久化

所有學習進度儲存在瀏覽器的 LocalStorage 中：
- Key: `english_study_stats`
- 內容包括：文章數、正確數、總題數、連續天數、當前等級、各題型累計答對/答錯數、最近 20 篇文章記錄

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
- Web Speech API - 瀏覽器語音合成

---

## 聯絡

如有問題，請開啟 [Issue](https://github.com/pig-ci/en-learn/issues) 或聯絡專案維護者。