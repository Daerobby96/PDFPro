"use client";

import React, { useState, useEffect } from 'react';
import { PdfUploader } from '@/components/pdf/PdfUploader';
import { PDFFile, downloadFile } from '@/lib/pdf/core';
import { fillPDFForm, getFormFields, FormField } from '@/lib/pdf/form-filler';
import { FileEdit, Download, Loader2, ArrowLeft, Search, Plus, Trash2 } from 'lucide-react';
import Link from 'next/link';
import { useToast } from '@/components/ui/use-toast';
import { useSharedFile } from '@/context/FileContext';

export default function FormFillerPage() {
  const [file, setFile] = useState<PDFFile | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isScanning, setIsScanning] = useState(false);
  const [detectedFields, setDetectedFields] = useState<Array<{ name: string; type: string; value?: string | boolean }>>([]);
  const [formFields, setFormFields] = useState<FormField[]>([]);
  const [flatten, setFlatten] = useState(true);
  
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
      setDetectedFields([]);
      setFormFields([]);
    } catch (error) {
      console.error('Error loading PDF:', error);
      toast({
        title: "Error loading PDF",
        description: "Please try again with a valid PDF file.",
        variant: "destructive",
      });
    }
  };

  const scanFormFields = async () => {
    if (!file) return;
    
    setIsScanning(true);
    try {
      const fields = await getFormFields(new Uint8Array(await file.file.arrayBuffer()));
      
      if (fields.length === 0) {
        toast({
          title: "No form fields found",
          description: "This PDF doesn't contain any fillable form fields",
          variant: "destructive",
        });
      } else {
        setDetectedFields(fields);
        // Initialize form fields with detected fields
        const initialFields: FormField[] = fields.map(f => ({
          name: f.name,
          value: f.type === 'PDFCheckBox' ? false : ''
        }));
        setFormFields(initialFields);
        
        toast({
          title: "Form fields detected!",
          description: `Found ${fields.length} fillable field(s)`,
        });
      }
    } catch (error: any) {
      console.error('Error scanning fields:', error);
      toast({
        title: "Failed to scan form fields",
        description: error.message || "Please try again",
        variant: "destructive",
      });
    } finally {
      setIsScanning(false);
    }
  };

  const updateFieldValue = (name: string, value: string | boolean) => {
    const updated = formFields.map(f =>
      f.name === name ? { ...f, value } : f
    );
    setFormFields(updated);
  };

  const addManualField = () => {
    setFormFields([
      ...formFields,
      { name: '', value: '' }
    ]);
  };

  const removeField = (index: number) => {
    setFormFields(formFields.filter((_, i) => i !== index));
  };

  const handleFillForm = async () => {
    if (!file) return;
    
    if (formFields.length === 0) {
      toast({
        title: "No fields to fill",
        description: "Please scan for fields or add them manually",
        variant: "destructive",
      });
      return;
    }
    
    setIsProcessing(true);
    const startTime = Date.now();
    
    try {
      const filledPdf = await fillPDFForm(new Uint8Array(await file.file.arrayBuffer()), {
        fields: formFields.filter(f => f.name.trim() !== ''),
        flatten,
      });
      
      const processingTime = Date.now() - startTime;
      
      downloadFile(new Blob([filledPdf.buffer as ArrayBuffer], { type: 'application/pdf' }), `filled-${file.name}`);
      
      toast({
        title: "Form filled successfully!",
        description: `Processing time: ${(processingTime / 1000).toFixed(2)}s`,
      });
    } catch (error: any) {
      console.error('Form filling error:', error);
      toast({
        title: "Failed to fill form",
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
          <div className="w-12 h-12 bg-indigo-100 dark:bg-indigo-900/20 rounded-xl flex items-center justify-center">
            <FileEdit className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Fill PDF Form</h1>
            <p className="text-gray-600 dark:text-gray-400">Automatically fill PDF form fields</p>
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

              <div className="mt-6">
                <button
                  onClick={scanFormFields}
                  disabled={isScanning}
                  className="w-full bg-indigo-500 text-white py-3 rounded-lg font-semibold hover:bg-indigo-600 disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {isScanning ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Scanning...
                    </>
                  ) : (
                    <>
                      <Search className="w-5 h-5" />
                      Scan Form Fields
                    </>
                  )}
                </button>
              </div>

              {detectedFields.length > 0 && (
                <div className="mt-6 p-4 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
                  <p className="text-sm text-green-800 dark:text-green-200 font-medium mb-2">
                    ✓ Found {detectedFields.length} field(s):
                  </p>
                  <ul className="text-xs text-green-700 dark:text-green-300 space-y-1">
                    {detectedFields.slice(0, 5).map((field, i) => (
                      <li key={i} className="truncate">
                        • {field.name} ({field.type.replace('PDF', '')})
                      </li>
                    ))}
                    {detectedFields.length > 5 && (
                      <li className="text-green-600 dark:text-green-400">
                        ... and {detectedFields.length - 5} more
                      </li>
                    )}
                  </ul>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Right Column - Form Fields */}
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Form Fields</h3>
            <button
              onClick={addManualField}
              className="flex items-center gap-2 px-4 py-2 bg-indigo-500 text-white rounded-lg hover:bg-indigo-600 text-sm font-medium"
            >
              <Plus className="w-4 h-4" />
              Add Field
            </button>
          </div>

          <div className="mb-6 max-h-96 overflow-y-auto space-y-3">
            {formFields.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <FileEdit className="w-12 h-12 mx-auto mb-2 opacity-50" />
                <p>No form fields yet</p>
                <p className="text-sm">Scan the PDF or add fields manually</p>
              </div>
            ) : (
              formFields.map((field, index) => {
                const detectedField = detectedFields.find(f => f.name === field.name);
                const isCheckbox = detectedField?.type === 'PDFCheckBox';
                
                return (
                  <div key={index} className="p-3 border border-gray-200 dark:border-gray-700 rounded-lg">
                    <div className="flex items-start gap-2">
                      <div className="flex-1">
                        <input
                          type="text"
                          value={field.name}
                          onChange={(e) => {
                            const updated = [...formFields];
                            updated[index].name = e.target.value;
                            setFormFields(updated);
                          }}
                          placeholder="Field name"
                          className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 mb-2"
                        />
                        {isCheckbox ? (
                          <label className="flex items-center gap-2 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={field.value as boolean}
                              onChange={(e) => updateFieldValue(field.name, e.target.checked)}
                              className="w-4 h-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                            />
                            <span className="text-sm text-gray-700 dark:text-gray-300">Checked</span>
                          </label>
                        ) : (
                          <input
                            type="text"
                            value={field.value as string}
                            onChange={(e) => updateFieldValue(field.name, e.target.value)}
                            placeholder="Field value"
                            className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700"
                          />
                        )}
                        {detectedField && (
                          <p className="text-xs text-gray-500 mt-1">
                            Type: {detectedField.type.replace('PDF', '')}
                          </p>
                        )}
                      </div>
                      <button
                        onClick={() => removeField(index)}
                        className="text-red-500 hover:text-red-600 mt-2"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          <div className="mb-6">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={flatten}
                onChange={(e) => setFlatten(e.target.checked)}
                className="w-4 h-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
              />
              <span className="text-sm text-gray-700 dark:text-gray-300">
                Flatten form (make fields non-editable)
              </span>
            </label>
          </div>

          <button
            onClick={handleFillForm}
            disabled={!file || isProcessing || formFields.length === 0}
            className="w-full bg-indigo-500 text-white py-3 rounded-lg font-semibold hover:bg-indigo-600 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {isProcessing ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Processing...
              </>
            ) : (
              <>
                <Download className="w-5 h-5" />
                Fill Form
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
