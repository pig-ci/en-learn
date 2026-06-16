// app/page.tsx
"use client";

import { useState, useEffect } from "react";

// ── 1. 定義 TypeScript 型別 ──
interface SkillScore {
  c: number;
  t: number;
}

interface UserStats {
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

interface Question {
  type: "main" | "detail" | "inference" | "vocabulary";
  typeLabel: string;
  text: string;
  options: string[];
  answer: number;
  explanation: string;
}

interface Article {
  title: string;
  topic: string;
  body: string;
  questions: Question[];
  _level?: string;
}

// ── 2. 靜態設定資料 ──
const LEVELS = [
  {
    id: "A1",
    name: "Beginner A1",
    icon: "🌱",
    desc: "Simple sentences, everyday vocabulary",
  },
  {
    id: "A2",
    name: "Elementary A2",
    icon: "📗",
    desc: "Short texts, familiar topics",
  },
  {
    id: "B1",
    name: "Intermediate B1",
    icon: "📘",
    desc: "Clear standard texts, varied topics",
  },
  {
    id: "B1+",
    name: "Upper-Intermediate B1+",
    icon: "📙",
    desc: "Longer texts, abstract ideas",
  },
  {
    id: "B2",
    name: "Advanced B2",
    icon: "📕",
    desc: "Complex texts, nuanced meaning",
  },
];

const TOPICS_BY_LEVEL: Record<string, string[]> = {
  A1: ["a simple school day", "animals we see every day", "my favorite food"],
  A2: [
    "how coffee is made",
    "why cats sleep so much",
    "how music makes us feel",
  ],
  B1: [
    "the psychology of procrastination",
    "how cities create their own weather",
  ],
  "B1+": [
    "how language shapes the way we think",
    "the science of habit formation",
  ],
  B2: [
    "the ethics of artificial intelligence",
    "the neuroscience of creativity",
  ],
};

export default function Home() {
  // ── 3. 狀態管理 ──
  const [screen, setScreen] = useState<"dashboard" | "reading">("dashboard");
  const [stats, setStats] = useState<UserStats | null>(null);
  const [loading, setLoading] = useState({
    show: true,
    text: "載入中...",
    sub: "",
  });
  const [error, setError] = useState("");
  const [isMounted, setIsMounted] = useState(false);
  const [article, setArticle] = useState<Article | null>(null);
  const [answers, setAnswers] = useState<Record<number, number>>({}); // { 題號: 選擇的選項 }
  const [submitted, setSubmitted] = useState(false);
  const [progressBar, setProgressBar] = useState("0%");

  // ── 4. 初始化：從 LocalStorage 載入資料 ──
  useEffect(() => {
    setIsMounted(true);
    const localData = localStorage.getItem("english_study_stats");
    if (localData) {
      setStats(JSON.parse(localData));
    } else {
      const initStats: UserStats = {
        totalArticles: 0,
        totalCorrect: 0,
        totalQuestions: 0,
        streak: 0,
        lastDate: null,
        currentLevel: "A2",
        skillScores: {
          main: { c: 0, t: 0 },
          detail: { c: 0, t: 0 },
          inference: { c: 0, t: 0 },
          vocabulary: { c: 0, t: 0 },
        },
        recentArticles: [],
      };
      localStorage.setItem("english_study_stats", JSON.stringify(initStats));
      setStats(initStats);
    }
    setLoading({ show: false, text: "", sub: "" });
  }, []);

  if (!isMounted || !stats) {
    return (
      <div style={{ background: '#F7F7F5', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ color: '#1a1a1a', fontWeight: 500 }}>Loading Studio...</div>
      </div>
    );
  }

  // ── 5. 邏輯輔助函式 ──
  const currentLevelInfo =
    LEVELS.find((l) => l.id === stats.currentLevel) || LEVELS[1];
  const overallAccuracy =
    stats.totalQuestions > 0
      ? Math.round((stats.totalCorrect / stats.totalQuestions) * 100) + "%"
      : "—";

  function pickTopic(level: string) {
    const pool = TOPICS_BY_LEVEL[level] || TOPICS_BY_LEVEL["A2"];
    return pool[Math.floor(Math.random() * pool.length)];
  }

  function weakSkill(currentStats: UserStats) {
    const entries = Object.entries(currentStats.skillScores).filter(
      ([, v]) => v.t > 0,
    );
    if (!entries.length) return null;
    return entries.sort((a, b) => a[1].c / a[1].t - b[1].c / b[1].t)[0][0];
  }

  function calcNewLevel(
    currentStats: UserStats,
    correct: number,
    total: number,
  ) {
    const pct = correct / total;
    const cur = currentStats.currentLevel || "A2";
    const idx = LEVELS.findIndex((l) => l.id === cur);
    let newIdx = idx;
    if (pct >= 0.85 && idx < LEVELS.length - 1) newIdx = idx + 1;
    else if (pct < 0.5 && idx > 0) newIdx = idx - 1;
    return LEVELS[newIdx].id;
  }

  // ── 6. 開始生成文章 ──
  async function startReading() {
    setScreen("reading");
    setArticle(null);
    setAnswers({});
    setSubmitted(false);
    setProgressBar("0%");
    setLoading({
      show: true,
      text: "正在為您生成專屬文章...",
      sub: "這需要幾秒鐘的時間",
    });
// 💡 使用這段邏輯，完全避開 TypeScript 的檢測地雷
const currentStats = stats ?? { 
  totalArticles: 0, 
  currentLevel: "A2",
  skillScores: { main: { c: 0, t: 0 }, detail: { c: 0, t: 0 }, inference: { c: 0, t: 0 }, vocabulary: { c: 0, t: 0 } }
}; 

const level = currentStats.currentLevel || "A2";
const topic = pickTopic(level);

// ✨ 重點：這裡傳入 currentStats，而不是那個可能會是 null 的 stats
const weak = weakSkill(currentStats as any); 
const isFirst = currentStats.totalArticles === 0;

    try {
      const res = await fetch("/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ level, topic, weakSkill: weak, isFirst }),
      });

      if (!res.ok) throw new Error("連線失敗: " + res.status);
      const data: Article = await res.json();
      data._level = level;

      setArticle(data);
      setProgressBar("15%");
    } catch (e: any) {
      setScreen("dashboard");
      setError("文章生成失敗，請稍後重試。(" + e.message + ")");
      setTimeout(() => setError(""), 5000);
    } finally {
      setLoading({ show: false, text: "", sub: "" });
    }
  }

