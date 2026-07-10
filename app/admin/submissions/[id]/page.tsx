import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import DetailEditor from "./DetailEditor";
import { Container, PageShell } from "@/components/ui";
import { requireAdmin } from "@/lib/auth";
import { formatDateTimeJst } from "@/lib/date";
import { prisma } from "@/lib/prisma";
import { buildAnalysisPrompt } from "@/lib/prompt";
import { calculateDomainScores, calculateOverallAverage, recommendPlan } from "@/lib/scoring";

export default async function SubmissionDetailPage({ params }: { params: Promise<{ id: string }> }) {
  await requireAdmin();
  const { id } = await params;
  const submission = await prisma.submission.findUnique({
    where: { id },
    include: { checkAnswers: { orderBy: { questionNo: "asc" } }, analysisResult: true }
  });
  if (!submission) notFound();

  const domainScores = calculateDomainScores(submission.checkAnswers);
  const overall = calculateOverallAverage(domainScores);
  const recommendation = recommendPlan(domainScores);
  const prompt = buildAnalysisPrompt(submission);

  return (
    <PageShell>
      <Container className="py-8">
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <Link href="/admin" className="mb-3 inline-flex items-center gap-1 text-sm font-semibold text-navy-800 underline">
              <ArrowLeft size={16} />
              一覧へ戻る
            </Link>
            <h1 className="text-3xl font-bold">{submission.companyName}</h1>
            <p className="mt-1 text-sm text-slate-600">{submission.contactName} / {formatDateTimeJst(submission.createdAt)}</p>
          </div>
          <Link href={`/admin/submissions/${submission.id}/report`} className="inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-gold-500 px-5 py-2.5 text-sm font-semibold text-navy-900 hover:bg-gold-300">
            保存済みレポート表示
          </Link>
        </div>

        <DetailEditor submission={submission} domainScores={domainScores} overall={overall} recommendation={recommendation} prompt={prompt} />
      </Container>
    </PageShell>
  );
}
