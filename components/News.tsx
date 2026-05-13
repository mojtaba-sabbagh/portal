// components/News.tsx
'use client';
import { useEffect, useState } from 'react';

interface NewsItem {
  id: number;
  title: string;
  description: string;
  image?: string;
  date?: string;
}

export default function News() {
  const [newsItems, setNewsItems] = useState<NewsItem[]>([]);

  useEffect(() => {
    async function fetchNews() {
      try {
        const res = await fetch('/api/news');
        const data = await res.json();
        setNewsItems(Array.isArray(data) ? data : []);
      } catch (error) {
        console.error('Failed to fetch news:', error);
      }
    }
    fetchNews();
  }, []);

  return (
    <section className="mt-10">
      <h2 className="text-xl font-bold mb-6">اخبار</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {newsItems.map((item) => (
          <div
            key={item.id}
            className="flex bg-white border-r-4 border-green-500 rounded-md shadow-sm overflow-hidden"
          >
            <img
              src={item.image || '/images/news-placeholder.jpg'}
              alt={item.title}
              width={134}
              height={95}
              className="object-cover w-[95px] h-[134px]"
            />
            <div className="p-4 text-sm leading-6 text-gray-800">
              <h3 className="font-bold mb-2 text-base text-black">{item.title}</h3>
              <p>{item.description}</p>
              {item.date && (
                <p className="text-xs text-gray-500 mt-2">{item.date}</p>
              )}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
