import LoginForm from "./LoginForm";
import { Container, PageShell } from "@/components/ui";

export default function AdminLoginPage() {
  return (
    <PageShell>
      <Container className="flex min-h-screen items-center justify-center py-12">
        <section className="w-full max-w-md rounded-lg border border-slate-200 bg-white p-8 shadow-soft">
          <p className="text-sm font-semibold text-navy-900">Life Design Works</p>
          <h1 className="mt-2 text-2xl font-bold">管理者ログイン</h1>
          <LoginForm />
        </section>
      </Container>
    </PageShell>
  );
}
