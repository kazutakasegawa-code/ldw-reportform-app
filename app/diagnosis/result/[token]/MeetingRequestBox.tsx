"use client";

import { useRef, useState } from "react";
import type { FormEvent } from "react";
import { CalendarCheck, CircleCheckBig } from "lucide-react";
import { Button, Card, FieldLabel, inputClass } from "@/components/ui";
import { aiConsentNotice, informationConsentNotice } from "@/lib/constants";

const completionMessage =
  "入力内容と診断結果をもとに事前分析を行い、日程について弊社よりご連絡いたします。";

function getJapanDateWithOffset(dayOffset: number) {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: "Asia/Tokyo",
    year: "numeric",
    month: "2-digit",
    day: "2-digit"
  }).formatToParts(new Date());
  const year = Number(parts.find((part) => part.type === "year")?.value);
  const month = Number(parts.find((part) => part.type === "month")?.value);
  const day = Number(parts.find((part) => part.type === "day")?.value);
  return new Date(Date.UTC(year, month - 1, day + dayOffset)).toISOString().slice(0, 10);
}

const meetingTimeOptions = Array.from({ length: 18 }, (_, index) => {
  const totalMinutes = 9 * 60 + index * 30;
  const endMinutes = totalMinutes + 30;
  const formatTime = (minutes: number) =>
    `${String(Math.floor(minutes / 60)).padStart(2, "0")}:${String(minutes % 60).padStart(2, "0")}`;
  return `${formatTime(totalMinutes)}〜${formatTime(endMinutes)}`;
});

