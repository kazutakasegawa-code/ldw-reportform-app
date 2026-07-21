import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(_request: Request, { params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  const submission = await prisma.submission.findUnique({
    where: { resultToken: token },
    select: { id: true }
  });

  if (!submission) {
    return NextResponse.json({ error: "not_found" }, { status: 404 });
  }

  return NextResponse.json({ ok: true });
}
