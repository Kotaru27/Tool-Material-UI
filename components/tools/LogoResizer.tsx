import React, { useState, useEffect, useRef } from 'react';
import { Upload, Download, Trash2, Image as ImageIcon, Save, Settings, X } from 'lucide-react';
import { Button, Input, Toggle, Slider, DropZone, Panel, EmptyState } from '../ui/Components';
import { ColorPicker } from '../ui/ColorPicker';
import { sanitizeFilename, downloadBlob, downloadZip } from '../../utils';

interface LogoCard {
  id: string;
  file: File;
  text: string;
  filename: string;
  fontSize: number | '';
  textY: number;
  imgY: number;
  img: HTMLImageElement;
}

const LogoResizer: React.FC = () => {
  const [cards, setCards] = useState<LogoCard[]>([]);
  const [globalFontSize, setGlobalFontSize] = useState<number>(28);
  const [isBold, setIsBold] = useState(false);
  const [color, setColor] = useState("#000000");
  const [globalImgY, setGlobalImgY] = useState(0);
  const [width, setWidth] = useState(300);
  const [height, setHeight] = useState(400);

  const canvasRefs = useRef<{ [key: string]: HTMLCanvasElement | null }>({});

  const handleFiles = (files: File[]) => {
    const newCards: LogoCard[] = [];
    files.forEach(file => {
      if (file.type.startsWith('image/')) {
        const img = new Image();
        img.src = URL.createObjectURL(file);
        img.onload = () => {
             setCards(prev => [...prev]); 
        }
        newCards.push({
          id: Math.random().toString(36).substr(2, 9),
          file,
          text: '',
          filename: sanitizeFilename(file.name.split('.')[0]),
          fontSize: '',
          textY: 90,
          imgY: globalImgY,
          img
        });
      }
    });
    setCards(prev => [...prev, ...newCards]);
  };

  const drawCard = (card: LogoCard) => {
    const canvas = canvasRefs.current[card.id];
    if (!canvas || !card.img.complete) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = width;
    canvas.height = height;

    // BG
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, width, height);

    // Image
    const pad = 20;
    const aW = width - (pad * 2);
    const aH = height - (pad * 2);
    const scale = Math.min(aW / card.img.naturalWidth, aH / card.img.naturalHeight);
    const rW = card.img.naturalWidth * scale;
    const rH = card.img.naturalHeight * scale;
    
    const yOffset = (card.imgY / 100) * height; 
    const x = (width - rW) / 2;
    const y = ((height - rH) / 2) + yOffset;

    ctx.drawImage(card.img, x, y, rW, rH);

    // Text
    if (card.text) {
      ctx.fillStyle = color;
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      const fSize = card.fontSize !== '' ? Number(card.fontSize) : globalFontSize;
      ctx.font = `${isBold ? "700" : "400"} ${fSize}px Inter`;
      
      const lines = card.text.split("\n");
      const lh = fSize * 1.25;
      const yS = (height * (card.textY / 100)) - ((lh * lines.length) / 2) + (lh / 2);
      
      lines.forEach((l, i) => {
        ctx.fillText(l, width / 2, yS + (i * lh));
      });
    }
  };

  useEffect(() => {
    cards.forEach(drawCard);
  }, [cards, width, height, globalFontSize, isBold, color, globalImgY]);

  const updateCard = (id: string, updates: Partial<LogoCard>) => {
    setCards(prev => prev.map(c => {
        if (c.id !== id) return c;
        const updated = { ...c, ...updates };
        
        // Auto-update filename if text changes
        if (updates.text !== undefined) {
             updated.filename = sanitizeFilename(updated.text) || updated.filename;
        }
        
        return updated;
    }));
  };

  const removeCard = (id: string) => {
    setCards(prev => prev.filter(c => c.id !== id));
    delete canvasRefs.current[id];
  };

  const downloadSingle = async (card: LogoCard) => {
    const canvas = canvasRefs.current[card.id];
    if (canvas) {
      canvas.toBlob(blob => {
        if(blob) downloadBlob(blob, `${card.filename}.png`);
      }, 'image/png');
    }
  };

  const exportAll = async () => {
    const files: { name: string; blob: Blob }[] = [];
    const usedNames = new Set<string>();

    const promises = cards.map(card => {
        return new Promise<void>(resolve => {
            const canvas = canvasRefs.current[card.id];
            if(canvas) {
                canvas.toBlob(blob => {
                    if(blob) {
                        let name = card.filename;
                        let counter = 1;
                        while(usedNames.has(name)) {
                            name = `${card.filename}_${counter}`;
                            counter++;
                        }
                        usedNames.add(name);
                        files.push({ name: `${name}.png`, blob });
                    }
                    resolve();
                }, 'image/png');
            } else {
                resolve();
            }
        })
    });
    await Promise.all(promises);
    downloadZip(files, "logos.zip");
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-[320px_1fr] gap-6 h-full min-h-0">
      {/* 
         Left Panel Container:
         - Using max-h-full + overflow-y-auto to handle independent scrolling
         - 'custom-scrollbar' for styling
      */}
      <div className="flex flex-col gap-4 overflow-y-auto pr-3 pb-20 lg:pb-4 custom-scrollbar max-h-[calc(100vh-140px)] lg:max-h-full">
        <DropZone onFiles={handleFiles} accept="image/*" icon={<Upload size={24} />} label="Add Images" />
        
        <div className="flex flex-col gap-4">
          <Panel>
            <div className="flex items-center gap-2 mb-4 text-[#A8C7FA]">
                <Settings size={16} />
                <span className="text-xs font-bold uppercase tracking-wider">Settings</span>
            </div>
            
            <div className="flex flex-col gap-4">
              <div className="space-y-3">
                  <Input 
                    type="number" 
                    placeholder="Font Size (px)" 
                    value={globalFontSize} 
                    onChange={(e) => setGlobalFontSize(Number(e.target.value))} 
                  />
                  <div className="flex items-center justify-between gap-4 bg-[#1A1A1A] p-3 rounded-xl border border-[#333]">
                    <Toggle checked={isBold} onChange={setIsBold} label="Bold Text" />
                  </div>
                  <div className="bg-[#1A1A1A] p-2 rounded-xl border border-[#333]">
                     <ColorPicker value={color} onChange={setColor} />
                  </div>
              </div>

              <div className="h-px bg-[#333]" />

              <div className="space-y-3">
                 <Slider 
                    label="Vertical Position" 
                    valueDisplay={`${globalImgY}%`}
                    min={-50} 
                    max={50} 
                    value={globalImgY}
                    onChange={(e) => {
                        const val = Number(e.target.value);
                        setGlobalImgY(val);
                        setCards(prev => prev.map(c => ({...c, imgY: val})));
                    }} 
                />
              </div>

              <div className="h-px bg-[#333]" />

              <div className="space-y-3">
                  <span className="text-[10px] font-bold text-[#888] uppercase tracking-wide block">Dimensions</span>
                  <div className="grid grid-cols-2 gap-2">
                    <Input type="number" placeholder="W" value={width} onChange={(e) => setWidth(Number(e.target.value))} />
                    <Input type="number" placeholder="H" value={height} onChange={(e) => setHeight(Number(e.target.value))} />
                  </div>
              </div>
            </div>
          </Panel>

          <Panel>
             <div className="flex flex-col gap-2">
              <Button variant="blue" onClick={exportAll} disabled={cards.length === 0} icon={<Download size={16} />}>
                Export All
              </Button>
              <Button variant="tonal" onClick={() => setCards([])} disabled={cards.length === 0} icon={<Trash2 size={16} />}>
                Clear All
              </Button>
            </div>
          </Panel>
        </div>
      </div>

      {/* Right Grid Container */}
      <div className="overflow-y-auto pb-20 custom-scrollbar max-h-[calc(100vh-140px)] lg:max-h-full">
        {cards.length === 0 ? (
          <EmptyState icon={<ImageIcon size={48} />} message="Drop images here to start" />
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-3">
            {cards.map((card, index) => (
              <div 
                key={card.id} 
                className="bg-[#111] rounded-[16px] overflow-hidden flex flex-col shadow-sm border border-[#222] hover:border-[#444] transition-all duration-300 animate-in fade-in slide-in-from-bottom-4 fill-mode-forwards"
                style={{ animationDelay: `${index * 50}ms` }}
              >
                <div className="px-2 py-2 flex justify-between items-center bg-[#181818] border-b border-[#222] gap-2">
                    <div className="flex-1 min-w-0 bg-[#000] border border-[#333] rounded overflow-hidden focus-within:border-[#A8C7FA] transition-colors">
                        <input 
                            className="bg-transparent text-[10px] font-mono text-[#e3e3e3] placeholder-[#666] focus:outline-none w-full px-1.5 py-1"
                            value={card.filename}
                            onChange={(e) => updateCard(card.id, { filename: sanitizeFilename(e.target.value) })}
                            placeholder="Filename"
                        />
                    </div>
                    <div className="flex gap-0.5 shrink-0">
                        <button className="p-1 rounded-full hover:bg-[#222] text-[#888] hover:text-[#A8C7FA] transition-colors" onClick={() => downloadSingle(card)} title="Save">
                            <Save size={12} />
                        </button>
                        <button className="p-1 rounded-full hover:bg-[#222] text-[#888] hover:text-[#F2B8B5] transition-colors" onClick={() => removeCard(card.id)} title="Remove">
                            <X size={12} />
                        </button>
                    </div>
                </div>

                <div className="bg-black p-2 flex items-center justify-center relative aspect-square pattern-checkers overflow-hidden group">
                  <canvas 
                    ref={el => { canvasRefs.current[card.id] = el; }}
                    className="max-w-full max-h-full shadow-lg object-contain transition-transform duration-300 group-hover:scale-[1.02]"
                  />
                </div>

                <div className="p-2 flex flex-col gap-2 bg-[#111]">
                  <textarea 
                    className="w-full bg-[#181818] border border-[#333] rounded p-1.5 text-[11px] text-[#e3e3e3] resize-none h-9 focus:outline-none focus:border-[#A8C7FA] focus:bg-[#222] transition-colors placeholder-[#666]"
                    placeholder="Label..."
                    value={card.text}
                    onChange={(e) => updateCard(card.id, { text: e.target.value })}
                  />
                  
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                         <span className="text-[9px] font-bold text-[#666] uppercase w-6">Size</span>
                         <input 
                            className="flex-1 bg-[#181818] border border-[#333] rounded px-2 py-1 text-[10px] text-white focus:outline-none focus:border-[#A8C7FA] transition-colors text-center"
                            type="number" 
                            placeholder={`Global (${globalFontSize})`}
                            value={card.fontSize === '' ? '' : card.fontSize}
                            onChange={(e) => updateCard(card.id, { fontSize: e.target.value ? Number(e.target.value) : '' })}
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                        <Slider 
                            label="Text Y" 
                            min={0} max={100} value={card.textY} 
                            onChange={(e) => updateCard(card.id, { textY: Number(e.target.value) })} 
                        />
                        <Slider 
                            label="Img Y" 
                            min={-50} max={50} value={card.imgY} 
                            onChange={(e) => updateCard(card.id, { imgY: Number(e.target.value) })} 
                        />
                    </div>
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

export default LogoResizer;