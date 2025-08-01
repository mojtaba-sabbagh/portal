// app/video/page.tsx
'use client';

import Header from '@/components/Header';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import VideoSection from '@/components/VideoSection';

export default function VideoPage() {
  return (
    <main className="bg-gray-100 font-yekan">
      <Navbar />
      <div className="container mx-auto px-4 py-5 bg-white shadow-md">
        <VideoSection />
      </div>
      <Footer />
    </main>
  );
}