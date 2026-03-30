"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft, Mail, Zap, CheckCircle } from "lucide-react";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const res = await fetch("/api/auth/forgot-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: email.trim().toLowerCase() })
    });

    if (!res.ok) {
      setError("Щось пішло не так. Спробуй пізніше.");
    } else {
      setSent(true);
    }
    setLoading(false);
  }

  return (
    <div className="min-h-dvh bg-gray-950 flex items-center justify-center p-4">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-violet-600/20 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-blue-600/20 rounded-full blur-3xl" />
      </div>

      <div className="relative w-full max-w-md animate-slide-up">
        <div className="bg-gray-900/80 backdrop-blur-xl border border-gray-800 rounded-2xl p-8 shadow-2xl">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-10 h-10 bg-gradient-to-br from-violet-500 to-blue-500 rounded-xl flex items-center justify-center shadow-lg shadow-violet-500/30">
              <Zap className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-white">Personal Hub</h1>
              <p className="text-xs text-gray-400">Твій цифровий простір</p>
            </div>
          </div>

          {sent ? (
            <div className="text-center space-y-4">
              <div className="flex justify-center">
                <div className="w-14 h-14 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl flex items-center justify-center">
                  <CheckCircle className="w-7 h-7 text-emerald-400" />
                </div>
              </div>
              <h2 className="text-xl font-semibold text-white">Перевір пошту</h2>
              <p className="text-gray-400 text-sm leading-relaxed">
                Якщо акаунт з адресою <strong className="text-gray-200">{email}</strong> існує — ми
                надіслали посилання для скидання паролю. Воно діє 30 хвилин.
              </p>
              <Link
                href="/login"
                className="inline-flex items-center gap-2 text-violet-400 hover:text-violet-300 text-sm transition-colors"
              >
                <ArrowLeft className="w-4 h-4" /> Повернутись до входу
              </Link>
            </div>
          ) : (
            <>
              <h2 className="text-2xl font-semibold text-white mb-1">Забули пароль?</h2>
              <p className="text-gray-400 text-sm mb-6">
                Введи свій email — надішлемо посилання для скидання.
              </p>

              {error && (
                <div className="bg-red-500/10 border border-red-500/30 text-red-400 rounded-xl px-4 py-3 text-sm mb-4">
                  {error}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="email@example.com"
                    required
                    className="w-full bg-gray-800/50 border border-gray-700 focus:border-violet-500 text-white placeholder-gray-500 rounded-xl pl-10 pr-4 py-3 text-base outline-none transition-colors"
                  />
                </div>
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-gradient-to-r from-violet-600 to-blue-600 hover:from-violet-500 hover:to-blue-500 disabled:opacity-50 text-white rounded-xl px-4 py-3 font-medium transition-all duration-200 shadow-lg shadow-violet-500/20"
                >
                  {loading ? "Відправляємо..." : "Надіслати посилання"}
                </button>
              </form>

              <div className="mt-4 text-center">
                <Link
                  href="/login"
                  className="inline-flex items-center gap-2 text-gray-400 hover:text-white text-sm transition-colors"
                >
                  <ArrowLeft className="w-4 h-4" /> Назад до входу
                </Link>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
