import type { Metadata } from "next";
import type { ReactNode } from "react";
import "./globals.css";


export const metadata: Metadata = {
  title: { default: "Genow 文档", template: "%s | Genow 文档" },
  description: "Genow 使用文档与操作演示",
};


export default function RootLayout({
  children,
}: Readonly<{
  children: ReactNode;
}>) {
  return (
    <html lang="zh-CN" data-theme="dark" suppressHydrationWarning>
      <head><script dangerouslySetInnerHTML={{ __html: "try{document.documentElement.dataset.theme=localStorage.getItem('genow-docs-theme')==='light'?'light':'dark'}catch(e){}" }}/></head>
      <body>{children}</body>
    </html>
  );
}
