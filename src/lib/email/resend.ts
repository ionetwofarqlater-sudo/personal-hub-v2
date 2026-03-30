import { Resend } from "resend";

if (!process.env.RESEND_API_KEY) {
  console.warn("[email] RESEND_API_KEY not set — emails will be skipped");
}

export const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;

export const EMAIL_FROM = process.env.EMAIL_FROM ?? "noreply@yourdomain.com";
export const ADMIN_EMAIL = process.env.ADMIN_EMAIL ?? "";
export const APP_URL = process.env.AUTH_URL ?? "http://localhost:3000";
