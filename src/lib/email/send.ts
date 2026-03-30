import { render } from "@react-email/components";
import { resend, EMAIL_FROM, ADMIN_EMAIL, APP_URL } from "./resend";
import { NewRegistrationEmail } from "./templates/NewRegistration";
import { AccountApprovedEmail } from "./templates/AccountApproved";
import { AccountRejectedEmail } from "./templates/AccountRejected";
import { AccountBannedEmail } from "./templates/AccountBanned";
import { ResetPasswordEmail } from "./templates/ResetPassword";

async function send(to: string, subject: string, react: React.ReactElement) {
  if (!resend) {
    console.log(`[email:skip] to=${to} subject="${subject}"`);
    return;
  }
  const html = await render(react);
  const { error } = await resend.emails.send({ from: EMAIL_FROM, to, subject, html });
  if (error) console.error("[email:error]", error);
}

export async function sendNewRegistrationEmail(user: { name: string | null; email: string }) {
  if (!ADMIN_EMAIL) return;
  await send(
    ADMIN_EMAIL,
    `🔔 Новий користувач: ${user.email}`,
    NewRegistrationEmail({
      userName: user.name ?? "",
      userEmail: user.email,
      adminUrl: `${APP_URL}/dashboard/admin`
    })
  );
}

export async function sendAccountApprovedEmail(user: { name: string | null; email: string }) {
  await send(
    user.email,
    "✅ Твій акаунт підтверджено — Personal Hub",
    AccountApprovedEmail({
      userName: user.name ?? "",
      loginUrl: `${APP_URL}/login`
    })
  );
}

export async function sendAccountRejectedEmail(
  user: { name: string | null; email: string },
  reason?: string
) {
  await send(
    user.email,
    "❌ Запит на реєстрацію відхилено — Personal Hub",
    AccountRejectedEmail({ userName: user.name ?? "", reason })
  );
}

export async function sendAccountBannedEmail(
  user: { name: string | null; email: string },
  reason?: string
) {
  await send(
    user.email,
    "🚫 Акаунт заблоковано — Personal Hub",
    AccountBannedEmail({ userName: user.name ?? "", reason })
  );
}

export async function sendResetPasswordEmail(
  user: { name: string | null; email: string },
  token: string
) {
  const resetUrl = `${APP_URL}/update-password?token=${token}`;
  await send(
    user.email,
    "🔑 Скидання паролю — Personal Hub",
    ResetPasswordEmail({ userName: user.name ?? "", resetUrl, expiresInMinutes: 30 })
  );
}
