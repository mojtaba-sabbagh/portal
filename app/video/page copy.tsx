// app/video/page.tsx
'use client';

import Header from '@/components/Header';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

const videos = [
  { src: '/videos/ch01.m4v', label: 'بخش اول' },
  { src: '/videos/ch02.m4v', label: 'بخش دوم' },
  { src: '/videos/ch03.m4v', label: 'بخش سوم' },
  { src: '/videos/ch04.m4v', label: 'بخش چهارم' },
  { src: '/videos/ch05.m4v', label: 'بخش پنجم' },
  { src: '/videos/ch06.m4v', label: 'بخش ششم' }
];

export default function VideoPage() {
  return (
    <main className="bg-gray-100 font-yekan">
      <Header />
      <Navbar />
      <div className="container mx-auto px-4 py-5">
        <h2 className="text-2xl font-bold mb-6">مجموعه ویدیوهای آموزشی و معرفی</h2>
        <div className="video-section bg-white p-5 rounded-md shadow-md border-r-4 border-green-500">
          <h3 className="text-lg font-bold mb-4">سامانه جامع تجارت</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {videos.map((video, idx) => (
              <div key={idx} className="relative bg-black rounded-md overflow-hidden aspect-video">
                <video controls preload="metadata" className="w-full h-full object-cover">
                  <source src={video.src} type="video/mp4" />
                  {video.label}
                </video>
                <div className="video-name absolute bottom-0 left-0 right-0 bg-black bg-opacity-80 text-white text-xs text-center py-1">
                  {video.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
      <Footer />
    </main>
  );
}
