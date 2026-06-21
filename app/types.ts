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

export interface Article {
  title: string;
  topic: string;
  body: string;
  questions: Question[];
  _level?: string;
}