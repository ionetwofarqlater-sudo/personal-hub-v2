import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { sql } from "@/lib/db";

// Публічний для авторизованих юзерів — повертає активні оголошення
export async function GET() {
  const session = await auth();
  if (!session) return NextResponse.json({ announcements: [] });

  const announcements = await sql`
    SELECT id, title, content, created_at
    FROM announcements
    WHERE is_active = true
      AND (expires_at IS NULL OR expires_at > now())
    ORDER BY created_at DESC
    LIMIT 5
  `;

  return NextResponse.json({ announcements });
}
