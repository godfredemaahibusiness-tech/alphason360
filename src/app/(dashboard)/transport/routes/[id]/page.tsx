import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { AssignStudentForm } from "@/components/transport/AssignStudentForm";
import { RemoveStudentButton } from "@/components/transport/RemoveStudentButton";

export default async function RouteDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const route = await prisma.transportRoute.findUnique({
    where: { id },
    include: {
      vehicle: true,
      assignments: { include: { student: true }, orderBy: { student: { lastName: "asc" } } },
    },
  });
  if (!route) notFound();

  const unassignedStudents = await prisma.student.findMany({
    where: { status: "ACTIVE", transportAssignment: null },
    orderBy: { lastName: "asc" },
    select: { id: true, firstName: true, lastName: true, admissionNumber: true },
  });

  const studentOptions = unassignedStudents.map((s) => ({
    id: s.id,
    name: `${s.firstName} ${s.lastName}`,
    admissionNumber: s.admissionNumber,
  }));

  return (
    <div className="space-y-4 max-w-2xl">
      <Link href="/transport/routes" className="text-sm text-sky-700 hover:underline">
        ← Back to Routes
      </Link>

      <div className="bg-white border border-slate-200 rounded-xl p-5">
        <h1 className="text-lg font-bold text-slate-900">{route.name}</h1>
        <p className="text-sm text-slate-500 mt-1">{route.stops}</p>
        <p className="text-sm text-slate-600 mt-2">
          Pickup {route.pickupTime} · Drop-off {route.dropoffTime}
        </p>
        <p className="text-sm text-slate-600 mt-1">
          Vehicle: {route.vehicle ? `${route.vehicle.registrationNumber} (${route.vehicle.driverName})` : "Not assigned"}
        </p>
      </div>

      <div className="bg-white border border-slate-200 rounded-xl p-5">
        <h2 className="text-sm font-semibold text-slate-800 mb-3">Assign Student</h2>
        <AssignStudentForm routeId={route.id} students={studentOptions} />
      </div>

      <div className="bg-white border border-slate-200 rounded-xl divide-y divide-slate-100">
        {route.assignments.map((a) => (
          <div key={a.id} className="flex items-center justify-between gap-3 px-4 py-3">
            <div>
              <p className="text-sm font-medium text-slate-800">
                {a.student.firstName} {a.student.lastName}
              </p>
              <p className="text-xs text-slate-400 font-mono">{a.student.admissionNumber}</p>
            </div>
            <RemoveStudentButton studentId={a.studentId} routeId={route.id} />
          </div>
        ))}
        {route.assignments.length === 0 && (
          <p className="px-4 py-10 text-center text-sm text-slate-400">No students assigned to this route.</p>
        )}
      </div>
    </div>
  );
}
