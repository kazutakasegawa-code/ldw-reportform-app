export const analysisFieldDefinitions = [
  { name: "overallFinding", label: "総合所見", limit: 180 },
  { name: "strengths", label: "組織の強み", limit: 135 },
  { name: "topIssues", label: "現在の課題トップ3", limit: 150 },
  { name: "visibleProblems", label: "表面的に見えている問題", limit: 120 },
  { name: "causeHypotheses", label: "背景にある原因仮説", limit: 155 },
  { name: "actionsToIncrease", label: "優先して増やす行動", limit: 80 },
  { name: "actionsToDecrease", label: "優先して減らす行動", limit: 80 },
  { name: "thingiFit", label: "THINGi®︎の適合度・理由", limit: 60 },
  { name: "notebookFit", label: "しあわせ360°手帳の適合度・理由", limit: 60 },
  { name: "coachingFit", label: "コーチングの適合度・理由", limit: 60 },
  { name: "recommendedProgram", label: "AI分析による推奨プログラム", limit: 120 },
  { name: "kpis", label: "成果確認指標", limit: 90 },
  { name: "managementSupport", label: "経営者・管理職に求める支援", limit: 120 },
  { name: "domainComments", label: "5領域コメント", limit: 100 },
  { name: "additionalQuestions", label: "30分面談での追加確認事項", limit: 110 }
] as const;

export type AnalysisFieldName = (typeof analysisFieldDefinitions)[number]["name"];

export const analysisReportLimits = Object.fromEntries(
  analysisFieldDefinitions.map(({ name, limit }) => [name, limit])
) as Record<AnalysisFieldName, number>;

export function limitAnalysisText(name: AnalysisFieldName, value: string) {
  return value.slice(0, analysisReportLimits[name]);
}
