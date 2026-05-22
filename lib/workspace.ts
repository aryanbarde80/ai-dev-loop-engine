import fs from "node:fs/promises";
import path from "node:path";
import { execFile } from "node:child_process";
import { promisify } from "node:util";
import { getEnv } from "@/lib/env";
import type { ImprovementPlan } from "@/lib/types";

const execFileAsync = promisify(execFile);

function getRepoDir(workspaceRoot: string) {
  return path.join(workspaceRoot, "target-repo");
}

function getAppDir(repoDir: string) {
  const { targetAppSubdir } = getEnv();
  return targetAppSubdir ? path.join(repoDir, targetAppSubdir) : repoDir;
}

async function run(command: string, args: string[], cwd: string) {
  const { stdout, stderr } = await execFileAsync(command, args, {
    cwd,
    maxBuffer: 1024 * 1024 * 10,
  });

  return [stdout, stderr].filter(Boolean).join("\n");
}

export async function prepareWorkspace() {
  const env = getEnv();
  const stamp = new Date().toISOString().replace(/[:.]/g, "-");
  const workspaceRoot = path.join(process.cwd(), env.engineRunDir, stamp);
  const repoDir = getRepoDir(workspaceRoot);

  await fs.mkdir(workspaceRoot, { recursive: true });
  await run("git", ["clone", env.targetRepoCloneUrl, repoDir], process.cwd());
  await run("git", ["checkout", env.gitlabTargetBranch], repoDir);

  return {
    workspaceRoot,
    repoDir,
    appDir: getAppDir(repoDir),
  };
}

export async function applyImprovementPlan(appDir: string, plan: ImprovementPlan) {
  for (const file of plan.files) {
    const targetPath = path.join(appDir, file.path);
    await fs.mkdir(path.dirname(targetPath), { recursive: true });
    await fs.writeFile(targetPath, file.content, "utf8");
  }
}

export async function maybeInstallDependencies(appDir: string, changedFiles: string[]) {
  const shouldInstall = changedFiles.some((file) => file === "package.json");

  if (!shouldInstall) {
    return "Dependency install skipped.";
  }

  return run("npm", ["install"], appDir);
}

export async function runBuild(appDir: string, buildCommand: string) {
  const [command, ...args] = buildCommand.split(/\s+/);
  return run(command, args, appDir);
}

export async function commitAndPush(repoDir: string, message: string) {
  const env = getEnv();
  await run("git", ["config", "user.name", env.committerName], repoDir);
  await run("git", ["config", "user.email", env.committerEmail], repoDir);
  await run("git", ["add", "."], repoDir);
  await run("git", ["commit", "-m", message], repoDir);
  const pushOutput = await run("git", ["push", "origin", env.gitlabTargetBranch], repoDir);
  const sha = (await run("git", ["rev-parse", "HEAD"], repoDir)).trim();

  return {
    sha,
    pushOutput,
  };
}
