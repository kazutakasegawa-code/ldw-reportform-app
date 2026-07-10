import type { CheckAnswer } from "@prisma/client";

export type DomainScore = {
  domain: string;
  average: number | null;
  judgement: string;
  meaning: string;
  response: string;
};

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
  const domains = ["主体性・判断力", "チーム・共創力", "自己理解・キャリア", "目標・行動定着", "上司・育成環境"];
  return domains.map((domain) => {
    const scores = answers.filter((answer) => answer.domain === domain).map((answer) => answer.score);
    const average = scores.length ? Math.round((scores.reduce((sum, score) => sum + score, 0) / scores.length) * 10) / 10 : null;
    return { domain, average, ...judgeScore(average) };
  });
}

export function calculateOverallAverage(domainScores: DomainScore[]) {
  const averages = domainScores.map((score) => score.average).filter((score): score is number => score !== null);
  if (!averages.length) return null;
  return Math.round((averages.reduce((sum, score) => sum + score, 0) / averages.length) * 10) / 10;
}

export function recommendPlan(domainScores: DomainScore[]) {
  const byDomain = Object.fromEntries(domainScores.map((score) => [score.domain, score]));
  const warningOrLower = domainScores.filter((score) => score.average !== null && score.average <= 3.3).length;
  const supervisor = byDomain["上司・育成環境"];

  if (supervisor?.judgement === "優先課題" || supervisor?.judgement === "早期対応") {
    return {
      plan: "6か月共創型組織づくりプログラム",
      aim: "若手社員の主体的な実践を促すだけでなく、管理職が日常業務の中で育成に関わる状態をつくることを目指します。研修、対話、振り返り、実践確認を組み合わせ、行動変容が一時的なものに終わらず、組織内で継続される支援体制づくりにつなげます。"
    };
  }
  if (warningOrLower >= 3) {
    return {
      plan: "3か月人財成長プログラム",
      aim: "個人の強み、価値観、仕事への向き合い方を整理し、自分の言葉で成長目標を描ける状態を目指します。そのうえで、日々の業務で実践できる具体的な行動へ落とし込み、定期的な振り返りを通じて、継続的な行動変容と成長実感を支援します。"
    };
  }
  if ((byDomain["自己理解・キャリア"]?.average ?? 5) <= 3.3 || (byDomain["目標・行動定着"]?.average ?? 5) <= 3.3) {
    return {
      plan: "THINGi®︎ × しあわせ360°手帳 30日行動定着プログラム",
      aim: "研修や診断で得た気づきを、その場限りの理解で終わらせず、個人目標と日々の行動に落とし込むことを目指します。しあわせ360°手帳を活用しながら、行動計画、実践、振り返りを30日間継続し、主体的な行動習慣の定着を促します。"
    };
  }
  if ((byDomain["主体性・判断力"]?.average ?? 5) <= 3.3 || (byDomain["チーム・共創力"]?.average ?? 5) <= 3.3) {
    return {
      plan: "THINGi®︎共創版 半日〜1日研修",
      aim: "THINGi®︎の体験を通じて、指示を待つのではなく自分で考え、状況に応じて判断する力を引き出すことを目指します。あわせて、他者の視点や強みを活かしながら協力する体験を重ね、チームで成果を生み出す共創行動への気づきを促します。"
    };
  }
  return {
    plan: "THINGi®︎ × しあわせ360°手帳 30日行動定着プログラム",
    aim: "現在の組織にある強みや安定している行動を活かしながら、さらに成果につながる実践へ広げることを目指します。目標設定、日々の行動記録、週次の振り返りを通じて、個人の気づきを継続的な行動に変え、チーム全体への横展開を支援します。"
  };
}
