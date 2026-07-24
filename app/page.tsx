import { ArrowRight, ClipboardCheck, FileText, Timer } from "lucide-react";
import { Container, LinkButton, PageShell } from "@/components/ui";
import { appName, providerName } from "@/lib/constants";

export default function HomePage() {
  return (
    <PageShell>
      <Container className="py-8 sm:py-12">
        <header className="flex flex-col gap-3 border-b border-slate-200 pb-6 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-semibold text-navy-900">{providerName}</p>
          </div>
        </header>

        <section className="grid gap-10 py-12 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
          <div>
            <p className="mb-4 inline-flex rounded-full bg-gold-100 px-4 py-2 text-sm font-semibold text-navy-800">毎月5社まで / 無料診断</p>
            <h1 className="text-3xl font-bold leading-tight tracking-normal text-navy-900 sm:text-4xl">
              <span className="block">求人募集しても採用できない</span>
              <span className="block">入社しても定着しない。</span>
              <span className="block">若手がなかなか育たない。</span>
            </h1>
            <p className="mt-6 max-w-2xl text-base leading-8 text-slate-700">
              その原因は、求人条件だけでなく、会社の魅力の伝え方、入社後の関わり方、育成の仕組みにあるかもしれません。15項目・約5分で、御社の採用・定着・育成課題の現在地を見える化します。
            </p>
            <p className="mt-4 max-w-2xl text-sm leading-7 text-slate-600">
              診断後、レーダーチャートで簡易結果を表示。希望企業には30分面談＋AI詳細診断でA4分析レポートを作成します。
            </p>
            <div className="mt-8">
              <LinkButton href="/diagnosis">
                5分診断をはじめる
                <ArrowRight size={18} />
              </LinkButton>
            </div>
          </div>

          <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-soft">
            <div className="grid gap-4">
              {[
                { icon: Timer, title: appName, text: "15項目を約5分で入力し、採用・定着・育成の現在地を確認します。" },
                { icon: ClipboardCheck, title: "レーダーチャート表示", text: "5領域の傾向、強み、優先確認領域をその場で確認できます。" },
                { icon: FileText, title: "30分面談＋AI詳細診断", text: "希望企業には、AI分析を含めたA4分析レポートを作成します。" }
              ].map((item) => (
                <div key={item.title} className="flex gap-4 rounded-md bg-slate-50 p-4">
                  <item.icon className="mt-1 shrink-0 text-gold-500" size={24} />
                  <div>
                    <h2 className="text-sm font-semibold leading-6 text-navy-900">{item.title}</h2>
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
