import Link from "next/link";
import { Wallet, Receipt, TrendingDown, BarChart3 } from "lucide-react";
import { getFinanceSummary } from "@/lib/finance";
import { formatGHS } from "@/lib/format";
import { StatCard } from "@/components/StatCard";

export default async function FinancePage() {
  const s = await getFinanceSummary();

  const cards = [
    {
      href: "/finance/invoices",
      icon: Receipt,
      title: "Invoices & Payments",
      description: `${s.invoiceCount} invoices · ${s.unpaidCount} with a balance due.`,
      tone: "bg-sky-50 text-sky-700",
    },
    {
      href: "/finance/fee-structure",
      icon: Wallet,
      title: "Fee Structure",
      description: "Manage tuition and other fee items by class.",
      tone: "bg-violet-50 text-violet-700",
    },
    {
      href: "/finance/expenses",
      icon: TrendingDown,
      title: "Expenses",
      description: `${formatGHS(s.monthExpenses)} recorded this month.`,
      tone: "bg-amber-50 text-amber-700",
    },
    {
      href: "/finance/reports",
      icon: BarChart3,
      title: "Financial Reports",
      description: "Collection trends, outstanding balances, income vs. expenses.",
      tone: "bg-emerald-50 text-emerald-700",
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-slate-900">Finance</h1>
        <p className="text-sm text-slate-500">School fees, payments, and expenses.</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Total Billed" value={formatGHS(s.totalBilled)} icon={Receipt} tone="sky" />
        <StatCard label="Total Collected" value={formatGHS(s.totalCollected)} icon={Wallet} tone="emerald" />
        <StatCard label="Outstanding" value={formatGHS(s.outstanding)} icon={TrendingDown} tone="rose" />
        <StatCard
          label="This Month"
          value={formatGHS(s.monthCollected)}
          sublabel={`${formatGHS(s.monthExpenses)} in expenses`}
          icon={BarChart3}
          tone="amber"
        />
      </div>

      <div className="grid sm:grid-cols-2 gap-4">
        {cards.map((c) => (
          <Link
            key={c.href}
            href={c.href}
            className="bg-white border border-slate-200 rounded-xl p-5 hover:border-sky-300 transition-colors"
          >
            <div className={`w-10 h-10 rounded-lg ${c.tone} flex items-center justify-center mb-3`}>
              <c.icon size={18} />
            </div>
            <h2 className="text-sm font-semibold text-slate-800">{c.title}</h2>
            <p className="text-xs text-slate-500 mt-1">{c.description}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
