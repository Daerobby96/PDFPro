import { PDFDocument } from 'pdf-lib';
import { PDFFile } from './core';

export interface CompressOptions {
  level: 'low' | 'medium' | 'high';
  removeMetadata: boolean;
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

export const compressPdf = async (
  pdfFile: PDFFile,
  options: CompressOptions,
  onProgress?: (progress: number) => void
): Promise<{ blob: Blob; filename: string; reduction: string }> => {
  if (!pdfFile.loaded) {
    await pdfFile.load();
  }

  const { level, removeMetadata } = options;

  const qualityMap = { low: 0.9, medium: 0.7, high: 0.5 };
  const scaleMap = { low: 1.5, medium: 1.2, high: 0.9 };

  const quality = qualityMap[level];
  const scale = scaleMap[level];

  const newPdfDoc = await PDFDocument.create();

  for (let i = 1; i <= pdfFile.totalPages; i++) {
    if (onProgress) {
      onProgress((i / pdfFile.totalPages) * 100);
    }

    const page = await pdfFile.getPage(i);
    const canvas = await renderPageToCanvas(page, scale);

    const blob = await new Promise<Blob | null>((resolve) => {
      canvas.toBlob(resolve, 'image/jpeg', quality);
    });

    if (!blob) continue;

    const arrayBuffer = await blob.arrayBuffer();
    const image = await newPdfDoc.embedJpg(arrayBuffer);

    const pdfPage = newPdfDoc.addPage([image.width, image.height]);
    pdfPage.drawImage(image, {
      x: 0,
      y: 0,
      width: image.width,
      height: image.height,
    });
  }

  if (removeMetadata) {
    newPdfDoc.setTitle('');
    newPdfDoc.setAuthor('');
    newPdfDoc.setSubject('');
    newPdfDoc.setCreator('');
    newPdfDoc.setProducer('');
  } else {
    // Preserve metadata
    if (pdfFile.metadata.title) newPdfDoc.setTitle(pdfFile.metadata.title);
    if (pdfFile.metadata.author) newPdfDoc.setAuthor(pdfFile.metadata.author);
    if (pdfFile.metadata.subject) newPdfDoc.setSubject(pdfFile.metadata.subject);
  }

  const pdfBytes = await newPdfDoc.save();
  const resultBlob = new Blob([pdfBytes], { type: 'application/pdf' });
  const filename = `${pdfFile.name.replace('.pdf', '')}_compressed.pdf`;

  const reduction = ((1 - (resultBlob.size / pdfFile.size)) * 100).toFixed(1);

  return { blob: resultBlob, filename, reduction };
};
