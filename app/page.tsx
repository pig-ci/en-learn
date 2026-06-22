// app/page.tsx
"use client";

import { useState, useEffect, useRef } from "react";
import ThemeToggle from "./components/ThemeToggle";
import SkeletonScreen from "./components/SkeletonScreen";
import Dashboard from "./components/Dashboard";
import ReadingScreen from "./components/ReadingScreen";
import ListeningScreen from "./components/ListeningScreen";
import FillScreen from "./components/FillScreen";
import { UserStats, Article } from "./types";
import "./style/style.css";
import "./style/dark-style.css";
import "./style/grey-style.css";
import "./style/star-style.css";

// ── 靜態設定資料 ──
const LEVELS = [
  { id: "A1", name: "Beginner A1", icon: "🌱", desc: "Simple sentences, everyday vocabulary" },
  { id: "A2", name: "Elementary A2", icon: "📗", desc: "Short texts, familiar topics" },
  { id: "B1", name: "Intermediate B1", icon: "📘", desc: "Clear standard texts, varied topics" },
  { id: "B1+", name: "Upper-Intermediate B1+", icon: "📙", desc: "Longer texts, abstract ideas" },
  { id: "B2", name: "Advanced B2", icon: "📕", desc: "Complex texts, nuanced meaning" },
];

const TOPICS_BY_LEVEL: Record<string, string[]> = {
  A1: ["a simple school day", "animals we see every day", "my favorite food"],
  A2: ["how coffee is made", "why cats sleep so much", "how music makes us feel"],
  B1: ["the psychology of procrastination", "how cities create their own weather"],
  "B1+": ["how language shapes the way we think", "the science of habit formation"],
  B2: ["the ethics of artificial intelligence", "the neuroscience of creativity"],
};

