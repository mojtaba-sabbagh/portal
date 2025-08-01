'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

export default function AdminPage() {
  const router = useRouter();
  const [adminName, setAdminName] = useState<string | null>(null);

  useEffect(() => {
    const name = localStorage.getItem('adminName');
    if (!name) {
      router.push('/login');
    } else {
      setAdminName(name);
    }
  }, [router]);

  const handleNavigation = (path: string) => {
    router.push(`/admin/${path}`);
  };

  // ✅ Move this OUTSIDE of JSX
  const sectionTitles: Record<string, string> = {
    banner: 'بنرهای سایت',
    news: 'اخبار',
    telephone: 'تلفن‌ها',
    videos: 'ویدئوها',
  };

  if (!adminName) return null;

  return (
    <main className="min-h-screen bg-gray-100 p-10">
      <div className="max-w-3xl mx-auto bg-white p-8 rounded shadow">
        <h1 className="text-2xl font-bold mb-6">خوش آمدی {adminName}</h1>
        <p className="text-gray-600 mb-4">یک بخش برای مدیریت انتخاب کنید:</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {['banner', 'news', 'telephone', 'videos'].map((section) => (
            <button
              key={section}
              className="bg-blue-600 hover:bg-blue-700 text-white py-4 rounded text-lg"
              onClick={() => handleNavigation(section)}
            >
              {sectionTitles[section]}
            </button>
          ))}
        </div>
      </div>
    </main>
  );
}
