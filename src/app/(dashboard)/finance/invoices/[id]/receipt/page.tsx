import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { formatGHS } from "@/lib/format";
import { SchoolCrest } from "@/components/SchoolCrest";
import { PrintButton } from "@/components/academics/PrintButton";

export default async function ReceiptPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ paymentId?: string }>;
}) {
  const { id } = await params;
  const { paymentId } = await searchParams;

  const invoice = await prisma.invoice.findUnique({
    where: { id },
    include: {
      student: { include: { enrollments: { include: { class: true }, take: 1 } } },
      payments: { orderBy: { paidAt: "desc" } },
    },
  });
  if (!invoice) notFound();

  const payment = paymentId
    ? invoice.payments.find((p) => p.id === paymentId)
    : invoice.payments[0];
  if (!payment) notFound();

  const studentClass = invoice.student.enrollments[0]?.class.name;

  return (
    <div className="space-y-4 max-w-xl">
      <div className="flex items-center justify-between print:hidden">
        <Link href={`/finance/invoices/${invoice.id}`} className="text-sm text-sky-700 hover:underline">
          ← Back to Invoice
        </Link>
        <PrintButton />
      </div>

      <div className="bg-white border border-slate-200 rounded-xl p-6 sm:p-8 print:border-none print:shadow-none">
        <div className="flex items-center gap-4 border-b border-slate-200 pb-4">
          <SchoolCrest size={44} />
          <div>
            <h1 className="text-base font-bold text-slate-900">Alphason International School</h1>
            <p className="text-xs text-slate-500">Oduman, Accra, Ghana</p>
          </div>
          <div className="ml-auto text-right">
            <p className="text-sm font-semibold text-slate-800">Payment Receipt</p>
            <p className="text-xs text-slate-400 font-mono">{invoice.invoiceNumber}</p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-y-1 text-sm py-4 border-b border-slate-100">
          <p>
            <span className="text-slate-400">Received from:</span>{" "}
            <span className="font-medium text-slate-800">
              {invoice.student.firstName} {invoice.student.lastName}
            </span>
          </p>
          <p>
            <span className="text-slate-400">Class:</span>{" "}
            <span className="font-medium text-slate-800">{studentClass ?? "—"}</span>
          </p>
          <p>
            <span className="text-slate-400">Admission No.:</span>{" "}
            <span className="font-medium text-slate-800">{invoice.student.admissionNumber}</span>
          </p>
          <p>
            <span className="text-slate-400">Term:</span>{" "}
            <span className="font-medium text-slate-800">{invoice.termName}</span>
          </p>
        </div>

        <div className="py-4 space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-slate-400">Payment date</span>
            <span className="font-medium text-slate-800">{payment.paidAt.toLocaleDateString("en-GB")}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-400">Payment method</span>
            <span className="font-medium text-slate-800">{payment.method}</span>
          </div>
          {payment.transactionId && (
            <div className="flex justify-between">
              <span className="text-slate-400">Transaction ID</span>
              <span className="font-medium text-slate-800 font-mono">{payment.transactionId}</span>
            </div>
          )}
        </div>

        <div className="flex items-center justify-between pt-4 border-t border-slate-200">
          <p className="text-sm font-semibold text-slate-800">Amount Paid</p>
          <p className="text-xl font-bold text-emerald-700">{formatGHS(payment.amount)}</p>
        </div>

        <div className="flex items-center justify-between mt-2 text-xs text-slate-400">
          <span>Invoice total: {formatGHS(invoice.totalAmount)}</span>
          <span>Balance: {formatGHS(invoice.totalAmount - invoice.amountPaid)}</span>
        </div>

        <p className="text-center text-xs text-slate-300 mt-8">
          This is a computer-generated receipt from ALPHSON360.
        </p>
      </div>
    </div>
  );
}
