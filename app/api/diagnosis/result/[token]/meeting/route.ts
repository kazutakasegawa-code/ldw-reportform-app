import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { meetingRequestSchema } from "@/lib/schema";

export async function POST(request: Request, { params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  const json = await request.json();
  const parsed = meetingRequestSchema.safeParse(json);

  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
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
      ctaClickedAt: new Date(),
      meetingRequestedAt: new Date(),
      preferredMeetingDates,
      meetingRequestMemo: memo,
      status: "面談希望あり"
    }
  });

  return NextResponse.json({ ok: true });
}
