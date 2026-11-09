import { notFound } from "next/navigation";
import { prisma } from "@supplement/db";
import { SupplementForm } from "@/components/SupplementForm";
import { can, requireUser } from "@/lib/auth";

export const dynamic = "force-dynamic";

export default async function SupplementPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const user = await requireUser();
  const s = await prisma.supplement.findUnique({ where: { id } });
  if (!s) notFound();
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">{s.name}</h1>
      <SupplementForm s={s} isReviewer={can(user.role, "rules:publish")} />
    </div>
  );
}
