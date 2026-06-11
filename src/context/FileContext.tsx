"use client"

import React, { createContext, useContext, useState } from 'react'

interface FileContextType {
  sharedFile: File | null
  setSharedFile: (file: File | null) => void
}

const FileContext = createContext<FileContextType | undefined>(undefined)

export function FileProvider({ children }: { children: React.ReactNode }) {
  const [sharedFile, setSharedFile] = useState<File | null>(null)

  return (
    <FileContext.Provider value={{ sharedFile, setSharedFile }}>
      {children}
    </FileContext.Provider>
  )
}

export function useSharedFile() {
  const context = useContext(FileContext)
  if (context === undefined) {
    throw new Error('useSharedFile must be used within a FileProvider')
  }
  return context
}
