import { describe, it, expect } from "vitest";
import {
  submitModuleSchema,
  adminReviewSchema,
} from "@/lib/validations";

/** Stable-looking value that satisfies z.string().cuid() for happy-path tests. */
const SAMPLE_CUID = "ckjb4bsqi0000zjom3afq3q9";

describe("submitModuleSchema", () => {
  it("accepts a valid payload with optional empty demoUrl", () => {
    const result = submitModuleSchema.safeParse({
      name: "Cool Module",
      description: "A useful module for the community.",
      categoryId: SAMPLE_CUID,
      repoUrl: "https://github.com/org/repo",
      demoUrl: "",
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.demoUrl).toBeUndefined();
    }
  });

  it("rejects a name that is too short", () => {
    const result = submitModuleSchema.safeParse({
      name: "ab",
      description: "At least twenty characters here.",
      categoryId: SAMPLE_CUID,
      repoUrl: "https://github.com/org/repo",
    });
    expect(result.success).toBe(false);
  });

  it("rejects a description that is too short", () => {
    const result = submitModuleSchema.safeParse({
      name: "Good Name",
      description: "Too short",
      categoryId: SAMPLE_CUID,
      repoUrl: "https://github.com/org/repo",
    });
    expect(result.success).toBe(false);
  });

  it("rejects a non-GitHub repo URL", () => {
    const result = submitModuleSchema.safeParse({
      name: "Good Name",
      description: "At least twenty characters here.",
      categoryId: SAMPLE_CUID,
      repoUrl: "https://gitlab.com/org/repo",
    });
    expect(result.success).toBe(false);
  });

  it("rejects an invalid category id", () => {
    const result = submitModuleSchema.safeParse({
      name: "Good Name",
      description: "At least twenty characters here.",
      categoryId: "not-a-cuid",
      repoUrl: "https://github.com/org/repo",
    });
    expect(result.success).toBe(false);
  });
});

describe("adminReviewSchema", () => {
  it("accepts APPROVED without feedback", () => {
    const result = adminReviewSchema.safeParse({ status: "APPROVED" });
    expect(result.success).toBe(true);
  });

  it("rejects feedback longer than 500 characters", () => {
    const result = adminReviewSchema.safeParse({
      status: "REJECTED",
      feedback: "x".repeat(501),
    });
    expect(result.success).toBe(false);
  });
});
