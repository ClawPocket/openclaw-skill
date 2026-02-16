import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import "@coinbase/onchainkit/styles.css";
import { Providers } from "@/components/Providers";
import { Analytics } from "@vercel/analytics/react";
import { ToastProvider } from "@/components/Toast";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const DOMAIN = "https://clawpocket.xyz";

export const metadata: Metadata = {
  title: {
    default: "ClawPocket — AI Agent Marketplace on Base",
    template: "%s | ClawPocket",
  },
  description:
    "Browse, copy, and earn from the best AI trading agents. Pay with USDC on Base. Powered by Coinbase AgentKit.",
  keywords: [
    "AI trading agent",
    "crypto trading bot",
    "Base blockchain",
    "Coinbase",
    "USDC",
    "copy trading",
    "DeFi",
    "AI marketplace",
    "ClawPocket",
  ],
  metadataBase: new URL(DOMAIN),
  alternates: { canonical: "/" },
  openGraph: {
    title: "ClawPocket — AI Agent Marketplace on Base",
    description:
      "Browse, copy, and earn from the best AI trading agents. Pay with USDC on Base. Powered by Coinbase.",
    url: DOMAIN,
    siteName: "ClawPocket",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "ClawPocket — AI Agent Marketplace on Base",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "ClawPocket — AI Agent Marketplace on Base",
    description:
      "Browse, copy, and earn from the best AI trading agents. Pay with USDC on Base.",
    images: ["/og-image.png"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true },
  },
  icons: {
    icon: "/logo.svg",
    apple: "/logo.svg",
  },
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "ClawPocket",
  },
  viewport: {
    width: "device-width",
    initialScale: 1,
    maximumScale: 1,
    userScalable: false, // Prevent zoom on mobile inputs
    viewportFit: "cover",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <Providers>
          {children}
        </Providers>
        <Analytics />
        <ToastProvider />
      </body>
    </html>
  );
}
