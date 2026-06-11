"use client";

import React, { useState } from 'react';
import { PdfUploader } from '@/components/pdf/PdfUploader';
import { PDFFile, formatSize, downloadFile } from '@/lib/pdf/core';
import { extractImages, ExtractImagesOptions } from '@/lib/pdf/extract-images';
import { Image as ImageIcon, Download, Loader2, ArrowLeft, Settings2 } from 'lucide-react';
import Link from 'next/link';
import { useToast } from '@/components/ui/use-toast';

export default function ExtractImagesPage() {
  const [file, setFile] = useState<PDFFile | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [options, setOptions] = useState<ExtractImagesOptions>({
    fromPage: 1,
    toPage: 1,
    format: 'png',
    quality: 85,
    minWidth: 100,
    minHeight: 100,
    downloadAsZip: true,
  });
  const { toast } = useToast();

  const handleFileSelected = async (files: File[]) => {
    if (files.length > 0) {
      const pdfFile = new PDFFile(files[0]);
      try {
        await pdfFile.load();
        setFile(pdfFile);
        setOptions(prev => ({ ...prev, toPage: pdfFile.totalPages }));
      } catch (error) {
        toast({
          title: "Error loading PDF",
          description: "Failed to read the PDF file.",
          variant: "destructive"
        });
      }
    }
  };

  const handleExtract = async () => {
    if (!file) return;

    setIsProcessing(true);
    setProgress(0);

    try {
      const result = await extractImages(file, options, (p) => setProgress(p));
      
      if (Array.isArray(result)) {
        // Download individually
        result.forEach(img => downloadFile(img.blob, img.filename));
      } else {
        // Download as ZIP
        downloadFile(result.blob, result.filename);
      }
      
      toast({
        title: "Extraction successful!",
        description: `Your images have been extracted.`,
      });
    } catch (error: any) {
      toast({
        title: "Extraction failed",
        description: error.message || "An unexpected error occurred.",
        variant: "destructive"
      });
    } finally {
      setIsProcessing(false);
      setProgress(0);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <Link href="/dashboard" className="inline-flex items-center text-sm font-medium text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100 mb-6">
        <ArrowLeft className="w-4 h-4 mr-1" />
        Back to Dashboard
      </Link>

      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2 flex items-center">
          <ImageIcon className="w-8 h-8 mr-3 text-pink-500" />
          Extract Images
        </h1>
        <p className="text-slate-600 dark:text-slate-400">
          Render PDF pages as high-quality images and download them individually or as a ZIP archive.
        </p>
      </div>

      {!file ? (
        <PdfUploader onFilesSelected={handleFileSelected} />
      ) : (
        <div className="space-y-6">
          <div className="bg-white dark:bg-slate-800 p-6 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="font-semibold text-slate-900 dark:text-white truncate max-w-xs sm:max-w-md">
                  {file.name}
                </h3>
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  {formatSize(file.size)} • {file.totalPages} pages
                </p>
              </div>
              <button
                onClick={() => setFile(null)}
                className="text-sm text-red-500 hover:text-red-600 font-medium px-3 py-1 bg-red-50 dark:bg-red-500/10 rounded-md"
                disabled={isProcessing}
              >
                Remove
              </button>
            </div>
          </div>

          <div className="bg-white dark:bg-slate-800 p-6 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm">
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4 flex items-center">
              <Settings2 className="w-5 h-5 mr-2" />
              Extraction Options
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="flex items-center gap-4">
                  <div className="flex-1">
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                      From Page
                    </label>
                    <input
                      type="number"
                      min={1}
                      max={file.totalPages}
                      value={options.fromPage}
                      onChange={(e) => setOptions({ ...options, fromPage: parseInt(e.target.value) || 1 })}
                      disabled={isProcessing}
                      className="w-full rounded-md border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                    />
                  </div>
                  <div className="flex-1">
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                      To Page
                    </label>
                    <input
                      type="number"
                      min={1}
                      max={file.totalPages}
                      value={options.toPage}
                      onChange={(e) => setOptions({ ...options, toPage: parseInt(e.target.value) || file.totalPages })}
                      disabled={isProcessing}
                      className="w-full rounded-md border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Image Format
                  </label>
                  <select
                    className="w-full rounded-md border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                    value={options.format}
                    onChange={(e) => setOptions({ ...options, format: e.target.value as any })}
                    disabled={isProcessing}
                  >
                    <option value="png">PNG (Lossless)</option>
                    <option value="jpeg">JPEG (Compressed)</option>
                    <option value="webp">WebP (Modern)</option>
                  </select>
                </div>

                {(options.format === 'jpeg' || options.format === 'webp') && (
                  <div>
                    <label className="flex justify-between text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                      <span>Quality</span>
                      <span>{options.quality}%</span>
                    </label>
                    <input
                      type="range"
                      min="1"
                      max="100"
                      value={options.quality}
                      onChange={(e) => setOptions({ ...options, quality: parseInt(e.target.value) })}
                      disabled={isProcessing}
                      className="w-full accent-primary-500"
                    />
                  </div>
                )}
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Minimum Dimensions (skip small icons)
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      min={0}
                      value={options.minWidth}
                      onChange={(e) => setOptions({ ...options, minWidth: parseInt(e.target.value) || 0 })}
                      disabled={isProcessing}
                      className="w-24 rounded-md border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                    />
                    <span className="text-slate-500">×</span>
                    <input
                      type="number"
                      min={0}
                      value={options.minHeight}
                      onChange={(e) => setOptions({ ...options, minHeight: parseInt(e.target.value) || 0 })}
                      disabled={isProcessing}
                      className="w-24 rounded-md border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                    />
                    <span className="text-slate-500 text-sm">px</span>
                  </div>
                </div>

                <div className="pt-2">
                  <label className="flex items-center space-x-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={options.downloadAsZip}
                      onChange={(e) => setOptions({ ...options, downloadAsZip: e.target.checked })}
                      disabled={isProcessing}
                      className="w-4 h-4 rounded text-primary-500 focus:ring-primary-500"
                    />
                    <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Download as ZIP archive</span>
                  </label>
                  <p className="text-xs text-slate-500 mt-1 ml-7">
                    Recommended for multiple pages to avoid browser download prompts.
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="flex justify-end">
            <button
              onClick={handleExtract}
              disabled={isProcessing}
              className={`inline-flex items-center justify-center px-6 py-3 rounded-lg font-medium text-white transition-colors
                ${isProcessing ? 'bg-primary-400 cursor-not-allowed' : 'bg-primary-600 hover:bg-primary-700'}`}
            >
              {isProcessing ? (
                <>
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                  Extracting... {Math.round(progress)}%
                </>
              ) : (
                <>
                  <Download className="w-5 h-5 mr-2" />
                  Extract Images
                </>
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
