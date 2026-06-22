// app/types.ts
export interface SkillScore {
  c: number;
  t: number;
}

export interface UserStats {
  totalArticles: number;
  totalCorrect: number;
  totalQuestions: number;
  streak: number;
  lastDate: string | null;
  currentLevel: string;
  skillScores: Record<string, SkillScore>;
  recentArticles: Array<{
    title: string;
    correct: number;
    total: number;
    level: string;
    ts: number;
  }>;
}

export interface Question {
  type: "main" | "detail" | "inference" | "vocabulary";
  typeLabel: string;
  text: string;
  options: string[];
  answer: number;
  explanation: string;
}

// ── 新增填空型別 ──
export interface FillBlank {
  id: number;                // 流水號
  sentence: string;          // 包含 ____ 的句子（完整句子）
  correctWord: string;       // 正確答案
  options: string[];         // 四個選項（含正確詞與干擾詞）
  hint?: string;             // 中文提示（選填）
}

export interface Article {
  title: string;
  topic: string;
  body: string;              // 注意：在 fill 模式下，body 中關鍵詞已替換為 ____
  questions: Question[];
  _level?: string;
  fillBlanks?: FillBlank[];  // 只有 fill 模式才有此欄位
}