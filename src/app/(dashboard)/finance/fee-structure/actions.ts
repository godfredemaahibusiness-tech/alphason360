"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function createFeeItemAction(formData: FormData) {
  const name = formData.get("name") as string;
  const amount = Number(formData.get("amount"));
  const classId = (formData.get("classId") as string) || null;

  if (!name || !amount || amount <= 0) {
    return { error: "Please provide a name and a positive amount." };
  }

  await prisma.feeItem.create({ data: { name, amount, classId } });
  revalidatePath("/finance/fee-structure");
  return { error: null };
}

export async function deleteFeeItemAction(id: string) {
  await prisma.feeItem.delete({ where: { id } });
  revalidatePath("/finance/fee-structure");
}
