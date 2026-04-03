/** @vitest-environment jsdom */

import { act } from "react";
import { createRoot, type Root } from "react-dom/client";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { VoteButton } from "@/components/vote-button";
import { useOptimisticVote } from "@/hooks/use-optimistic-vote";
import { useSession } from "next-auth/react";

(globalThis as typeof globalThis & { IS_REACT_ACT_ENVIRONMENT: boolean }).IS_REACT_ACT_ENVIRONMENT = true;

vi.mock("next-auth/react", () => ({
  useSession: vi.fn(),
}));

vi.mock("@/hooks/use-optimistic-vote", () => ({
  useOptimisticVote: vi.fn(),
}));

describe("VoteButton", () => {
  let container: HTMLDivElement;
  let root: Root;

  const useSessionMock = vi.mocked(useSession);
  const useOptimisticVoteMock = vi.mocked(useOptimisticVote);

  beforeEach(() => {
    container = document.createElement("div");
    document.body.appendChild(container);
    root = createRoot(container);

    useSessionMock.mockReturnValue({
      data: { user: { id: "user-1" } },
    } as ReturnType<typeof useSession>);

    useOptimisticVoteMock.mockReturnValue({
      voted: false,
      count: 3,
      isLoading: false,
      toggle: vi.fn().mockResolvedValue(undefined),
    });
  });

  afterEach(() => {
    act(() => {
      root.unmount();
    });
    container.remove();
    vi.clearAllMocks();
    vi.restoreAllMocks();
  });

  function renderButton() {
    act(() => {
      root.render(
        <VoteButton moduleId="module-1" initialVoted={false} initialCount={3} />
      );
    });
  }

  it("shows loading state semantics while request is pending", () => {
    useOptimisticVoteMock.mockReturnValue({
      voted: true,
      count: 4,
      isLoading: true,
      toggle: vi.fn().mockResolvedValue(undefined),
    });

    renderButton();

    const button = container.querySelector("button") as HTMLButtonElement;
    const status = container.querySelector('[role="status"]') as HTMLElement;

    expect(button.disabled).toBe(true);
    expect(button.getAttribute("aria-busy")).toBe("true");
    expect(status).toBeTruthy();
    expect(status.getAttribute("aria-label")).toBe("Updating vote");
    expect(button.textContent).toContain("4");
  });

  it("renders read-only count when user is unauthenticated", () => {
    useSessionMock.mockReturnValue({ data: null } as ReturnType<typeof useSession>);

    renderButton();

    expect(container.querySelector("button")).toBeNull();
    expect(container.textContent).toContain("3");
  });
});
