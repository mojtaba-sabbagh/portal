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

export default function ContactsAdminPage() {
  const [contacts, setContacts] = useState<Record<string, Contact[]>>({});
  const [activeTab, setActiveTab] = useState<string>('');
  const [newEntry, setNewEntry] = useState<Omit<Contact, 'id' | 'tab'>>({ unit: '', name: '', internal: '', external: '' });
  const [editingId, setEditingId] = useState<number | null>(null);

  useEffect(() => {
    fetch('/api/contacts')
      .then(res => res.json())
      .then(data => {
        setContacts(data);
        const firstTab = Object.keys(data)[0];
        if (firstTab) setActiveTab(firstTab);
      });
  }, []);

  const handleChange = (field: keyof Omit<Contact, 'id' | 'tab'>, value: string) => {
    setNewEntry(prev => ({ ...prev, [field]: value }));
  };

  const saveEntry = async () => {
    const payload = {
      ...newEntry,
      tab: activeTab,
    };

    if (editingId !== null) {
      await fetch('/api/contacts', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: editingId, ...payload }),
      });
    } else {
      await fetch('/api/contacts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
    }

    setNewEntry({ unit: '', name: '', internal: '', external: '' });
    setEditingId(null);
    
    // Reload contacts
    const res = await fetch('/api/contacts');
    const data = await res.json();
    setContacts(data);
  };

  const editEntry = (id: number) => {
    const contact = contacts[activeTab]?.find(c => c.id === id);
    if (contact) {
      setNewEntry({
        unit: contact.unit,
        name: contact.name,
        internal: contact.internal,
        external: contact.external,
      });
      setEditingId(id);
    }
  };

  const deleteEntry = async (id: number) => {
    await fetch('/api/contacts', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id }),
    });
    
    // Reload contacts
    const res = await fetch('/api/contacts');
    const data = await res.json();
    setContacts(data);
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
          {contacts[activeTab]?.map((entry) => (
            <tr key={entry.id} className="text-center">
              <td className="p-2 border">{entry.unit}</td>
              <td className="p-2 border">{entry.name}</td>
              <td className="p-2 border">{entry.internal}</td>
              <td className="p-2 border">{entry.external}</td>
              <td className="p-2 border space-x-2 rtl:space-x-reverse">
                <button onClick={() => editEntry(entry.id)} className="text-yellow-600">ویرایش</button>
                <button onClick={() => deleteEntry(entry.id)} className="text-red-600">حذف</button>
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
          {editingId !== null ? 'ذخیره ویرایش' : 'افزودن'}
        </button>
      </div>
    </main>
  );
}
