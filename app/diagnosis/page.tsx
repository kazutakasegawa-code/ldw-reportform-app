import DiagnosisForm from "./DiagnosisForm";
import { Container, PageShell } from "@/components/ui";
import { appName } from "@/lib/constants";

export default function DiagnosisPage() {
  return (
    <PageShell>
      <Container className="py-8 sm:py-12">
        <div className="mb-8">
          <p className="text-sm font-semibold text-navy-900">Life Design Works</p>
          <h1 className="mt-2 text-2xl font-bold text-navy-900 sm:text-4xl">{appName}</h1>
          <p className="mt-3 text-sm leading-7 text-slate-600">
            この診断は、採用活動そのもの、社員個人の能力・適性、人事評価を判定するものではありません。企業の魅力が学生や若手に伝わっているか、入社後に定着・成長できる環境があるか、社員が主体的に行動し、チームで成果を出せる状態かを、5つの観点から見える化する簡易診断です。
          </p>
          <p className="mt-2 text-sm leading-7 text-slate-600">入力目安は約5分です。現時点で分かる範囲でご回答ください。</p>
        </div>
        <DiagnosisForm />
      </Container>
    </PageShell>
  );
}
