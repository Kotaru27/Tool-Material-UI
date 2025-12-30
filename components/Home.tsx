import React from 'react';
import { ViewType } from '../types';
import { Image, FileText, Scissors, Clapperboard, Film, Link2, ArrowRight, RefreshCw } from 'lucide-react';

interface HomeProps {
  onNavigate: (view: ViewType) => void;
}

const Home: React.FC<HomeProps> = ({ onNavigate }) => {
  const tools = [
    { id: ViewType.LOGO, name: 'Logo Resizer', desc: 'Batch resize images & overlay text.', icon: Image, theme: 'blue' },
    { id: ViewType.PDF, name: 'PDF to Image', desc: 'Convert PDF pages to high-res PNGs.', icon: FileText, theme: 'red' },
    { id: ViewType.SPLIT, name: 'Image Splitter', desc: 'Split images into grids or rows.', icon: Scissors, theme: 'orange' },
    { id: ViewType.STILLS, name: 'Video Stills', desc: 'Extract frames from video files.', icon: Film, theme: 'cyan' },
    { id: ViewType.STORY, name: 'Storyboard', desc: 'Arrange images into a single board.', icon: Clapperboard, theme: 'purple' },
    { id: ViewType.ADLINKS, name: 'Ad Link Gen', desc: 'Generate HTML for ad exposure.', icon: Link2, theme: 'emerald' },
    { id: ViewType.RENAME, name: 'Batch Rename', desc: 'Rename multiple files with rules.', icon: RefreshCw, theme: 'yellow' },
  ];

  const getThemeColors = (theme: string) => {
      // M3 Tonal Palette Mapping (Amoled High Contrast)
      switch(theme) {
          case 'blue': return { bg: 'bg-[#0842A0]', text: 'text-[#D3E3FD]', iconBg: 'bg-[#D3E3FD]', iconText: 'text-[#041E49]' };
          case 'red': return { bg: 'bg-[#93000A]', text: 'text-[#FFDAD6]', iconBg: 'bg-[#FFDAD6]', iconText: 'text-[#410002]' };
          case 'orange': return { bg: 'bg-[#8B5000]', text: 'text-[#FFDCC1]', iconBg: 'bg-[#FFDCC1]', iconText: 'text-[#2B1700]' };
          case 'cyan': return { bg: 'bg-[#004E5F]', text: 'text-[#A6EEFF]', iconBg: 'bg-[#A6EEFF]', iconText: 'text-[#001F26]' };
          case 'purple': return { bg: 'bg-[#4A0072]', text: 'text-[#E9DDFF]', iconBg: 'bg-[#E9DDFF]', iconText: 'text-[#21005D]' };
          case 'emerald': return { bg: 'bg-[#005231]', text: 'text-[#C4EED0]', iconBg: 'bg-[#C4EED0]', iconText: 'text-[#002114]' };
          case 'yellow': return { bg: 'bg-[#FFD600]', text: 'text-[#211B00]', iconBg: 'bg-[#FFE082]', iconText: 'text-[#261900]' };
          default: return { bg: 'bg-[#4A4458]', text: 'text-[#E8DEF8]', iconBg: 'bg-[#E8DEF8]', iconText: 'text-[#1D192B]' };
      }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[80vh] gap-16 animate-in fade-in duration-500 py-10">
      
      <div className="text-center space-y-2 max-w-2xl px-4">
        <h1 className="text-5xl md:text-7xl font-display font-bold text-[#E6E1E5] tracking-tight">
          Creative Suite
        </h1>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 w-full max-w-6xl px-4">
        {tools.map((tool) => {
          const colors = getThemeColors(tool.theme);
          return (
          <div
            key={tool.id}
            onClick={() => onNavigate(tool.id)}
            className={`
                relative overflow-hidden
                bg-[#111] rounded-[24px] border border-[#222] p-0 cursor-pointer
                transition-all duration-300 group
                hover:border-[#444] hover:shadow-2xl hover:scale-[1.01] hover:bg-[#161616]
            `}
          >
            <div className="p-6 pb-4">
                 <div className="flex justify-between items-start mb-6">
                    <div className={`w-14 h-14 rounded-[20px] flex items-center justify-center transition-colors ${colors.iconBg} ${colors.iconText}`}>
                        <tool.icon className="w-7 h-7" strokeWidth={2} />
                    </div>
                    <div className={`p-2 rounded-full opacity-0 -translate-x-2 group-hover:translate-x-0 group-hover:opacity-100 transition-all duration-300 ${colors.bg}`}>
                        <ArrowRight className={`w-5 h-5 ${colors.text}`} />
                    </div>
                 </div>
                <h3 className="text-2xl font-bold text-[#E6E1E5] mb-2 font-display tracking-wide">
                    {tool.name}
                </h3>
                <p className="text-sm text-[#888] leading-relaxed group-hover:text-[#AAA] transition-colors">
                    {tool.desc}
                </p>
            </div>
            
            {/* Bottom active strip */}
            <div className={`h-1 w-full ${colors.bg} opacity-50 group-hover:opacity-100 transition-opacity`} />
          </div>
        )})}
      </div>

      <footer className="text-center text-[10px] uppercase tracking-widest text-[#444] mt-12">
        Material 3 Design &bull; V1.0.0
      </footer>
    </div>
  );
};

export default Home;