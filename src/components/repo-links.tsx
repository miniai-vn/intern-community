"use client";

interface RepoLinkProps {
  repoUrl: string;
  demoUrl?: string | null;
}

// Extract repo info from GitHub URL
function parseGitHubUrl(url: string): { owner: string; repo: string } | null {
  try {
    const match = url.match(/github\.com\/([^/]+)\/([^/]+)/);
    if (match) {
      return { owner: match[1], repo: match[2].replace(/\.git$/, "") };
    }
  } catch {
    // Invalid URL
  }
  return null;
}

// Check if URL is a placeholder/example URL
function isExampleUrl(url: string): boolean {
  const examplePatterns = [
    /example\.(com|org|net)/i,
    /localhost/i,
    /127\.0\.0\.1/,
    /github\.com\/example\//i,
  ];
  return examplePatterns.some((pattern) => pattern.test(url));
}

export function RepoLinks({ repoUrl, demoUrl }: RepoLinkProps) {
  const repoInfo = parseGitHubUrl(repoUrl);
  const isRepoExample = isExampleUrl(repoUrl);
  const isDemoExample = demoUrl ? isExampleUrl(demoUrl) : false;

  return (
    <div className="space-y-4">
      {/* GitHub Repo Section */}
      <div className="rounded-lg border border-gray-200 bg-gray-50 p-4 dark:border-gray-700 dark:bg-gray-800">
        <div className="flex items-center gap-3">
          <GitHubIcon />
          <div className="flex-1 min-w-0">
            {repoInfo && !isRepoExample ? (
              <>
                <a
                  href={repoUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block font-medium text-gray-900 hover:text-blue-600 hover:underline dark:text-gray-100 dark:hover:text-blue-400"
                >
                  {repoInfo.owner}/{repoInfo.repo}
                </a>
                <p className="text-xs text-gray-500 dark:text-gray-400">View source code on GitHub</p>
              </>
            ) : (
              <>
                <span className="block font-medium text-gray-500 dark:text-gray-400">
                  Repository URL
                </span>
                <p className="text-xs text-gray-400 dark:text-gray-500">
                  {isRepoExample
                    ? "This is a demo module with example URLs"
                    : "Source code repository"}
                </p>
              </>
            )}
          </div>
          {!isRepoExample ? (
            <a
              href={repoUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-100 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600"
              aria-label="View repository on GitHub"
            >
              View Repo
            </a>
          ) : (
            <span className="rounded-lg border border-gray-200 bg-gray-100 px-3 py-1.5 text-sm text-gray-400 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-500">
              Demo Only
            </span>
          )}
        </div>
      </div>

      {/* Demo URL Section */}
      {demoUrl && (
        <div className="rounded-lg border border-blue-100 bg-blue-50 p-4 dark:border-blue-900/50 dark:bg-blue-900/20">
          <div className="flex items-center gap-3">
            <DemoIcon />
            <div className="flex-1 min-w-0">
              {!isDemoExample ? (
                <>
                  <a
                    href={demoUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block font-medium text-gray-900 hover:text-blue-600 hover:underline truncate dark:text-gray-100 dark:hover:text-blue-400"
                  >
                    {new URL(demoUrl).hostname}
                  </a>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Try the live demo</p>
                </>
              ) : (
                <>
                  <span className="block font-medium text-gray-500 dark:text-gray-400">
                    Live Demo
                  </span>
                  <p className="text-xs text-gray-400 dark:text-gray-500">
                    Demo URL is a placeholder for this sample module
                  </p>
                </>
              )}
            </div>
            {!isDemoExample ? (
              <a
                href={demoUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="rounded-lg bg-blue-600 px-3 py-1.5 text-sm font-medium text-white transition-colors hover:bg-blue-700"
                aria-label="Open live demo"
              >
                Open Demo
              </a>
            ) : (
              <span className="rounded-lg border border-blue-200 bg-blue-100 px-3 py-1.5 text-sm text-blue-400 dark:border-blue-800 dark:bg-blue-900/30 dark:text-blue-500">
                Unavailable
              </span>
            )}
          </div>
        </div>
      )}

      {/* No demo message */}
      {!demoUrl && (
        <div className="rounded-lg border border-dashed border-gray-200 p-4 text-center text-sm text-gray-400 dark:border-gray-700 dark:text-gray-500">
          No live demo available for this module
        </div>
      )}
    </div>
  );
}

function GitHubIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      className="h-8 w-8 text-gray-700 dark:text-gray-300"
      fill="currentColor"
      aria-hidden="true"
    >
      <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
    </svg>
  );
}

function DemoIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      className="h-8 w-8 text-blue-600 dark:text-blue-400"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      aria-hidden="true"
    >
      <path d="M15 3h6v6M10 14L21 3M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6" />
    </svg>
  );
}
