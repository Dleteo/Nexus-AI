import type { Metadata } from "next";
import { Geist, Geist_Mono, Anton, Barlow_Condensed, Dancing_Script } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const poster = Anton({ variable: "--font-editorial-poster", weight: "400", subsets: ["latin"], display: "swap" });
const condensed = Barlow_Condensed({ variable: "--font-editorial-condensed", weight: ["400", "500", "600", "700", "800"], subsets: ["latin"], display: "swap" });
const script = Dancing_Script({ variable: "--font-editorial-script", weight: ["500", "600"], subsets: ["latin"], display: "swap" });

export const metadata: Metadata = {
  title: "Nexus AI | Your AI Project Workspace",
  description:
    "Nexus AI brings projects, AI-assisted planning, debugging, learning and interview preparation together in one organized workspace.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} ${poster.variable} ${condensed.variable} ${script.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col">{children}</body>
    </html>
  );
}
