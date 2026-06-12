import { PDFDocument, rgb, degrees, StandardFonts } from 'pdf-lib';

export interface WatermarkOptions {
  text?: string;
  imageBytes?: Uint8Array;
  imageType?: 'png' | 'jpg';
  opacity?: number;
  rotation?: number;
  fontSize?: number;
  color?: { r: number; g: number; b: number };
  position?: 'center' | 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right' | 'diagonal';
  xOffset?: number;
  yOffset?: number;
}

export async function addWatermark(
  pdfBytes: Uint8Array,
  options: WatermarkOptions
): Promise<Uint8Array> {
  const pdfDoc = await PDFDocument.load(pdfBytes);
  const pages = pdfDoc.getPages();
  
  const opacity = options.opacity ?? 0.3;
  const rotation = options.rotation ?? 0;
  
  for (const page of pages) {
    const { width, height } = page.getSize();
    
    if (options.text) {
      // Text watermark
      const font = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
      const fontSize = options.fontSize ?? 48;
      const textWidth = font.widthOfTextAtSize(options.text, fontSize);
      const textHeight = fontSize;
      
      const color = options.color ?? { r: 0.5, g: 0.5, b: 0.5 };
      
      let x = width / 2 - textWidth / 2;
      let y = height / 2 - textHeight / 2;
      
      // Position calculations
      switch (options.position) {
        case 'top-left':
          x = 50;
          y = height - 50;
          break;
        case 'top-right':
          x = width - textWidth - 50;
          y = height - 50;
          break;
        case 'bottom-left':
          x = 50;
          y = 50;
          break;
        case 'bottom-right':
          x = width - textWidth - 50;
          y = 50;
          break;
        case 'diagonal':
          x = width / 2 - textWidth / 2;
          y = height / 2 - textHeight / 2;
          break;
      }
      
      x += options.xOffset ?? 0;
      y += options.yOffset ?? 0;
      
      page.drawText(options.text, {
        x,
        y,
        size: fontSize,
        font,
        color: rgb(color.r, color.g, color.b),
        opacity,
        rotate: degrees(rotation),
      });
    } else if (options.imageBytes) {
      // Image watermark
      let image;
      if (options.imageType === 'png') {
        image = await pdfDoc.embedPng(options.imageBytes);
      } else {
        image = await pdfDoc.embedJpg(options.imageBytes);
      }
      
      const imageWidth = image.width;
      const imageHeight = image.height;
      const scale = Math.min((width * 0.3) / imageWidth, (height * 0.3) / imageHeight);
      
      let x = width / 2 - (imageWidth * scale) / 2;
      let y = height / 2 - (imageHeight * scale) / 2;
      
      switch (options.position) {
        case 'top-left':
          x = 50;
          y = height - (imageHeight * scale) - 50;
          break;
        case 'top-right':
          x = width - (imageWidth * scale) - 50;
          y = height - (imageHeight * scale) - 50;
          break;
        case 'bottom-left':
          x = 50;
          y = 50;
          break;
        case 'bottom-right':
          x = width - (imageWidth * scale) - 50;
          y = 50;
          break;
      }
      
      x += options.xOffset ?? 0;
      y += options.yOffset ?? 0;
      
      page.drawImage(image, {
        x,
        y,
        width: imageWidth * scale,
        height: imageHeight * scale,
        opacity,
        rotate: degrees(rotation),
      });
    }
  }
  
  return await pdfDoc.save();
}
