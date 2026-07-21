import { notFound } from "next/navigation";
import type { ReactNode } from "react";
import { Award, FileText, TrendingDown, TrendingUp } from "lucide-react";
import MeetingRequestBox from "./MeetingRequestBox";
import ResultRadarChart from "./ResultRadarChart";
import ResultPrintButton from "./ResultPrintButton";
import { Card, Container, PageShell } from "@/components/ui";
import { appName, fiveMinuteDiagnosticNotice, providerName } from "@/lib/constants";
import { prisma } from "@/lib/prisma";
import { calculateResultDomainScores, summarizeResultScores } from "@/lib/scoring";

export const dynamic = "force-dynamic";

export default async function DiagnosisResultPage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  const submission = await prisma.submission.findUnique({
    where: { resultToken: token },
    include: { checkAnswers: true }
  });

  if (!submission) notFound();

  if (!submission.resultViewedAt || submission.status === "5分診断完了") {
    await prisma.submission.update({
      where: { id: submission.id },
      data: {
        resultViewedAt: submission.resultViewedAt ?? new Date(),
        status: submission.status === "5分診断完了" ? "結果閲覧済み" : submission.status
      }
    });
  }

  const resultScores = calculateResultDomainScores(submission.checkAnswers);
  const summary = summarizeResultScores(resultScores);

  return (
    <PageShell>
      <style media="print">{`
        @page { size: A4 portrait; margin: 8mm; }
      `}</style>
      <Container className="py-8 sm:py-12">
        <header className="result-screen-only flex flex-col gap-2 border-b border-slate-200 pb-5 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-sm font-semibold text-gold-500">{providerName}</p>
            <p className="mt-1 text-lg font-bold text-navy-900">{appName}</p>
          </div>
          <ResultPrintButton />
        </header>

        <main className="result-screen-only space-y-6 py-8">
          <section>
            <h1 className="text-2xl font-bold leading-snug text-navy-900 sm:text-4xl">診断結果｜採用後に社員が定着・成長する職場の現在地</h1>
            <p className="mt-4 rounded-lg border border-gold-200 bg-gold-50 p-4 text-sm leading-7 text-slate-700">{fiveMinuteDiagnosticNotice}</p>
            <p className="mt-3 text-sm font-semibold text-slate-600">この画面は簡易診断結果です。詳細な分析レポートは30分面談＋AI詳細診断で作成します。</p>
          </section>

          <section className="grid gap-6 lg:grid-cols-[1.15fr_0.85fr]">
            <Card className="p-6">
              <div className="mb-4 flex items-center justify-between gap-3">
                <div>
                  <h2 className="text-xl font-bold">5領域レーダーチャート</h2>
                  <p className="mt-1 text-xs text-slate-500">100点満点。外側ほどスコアが高い状態を示します。</p>
                </div>
              </div>
              <ResultRadarChart data={resultScores.map((item) => ({ domain: item.domain, score: item.score }))} />
            </Card>

            <Card className="p-6">
              <h2 className="flex items-center gap-2 text-xl font-bold">
                <Award className="text-gold-500" size={22} />
                総合結果
              </h2>
              <div className="mt-6 rounded-lg bg-navy-900 p-6 text-white">
                <p className="text-sm font-semibold text-gold-200">総合スコア</p>
                <p className="mt-1 text-5xl font-bold">{summary.overallScore}<span className="ml-1 text-lg">点</span></p>
                <p className="mt-4 inline-flex rounded-full bg-white px-4 py-1 text-sm font-bold text-navy-900">{summary.overallJudgement.judgement}</p>
                <p className="mt-4 text-sm leading-7 text-slate-100">{summary.overallJudgement.comment}</p>
              </div>
              <div className="mt-5 grid gap-3 text-sm sm:grid-cols-2">
                <MiniStat icon={<TrendingUp size={18} />} label="最も高い領域" value={`${summary.highest.domain} ${summary.highest.score}点`} />
                <MiniStat icon={<TrendingDown size={18} />} label="最も低い領域" value={`${summary.lowest.domain} ${summary.lowest.score}点`} />
              </div>
            </Card>
          </section>

          <section>
            <h2 className="text-xl font-bold">優先して確認すべき領域トップ2</h2>
            <div className="mt-4 grid gap-4 lg:grid-cols-2">
              {summary.priorities.map((item) => (
                <Card key={item.domain} className="p-5">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <h3 className="text-lg font-bold text-navy-900">{item.domain}</h3>
                      <p className="mt-1 text-sm text-slate-600">{item.comment}</p>
                    </div>
                    <div className="shrink-0 rounded-lg bg-gold-100 px-4 py-2 text-center">
                      <p className="text-2xl font-bold text-navy-900">{item.score}</p>
                      <p className="text-xs font-semibold text-slate-600">点</p>
                    </div>
                  </div>
                  <p className="mt-3 inline-flex rounded-full bg-slate-100 px-3 py-1 text-xs font-bold">{item.judgement}</p>
                  <p className="mt-4 text-sm leading-7 text-slate-700">{item.priorityComment}</p>
                  <div className="mt-4 rounded-md bg-slate-50 p-3 text-sm leading-7">
                    <span className="font-bold">30分面談で確認したい観点：</span>
                    {item.interviewPoint}
                  </div>
                </Card>
              ))}
            </div>
          </section>

          <section>
            <h2 className="text-xl font-bold">5領域別結果一覧</h2>
            <div className="mt-4 overflow-hidden rounded-lg border border-slate-200 bg-white">
              <table className="w-full min-w-[720px] text-left text-sm">
                <thead className="bg-navy-800 text-white">
                  <tr>
                    <th className="px-4 py-3">領域</th>
                    <th className="px-4 py-3">スコア</th>
                    <th className="px-4 py-3">判定</th>
                    <th className="px-4 py-3">コメント</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {resultScores.map((item) => (
                    <tr key={item.domain}>
                      <td className="px-4 py-3 font-semibold">{item.domain}</td>
                      <td className="px-4 py-3">{item.score}点</td>
                      <td className="px-4 py-3">{item.judgement}</td>
                      <td className="px-4 py-3 text-slate-700">{item.comment}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          <MeetingRequestBox token={token} />

          <section>
            <h2 className="text-xl font-bold">この5分診断で分かること／30分面談で分かること</h2>
            <div className="mt-4 grid gap-4 lg:grid-cols-2">
              <CompareCard
                title="この5分診断で分かること"
                items={["5領域の大まかな傾向", "強みと弱い領域", "採用後の定着・育成に影響しそうなポイント", "30分面談で確認すべきテーマ"]}
              />
              <CompareCard
                title="30分面談＋AI詳細診断で分かること"
                items={["優先課題トップ3", "表面的な問題と背景原因", "増やす行動・減らす行動", "THINGi®︎・しあわせ360°手帳・コーチングの適合度", "推奨プログラム", "成果確認指標", "A4分析レポート"]}
              />
            </div>
          </section>
        </main>

        <PrintableResult
          resultScores={resultScores}
          summary={summary}
        />

        <footer className="result-screen-only border-t border-slate-200 pt-5 text-sm text-slate-600">
          <p className="font-semibold text-navy-900">Life Design Works</p>
          <p>代表 瀬川一貴</p>
        </footer>
      </Container>
    </PageShell>
  );
}

function MiniStat({ icon, label, value }: { icon: ReactNode; label: string; value: string }) {
  return (
    <div className="rounded-md bg-slate-50 p-3">
      <p className="flex items-center gap-2 text-xs font-bold text-slate-500">{icon}{label}</p>
      <p className="mt-1 font-semibold text-navy-900">{value}</p>
    </div>
  );
}

function PrintableResult({
  resultScores,
  summary
}: {
  resultScores: ReturnType<typeof calculateResultDomainScores>;
  summary: ReturnType<typeof summarizeResultScores>;
}) {
  return (
    <div className="result-print-only">
      <section className="result-print-sheet">
        <header className="result-print-sheet-header">
          <div>
            <p>Life Design Works</p>
            <h1>採用・定着・育成課題 5分診断 結果レポート</h1>
          </div>
          <p>簡易診断結果</p>
        </header>

        <h2>診断結果｜採用後に社員が定着・成長する職場の現在地</h2>
        <p className="result-print-notice">{fiveMinuteDiagnosticNotice}</p>

        <div className="result-print-two-column">
          <section className="result-print-panel">
            <h3>5領域レーダーチャート</h3>
            <p className="result-print-help">100点満点。外側ほどスコアが高い状態を示します。</p>
            <ResultRadarChart data={resultScores.map((item) => ({ domain: item.domain, score: item.score }))} />
          </section>

          <section className="result-print-panel result-print-overview">
            <h3>総合結果</h3>
            <div className="result-print-scorebox">
              <p>総合スコア</p>
              <strong>{summary.overallScore}<span>点</span></strong>
              <em>{summary.overallJudgement.judgement}</em>
              <p>{summary.overallJudgement.comment}</p>
            </div>
            <dl className="result-print-minis">
              <div>
                <dt>最も高い領域</dt>
                <dd>{summary.highest.domain} {summary.highest.score}点</dd>
              </div>
              <div>
                <dt>最も低い領域</dt>
                <dd>{summary.lowest.domain} {summary.lowest.score}点</dd>
              </div>
            </dl>
          </section>
        </div>

        <section className="result-print-priorities">
          <h3>優先して確認すべき領域トップ2</h3>
          <div>
            {summary.priorities.map((item) => (
              <article key={item.domain} className="result-print-priority-card">
                <div>
                  <h4>{item.domain}</h4>
                  <strong>{item.score}点 / {item.judgement}</strong>
                </div>
                <p>{item.priorityComment}</p>
                <p><b>30分面談で確認したい観点：</b>{item.interviewPoint}</p>
              </article>
            ))}
          </div>
        </section>
      </section>

      <section className="result-print-sheet result-print-sheet-second">
        <header className="result-print-sheet-header">
          <div>
            <p>Life Design Works</p>
            <h2>5領域別結果一覧</h2>
          </div>
        </header>

        <table className="result-print-table">
          <thead>
            <tr>
              <th>領域</th>
              <th>スコア</th>
              <th>判定</th>
              <th>コメント</th>
            </tr>
          </thead>
          <tbody>
            {resultScores.map((item) => (
              <tr key={item.domain}>
                <td>{item.domain}</td>
                <td>{item.score}点</td>
                <td>{item.judgement}</td>
                <td>{item.comment}</td>
              </tr>
            ))}
          </tbody>
        </table>

        <section className="result-print-compare-grid">
          <article>
            <h3>この5分診断で分かること</h3>
            <ul>
              <li>5領域の大まかな傾向</li>
              <li>強みと弱い領域</li>
              <li>採用後の定着・育成に影響しそうなポイント</li>
              <li>30分面談で確認すべきテーマ</li>
            </ul>
          </article>
          <article>
            <h3>30分面談＋AI詳細診断で分かること</h3>
            <ul>
              <li>優先課題トップ3</li>
              <li>表面的な問題と背景原因</li>
              <li>増やす行動・減らす行動</li>
              <li>THINGi®︎・しあわせ360°手帳・コーチングの適合度</li>
              <li>推奨プログラム、成果確認指標、A4分析レポート</li>
            </ul>
          </article>
        </section>

        <p className="result-print-footer">本画面は簡易診断結果です。詳細な分析レポートは30分面談＋AI詳細診断で作成します。 / Life Design Works 代表 瀬川一貴</p>
      </section>
    </div>
  );
}

function CompareCard({ title, items }: { title: string; items: string[] }) {
  return (
    <Card className="p-5">
      <h3 className="flex items-center gap-2 font-bold text-navy-900">
        <FileText size={18} className="text-gold-500" />
        {title}
      </h3>
      <ul className="mt-4 space-y-2 text-sm leading-7 text-slate-700">
        {items.map((item) => (
          <li key={item} className="flex gap-2">
            <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-gold-500" />
            <span>{item}</span>
          </li>
        ))}
      </ul>
    </Card>
  );
}
