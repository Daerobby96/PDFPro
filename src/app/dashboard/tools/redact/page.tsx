"use client";

import React, { useState, useEffect } from 'react';
import { PdfUploader } from '@/components/pdf/PdfUploader';
import { PDFFile, downloadFile } from '@/lib/pdf/core';
import { redactPDF, RedactionArea, createRedactionArea } from '@/lib/pdf/redact';
import { EyeOff, Download, Loader2, ArrowLeft, Plus, Trash2 } from 'lucide-react';
import Link from 'next/link';
import { useToast } from '@/components/ui/use-toast';
import { useSharedFile } from '@/context/FileContext';

export default function RedactPage() {
  const [file, setFile] = useState<PDFFile | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [redactionAreas, setRedactionAreas] = useState<RedactionArea[]>([]);
  const [color, setColor] = useState('#000000');
  
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

  const addRedactionArea = () => {
    setRedactionAreas([
      ...redactionAreas,
      createRedactionArea(1, 50, 50, 200, 20)
    ]);
  };

  const removeRedactionArea = (index: number) => {
    setRedactionAreas(redactionAreas.filter((_, i) => i !== index));
  };

  const updateRedactionArea = (index: number, field: keyof RedactionArea, value: number) => {
    const updated = [...redactionAreas];
    updated[index] = { ...updated[index], [field]: value };
    setRedactionAreas(updated);
  };

  const handleRedact = async () => {
    if (!file) return;
    
    if (redactionAreas.length === 0) {
      toast({
        title: "No redaction areas",
        description: "Please add at least one redaction area",
        variant: "destructive",
      });
      return;
    }
    
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
      
      const redactedPdf = await redactPDF(new Uint8Array(await file.file.arrayBuffer()), {
        areas: redactionAreas,
        color: hexToRgb(color),
      });
      
      const processingTime = Date.now() - startTime;
      
      downloadFile(new Blob([redactedPdf.buffer as ArrayBuffer], { type: 'application/pdf' }), `redacted-${file.name}`);
      
      toast({
        title: "Content redacted successfully!",
        description: `Processing time: ${(processingTime / 1000).toFixed(2)}s`,
      });
    } catch (error: any) {
      console.error('Redaction error:', error);
      toast({
        title: "Failed to redact content",
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
          <div className="w-12 h-12 bg-red-100 dark:bg-red-900/20 rounded-xl flex items-center justify-center">
            <EyeOff className="w-6 h-6 text-red-600 dark:text-red-400" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Redact Content</h1>
            <p className="text-gray-600 dark:text-gray-400">Permanently remove sensitive information from PDF</p>
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

              <div className="mt-6 p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg border border-yellow-200 dark:border-yellow-800">
                <p className="text-sm text-yellow-800 dark:text-yellow-200">
                  ⚠️ <strong>Warning:</strong> Redaction permanently removes content. 
                  Make sure to specify the correct coordinates for areas you want to redact.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Right Column - Options */}
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Redaction Areas</h3>
            <button
              onClick={addRedactionArea}
              className="flex items-center gap-2 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 text-sm font-medium"
            >
              <Plus className="w-4 h-4" />
              Add Area
            </button>
          </div>

          <div className="mb-6 max-h-96 overflow-y-auto space-y-4">
            {redactionAreas.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <EyeOff className="w-12 h-12 mx-auto mb-2 opacity-50" />
                <p>No redaction areas yet</p>
                <p className="text-sm">Click "Add Area" to start</p>
              </div>
            ) : (
              redactionAreas.map((area, index) => (
                <div key={index} className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="font-medium text-gray-900 dark:text-white">Area {index + 1}</h4>
                    <button
                      onClick={() => removeRedactionArea(index)}
                      className="text-red-500 hover:text-red-600"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Page
                      </label>
                      <input
                        type="number"
                        min="1"
                        value={area.pageNumber}
                        onChange={(e) => updateRedactionArea(index, 'pageNumber', Number(e.target.value))}
                        className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                        X Position
                      </label>
                      <input
                        type="number"
                        value={area.x}
                        onChange={(e) => updateRedactionArea(index, 'x', Number(e.target.value))}
                        className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Y Position
                      </label>
                      <input
                        type="number"
                        value={area.y}
                        onChange={(e) => updateRedactionArea(index, 'y', Number(e.target.value))}
                        className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Width
                      </label>
                      <input
                        type="number"
                        value={area.width}
                        onChange={(e) => updateRedactionArea(index, 'width', Number(e.target.value))}
                        className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700"
                      />
                    </div>
                    <div className="col-span-2">
                      <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Height
                      </label>
                      <input
                        type="number"
                        value={area.height}
                        onChange={(e) => updateRedactionArea(index, 'height', Number(e.target.value))}
                        className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700"
                      />
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Redaction Color
            </label>
            <input
              type="color"
              value={color}
              onChange={(e) => setColor(e.target.value)}
              className="w-full h-10 rounded border border-gray-300 dark:border-gray-600"
            />
          </div>

          <button
            onClick={handleRedact}
            disabled={!file || isProcessing || redactionAreas.length === 0}
            className="w-full bg-red-500 text-white py-3 rounded-lg font-semibold hover:bg-red-600 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {isProcessing ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Processing...
              </>
            ) : (
              <>
                <Download className="w-5 h-5" />
                Apply Redaction
              </>
            )}
          </button>

          <p className="text-xs text-gray-500 dark:text-gray-400 mt-3 text-center">
            Coordinates are in PDF units from top-left corner
          </p>
        </div>
      </div>
    </div>
  );
}
