"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { NAV_ITEMS } from "@/lib/nav";
import { SchoolCrest } from "@/components/SchoolCrest";
import { clsx } from "clsx";

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="hidden lg:flex flex-col w-64 shrink-0 border-r border-slate-200 bg-white h-screen sticky top-0 print:hidden">
      <div className="flex items-center gap-3 px-5 h-16 border-b border-slate-200">
        <SchoolCrest size={32} />
        <div className="leading-tight">
          <p className="text-sm font-bold text-slate-900">ALPHASON</p>
          <p className="text-[10px] text-slate-400 tracking-wide">INT. SCHOOL</p>
        </div>
      </div>

      <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-0.5">
        {NAV_ITEMS.map((item) => {
          const active = pathname === item.href;
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={clsx(
                "flex items-center justify-between gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors",
                active
                  ? "bg-sky-50 text-sky-700"
                  : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
              )}
            >
              <span className="flex items-center gap-2.5">
                <Icon size={17} strokeWidth={2} />
                {item.label}
              </span>
              {item.phase > 1 && (
                <span className="text-[10px] font-semibold text-slate-300 group-hover:text-slate-400">
                  P{item.phase}
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t border-slate-200">
        <p className="text-[11px] text-slate-400 leading-snug">
          ALPHSON360 · Prototype build
          <br />
          Mindseye Creation
        </p>
      </div>
    </aside>
  );
}
