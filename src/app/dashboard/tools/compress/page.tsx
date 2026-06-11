"use client";

import React, { useState, useEffect } from 'react';
import { PdfUploader } from '@/components/pdf/PdfUploader';
import { PDFFile, formatSize, downloadFile } from '@/lib/pdf/core';
import { compressPdf, CompressOptions } from '@/lib/pdf/compress';
import { Package, Download, Loader2, ArrowLeft, Settings2 } from 'lucide-react';
import Link from 'next/link';
import { useToast } from '@/components/ui/use-toast';
import { useSharedFile } from '@/context/FileContext';

export default function CompressPage() {
  const [file, setFile] = useState<PDFFile | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [options, setOptions] = useState<CompressOptions>({
    level: 'medium',
    removeMetadata: false,
  });
  const [resultStats, setResultStats] = useState<{ size: number; reduction: string } | null>(null);
  const { toast } = useToast();
  const { sharedFile, setSharedFile } = useSharedFile();

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    if (sharedFile) {
      handleFileSelected([sharedFile]);
      setSharedFile(null); // Clear after loading
    }
  }, [sharedFile]);

  const handleFileSelected = async (files: File[]) => {
    if (files.length > 0) {
      const pdfFile = new PDFFile(files[0]);
      try {
        await pdfFile.load();
        setFile(pdfFile);
        setResultStats(null);
      } catch (error) {
        toast({
          title: "Error loading PDF",
          description: "Failed to read the PDF file.",
          variant: "destructive"
        });
      }
    }
  };

  const handleCompress = async () => {
    if (!file) return;

    setIsProcessing(true);
    setProgress(0);
    setResultStats(null);

    try {
      const { blob, filename, reduction } = await compressPdf(file, options, (p) => setProgress(p));
      downloadFile(blob, filename);
      
      setResultStats({
        size: blob.size,
        reduction,
      });

      toast({
        title: "Compression successful!",
        description: `Reduced file size by ${reduction}%.`,
      });
    } catch (error: any) {
      toast({
        title: "Compression failed",
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
          <Package className="w-8 h-8 mr-3 text-indigo-500" />
          Compress PDF
        </h1>
        <p className="text-slate-600 dark:text-slate-400">
          Reduce the file size of your PDF documents by optimizing images and removing unnecessary data.
        </p>
      </div>

      {!file ? (
        <PdfUploader onFilesSelected={handleFileSelected} />
      ) : (
        <div className="space-y-6">
          <div className="bg-white dark:bg-slate-800 p-6 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
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
              className="text-sm text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 font-medium px-3 py-1.5 bg-slate-100 dark:bg-slate-700 rounded-md"
              disabled={isProcessing}
            >
              Change File
            </button>
          </div>

          <div className="bg-white dark:bg-slate-800 p-6 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm">
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4 flex items-center">
              <Settings2 className="w-5 h-5 mr-2" />
              Compression Level
            </h3>
            
            <div className="grid gap-4 md:grid-cols-3 mb-6">
              <label className={`relative flex flex-col p-4 cursor-pointer rounded-xl border-2 transition-all ${
                options.level === 'low' 
                  ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20' 
                  : 'border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600'
              }`}>
                <input
                  type="radio"
                  name="compression"
                  value="low"
                  className="sr-only"
                  checked={options.level === 'low'}
                  onChange={() => setOptions({ ...options, level: 'low' })}
                  disabled={isProcessing}
                />
                <span className="font-semibold text-slate-900 dark:text-white mb-1">Low</span>
                <span className="text-xs text-slate-500 dark:text-slate-400">
                  Better quality, larger size (~10-20% reduction)
                </span>
              </label>

              <label className={`relative flex flex-col p-4 cursor-pointer rounded-xl border-2 transition-all ${
                options.level === 'medium' 
                  ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20' 
                  : 'border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600'
              }`}>
                <input
                  type="radio"
                  name="compression"
                  value="medium"
                  className="sr-only"
                  checked={options.level === 'medium'}
                  onChange={() => setOptions({ ...options, level: 'medium' })}
                  disabled={isProcessing}
                />
                <span className="font-semibold text-slate-900 dark:text-white mb-1">Medium</span>
                <span className="text-xs text-slate-500 dark:text-slate-400">
                  Balanced quality and size (~30-50% reduction)
                </span>
              </label>

              <label className={`relative flex flex-col p-4 cursor-pointer rounded-xl border-2 transition-all ${
                options.level === 'high' 
                  ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20' 
                  : 'border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600'
              }`}>
                <input
                  type="radio"
                  name="compression"
                  value="high"
                  className="sr-only"
                  checked={options.level === 'high'}
                  onChange={() => setOptions({ ...options, level: 'high' })}
                  disabled={isProcessing}
                />
                <span className="font-semibold text-slate-900 dark:text-white mb-1">High</span>
                <span className="text-xs text-slate-500 dark:text-slate-400">
                  Smaller size, lower quality (~50-70% reduction)
                </span>
              </label>
            </div>

            <div className="pt-4 border-t border-slate-100 dark:border-slate-700">
              <label className="flex items-center space-x-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={options.removeMetadata}
                  onChange={(e) => setOptions({ ...options, removeMetadata: e.target.checked })}
                  disabled={isProcessing}
                  className="w-4 h-4 rounded text-indigo-500 focus:ring-indigo-500"
                />
                <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
                  Remove metadata to further reduce size
                </span>
              </label>
            </div>
            
            <div className="mt-4 p-4 bg-yellow-50 dark:bg-yellow-900/20 text-yellow-800 dark:text-yellow-200 text-sm rounded-lg border border-yellow-100 dark:border-yellow-800/30">
              <strong>Note:</strong> Client-side compression works by re-rendering pages as images. 
              This converts text to images, which may reduce clarity and remove text searchability.
            </div>
          </div>

          {resultStats && (
            <div className="bg-green-50 dark:bg-green-900/20 p-6 rounded-xl border border-green-200 dark:border-green-800/50 flex flex-col sm:flex-row justify-between items-center animate-in fade-in slide-in-from-bottom-4">
              <div className="mb-4 sm:mb-0">
                <h4 className="font-semibold text-green-800 dark:text-green-300 mb-1">Compression Complete</h4>
                <div className="flex gap-4 text-sm text-green-700 dark:text-green-400">
                  <span>Original: {formatSize(file.size)}</span>
                  <span>→</span>
                  <span className="font-bold">Compressed: {formatSize(resultStats.size)}</span>
                </div>
              </div>
              <div className="text-center sm:text-right">
                <div className="text-2xl font-bold text-green-600 dark:text-green-400">-{resultStats.reduction}%</div>
                <div className="text-xs text-green-600/70 dark:text-green-400/70 uppercase font-semibold tracking-wider">Size Reduction</div>
              </div>
            </div>
          )}

          <div className="flex justify-end">
            <button
              onClick={handleCompress}
              disabled={isProcessing}
              className={`inline-flex items-center justify-center px-6 py-3 rounded-lg font-medium text-white transition-colors
                ${isProcessing ? 'bg-indigo-400 cursor-not-allowed' : 'bg-indigo-600 hover:bg-indigo-700'}`}
            >
              {isProcessing ? (
                <>
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                  Compressing... {Math.round(progress)}%
                </>
              ) : (
                <>
                  <Download className="w-5 h-5 mr-2" />
                  Compress PDF
                </>
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
