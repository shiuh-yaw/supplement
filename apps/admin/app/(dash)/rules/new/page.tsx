import { prisma } from "@supplement/db";
import { RuleForm } from "@/components/RuleForm";

export default async function NewRulePage() {
  const supplements = await prisma.supplement.findMany({ select: { id: true, name: true }, orderBy: { sortOrder: "asc" } });
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">New rule</h1>
      <p className="text-sm text-slate-600">New rules start as drafts and only go live after a reviewer approves them.</p>
      <RuleForm supplements={supplements} />
    </div>
  );
}
