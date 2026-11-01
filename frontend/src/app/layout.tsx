import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Commonplace — Multi-agent workspace",
  description: "A focused workspace for conversations with AI agents.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className="dark h-full antialiased">
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
