'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useState } from 'react';

export default function Header() {
  const [adminName, setAdminName] = useState<string | null>(null);

  useEffect(() => {
    const name = localStorage.getItem('adminName');
    setAdminName(name);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('adminName');
    document.cookie = 'adminName=; Max-Age=0; path=/'; // remove cookie if used
    window.location.href = '/admin/login';
  };

  return (
    <header className="bg-gray-200 text-black py-4 px-6">
      <div className="max-w-screen-xl mx-auto flex items-center justify-between">

        {/* Right: Company logo */}
        <div className="flex-shrink-0">
          <Link href="/">
            <Image src="/logo.png" alt="لوگوی شرکت" width={120} height={40} />
          </Link>
        </div>

        {/* Center: Title */}
        <h1 className="text-lg font-semibold text-center flex-grow text-black">
          پرتال شرکت کوثر کویر رفسنجان
        </h1>

        {/* Left: Language + Login/Logout */}
        <div className="flex items-center gap-4 text-sm">
          {adminName ? (
            <>
              <button onClick={handleLogout} className="text-red-600 pl-4 hover:underline">
                خروج 
              </button>
              <Link href="/admin" className="text-blue-600 hover:underline">{adminName}</Link>
              </>
          ) : (
            <Link href="/login" className="text-blue-600 hover:underline">ورود</Link>
        )}

        </div>
        <Link href="/" className="text-blue-600 pr-4 hover:underline">En</Link>
      </div>
    </header>
  );
}
