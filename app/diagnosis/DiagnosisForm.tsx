"use client";

import { useMemo, useRef, useState } from "react";
import { useForm, type FieldErrors, type UseFormRegisterReturn } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Send } from "lucide-react";
import { Button, Card, FieldLabel, MutedNotice, inputClass } from "@/components/ui";
import {
  aiConsentNotice,
  checkQuestions,
  desiredTimingOptions,
  employeeCountOptions,
  expectedPeriods,
  fiveMinuteDiagnosticNotice,
  hearingOptions,
  industryOptions,
  mainIssueOptions,
  pastTrainingOptions,
  privacyNotice,
  scoreLabels,
  targetCountOptions,
  targetLayers,
  budgetRanges
} from "@/lib/constants";
import { diagnosisSchema, type DiagnosisInput } from "@/lib/schema";

const defaultValues: DiagnosisInput = {
  companyName: "",
  industry: "",
  employeeCount: "",
  officeCount: "",
  contactName: "",
  contactRole: "",
  email: "",
  phone: "",
  targetLayer: "",
  targetCount: "",
  desiredTiming: "",
  pastTraining: "",
  mainIssues: [],
  mainIssueOther: "",
  expectedPeriod: "",
  budgetRange: "",
  notes: "",
  hearingMostImportantIssue: "",
  hearingTargetLayer: "",
  hearingIdealState: "",
  hearingFollowSystem: "",
  hearingQuestion: "",
  consentPrivacy: false as true,
  consentAi: false as true,
  checkAnswers: checkQuestions.map((item) => ({
    questionNo: item.no,
    domain: item.domain,
    question: item.question,
    viewpoint: item.viewpoint,
    score: undefined as unknown as number,
    comment: ""
  }))
};

function ErrorText({ message }: { message?: string }) {
  if (!message) return null;
  return <p className="mt-1 text-xs font-semibold text-red-700">{message}</p>;
}

