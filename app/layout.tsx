import type { Metadata } from "next";
import '@/styles/globals.css';
import Header from '@/components/Header';

export const metadata: Metadata = {
  title: "پورتال کوثرکویر",
  description: "طراحی و اجرا توسط فناوری اطلاعات کوثر کویر رفسنجان",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fa" dir="rtl">
      <body className="bg-gray-50 min-h-screen">
        <Header />
        {children}
      </body>
    </html>
  );
}
