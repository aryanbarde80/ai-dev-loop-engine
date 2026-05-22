# AI Dev Loop Engine

`ai-dev-loop-engine` is the controller repository in a dual-repo autonomous software evolution setup.

It does not contain the evolving product itself. Instead, it pulls a separate Next.js application from GitLab, asks DeepSeek for one safe improvement, validates the proposal, applies it locally, runs a build, and only then pushes the passing change back to GitLab.

## What this engine does

1. Runs on a daily cron schedule, GitHub Actions schedule, or through a manual trigger.
2. Reads the current GitLab app repository.
3. Builds a compact project snapshot for the model.
4. Requests exactly one small safe improvement from DeepSeek.
5. Validates file count, file paths, and payload size.
6. Applies the updated files locally inside an engine workspace.
7. Runs `npm install` if `package.json` changed.
8. Runs the target repo build command.
9. Commits and pushes back to the GitLab app repository if the build passes.
10. Stores a local JSON log for each run in `evolution-output/`.

## Environment setup

Copy `.env.example` to `.env.local` and replace the placeholder values.

Important: the GitHub and GitLab tokens pasted in chat should be treated as compromised. Revoke them and create fresh tokens before deployment.

Required values:

- `DEEPSEEK_API_KEY`
- `GITLAB_ACCESS_TOKEN`
- `GITLAB_PROJECT_ID`
- `TARGET_REPO_CLONE_URL`
- `CRON_SECRET`

## Local development

```bash
npm install
npm run dev
```

Manual authenticated run:

```bash
curl -X POST -H "Authorization: Bearer your-secret" http://localhost:3000/api/run
```

Direct Node runner:

```bash
npm run engine:run
```

## Deployment notes

This engine is a Next.js app, but the real automation path needs a Node host that allows filesystem writes, child processes, and `git` operations during the run cycle. That means it is best deployed to a server environment such as Railway, Render, Fly.io, a VPS, or a GitHub Actions runner with a persistent schedule.

The included `vercel.json` shows the intended cron entrypoint shape, but full local clone/build/push behavior should be hosted somewhere that supports process execution reliably.

## Recommended automation path

The repo includes `.github/workflows/daily-evolution.yml`, which is the most practical default for end-to-end autonomous runs:

1. Push this repo to GitHub.
2. Add the required secrets in GitHub repository settings.
3. Keep the evolving product app in GitLab.
4. Let the GitHub Action run daily and push passing changes into GitLab.

That gives you the clean split you wanted:

- GitHub repo = engine and automation controller
- GitLab repo = evolving app source
- Vercel = deployment layer for the app repo
