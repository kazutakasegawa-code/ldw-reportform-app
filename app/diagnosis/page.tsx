import DiagnosisForm from "./DiagnosisForm";
import { Container, PageShell } from "@/components/ui";

export default function DiagnosisPage() {
  return (
    <PageShell>
      <Container className="py-8 sm:py-12">
        <div className="mb-8">
          <p className="text-sm font-semibold text-gold-500">Life Design Works</p>
          <h1 className="mt-2 text-2xl font-bold text-navy-900 sm:text-4xl">
            人材育成・組織開発
            <br />
            課題診断
          </h1>
          <p className="mt-3 text-sm leading-7 text-slate-600">入力目安は約5分です。現時点で分かる範囲でご回答ください。</p>
        </div>
        <DiagnosisForm />
      </Container>
    </PageShell>
  );
}
