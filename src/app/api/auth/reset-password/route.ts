import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { sql } from "@/lib/db";
import { checkRateLimit, getClientIp } from "@/lib/rateLimit";

export async function POST(request: Request) {
  const rl = await checkRateLimit({
    key: `reset-password:${getClientIp(request)}`,
    maxAttempts: 5,
    windowSeconds: 900
  });
  if (!rl.allowed) {
    return NextResponse.json({ error: "Забагато спроб. Спробуй пізніше." }, { status: 429 });
  }

  const body = await request.json().catch(() => ({}));
  const token = (body?.token as string | undefined)?.trim();
  const password = body?.password as string | undefined;

  if (!token || !password || password.length < 8) {
    return NextResponse.json({ error: "Невірні дані." }, { status: 400 });
  }

  const rows = await sql`
    SELECT id, user_id, expires_at, used_at
    FROM password_reset_tokens
    WHERE token = ${token}
    LIMIT 1
  `;
  const resetToken = rows[0];

  if (!resetToken) {
    return NextResponse.json({ error: "Невірне або прострочене посилання." }, { status: 400 });
  }
  if (resetToken.used_at) {
    return NextResponse.json({ error: "Це посилання вже було використано." }, { status: 400 });
  }
  if (new Date(resetToken.expires_at as string) < new Date()) {
    return NextResponse.json({ error: "Посилання прострочено. Запроси нове." }, { status: 400 });
  }

  const passwordHash = await bcrypt.hash(password, 12);

  await Promise.all([
    sql`UPDATE users SET password_hash = ${passwordHash}, updated_at = now() WHERE id = ${resetToken.user_id as string}`,
    sql`UPDATE password_reset_tokens SET used_at = now() WHERE id = ${resetToken.id as string}`
  ]);

  return NextResponse.json({ ok: true });
}
