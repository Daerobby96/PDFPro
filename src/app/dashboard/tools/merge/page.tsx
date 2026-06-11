"use client";

import React, { useState, useEffect } from 'react';
import { PdfUploader } from '@/components/pdf/PdfUploader';
import { PDFFile, formatSize, downloadFile } from '@/lib/pdf/core';
import { executeMerge } from '@/lib/pdf/merge';
import { Combine, Download, Loader2, GripVertical, Trash2, ArrowLeft, ArrowUp, ArrowDown } from 'lucide-react';
import Link from 'next/link';
import { useToast } from '@/components/ui/use-toast';
import { useSharedFile } from '@/context/FileContext';

export default function MergePdfPage() {
  const [files, setFiles] = useState<PDFFile[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [result, setResult] = useState<{ filename: string; blob: Blob } | null>(null);
  const { toast } = useToast();
  const { sharedFile, setSharedFile } = useSharedFile();

  useEffect(() => {
    if (sharedFile) {
      handleFilesSelected([sharedFile]);
      setSharedFile(null); // Clear after loading
    }
  }, [sharedFile]);

  const handleFilesSelected = async (selectedFiles: File[]) => {
    try {
      const newPdfFiles = [];
      for (const f of selectedFiles) {
        const pdfFile = new PDFFile(f);
        await pdfFile.load();
        newPdfFiles.push(pdfFile);
      }
      setFiles(prev => [...prev, ...newPdfFiles]);
      setResult(null);
    } catch (err: any) {
      toast({
        title: "Error loading PDF",
        description: err.message || "Failed to read the PDF file.",
        variant: "destructive"
      });
    }
  };

  const handleRemoveFile = (index: number) => {
    setFiles(prev => {
      const newFiles = [...prev];
      newFiles.splice(index, 1);
      return newFiles;
    });
  };

  const moveFile = (index: number, direction: 'up' | 'down') => {
    if (direction === 'up' && index === 0) return;
    if (direction === 'down' && index === files.length - 1) return;
    
    setFiles(prev => {
      const newFiles = [...prev];
      const temp = newFiles[index];
      const newIndex = direction === 'up' ? index - 1 : index + 1;
      newFiles[index] = newFiles[newIndex];
      newFiles[newIndex] = temp;
      return newFiles;
    });
  };

  const handleMerge = async () => {
    if (files.length < 2) return;
    setIsProcessing(true);
    setProgress(0);
    setResult(null);

    try {
      const res = await executeMerge(files, (p) => setProgress(p));
      setResult(res);
      toast({
        title: "Merge successful!",
        description: "Your PDF files have been combined.",
      });
    } catch (err: any) {
      toast({
        title: "Merge failed",
        description: err.message || "An unexpected error occurred.",
        variant: "destructive"
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDownload = () => {
    if (!result) return;
    downloadFile(result.blob, result.filename);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <Link href="/dashboard" className="inline-flex items-center text-sm font-medium text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100 mb-6">
        <ArrowLeft className="w-4 h-4 mr-1" />
        Back to Dashboard
      </Link>

      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2 flex items-center">
          <Combine className="w-8 h-8 mr-3 text-blue-500" />
          Merge PDF
        </h1>
        <p className="text-slate-600 dark:text-slate-400">
          Combine multiple PDF files into a single document in any order you choose.
        </p>
      </div>

      <div className="space-y-6">
        <div className="bg-white dark:bg-slate-800 p-6 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm">
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">Add Files</h3>
            <PdfUploader onFilesSelected={handleFilesSelected} multiple={true} />
          </div>

          {files.length > 0 && (
            <div className="mt-8">
              <h4 className="font-semibold text-slate-700 dark:text-slate-300 mb-4">Files to Merge ({files.length})</h4>
              <div className="space-y-2">
                {files.map((file, index) => (
                  <div key={file.id} className="flex items-center gap-4 bg-slate-50 dark:bg-slate-900/50 p-3 rounded-lg border border-slate-200 dark:border-slate-700">
                    <div className="flex flex-col text-slate-400">
                      <button 
                        onClick={() => moveFile(index, 'up')} 
                        disabled={index === 0 || isProcessing} 
                        className="hover:text-blue-500 disabled:opacity-30 p-0.5"
                        title="Move Up"
                      >
                        <ArrowUp className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={() => moveFile(index, 'down')} 
                        disabled={index === files.length - 1 || isProcessing} 
                        className="hover:text-blue-500 disabled:opacity-30 p-0.5"
                        title="Move Down"
                      >
                        <ArrowDown className="w-4 h-4" />
                      </button>
                    </div>
                    <GripVertical className="text-slate-400 w-5 h-5 hidden md:block" />
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-slate-800 dark:text-slate-200 truncate">{file.name}</p>
                      <p className="text-xs text-slate-500 dark:text-slate-400">{formatSize(file.size)} • {file.totalPages} pages</p>
                    </div>
                    <button 
                      onClick={() => handleRemoveFile(index)}
                      disabled={isProcessing}
                      className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                ))}
              </div>

              <div className="mt-8 pt-6 border-t border-slate-200 dark:border-slate-700 flex justify-end">
                <button 
                  onClick={handleMerge}
                  disabled={isProcessing || files.length < 2}
                  className={`inline-flex items-center justify-center px-6 py-3 rounded-lg font-medium text-white transition-colors
                    ${isProcessing || files.length < 2 ? 'bg-blue-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'}`}
                >
                  {isProcessing ? (
                    <>
                      <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                      Merging... {Math.round(progress)}%
                    </>
                  ) : (
                    <>
                      <Download className="w-5 h-5 mr-2" />
                      Merge {files.length} PDFs
                    </>
                  )}
                </button>
              </div>
            </div>
          )}
        </div>

        {result && (
          <div className="bg-white dark:bg-slate-800 p-6 rounded-xl border border-green-200 dark:border-green-800 shadow-sm animate-in slide-in-from-bottom-4 fade-in duration-300">
            <div className="flex flex-col md:flex-row justify-between items-center gap-4">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 rounded-full">
                  <Download className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-semibold text-lg text-slate-900 dark:text-white">Merge Complete!</h3>
                  <p className="text-sm text-slate-500 dark:text-slate-400">{result.filename}</p>
                </div>
              </div>
              <button 
                onClick={handleDownload}
                className="w-full md:w-auto px-6 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition-colors"
              >
                Download PDF
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
