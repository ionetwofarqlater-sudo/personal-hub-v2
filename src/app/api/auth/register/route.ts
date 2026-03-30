import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { sql } from "@/lib/db";
import { checkRateLimit, getClientIp } from "@/lib/rateLimit";
import { sendNewRegistrationEmail } from "@/lib/email/send";

const MAX_ACTIVE_USERS = parseInt(process.env.MAX_ACTIVE_USERS ?? "50");

export async function POST(request: Request) {
  // Rate limit: 3 реєстрації / годину з одного IP
  const ip = getClientIp(request);
  const rl = await checkRateLimit({
    key: `register:${ip}`,
    maxAttempts: 3,
    windowSeconds: 3600
  });
  if (!rl.allowed) {
    return NextResponse.json(
      { error: "Забагато спроб. Спробуй пізніше." },
      { status: 429, headers: { "Retry-After": String(rl.retryAfterSeconds) } }
    );
  }

  const body = await request.json().catch(() => null);
  const email = (body?.email as string | undefined)?.trim().toLowerCase();
  const password = body?.password as string | undefined;
  const name = (body?.name as string | undefined)?.trim() || null;
  const inviteCode = (body?.inviteCode as string | undefined)?.trim() || null;

  if (!email || !password) {
    return NextResponse.json({ error: "Email і пароль обовʼязкові." }, { status: 400 });
  }
  if (password.length < 8) {
    return NextResponse.json({ error: "Пароль мінімум 8 символів." }, { status: 400 });
  }

  // Перевірка ліміту активних юзерів
  const countRows = await sql`SELECT COUNT(*) AS cnt FROM users WHERE status != 'pending'`;
  if (Number(countRows[0].cnt) >= MAX_ACTIVE_USERS) {
    return NextResponse.json({ error: "Реєстрація тимчасово закрита." }, { status: 403 });
  }

  // Перевірка invite коду (якщо вказаний)
  let inviteRow = null;
  if (inviteCode) {
    const rows = await sql`
      SELECT id FROM invite_codes
      WHERE code = ${inviteCode}
        AND used_by IS NULL
        AND (expires_at IS NULL OR expires_at > now())
      LIMIT 1
    `;
    if (!rows[0]) {
      return NextResponse.json({ error: "Невірний або прострочений invite код." }, { status: 400 });
    }
    inviteRow = rows[0];
  }

  // Перевірка дублікату
  const existing = await sql`SELECT id FROM users WHERE email = ${email} LIMIT 1`;
  if (existing[0]) {
    return NextResponse.json({ error: "Email вже зареєстрований." }, { status: 409 });
  }

  const passwordHash = await bcrypt.hash(password, 12);

  // Якщо email збігається з ADMIN_EMAIL → перший адмін, одразу active+admin
  const adminEmail = process.env.ADMIN_EMAIL?.trim().toLowerCase();
  const isFirstAdmin = !!adminEmail && email === adminEmail;

  const status = isFirstAdmin || inviteRow ? "active" : "pending";
  const role = isFirstAdmin ? "admin" : "user";

  const newUser = await sql`
    INSERT INTO users (email, password_hash, name, status, role)
    VALUES (${email}, ${passwordHash}, ${name}, ${status}, ${role})
    RETURNING id, email, name, status, role
  `;
  const user = newUser[0];

  // Позначаємо invite як використаний
  if (inviteRow) {
    await sql`
      UPDATE invite_codes
      SET used_by = ${user.id as string}, used_at = now()
      WHERE id = ${inviteRow.id as string}
    `;
  }

  // Email адміну тільки для pending юзерів
  if (status === "pending") {
    await sendNewRegistrationEmail({
      name: user.name as string | null,
      email: user.email as string
    });
  }

  return NextResponse.json(
    {
      message:
        status === "active"
          ? "Реєстрація успішна! Можеш увійти."
          : "Реєстрація успішна! Очікуй підтвердження адміністратора.",
      status
    },
    { status: 201 }
  );
}
