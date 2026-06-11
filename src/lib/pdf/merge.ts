import { PDFDocument } from 'pdf-lib';
import { PDFFile } from './core';

export const executeMerge = async (
  files: PDFFile[],
  onProgress?: (progress: number) => void
): Promise<{ filename: string; blob: Blob }> => {
  if (!files || files.length < 2) {
    throw new Error('Please provide at least two PDF files to merge.');
  }

  const mergedPdf = await PDFDocument.create();

  for (let i = 0; i < files.length; i++) {
    const file = files[i];
    if (!file.pdflibDoc) {
      await file.load();
    }
    
    if (!file.pdflibDoc) {
       throw new Error(`Failed to load ${file.name}`);
    }

    if (onProgress) {
      onProgress(((i) / files.length) * 100);
    }

    const srcDoc = file.pdflibDoc;
    const copiedPages = await mergedPdf.copyPages(srcDoc, srcDoc.getPageIndices());
    copiedPages.forEach((page) => mergedPdf.addPage(page));
  }

  if (onProgress) {
    onProgress(100);
  }

  const pdfBytes = await mergedPdf.save();
  const blob = new Blob([pdfBytes], { type: 'application/pdf' });
  const filename = `merged_${Date.now()}.pdf`;

  return { filename, blob };
};
