"use client";

import { Button } from "@/components/ui";

export default function PrintButton({ children }: { children: React.ReactNode }) {
  return (
    <Button type="button" onClick={() => window.print()}>
      {children}
    </Button>
  );
}
