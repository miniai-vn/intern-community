import { describe, expect, it } from "vitest";
import { submitModuleSchema } from "@/lib/validations";

describe("submitModuleSchema", () => {
  const validInput = {
    name: "Pomodoro Timer",
    description: "A focused timer app for deep work sessions with simple controls.",
    categoryId: "ckopqwooh000001la8mbi2im9",
    repoUrl: "https://github.com/example/pomodoro-timer",
    demoUrl: "https://pomodoro.example.com",
  };

  it("accepts a valid payload", () => {
    const result = submitModuleSchema.safeParse(validInput);
    expect(result.success).toBe(true);
  });

  it("rejects non-github repository URLs", () => {
    const result = submitModuleSchema.safeParse({
      ...validInput,
      repoUrl: "https://gitlab.com/example/project",
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.flatten().fieldErrors.repoUrl?.[0]).toMatch(/GitHub/i);
    }
  });

  it("rejects too-short descriptions", () => {
    const result = submitModuleSchema.safeParse({
      ...validInput,
      description: "Too short",
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.flatten().fieldErrors.description?.[0]).toMatch(/20/);
    }
  });

  it("allows empty demoUrl by transforming to undefined", () => {
    const result = submitModuleSchema.safeParse({
      ...validInput,
      demoUrl: "",
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.demoUrl).toBeUndefined();
    }
  });
});
