import * as pdfjsLib from 'pdfjs-dist';
import { PDFDocument } from 'pdf-lib';

// Initialize PDF.js worker using CDN to avoid Next.js bundling issues
if (typeof window !== 'undefined' && !pdfjsLib.GlobalWorkerOptions.workerSrc) {
  pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;
}

export interface PDFMetadata {
  title: string;
  author: string;
  subject: string;
  creator: string;
  producer: string;
  creationDate: string;
  modDate: string;
}

export class PDFFile {
  public id: string;
  public file: File;
  public name: string;
  public size: number;
  public pdfDoc: any | null = null;
  public pdflibDoc: PDFDocument | null = null;
  public totalPages: number = 0;
  public metadata: PDFMetadata = {
    title: '', author: '', subject: '', creator: '', producer: '', creationDate: '', modDate: ''
  };
  public loaded: boolean = false;

  constructor(file: File) {
    this.id = Date.now().toString() + Math.random().toString();
    this.file = file;
    this.name = file.name;
    this.size = file.size;
  }

  public async load(): Promise<void> {
    if (this.loaded) return;

    try {
      const arrayBuffer = await this.file.arrayBuffer();
      
      // Create separate copies to avoid detached buffer issues
      const pdfJsBuffer = arrayBuffer.slice(0);
      const pdfLibBuffer = arrayBuffer.slice(0);

      // Load with PDF.js for rendering
      this.pdfDoc = await pdfjsLib.getDocument({ data: pdfJsBuffer }).promise;
      this.totalPages = this.pdfDoc.numPages;

      // Load with PDF-lib for manipulation
      this.pdflibDoc = await PDFDocument.load(pdfLibBuffer);

      try {
        const pdfInfo = (this.pdfDoc as any)._pdfInfo || (this.pdfDoc as any).pdfInfo || {};
        const info = pdfInfo.info || {};
        
        this.metadata = {
          title: (info.Title && typeof info.Title === 'string') ? info.Title : '',
          author: (info.Author && typeof info.Author === 'string') ? info.Author : '',
          subject: (info.Subject && typeof info.Subject === 'string') ? info.Subject : '',
          creator: (info.Creator && typeof info.Creator === 'string') ? info.Creator : '',
          producer: (info.Producer && typeof info.Producer === 'string') ? info.Producer : '',
          creationDate: info.CreationDate || '',
          modDate: info.ModDate || ''
        };
      } catch (metadataError) {
        console.warn('Could not extract PDF metadata:', metadataError);
      }

      this.loaded = true;
    } catch (error: any) {
      console.error('Failed to load PDF:', error);
      throw new Error(`Failed to load PDF: ${error.message}`);
    }
  }

  public async getPage(pageNum: number): Promise<any> {
    if (!this.loaded) await this.load();
    return await this.pdfDoc.getPage(pageNum);
  }
}

export const formatSize = (bytes: number): string => {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
};

export const downloadFile = (blob: Blob, filename: string) => {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
};
