import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { meetingRequestSchema } from "@/lib/schema";

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

export async function POST(request: Request, { params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  const json = await request.json();
  const parsed = meetingRequestSchema.safeParse(json);

  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const earliestMeetingDate = getJapanDateWithOffset(1);
  const hasUnavailableDate = parsed.data.preferredDates.some((preferredDate) => {
    const [date] = preferredDate.split(" ");
    return date !== "" && date < earliestMeetingDate;
  });

  if (hasUnavailableDate) {
    return NextResponse.json(
      { error: "本日以前の日付は選択できません。明日以降の日付を入力してください。" },
      { status: 400 }
    );
  }

  const submission = await prisma.submission.findUnique({
    where: { resultToken: token },
    select: { id: true }
  });

  if (!submission) {
    return NextResponse.json({ error: "not_found" }, { status: 404 });
  }

  const { preferredDates, meetingMethod, memo } = parsed.data;
  const preferredMeetingDates = [
    `第1希望：${preferredDates[0] || "未入力"}`,
    `第2希望：${preferredDates[1] || "未入力"}`,
    `第3希望：${preferredDates[2] || "未入力"}`,
    `面談方法：${meetingMethod}`
  ].join("\n");

  await prisma.submission.update({
    where: { id: submission.id },
    data: {
      meetingRequestedAt: new Date(),
      preferredMeetingDates,
      meetingRequestMemo: memo,
      status: "面談希望あり"
    }
  });

  return NextResponse.json({ ok: true });
}