  // 選項點擊
  function pickOption(qIdx: number, oIdx: number) {
    if (submitted || !article) return;
    const newAnswers = { ...answers, [qIdx]: oIdx };
    setAnswers(newAnswers);

    const done = Object.keys(newAnswers).length;
    const total = article.questions.length;
    setProgressBar(15 + Math.round((done / total) * 50) + "%");
  }

  // 提交作答
  function submitAnswers() {
    if (submitted || !article) return;
    setSubmitted(true);
    setProgressBar("80%");

    let correctCount = 0;
    const bk: Record<string, SkillScore> = {
      main: { c: 0, t: 0 },
      detail: { c: 0, t: 0 },
      inference: { c: 0, t: 0 },
      vocabulary: { c: 0, t: 0 },
    };

    article.questions.forEach((q, i) => {
      const chosen = answers[i];
      const isCorrect = chosen === q.answer;
      if (isCorrect) correctCount++;
      bk[q.type].t++;
      if (isCorrect) bk[q.type].c++;
    });

    const today = new Date().toDateString();
    const last = stats.lastDate;
    const yest = new Date(Date.now() - 86400000).toDateString();
    let streak = stats.streak || 0;
    if (last !== today) streak = last === yest ? streak + 1 : 1;

    const newSkillScores = JSON.parse(JSON.stringify(stats.skillScores));
    Object.keys(bk).forEach((k) => {
      newSkillScores[k].c = (newSkillScores[k].c || 0) + bk[k].c;
      newSkillScores[k].t = (newSkillScores[k].t || 0) + bk[k].t;
    });

    const newLevel = calcNewLevel(
      stats,
      correctCount,
      article.questions.length,
    );
    const newRecent = [
      ...stats.recentArticles.slice(-19),
      {
        title: article.title,
        correct: correctCount,
        total: article.questions.length,
        level: article._level || "A2",
        ts: Date.now(),
      },
    ];

    const updatedStats: UserStats = {
      totalArticles: stats.totalArticles + 1,
      totalCorrect: stats.totalCorrect + correctCount,
      totalQuestions: stats.totalQuestions + article.questions.length,
      streak,
      lastDate: today,
      currentLevel: newLevel,
      skillScores: newSkillScores,
      recentArticles: newRecent,
    };

    localStorage.setItem("english_study_stats", JSON.stringify(updatedStats));
    setStats(updatedStats);
    setProgressBar("100%");
  }

