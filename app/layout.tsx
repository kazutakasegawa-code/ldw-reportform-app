import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "人材育成・組織開発　課題診断",
  description: "Life Design Worksの企業向け人材育成課題診断"
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ja">
      <body>{children}</body>
    </html>
  );
}
