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
  targetCount: z.string().min(1, "研修対象人数を選択してください"),
  desiredTiming: z.string().min(1, "研修希望時期を選択してください"),
  pastTraining: z.string().min(1, "過去の研修実施を選択してください"),
  mainIssues: z.array(z.string()).min(1, "主な課題を1つ以上選択してください"),
  mainIssueOther: z.string().optional(),
  expectedPeriod: z.string().min(1, "想定する研修期間を選択してください"),
  budgetRange: z.string().min(1, "予算感を選択してください"),
  notes: z.string().optional(),
  hearingMostImportantIssue: z.string().min(1, "現在もっとも困っている採用・定着・育成課題を選択してください"),
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
  meetingTime: z.string().optional(),
  reportDate: z.string().optional(),
  meetingMemo: z.string().optional(),
  priorityIssue: z.string().optional(),
  recommendedPlan: z.string().optional(),
  reportComment: z.string().optional()
});

export const analysisUpdateSchema = z.object({
  overallFinding: z.string().max(180, "総合所見は180文字以内で入力してください").optional(),
  strengths: z.string().max(135, "組織の強みは135文字以内で入力してください").optional(),
  topIssues: z.string().max(150, "現在の課題トップ3は150文字以内で入力してください").optional(),
  visibleProblems: z.string().max(120, "表面的に見えている問題は120文字以内で入力してください").optional(),
  causeHypotheses: z.string().max(155, "背景にある原因仮説は155文字以内で入力してください").optional(),
  actionsToIncrease: z.string().max(80, "優先して増やす行動は80文字以内で入力してください").optional(),
  actionsToDecrease: z.string().max(80, "優先して減らす行動は80文字以内で入力してください").optional(),
  thingiFit: z.string().max(60, "THINGi®︎の適合度・理由は60文字以内で入力してください").optional(),
  notebookFit: z.string().max(60, "しあわせ360°手帳の適合度・理由は60文字以内で入力してください").optional(),
  coachingFit: z.string().max(60, "コーチングの適合度・理由は60文字以内で入力してください").optional(),
  recommendedProgram: z.string().max(120, "AI分析による推奨プログラムは120文字以内で入力してください").optional(),
  kpis: z.string().max(90, "成果確認指標は90文字以内で入力してください").optional(),
  managementSupport: z.string().max(120, "経営者・管理職に求める支援は120文字以内で入力してください").optional(),
  domainComments: z.string().max(100, "5領域コメントは100文字以内で入力してください").optional(),
  additionalQuestions: z.string().max(110, "30分面談での追加確認事項は110文字以内で入力してください").optional()
});

export const meetingRequestSchema = z.object({
  preferredDates: z.array(z.string().trim().min(1, "希望日時を入力してください")).length(3),
  meetingMethod: z.string().min(1, "面談方法を選択してください"),
  memo: z.string().optional(),
  consentAi: z.literal(true, { errorMap: () => ({ message: "AI利用に同意してください" }) }),
  consentPrivacy: z.literal(true, { errorMap: () => ({ message: "入力情報の利用に同意してください" }) })
});
