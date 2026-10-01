import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "恭喜 — 为每一次成功认真庆祝",
  description: "10 款精心设计的成功祝贺组件，为每一种好消息准备。",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN">
      <body>{children}</body>
    </html>
  );
}
