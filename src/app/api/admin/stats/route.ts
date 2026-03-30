import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { sql } from "@/lib/db";

export async function GET() {
  const session = await auth();
  if (!session || session.user.role !== "admin") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const [userStats, storageStats, itemStats] = await Promise.all([
    sql`
      SELECT
        COUNT(*) FILTER (WHERE status = 'active')  AS active,
        COUNT(*) FILTER (WHERE status = 'pending') AS pending,
        COUNT(*) FILTER (WHERE status = 'banned')  AS banned
      FROM users
    `,
    sql`
      SELECT
        COALESCE(SUM(storage_used_bytes), 0)  AS total_used,
        COALESCE(SUM(storage_limit_bytes), 0) AS total_limit
      FROM users
    `,
    sql`
      SELECT COUNT(*) AS total FROM saved_items WHERE deleted_at IS NULL
    `
  ]);

  return NextResponse.json({
    users: userStats[0],
    storage: storageStats[0],
    items: itemStats[0]
  });
}
