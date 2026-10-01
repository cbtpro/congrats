import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "好彩头 — 自定义物理庆祝效果实验室",
  description: "组合彩纸、飞机、气球、鸽子和庆祝声音，自定义物理参数，庆祝每一个成功时刻。",
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
