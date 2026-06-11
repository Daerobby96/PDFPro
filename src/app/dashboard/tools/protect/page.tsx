"use client";

import React, { useState } from 'react';
import { PdfUploader } from '@/components/pdf/PdfUploader';
import { PDFFile, formatSize, downloadFile } from '@/lib/pdf/core';
import { protectPdf, ProtectOptions } from '@/lib/pdf/protect';
import { Lock, Download, Loader2, ArrowLeft, AlertTriangle } from 'lucide-react';
import Link from 'next/link';
import { useToast } from '@/components/ui/use-toast';

export default function ProtectPage() {
  const [file, setFile] = useState<PDFFile | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [options, setOptions] = useState<ProtectOptions>({
    ownerPassword: '',
    userPassword: '',
    allowPrinting: true,
    allowCopying: false,
    allowModifying: false,
    allowAnnotations: true,
  });
  const { toast } = useToast();

  const handleFileSelected = async (files: File[]) => {
    if (files.length > 0) {
      const pdfFile = new PDFFile(files[0]);
      try {
        await pdfFile.load();
        setFile(pdfFile);
      } catch (error) {
        toast({
          title: "Error loading PDF",
          description: "Failed to read the PDF file.",
          variant: "destructive"
        });
      }
    }
  };

  const handleProtect = async () => {
    if (!file) return;

    if (!options.ownerPassword) {
      toast({
        title: "Owner password required",
        description: "Please enter an owner password to continue.",
        variant: "destructive"
      });
      return;
    }

    setIsProcessing(true);
    try {
      const { blob, filename } = await protectPdf(file, options);
      downloadFile(blob, filename);

      toast({
        title: "PDF saved!",
        description: "Note: True password encryption requires a server-side tool.",
      });
    } catch (error: any) {
      toast({
        title: "Operation failed",
        description: error.message || "An unexpected error occurred.",
        variant: "destructive"
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const CheckboxOption = ({ label, id, checked, onChange }: { label: string; id: string; checked: boolean; onChange: (v: boolean) => void }) => (
    <label htmlFor={id} className="flex items-center space-x-3 cursor-pointer group">
      <input
        id={id}
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        disabled={isProcessing}
        className="w-4 h-4 rounded text-red-500 focus:ring-red-500 accent-red-600"
      />
      <span className="text-sm text-slate-700 dark:text-slate-300 group-hover:text-slate-900 dark:group-hover:text-white transition-colors">
        {label}
      </span>
    </label>
  );

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <Link href="/dashboard" className="inline-flex items-center text-sm font-medium text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100 mb-6">
        <ArrowLeft className="w-4 h-4 mr-1" />
        Back to Dashboard
      </Link>

      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2 flex items-center">
          <Lock className="w-8 h-8 mr-3 text-red-500" />
          Protect PDF
        </h1>
        <p className="text-slate-600 dark:text-slate-400">
          Set password and permissions for your PDF document.
        </p>
      </div>

      {!file ? (
        <PdfUploader onFilesSelected={handleFileSelected} />
      ) : (
        <div className="space-y-6">
          {/* File Info */}
          <div className="bg-white dark:bg-slate-800 p-6 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm flex items-center justify-between">
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
              className="text-sm text-slate-500 hover:text-slate-700 dark:text-slate-400 font-medium px-3 py-1.5 bg-slate-100 dark:bg-slate-700 rounded-md shrink-0 ml-4"
              disabled={isProcessing}
            >
              Change File
            </button>
          </div>

          {/* Limitation Notice */}
          <div className="flex gap-3 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800/50 text-amber-800 dark:text-amber-200 p-4 rounded-xl text-sm">
            <AlertTriangle className="w-5 h-5 shrink-0 mt-0.5 text-amber-600 dark:text-amber-400" />
            <div>
              <strong>Browser Limitation:</strong> Full PDF encryption (password-to-open) requires a server-side tool.
              This tool applies permission metadata and saves the file structure, but does not enforce strong encryption.
              For production use, consider a server-side solution.
            </div>
          </div>

          {/* Password Settings */}
          <div className="bg-white dark:bg-slate-800 p-6 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm space-y-5">
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white">🔐 Password Settings</h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label htmlFor="owner-pw" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Owner Password <span className="text-red-500">*</span>
                </label>
                <input
                  id="owner-pw"
                  type="password"
                  value={options.ownerPassword}
                  onChange={(e) => setOptions({ ...options, ownerPassword: e.target.value })}
                  placeholder="Required — full access password"
                  disabled={isProcessing}
                  className="w-full rounded-md border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 px-3 py-2 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-red-500 disabled:opacity-60"
                />
                <p className="text-xs text-slate-500 mt-1">Allows full access and changing permissions</p>
              </div>
              <div>
                <label htmlFor="user-pw" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                  User Password <span className="text-slate-400">(Optional)</span>
                </label>
                <input
                  id="user-pw"
                  type="password"
                  value={options.userPassword}
                  onChange={(e) => setOptions({ ...options, userPassword: e.target.value })}
                  placeholder="Required to open the document"
                  disabled={isProcessing}
                  className="w-full rounded-md border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 px-3 py-2 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-red-500 disabled:opacity-60"
                />
                <p className="text-xs text-slate-500 mt-1">Leave empty if no open password needed</p>
              </div>
            </div>
          </div>

          {/* Permissions */}
          <div className="bg-white dark:bg-slate-800 p-6 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm">
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">📋 Permissions</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <CheckboxOption
                id="allow-printing"
                label="Allow printing"
                checked={options.allowPrinting}
                onChange={(v) => setOptions({ ...options, allowPrinting: v })}
              />
              <CheckboxOption
                id="allow-copying"
                label="Allow copying text"
                checked={options.allowCopying}
                onChange={(v) => setOptions({ ...options, allowCopying: v })}
              />
              <CheckboxOption
                id="allow-modifying"
                label="Allow modifying content"
                checked={options.allowModifying}
                onChange={(v) => setOptions({ ...options, allowModifying: v })}
              />
              <CheckboxOption
                id="allow-annotations"
                label="Allow annotations"
                checked={options.allowAnnotations}
                onChange={(v) => setOptions({ ...options, allowAnnotations: v })}
              />
            </div>
          </div>

          {/* Action */}
          <div className="flex justify-end">
            <button
              onClick={handleProtect}
              disabled={isProcessing || !options.ownerPassword}
              className={`inline-flex items-center justify-center px-6 py-3 rounded-lg font-medium text-white transition-colors
                ${isProcessing || !options.ownerPassword ? 'bg-red-300 cursor-not-allowed' : 'bg-red-600 hover:bg-red-700'}`}
            >
              {isProcessing ? (
                <>
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  <Download className="w-5 h-5 mr-2" />
                  Apply & Download
                </>
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
