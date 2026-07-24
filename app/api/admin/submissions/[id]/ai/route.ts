import { NextResponse } from "next/server";
import OpenAI from "openai";
import { requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { buildAnalysisPrompt } from "@/lib/prompt";
import { limitAnalysisText } from "@/lib/analysis";

const analysisFieldKeys = [
  "overallFinding",
  "strengths",
  "topIssues",
  "visibleProblems",
  "causeHypotheses",
  "actionsToIncrease",
  "actionsToDecrease",
  "thingiFit",
  "notebookFit",
  "coachingFit",
  "recommendedProgram",
  "kpis",
  "managementSupport",
  "domainComments",
  "additionalQuestions"
] as const;

export async function POST(_: Request, { params }: { params: Promise<{ id: string }> }) {
  await requireAdmin();
  const { id } = await params;
  const submission = await prisma.submission.findUnique({
    where: { id },
    include: { checkAnswers: true, analysisResult: true }
  });
  if (!submission) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  if (!submission.consentAi) {
    return NextResponse.json(
      { message: "30分面談申込み時のAI利用同意が確認できないため、AI分析は実行できません。" },
      { status: 403 }
    );
  }
  const prompt = buildAnalysisPrompt(submission);
  if (!process.env.OPENAI_API_KEY) {
    return NextResponse.json({ prompt, message: "OPENAI_API_KEYが未設定です。" });
  }

  const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  try {
    const completion = await client.chat.completions.create({
      model: process.env.OPENAI_MODEL || "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: [
            "あなたは人材育成・組織開発レポートの分析補助者です。",
            "出力は日本語で、必ずJSONオブジェクトのみを返してください。",
            "各値は顧客レポートに転記しやすい簡潔な文章にしてください。"
          ].join("\n")
        },
        {
          role: "user",
          content: `${prompt}

以下のキーを持つJSONだけで出力してください。
{
  "overallFinding": "総合所見",
  "strengths": "組織の強み",
  "topIssues": "現在の課題トップ3",
  "visibleProblems": "表面的に見えている問題",
  "causeHypotheses": "背景にある原因仮説",
  "actionsToIncrease": "優先して増やす行動",
  "actionsToDecrease": "優先して減らす行動",
  "thingiFit": "THINGi®︎の適合度・理由",
  "notebookFit": "しあわせ360°手帳の適合度・理由",
  "coachingFit": "コーチングの適合度・理由",
  "recommendedProgram": "AI分析による推奨プログラム",
  "kpis": "成果確認指標。1行1指標で記述",
  "managementSupport": "経営者・管理職に求める支援",
  "domainComments": "5領域コメント",
  "additionalQuestions": "30分面談での追加確認事項"
}`
        }
      ],
      response_format: { type: "json_object" },
      temperature: 0.3
    });

    const result = completion.choices[0]?.message.content ?? "";
    const analysis = normalizeAnalysisResult(JSON.parse(result) as unknown);
    await prisma.analysisResult.upsert({
      where: { submissionId: id },
      update: analysis,
      create: { submissionId: id, ...analysis }
    });
    return NextResponse.json({
      prompt,
      result,
      analysis,
      message: "AI分析結果を生成し、編集欄に保存しました。内容を確認して必要に応じて編集してください。"
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { prompt, message: "AI分析の実行に失敗しました。APIキー、利用上限、ネットワーク状態を確認してください。" },
      { status: 500 }
    );
  }
}

function normalizeAnalysisResult(value: unknown) {
  const source = isRecord(value) ? value : {};
  return analysisFieldKeys.reduce<Record<(typeof analysisFieldKeys)[number], string>>((acc, key) => {
    const fieldValue = source[key];
    acc[key] = typeof fieldValue === "string" ? limitAnalysisText(key, fieldValue) : "";
    return acc;
  }, {} as Record<(typeof analysisFieldKeys)[number], string>);
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}
