import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';

export interface HeaderFooterOptions {
  header?: {
    left?: string;
    center?: string;
    right?: string;
    fontSize?: number;
    color?: { r: number; g: number; b: number };
  };
  footer?: {
    left?: string;
    center?: string;
    right?: string;
    fontSize?: number;
    color?: { r: number; g: number; b: number };
  };
  margin?: number;
  excludePages?: number[];
  // Dynamic variables: {page}, {total}, {date}, {time}
}

export async function addHeaderFooter(
  pdfBytes: Uint8Array,
  options: HeaderFooterOptions
): Promise<Uint8Array> {
  const pdfDoc = await PDFDocument.load(pdfBytes);
  const pages = pdfDoc.getPages();
  const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
  
  const margin = options.margin ?? 30;
  const excludePages = options.excludePages ?? [];
  const totalPages = pages.length;
  
  const now = new Date();
  const dateStr = now.toLocaleDateString();
  const timeStr = now.toLocaleTimeString();
  
  pages.forEach((page, index) => {
    const pageNum = index + 1;
    
    // Skip excluded pages
    if (excludePages.includes(pageNum)) {
      return;
    }
    
    const { width, height } = page.getSize();
    
    // Process Header
    if (options.header) {
      const headerFontSize = options.header.fontSize ?? 10;
      const headerColor = options.header.color ?? { r: 0, g: 0, b: 0 };
      const headerY = height - margin;
      
      // Left
      if (options.header.left) {
        const text = replaceDynamicVars(options.header.left, pageNum, totalPages, dateStr, timeStr);
        page.drawText(text, {
          x: margin,
          y: headerY,
          size: headerFontSize,
          font,
          color: rgb(headerColor.r, headerColor.g, headerColor.b),
        });
      }
      
      // Center
      if (options.header.center) {
        const text = replaceDynamicVars(options.header.center, pageNum, totalPages, dateStr, timeStr);
        const textWidth = font.widthOfTextAtSize(text, headerFontSize);
        page.drawText(text, {
          x: width / 2 - textWidth / 2,
          y: headerY,
          size: headerFontSize,
          font,
          color: rgb(headerColor.r, headerColor.g, headerColor.b),
        });
      }
      
      // Right
      if (options.header.right) {
        const text = replaceDynamicVars(options.header.right, pageNum, totalPages, dateStr, timeStr);
        const textWidth = font.widthOfTextAtSize(text, headerFontSize);
        page.drawText(text, {
          x: width - margin - textWidth,
          y: headerY,
          size: headerFontSize,
          font,
          color: rgb(headerColor.r, headerColor.g, headerColor.b),
        });
      }
    }
    
    // Process Footer
    if (options.footer) {
      const footerFontSize = options.footer.fontSize ?? 10;
      const footerColor = options.footer.color ?? { r: 0, g: 0, b: 0 };
      const footerY = margin;
      
      // Left
      if (options.footer.left) {
        const text = replaceDynamicVars(options.footer.left, pageNum, totalPages, dateStr, timeStr);
        page.drawText(text, {
          x: margin,
          y: footerY,
          size: footerFontSize,
          font,
          color: rgb(footerColor.r, footerColor.g, footerColor.b),
        });
      }
      
      // Center
      if (options.footer.center) {
        const text = replaceDynamicVars(options.footer.center, pageNum, totalPages, dateStr, timeStr);
        const textWidth = font.widthOfTextAtSize(text, footerFontSize);
        page.drawText(text, {
          x: width / 2 - textWidth / 2,
          y: footerY,
          size: footerFontSize,
          font,
          color: rgb(footerColor.r, footerColor.g, footerColor.b),
        });
      }
      
      // Right
      if (options.footer.right) {
        const text = replaceDynamicVars(options.footer.right, pageNum, totalPages, dateStr, timeStr);
        const textWidth = font.widthOfTextAtSize(text, footerFontSize);
        page.drawText(text, {
          x: width - margin - textWidth,
          y: footerY,
          size: footerFontSize,
          font,
          color: rgb(footerColor.r, footerColor.g, footerColor.b),
        });
      }
    }
  });
  
  return await pdfDoc.save();
}

function replaceDynamicVars(
  text: string,
  pageNum: number,
  totalPages: number,
  date: string,
  time: string
): string {
  return text
    .replace(/{page}/g, pageNum.toString())
    .replace(/{total}/g, totalPages.toString())
    .replace(/{date}/g, date)
    .replace(/{time}/g, time);
}
