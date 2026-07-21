import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "採用・定着・育成課題 5分診断",
  description: "採用後に社員が定着し、成長し、チームで成果を出す職場環境・育成課題を整理する5分診断"
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ja">
      <body>{children}</body>
    </html>
  );
}
