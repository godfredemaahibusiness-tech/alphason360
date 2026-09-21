import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { ComposeForm } from "@/components/communication/ComposeForm";

export default async function ComposePage({
  searchParams,
}: {
  searchParams: Promise<{ to?: string; subject?: string }>;
}) {
  const params = await searchParams;
  const session = await auth();

  const recipients = await prisma.user.findMany({
    where: { id: { not: session?.user.id } },
    orderBy: { name: "asc" },
    select: { id: true, name: true, role: true },
  });

  return (
    <div className="space-y-4 max-w-xl">
      <Link href="/communication/messages" className="text-sm text-sky-700 hover:underline">
        ← Back to Messages
      </Link>
      <h1 className="text-xl font-bold text-slate-900">New Message</h1>
      <ComposeForm recipients={recipients} defaultRecipientId={params.to} defaultSubject={params.subject} />
    </div>
  );
}
