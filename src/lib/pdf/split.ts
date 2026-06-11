import { PDFDocument } from 'pdf-lib';
import { PDFFile } from './core';

export interface SplitJob {
  name: string;
  pages: number[]; // 1-indexed page numbers
}

export const executeSplit = async (
  file: PDFFile,
  jobs: SplitJob[],
  onProgress?: (progress: number) => void
): Promise<{ filename: string; blob: Blob }[]> => {
  if (!file || !file.pdflibDoc) {
    throw new Error('PDF document not loaded properly.');
  }

  const results: { filename: string; blob: Blob }[] = [];
  const srcDoc = file.pdflibDoc;

  for (let i = 0; i < jobs.length; i++) {
    const job = jobs[i];
    
    if (onProgress) {
      onProgress(((i) / jobs.length) * 100);
    }

    const newPdfDoc = await PDFDocument.create();
    // pdf-lib copyPages uses 0-indexed page numbers, our jobs use 1-indexed
    const pageIndicesToCopy = job.pages.map(p => p - 1);
    
    // Copy pages
    const copiedPages = await newPdfDoc.copyPages(srcDoc, pageIndicesToCopy);
    copiedPages.forEach(page => newPdfDoc.addPage(page));

    // Save
    const pdfBytes = await newPdfDoc.save();
    const blob = new Blob([pdfBytes as unknown as BlobPart], { type: 'application/pdf' });
    
    // Clean filename
    const baseFilename = file.name.replace(/\.[^/.]+$/, '');
    const filename = `${baseFilename}_${job.name}.pdf`;

    results.push({ filename, blob });
  }

  if (onProgress) {
    onProgress(100);
  }

  return results;
};

/**
 * Generates an array of page numbers from start to end (inclusive)
 */
export const generatePageRange = (start: number, end: number): number[] => {
  if (start > end) return [];
  return Array.from({ length: end - start + 1 }, (_, i) => start + i);
};
