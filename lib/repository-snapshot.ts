import { getEnv } from "@/lib/env";
import { fetchFileContent, fetchRepositoryTree } from "@/lib/gitlab";
import type { RepositorySnapshot } from "@/lib/types";

const allowedExtensions = [
  ".ts",
  ".tsx",
  ".js",
  ".jsx",
  ".json",
  ".css",
  ".md",
];

function shouldInclude(path: string) {
  if (path.includes("node_modules") || path.includes(".next")) {
    return false;
  }

  return allowedExtensions.some((extension) => path.endsWith(extension));
}

export async function buildRepositorySnapshot(): Promise<RepositorySnapshot> {
  const tree = await fetchRepositoryTree();
  const candidateFiles = tree.filter((entry) => entry.type === "blob" && shouldInclude(entry.path));
  const selectedFiles = candidateFiles.slice(0, 18);
  const recentLogs = tree
    .filter((entry) => entry.type === "blob" && entry.path.startsWith("evolution-logs/"))
    .slice(-5)
    .map((entry) => entry.path);

  const files = await Promise.all(
    selectedFiles.map(async (entry) => ({
      path: entry.path,
      content: await fetchFileContent(entry.path),
    })),
  );

  return {
    branch: getEnv().gitlabTargetBranch,
    files,
    recentLogs,
  };
}
