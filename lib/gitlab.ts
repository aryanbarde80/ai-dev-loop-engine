import { getEnv } from "@/lib/env";

type GitLabCommitResponse = {
  id: string;
  short_id: string;
  title: string;
};

function getProjectApiBase() {
  const { gitlabProjectId } = getEnv();
  const normalized = gitlabProjectId.includes("%")
    ? decodeURIComponent(gitlabProjectId)
    : gitlabProjectId;

  return `https://gitlab.com/api/v4/projects/${encodeURIComponent(normalized)}`;
}

function getHeaders() {
  return {
    "PRIVATE-TOKEN": getEnv().gitlabAccessToken,
  };
}

export async function fetchRepositoryTree(path = "", recursive = true) {
  const params = new URLSearchParams({
    ref: getEnv().gitlabTargetBranch,
    per_page: "100",
    recursive: recursive ? "true" : "false",
  });

  if (path) {
    params.set("path", path);
  }

  const response = await fetch(`${getProjectApiBase()}/repository/tree?${params.toString()}`, {
    headers: getHeaders(),
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error(`GitLab tree fetch failed: ${response.status} ${await response.text()}`);
  }

  return response.json() as Promise<Array<{ path: string; type: string }>>;
}

export async function fetchFileContent(filePath: string) {
  const encodedPath = encodeURIComponent(filePath);
  const branch = encodeURIComponent(getEnv().gitlabTargetBranch);
  const response = await fetch(
    `${getProjectApiBase()}/repository/files/${encodedPath}/raw?ref=${branch}`,
    {
      headers: getHeaders(),
      cache: "no-store",
    },
  );

  if (!response.ok) {
    throw new Error(`GitLab raw file fetch failed for ${filePath}: ${response.status}`);
  }

  return response.text();
}

export async function createEvolutionLog(logPath: string, contents: string) {
  const response = await fetch(`${getProjectApiBase()}/repository/commits`, {
    method: "POST",
    headers: {
      ...getHeaders(),
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      branch: getEnv().gitlabTargetBranch,
      commit_message: `docs: add evolution log ${logPath}`,
      author_name: getEnv().committerName,
      author_email: getEnv().committerEmail,
      actions: [
        {
          action: "create",
          file_path: logPath,
          content: contents,
          encoding: "text",
        },
      ],
    }),
  });

  if (!response.ok) {
    throw new Error(`GitLab log commit failed: ${response.status} ${await response.text()}`);
  }

  return response.json() as Promise<GitLabCommitResponse>;
}
