// app/components/Dashboard.tsx
import { UserStats } from "../types";

interface DashboardProps {
  stats: UserStats;
  overallAccuracy: string;
  currentLevelInfo: { id: string; name: string; icon: string; desc: string };
  onStart: () => void;
  totalArticles: number;
  mode: 'reading' | 'listening';
}

export default function Dashboard({
  stats,
  overallAccuracy,
  currentLevelInfo,
  onStart,
  totalArticles,
  mode,
}: DashboardProps) {
  const buttonLabel = totalArticles === 0 
  ? (mode === 'listening' ? "Start First Listening →" : mode === 'fill' ? "Start First Fill-in →" : "Start First Article →")
  : (mode === 'listening' ? "Next Listening →" : mode === 'fill' ? "Next Fill-in →" : "Next Article →");

  return (
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
          const pct = data.t > 0 ? Math.round((data.c / data.t) * 100) : null;
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

      <button
        className="btn-start"
        onClick={onStart}
        aria-label={buttonLabel}
      >
        {buttonLabel}
      </button>
    </div>
  );
}