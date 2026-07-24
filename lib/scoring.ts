import type { CheckAnswer } from "@prisma/client";

export type DomainScore = {
  domain: string;
  average: number | null;
  judgement: string;
  meaning: string;
  response: string;
};

export type ResultDomainScore = {
  domain: string;
  sourceDomain: string;
  score: number;
  average: number | null;
  judgement: string;
  comment: string;
  priorityComment: string;
  interviewPoint: string;
};

export type ResultRecommendation = {
  cta: string;
  product: string;
  isTied: boolean;
};

export const diagnosticDomains = [
  "採用魅力・学生接点",
  "入社後ギャップ・定着",
  "主体性・行動力",
  "チーム共創・報連相",
  "目標設定・育成環境"
] as const;

const legacyDomains = ["主体性・判断力", "チーム・共創力", "自己理解・キャリア", "目標・行動定着", "上司・育成環境"];

export function judgeScore(score: number | null) {
  if (score === null || Number.isNaN(score)) {
    return { judgement: "未入力", meaning: "評価が未完了", response: "事前チェックを入力" };
  }
  if (score >= 4.2) return { judgement: "強み", meaning: "組織資源として活用", response: "維持・横展開" };
  if (score >= 3.4) return { judgement: "安定", meaning: "大きな問題はない", response: "テーマ別改善" };
  if (score >= 2.6) return { judgement: "注意", meaning: "人・部署にばらつき", response: "重点テーマ化" };
  if (score >= 1.8) return { judgement: "優先課題", meaning: "具体的施策が必要", response: "研修・伴走支援" };
  return { judgement: "早期対応", meaning: "組織的改善が必要", response: "継続プログラム" };
}

export function calculateDomainScores(answers: Pick<CheckAnswer, "domain" | "score">[]): DomainScore[] {
  const usesCurrentDomains = answers.some((answer) => diagnosticDomains.includes(answer.domain as (typeof diagnosticDomains)[number]));
  return diagnosticDomains.map((domain, index) => {
    const sourceDomain = usesCurrentDomains ? domain : legacyDomains[index];
    const scores = answers.filter((answer) => answer.domain === sourceDomain).map((answer) => answer.score);
    const average = scores.length ? Math.round((scores.reduce((sum, score) => sum + score, 0) / scores.length) * 10) / 10 : null;
    return { domain, average, ...judgeScore(average) };
  });
}

export function calculateOverallAverage(domainScores: DomainScore[]) {
  const averages = domainScores.map((score) => score.average).filter((score): score is number => score !== null);
  if (!averages.length) return null;
  return Math.round((averages.reduce((sum, score) => sum + score, 0) / averages.length) * 10) / 10;
}

const resultDomains = [
  {
    domain: "採用魅力・学生接点",
    sourceDomain: "採用魅力・学生接点",
    priorityComment: "学生や若手に、自社の魅力や働くイメージが十分に伝わっていない可能性があります。求人票や会社説明だけでは伝わりにくい“人・価値観・仕事のリアル”を、体験や対話を通じて届ける接点づくりが必要かもしれません。",
    interviewPoint: "自社の魅力の言語化、学生との接点、仕事や働く人のリアルを伝える方法"
  },
  {
    domain: "入社後ギャップ・定着",
    sourceDomain: "入社後ギャップ・定着",
    priorityComment: "入社前後の認識ギャップや、入社後の相談環境・成長実感に課題がある可能性があります。若手社員が“この会社で成長できる”“自分の未来につながっている”と感じられる支援が必要です。",
    interviewPoint: "入社前後の認識差、相談相手、若手の成長実感と将来像"
  },
  {
    domain: "主体性・行動力",
    sourceDomain: "主体性・行動力",
    priorityComment: "指示待ち、判断の先送り、自発的な提案の少なさが起きている可能性があります。普段の判断や行動傾向を可視化し、自分で考えて動くきっかけづくりが必要です。",
    interviewPoint: "役割理解、判断基準、自発的な提案や相談が生まれる条件"
  },
  {
    domain: "チーム共創・報連相",
    sourceDomain: "チーム共創・報連相",
    priorityComment: "報連相の遅れ、情報共有不足、仕事の抱え込みが起きている可能性があります。個人の頑張りをチーム成果につなげるために、協力・相談・共創の体験学習が有効です。",
    interviewPoint: "報連相のタイミング、情報共有、仕事を抱え込まない仕組み"
  },
  {
    domain: "目標設定・育成環境",
    sourceDomain: "目標設定・育成環境",
    priorityComment: "目標が日々の行動に落ちていない、上司の関わりや振り返りの仕組みが不足している可能性があります。研修で終わらせず、手帳・コーチング・1on1で行動定着まで支援することが重要です。",
    interviewPoint: "目標の具体化、上司の関わり、1on1、振り返りと行動定着の仕組み"
  }
];

