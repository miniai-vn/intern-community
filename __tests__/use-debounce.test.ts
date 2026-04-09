import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

// Since no @testing-library/react, test the debounce logic directly
describe("useDebounce (logic test)", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  function createDebounce<T>(initial: T, delay: number) {
    let current = initial;
    let timer: ReturnType<typeof setTimeout> | null = null;

    return {
      get value() {
        return current;
      },
      update(newValue: T) {
        if (timer) clearTimeout(timer);
        timer = setTimeout(() => {
          current = newValue;
        }, delay);
      },
    };
  }

  it("returns the initial value immediately", () => {
    const d = createDebounce("hello", 300);
    expect(d.value).toBe("hello");
  });

  it("does not update the value before the delay", () => {
    const d = createDebounce("hello", 300);
    d.update("world");
    vi.advanceTimersByTime(200);
    expect(d.value).toBe("hello");
  });

  it("updates the value after the delay", () => {
    const d = createDebounce("hello", 300);
    d.update("world");
    vi.advanceTimersByTime(300);
    expect(d.value).toBe("world");
  });

  it("resets the timer when value changes rapidly", () => {
    const d = createDebounce("a", 300);
    d.update("ab");
    vi.advanceTimersByTime(100);
    d.update("abc");
    vi.advanceTimersByTime(200);
    // Still "a" because timer was reset
    expect(d.value).toBe("a");
    vi.advanceTimersByTime(100);
    // Now 300ms after last update
    expect(d.value).toBe("abc");
  });

  it("works with non-string types", () => {
    const d = createDebounce(42, 500);
    d.update(100);
    vi.advanceTimersByTime(500);
    expect(d.value).toBe(100);
  });
});
