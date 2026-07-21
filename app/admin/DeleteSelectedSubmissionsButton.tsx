"use client";

import { Trash2 } from "lucide-react";
import { useState } from "react";

export default function DeleteSelectedSubmissionsButton() {
  const [loading, setLoading] = useState(false);

  async function handleDelete() {
    const checked = Array.from(document.querySelectorAll<HTMLInputElement>('input[name="submissionIds"]:checked'));
    const ids = checked.map((input) => input.value);
    if (!ids.length) {
      window.alert("削除する申込みを選択してください。");
      return;
    }

    const confirmed = window.confirm(`選択した${ids.length}件の診断データを削除します。削除後は元に戻せません。よろしいですか？`);
    if (!confirmed) return;

    setLoading(true);
    try {
      const response = await fetch("/api/admin/submissions/bulk-delete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ids })
      });
      if (!response.ok) {
        window.alert("削除に失敗しました。時間をおいてもう一度お試しください。");
        setLoading(false);
        return;
      }
      window.location.reload();
    } catch {
      window.alert("削除に失敗しました。通信状況をご確認ください。");
      setLoading(false);
    }
  }

  return (
    <button
      type="button"
      onClick={handleDelete}
      disabled={loading}
      className="inline-flex items-center gap-2 rounded-md border border-red-200 bg-red-50 px-4 py-2 text-sm font-semibold text-red-700 disabled:cursor-not-allowed disabled:opacity-60"
    >
      <Trash2 size={16} />
      {loading ? "削除中..." : "選択した申込みを削除"}
    </button>
  );
}
