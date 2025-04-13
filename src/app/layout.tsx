import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { AppProvider } from "@/contexts/AppContext";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Turkish Sentence App",
  description: "A research application for Turkish sentence formation",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="tr">
      <body className="w-full h-full flex items-center justify-center my-[100px]">
        <AppProvider>
          {children}
        </AppProvider>
      </body>
    </html>
  );
}
