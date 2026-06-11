import { PDFFile } from './core';

export interface PdfToImageOptions {
  format: 'png' | 'jpeg';
  scale: number;
}

export const renderPageToImage = async (
  pdfFile: PDFFile,
  pageNum: number,
  options: PdfToImageOptions
): Promise<{ dataUrl: string; filename: string; blob: Blob }> => {
  if (!pdfFile.loaded) {
    await pdfFile.load();
  }

  const page = await pdfFile.getPage(pageNum);
  const viewport = page.getViewport({ scale: options.scale });
  
  const canvas = document.createElement('canvas');
  canvas.height = viewport.height;
  canvas.width = viewport.width;
  
  const context = canvas.getContext('2d');
  if (!context) {
    throw new Error('Failed to get canvas context');
  }

  context.fillStyle = 'white';
  context.fillRect(0, 0, canvas.width, canvas.height);

  const renderContext = {
    canvasContext: context,
    viewport: viewport,
  };

  await page.render(renderContext).promise;

  const mimeType = options.format === 'png' ? 'image/png' : 'image/jpeg';
  
  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (!blob) {
        reject(new Error('Failed to generate image blob'));
        return;
      }
      const dataUrl = canvas.toDataURL(mimeType, 0.95);
      const originalName = pdfFile.name.replace('.pdf', '');
      const filename = `${originalName}_page_${pageNum}.${options.format}`;
      resolve({ dataUrl, filename, blob });
    }, mimeType, 0.95);
  });
};
