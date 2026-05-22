import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "AI Dev Loop Engine",
  description: "Autonomous engine that safely evolves a separate Next.js app repository.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
