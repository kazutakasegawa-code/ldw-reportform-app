"use client";

import { useRef, useState } from "react";
import { Printer } from "lucide-react";
import { Button } from "@/components/ui";

export default function ResultPrintButton({ token }: { token: string }) {
  const printingRef = useRef(false);
  const [printing, setPrinting] = useState(false);

  const handlePrint = () => {
    if (printingRef.current) return;

    printingRef.current = true;
    setPrinting(true);
    void fetch(`/api/diagnosis/result/${token}/pdf`, { method: "POST" }).catch(() => {
      // PDF保存自体はブラウザ印刷で継続できるようにします。
    });

    window.setTimeout(() => {
      window.print();
      window.setTimeout(() => {
        printingRef.current = false;
        setPrinting(false);
      }, 1200);
    }, 0);
  };

  return (
    <Button type="button" onClick={handlePrint} disabled={printing} className="no-print print:hidden" aria-label="PDF出力">
      <Printer size={18} />
      {printing ? "PDF準備中..." : "PDF出力"}
    </Button>
  );
}
