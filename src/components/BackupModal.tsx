import React, { useState, useRef } from 'react'
import {
  X,
  Download,
  Upload,
  FileSpreadsheet,
  FileText,
  Check,
  AlertTriangle,
  RefreshCw,
  HardDrive,
  Database,
  ArrowRight,
  ShieldCheck,
  Layers,
  Sparkles,
} from 'lucide-react'
import { useShopping } from '../context/ShoppingContext'

interface BackupModalProps {
  onClose: () => void
}

interface ParsedBackupInfo {
  isValid: boolean
  raw: any
  version?: number
  exportedAt?: number
  exportedAtFormatted?: string
  appName?: string
  householdName?: string
  itemsCount: number
  shopsCount: number
  categoriesCount: number
  receiptsCount: number
  errorMessage?: string
}

export const BackupModal: React.FC<BackupModalProps> = ({ onClose }) => {
  const { items, shops, categories, receipts, household, exportBackupData, exportToCSV, importBackupData } =
    useShopping()

  const [activeTab, setActiveTab] = useState<'export' | 'restore'>('export')
  const [downloadedJson, setDownloadedJson] = useState(false)
  const [downloadedCsv, setDownloadedCsv] = useState(false)

  // Restore state
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [selectedFileName, setSelectedFileName] = useState<string | null>(null)
  const [backupInfo, setBackupInfo] = useState<ParsedBackupInfo | null>(null)
  const [restoreMode, setRestoreMode] = useState<'merge' | 'replace'>('merge')
  const [isRestoring, setIsRestoring] = useState(false)
  const [restoreSuccess, setRestoreSuccess] = useState<string | null>(null)
  const [restoreError, setRestoreError] = useState<string | null>(null)

  // Trigger JSON download
  const handleDownloadJSON = () => {
    try {
      const data = exportBackupData()
      const jsonStr = JSON.stringify(data, null, 2)
      const blob = new Blob([jsonStr], { type: 'application/json;charset=utf-8;' })
      const url = URL.createObjectURL(blob)
      const dateStr = new Date().toISOString().slice(0, 10)
      const a = document.createElement('a')
      a.href = url
      a.download = `hashgroc-backup-${household.name.toLowerCase().replace(/[^a-z0-9]/g, '-') || 'grocery'}-${dateStr}.json`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)

      setDownloadedJson(true)
      setTimeout(() => setDownloadedJson(false), 3000)
    } catch (err: any) {
      alert(`Export failed: ${err.message || 'Unknown error'}`)
    }
  }

  // Trigger CSV download
  const handleDownloadCSV = () => {
    try {
      const csvContent = exportToCSV()
      // BOM for excel utf-8 compatibility
      const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' })
      const url = URL.createObjectURL(blob)
      const dateStr = new Date().toISOString().slice(0, 10)
      const a = document.createElement('a')
      a.href = url
      a.download = `hashgroc-catalog-matrix-${dateStr}.csv`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)

      setDownloadedCsv(true)
      setTimeout(() => setDownloadedCsv(false), 3000)
    } catch (err: any) {
      alert(`CSV export failed: ${err.message || 'Unknown error'}`)
    }
  }

  // Parse chosen JSON file
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    setRestoreSuccess(null)
    setRestoreError(null)

    if (!file) {
      setSelectedFileName(null)
      setBackupInfo(null)
      return
    }

    setSelectedFileName(file.name)
    const reader = new FileReader()
    reader.onload = (event) => {
      try {
        const text = event.target?.result as string
        const parsed = JSON.parse(text)

        const innerData = parsed.data || parsed
        const rawItems = Array.isArray(innerData.items) ? innerData.items : []
        const rawShops = Array.isArray(innerData.shops) ? innerData.shops : []
        const rawCats = Array.isArray(innerData.categories) ? innerData.categories : []
        const rawReceipts = Array.isArray(innerData.receipts) ? innerData.receipts : []

        if (rawItems.length === 0 && rawShops.length === 0) {
          setBackupInfo({
            isValid: false,
            raw: null,
            itemsCount: 0,
            shopsCount: 0,
            categoriesCount: 0,
            receiptsCount: 0,
            errorMessage: 'This JSON file does not contain valid HashGroc grocery items or stores.',
          })
          return
        }

        setBackupInfo({
          isValid: true,
          raw: parsed,
          version: parsed.version || 1,
          exportedAt: parsed.exportedAt,
          exportedAtFormatted: parsed.exportedAtFormatted,
          appName: parsed.appName,
          householdName: innerData.householdName,
          itemsCount: rawItems.length,
          shopsCount: rawShops.length,
          categoriesCount: rawCats.length,
          receiptsCount: rawReceipts.length,
        })
      } catch {
        setBackupInfo({
          isValid: false,
          raw: null,
          itemsCount: 0,
          shopsCount: 0,
          categoriesCount: 0,
          receiptsCount: 0,
          errorMessage: 'Invalid JSON file format. Please ensure you upload a valid backup .json file.',
        })
      }
    }

    reader.onerror = () => {
      setBackupInfo({
        isValid: false,
        raw: null,
        itemsCount: 0,
        shopsCount: 0,
        categoriesCount: 0,
        receiptsCount: 0,
        errorMessage: 'Failed to read file from disk.',
      })
    }

    reader.readAsText(file)
  }

  // Execute restore
  const handleExecuteRestore = async () => {
    if (!backupInfo?.isValid || !backupInfo.raw) return

    const confirmMsg =
      restoreMode === 'replace'
        ? `⚠️ Warning: "Replace All" will overwrite your current ${items.length} items with the ${backupInfo.itemsCount} items from this backup.\n\nAre you sure you want to proceed?`
        : `Merge ${backupInfo.itemsCount} items from backup with your current ${items.length} items? New items and prices will be combined safely.`

    if (!window.confirm(confirmMsg)) return

    setIsRestoring(true)
    setRestoreError(null)
    setRestoreSuccess(null)

    try {
      const result = await importBackupData(backupInfo.raw, restoreMode)
      setRestoreSuccess(
        `Successfully restored ${result.itemsCount} items and ${result.shopsCount} stores using "${restoreMode === 'replace' ? 'Replace All' : 'Merge'}" mode!`
      )
      // reset file input
      if (fileInputRef.current) fileInputRef.current.value = ''
      setSelectedFileName(null)
      setBackupInfo(null)
    } catch (err: any) {
      setRestoreError(err.message || 'Restore failed due to an unexpected error.')
    } finally {
      setIsRestoring(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-gradient-to-r from-slate-50 to-slate-100/50">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-emerald-600 text-white shadow-xs">
              <HardDrive className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">Backup & Restore</h2>
              <p className="text-xs text-slate-500">
                1-Click snapshot exports and data restoration
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-700 rounded-xl hover:bg-slate-200/60 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Switcher */}
        <div className="px-5 pt-3 border-b border-slate-100 bg-white">
          <div className="flex bg-slate-100/80 p-1 rounded-2xl">
            <button
              type="button"
              onClick={() => setActiveTab('export')}
              className={`flex-1 py-2 text-xs font-bold rounded-xl transition flex items-center justify-center gap-1.5 ${
                activeTab === 'export'
                  ? 'bg-white text-emerald-800 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Download className="w-4 h-4" />
              <span>Export & Backup</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('restore')}
              className={`flex-1 py-2 text-xs font-bold rounded-xl transition flex items-center justify-center gap-1.5 ${
                activeTab === 'restore'
                  ? 'bg-white text-emerald-800 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Upload className="w-4 h-4" />
              <span>Restore from File</span>
            </button>
          </div>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          {activeTab === 'export' && (
            <div className="space-y-4">
              {/* Current Catalog Summary Banner */}
              <div className="p-3.5 rounded-2xl bg-emerald-50/60 border border-emerald-100 flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <Database className="w-4 h-4 text-emerald-700 shrink-0" />
                  <span className="font-semibold text-emerald-950">Current Database:</span>
                </div>
                <div className="flex items-center gap-2.5 font-medium text-emerald-900">
                  <span><b>{items.length}</b> items</span>
                  <span>•</span>
                  <span><b>{shops.length}</b> stores</span>
                  <span>•</span>
                  <span><b>{categories.length}</b> categories</span>
                  <span>•</span>
                  <span><b>{receipts.length}</b> receipts</span>
                </div>
              </div>

              {/* 1. Full JSON Backup Card */}
              <div className="p-4 rounded-2xl border border-slate-200/90 bg-white shadow-2xs hover:border-slate-300 transition">
                <div className="flex items-start justify-between gap-3 mb-2">
                  <div className="flex items-center gap-2.5">
                    <div className="p-2 rounded-xl bg-indigo-50 text-indigo-700 shrink-0">
                      <FileText className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-slate-900">Full JSON Backup</h3>
                      <p className="text-xs text-slate-500">
                        Complete snapshot of items, store prices, aisles, weekly staples & receipts.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="text-[11px] text-slate-500 bg-slate-50 rounded-xl p-2.5 mb-3 space-y-1">
                  <div className="flex items-center gap-1.5 text-slate-700 font-medium">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    <span>Self-contained backup format — can be restored at any time.</span>
                  </div>
                  <div>• Preserves store custom aisle ordering and unit prices</div>
                  <div>• Includes past shopping receipts and spend history</div>
                </div>

                <button
                  type="button"
                  onClick={handleDownloadJSON}
                  className="w-full py-2.5 px-4 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition flex items-center justify-center gap-2 shadow-xs cursor-pointer"
                >
                  {downloadedJson ? (
                    <>
                      <Check className="w-4 h-4 text-emerald-400" />
                      <span>Backup Downloaded!</span>
                    </>
                  ) : (
                    <>
                      <Download className="w-4 h-4" />
                      <span>Download JSON Backup (.json)</span>
                    </>
                  )}
                </button>
              </div>

              {/* 2. Spreadsheet CSV Export Card */}
              <div className="p-4 rounded-2xl border border-slate-200/90 bg-white shadow-2xs hover:border-slate-300 transition">
                <div className="flex items-start justify-between gap-3 mb-2">
                  <div className="flex items-center gap-2.5">
                    <div className="p-2 rounded-xl bg-emerald-50 text-emerald-700 shrink-0">
                      <FileSpreadsheet className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-slate-900">Store Comparison Spreadsheet</h3>
                      <p className="text-xs text-slate-500">
                        Tabular price matrix export for Excel, Google Sheets, or Numbers.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="text-[11px] text-slate-500 bg-slate-50 rounded-xl p-2.5 mb-3 space-y-1">
                  <div>• Item Name, Category, Quantity, Unit & Shopping List Status</div>
                  <div>• Column breakdown per store: Price ($), Aisle location, and Carried status</div>
                </div>

                <button
                  type="button"
                  onClick={handleDownloadCSV}
                  className="w-full py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition flex items-center justify-center gap-2 shadow-xs cursor-pointer"
                >
                  {downloadedCsv ? (
                    <>
                      <Check className="w-4 h-4 text-emerald-200" />
                      <span>Spreadsheet Downloaded!</span>
                    </>
                  ) : (
                    <>
                      <Download className="w-4 h-4" />
                      <span>Download Spreadsheet (.csv)</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          )}

          {activeTab === 'restore' && (
            <div className="space-y-4">
              {/* Status alerts */}
              {restoreSuccess && (
                <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs flex items-center gap-2.5 animate-in fade-in">
                  <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span className="font-medium">{restoreSuccess}</span>
                </div>
              )}

              {restoreError && (
                <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-900 text-xs flex items-center gap-2.5 animate-in fade-in">
                  <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
                  <span className="font-medium">{restoreError}</span>
                </div>
              )}

              {/* Upload picker container */}
              <div
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-slate-300 hover:border-emerald-500 bg-slate-50/70 hover:bg-emerald-50/30 rounded-2xl p-6 text-center cursor-pointer transition flex flex-col items-center justify-center gap-2 group"
              >
                <input
                  type="file"
                  ref={fileInputRef}
                  accept=".json,application/json"
                  className="hidden"
                  onChange={handleFileChange}
                />
                <div className="p-3 rounded-full bg-white shadow-xs group-hover:scale-110 transition text-emerald-600">
                  <Upload className="w-6 h-6" />
                </div>
                <div>
                  <div className="text-xs font-bold text-slate-800">
                    {selectedFileName ? selectedFileName : 'Click or tap to choose backup file (.json)'}
                  </div>
                  <div className="text-[11px] text-slate-400 mt-0.5">
                    Accepts HashGroc JSON backup files exported previously
                  </div>
                </div>
              </div>

              {/* File validation & preview */}
              {backupInfo && (
                <div className="animate-in fade-in duration-150">
                  {backupInfo.isValid ? (
                    <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
                      <div className="flex items-center justify-between pb-2 border-b border-slate-200">
                        <div className="flex items-center gap-2">
                          <Sparkles className="w-4 h-4 text-emerald-600" />
                          <span className="text-xs font-bold text-slate-900">Backup File Verified</span>
                        </div>
                        {backupInfo.exportedAtFormatted && (
                          <span className="text-[10px] text-slate-500 font-medium">
                            {new Date(backupInfo.exportedAtFormatted).toLocaleDateString()}
                          </span>
                        )}
                      </div>

                      <div className="grid grid-cols-2 gap-2 text-xs">
                        <div className="p-2.5 bg-white rounded-xl border border-slate-200/80">
                          <div className="text-[10px] text-slate-400 uppercase font-semibold">Catalog Items</div>
                          <div className="text-base font-extrabold text-slate-900">
                            {backupInfo.itemsCount}
                          </div>
                        </div>
                        <div className="p-2.5 bg-white rounded-xl border border-slate-200/80">
                          <div className="text-[10px] text-slate-400 uppercase font-semibold">Stores</div>
                          <div className="text-base font-extrabold text-slate-900">
                            {backupInfo.shopsCount}
                          </div>
                        </div>
                        <div className="p-2.5 bg-white rounded-xl border border-slate-200/80">
                          <div className="text-[10px] text-slate-400 uppercase font-semibold">Categories</div>
                          <div className="text-base font-extrabold text-slate-900">
                            {backupInfo.categoriesCount || categories.length}
                          </div>
                        </div>
                        <div className="p-2.5 bg-white rounded-xl border border-slate-200/80">
                          <div className="text-[10px] text-slate-400 uppercase font-semibold">Receipt History</div>
                          <div className="text-base font-extrabold text-slate-900">
                            {backupInfo.receiptsCount}
                          </div>
                        </div>
                      </div>

                      {/* Restore Strategy Radio Choice */}
                      <div className="pt-2">
                        <div className="text-xs font-bold text-slate-800 mb-2">Select Restore Strategy:</div>
                        <div className="space-y-2">
                          {/* Option 1: Merge */}
                          <label
                            className={`flex items-start gap-3 p-3 rounded-xl border cursor-pointer transition text-left ${
                              restoreMode === 'merge'
                                ? 'bg-emerald-50/70 border-emerald-300 shadow-2xs'
                                : 'bg-white border-slate-200 hover:border-slate-300'
                            }`}
                          >
                            <input
                              type="radio"
                              name="restoreMode"
                              checked={restoreMode === 'merge'}
                              onChange={() => setRestoreMode('merge')}
                              className="mt-0.5 text-emerald-600 focus:ring-emerald-500"
                            />
                            <div>
                              <div className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                                <span>Merge with Existing</span>
                                <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-100 px-1.5 py-0.2 rounded-md">
                                  Safe & Recommended
                                </span>
                              </div>
                              <div className="text-[11px] text-slate-500 mt-0.5">
                                Adds new items from the backup and fills missing store prices without deleting your existing items.
                              </div>
                            </div>
                          </label>

                          {/* Option 2: Replace */}
                          <label
                            className={`flex items-start gap-3 p-3 rounded-xl border cursor-pointer transition text-left ${
                              restoreMode === 'replace'
                                ? 'bg-amber-50/70 border-amber-300 shadow-2xs'
                                : 'bg-white border-slate-200 hover:border-slate-300'
                            }`}
                          >
                            <input
                              type="radio"
                              name="restoreMode"
                              checked={restoreMode === 'replace'}
                              onChange={() => setRestoreMode('replace')}
                              className="mt-0.5 text-amber-600 focus:ring-amber-500"
                            />
                            <div>
                              <div className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                                <span>Replace All Current Data</span>
                                <span className="text-[10px] font-semibold text-amber-700 bg-amber-100 px-1.5 py-0.2 rounded-md">
                                  Overwrites List
                                </span>
                              </div>
                              <div className="text-[11px] text-slate-500 mt-0.5">
                                Replaces your entire current catalog and store settings with the exact state from this backup file.
                              </div>
                            </div>
                          </label>
                        </div>
                      </div>

                      {/* Restore Action Button */}
                      <button
                        type="button"
                        onClick={handleExecuteRestore}
                        disabled={isRestoring}
                        className={`w-full mt-2 py-2.5 px-4 rounded-xl text-white text-xs font-bold transition flex items-center justify-center gap-2 shadow-xs cursor-pointer ${
                          restoreMode === 'replace'
                            ? 'bg-amber-600 hover:bg-amber-700'
                            : 'bg-emerald-600 hover:bg-emerald-700'
                        } ${isRestoring ? 'opacity-75 cursor-not-allowed' : ''}`}
                      >
                        {isRestoring ? (
                          <>
                            <RefreshCw className="w-4 h-4 animate-spin" />
                            <span>Restoring Data...</span>
                          </>
                        ) : (
                          <>
                            <span>
                              {restoreMode === 'replace' ? 'Confirm Replace All' : 'Execute Safe Merge'}
                            </span>
                            <ArrowRight className="w-4 h-4" />
                          </>
                        )}
                      </button>
                    </div>
                  ) : (
                    <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-900 text-xs flex items-center gap-2.5">
                      <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
                      <div>
                        <div className="font-bold">Invalid Backup File</div>
                        <div className="text-[11px] text-rose-700 mt-0.5">{backupInfo.errorMessage}</div>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-5 py-3 border-t border-slate-100 bg-slate-50 flex items-center justify-between">
          <div className="text-[11px] text-slate-400 flex items-center gap-1">
            <Layers className="w-3.5 h-3.5" />
            <span>Encrypted in transit & synced to cloud</span>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-800 text-xs font-bold transition cursor-pointer"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  )
}
