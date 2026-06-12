import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';

export interface PageNumberOptions {
  position?: 'top-left' | 'top-center' | 'top-right' | 'bottom-left' | 'bottom-center' | 'bottom-right';
  format?: 'number' | 'page-of-total' | 'roman' | 'letter';
  prefix?: string;
  suffix?: string;
  startNumber?: number;
  fontSize?: number;
  color?: { r: number; g: number; b: number };
  margin?: number;
  excludePages?: number[];
}

export async function addPageNumbers(
  pdfBytes: Uint8Array,
  options: PageNumberOptions = {}
): Promise<Uint8Array> {
  const pdfDoc = await PDFDocument.load(pdfBytes);
  const pages = pdfDoc.getPages();
  const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
  
  const position = options.position ?? 'bottom-center';
  const fontSize = options.fontSize ?? 12;
  const color = options.color ?? { r: 0, g: 0, b: 0 };
  const margin = options.margin ?? 30;
  const startNumber = options.startNumber ?? 1;
  const prefix = options.prefix ?? '';
  const suffix = options.suffix ?? '';
  const excludePages = options.excludePages ?? [];
  
  const totalPages = pages.length;
  
  pages.forEach((page, index) => {
    const pageNum = index + 1;
    
    // Skip excluded pages
    if (excludePages.includes(pageNum)) {
      return;
    }
    
    const { width, height } = page.getSize();
    const currentNumber = startNumber + index;
    
    // Format page number
    let pageText = '';
    switch (options.format) {
      case 'roman':
        pageText = toRoman(currentNumber);
        break;
      case 'letter':
        pageText = toLetter(currentNumber);
        break;
      case 'page-of-total':
        pageText = `Page ${currentNumber} of ${totalPages}`;
        break;
      default:
        pageText = currentNumber.toString();
    }
    
    pageText = `${prefix}${pageText}${suffix}`;
    
    const textWidth = font.widthOfTextAtSize(pageText, fontSize);
    const textHeight = font.heightAtSize(fontSize);
    
    // Calculate position
    let x = 0;
    let y = 0;
    
    switch (position) {
      case 'top-left':
        x = margin;
        y = height - margin - textHeight;
        break;
      case 'top-center':
        x = width / 2 - textWidth / 2;
        y = height - margin - textHeight;
        break;
      case 'top-right':
        x = width - margin - textWidth;
        y = height - margin - textHeight;
        break;
      case 'bottom-left':
        x = margin;
        y = margin;
        break;
      case 'bottom-center':
        x = width / 2 - textWidth / 2;
        y = margin;
        break;
      case 'bottom-right':
        x = width - margin - textWidth;
        y = margin;
        break;
    }
    
    page.drawText(pageText, {
      x,
      y,
      size: fontSize,
      font,
      color: rgb(color.r, color.g, color.b),
    });
  });
  
  return await pdfDoc.save();
}

function toRoman(num: number): string {
  const romanNumerals: [number, string][] = [
    [1000, 'M'], [900, 'CM'], [500, 'D'], [400, 'CD'],
    [100, 'C'], [90, 'XC'], [50, 'L'], [40, 'XL'],
    [10, 'X'], [9, 'IX'], [5, 'V'], [4, 'IV'], [1, 'I']
  ];
  
  let result = '';
  for (const [value, numeral] of romanNumerals) {
    while (num >= value) {
      result += numeral;
      num -= value;
    }
  }
  return result;
}

function toLetter(num: number): string {
  let result = '';
  while (num > 0) {
    num--;
    result = String.fromCharCode(65 + (num % 26)) + result;
    num = Math.floor(num / 26);
  }
  return result;
}
