'use client';
import { useEffect, useState } from 'react';

interface Contact {
  id: number;
  unit: string;
  name: string;
  internal: string | number;
  external: string | number;
  tab: string;
}

export default function TabbedContacts() {
  const [activeTab, setActiveTab] = useState<string>('');
  const [allContacts, setAllContacts] = useState<{ [key: string]: Contact[] }>({});
  const [tabs, setTabs] = useState<string[]>([]);

  useEffect(() => {
    async function fetchContacts() {
      try {
        const res = await fetch('/api/contacts');
        const data = await res.json();
        setAllContacts(data);
        const tabNames = Object.keys(data);
        setTabs(tabNames);
        if (tabNames.length > 0) {
          setActiveTab(tabNames[0]);
        }
      } catch (error) {
        console.error('Failed to fetch contacts:', error);
      }
    }
    fetchContacts();
  }, []);

  const currentData = allContacts[activeTab] || [];

  function renderTable(data: Contact[]) {
    if (!Array.isArray(data)) {
          return <div className="text-center text-red-500">Invalid data format</div>;
    }
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
                key={row.id}
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
      <div className="tab-buttons flex gap-2 mb-5 justify-center flex-wrap">
        {tabs.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 rounded shadow-sm font-medium ${
              activeTab === tab
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {activeTab && (
        <div>
          {renderTable(currentData)}
        </div>
      )}
    </div>
  );
}
