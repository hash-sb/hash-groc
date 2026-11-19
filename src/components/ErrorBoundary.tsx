import React from 'react'
import { AlertTriangle, RotateCcw, Download, ShieldCheck } from 'lucide-react'

interface ErrorBoundaryState {
  hasError: boolean
  errorMessage: string
}

export class ErrorBoundary extends React.Component<
  { children: React.ReactNode },
  ErrorBoundaryState
> {
  constructor(props: { children: React.ReactNode }) {
    super(props)
    this.state = {
      hasError: false,
      errorMessage: '',
    }
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return {
      hasError: true,
      errorMessage: error?.message || 'An unexpected application error occurred.',
    }
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('HashGroc ErrorBoundary caught an error:', error, errorInfo)
  }

  handleEmergencyExport = () => {
    try {
      const payload = {
        exportedAt: new Date().toISOString(),
        items: JSON.parse(localStorage.getItem('grocery_items_v1') || '[]'),
        shops: JSON.parse(localStorage.getItem('grocery_shops_v1') || '[]'),
        household: JSON.parse(localStorage.getItem('grocery_household_v1') || 'null'),
        receipts: JSON.parse(localStorage.getItem('grocery_receipts_v1') || '[]'),
      }
      const blob = new Blob([JSON.stringify(payload, null, 2)], {
        type: 'application/json',
      })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `hashgroc-emergency-backup-${new Date().toISOString().slice(0, 10)}.json`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
    } catch (e) {
      console.error('Emergency backup export failed:', e)
    }
  }

  render() {
    if (!this.state.hasError) {
      return this.props.children
    }

    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4 font-sans">
        <div className="bg-white rounded-3xl max-w-md w-full shadow-2xl border border-slate-200 overflow-hidden">
          <div className="p-5 bg-gradient-to-r from-amber-50 via-orange-50 to-amber-50 border-b border-slate-200 flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-amber-500 text-white flex items-center justify-center shrink-0 shadow-xs">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-base sm:text-lg font-extrabold text-slate-900">
                Something Went Wrong
              </h1>
              <p className="text-xs text-slate-500">
                Your grocery list and store prices are safely preserved on your device.
              </p>
            </div>
          </div>

          <div className="p-5 space-y-4">
            <div className="p-3.5 rounded-2xl bg-emerald-50/80 border border-emerald-200 flex items-start gap-2.5 text-xs text-emerald-900">
              <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold">Zero Data Loss Guarantee:</span> You can reload the app below or download a full backup snapshot of your grocery data first.
              </div>
            </div>

            {this.state.errorMessage && (
              <div className="p-3 rounded-xl bg-slate-100 border border-slate-200 font-mono text-[11px] text-slate-600 break-words max-h-24 overflow-y-auto">
                {this.state.errorMessage}
              </div>
            )}

            <div className="space-y-2 pt-1">
              <button
                type="button"
                onClick={() => window.location.reload()}
                className="w-full py-3 px-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl text-xs sm:text-sm font-bold shadow-md transition flex items-center justify-center gap-2 cursor-pointer"
              >
                <RotateCcw className="w-4 h-4" />
                <span>Reload HashGroc</span>
              </button>

              <button
                type="button"
                onClick={this.handleEmergencyExport}
                className="w-full py-2.5 px-4 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 rounded-2xl text-xs font-bold transition flex items-center justify-center gap-2 cursor-pointer"
              >
                <Download className="w-4 h-4 text-emerald-600" />
                <span>Download Emergency Data Backup (.json)</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    )
  }
}
