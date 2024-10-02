import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import NavMenu from "./_components/navigationMenu/main";

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
  title: "Tresor App",
  description: "Download manager for tresor esi",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased flex h-[600px] w-[900px] border border-zinc-200`}
      >
        <NavMenu /><div className="px-3 py-6 overflow-hidden">{children}</div>
        
      </body>
    </html>
  );
}
