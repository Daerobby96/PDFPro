/**
 * Helper functions for PDF operations
 */

import { PDFFile } from './core';

/**
 * Create a PDFFile instance from a File object
 */
export async function createPDFFile(file: File): Promise<PDFFile> {
  const pdfFile = new PDFFile(file);
  await pdfFile.load();
  return pdfFile;
}

/**
 * Get PDF bytes as Uint8Array from a PDFFile instance
 */
export async function getPDFBytes(pdfFile: PDFFile): Promise<Uint8Array> {
  const arrayBuffer = await pdfFile.file.arrayBuffer();
  return new Uint8Array(arrayBuffer);
}

/**
 * Load a File as Uint8Array for PDF processing
 */
export async function fileToUint8Array(file: File): Promise<Uint8Array> {
  const arrayBuffer = await file.arrayBuffer();
  return new Uint8Array(arrayBuffer);
}
