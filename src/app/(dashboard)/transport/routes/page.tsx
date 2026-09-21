import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { NewRouteForm } from "@/components/transport/NewRouteForm";

export default async function RoutesPage() {
  const [routes, vehicles] = await Promise.all([
    prisma.transportRoute.findMany({
      include: { vehicle: true, _count: { select: { assignments: true } } },
      orderBy: { name: "asc" },
    }),
    prisma.vehicle.findMany({ orderBy: { registrationNumber: "asc" } }),
  ]);

  return (
    <div className="space-y-4">
      <Link href="/transport" className="text-sm text-sky-700 hover:underline">
        ← Back to Transport
      </Link>

      <div>
        <h1 className="text-xl font-bold text-slate-900">Routes</h1>
        <p className="text-sm text-slate-500">{routes.length} routes.</p>
      </div>

      <NewRouteForm vehicles={vehicles} />

      <div className="bg-white border border-slate-200 rounded-xl divide-y divide-slate-100">
        {routes.map((r) => (
          <Link
            key={r.id}
            href={`/transport/routes/${r.id}`}
            className="flex items-center justify-between gap-3 px-4 py-3 hover:bg-slate-50"
          >
            <div>
              <p className="text-sm font-medium text-slate-800">{r.name}</p>
              <p className="text-xs text-slate-400">
                {r.stops} · {r.pickupTime} – {r.dropoffTime}
                {r.vehicle ? ` · ${r.vehicle.registrationNumber}` : " · No vehicle assigned"}
              </p>
            </div>
            <span className="text-xs text-slate-500 shrink-0">{r._count.assignments} students</span>
          </Link>
        ))}
        {routes.length === 0 && (
          <p className="px-4 py-10 text-center text-sm text-slate-400">No routes yet.</p>
        )}
      </div>
    </div>
  );
}
