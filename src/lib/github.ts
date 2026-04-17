const DEFAULT_OWNER = "miniai-vn";
const DEFAULT_REPO = "intern-community";

type GitHubContributorApi = {
  id: number;
  login: string;
  avatar_url: string;
  html_url: string;
  contributions: number;
  type?: string;
};

export type LeaderboardContributor = {
  id: number;
  login: string;
  avatarUrl: string;
  profileUrl: string;
  contributions: number;
};

export async function fetchContributorLeaderboard({
  owner = DEFAULT_OWNER,
  repo = DEFAULT_REPO,
  limit = 10,
}: {
  owner?: string;
  repo?: string;
  limit?: number;
} = {}): Promise<LeaderboardContributor[]> {
  const url = `https://api.github.com/repos/${owner}/${repo}/contributors?per_page=100`;
  const token = process.env.GITHUB_API_TOKEN;

  const response = await fetch(url, {
    headers: {
      Accept: "application/vnd.github+json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    next: { revalidate: 600 },
  });

  if (!response.ok) {
    throw new Error(`GitHub API request failed with status ${response.status}`);
  }

  const contributors = (await response.json()) as GitHubContributorApi[];

  return contributors
    .filter((user) => user.type !== "Bot")
    .sort((a, b) => b.contributions - a.contributions)
    .slice(0, limit)
    .map((user) => ({
      id: user.id,
      login: user.login,
      avatarUrl: user.avatar_url,
      profileUrl: user.html_url,
      contributions: user.contributions,
    }));
}