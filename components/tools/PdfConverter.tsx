import React, { useState, useEffect } from 'react';
import * as pdfjsLib from 'pdfjs-dist';
import { Upload, FileText, Download, Trash2, X, Maximize2 } from 'lucide-react';
import { Button, DropZone, Panel, EmptyState, Toggle } from '../ui/Components';
import { downloadBlob, downloadZip } from '../../utils';

// Set worker src
pdfjsLib.GlobalWorkerOptions.workerSrc = `https://esm.sh/pdfjs-dist@4.10.38/build/pdf.worker.min.mjs`;

interface PdfDocument {
  id: string;
  name: string;
  pdf: pdfjsLib.PDFDocumentProxy;
  pages: { num: number; url: string; blob: Blob; checked: boolean }[];
  thumbnail: string;
}

const PdfConverter: React.FC = () => {
  const [documents, setDocuments] = useState<PdfDocument[]>([]);
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState("");
  const [activeDocId, setActiveDocId] = useState<string | null>(null);
  const [lightboxUrl, setLightboxUrl] = useState<string | null>(null);

  const handleFiles = async (files: File[]) => {
    const pdfFiles = files.filter(f => f.type === 'application/pdf');
    if (pdfFiles.length === 0) return;

    setLoading(true);
    
    try {
      for (const file of pdfFiles) {
        setProgress(`Loading ${file.name}...`);
        const arrayBuffer = await file.arrayBuffer();
        const pdf = await pdfjsLib.getDocument(arrayBuffer).promise;
        
        const pages = [];
        let thumbnail = "";

        for (let i = 1; i <= pdf.numPages; i++) {
          setProgress(`Rendering ${file.name} (${i}/${pdf.numPages})`);
          const page = await pdf.getPage(i);
          const viewport = page.getViewport({ scale: 2.0 });
          const canvas = document.createElement('canvas');
          const context = canvas.getContext('2d');
          
          if (context) {
            canvas.height = viewport.height;
            canvas.width = viewport.width;
            await page.render({ canvasContext: context, viewport } as any).promise;
            
            const blob = await new Promise<Blob | null>(resolve => canvas.toBlob(resolve, 'image/png'));
            if (blob) {
              const url = URL.createObjectURL(blob);
              pages.push({ num: i, url, blob, checked: true });
              if (i === 1) thumbnail = url;
            }
          }
        }

        setDocuments(prev => [{
          id: Math.random().toString(36).substr(2, 9),
          name: file.name,
          pdf,
          pages,
          thumbnail
        }, ...prev]);
      }
    } catch (error) {
      console.error(error);
      alert("Error processing PDF. Please check file format.");
    } finally {
      setLoading(false);
      setProgress("");
    }
  };

  const downloadSelected = async (doc: PdfDocument) => {
    const selected = doc.pages.filter(p => p.checked);
    if (selected.length === 0) return;
    
    const files = selected.map(p => ({
        name: `${p.num}.png`,
        blob: p.blob
    }));
    await downloadZip(files, `${doc.name}_images.zip`);
  };

  const togglePage = (docId: string, pageNum: number, checked: boolean) => {
    setDocuments(prev => prev.map(d => {
        if (d.id !== docId) return d;
        return {
            ...d,
            pages: d.pages.map(p => p.num === pageNum ? { ...p, checked } : p)
        };
    }));
  };

  const toggleAll = (docId: string, checked: boolean) => {
    setDocuments(prev => prev.map(d => {
        if (d.id !== docId) return d;
        return {
            ...d,
            pages: d.pages.map(p => ({ ...p, checked }))
        };
    }));
  };

  const activeDoc = documents.find(d => d.id === activeDocId);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-[300px_1fr] gap-8 h-full">
      <div className="flex flex-col gap-6">
        <DropZone onFiles={handleFiles} accept="application/pdf" icon={<Upload size={24} />} label="Add PDFs" />
        
        {loading && (
          <Panel>
            <div className="text-sm text-gray-400 mb-2 flex justify-between">
                <span>Processing...</span>
            </div>
            <div className="w-full bg-[#333] h-2 rounded overflow-hidden">
                <div className="bg-red-500 h-full w-full animate-pulse"></div>
            </div>
            <p className="text-xs text-gray-500 mt-2">{progress}</p>
          </Panel>
        )}

        <Button variant="danger" onClick={() => setDocuments([])} disabled={documents.length === 0}>
            Clear All
        </Button>
      </div>

      <div className="overflow-y-auto">
        {documents.length === 0 ? (
          <EmptyState icon={<FileText size={48} />} message="No PDFs Loaded" />
        ) : (
          <div className="flex flex-wrap gap-6 content-start">
            {documents.map(doc => (
              <div 
                key={doc.id} 
                onClick={() => setActiveDocId(doc.id)}
                className="w-48 flex flex-col bg-[#111] border border-[#333] rounded-lg overflow-hidden cursor-pointer hover:border-red-500 hover:-translate-y-1 transition-all group"
              >
                {/* Changed fixed height to aspect ratio */}
                <div className="aspect-[1/1.4] bg-black flex items-center justify-center overflow-hidden p-2">
                    <img src={doc.thumbnail} alt={doc.name} className="object-contain w-full h-full opacity-80 group-hover:opacity-100 transition-opacity shadow-lg" />
                </div>
                <div className="p-3 border-t border-[#333] bg-[#18181b]">
                    <div className="font-semibold truncate text-xs mb-1 text-gray-300 group-hover:text-white">{doc.name}</div>
                    <div className="text-[10px] text-gray-500">{doc.pages.length} Pages</div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Detail Overlay */}
      {activeDoc && (
        <div className="fixed inset-0 bg-black/95 z-50 flex flex-col p-6 animate-in fade-in duration-200">
            <div className="flex items-center justify-between border-b border-[#333] pb-4 mb-6 shrink-0">
                <div>
                    <h2 className="font-display text-2xl font-bold">{activeDoc.name}</h2>
                    <span className="text-gray-500 text-sm">{activeDoc.pages.length} Pages</span>
                </div>
                <div className="flex gap-4">
                    <div className="flex items-center gap-2">
                         <Toggle checked={activeDoc.pages.every(p => p.checked)} onChange={(c) => toggleAll(activeDoc.id, c)} label="Select All" />
                    </div>
                    <Button variant="red" onClick={() => downloadSelected(activeDoc)}>Download Selected</Button>
                    <Button variant="secondary" onClick={() => setActiveDocId(null)}><X size={20} /></Button>
                </div>
            </div>
            
            <div className="overflow-y-auto min-h-0">
              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 gap-4 pb-20">
                  {activeDoc.pages.map(page => (
                      <div key={page.num} className="bg-[#111] border border-[#333] rounded-lg overflow-hidden flex flex-col group relative">
                          <div className="aspect-[1/1.4] bg-black p-2 cursor-zoom-in" onClick={() => setLightboxUrl(page.url)}>
                              <img src={page.url} className="w-full h-full object-contain shadow-sm" />
                              <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                  <Maximize2 className="text-white drop-shadow-lg" />
                              </div>
                          </div>
                          <div className="p-2 flex justify-between items-center bg-[#181818] border-t border-[#333]">
                              <span className="text-[10px] text-gray-500">Page {page.num}</span>
                              <div className="flex gap-2 items-center">
                                  <button className="text-gray-400 hover:text-white" onClick={() => downloadBlob(page.blob, `${page.num}.png`)}>
                                      <Download size={14} />
                                  </button>
                                  <input 
                                      type="checkbox" 
                                      checked={page.checked} 
                                      onChange={(e) => togglePage(activeDoc.id, page.num, e.target.checked)}
                                      className="w-4 h-4 rounded border-gray-600 bg-[#333] text-blue-600 focus:ring-0 cursor-pointer"
                                  />
                              </div>
                          </div>
                      </div>
                  ))}
              </div>
            </div>
        </div>
      )}

      {/* Lightbox */}
      {lightboxUrl && (
          <div className="fixed inset-0 z-[60] bg-black/95 flex items-center justify-center p-8 animate-in zoom-in duration-200" onClick={() => setLightboxUrl(null)}>
              <img src={lightboxUrl} className="max-w-full max-h-full object-contain shadow-2xl" onClick={(e) => e.stopPropagation()} />
              <button className="absolute top-6 right-6 text-white/50 hover:text-white p-2" onClick={() => setLightboxUrl(null)}>
                  <X size={32} />
              </button>
          </div>
      )}
    </div>
  );
};

export default PdfConverter;