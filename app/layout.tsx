import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "OCR Eval Viewer",
  description: "Compare Gemini 3.5 Flash vs Gemini 3.5 Flash Low Thinking",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-neutral-950 text-neutral-100 antialiased">
        {children}
      </body>
    </html>
  );
}
