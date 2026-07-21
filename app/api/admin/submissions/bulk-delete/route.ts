import { NextResponse } from "next/server";
import { z } from "zod";
import { requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const bulkDeleteSchema = z.object({
  ids: z.array(z.string().min(1)).min(1)
});

export async function POST(request: Request) {
  await requireAdmin();
  const parsed = bulkDeleteSchema.safeParse(await request.json());
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  await prisma.submission.deleteMany({
    where: { id: { in: parsed.data.ids } }
  });

  return NextResponse.json({ ok: true });
}
