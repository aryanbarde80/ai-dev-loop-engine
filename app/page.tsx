const requiredEnv = [
  ["DEEPSEEK_API_KEY", "Server-only LLM credential used to request the next safe improvement."],
  ["GITLAB_ACCESS_TOKEN", "Server-only token with repository API and push access to the app repo."],
  ["TARGET_REPO_CLONE_URL", "HTTPS clone URL for the evolving app repository."],
  ["CRON_SECRET", "Shared secret used to authorize the daily cron route."],
];

const cycleSteps = [
  "Pull the latest app code from GitLab into a local engine workspace.",
  "Collect a compact repository snapshot and the previous evolution logs.",
  "Ask DeepSeek for exactly one small improvement that touches at most three files.",
  "Validate the proposed file set, paths, and payload size before anything is written.",
  "Apply the patch locally, run npm install if package manifests changed, and verify npm run build.",
  "Commit the passing change back to GitLab and append a JSON log for the cycle.",
];

export default function HomePage() {
  return (
    <main className="page">
      <section className="hero">
        <p className="eyebrow">Dual-repo autonomous software evolution</p>
        <h1>AI Dev Loop Engine</h1>
        <p className="lede">
          This repository is the controller, not the product. It pulls a separate Next.js app from
          GitLab, asks DeepSeek for one safe improvement, validates that proposal, runs a local
          build, and only then pushes the passing change back to the evolving app repository.
        </p>

        <div className="hero-grid">
          <div className="panel">
            <h2>Daily cycle</h2>
            <ol>
              {cycleSteps.map((step) => (
                <li key={step}>{step}</li>
              ))}
            </ol>
          </div>

          <div className="stats">
            <article className="stat">
              <strong>1</strong>
              <span className="muted">LLM improvement request per run</span>
            </article>
            <article className="stat">
              <strong>3</strong>
              <span className="muted">Maximum files modified in a single cycle</span>
            </article>
            <article className="stat">
              <strong>0</strong>
              <span className="muted">Secrets exposed to the browser or the model response</span>
            </article>
          </div>
        </div>
      </section>

      <section className="panel-grid">
        <article className="panel">
          <h2>Trigger routes</h2>
          <div className="table">
            <div className="row">
              <code>/api/health</code>
              <span className="muted">Basic readiness and configuration health response.</span>
            </div>
            <div className="row">
              <code>/api/run</code>
              <span className="muted">Manual authenticated execution for local or operator-driven runs.</span>
            </div>
            <div className="row">
              <code>/api/cron/daily</code>
              <span className="muted">Scheduled once-daily entrypoint secured with `CRON_SECRET`.</span>
            </div>
          </div>
        </article>

        <article className="panel">
          <h2>Required server env</h2>
          <div className="table">
            {requiredEnv.map(([key, desc]) => (
              <div className="row" key={key}>
                <code>{key}</code>
                <span className="muted">{desc}</span>
              </div>
            ))}
          </div>
        </article>
      </section>

      <section className="stack">
        <article className="log-card">
          <div className="chip-row">
            <span className="chip">Safe incremental changes</span>
            <span className="chip">GitLab-driven app repo</span>
            <span className="chip">DeepSeek planner</span>
            <span className="chip">Build gate before push</span>
          </div>
          <h2>Local run command</h2>
          <code className="code">npm run engine:run</code>
        </article>

        <article className="log-card">
          <h2>Workspace artifacts</h2>
          <p className="muted">
            Each cycle creates a local working directory and JSON audit logs under the engine repo.
            That gives you a durable history of proposed improvements, applied files, build output,
            and the resulting GitLab commit metadata.
          </p>
        </article>
      </section>
    </main>
  );
}
