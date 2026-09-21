import { getFinancialReports } from "@/lib/financeReports";
import { formatGHS } from "@/lib/format";
import { IncomeExpenseChart } from "@/components/finance/IncomeExpenseChart";
import { ExportCsvButton } from "@/components/finance/ExportCsvButton";

export default async function FinancialReportsPage() {
  const { incomeVsExpense, byMethod, byClass, totalIncome, totalExpenses } = await getFinancialReports();
  const maxMethod = Math.max(...byMethod.map((m) => m.amount), 1);
  const maxClass = Math.max(...byClass.map((c) => c.amount), 1);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-slate-900">Financial Reports</h1>
        <p className="text-sm text-slate-500">Last 6 months, unless noted otherwise.</p>
      </div>

      <div className="grid sm:grid-cols-3 gap-4">
        <div className="bg-white border border-slate-200 rounded-xl p-4">
          <p className="text-xs text-slate-400">Income (6 months)</p>
          <p className="text-xl font-bold text-emerald-700 mt-1">{formatGHS(totalIncome)}</p>
        </div>
        <div className="bg-white border border-slate-200 rounded-xl p-4">
          <p className="text-xs text-slate-400">Expenses (6 months)</p>
          <p className="text-xl font-bold text-rose-700 mt-1">{formatGHS(totalExpenses)}</p>
        </div>
        <div className="bg-white border border-slate-200 rounded-xl p-4">
          <p className="text-xs text-slate-400">Net</p>
          <p className="text-xl font-bold text-slate-900 mt-1">{formatGHS(totalIncome - totalExpenses)}</p>
        </div>
      </div>

      <div className="bg-white border border-slate-200 rounded-xl p-4 sm:p-5">
        <h2 className="text-sm font-semibold text-slate-800 mb-2">Income vs. Expenses</h2>
        <IncomeExpenseChart data={incomeVsExpense} />
      </div>

      <div className="grid lg:grid-cols-2 gap-4">
        <div className="bg-white border border-slate-200 rounded-xl p-4 sm:p-5">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-semibold text-slate-800">Collections by Payment Method</h2>
            <ExportCsvButton
              filename="payment-methods.csv"
              headers={["Method", "Amount (GHS)"]}
              rows={byMethod.map((m) => [m.method, m.amount])}
            />
          </div>
          <div className="space-y-3">
            {byMethod.map((m) => (
              <div key={m.method}>
                <div className="flex justify-between text-xs text-slate-500 mb-1">
                  <span>{m.method}</span>
                  <span className="font-medium text-slate-700">{formatGHS(m.amount)}</span>
                </div>
                <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-sky-600 rounded-full"
                    style={{ width: `${(m.amount / maxMethod) * 100}%` }}
                  />
                </div>
              </div>
            ))}
            {byMethod.length === 0 && <p className="text-sm text-slate-400">No payments recorded.</p>}
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-4 sm:p-5">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-semibold text-slate-800">Outstanding Balance by Class</h2>
            <ExportCsvButton
              filename="outstanding-by-class.csv"
              headers={["Class", "Outstanding (GHS)"]}
              rows={byClass.map((c) => [c.className, c.amount])}
            />
          </div>
          <div className="space-y-3 max-h-64 overflow-y-auto pr-1">
            {byClass.map((c) => (
              <div key={c.className}>
                <div className="flex justify-between text-xs text-slate-500 mb-1">
                  <span>{c.className}</span>
                  <span className="font-medium text-slate-700">{formatGHS(c.amount)}</span>
                </div>
                <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-rose-500 rounded-full"
                    style={{ width: `${(c.amount / maxClass) * 100}%` }}
                  />
                </div>
              </div>
            ))}
            {byClass.length === 0 && (
              <p className="text-sm text-slate-400">No outstanding balances. 🎉</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
