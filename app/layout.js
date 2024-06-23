'use client'
import { Inter } from "next/font/google";
import "./globals.css";
import { handlePathChange } from "./components/path-change";

const inter = Inter({ subsets: ["latin"] });

export default function RootLayout({ children }) {
  handlePathChange();
  return (
    <html lang="en">
      <body className={inter.className}>{children}</body>
    </html>
  );
}