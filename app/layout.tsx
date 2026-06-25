import type { Metadata } from "next";
import { Inter, Merriweather } from "next/font/google";
import "./globals.css";
import { StoreProvider } from "@/lib/store";
import { Sidebar } from "@/components/Sidebar";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
});

// Clever headlines are always Merriweather.
const merriweather = Merriweather({
  subsets: ["latin"],
  weight: ["400", "700", "900"],
  variable: "--font-serif",
  display: "swap",
});

export const metadata: Metadata = {
  title: "AI Enablement — Intake & Triage",
  description:
    "Capture, quantify, triage, and run discovery on workflow friction opportunities.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${inter.variable} ${merriweather.variable}`}>
      <body className="font-sans">
        <StoreProvider>
          <Sidebar />
          <main className="ml-60 min-h-screen px-8 py-8">
            <div className="mx-auto max-w-7xl">{children}</div>
          </main>
        </StoreProvider>
      </body>
    </html>
  );
}
