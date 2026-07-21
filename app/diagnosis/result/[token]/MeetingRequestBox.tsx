"use client";

import { useState } from "react";
import type { FormEvent } from "react";
import { CalendarCheck } from "lucide-react";
import { Button, Card, FieldLabel, inputClass } from "@/components/ui";

const completionMessage =
  "30分面談＋AI詳細診断のお申込みありがとうございます。入力内容と診断結果をもとに事前分析を行い、日程についてLife Design Worksよりご連絡いたします。";

export default function MeetingRequestBox({ token }: { token: string }) {
  const [open, setOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  async function handleCtaClick() {
    setOpen(true);
    setError("");
    try {
      await fetch(`/api/diagnosis/result/${token}/cta`, { method: "POST" });
    } catch {
      // CTA表示は止めず、面談申込み保存時に再度記録します。
    }
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitting(true);
    setError("");
    setMessage("");

    const formData = new FormData(event.currentTarget);
    const preferredDates = [1, 2, 3].map((index) => {
      const date = String(formData.get(`preferredDate${index}Date`) || "");
      const time = String(formData.get(`preferredDate${index}Time`) || "");
      return `${date} ${time}`.trim();
    });
    const payload = {
      preferredDates,
      meetingMethod: String(formData.get("meetingMethod") || ""),
      memo: String(formData.get("memo") || ""),
      consentAi: formData.get("consentAi") === "on",
      consentPrivacy: formData.get("consentPrivacy") === "on"
    };

    try {
      const response = await fetch(`/api/diagnosis/result/${token}/meeting`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      if (!response.ok) {
        setError("入力内容をご確認ください。希望日時、面談方法、同意チェックは必須です。");
        return;
      }
      setMessage(completionMessage);
      setOpen(false);
    } catch {
      setError("送信に失敗しました。通信状況をご確認のうえ、もう一度お試しください。");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Card className="border-gold-300 bg-gold-50 p-6">
      <div>
        <div>
          <h2 className="text-xl font-bold text-navy-900">診断結果をもとに、30分で優先課題と次の一手を整理しませんか？</h2>
          <p className="mt-3 text-sm leading-7 text-slate-700">
            レーダーチャートで低く出た領域には、複数の背景要因が関係している可能性があります。30分面談＋AI詳細診断では、回答内容をもとに、御社の強み・優先課題・背景にある原因仮説・次に行う育成施策をA4分析レポートとして整理します。
          </p>
          <p className="mt-3 text-sm font-semibold text-navy-900">面談30分／A4分析レポート付き／毎月5社まで</p>
          <p className="mt-2 text-xs leading-6 text-slate-600">AI分析は補助であり、最終的な確認・判断はLife Design Worksが行います。</p>
        </div>
        <div className="mt-5">
          <Button type="button" onClick={handleCtaClick} className="w-full justify-center px-6 py-4 text-base sm:w-auto sm:min-w-[360px]">
            <CalendarCheck size={20} />
            30分面談＋AI詳細診断を予約する
          </Button>
        </div>
      </div>

      {message ? <p className="mt-5 rounded-md bg-white p-4 text-sm font-semibold text-navy-800">{message}</p> : null}
      {error ? <p className="mt-5 rounded-md bg-red-50 p-4 text-sm font-semibold text-red-700">{error}</p> : null}

      {open ? (
        <form onSubmit={handleSubmit} className="mt-6 grid gap-4 rounded-lg border border-gold-200 bg-white p-5 sm:grid-cols-2">
          <PreferredDateInput index={1} />
          <PreferredDateInput index={2} />
          <PreferredDateInput index={3} />
          <div>
            <FieldLabel required>面談方法</FieldLabel>
            <select name="meetingMethod" className={inputClass} defaultValue="" required>
              <option value="">選択してください</option>
              <option value="オンライン希望">オンライン希望</option>
              <option value="直接対面希望">直接対面希望</option>
              <option value="相談したい">相談したい</option>
            </select>
          </div>
          <div className="sm:col-span-2">
            <FieldLabel>30分面談で特に確認したいこと</FieldLabel>
            <textarea name="memo" className={inputClass} rows={4} />
          </div>
          <label className="flex gap-3 text-sm leading-7 sm:col-span-2">
            <input type="checkbox" name="consentAi" required />
            <span>AI利用への同意</span>
          </label>
          <label className="flex gap-3 text-sm leading-7 sm:col-span-2">
            <input type="checkbox" name="consentPrivacy" required />
            <span>個人情報利用への同意</span>
          </label>
          <div className="flex justify-end sm:col-span-2">
            <Button type="submit" disabled={submitting}>
              {submitting ? "送信中..." : "面談希望を送信する"}
            </Button>
          </div>
        </form>
      ) : null}
    </Card>
  );
}

function PreferredDateInput({ index }: { index: number }) {
  return (
    <div>
      <FieldLabel required>希望日時 第{index}希望</FieldLabel>
      <div className="grid gap-2 sm:grid-cols-[1fr_0.8fr]">
        <input name={`preferredDate${index}Date`} type="date" className={inputClass} required />
        <input name={`preferredDate${index}Time`} type="text" className={inputClass} placeholder="例：10:00〜11:00" required />
      </div>
    </div>
  );
}
