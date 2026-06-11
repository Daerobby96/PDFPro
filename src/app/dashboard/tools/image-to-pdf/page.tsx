"use client";

import React, { useState } from 'react';
import { convertImagesToPdf, ImageToPdfOptions } from '@/lib/pdf/image-to-pdf';
import { downloadFile } from '@/lib/pdf/core';
import { 
  Image as ImageIcon, 
  Download, 
  Loader2, 
  ArrowLeft, 
  Settings2, 
  Trash2, 
  ArrowUp, 
  ArrowDown, 
  Plus, 
  UploadCloud 
} from 'lucide-react';
import Link from 'next/link';
import { useToast } from '@/components/ui/use-toast';
import { createClient } from '@/lib/supabase/client';
import type { Database } from '@/types/database.types';

export default function ImageToPdfPage() {
  const [images, setImages] = useState<File[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [options, setOptions] = useState<ImageToPdfOptions>({
    pageSize: 'auto',
    orientation: 'portrait',
    margin: 0,
  });
  const [isDragActive, setIsDragActive] = useState(false);
  const { toast } = useToast();
  const supabase = createClient();

  const handleFilesSelected = (filesList: File[]) => {
    const validImages = filesList.filter(file => file.type.startsWith('image/'));
    if (validImages.length === 0) {
      toast({
        title: "No valid images selected",
        description: "Please select image files (PNG, JPG, WEBP, GIF, etc.).",
        variant: "destructive"
      });
      return;
    }
    setImages(prev => [...prev, ...validImages]);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragActive(true);
  };

  const handleDragLeave = () => {
    setIsDragActive(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFilesSelected(Array.from(e.dataTransfer.files));
    }
  };

  const handleRemoveImage = (index: number) => {
    setImages(prev => prev.filter((_, i) => i !== index));
  };

  const moveImage = (index: number, direction: 'up' | 'down') => {
    if (direction === 'up' && index === 0) return;
    if (direction === 'down' && index === images.length - 1) return;
    
    setImages(prev => {
      const next = [...prev];
      const temp = next[index];
      const newIndex = direction === 'up' ? index - 1 : index + 1;
      next[index] = next[newIndex];
      next[newIndex] = temp;
      return next;
    });
  };

  const handleConvert = async () => {
    if (images.length === 0) return;
    setIsProcessing(true);
    setProgress(0);
    const startTime = Date.now();

    try {
      const blob = await convertImagesToPdf(images, options, (p) => setProgress(p));
      const filename = `images_combined_${Date.now()}.pdf`;
      downloadFile(blob, filename);

      toast({
        title: "PDF generated successfully!",
        description: `Combined ${images.length} images into a PDF document.`,
      });

      // Track conversion history in supabase
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        const totalSize = images.reduce((acc, f) => acc + f.size, 0);
        const historyEntry: Database['public']['Tables']['pdf_history']['Insert'] = {
          user_id: session.user.id,
          tool_used: 'Image to PDF',
          file_name: filename,
          file_size: totalSize,
          pages_count: images.length,
          processing_time: Date.now() - startTime,
          success: true
        };
        // @ts-ignore - Supabase types issue with createBrowserClient
        await supabase.from('pdf_history').insert([historyEntry]);
      }

    } catch (err: any) {
      toast({
        title: "Conversion failed",
        description: err.message || "Failed to convert images to PDF.",
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
          <ImageIcon className="w-8 h-8 mr-3 text-amber-500" />
          Image to PDF
        </h1>
        <p className="text-slate-600 dark:text-slate-400">
          Combine and convert your image files (PNG, JPG, WebP, GIF) into a single high-quality PDF.
        </p>
      </div>

      <div className="space-y-6">
        <div className="bg-white dark:bg-slate-800 p-6 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm">
          <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">Add Images</h3>
          
          <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            className={`relative flex flex-col items-center justify-center w-full min-h-[200px] border-2 border-dashed rounded-xl transition-colors cursor-pointer ${
              isDragActive
                ? 'border-amber-500 bg-amber-500/10'
                : 'border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-850 hover:bg-slate-100 dark:hover:bg-slate-800/80'
            }`}
          >
            <input
              type="file"
              accept="image/*"
              multiple
              onChange={(e) => {
                if (e.target.files) handleFilesSelected(Array.from(e.target.files));
              }}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            />
            <div className="flex flex-col items-center justify-center text-center space-y-3 p-6 pointer-events-none">
              <div className={`p-3 rounded-full ${isDragActive ? 'bg-amber-500/20 text-amber-500' : 'bg-slate-250 dark:bg-slate-700 text-slate-500 dark:text-slate-400'}`}>
                <UploadCloud className="w-8 h-8" />
              </div>
              <div>
                <p className="text-base font-semibold text-slate-900 dark:text-slate-100">
                  {isDragActive ? 'Drop images here' : 'Click or drag images here'}
                </p>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  Supports PNG, JPG, JPEG, WEBP, GIF. Choose one or multiple files.
                </p>
              </div>
            </div>
          </div>

          {images.length > 0 && (
            <div className="mt-8">
              <h4 className="font-semibold text-slate-700 dark:text-slate-300 mb-4">Images to Convert ({images.length})</h4>
              <div className="space-y-2 max-h-[350px] overflow-y-auto pr-2">
                {images.map((img, index) => {
                  const url = URL.createObjectURL(img);
                  return (
                    <div key={`${img.name}-${index}`} className="flex items-center gap-4 bg-slate-50 dark:bg-slate-900/50 p-3 rounded-lg border border-slate-200 dark:border-slate-700">
                      <div className="flex flex-col text-slate-450 dark:text-slate-400">
                        <button 
                          onClick={() => moveImage(index, 'up')} 
                          disabled={index === 0 || isProcessing} 
                          className="hover:text-amber-500 disabled:opacity-30 p-0.5"
                          title="Move Up"
                        >
                          <ArrowUp className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={() => moveImage(index, 'down')} 
                          disabled={index === images.length - 1 || isProcessing} 
                          className="hover:text-amber-500 disabled:opacity-30 p-0.5"
                          title="Move Down"
                        >
                          <ArrowDown className="w-4 h-4" />
                        </button>
                      </div>
                      
                      <div className="w-12 h-12 rounded bg-slate-200 dark:bg-slate-800 overflow-hidden shrink-0 flex items-center justify-center border border-slate-300 dark:border-slate-700">
                        <img src={url} alt={img.name} className="object-cover w-full h-full" onLoad={() => URL.revokeObjectURL(url)} />
                      </div>

                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-slate-800 dark:text-slate-200 truncate">{img.name}</p>
                        <p className="text-xs text-slate-500 dark:text-slate-400">{(img.size / 1024).toFixed(1)} KB</p>
                      </div>

                      <button 
                        onClick={() => handleRemoveImage(index)}
                        disabled={isProcessing}
                        className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {images.length > 0 && (
          <div className="bg-white dark:bg-slate-800 p-6 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm">
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4 flex items-center">
              <Settings2 className="w-5 h-5 mr-2" />
              Page Options
            </h3>
            
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Page Size
                </label>
                <select
                  className="w-full rounded-md border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 px-3 py-2 text-sm focus:outline-none"
                  value={options.pageSize}
                  onChange={(e) => setOptions({ ...options, pageSize: e.target.value as any })}
                  disabled={isProcessing}
                >
                  <option value="auto">Auto (Match Image size)</option>
                  <option value="a4">A4 Standard</option>
                  <option value="letter">US Letter</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Orientation
                </label>
                <select
                  className="w-full rounded-md border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 px-3 py-2 text-sm focus:outline-none"
                  value={options.orientation}
                  onChange={(e) => setOptions({ ...options, orientation: e.target.value as any })}
                  disabled={isProcessing || options.pageSize === 'auto'}
                >
                  <option value="portrait">Portrait</option>
                  <option value="landscape">Landscape</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Page Margins
                </label>
                <select
                  className="w-full rounded-md border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 px-3 py-2 text-sm focus:outline-none"
                  value={options.margin}
                  onChange={(e) => setOptions({ ...options, margin: Number(e.target.value) })}
                  disabled={isProcessing || options.pageSize === 'auto'}
                >
                  <option value={0}>No Margin</option>
                  <option value={20}>Small (20pt)</option>
                  <option value={40}>Large (40pt)</option>
                </select>
              </div>
            </div>
          </div>
        )}

        {images.length > 0 && (
          <div className="flex justify-end">
            <button
              onClick={handleConvert}
              disabled={isProcessing}
              className={`inline-flex items-center justify-center px-6 py-3 rounded-lg font-medium text-white transition-colors
                ${isProcessing ? 'bg-amber-400 cursor-not-allowed' : 'bg-amber-600 hover:bg-amber-700'}`}
            >
              {isProcessing ? (
                <>
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                  Generating PDF... {Math.round(progress)}%
                </>
              ) : (
                <>
                  <Download className="w-5 h-5 mr-2" />
                  Convert to PDF
                </>
              )}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
