import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL('https://cegah-grooming.vercel.app'),
  title: "CegahGrooming - Deteksi Dini Child Grooming",
  description: "Aplikasi deteksi dini child grooming berbasis kecerdasan buatan.",
  openGraph: {
    title: "CegahGrooming - Deteksi Dini Child Grooming",
    description: "Aplikasi deteksi dini child grooming berbasis kecerdasan buatan.",
    url: "https://cegah-grooming.vercel.app",
    siteName: "CegahGrooming",
    images: [
      {
        url: "/logo.png",
        width: 800,
        height: 600,
        alt: "CegahGrooming UI",
      },
    ],
    locale: "id_ID",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
