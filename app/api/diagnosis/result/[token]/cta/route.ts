import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";

const ctaClickSchema = z.object({
  ctaType: z.string().trim().min(1).max(100),
  ctaLabel: z.string().trim().min(1).max(200)
});

export async function POST(request: Request, { params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  const parsed = ctaClickSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: "invalid_request" }, { status: 400 });
  }
  const submission = await prisma.submission.findUnique({
    where: { resultToken: token },
    select: { id: true }
  });

  if (!submission) {
    return NextResponse.json({ error: "not_found" }, { status: 404 });
  }

  const clickedAt = new Date();
  await prisma.$transaction([
    prisma.submission.update({
      where: { id: submission.id },
      data: { ctaClickedAt: clickedAt }
    }),
    prisma.ctaClickLog.create({
      data: {
        submissionId: submission.id,
        ctaType: parsed.data.ctaType,
        ctaLabel: parsed.data.ctaLabel,
        createdAt: clickedAt
      }
    })
  ]);

  return NextResponse.json({ ok: true });
}