export default function MeetingRequestBox({
  token,
  focusAreas,
  isImprovementCandidate,
  showComprehensiveConsultation
}: {
  token: string;
  focusAreas: {
    domain: string;
    score: number;
    judgement: string;
    priorityComment: string;
    cta: string;
    product: string;
  }[];
  isImprovementCandidate: boolean;
  showComprehensiveConsultation: boolean;
}) {
  const [open, setOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const bookingFormRef = useRef<HTMLFormElement>(null);

  async function handleCtaClick(ctaType: string, ctaLabel: string) {
    setOpen(true);
    setError("");
    window.setTimeout(() => {
      bookingFormRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
      bookingFormRef.current?.querySelector<HTMLInputElement>('input[type="date"]')?.focus({ preventScroll: true });
    }, 80);
    try {
      await fetch(`/api/diagnosis/result/${token}/cta`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ctaType, ctaLabel })
      });
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
    const earliestMeetingDate = getJapanDateWithOffset(1);
    const hasUnavailableDate = preferredDates.some((preferredDate) => {
      const [date] = preferredDate.split(" ");
      return date !== "" && date < earliestMeetingDate;
    });

    if (hasUnavailableDate) {
      setError("本日以前の日付は選択できません。明日以降の日付を入力してください。");
      setSubmitting(false);
      return;
    }

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
        const responseBody = await response.json().catch(() => null);
        setError(
          typeof responseBody?.error === "string"
            ? responseBody.error
            : "入力内容をご確認ください。希望日時、面談方法、同意チェックは必須です。"
        );
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
    <div className="space-y-5">
      <section>
        <h2 className="text-xl font-bold text-navy-900">
          {isImprovementCandidate ? "今後の改善候補" : "重点確認領域"}
        </h2>
        <p className="mt-2 text-sm leading-7 text-slate-600">
          {isImprovementCandidate
            ? "50点以下の領域はありませんでした。全体的に大きな弱点は見られませんが、最もスコアが低かった領域を今後の改善候補として表示しています。"
            : "50点以下の領域は、採用・定着・育成の仕組みとして優先的に確認したい項目です。複数ある場合は、それぞれの課題が関連している可能性があります。"}
        </p>
        <div className="mt-4 grid gap-4 lg:grid-cols-2">
          {focusAreas.map((area) => (
            <Card key={area.domain} className="border-navy-200 bg-white p-6">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-xs font-bold text-gold-600">
                    {isImprovementCandidate ? "今後の改善候補" : "重点確認領域"}
                  </p>
                  <h3 className="mt-1 text-xl font-bold text-navy-900">{area.domain}</h3>
                </div>
                <div className="shrink-0 rounded-md bg-gold-100 px-4 py-2 text-center text-navy-900">
                  <strong className="text-2xl">{area.score}</strong>
                  <span className="ml-1 text-xs font-bold">点</span>
                  <p className="text-xs font-semibold">{area.judgement}</p>
                </div>
              </div>
              <p className="mt-4 text-sm leading-7 text-slate-700">{area.priorityComment}</p>
              <div className="mt-4 rounded-md bg-slate-50 p-4">
                <p className="text-xs font-semibold text-slate-500">おすすめの次の一手</p>
                <p className="mt-1 font-bold text-navy-900">{area.product}</p>
              </div>
              <Button
                type="button"
                onClick={() => handleCtaClick(`domain:${area.domain}`, area.cta)}
                className="mt-5 w-full justify-center px-5 py-4 text-sm"
              >
                <CalendarCheck size={20} />
                {area.cta}
              </Button>
            </Card>
          ))}
        </div>
      </section>

      {showComprehensiveConsultation ? (
        <Card className="border-gold-400 !bg-navy-900 p-6 !text-white">
          <h2 className="text-xl font-bold !text-white">採用・定着・育成をまとめて整理する必要がある可能性があります</h2>
          <p className="mt-3 text-sm leading-7 !text-slate-100">
            複数の領域が50点以下の場合、原因は一つではなく、採用時の魅力づけ、入社後の関わり、育成の仕組みがつながっている可能性があります。30分面談＋AI詳細診断で、優先順位と具体的な次の一手を整理します。
          </p>
          <Button
            type="button"
            onClick={() => handleCtaClick("comprehensive", "採用から定着・育成までまとめて相談する")}
            className="mt-5 w-full justify-center border border-white !bg-white px-6 py-4 text-base !text-navy-900 hover:!bg-slate-100 sm:w-auto"
          >
            <CalendarCheck size={20} />
            採用から定着・育成までまとめて相談する
          </Button>
        </Card>
      ) : null}

      <Card className="border-gold-300 bg-gold-50 p-6">
      <div>
        <div>
          <h2 className="text-xl font-bold text-navy-900">診断結果をもとに、30分で優先課題と次の一手を整理しませんか？</h2>
          <p className="mt-3 text-sm leading-7 text-slate-700">
            レーダーチャートで低く出た領域には、複数の背景要因が関係している可能性があります。30分面談＋AI詳細診断では、診断結果をもとに、御社の採用・定着・育成の優先課題、背景要因、具体的な次の一手を整理します。
          </p>
          <p className="mt-3 text-sm font-semibold text-navy-900">初回0円／面談30分／A4分析レポート付き／毎月5社まで</p>
          <p className="mt-2 text-xs leading-6 text-slate-600">AI分析は補助であり、最終的な確認・判断は弊社が行います。</p>
        </div>
        <div className="mt-5">
          <Button
            type="button"
            onClick={() => handleCtaClick("common", "30分面談＋AI詳細診断を予約する")}
            className="w-full justify-center px-6 py-4 text-base sm:w-auto sm:min-w-[360px]"
          >
            <CalendarCheck size={20} />
            30分面談＋AI詳細診断を予約する
          </Button>
        </div>
      </div>

      {message ? (
        <div
          role="status"
          className="mt-6 flex items-start gap-4 rounded-md border-2 border-gold-400 bg-navy-900 p-5 text-white shadow-sm"
        >
          <CircleCheckBig className="mt-0.5 shrink-0 text-gold-400" size={28} aria-hidden="true" />
          <div>
            <p className="text-lg font-bold text-white">30分面談＋AI詳細診断のお申込みありがとうございます。</p>
            <p className="mt-2 text-sm font-semibold leading-7 text-white">{message}</p>
          </div>
        </div>
      ) : null}
      {open ? (
        <form
          ref={bookingFormRef}
          onSubmit={handleSubmit}
          onInvalid={(event) => {
            const target = event.target as HTMLInputElement;
            if (target.type === "date" && target.validity.rangeUnderflow) {
              event.preventDefault();
              setError("本日以前の日付は選択できません。明日以降の日付を入力してください。");
            }
          }}
          className="scroll-mt-6 mt-6 grid gap-4 rounded-lg border border-gold-200 bg-white p-5 sm:grid-cols-2"
        >
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
            <span>{aiConsentNotice}</span>
          </label>
          <label className="flex gap-3 text-sm leading-7 sm:col-span-2">
            <input type="checkbox" name="consentPrivacy" required />
            <span>{informationConsentNotice}</span>
          </label>
          <div className="flex flex-col gap-3 sm:col-span-2 sm:flex-row sm:items-center sm:justify-between">
            {error ? (
              <p role="alert" className="rounded-md border border-red-300 bg-red-50 px-4 py-3 text-sm font-bold text-red-700">
                {error}
              </p>
            ) : <span />}
            <Button type="submit" disabled={submitting}>
              {submitting ? "送信中..." : "面談希望を送信する"}
            </Button>
          </div>
        </form>
      ) : null}
      </Card>
    </div>
  );
}

function PreferredDateInput({ index }: { index: number }) {
  const earliestMeetingDate = getJapanDateWithOffset(1);

  return (
    <div>
      <FieldLabel required>希望日時 第{index}希望</FieldLabel>
      <div className="grid gap-2 sm:grid-cols-[1fr_0.8fr]">
        <input name={`preferredDate${index}Date`} type="date" min={earliestMeetingDate} className={inputClass} required />
        <select name={`preferredDate${index}Time`} className={inputClass} defaultValue="" required>
          <option value="">時間を選択</option>
          {meetingTimeOptions.map((time) => (
            <option key={time} value={time}>{time}</option>
          ))}
          <option value="その他">その他</option>
        </select>
      </div>
    </div>
  );
}
