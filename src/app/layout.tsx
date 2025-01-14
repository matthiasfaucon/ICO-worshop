import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import StoreProvider from "./StoreProvider";
import { Providers } from "@/app/components/SessionProviderWrapper" // Import SessionProvider pour NextAuth

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

export const metadata = {
  title: 'Nom de ton App',
  description: 'Description de ton application',
  themeColor: '#000000',
  manifest: '/manifest.json'
};

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <Providers> {/* Encapsulation avec SessionProvider */}
          <StoreProvider>
            {children}
          </StoreProvider>
        </Providers>
      </body>
    </html>
  );
}
