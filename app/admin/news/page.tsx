'use client';

import { useEffect, useState } from 'react';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';

interface NewsItem {
  title: string;
  description: string;
  date: string;
  image: string;
}

export default function NewsAdminPage() {
  const [news, setNews] = useState<NewsItem[]>([]);
  const [form, setForm] = useState<NewsItem>({ title: '', description: '', date: '', image: '' });
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [errors, setErrors] = useState<string[]>([]);

  const loadNews = async () => {
    const res = await fetch('/api/news');
    const data = await res.json();
    setNews(Array.isArray(data) ? data : []);
  };

  useEffect(() => {
    loadNews();
  }, []);

  const handleChange = (field: keyof NewsItem, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const resetForm = () => {
    setForm({ title: '', description: '', date: '', image: '' });
    setFile(null);
    setEditingIndex(null);
    setErrors([]);
  };

  const validateForm = () => {
    const errs: string[] = [];
    if (!form.title.trim()) errs.push('عنوان الزامی است.');
    if (!form.description.trim()) errs.push('توضیح الزامی است.');
    if (!form.date.trim()) errs.push('تاریخ الزامی است.');
    if (file) {
      const validTypes = ['image/png', 'image/jpeg'];
      if (!validTypes.includes(file.type)) errs.push('فقط PNG یا JPG مجاز است.');
      if (file.size > 1024 * 1024) errs.push('اندازه تصویر باید کمتر از 1MB باشد.');
    }
    setErrors(errs);
    return errs.length === 0;
  };

  const uploadImage = async () => {
    if (!file) return null;
    const formData = new FormData();
    formData.append('file', file);
    const res = await fetch('/api/upload', { method: 'POST', body: formData });
    const data = await res.json();
    return data.path;
  };

  const handleSave = async () => {
    if (!validateForm()) return;

    let imagePath = form.image;
    if (file) {
      const uploaded = await uploadImage();
      if (uploaded) imagePath = uploaded;
    }

    const payload = { ...form, image: imagePath };

    await fetch('/api/news', {
      method: editingIndex === null ? 'POST' : 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(
        editingIndex === null ? payload : { index: editingIndex, item: payload }
      ),
    });

    resetForm();
    loadNews();
  };

  const handleDelete = async (index: number) => {
    await fetch('/api/news', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ index }),
    });
    loadNews();
  };

  const startEdit = (index: number) => {
    setEditingIndex(index);
    setForm(news[index]);
    setFile(null);
  };

  const onDragEnd = async (result: any) => {
    if (!result.destination) return;
    const reordered = Array.from(news);
    const [moved] = reordered.splice(result.source.index, 1);
    reordered.splice(result.destination.index, 0, moved);
    setNews(reordered);

    await fetch('/api/news/reorder', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(reordered),
    });
  };

  return (
    <main className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto bg-white p-6 rounded shadow">
        <h1 className="text-xl font-bold mb-6">مدیریت اخبار</h1>

        <DragDropContext onDragEnd={onDragEnd}>
          <Droppable droppableId="newList" isDropDisabled={false} isCombineEnabled={false} ignoreContainerClipping={false}>
            {(provided) => (
              <div ref={provided.innerRef} {...provided.droppableProps} className="space-y-4">
                {news.map((item, idx) => (
                  <Draggable key={String(idx)} draggableId={String(idx)} index={idx}>
                    {(dragProvided) => (
                      <div
                        ref={dragProvided.innerRef}
                        {...dragProvided.draggableProps}
                        {...dragProvided.dragHandleProps}
                        className="bg-gray-100 rounded p-4 border"
                      >
                        <img src={item.image} alt={item.title} className="w-full h-40 object-cover rounded mb-2" />
                        <h2 className="font-semibold text-lg">{item.title}</h2>
                        <p className="text-sm text-gray-700">{item.description}</p>
                        <p className="text-xs text-gray-500 mt-1">{item.date}</p>
                        <div className="mt-2 flex gap-4 rtl:space-x-reverse">
                          <button onClick={() => startEdit(idx)} className="text-yellow-600 hover:underline">ویرایش</button>
                          <button onClick={() => handleDelete(idx)} className="text-red-600 hover:underline">حذف</button>
                        </div>
                      </div>
                    )}
                  </Draggable>
                ))}
                {provided.placeholder}
              </div>
            )}
          </Droppable>
        </DragDropContext>

        <hr className="my-6" />

        <h2 className="text-lg font-bold mb-4">
          {editingIndex === null ? 'افزودن خبر جدید' : 'ویرایش خبر'}
        </h2>

        {errors.length > 0 && (
          <div className="bg-red-100 text-red-700 p-3 rounded mb-4 text-sm">
            {errors.map((e, i) => <div key={i}>• {e}</div>)}
          </div>
        )}

        <div className="space-y-3 mb-4">
          <input
            type="text"
            placeholder="عنوان"
            className="border p-2 w-full"
            value={form.title}
            onChange={(e) => handleChange('title', e.target.value)}
          />
          <textarea
            placeholder="توضیح"
            className="border p-2 w-full"
            value={form.description}
            onChange={(e) => handleChange('description', e.target.value)}
          />
          <input
            type="text"
            placeholder="تاریخ (مثال: 1404/05/02)"
            className="border p-2 w-full"
            value={form.date}
            onChange={(e) => handleChange('date', e.target.value)}
          />
          <input
            type="text"
            placeholder="آدرس تصویر (یا خالی برای آپلود)"
            className="border p-2 w-full"
            value={form.image}
            onChange={(e) => handleChange('image', e.target.value)}
          />
          <input type="file" accept="image/*" onChange={(e) => setFile(e.target.files?.[0] || null)} />
          {file && <img src={URL.createObjectURL(file)} className="w-48 h-24 object-cover border rounded" />}
        </div>

        <div className="flex gap-4 rtl:space-x-reverse">
          <button className="bg-blue-600 text-white px-4 py-2 rounded" onClick={handleSave}>
            {editingIndex === null ? 'افزودن' : 'ذخیره'}
          </button>
          <button className="text-gray-600" onClick={resetForm}>انصراف</button>
        </div>
      </div>
    </main>
  );
}
