export enum ViewType {
  HOME = 'home',
  LOGO = 'logo',
  PDF = 'pdf',
  SPLIT = 'split',
  STORY = 'story',
  STILLS = 'stills',
  ADLINKS = 'adlinks'
}

export interface ToolConfig {
  id: ViewType;
  name: string;
  description: string;
  icon: string; // Icon name reference
  color: string;
}

export interface ProcessedImage {
  id: string;
  url: string;
  file: File;
  name: string;
}

export interface PdfPage {
  num: number;
  blob: Blob;
  url: string;
  checked: boolean;
}
