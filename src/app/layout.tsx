import type { Metadata } from "next";
import "./globals.css";
import { AppProvider } from "@/contexts/AppContext";

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
      <head>
        {/* Manually include Tailwind CSS */}
        <link 
          rel="stylesheet" 
          href="https://cdn.jsdelivr.net/npm/tailwindcss@3.4.1/dist/tailwind.min.css" 
        />
      </head>
      <body className="w-full h-full flex items-center justify-center my-[100px]">
        <AppProvider>
          {children}
        </AppProvider>
      </body>
    </html>
  );
}
