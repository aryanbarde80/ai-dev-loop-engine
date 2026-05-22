export type ImprovementFile = {
  path: string;
  content: string;
  summary: string;
};

export type ImprovementPlan = {
  title: string;
  summary: string;
  rationale: string;
  buildCommand: string;
  files: ImprovementFile[];
};

export type RepositoryFileSnapshot = {
  path: string;
  content: string;
};

export type RepositorySnapshot = {
  branch: string;
  files: RepositoryFileSnapshot[];
  recentLogs: string[];
};

export type EvolutionCycleResult = {
  mode: "manual" | "cron";
  startedAt: string;
  finishedAt: string;
  workspacePath: string;
  branch: string;
  plan: ImprovementPlan;
  changedFiles: string[];
  build: {
    command: string;
    succeeded: boolean;
    output: string;
  };
  commit: {
    sha: string;
    summary: string;
  };
  logPath: string;
};
