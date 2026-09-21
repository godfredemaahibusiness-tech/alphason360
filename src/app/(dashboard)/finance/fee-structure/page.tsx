import { prisma } from "@/lib/prisma";
import { formatGHS } from "@/lib/format";
import { NewFeeItemForm } from "@/components/finance/NewFeeItemForm";
import { DeleteFeeItemButton } from "@/components/finance/DeleteFeeItemButton";

export default async function FeeStructurePage() {
  const [feeItems, classes] = await Promise.all([
    prisma.feeItem.findMany({
      include: { class: true },
      orderBy: [{ classId: "asc" }, { name: "asc" }],
    }),
    prisma.schoolClass.findMany({ orderBy: { order: "asc" } }),
  ]);

  return (
    <div className="space-y-4 max-w-2xl">
      <div>
        <h1 className="text-xl font-bold text-slate-900">Fee Structure</h1>
        <p className="text-sm text-slate-500">Fee items charged per class, per term.</p>
      </div>

      <NewFeeItemForm classes={classes} />

      <div className="bg-white border border-slate-200 rounded-xl divide-y divide-slate-100">
        {feeItems.map((f) => (
          <div key={f.id} className="flex items-center justify-between gap-3 px-4 py-3">
            <div>
              <p className="text-sm font-medium text-slate-800">{f.name}</p>
              <p className="text-xs text-slate-400">{f.class?.name ?? "All classes"}</p>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-sm font-semibold text-slate-800">{formatGHS(f.amount)}</span>
              <DeleteFeeItemButton id={f.id} />
            </div>
          </div>
        ))}
        {feeItems.length === 0 && (
          <p className="px-4 py-10 text-center text-sm text-slate-400">No fee items yet.</p>
        )}
      </div>
    </div>
  );
}
