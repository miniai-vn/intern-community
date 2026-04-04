import { describe, expect, it } from "vitest";
import { adminReviewSchema, submitModuleSchema } from "@/lib/validations";

describe("submitModuleSchema", () => {
  const validSubmission = {
    name: "Tran Nhat Nam",
    description: "A productivity timer module for focused work sessions.",
    categoryId: "ckv1234567890abcdef12345",
    repoUrl: "https://github.com/nam/intern-community",
    demoUrl: "https://pomodoro.nam.com",
  };

  it("accepts a valid submission payload", () => {
    const result = submitModuleSchema.safeParse(validSubmission);

    expect(result.success).toBe(true);
  });

  it("rejects a name that is too short", () => {
    const result = submitModuleSchema.safeParse({
      ...validSubmission,
      name: "AB",
    });

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.flatten().fieldErrors.name).toContain(
        "Name must be at least 3 characters",
      );
    }
  });

  it("rejects a description that is too short", () => {
    const result = submitModuleSchema.safeParse({
      ...validSubmission,
      description: "Too short",
    });

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.flatten().fieldErrors.description).toContain(
        "Description must be at least 20 characters",
      );
    }
  });

  it("rejects an invalid categoryId", () => {
    const result = submitModuleSchema.safeParse({
      ...validSubmission,
      categoryId: "not-a-cuid",
    });

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.flatten().fieldErrors.categoryId).toContain(
        "Please select a valid category",
      );
    }
  });

  it("rejects a non-URL repoUrl", () => {
    const result = submitModuleSchema.safeParse({
      ...validSubmission,
      repoUrl: "not-a-url",
    });

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.flatten().fieldErrors.repoUrl).toContain(
        "Must be a valid URL",
      );
    }
  });

  it("rejects a non-GitHub repoUrl", () => {
    const result = submitModuleSchema.safeParse({
      ...validSubmission,
      repoUrl: "https://gitlab.com/example/project",
    });

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.flatten().fieldErrors.repoUrl).toContain(
        "Must be a GitHub repository URL",
      );
    }
  });

  it("accepts an empty optional demoUrl and transforms it to undefined", () => {
    const result = submitModuleSchema.safeParse({
      ...validSubmission,
      demoUrl: "",
    });

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.demoUrl).toBeUndefined();
    }
  });

  it("accepts a missing optional demoUrl", () => {
    const { demoUrl, ...payloadWithoutDemo } = validSubmission;

    const result = submitModuleSchema.safeParse(payloadWithoutDemo);

    expect(result.success).toBe(true);
  });

  it("rejects an invalid demoUrl", () => {
    const result = submitModuleSchema.safeParse({
      ...validSubmission,
      demoUrl: "invalid-demo-url",
    });

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.flatten().fieldErrors.demoUrl).toContain(
        "Must be a valid URL",
      );
    }
  });
});

describe("adminReviewSchema", () => {
  it("accepts a valid approved review payload", () => {
    const result = adminReviewSchema.safeParse({
      status: "APPROVED",
      feedback: "Looks good to me.",
    });

    expect(result.success).toBe(true);
  });

  it("accepts a valid rejected review payload without feedback", () => {
    const result = adminReviewSchema.safeParse({
      status: "REJECTED",
    });

    expect(result.success).toBe(true);
  });

  it("rejects an invalid status", () => {
    const result = adminReviewSchema.safeParse({
      status: "PENDING",
      feedback: "Invalid status",
    });

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.flatten().fieldErrors.status).toBeDefined();
    }
  });

  it("rejects feedback longer than 500 characters", () => {
    const result = adminReviewSchema.safeParse({
      status: "APPROVED",
      feedback: "a".repeat(501),
    });

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.flatten().fieldErrors.feedback).toBeDefined();
    }
  });
});
