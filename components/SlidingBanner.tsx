'use client';
import { useEffect, useState } from 'react';
import yaml from 'js-yaml';
import Link from 'next/link';

interface Banner {
  title: string;
  image: string;
  link: string;
}

export default function SlidingBanner() {
  const [banners, setBanners] = useState<Banner[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    async function fetchBanners() {
      const res = await fetch('/data/banners.yaml');
      const text = await res.text();
      const data = yaml.load(text) as Banner[];
      setBanners(data);
    }
    fetchBanners();
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % banners.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [banners]);

  if (banners.length === 0) return null;

  const banner = banners[currentIndex];

  return (
    <div className="relative w-full h-[300px] sm:h-[400px] md:h-[450px] lg:h-[500px] overflow-hidden">
      <Link href={banner.link}>
        <div className="absolute inset-0 transition-opacity duration-700">
          <img
            src={banner.image}
            alt={banner.title}
            className="w-full h-full object-cover"
          />
          <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-40 text-white p-4 text-lg text-center font-bold">
            {banner.title}
          </div>
        </div>
      </Link>
    </div>
  );
}