  return (
    <>
      <nav>
        <div className="nav-inner">
          <div className="nav-logo">
            English <span>Reading Practice</span>
          </div>
        </div>
      </nav>

      {loading.show && (
        <div className="loading-overlay">
          <div className="spinner"></div>
          <div className="loading-text">{loading.text}</div>
          <div className="loading-sub">{loading.sub}</div>
        </div>
      )}

      <main>
        {error && (
          <div className="error-box" style={{ display: "block" }}>
            {error}
          </div>
        )}

        {/* ── DASHBOARD SCREEN ── */}
        {screen === "dashboard" && (
          <div className="dashboard" style={{ display: "block" }}>
            <div className="section-label">My Progress</div>
            <div className="stats-row">
              <div className="stat-card">
                <div className="stat-label">Articles</div>
                <div className="stat-value">{stats.totalArticles}</div>
                <div className="stat-sub">completed</div>
              </div>
              <div className="stat-card">
                <div className="stat-label">Accuracy</div>
                <div className="stat-value">{overallAccuracy}</div>
                <div className="stat-sub">overall</div>
              </div>
              <div className="stat-card">
                <div className="stat-label">Streak</div>
                <div className="stat-value">{stats.streak}</div>
                <div className="stat-sub">days</div>
              </div>
            </div>

            <div className="level-card">
              <div className="level-icon">{currentLevelInfo.icon}</div>
              <div className="level-info">
                <h3>{currentLevelInfo.name}</h3>
                <p>{currentLevelInfo.desc}</p>
              </div>
            </div>

            <div className="skill-section">
              <h3>Question Type Performance</h3>
              {Object.entries(stats.skillScores).map(([key, data]) => {
                const labels: Record<string, string> = {
                  main: "主旨題 Main Idea",
                  detail: "細節題 Detail",
                  inference: "推論題 Inference",
                  vocabulary: "詞彙題 Vocabulary",
                };
                const pct =
                  data.t > 0 ? Math.round((data.c / data.t) * 100) : null;
                const fillClass =
                  pct !== null && pct >= 70
                    ? "fill-good"
                    : pct !== null && pct >= 50
                      ? "fill-mid"
                      : "fill-weak";
                return (
                  <div className="skill-row" key={key}>
                    <div className="skill-top">
                      <span className="skill-name">{labels[key]}</span>
                      <span className="skill-pct">
                        {pct !== null ? `${pct}%` : "No data"}
                      </span>
                    </div>
                    <div className="skill-bar">
                      <div
                        className={`skill-fill ${fillClass}`}
                        style={{ width: pct !== null ? `${pct}%` : "0%" }}
                      ></div>
                    </div>
                  </div>
                );
              })}
            </div>

            <button className="btn-start" onClick={startReading}>
              {stats.totalArticles === 0
                ? "Start First Article →"
                : "Next Article →"}
            </button>
          </div>
        )}

        {/* ── READING SCREEN ── */}
        {screen === "reading" && article && (
          <div className="reading-screen" style={{ display: "block" }}>
            <div className="progress-bar-wrap">
              <div
                className="progress-bar-fill"
                style={{ width: progressBar }}
              ></div>
            </div>

            <div className="article-meta">
              <span className="tag tag-topic">{article.topic}</span>
              <span className="tag tag-level">{article._level}</span>
            </div>

            <div className="article-card">
              <div className="article-title">{article.title}</div>
              <div
                className="article-body"
                dangerouslySetInnerHTML={{
                  __html: article.body
                    .split("\n\n")
                    .map((p) => `<p>${p}</p>`)
                    .join(""),
                }}
              ></div>
            </div>

            <div className="questions-card">
              <h3>Comprehension Questions</h3>
              {article.questions.map((q, qIdx) => (
                <div className="question" key={qIdx}>
                  <div className="q-text">
                    <span className="q-num">{qIdx + 1}.</span>
                    <span className="q-type-badge">{q.typeLabel}</span>
                    {q.text}
                  </div>
                  <div className="options">
                    {q.options.map((opt, oIdx) => {
                      const lbl = ["A", "B", "C", "D"][oIdx];
                      const txt = opt.replace(/^[A-D]\.\s*/, "");

                      let btnClass = "opt-btn";
                      if (!submitted && answers[qIdx] === oIdx)
                        btnClass += " selected";
                      if (submitted) {
                        if (oIdx === q.answer) btnClass += " correct";
                        else if (answers[qIdx] === oIdx && oIdx !== q.answer)
                          btnClass += " wrong";
                      }

                      return (
                        <button
                          className={btnClass}
                          key={oIdx}
                          onClick={() => pickOption(qIdx, oIdx)}
                          disabled={submitted}
                        >
                          <span className="opt-label">{lbl}</span>
                          <span>{txt}</span>
                        </button>
                      );
                    })}
                  </div>

                  {submitted && (
                    <div
                      className={`q-exp show ${answers[qIdx] === q.answer ? "ok" : "no"}`}
                    >
                      <div className="q-exp-title">
                        {answers[qIdx] === q.answer
                          ? "✓ Correct"
                          : "✗ Incorrect"}
                      </div>
                      {q.explanation}
                    </div>
                  )}
                </div>
              ))}

              {!submitted && (
                <div className="submit-row">
                  <button
                    className="btn-submit"
                    onClick={submitAnswers}
                    disabled={
                      Object.keys(answers).length < article.questions.length
                    }
                  >
                    Submit Answers
                  </button>
                </div>
              )}
            </div>

            {submitted && (
              <div className="result-card" style={{ display: "block" }}>
                <div className="result-msg">
                  練習完成！您的得分已同步至本地進度。
                </div>
                <div
                  style={{
                    display: "flex",
                    gap: "10px",
                    marginTop: "15px",
                    justifyContent: "center",
                  }}
                >
                  <button className="btn-next" onClick={startReading}>
                    Next Article →
                  </button>
                  <button
                    className="btn-back2"
                    onClick={() => setScreen("dashboard")}
                  >
                    Home
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </main>
    </>
  );
}
