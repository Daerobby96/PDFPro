"use client";

import React, { useState, useEffect } from 'react';
import { PdfUploader } from '@/components/pdf/PdfUploader';
import { PDFFile, downloadFile } from '@/lib/pdf/core';
import { editPDF, TextEdit, ImageEdit, ShapeEdit } from '@/lib/pdf/editor';
import { Edit3, Download, Loader2, ArrowLeft, Type, Image as ImageIcon, Square, Plus, Trash2 } from 'lucide-react';
import Link from 'next/link';
import { useToast } from '@/components/ui/use-toast';
import { useSharedFile } from '@/context/FileContext';

type EditType = 'text' | 'image' | 'shape';

export default function EditorPage() {
  const [file, setFile] = useState<PDFFile | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [editType, setEditType] = useState<EditType>('text');
  
  const [textEdits, setTextEdits] = useState<TextEdit[]>([]);
  const [imageEdits, setImageEdits] = useState<ImageEdit[]>([]);
  const [shapeEdits, setShapeEdits] = useState<ShapeEdit[]>([]);
  
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

  const addTextEdit = () => {
    setTextEdits([...textEdits, {
      pageNumber: 1,
      x: 50,
      y: 50,
      text: 'New Text',
      fontSize: 12,
      color: { r: 0, g: 0, b: 0 },
      fontName: 'Helvetica'
    }]);
  };

  const addShapeEdit = () => {
    setShapeEdits([...shapeEdits, {
      pageNumber: 1,
      type: 'rectangle',
      x: 50,
      y: 50,
      width: 100,
      height: 50,
      color: { r: 0, g: 0, b: 1 },
      opacity: 0.5
    }]);
  };

  const removeTextEdit = (index: number) => {
    setTextEdits(textEdits.filter((_, i) => i !== index));
  };

  const removeImageEdit = (index: number) => {
    setImageEdits(imageEdits.filter((_, i) => i !== index));
  };

  const removeShapeEdit = (index: number) => {
    setShapeEdits(shapeEdits.filter((_, i) => i !== index));
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const arrayBuffer = await file.arrayBuffer();
      const imageBytes = new Uint8Array(arrayBuffer);
      
      setImageEdits([...imageEdits, {
        pageNumber: 1,
        x: 50,
        y: 50,
        imageBytes,
        imageType: file.type === 'image/png' ? 'png' : 'jpg',
        width: 100,
        height: 100,
        opacity: 1
      }]);
      
      toast({
        title: "Image added!",
        description: "Configure position and size below",
      });
    }
  };

  const handleApplyEdits = async () => {
    if (!file) return;
    
    if (textEdits.length === 0 && imageEdits.length === 0 && shapeEdits.length === 0) {
      toast({
        title: "No edits to apply",
        description: "Please add some text, images, or shapes first",
        variant: "destructive",
      });
      return;
    }
    
    setIsProcessing(true);
    const startTime = Date.now();
    
    try {
      const editedPdf = await editPDF(new Uint8Array(await file.file.arrayBuffer()), {
        textEdits: textEdits.length > 0 ? textEdits : undefined,
        imageEdits: imageEdits.length > 0 ? imageEdits : undefined,
        shapeEdits: shapeEdits.length > 0 ? shapeEdits : undefined,
      });
      
      const processingTime = Date.now() - startTime;
      
      downloadFile(new Blob([editedPdf.buffer as ArrayBuffer], { type: 'application/pdf' }), `edited-${file.name}`);
      
      toast({
        title: "PDF edited successfully!",
        description: `Processing time: ${(processingTime / 1000).toFixed(2)}s`,
      });
    } catch (error: any) {
      console.error('Editing error:', error);
      toast({
        title: "Failed to edit PDF",
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
          <div className="w-12 h-12 bg-orange-100 dark:bg-orange-900/20 rounded-xl flex items-center justify-center">
            <Edit3 className="w-6 h-6 text-orange-600 dark:text-orange-400" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">PDF Editor</h1>
            <p className="text-gray-600 dark:text-gray-400">Add text, images, and shapes to your PDF</p>
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

              {/* Edit Type Selector */}
              <div className="mt-6">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Add Element
                </label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    onClick={() => setEditType('text')}
                    className={`p-3 rounded-lg border-2 transition flex flex-col items-center gap-1 ${
                      editType === 'text'
                        ? 'border-orange-500 bg-orange-50 dark:bg-orange-900/20'
                        : 'border-gray-200 dark:border-gray-700'
                    }`}
                  >
                    <Type className="w-5 h-5" />
                    <span className="text-xs font-medium">Text</span>
                  </button>
                  <button
                    onClick={() => setEditType('image')}
                    className={`p-3 rounded-lg border-2 transition flex flex-col items-center gap-1 ${
                      editType === 'image'
                        ? 'border-orange-500 bg-orange-50 dark:bg-orange-900/20'
                        : 'border-gray-200 dark:border-gray-700'
                    }`}
                  >
                    <ImageIcon className="w-5 h-5" />
                    <span className="text-xs font-medium">Image</span>
                  </button>
                  <button
                    onClick={() => setEditType('shape')}
                    className={`p-3 rounded-lg border-2 transition flex flex-col items-center gap-1 ${
                      editType === 'shape'
                        ? 'border-orange-500 bg-orange-50 dark:bg-orange-900/20'
                        : 'border-gray-200 dark:border-gray-700'
                    }`}
                  >
                    <Square className="w-5 h-5" />
                    <span className="text-xs font-medium">Shape</span>
                  </button>
                </div>
              </div>

              {/* Add Button */}
              <div className="mt-4">
                {editType === 'text' && (
                  <button
                    onClick={addTextEdit}
                    className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-orange-500 text-white rounded-lg hover:bg-orange-600 font-medium"
                  >
                    <Plus className="w-5 h-5" />
                    Add Text
                  </button>
                )}
                {editType === 'image' && (
                  <label className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-orange-500 text-white rounded-lg hover:bg-orange-600 font-medium cursor-pointer">
                    <Plus className="w-5 h-5" />
                    Add Image
                    <input
                      type="file"
                      accept="image/png,image/jpeg"
                      onChange={handleImageUpload}
                      className="hidden"
                    />
                  </label>
                )}
                {editType === 'shape' && (
                  <button
                    onClick={addShapeEdit}
                    className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-orange-500 text-white rounded-lg hover:bg-orange-600 font-medium"
                  >
                    <Plus className="w-5 h-5" />
                    Add Shape
                  </button>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Right Column - Edits */}
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Elements ({textEdits.length + imageEdits.length + shapeEdits.length})
          </h3>
          
          <div className="max-h-96 overflow-y-auto space-y-4 mb-6">
            {/* Text Edits */}
            {textEdits.map((edit, index) => (
              <div key={`text-${index}`} className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <Type className="w-4 h-4 text-orange-500" />
                    <h4 className="font-medium text-gray-900 dark:text-white">Text {index + 1}</h4>
                  </div>
                  <button onClick={() => removeTextEdit(index)} className="text-red-500 hover:text-red-600">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
                <div className="space-y-2">
                  <input
                    type="text"
                    value={edit.text}
                    onChange={(e) => {
                      const updated = [...textEdits];
                      updated[index].text = e.target.value;
                      setTextEdits(updated);
                    }}
                    className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700"
                    placeholder="Text content"
                  />
                  <div className="grid grid-cols-3 gap-2">
                    <input
                      type="number"
                      value={edit.pageNumber}
                      onChange={(e) => {
                        const updated = [...textEdits];
                        updated[index].pageNumber = Number(e.target.value);
                        setTextEdits(updated);
                      }}
                      placeholder="Page"
                      className="px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded dark:bg-gray-700"
                    />
                    <input
                      type="number"
                      value={edit.x}
                      onChange={(e) => {
                        const updated = [...textEdits];
                        updated[index].x = Number(e.target.value);
                        setTextEdits(updated);
                      }}
                      placeholder="X"
                      className="px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded dark:bg-gray-700"
                    />
                    <input
                      type="number"
                      value={edit.y}
                      onChange={(e) => {
                        const updated = [...textEdits];
                        updated[index].y = Number(e.target.value);
                        setTextEdits(updated);
                      }}
                      placeholder="Y"
                      className="px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded dark:bg-gray-700"
                    />
                  </div>
                </div>
              </div>
            ))}

            {/* Image Edits */}
            {imageEdits.map((edit, index) => (
              <div key={`image-${index}`} className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <ImageIcon className="w-4 h-4 text-orange-500" />
                    <h4 className="font-medium text-gray-900 dark:text-white">Image {index + 1}</h4>
                  </div>
                  <button onClick={() => removeImageEdit(index)} className="text-red-500 hover:text-red-600">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="number"
                    value={edit.pageNumber}
                    onChange={(e) => {
                      const updated = [...imageEdits];
                      updated[index].pageNumber = Number(e.target.value);
                      setImageEdits(updated);
                    }}
                    placeholder="Page"
                    className="px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded dark:bg-gray-700"
                  />
                  <input
                    type="number"
                    value={edit.x}
                    onChange={(e) => {
                      const updated = [...imageEdits];
                      updated[index].x = Number(e.target.value);
                      setImageEdits(updated);
                    }}
                    placeholder="X"
                    className="px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded dark:bg-gray-700"
                  />
                  <input
                    type="number"
                    value={edit.width}
                    onChange={(e) => {
                      const updated = [...imageEdits];
                      updated[index].width = Number(e.target.value);
                      setImageEdits(updated);
                    }}
                    placeholder="Width"
                    className="px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded dark:bg-gray-700"
                  />
                  <input
                    type="number"
                    value={edit.height}
                    onChange={(e) => {
                      const updated = [...imageEdits];
                      updated[index].height = Number(e.target.value);
                      setImageEdits(updated);
                    }}
                    placeholder="Height"
                    className="px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded dark:bg-gray-700"
                  />
                </div>
              </div>
            ))}

            {/* Shape Edits */}
            {shapeEdits.map((edit, index) => (
              <div key={`shape-${index}`} className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <Square className="w-4 h-4 text-orange-500" />
                    <h4 className="font-medium text-gray-900 dark:text-white">Shape {index + 1}</h4>
                  </div>
                  <button onClick={() => removeShapeEdit(index)} className="text-red-500 hover:text-red-600">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="number"
                    value={edit.pageNumber}
                    onChange={(e) => {
                      const updated = [...shapeEdits];
                      updated[index].pageNumber = Number(e.target.value);
                      setShapeEdits(updated);
                    }}
                    placeholder="Page"
                    className="px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded dark:bg-gray-700"
                  />
                  <input
                    type="number"
                    value={edit.x}
                    onChange={(e) => {
                      const updated = [...shapeEdits];
                      updated[index].x = Number(e.target.value);
                      setShapeEdits(updated);
                    }}
                    placeholder="X"
                    className="px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded dark:bg-gray-700"
                  />
                  <input
                    type="number"
                    value={edit.width}
                    onChange={(e) => {
                      const updated = [...shapeEdits];
                      updated[index].width = Number(e.target.value);
                      setShapeEdits(updated);
                    }}
                    placeholder="Width"
                    className="px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded dark:bg-gray-700"
                  />
                  <input
                    type="number"
                    value={edit.height}
                    onChange={(e) => {
                      const updated = [...shapeEdits];
                      updated[index].height = Number(e.target.value);
                      setShapeEdits(updated);
                    }}
                    placeholder="Height"
                    className="px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded dark:bg-gray-700"
                  />
                </div>
              </div>
            ))}

            {textEdits.length === 0 && imageEdits.length === 0 && shapeEdits.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                <Edit3 className="w-12 h-12 mx-auto mb-2 opacity-50" />
                <p>No elements added yet</p>
                <p className="text-sm">Add text, images, or shapes to get started</p>
              </div>
            )}
          </div>

          <button
            onClick={handleApplyEdits}
            disabled={!file || isProcessing || (textEdits.length === 0 && imageEdits.length === 0 && shapeEdits.length === 0)}
            className="w-full bg-orange-500 text-white py-3 rounded-lg font-semibold hover:bg-orange-600 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {isProcessing ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Processing...
              </>
            ) : (
              <>
                <Download className="w-5 h-5" />
                Apply Edits
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
