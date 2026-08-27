import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { SessionProvider } from "@/components/providers/SessionProvider";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "TechSAR - ระบบประกันคุณภาพและประเมินตนเองระดับแผนกวิชา",
  description: "ระบบบริหารจัดการงานประกันคุณภาพการศึกษาและจัดทำรายงาน SAR ระดับแผนกวิชา วิทยาลัยเทคนิค",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="th" className="light">
      <body className={`${inter.className} min-h-screen bg-slate-50 text-slate-900 antialiased selection:bg-blue-500 selection:text-white`}>
        <SessionProvider>
          {children}
        </SessionProvider>
      </body>
    </html>
  );
}
