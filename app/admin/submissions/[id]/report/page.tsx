import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Printer } from "lucide-react";
import PrintButton from "./PrintButton";
import { requireAdmin } from "@/lib/auth";
import { formatDateJst } from "@/lib/date";
import { prisma } from "@/lib/prisma";
import { providerName } from "@/lib/constants";
import { calculateDomainScores, calculateOverallResultScore, calculateResultDomainScores, recommendPlan } from "@/lib/scoring";
import type { ResultDomainScore } from "@/lib/scoring";

export default async function ReportPage({ params }: { params: Promise<{ id: string }> }) {
  await requireAdmin();
  const { id } = await params;
  const submission = await prisma.submission.findUnique({
    where: { id },
    include: { checkAnswers: { orderBy: { questionNo: "asc" } }, analysisResult: true }
  });
  if (!submission) notFound();

  const domainScores = calculateDomainScores(submission.checkAnswers);
  const resultScores = calculateResultDomainScores(submission.checkAnswers);
  const overallResultScore = calculateOverallResultScore(resultScores);
  const recommendation = recommendPlan(domainScores);
  const analysis = submission.analysisResult;
  const recommendedPlan = submission.recommendedPlan || analysis?.recommendedProgram || recommendation.plan;
  const primaryRecommendation = `${recommendation.plan}\n狙い：${recommendation.aim}`;
  const aiRecommendedProgram = analysis?.recommendedProgram || "AI分析結果を踏まえて、面談後に調整します。";
  const reportDate = formatDateJst(submission.reportDate || new Date());
  const kpiRows = buildKpiRows(analysis?.kpis);

  return (
    <main className="report-print-page min-h-screen bg-slate-100 py-6 text-navy-900">
      <div className="no-print mx-auto mb-4 flex w-full max-w-5xl items-center justify-between px-4">
        <Link href={`/admin/submissions/${submission.id}`} className="inline-flex items-center gap-1 text-sm font-semibold text-navy-800 underline">
          <ArrowLeft size={16} />
          詳細へ戻る
        </Link>
        <PrintButton>
          <Printer size={18} />
          PDF出力
        </PrintButton>
      </div>

      <article className="a4-report report-landscape p-7 shadow-soft">
        <header className="relative border-b-4 border-gold-500 pb-2">
          <div>
            <div>
              <p className="text-xs font-semibold text-gold-500">{providerName}</p>
              <h1 className="mt-1 pr-40 text-3xl font-bold leading-tight">人材育成・組織開発 分析レポート</h1>
            </div>
            <p className="absolute right-0 top-0 text-right text-xs font-semibold leading-5 text-slate-600">
              作成年月日
              <br />
              <span className="text-sm text-navy-900">{reportDate}</span>
            </p>
          </div>
        </header>

        <section className="report-grid mt-4 grid grid-cols-[0.9fr_1.15fr_1.05fr] gap-4 text-[10.5px] leading-5">
          <div className="report-stack space-y-3">
            <CompactHeading number="1" title="基本情報" />
            <dl className="grid grid-cols-2 gap-2">
              <div className="grid gap-2">
                <Info label="会社名" value={submission.companyName} />
                <Info label="業種" value={submission.industry} />
                <Info label="従業員数" value={submission.employeeCount} />
              </div>
              <div className="grid gap-2">
                <Info label="主な課題" value={limitText(submission.mainIssues, 70)} />
                <Info label="社員に望む状態" value={limitText(submission.hearingIdealState, 70)} />
              </div>
            </dl>

            <CompactHeading number="2" title="5領域スコア" />
            <div className="-mt-1 grid grid-cols-[0.95fr_1.05fr] gap-1">
              <div className="rounded border border-gold-200 bg-gold-50 px-2 py-1">
                <p className="text-[8.5px] font-bold leading-tight text-slate-600">総合スコア</p>
                <p className="mt-0.5 text-[15px] font-black leading-none text-navy-900">{overallResultScore}<span className="ml-0.5 text-[8px] font-bold">点</span></p>
              </div>
              <div className="rounded border border-slate-200 bg-slate-50 px-2 py-1">
                <p className="text-[8px] font-normal leading-tight text-slate-500">外側ほどスコアが高い状態を示します。</p>
              </div>
            </div>
            <RadarChart scores={resultScores} compact />
            <div className="grid grid-cols-2 gap-1">
              {resultScores.map((score) => (
                <div key={score.domain} className="rounded border border-slate-200 bg-slate-50 px-2 py-1">
                  <div className="flex items-center justify-between gap-2">
                    <p className="font-semibold">{score.domain}</p>
                    <p className="font-bold">{score.score}点 / {score.judgement}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="report-stack space-y-2">
            <CompactSection number="3" title="総合所見" body={analysis?.overallFinding || submission.reportComment || "面談内容を踏まえて追記します。"} maxLength={180} />
            <CompactSection number="4" title="組織の強み" body={analysis?.strengths || "事前回答と面談内容を踏まえて整理します。"} maxLength={135} />
            <CompactSection number="5" title="現在の課題トップ3" body={analysis?.topIssues || "事前回答と面談内容を踏まえて整理します。"} maxLength={150} />
            <CompactSection number="6" title="表面的に見えている問題" body={analysis?.visibleProblems || "面談で確認します。"} maxLength={120} />
            <CompactSection number="7" title="背景にある原因仮説" body={analysis?.causeHypotheses || "回答内容から考えられる仮説を面談で確認します。"} maxLength={155} />
            <div className="grid grid-cols-2 gap-2">
              <CompactSection number="8" title="増やす行動" body={analysis?.actionsToIncrease || "自分から相談・提案する行動、週次の振り返り、他者の強みを活かす行動。"} maxLength={95} />
              <CompactSection number="9" title="減らす行動" body={analysis?.actionsToDecrease || "判断の先送り、仕事の抱え込み、研修後の振り返り不足。"} maxLength={95} />
            </div>
            {analysis?.domainComments ? <MiniBlock title="5領域コメント" body={analysis.domainComments} maxLength={140} /> : null}
          </div>

          <div className="report-stack space-y-2">
            <CompactHeading number="10" title="推奨施策" />
            <MiniBlock title="レポート表示用 推奨プラン" body={recommendedPlan} maxLength={90} strong />
            <div className="grid grid-cols-2 gap-2">
              <MiniBlock title="5領域スコアからの一次推奨" body={primaryRecommendation} maxLength={145} />
              <MiniBlock title="AI分析による推奨プログラム" body={aiRecommendedProgram} maxLength={145} />
            </div>
            <div className="grid grid-cols-3 gap-2">
              <MiniBlock title="THINGi®︎" body={analysis?.thingiFit || "判断・協力・共創を体験的に扱うテーマとして適合する可能性があります。"} maxLength={80} />
              <MiniBlock title="しあわせ360°手帳" body={analysis?.notebookFit || "気づきを目標と日々の行動に落とし込む支援として適合する可能性があります。"} maxLength={80} />
              <MiniBlock title="コーチング" body={analysis?.coachingFit || "対話と行動継続を支える手法として適合する可能性があります。"} maxLength={80} />
            </div>
            <CompactHeading number="11" title="成果確認指標" />
            <table className="w-full border-collapse text-[9.5px]">
              <thead>
                <tr className="bg-slate-100">
                  <th className="w-[58%] border border-slate-300 px-2 py-1 text-left">指標</th>
                  <th className="w-[42%] border border-slate-300 px-2 py-1 text-left">確認方法</th>
                </tr>
              </thead>
              <tbody>
                {kpiRows.slice(0, 4).map((row) => (
                  <tr key={row[0]}>
                    {row.map((cell, index) => <td key={index} className="border border-slate-300 px-2 py-1 align-top leading-4">{limitText(cell, 38)}</td>)}
                  </tr>
                ))}
              </tbody>
            </table>
            <CompactSection number="12" title="経営者・管理職に求める支援" body={analysis?.managementSupport || "日常業務での声かけ、振り返り機会、実践確認の場を設計します。"} maxLength={120} />
            <CompactSection number="13" title="30分面談での追加確認事項" body={analysis?.additionalQuestions || submission.hearingQuestion || "優先課題、対象階層、実施時期、フォロー体制を確認します。"} maxLength={110} />
            <p className="px-1 text-[8.5px] leading-4 text-slate-600">
              本レポートは事前回答等をもとにAIで情報整理した仮説を含む資料であり、社員個人の能力・適性・人事評価を判定するものではありません。
            </p>
          </div>
        </section>
      </article>
    </main>
  );
}

function RadarChart({ scores, compact = false }: { scores: ResultDomainScore[]; compact?: boolean }) {
  const center = 180;
  const radius = 90;
  const levels = [20, 40, 60, 80, 100];
  const pointsForValue = (value: number) =>
    scores
      .map((_, index) => {
        const angle = -Math.PI / 2 + (Math.PI * 2 * index) / scores.length;
        const distance = radius * (value / 100);
        return `${center + Math.cos(angle) * distance},${center + Math.sin(angle) * distance}`;
      })
      .join(" ");
  const scorePoints = scores
    .map((score, index) => {
      const angle = -Math.PI / 2 + (Math.PI * 2 * index) / scores.length;
      const distance = radius * (score.score / 100);
      return `${center + Math.cos(angle) * distance},${center + Math.sin(angle) * distance}`;
    })
    .join(" ");

  return (
    <figure className={`rounded-md border border-slate-200 bg-white ${compact ? "p-2" : "p-4"}`}>
      <svg viewBox="0 0 360 320" role="img" aria-label="5領域スコアのレーダーチャート" className={`mx-auto h-auto w-full ${compact ? "max-w-[270px]" : "max-w-[360px]"}`}>
        {levels.map((level) => (
          <polygon key={level} points={pointsForValue(level)} fill="none" stroke="#d8dee8" strokeWidth="1" />
        ))}
        {scores.map((score, index) => {
          const angle = -Math.PI / 2 + (Math.PI * 2 * index) / scores.length;
          const x = center + Math.cos(angle) * radius;
          const y = center + Math.sin(angle) * radius;
          const labelX = center + Math.cos(angle) * (radius + 50);
          const labelY = center + Math.sin(angle) * (radius + 36);
          const labelLines = score.domain.split("・");
          return (
            <g key={score.domain}>
              <line x1={center} y1={center} x2={x} y2={y} stroke="#d8dee8" strokeWidth="1" />
              <text x={labelX} y={labelY} textAnchor="middle" dominantBaseline="middle" fontSize="11" fontWeight="700" fill="#102a4f">
                {labelLines.map((line, lineIndex) => (
                  <tspan key={line} x={labelX} dy={lineIndex === 0 ? 0 : 13}>{line}</tspan>
                ))}
                <tspan x={labelX} dy="13" fontSize="10" fontWeight="400">{score.score}点</tspan>
              </text>
            </g>
          );
        })}
        <polygon points={scorePoints} fill="rgba(214, 168, 25, 0.32)" stroke="#d6a819" strokeWidth="3" />
        {scores.map((score, index) => {
          const angle = -Math.PI / 2 + (Math.PI * 2 * index) / scores.length;
          const distance = radius * (score.score / 100);
          return <circle key={score.domain} cx={center + Math.cos(angle) * distance} cy={center + Math.sin(angle) * distance} r="4" fill="#102a4f" />;
        })}
        <text x={center} y={center + 5} textAnchor="middle" fontSize="11" fontWeight="700" fill="#102a4f">100</text>
      </svg>
      {compact ? null : <figcaption className="mt-2 text-center text-xs text-slate-600">外側ほどスコアが高い状態を示します。</figcaption>}
    </figure>
  );
}

function CompactHeading({ number, title, note }: { number: string; title: string; note?: string }) {
  return (
    <h2 className="flex items-center gap-1.5 text-[13px] font-bold">
      <span className="inline-flex h-[18px] w-[18px] items-center justify-center rounded-full bg-navy-800 text-[9px] text-white">{number}</span>
      {title}
      {note ? <span className="text-[9px] font-normal text-slate-500">{note}</span> : null}
    </h2>
  );
}

function CompactSection({ number, title, body, maxLength }: { number: string; title: string; body: string; maxLength: number }) {
  return (
    <div>
      <CompactHeading number={number} title={title} />
      <section className="mt-0.5 rounded-md border border-slate-200 bg-white p-2">
        <p className="whitespace-pre-wrap text-slate-800">{limitText(body, maxLength)}</p>
      </section>
    </div>
  );
}

function MiniBlock({ title, body, maxLength, strong = false }: { title: string; body: string; maxLength: number; strong?: boolean }) {
  return (
    <section className="rounded-md border border-slate-200 bg-slate-50 p-2">
      <h3 className="text-[9.5px] font-bold text-slate-500">{title}</h3>
      <p className={`mt-0.5 whitespace-pre-wrap text-slate-800 ${strong ? "font-bold text-navy-900" : ""}`}>{limitText(body, maxLength)}</p>
    </section>
  );
}

function RecommendationItem({ title, body, strong = false }: { title: string; body: string; strong?: boolean }) {
  return (
    <section className="rounded-md border border-slate-200 bg-slate-50 p-3">
      <h3 className="text-xs font-bold text-slate-500">{title}</h3>
      <p className={`mt-1 whitespace-pre-wrap leading-6 text-slate-800 ${strong ? "text-base font-bold text-navy-900" : ""}`}>{body}</p>
    </section>
  );
}

function limitText(text: string, maxLength: number) {
  return text.length > maxLength ? `${text.slice(0, maxLength)}...` : text;
}

function buildKpiRows(kpis?: string | null) {
  const defaultMethods = ["上司観察・本人振り返り", "アンケート・面談", "手帳・チェック表", "相互フィードバック", "実施記録"];
  const defaultIndicators = [
    "自分から相談・提案する行動",
    "個人目標とチーム目標の理解",
    "週1回の振り返り実施",
    "他者の強みを活かす行動",
    "1on1・フォロー実施率"
  ];
  const indicators = kpis
    ? kpis.split(/\r?\n/).map((line) => line.trim()).filter(Boolean).slice(0, 5)
    : defaultIndicators;
  const rows = indicators.length ? indicators : defaultIndicators;
  return rows.map((indicator, index) => [indicator, defaultMethods[index] || "面談・記録確認"]);
}

function ReportHeading({ number, title, className = "" }: { number: string; title: string; className?: string }) {
  return <h2 className={`flex items-center gap-2 text-lg font-bold ${className}`}><span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-navy-800 text-sm text-white">{number}</span>{title}</h2>;
}

function Section({ number, title, body }: { number: string; title: string; body: string }) {
  return (
    <section>
      <ReportHeading number={number} title={title} />
      <p className="mt-3 whitespace-pre-wrap text-sm leading-7 text-slate-800">{limitText(body, 700)}</p>
    </section>
  );
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-md bg-slate-50 p-3">
      <dt className="text-xs font-semibold text-slate-500">{label}</dt>
      <dd className="mt-1 font-semibold">{value}</dd>
    </div>
  );
}
