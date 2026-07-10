"use client";

import { Trash2 } from "lucide-react";
import { useState } from "react";

export default function DeleteSubmissionButton({ id, companyName }: { id: string; companyName: string }) {
  const [loading, setLoading] = useState(false);

  async function handleDelete() {
    const confirmed = window.confirm(`${companyName} の診断データを削除します。削除後は元に戻せません。よろしいですか？`);
    if (!confirmed) return;

    setLoading(true);
    try {
      const response = await fetch(`/api/admin/submissions/${id}`, { method: "DELETE" });
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
      className="inline-flex items-center gap-1 font-semibold text-red-700 underline disabled:cursor-not-allowed disabled:opacity-60"
    >
      <Trash2 size={16} />
      {loading ? "削除中..." : "削除"}
    </button>
  );
}
