import "./globals.css";
import { AppProvider } from "./_context/appContext";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {

  return (
    <html lang="en">
      <body
        className={`flex h-[600px] w-[900px] border overflow-hidden border-zinc-200 bg-white`}
        data-tauri-drag-region
      >
        <AppProvider> {children}</AppProvider>
      </body>
    </html>
  );
}
