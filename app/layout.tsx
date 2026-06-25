import type { Metadata } from "next";
import "./globals.css";
import { StoreProvider } from "@/lib/store";
import { Sidebar } from "@/components/Sidebar";

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
    <html lang="en">
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
