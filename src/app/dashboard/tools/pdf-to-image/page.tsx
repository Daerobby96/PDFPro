"use client";

import React, { useState, useEffect } from 'react';
import { PdfUploader } from '@/components/pdf/PdfUploader';
import { PDFFile, formatSize, downloadFile } from '@/lib/pdf/core';
import { renderPageToImage, PdfToImageOptions } from '@/lib/pdf/pdf-to-image';
import { PdfThumbnail } from '@/components/pdf/PdfThumbnail';
import { 
  Image as ImageIcon, 
  Download, 
  Loader2, 
  ArrowLeft, 
  Settings2, 
  CheckCircle,
  Eye
} from 'lucide-react';
import Link from 'next/link';
import { useToast } from '@/components/ui/use-toast';
import { useSharedFile } from '@/context/FileContext';
import { createClient } from '@/lib/supabase/client';

export default function PdfToImagePage() {
  const [file, setFile] = useState<PDFFile | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [options, setOptions] = useState<PdfToImageOptions>({
    format: 'png',
    scale: 1.5,
  });
  
  const [previews, setPreviews] = useState<string[]>([]);
  const { toast } = useToast();
  const { sharedFile, setSharedFile } = useSharedFile();
  const supabase = createClient();

  useEffect(() => {
    if (sharedFile) {
      handleFileSelected([sharedFile]);
      setSharedFile(null); // Clear after loading
    }
  }, [sharedFile]);

  const handleFileSelected = async (files: File[]) => {
    if (files.length === 0) return;
    try {
      const newFile = new PDFFile(files[0]);
      await newFile.load();
      setFile(newFile);
      setPreviews([]);
    } catch (err: any) {
      toast({
        title: "Error loading PDF",
        description: err.message || "Failed to read the PDF file.",
        variant: "destructive"
      });
    }
  };

  const handleDownloadPage = async (pageNum: number) => {
    if (!file) return;
    try {
      const { blob, filename } = await renderPageToImage(file, pageNum, options);
      downloadFile(blob, filename);
      toast({
        title: `Page ${pageNum} converted!`,
        description: `Successfully downloaded page ${pageNum} as ${options.format.toUpperCase()}.`,
      });
    } catch (err: any) {
      toast({
        title: "Conversion failed",
        description: err.message || "Failed to convert page.",
        variant: "destructive"
      });
    }
  };

  const handleConvertAll = async () => {
    if (!file) return;
    setIsProcessing(true);
    setProgress(0);
    const startTime = Date.now();
    
    try {
      const total = file.totalPages;
      for (let i = 1; i <= total; i++) {
        setProgress(Math.round((i / total) * 100));
        const { blob, filename } = await renderPageToImage(file, i, options);
        downloadFile(blob, filename);
        // Small delay to let browser handle multiple downloads
        await new Promise(r => setTimeout(r, 350));
      }

      toast({
        title: "All pages converted!",
        description: `Successfully downloaded ${total} pages.`,
      });

      // Track conversion history in supabase
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        await supabase.from('pdf_history').insert({
          user_id: session.user.id,
          tool_used: 'PDF to Image',
          file_name: file.name,
          file_size: file.size,
          pages_count: file.totalPages,
          processing_time: Date.now() - startTime,
          success: true
        });
      }

    } catch (err: any) {
      toast({
        title: "Failed to convert all pages",
        description: err.message || "Failed during batch conversion.",
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
          <ImageIcon className="w-8 h-8 mr-3 text-blue-500" />
          PDF to Image
        </h1>
        <p className="text-slate-600 dark:text-slate-400">
          Render and convert your PDF document pages into high-quality JPG or PNG images.
        </p>
      </div>

      {!file ? (
        <div className="bg-white dark:bg-slate-800 p-6 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm">
          <h2 className="text-lg font-semibold mb-6 text-center text-slate-800 dark:text-slate-100">
            Upload a PDF to Convert
          </h2>
          <PdfUploader onFilesSelected={handleFileSelected} />
        </div>
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
              className="text-sm text-red-500 hover:text-red-600 font-medium px-3 py-1 bg-red-50 dark:bg-red-500/10 rounded-md"
              disabled={isProcessing}
            >
              Change File
            </button>
          </div>

          <div className="bg-white dark:bg-slate-800 p-6 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm">
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4 flex items-center">
              <Settings2 className="w-5 h-5 mr-2" />
              Conversion Options
            </h3>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Image Format
                </label>
                <select
                  className="w-full rounded-md border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 px-3 py-2 text-sm focus:outline-none"
                  value={options.format}
                  onChange={(e) => setOptions({ ...options, format: e.target.value as any })}
                  disabled={isProcessing}
                >
                  <option value="png">PNG (Lossless, transparent bg)</option>
                  <option value="jpeg">JPEG (Compressed, white bg)</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Resolution / Quality
                </label>
                <select
                  className="w-full rounded-md border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 px-3 py-2 text-sm focus:outline-none"
                  value={options.scale}
                  onChange={(e) => setOptions({ ...options, scale: Number(e.target.value) })}
                  disabled={isProcessing}
                >
                  <option value={1}>1.0x (Standard Web Quality)</option>
                  <option value={1.5}>1.5x (Medium Quality)</option>
                  <option value={2}>2.0x (High Quality / DPI)</option>
                </select>
              </div>
            </div>

            <div className="mt-8 pt-6 border-t border-slate-200 dark:border-slate-700 flex justify-end">
              <button 
                onClick={handleConvertAll}
                disabled={isProcessing}
                className={`inline-flex items-center justify-center px-6 py-3 rounded-lg font-medium text-white transition-colors
                  ${isProcessing ? 'bg-blue-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'}`}
              >
                {isProcessing ? (
                  <>
                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                    Converting... {Math.round(progress)}%
                  </>
                ) : (
                  <>
                    <Download className="w-5 h-5 mr-2" />
                    Convert & Download All Pages
                  </>
                )}
              </button>
            </div>
          </div>

          <div className="bg-slate-50 dark:bg-slate-900/50 p-6 rounded-xl border border-slate-200 dark:border-slate-700">
            <h4 className="text-base font-semibold text-slate-950 dark:text-white mb-4">
              Select Pages to Download Individually
            </h4>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-6">
              {Array.from({ length: file.totalPages }, (_, idx) => idx + 1).map((pageNum) => (
                <div 
                  key={pageNum} 
                  className="bg-white dark:bg-slate-800 p-3 rounded-lg border border-slate-250 dark:border-slate-700 shadow-sm flex flex-col items-center justify-between"
                >
                  <div className="w-full flex justify-center py-4 bg-slate-50 dark:bg-slate-900/30 rounded border border-slate-100 dark:border-slate-750 mb-3 overflow-hidden">
                    <PdfThumbnail 
                      file={file} 
                      pageNumber={pageNum} 
                      scale={0.4} 
                      className="pointer-events-none"
                    />
                  </div>

                  <span className="text-xs font-semibold text-slate-500 bg-slate-100 dark:bg-slate-700 px-2.5 py-1 rounded-full mb-3">
                    Page {pageNum}
                  </span>

                  <button
                    onClick={() => handleDownloadPage(pageNum)}
                    disabled={isProcessing}
                    className="w-full inline-flex items-center justify-center px-3 py-2 bg-slate-105 hover:bg-slate-200 dark:bg-slate-700 dark:hover:bg-slate-650 text-slate-800 dark:text-white rounded-md text-xs font-medium transition-colors"
                  >
                    <Download className="w-3.5 h-3.5 mr-1.5" />
                    Download Image
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
