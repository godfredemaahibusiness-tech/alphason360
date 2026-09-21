import Link from "next/link";
import { Bus, Route as RouteIcon } from "lucide-react";
import { prisma } from "@/lib/prisma";

export default async function TransportPage() {
  const [vehicleCount, routeCount, assignedCount] = await Promise.all([
    prisma.vehicle.count(),
    prisma.transportRoute.count(),
    prisma.studentTransport.count(),
  ]);

  const cards = [
    {
      href: "/transport/vehicles",
      icon: Bus,
      title: "Vehicles",
      description: `${vehicleCount} vehicles registered.`,
      tone: "bg-sky-50 text-sky-700",
    },
    {
      href: "/transport/routes",
      icon: RouteIcon,
      title: "Routes",
      description: `${routeCount} routes · ${assignedCount} students assigned.`,
      tone: "bg-violet-50 text-violet-700",
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-slate-900">Transport</h1>
        <p className="text-sm text-slate-500">School buses, routes, and student assignments.</p>
      </div>

      <div className="grid sm:grid-cols-2 gap-4">
        {cards.map((c) => (
          <Link
            key={c.href}
            href={c.href}
            className="bg-white border border-slate-200 rounded-xl p-5 hover:border-sky-300 transition-colors"
          >
            <div className={`w-10 h-10 rounded-lg ${c.tone} flex items-center justify-center mb-3`}>
              <c.icon size={18} />
            </div>
            <h2 className="text-sm font-semibold text-slate-800">{c.title}</h2>
            <p className="text-xs text-slate-500 mt-1">{c.description}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
