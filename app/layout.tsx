import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "电商增长复盘系统",
  description: "上传数据，自动诊断经营问题，生成复盘报告"
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="zh-CN">
      <body>{children}</body>
    </html>
  );
}
