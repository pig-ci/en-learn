// app/components/SkeletonScreen.tsx
export default function SkeletonScreen() {
  return (
    <>
      <nav>
        <div className="nav-inner">
          <div className="nav-left">
            <div className="nav-logo">
              <span
                className="skeleton"
                style={{ width: 150, height: 24, display: "inline-block" }}
              />
            </div>
          </div>
          <div className="nav-tabs">
            <span className="skeleton" style={{ width: 60, height: 30 }} />
            <span className="skeleton" style={{ width: 60, height: 30 }} />
            <span className="skeleton" style={{ width: 60, height: 30 }} />
          </div>
          <div className="nav-actions">
            <div
              className="skeleton"
              style={{ width: 36, height: 36, borderRadius: "50%" }}
            />
          </div>
        </div>
      </nav>

      <main>
        <div className="section-label">
          <span
            className="skeleton"
            style={{ width: 80, height: 16, display: "inline-block" }}
          />
        </div>

        <div className="stats-row">
          <div
            className="stat-card skeleton"
            style={{ height: 80, border: "none" }}
          />
          <div
            className="stat-card skeleton"
            style={{ height: 80, border: "none" }}
          />
          <div
            className="stat-card skeleton"
            style={{ height: 80, border: "none" }}
          />
        </div>

        <div className="level-card" style={{ border: "none" }}>
          <div
            className="level-icon skeleton"
            style={{ width: 44, height: 44, borderRadius: "50%" }}
          />
          <div className="level-info">
            <div
              className="skeleton"
              style={{ width: 120, height: 20, marginBottom: 6 }}
            />
            <div className="skeleton" style={{ width: 180, height: 16 }} />
          </div>
        </div>

        <div className="skill-section" style={{ border: "none" }}>
          <h3>
            <span
              className="skeleton"
              style={{ width: 200, height: 20, display: "inline-block" }}
            />
          </h3>
          <div className="skill-row">
            <div className="skeleton" style={{ width: "100%", height: 16 }} />
          </div>
          <div className="skill-row">
            <div className="skeleton" style={{ width: "100%", height: 16 }} />
          </div>
          <div className="skill-row">
            <div className="skeleton" style={{ width: "100%", height: 16 }} />
          </div>
          <div className="skill-row">
            <div className="skeleton" style={{ width: "100%", height: 16 }} />
          </div>
        </div>

        <div
          className="skeleton"
          style={{ width: "100%", height: 56, borderRadius: 12 }}
        />
      </main>
    </>
  );
}