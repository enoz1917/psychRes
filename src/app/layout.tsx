import type { Metadata } from "next";
import "./globals.css";
import "./mobileBlocker.css";
import { AppProvider } from "@/contexts/AppContext";

export const metadata: Metadata = {
  title: "Zaman Yönelimi için Karışık Cümleler",
  description: "",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="tr">
      <body className="w-full h-full flex items-center justify-center my-[100px]">
        {/* Mobile blocking overlay */}
        <div className="mobile-block-overlay">
          <svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-red-500 mb-6">
            <circle cx="12" cy="12" r="10" />
            <line x1="8" y1="12" x2="16" y2="12" />
          </svg>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Cep Telefonu Erişimi Engellendi</h2>
          <p className="text-lg text-gray-700 mb-2">
            Bu uygulama mobil cihazlarda kullanılamaz.
          </p>
          <p className="text-md text-gray-600 mb-4">
            Lütfen daha büyük ekranlı bir cihaz (bilgisayar veya tablet) kullanın.
          </p>
          <div className="bg-gray-100 p-4 rounded-lg max-w-md">
            <p className="text-sm text-gray-500">
              Araştırma güvenilirliği ve doğruluğu için, bu uygulama yalnızca geniş ekranlı cihazlarda çalışacak şekilde tasarlanmıştır.
            </p>
          </div>
        </div>

        {/* Main application content */}
        <div className="app-content">
          <AppProvider>
            {children}
          </AppProvider>
        </div>
      </body>
    </html>
  );
}
