import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Basha — Voice AI",
  description:
    "Have a conversation with my AI voice agent. Built by Shaik Rameez Basha for the 100x AI Agent Team Stage 1 Assessment.",
  keywords: [
    "Shaik Rameez Basha",
    "Voice AI",
    "AI Agent",
    "100x AI",
    "Generative AI",
    "FastAPI",
    "Next.js",
  ],
  authors: [{ name: "Shaik Rameez Basha" }],
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className="bg-zinc-950 text-zinc-100 min-h-screen flex flex-col antialiased selection:bg-indigo-500/30 selection:text-indigo-200">
        {children}
      </body>
    </html>
  );
}
