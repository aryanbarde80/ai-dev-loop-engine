type RequiredEnv =
  | "DEEPSEEK_API_KEY"
  | "GITLAB_ACCESS_TOKEN"
  | "GITLAB_PROJECT_ID"
  | "CRON_SECRET";

function readRequired(name: RequiredEnv) {
  const value = process.env[name];

  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }

  return value;
}

function readNumber(name: string, fallback: number) {
  const raw = process.env[name];

  if (!raw) {
    return fallback;
  }

  const parsed = Number(raw);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function buildCloneUrl() {
  const explicit = process.env.TARGET_REPO_CLONE_URL;

  if (explicit) {
    return explicit;
  }

  const projectId = readRequired("GITLAB_PROJECT_ID");
  const normalized = projectId.includes("%") ? decodeURIComponent(projectId) : projectId;

  if (!normalized.includes("/")) {
    throw new Error(
      "TARGET_REPO_CLONE_URL is required when GITLAB_PROJECT_ID is numeric instead of namespace/project.",
    );
  }

  return `https://oauth2:${readRequired("GITLAB_ACCESS_TOKEN")}@gitlab.com/${normalized}.git`;
}

export function getEnv() {
  return {
    deepseekApiKey: readRequired("DEEPSEEK_API_KEY"),
    deepseekBaseUrl: process.env.DEEPSEEK_BASE_URL || "https://api.deepseek.com",
    deepseekModel: process.env.DEEPSEEK_MODEL || "deepseek-chat",
    gitlabAccessToken: readRequired("GITLAB_ACCESS_TOKEN"),
    gitlabProjectId: readRequired("GITLAB_PROJECT_ID"),
    gitlabTargetBranch: process.env.GITLAB_TARGET_BRANCH || "main",
    targetRepoCloneUrl: buildCloneUrl(),
    targetAppSubdir: process.env.TARGET_APP_SUBDIR || "",
    cronSecret: readRequired("CRON_SECRET"),
    engineRunDir: process.env.ENGINE_RUN_DIR || ".engine-workspace",
    committerName: process.env.COMMITTER_NAME || "AI Dev Loop Engine",
    committerEmail: process.env.COMMITTER_EMAIL || "bot@example.com",
    maxFilesPerCycle: readNumber("MAX_FILES_PER_CYCLE", 3),
    maxFileBytes: readNumber("MAX_FILE_BYTES", 40_000),
  };
}

export function getEnvironmentStatus() {
  const present = (name: string) => Boolean(process.env[name]);

  return {
    deepseekApiKey: present("DEEPSEEK_API_KEY"),
    gitlabAccessToken: present("GITLAB_ACCESS_TOKEN"),
    gitlabProjectId: present("GITLAB_PROJECT_ID"),
    targetRepoCloneUrl: present("TARGET_REPO_CLONE_URL") || present("GITLAB_PROJECT_ID"),
    cronSecret: present("CRON_SECRET"),
  };
}
