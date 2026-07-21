"use client";

import { Printer } from "lucide-react";
import { Button } from "@/components/ui";

export default function ResultPrintButton({ token }: { token: string }) {
  const handlePrint = async () => {
    try {
      await fetch(`/api/diagnosis/result/${token}/pdf`, { method: "POST" });
    } catch {
      // PDF保存自体はブラウザ印刷で継続できるようにします。
    }
    window.print();
  };

  return (
    <Button type="button" onClick={handlePrint} className="no-print print:hidden" aria-label="PDF出力">
      <Printer size={18} />
      PDF出力
    </Button>
  );
}
