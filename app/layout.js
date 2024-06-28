'use client'
import {React, useState, useEffect} from 'react';
import { Inter } from "next/font/google";
import "./globals.css";
import { HandlePathChange } from "./components/path-change";
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { usePathname } from 'next/navigation';

const inter = Inter({ subsets: ["latin"] });

export default function RootLayout({ children }) {
  const pathName = usePathname();
  const pathWithToast = '/game';

  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // Set the state to true after the component mounts
    setMounted(true);
  }, []);
  
  HandlePathChange();
  return (
    <html lang="en">
      <body className={inter.className}>{children}</body>
      {mounted && pathWithToast == pathName && <ToastContainer />}
    </html>
  );
}