export function judgeResultScore(score: number) {
  if (score >= 84) return { judgement: "強み", comment: "組織の強みとして活用できる状態です" };
  if (score >= 68) return { judgement: "安定", comment: "大きな問題は少ないが、改善余地があります" };
  if (score >= 52) return { judgement: "注意", comment: "人・部署によるばらつきが出ている可能性があります" };
  if (score >= 36) return { judgement: "優先課題", comment: "具体的な施策が必要な可能性があります" };
  return { judgement: "早期対応", comment: "組織的な改善・伴走支援が必要な可能性があります" };
}

export function calculateResultDomainScores(answers: Pick<CheckAnswer, "domain" | "score">[]): ResultDomainScore[] {
  const existingScores = calculateDomainScores(answers);
  return resultDomains.map((item) => {
    const source = existingScores.find((score) => score.domain === item.sourceDomain);
    const score = source?.average === null || source?.average === undefined ? 0 : Math.round((source.average / 5) * 100);
    return {
      ...item,
      average: source?.average ?? null,
      score,
      ...judgeResultScore(score)
    };
  });
}

export function calculateOverallResultScore(resultScores: ResultDomainScore[]) {
  if (!resultScores.length) return 0;
  return Math.round(resultScores.reduce((sum, item) => sum + item.score, 0) / resultScores.length);
}

export function summarizeResultScores(resultScores: ResultDomainScore[]) {
  const sortedHigh = [...resultScores].sort((a, b) => b.score - a.score);
  const sortedLow = [...resultScores].sort((a, b) => a.score - b.score);
  const overallScore = calculateOverallResultScore(resultScores);
  return {
    overallScore,
    overallJudgement: judgeResultScore(overallScore),
    highest: sortedHigh[0],
    lowest: sortedLow[0],
    priorities: sortedLow.slice(0, 2),
    recommendation: getResultRecommendation(resultScores)
  };
}

export function getResultRecommendation(resultScores: Pick<ResultDomainScore, "domain" | "score">[]): ResultRecommendation {
  const minimum = Math.min(...resultScores.map((item) => item.score));
  const lowest = resultScores.filter((item) => item.score === minimum);
  if (lowest.length !== 1) {
    return {
      cta: "採用から定着・育成までまとめて相談する",
      product: "30分面談＋AI詳細診断",
      isTied: true
    };
  }

  const recommendations: Record<string, Omit<ResultRecommendation, "isTied">> = {
    "採用魅力・学生接点": {
      cta: "学生との接点づくり・マッチングイベントについて相談する",
      product: "THINGi®︎を活用した企業×学生マッチングイベント"
    },
    "入社後ギャップ・定着": {
      cta: "若手定着・成長支援について相談する",
      product: "しあわせ360°手帳／若手定着研修／コーチング"
    },
    "主体性・行動力": {
      cta: "主体性を高めるTHINGi®︎研修について相談する",
      product: "THINGi®︎共創版研修"
    },
    "チーム共創・報連相": {
      cta: "チーム共創研修について相談する",
      product: "THINGi®︎共創版研修／チームビルディング研修"
    },
    "目標設定・育成環境": {
      cta: "360°手帳・コーチング研修について相談する",
      product: "しあわせ360°手帳／コーチング／管理職フォロー"
    }
  };

  return { ...recommendations[lowest[0].domain], isTied: false };
}

export function recommendPlan(domainScores: DomainScore[]) {
  const resultScores = domainScores.map((score) => ({
    domain: score.domain,
    score: score.average === null ? 0 : Math.round((score.average / 5) * 100)
  }));
  const recommendation = getResultRecommendation(resultScores);
  return {
    plan: recommendation.product,
    aim: recommendation.isTied
      ? "複数の領域を横断して背景要因を確認し、採用から定着・育成までの優先順位と具体的な次の一手を整理します。"
      : `最も確認が必要な「${resultScores.sort((a, b) => a.score - b.score)[0].domain}」を中心に、現状の背景要因を確認し、実行可能な施策へつなげます。`
  };
}
