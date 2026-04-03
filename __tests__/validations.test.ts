import { describe, expect, it } from "vitest";
import { adminReviewSchema, submitModuleSchema } from "@/lib/validations";

describe("submitModuleSchema", () => {
  const validInput = {
    name: "Pomodoro Timer",
    description: "A focused timer app for study sessions and deep work blocks.",
    categoryId: "cm9z8x2ha0000jv04m5jck7t9",
    repoUrl: "https://github.com/example/pomodoro-timer",
    demoUrl: "https://pomodoro.example.com",
  };

  it("accepts a valid module submission", () => {
    const result = submitModuleSchema.safeParse(validInput);

    expect(result.success).toBe(true);
  });

  it("rejects a repository URL outside GitHub", () => {
    const result = submitModuleSchema.safeParse({
      ...validInput,
      repoUrl: "https://gitlab.com/example/pomodoro-timer",
    });

    expect(result.success).toBe(false);
    expect(result.error?.flatten().fieldErrors.repoUrl).toContain(
      "Must be a GitHub repository URL"
    );
  });

  it("rejects an invalid category id", () => {
    const result = submitModuleSchema.safeParse({
      ...validInput,
      categoryId: "not-a-cuid",
    });

    expect(result.success).toBe(false);
    expect(result.error?.flatten().fieldErrors.categoryId).toContain(
      "Please select a valid category"
    );
  });

  it("rejects descriptions shorter than the minimum length", () => {
    const result = submitModuleSchema.safeParse({
      ...validInput,
      description: "Too short",
    });

    expect(result.success).toBe(false);
    expect(result.error?.flatten().fieldErrors.description).toContain(
      "Description must be at least 20 characters"
    );
  });

  it("transforms an empty demo URL into undefined", () => {
    const result = submitModuleSchema.safeParse({
      ...validInput,
      demoUrl: "",
    });

    expect(result.success).toBe(true);
    expect(result.data?.demoUrl).toBeUndefined();
  });
});

describe("adminReviewSchema", () => {
  it("accepts an approved review with optional feedback", () => {
    const result = adminReviewSchema.safeParse({
      status: "APPROVED",
      feedback: "Looks good. Clear UX and sensible defaults.",
    });

    expect(result.success).toBe(true);
  });

  it("rejects unsupported review statuses", () => {
    const result = adminReviewSchema.safeParse({
      status: "PENDING",
    });

    expect(result.success).toBe(false);
    expect(result.error?.flatten().fieldErrors.status).toBeTruthy();
  });

  it("rejects feedback longer than 500 characters", () => {
    const result = adminReviewSchema.safeParse({
      status: "REJECTED",
      feedback: "x".repeat(501),
    });

    expect(result.success).toBe(false);
    expect(result.error?.flatten().fieldErrors.feedback).toContain(
      "Too big: expected string to have <=500 characters"
    );
  });
});
