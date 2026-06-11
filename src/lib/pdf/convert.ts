import { PDFFile } from './core';

export interface ConvertOptions {
  format: 'markdown' | 'text' | 'html' | 'json';
  fromPage: number;
  toPage: number;
  detectHeadings: boolean;
  pageBreaks: boolean;
  cleanSpaces: boolean;
  preserveTables: boolean;
  includeMetadata: boolean;
}

export const convertPdf = async (
  pdfFile: PDFFile,
  options: ConvertOptions,
  onProgress?: (progress: number) => void
): Promise<{ blob: Blob; filename: string }> => {
  if (!pdfFile.loaded) {
    await pdfFile.load();
  }

  const {
    format,
    fromPage,
    toPage,
    detectHeadings,
    pageBreaks,
    cleanSpaces,
    includeMetadata,
  } = options;

  const validFrom = Math.max(1, fromPage);
  const validTo = Math.min(pdfFile.totalPages, toPage);

  let content = '';

  // Add metadata header
  if (includeMetadata) {
    content += generateMetadataHeader(pdfFile);
  }

  // Extract text from pages
  for (let i = validFrom; i <= validTo; i++) {
    if (onProgress) {
      onProgress(((i - validFrom + 1) / (validTo - validFrom + 1)) * 100);
    }

    const page = await pdfFile.getPage(i);
    const textContent = await page.getTextContent();
    let pageText = textContent.items.map((item: any) => item.str).join(' ');

    // Clean text
    if (cleanSpaces) {
      pageText = pageText.replace(/\s+/g, ' ').trim();
      pageText = pageText.replace(/\n{3,}/g, '\n\n');
    }

    // Detect headings
    if (detectHeadings && format === 'markdown') {
      pageText = detectAndFormatHeadings(pageText);
    }

    // Add page break
    if (pageBreaks) {
      content += `\n\n---\n*Page ${i}*\n\n`;
    }

    content += pageText + '\n';
  }

  // Format according to output type
  let finalContent: string = '';
  let extension: string = '';
  let mimeType: string = '';

  switch (format) {
    case 'markdown':
      finalContent = content;
      extension = 'md';
      mimeType = 'text/markdown';
      break;

    case 'text':
      finalContent = content.replace(/[#*_\[\]]/g, '');
      extension = 'txt';
      mimeType = 'text/plain';
      break;

    case 'html':
      finalContent = convertToHTML(content, pdfFile);
      extension = 'html';
      mimeType = 'text/html';
      break;

    case 'json':
      finalContent = JSON.stringify(
        {
          metadata: pdfFile.metadata,
          pages: validTo - validFrom + 1,
          content: content,
        },
        null,
        2
      );
      extension = 'json';
      mimeType = 'application/json';
      break;
  }

  const blob = new Blob([finalContent], { type: mimeType });
  const filename = `${pdfFile.name.replace('.pdf', '')}_pages${validFrom}-${validTo}.${extension}`;

  return { blob, filename };
};

function generateMetadataHeader(file: PDFFile): string {
  return (
    `# ${file.metadata.title || file.name}\n\n` +
    `> **Author:** ${file.metadata.author || 'Unknown'}  \n` +
    `> **Pages:** ${file.totalPages}  \n` +
    `> **Source:** ${file.name}  \n` +
    `> **Extracted:** ${new Date().toLocaleString()}  \n\n` +
    `---\n\n`
  );
}

function detectAndFormatHeadings(text: string): string {
  const lines = text.split('\n');
  return lines
    .map((line) => {
      const trimmed = line.trim();
      if (
        trimmed.length > 5 &&
        trimmed.length < 100 &&
        trimmed === trimmed.toUpperCase() &&
        !/\d{3,}/.test(trimmed)
      ) {
        return `## ${trimmed}`;
      }
      return line;
    })
    .join('\n');
}

function convertToHTML(content: string, file: PDFFile): string {
  const lines = content.split('\n');
  let html = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${file.metadata.title || file.name}</title>
    <style>
        body { font-family: Arial, sans-serif; max-width: 800px; margin: 40px auto; padding: 20px; line-height: 1.6; }
        h1, h2, h3 { color: #333; }
        hr { border: none; border-top: 2px solid #eee; margin: 30px 0; }
        .metadata { background: #f5f5f5; padding: 15px; border-radius: 8px; margin-bottom: 30px; }
        .page-break { color: #999; font-style: italic; margin: 20px 0; }
    </style>
</head>
<body>
    <div class="metadata">
        <h1>${file.metadata.title || file.name}</h1>
        <p><strong>Author:</strong> ${file.metadata.author || 'Unknown'}</p>
        <p><strong>Pages:</strong> ${file.totalPages}</p>
    </div>
`;

  lines.forEach((line) => {
    if (line.startsWith('---')) {
      html += '<hr>\n';
    } else if (line.startsWith('*Page ')) {
      html += `<p class="page-break">${line}</p>\n`;
    } else if (line.startsWith('## ')) {
      html += `<h2>${line.substring(3)}</h2>\n`;
    } else if (line.trim()) {
      html += `<p>${line}</p>\n`;
    }
  });

  html += '</body></html>';
  return html;
}
