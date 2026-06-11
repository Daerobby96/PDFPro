"use client";

import React, { useState, useEffect } from 'react';
import { PdfUploader } from '@/components/pdf/PdfUploader';
import { PDFFile, formatSize, downloadFile } from '@/lib/pdf/core';
import { convertPdf, ConvertOptions } from '@/lib/pdf/convert';
import { FileText, Download, Loader2, ArrowLeft, Settings2 } from 'lucide-react';
import Link from 'next/link';
import { useToast } from '@/components/ui/use-toast';
import { useSharedFile } from '@/context/FileContext';

export default function ConvertPage() {
  const [file, setFile] = useState<PDFFile | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [options, setOptions] = useState<ConvertOptions>({
    format: 'markdown',
    fromPage: 1,
    toPage: 1,
    detectHeadings: true,
    pageBreaks: true,
    cleanSpaces: true,
    preserveTables: false,
    includeMetadata: true,
  });
  const { toast } = useToast();
  const { sharedFile, setSharedFile } = useSharedFile();

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

  const handleConvert = async () => {
    if (!file) return;

    setIsProcessing(true);
    setProgress(0);

    try {
      const { blob, filename } = await convertPdf(file, options, (p) => setProgress(p));
      downloadFile(blob, filename);
      
      toast({
        title: "Conversion successful!",
        description: `Your file has been converted to ${options.format.toUpperCase()}.`,
      });
    } catch (error: any) {
      toast({
        title: "Conversion failed",
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
          <FileText className="w-8 h-8 mr-3 text-green-500" />
          Convert PDF
        </h1>
        <p className="text-slate-600 dark:text-slate-400">
          Extract text from your PDF and convert it to Markdown, Text, HTML, or JSON.
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
              Conversion Options
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Output Format
                  </label>
                  <select
                    className="w-full rounded-md border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                    value={options.format}
                    onChange={(e) => setOptions({ ...options, format: e.target.value as any })}
                    disabled={isProcessing}
                  >
                    <option value="markdown">Markdown (.md)</option>
                    <option value="text">Plain Text (.txt)</option>
                    <option value="html">HTML (.html)</option>
                    <option value="json">JSON (.json)</option>
                  </select>
                </div>

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
              </div>

              <div className="space-y-3 bg-slate-50 dark:bg-slate-900/50 p-4 rounded-lg border border-slate-100 dark:border-slate-700/50">
                <label className="flex items-center space-x-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={options.detectHeadings}
                    onChange={(e) => setOptions({ ...options, detectHeadings: e.target.checked })}
                    disabled={isProcessing || options.format !== 'markdown'}
                    className="w-4 h-4 rounded text-primary-500 focus:ring-primary-500"
                  />
                  <span className="text-sm text-slate-700 dark:text-slate-300">Auto-detect headings (Markdown only)</span>
                </label>
                <label className="flex items-center space-x-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={options.pageBreaks}
                    onChange={(e) => setOptions({ ...options, pageBreaks: e.target.checked })}
                    disabled={isProcessing}
                    className="w-4 h-4 rounded text-primary-500 focus:ring-primary-500"
                  />
                  <span className="text-sm text-slate-700 dark:text-slate-300">Add page break markers</span>
                </label>
                <label className="flex items-center space-x-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={options.cleanSpaces}
                    onChange={(e) => setOptions({ ...options, cleanSpaces: e.target.checked })}
                    disabled={isProcessing}
                    className="w-4 h-4 rounded text-primary-500 focus:ring-primary-500"
                  />
                  <span className="text-sm text-slate-700 dark:text-slate-300">Clean extra whitespace</span>
                </label>
                <label className="flex items-center space-x-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={options.includeMetadata}
                    onChange={(e) => setOptions({ ...options, includeMetadata: e.target.checked })}
                    disabled={isProcessing}
                    className="w-4 h-4 rounded text-primary-500 focus:ring-primary-500"
                  />
                  <span className="text-sm text-slate-700 dark:text-slate-300">Include document metadata</span>
                </label>
              </div>
            </div>
          </div>

          <div className="flex justify-end">
            <button
              onClick={handleConvert}
              disabled={isProcessing}
              className={`inline-flex items-center justify-center px-6 py-3 rounded-lg font-medium text-white transition-colors
                ${isProcessing ? 'bg-primary-400 cursor-not-allowed' : 'bg-primary-600 hover:bg-primary-700'}`}
            >
              {isProcessing ? (
                <>
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                  Converting... {Math.round(progress)}%
                </>
              ) : (
                <>
                  <Download className="w-5 h-5 mr-2" />
                  Convert to {options.format.toUpperCase()}
                </>
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
