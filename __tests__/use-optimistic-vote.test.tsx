import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { useEffect } from "react";
import { createRoot } from "react-dom/client";
import { act } from "react-dom/test-utils";
import { useOptimisticVote } from "@/hooks/use-optimistic-vote";

let container: HTMLDivElement | null = null;
let root: ReturnType<typeof createRoot> | null = null;
let lastState: {
  voted?: boolean;
  count?: number;
  isLoading?: boolean;
  toggle?: () => Promise<void>;
} = {};

function TestComponent({ moduleId, initialVoted, initialCount }: {
  moduleId: string;
  initialVoted: boolean;
  initialCount: number;
}) {
  const { voted, count, isLoading, toggle } = useOptimisticVote({
    moduleId,
    initialVoted,
    initialCount,
  });

  useEffect(() => {
    lastState = { voted, count, isLoading, toggle };
  });

  return (
    <button type="button" onClick={toggle}>
      {count}
    </button>
  );
}

describe("useOptimisticVote", () => {
  beforeEach(() => {
    container = document.createElement("div");
    document.body.appendChild(container);
    lastState = {};
  });

  afterEach(() => {
    vi.restoreAllMocks();
    if (root && container) {
      act(() => root.unmount());
    }
    if (container) {
      container.remove();
      container = null;
    }
    root = null;
  });

  it("rolls back optimistic update when the request fails while mounted", async () => {
    vi.stubGlobal("fetch", vi.fn(() =>
      Promise.resolve({ ok: false }) as unknown as Promise<Response>
    ));

    act(() => {
      root = createRoot(container!);
      root.render(
        <TestComponent moduleId="module-1" initialVoted={false} initialCount={3} />
      );
    });

    await act(async () => {
      await lastState.toggle?.();
    });

    expect(lastState.voted).toBe(false);
    expect(lastState.count).toBe(3);
    expect(lastState.isLoading).toBe(false);
  });

  it("does not update state after unmount when the pending request fails", async () => {
    const deferred = {} as {
      reject: (reason?: unknown) => void;
      promise: Promise<Response>;
    };

    deferred.promise = new Promise((_, reject) => {
      deferred.reject = reject;
    });

    const fetchMock = vi.fn(() => deferred.promise) as unknown as typeof fetch;
    vi.stubGlobal("fetch", fetchMock);

    let errorCalls = 0;
    vi.spyOn(console, "error").mockImplementation((...args) => {
      const firstArg = typeof args[0] === "string" ? args[0] : "";
      if (!firstArg.includes("The current testing environment is not configured to support act(...")) {
        errorCalls += 1;
      }
    });

    act(() => {
      root = createRoot(container!);
      root.render(
        <TestComponent moduleId="module-1" initialVoted={false} initialCount={5} />
      );
    });

    let togglePromise: Promise<void> | undefined;
    await act(async () => {
      togglePromise = lastState.toggle?.();
    });

    act(() => {
      root?.unmount();
    });

    await act(async () => {
      deferred.reject(new Error("Vote failed"));
      await togglePromise;
    });

    expect(errorCalls).toBe(0);
    expect(fetchMock).toHaveBeenCalledOnce();
  });
});
