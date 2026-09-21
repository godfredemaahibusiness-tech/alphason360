import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { formatGHS } from "@/lib/format";
import { RecordPaymentForm } from "@/components/finance/RecordPaymentForm";

const STATUS_TONES: Record<string, string> = {
  PAID: "bg-emerald-50 text-emerald-700",
  PARTIAL: "bg-amber-50 text-amber-700",
  UNPAID: "bg-rose-50 text-rose-700",
  OVERDUE: "bg-rose-100 text-rose-800",
};

export default async function InvoiceDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const invoice = await prisma.invoice.findUnique({
    where: { id },
    include: {
      student: { include: { enrollments: { include: { class: true }, take: 1 } } },
      payments: { orderBy: { paidAt: "desc" } },
    },
  });
  if (!invoice) notFound();

  const balance = invoice.totalAmount - invoice.amountPaid;
  const studentClass = invoice.student.enrollments[0]?.class.name;

  return (
    <div className="space-y-4 max-w-2xl">
      <Link href="/finance/invoices" className="text-sm text-sky-700 hover:underline">
        ← Back to Invoices
      </Link>

      <div className="bg-white border border-slate-200 rounded-xl p-5">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-xs text-slate-400 font-mono">{invoice.invoiceNumber}</p>
            <h1 className="text-lg font-bold text-slate-900 mt-0.5">
              {invoice.student.firstName} {invoice.student.lastName}
            </h1>
            <p className="text-sm text-slate-500">
              {studentClass ?? "Unassigned"} · {invoice.termName}
            </p>
          </div>
          <span className={`text-xs font-semibold rounded-full px-3 py-1 ${STATUS_TONES[invoice.status]}`}>
            {invoice.status}
          </span>
        </div>

        <div className="grid grid-cols-3 gap-3 mt-4">
          <div className="bg-slate-50 rounded-lg px-3 py-2">
            <p className="text-xs text-slate-400">Total</p>
            <p className="text-sm font-bold text-slate-900">{formatGHS(invoice.totalAmount)}</p>
          </div>
          <div className="bg-slate-50 rounded-lg px-3 py-2">
            <p className="text-xs text-slate-400">Paid</p>
            <p className="text-sm font-bold text-emerald-700">{formatGHS(invoice.amountPaid)}</p>
          </div>
          <div className="bg-slate-50 rounded-lg px-3 py-2">
            <p className="text-xs text-slate-400">Balance</p>
            <p className="text-sm font-bold text-rose-700">{formatGHS(balance)}</p>
          </div>
        </div>
      </div>

      <div className="bg-white border border-slate-200 rounded-xl p-5">
        <h2 className="text-sm font-semibold text-slate-800 mb-3">Record Payment</h2>
        <RecordPaymentForm invoiceId={invoice.id} balance={balance} />
      </div>

      <div className="bg-white border border-slate-200 rounded-xl p-5">
        <h2 className="text-sm font-semibold text-slate-800 mb-3">Payment History</h2>
        <div className="divide-y divide-slate-100">
          {invoice.payments.map((p) => (
            <div key={p.id} className="flex items-center justify-between py-2.5 text-sm">
              <div>
                <p className="text-slate-700">{p.method}</p>
                <p className="text-xs text-slate-400">
                  {p.paidAt.toLocaleDateString("en-GB")}
                  {p.transactionId ? ` · ${p.transactionId}` : ""}
                </p>
              </div>
              <div className="flex items-center gap-3">
                <span className="font-medium text-slate-800">{formatGHS(p.amount)}</span>
                <Link
                  href={`/finance/invoices/${invoice.id}/receipt?paymentId=${p.id}`}
                  className="text-xs text-sky-700 hover:underline"
                >
                  Receipt
                </Link>
              </div>
            </div>
          ))}
          {invoice.payments.length === 0 && (
            <p className="py-6 text-center text-sm text-slate-400">No payments recorded yet.</p>
          )}
        </div>
      </div>
    </div>
  );
}
