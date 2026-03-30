"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { Lock, Zap, CheckCircle, Eye, EyeOff } from "lucide-react";

function UpdatePasswordForm() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get("token");

  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!token) router.replace("/forgot-password");
  }, [token, router]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (password !== confirm) {
      setError("Паролі не співпадають.");
      return;
    }
    setLoading(true);
    setError(null);

    const res = await fetch("/api/auth/reset-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token, password })
    });
    const data = await res.json();

    if (!res.ok) {
      setError(data.error ?? "Щось пішло не так.");
    } else {
      setDone(true);
    }
    setLoading(false);
  }

  if (!token) return null;

  return (
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

      {done ? (
        <div className="text-center space-y-4">
          <div className="flex justify-center">
            <div className="w-14 h-14 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl flex items-center justify-center">
              <CheckCircle className="w-7 h-7 text-emerald-400" />
            </div>
          </div>
          <h2 className="text-xl font-semibold text-white">Пароль змінено!</h2>
          <p className="text-gray-400 text-sm">Тепер можеш увійти з новим паролем.</p>
          <Link
            href="/login"
            className="inline-block mt-2 px-6 py-2.5 bg-violet-600 hover:bg-violet-700 text-white rounded-xl text-sm font-medium transition-colors"
          >
            Увійти
          </Link>
        </div>
      ) : (
        <>
          <h2 className="text-2xl font-semibold text-white mb-1">Новий пароль</h2>
          <p className="text-gray-400 text-sm mb-6">Введи новий пароль для свого акаунту.</p>

          {error && (
            <div className="bg-red-500/10 border border-red-500/30 text-red-400 rounded-xl px-4 py-3 text-sm mb-4">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type={showPass ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Новий пароль (мін. 8 символів)"
                required
                minLength={8}
                className="w-full bg-gray-800/50 border border-gray-700 focus:border-violet-500 text-white placeholder-gray-500 rounded-xl pl-10 pr-10 py-3 text-base outline-none transition-colors"
              />
              <button
                type="button"
                onClick={() => setShowPass(!showPass)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
              >
                {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type={showPass ? "text" : "password"}
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                placeholder="Повтори пароль"
                required
                minLength={8}
                className="w-full bg-gray-800/50 border border-gray-700 focus:border-violet-500 text-white placeholder-gray-500 rounded-xl pl-10 pr-4 py-3 text-base outline-none transition-colors"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-violet-600 to-blue-600 hover:from-violet-500 hover:to-blue-500 disabled:opacity-50 text-white rounded-xl px-4 py-3 font-medium transition-all duration-200 shadow-lg shadow-violet-500/20"
            >
              {loading ? "Збереження..." : "Зберегти пароль"}
            </button>
          </form>
        </>
      )}
    </div>
  );
}

export default function UpdatePasswordPage() {
  return (
    <div className="min-h-dvh bg-gray-950 flex items-center justify-center p-4">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-violet-600/20 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-blue-600/20 rounded-full blur-3xl" />
      </div>
      <div className="relative w-full max-w-md animate-slide-up">
        <Suspense>
          <UpdatePasswordForm />
        </Suspense>
      </div>
    </div>
  );
}
