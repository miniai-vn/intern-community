import { describe, expect, it } from "vitest";
import { canDeleteModule } from "@/lib/submission-permissions";

describe("canDeleteModule", () => {
  it("allows admins to delete any submission", () => {
    expect(
      canDeleteModule({
        isAdmin: true,
        isOwner: false,
        status: "APPROVED",
      })
    ).toBe(true);
  });

  it("allows authors to delete pending submissions", () => {
    expect(
      canDeleteModule({
        isAdmin: false,
        isOwner: true,
        status: "PENDING",
      })
    ).toBe(true);
  });

  it("prevents authors from deleting approved submissions", () => {
    expect(
      canDeleteModule({
        isAdmin: false,
        isOwner: true,
        status: "APPROVED",
      })
    ).toBe(false);
  });

  it("prevents authors from deleting rejected submissions", () => {
    expect(
      canDeleteModule({
        isAdmin: false,
        isOwner: true,
        status: "REJECTED",
      })
    ).toBe(false);
  });

  it("prevents non-owners from deleting submissions", () => {
    expect(
      canDeleteModule({
        isAdmin: false,
        isOwner: false,
        status: "PENDING",
      })
    ).toBe(false);
  });
});