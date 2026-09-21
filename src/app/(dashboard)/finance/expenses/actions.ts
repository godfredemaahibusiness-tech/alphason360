"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function createExpenseAction(formData: FormData) {
  const category = formData.get("category") as string;
  const description = (formData.get("description") as string) || null;
  const amount = Number(formData.get("amount"));
  const date = formData.get("date") as string;

  if (!category || !amount || amount <= 0 || !date) {
    return { error: "Please fill in category, amount, and date." };
  }

  await prisma.expense.create({
    data: { category, description, amount, date: new Date(date) },
  });

  revalidatePath("/finance/expenses");
  revalidatePath("/finance");
  return { error: null };
}
