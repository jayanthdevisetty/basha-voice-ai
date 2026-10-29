import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Basha — Voice AI | Shaik Rameez Basha",
  description:
    "Have a conversation with my AI voice agent. Built by Shaik Rameez Basha for the 100x AI Agent Team Stage 1 Assessment.",
  keywords: [
    "Shaik Rameez Basha",
    "Voice AI",
    "AI Agent",
    "100x AI",
    "Generative AI",
    "Full-Stack Engineer",
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
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
      </head>
      <body className="bg-surface text-on-surface min-h-screen flex flex-col selection:bg-primary-fixed selection:text-on-primary-fixed">
        {children}
      </body>
    </html>
  );
}
