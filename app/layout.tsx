import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";

const geistSans = localFont({
  src: "./fonts/Geist.woff2",
  variable: "--font-geist-sans",
  weight: "100 900",
  display: "swap",
});

const geistMono = localFont({
  src: "./fonts/GeistMono.woff2",
  variable: "--font-geist-mono",
  weight: "100 900",
  display: "swap",
});

const poster = localFont({
  src: "./fonts/Anton-Regular.woff2",
  variable: "--font-editorial-poster",
  weight: "400",
  display: "swap",
});
const condensed = localFont({
  src: [
    { path: "./fonts/BarlowCondensed-Regular.woff2", weight: "400", style: "normal" },
    { path: "./fonts/BarlowCondensed-Medium.woff2", weight: "500", style: "normal" },
    { path: "./fonts/BarlowCondensed-SemiBold.woff2", weight: "600", style: "normal" },
    { path: "./fonts/BarlowCondensed-Bold.woff2", weight: "700", style: "normal" },
    { path: "./fonts/BarlowCondensed-ExtraBold.woff2", weight: "800", style: "normal" },
  ],
  variable: "--font-editorial-condensed",
  display: "swap",
});
const script = localFont({
  src: "./fonts/DancingScript.woff2",
  variable: "--font-editorial-script",
  weight: "500 600",
  display: "swap",
});

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
