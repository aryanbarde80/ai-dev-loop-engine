import type { RepositorySnapshot } from "@/lib/types";

export function buildImprovementPrompt(snapshot: RepositorySnapshot) {
  const fileSections = snapshot.files
    .map(
      (file) =>
        `FILE: ${file.path}\n---\n${file.content.slice(0, 6000)}\n---`,
    )
    .join("\n\n");

  return [
    "You are helping an autonomous software evolution engine improve a Next.js app.",
    "Return JSON only with the shape:",
    '{"title":"string","summary":"string","rationale":"string","buildCommand":"npm run build","files":[{"path":"relative/path","summary":"string","content":"full file content"}]}',
    "Rules:",
    "- Propose exactly one small safe improvement.",
    "- Modify between 1 and 3 files only.",
    "- Never touch .env files, lockfiles, binary assets, or auth/token handling.",
    "- Keep the architecture intact and preserve deployability.",
    "- Prefer UI polish, accessibility, cleanup, or small features.",
    "- `content` must contain the full replacement content for that file.",
    "- Use paths that already exist unless a tiny new component file is clearly needed.",
    "",
    `Current branch: ${snapshot.branch}`,
    `Recent evolution logs: ${snapshot.recentLogs.join(", ") || "none"}`,
    "",
    fileSections,
  ].join("\n");
}
