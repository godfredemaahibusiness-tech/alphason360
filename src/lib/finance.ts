import { prisma } from "@/lib/prisma";

export async function getFinanceSummary() {
  const today = new Date();
  const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);

  const [billedAgg, paidAgg, monthPaidAgg, monthExpenseAgg, unpaidCount, invoiceCount] =
    await Promise.all([
      prisma.invoice.aggregate({ _sum: { totalAmount: true } }),
      prisma.invoice.aggregate({ _sum: { amountPaid: true } }),
      prisma.payment.aggregate({
        _sum: { amount: true },
        where: { paidAt: { gte: startOfMonth } },
      }),
      prisma.expense.aggregate({
        _sum: { amount: true },
        where: { date: { gte: startOfMonth } },
      }),
      prisma.invoice.count({ where: { status: { in: ["UNPAID", "PARTIAL", "OVERDUE"] } } }),
      prisma.invoice.count(),
    ]);

  const totalBilled = billedAgg._sum.totalAmount ?? 0;
  const totalCollected = paidAgg._sum.amountPaid ?? 0;

  return {
    totalBilled,
    totalCollected,
    outstanding: totalBilled - totalCollected,
    monthCollected: monthPaidAgg._sum.amount ?? 0,
    monthExpenses: monthExpenseAgg._sum.amount ?? 0,
    unpaidCount,
    invoiceCount,
  };
}