export default function Home() {
  // ── 狀態管理 ──
  const [screen, setScreen] = useState<"dashboard" | "reading">("dashboard");
  const [stats, setStats] = useState<UserStats | null>(null);
  const [loading, setLoading] = useState({ show: false, text: "", sub: "" });
  const [error, setError] = useState("");
  const [isMounted, setIsMounted] = useState(false);
  const [article, setArticle] = useState<Article | null>(null);
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [submitted, setSubmitted] = useState(false);
  const [progressBar, setProgressBar] = useState("0%");
  const [activeTab, setActiveTab] = useState<"reading" | "listening" | "fill">("reading");
  const [showSkeleton, setShowSkeleton] = useState(true);
  const mountTime = useRef(Date.now());

  // ── 初始化 ──
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

    const elapsed = Date.now() - mountTime.current;
    const remaining = Math.max(0, 1000 - elapsed);
    setTimeout(() => setShowSkeleton(false), remaining);
  }, []);

  // ── 輔助函式 ──
  const currentLevelInfo = stats ? LEVELS.find((l) => l.id === stats.currentLevel) || LEVELS[1] : LEVELS[1];
  const overallAccuracy = stats && stats.totalQuestions > 0
    ? Math.round((stats.totalCorrect / stats.totalQuestions) * 100) + "%"
    : "—";

  function pickTopic(level: string) {
    const pool = TOPICS_BY_LEVEL[level] || TOPICS_BY_LEVEL["A2"];
    return pool[Math.floor(Math.random() * pool.length)];
  }

  function weakSkill(currentStats: UserStats) {
    const entries = Object.entries(currentStats.skillScores).filter(([, v]) => v.t > 0);
    if (!entries.length) return null;
    return entries.sort((a, b) => a[1].c / a[1].t - b[1].c / b[1].t)[0][0];
  }

  function calcNewLevel(currentStats: UserStats, correct: number, total: number) {
    const pct = correct / total;
    const cur = currentStats.currentLevel || "A2";
    const idx = LEVELS.findIndex((l) => l.id === cur);
    let newIdx = idx;
    if (pct >= 0.85 && idx < LEVELS.length - 1) newIdx = idx + 1;
    else if (pct < 0.5 && idx > 0) newIdx = idx - 1;
    return LEVELS[newIdx].id;
  }

  // ── 分頁切換 ──
  const switchTab = (tab: "reading" | "listening" | "fill") => {
    if (tab === activeTab) return;
    if (screen === "reading") {
      setScreen("dashboard");
      setArticle(null);
      setAnswers({});
      setSubmitted(false);
      setProgressBar("0%");
    }
    setActiveTab(tab);
  };

  // ── 開始練習（閱讀／聽力／填空） ──
  async function startReading(mode: 'reading' | 'listening' | 'fill' = 'reading') {
    setScreen("reading");
    setArticle(null);
    setAnswers({});
    setSubmitted(false);
    setProgressBar("0%");
    const modeText = mode === 'listening' ? '聽力' : mode === 'fill' ? '填空' : '閱讀';
    setLoading({
      show: true,
      text: `正在為您生成${modeText}文章...`,
      sub: "這需要幾秒鐘的時間",
    });

    const currentStats = stats ?? {
      totalArticles: 0,
      currentLevel: "A2",
      skillScores: {
        main: { c: 0, t: 0 },
        detail: { c: 0, t: 0 },
        inference: { c: 0, t: 0 },
        vocabulary: { c: 0, t: 0 },
      },
    };
    const level = currentStats.currentLevel || "A2";
    const topic = pickTopic(level);
    const weak = weakSkill(currentStats as any);
    const isFirst = currentStats.totalArticles === 0;

    try {
      const res = await fetch("/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ level, topic, weakSkill: weak, isFirst, mode }),
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

  // ── 選擇選項（閱讀題） ──
  function pickOption(qIdx: number, oIdx: number) {
    if (submitted || !article) return;
    const newAnswers = { ...answers, [qIdx]: oIdx };
    setAnswers(newAnswers);
    const done = Object.keys(newAnswers).length;
    const total = article.questions.length;
    setProgressBar(15 + Math.round((done / total) * 50) + "%");
  }

  // ── 提交答案（閱讀題與填空題） ──
  function submitAnswers(fillAnswers?: Record<number, number>) {
    if (submitted || !article || !stats) return;
    setSubmitted(true);
    setProgressBar("80%");

    let correctCount = 0;
    const bk: Record<string, { c: number; t: number }> = {
      main: { c: 0, t: 0 },
      detail: { c: 0, t: 0 },
      inference: { c: 0, t: 0 },
      vocabulary: { c: 0, t: 0 },
    };

    // 處理閱讀理解題
    article.questions.forEach((q, i) => {
      const chosen = answers[i];
      const isCorrect = chosen === q.answer;
      if (isCorrect) correctCount++;
      bk[q.type].t++;
      if (isCorrect) bk[q.type].c++;
    });

    // 處理填空題（如果有）
    let fillCorrect = 0;
    let fillTotal = 0;
    if (article.fillBlanks && fillAnswers) {
      fillTotal = article.fillBlanks.length;
      article.fillBlanks.forEach((fb, idx) => {
        const chosen = fillAnswers[idx];
        const isCorrect = (chosen !== undefined && fb.options[chosen] === fb.correctWord);
        if (isCorrect) fillCorrect++;
        // 將填空歸類為 vocabulary 技能
        bk.vocabulary.t++;
        if (isCorrect) bk.vocabulary.c++;
      });
      correctCount += fillCorrect;
    }

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

    const totalQ = article.questions.length + (article.fillBlanks ? article.fillBlanks.length : 0);
    const newLevel = calcNewLevel(stats, correctCount, totalQ);
    const newRecent = [
      ...stats.recentArticles.slice(-19),
      {
        title: article.title,
        correct: correctCount,
        total: totalQ,
        level: article._level || "A2",
        ts: Date.now(),
      },
    ];

    const updatedStats: UserStats = {
      totalArticles: stats.totalArticles + 1,
      totalCorrect: stats.totalCorrect + correctCount,
      totalQuestions: stats.totalQuestions + totalQ,
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

  // ── 骨架屏 ──
  if (showSkeleton) return <SkeletonScreen />;
  if (!isMounted || !stats) return null;

  // ── 主渲染 ──
  return (
    <>
      <nav>
        <div className="nav-inner">
          <div className="nav-left">
            <div className="nav-logo">
              English <span>Reading Practice</span>
            </div>
          </div>
          <div className="nav-tabs">
            <button
              className={`tab-btn ${activeTab === "reading" ? "active" : ""}`}
              onClick={() => switchTab("reading")}
            >
              閱讀測驗
            </button>
            <button
              className={`tab-btn ${activeTab === "listening" ? "active" : ""}`}
              onClick={() => switchTab("listening")}
            >
              聽力測驗
            </button>
            <button
              className={`tab-btn ${activeTab === "fill" ? "active" : ""}`}
              onClick={() => switchTab("fill")}
            >
              填空測驗
            </button>
          </div>
          <div className="nav-actions">
            <ThemeToggle />
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

        {/* 閱讀與聽力共用 ReadingScreen */}
        {(activeTab === "reading" || activeTab === "listening") && (
          <>
            {screen === "dashboard" && (
              <Dashboard
                stats={stats}
                overallAccuracy={overallAccuracy}
                currentLevelInfo={currentLevelInfo}
                onStart={() => startReading(activeTab === 'listening' ? 'listening' : 'reading')}
                totalArticles={stats.totalArticles}
                mode={activeTab === 'listening' ? 'listening' : 'reading'}
              />
            )}
            {screen === "reading" && article && (
              <ReadingScreen
                article={article}
                answers={answers}
                submitted={submitted}
                progressBar={progressBar}
                pickOption={pickOption}
                submitAnswers={() => submitAnswers()}
                startReading={() => startReading(activeTab === 'listening' ? 'listening' : 'reading')}
                setScreen={setScreen}
                mode={activeTab === 'listening' ? 'listening' : 'reading'}
              />
            )}
          </>
        )}

        {/* 填空測驗使用 FillScreen */}
        {activeTab === "fill" && (
          <>
            {screen === "dashboard" && (
              <Dashboard
                stats={stats}
                overallAccuracy={overallAccuracy}
                currentLevelInfo={currentLevelInfo}
                onStart={() => startReading('fill')}
                totalArticles={stats.totalArticles}
                mode="fill"
              />
            )}
            {screen === "reading" && article && (
              <FillScreen
                article={article}
                submitted={submitted}
                progressBar={progressBar}
                submitAnswers={submitAnswers}
                startReading={() => startReading('fill')}
                setScreen={setScreen}
              />
            )}
          </>
        )}
      </main>
    </>
  );
}