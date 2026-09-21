import { prisma } from "@/lib/prisma";

export async function getFinancialReports() {
  const today = new Date();

  // Income vs expenses, last 6 months.
  const sixMonthsAgo = new Date(today.getFullYear(), today.getMonth() - 5, 1);
  const [payments, expenses] = await Promise.all([
    prisma.payment.findMany({
      where: { paidAt: { gte: sixMonthsAgo } },
      select: { amount: true, paidAt: true, method: true },
    }),
    prisma.expense.findMany({
      where: { date: { gte: sixMonthsAgo } },
      select: { amount: true, date: true },
    }),
  ]);

  const monthKey = (d: Date) => d.toLocaleDateString("en-GB", { month: "short" });
  const months: string[] = [];
  const cursor = new Date(sixMonthsAgo);
  for (let i = 0; i < 6; i++) {
    months.push(monthKey(cursor));
    cursor.setMonth(cursor.getMonth() + 1);
  }

  const incomeByMonth = new Map(months.map((m) => [m, 0]));
  const expenseByMonth = new Map(months.map((m) => [m, 0]));
  for (const p of payments) {
    const key = monthKey(p.paidAt);
    if (incomeByMonth.has(key)) incomeByMonth.set(key, (incomeByMonth.get(key) ?? 0) + p.amount);
  }
  for (const e of expenses) {
    const key = monthKey(e.date);
    if (expenseByMonth.has(key)) expenseByMonth.set(key, (expenseByMonth.get(key) ?? 0) + e.amount);
  }
  const incomeVsExpense = months.map((m) => ({
    month: m,
    income: Math.round(incomeByMonth.get(m) ?? 0),
    expenses: Math.round(expenseByMonth.get(m) ?? 0),
  }));

  // Payment method breakdown (all-time).
  const methodTotals = new Map<string, number>();
  const allPayments = await prisma.payment.findMany({ select: { amount: true, method: true } });
  for (const p of allPayments) {
    methodTotals.set(p.method, (methodTotals.get(p.method) ?? 0) + p.amount);
  }
  const byMethod = Array.from(methodTotals.entries()).map(([method, amount]) => ({
    method,
    amount: Math.round(amount),
  }));

  // Outstanding balance by class.
  const invoices = await prisma.invoice.findMany({
    include: { student: { include: { enrollments: { include: { class: true }, take: 1 } } } },
  });
  const outstandingByClass = new Map<string, number>();
  for (const inv of invoices) {
    const balance = inv.totalAmount - inv.amountPaid;
    if (balance <= 0) continue;
    const className = inv.student.enrollments[0]?.class.name ?? "Unassigned";
    outstandingByClass.set(className, (outstandingByClass.get(className) ?? 0) + balance);
  }
  const byClass = Array.from(outstandingByClass.entries())
    .map(([className, amount]) => ({ className, amount: Math.round(amount) }))
    .sort((a, b) => b.amount - a.amount);

  const totalExpenses = expenses.reduce((sum, e) => sum + e.amount, 0);
  const totalIncome = payments.reduce((sum, p) => sum + p.amount, 0);

  return { incomeVsExpense, byMethod, byClass, totalIncome, totalExpenses };
}
