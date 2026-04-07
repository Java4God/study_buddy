export interface ValidationError {
  field: string;
  message: string;
}

export function validateEmail(email: unknown): string | undefined {
  if (typeof email !== "string" || !email.trim()) return "Email is required.";
  const emailRegex = /^[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,3}$/;
  if (!emailRegex.test(email.trim())) return "Email is invalid.";
  return undefined;
}

export function validatePassword(password: unknown): string | undefined {
  if (typeof password !== "string" || !password) return "Password is required.";
  if (password.length < 8) return "Password must be at least 8 characters.";
  return undefined;
}

export function validateUsername(username: unknown): string | undefined {
  if (username === undefined || username === null || username === "")
    return undefined; // optional
  if (typeof username !== "string") return "Username must be a string.";
  if (username.trim().length < 2)
    return "Username must be at least 2 characters.";
  if (username.trim().length > 32)
    return "Username must be at most 32 characters.";
  return undefined;
}

export function collectErrors(
  checks: Array<{ field: string; error: string | null }>,
): ValidationError[] {
  return checks
    .filter((c) => c.error !== null)
    .map((c) => ({ field: c.field, message: c.error as string }));
}
