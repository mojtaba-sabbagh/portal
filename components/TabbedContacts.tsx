// components/TabbedContacts.tsx
'use client';
import { useEffect, useState } from 'react';
import yaml from 'js-yaml';

interface Contact {
  unit: string;
  name: string;
  internal: string;
  external: string;
}

export default function TabbedContacts() {
  const [activeTab, setActiveTab] = useState<'tab1' | 'tab2'>('tab1');
  const [tab1Data, setTab1Data] = useState<Contact[]>([]);
  const [tab2Data, setTab2Data] = useState<Contact[]>([]);

  useEffect(() => {
    async function fetchContacts() {
      const res = await fetch('/data/contacts.yaml');
      const text = await res.text();
      const data = yaml.load(text) as { tab1: Contact[]; tab2: Contact[] };
      setTab1Data(data.tab1);
      setTab2Data(data.tab2);
    }
    fetchContacts();
  }, []);

  function renderTable(data: Contact[]) {
    return (
      <table className="table-auto w-full border border-gray-300">
        <thead className="bg-gray-100">
          <tr>
            <th className="border px-2 py-1">واحد</th>
            <th className="border px-2 py-1">نام کامل</th>
            <th className="border px-2 py-1">شماره داخلی</th>
            <th className="border px-2 py-1">شماره از بیرون</th>
          </tr>
        </thead>
        <tbody>
          {data.map((row, idx) => (
            <tr key={idx}>
              <td className="border px-2 py-1">{row.unit}</td>
              <td className="border px-2 py-1">{row.name}</td>
              <td className="border px-2 py-1">{row.internal}</td>
              <td className="border px-2 py-1">{row.external}</td>
            </tr>
          ))}
        </tbody>
      </table>
    );
  }

  return (
    <div className="tabs employees mt-8">
      <div className="tab-buttons flex gap-2 mb-4">
        <button onClick={() => setActiveTab('tab1')} className={`px-4 py-2 rounded ${activeTab === 'tab1' ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}>
          تلفن‌های کوثر کویر رفسنجان
        </button>
        <button onClick={() => setActiveTab('tab2')} className={`px-4 py-2 rounded ${activeTab === 'tab2' ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}>
          تلفن‌های هاگ
        </button>
      </div>

      <div className={`tab-content ${activeTab === 'tab1' ? 'block' : 'hidden'}`}>
        {renderTable(tab1Data)}
      </div>

      <div className={`tab-content ${activeTab === 'tab2' ? 'block' : 'hidden'}`}>
        {renderTable(tab2Data)}
      </div>
    </div>
  );
}