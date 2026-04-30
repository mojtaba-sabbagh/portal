'use client';

import { useSearchParams } from 'next/navigation';
import { FormEvent, Suspense, useState } from 'react';

type Step = 'email' | 'code';

export default function PortalLoginPage() {
  return (
    <Suspense fallback={<LoginShell />}>
      <LoginForm />
    </Suspense>
  );
}

function LoginShell() {
  return (
    <main className="min-h-screen bg-gray-100 flex items-center justify-center px-4 font-yekan">
      <section className="w-full max-w-md bg-white border border-gray-200 rounded-lg shadow-sm p-6">
        <h1 className="text-xl font-bold text-gray-900 mb-2">ورود یکپارچه پورتال</h1>
        <p className="text-sm text-gray-600">در حال آماده‌سازی...</p>
      </section>
    </main>
  );
}

function LoginForm() {
  const searchParams = useSearchParams();
  const rawReturnTo = searchParams.get('returnTo') || '/';
  const returnTo = rawReturnTo.startsWith('/') && !rawReturnTo.startsWith('//') ? rawReturnTo : '/';
  const [step, setStep] = useState<Step>('email');
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [message, setMessage] = useState('');
  const [devCode, setDevCode] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const requestCode = async (event: FormEvent) => {
    event.preventDefault();
    setIsSubmitting(true);
    setMessage('');
    setDevCode('');

    const response = await fetch('/api/auth/request-code', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email }),
    });
    const data = await response.json();
    setIsSubmitting(false);

    if (!response.ok) {
      setMessage(data.message || 'ارسال کد ورود ناموفق بود');
      return;
    }

    setStep('code');
    setDevCode(data.devCode || '');
    setMessage('کد ورود برای ایمیل شما ارسال شد');
  };

  const verifyCode = async (event: FormEvent) => {
    event.preventDefault();
    setIsSubmitting(true);
    setMessage('');

    const response = await fetch('/api/auth/verify-code', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ code }),
    });
    const data = await response.json();
    setIsSubmitting(false);

    if (!response.ok) {
      setMessage(data.message || 'کد ورود معتبر نیست');
      return;
    }

    window.location.href = returnTo;
  };

  return (
    <main className="min-h-screen bg-gray-100 flex items-center justify-center px-4 font-yekan">
      <section className="w-full max-w-md bg-white border border-gray-200 rounded-lg shadow-sm p-6">
        <h1 className="text-xl font-bold text-gray-900 mb-2">ورود یکپارچه پورتال</h1>
        <p className="text-sm text-gray-600 mb-6">برای ورود به سامانه‌ها، ایمیل سازمانی خود را وارد کنید.</p>

        {message && (
          <p className="mb-4 rounded border border-blue-100 bg-blue-50 px-3 py-2 text-sm text-blue-800">{message}</p>
        )}

        {devCode && (
          <p className="mb-4 rounded border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-900">
            کد توسعه: {devCode}
          </p>
        )}

        {step === 'email' ? (
          <form onSubmit={requestCode} className="space-y-4">
            <label className="block">
              <span className="block text-sm font-medium text-gray-700 mb-1">ایمیل</span>
              <input
                className="w-full rounded border border-gray-300 px-4 py-2 text-left focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100"
                type="email"
                dir="ltr"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder="name@example.com"
                required
              />
            </label>

            <button
              className="w-full rounded bg-blue-600 px-4 py-2 text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-gray-400"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'در حال ارسال...' : 'دریافت کد ورود'}
            </button>
          </form>
        ) : (
          <form onSubmit={verifyCode} className="space-y-4">
            <label className="block">
              <span className="block text-sm font-medium text-gray-700 mb-1">کد ورود</span>
              <input
                className="w-full rounded border border-gray-300 px-4 py-2 text-center tracking-widest focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100"
                type="text"
                inputMode="numeric"
                value={code}
                onChange={(event) => setCode(event.target.value)}
                placeholder="123456"
                required
              />
            </label>

            <button
              className="w-full rounded bg-blue-600 px-4 py-2 text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-gray-400"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'در حال بررسی...' : 'ورود'}
            </button>

            <button type="button" className="w-full text-sm text-blue-700 hover:underline" onClick={() => setStep('email')}>
              تغییر ایمیل
            </button>
          </form>
        )}
      </section>
    </main>
  );
}
