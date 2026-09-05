import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "YAN — AI-Native Systems Portfolio",
  description: "刘禄妍的 AI、代码、实时视觉、三维空间与影像作品集。",
  icons: {
    icon: "/favicon.svg",
    shortcut: "/favicon.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN">
      <head><meta name="codex-preview" content="development" /></head>
      <body className="antialiased">{children}</body>
    </html>
  );
}
