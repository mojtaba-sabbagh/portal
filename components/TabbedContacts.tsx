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
      <div className="lg:w-2/3 mx-auto overflow-x-auto">
        <table className="table-fixed w-full text-sm text-center border border-gray-300 rounded shadow-sm">
          <thead className="bg-blue-100 text-gray-800">
            <tr>
              <th className="w-1/4 px-2 py-2">واحد</th>
              <th className="w-1/4 px-2 py-2">نام کامل</th>
              <th className="w-1/4 px-2 py-2">شماره داخلی</th>
              <th className="w-1/4 px-2 py-2">شماره بیرونی</th>
            </tr>
          </thead>
          <tbody>
            {data.map((row, idx) => (
              <tr
                key={idx}
                className={idx % 2 === 0 ? 'bg-white' : 'bg-gray-50'}
              >
                <td className="px-2 py-2">{row.unit}</td>
                <td className="px-2 py-2">{row.name}</td>
                <td className="px-2 py-2">{row.internal}</td>
                <td className="px-2 py-2">{row.external}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  }

  return (
    <div className="tabs employees mt-10">
      <div className="tab-buttons flex gap-2 mb-5 justify-center">
        <button
          onClick={() => setActiveTab('tab1')}
          className={`px-4 py-2 rounded shadow-sm font-medium ${
            activeTab === 'tab1'
              ? 'bg-blue-600 text-white'
              : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
          }`}
        >
          تلفن‌های کوثر کویر رفسنجان
        </button>
        <button
          onClick={() => setActiveTab('tab2')}
          className={`px-4 py-2 rounded shadow-sm font-medium ${
            activeTab === 'tab2'
              ? 'bg-blue-600 text-white'
              : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
          }`}
        >
          تلفن‌های هاگ
        </button>
      </div>

      <div className={activeTab === 'tab1' ? 'block' : 'hidden'}>
        {renderTable(tab1Data)}
      </div>

      <div className={activeTab === 'tab2' ? 'block' : 'hidden'}>
        {renderTable(tab2Data)}
      </div>
    </div>
  );
}
