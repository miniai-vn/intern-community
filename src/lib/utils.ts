import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { ZodError, ZodObject, ZodSchema } from "zod";

export const rateLimitMap = new Map<string, { count: number; resetAt: number }>();

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Generates a URL-safe slug from a display name.
 *
 * Rules:
 * - Lowercase
 * - Replace spaces and special chars with hyphens
 * - Collapse multiple consecutive hyphens into one
 * - Strip leading/trailing hyphens
 *
 * @example
 * generateSlug("My Cool App!")  // "my-cool-app"
 * generateSlug("  Hello  World  ") // "hello-world"
 */
export function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/[\s]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

/**
 * Appends a numeric suffix to a slug to ensure uniqueness.
 * @example
 * makeUniqueSlug("my-app", ["my-app", "my-app-1"]) // "my-app-2"
 */
export function makeUniqueSlug(base: string, existing: string[]): string {
  if (!existing.includes(base)) return base;
  let i = 1;
  while (existing.includes(`${base}-${i}`)) i++;
  return `${base}-${i}`;
}

export function formatRelativeTime(date: Date): string {
  const diff = Date.now() - date.getTime();
  const minutes = Math.floor(diff / 60_000);
  if (minutes < 1) return "just now";
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days}d ago`;
  return date.toLocaleDateString();
}
export const formatFieldErrors = (err: any) => {
  return Object.values(err.fieldErrors)
    .flat()
    .filter(Boolean)
    .join(", ");
}
export const  checkRateLimitUlti=(userId: string, count: number, time: number): boolean => {
  const now = Date.now();
  const entry = rateLimitMap.get(userId);
  if (!entry || entry.resetAt < now) {
    rateLimitMap.set(userId, { count: 1, resetAt: now + time });
    return true;
  }
  if (entry.count >= count) return false;
  entry.count++;
  return true;
}
