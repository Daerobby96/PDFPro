'use client'

import { useState } from 'react'
import Link from 'next/link'
import { 
  Scissors, 
  Link as LinkIcon, 
  FileType, 
  RotateCw, 
  Package, 
  Lock,
  Image as ImageIcon,
  FileText,
  Upload,
  FileImage
} from 'lucide-react'
import { useSharedFile } from '@/context/FileContext'

export default function DashboardPage() {
  const { sharedFile: file, setSharedFile: setFile } = useSharedFile()
  const [isDragging, setIsDragging] = useState(false)

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }

  const handleDragLeave = () => {
    setIsDragging(false)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    
    const files = Array.from(e.dataTransfer.files)
    const pdfFile = files.find(f => f.type === 'application/pdf')
    
    if (pdfFile) {
      setFile(pdfFile)
    }
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (files && files[0]) {
      setFile(files[0])
    }
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          PDF Tools Dashboard
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Upload a PDF to get started with any tool
        </p>
      </div>

      {/* Upload Area */}
      <div 
        className={`mb-12 border-2 border-dashed rounded-xl p-12 text-center transition ${
          isDragging 
            ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20' 
            : 'border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800'
        }`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <Upload className="w-16 h-16 text-gray-400 mx-auto mb-4" />
        
        {!file ? (
          <>
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              Drop your PDF here
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              or click to browse
            </p>
            <label className="inline-block">
              <input
                type="file"
                accept="application/pdf"
                onChange={handleFileChange}
                className="hidden"
              />
              <span className="bg-primary-500 text-white px-6 py-3 rounded-lg font-semibold hover:bg-primary-600 cursor-pointer inline-block">
                Choose File
              </span>
            </label>
          </>
        ) : (
          <>
            <FileText className="w-16 h-16 text-primary-500 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              {file.name}
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              {(file.size / 1024 / 1024).toFixed(2)} MB
            </p>
            <button
              onClick={() => setFile(null)}
              className="text-red-500 hover:text-red-600 font-medium"
            >
              Remove file
            </button>
          </>
        )}
      </div>

      {/* Tools Grid */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
          Available Tools
        </h2>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          <ToolCard
            icon={<Scissors className="w-8 h-8" />}
            title="Split PDF"
            description="Split by pages, size, or bookmarks"
            href="/dashboard/tools/split"
            color="purple"
          />
          
          <ToolCard
            icon={<LinkIcon className="w-8 h-8" />}
            title="Merge PDF"
            description="Combine multiple PDFs into one"
            href="/dashboard/tools/merge"
            color="blue"
          />
          
          <ToolCard
            icon={<FileType className="w-8 h-8" />}
            title="Convert"
            description="PDF to Word, Excel, Markdown, HTML"
            href="/dashboard/tools/convert"
            color="green"
          />
          
          <ToolCard
            icon={<RotateCw className="w-8 h-8" />}
            title="Rotate & Reorder"
            description="Rotate pages and change order"
            href="/dashboard/tools/rotate"
            color="orange"
          />
          
          <ToolCard
            icon={<ImageIcon className="w-8 h-8" />}
            title="Extract Images"
            description="Get all images from PDF"
            href="/dashboard/tools/extract-images"
            color="pink"
          />
          
          <ToolCard
            icon={<Package className="w-8 h-8" />}
            title="Compress"
            description="Reduce file size up to 70%"
            href="/dashboard/tools/compress"
            color="indigo"
          />
          
          <ToolCard
            icon={<Lock className="w-8 h-8" />}
            title="Protect"
            description="Add password and permissions"
            href="/dashboard/tools/protect"
            color="red"
          />
          
          <ToolCard
            icon={<FileText className="w-8 h-8" />}
            title="Edit Metadata"
            description="Change title, author, keywords"
            href="/dashboard/tools/metadata"
            color="teal"
          />
          
          <ToolCard
            icon={<ImageIcon className="w-8 h-8" />}
            title="Image to PDF"
            description="Convert image files to clean PDF"
            href="/dashboard/tools/image-to-pdf"
            color="orange"
          />
          
          <ToolCard
            icon={<FileImage className="w-8 h-8" />}
            title="PDF to Image"
            description="Convert PDF pages to JPG/PNG"
            href="/dashboard/tools/pdf-to-image"
            color="blue"
          />
        </div>
      </div>

      {/* Stats */}
      <div className="mt-12 grid md:grid-cols-4 gap-6">
        <StatCard
          label="PDFs Processed"
          value="0"
          sublabel="This month"
        />
        <StatCard
          label="Storage Used"
          value="0 MB"
          sublabel="of 100 MB"
        />
        <StatCard
          label="Plan"
          value="Free"
          sublabel="Upgrade to Pro"
        />
        <StatCard
          label="Member Since"
          value="Today"
          sublabel="Welcome!"
        />
      </div>
    </div>
  )
}

function ToolCard({ 
  icon, 
  title, 
  description, 
  href, 
  color,
  disabled 
}: { 
  icon: React.ReactNode
  title: string
  description: string
  href: string
  color: string
  disabled?: boolean
}) {
  const colorClasses: Record<string, string> = {
    purple: 'text-purple-500 bg-purple-50 dark:bg-purple-900/20',
    blue: 'text-blue-500 bg-blue-50 dark:bg-blue-900/20',
    green: 'text-green-500 bg-green-50 dark:bg-green-900/20',
    orange: 'text-orange-500 bg-orange-50 dark:bg-orange-900/20',
    pink: 'text-pink-500 bg-pink-50 dark:bg-pink-900/20',
    indigo: 'text-indigo-500 bg-indigo-50 dark:bg-indigo-900/20',
    red: 'text-red-500 bg-red-50 dark:bg-red-900/20',
    teal: 'text-teal-500 bg-teal-50 dark:bg-teal-900/20',
  }

  const CardContent = (
    <div 
      className={`bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-200 dark:border-gray-700 transition ${
        disabled ? 'opacity-50 cursor-not-allowed' : 'hover:shadow-lg hover:border-primary-500/50 cursor-pointer'
      }`}
    >
      <div className={`w-14 h-14 rounded-lg ${colorClasses[color]} flex items-center justify-center mb-4`}>
        {icon}
      </div>
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
        {title}
      </h3>
      <p className="text-sm text-gray-600 dark:text-gray-400">
        {description}
      </p>
      {disabled && (
        <p className="text-xs text-orange-500 mt-2 font-medium">
          Coming Soon
        </p>
      )}
    </div>
  );

  if (disabled) {
    return CardContent;
  }

  return (
    <Link href={href} className="block">
      {CardContent}
    </Link>
  );
}

function StatCard({ label, value, sublabel }: { label: string; value: string; sublabel: string }) {
  return (
    <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-200 dark:border-gray-700">
      <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">{label}</div>
      <div className="text-2xl font-bold text-gray-900 dark:text-white mb-1">{value}</div>
      <div className="text-xs text-gray-500 dark:text-gray-500">{sublabel}</div>
    </div>
  )
}
