import { prisma } from "@/lib/prisma";
import { formatGHS } from "@/lib/format";
import { NewExpenseForm } from "@/components/finance/NewExpenseForm";

export default async function ExpensesPage() {
  const expenses = await prisma.expense.findMany({
    orderBy: { date: "desc" },
    take: 50,
  });
  const total = expenses.reduce((sum, e) => sum + e.amount, 0);

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-xl font-bold text-slate-900">Expenses</h1>
        <p className="text-sm text-slate-500">
          {expenses.length} recent expenses · {formatGHS(total)} total
        </p>
      </div>

      <NewExpenseForm />

      <div className="bg-white border border-slate-200 rounded-xl divide-y divide-slate-100">
        {expenses.map((e) => (
          <div key={e.id} className="flex items-center justify-between gap-3 px-4 py-3">
            <div>
              <p className="text-sm font-medium text-slate-800">{e.category}</p>
              <p className="text-xs text-slate-400">
                {e.description ?? "—"} · {e.date.toLocaleDateString("en-GB")}
              </p>
            </div>
            <span className="text-sm font-semibold text-rose-700">{formatGHS(e.amount)}</span>
          </div>
        ))}
        {expenses.length === 0 && (
          <p className="px-4 py-10 text-center text-sm text-slate-400">No expenses recorded yet.</p>
        )}
      </div>
    </div>
  );
}
