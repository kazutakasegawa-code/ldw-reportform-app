"use client";

import { useEffect, useRef, useState } from "react";
import type { AnalysisResult, CheckAnswer, Submission } from "@prisma/client";
import { Clipboard, FileText, Save, Sparkles } from "lucide-react";
import { Button, Card, FieldLabel, inputClass } from "@/components/ui";
import { statusOptions } from "@/lib/constants";
import type { DomainScore } from "@/lib/scoring";

type Props = {
  submission: Submission & { checkAnswers: CheckAnswer[]; analysisResult: AnalysisResult | null };
  domainScores: DomainScore[];
  overall: number | null;
  recommendation: { plan: string; aim: string };
  prompt: string;
};

const analysisFields = [
  ["overallFinding", "総合所見"],
  ["strengths", "組織の強み"],
  ["topIssues", "現在の課題トップ3"],
  ["visibleProblems", "表面的に見えている問題"],
  ["causeHypotheses", "背景にある原因仮説"],
  ["actionsToIncrease", "優先して増やす行動"],
  ["actionsToDecrease", "優先して減らす行動"],
  ["thingiFit", "THINGi®︎の適合度・理由"],
  ["notebookFit", "しあわせ360°手帳の適合度・理由"],
  ["coachingFit", "コーチングの適合度・理由"],
  ["recommendedProgram", "AI分析による推奨プログラム"],
  ["kpis", "成果確認指標"],
  ["managementSupport", "経営者・管理職に求める支援"],
  ["domainComments", "5領域コメント"],
  ["additionalQuestions", "30分面談での追加確認事項"]
] as const;

const analysisLimits: Record<(typeof analysisFields)[number][0], number> = {
  overallFinding: 700,
  strengths: 500,
  topIssues: 500,
  visibleProblems: 500,
  causeHypotheses: 600,
  actionsToIncrease: 500,
  actionsToDecrease: 500,
  thingiFit: 350,
  notebookFit: 350,
  coachingFit: 350,
  recommendedProgram: 600,
  kpis: 500,
  managementSupport: 500,
  domainComments: 600,
  additionalQuestions: 500
};

const reportDisplayLimits: Partial<Record<(typeof analysisFields)[number][0], number>> = {
  overallFinding: 180,
  strengths: 135,
  topIssues: 150,
  visibleProblems: 120,
  causeHypotheses: 155,
  actionsToIncrease: 95,
  actionsToDecrease: 95,
  thingiFit: 80,
  notebookFit: 80,
  coachingFit: 80,
  recommendedProgram: 145,
  kpis: 90,
  managementSupport: 120,
  domainComments: 140,
  additionalQuestions: 110
};

type AnalysisFieldName = (typeof analysisFields)[number][0];
type AnalysisPayload = Partial<Record<AnalysisFieldName, string>>;