export default function DiagnosisForm() {
  const messageRef = useRef<HTMLDivElement>(null);
  const [serverError, setServerError] = useState("");
  const [statusMessage, setStatusMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const {
    register,
    handleSubmit,
    formState: { errors }
  } = useForm<DiagnosisInput>({
    resolver: zodResolver(diagnosisSchema),
    defaultValues
  });

  const groupedQuestions = useMemo(() => {
    return checkQuestions.reduce<Record<string, typeof checkQuestions>>((acc, question) => {
      acc[question.domain] = acc[question.domain] || [];
      acc[question.domain].push(question);
      return acc;
    }, {});
  }, []);

  async function onSubmit(values: DiagnosisInput) {
    setSubmitting(true);
    setServerError("");
    setStatusMessage("入力内容を送信しています。");
    try {
      const response = await fetch("/api/submissions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values)
      });
      if (!response.ok) {
        setServerError("送信に失敗しました。入力内容をご確認ください。");
        messageRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
        return;
      }
      const result = await response.json();
      setStatusMessage("送信が完了しました。診断結果ページへ移動します。");
      window.setTimeout(() => {
        window.location.assign(`/diagnosis/result/${result.resultToken}`);
      }, 600);
    } catch {
      setServerError("送信に失敗しました。通信状況をご確認のうえ、もう一度お試しください。");
      messageRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    } finally {
      setSubmitting(false);
    }
  }

  function onInvalid(_: FieldErrors<DiagnosisInput>) {
    setStatusMessage("");
    setServerError("未入力または確認が必要な項目があります。赤字の案内をご確認ください。");
    messageRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  return (
    <form onSubmit={handleSubmit(onSubmit, onInvalid)} className="space-y-6">
      <div ref={messageRef} className="scroll-mt-6">
        {serverError ? <p className="rounded-md bg-red-50 p-4 text-sm font-semibold text-red-700">{serverError}</p> : null}
        {statusMessage ? <p className="rounded-md bg-navy-50 p-4 text-sm font-semibold text-navy-800">{statusMessage}</p> : null}
      </div>

      <MutedNotice>
        {fiveMinuteDiagnosticNotice}
        <br />
        {privacyNotice}
      </MutedNotice>
      <p className="text-sm font-semibold text-slate-600">
        <span className="text-red-600">*</span> は必須項目です。
      </p>

      <Card className="p-6">
        <h2 className="text-xl font-bold">会社情報</h2>
        <div className="mt-5 grid gap-4 sm:grid-cols-2">
          <TextField label="会社名" registration={register("companyName")} error={errors.companyName?.message} required />
          <SelectField label="業種" options={industryOptions} registration={register("industry")} error={errors.industry?.message} />
          <SelectField label="従業員数" options={employeeCountOptions} registration={register("employeeCount")} error={errors.employeeCount?.message} />
          <TextField label="拠点数" registration={register("officeCount")} error={errors.officeCount?.message} required />
          <TextField label="担当者名" registration={register("contactName")} error={errors.contactName?.message} required />
          <TextField label="役職" registration={register("contactRole")} error={errors.contactRole?.message} required />
          <TextField label="メールアドレス" registration={register("email")} error={errors.email?.message} required />
          <TextField label="電話番号" registration={register("phone")} error={errors.phone?.message} required />
        </div>
      </Card>

      <Card className="p-6">
        <h2 className="text-xl font-bold">
          事前チェック15項目
          <span className="ml-1 text-red-600">*</span>
        </h2>
        <p className="mt-2 text-sm leading-7 text-slate-600">{scoreLabels.join(" / ")}</p>
        <div className="mt-6 space-y-8">
          {Object.entries(groupedQuestions).map(([domain, questions]) => (
            <section key={domain}>
              <h3 className="border-l-4 border-gold-500 pl-3 font-bold">{domain}</h3>
              <div className="mt-4 space-y-4">
                {questions.map((question) => {
                  const index = question.no - 1;
                  return (
                    <div key={question.no} className="rounded-md border border-slate-200 p-4">
                      <p className="font-semibold">
                        {question.no}. {question.question}
                        <span className="ml-1 text-red-600">*</span>
                      </p>
                      <p className="mt-1 text-sm text-slate-600">確認の観点：{question.viewpoint}</p>
                      <input type="hidden" {...register(`checkAnswers.${index}.questionNo`, { valueAsNumber: true })} value={question.no} />
                      <input type="hidden" {...register(`checkAnswers.${index}.domain`)} value={question.domain} />
                      <input type="hidden" {...register(`checkAnswers.${index}.question`)} value={question.question} />
                      <input type="hidden" {...register(`checkAnswers.${index}.viewpoint`)} value={question.viewpoint} />
                      <div className="mt-3 flex flex-wrap gap-3">
                        {[5, 4, 3, 2, 1].map((score) => (
                          <label key={score} className="flex h-10 w-12 items-center justify-center rounded-md border border-slate-300 bg-white text-sm font-semibold">
                            <input className="mr-1" type="radio" value={score} {...register(`checkAnswers.${index}.score`, { valueAsNumber: true })} />
                            {score}
                          </label>
                        ))}
                      </div>
                      <ErrorText message={errors.checkAnswers?.[index]?.score?.message} />
                      <textarea className={`${inputClass} mt-3`} rows={2} placeholder="コメント（任意）" {...register(`checkAnswers.${index}.comment`)} />
                    </div>
                  );
                })}
              </div>
            </section>
          ))}
        </div>
      </Card>

      <Card className="p-6">
        <h2 className="text-xl font-bold">採用・定着・育成課題の確認</h2>
        <div className="mt-5 grid gap-4 sm:grid-cols-2">
          <SelectField label="現在もっとも困っている採用・定着・育成課題" options={hearingOptions.mostImportantIssue} registration={register("hearingMostImportantIssue")} error={errors.hearingMostImportantIssue?.message} />
          <SelectField label="課題が強く出ている階層" options={hearingOptions.targetLayer} registration={register("hearingTargetLayer")} error={errors.hearingTargetLayer?.message} />
          <SelectField label="社員に望む状態" options={hearingOptions.idealState} registration={register("hearingIdealState")} error={errors.hearingIdealState?.message} />
          <SelectField label="研修後の社内フォロー体制" options={hearingOptions.followSystem} registration={register("hearingFollowSystem")} error={errors.hearingFollowSystem?.message} />
        </div>
      </Card>

      <Card className="p-6">
        <h2 className="text-xl font-bold">研修検討条件</h2>
        <div className="mt-5 grid gap-4 sm:grid-cols-2">
          <SelectField label="研修対象階層" options={targetLayers} registration={register("targetLayer")} error={errors.targetLayer?.message} />
          <SelectField label="研修対象人数" options={targetCountOptions} registration={register("targetCount")} error={errors.targetCount?.message} />
          <SelectField label="研修希望時期" options={desiredTimingOptions} registration={register("desiredTiming")} error={errors.desiredTiming?.message} />
          <SelectField label="過去の研修実施" options={pastTrainingOptions} registration={register("pastTraining")} error={errors.pastTraining?.message} />
          <SelectField label="想定する研修期間" options={expectedPeriods} registration={register("expectedPeriod")} error={errors.expectedPeriod?.message} />
          <SelectField label="予算感" options={budgetRanges} registration={register("budgetRange")} error={errors.budgetRange?.message} />
        </div>
        <div className="mt-5">
          <FieldLabel required>検討している主な課題（複数選択可）</FieldLabel>
          <div className="grid gap-2 sm:grid-cols-2">
            {mainIssueOptions.map((option) =>
              option === "その他" ? (
                <div key={option} className="rounded-md border border-slate-200 bg-slate-50 p-3 text-sm">
                  <label className="flex gap-2">
                    <input type="checkbox" value={option} {...register("mainIssues")} />
                    <span>{option}</span>
                  </label>
                  <div className="mt-3 pl-6">
                    <FieldLabel>内容</FieldLabel>
                    <input className={inputClass} placeholder="その他を選択した場合にご記入ください" {...register("mainIssueOther")} />
                  </div>
                </div>
              ) : (
                <label key={option} className="flex gap-2 rounded-md border border-slate-200 bg-slate-50 p-3 text-sm">
                  <input type="checkbox" value={option} {...register("mainIssues")} />
                  <span>{option}</span>
                </label>
              )
            )}
          </div>
          <ErrorText message={errors.mainIssues?.message} />
        </div>
        <div className="mt-5">
          <FieldLabel>補足</FieldLabel>
          <textarea className={inputClass} rows={4} {...register("notes")} />
        </div>
      </Card>

      <Card className="p-6">
        <h2 className="text-xl font-bold">同意事項</h2>
        <div className="mt-4 space-y-3">
          <label className="flex gap-3 text-sm leading-7">
            <input type="checkbox" {...register("consentPrivacy")} />
            <span><span className="font-semibold text-red-600">*</span> 入力情報の取り扱いに同意します。{privacyNotice}</span>
          </label>
          <ErrorText message={errors.consentPrivacy?.message} />
          <label className="flex gap-3 text-sm leading-7">
            <input type="checkbox" {...register("consentAi")} />
            <span><span className="font-semibold text-red-600">*</span> {aiConsentNotice}</span>
          </label>
          <ErrorText message={errors.consentAi?.message} />
        </div>
      </Card>

      <div className="flex justify-end">
        <Button type="submit" disabled={submitting}>
          <Send size={18} />
          {submitting ? "送信中..." : "送信する"}
        </Button>
      </div>
    </form>
  );
}

function TextField({ label, registration, error, required = false }: { label: string; registration: UseFormRegisterReturn; error?: string; required?: boolean }) {
  return (
    <div>
      <FieldLabel required={required}>{label}</FieldLabel>
      <input className={inputClass} {...registration} />
      <ErrorText message={error} />
    </div>
  );
}

function SelectField({ label, options, registration, error, required = true }: { label: string; options: string[]; registration: UseFormRegisterReturn; error?: string; required?: boolean }) {
  return (
    <div>
      <FieldLabel required={required}>{label}</FieldLabel>
      <select className={inputClass} {...registration}>
        <option value="">選択してください</option>
        {options.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
      <ErrorText message={error} />
    </div>
  );
}
