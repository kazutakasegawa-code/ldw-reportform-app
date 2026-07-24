import type { AnalysisResult, CheckAnswer, Submission } from "@prisma/client";
import { aiCaution, diagnosticNotice } from "./constants";
import { formatDateTimeJst } from "./date";
import { calculateResultDomainScores, calculateOverallResultScore, summarizeResultScores } from "./scoring";
import { analysisFieldDefinitions } from "./analysis";

type SubmissionWithRelations = Submission & {
  checkAnswers: CheckAnswer[];
  analysisResult?: AnalysisResult | null;
};

export function buildAnalysisPrompt(submission: SubmissionWithRelations) {
  const resultScores = calculateResultDomainScores(submission.checkAnswers);
  const overallResultScore = calculateOverallResultScore(resultScores);
  const resultSummary = summarizeResultScores(resultScores);
  const focusAreaLines = resultSummary.focusAreas
    .map((area) => `- ${area.domain}: ${area.score}点 / ${area.judgement}
  状況仮説: ${area.priorityComment}
  おすすめの次の一手: ${area.product}
  相談CTA: ${area.cta}`)
    .join("\n");
  const comprehensiveRecommendation = resultSummary.showComprehensiveConsultation
    ? `
- 総合相談CTAを表示
  採用・定着・育成をまとめて整理する必要がある可能性があります。
  複数の領域が50点以下のため、30分面談＋AI詳細診断で優先順位と具体的な次の一手を整理します。
  相談CTA: 採用から定着・育成までまとめて相談する`
    : "";
  const sortedAnswers = [...submission.checkAnswers].sort((a, b) => a.questionNo - b.questionNo);
  const answerLines = sortedAnswers
    .sort((a, b) => a.questionNo - b.questionNo)
    .map((answer) => {
      const resultDomain = resultScores.find((score) => score.sourceDomain === answer.domain);
      return `${answer.questionNo}. ${resultDomain?.domain ?? answer.domain}
質問: ${answer.question}
確認の観点: ${answer.viewpoint}
評価: ${answer.score}（${answer.score * 20}点換算）
コメント: ${answer.comment || "なし"}`;
    })
    .join("\n");
  const domainDetailLines = resultScores
    .map((score) => {
      const answers = sortedAnswers.filter((answer) => answer.domain === score.sourceDomain);
      const lowAnswers = answers.filter((answer) => answer.score <= 2).map((answer) => `${answer.questionNo}:${answer.score}（${answer.score * 20}点換算）`).join("、") || "なし";
      const highAnswers = answers.filter((answer) => answer.score >= 4).map((answer) => `${answer.questionNo}:${answer.score}（${answer.score * 20}点換算）`).join("、") || "なし";
      const comments = answers
        .filter((answer) => answer.comment)
        .map((answer) => `Q${answer.questionNo}: ${answer.comment}`)
        .join(" / ") || "コメントなし";
      return `${score.domain}: ${score.score}点 / 判定${score.judgement} / コメント:${score.comment} / 元平均:${score.average ?? "未入力"}（1〜5評価） / 高評価:${highAnswers} / 低評価:${lowAnswers} / コメント:${comments}`;
    })
    .join("\n");

  return `あなたは採用・定着・人材育成・組織開発の分析補助者です。最終的な確認・判断は弊社が行う前提で、企業担当者の事前回答を整理してください。

重要注意:
${diagnosticNotice}
${aiCaution}

出力項目:
- 総合所見
- 組織の強み
- 現在の課題トップ3
- 表面的に見えている問題
- 背景にある原因仮説
- 優先して増やす行動
- 優先して減らす行動
- THINGi®︎の適合度・理由
- しあわせ360°手帳の適合度・理由
- コーチングの適合度・理由
- AI分析による推奨プログラム
- 成果確認指標
- 経営者・管理職に求める支援
- 5領域コメント
- 30分面談での追加確認事項

出力条件:
- 経営者・人事担当者等にそのまま読ませても違和感のない日本語にしてください。
- 事実として回答されている内容と、原因仮説を分けてください。
- 社員個人の能力・適性・性格・人事評価は断定しないでください。
- 「可能性があります」「確認が必要です」など、仮説表現を使ってください。
- 各項目はレポートに貼り付けやすいよう、短い段落または箇条書きで整理してください。
- 成果確認指標は1行1指標で5項目以内にしてください。
- 30分面談での追加確認事項は、面談で質問しやすい形にしてください。
- 各項目は次のレポート表示文字数上限を必ず守ってください。

レポート表示文字数上限:
${analysisFieldDefinitions.map(({ label, limit }) => `- ${label}: ${limit}文字以内`).join("\n")}

会社情報:
会社名: ${submission.companyName}
業種: ${submission.industry}
従業員数: ${submission.employeeCount}
拠点数: ${submission.officeCount}
担当者: ${submission.contactName} / ${submission.contactRole}
メール: ${submission.email}
電話: ${submission.phone}

研修検討条件:
対象階層: ${submission.targetLayer}
対象人数: ${submission.targetCount}
希望時期: ${submission.desiredTiming}
過去の研修実施: ${submission.pastTraining}
主な課題: ${submission.mainIssues}
想定期間: ${submission.expectedPeriod}
予算感: ${submission.budgetRange}
補足: ${submission.notes || "なし"}

採用・定着・育成課題の確認:
現在もっとも困っている課題: ${submission.hearingMostImportantIssue}
課題が強く出ている階層: ${submission.hearingTargetLayer}
社員に望む状態: ${submission.hearingIdealState}
研修後フォロー体制: ${submission.hearingFollowSystem}
30分面談で確認したいこと: ${submission.hearingQuestion || "なし"}

管理者入力情報:
ステータス: ${submission.status}
面談予定日: ${submission.meetingDate ? formatDateTimeJst(submission.meetingDate) : "未設定"}
面談メモ: ${submission.meetingMemo || "なし"}
優先課題: ${submission.priorityIssue || "未設定"}
レポート表示用 推奨プラン: ${submission.recommendedPlan || "未設定"}
顧客レポートに表示するコメント: ${submission.reportComment || "なし"}

スコア概要:
総合スコア: ${overallResultScore}点
${resultScores.map((score) => `${score.domain}: ${score.score}点 / ${score.judgement} / ${score.comment}`).join("\n")}

5領域別詳細:
${domainDetailLines}

5領域スコアからの一次推奨（自動判定）:
表示区分: ${resultSummary.isImprovementCandidate ? "今後の改善候補" : "重点確認領域"}
50点以下の領域数: ${resultSummary.priorityAreas.length}
${focusAreaLines}${comprehensiveRecommendation}

事前チェック回答:
${answerLines}

表現は経営者・人事担当者に伝わる日本語で、断定を避け、事実と仮説を分けてください。`;
}
