// app/components/FillScreen.tsx
import { Article, FillBlank } from "../types";
import { useState } from "react";

interface FillScreenProps {
  article: Article;
  submitted: boolean;
  progressBar: string;
  submitAnswers: (fillAnswers: Record<number, number>) => void;
  startReading: () => void;
  setScreen: (screen: "dashboard" | "reading") => void;
}

export default function FillScreen({
  article,
  submitted,
  progressBar,
  submitAnswers,
  startReading,
  setScreen,
}: FillScreenProps) {
  // 記錄每個填空的選擇 (索引 -> 選項索引)
  const [fillSelections, setFillSelections] = useState<Record<number, number>>({});
  const fillBlanks = article.fillBlanks || [];

  // 處理填空選擇
  const selectFillOption = (blankIndex: number, optionIndex: number) => {
    if (submitted) return;
    setFillSelections(prev => ({ ...prev, [blankIndex]: optionIndex }));
  };

  // 計算是否所有填空都已選擇
  const allFilled = fillBlanks.every((_, idx) => fillSelections[idx] !== undefined);

  // 處理提交
  const handleSubmit = () => {
    if (!allFilled || submitted) return;
    submitAnswers(fillSelections);
  };

  // 將文章 body 中的 ____ 替換為帶有顏色的標記（用於顯示）
  const renderBodyWithHighlights = () => {
    // 簡單將 ____ 替換為 <span class="blank-highlight">____</span>
    const parts = article.body.split('____');
    if (parts.length === 1) return <p>{article.body}</p>;
    return (
      <p>
        {parts.map((part, i) => (
          <span key={i}>
            {part}
            {i < parts.length - 1 && <span className="blank-highlight">____</span>}
          </span>
        ))}
      </p>
    );
  };

  return (
    <div className="fill-screen" style={{ display: "block" }}>
      <div className="progress-bar-wrap">
        <div className="progress-bar-fill" style={{ width: progressBar }}></div>
      </div>

      <div className="article-meta">
        <span className="tag tag-topic">{article.topic}</span>
        <span className="tag tag-level">{article._level}</span>
        <span className="tag tag-fill">✍️ 填空</span>
      </div>

      <div className="article-card">
        <div className="article-title">{article.title}</div>
        <div className="article-body fill-body">
          {renderBodyWithHighlights()}
        </div>
      </div>

      <div className="fill-blanks-card">
        <h3>Fill in the Blanks</h3>
        <p className="fill-instruction">請從選項中選出最合適的單詞填入空格：</p>

        {fillBlanks.map((blank, idx) => {
          const selected = fillSelections[idx];
          return (
            <div className="fill-item" key={blank.id}>
              <div className="fill-sentence">
                <span className="fill-number">{idx + 1}.</span>
                {blank.sentence.split('____').map((part, i) => (
                  <span key={i}>
                    {part}
                    {i < blank.sentence.split('____').length - 1 && (
                      <span className="blank-inline">____</span>
                    )}
                  </span>
                ))}
                {blank.hint && <span className="fill-hint">（{blank.hint}）</span>}
              </div>
              <div className="fill-options">
                {blank.options.map((opt, optIdx) => {
                  const isSelected = (selected === optIdx);
                  let btnClass = "fill-opt-btn";
                  if (isSelected && !submitted) btnClass += " selected";
                  if (submitted) {
                    const isCorrect = (opt === blank.correctWord);
                    if (isSelected) {
                      btnClass += isCorrect ? " correct" : " wrong";
                    } else if (isCorrect) {
                      btnClass += " correct"; // 顯示正確答案
                    }
                  }
                  return (
                    <button
                      key={optIdx}
                      className={btnClass}
                      onClick={() => selectFillOption(idx, optIdx)}
                      disabled={submitted}
                    >
                      {String.fromCharCode(65 + optIdx)}. {opt}
                    </button>
                  );
                })}
              </div>
              {submitted && (
                <div className="fill-result">
                  {selected !== undefined && blank.options[selected] === blank.correctWord ? (
                    <span className="fill-correct">✅ 正確！</span>
                  ) : (
                    <span className="fill-wrong">❌ 正確答案為「{blank.correctWord}」</span>
                  )}
                </div>
              )}
            </div>
          );
        })}

        {!submitted && (
          <div className="submit-row">
            <button
              className="btn-submit"
              onClick={handleSubmit}
              disabled={!allFilled}
            >
              Submit Answers
            </button>
          </div>
        )}
      </div>

      {submitted && (
        <div className="result-card" style={{ display: "block" }}>
          <div className="result-msg">練習完成！您的得分已同步至本地進度。</div>
          <div style={{ display: "flex", gap: "10px", marginTop: "15px", justifyContent: "center" }}>
            <button className="btn-next" onClick={startReading}>
              Next Fill-in →
            </button>
            <button className="btn-back2" onClick={() => setScreen("dashboard")}>
              Home
            </button>
          </div>
        </div>
      )}
    </div>
  );
}