export default function DetailEditor({ submission, domainScores, overall, recommendation, prompt }: Props) {
  const messageRef = useRef<HTMLParagraphElement>(null);
  const analysisFormRef = useRef<HTMLFormElement>(null);
  const [message, setMessage] = useState("");
  const [aiResult, setAiResult] = useState("");
  const [runningAi, setRunningAi] = useState(false);
  const [copiedPrompt, setCopiedPrompt] = useState(false);
  const draftKey = `thingi-analysis-draft-${submission.id}`;

  function scrollToMessage() {
    window.setTimeout(() => {
      messageRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
    }, 50);
  }

  useEffect(() => {
    const draft = window.localStorage.getItem(draftKey);
    if (!draft || !analysisFormRef.current) return;
    try {
      const values = JSON.parse(draft) as Record<string, string>;
      Object.entries(values).forEach(([name, value]) => {
        const field = analysisFormRef.current?.elements.namedItem(name);
        if (field instanceof HTMLTextAreaElement) {
          field.value = value;
        }
      });
      setMessage("保存前のAI分析編集内容を復元しました。レポートへ反映するには保存してください。");
    } catch {
      window.localStorage.removeItem(draftKey);
    }
  }, [draftKey]);

  async function saveSubmission(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const payload = Object.fromEntries(form.entries());
    const response = await fetch(`/api/admin/submissions/${submission.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });
    setMessage(response.ok ? "管理項目を保存しました。" : "保存に失敗しました。");
    scrollToMessage();
  }

  async function saveAnalysisPayload(formElement: HTMLFormElement) {
    const form = new FormData(formElement);
    const payload = Object.fromEntries(form.entries());
    const response = await fetch(`/api/admin/submissions/${submission.id}/analysis`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });
    if (response.ok) {
      window.localStorage.removeItem(draftKey);
    }
    return response;
  }

  async function saveAnalysis(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const response = await saveAnalysisPayload(event.currentTarget);
    setMessage(response.ok ? "AI分析結果を保存しました。" : "保存に失敗しました。");
    scrollToMessage();
  }

  async function saveAnalysisAndOpenReport() {
    if (!analysisFormRef.current) return;
    const response = await saveAnalysisPayload(analysisFormRef.current);
    if (!response.ok) {
      setMessage("保存に失敗しました。レポート生成前にもう一度保存してください。");
      return;
    }
    window.location.assign(`/admin/submissions/${submission.id}/report`);
  }

  function keepAnalysisDraft(event: React.FormEvent<HTMLFormElement>) {
    const form = new FormData(event.currentTarget);
    window.localStorage.setItem(draftKey, JSON.stringify(Object.fromEntries(form.entries())));
  }

  async function runAi() {
    setRunningAi(true);
    setMessage("");
    const response = await fetch(`/api/admin/submissions/${submission.id}/ai`, { method: "POST" });
    const data = await response.json();
    setRunningAi(false);
    if (response.ok && data.analysis) {
      fillAnalysisForm(data.analysis);
      window.localStorage.removeItem(draftKey);
      setAiResult(data.result || "");
      setMessage(data.message || "AI分析結果を生成し、編集欄に保存しました。内容を確認してください。");
      scrollToMessage();
      return;
    }
    if (response.ok && data.result) {
      setAiResult(data.result);
      setMessage("AI分析結果を生成しました。内容を確認して、必要な項目へ編集・保存してください。");
      scrollToMessage();
      return;
    }
    setMessage(data.message || "AI分析プロンプトを生成しました。");
    scrollToMessage();
  }

  function fillAnalysisForm(values: AnalysisPayload) {
    if (!analysisFormRef.current) return;
    Object.entries(values).forEach(([name, value]) => {
      const field = analysisFormRef.current?.elements.namedItem(name);
      if (field instanceof HTMLTextAreaElement && typeof value === "string") {
        field.value = value;
      }
    });
  }

  async function copyPrompt() {
    try {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(prompt);
      } else {
        const textarea = document.createElement("textarea");
        textarea.value = prompt;
        textarea.setAttribute("readonly", "");
        textarea.style.position = "fixed";
        textarea.style.opacity = "0";
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand("copy");
        document.body.removeChild(textarea);
      }
      setCopiedPrompt(true);
      setMessage("AI分析用プロンプトをコピーしました。");
      scrollToMessage();
      window.setTimeout(() => setCopiedPrompt(false), 1800);
    } catch {
      setMessage("コピーできませんでした。プロンプト欄を選択して手動でコピーしてください。");
      scrollToMessage();
    }
  }

  return (
    <div className="space-y-6">
      {message ? <p ref={messageRef} className="scroll-mt-6 rounded-md bg-gold-100 px-4 py-3 text-sm font-semibold">{message}</p> : null}

      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="p-6">
          <h2 className="text-xl font-bold">基本情報</h2>
          <dl className="mt-4 grid gap-3 text-sm sm:grid-cols-2">
            <Info label="会社名" value={submission.companyName} />
            <Info label="業種" value={submission.industry} />
            <Info label="従業員数" value={submission.employeeCount} />
            <Info label="拠点数" value={submission.officeCount} />
            <Info label="担当者" value={`${submission.contactName} / ${submission.contactRole}`} />
            <Info label="メール" value={submission.email} />
            <Info label="電話" value={submission.phone} />
            <Info label="対象階層" value={submission.targetLayer} />
            <Info label="主な課題" value={submission.mainIssues} />
            <Info label="補足" value={submission.notes || "なし"} />
          </dl>
        </Card>

        <Card className="p-6">
          <h2 className="text-xl font-bold">5領域平均点・判定</h2>
          <p className="mt-2 text-sm text-slate-600">総合平均：<span className="font-bold text-navy-900">{overall ?? "未入力"}</span></p>
          <div className="mt-4 space-y-3">
            {domainScores.map((score) => (
              <div key={score.domain}>
                <div className="flex justify-between text-sm">
                  <span className="font-semibold">{score.domain}</span>
                  <span>{score.average ?? "未入力"} / {score.judgement}</span>
                </div>
                <div className="mt-1 h-2 rounded-full bg-slate-100">
                  <div className="h-2 rounded-full bg-gold-500" style={{ width: `${((score.average ?? 0) / 5) * 100}%` }} />
                </div>
                <p className="mt-1 text-xs text-slate-600">{score.meaning} / {score.response}</p>
              </div>
            ))}
          </div>
          <div className="mt-5 rounded-md bg-slate-50 p-4 text-sm">
            <p className="font-semibold">5領域スコアからの一次推奨</p>
            <p className="mt-1">{recommendation.plan}</p>
            <p className="mt-1 text-slate-600">狙い：{recommendation.aim}</p>
          </div>
        </Card>
      </div>

      <Card className="p-6">
        <h2 className="text-xl font-bold">管理項目</h2>
        <form onSubmit={saveSubmission} className="mt-5 grid gap-4 sm:grid-cols-2">
          <div>
            <FieldLabel>ステータス</FieldLabel>
            <select name="status" className={inputClass} defaultValue={submission.status}>
              {statusOptions.map((status) => <option key={status}>{status}</option>)}
            </select>
          </div>
          <div>
            <FieldLabel>面談予定日</FieldLabel>
            <input name="meetingDate" type="datetime-local" className={inputClass} defaultValue={submission.meetingDate ? new Date(submission.meetingDate).toISOString().slice(0, 16) : ""} />
          </div>
          <div>
            <FieldLabel>レポート作成年月日</FieldLabel>
            <input name="reportDate" type="date" className={inputClass} defaultValue={formatDateInput(submission.reportDate)} />
          </div>
          <TextArea name="meetingMemo" label="面談メモ" defaultValue={submission.meetingMemo} />
          <TextArea name="priorityIssue" label="優先課題" defaultValue={submission.priorityIssue} />
          <TextArea name="recommendedPlan" label="レポート表示用 推奨プラン" defaultValue={submission.recommendedPlan || recommendation.plan} />
          <TextArea name="reportComment" label="顧客レポートに表示するコメント" defaultValue={submission.reportComment} />
          <div className="sm:col-span-2">
            <Button type="submit"><Save size={18} />管理項目を保存</Button>
          </div>
        </form>
      </Card>

      <Card className="p-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <h2 className="text-xl font-bold">AI分析用プロンプト</h2>
          <div className="flex flex-wrap gap-2">
            <Button type="button" onClick={copyPrompt} className="bg-white !text-navy-800 ring-1 ring-navy-800 hover:bg-slate-50"><Clipboard size={18} />{copiedPrompt ? "コピー済み" : "コピー"}</Button>
            <Button type="button" onClick={runAi} disabled={runningAi}><Sparkles size={18} />{runningAi ? "実行中..." : "AI分析実行"}</Button>
          </div>
        </div>
        <p className="mt-3 rounded-md bg-slate-50 px-3 py-2 text-xs leading-5 text-slate-600">
          プロンプトには、会社情報、研修検討条件、5領域スコア、各設問の評点・コメント、管理者メモを含めています。コピー後はChatGPT等に貼り付けて分析できます。
        </p>
        <textarea readOnly className={`${inputClass} mt-4 min-h-80 font-mono text-xs leading-6`} value={prompt} />
        {aiResult ? (
          <div className="mt-4">
            <FieldLabel>AI分析実行結果（確認後、下の編集欄へ反映してください）</FieldLabel>
            <textarea readOnly className={`${inputClass} min-h-72`} value={aiResult} />
          </div>
        ) : null}
      </Card>

      <Card className="p-6">
        <h2 className="text-xl font-bold">AI分析結果の編集</h2>
        <p className="mt-2 text-sm leading-6 text-slate-600">各欄にはレポート表示用の文字数上限があります。入力中の内容はこのブラウザに一時保存されます。</p>
        <form ref={analysisFormRef} onInput={keepAnalysisDraft} onSubmit={saveAnalysis} className="mt-5 grid gap-4 sm:grid-cols-2">
          {analysisFields.map(([name, label]) => (
            <TextArea key={name} name={name} label={label} defaultValue={submission.analysisResult?.[name] || ""} maxLength={analysisLimits[name]} reportLimit={reportDisplayLimits[name]} />
          ))}
          <div className="flex flex-wrap gap-2 sm:col-span-2">
            <Button type="submit"><Save size={18} />AI分析結果を保存</Button>
            <Button type="button" onClick={saveAnalysisAndOpenReport} className="bg-gold-500 hover:bg-gold-300" style={{ color: "#ffffff" }}>
              <FileText size={18} />
              <span className="font-semibold text-white">保存して顧客レポート生成</span>
            </Button>
          </div>
        </form>
      </Card>

      <Card className="p-6">
        <h2 className="text-xl font-bold">事前チェック回答</h2>
        <div className="mt-4 space-y-3">
          {submission.checkAnswers.map((answer) => (
            <div key={answer.id} className="rounded-md border border-slate-200 p-4 text-sm">
              <p className="font-semibold">{answer.questionNo}. {answer.question}</p>
              <p className="mt-1 text-slate-600">{answer.domain} / 評点：{answer.score} / 観点：{answer.viewpoint}</p>
              <p className="mt-2 whitespace-pre-wrap">{answer.comment || "コメントなし"}</p>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-xs font-semibold text-slate-500">{label}</dt>
      <dd className="mt-1 whitespace-pre-wrap font-medium">{value}</dd>
    </div>
  );
}

function formatDateInput(date?: Date | string | null) {
  if (!date) return "";
  const value = new Date(date);
  if (Number.isNaN(value.getTime())) return "";
  const year = value.getFullYear();
  const month = String(value.getMonth() + 1).padStart(2, "0");
  const day = String(value.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function TextArea({ name, label, defaultValue, maxLength, reportLimit }: { name: string; label: string; defaultValue?: string | null; maxLength?: number; reportLimit?: number }) {
  return (
    <div className="sm:col-span-2">
      <FieldLabel>{label}</FieldLabel>
      <textarea name={name} className={inputClass} rows={4} maxLength={maxLength} defaultValue={defaultValue || ""} />
      <p className="mt-1 text-xs text-slate-500">
        {reportLimit ? `レポート表示目安：${reportLimit}文字以内` : null}
        {reportLimit && maxLength ? " / " : null}
        {maxLength ? `入力上限：${maxLength}文字まで` : null}
      </p>
    </div>
  );
}
