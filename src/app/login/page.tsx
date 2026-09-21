import { LoginForm } from "./LoginForm";
import { SchoolCrest } from "@/components/SchoolCrest";
import { prisma } from "@/lib/prisma";
import { ROLE_LABELS } from "@/lib/roles";

export default async function LoginPage() {
  const demoUsers = await prisma.user.findMany({
    where: { isDemo: true },
    orderBy: { role: "asc" },
    select: { email: true, role: true, name: true },
  });

  // One representative demo account per role, for pitch/demo convenience.
  const seen = new Set<string>();
  const demoAccounts = demoUsers.filter((u) => {
    if (seen.has(u.role)) return false;
    seen.add(u.role);
    return true;
  });

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="w-full max-w-4xl grid md:grid-cols-2 rounded-2xl shadow-xl overflow-hidden bg-white">
        <div className="hidden md:flex flex-col justify-between bg-gradient-to-br from-sky-700 to-sky-900 text-white p-10">
          <div>
            <SchoolCrest size={64} />
            <h1 className="mt-6 text-2xl font-bold leading-tight">
              Alphason International School
            </h1>
            <p className="text-sky-200 text-sm mt-1">Oduman, Accra, Ghana</p>
          </div>
          <div>
            <p className="text-sky-100 text-lg font-medium leading-snug">
              Empowering Every Learner. Building Tomorrow&apos;s Leaders.
            </p>
            <p className="text-sky-300 text-xs mt-6">
              ALPHSON360 — The Complete School Management System
            </p>
          </div>
        </div>

        <div className="p-8 sm:p-10">
          <div className="md:hidden flex items-center gap-3 mb-8">
            <SchoolCrest size={40} />
            <div>
              <p className="font-bold text-slate-900 leading-none">Alphason International School</p>
              <p className="text-xs text-slate-500">Oduman, Accra</p>
            </div>
          </div>

          <h2 className="text-xl font-semibold text-slate-900">Sign in</h2>
          <p className="text-sm text-slate-500 mt-1 mb-6">
            Access your ALPHSON360 dashboard
          </p>

          <LoginForm />

          <div className="mt-8 pt-6 border-t border-slate-100">
            <p className="text-xs font-medium text-slate-400 uppercase tracking-wide mb-3">
              Demo accounts (prototype)
            </p>
            <div className="space-y-1.5 max-h-40 overflow-y-auto pr-1">
              {demoAccounts.map((u) => (
                <div
                  key={u.email}
                  className="flex items-center justify-between text-xs bg-slate-50 rounded-md px-2.5 py-1.5"
                >
                  <span className="text-slate-600">{ROLE_LABELS[u.role]}</span>
                  <span className="font-mono text-slate-500">{u.email}</span>
                </div>
              ))}
              {demoAccounts.length === 0 && (
                <p className="text-xs text-slate-400">
                  Run the seed script to create demo accounts.
                </p>
              )}
            </div>
            <p className="text-xs text-slate-400 mt-2">
              Password for every demo account: <span className="font-mono">demo1234</span>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
