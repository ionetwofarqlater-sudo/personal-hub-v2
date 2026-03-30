import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { sql } from "@/lib/db";

export async function GET(request: Request) {
  const session = await auth();
  if (!session || session.user.role !== "admin") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { searchParams } = new URL(request.url);
  const limit = Math.min(parseInt(searchParams.get("limit") ?? "50"), 200);
  const offset = parseInt(searchParams.get("offset") ?? "0");

  const logs = await sql`
    SELECT
      al.id, al.action, al.details, al.created_at,
      a.email AS admin_email, a.name AS admin_name,
      t.email AS target_email, t.name AS target_name
    FROM admin_logs al
    JOIN users a ON a.id = al.admin_id
    LEFT JOIN users t ON t.id = al.target_user_id
    ORDER BY al.created_at DESC
    LIMIT ${limit} OFFSET ${offset}
  `;

  return NextResponse.json({ logs });
}
