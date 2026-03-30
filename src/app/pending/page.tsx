import { Clock, Mail } from "lucide-react";
import Link from "next/link";

export default function PendingPage() {
  return (
    <div className="min-h-dvh bg-gray-950 flex items-center justify-center p-4">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-violet-600/20 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-blue-600/20 rounded-full blur-3xl" />
      </div>

      <div className="relative w-full max-w-md animate-slide-up text-center">
        <div className="bg-gray-900/80 backdrop-blur-xl border border-gray-800 rounded-2xl p-10 shadow-2xl space-y-6">
          <div className="flex justify-center">
            <div className="w-16 h-16 bg-yellow-500/10 border border-yellow-500/20 rounded-2xl flex items-center justify-center">
              <Clock className="w-8 h-8 text-yellow-400" />
            </div>
          </div>

          <div className="space-y-2">
            <h1 className="text-2xl font-bold text-white">Акаунт на розгляді</h1>
            <p className="text-gray-400 text-sm leading-relaxed">
              Твою заявку отримано. Адміністратор розгляне її найближчим часом і надішле сповіщення
              на твою пошту.
            </p>
          </div>

          <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-4 flex items-start gap-3 text-left">
            <Mail className="w-4 h-4 text-violet-400 mt-0.5 flex-shrink-0" />
            <p className="text-sm text-gray-400">
              Після підтвердження ти отримаєш листа з посиланням для входу.
            </p>
          </div>

          <Link
            href="/login"
            className="inline-block text-sm text-violet-400 hover:text-violet-300 transition-colors"
          >
            ← Повернутись на сторінку входу
          </Link>
        </div>
      </div>
    </div>
  );
}
