"use client";

import React, { useState, useEffect } from 'react';
import { PdfUploader } from '@/components/pdf/PdfUploader';
import { PDFFile, formatSize, downloadFile } from '@/lib/pdf/core';
import { executeSplit, SplitJob, generatePageRange } from '@/lib/pdf/split';
import { Scissors, Download, Loader2, ArrowLeft, Trash2 } from 'lucide-react';
import Link from 'next/link';
import { useToast } from '@/components/ui/use-toast';
import { useSharedFile } from '@/context/FileContext';

export default function SplitPdfPage() {
  const [file, setFile] = useState<PDFFile | null>(null);
  const [jobs, setJobs] = useState<SplitJob[]>([]);
  const [fromPage, setFromPage] = useState<number | ''>('');
  const [toPage, setToPage] = useState<number | ''>('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [results, setResults] = useState<{ filename: string; blob: Blob }[]>([]);
  const { toast } = useToast();
  const { sharedFile, setSharedFile } = useSharedFile();

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    if (sharedFile) {
      handleFilesSelected([sharedFile]);
      setSharedFile(null); // Clear after loading
    }
  }, [sharedFile]);

  const handleFilesSelected = async (files: File[]) => {
    if (files.length === 0) return;
    try {
      const newFile = new PDFFile(files[0]);
      await newFile.load();
      setFile(newFile);
      setJobs([]);
      setResults([]);
    } catch (err: any) {
      toast({
        title: "Error loading PDF",
        description: err.message || "Failed to read the PDF file.",
        variant: "destructive"
      });
    }
  };

  const handleAddRange = () => {
    if (!file) return;
    const from = Number(fromPage);
    const to = Number(toPage);
    if (from < 1 || to > file.totalPages || from > to) {
      toast({
        title: "Invalid page range",
        description: `Please enter a range between 1 and ${file.totalPages}.`,
        variant: "destructive"
      });
      return;
    }
    setJobs([...jobs, { name: `pages_${from}-${to}`, pages: generatePageRange(from, to) }]);
    setFromPage('');
    setToPage('');
  };

  const handleRemoveJob = (index: number) => {
    setJobs(jobs.filter((_, i) => i !== index));
  };

  const handleSplit = async () => {
    if (!file) return;
    setIsProcessing(true);
    setProgress(0);
    setResults([]);

    try {
      if (jobs.length === 0) {
        toast({
          title: "No ranges defined",
          description: "Please add at least one page range to split.",
          variant: "destructive"
        });
        setIsProcessing(false);
        return;
      }

      const res = await executeSplit(file, jobs, (p) => setProgress(p));
      setResults(res);
      toast({
        title: "Split successful!",
        description: `Your PDF has been split into ${res.length} files.`,
      });
    } catch (err: any) {
      toast({
        title: "Split failed",
        description: err.message || "Failed to split PDF.",
        variant: "destructive"
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDownload = (blob: Blob, filename: string) => {
    downloadFile(blob, filename);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <Link href="/dashboard" className="inline-flex items-center text-sm font-medium text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100 mb-6">
        <ArrowLeft className="w-4 h-4 mr-1" />
        Back to Dashboard
      </Link>

      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2 flex items-center">
          <Scissors className="w-8 h-8 mr-3 text-purple-500" />
          Split PDF
        </h1>
        <p className="text-slate-600 dark:text-slate-400">
          Split a PDF file into multiple files by specifying page ranges.
        </p>
      </div>

      {!file ? (
        <div className="bg-white dark:bg-slate-800 p-6 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm">
          <h2 className="text-lg font-semibold mb-6 text-center text-slate-800 dark:text-slate-100">
            Upload a PDF to split
          </h2>
          <PdfUploader onFilesSelected={handleFilesSelected} />
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
            
            <div>
              <button 
                onClick={() => {
                  setFile(null);
                  setSharedFile(null);
                }}
                className="text-sm text-red-500 hover:text-red-600 font-medium px-3 py-1 bg-red-50 dark:bg-red-500/10 rounded-md"
                disabled={isProcessing}
              >
                Change File
              </button>
            </div>
          </div>

          <div className="bg-white dark:bg-slate-800 p-6 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm">
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">
              Add Page Ranges
            </h3>
            
            <div className="flex flex-wrap items-center gap-3 mb-6">
              <div className="flex items-center gap-2">
                <label className="text-sm font-medium text-slate-700 dark:text-slate-300">From</label>
                <input 
                  type="number" 
                  min="1" 
                  max={file.totalPages} 
                  value={fromPage} 
                  onChange={(e) => setFromPage(e.target.value === '' ? '' : Number(e.target.value))}
                  placeholder="1" 
                  disabled={isProcessing}
                  className="w-24 rounded-md border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>
              <div className="flex items-center gap-2">
                <label className="text-sm font-medium text-slate-700 dark:text-slate-300">To</label>
                <input 
                  type="number" 
                  min="1" 
                  max={file.totalPages} 
                  value={toPage} 
                  onChange={(e) => setToPage(e.target.value === '' ? '' : Number(e.target.value))}
                  placeholder={String(file.totalPages)} 
                  disabled={isProcessing}
                  className="w-24 rounded-md border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>
              <button 
                onClick={handleAddRange}
                disabled={isProcessing}
                className="px-4 py-2 bg-primary-100 text-primary-700 dark:bg-primary-900/30 dark:text-primary-400 rounded-lg hover:bg-primary-200 dark:hover:bg-primary-900/50 font-medium transition-colors text-sm"
              >
                Add Range
              </button>
            </div>

            {jobs.length > 0 && (
              <div className="space-y-2">
                <h4 className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Current Ranges:</h4>
                <div className="grid gap-2">
                  {jobs.map((job, index) => (
                    <div key={index} className="flex justify-between items-center bg-slate-50 dark:bg-slate-900/50 p-3 rounded-lg border border-slate-200 dark:border-slate-700">
                      <span className="text-slate-700 dark:text-slate-200 font-medium">{job.name}</span>
                      <button 
                        onClick={() => handleRemoveJob(index)}
                        disabled={isProcessing}
                        className="text-slate-400 hover:text-red-500 p-1 rounded-md hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                        title="Remove Range"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="mt-8 pt-6 border-t border-slate-200 dark:border-slate-700 flex justify-end">
              <button 
                onClick={handleSplit}
                disabled={isProcessing || jobs.length === 0}
                className={`inline-flex items-center justify-center px-6 py-3 rounded-lg font-medium text-white transition-colors
                  ${isProcessing || jobs.length === 0 ? 'bg-purple-400 cursor-not-allowed' : 'bg-purple-600 hover:bg-purple-700'}`}
              >
                {isProcessing ? (
                  <>
                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                    Splitting... {Math.round(progress)}%
                  </>
                ) : (
                  <>
                    <Scissors className="w-5 h-5 mr-2" />
                    Split PDF
                  </>
                )}
              </button>
            </div>
          </div>

          {results.length > 0 && (
            <div className="bg-white dark:bg-slate-800 p-6 rounded-xl border border-green-200 dark:border-green-800 shadow-sm animate-in slide-in-from-bottom-4 fade-in duration-300">
              <h3 className="font-semibold text-lg text-green-700 dark:text-green-400 mb-4 flex items-center gap-2">
                <Download className="w-5 h-5" />
                Ready to Download
              </h3>
              <div className="space-y-3">
                {results.map((res, index) => (
                  <div key={index} className="flex justify-between items-center bg-green-50 dark:bg-green-900/20 p-4 rounded-xl border border-green-100 dark:border-green-800/50">
                    <span className="text-slate-700 dark:text-slate-200 font-medium">{res.filename}</span>
                    <button 
                      onClick={() => handleDownload(res.blob, res.filename)}
                      className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition-colors text-sm"
                    >
                      Download
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
