import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { NewVehicleForm } from "@/components/transport/NewVehicleForm";

export default async function VehiclesPage() {
  const vehicles = await prisma.vehicle.findMany({
    include: { _count: { select: { routes: true } } },
    orderBy: { registrationNumber: "asc" },
  });

  return (
    <div className="space-y-4">
      <Link href="/transport" className="text-sm text-sky-700 hover:underline">
        ← Back to Transport
      </Link>

      <div>
        <h1 className="text-xl font-bold text-slate-900">Vehicles</h1>
        <p className="text-sm text-slate-500">{vehicles.length} vehicles registered.</p>
      </div>

      <NewVehicleForm />

      <div className="bg-white border border-slate-200 rounded-xl divide-y divide-slate-100">
        {vehicles.map((v) => (
          <div key={v.id} className="flex items-center justify-between gap-3 px-4 py-3">
            <div>
              <p className="text-sm font-medium text-slate-800">{v.registrationNumber}</p>
              <p className="text-xs text-slate-400">
                {v.vehicleType} · {v.capacity} seats · {v.driverName} ({v.driverPhone})
              </p>
            </div>
            <span className="text-xs text-slate-500">{v._count.routes} route(s)</span>
          </div>
        ))}
        {vehicles.length === 0 && (
          <p className="px-4 py-10 text-center text-sm text-slate-400">No vehicles registered yet.</p>
        )}
      </div>
    </div>
  );
}
