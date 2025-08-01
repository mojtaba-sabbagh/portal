'use client';

import { useEffect, useState } from 'react';

interface Contact {
  unit: string;
  name: string;
  internal: string;
  external: string;
}

export default function ContactsAdminPage() {
  const [contacts, setContacts] = useState<Record<string, Contact[]>>({});
  const [activeTab, setActiveTab] = useState<string>('');
  const [newEntry, setNewEntry] = useState<Contact>({ unit: '', name: '', internal: '', external: '' });
  const [editingIndex, setEditingIndex] = useState<number | null>(null);

  useEffect(() => {
    fetch('/api/contacts')
      .then(res => res.json())
      .then(data => {
        setContacts(data);
        const firstTab = Object.keys(data)[0];
        if (firstTab) setActiveTab(firstTab);
      });
  }, []);

  const handleChange = (field: keyof Contact, value: string) => {
    setNewEntry(prev => ({ ...prev, [field]: value }));
  };

  const saveEntry = async () => {
    const updatedTab = [...(contacts[activeTab] || [])];

    if (editingIndex !== null) {
      updatedTab[editingIndex] = newEntry;
    } else {
      updatedTab.push(newEntry);
    }

    const updated = { ...contacts, [activeTab]: updatedTab };
    setContacts(updated);
    setNewEntry({ unit: '', name: '', internal: '', external: '' });
    setEditingIndex(null);

    await fetch('/api/contacts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updated),
    });
  };

  const editEntry = (index: number) => {
    setNewEntry(contacts[activeTab][index]);
    setEditingIndex(index);
  };

  const deleteEntry = async (index: number) => {
    const updatedTab = [...contacts[activeTab]];
    updatedTab.splice(index, 1);
    const updated = { ...contacts, [activeTab]: updatedTab };
    setContacts(updated);
    await fetch('/api/contacts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updated),
    });
  };

  return (
    <main className="p-8">
      <h1 className="text-2xl font-bold mb-4">مدیریت اطلاعات تماس</h1>

      {/* Tab selector */}
      <div className="flex gap-4 mb-4">
        {Object.keys(contacts).map(tab => (
          <button
            key={tab}
            className={`px-4 py-2 rounded ${tab === activeTab ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}
            onClick={() => setActiveTab(tab)}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Contact list */}
      <table className="w-full table-auto border mb-6">
        <thead>
          <tr className="bg-gray-100">
            <th className="p-2 border">واحد</th>
            <th className="p-2 border">نام</th>
            <th className="p-2 border">داخلی</th>
            <th className="p-2 border">خارجی</th>
            <th className="p-2 border">عملیات</th>
          </tr>
        </thead>
        <tbody>
          {contacts[activeTab]?.map((entry, index) => (
            <tr key={index} className="text-center">
              <td className="p-2 border">{entry.unit}</td>
              <td className="p-2 border">{entry.name}</td>
              <td className="p-2 border">{entry.internal}</td>
              <td className="p-2 border">{entry.external}</td>
              <td className="p-2 border space-x-2 rtl:space-x-reverse">
                <button onClick={() => editEntry(index)} className="text-yellow-600">ویرایش</button>
                <button onClick={() => deleteEntry(index)} className="text-red-600">حذف</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Form to add/edit */}
      <div className="space-y-3">
        <input
          type="text"
          className="border p-2 w-full"
          placeholder="واحد"
          value={newEntry.unit}
          onChange={e => handleChange('unit', e.target.value)}
        />
        <input
          type="text"
          className="border p-2 w-full"
          placeholder="نام"
          value={newEntry.name}
          onChange={e => handleChange('name', e.target.value)}
        />
        <input
          type="text"
          className="border p-2 w-full"
          placeholder="داخلی"
          value={newEntry.internal}
          onChange={e => handleChange('internal', e.target.value)}
        />
        <input
          type="text"
          className="border p-2 w-full"
          placeholder="خارجی"
          value={newEntry.external}
          onChange={e => handleChange('external', e.target.value)}
        />
        <button onClick={saveEntry} className="bg-blue-600 text-white px-4 py-2 rounded">
          {editingIndex !== null ? 'ذخیره ویرایش' : 'افزودن'}
        </button>
      </div>
    </main>
  );
}
