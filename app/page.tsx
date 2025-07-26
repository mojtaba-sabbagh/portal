// app/page.tsx
'use client';

import Header from '@/components/Header';
import Navbar from '@/components/Navbar';
import PortalGrid from '@/components/PortalGrid';
import News from '@/components/News';
import TabbedContacts from '@/components/TabbedContacts';
import Footer from '@/components/Footer';

export default function Home() {
  return (
    <main className="bg-gray-100 font-yekan">
      <Header />
      <Navbar />
      <div className="container mx-auto px-4 py-5 bg-white shadow-md">
        <h2>سامانه‌ها</h2>
        <PortalGrid />
        <News />
        <TabbedContacts />
        <div className="mt-8">
          <p>تلفن‌های شرکت کوثر کویر رفسنجان:</p>
          <p>034-34287871, 34287872, 34288338, 34288339, 09426002408</p>
        </div>
      </div>
      <Footer />
    </main>
  );
}
