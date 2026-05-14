'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useState } from 'react';

export default function Header() {
  const [adminName, setAdminName] = useState<string | null>(null);
  const [portalEmail, setPortalEmail] = useState<string | null>(null);

  useEffect(() => {
    const name = localStorage.getItem('adminName');
    setAdminName(name);

    fetch('/api/auth/me')
      .then((response) => (response.ok ? response.json() : null))
      .then((data) => {
        if (data?.user?.email) {
          setPortalEmail(data.user.email);
        }
      })
      .catch(() => setPortalEmail(null));
  }, []);

  const handleAdminLogout = () => {
    localStorage.removeItem('adminName');
    document.cookie = 'adminName=; Max-Age=0; path=/'; // remove cookie if used
    window.location.href = '/admin/login';
  };

  const handlePortalLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    setPortalEmail(null);
    window.location.href = '/';
  };

  return (
    <header className="bg-gray-200 text-black py-4 px-6">
      <div className="max-w-screen-xl mx-auto flex items-center justify-between">

        {/* Right: Company logo */}
        <div className="flex-shrink-0">
          <Link href="/">
            <Image
              src="/logo.png"
              alt="Logo"
              width={400}
              height={124}
              style={{
                width: 'auto',      // Or a specific width like '200px'
                height: 'auto',     // Preserves aspect ratio
              }}
              preload={true}
            />
          </Link>
        </div>

        {/* Center: Title */}
        <div className="flex-grow text-center">
          <Link href="/">
            <h1 className="text-lg font-semibold text-black inline-block">
              پرتال شرکت کوثر کویر رفسنجان
            </h1>
          </Link>
        </div>
        
        {/* Left: Language + Login/Logout */}
        <div className="flex items-center gap-4 text-sm">
          {portalEmail ? (
            <>
              <button onClick={handlePortalLogout} className="text-red-600 hover:underline">
                خروج
              </button>
              <span className="max-w-40 truncate text-gray-700" dir="ltr" title={portalEmail}>
                {portalEmail}
              </span>
            </>
          ) : (
            <Link href="/login" className="text-blue-600 hover:underline">ورود یکپارچه</Link>
          )}

          {adminName ? (
            <>
              <button onClick={handleAdminLogout} className="text-red-600 pl-4 hover:underline">
                خروج مدیر
              </button>
              <Link href="/admin" className="text-blue-600 hover:underline">{adminName}</Link>
              </>
          ) : (
            <Link href="/admin/login" className="text-blue-600 hover:underline">مدیر</Link>
        )}

        </div>
        <Link href="/" className="text-blue-600 pr-4 hover:underline">En</Link>
      </div>
    </header>
  );
}
