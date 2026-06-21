// app/components/ReadingScreen.tsx
import { Article } from "../types";

interface ReadingScreenProps {
  article: Article;
  answers: Record<number, number>;
  submitted: boolean;
  progressBar: string;
  pickOption: (qIdx: number, oIdx: number) => void;
  submitAnswers: () => void;
  startReading: () => void;
  setScreen: (screen: "dashboard" | "reading") => void;
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
}: ReadingScreenProps) {
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
              aria-label="提交閱讀測驗答案"
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
              aria-label="繼續閱讀下一篇文章"
            >
              Next Article →
            </button>
            <button
              className="btn-back2"
              onClick={() => setScreen("dashboard")}
              aria-label="返回儀表板首頁"
            >
              Home
            </button>
          </div>
        </div>
      )}
    </div>
  );
}