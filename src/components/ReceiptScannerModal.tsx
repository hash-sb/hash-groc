import React, { useState, useRef } from 'react'
import {
  X,
  Camera,
  Upload,
  Receipt,
  Sparkles,
  Check,
  AlertTriangle,
  Store,
  Key,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
} from 'lucide-react'
import { useShopping } from '../context/ShoppingContext'
import {
  parseReceiptWithGemini,
  getSampleReceiptData,
  getGeminiApiKey,
  saveGeminiApiKey,
  type ParsedReceiptResult,
} from '../utils/receiptOcr'
import { formatPrice } from '../utils/pricing'

interface ReceiptScannerModalProps {
  isOpen: boolean
  onClose: () => void
  initialShopId?: string
}

type ScanStep = 'upload' | 'analyzing' | 'review' | 'success'

const STORAGE_RECEIPT_SCANS_COUNT = 'hash_groc_receipt_scans_used'
const FREE_SCANS_LIMIT = 1

export const ReceiptScannerModal: React.FC<ReceiptScannerModalProps> = ({
  isOpen,
  onClose,
  initialShopId,
}) => {
  const {
    shops,
    items,
    updateItemShopDetail,
    addItem,
    recordTripReceipt,
    isPro,
    openUpgradeModal,
  } = useShopping()

  const [step, setStep] = useState<ScanStep>('upload')
  const [, setSelectedFile] = useState<File | null>(null)
  const [imagePreviewUrl, setImagePreviewUrl] = useState<string | null>(null)
  const [result, setResult] = useState<ParsedReceiptResult | null>(null)
  const [selectedShopId, setSelectedShopId] = useState<string>(initialShopId || shops[0]?.id || '')
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [isSaving, setIsSaving] = useState(false)
  const [showApiKeyInput, setShowApiKeyInput] = useState(false)
  const [apiKeyInput, setApiKeyInput] = useState(getGeminiApiKey())
  const [alsoLogReceipt, setAlsoLogReceipt] = useState(true)

  const cameraInputRef = useRef<HTMLInputElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  if (!isOpen) return null

  const getScansUsed = (): number => {
    return Number(localStorage.getItem(STORAGE_RECEIPT_SCANS_COUNT) || '0')
  }

  const incrementScansUsed = () => {
    const current = getScansUsed()
    localStorage.setItem(STORAGE_RECEIPT_SCANS_COUNT, String(current + 1))
  }

  const handleFileSelected = async (file: File) => {
    const scansUsed = getScansUsed()
    if (!isPro && scansUsed >= FREE_SCANS_LIMIT) {
      onClose()
      openUpgradeModal('receipt')
      return
    }

    setSelectedFile(file)
    const url = URL.createObjectURL(file)
    setImagePreviewUrl(url)
    setErrorMessage(null)
    setStep('analyzing')

    try {
      const parsed = await parseReceiptWithGemini(file, items, shops, apiKeyInput)
      setResult(parsed)
      if (parsed.matchedShopId) {
        setSelectedShopId(parsed.matchedShopId)
      } else if (initialShopId) {
        setSelectedShopId(initialShopId)
      }
      incrementScansUsed()
      setStep('review')
    } catch (err: any) {
      console.error('Receipt parse failed:', err)
      if (err.message === 'MISSING_API_KEY') {
        setErrorMessage(
          'Gemini API Key is required for live OCR. Please enter your free Gemini API key below or try a sample receipt.'
        )
        setShowApiKeyInput(true)
      } else {
        setErrorMessage(err.message || 'Failed to analyze receipt. Please try again with a clearer photo.')
      }
      setStep('upload')
    }
  }

  const handleLoadSample = (storeName: 'Costco' | 'Trader Joe’s' | 'ALDI') => {
    const scansUsed = getScansUsed()
    if (!isPro && scansUsed >= FREE_SCANS_LIMIT) {
      onClose()
      openUpgradeModal('receipt')
      return
    }

    setStep('analyzing')
    setErrorMessage(null)
    setTimeout(() => {
      const sample = getSampleReceiptData(storeName, items, shops)
      setResult(sample)
      if (sample.matchedShopId) {
        setSelectedShopId(sample.matchedShopId)
      }
      incrementScansUsed()
      setStep('review')
    }, 900)
  }

  const handleToggleItem = (itemId: string) => {
    if (!result) return
    setResult({
      ...result,
      items: result.items.map((i) =>
        i.id === itemId ? { ...i, selected: !i.selected } : i
      ),
    })
  }

  const handleItemPriceChange = (itemId: string, newPriceStr: string) => {
    if (!result) return
    const price = Math.max(0, parseFloat(newPriceStr) || 0)
    setResult({
      ...result,
      items: result.items.map((i) =>
        i.id === itemId ? { ...i, price } : i
      ),
    })
  }

  const handleItemNameChange = (itemId: string, newName: string) => {
    if (!result) return
    setResult({
      ...result,
      items: result.items.map((i) =>
        i.id === itemId ? { ...i, cleanedName: newName } : i
      ),
    })
  }

  const handleSaveApiKey = () => {
    saveGeminiApiKey(apiKeyInput)
    setShowApiKeyInput(false)
    setErrorMessage(null)
  }

  const handleApplyResults = async () => {
    if (!result || !selectedShopId) return
    setIsSaving(true)

    const selectedItems = result.items.filter((i) => i.selected)
    const currentShop = shops.find((s) => s.id === selectedShopId)
    const targetShopName = currentShop?.name || 'Selected Store'

    const purchasedRecords = []

    for (const pItem of selectedItems) {
      let catalogItemId = pItem.matchedItemId
      const parsedNum = pItem.packageSize ? parseFloat(pItem.packageSize) : null
      const numPackageSize = parsedNum !== null && !isNaN(parsedNum) ? parsedNum : null
      const unitSize = pItem.packageSize || undefined

      // If item is not in catalog, create it
      if (!catalogItemId) {
        try {
          catalogItemId = await addItem({
            name: pItem.cleanedName,
            category: pItem.category || 'Pantry',
            quantity: pItem.quantity || 1,
            unit: 'pieces',
            isNeeded: false,
            inCart: false,
            shops: {
              [selectedShopId]: {
                available: true,
                price: pItem.price,
                location: pItem.category || '',
                unitSize,
                packageSize: numPackageSize,
              },
            },
          })
        } catch (e) {
          console.error('Failed to auto-create item from receipt:', e)
        }
      } else {
        // Update existing item's price for this store
        try {
          await updateItemShopDetail(catalogItemId, selectedShopId, {
            available: true,
            price: pItem.price,
            ...(unitSize ? { unitSize } : {}),
            ...(numPackageSize !== null ? { packageSize: numPackageSize } : {}),
          })
        } catch (e) {
          console.error('Failed to update price for item:', e)
        }
      }

      if (catalogItemId) {
        purchasedRecords.push({
          itemId: catalogItemId,
          name: pItem.cleanedName,
          category: pItem.category || 'Pantry',
          quantity: pItem.quantity || 1,
          unit: 'pieces',
          packs: 1,
          price: pItem.price,
          totalPrice: pItem.price,
        })
      }
    }

    // Optionally log a completed trip receipt in Spending History
    if (alsoLogReceipt && purchasedRecords.length > 0) {
      try {
        const totalAmount = purchasedRecords.reduce((acc, i) => acc + i.price, 0)
        await recordTripReceipt({
          shopId: selectedShopId,
          shopName: targetShopName,
          shopColor: currentShop?.color || 'emerald',
          totalAmount: Number(totalAmount.toFixed(2)),
          itemsCount: purchasedRecords.length,
          items: purchasedRecords,
        })
      } catch (err) {
        console.error('Failed to log trip receipt from OCR:', err)
      }
    }

    setIsSaving(false)
    setStep('success')
  }

  const selectedCount = result?.items.filter((i) => i.selected).length || 0
  const selectedSum =
    result?.items
      .filter((i) => i.selected)
      .reduce((acc, i) => acc + i.price, 0) || 0

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-2.5 sm:p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200"
      onClick={(e) => {
        if (e.target === e.currentTarget && !isSaving) onClose()
      }}
    >
      <div
        className="relative bg-white rounded-3xl w-full max-w-lg shadow-2xl flex flex-col max-h-[92vh] overflow-hidden border border-slate-200 animate-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-200 bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-2xl bg-white/15 border border-white/20 flex items-center justify-center shadow-xs">
              <Receipt className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <h2 className="text-base sm:text-lg font-black tracking-tight leading-snug">
                  AI Receipt Scanner
                </h2>
                <span className="px-2 py-0.2 rounded-full bg-amber-400 text-slate-900 text-[10px] font-black uppercase tracking-wider shadow-2xs">
                  ✨ Vision OCR
                </span>
              </div>
              <p className="text-xs text-emerald-100/90 font-medium">
                Snap any receipt to auto-update store prices
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-white/80 hover:text-white rounded-xl hover:bg-white/10 transition cursor-pointer"
            title="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Hidden inputs for camera capture & file picker */}
        <input
          ref={cameraInputRef}
          type="file"
          accept="image/*"
          capture="environment"
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0]
            if (file) handleFileSelected(file)
          }}
        />
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0]
            if (file) handleFileSelected(file)
          }}
        />

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4">
          {/* STEP 1: Upload / Capture */}
          {step === 'upload' && (
            <div className="space-y-4">
              {/* Scan entitlement badge */}
              <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200/80 flex items-center justify-between gap-3 text-xs">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-emerald-600" />
                  <span className="font-bold text-slate-800">
                    {isPro
                      ? 'Groc Plus Unlimited AI Scans'
                      : getScansUsed() >= FREE_SCANS_LIMIT
                        ? '0 Free Scans Left'
                        : 'Free Tier: 1 Scan Included'}
                  </span>
                </div>
                {!isPro && (
                  <button
                    type="button"
                    onClick={() => {
                      onClose()
                      openUpgradeModal('receipt')
                    }}
                    className="text-emerald-700 font-extrabold hover:underline cursor-pointer"
                  >
                    Get Unlimited →
                  </button>
                )}
              </div>

              {errorMessage && (
                <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-2xl text-xs text-rose-800 flex items-start gap-2.5">
                  <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                  <div className="flex-1 leading-relaxed">{errorMessage}</div>
                </div>
              )}

              {/* Main Action Buttons */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => cameraInputRef.current?.click()}
                  className="p-5 rounded-3xl border-2 border-dashed border-emerald-500 bg-emerald-50/50 hover:bg-emerald-50 hover:border-emerald-600 text-emerald-900 flex flex-col items-center justify-center gap-2.5 transition active:scale-98 cursor-pointer shadow-xs group"
                >
                  <div className="w-12 h-12 rounded-2xl bg-emerald-600 group-hover:bg-emerald-700 text-white flex items-center justify-center shadow-md transition">
                    <Camera className="w-6 h-6 stroke-[2.2]" />
                  </div>
                  <div className="text-center">
                    <div className="text-sm font-extrabold">Take Receipt Photo</div>
                    <div className="text-[11px] text-emerald-700/80 font-medium mt-0.5">
                      Use phone camera in real-time
                    </div>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="p-5 rounded-3xl border border-slate-200 bg-slate-50/60 hover:bg-slate-100/80 hover:border-slate-300 text-slate-800 flex flex-col items-center justify-center gap-2.5 transition active:scale-98 cursor-pointer shadow-2xs group"
                >
                  <div className="w-12 h-12 rounded-2xl bg-slate-800 group-hover:bg-slate-900 text-white flex items-center justify-center shadow-md transition">
                    <Upload className="w-6 h-6 stroke-[2.2]" />
                  </div>
                  <div className="text-center">
                    <div className="text-sm font-extrabold">Choose from Library</div>
                    <div className="text-[11px] text-slate-500 font-medium mt-0.5">
                      Select photo or image file
                    </div>
                  </div>
                </button>
              </div>

              {/* Quick Sample Receipts for instant zero-config testing */}
              <div className="pt-2">
                <div className="text-xs font-bold text-slate-500 mb-2 flex items-center gap-1.5">
                  <span>⚡ Quick Test (Try sample receipts):</span>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => handleLoadSample('Costco')}
                    className="p-2.5 rounded-2xl border border-slate-200 bg-white hover:bg-slate-50 hover:border-slate-300 text-slate-800 text-xs font-bold text-center transition cursor-pointer shadow-2xs"
                  >
                    Costco Wholesale
                  </button>
                  <button
                    type="button"
                    onClick={() => handleLoadSample('Trader Joe’s')}
                    className="p-2.5 rounded-2xl border border-slate-200 bg-white hover:bg-slate-50 hover:border-slate-300 text-slate-800 text-xs font-bold text-center transition cursor-pointer shadow-2xs"
                  >
                    Trader Joe’s
                  </button>
                  <button
                    type="button"
                    onClick={() => handleLoadSample('ALDI')}
                    className="p-2.5 rounded-2xl border border-slate-200 bg-white hover:bg-slate-50 hover:border-slate-300 text-slate-800 text-xs font-bold text-center transition cursor-pointer shadow-2xs"
                  >
                    ALDI Market
                  </button>
                </div>
              </div>

              {/* Gemini API Key Settings Toggle */}
              <div className="pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowApiKeyInput(!showApiKeyInput)}
                  className="w-full flex items-center justify-between text-xs text-slate-500 hover:text-slate-800 font-semibold cursor-pointer py-1"
                >
                  <span className="flex items-center gap-1.5">
                    <Key className="w-3.5 h-3.5" />
                    <span>Gemini API Key Settings</span>
                    {apiKeyInput && (
                      <span className="text-[10px] text-emerald-600 font-bold bg-emerald-50 px-1.5 py-0.2 rounded">
                        ✓ Configured
                      </span>
                    )}
                  </span>
                  {showApiKeyInput ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                </button>

                {showApiKeyInput && (
                  <div className="mt-2.5 p-3 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
                    <label className="text-[11px] font-bold text-slate-700 block">
                      Google Gemini API Key (Get free from aistudio.google.com)
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="password"
                        value={apiKeyInput}
                        onChange={(e) => setApiKeyInput(e.target.value)}
                        placeholder="AIzaSy..."
                        className="flex-1 px-3 py-1.5 rounded-xl border border-slate-300 text-xs bg-white text-slate-900 focus:outline-emerald-500 font-mono"
                      />
                      <button
                        type="button"
                        onClick={handleSaveApiKey}
                        className="px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition cursor-pointer"
                      >
                        Save
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* STEP 2: Analyzing / Scanning Animation */}
          {step === 'analyzing' && (
            <div className="py-8 flex flex-col items-center justify-center space-y-5 text-center">
              {/* Receipt Preview with Scanner Laser Line */}
              <div className="relative w-40 h-52 rounded-2xl bg-slate-100 border-2 border-emerald-500/40 shadow-xl overflow-hidden flex items-center justify-center">
                {imagePreviewUrl ? (
                  <img
                    src={imagePreviewUrl}
                    alt="Receipt"
                    className="w-full h-full object-cover opacity-80"
                  />
                ) : (
                  <Receipt className="w-16 h-16 text-slate-300" />
                )}
                {/* Laser animation */}
                <div className="absolute inset-x-0 h-1 bg-gradient-to-r from-transparent via-emerald-400 to-transparent shadow-[0_0_12px_#10b981] animate-pulse top-1/2 -translate-y-1/2" />
              </div>

              <div>
                <div className="flex items-center justify-center gap-2 text-slate-900 font-black text-base">
                  <Sparkles className="w-5 h-5 text-emerald-600 animate-spin" />
                  <span>Gemini Vision is Parsing Receipt...</span>
                </div>
                <p className="text-xs text-slate-500 mt-1 max-w-xs mx-auto">
                  Detecting store name, purchased items, prices, and matching to your grocery list.
                </p>
              </div>
            </div>
          )}

          {/* STEP 3: Review & Confirmation */}
          {step === 'review' && result && (
            <div className="space-y-4">
              {/* Target Store Selector */}
              <div className="p-3.5 rounded-2xl bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-200 space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-emerald-900 flex items-center gap-1.5">
                    <Store className="w-4 h-4 text-emerald-700" />
                    Target Store:
                  </span>
                  {result.detectedStoreName && (
                    <span className="text-[10px] font-semibold text-emerald-800 bg-white/70 px-2 py-0.5 rounded-full border border-emerald-200">
                      Detected: {result.detectedStoreName}
                    </span>
                  )}
                </div>
                <select
                  value={selectedShopId}
                  onChange={(e) => setSelectedShopId(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-white border border-emerald-300 text-xs font-bold text-slate-900 focus:outline-emerald-500 cursor-pointer shadow-2xs"
                >
                  {shops.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Summary Stats */}
              <div className="flex items-center justify-between text-xs text-slate-600 px-1">
                <div>
                  <span className="font-bold text-slate-900">{selectedCount}</span> of {result.items.length} items selected
                </div>
                <div>
                  Total Selected: <span className="font-black text-slate-900">{formatPrice(selectedSum)}</span>
                </div>
              </div>

              {/* Items List */}
              <div className="divide-y divide-slate-100 border border-slate-200 rounded-2xl max-h-[36vh] overflow-y-auto bg-white shadow-2xs">
                {result.items.map((item) => (
                  <div
                    key={item.id}
                    className={`p-2.5 sm:p-3 flex items-center justify-between gap-2.5 transition ${
                      item.selected ? 'bg-white hover:bg-slate-50' : 'bg-slate-50/70 opacity-60'
                    }`}
                  >
                    {/* Checkbox */}
                    <input
                      type="checkbox"
                      checked={item.selected}
                      onChange={() => handleToggleItem(item.id)}
                      className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500 accent-emerald-600 shrink-0 cursor-pointer"
                    />

                    {/* Name & Package Details */}
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-1.5">
                        <input
                          type="text"
                          value={item.cleanedName}
                          onChange={(e) => handleItemNameChange(item.id, e.target.value)}
                          className="text-xs font-bold text-slate-900 bg-transparent border-b border-transparent hover:border-slate-300 focus:border-emerald-500 focus:outline-none w-full truncate"
                        />
                        {item.isNewItem ? (
                          <span className="shrink-0 px-1.5 py-0.2 rounded-full bg-amber-100 text-amber-800 text-[9px] font-black uppercase tracking-wider">
                            ✨ New
                          </span>
                        ) : (
                          <span className="shrink-0 px-1.5 py-0.2 rounded-full bg-emerald-100 text-emerald-800 text-[9px] font-bold tracking-tight">
                            ✓ Catalog
                          </span>
                        )}
                      </div>
                      <div className="text-[10px] text-slate-400 truncate mt-0.5">
                        {item.packageSize ? `${item.packageSize} • ` : ''}Receipt text: &quot;{item.rawName}&quot;
                      </div>
                    </div>

                    {/* Price Input */}
                    <div className="shrink-0 flex items-center gap-1">
                      <span className="text-xs font-bold text-slate-400">$</span>
                      <input
                        type="number"
                        step="0.01"
                        value={item.price}
                        onChange={(e) => handleItemPriceChange(item.id, e.target.value)}
                        className="w-16 px-2 py-1 rounded-lg border border-slate-200 text-xs font-black text-right text-slate-900 focus:outline-emerald-500"
                      />
                    </div>
                  </div>
                ))}
              </div>

              {/* Option to also log trip receipt */}
              <label className="flex items-center gap-2 text-xs text-slate-700 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={alsoLogReceipt}
                  onChange={(e) => setAlsoLogReceipt(e.target.checked)}
                  className="w-4 h-4 rounded text-emerald-600 accent-emerald-600 cursor-pointer"
                />
                <span>Also record this trip receipt in Spending History</span>
              </label>

              {/* Action Buttons */}
              <div className="pt-2 flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setStep('upload')}
                  className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 text-xs font-bold transition cursor-pointer"
                >
                  Scan Another
                </button>
                <button
                  type="button"
                  disabled={selectedCount === 0 || isSaving}
                  onClick={handleApplyResults}
                  className="flex-1 py-3 px-4 bg-emerald-600 hover:bg-emerald-700 active:scale-98 disabled:opacity-40 text-white font-black text-xs sm:text-sm rounded-xl shadow-md shadow-emerald-600/25 transition cursor-pointer flex items-center justify-center gap-2"
                >
                  <Check className="w-4 h-4 stroke-[3]" />
                  <span>
                    {isSaving
                      ? 'Saving Prices...'
                      : `Save ${selectedCount} Prices to ${shops.find((s) => s.id === selectedShopId)?.name || 'Store'}`}
                  </span>
                </button>
              </div>
            </div>
          )}

          {/* STEP 4: Success Message */}
          {step === 'success' && (
            <div className="py-8 text-center space-y-4">
              <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 mx-auto flex items-center justify-center shadow-inner">
                <CheckCircle2 className="w-9 h-9 stroke-[2.5]" />
              </div>
              <div>
                <h3 className="text-base sm:text-lg font-black text-slate-900">
                  Receipt Prices Applied Successfully!
                </h3>
                <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto leading-relaxed">
                  {selectedCount} item prices have been saved for{' '}
                  <span className="font-bold text-slate-800">
                    {shops.find((s) => s.id === selectedShopId)?.name}
                  </span>
                  . Your future price comparisons are now even more accurate.
                </p>
              </div>

              <div className="pt-2 flex justify-center gap-2">
                <button
                  type="button"
                  onClick={() => setStep('upload')}
                  className="px-4 py-2 rounded-xl border border-slate-200 text-slate-700 text-xs font-bold hover:bg-slate-50 transition cursor-pointer"
                >
                  Scan Another Receipt
                </button>
                <button
                  type="button"
                  onClick={onClose}
                  className="px-5 py-2 rounded-xl bg-emerald-600 text-white text-xs font-bold hover:bg-emerald-700 transition shadow-xs cursor-pointer"
                >
                  Done
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
