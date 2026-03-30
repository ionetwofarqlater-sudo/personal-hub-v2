import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { sql } from "@/lib/db";

export async function GET() {
  const session = await auth();
  if (!session || session.user.role !== "admin") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const announcements = await sql`
    SELECT a.id, a.title, a.content, a.is_active, a.expires_at, a.created_at,
           u.name AS author_name
    FROM announcements a
    JOIN users u ON u.id = a.created_by
    ORDER BY a.created_at DESC
  `;

  return NextResponse.json({ announcements });
}

export async function POST(request: Request) {
  const session = await auth();
  if (!session || session.user.role !== "admin") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const body = await request.json().catch(() => ({}));
  const title = (body?.title as string | undefined)?.trim();
  const content = (body?.content as string | undefined)?.trim();
  const expiresAt = body?.expiresAt ? new Date(body.expiresAt as string) : null;

  if (!title || !content) {
    return NextResponse.json({ error: "Title і content обовʼязкові." }, { status: 400 });
  }

  const rows = await sql`
    INSERT INTO announcements (created_by, title, content, expires_at)
    VALUES (${session.user.id}, ${title}, ${content}, ${expiresAt})
    RETURNING id, title, content, is_active, expires_at, created_at
  `;

  return NextResponse.json({ announcement: rows[0] }, { status: 201 });
}

export async function PATCH(request: Request) {
  const session = await auth();
  if (!session || session.user.role !== "admin") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const body = await request.json().catch(() => ({}));
  const { id, isActive } = body as { id: string; isActive: boolean };

  if (!id) return NextResponse.json({ error: "id обовʼязковий." }, { status: 400 });

  await sql`UPDATE announcements SET is_active = ${isActive} WHERE id = ${id}`;
  return NextResponse.json({ ok: true });
}
