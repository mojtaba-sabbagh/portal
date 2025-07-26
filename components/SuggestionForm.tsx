// components/SuggestionForm.tsx
'use client';

import { useState } from 'react';

export default function SuggestionForm() {
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [status, setStatus] = useState<'idle' | 'sending' | 'sent' | 'error'>('idle');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('sending');

    try {
      const res = await fetch('/api/send-comment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ subject, message })
      });

      if (res.ok) {
        setStatus('sent');
        setSubject('');
        setMessage('');
      } else {
        throw new Error('Failed to send');
      }
    } catch (err) {
      console.error(err);
      setStatus('error');
    }
  };

  return (
    <div className="max-w-xl mx-auto">
      <h2 className="text-xl font-bold mb-4">ارسال پیشنهاد</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block mb-1">موضوع</label>
          <input
            type="text"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            placeholder="موضوع را وارد کنید"
            required
            className="w-full p-2 border border-gray-300 rounded"
          />
        </div>
        <div>
          <label className="block mb-1">متن پیام</label>
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="متن پیام خود را بنویسید"
            required
            className="w-full p-2 border border-gray-300 rounded h-32"
          />
        </div>
        <div className="relative">
          <button
            type="submit"
            className={`bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded w-full ${
              status === 'sending' ? 'opacity-75' : ''
            }`}
            disabled={status === 'sending'}
          >
            {status === 'sending' ? (
              <span className="invisible">ارسال</span>
            ) : (
              'ارسال'
            )}
          </button>
          {status === 'sending' && (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white"></div>
            </div>
          )}
        </div>
        {status === 'sent' && <p className="text-green-600">پیام با موفقیت ارسال شد.</p>}
        {status === 'error' && <p className="text-red-600">خطا در ارسال پیام.</p>}
      </form>
    </div>
  );
}