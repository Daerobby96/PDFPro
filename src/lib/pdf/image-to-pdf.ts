import { PDFDocument, PageSizes } from 'pdf-lib';

export interface ImageToPdfOptions {
  pageSize: 'a4' | 'letter' | 'auto';
  orientation: 'portrait' | 'landscape';
  margin: number;
}

// Helper to normalize image to raw PNG/JPEG bytes using canvas (supports JPG, PNG, WEBP, GIF, etc)
export const normalizeImage = (file: File): Promise<{ bytes: ArrayBuffer; isPng: boolean }> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.src = URL.createObjectURL(file);
    img.onload = () => {
      URL.revokeObjectURL(img.src);
      const canvas = document.createElement('canvas');
      canvas.width = img.naturalWidth;
      canvas.height = img.naturalHeight;
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        reject(new Error('Failed to get canvas context'));
        return;
      }
      ctx.drawImage(img, 0, 0);
      
      const isPng = file.type === 'image/png';
      const format = isPng ? 'image/png' : 'image/jpeg';
      
      canvas.toBlob((blob) => {
        if (!blob) {
          reject(new Error('Failed to convert image to blob'));
          return;
        }
        const reader = new FileReader();
        reader.onload = () => {
          resolve({ bytes: reader.result as ArrayBuffer, isPng });
        };
        reader.onerror = reject;
        reader.readAsArrayBuffer(blob);
      }, format, 0.92);
    };
    img.onerror = () => {
      URL.revokeObjectURL(img.src);
      reject(new Error('Failed to load image'));
    };
  });
};

export const convertImagesToPdf = async (
  imageFiles: File[],
  options: ImageToPdfOptions,
  onProgress?: (progress: number) => void
): Promise<Blob> => {
  const pdfDoc = await PDFDocument.create();
  const total = imageFiles.length;

  for (let i = 0; i < total; i++) {
    if (onProgress) {
      onProgress(Math.round((i / total) * 100));
    }

    const file = imageFiles[i];
    const { bytes, isPng } = await normalizeImage(file);
    
    let embeddedImage;
    if (isPng) {
      embeddedImage = await pdfDoc.embedPng(bytes);
    } else {
      embeddedImage = await pdfDoc.embedJpg(bytes);
    }

    const imgWidth = embeddedImage.width;
    const imgHeight = embeddedImage.height;

    let pageWidth = imgWidth;
    let pageHeight = imgHeight;

    if (options.pageSize === 'a4') {
      const size = PageSizes.A4;
      pageWidth = options.orientation === 'portrait' ? size[0] : size[1];
      pageHeight = options.orientation === 'portrait' ? size[1] : size[0];
    } else if (options.pageSize === 'letter') {
      const size = PageSizes.Letter;
      pageWidth = options.orientation === 'portrait' ? size[0] : size[1];
      pageHeight = options.orientation === 'portrait' ? size[1] : size[0];
    }

    const page = pdfDoc.addPage([pageWidth, pageHeight]);
    const margin = options.margin;

    const printableWidth = pageWidth - margin * 2;
    const printableHeight = pageHeight - margin * 2;

    const scale = Math.min(printableWidth / imgWidth, printableHeight / imgHeight);
    const drawWidth = imgWidth * scale;
    const drawHeight = imgHeight * scale;

    const x = margin + (printableWidth - drawWidth) / 2;
    const y = margin + (printableHeight - drawHeight) / 2;

    page.drawImage(embeddedImage, {
      x,
      y,
      width: drawWidth,
      height: drawHeight,
    });
  }

  if (onProgress) {
    onProgress(100);
  }

  const pdfBytes = await pdfDoc.save();
  return new Blob([pdfBytes as unknown as BlobPart], { type: 'application/pdf' });
};
