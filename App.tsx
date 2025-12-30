import React, { useState } from 'react';
import { ViewType } from './types';
import Sidebar from './components/Sidebar';
import Home from './components/Home';
import LogoResizer from './components/tools/LogoResizer';
import PdfConverter from './components/tools/PdfConverter';
import ImageSplitter from './components/tools/ImageSplitter';
import Storyboard from './components/tools/Storyboard';
import VideoStills from './components/tools/VideoStills';
import AdLinkGen from './components/tools/AdLinkGen';
import { Logo } from './components/ui/Logo';

// Theme configuration for each tool
const themeConfig = {
  [ViewType.HOME]: { color: '#D0BCFF', bg: '#381E72', name: 'Creative Suite' },
  [ViewType.LOGO]: { color: '#A8C7FA', bg: '#0842A0', name: 'Logo Resizer' },
  [ViewType.PDF]: { color: '#F2B8B5', bg: '#8C1D18', name: 'PDF Convert' },
  [ViewType.SPLIT]: { color: '#FFDBCC', bg: '#8B5000', name: 'Image Splitter' },
  [ViewType.STILLS]: { color: '#A6EEFF', bg: '#004E5F', name: 'Video Stills' },
  [ViewType.STORY]: { color: '#EDB1FF', bg: '#4A0072', name: 'Storyboard' },
  [ViewType.ADLINKS]: { color: '#7DDAAF', bg: '#005231', name: 'Ad Link Gen' }
};

const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<ViewType>(ViewType.HOME);
  const theme = themeConfig[currentView] || themeConfig[ViewType.HOME];

  const renderContent = () => {
    switch (currentView) {
      case ViewType.HOME: return <Home onNavigate={setCurrentView} />;
      case ViewType.LOGO: return <LogoResizer />;
      case ViewType.PDF: return <PdfConverter />;
      case ViewType.SPLIT: return <ImageSplitter />;
      case ViewType.STILLS: return <VideoStills />;
      case ViewType.STORY: return <Storyboard />;
      case ViewType.ADLINKS: return <AdLinkGen />;
      default: return <Home onNavigate={setCurrentView} />;
    }
  };

  const isHome = currentView === ViewType.HOME;

  return (
    <div className="flex flex-col h-screen overflow-hidden text-[#E6E1E5] selection:bg-[#D0BCFF] selection:text-[#381E72] bg-[#000000]">
      {/* Header */}
      <header className="h-16 bg-[#000000] border-b border-[#111] flex items-center justify-between px-6 shrink-0 z-30">
        <div 
          className="flex items-center gap-4 cursor-pointer group"
          onClick={() => setCurrentView(ViewType.HOME)}
        >
          <div 
            className="p-2 rounded-xl transition-colors shadow-sm duration-300"
            style={{ backgroundColor: theme.color, color: theme.bg }}
          >
             <Logo className="w-5 h-5" />
          </div>
          <span className="font-display font-bold text-xl tracking-tight text-[#E6E1E5] group-hover:text-white transition-colors">
            {theme.name}
          </span>
        </div>
        
        <div className="flex items-center gap-4">
             <div className="text-[10px] font-bold uppercase tracking-widest text-[#666] bg-[#111] px-3 py-1 rounded-full border border-[#222]">
                Beta v1.0
             </div>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden relative">
        {/* Navigation Sidebar */}
        {!isHome && (
            <div className={`
                fixed bottom-0 left-0 w-full z-50 flex
                md:relative md:w-auto md:h-auto md:flex bg-[#000000] border-t md:border-t-0 md:border-r border-[#111]
            `}>
                 <Sidebar currentView={currentView} onChangeView={setCurrentView} activeColor={theme.color} activeBg={theme.bg} />
            </div>
        )}

        {/* Main Content Area */}
        <main className="flex-1 overflow-hidden relative bg-[#000000]">
          {/* 
            Changed from overflow-y-auto to overflow-hidden for Tools to allow internal scrolling.
            Home still needs scrolling, so we conditionally apply it or let Home handle it.
            For simplicity in a "Tool App", we allow tools to take full height.
            If ViewType is HOME, we enable scroll here.
           */}
          <div className={`h-full w-full mx-auto ${isHome ? 'overflow-y-auto' : 'overflow-hidden'}`}>
             <div className="p-4 md:p-6 max-w-[1920px] mx-auto h-full">
                {renderContent()}
             </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default App;