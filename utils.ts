import JSZip from 'jszip';

export const sanitizeFilename = (name: string): string => {
  return name.replace(/\s+/g, "_").replace(/[\\\/:*?"<>|]/g, "");
};

export const createBlobUrl = (blob: Blob): string => {
  return URL.createObjectURL(blob);
};

export const revokeBlobUrl = (url: string) => {
  URL.revokeObjectURL(url);
};

export const downloadBlob = (blob: Blob, filename: string) => {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
};

export const downloadZip = async (files: { name: string; blob: Blob }[], zipName: string) => {
  const zip = new JSZip();
  files.forEach(f => {
    zip.file(f.name, f.blob);
  });
  const content = await zip.generateAsync({ type: "blob" });
  downloadBlob(content, zipName);
};

export const debounce = <T extends (...args: any[]) => any>(
  func: T,
  wait: number
): ((...args: Parameters<T>) => void) => {
  let timeout: NodeJS.Timeout;
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
};
