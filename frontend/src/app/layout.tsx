import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "NGL Tournament Platform | Free Fire Tournaments",
  description: "Join competitive Free Fire tournaments, win real prizes. The premier esports tournament platform for NGL.",
  keywords: "free fire, tournament, esports, gaming, ngl, prize pool",
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
