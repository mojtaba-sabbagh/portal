// components/VideoSection.tsx
'use client';
import { useEffect, useState } from 'react';
import yaml from 'js-yaml';

interface Video {
  label: string;
  src: string;
}

interface VideoCategory {
  category: string;
  videos: Video[];
}

export default function VideoSection() {
  const [videoData, setVideoData] = useState<VideoCategory[]>([]);

  useEffect(() => {
    async function fetchVideos() {
      const res = await fetch('/data/videos.yaml');
      const text = await res.text();
      const data = yaml.load(text) as VideoCategory[];
      setVideoData(data);
    }
    fetchVideos();
  }, []);

  return (
    <section className="mt-10">
      <h2 className="text-xl font-bold mb-6">ویدئوهای آموزشی و معرفی</h2>
      {videoData.map((group, idx) => (
        <div key={idx} className="mb-10">
          <h3 className="text-lg font-semibold mb-4 border-b pb-1 border-gray-300">{group.category}</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
            {group.videos.map((video, vIdx) => (
              <div key={vIdx} className="bg-white rounded shadow overflow-hidden">
                <video
                  className="w-full h-auto"
                  controls
                  src={video.src}
                />
                <div className="p-3 text-sm text-gray-800 font-medium text-center">
                  {video.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </section>
  );
}
