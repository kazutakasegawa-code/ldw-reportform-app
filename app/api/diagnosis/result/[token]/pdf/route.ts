import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

const pdfPrintableStatuses = ["5分診断完了", "結果閲覧済み"];

export async function POST(_request: Request, { params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  const submission = await prisma.submission.findUnique({
    where: { resultToken: token },
    select: { id: true, status: true }
  });

  if (!submission) {
    return NextResponse.json({ error: "not_found" }, { status: 404 });
  }

  if (pdfPrintableStatuses.includes(submission.status)) {
    await prisma.submission.update({
      where: { id: submission.id },
      data: { status: "PDF出力済み" }
    });
  }

  return NextResponse.json({ ok: true });
}
