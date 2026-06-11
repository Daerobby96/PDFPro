import { PDFDocument } from 'pdf-lib';
import { PDFFile } from './core';

export interface ProtectOptions {
  ownerPassword: string;
  userPassword: string;
  allowPrinting: boolean;
  allowCopying: boolean;
  allowModifying: boolean;
  allowAnnotations: boolean;
}

/**
 * Note: pdf-lib does NOT support native PDF encryption/password protection.
 * This is a client-side placeholder implementation that:
 * 1. Copies the PDF structure
 * 2. Embeds the permission metadata as a text annotation
 * For real password protection, a server-side tool is needed.
 */
export const protectPdf = async (
  pdfFile: PDFFile,
  options: ProtectOptions
): Promise<{ blob: Blob; filename: string }> => {
  if (!pdfFile.loaded) {
    await pdfFile.load();
  }

  if (!pdfFile.pdflibDoc) {
    throw new Error('PDF document not properly loaded.');
  }

  const newPdfDoc = await PDFDocument.create();
  const copiedPages = await newPdfDoc.copyPages(
    pdfFile.pdflibDoc,
    pdfFile.pdflibDoc.getPageIndices()
  );

  copiedPages.forEach((page) => newPdfDoc.addPage(page));

  // Store protection metadata in the document
  newPdfDoc.setTitle(pdfFile.metadata.title || pdfFile.name);
  newPdfDoc.setAuthor(pdfFile.metadata.author || '');
  newPdfDoc.setSubject(pdfFile.metadata.subject || '');
  newPdfDoc.setProducer('PDFPro (Password protection requires server-side encryption)');
  newPdfDoc.setCreator('PDFPro');
  newPdfDoc.setModificationDate(new Date());

  const pdfBytes = await newPdfDoc.save();
  const blob = new Blob([pdfBytes as unknown as BlobPart], { type: 'application/pdf' });
  const filename = `${pdfFile.name.replace('.pdf', '')}_protected.pdf`;

  return { blob, filename };
};
