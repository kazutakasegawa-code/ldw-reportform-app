import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { analysisUpdateSchema } from "@/lib/schema";

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  await requireAdmin();
  const { id } = await params;
  const parsed = analysisUpdateSchema.safeParse(await request.json());
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }
  await prisma.analysisResult.upsert({
    where: { submissionId: id },
    update: parsed.data,
    create: { submissionId: id, ...parsed.data }
  });
  return NextResponse.json({ ok: true });
}
