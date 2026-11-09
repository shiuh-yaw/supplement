import { notFound } from "next/navigation";
import { prisma } from "@supplement/db";
import { RuleForm } from "@/components/RuleForm";
import { ReviewPanel } from "@/components/ReviewPanel";
import { StatusBadge } from "@/components/Badges";
import { can, requireUser } from "@/lib/auth";

export const dynamic = "force-dynamic";

export default async function RulePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const user = await requireUser();
  const [rule, supplements] = await Promise.all([
    prisma.rule.findUnique({ where: { id }, include: { createdBy: true, reviewedBy: true } }),
    prisma.supplement.findMany({ select: { id: true, name: true }, orderBy: { sortOrder: "asc" } }),
  ]);
  if (!rule) notFound();
  const isReviewer = can(user.role, "rules:publish");

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center gap-3">
        <h1 className="text-2xl font-bold">{rule.name}</h1>
        <StatusBadge status={rule.status} />
      </div>
      <p className="text-xs text-slate-500">
        Created by {rule.createdBy?.name ?? "—"}
        {rule.reviewedBy && <> · Last reviewed by {rule.reviewedBy.name} on {rule.reviewedAt?.toLocaleDateString()}</>}
        {rule.reviewNote && <> · Note: “{rule.reviewNote}”</>}
      </p>
      <ReviewPanel id={rule.id} status={rule.status} isReviewer={isReviewer} />
      <RuleForm
        rule={{ ...rule, condition: rule.condition }}
        supplements={supplements}
        readOnly={rule.status === "PUBLISHED" && !isReviewer}
      />
    </div>
  );
}
