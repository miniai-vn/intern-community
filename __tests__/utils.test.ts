import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { generateSlug, makeUniqueSlug, formatRelativeTime, checkRateLimitUlti, rateLimitMap } from "@/lib/utils";


// ============================================================
// generateSlug — already written as examples
// ============================================================

describe("generateSlug", () => {
  it("lowercases and hyphenates words", () => {
    expect(generateSlug("My Cool App")).toBe("my-cool-app");
  });

  it("strips special characters", () => {
    expect(generateSlug("Hello, World!")).toBe("hello-world");
  });

  it("trims leading and trailing whitespace", () => {
    expect(generateSlug("  Hello  World  ")).toBe("hello-world");
  });

  it("collapses multiple spaces into a single hyphen", () => {
    expect(generateSlug("a   b   c")).toBe("a-b-c");
  });

  // TODO [easy-challenge]: Add test cases for the following:
  // 1. A name that is already a valid slug (no changes needed)
  // 2. A name with numbers (numbers should be preserved)
  // 3. An empty string (what should the output be? Check the implementation)
  // 4. A name with leading/trailing hyphens after special char removal
  //
  // Hint: read `src/lib/utils.ts` to understand the exact transformation rules
  // before writing your assertions.
});

// ============================================================
// makeUniqueSlug — already written as examples
// ============================================================

describe("makeUniqueSlug", () => {
  it("returns the base slug when there are no conflicts", () => {
    expect(makeUniqueSlug("my-app", [])).toBe("my-app");
  });

  it("appends -1 when base slug is taken", () => {
    expect(makeUniqueSlug("my-app", ["my-app"])).toBe("my-app-1");
  });

  it("increments the suffix when previous suffixes are taken", () => {
    expect(makeUniqueSlug("my-app", ["my-app", "my-app-1"])).toBe("my-app-2");
  });

  // TODO [easy-challenge]: Add test cases for:
  // 1. When many suffixed versions already exist (e.g. -1 through -5)
  // 2. When the existing list contains similar but non-conflicting slugs
  //    e.g. existing = ["my-app-tool"] should NOT block "my-app"
});

// ============================================================
// formatRelativeTime — NOT yet tested, candidate must write all tests
// ============================================================

// TODO [easy-challenge]: Write a full test suite for `formatRelativeTime`.
// Requirements:
// - "just now" for dates less than 1 minute ago
// - "{n}m ago" for dates 1–59 minutes ago
// - "{n}h ago" for dates 1–23 hours ago
// - "{n}d ago" for dates 1–29 days ago
// - toLocaleDateString() format for dates 30+ days ago
//
// Hint: You'll need to mock or control `Date.now()` to make these tests
// deterministic. Look into Vitest's `vi.setSystemTime()`.


