import { PDFDocument } from 'pdf-lib';
import { PDFFile } from './core';

export interface MetadataOptions {
  title: string;
  author: string;
  subject: string;
  keywords: string;
}

export const readMetadata = (pdfFile: PDFFile): MetadataOptions => {
  return {
    title: pdfFile.metadata.title || '',
    author: pdfFile.metadata.author || '',
    subject: pdfFile.metadata.subject || '',
    keywords: '',
  };
};

export const saveMetadata = async (
  pdfFile: PDFFile,
  metadata: MetadataOptions
): Promise<{ blob: Blob; filename: string }> => {
  if (!pdfFile.loaded) {
    await pdfFile.load();
  }

  const arrayBuffer = await pdfFile.file.arrayBuffer();
  const pdfDoc = await PDFDocument.load(arrayBuffer);

  pdfDoc.setTitle(metadata.title);
  pdfDoc.setAuthor(metadata.author);
  pdfDoc.setSubject(metadata.subject);
  if (metadata.keywords) {
    pdfDoc.setKeywords(metadata.keywords.split(',').map((k) => k.trim()));
  }
  pdfDoc.setProducer('PDFPro');
  pdfDoc.setCreator('PDFPro');
  pdfDoc.setModificationDate(new Date());

  const pdfBytes = await pdfDoc.save();
  const blob = new Blob([pdfBytes as unknown as BlobPart], { type: 'application/pdf' });
  const filename = `${pdfFile.name.replace('.pdf', '')}_metadata.pdf`;

  return { blob, filename };
};
