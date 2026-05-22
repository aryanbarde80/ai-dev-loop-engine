import { buildImprovementPrompt } from "@/lib/prompt";
import { requestImprovementPlan } from "@/lib/deepseek";
import { buildRepositorySnapshot } from "@/lib/repository-snapshot";
import { validateImprovementPlan } from "@/lib/validator";
import {
  applyImprovementPlan,
  commitAndPush,
  maybeInstallDependencies,
  prepareWorkspace,
  runBuild,
} from "@/lib/workspace";
import { writeLocalEvolutionLog } from "@/lib/evolution-log";
import type { EvolutionCycleResult } from "@/lib/types";

export async function runEvolutionCycle(mode: "manual" | "cron"): Promise<EvolutionCycleResult> {
  const startedAt = new Date().toISOString();
  const snapshot = await buildRepositorySnapshot();
  const prompt = buildImprovementPrompt(snapshot);
  const plan = await requestImprovementPlan(prompt);
  validateImprovementPlan(plan);

  const { workspaceRoot, repoDir, appDir } = await prepareWorkspace();
  await applyImprovementPlan(appDir, plan);
  const installOutput = await maybeInstallDependencies(
    appDir,
    plan.files.map((file) => file.path),
  );
  const buildOutput = await runBuild(appDir, plan.buildCommand);
  const commit = await commitAndPush(repoDir, `feat: ${plan.title}`);
  const finishedAt = new Date().toISOString();

  const result: EvolutionCycleResult = {
    mode,
    startedAt,
    finishedAt,
    workspacePath: workspaceRoot,
    branch: snapshot.branch,
    plan,
    changedFiles: plan.files.map((file) => file.path),
    build: {
      command: plan.buildCommand,
      succeeded: true,
      output: [installOutput, buildOutput].filter(Boolean).join("\n\n"),
    },
    commit: {
      sha: commit.sha,
      summary: commit.pushOutput,
    },
    logPath: "",
  };

  const logPath = await writeLocalEvolutionLog(result);
  result.logPath = logPath;

  return result;
}
