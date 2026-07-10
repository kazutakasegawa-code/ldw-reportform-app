import { ArrowRight, ClipboardCheck, FileText, Timer } from "lucide-react";
import { Container, LinkButton, PageShell } from "@/components/ui";
import { diagnosticNotice, providerName } from "@/lib/constants";

export default function HomePage() {
  return (
    <PageShell>
      <Container className="py-8 sm:py-12">
        <header className="flex flex-col gap-3 border-b border-slate-200 pb-6 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-semibold text-gold-500">{providerName}</p>
          </div>
        </header>

        <section className="grid gap-10 py-12 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
          <div>
            <p className="mb-4 inline-flex rounded-full bg-gold-100 px-4 py-2 text-sm font-semibold text-navy-800">毎月5社まで / 無料診断</p>
            <h1 className="text-3xl font-bold leading-tight tracking-normal text-navy-900 sm:text-5xl">
              人材育成・組織開発
              <br />
              課題診断
            </h1>
            <p className="mt-6 max-w-2xl text-base leading-8 text-slate-700">
              事前入力情報をもとに、課題の論点整理、AI分析、分析レポート作成までを一体化した診断です。
            </p>
            <p className="mt-4 max-w-2xl text-sm leading-7 text-slate-600">{diagnosticNotice}</p>
            <div className="mt-8">
              <LinkButton href="/diagnosis">
                診断フォームへ進む
                <ArrowRight size={18} />
              </LinkButton>
            </div>
          </div>

          <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-soft">
            <div className="grid gap-4">
              {[
                { icon: Timer, title: "事前入力 約5分", text: "会社情報、研修条件、15項目チェックを入力します。" },
                { icon: ClipboardCheck, title: "課題整理", text: "人材育成課題を5領域で整理し、面談の論点を明確にします。" },
                { icon: FileText, title: "分析レポート付き", text: "30分面談時にAI分析を含めたレポートを差し上げます。" }
              ].map((item) => (
                <div key={item.title} className="flex gap-4 rounded-md bg-slate-50 p-4">
                  <item.icon className="mt-1 shrink-0 text-gold-500" size={24} />
                  <div>
                    <h2 className="font-semibold text-navy-900">{item.title}</h2>
                    <p className="mt-1 text-sm leading-6 text-slate-600">{item.text}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      </Container>
    </PageShell>
  );
}
