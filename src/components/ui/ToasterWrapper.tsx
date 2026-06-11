"use client";

import dynamic from 'next/dynamic';

const Toaster = dynamic(
  () => import('@/components/ui/use-toast').then(mod => mod.Toaster),
  { ssr: false }
);

export default function ToasterWrapper() {
  return <Toaster />;
}
