import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { sql } from "@/lib/db";
import crypto from "crypto";

export async function GET() {
  const session = await auth();
  if (!session || session.user.role !== "admin") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const invites = await sql`
    SELECT
      i.id, i.code, i.expires_at, i.created_at, i.used_at,
      u.email AS used_by_email
    FROM invite_codes i
    LEFT JOIN users u ON u.id = i.used_by
    WHERE i.created_by = ${session.user.id}
    ORDER BY i.created_at DESC
  `;

  return NextResponse.json({ invites });
}

export async function POST(request: Request) {
  const session = await auth();
  if (!session || session.user.role !== "admin") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const body = await request.json().catch(() => ({}));
  const expiresInDays = (body?.expiresInDays as number | undefined) ?? 7;

  const code = crypto.randomBytes(16).toString("hex");
  const expiresAt = new Date(Date.now() + expiresInDays * 86400 * 1000);

  const rows = await sql`
    INSERT INTO invite_codes (code, created_by, expires_at)
    VALUES (${code}, ${session.user.id}, ${expiresAt})
    RETURNING id, code, expires_at, created_at
  `;

  const APP_URL = process.env.AUTH_URL ?? "http://localhost:3000";
  const inviteUrl = `${APP_URL}/register?invite=${code}`;

  return NextResponse.json({ invite: rows[0], url: inviteUrl }, { status: 201 });
}
