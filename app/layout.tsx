import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Spotify Data Viewer — Tu historial de streaming",
  description:
    "Dashboard profesional con tu historial extendido de streaming de Spotify",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <body className="min-h-screen antialiased">{children}</body>
    </html>
  );
}
