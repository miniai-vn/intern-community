/**
 * ===== PASSWORD STRENGTH ANALYZER =====
 * 
 * Utility để phân tích độ mạnh của mật khẩu
 * 
 * Tiêu chí:
 * - Độ dài (length)
 * - Chữ hoa (uppercase)
 * - Chữ thường (lowercase)
 * - Số (digits)
 * - Ký tự đặc biệt (special chars)
 * - Không có từ phổ biến (common patterns)
 */

export type PasswordStrength = "very-weak" | "weak" | "fair" | "good" | "strong" | "very-strong";

export interface PasswordAnalysis {
  // Mức độ (1-5): Very Weak → Very Strong
  strength: PasswordStrength;
  // Score từ 0-100
  score: number;
  // Danh sách các suggestions để cải thiện
  suggestions: string[];
  // Chi tiết các yêu cầu pass/fail
  checks: {
    length: boolean;
    uppercase: boolean;
    lowercase: boolean;
    digits: boolean;
    special: boolean;
    entropy: boolean;
  };
}

/**
 * Danh sách những từ phổ biến thường được dùng làm mật khẩu
 * Nên tránh dùng những từ này
 */
const COMMON_PASSWORDS = [
  "password",
  "123456",
  "qwerty",
  "admin",
  "welcome",
  "letmein",
  "monkey",
  "dragon",
  "master",
  "sunshine",
  "superman",
  "batman",
];

/**
 * Hàm chính: Phân tích mật khẩu
 * @param password - Mật khẩu cần kiểm tra
 * @returns Kết quả phân tích chi tiết
 * 
 * @example
 * analyzePassword("MyPassword123!")
 * // {
 * //   strength: "strong",
 * //   score: 85,
 * //   checks: { length: true, uppercase: true, ... },
 * //   suggestions: []
 * // }
 */
export function analyzePassword(password: string): PasswordAnalysis {
  const suggestions: string[] = [];
  let score = 0;

  // ===== CHECKS =====

  // 1️⃣ Check độ dài (ít nhất 8, tốt nhất 12+)
  const lengthCheck = password.length >= 8;
  const lengthBonus = password.length >= 12 ? 10 : password.length >= 10 ? 5 : 0;
  score += lengthCheck ? 12 + lengthBonus : 3;
  if (!lengthCheck) suggestions.push("Mật khẩu cần ít nhất 8 ký tự");

  // 2️⃣ Check chữ hoa
  const uppercaseCheck = /[A-Z]/.test(password);
  score += uppercaseCheck ? 12 : 0;
  if (!uppercaseCheck) suggestions.push("Thêm ít nhất 1 chữ hoa (A-Z)");

  // 3️⃣ Check chữ thường
  const lowercaseCheck = /[a-z]/.test(password);
  score += lowercaseCheck ? 12 : 0;
  if (!lowercaseCheck) suggestions.push("Thêm ít nhất 1 chữ thường (a-z)");

  // 4️⃣ Check số
  const digitsCheck = /[0-9]/.test(password);
  score += digitsCheck ? 12 : 0;
  if (!digitsCheck) suggestions.push("Thêm ít nhất 1 số (0-9)");

  // 5️⃣ Check ký tự đặc biệt
  const specialCheck = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password);
  score += specialCheck ? 20 : 0;
  if (!specialCheck) suggestions.push("Thêm ít nhất 1 ký tự đặc biệt (!@#$%^&*)");

  // 6️⃣ Check entropy (không phải từ phổ biến)
  const isCommon = COMMON_PASSWORDS.some(
    (p) => password.toLowerCase().includes(p)
  );
  const entropyCheck = !isCommon && password.length > 0;
  score += entropyCheck ? 12 : -15;
  if (isCommon) suggestions.push("Tránh dùng những từ phổ biến hoặc dễ đoán");

  // ===== DETERMINE STRENGTH =====
  let strength: PasswordStrength;
  if (score < 15) strength = "very-weak";
  else if (score < 28) strength = "weak";
  else if (score < 46) strength = "fair";
  else if (score < 62) strength = "good";
  else if (score < 78) strength = "strong";
  else strength = "very-strong";

  // Clamp score to 0-100
  const finalScore = Math.min(Math.max(score, 0), 100);

  return {
    strength,
    score: finalScore,
    suggestions,
    checks: {
      length: lengthCheck,
      uppercase: uppercaseCheck,
      lowercase: lowercaseCheck,
      digits: digitsCheck,
      special: specialCheck,
      entropy: entropyCheck,
    },
  };
}

/**
 * Hàm helper: Get label text & color cho strength
 */
export function getStrengthDisplay(strength: PasswordStrength) {
  const display = {
    "very-weak": {
      label: "Cực Yếu",
      color: "text-red-600",
      bg: "bg-red-50",
      border: "border-red-200",
      bar: "bg-red-500",
    },
    weak: {
      label: "Yếu",
      color: "text-orange-600",
      bg: "bg-orange-50",
      border: "border-orange-200",
      bar: "bg-orange-500",
    },
    fair: {
      label: "Tạm Được",
      color: "text-yellow-600",
      bg: "bg-yellow-50",
      border: "border-yellow-200",
      bar: "bg-yellow-500",
    },
    good: {
      label: "Tốt",
      color: "text-blue-600",
      bg: "bg-blue-50",
      border: "border-blue-200",
      bar: "bg-blue-500",
    },
    strong: {
      label: "Mạnh",
      color: "text-green-600",
      bg: "bg-green-50",
      border: "border-green-200",
      bar: "bg-green-500",
    },
    "very-strong": {
      label: "Cực Mạnh",
      color: "text-emerald-600",
      bg: "bg-emerald-50",
      border: "border-emerald-200",
      bar: "bg-emerald-500",
    },
  };
  return display[strength];
}
