"use client";

import React, { useState, useEffect } from 'react';
import { PdfUploader } from '@/components/pdf/PdfUploader';
import { PDFFile, downloadFile } from '@/lib/pdf/core';
import { addHeaderFooter, HeaderFooterOptions } from '@/lib/pdf/header-footer';
import { AlignVerticalSpaceAround, Download, Loader2, ArrowLeft, Info } from 'lucide-react';
import Link from 'next/link';
import { useToast } from '@/components/ui/use-toast';
import { useSharedFile } from '@/context/FileContext';

export default function HeaderFooterPage() {
  const [file, setFile] = useState<PDFFile | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  
  // Header options
  const [headerLeft, setHeaderLeft] = useState('');
  const [headerCenter, setHeaderCenter] = useState('My Document');
  const [headerRight, setHeaderRight] = useState('{date}');
  const [headerFontSize, setHeaderFontSize] = useState(10);
  const [headerColor, setHeaderColor] = useState('#000000');
  
  // Footer options
  const [footerLeft, setFooterLeft] = useState('© Company Name');
  const [footerCenter, setFooterCenter] = useState('Page {page} of {total}');
  const [footerRight, setFooterRight] = useState('{time}');
  const [footerFontSize, setFooterFontSize] = useState(10);
  const [footerColor, setFooterColor] = useState('#000000');
  
  const [excludePages, setExcludePages] = useState('');
  
  const { toast } = useToast();
  const { sharedFile, setSharedFile } = useSharedFile();

  useEffect(() => {
    if (sharedFile && !file) {
      handleFileSelected(sharedFile);
      setSharedFile(null);
    }
  }, []);

  const handleFileSelected = async (selectedFile: File) => {
    try {
      const pdfFile = new PDFFile(selectedFile);
      await pdfFile.load();
      setFile(pdfFile);
    } catch (error) {
      console.error('Error loading PDF:', error);
      toast({
        title: "Error loading PDF",
        description: "Please try again with a valid PDF file.",
        variant: "destructive",
      });
    }
  };

  const handleAddHeaderFooter = async () => {
    if (!file) return;
    
    setIsProcessing(true);
    const startTime = Date.now();
    
    try {
      const hexToRgb = (hex: string) => {
        const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
        return result ? {
          r: parseInt(result[1], 16) / 255,
          g: parseInt(result[2], 16) / 255,
          b: parseInt(result[3], 16) / 255
        } : { r: 0, g: 0, b: 0 };
      };
      
      const excludePagesArray = excludePages
        .split(',')
        .map(p => parseInt(p.trim()))
        .filter(p => !isNaN(p));
      
      const options: HeaderFooterOptions = {
        excludePages: excludePagesArray,
      };
      
      // Add header if any field is filled
      if (headerLeft || headerCenter || headerRight) {
        options.header = {
          left: headerLeft || undefined,
          center: headerCenter || undefined,
          right: headerRight || undefined,
          fontSize: headerFontSize,
          color: hexToRgb(headerColor),
        };
      }
      
      // Add footer if any field is filled
      if (footerLeft || footerCenter || footerRight) {
        options.footer = {
          left: footerLeft || undefined,
          center: footerCenter || undefined,
          right: footerRight || undefined,
          fontSize: footerFontSize,
          color: hexToRgb(footerColor),
        };
      }
      
      const processedPdf = await addHeaderFooter(new Uint8Array(await file.file.arrayBuffer()), options);
      
      const processingTime = Date.now() - startTime;
      
      downloadFile(new Blob([processedPdf.buffer as ArrayBuffer], { type: 'application/pdf' }), `header-footer-${file.name}`);
      
      toast({
        title: "Header/Footer added successfully!",
        description: `Processing time: ${(processingTime / 1000).toFixed(2)}s`,
      });
    } catch (error: any) {
      console.error('Header/Footer error:', error);
      toast({
        title: "Failed to add header/footer",
        description: error.message || "Please try again",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <Link 
        href="/dashboard" 
        className="inline-flex items-center text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white mb-6"
      >
        <ArrowLeft className="w-4 h-4 mr-2" />
        Back to Dashboard
      </Link>

      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-12 h-12 bg-green-100 dark:bg-green-900/20 rounded-xl flex items-center justify-center">
            <AlignVerticalSpaceAround className="w-6 h-6 text-green-600 dark:text-green-400" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Add Header & Footer</h1>
            <p className="text-gray-600 dark:text-gray-400">Add custom headers and footers to your PDF</p>
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-8">
        {/* Left Column - Upload */}
        <div>
          {!file ? (
            <PdfUploader onFilesSelected={(files) => handleFileSelected(files[0])} />
          ) : (
            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">PDF Loaded</h3>
              <div className="flex items-center justify-between mb-4 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <div>
                  <p className="font-medium text-gray-900 dark:text-white">{file.name}</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {(file.size / 1024 / 1024).toFixed(2)} MB
                  </p>
                </div>
              </div>
              <button
                onClick={() => setFile(null)}
                className="text-red-500 hover:text-red-600 text-sm font-medium"
              >
                Remove file
              </button>

              {/* Dynamic Variables Info */}
              <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                <div className="flex items-start gap-2">
                  <Info className="w-5 h-5 text-blue-600 dark:text-blue-400 mt-0.5" />
                  <div>
                    <h4 className="text-sm font-semibold text-blue-900 dark:text-blue-100 mb-2">
                      Dynamic Variables
                    </h4>
                    <ul className="text-xs text-blue-800 dark:text-blue-200 space-y-1">
                      <li><code className="bg-blue-100 dark:bg-blue-800 px-1 rounded">{'{page}'}</code> - Current page number</li>
                      <li><code className="bg-blue-100 dark:bg-blue-800 px-1 rounded">{'{total}'}</code> - Total pages</li>
                      <li><code className="bg-blue-100 dark:bg-blue-800 px-1 rounded">{'{date}'}</code> - Current date</li>
                      <li><code className="bg-blue-100 dark:bg-blue-800 px-1 rounded">{'{time}'}</code> - Current time</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Right Column - Options */}
        <div className="space-y-6">
          {/* Header Section */}
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Header</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Left
                </label>
                <input
                  type="text"
                  value={headerLeft}
                  onChange={(e) => setHeaderLeft(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700"
                  placeholder="e.g., Company Name"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Center
                </label>
                <input
                  type="text"
                  value={headerCenter}
                  onChange={(e) => setHeaderCenter(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700"
                  placeholder="e.g., Document Title"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Right
                </label>
                <input
                  type="text"
                  value={headerRight}
                  onChange={(e) => setHeaderRight(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700"
                  placeholder="e.g., {date}"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Font Size: {headerFontSize}px
                  </label>
                  <input
                    type="range"
                    min="8"
                    max="16"
                    value={headerFontSize}
                    onChange={(e) => setHeaderFontSize(Number(e.target.value))}
                    className="w-full"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Color
                  </label>
                  <input
                    type="color"
                    value={headerColor}
                    onChange={(e) => setHeaderColor(e.target.value)}
                    className="w-full h-10 rounded border border-gray-300 dark:border-gray-600"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Footer Section */}
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Footer</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Left
                </label>
                <input
                  type="text"
                  value={footerLeft}
                  onChange={(e) => setFooterLeft(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700"
                  placeholder="e.g., © 2024 Company"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Center
                </label>
                <input
                  type="text"
                  value={footerCenter}
                  onChange={(e) => setFooterCenter(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700"
                  placeholder="e.g., Page {page} of {total}"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Right
                </label>
                <input
                  type="text"
                  value={footerRight}
                  onChange={(e) => setFooterRight(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700"
                  placeholder="e.g., {time}"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Font Size: {footerFontSize}px
                  </label>
                  <input
                    type="range"
                    min="8"
                    max="16"
                    value={footerFontSize}
                    onChange={(e) => setFooterFontSize(Number(e.target.value))}
                    className="w-full"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Color
                  </label>
                  <input
                    type="color"
                    value={footerColor}
                    onChange={(e) => setFooterColor(e.target.value)}
                    className="w-full h-10 rounded border border-gray-300 dark:border-gray-600"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Options */}
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Exclude Pages (comma-separated)
              </label>
              <input
                type="text"
                value={excludePages}
                onChange={(e) => setExcludePages(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700"
                placeholder="e.g., 1, 5, 10"
              />
            </div>

            <button
              onClick={handleAddHeaderFooter}
              disabled={!file || isProcessing}
              className="w-full bg-green-500 text-white py-3 rounded-lg font-semibold hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isProcessing ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  <Download className="w-5 h-5" />
                  Add Header/Footer
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
