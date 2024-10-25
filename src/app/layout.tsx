import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import Navbar from "./components/Navbar";
import GoToTopButton from "./components/GoToTopButton";
import { AuthProvider } from "./contexts/AuthContext";
import { ExhibitionProvider } from "./contexts/ExhibitionContext";

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
});
const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
});

export const metadata: Metadata = {
  title: "Curation-Creation",
  description: "Curate art you love",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable}`}>
        <AuthProvider>
          <ExhibitionProvider>
            <Navbar />
            <GoToTopButton />
            {children}
          </ExhibitionProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
