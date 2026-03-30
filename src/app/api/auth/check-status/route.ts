import { NextResponse } from "next/server";
import { sql } from "@/lib/db";
import { checkRateLimit, getClientIp } from "@/lib/rateLimit";

// Публічний endpoint — повертає тільки статус акаунту (без пароля)
// Використовується для показу правильного повідомлення після невдалого логіну
export async function GET(request: Request) {
  const rl = await checkRateLimit({
    key: `check-status:${getClientIp(request)}`,
    maxAttempts: 10,
    windowSeconds: 60
  });
  if (!rl.allowed) {
    return NextResponse.json({ status: "not_found" }); // тихо ігноруємо
  }

  const { searchParams } = new URL(request.url);
  const email = searchParams.get("email")?.trim().toLowerCase();
  if (!email) return NextResponse.json({ status: "not_found" });

  const rows = await sql`SELECT status FROM users WHERE email = ${email} LIMIT 1`;
  const status = (rows[0]?.status as string) ?? "not_found";
  return NextResponse.json({ status });
}
