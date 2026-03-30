import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { sql } from "@/lib/db";
import {
  sendAccountApprovedEmail,
  sendAccountRejectedEmail,
  sendAccountBannedEmail
} from "@/lib/email/send";

async function requireAdmin() {
  const session = await auth();
  if (!session || session.user.role !== "admin") return null;
  return session;
}

async function logAction(
  adminId: string,
  action: string,
  targetUserId: string,
  details: Record<string, unknown> = {}
) {
  await sql`
    INSERT INTO admin_logs (admin_id, action, target_user_id, details)
    VALUES (${adminId}, ${action}, ${targetUserId}, ${JSON.stringify(details)})
  `;
}

// PATCH /api/admin/users/[id]
// body: { action: 'approve'|'reject'|'ban'|'unban'|'change_role'|'set_storage_limit', reason?, role?, limitBytes? }
export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await requireAdmin();
  if (!session) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { id } = await params;
  const body = await request.json().catch(() => ({}));
  const { action, reason, role, limitBytes } = body as {
    action: string;
    reason?: string;
    role?: string;
    limitBytes?: number;
  };

  const userRows = await sql`SELECT id, email, name, status FROM users WHERE id = ${id} LIMIT 1`;
  const user = userRows[0];
  if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

  switch (action) {
    case "approve": {
      await sql`UPDATE users SET status = 'active', updated_at = now() WHERE id = ${id}`;
      await logAction(session.user.id, "approve_user", id);
      await sendAccountApprovedEmail({
        name: user.name as string | null,
        email: user.email as string
      });
      return NextResponse.json({ ok: true, status: "active" });
    }
    case "reject": {
      await sql`DELETE FROM users WHERE id = ${id}`;
      await logAction(session.user.id, "reject_user", id, { reason });
      await sendAccountRejectedEmail(
        { name: user.name as string | null, email: user.email as string },
        reason
      );
      return NextResponse.json({ ok: true });
    }
    case "ban": {
      await sql`UPDATE users SET status = 'banned', updated_at = now() WHERE id = ${id}`;
      await logAction(session.user.id, "ban_user", id, { reason });
      await sendAccountBannedEmail(
        { name: user.name as string | null, email: user.email as string },
        reason
      );
      return NextResponse.json({ ok: true, status: "banned" });
    }
    case "unban": {
      await sql`UPDATE users SET status = 'active', updated_at = now() WHERE id = ${id}`;
      await logAction(session.user.id, "unban_user", id);
      return NextResponse.json({ ok: true, status: "active" });
    }
    case "change_role": {
      if (!role || !["user", "admin"].includes(role)) {
        return NextResponse.json({ error: "Invalid role" }, { status: 400 });
      }
      await sql`UPDATE users SET role = ${role}, updated_at = now() WHERE id = ${id}`;
      await logAction(session.user.id, "change_role", id, { role });
      return NextResponse.json({ ok: true, role });
    }
    case "set_storage_limit": {
      if (typeof limitBytes !== "number" || limitBytes < 0) {
        return NextResponse.json({ error: "Invalid limitBytes" }, { status: 400 });
      }
      await sql`UPDATE users SET storage_limit_bytes = ${limitBytes}, updated_at = now() WHERE id = ${id}`;
      await logAction(session.user.id, "set_storage_limit", id, { limitBytes });
      return NextResponse.json({ ok: true, limitBytes });
    }
    default:
      return NextResponse.json({ error: "Unknown action" }, { status: 400 });
  }
}

// DELETE /api/admin/users/[id]
export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await requireAdmin();
  if (!session) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { id } = await params;
  if (id === session.user.id) {
    return NextResponse.json({ error: "Не можна видалити себе." }, { status: 400 });
  }

  await sql`DELETE FROM users WHERE id = ${id}`;
  await logAction(session.user.id, "delete_user", id);
  return NextResponse.json({ ok: true });
}
