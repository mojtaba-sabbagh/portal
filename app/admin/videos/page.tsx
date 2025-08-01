'use client';

import { useEffect, useState } from 'react';
import { DragDropContext, Droppable, Draggable, DropResult } from 'react-beautiful-dnd';

interface VideoItem {
  label: string;
  src: string;
}

interface Category {
  category: string;
  videos: VideoItem[];
}

export default function VideoAdminPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [newCategory, setNewCategory] = useState<string>('');

  useEffect(() => {
    fetch('/api/videos')
      .then(res => res.json())
      .then(data => setCategories(data));
  }, []);

  const handleAddCategory = () => {
    if (!newCategory) return;
    setCategories(prev => [...prev, { category: newCategory, videos: [] }]);
    setNewCategory('');
  };

  const handleAddVideo = (catIndex: number) => {
    const label = prompt('برچسب ویدیو:');
    const src = prompt('آدرس ویدیو:');
    if (!label || !src) return;
    const updated = [...categories];
    updated[catIndex].videos.push({ label, src });
    setCategories(updated);
  };

  const handleDeleteVideo = (catIndex: number, vidIndex: number) => {
    const updated = [...categories];
    updated[catIndex].videos.splice(vidIndex, 1);
    setCategories(updated);
  };

  const handleDeleteCategory = (index: number) => {
    const updated = [...categories];
    updated.splice(index, 1);
    setCategories(updated);
  };

  const handleSave = async () => {
    await fetch('/api/videos', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(categories),
    });
    alert('ذخیره شد ✅');
  };

  const onDragEnd = (result: DropResult) => {
    const { source, destination, type } = result;
    if (!destination) return;

    const updated = [...categories];

    if (type === 'CATEGORY') {
      const [moved] = updated.splice(source.index, 1);
      updated.splice(destination.index, 0, moved);
    } else if (type === 'VIDEO') {
      const sourceCat = updated[source.droppableId as any];
      const destCat = updated[destination.droppableId as any];
      const [movedVideo] = sourceCat.videos.splice(source.index, 1);
      destCat.videos.splice(destination.index, 0, movedVideo);
    }
    setCategories(updated);
  };

  return (
    <main className="p-8">
      <h1 className="text-2xl font-bold mb-4">مدیریت ویدیوها</h1>

      <div className="flex gap-2 mb-4">
        <input
          type="text"
          className="border p-2 w-full"
          placeholder="نام دسته جدید"
          value={newCategory}
          onChange={(e) => setNewCategory(e.target.value)}
        />
        <button onClick={handleAddCategory} className="bg-green-600 text-white px-4 py-2 rounded">
          افزودن دسته
        </button>
      </div>

      <DragDropContext onDragEnd={onDragEnd}>
        <Droppable droppableId="categoryList" type="CATEGORY" isDropDisabled={false} isCombineEnabled={false} ignoreContainerClipping={false}>            
          {(provided) => (
            <div ref={provided.innerRef} {...provided.droppableProps} className="space-y-6">
              {categories.map((cat, catIndex) => (
                <Draggable draggableId={`cat-${catIndex}`} index={catIndex} key={`cat-${catIndex}`}>
                  {(catProvided) => (
                    <div
                      ref={catProvided.innerRef}
                      {...catProvided.draggableProps}
                      className="bg-white p-4 rounded shadow"
                    >
                      <div className="flex justify-between items-center mb-2">
                        <h2 {...catProvided.dragHandleProps} className="text-xl font-bold">{cat.category}</h2>
                        <button onClick={() => handleDeleteCategory(catIndex)} className="text-red-600">حذف</button>
                      </div>
                      <button onClick={() => handleAddVideo(catIndex)} className="text-sm mb-3 text-blue-600">
                        افزودن ویدیو
                      </button>
                      <Droppable droppableId={catIndex.toString()} type="VIDEO" isDropDisabled={false} isCombineEnabled={false} ignoreContainerClipping={false} >
                        {(videoProvided) => (
                          <div ref={videoProvided.innerRef} {...videoProvided.droppableProps} className="space-y-2">
                            {cat.videos.map((video, vidIndex) => (
                              <Draggable
                                draggableId={`cat-${catIndex}-vid-${vidIndex}`}
                                index={vidIndex}
                                key={`cat-${catIndex}-vid-${vidIndex}`}
                              >
                                {(vidProvided) => (
                                  <div
                                    ref={vidProvided.innerRef}
                                    {...vidProvided.draggableProps}
                                    {...vidProvided.dragHandleProps}
                                    className="border p-3 rounded flex justify-between"
                                  >
                                    <div>
                                      <p className="font-semibold">{video.label}</p>
                                      <p className="text-sm text-gray-600">{video.src}</p>
                                    </div>
                                    <button
                                      onClick={() => handleDeleteVideo(catIndex, vidIndex)}
                                      className="text-red-600"
                                    >
                                      حذف
                                    </button>
                                  </div>
                                )}
                              </Draggable>
                            ))}
                            {videoProvided.placeholder}
                          </div>
                        )}
                      </Droppable>
                    </div>
                  )}
                </Draggable>
              ))}
              {provided.placeholder}
            </div>
          )}
        </Droppable>
      </DragDropContext>

      <button onClick={handleSave} className="mt-6 bg-blue-600 text-white px-6 py-2 rounded">
        ذخیره نهایی
      </button>
    </main>
  );
}
