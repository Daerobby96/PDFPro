import { PDFDocument, rgb, StandardFonts, PDFPage } from 'pdf-lib';

export interface TextEdit {
  pageNumber: number; // 1-indexed
  x: number;
  y: number;
  text: string;
  fontSize?: number;
  color?: { r: number; g: number; b: number };
  fontName?: 'Helvetica' | 'Helvetica-Bold' | 'Times-Roman' | 'Courier';
}

export interface ImageEdit {
  pageNumber: number; // 1-indexed
  x: number;
  y: number;
  imageBytes: Uint8Array;
  imageType: 'png' | 'jpg';
  width?: number;
  height?: number;
  opacity?: number;
}

export interface ShapeEdit {
  pageNumber: number;
  type: 'rectangle' | 'line' | 'circle';
  x: number;
  y: number;
  width?: number;
  height?: number;
  x2?: number; // for line
  y2?: number; // for line
  radius?: number; // for circle
  color?: { r: number; g: number; b: number };
  borderColor?: { r: number; g: number; b: number };
  borderWidth?: number;
  opacity?: number;
}

export interface EditorOptions {
  textEdits?: TextEdit[];
  imageEdits?: ImageEdit[];
  shapeEdits?: ShapeEdit[];
  removePages?: number[]; // page numbers to remove
  duplicatePages?: Array<{ pageNumber: number; insertAfter: number }>;
}

export async function editPDF(
  pdfBytes: Uint8Array,
  options: EditorOptions
): Promise<Uint8Array> {
  const pdfDoc = await PDFDocument.load(pdfBytes);
  const pages = pdfDoc.getPages();
  
  // Add text edits
  if (options.textEdits) {
    for (const edit of options.textEdits) {
      const page = pages[edit.pageNumber - 1];
      if (!page) continue;
      
      const { height } = page.getSize();
      const fontSize = edit.fontSize ?? 12;
      const color = edit.color ?? { r: 0, g: 0, b: 0 };
      
      let font;
      switch (edit.fontName) {
        case 'Helvetica-Bold':
          font = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
          break;
        case 'Times-Roman':
          font = await pdfDoc.embedFont(StandardFonts.TimesRoman);
          break;
        case 'Courier':
          font = await pdfDoc.embedFont(StandardFonts.Courier);
          break;
        default:
          font = await pdfDoc.embedFont(StandardFonts.Helvetica);
      }
      
      page.drawText(edit.text, {
        x: edit.x,
        y: height - edit.y - fontSize, // Flip Y coordinate
        size: fontSize,
        font,
        color: rgb(color.r, color.g, color.b),
      });
    }
  }
  
  // Add image edits
  if (options.imageEdits) {
    for (const edit of options.imageEdits) {
      const page = pages[edit.pageNumber - 1];
      if (!page) continue;
      
      const { height } = page.getSize();
      
      let image;
      if (edit.imageType === 'png') {
        image = await pdfDoc.embedPng(edit.imageBytes);
      } else {
        image = await pdfDoc.embedJpg(edit.imageBytes);
      }
      
      const imgWidth = edit.width ?? image.width;
      const imgHeight = edit.height ?? image.height;
      const opacity = edit.opacity ?? 1;
      
      page.drawImage(image, {
        x: edit.x,
        y: height - edit.y - imgHeight,
        width: imgWidth,
        height: imgHeight,
        opacity,
      });
    }
  }
  
  // Add shape edits
  if (options.shapeEdits) {
    for (const edit of options.shapeEdits) {
      const page = pages[edit.pageNumber - 1];
      if (!page) continue;
      
      const { height } = page.getSize();
      const color = edit.color ?? { r: 0, g: 0, b: 0 };
      const borderColor = edit.borderColor ?? color;
      const borderWidth = edit.borderWidth ?? 1;
      const opacity = edit.opacity ?? 1;
      
      switch (edit.type) {
        case 'rectangle':
          if (edit.width && edit.height) {
            page.drawRectangle({
              x: edit.x,
              y: height - edit.y - edit.height,
              width: edit.width,
              height: edit.height,
              color: rgb(color.r, color.g, color.b),
              borderColor: rgb(borderColor.r, borderColor.g, borderColor.b),
              borderWidth,
              opacity,
            });
          }
          break;
          
        case 'line':
          if (edit.x2 !== undefined && edit.y2 !== undefined) {
            page.drawLine({
              start: { x: edit.x, y: height - edit.y },
              end: { x: edit.x2, y: height - edit.y2 },
              color: rgb(color.r, color.g, color.b),
              thickness: borderWidth,
              opacity,
            });
          }
          break;
          
        case 'circle':
          if (edit.radius) {
            page.drawCircle({
              x: edit.x,
              y: height - edit.y,
              size: edit.radius,
              color: rgb(color.r, color.g, color.b),
              borderColor: rgb(borderColor.r, borderColor.g, borderColor.b),
              borderWidth,
              opacity,
            });
          }
          break;
      }
    }
  }
  
  return await pdfDoc.save();
}

// Helper functions
export async function addTextToPDF(
  pdfBytes: Uint8Array,
  pageNumber: number,
  x: number,
  y: number,
  text: string,
  options?: {
    fontSize?: number;
    color?: { r: number; g: number; b: number };
    fontName?: 'Helvetica' | 'Helvetica-Bold' | 'Times-Roman' | 'Courier';
  }
): Promise<Uint8Array> {
  return editPDF(pdfBytes, {
    textEdits: [{ pageNumber, x, y, text, ...options }]
  });
}

export async function addImageToPDF(
  pdfBytes: Uint8Array,
  pageNumber: number,
  x: number,
  y: number,
  imageBytes: Uint8Array,
  imageType: 'png' | 'jpg',
  options?: {
    width?: number;
    height?: number;
    opacity?: number;
  }
): Promise<Uint8Array> {
  return editPDF(pdfBytes, {
    imageEdits: [{ pageNumber, x, y, imageBytes, imageType, ...options }]
  });
}
