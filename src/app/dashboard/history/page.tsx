import { createClient } from '@/lib/supabase/server'
import { formatFileSize } from '@/lib/utils'
import { 
  FileText, 
  ArrowLeft, 
  Clock, 
  CheckCircle, 
  XCircle, 
  Scissors, 
  Link2, 
  RotateCw, 
  Image as ImageIcon, 
  Package, 
  Lock, 
  Info 
} from 'lucide-react'
import Link from 'next/link'
import { redirect } from 'next/navigation'

export const dynamic = 'force-dynamic'

const toolConfig: Record<string, { label: string; colorClass: string; icon: any }> = {
  'Split': { label: 'Split PDF', colorClass: 'text-purple-600 bg-purple-50 dark:bg-purple-900/20 dark:text-purple-400', icon: Scissors },
  'Merge': { label: 'Merge PDF', colorClass: 'text-blue-600 bg-blue-50 dark:bg-blue-900/20 dark:text-blue-400', icon: Link2 },
  'Rotate': { label: 'Rotate & Reorder', colorClass: 'text-orange-600 bg-orange-50 dark:bg-orange-900/20 dark:text-orange-400', icon: RotateCw },
  'Extract Images': { label: 'Extract Images', colorClass: 'text-pink-600 bg-pink-50 dark:bg-pink-900/20 dark:text-pink-400', icon: ImageIcon },
  'Compress': { label: 'Compress PDF', colorClass: 'text-indigo-600 bg-indigo-50 dark:bg-indigo-900/20 dark:text-indigo-400', icon: Package },
  'Protect': { label: 'Protect PDF', colorClass: 'text-red-600 bg-red-50 dark:bg-red-900/20 dark:text-red-400', icon: Lock },
  'Convert': { label: 'Convert PDF', colorClass: 'text-green-600 bg-green-50 dark:bg-green-900/20 dark:text-green-400', icon: FileText },
  'Edit Metadata': { label: 'Edit Metadata', colorClass: 'text-teal-600 bg-teal-50 dark:bg-teal-900/20 dark:text-teal-400', icon: FileText },
}

export default async function HistoryPage() {
  const supabase = createClient()
  const { data: { session } } = await supabase.auth.getSession()

  if (!session) {
    redirect('/login')
  }

  const { data: history, error } = await supabase
    .from('pdf_history')
    .select('*')
    .eq('user_id', session.user.id)
    .order('created_at', { ascending: false })

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <Link href="/dashboard" className="inline-flex items-center text-sm font-medium text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100 mb-6">
        <ArrowLeft className="w-4 h-4 mr-1" />
        Back to Dashboard
      </Link>

      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2 flex items-center">
          <Clock className="w-8 h-8 mr-3 text-primary-500" />
          Processing History
        </h1>
        <p className="text-slate-600 dark:text-slate-400">
          View history of your processed PDF files.
        </p>
      </div>

      {error ? (
        <div className="bg-red-50 dark:bg-red-900/25 border border-red-200 dark:border-red-800 rounded-xl p-6 text-red-800 dark:text-red-400 flex items-start gap-3">
          <XCircle className="w-6 h-6 shrink-0" />
          <div>
            <h3 className="font-semibold">Failed to load history</h3>
            <p className="text-sm mt-1">{error.message || 'An unexpected error occurred.'}</p>
          </div>
        </div>
      ) : !history || history.length === 0 ? (
        <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-12 text-center">
          <Info className="w-12 h-12 text-slate-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">No History Yet</h3>
          <p className="text-slate-500 dark:text-slate-400 max-w-sm mx-auto mb-6">
            You haven&apos;t processed any PDF files yet. Try using some of our PDF tools from the dashboard!
          </p>
          <Link 
            href="/dashboard" 
            className="bg-primary-500 hover:bg-primary-600 text-white px-6 py-3 rounded-lg font-semibold inline-block transition-colors"
          >
            Go to Dashboard
          </Link>
        </div>
      ) : (
        <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50">
                  <th className="px-6 py-4 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Date & Time</th>
                  <th className="px-6 py-4 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Tool Used</th>
                  <th className="px-6 py-4 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">File Name</th>
                  <th className="px-6 py-4 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">File Size</th>
                  <th className="px-6 py-4 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Pages</th>
                  <th className="px-6 py-4 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Duration</th>
                  <th className="px-6 py-4 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
                {history.map((item: any) => {
                  const tool = toolConfig[item.tool_used] || { label: item.tool_used, colorClass: 'text-slate-600 bg-slate-50 dark:bg-slate-900/20 dark:text-slate-400', icon: FileText };
                  const ToolIcon = tool.icon;
                  const date = new Date(item.created_at);

                  return (
                    <tr key={item.id} className="hover:bg-slate-50 dark:hover:bg-slate-900/30 transition-colors">
                      <td className="px-6 py-4 text-sm text-slate-500 dark:text-slate-400 whitespace-nowrap">
                        {date.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}
                        <span className="block text-xs opacity-75">
                          {date.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium ${tool.colorClass}`}>
                          <ToolIcon className="w-3.5 h-3.5" />
                          {tool.label}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm font-medium text-slate-900 dark:text-white max-w-xs truncate" title={item.file_name}>
                        {item.file_name}
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-500 dark:text-slate-400 whitespace-nowrap">
                        {formatFileSize(item.file_size)}
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-500 dark:text-slate-400 whitespace-nowrap">
                        {item.pages_count !== null ? `${item.pages_count} pages` : '-'}
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-500 dark:text-slate-400 whitespace-nowrap">
                        {item.processing_time !== null ? `${(item.processing_time / 1000).toFixed(2)}s` : '-'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {item.success ? (
                          <span className="inline-flex items-center gap-1 text-xs font-semibold text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-950/30 px-2 py-1 rounded">
                            <CheckCircle className="w-4 h-4" />
                            Success
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-xs font-semibold text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950/30 px-2 py-1 rounded" title={item.error_message || undefined}>
                            <XCircle className="w-4 h-4" />
                            Failed
                          </span>
                        )}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}
