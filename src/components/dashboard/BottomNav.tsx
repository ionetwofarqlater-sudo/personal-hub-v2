"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, BookMarked, User, Settings, ShieldCheck } from "lucide-react";
import type { Session } from "next-auth";

const navItems = [
  { href: "/dashboard", icon: LayoutDashboard, label: "Головна" },
  { href: "/dashboard/saved", icon: BookMarked, label: "Saved" },
  { href: "/dashboard/profile", icon: User, label: "Профіль" },
  { href: "/dashboard/settings", icon: Settings, label: "Налаштування" }
];

export default function BottomNav({ session }: { session: Session }) {
  const pathname = usePathname();
  const isAdmin = (session.user as { role?: string }).role === "admin";

  const items = isAdmin
    ? [...navItems, { href: "/dashboard/admin", icon: ShieldCheck, label: "Адмін" }]
    : navItems;

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-50 sm:hidden bg-gray-950/90 backdrop-blur-xl border-t border-gray-800/60"
      style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
    >
      <div className="flex items-center justify-around px-2 h-14">
        {items.map(({ href, icon: Icon, label }) => {
          const active = pathname === href || (href !== "/dashboard" && pathname.startsWith(href));
          return (
            <Link
              key={href}
              href={href}
              className={`flex flex-col items-center justify-center gap-0.5 flex-1 h-full transition-colors ${
                active ? "text-violet-400" : "text-gray-500 hover:text-gray-300"
              }`}
            >
              <Icon className="w-5 h-5" />
              <span className="text-[10px] leading-none">{label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
