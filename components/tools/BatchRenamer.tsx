import React, { useState, useEffect } from 'react';
import { Upload, RefreshCw, Download, Trash2, ArrowRight, FileType } from 'lucide-react';
import { Button, Input, Toggle, DropZone, Panel, EmptyState, Select } from '../ui/Components';
import { downloadZip } from '../../utils';

interface RenameItem {
  id: string;
  file: File;
  originalName: string;
  newName: string;
  extension: string;
}

const BatchRenamer: React.FC = () => {
  const [items, setItems] = useState<RenameItem[]>([]);
  
  // Rules
  const [prefix, setPrefix] = useState('');
  const [suffix, setSuffix] = useState('');
  const [findStr, setFindStr] = useState('');
  const [replaceStr, setReplaceStr] = useState('');
  const [casing, setCasing] = useState<'none' | 'upper' | 'lower' | 'camel' | 'kebab'>('none');
  const [cleanName, setCleanName] = useState(false);
  const [useNumbering, setUseNumbering] = useState(false);
  const [startNum, setStartNum] = useState(1);
  const [padNum, setPadNum] = useState(3);
  const [replaceExt, setReplaceExt] = useState('');

  const handleFiles = (files: File[]) => {
    const newItems = files.map(f => {
      const lastDot = f.name.lastIndexOf('.');
      const name = lastDot === -1 ? f.name : f.name.substring(0, lastDot);
      const ext = lastDot === -1 ? '' : f.name.substring(lastDot);
      
      return {
        id: Math.random().toString(36).substr(2, 9),
        file: f,
        originalName: name,
        newName: name,
        extension: ext
      };
    });
    setItems(prev => [...prev, ...newItems]);
  };

  useEffect(() => {
    setItems(prevItems => {
        return prevItems.map((item, index) => {
            let name = item.originalName;

            // Clean Name (Remove special chars, space -> _)
            if (cleanName) {
                name = name.replace(/\s+/g, '_');
                name = name.replace(/[^a-zA-Z0-9\-_]/g, '');
            }

            // Find & Replace
            if (findStr) {
                try {
                    name = name.split(findStr).join(replaceStr);
                } catch (e) {}
            }

            // Casing
            if (casing === 'upper') name = name.toUpperCase();
            if (casing === 'lower') name = name.toLowerCase();
            if (casing === 'camel') {
                name = name.toLowerCase().replace(/[^a-zA-Z0-9]+(.)/g, (m, chr) => chr.toUpperCase());
            }
            if (casing === 'kebab') {
                name = name.replace(/([a-z])([A-Z])/g, '$1-$2').replace(/[\s_]+/g, '-').toLowerCase();
            }

            // Numbering
            if (useNumbering) {
                const num = startNum + index;
                const numStr = num.toString().padStart(padNum, '0');
                name = `${name}_${numStr}`;
            }

            // Prefix / Suffix
            name = `${prefix}${name}${suffix}`;

            // Extension
            let ext = item.extension;
            if (replaceExt) {
                ext = replaceExt.startsWith('.') ? replaceExt : `.${replaceExt}`;
            }

            return { ...item, newName: name + ext };
        });
    });
  }, [prefix, suffix, findStr, replaceStr, casing, cleanName, useNumbering, startNum, padNum, replaceExt]);

  const downloadAll = async () => {
    const files = items.map(item => ({
        name: item.newName,
        blob: item.file
    }));
    await downloadZip(files, "renamed_files.zip");
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-[300px_1fr] gap-8 h-full min-h-0">
      <div className="flex flex-col gap-6 overflow-y-auto pr-2 pb-20 lg:pb-0 custom-scrollbar max-h-[calc(100vh-140px)] lg:max-h-full">
         <DropZone onFiles={handleFiles} icon={<Upload size={24} />} label="Add Files" />

         <Panel>
            <span className="text-xs font-bold text-[#888] uppercase tracking-wide mb-4 block">Rules</span>
            <div className="flex flex-col gap-4">
                <div className="grid grid-cols-2 gap-2">
                    <Input placeholder="Prefix" value={prefix} onChange={e => setPrefix(e.target.value)} />
                    <Input placeholder="Suffix" value={suffix} onChange={e => setSuffix(e.target.value)} />
                </div>
                
                <div className="grid grid-cols-2 gap-2">
                     <Input placeholder="Find" value={findStr} onChange={e => setFindStr(e.target.value)} />
                     <Input placeholder="Replace" value={replaceStr} onChange={e => setReplaceStr(e.target.value)} />
                </div>

                <div className="bg-[#1A1A1A] p-3 rounded-lg border border-[#333]">
                     <Toggle checked={cleanName} onChange={setCleanName} label="Clean (Space → _)" />
                </div>

                <div className="flex flex-col gap-2">
                    <span className="text-xs text-[#666]">Casing</span>
                    <Select value={casing} onChange={e => setCasing(e.target.value as any)}>
                        <option value="none">Original</option>
                        <option value="upper">UPPERCASE</option>
                        <option value="lower">lowercase</option>
                        <option value="camel">camelCase</option>
                        <option value="kebab">kebab-case</option>
                    </Select>
                </div>

                <div className="flex flex-col gap-2 bg-[#1A1A1A] p-3 rounded-lg border border-[#333]">
                    <Toggle checked={useNumbering} onChange={setUseNumbering} label="Numbering" />
                    {useNumbering && (
                         <div className="grid grid-cols-2 gap-2 mt-2">
                             <Input type="number" placeholder="Start" value={startNum} onChange={e => setStartNum(Number(e.target.value))} />
                             <Input type="number" placeholder="Digits" value={padNum} onChange={e => setPadNum(Number(e.target.value))} />
                         </div>
                    )}
                </div>

                <div className="flex flex-col gap-2">
                     <Input placeholder="New Ext (e.g. .png)" value={replaceExt} onChange={e => setReplaceExt(e.target.value)} />
                </div>

                <div className="h-px bg-[#333] my-2" />
                
                <Button variant="primary" onClick={downloadAll} disabled={items.length === 0} icon={<Download size={16} />}>
                    Download
                </Button>
                <Button variant="danger" onClick={() => setItems([])} disabled={items.length === 0} icon={<Trash2 size={16} />}>
                    Clear
                </Button>
            </div>
         </Panel>
      </div>

      <div className="overflow-y-auto pb-20 custom-scrollbar max-h-[calc(100vh-140px)] lg:max-h-full">
         {items.length === 0 ? (
             <EmptyState icon={<RefreshCw size={48} />} message="No files added" />
         ) : (
             <div className="flex flex-col gap-2">
                 {items.map(item => (
                     <div key={item.id} className="bg-[#111] border border-[#222] rounded-lg p-3 flex items-center justify-between group hover:border-[#444] transition-colors">
                         <div className="flex items-center gap-4 flex-1 min-w-0">
                             <div className="w-10 h-10 rounded bg-[#1A1A1A] flex items-center justify-center text-[#666] shrink-0">
                                 <FileType size={20} />
                             </div>
                             <div className="flex flex-col min-w-0 flex-1">
                                 <div className="flex items-center gap-2 text-xs text-[#666]">
                                     <span className="truncate max-w-full">{item.originalName}{item.extension}</span>
                                 </div>
                                 <div className="flex items-center gap-2 text-sm text-[#E6E1E5]">
                                     <ArrowRight size={14} className="text-[#666]" />
                                     <span className="font-mono truncate font-medium text-[#A8C7FA]">{item.newName}</span>
                                 </div>
                             </div>
                         </div>
                         <button 
                            className="p-2 text-[#666] hover:text-[#FFB4AB] transition-colors"
                            onClick={() => setItems(prev => prev.filter(i => i.id !== item.id))}
                         >
                             <Trash2 size={16} />
                         </button>
                     </div>
                 ))}
             </div>
         )}
      </div>
    </div>
  );
};

export default BatchRenamer;