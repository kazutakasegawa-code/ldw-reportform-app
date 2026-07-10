"use client";

import { useState } from "react";
import { LogIn } from "lucide-react";
import { Button, FieldLabel, inputClass } from "@/components/ui";

export default function LoginForm() {
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function login(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError("");
    const form = new FormData(event.currentTarget);
    const response = await fetch("/api/admin/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        adminId: form.get("adminId"),
        password: form.get("password")
      })
    });
    setLoading(false);
    if (!response.ok) {
      setError("ログイン情報が正しくありません。");
      return;
    }
    window.location.assign("/admin");
  }

  return (
    <form method="post" onSubmit={login} className="mt-6 space-y-4">
      <div>
        <FieldLabel>メールアドレスまたは管理者ID</FieldLabel>
        <input name="adminId" className={inputClass} autoComplete="username" />
      </div>
      <div>
        <FieldLabel>パスワード</FieldLabel>
        <input name="password" type="password" className={inputClass} autoComplete="current-password" />
      </div>
      {error ? <p className="text-sm font-semibold text-red-700">{error}</p> : null}
      <Button type="submit" className="w-full" disabled={loading}>
        <LogIn size={18} />
        {loading ? "確認中..." : "ログイン"}
      </Button>
    </form>
  );
}
