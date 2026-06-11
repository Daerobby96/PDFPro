"use client";

import React, { useEffect, useRef, useState } from 'react';
import { PDFFile } from '@/lib/pdf/core';

interface PdfThumbnailProps {
  file: PDFFile;
  pageNumber: number;
  rotation?: number;
  scale?: number;
  className?: string;
  onClick?: () => void;
}

export const PdfThumbnail: React.FC<PdfThumbnailProps> = ({
  file,
  pageNumber,
  rotation = 0,
  scale = 0.3,
  className = '',
  onClick
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isRendering, setIsRendering] = useState(false);

  useEffect(() => {
    let active = true;

    const renderPage = async () => {
      if (!canvasRef.current || !file.pdfDoc) return;
      setIsRendering(true);

      try {
        const page = await file.getPage(pageNumber);
        const viewport = page.getViewport({ scale });
        
        const canvas = canvasRef.current;
        const context = canvas.getContext('2d');
        
        if (!context) return;

        canvas.height = viewport.height;
        canvas.width = viewport.width;

        const renderContext = {
          canvasContext: context,
          viewport: viewport,
        };

        if (active) {
          await page.render(renderContext).promise;
        }
      } catch (error) {
        console.error(`Error rendering thumbnail for page ${pageNumber}`, error);
      } finally {
        if (active) setIsRendering(false);
      }
    };

    renderPage();

    return () => {
      active = false;
    };
  }, [file, pageNumber, scale]);

  return (
    <div 
      className={`relative inline-block ${onClick ? 'cursor-pointer' : ''} ${className}`}
      onClick={onClick}
    >
      <canvas
        ref={canvasRef}
        style={{
          transform: `rotate(${rotation}deg)`,
          transition: 'transform 0.3s ease',
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
          backgroundColor: 'white',
        }}
        className="max-w-full h-auto rounded"
      />
      {isRendering && (
        <div className="absolute inset-0 flex items-center justify-center bg-slate-100/50 rounded">
          <div className="w-4 h-4 border-2 border-primary-500 border-t-transparent rounded-full animate-spin"></div>
        </div>
      )}
    </div>
  );
};
