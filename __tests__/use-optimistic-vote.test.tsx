/** @vitest-environment jsdom */

import { act } from "react";
import { createRoot, type Root } from "react-dom/client";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { useOptimisticVote } from "@/hooks/use-optimistic-vote";

(globalThis as typeof globalThis & { IS_REACT_ACT_ENVIRONMENT: boolean }).IS_REACT_ACT_ENVIRONMENT = true;

interface HookHarnessProps {
  moduleId: string;
  initialVoted: boolean;
  initialCount: number;
}

function HookHarness(props: HookHarnessProps) {
  const { voted, count, isLoading, toggle } = useOptimisticVote(props);

  return (
    <div>
      <button
        type="button"
        data-testid="toggle"
        onClick={() => {
          void toggle();
        }}
      >
        Toggle
      </button>
      <output data-testid="voted">{String(voted)}</output>
      <output data-testid="count">{count}</output>
      <output data-testid="loading">{String(isLoading)}</output>
    </div>
  );
}

function createDeferred<T>() {
  let resolve!: (value: T | PromiseLike<T>) => void;
  let reject!: (reason?: unknown) => void;

  const promise = new Promise<T>((res, rej) => {
    resolve = res;
    reject = rej;
  });

  return { promise, resolve, reject };
}

describe("useOptimisticVote", () => {
  let container: HTMLDivElement;
  let root: Root;

  beforeEach(() => {
    container = document.createElement("div");
    document.body.appendChild(container);
    root = createRoot(container);
  });

  afterEach(() => {
    act(() => {
      root.unmount();
    });
    container.remove();
    vi.restoreAllMocks();
  });

  function renderHarness(overrides: Partial<HookHarnessProps> = {}) {
    const props: HookHarnessProps = {
      moduleId: "module-1",
      initialVoted: false,
      initialCount: 2,
      ...overrides,
    };

    act(() => {
      root.render(<HookHarness {...props} />);
    });
  }

  function clickToggle() {
    const button = container.querySelector(
      '[data-testid="toggle"]'
    ) as HTMLButtonElement;
    act(() => {
      button.click();
    });
  }

  function valueOf(testId: string) {
    return (container.querySelector(`[data-testid="${testId}"]`) as HTMLElement)
      .textContent;
  }

  it("applies optimistic update and finalizes on success", async () => {
    const fetchDeferred = createDeferred<Response>();
    const fetchMock = vi
      .spyOn(globalThis, "fetch")
      .mockReturnValue(fetchDeferred.promise);

    renderHarness();

    clickToggle();

    expect(valueOf("voted")).toBe("true");
    expect(valueOf("count")).toBe("3");
    expect(valueOf("loading")).toBe("true");

    await act(async () => {
      fetchDeferred.resolve({ ok: true } as Response);
      await fetchDeferred.promise;
    });

    expect(fetchMock).toHaveBeenCalledWith(
      "/api/votes",
      expect.objectContaining({ method: "POST" })
    );
    expect(valueOf("voted")).toBe("true");
    expect(valueOf("count")).toBe("3");
    expect(valueOf("loading")).toBe("false");
  });

  it("rolls back to snapshot when request fails", async () => {
    const fetchDeferred = createDeferred<Response>();
    vi.spyOn(globalThis, "fetch").mockReturnValue(fetchDeferred.promise);

    renderHarness({ initialVoted: false, initialCount: 5 });

    clickToggle();

    expect(valueOf("voted")).toBe("true");
    expect(valueOf("count")).toBe("6");

    await act(async () => {
      fetchDeferred.resolve({ ok: false } as Response);
      await fetchDeferred.promise;
    });

    expect(valueOf("voted")).toBe("false");
    expect(valueOf("count")).toBe("5");
    expect(valueOf("loading")).toBe("false");
  });

  it("prevents duplicate requests while a vote request is pending", async () => {
    const fetchDeferred = createDeferred<Response>();
    const fetchMock = vi
      .spyOn(globalThis, "fetch")
      .mockReturnValue(fetchDeferred.promise);

    renderHarness();

    clickToggle();
    clickToggle();

    expect(fetchMock).toHaveBeenCalledTimes(1);

    await act(async () => {
      fetchDeferred.resolve({ ok: true } as Response);
      await fetchDeferred.promise;
    });

    expect(valueOf("loading")).toBe("false");
  });

  it("ignores stale completion from an unmounted instance", async () => {
    const firstRequest = createDeferred<Response>();
    const secondRequest = createDeferred<Response>();
    let callIndex = 0;

    vi.spyOn(globalThis, "fetch").mockImplementation(() => {
      callIndex += 1;
      return callIndex === 1 ? firstRequest.promise : secondRequest.promise;
    });

    renderHarness({ initialVoted: false, initialCount: 10 });
    clickToggle();

    expect(valueOf("loading")).toBe("true");

    act(() => {
      root.unmount();
    });

    root = createRoot(container);
    renderHarness({ initialVoted: false, initialCount: 10 });

    expect(valueOf("voted")).toBe("false");
    expect(valueOf("count")).toBe("10");
    expect(valueOf("loading")).toBe("false");

    clickToggle();
    expect(valueOf("voted")).toBe("true");
    expect(valueOf("count")).toBe("11");

    await act(async () => {
      firstRequest.resolve({ ok: false } as Response);
      await firstRequest.promise;
    });

    expect(valueOf("voted")).toBe("true");
    expect(valueOf("count")).toBe("11");
    expect(valueOf("loading")).toBe("true");

    await act(async () => {
      secondRequest.resolve({ ok: true } as Response);
      await secondRequest.promise;
    });

    expect(valueOf("voted")).toBe("true");
    expect(valueOf("count")).toBe("11");
    expect(valueOf("loading")).toBe("false");
  });
});
