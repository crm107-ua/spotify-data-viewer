import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Spotify Data Viewer — Your streaming history",
  description:
    "Local dashboard that visualizes your Spotify extended streaming history: plays, hours, artists, and trends over the years.",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="min-h-screen overflow-x-hidden antialiased">{children}</body>
    </html>
  );
}
