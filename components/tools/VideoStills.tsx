import React, { useState } from 'react';
import { Upload, Film, Download } from 'lucide-react';
import { Button, DropZone, Panel, EmptyState } from '../ui/Components';
import { downloadZip, downloadBlob, sanitizeFilename } from '../../utils';

interface VideoItem {
  id: string;
  file: File;
  name: string;
  frames: { num: number; blob: Blob; url: string; checked: boolean }[];
  processed: boolean;
}

const VideoStills: React.FC = () => {
  const [videos, setVideos] = useState<VideoItem[]>([]);
  const [processing, setProcessing] = useState(false);
  const [activeVideoId, setActiveVideoId] = useState<string | null>(null);

  const handleFiles = (files: File[]) => {
    const newVideos = files
      .filter(f => f.type.startsWith('video/'))
      .map(f => ({
        id: Math.random().toString(36).substr(2, 9),
        file: f,
        name: sanitizeFilename(f.name.replace(/\.[^/.]+$/, "")),
        frames: [],
        processed: false
      }));
    setVideos(prev => [...prev, ...newVideos]);
  };

  const processVideos = async () => {
    setProcessing(true);
    const updated = [...videos];

    for (const vid of updated) {
        if (vid.processed) continue;

        const videoEl = document.createElement('video');
        videoEl.src = URL.createObjectURL(vid.file);
        videoEl.muted = true;
        videoEl.playsInline = true; 
        await new Promise(r => { videoEl.onloadedmetadata = r; });
        
        const duration = videoEl.duration;
        const frameCount = Math.floor(duration); // Approx 1 frame per second
        const interval = duration / (frameCount + 1);

        for (let i = 1; i <= frameCount; i++) {
            videoEl.currentTime = i * interval;
            await new Promise(r => videoEl.onseeked = r);
            
            const canvas = document.createElement('canvas');
            canvas.width = videoEl.videoWidth;
            canvas.height = videoEl.videoHeight;
            canvas.getContext('2d')?.drawImage(videoEl, 0, 0);
            
            const blob = await new Promise<Blob | null>(r => canvas.toBlob(r, 'image/jpeg', 0.85));
            if (blob) {
                vid.frames.push({
                    num: i,
                    blob,
                    url: URL.createObjectURL(blob),
                    checked: true
                });
            }
        }
        vid.processed = true;
    }
    setVideos(updated);
    setProcessing(false);
  };

  const downloadAll = async () => {
    const files: {name: string, blob: Blob}[] = [];
    videos.forEach(v => {
        v.frames.forEach(f => {
            files.push({ name: `${v.name}/${f.num}.jpg`, blob: f.blob });
        });
    });
    await downloadZip(files, "video_stills.zip");
  };

  const activeVideo = videos.find(v => v.id === activeVideoId);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-[300px_1fr] gap-8 h-full">
        <div className="flex flex-col gap-6">
            <DropZone onFiles={handleFiles} accept="video/*" icon={<Upload size={24} />} label="Add Videos" />
            <div className="flex flex-col gap-3">
                <Button variant="secondary" onClick={processVideos} disabled={processing || videos.length === 0}>
                    {processing ? 'Processing...' : 'Process Videos'}
                </Button>
                <Button variant="cyan" onClick={downloadAll} disabled={!videos.some(v => v.processed)}>
                    Download All
                </Button>
                <Button variant="danger" onClick={() => setVideos([])}>Reset</Button>
            </div>
        </div>

        <div className="overflow-y-auto">
            {videos.length === 0 ? (
                <EmptyState icon={<Film size={48} />} message="No Videos" />
            ) : (
                <div className="flex flex-wrap gap-4">
                    {videos.map(v => (
                        <div 
                            key={v.id} 
                            className={`w-48 bg-[#111] border rounded-lg overflow-hidden cursor-pointer hover:border-cyan-500 transition-colors ${v.processed ? 'border-[#333]' : 'border-dashed border-gray-700'}`}
                            onClick={() => v.processed && setActiveVideoId(v.id)}
                        >
                            <div className="aspect-video bg-black flex items-center justify-center">
                                {v.frames.length > 0 ? (
                                    <img src={v.frames[0].url} className="w-full h-full object-cover" />
                                ) : (
                                    <Film className="text-gray-700" />
                                )}
                            </div>
                            <div className="p-3">
                                <div className="text-sm font-medium truncate">{v.name}</div>
                                <div className="text-xs text-gray-500">
                                    {v.processed ? `${v.frames.length} frames` : 'Pending'}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>

        {activeVideo && (
            <div className="fixed inset-0 bg-black/95 z-50 flex flex-col p-8 animate-in fade-in duration-200">
                <div className="flex justify-between items-center mb-6 pb-4 border-b border-[#333]">
                    <h2 className="text-2xl font-display font-bold text-white">{activeVideo.name}</h2>
                    <Button variant="secondary" onClick={() => setActiveVideoId(null)}>Close</Button>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4 overflow-y-auto">
                    {activeVideo.frames.map(f => (
                        <div key={f.num} className="bg-[#111] border border-[#333] rounded">
                            <img src={f.url} className="w-full aspect-video object-contain bg-black" />
                            <div className="p-2 text-xs text-gray-500 flex justify-between">
                                <span>Frame {f.num}</span>
                                <Download size={14} className="cursor-pointer hover:text-white" onClick={() => downloadBlob(f.blob, `${f.num}.jpg`)} />
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        )}
    </div>
  );
};

export default VideoStills;