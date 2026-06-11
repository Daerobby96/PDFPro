"use client";

import React, { useState, useCallback } from 'react';
import { CheckCircle, XCircle, Info, X } from 'lucide-react';

export type ToastVariant = 'default' | 'destructive' | 'success';

interface Toast {
  id: number;
  title: string;
  description?: string;
  variant?: ToastVariant;
}

let toastCounter = 0;

// Global toast state (simple pub-sub)
type Listener = (toasts: Toast[]) => void;
let listeners: Listener[] = [];
let currentToasts: Toast[] = [];

const notifyListeners = () => {
  listeners.forEach(l => l([...currentToasts]));
};

export const toast = ({ title, description, variant = 'default' }: Omit<Toast, 'id'>) => {
  const id = ++toastCounter;
  currentToasts = [...currentToasts, { id, title, description, variant }];
  notifyListeners();
  // Auto-dismiss after 5 seconds
  setTimeout(() => {
    currentToasts = currentToasts.filter(t => t.id !== id);
    notifyListeners();
  }, 5000);
};

export const useToast = () => {
  return { toast };
};

// Toaster component — mount once in layout
export const Toaster: React.FC = () => {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [mounted, setMounted] = useState(false);

  React.useEffect(() => {
    setMounted(true);
    const listener = (newToasts: Toast[]) => setToasts(newToasts);
    listeners.push(listener);
    return () => {
      listeners = listeners.filter(l => l !== listener);
    };
  }, []);

  const dismiss = (id: number) => {
    currentToasts = currentToasts.filter(t => t.id !== id);
    notifyListeners();
  };

  if (!mounted || toasts.length === 0) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 max-w-sm w-full">
      {toasts.map(t => {
        const isError = t.variant === 'destructive';
        const isSuccess = t.variant === 'success';

        return (
          <div
            key={t.id}
            className={`flex items-start gap-3 p-4 rounded-xl shadow-lg border text-sm animate-in slide-in-from-bottom-4 fade-in
              ${isError
                ? 'bg-red-50 dark:bg-red-900/30 border-red-200 dark:border-red-800 text-red-800 dark:text-red-200'
                : isSuccess
                  ? 'bg-green-50 dark:bg-green-900/30 border-green-200 dark:border-green-800 text-green-800 dark:text-green-200'
                  : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white'
              }`}
          >
            <div className="shrink-0 mt-0.5">
              {isError ? (
                <XCircle className="w-5 h-5 text-red-500" />
              ) : isSuccess ? (
                <CheckCircle className="w-5 h-5 text-green-500" />
              ) : (
                <Info className="w-5 h-5 text-blue-500" />
              )}
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-semibold">{t.title}</p>
              {t.description && <p className="text-xs mt-0.5 opacity-80">{t.description}</p>}
            </div>
            <button
              onClick={() => dismiss(t.id)}
              className="shrink-0 opacity-50 hover:opacity-100 transition-opacity"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        );
      })}
    </div>
  );
};
