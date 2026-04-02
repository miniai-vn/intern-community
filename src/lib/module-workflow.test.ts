import { describe, expect, it } from "vitest";
import {
  buildRevisionSnapshot,
  canAuthorResubmit,
  isAuthorOwner,
} from "@/lib/module-workflow";

describe("module workflow guards", () => {
  it("allows resubmission only for REJECTED status", () => {
    expect(canAuthorResubmit("REJECTED")).toBe(true);
    expect(canAuthorResubmit("PENDING")).toBe(false);
    expect(canAuthorResubmit("APPROVED")).toBe(false);
  });

  it("checks ownership by user id", () => {
    expect(isAuthorOwner("user_1", "user_1")).toBe(true);
    expect(isAuthorOwner("user_1", "user_2")).toBe(false);
  });
});

describe("buildRevisionSnapshot", () => {
  it("returns immutable revision fields from module source", () => {
    const snapshot = buildRevisionSnapshot({
      name: "Original Name",
      description: "Original description with enough content",
      repoUrl: "https://github.com/acme/original",
      demoUrl: "https://demo.example.com",
      status: "REJECTED",
      categoryId: "category_1",
    });

    expect(snapshot).toEqual({
      name: "Original Name",
      description: "Original description with enough content",
      repoUrl: "https://github.com/acme/original",
      demoUrl: "https://demo.example.com",
      status: "REJECTED",
      categoryId: "category_1",
    });
  });
});
