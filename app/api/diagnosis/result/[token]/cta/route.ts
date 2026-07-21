import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(_: Request, { params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  const submission = await prisma.submission.findUnique({
    where: { resultToken: token },
    select: { id: true }
  });

  if (!submission) {
    return NextResponse.json({ error: "not_found" }, { status: 404 });
  }

  await prisma.submission.update({
    where: { id: submission.id },
    data: { ctaClickedAt: new Date() }
  });

  return NextResponse.json({ ok: true });
}
