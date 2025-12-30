import React, { useState, useEffect, useRef } from 'react';

// --- Color Conversion Utilities ---

const hexToRgb = (hex: string) => {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result ? {
    r: parseInt(result[1], 16),
    g: parseInt(result[2], 16),
    b: parseInt(result[3], 16)
  } : { r: 0, g: 0, b: 0 };
}

const rgbToHsv = (r: number, g: number, b: number) => {
    r /= 255; g /= 255; b /= 255;
    const max = Math.max(r, g, b), min = Math.min(r, g, b);
    let h = 0, s, v = max;
    const d = max - min;
    s = max === 0 ? 0 : d / max;
    if (max === min) {
        h = 0;
    } else {
        switch (max) {
            case r: h = (g - b) / d + (g < b ? 6 : 0); break;
            case g: h = (b - r) / d + 2; break;
            case b: h = (r - g) / d + 4; break;
        }
        h /= 6;
    }
    return { h, s, v };
}

const hsvToRgb = (h: number, s: number, v: number) => {
    let r = 0, g = 0, b = 0;
    const i = Math.floor(h * 6);
    const f = h * 6 - i;
    const p = v * (1 - s);
    const q = v * (1 - f * s);
    const t = v * (1 - (1 - f) * s);
    switch (i % 6) {
        case 0: r = v; g = t; b = p; break;
        case 1: r = q; g = v; b = p; break;
        case 2: r = p; g = v; b = t; break;
        case 3: r = p; g = q; b = v; break;
        case 4: r = t; g = p; b = v; break;
        case 5: r = v; g = p; b = q; break;
    }
    return {
        r: Math.round(r * 255),
        g: Math.round(g * 255),
        b: Math.round(b * 255)
    };
}

const rgbToHex = (r: number, g: number, b: number) => {
    return "#" + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1).toUpperCase();
}

// --- Component ---

interface ColorPickerProps {
    value: string;
    onChange: (color: string) => void;
}

