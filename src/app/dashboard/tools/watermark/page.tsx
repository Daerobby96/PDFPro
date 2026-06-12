"use client";

import React, { useState, useEffect } from 'react';
import { PdfUploader } from '@/components/pdf/PdfUploader';
import { PDFFile, downloadFile } from '@/lib/pdf/core';
import { addWatermark, WatermarkOptions } from '@/lib/pdf/watermark';
import { Droplets, Download, Loader2, ArrowLeft, Image as ImageIcon, Type } from 'lucide-react';
import Link from 'next/link';
import { useToast } from '@/components/ui/use-toast';
import { useSharedFile } from '@/context/FileContext';

export default function WatermarkPage() {
  const [file, setFile] = useState<PDFFile | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [watermarkType, setWatermarkType] = useState<'text' | 'image'>('text');
  
  // Text watermark options
  const [text, setText] = useState('CONFIDENTIAL');
  const [fontSize, setFontSize] = useState(48);
  const [opacity, setOpacity] = useState(0.3);
  const [rotation, setRotation] = useState(45);
  const [position, setPosition] = useState<'center' | 'diagonal' | 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right'>('diagonal');
  const [color, setColor] = useState('#808080');
  
  // Image watermark options
  const [watermarkImage, setWatermarkImage] = useState<File | null>(null);
  const [watermarkImagePreview, setWatermarkImagePreview] = useState<string | null>(null);
  
  const { toast } = useToast();
  const { sharedFile, setSharedFile } = useSharedFile();

  useEffect(() => {
    if (sharedFile && !file) {
      console.log('Shared file from context:', sharedFile);
      console.log('Type:', typeof sharedFile);
      console.log('Is File?', sharedFile instanceof File);
      
      if (sharedFile instanceof File) {
        handleFileSelected(sharedFile);
      }
      setSharedFile(null);
    }
  }, []);

  const handleFileSelected = async (selectedFile: File) => {
    if (!selectedFile) {
      console.error('No file selected');
      return;
    }
    
    try {
      console.log('Selected file:', selectedFile);
      console.log('Is File?', selectedFile instanceof File);
      console.log('Has arrayBuffer?', typeof selectedFile.arrayBuffer);
      
      // Validate it's actually a File object with arrayBuffer method
      if (typeof selectedFile.arrayBuffer !== 'function') {
        throw new Error('Invalid file object - missing arrayBuffer method');
      }
      
      const pdfFile = new PDFFile(selectedFile);
      await pdfFile.load();
      setFile(pdfFile);
    } catch (error: any) {
      console.error('Error loading PDF:', error);
      toast({
        title: "Error loading PDF",
        description: error.message || "Please try again with a valid PDF file.",
        variant: "destructive",
      });
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setWatermarkImage(file);
      const reader = new FileReader();
      reader.onload = (e) => {
        setWatermarkImagePreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAddWatermark = async () => {
    if (!file) return;
    
    setIsProcessing(true);
    const startTime = Date.now();
    
    try {
      const arrayBuffer = await file.file.arrayBuffer();
      const pdfBytes = new Uint8Array(arrayBuffer);
      
      let options: WatermarkOptions = {
        opacity,
        rotation,
        position,
      };
      
      if (watermarkType === 'text') {
        const hexToRgb = (hex: string) => {
          const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
          return result ? {
            r: parseInt(result[1], 16) / 255,
            g: parseInt(result[2], 16) / 255,
            b: parseInt(result[3], 16) / 255
          } : { r: 0.5, g: 0.5, b: 0.5 };
        };
        
        options.text = text;
        options.fontSize = fontSize;
        options.color = hexToRgb(color);
      } else if (watermarkImage) {
        const imageBytes = new Uint8Array(await watermarkImage.arrayBuffer());
        options.imageBytes = imageBytes;
        options.imageType = watermarkImage.type === 'image/png' ? 'png' : 'jpg';
      } else {
        throw new Error('Please select an image for watermark');
      }
      
      const watermarkedPdf = await addWatermark(pdfBytes, options);
      
      const processingTime = Date.now() - startTime;
      
      downloadFile(new Blob([watermarkedPdf.buffer as ArrayBuffer], { type: 'application/pdf' }), `watermarked-${file.name}`);
      
      toast({
        title: "Watermark added successfully!",
        description: `Processing time: ${(processingTime / 1000).toFixed(2)}s`,
      });
    } catch (error: any) {
      console.error('Watermark error:', error);
      toast({
        title: "Failed to add watermark",
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
          <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/20 rounded-xl flex items-center justify-center">
            <Droplets className="w-6 h-6 text-blue-600 dark:text-blue-400" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Add Watermark</h1>
            <p className="text-gray-600 dark:text-gray-400">Add text or image watermark to your PDF</p>
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-8">
        {/* Left Column - Upload */}
        <div>
          {!file ? (
            <PdfUploader onFilesSelected={(files) => {
              console.log('Files from uploader:', files);
              console.log('First file:', files[0]);
              if (files && files[0]) {
                handleFileSelected(files[0]);
              }
            }} />
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
            </div>
          )}
        </div>

        {/* Right Column - Options */}
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Watermark Options</h3>
          
          {/* Watermark Type */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Watermark Type
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => setWatermarkType('text')}
                className={`p-3 rounded-lg border-2 transition flex items-center justify-center gap-2 ${
                  watermarkType === 'text'
                    ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                    : 'border-gray-200 dark:border-gray-700'
                }`}
              >
                <Type className="w-5 h-5" />
                <span className="font-medium">Text</span>
              </button>
              <button
                onClick={() => setWatermarkType('image')}
                className={`p-3 rounded-lg border-2 transition flex items-center justify-center gap-2 ${
                  watermarkType === 'image'
                    ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                    : 'border-gray-200 dark:border-gray-700'
                }`}
              >
                <ImageIcon className="w-5 h-5" />
                <span className="font-medium">Image</span>
              </button>
            </div>
          </div>

          {watermarkType === 'text' ? (
            <>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Watermark Text
                </label>
                <input
                  type="text"
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700"
                  placeholder="Enter watermark text"
                />
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Font Size: {fontSize}px
                </label>
                <input
                  type="range"
                  min="12"
                  max="120"
                  value={fontSize}
                  onChange={(e) => setFontSize(Number(e.target.value))}
                  className="w-full"
                />
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Color
                </label>
                <input
                  type="color"
                  value={color}
                  onChange={(e) => setColor(e.target.value)}
                  className="w-full h-10 rounded border border-gray-300 dark:border-gray-600"
                />
              </div>
            </>
          ) : (
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Watermark Image
              </label>
              <input
                type="file"
                accept="image/png,image/jpeg"
                onChange={handleImageChange}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700"
              />
              {watermarkImagePreview && (
                <img src={watermarkImagePreview} alt="Preview" className="mt-2 max-h-32 rounded" />
              )}
            </div>
          )}

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Position
            </label>
            <select
              value={position}
              onChange={(e) => setPosition(e.target.value as any)}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700"
            >
              <option value="center">Center</option>
              <option value="diagonal">Diagonal</option>
              <option value="top-left">Top Left</option>
              <option value="top-right">Top Right</option>
              <option value="bottom-left">Bottom Left</option>
              <option value="bottom-right">Bottom Right</option>
            </select>
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Opacity: {opacity.toFixed(2)}
            </label>
            <input
              type="range"
              min="0"
              max="1"
              step="0.05"
              value={opacity}
              onChange={(e) => setOpacity(Number(e.target.value))}
              className="w-full"
            />
          </div>

          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Rotation: {rotation}°
            </label>
            <input
              type="range"
              min="0"
              max="360"
              value={rotation}
              onChange={(e) => setRotation(Number(e.target.value))}
              className="w-full"
            />
          </div>

          <button
            onClick={handleAddWatermark}
            disabled={!file || isProcessing}
            className="w-full bg-blue-500 text-white py-3 rounded-lg font-semibold hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {isProcessing ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Processing...
              </>
            ) : (
              <>
                <Download className="w-5 h-5" />
                Add Watermark
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
