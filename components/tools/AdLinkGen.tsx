import React, { useState } from 'react';
import { Copy, Link2 } from 'lucide-react';
import { Button, Input, Select, TextArea, Panel } from '../ui/Components';

const AdLinkGen: React.FC = () => {
  const [server, setServer] = useState('aldi');
  const [folder, setFolder] = useState('');
  const [input, setInput] = useState('');
  const [adOutput, setAdOutput] = useState('');
  const [storyOutput, setStoryOutput] = useState('');

  const generate = () => {
    const baseUrls: Record<string, string> = {
        aldi: "https://aldimediaeu.blob.core.windows.net/aldimediaeu/",
        s3: "https://s3media-ml-eu.surveycenter.com/"
    };

    const normFolder = folder.trim().replace(/\s+/g, "/").replace(/\/+/g, "/").replace(/^\/|\/$/g, "") + "/";
    const lines = input.split("\n").map(l => l.trim()).filter(Boolean);
    
    const ads: string[] = [];
    const story: string[] = [];
    const baseUrl = baseUrls[server] || "";

    lines.forEach(name => {
        const ext = name.split(".").pop()?.toLowerCase();
        const url = baseUrl + normFolder + name;

        if (ext === "jpg" || ext === "png") {
            ads.push(`<img src="${url}" class="zoomImage" style="max-width:80%">`);
            story.push(`<img src="${url}" class="zoomImage" style="max-height:280px">`);
        } else if (ext === "mp4") {
            ads.push(url);
            story.push(`<img src="${baseUrl + normFolder + name.replace(".mp4", ".jpg")}" class="zoomImage" style="max-height:280px">`);
        } else if (ext === "mp3") {
            ads.push(url);
            story.push(name);
        }
    });

    setAdOutput(ads.join("\n\n"));
    setStoryOutput(story.join("\n"));
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-[300px_1fr] gap-8 h-full min-h-0">
        <div className="flex flex-col gap-6 overflow-y-auto pr-2 pb-20 lg:pb-0 custom-scrollbar max-h-[calc(100vh-140px)] lg:max-h-full">
            <Panel>
                <div className="flex flex-col gap-4">
                    <div className="flex flex-col gap-2">
                        <span className="text-xs text-[#888] uppercase font-bold tracking-wide">Server</span>
                        <Select 
                            value={server}
                            onChange={(e) => setServer(e.target.value)}
                        >
                            <option value="aldi">ALDI Blob</option>
                            <option value="s3">S3 Media</option>
                        </Select>
                    </div>
                    <div className="flex flex-col gap-2">
                        <span className="text-xs text-[#888] uppercase font-bold tracking-wide">Path</span>
                        <Input placeholder="Folder/Path" value={folder} onChange={(e) => setFolder(e.target.value)} />
                    </div>
                    <div className="flex flex-col gap-2">
                        <span className="text-xs text-[#888] uppercase font-bold tracking-wide">Filenames</span>
                        <TextArea 
                            className="h-40 font-mono text-xs text-[#7DDAAF]"
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            placeholder="Paste filenames here..."
                        />
                    </div>
                    <Button variant="emerald" onClick={generate}>Generate</Button>
                </div>
            </Panel>
        </div>

        <div className="flex flex-col gap-6 overflow-y-auto pb-20 lg:pb-0 custom-scrollbar max-h-[calc(100vh-140px)] lg:max-h-full">
             <Panel className="flex-1 flex flex-col min-h-[300px]">
                <div className="flex justify-between items-center mb-4">
                    <span className="text-xs font-bold text-[#888] uppercase tracking-wide">Ad Exposure Code</span>
                    <Button className="h-7 text-xs px-3" onClick={() => copyToClipboard(adOutput)} icon={<Copy size={12} />} variant="tonal">Copy</Button>
                </div>
                <TextArea 
                    readOnly
                    className="flex-1 font-mono text-xs text-[#7DDAAF] border-[#333]"
                    value={adOutput}
                />
             </Panel>
             <Panel className="flex-1 flex flex-col min-h-[300px]">
                <div className="flex justify-between items-center mb-4">
                    <span className="text-xs font-bold text-[#888] uppercase tracking-wide">Storyboard Code</span>
                    <Button className="h-7 text-xs px-3" onClick={() => copyToClipboard(storyOutput)} icon={<Copy size={12} />} variant="tonal">Copy</Button>
                </div>
                <TextArea 
                    readOnly
                    className="flex-1 font-mono text-xs text-[#7DDAAF] border-[#333]"
                    value={storyOutput}
                />
             </Panel>
        </div>
    </div>
  );
};

export default AdLinkGen;