export const ColorPicker: React.FC<ColorPickerProps> = ({ value, onChange }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [hsv, setHsv] = useState({ h: 0, s: 0, v: 0 }); 
  const [popupStyle, setPopupStyle] = useState<React.CSSProperties>({});
  
  const containerRef = useRef<HTMLDivElement>(null);
  const popupRef = useRef<HTMLDivElement>(null);
  const areaRef = useRef<HTMLDivElement>(null);
  const sliderRef = useRef<HTMLDivElement>(null);

  // Sync internal state
  useEffect(() => {
    const rgb = hexToRgb(value);
    const newHsv = rgbToHsv(rgb.r, rgb.g, rgb.b);
    setHsv(newHsv);
  }, [value]);

  // Handle open/close and positioning
  useEffect(() => {
    if (isOpen && containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect();
        const spaceBelow = window.innerHeight - rect.bottom;
        const height = 320; // Approx height
        
        let top = rect.bottom + 8;
        // Flip if not enough space
        if (spaceBelow < height && rect.top > height) {
            top = rect.top - height - 8;
        }

        // Keep horizontal within bounds
        let left = rect.left;
        if (left + 256 > window.innerWidth) {
            left = window.innerWidth - 256 - 16;
        }

        setPopupStyle({
            position: 'fixed',
            top,
            left,
            zIndex: 9999
        });

        // Close on scroll to avoid detached popup
        const handleScroll = () => setIsOpen(false);
        window.addEventListener('scroll', handleScroll, true);
        return () => window.removeEventListener('scroll', handleScroll, true);
    }
  }, [isOpen]);

  // Close on click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
        if (
            containerRef.current && 
            !containerRef.current.contains(event.target as Node) &&
            popupRef.current &&
            !popupRef.current.contains(event.target as Node)
        ) {
            setIsOpen(false);
        }
    };
    if (isOpen) {
        document.addEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen]);

  const handleAreaMouseDown = (e: React.MouseEvent) => {
    const handleMove = (moveEvent: MouseEvent) => {
        if (!areaRef.current) return;
        const rect = areaRef.current.getBoundingClientRect();
        const x = Math.max(0, Math.min(rect.width, moveEvent.clientX - rect.left));
        const y = Math.max(0, Math.min(rect.height, moveEvent.clientY - rect.top));
        
        const s = x / rect.width;
        const v = 1 - (y / rect.height);
        
        setHsv(prev => {
           const next = { ...prev, s, v };
           const rgb = hsvToRgb(next.h, next.s, next.v);
           onChange(rgbToHex(rgb.r, rgb.g, rgb.b));
           return next;
        });
    };
    const handleUp = () => {
        document.removeEventListener('mousemove', handleMove);
        document.removeEventListener('mouseup', handleUp);
    };
    handleMove(e.nativeEvent);
    document.addEventListener('mousemove', handleMove);
    document.addEventListener('mouseup', handleUp);
  };

  const handleHueMouseDown = (e: React.MouseEvent) => {
    const handleMove = (moveEvent: MouseEvent) => {
        if (!sliderRef.current) return;
        const rect = sliderRef.current.getBoundingClientRect();
        const x = Math.max(0, Math.min(rect.width, moveEvent.clientX - rect.left));
        const h = x / rect.width;
        
        setHsv(prev => {
            const next = { ...prev, h };
            const rgb = hsvToRgb(next.h, next.s, next.v);
            onChange(rgbToHex(rgb.r, rgb.g, rgb.b));
            return next;
        });
    };
    const handleUp = () => {
        document.removeEventListener('mousemove', handleMove);
        document.removeEventListener('mouseup', handleUp);
    };
    handleMove(e.nativeEvent);
    document.addEventListener('mousemove', handleMove);
    document.addEventListener('mouseup', handleUp);
  };

  const rgb = hsvToRgb(hsv.h, hsv.s, hsv.v);

  return (
    <div ref={containerRef}>
        <button 
            onClick={() => setIsOpen(!isOpen)}
            className={`w-full h-12 bg-transparent hover:bg-[#333537]/50 border-none rounded-lg flex items-center gap-3 px-0 transition-colors focus:outline-none group`}
        >
            <div className="w-10 h-10 rounded-full bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI4IiBoZWlnaHQ9IjgiPjxyZWN0IHdpZHRoPSI4IiBoZWlnaHQ9IjgiIGZpbGw9IiMzMzMiLz48cmVjdCB3aWR0aD0iNCIgaGVpZ2h0PSI0IiBmaWxsPSIjNDQ0Ii8+PHJlY3QgeD0iNCIgeT0iNCIgd2lkdGg9IjQiIGhlaWdodD0iNCIgZmlsbD0iIzQ0NCIvPjwvc3ZnPg==')] overflow-hidden border border-[#444746] group-hover:border-[#a8c7fa] shadow-sm">
                <div className="w-full h-full shadow-inner" style={{ backgroundColor: value }} />
            </div>
            <div className="flex flex-col items-start">
                 <span className="text-xs font-bold text-[#c4c7c5] uppercase tracking-wide">Color</span>
                 <span className="text-sm font-mono text-[#e3e3e3] uppercase">{value}</span>
            </div>
        </button>

        {isOpen && (
            <div 
                ref={popupRef}
                style={popupStyle}
                className="w-64 bg-[#1e1e21] border border-[#444746] rounded-[24px] shadow-[0_20px_60px_-10px_rgba(0,0,0,0.8)] p-5 animate-in fade-in zoom-in-95 duration-200 backdrop-blur-3xl ring-1 ring-white/10"
            >
                {/* Saturation/Value Area */}
                <div 
                    ref={areaRef}
                    className="w-full h-40 rounded-xl mb-5 relative cursor-crosshair overflow-hidden touch-none shadow-inner border border-white/5"
                    style={{
                        backgroundColor: `hsl(${hsv.h * 360}, 100%, 50%)`,
                        backgroundImage: `linear-gradient(to right, #FFF, rgba(255,255,255,0)), linear-gradient(to top, #000, rgba(0,0,0,0))`
                    }}
                    onMouseDown={handleAreaMouseDown}
                >
                    <div 
                        className="absolute w-5 h-5 rounded-full border-2 border-white ring-1 ring-black/50 shadow-md -translate-x-1/2 -translate-y-1/2 pointer-events-none"
                        style={{
                            left: `${hsv.s * 100}%`,
                            top: `${(1 - hsv.v) * 100}%`,
                        }}
                    />
                </div>

                {/* Hue Slider */}
                <div 
                    ref={sliderRef}
                    className="w-full h-4 rounded-full mb-5 relative cursor-pointer touch-none shadow-inner border border-white/5"
                    style={{
                        background: 'linear-gradient(to right, #f00 0%, #ff0 17%, #0f0 33%, #0ff 50%, #00f 67%, #f0f 83%, #f00 100%)'
                    }}
                    onMouseDown={handleHueMouseDown}
                >
                    <div 
                        className="absolute top-0 w-4 h-4 rounded-full border-2 border-white ring-1 ring-black/50 shadow-sm bg-transparent -translate-x-1/2 pointer-events-none"
                        style={{ left: `${hsv.h * 100}%` }}
                    />
                </div>

                {/* Inputs */}
                <div className="flex flex-col gap-4">
                    <div className="grid grid-cols-[1fr_auto] gap-3 items-center">
                        <div className="grid grid-cols-3 gap-2">
                            {['r', 'g', 'b'].map((c) => (
                                <div key={c}>
                                    <label className="text-[9px] text-[#c4c7c5] uppercase font-bold block mb-1 text-center">{c}</label>
                                    <input 
                                        className="w-full bg-[#333537] border-b border-[#8e918f] rounded-t-sm px-1 py-1 text-xs text-center text-[#e3e3e3] focus:border-[#a8c7fa] focus:bg-[#444746] focus:outline-none transition-colors"
                                        value={rgb[c as keyof typeof rgb]}
                                        onChange={(e) => {
                                            const val = Math.min(255, Math.max(0, parseInt(e.target.value) || 0));
                                            const newRgb = { ...rgb, [c]: val };
                                            const nextHex = rgbToHex(newRgb.r, newRgb.g, newRgb.b);
                                            onChange(nextHex);
                                        }}
                                    />
                                </div>
                            ))}
                        </div>
                        <div className="flex flex-col items-center">
                             <label className="text-[9px] text-[#c4c7c5] uppercase font-bold mb-1">View</label>
                             <div className="w-9 h-9 rounded-full border border-[#444746] shadow-lg" style={{backgroundColor: value}}></div>
                        </div>
                    </div>
                    
                    <div className="relative">
                        <input 
                            className="w-full bg-[#333537] border-b border-[#8e918f] rounded-t px-2 py-2 text-xs font-mono text-[#e3e3e3] focus:border-[#a8c7fa] focus:bg-[#444746] focus:outline-none transition-colors uppercase pl-8"
                            value={value.replace('#', '')}
                            onChange={(e) => {
                                let val = e.target.value;
                                if (!val.startsWith('#')) val = '#' + val;
                                onChange(val);
                            }}
                        />
                         <span className="absolute left-3 top-[8px] text-[#c4c7c5] text-xs font-mono">#</span>
                    </div>
                </div>
            </div>
        )}
    </div>
  );
};