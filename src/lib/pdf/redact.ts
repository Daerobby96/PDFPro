import { PDFDocument, rgb } from 'pdf-lib';

export interface RedactionArea {
  pageNumber: number; // 1-indexed
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface RedactionOptions {
  areas: RedactionArea[];
  color?: { r: number; g: number; b: number };
  // For text redaction
  searchText?: string[];
  caseSensitive?: boolean;
}

export async function redactPDF(
  pdfBytes: Uint8Array,
  options: RedactionOptions
): Promise<Uint8Array> {
  const pdfDoc = await PDFDocument.load(pdfBytes);
  const pages = pdfDoc.getPages();
  
  const redactionColor = options.color ?? { r: 0, g: 0, b: 0 };
  
  // Manual area redaction
  if (options.areas && options.areas.length > 0) {
    options.areas.forEach(area => {
      const page = pages[area.pageNumber - 1];
      if (page) {
        const { height } = page.getSize();
        
        // Draw black rectangle over the area
        page.drawRectangle({
          x: area.x,
          y: height - area.y - area.height, // Flip Y coordinate
          width: area.width,
          height: area.height,
          color: rgb(redactionColor.r, redactionColor.g, redactionColor.b),
        });
      }
    });
  }
  
  // Text-based redaction (simplified - requires PDF text extraction)
  // Note: Full text redaction requires more advanced PDF parsing
  if (options.searchText && options.searchText.length > 0) {
    // This would require PDF text extraction and coordinate mapping
    // For now, we'll provide the structure for future implementation
    console.warn('Text-based redaction requires advanced PDF parsing. Use manual area redaction for now.');
  }
  
  return await pdfDoc.save();
}

// Helper function to create redaction areas from coordinates
export function createRedactionArea(
  pageNumber: number,
  x: number,
  y: number,
  width: number,
  height: number
): RedactionArea {
  return { pageNumber, x, y, width, height };
}

// Batch redaction helper
export async function redactMultipleAreas(
  pdfBytes: Uint8Array,
  areas: RedactionArea[],
  color?: { r: number; g: number; b: number }
): Promise<Uint8Array> {
  return redactPDF(pdfBytes, { areas, color });
}
