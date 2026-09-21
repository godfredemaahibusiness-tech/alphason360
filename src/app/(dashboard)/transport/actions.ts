"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function createVehicleAction(formData: FormData) {
  const registrationNumber = formData.get("registrationNumber") as string;
  const vehicleType = formData.get("vehicleType") as string;
  const capacity = Number(formData.get("capacity"));
  const driverName = formData.get("driverName") as string;
  const driverPhone = formData.get("driverPhone") as string;

  if (!registrationNumber || !vehicleType || !capacity || !driverName || !driverPhone) {
    return { error: "Please fill in all fields." };
  }

  await prisma.vehicle.create({
    data: { registrationNumber, vehicleType, capacity, driverName, driverPhone },
  });

  revalidatePath("/transport/vehicles");
  revalidatePath("/transport");
  return { error: null };
}

export async function createRouteAction(formData: FormData) {
  const name = formData.get("name") as string;
  const stops = formData.get("stops") as string;
  const pickupTime = formData.get("pickupTime") as string;
  const dropoffTime = formData.get("dropoffTime") as string;
  const vehicleId = (formData.get("vehicleId") as string) || null;

  if (!name || !stops || !pickupTime || !dropoffTime) {
    return { error: "Please fill in the route name, stops, and times." };
  }

  await prisma.transportRoute.create({
    data: { name, stops, pickupTime, dropoffTime, vehicleId },
  });

  revalidatePath("/transport/routes");
  revalidatePath("/transport");
  return { error: null };
}

export async function assignStudentToRouteAction(routeId: string, formData: FormData) {
  const studentId = formData.get("studentId") as string;
  if (!studentId) return { error: "Select a student." };

  await prisma.studentTransport.upsert({
    where: { studentId },
    create: { studentId, routeId },
    update: { routeId },
  });

  revalidatePath(`/transport/routes/${routeId}`);
  return { error: null };
}

export async function removeStudentFromRouteAction(studentId: string, routeId: string) {
  await prisma.studentTransport.delete({ where: { studentId } });
  revalidatePath(`/transport/routes/${routeId}`);
}
