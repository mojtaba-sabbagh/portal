'use client';

import { useEffect, useState } from 'react';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';

interface Banner {
  title: string;
  image: string;
  link: string;
}

export default function BannerAdminPage() {
  const [banners, setBanners] = useState<Banner[]>([]);
  const [form, setForm] = useState<Banner>({ title: '', image: '', link: '' });
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [errors, setErrors] = useState<string[]>([]);

  const loadBanners = async () => {
    const res = await fetch('/api/banners');
    const data = await res.json();
    setBanners(Array.isArray(data) ? data : []);
  };

  useEffect(() => {
    loadBanners();
  }, []);

  const handleChange = (field: keyof Banner, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const resetForm = () => {
    setForm({ title: '', image: '', link: '' });
    setFile(null);
    setEditingIndex(null);
    setErrors([]);
  };

  const validateForm = () => {
    const errs: string[] = [];
    if (!form.title.trim()) errs.push('عنوان الزامی است.');
    if (!form.link.trim()) errs.push('لینک الزامی است.');
    if (file) {
      const validTypes = ['image/png', 'image/jpeg'];
      if (!validTypes.includes(file.type)) errs.push('فقط PNG یا JPG مجاز است.');
      if (file.size > 5120 * 1024) errs.push('اندازه تصویر باید کمتر از 1MB باشد.');
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

    await fetch('/api/banners', {
      method: editingIndex === null ? 'POST' : 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(
        editingIndex === null ? payload : { index: editingIndex, banner: payload }
      ),
    });

    resetForm();
    loadBanners();
  };

  const handleDelete = async (index: number) => {
    await fetch('/api/banners', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ index }),
    });
    loadBanners();
  };

  const startEdit = (index: number) => {
    setEditingIndex(index);
    setForm(banners[index]);
    setFile(null);
  };

  const onDragEnd = async (result: any) => {
    if (!result.destination) return;
    const reordered = Array.from(banners);
    const [moved] = reordered.splice(result.source.index, 1);
    reordered.splice(result.destination.index, 0, moved);
    setBanners(reordered);

    // Save new order
    await fetch('/api/banners/reorder', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(reordered),
    });
  };

  return (
    <main className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto bg-white p-6 rounded shadow">
        <h1 className="text-xl font-bold mb-6">مدیریت بنرهای سایت</h1>

        <DragDropContext onDragEnd={onDragEnd}>
          <Droppable droppableId="bannerList" isDropDisabled={false} isCombineEnabled={false} ignoreContainerClipping={false}>
            {(provided, snapshot) => (
                <div
                ref={provided.innerRef}
                {...provided.droppableProps}
                className="space-y-4"
                >
                {banners.map((banner, idx) => (
                    <Draggable key={String(idx)} draggableId={String(idx)} index={idx}>
                    {(providedDraggable) => (
                        <div
                        ref={providedDraggable.innerRef}
                        {...providedDraggable.draggableProps}
                        {...providedDraggable.dragHandleProps}
                        className="bg-gray-100 rounded mb-4 p-4 relative border"
                        >
                        <div className="absolute left-2 top-2 cursor-grab">
                            <img src="/drag_icon.png" alt="drag" width={20} height={20} />
                        </div>
                        <img src={banner.image} alt={banner.title} className="w-full h-40 object-cover mb-2" />
                        <h2 className="font-semibold">{banner.title}</h2>
                        <p className="text-sm text-blue-600">{banner.link}</p>
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
          {editingIndex === null ? 'افزودن بنر جدید' : 'ویرایش بنر'}
        </h2>

        {errors.length > 0 && (
          <div className="bg-red-100 text-red-700 p-3 rounded mb-4 space-y-1 text-sm">
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
          <input
            type="text"
            placeholder="لینک"
            className="border p-2 w-full"
            value={form.link}
            onChange={(e) => handleChange('link', e.target.value)}
          />
          <input
            type="text"
            placeholder="آدرس تصویر (یا خالی برای آپلود)"
            className="border p-2 w-full"
            value={form.image}
            onChange={(e) => handleChange('image', e.target.value)}
          />
          <input type="file" accept="image/*" onChange={(e) => setFile(e.target.files?.[0] || null)} />
          {file && <img src={URL.createObjectURL(file)} className="w-48 h-24 object-cover rounded border" />}
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
