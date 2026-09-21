import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { formatGHS } from "@/lib/format";

const STATUS_TONES: Record<string, string> = {
  PAID: "bg-emerald-50 text-emerald-700",
  PARTIAL: "bg-amber-50 text-amber-700",
  UNPAID: "bg-rose-50 text-rose-700",
  OVERDUE: "bg-rose-100 text-rose-800",
};

const PAGE_SIZE = 25;

export default async function InvoicesPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; status?: string; page?: string }>;
}) {
  const params = await searchParams;
  const q = params.q?.trim() ?? "";
  const status = params.status ?? "";
  const page = Math.max(1, Number(params.page ?? "1") || 1);

  const where = {
    ...(status ? { status: status as "PAID" | "PARTIAL" | "UNPAID" | "OVERDUE" } : {}),
    ...(q
      ? {
          OR: [
            { invoiceNumber: { contains: q } },
            { student: { firstName: { contains: q } } },
            { student: { lastName: { contains: q } } },
            { student: { admissionNumber: { contains: q } } },
          ],
        }
      : {}),
  };

  const [invoices, total] = await Promise.all([
    prisma.invoice.findMany({
      where,
      include: { student: true },
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
    }),
    prisma.invoice.count({ where }),
  ]);

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  function pageHref(p: number) {
    const sp = new URLSearchParams();
    if (q) sp.set("q", q);
    if (status) sp.set("status", status);
    sp.set("page", String(p));
    return `/finance/invoices?${sp.toString()}`;
  }

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-xl font-bold text-slate-900">Invoices</h1>
        <p className="text-sm text-slate-500">{total} invoices</p>
      </div>

      <form className="flex flex-wrap gap-2 bg-white border border-slate-200 rounded-xl p-3">
        <input
          name="q"
          defaultValue={q}
          placeholder="Search by student or invoice number..."
          className="flex-1 min-w-[200px] rounded-lg border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500"
        />
        <select
          name="status"
          defaultValue={status}
          className="rounded-lg border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500"
        >
          <option value="">All statuses</option>
          <option value="PAID">Paid</option>
          <option value="PARTIAL">Partial</option>
          <option value="UNPAID">Unpaid</option>
          <option value="OVERDUE">Overdue</option>
        </select>
        <button
          type="submit"
          className="text-sm font-medium bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg px-4 py-2"
        >
          Filter
        </button>
      </form>

      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 text-slate-500 text-xs uppercase tracking-wide">
            <tr>
              <th className="text-left px-4 py-3 font-medium">Invoice</th>
              <th className="text-left px-4 py-3 font-medium">Student</th>
              <th className="text-left px-4 py-3 font-medium">Total</th>
              <th className="text-left px-4 py-3 font-medium">Paid</th>
              <th className="text-left px-4 py-3 font-medium">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {invoices.map((inv) => (
              <tr key={inv.id} className="hover:bg-slate-50">
                <td className="px-4 py-3">
                  <Link
                    href={`/finance/invoices/${inv.id}`}
                    className="font-medium text-slate-800 hover:text-sky-700 font-mono text-xs"
                  >
                    {inv.invoiceNumber}
                  </Link>
                </td>
                <td className="px-4 py-3 text-slate-600">
                  {inv.student.firstName} {inv.student.lastName}
                </td>
                <td className="px-4 py-3 text-slate-700">{formatGHS(inv.totalAmount)}</td>
                <td className="px-4 py-3 text-slate-500">{formatGHS(inv.amountPaid)}</td>
                <td className="px-4 py-3">
                  <span className={`text-xs font-semibold rounded-full px-2.5 py-1 ${STATUS_TONES[inv.status]}`}>
                    {inv.status}
                  </span>
                </td>
              </tr>
            ))}
            {invoices.length === 0 && (
              <tr>
                <td colSpan={5} className="px-4 py-10 text-center text-slate-400">
                  No invoices found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-between text-sm text-slate-500">
          <span>
            Page {page} of {totalPages}
          </span>
          <div className="flex gap-2">
            <Link href={pageHref(Math.max(1, page - 1))} className="px-3 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-50">
              Previous
            </Link>
            <Link href={pageHref(Math.min(totalPages, page + 1))} className="px-3 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-50">
              Next
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
