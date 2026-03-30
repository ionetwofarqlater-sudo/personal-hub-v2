import { sql } from "./db";

interface RateLimitOptions {
  key: string;
  maxAttempts: number;
  windowSeconds: number;
}

interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  retryAfterSeconds: number;
}

export async function checkRateLimit({
  key,
  maxAttempts,
  windowSeconds
}: RateLimitOptions): Promise<RateLimitResult> {
  const now = new Date();
  const windowStart = new Date(now.getTime() - windowSeconds * 1000);

  // Upsert: якщо запис старший за вікно — скидаємо, інакше інкрементуємо
  const rows = await sql<{ attempts: number; window_start: Date }[]>`
    INSERT INTO rate_limits (key, attempts, window_start)
    VALUES (${key}, 1, ${now})
    ON CONFLICT (key) DO UPDATE SET
      attempts     = CASE
                       WHEN rate_limits.window_start < ${windowStart}
                       THEN 1
                       ELSE rate_limits.attempts + 1
                     END,
      window_start = CASE
                       WHEN rate_limits.window_start < ${windowStart}
                       THEN ${now}
                       ELSE rate_limits.window_start
                     END
    RETURNING attempts, window_start
  `;

  const { attempts, window_start } = rows[0];
  const windowEndsAt = new Date(window_start.getTime() + windowSeconds * 1000);
  const retryAfterSeconds = Math.ceil((windowEndsAt.getTime() - now.getTime()) / 1000);

  return {
    allowed: attempts <= maxAttempts,
    remaining: Math.max(0, maxAttempts - attempts),
    retryAfterSeconds: attempts > maxAttempts ? retryAfterSeconds : 0
  };
}

export function getClientIp(request: Request): string {
  return (
    request.headers.get("cf-connecting-ip") ??
    request.headers.get("x-forwarded-for")?.split(",")[0].trim() ??
    "unknown"
  );
}
