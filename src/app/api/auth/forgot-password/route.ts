import { NextResponse } from "next/server";
import crypto from "crypto";
import { sql } from "@/lib/db";
import { checkRateLimit, getClientIp } from "@/lib/rateLimit";
import { sendResetPasswordEmail } from "@/lib/email/send";

export async function POST(request: Request) {
  // Rate limit: 3 запити / годину з IP
  const rl = await checkRateLimit({
    key: `forgot-password:${getClientIp(request)}`,
    maxAttempts: 3,
    windowSeconds: 3600
  });
  if (!rl.allowed) {
    // Відповідаємо однаково — не розкриваємо інфо
    return NextResponse.json({ ok: true });
  }

  const body = await request.json().catch(() => ({}));
  const email = (body?.email as string | undefined)?.trim().toLowerCase();
  if (!email) return NextResponse.json({ ok: true });

  const rows = await sql`
    SELECT id, email, name, status FROM users WHERE email = ${email} LIMIT 1
  `;
  const user = rows[0];

  // Відповідаємо однаково незалежно від того чи існує email (anti-enumeration)
  if (!user || user.status !== "active") {
    return NextResponse.json({ ok: true });
  }

  // Анулюємо старі токени цього юзера
  await sql`DELETE FROM password_reset_tokens WHERE user_id = ${user.id as string}`;

  const token = crypto.randomBytes(32).toString("hex");
  const expiresAt = new Date(Date.now() + 30 * 60 * 1000); // 30 хвилин

  await sql`
    INSERT INTO password_reset_tokens (user_id, token, expires_at)
    VALUES (${user.id as string}, ${token}, ${expiresAt})
  `;

  await sendResetPasswordEmail(
    { name: user.name as string | null, email: user.email as string },
    token
  );

  return NextResponse.json({ ok: true });
}
