import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "『採用・定着・育成』の「課題見える化」5分診断",
  description: "企業の採用・定着・育成課題を5つの観点から見える化する簡易診断"
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ja">
      <body>{children}</body>
    </html>
  );
}
