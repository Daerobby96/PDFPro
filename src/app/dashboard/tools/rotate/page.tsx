"use client";

import React, { useState, useEffect } from 'react';
import { PdfUploader } from '@/components/pdf/PdfUploader';
import { PDFFile, formatSize, downloadFile } from '@/lib/pdf/core';
import { rotatePdf, RotateOptions } from '@/lib/pdf/rotate';
import { PdfThumbnail } from '@/components/pdf/PdfThumbnail';
import { RotateCw, Download, Loader2, ArrowLeft, Trash2, CheckSquare, Square } from 'lucide-react';
import Link from 'next/link';
import { useToast } from '@/components/ui/use-toast';
import { useSharedFile } from '@/context/FileContext';

export default function RotatePage() {
  const [file, setFile] = useState<PDFFile | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  
  const [pageOrder, setPageOrder] = useState<number[]>([]);
  const [rotations, setRotations] = useState<Record<number, number>>({});
  const [selectedPages, setSelectedPages] = useState<Set<number>>(new Set());

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
        
        // Initialize state
        const initialOrder = Array.from({ length: pdfFile.totalPages }, (_, i) => i + 1);
        setPageOrder(initialOrder);
        setRotations({});
        setSelectedPages(new Set());
      } catch (error) {
        toast({
          title: "Error loading PDF",
          description: "Failed to read the PDF file.",
          variant: "destructive"
        });
      }
    }
  };

  const toggleSelection = (pageNum: number) => {
    const newSelection = new Set(selectedPages);
    if (newSelection.has(pageNum)) {
      newSelection.delete(pageNum);
    } else {
      newSelection.add(pageNum);
    }
    setSelectedPages(newSelection);
  };

  const selectAll = () => {
    setSelectedPages(new Set(pageOrder));
  };

  const deselectAll = () => {
    setSelectedPages(new Set());
  };

  const rotatePage = (pageNum: number, degrees: number) => {
    setRotations(prev => ({
      ...prev,
      [pageNum]: ((prev[pageNum] || 0) + degrees + 360) % 360
    }));
  };

  const rotateSelected = (degrees: number) => {
    if (selectedPages.size === 0) return;
    setRotations(prev => {
      const next = { ...prev };
      selectedPages.forEach(p => {
        next[p] = ((next[p] || 0) + degrees + 360) % 360;
      });
      return next;
    });
  };

  const deleteSelected = () => {
    if (selectedPages.size === 0) return;
    setPageOrder(prev => prev.filter(p => !selectedPages.has(p)));
    setSelectedPages(new Set());
  };

  const handleDragStart = (e: React.DragEvent, index: number) => {
    e.dataTransfer.setData('text/plain', index.toString());
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDrop = (e: React.DragEvent, targetIndex: number) => {
    e.preventDefault();
    const sourceIndexStr = e.dataTransfer.getData('text/plain');
    if (!sourceIndexStr) return;
    
    const sourceIndex = parseInt(sourceIndexStr);
    if (sourceIndex === targetIndex) return;

    setPageOrder(prev => {
      const newOrder = [...prev];
      const [removed] = newOrder.splice(sourceIndex, 1);
      newOrder.splice(targetIndex, 0, removed);
      return newOrder;
    });
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleApply = async () => {
    if (!file || pageOrder.length === 0) return;

    setIsProcessing(true);
    setProgress(0);

    try {
      const options: RotateOptions = { pageOrder, rotations };
      const { blob, filename } = await rotatePdf(file, options, (p) => setProgress(p));
      downloadFile(blob, filename);
      
      toast({
        title: "Changes applied!",
        description: `Your modified PDF has been saved.`,
      });
    } catch (error: any) {
      toast({
        title: "Operation failed",
        description: error.message || "An unexpected error occurred.",
        variant: "destructive"
      });
    } finally {
      setIsProcessing(false);
      setProgress(0);
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <Link href="/dashboard" className="inline-flex items-center text-sm font-medium text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100 mb-6">
        <ArrowLeft className="w-4 h-4 mr-1" />
        Back to Dashboard
      </Link>

      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2 flex items-center">
          <RotateCw className="w-8 h-8 mr-3 text-orange-500" />
          Rotate & Reorder Pages
        </h1>
        <p className="text-slate-600 dark:text-slate-400">
          Rotate pages, change their order by dragging, or remove unwanted pages.
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
                {formatSize(file.size)} • {pageOrder.length} pages remaining
              </p>
            </div>
            
            <div className="flex flex-wrap items-center gap-2">
              <button
                onClick={() => rotateSelected(90)}
                disabled={selectedPages.size === 0 || isProcessing}
                className="px-3 py-1.5 text-sm bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-200 rounded font-medium hover:bg-slate-200 dark:hover:bg-slate-600 disabled:opacity-50"
              >
                Rotate 90° CW
              </button>
              <button
                onClick={deleteSelected}
                disabled={selectedPages.size === 0 || isProcessing}
                className="px-3 py-1.5 text-sm bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400 rounded font-medium hover:bg-red-100 dark:hover:bg-red-500/20 disabled:opacity-50 flex items-center"
              >
                <Trash2 className="w-4 h-4 mr-1" />
                Delete
              </button>
              <button
                onClick={() => setFile(null)}
                className="px-3 py-1.5 text-sm text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 font-medium"
                disabled={isProcessing}
              >
                Change File
              </button>
            </div>
          </div>

          <div className="bg-slate-50 dark:bg-slate-900/50 p-6 rounded-xl border border-slate-200 dark:border-slate-800">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
                {selectedPages.size > 0 ? (
                  <button onClick={deselectAll} className="flex items-center hover:text-slate-900 dark:hover:text-white">
                    <CheckSquare className="w-4 h-4 mr-1 text-primary-500" />
                    {selectedPages.size} selected (Deselect)
                  </button>
                ) : (
                  <button onClick={selectAll} className="flex items-center hover:text-slate-900 dark:hover:text-white">
                    <Square className="w-4 h-4 mr-1" />
                    Select All
                  </button>
                )}
              </div>
              <span className="text-xs text-slate-500">Drag to reorder</span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
              {pageOrder.map((pageNum, index) => {
                const isSelected = selectedPages.has(pageNum);
                const rotation = rotations[pageNum] || 0;

                return (
                  <div
                    key={`${pageNum}-${index}`}
                    draggable
                    onDragStart={(e) => handleDragStart(e, index)}
                    onDrop={(e) => handleDrop(e, index)}
                    onDragOver={handleDragOver}
                    className={`relative group bg-white dark:bg-slate-800 rounded-lg p-2 shadow-sm border-2 transition-all cursor-move
                      ${isSelected ? 'border-primary-500' : 'border-transparent hover:border-slate-300 dark:hover:border-slate-600'}`}
                  >
                    <div className="absolute top-2 left-2 z-10">
                      <button 
                        onClick={() => toggleSelection(pageNum)}
                        className="bg-white rounded-sm shadow-sm"
                      >
                        {isSelected ? (
                          <CheckSquare className="w-5 h-5 text-primary-500" />
                        ) : (
                          <Square className="w-5 h-5 text-slate-300" />
                        )}
                      </button>
                    </div>

                    <div className="absolute top-2 right-2 z-10 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button 
                        onClick={() => rotatePage(pageNum, 90)}
                        className="p-1.5 bg-white dark:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-full shadow-md hover:bg-slate-100 dark:hover:bg-slate-600"
                        title="Rotate right"
                      >
                        <RotateCw className="w-4 h-4" />
                      </button>
                    </div>

                    <div className="w-full flex justify-center py-4 pointer-events-none">
                      <PdfThumbnail
                        file={file}
                        pageNumber={pageNum}
                        rotation={rotation}
                        scale={0.5}
                        className="pointer-events-none"
                      />
                    </div>

                    <div className="text-center mt-2">
                      <span className="text-xs font-medium text-slate-500 bg-slate-100 dark:bg-slate-700 px-2 py-1 rounded">
                        Page {pageNum}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="flex justify-end pt-4 border-t border-slate-200 dark:border-slate-800">
            <button
              onClick={handleApply}
              disabled={isProcessing || pageOrder.length === 0}
              className={`inline-flex items-center justify-center px-6 py-3 rounded-lg font-medium text-white transition-colors
                ${isProcessing ? 'bg-primary-400 cursor-not-allowed' : 'bg-primary-600 hover:bg-primary-700'}`}
            >
              {isProcessing ? (
                <>
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                  Applying... {Math.round(progress)}%
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
