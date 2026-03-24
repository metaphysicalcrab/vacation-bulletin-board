import type { Metadata, Viewport } from "next";
import "./globals.css";
import { StoreProvider } from "@/lib/store-context";

export const metadata: Metadata = {
  title: "Voyage Board",
  description: "Group chat & bulletin board for vacations and cruises",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Voyage Board",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: "#1a1614",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full">
      <body className="h-full bg-background text-foreground antialiased">
        <a href="#main-content" className="skip-to-content">
          Skip to content
        </a>
        <StoreProvider>
          <div id="main-content">{children}</div>
        </StoreProvider>
      </body>
    </html>
  );
}
