import fs from "node:fs/promises";
import path from "node:path";
import type { EvolutionCycleResult } from "@/lib/types";

export async function writeLocalEvolutionLog(result: EvolutionCycleResult) {
  const logDir = path.join(process.cwd(), "evolution-output");
  await fs.mkdir(logDir, { recursive: true });

  const fileName = `${result.startedAt.replace(/[:.]/g, "-")}.json`;
  const logPath = path.join(logDir, fileName);
  await fs.writeFile(logPath, JSON.stringify(result, null, 2), "utf8");

  return logPath;
}
