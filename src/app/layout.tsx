import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import StoreProvider from "./StoreProvider";
import { GameProvider } from '@/context/GameContext';

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

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
      <body
        className={`antialiased h-dvh bg-brown-500`}
      >
        <GameProvider>
          <StoreProvider>
            {children}
          </StoreProvider>
        </GameProvider>
      </body>
    </html>
  );
}
