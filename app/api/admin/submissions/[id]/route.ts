import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { adminUpdateSchema } from "@/lib/schema";

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  await requireAdmin();
  const { id } = await params;
  const parsed = adminUpdateSchema.safeParse(await request.json());
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }
  const { meetingDate, reportDate, ...data } = parsed.data;
  await prisma.submission.update({
    where: { id },
    data: {
      ...data,
      meetingDate: meetingDate ? new Date(meetingDate) : null,
      reportDate: reportDate ? new Date(`${reportDate}T00:00:00`) : null
    }
  });
  return NextResponse.json({ ok: true });
}

export async function DELETE(_: Request, { params }: { params: Promise<{ id: string }> }) {
  await requireAdmin();
  const { id } = await params;
  await prisma.submission.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
