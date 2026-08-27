import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import AuthProvider from "@/components/providers/AuthProvider";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "TechSAR - ระบบประกันคุณภาพการศึกษาแผนกวิชา",
  description: "ระบบบริหารจัดการงานประกันคุณภาพและรายงานการประเมินตนเองสำหรับแผนกวิชาในวิทยาลัยเทคนิค",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="th">
      <body className={inter.className}>
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
