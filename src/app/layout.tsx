import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Hakka House — Keep the words alive",
  description: "A thoughtful Hakka translation workspace for text, voice, live conversation, and photos.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en"><body>{children}</body></html>;
}
