import { PDFDocument, degrees } from 'pdf-lib';
import { PDFFile } from './core';

export interface RotateOptions {
  pageOrder: number[]; // Ordered array of 1-based page numbers
  rotations: Record<number, number>; // Map of 1-based page number to rotation in degrees (e.g. 90, 180, 270)
}

export const rotatePdf = async (
  pdfFile: PDFFile,
  options: RotateOptions,
  onProgress?: (progress: number) => void
): Promise<{ blob: Blob; filename: string }> => {
  if (!pdfFile.loaded) {
    await pdfFile.load();
  }

  const { pageOrder, rotations } = options;

  if (!pdfFile.pdflibDoc) {
    throw new Error('PDF document not properly loaded for manipulation.');
  }

  const newPdfDoc = await PDFDocument.create();
  
  const totalPages = pageOrder.length;

  for (let i = 0; i < totalPages; i++) {
    if (onProgress) {
      onProgress(((i + 1) / totalPages) * 100);
    }

    const pageNum = pageOrder[i];
    // Copy the specific page (pdf-lib uses 0-based index)
    const [copiedPage] = await newPdfDoc.copyPages(pdfFile.pdflibDoc, [pageNum - 1]);
    
    // Apply rotation if specified
    const rotation = rotations[pageNum] || 0;
    if (rotation !== 0) {
      // pdf-lib degrees are measured clockwise
      copiedPage.setRotation(degrees(rotation));
    }

    newPdfDoc.addPage(copiedPage);
  }

  const pdfBytes = await newPdfDoc.save();
  const blob = new Blob([pdfBytes as unknown as BlobPart], { type: 'application/pdf' });
  const filename = `${pdfFile.name.replace('.pdf', '')}_rotated.pdf`;

  return { blob, filename };
};
