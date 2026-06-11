import JSZip from 'jszip';
import { PDFFile } from './core';

export interface ExtractImagesOptions {
  fromPage: number;
  toPage: number;
  format: 'png' | 'jpeg' | 'webp';
  quality: number; // 1 to 100
  minWidth: number;
  minHeight: number;
  downloadAsZip: boolean;
}

export interface ExtractedImage {
  blob: Blob;
  filename: string;
}

const renderPageToCanvas = async (page: any, scale: number): Promise<HTMLCanvasElement> => {
  const viewport = page.getViewport({ scale });
  const canvas = document.createElement('canvas');
  const context = canvas.getContext('2d');
  
  if (!context) {
    throw new Error('Could not get canvas context');
  }

  canvas.height = viewport.height;
  canvas.width = viewport.width;

  await page.render({
    canvasContext: context,
    viewport: viewport,
  }).promise;

  return canvas;
};

export const extractImages = async (
  pdfFile: PDFFile,
  options: ExtractImagesOptions,
  onProgress?: (progress: number) => void
): Promise<{ blob: Blob; filename: string } | ExtractedImage[]> => {
  if (!pdfFile.loaded) {
    await pdfFile.load();
  }

  const {
    fromPage,
    toPage,
    format,
    quality,
    minWidth,
    minHeight,
    downloadAsZip,
  } = options;

  const validFrom = Math.max(1, fromPage);
  const validTo = Math.min(pdfFile.totalPages, toPage);
  
  const images: ExtractedImage[] = [];
  const mimeType = `image/${format}`;
  const qualityDecimal = quality / 100;

  for (let i = validFrom; i <= validTo; i++) {
    if (onProgress) {
      onProgress(((i - validFrom + 1) / (validTo - validFrom + 1)) * 100);
    }

    const page = await pdfFile.getPage(i);
    // Use scale 2.0 for higher resolution extraction
    const canvas = await renderPageToCanvas(page, 2.0);

    if (canvas.width < minWidth || canvas.height < minHeight) {
      continue;
    }

    const blob = await new Promise<Blob | null>((resolve) => {
      canvas.toBlob(resolve, mimeType, qualityDecimal);
    });

    if (blob) {
      const filename = `${pdfFile.name.replace('.pdf', '')}_page${i}.${format}`;
      images.push({ blob, filename });
    }
  }

  if (images.length === 0) {
    throw new Error('No images found matching the criteria.');
  }

  if (downloadAsZip) {
    const zip = new JSZip();
    const folderName = pdfFile.name.replace('.pdf', '_images');
    const folder = zip.folder(folderName);
    
    if (folder) {
      images.forEach(({ blob, filename }) => {
        folder.file(filename, blob);
      });
    }

    const zipBlob = await zip.generateAsync({ type: 'blob' });
    const zipFilename = `${folderName}.zip`;

    return { blob: zipBlob, filename: zipFilename };
  } else {
    return images;
  }
};
