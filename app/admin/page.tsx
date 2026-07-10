import Link from "next/link";
import { Eye } from "lucide-react";
import { Container, PageShell } from "@/components/ui";
import { requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export default async function AdminPage() {
  await requireAdmin();
  const submissions = await prisma.submission.findMany({
    orderBy: { createdAt: "desc" },
    select: { id: true, companyName: true, contactName: true, status: true, createdAt: true }
  });

  return (
    <PageShell>
      <Container className="py-8">
        <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-sm font-semibold text-gold-500">管理画面</p>
            <h1 className="text-3xl font-bold">診断申込み一覧</h1>
          </div>
        </div>
        <div className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-soft">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[720px] text-left text-sm">
              <thead className="bg-navy-800 text-white">
                <tr>
                  <th className="px-4 py-3">会社名</th>
                  <th className="px-4 py-3">担当者名</th>
                  <th className="px-4 py-3">送信日時</th>
                  <th className="px-4 py-3">ステータス</th>
                  <th className="px-4 py-3">詳細</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {submissions.map((submission) => (
                  <tr key={submission.id} className="hover:bg-slate-50">
                    <td className="px-4 py-3 font-semibold">{submission.companyName}</td>
                    <td className="px-4 py-3">{submission.contactName}</td>
                    <td className="px-4 py-3">{submission.createdAt.toLocaleString("ja-JP")}</td>
                    <td className="px-4 py-3"><span className="rounded-full bg-gold-100 px-3 py-1 text-xs font-semibold">{submission.status}</span></td>
                    <td className="px-4 py-3">
                      <Link href={`/admin/submissions/${submission.id}`} className="inline-flex items-center gap-1 font-semibold text-navy-800 underline">
                        <Eye size={16} />
                        詳細
                      </Link>
                    </td>
                  </tr>
                ))}
                {!submissions.length ? (
                  <tr>
                    <td colSpan={5} className="px-4 py-10 text-center text-slate-500">まだ申込みはありません。</td>
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
