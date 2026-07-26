import "./globals.css";
import type { Metadata } from "next";
import { Inter } from "next/font/google";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "TypeBlitz — Typing Speed Test",
  description:
    "Test and improve your typing speed and accuracy with TypeBlitz.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body
        suppressHydrationWarning={true}
        className={`${inter.className} bg-gray-950`}
      >
        {children}
      </body>
    </html>
  );
}