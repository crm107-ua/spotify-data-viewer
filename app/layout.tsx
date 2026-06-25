import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Spotify Data Viewer — Tu historial de streaming",
  description:
    "Dashboard profesional con tu historial extendido de streaming de Spotify",
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
    <html lang="es">
      <body className="min-h-screen overflow-x-hidden antialiased">{children}</body>
    </html>
  );
}
