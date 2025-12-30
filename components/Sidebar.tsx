import React from 'react';
import { ViewType } from '../types';
import { LayoutGrid, Image, FileText, Scissors, Clapperboard, Film, Link2, RefreshCw } from 'lucide-react';
import { clsx } from 'clsx';

interface SidebarProps {
  currentView: ViewType;
  onChangeView: (view: ViewType) => void;
  activeColor: string;
  activeBg: string;
}

const Sidebar: React.FC<SidebarProps> = ({ currentView, onChangeView, activeColor, activeBg }) => {
  const navItems = [
    { id: ViewType.HOME, icon: LayoutGrid, label: "Home" },
    { type: 'divider' },
    { id: ViewType.LOGO, icon: Image, label: "Logo" },
    { id: ViewType.PDF, icon: FileText, label: "PDF" },
    { id: ViewType.SPLIT, icon: Scissors, label: "Split" },
    { id: ViewType.STILLS, icon: Film, label: "Stills" },
    { id: ViewType.STORY, icon: Clapperboard, label: "Story" },
    { id: ViewType.ADLINKS, icon: Link2, label: "Links" },
    { id: ViewType.RENAME, icon: RefreshCw, label: "Rename" },
  ];

  return (
    <nav className="w-full md:w-[80px] md:h-full flex md:flex-col items-center justify-evenly md:justify-start py-2 md:py-6 gap-2 md:gap-4 z-20 px-2 md:px-0">
      {navItems.map((item, idx) => {
        if (item.type === 'divider') {
            return <div key={idx} className="hidden md:block w-8 h-px bg-[#222] my-2" />;
        }
        
        const isActive = currentView === item.id;
        const Icon = item.icon as React.ElementType;

        return (
          <div key={item.id} className="flex flex-col items-center gap-1 group w-full">
              <button
                onClick={() => onChangeView(item.id as ViewType)}
                className={clsx(
                  "w-12 h-8 md:w-14 md:h-8 rounded-full flex items-center justify-center transition-all duration-300 relative overflow-hidden",
                  !isActive && "text-[#666] hover:bg-[#1A1A1A] hover:text-[#EEE]"
                )}
                style={isActive ? { backgroundColor: activeColor, color: activeBg } : {}}
                title={item.label}
              >
                <Icon 
                  className="w-5 h-5 md:w-5 md:h-5"
                  strokeWidth={isActive ? 2.5 : 2}
                />
              </button>
              <span className={clsx(
                  "text-[10px] font-medium tracking-wide transition-colors",
                  isActive ? "text-[#E6E1E5]" : "text-[#555] group-hover:text-[#999]"
              )}>
                  {item.label}
              </span>
          </div>
        );
      })}
    </nav>
  );
};

export default Sidebar;