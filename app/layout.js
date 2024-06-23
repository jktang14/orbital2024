'use client'
import { Inter } from "next/font/google";
import "./globals.css";
import { HandlePathChange } from "./components/path-change";

const inter = Inter({ subsets: ["latin"] });

export default function RootLayout({ children }) {
  HandlePathChange();
  return (
    <html lang="en">
      <body className={inter.className}>{children}</body>
    </html>
  );
}