import type { Metadata } from "next";
import { Inter, Plus_Jakarta_Sans, JetBrains_Mono } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const plusJakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-plus-jakarta",
  display: "swap",
  weight: ["400", "500", "600", "700", "800"],
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-jetbrains-mono",
  display: "swap",
  weight: ["400", "500"],
});

export const metadata: Metadata = {
  title: {
    default: "DentalBillingCompany.us — Find the Best Dental Billing Company Near You",
    template: "%s | DentalBillingCompany.us",
  },
  description:
    "Browse, compare, and contact dental billing and revenue cycle management companies across all 50 US states. Find verified specialists for your dental practice.",
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? "https://dentalbillingcompany.us"),
  keywords: [
    "dental billing company",
    "dental billing services",
    "dental revenue cycle management",
    "dental insurance billing",
    "dental billing outsourcing",
    "dental billing specialists",
  ],
  authors: [{ name: "DentalBillingCompany.us" }],
  creator: "DentalBillingCompany.us",
  openGraph: {
    type: "website",
    locale: "en_US",
    siteName: "DentalBillingCompany.us",
  },
  twitter: { card: "summary_large_image" },
  robots: { index: true, follow: true },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${plusJakarta.variable} ${jetbrainsMono.variable}`}
      suppressHydrationWarning
    >
      <body className="min-h-screen bg-background font-sans antialiased">
        {children}
      </body>
    </html>
  );
}
