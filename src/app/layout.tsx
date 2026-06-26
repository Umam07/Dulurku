import type { Metadata } from "next";
import { Plus_Jakarta_Sans, Lora } from "next/font/google";
import { FamilyProvider } from "@/context/FamilyContext";
import "./globals.css";

const plusJakartaSans = Plus_Jakarta_Sans({
  variable: "--font-plus-jakarta-sans",
  subsets: ["latin"],
  display: "swap",
});

const lora = Lora({
  variable: "--font-lora",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Dulurku — Guyub Rukun Marganing Rahayu",
  description: "Poros digital keluarga besar untuk menjaga silaturahmi lintas generasi dan lintas kota, di mana pun dulur merantau.",
  keywords: ["Silsilah Keluarga", "Pohon Keluarga", "Silaturahmi", "Dulurku", "Keluarga Jawa Timur"],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="id"
      className={`${plusJakartaSans.variable} ${lora.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <body className="min-h-full flex flex-col font-sans bg-background text-foreground">
        <FamilyProvider>
          {children}
        </FamilyProvider>
      </body>
    </html>
  );
}
