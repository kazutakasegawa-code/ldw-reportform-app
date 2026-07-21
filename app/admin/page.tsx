import Link from "next/link";
import { Eye } from "lucide-react";
import DeleteSelectedSubmissionsButton from "./DeleteSelectedSubmissionsButton";
import LogoutButton from "./LogoutButton";
import { Container, PageShell } from "@/components/ui";
import { requireAdmin } from "@/lib/auth";
import { formatDateTimeJst } from "@/lib/date";
import { prisma } from "@/lib/prisma";
import { calculateResultDomainScores, summarizeResultScores } from "@/lib/scoring";

export default async function AdminPage() {
  await requireAdmin();
  const submissions = await prisma.submission.findMany({
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      companyName: true,
      contactName: true,
      status: true,
      createdAt: true,
      ctaClickedAt: true,
      preferredMeetingDates: true,
      checkAnswers: { select: { domain: true, score: true } }
    }
  });

  return (
    <PageShell>
      <Container className="py-8">
        <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-sm font-semibold text-gold-500">管理画面</p>
            <h1 className="text-3xl font-bold">診断申込み一覧</h1>
          </div>
          <div className="flex flex-wrap gap-2">
            <DeleteSelectedSubmissionsButton />
            <LogoutButton />
          </div>
        </div>
        <div className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-soft">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[1130px] text-left text-sm">
              <thead className="bg-navy-800 text-white">
                <tr>
                  <th className="px-4 py-3">選択</th>
                  <th className="px-4 py-3">
                    <span className="block">会社名</span>
                    <span className="block text-xs font-normal text-slate-200">担当者名</span>
                  </th>
                  <th className="px-4 py-3">送信日時</th>
                  <th className="px-4 py-3">詳細</th>
                  <th className="px-4 py-3">総合スコア</th>
                  <th className="px-4 py-3">最低スコア領域</th>
                  <th className="px-4 py-3">面談希望クリック日時</th>
                  <th className="px-4 py-3">面談希望日時</th>
                  <th className="px-4 py-3">ステータス</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {submissions.map((submission) => {
                  const resultScores = calculateResultDomainScores(submission.checkAnswers);
                  const summary = summarizeResultScores(resultScores);
                  return (
                    <tr key={submission.id} className="hover:bg-slate-50">
                      <td className="px-4 py-3">
                        <input
                          type="checkbox"
                          name="submissionIds"
                          value={submission.id}
                          aria-label={`${submission.companyName}を選択`}
                          className="h-4 w-4"
                        />
                      </td>
                      <td className="px-4 py-3">
                        <p className="font-semibold text-navy-900">{submission.companyName}</p>
                        <p className="mt-1 text-xs text-slate-600">{submission.contactName}</p>
                      </td>
                      <td className="px-4 py-3">{formatDateTimeJst(submission.createdAt)}</td>
                      <td className="px-4 py-3">
                        <Link href={`/admin/submissions/${submission.id}`} className="inline-flex items-center gap-1 font-semibold text-navy-800 underline">
                          <Eye size={16} />
                          詳細
                        </Link>
                      </td>
                      <td className="px-4 py-3 font-semibold">{summary.overallScore}点</td>
                      <td className="px-4 py-3">{summary.lowest.domain}（{summary.lowest.score}点）</td>
                      <td className="px-4 py-3">{submission.ctaClickedAt ? formatDateTimeJst(submission.ctaClickedAt) : "-"}</td>
                      <td className="max-w-[220px] whitespace-pre-line px-4 py-3 text-xs leading-6">{submission.preferredMeetingDates || "-"}</td>
                      <td className="px-4 py-3"><span className="rounded-full bg-gold-100 px-3 py-1 text-xs font-semibold">{submission.status}</span></td>
                    </tr>
                  );
                })}
                {!submissions.length ? (
                  <tr>
                    <td colSpan={9} className="px-4 py-10 text-center text-slate-500">まだ申込みはありません。</td>
                  </tr>
                ) : null}
              </tbody>
            </table>
          </div>
        </div>
      </Container>
    </PageShell>
  );
}