describe("formatRelativeTime", () => {
  const NOW = new Date("2026-01-01T12:00:00Z");

  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(NOW);
  });//dòng này sẽ thiết lập thời gian hệ thống giả để đảm bảo rằng tất cả các phép tính thời gian trong các bài kiểm tra đều dựa trên cùng một điểm tham chiếu thời gian. Điều này giúp đảm bảo rằng các bài kiểm tra của bạn sẽ luôn trả về kết quả nhất quán, bất kể khi nào chúng được chạy.

  afterEach(() => {
    vi.useRealTimers();
  });//sử dụng `vi.useRealTimers()` để khôi phục lại chức năng hẹn giờ bình thường của JavaScript sau khi mỗi bài kiểm tra hoàn thành. Điều này đảm bảo rằng các bài kiểm tra khác hoặc mã khác trong dự án của bạn sẽ không bị ảnh hưởng bởi việc sử dụng thời gian giả trong bài kiểm tra này.

  it("should return 'just now' for less than 1 minute ago", () => {
    const date = new Date(NOW.getTime() - 30 * 1000); 
    expect(formatRelativeTime(date)).toBe("just now");
  });

  it("should return '1m ago' for exactly 1 minute ago", () => {
    const date = new Date(NOW.getTime() - 60 * 1000);
    expect(formatRelativeTime(date)).toBe("1m ago");
  });

  it("should return '{n}m ago' for minutes between 1–59", () => {
    const date = new Date(NOW.getTime() - 25 * 60 * 1000);
    expect(formatRelativeTime(date)).toBe("25m ago");
  });

  it("should return '1h ago' for exactly 1 hour ago", () => {
    const date = new Date(NOW.getTime() - 60 * 60 * 1000);
    expect(formatRelativeTime(date)).toBe("1h ago");
  });

  it("should return '{n}h ago' for hours between 1–23", () => {
    const date = new Date(NOW.getTime() - 5 * 60 * 60 * 1000);
    expect(formatRelativeTime(date)).toBe("5h ago");
  });

  it("should return '1d ago' for exactly 1 day ago", () => {
    const date = new Date(NOW.getTime() - 24 * 60 * 60 * 1000);
    expect(formatRelativeTime(date)).toBe("1d ago");
  });

  it("should return '{n}d ago' for days between 1–29", () => {
    const date = new Date(NOW.getTime() - 10 * 24 * 60 * 60 * 1000);
    expect(formatRelativeTime(date)).toBe("10d ago");
  });

  it("should return locale date string for 30+ days ago", () => {
    const date = new Date(NOW.getTime() - 30 * 24 * 60 * 60 * 1000);
    expect(formatRelativeTime(date)).toBe(date.toLocaleDateString());
  });

  it("should floor values correctly (no rounding up)", () => {
    const date = new Date(NOW.getTime() - (59 * 60 + 59) * 1000); // 59m59s
    expect(formatRelativeTime(date)).toBe("59m ago");
  });

  it("should handle edge case: exactly 59 minutes -> still minutes", () => {
    const date = new Date(NOW.getTime() - 59 * 60 * 1000);
    expect(formatRelativeTime(date)).toBe("59m ago");
  });

  it("should handle edge case: exactly 23 hours -> still hours", () => {
    const date = new Date(NOW.getTime() - 23 * 60 * 60 * 1000);
    expect(formatRelativeTime(date)).toBe("23h ago");
  });

  it("should handle edge case: exactly 29 days -> still days", () => {
    const date = new Date(NOW.getTime() - 29 * 24 * 60 * 60 * 1000);
    expect(formatRelativeTime(date)).toBe("29d ago");
  });
});


describe("checkRateLimitUlti", () => {
  const USER_ID = "user-1";
  const LIMIT = 3;
  const WINDOW = 60_000; // 60s
  const NOW = new Date("2026-01-01T00:00:00Z");
  

  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(NOW);
    rateLimitMap.clear(); // reset state
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("should allow first request", () => {
    const result  = checkRateLimitUlti(USER_ID, LIMIT, WINDOW);
    expect(result).toBe(true);
  });

  it("should allow requests within limit", () => {
    expect(checkRateLimitUlti(USER_ID, LIMIT, WINDOW)).toBe(true);
    expect(checkRateLimitUlti(USER_ID, LIMIT, WINDOW)).toBe(true);
  });

  it("should block when exceeding limit", () => {
    checkRateLimitUlti(USER_ID, LIMIT, WINDOW);
    checkRateLimitUlti(USER_ID, LIMIT, WINDOW);
    checkRateLimitUlti(USER_ID, LIMIT, WINDOW);

    const result = checkRateLimitUlti(USER_ID, LIMIT, WINDOW);
    expect(result).toBe(false);
  });

  it("should reset after time window expires", () => {
    // dùng hết limit
    checkRateLimitUlti(USER_ID, LIMIT, WINDOW);
    checkRateLimitUlti(USER_ID, LIMIT, WINDOW);
    checkRateLimitUlti(USER_ID, LIMIT, WINDOW);

    expect(checkRateLimitUlti(USER_ID, LIMIT, WINDOW)).toBe(false);

    
    vi.advanceTimersByTime(WINDOW + 1);// dongf nay sẽ làm cho thời gian giả tiến lên thêm WINDOW + 1 milliseconds, đảm bảo rằng bất kỳ logic nào dựa trên thời gian hiện tại sẽ nhận thấy rằng cửa sổ thời gian đã hết hạn.

    const result = checkRateLimitUlti(USER_ID, LIMIT, WINDOW);
    expect(result).toBe(true);
  });


  it("should track count correctly", () => {
    checkRateLimitUlti(USER_ID, LIMIT, WINDOW);
    checkRateLimitUlti(USER_ID, LIMIT, WINDOW);

    const entry = rateLimitMap.get(USER_ID);
    console.log(entry);
    expect(entry?.count).toBe(2);
  });

  it("should handle multiple users independently", () => {
    const userA = "A";
    const userB = "B";

    checkRateLimitUlti(userA, 1, WINDOW);
    checkRateLimitUlti(userB, 1, WINDOW);

    expect(checkRateLimitUlti(userA, 1, WINDOW)).toBe(false);
    expect(checkRateLimitUlti(userB, 1, WINDOW)).toBe(false);
  });
});