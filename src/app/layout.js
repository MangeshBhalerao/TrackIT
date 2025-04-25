import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar";
import { Toaster } from 'react-hot-toast';

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  title: "TrackIT",
  description: "Manage your tasks, documents, and fitness all in one place",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased min-h-screen bg-black text-white relative border-0`}
      >
        {/* Gradient overlays */}
        <div className="fixed inset-0 pointer-events-none z-0">
          <div className="absolute top-0 right-0 w-1/2 h-1/2 bg-blue-200/30 rounded-full blur-3xl opacity-50" />
          <div className="absolute bottom-0 left-0 w-1/2 h-1/2 bg-purple-300/30 opacity-50 rounded-full blur-3xl" />
          <div className="absolute inset-0 bg-gradient-to-br from-transparent via-black/50 to-black/70" />
        </div>

        <Navbar />
        <main className="container mx-auto px-4 pt-16 relative z-10">
          {children}
        </main>
        <Toaster position="top-right" />
      </body>
    </html>
  );
}
