'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';

export default function LoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

const handleLogin = async (e: React.FormEvent) => {
  e.preventDefault();

  const res = await fetch('/api/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, password }),
  });

  if (res.ok) {
    // Store in localStorage to show name in header (optional)
    localStorage.setItem('adminName', username);
    router.push('/admin');
  } else {
    const data = await res.json();
    setError(data.message || 'ورود ناموفق بود');
  }
};


  return (
    <main className="min-h-screen flex items-center justify-center bg-gray-100">
      <form onSubmit={handleLogin} className="bg-white p-6 rounded shadow-md w-full max-w-md">
        <h1 className="text-xl font-bold mb-4">ورود مدیر</h1>

        {error && <p className="text-red-500 mb-2">{error}</p>}

        <input
          className="w-full border px-4 py-2 mb-3"
          type="text"
          placeholder="نام کاربری"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
        />

        <input
          className="w-full border px-4 py-2 mb-4"
          type="password"
          placeholder="کلمه عبور"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        <button className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700">
          Login
        </button>
      </form>
    </main>
  );
}
