import React, { useState } from 'react';
import { Upload, Scissors, Download, Trash2 } from 'lucide-react';
import { Button, Input, Select, DropZone, Panel, EmptyState } from '../ui/Components';
import { downloadZip } from '../../utils';

interface SplitItem {
  id: string;
  file: File;
  url: string;
  checked: boolean;
  blobs: Blob[];
}

const ImageSplitter: React.FC = () => {
  const [items, setItems] = useState<SplitItem[]>([]);
  const [rows, setRows] = useState(2);
  const [cols, setCols] = useState(2);
  const [mode, setMode] = useState<'grid' | 'vert' | 'horz'>('grid');
  const [processing, setProcessing] = useState(false);

  const handleFiles = (files: File[]) => {
    const newItems = files
      .filter(f => f.type.startsWith('image/'))
      .map(f => ({
        id: Math.random().toString(36).substr(2, 9),
        file: f,
        url: URL.createObjectURL(f),
        checked: true,
        blobs: []
      }));
    setItems(prev => [...prev, ...newItems]);
  };

  const processImages = async () => {
    setProcessing(true);
    const updatedItems = [...items];
    
    for (const item of updatedItems) {
      if (!item.checked) continue;
      
      const img = new Image();
      img.src = item.url;
      await new Promise(r => img.onload = r);

      const r = mode === 'vert' ? 1 : rows;
      const c = mode === 'horz' ? 1 : cols;
      
      const pW = img.naturalWidth / c;
      const pH = img.naturalHeight / r;
      const newBlobs: Blob[] = [];

      for (let y = 0; y < r; y++) {
        for (let x = 0; x < c; x++) {
          const canvas = document.createElement('canvas');
          canvas.width = pW;
          canvas.height = pH;
          const ctx = canvas.getContext('2d');
          if (ctx) {
            ctx.drawImage(img, x * pW, y * pH, pW, pH, 0, 0, pW, pH);
            const blob = await new Promise<Blob | null>(res => canvas.toBlob(res, item.file.type));
            if (blob) newBlobs.push(blob);
          }
        }
      }
      item.blobs = newBlobs;
    }
    setItems(updatedItems);
    setProcessing(false);
  };

  const downloadAll = async () => {
    const files: { name: string; blob: Blob }[] = [];
    let count = 1;
    
    items.forEach(item => {
      if (item.checked && item.blobs.length > 0) {
        const ext = item.file.name.split('.').pop();
        item.blobs.forEach(b => {
          files.push({ name: `${count}.${ext}`, blob: b });
          count++;
        });
      }
    });

    if (files.length > 0) {
      await downloadZip(files, 'split_images.zip');
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-[300px_1fr] gap-8 h-full min-h-0">
      <div className="flex flex-col gap-6 overflow-y-auto pr-2 pb-20 lg:pb-0 custom-scrollbar max-h-[calc(100vh-140px)] lg:max-h-full">
        <DropZone onFiles={handleFiles} accept="image/*" icon={<Upload size={24} />} label="Add Images" />
        
        <Panel>
          <span className="text-xs font-bold text-[#888] uppercase tracking-wide mb-4 block">Configuration</span>
          <div className="flex flex-col gap-4">
            <Select 
              value={mode}
              onChange={(e) => setMode(e.target.value as any)}
            >
              <option value="vert">Columns Only</option>
              <option value="horz">Rows Only</option>
              <option value="grid">Grid (Rows & Cols)</option>
            </Select>
            
            <div className="grid grid-cols-2 gap-3">
              <div className="flex flex-col gap-1">
                <span className="text-xs text-[#888] font-medium">Rows</span>
                <Input type="number" min={1} value={rows} onChange={(e) => setRows(Number(e.target.value))} disabled={mode === 'vert'} />
              </div>
              <div className="flex flex-col gap-1">
                <span className="text-xs text-[#888] font-medium">Cols</span>
                <Input type="number" min={1} value={cols} onChange={(e) => setCols(Number(e.target.value))} disabled={mode === 'horz'} />
              </div>
            </div>

            <div className="flex flex-col gap-3 mt-2">
                <Button variant="secondary" onClick={processImages} disabled={processing || items.length === 0}>
                    {processing ? 'Processing...' : 'Process'}
                </Button>
                <Button variant="orange" onClick={downloadAll} disabled={!items.some(i => i.blobs.length > 0)}>
                    Download Zip
                </Button>
                <Button variant="danger" onClick={() => setItems([])}>Reset</Button>
            </div>
          </div>
        </Panel>
      </div>

      <div className="overflow-y-auto pb-20 custom-scrollbar max-h-[calc(100vh-140px)] lg:max-h-full">
        {items.length === 0 ? (
          <EmptyState icon={<Scissors size={48} />} message="No images added" />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {items.map(item => (
              <div key={item.id} className="bg-[#111] border border-[#333] rounded-[16px] overflow-hidden animate-in fade-in zoom-in-95 duration-300">
                <div className="relative aspect-square bg-black group p-4">
                    <img src={item.url} className="w-full h-full object-contain" />
                    <div 
                        className="absolute inset-0 pointer-events-none grid border border-white/20 mx-4 my-4"
                        style={{
                            gridTemplateColumns: `repeat(${mode === 'horz' ? 1 : cols}, 1fr)`,
                            gridTemplateRows: `repeat(${mode === 'vert' ? 1 : rows}, 1fr)`
                        }}
                    >
                        {Array.from({ length: (mode === 'horz' ? 1 : cols) * (mode === 'vert' ? 1 : rows) }).map((_, i) => (
                            <div key={i} className="border border-white/30"></div>
                        ))}
                    </div>
                </div>
                <div className="p-3 bg-[#181818] border-t border-[#333] flex justify-between items-center">
                    <span className="text-xs text-[#ccc] truncate max-w-[150px]">{item.file.name}</span>
                    <div className="flex items-center gap-2">
                        <span className="text-[10px] text-[#FFDBCC] font-bold uppercase tracking-wider">
                            {item.blobs.length > 0 ? `Done (${item.blobs.length})` : 'Ready'}
                        </span>
                        <input 
                            type="checkbox" 
                            checked={item.checked} 
                            onChange={(e) => setItems(prev => prev.map(i => i.id === item.id ? { ...i, checked: e.target.checked} : i))}
                            className="w-4 h-4 accent-[#FFDBCC] bg-[#333] border-[#444] rounded"
                        />
                    </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ImageSplitter;