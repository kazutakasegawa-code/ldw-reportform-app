import { CalendarDays, MailCheck } from "lucide-react";
import { Container, LinkButton, PageShell } from "@/components/ui";

export default function ThanksPage() {
  return (
    <PageShell>
      <Container className="flex min-h-screen items-center justify-center py-12">
        <section className="w-full max-w-2xl rounded-lg border border-slate-200 bg-white p-8 shadow-soft">
          <MailCheck className="text-gold-500" size={40} />
          <h1 className="mt-5 text-2xl font-bold text-navy-900">送信が完了しました</h1>
          <p className="mt-4 leading-8 text-slate-700">
            完了ページへ移動しました。ご入力内容をもとに、Life Design Worksが事前分析を行います。30分面談では、回答内容の確認、課題の優先順位、今後の育成施策について整理します。
          </p>
          <div className="mt-6 rounded-md bg-slate-50 p-5">
            <h2 className="flex items-center gap-2 font-semibold text-navy-900">
              <CalendarDays size={18} />
              30分面談までの流れ
            </h2>
            <ol className="mt-3 space-y-2 text-sm leading-7 text-slate-700">
              <li>1. 入力内容の確認と事前分析</li>
              <li>2. 日程調整のご案内</li>
              <li>3. 30分面談の実施</li>
              <li>4. 分析レポートをもとにしたご提案</li>
            </ol>
          </div>
          <div className="mt-8">
            <LinkButton href="/" className="bg-white !text-navy-800 ring-1 ring-navy-800 hover:bg-slate-50">
              トップへ戻る
            </LinkButton>
          </div>
        </section>
      </Container>
    </PageShell>
  );
}
