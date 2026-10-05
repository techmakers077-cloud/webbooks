import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "WebBooks — Pinterest-Style Token Book Library & Nemotron AI Companion",
  description:
    "Discover, unlock, and read curated books in a Pinterest-style masonry catalog with GPay token deposits, Staff Console, and NVIDIA Nemotron AI Reader Companion.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-white text-neutral-900 antialiased selection:bg-[#E60023] selection:text-white">
        {children}
      </body>
    </html>
  );
}
