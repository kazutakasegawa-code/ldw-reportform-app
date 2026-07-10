import { z } from "zod";

export const diagnosisSchema = z.object({
  companyName: z.string().min(1, "会社名を入力してください"),
  industry: z.string().min(1, "業種を入力してください"),
  employeeCount: z.string().min(1, "従業員数を入力してください"),
  officeCount: z.string().min(1, "拠点数を入力してください"),
  contactName: z.string().min(1, "担当者名を入力してください"),
  contactRole: z.string().min(1, "役職を入力してください"),
  email: z.string().email("メールアドレスの形式で入力してください"),
  phone: z.string().min(1, "電話番号を入力してください"),
  targetLayer: z.string().min(1, "研修対象階層を選択してください"),
  targetCount: z.string().min(1, "対象人数を入力してください"),
  desiredTiming: z.string().min(1, "希望時期を入力してください"),
  pastTraining: z.string().min(1, "過去の研修実施を選択してください"),
  mainIssues: z.array(z.string()).min(1, "主な課題を1つ以上選択してください"),
  mainIssueOther: z.string().optional(),
  expectedPeriod: z.string().min(1, "想定する研修期間を選択してください"),
  budgetRange: z.string().min(1, "予算感を選択してください"),
  notes: z.string().optional(),
  hearingMostImportantIssue: z.string().min(1, "現在もっとも困っている人材育成課題を選択してください"),
  hearingTargetLayer: z.string().min(1, "課題が強く出ている階層を選択してください"),
  hearingIdealState: z.string().min(1, "社員に望む状態を選択してください"),
  hearingFollowSystem: z.string().min(1, "研修後の社内フォロー体制を選択してください"),
  hearingQuestion: z.string().optional(),
  consentPrivacy: z.literal(true, { errorMap: () => ({ message: "入力情報の取り扱いに同意してください" }) }),
  consentAi: z.literal(true, { errorMap: () => ({ message: "AI利用に関する説明に同意してください" }) }),
  checkAnswers: z.array(
    z.object({
      questionNo: z.number(),
      domain: z.string(),
      question: z.string(),
      viewpoint: z.string(),
      score: z.preprocess(
        (value) => {
          if (value === "" || value === undefined || Number.isNaN(value)) return undefined;
          return Number(value);
        },
        z.number({
          required_error: "評価を選択してください",
          invalid_type_error: "評価を選択してください"
        }).min(1, "評価を選択してください").max(5, "評価を選択してください")
      ),
      comment: z.string().optional()
    })
  ).length(15)
});

export type DiagnosisInput = z.infer<typeof diagnosisSchema>;

export const adminUpdateSchema = z.object({
  status: z.string().min(1),
  meetingDate: z.string().optional(),
  reportDate: z.string().optional(),
  meetingMemo: z.string().optional(),
  priorityIssue: z.string().optional(),
  recommendedPlan: z.string().optional(),
  reportComment: z.string().optional()
});

export const analysisUpdateSchema = z.object({
  overallFinding: z.string().optional(),
  strengths: z.string().optional(),
  topIssues: z.string().optional(),
  visibleProblems: z.string().optional(),
  causeHypotheses: z.string().optional(),
  actionsToIncrease: z.string().optional(),
  actionsToDecrease: z.string().optional(),
  thingiFit: z.string().optional(),
  notebookFit: z.string().optional(),
  coachingFit: z.string().optional(),
  recommendedProgram: z.string().optional(),
  kpis: z.string().optional(),
  managementSupport: z.string().optional(),
  domainComments: z.string().optional(),
  additionalQuestions: z.string().optional()
});
