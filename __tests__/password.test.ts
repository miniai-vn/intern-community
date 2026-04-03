import { describe, it, expect } from "vitest";
import { analyzePassword } from "@/lib/password";

/**
 * ===== PASSWORD STRENGTH TESTS =====
 * 
 * Kiểm tra độ chính xác của password analyzer
 */

describe("analyzePassword", () => {
  // ===== BASIC STRENGTH CHECKS =====
  it("identifies very weak password (single letter)", () => {
    const result = analyzePassword("x");
    expect(result.strength).toBe("weak");
    expect(result.score).toBeLessThan(30);
  });

  // ===== WEAK (missing uppercase) =====
  it("identifies weak password (only lowercase)", () => {
    const result = analyzePassword("password123");
    expect(result.strength).toBe("weak");
    expect(result.checks.uppercase).toBe(false);
    expect(result.suggestions).toContain("Thêm ít nhất 1 chữ hoa (A-Z)");
  });

  // ===== FAIR (mixed case + digits) =====
  it("identifies fair password (mixed case + digits, no special)", () => {
    const result = analyzePassword("Pass123456");
    expect(result.strength).toBe("fair");
    expect(result.checks.uppercase).toBe(true);
    expect(result.checks.lowercase).toBe(true);
    expect(result.checks.digits).toBe(true);
    expect(result.checks.special).toBe(false);
  });

  // ===== GOOD (all elements + special chars) =====
  it("identifies good/strong password (all elements present)", () => {
    const result = analyzePassword("MyP@ssXYZ123");
    expect(["good", "strong", "very-strong"]).toContain(result.strength);
    expect(result.checks.special).toBe(true);
    expect(result.checks.uppercase).toBe(true);
    expect(result.checks.lowercase).toBe(true);
    expect(result.checks.digits).toBe(true);
  });

  // ===== VERY STRONG (all + unique + long) =====
  it("identifies very strong password (comprehensive)", () => {
    const result = analyzePassword("MyV3ry$ecureP@ssw0rd!");
    expect(result.strength).toBe("very-strong");
    expect(result.score).toBeGreaterThanOrEqual(78);
    expect(result.suggestions).toHaveLength(0);
  });

  // ===== COMMON PASSWORDS =====
  it("penalizes common password patterns", () => {
    const result = analyzePassword("Password123!");
    // Contains 'password' - common pattern
    expect(result.suggestions).toContain(
      "Tránh dùng những từ phổ biến hoặc dễ đoán"
    );
  });

  // ===== EDGE CASES =====
  it("handles empty password", () => {
    const result = analyzePassword("");
    expect(result.strength).toBe("very-weak");
    expect(result.score).toBeLessThan(10);
  });

  it("handles space-only password", () => {
    const result = analyzePassword("     ");
    expect(result.checks.lowercase).toBe(false);
    expect(result.checks.uppercase).toBe(false);
  });

  // ===== SUGGESTION TESTS =====
  it("provides correct suggestions for weak password", () => {
    const result = analyzePassword("abc");
    expect(result.suggestions.length).toBeGreaterThan(0);
    expect(result.suggestions).toContain("Mật khẩu cần ít nhất 8 ký tự");
    expect(result.suggestions).toContain("Thêm ít nhất 1 chữ hoa (A-Z)");
  });

  it("provides no suggestions for very strong password", () => {
    const result = analyzePassword("C0mpl3x&S3cur3P@ss!");
    expect(result.suggestions).toHaveLength(0);
  });
});
