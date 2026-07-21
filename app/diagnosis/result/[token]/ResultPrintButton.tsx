"use client";

import { Printer } from "lucide-react";
import { Button } from "@/components/ui";

export default function ResultPrintButton() {
  return (
    <Button type="button" onClick={() => window.print()} className="print:hidden" aria-label="PDF出力">
      <Printer size={18} />
      PDF出力
    </Button>
  );
}
