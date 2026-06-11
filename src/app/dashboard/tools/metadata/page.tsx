"use client";

import React, { useState, useEffect } from 'react';
import { PdfUploader } from '@/components/pdf/PdfUploader';
import { PDFFile, formatSize, downloadFile } from '@/lib/pdf/core';
import { readMetadata, saveMetadata, MetadataOptions } from '@/lib/pdf/metadata';
import { FileText, Download, Loader2, ArrowLeft, Info } from 'lucide-react';
import Link from 'next/link';
import { useToast } from '@/components/ui/use-toast';

export default function MetadataPage() {
  const [file, setFile] = useState<PDFFile | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [metadata, setMetadata] = useState<MetadataOptions>({
    title: '',
    author: '',
    subject: '',
    keywords: '',
  });
  const { toast } = useToast();

  const handleFileSelected = async (files: File[]) => {
    if (files.length > 0) {
      const pdfFile = new PDFFile(files[0]);
      try {
        await pdfFile.load();
        setFile(pdfFile);
        setMetadata(readMetadata(pdfFile));
      } catch (error) {
        toast({
          title: "Error loading PDF",
          description: "Failed to read the PDF file.",
          variant: "destructive"
        });
      }
    }
  };

  const handleSave = async () => {
    if (!file) return;

    setIsProcessing(true);
    try {
      const { blob, filename } = await saveMetadata(file, metadata);
      downloadFile(blob, filename);

      toast({
        title: "Metadata saved!",
        description: "Your PDF with updated metadata has been downloaded.",
      });
    } catch (error: any) {
      toast({
        title: "Save failed",
        description: error.message || "An unexpected error occurred.",
        variant: "destructive"
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleExportJson = () => {
    if (!file) return;
    const data = {
      filename: file.name,
      size: file.size,
      pages: file.totalPages,
      ...metadata,
      exportDate: new Date().toISOString(),
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    downloadFile(blob, `${file.name.replace('.pdf', '')}_metadata.json`);
  };

  const InputField = ({
    label,
    id,
    value,
    placeholder,
    onChange,
    hint,
  }: {
    label: string;
    id: string;
    value: string;
    placeholder?: string;
    onChange: (val: string) => void;
    hint?: string;
  }) => (
    <div>
      <label htmlFor={id} className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
        {label}
      </label>
      <input
        id={id}
        type="text"
        value={value}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
        disabled={isProcessing}
        className="w-full rounded-md border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 px-3 py-2 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500 disabled:opacity-60"
      />
      {hint && <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">{hint}</p>}
    </div>
  );

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <Link href="/dashboard" className="inline-flex items-center text-sm font-medium text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100 mb-6">
        <ArrowLeft className="w-4 h-4 mr-1" />
        Back to Dashboard
      </Link>

      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2 flex items-center">
          <FileText className="w-8 h-8 mr-3 text-teal-500" />
          Edit Metadata
        </h1>
        <p className="text-slate-600 dark:text-slate-400">
          View and edit the metadata fields of your PDF document such as title, author, and keywords.
        </p>
      </div>

      {!file ? (
        <PdfUploader onFilesSelected={handleFileSelected} />
      ) : (
        <div className="space-y-6">
          {/* File Info */}
          <div className="bg-white dark:bg-slate-800 p-6 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="font-semibold text-slate-900 dark:text-white truncate max-w-xs sm:max-w-md">
                  {file.name}
                </h3>
                <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
                  {formatSize(file.size)} • {file.totalPages} pages
                </p>
              </div>
              <button
                onClick={() => setFile(null)}
                className="text-sm text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 font-medium px-3 py-1.5 bg-slate-100 dark:bg-slate-700 rounded-md shrink-0 ml-4"
                disabled={isProcessing}
              >
                Change File
              </button>
            </div>

            {/* Current metadata preview */}
            {(file.metadata.title || file.metadata.author || file.metadata.creator) && (
              <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-700">
                <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
                  <Info className="w-3.5 h-3.5" />
                  Original Metadata
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                  {file.metadata.title && (
                    <div>
                      <span className="text-slate-400 text-xs">Title</span>
                      <p className="text-slate-700 dark:text-slate-200 font-medium truncate">{file.metadata.title}</p>
                    </div>
                  )}
                  {file.metadata.author && (
                    <div>
                      <span className="text-slate-400 text-xs">Author</span>
                      <p className="text-slate-700 dark:text-slate-200 font-medium truncate">{file.metadata.author}</p>
                    </div>
                  )}
                  {file.metadata.creator && (
                    <div>
                      <span className="text-slate-400 text-xs">Creator</span>
                      <p className="text-slate-700 dark:text-slate-200 font-medium truncate">{file.metadata.creator}</p>
                    </div>
                  )}
                  {file.metadata.producer && (
                    <div>
                      <span className="text-slate-400 text-xs">Producer</span>
                      <p className="text-slate-700 dark:text-slate-200 font-medium truncate">{file.metadata.producer}</p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Edit Form */}
          <div className="bg-white dark:bg-slate-800 p-6 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm space-y-5">
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
              ✏️ Edit Fields
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <InputField
                label="Title"
                id="meta-title"
                value={metadata.title}
                placeholder="Document title..."
                onChange={(val) => setMetadata({ ...metadata, title: val })}
              />
              <InputField
                label="Author"
                id="meta-author"
                value={metadata.author}
                placeholder="Author name..."
                onChange={(val) => setMetadata({ ...metadata, author: val })}
              />
              <InputField
                label="Subject"
                id="meta-subject"
                value={metadata.subject}
                placeholder="Document subject..."
                onChange={(val) => setMetadata({ ...metadata, subject: val })}
              />
              <InputField
                label="Keywords"
                id="meta-keywords"
                value={metadata.keywords}
                placeholder="keyword1, keyword2, keyword3"
                onChange={(val) => setMetadata({ ...metadata, keywords: val })}
                hint="Separate keywords with commas"
              />
            </div>
          </div>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row justify-end gap-3">
            <button
              onClick={handleExportJson}
              disabled={isProcessing}
              className="inline-flex items-center justify-center px-5 py-2.5 rounded-lg font-medium text-slate-700 dark:text-slate-200 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors"
            >
              Export as JSON
            </button>
            <button
              onClick={handleSave}
              disabled={isProcessing}
              className={`inline-flex items-center justify-center px-6 py-3 rounded-lg font-medium text-white transition-colors
                ${isProcessing ? 'bg-teal-400 cursor-not-allowed' : 'bg-teal-600 hover:bg-teal-700'}`}
            >
              {isProcessing ? (
                <>
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Download className="w-5 h-5 mr-2" />
                  Save & Download
                </>
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
