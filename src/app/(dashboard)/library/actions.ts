"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function createBookAction(formData: FormData) {
  const title = formData.get("title") as string;
  const author = formData.get("author") as string;
  const category = (formData.get("category") as string) || null;
  const totalCopies = Number(formData.get("totalCopies") || 1);

  if (!title || !author || totalCopies < 1) {
    return { error: "Please provide a title, author, and at least 1 copy." };
  }

  await prisma.book.create({
    data: { title, author, category, totalCopies, availableCopies: totalCopies },
  });

  revalidatePath("/library");
  return { error: null };
}

export async function borrowBookAction(bookId: string, formData: FormData) {
  const studentId = formData.get("studentId") as string;
  if (!studentId) return { error: "Select a student." };

  const book = await prisma.book.findUnique({ where: { id: bookId } });
  if (!book) return { error: "Book not found." };
  if (book.availableCopies <= 0) return { error: "No copies available to borrow." };

  const dueDate = new Date();
  dueDate.setDate(dueDate.getDate() + 14);

  await prisma.$transaction([
    prisma.borrowRecord.create({ data: { bookId, studentId, dueDate } }),
    prisma.book.update({ where: { id: bookId }, data: { availableCopies: { decrement: 1 } } }),
  ]);

  revalidatePath(`/library/books/${bookId}`);
  revalidatePath("/library/borrowing");
  revalidatePath("/library");
  return { error: null };
}

export async function returnBookAction(borrowRecordId: string) {
  const record = await prisma.borrowRecord.findUnique({ where: { id: borrowRecordId } });
  if (!record || record.returnDate) return;

  await prisma.$transaction([
    prisma.borrowRecord.update({ where: { id: borrowRecordId }, data: { returnDate: new Date() } }),
    prisma.book.update({ where: { id: record.bookId }, data: { availableCopies: { increment: 1 } } }),
  ]);

  revalidatePath("/library/borrowing");
  revalidatePath(`/library/books/${record.bookId}`);
  revalidatePath("/library");
}
