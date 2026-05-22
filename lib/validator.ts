import path from "node:path";
import { getEnv } from "@/lib/env";
import type { ImprovementPlan } from "@/lib/types";

const forbiddenFragments = [
  ".env",
  "package-lock.json",
  "pnpm-lock.yaml",
  "yarn.lock",
  ".git/",
  "node_modules/",
];

function isTextPath(filePath: string) {
  return [".ts", ".tsx", ".js", ".jsx", ".json", ".css", ".md"].some((extension) =>
    filePath.endsWith(extension),
  );
}

export function validateImprovementPlan(plan: ImprovementPlan) {
  const env = getEnv();

  if (plan.files.length > env.maxFilesPerCycle) {
    throw new Error(
      `Improvement exceeds max file count: ${plan.files.length} > ${env.maxFilesPerCycle}`,
    );
  }

  for (const file of plan.files) {
    if (!isTextPath(file.path)) {
      throw new Error(`Unsupported file type proposed: ${file.path}`);
    }

    if (forbiddenFragments.some((fragment) => file.path.includes(fragment))) {
      throw new Error(`Forbidden file path proposed: ${file.path}`);
    }

    if (path.isAbsolute(file.path) || file.path.startsWith("..")) {
      throw new Error(`Unsafe file path proposed: ${file.path}`);
    }

    const byteLength = Buffer.byteLength(file.content, "utf8");
    if (byteLength > env.maxFileBytes) {
      throw new Error(`File content too large for ${file.path}: ${byteLength} bytes`);
    }
  }

  if (!/build/i.test(plan.buildCommand)) {
    throw new Error("Improvement plan must specify a build command.");
  }
}
