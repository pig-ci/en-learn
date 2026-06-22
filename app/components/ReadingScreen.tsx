// app/components/ReadingScreen.tsx
import { Article } from "../types";
import { useState, useRef, useEffect } from "react";

interface ReadingScreenProps {
  article: Article;
  answers: Record<number, number>;
  submitted: boolean;
  progressBar: string;
  pickOption: (qIdx: number, oIdx: number) => void;
  submitAnswers: () => void;
  startReading: () => void;
  setScreen: (screen: "dashboard" | "reading") => void;
  mode?: 'reading' | 'listening'; // 新增
}

export default function ReadingScreen({
  article,
  answers,
  submitted,
  progressBar,
  pickOption,
  submitAnswers,
  startReading,
  setScreen,
  mode = 'reading',
}: ReadingScreenProps) {
  // ── 語音合成狀態 ──
  const [isPlaying, setIsPlaying] = useState(false);
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);

  // 當組件卸載或文章變更時，停止語音
  useEffect(() => {
    return () => {
      if (window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
    };
  }, [article]);

  // 播放音頻
  const handlePlay = () => {
    if (!window.speechSynthesis) {
      alert('您的瀏覽器不支援語音合成功能，請使用 Chrome 或 Edge。');
      return;
    }
    // 取消之前的合成
    window.speechSynthesis.cancel();

    // 清理文本：移除 HTML 標籤（若存在）並合併段落
    const plainText = article.body.replace(/<[^>]+>/g, '').replace(/\n/g, ' ');
    const utterance = new SpeechSynthesisUtterance(plainText);
    utterance.lang = 'en-US';
    utterance.rate = 0.9; // 稍慢，適合學習
    utterance.pitch = 1;
    utterance.volume = 1;

    utterance.onstart = () => setIsPlaying(true);
    utterance.onend = () => setIsPlaying(false);
    utterance.onerror = () => setIsPlaying(false);

    utteranceRef.current = utterance;
    window.speechSynthesis.speak(utterance);
  };

  // 停止音頻
  const handleStop = () => {
    if (window.speechSynthesis) {
      window.speechSynthesis.cancel();
      setIsPlaying(false);
    }
  };

  return (
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
        {mode === 'listening' && <span className="tag tag-listening">🎧 聽力</span>}
      </div>

      <div className="article-card">
        <div className="article-title">{article.title}</div>
        {mode === 'reading' ? (
          <div
            className="article-body"
            dangerouslySetInnerHTML={{
              __html: article.body
                .split("\n\n")
                .map((p) => `<p>${p}</p>`)
                .join(""),
            }}
          ></div>
        ) : (
          <div className="listening-controls">
            <p className="listening-instruction">🎧 請聽以下文章，然後回答問題</p>
            <div className="audio-controls">
              <button
                className="audio-btn play-btn"
                onClick={handlePlay}
                disabled={isPlaying}
                aria-label="播放文章"
              >
                ▶ 播放
              </button>
              <button
                className="audio-btn stop-btn"
                onClick={handleStop}
                disabled={!isPlaying}
                aria-label="停止播放"
              >
                ⏹ 停止
              </button>
              <span className="audio-status">{isPlaying ? '🔊 播放中...' : '⏸ 已停止'}</span>
            </div>
          </div>
        )}
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
                    aria-label={`第 ${qIdx + 1} 題，選項 ${lbl}：${txt}`}
                  >
                    <span className="opt-label">{lbl}</span>
                    <span>{txt}</span>
                  </button>
                );
              })}
            </div>

            {submitted && (
              <div
                className={`q-exp show ${
                  answers[qIdx] === q.answer ? "ok" : "no"
                }`}
              >
                <div className="q-exp-title">
                  {answers[qIdx] === q.answer ? "✓ Correct" : "✗ Incorrect"}
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
              disabled={Object.keys(answers).length < article.questions.length}
              aria-label="提交測驗答案"
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
            <button
              className="btn-next"
              onClick={startReading}
              aria-label="繼續下一篇"
            >
              Next {mode === 'listening' ? 'Listening' : 'Article'} →
            </button>
            <button
              className="btn-back2"
              onClick={() => setScreen("dashboard")}
              aria-label="返回儀表板"
            >
              Home
            </button>
          </div>
        </div>
      )}
    </div>
  );
}