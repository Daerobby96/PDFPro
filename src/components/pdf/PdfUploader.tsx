"use client";

import React, { useCallback, useState } from 'react';
import { UploadCloud, File as FileIcon } from 'lucide-react';

interface PdfUploaderProps {
  onFilesSelected: (files: File[]) => void;
  multiple?: boolean;
}

export const PdfUploader: React.FC<PdfUploaderProps> = ({ onFilesSelected, multiple = false }) => {
  const [isDragActive, setIsDragActive] = useState(false);

  const handleDragEnter = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragActive(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragActive(false);
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragActive(false);

      if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
        const filesArray = Array.from(e.dataTransfer.files).filter(
          (file) => file.type === 'application/pdf'
        );
        if (filesArray.length > 0) {
          onFilesSelected(multiple ? filesArray : [filesArray[0]]);
        }
      }
    },
    [onFilesSelected, multiple]
  );

  const handleFileChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      if (e.target.files && e.target.files.length > 0) {
        const filesArray = Array.from(e.target.files).filter(
          (file) => file.type === 'application/pdf'
        );
        if (filesArray.length > 0) {
          onFilesSelected(multiple ? filesArray : [filesArray[0]]);
        }
      }
    },
    [onFilesSelected, multiple]
  );

  return (
    <div
      onDragEnter={handleDragEnter}
      onDragLeave={handleDragLeave}
      onDragOver={handleDragOver}
      onDrop={handleDrop}
      className={`relative flex flex-col items-center justify-center w-full min-h-[300px] border-2 border-dashed rounded-xl transition-colors ${
        isDragActive
          ? 'border-primary-500 bg-primary-500/10'
          : 'border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 hover:bg-slate-100 dark:hover:bg-slate-800'
      }`}
    >
      <input
        type="file"
        accept="application/pdf"
        multiple={multiple}
        onChange={handleFileChange}
        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
        title="Choose a PDF file"
      />
      <div className="flex flex-col items-center justify-center text-center space-y-4 p-6 pointer-events-none">
        <div className={`p-4 rounded-full ${isDragActive ? 'bg-primary-500/20 text-primary-500' : 'bg-slate-200 dark:bg-slate-700 text-slate-500 dark:text-slate-400'}`}>
          <UploadCloud className="w-10 h-10" />
        </div>
        <div>
          <p className="text-lg font-medium text-slate-900 dark:text-slate-100">
            {isDragActive ? 'Drop PDF here' : 'Click or drag PDF here'}
          </p>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Max file size: 50MB. Only PDF files are supported.
          </p>
        </div>
      </div>
    </div>
  );
};
