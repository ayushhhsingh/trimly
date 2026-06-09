import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ClerkProvider } from '@clerk/nextjs'
import ThemeScript from "@/components/ThemeScript";
const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Trimly - AI-Powered Media Platform",
  description:
    "Upload videos, compress them automatically with AI, and resize images for social media with automatic cropping.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider>
      <html lang="en" data-theme="black" suppressHydrationWarning>
        <head>
          <ThemeScript />
        </head>
        <body className={`${inter.className} min-h-screen bg-base-100 text-base-content antialiased`}>
          {children}
        </body>
      </html>
    </ClerkProvider>
  );
}
