"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function recordPaymentAction(invoiceId: string, formData: FormData) {
  const amount = Number(formData.get("amount"));
  const method = formData.get("method") as string;
  const transactionId = (formData.get("transactionId") as string) || null;

  if (!amount || amount <= 0) {
    return { error: "Enter a valid payment amount." };
  }

  const invoice = await prisma.invoice.findUnique({ where: { id: invoiceId } });
  if (!invoice) return { error: "Invoice not found." };

  const payment = await prisma.payment.create({
    data: { invoiceId, amount, method, transactionId },
  });

  const newAmountPaid = invoice.amountPaid + amount;
  const status = newAmountPaid >= invoice.totalAmount ? "PAID" : newAmountPaid > 0 ? "PARTIAL" : "UNPAID";

  await prisma.invoice.update({
    where: { id: invoiceId },
    data: { amountPaid: newAmountPaid, status },
  });

  await prisma.activityLog.create({
    data: {
      message: `Payment of GH₵ ${amount.toLocaleString()} recorded against invoice ${invoice.invoiceNumber}`,
      actorName: "Accounts Office",
    },
  });

  revalidatePath(`/finance/invoices/${invoiceId}`);
  revalidatePath("/finance/invoices");
  revalidatePath("/finance");
  revalidatePath("/");
  return { error: null, paymentId: payment.id };
}
