import { NextResponse } from "next/server";
import { randomBytes } from "crypto";
import { checkQuestions } from "@/lib/constants";
import { prisma } from "@/lib/prisma";
import { diagnosisSchema } from "@/lib/schema";
import { calculateDomainScores, recommendPlan } from "@/lib/scoring";

function createResultToken() {
  return randomBytes(24).toString("base64url");
}

export async function POST(request: Request) {
  const json = await request.json();
  const parsed = diagnosisSchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const { checkAnswers, mainIssues, mainIssueOther, ...data } = parsed.data;
  const answerByQuestionNo = new Map(checkAnswers.map((answer) => [answer.questionNo, answer]));
  if (answerByQuestionNo.size !== checkQuestions.length || checkQuestions.some((question) => !answerByQuestionNo.has(question.no))) {
    return NextResponse.json({ error: "事前チェック15項目をすべて選択してください" }, { status: 400 });
  }
  const normalizedCheckAnswers = checkQuestions.map((question) => {
    const answer = answerByQuestionNo.get(question.no)!;
    return {
      questionNo: question.no,
      domain: question.domain,
      question: question.question,
      viewpoint: question.viewpoint,
      score: answer.score,
      comment: answer.comment || ""
    };
  });
  const domainScores = calculateDomainScores(normalizedCheckAnswers);
  const recommendation = recommendPlan(domainScores);
  const normalizedMainIssues = mainIssueOther?.trim() ? [...mainIssues, `その他：${mainIssueOther.trim()}`] : mainIssues;

  const submission = await prisma.submission.create({
    data: {
      resultToken: createResultToken(),
      ...data,
      consentAi: false,
      mainIssues: normalizedMainIssues.join("、"),
      status: "5分診断完了",
      recommendedPlan: recommendation.plan,
      checkAnswers: {
        create: normalizedCheckAnswers
      },
      analysisResult: {
        create: {
          recommendedProgram: `${recommendation.plan}\n狙い：${recommendation.aim}`,
          kpis: "自分から相談・提案する行動\n個人目標とチーム目標の理解\n週1回の振り返り実施\n他者の強みを活かす行動\n1on1・フォロー実施率"
        }
      }
    }
  });

  return NextResponse.json({ id: submission.id, resultToken: submission.resultToken });
}
