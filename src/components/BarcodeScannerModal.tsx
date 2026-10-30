import React, { useState, useEffect, useRef } from 'react'
import {
  X,
  CameraOff,
  Flashlight,
  FlashlightOff,
  SwitchCamera,
  Check,
  CheckCircle2,
  Circle,
  Plus,
  Minus,
  Link2,
  DollarSign,
  Tag,
  Search,
  RotateCw,
  Sparkles,
  AlertCircle,
  Keyboard,
  Barcode as BarcodeIcon,
} from 'lucide-react'
import { Html5Qrcode, Html5QrcodeSupportedFormats } from 'html5-qrcode'
import type { ShoppingItem } from '../types'
import { useShopping } from '../context/ShoppingContext'
import { compareShopPrices, formatPrice } from '../utils/pricing'
import { KeypadCalculatorModal } from './KeypadCalculatorModal'
import { doesItemMatchBarcode, appendBarcodeToItem, getItemBarcodes } from '../utils/barcode'

interface ScannedProductOFF {
  barcode: string
  name: string
  brand?: string
  imageUrl?: string
  quantityStr?: string
  packageSize?: number
  packageUnit?: string
  suggestedCategory?: string
  category?: string
}

interface BarcodeScannerModalProps {
  isOpen: boolean
  onClose: () => void
  currentShopId?: string
  onBarcodeSelected?: (barcode: string, product?: Partial<ScannedProductOFF>) => void
}

// Crisp native-like scanner audio beep via Web Audio API
function playScannerBeep() {
  try {
    const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext
    if (!AudioContextClass) return
    const ctx = new AudioContextClass()
    const osc = ctx.createOscillator()
    const gain = ctx.createGain()
    osc.type = 'sine'
    osc.frequency.setValueAtTime(1760, ctx.currentTime) // High crisp beep (A6)
    gain.gain.setValueAtTime(0.2, ctx.currentTime)
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.1)
    osc.connect(gain)
    gain.connect(ctx.destination)
    osc.start()
    osc.stop(ctx.currentTime + 0.1)
  } catch {
    // AudioContext might be restricted prior to user interaction
  }
}

// Map Open Food Facts categories to user's category list
function matchCategory(tags: string[] = [], availableCategories: string[]): string {
  const combined = tags.join(' ').toLowerCase()
  if (/dairy|milk|cheese|yogurt|butter|cream|egg/i.test(combined)) {
    return availableCategories.find((c) => /dairy/i.test(c)) || 'Dairy & Eggs'
  }
  if (/fruit|vegetable|produce|salad|fresh|apple|banana|tomato|onion/i.test(combined)) {
    return availableCategories.find((c) => /produce/i.test(c)) || 'Produce'
  }
  if (/meat|beef|chicken|pork|poultry|turkey|seafood|fish|shrimp/i.test(combined)) {
    return availableCategories.find((c) => /meat/i.test(c)) || 'Meat & Seafood'
  }
  if (/bread|bakery|tortilla|bagel|toast|pastry|cake|bun/i.test(combined)) {
    return availableCategories.find((c) => /bakery/i.test(c)) || 'Bakery & Bread'
  }
  if (/beverage|drink|soda|juice|water|tea|coffee|cola/i.test(combined)) {
    return availableCategories.find((c) => /beverage/i.test(c)) || 'Beverages'
  }
  if (/frozen|ice cream|pizza|waffle/i.test(combined)) {
    return availableCategories.find((c) => /frozen/i.test(c)) || 'Frozen Foods'
  }
  if (/snack|chip|cookie|candy|chocolate|cracker|nut/i.test(combined)) {
    return availableCategories.find((c) => /snack/i.test(c)) || 'Snacks & Sweets'
  }
  if (/canned|soup|beans|tuna/i.test(combined)) {
    return availableCategories.find((c) => /canned/i.test(c)) || 'Canned Goods'
  }
  if (/sauce|condiment|ketchup|mustard|mayo|dressing|oil|vinegar|spice|seasoning/i.test(combined)) {
    return availableCategories.find((c) => /condiment|sauce/i.test(c)) || 'Condiments & Sauces'
  }
  if (/pantry|cereal|pasta|rice|grain|flour|sugar/i.test(combined)) {
    return availableCategories.find((c) => /pantry/i.test(c)) || 'Pantry & Grains'
  }
  return availableCategories[0] || 'Produce'
}

function parsePackageQuantity(qtyStr?: string): { packageSize?: number; packageUnit?: string } {
  if (!qtyStr) return {}
  const match = qtyStr.match(/([\d.]+)\s*([a-zA-Z%]+)/)
  if (!match) return {}
  const size = parseFloat(match[1])
  let unit = match[2].toLowerCase()
  if (unit === 'g' || unit === 'gram' || unit === 'grams') unit = 'g'
  else if (unit === 'kg') unit = 'kg'
  else if (unit === 'oz' || unit === 'fl oz' || unit === 'fl. oz') unit = 'oz'
  else if (unit === 'lb' || unit === 'lbs') unit = 'lbs'
  else if (unit === 'ml') unit = 'ml'
  else if (unit === 'l' || unit === 'liter' || unit === 'liters') unit = 'liters'
  else if (unit === 'can' || unit === 'cans') unit = 'cans'
  else if (unit === 'bottle' || unit === 'bottles') unit = 'bottles'
  return { packageSize: isNaN(size) ? undefined : size, packageUnit: unit }
}

export const BarcodeScannerModal: React.FC<BarcodeScannerModalProps> = ({
  isOpen,
  onClose,
  currentShopId,
  onBarcodeSelected,
}) => {
  const { items, shops, categories, addItem, updateItem, toggleInCart, changeItemQuantity, updateItemShopDetail } =
    useShopping()

  const [scannerError, setScannerError] = useState<string | null>(null)
  const [isCameraActive, setIsCameraActive] = useState<boolean>(false)
  const [torchOn, setTorchOn] = useState<boolean>(false)
  const [hasTorch, setHasTorch] = useState<boolean>(false)
  const [cameras, setCameras] = useState<Array<{ id: string; label: string }>>([])
  const [selectedCameraIndex, setSelectedCameraIndex] = useState<number>(0)

  // Manual entry toggle
  const [showManualInput, setShowManualInput] = useState<boolean>(false)
  const [manualBarcode, setManualBarcode] = useState<string>('')

  // Scanned state
  const [activeBarcode, setActiveBarcode] = useState<string | null>(null)
  const [matchedItem, setMatchedItem] = useState<ShoppingItem | null>(null)
  const [isSearchingOnline, setIsSearchingOnline] = useState<boolean>(false)
  const [onlineProduct, setOnlineProduct] = useState<ScannedProductOFF | null>(null)
  const [onlineError, setOnlineError] = useState<string | null>(null)

  // Link to existing item UI
  const [showLinkSelector, setShowLinkSelector] = useState<boolean>(false)
  const [linkSearchQuery, setLinkSearchQuery] = useState<string>('')
  const [linkCategory, setLinkCategory] = useState<string>('')

  // Price and quantity keypad modals
  const [showPriceKeypad, setShowPriceKeypad] = useState<boolean>(false)
  const [isQuantityKeypadOpen, setIsQuantityKeypadOpen] = useState<boolean>(false)

  // Feedback action toast
  const [actionNotice, setActionNotice] = useState<string | null>(null)

  const triggerHaptic = (ms: number = 20) => {
    if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
      try {
        navigator.vibrate(ms)
      } catch {
        // ignore
      }
    }
  }

  const html5QrCodeRef = useRef<Html5Qrcode | null>(null)
  const scannerContainerId = 'hashgroc-barcode-scanner-viewport'
  const isMountedRef = useRef<boolean>(true)

  const activeShop = shops.find((s) => s.id === currentShopId)

  // Re-sync matchedItem if items update in context
  useEffect(() => {
    if (activeBarcode) {
      const found = items.find((i) => doesItemMatchBarcode(i, activeBarcode))
      setMatchedItem(found || null)
    }
  }, [items, activeBarcode])

  // Clear notice after delay
  useEffect(() => {
    if (actionNotice) {
      const t = setTimeout(() => setActionNotice(null), 3000)
      return () => clearTimeout(t)
    }
  }, [actionNotice])

  // Camera initialization and cleanup
  useEffect(() => {
    isMountedRef.current = true
    if (!isOpen) {
      stopScanner()
      return
    }

    // Reset scan state on fresh open
    resetScan()

    // Start scanner with rear camera
    const timer = setTimeout(() => {
      startScanner()
    }, 150)

    return () => {
      clearTimeout(timer)
      stopScanner()
      isMountedRef.current = false
    }
  }, [isOpen])

  const stopScanner = async () => {
    try {
      if (html5QrCodeRef.current) {
        if (html5QrCodeRef.current.isScanning) {
          await html5QrCodeRef.current.stop()
        }
        html5QrCodeRef.current.clear()
        html5QrCodeRef.current = null
      }
    } catch {
      // Ignore stop errors on unmount
    }
    setIsCameraActive(false)
    setTorchOn(false)
    setHasTorch(false)
  }

  const startScanner = async (cameraId?: string) => {
    try {
      setScannerError(null)
      await stopScanner()

      // Check available cameras
      try {
        const devices = await Html5Qrcode.getCameras()
        if (devices && devices.length > 0) {
          setCameras(devices)
        }
      } catch {
        // Permission query or enumerateDevices might fail; fallback to facingMode constraint
      }

      const qrCodeInstance = new Html5Qrcode(scannerContainerId, {
        formatsToSupport: [
          Html5QrcodeSupportedFormats.UPC_A,
          Html5QrcodeSupportedFormats.UPC_E,
          Html5QrcodeSupportedFormats.UPC_EAN_EXTENSION,
          Html5QrcodeSupportedFormats.EAN_13,
          Html5QrcodeSupportedFormats.EAN_8,
          Html5QrcodeSupportedFormats.CODE_128,
          Html5QrcodeSupportedFormats.CODE_39,
          Html5QrcodeSupportedFormats.QR_CODE,
        ],
        verbose: false,
      })

      html5QrCodeRef.current = qrCodeInstance

      // Prefer back camera ("environment")
      const cameraConfig = cameraId
        ? { deviceId: { exact: cameraId } }
        : { facingMode: 'environment' }

      await qrCodeInstance.start(
        cameraConfig,
        {
          fps: 15,
          qrbox: { width: 260, height: 160 },
          aspectRatio: 1.0,
        },
        (decodedText) => {
          handleBarcodeDetected(decodedText)
        },
        () => {
          // Frame scan failure is expected while searching, ignore
        }
      )

      setIsCameraActive(true)

      // Detect torch capabilities
      detectTorch()
    } catch (err: unknown) {
      console.warn('Barcode scanner initialization error:', err)
      const msg = err instanceof Error ? err.message : String(err)
      if (msg.includes('NotAllowedError') || msg.includes('Permission')) {
        setScannerError('Camera access denied. Please grant camera permission in your browser or enter barcode manually below.')
      } else if (msg.includes('NotFoundError') || msg.includes('DevicesNotFoundError')) {
        setScannerError('No camera detected on this device. You can enter the barcode manually.')
      } else {
        setScannerError('Unable to start camera stream. Please try again or enter barcode manually.')
      }
      setIsCameraActive(false)
    }
  }

  // Detect torch feature on active video track
  const detectTorch = () => {
    try {
      const container = document.getElementById(scannerContainerId)
      const video = container?.querySelector('video') as HTMLVideoElement | null
      if (video && video.srcObject) {
        const stream = video.srcObject as MediaStream
        const track = stream.getVideoTracks()[0]
        if (track) {
          const capabilities = track.getCapabilities ? (track.getCapabilities() as { torch?: boolean }) : null
          if (capabilities && capabilities.torch) {
            setHasTorch(true)
          }
        }
      }
    } catch {
      setHasTorch(false)
    }
  }

  // Toggle flashlight / torch
  const handleToggleTorch = async () => {
    try {
      const container = document.getElementById(scannerContainerId)
      const video = container?.querySelector('video') as HTMLVideoElement | null
      if (video && video.srcObject) {
        const stream = video.srcObject as MediaStream
        const track = stream.getVideoTracks()[0]
        if (track) {
          const nextState = !torchOn
          await track.applyConstraints({
            // @ts-expect-error torch constraint in W3C Image Capture spec
            advanced: [{ torch: nextState }],
          })
          setTorchOn(nextState)
        }
      }
    } catch (err) {
      console.warn('Failed to toggle torch:', err)
    }
  }

  // Switch between front/back or multiple cameras
  const handleSwitchCamera = () => {
    if (cameras.length <= 1) return
    const nextIndex = (selectedCameraIndex + 1) % cameras.length
    setSelectedCameraIndex(nextIndex)
    startScanner(cameras[nextIndex].id)
  }

  // Barcode detected handler
  const handleBarcodeDetected = (rawCode: string) => {
    const code = rawCode.trim()
    if (!code) return

    playScannerBeep()
    if (typeof navigator !== 'undefined' && navigator.vibrate) {
      navigator.vibrate([45, 30, 45])
    }

    // Pause scanning while displaying result
    try {
      if (html5QrCodeRef.current?.isScanning) {
        html5QrCodeRef.current.pause(true)
      }
    } catch {
      // Pause may fail depending on state
    }

    processBarcode(code)
  }

  const processBarcode = async (code: string) => {
    setActiveBarcode(code)
    setOnlineProduct(null)
    setOnlineError(null)
    setShowLinkSelector(false)

    // 1. Check local catalog
    const localMatch = items.find((i) => doesItemMatchBarcode(i, code))

    if (localMatch) {
      setIsSearchingOnline(false)

      if (!currentShopId && !onBarcodeSelected) {
        // In List Mode: automatically add item to shopping list with quantity 1
        const updatedMatch: ShoppingItem = {
          ...localMatch,
          isNeeded: true,
          quantity: 1,
        }
        setMatchedItem(updatedMatch)
        await updateItem(localMatch.id, {
          isNeeded: true,
          quantity: 1,
        })
        setActionNotice(`Added "${localMatch.name}" (qty 1) to shopping list!`)
      } else {
        setMatchedItem(localMatch)
      }

      // If user passed onBarcodeSelected callback (e.g. from ItemEditorModal)
      if (onBarcodeSelected) {
        onBarcodeSelected(code, {
          name: localMatch.name,
          category: localMatch.category,
          imageUrl: localMatch.imageUrl,
        })
      }
      return
    }

    // 2. Not in local catalog -> Query Open Food Facts
    setMatchedItem(null)
    setIsSearchingOnline(true)

    try {
      const res = await fetch(`https://world.openfoodfacts.org/api/v2/product/${encodeURIComponent(code)}.json`, {
        headers: {
          'User-Agent': 'HashGroc/1.0 (info@hashgroc.app)',
        },
      })

      if (!res.ok) {
        throw new Error(`HTTP ${res.status}`)
      }

      const data = await res.json()
      if (data && data.status === 1 && data.product) {
        const prod = data.product
        const name = prod.product_name || prod.product_name_en || prod.generic_name || 'Grocery Item'
        const brand = prod.brands || ''
        const imageUrl = prod.image_front_small_url || prod.image_front_url || undefined
        const quantityStr = prod.quantity || ''
        const { packageSize, packageUnit } = parsePackageQuantity(quantityStr)
        const suggestedCategory = matchCategory(prod.categories_tags || [], categories)

        const scannedProduct: ScannedProductOFF = {
          barcode: code,
          name: brand ? `${brand} ${name}`.trim() : name,
          brand,
          imageUrl,
          quantityStr,
          packageSize,
          packageUnit,
          suggestedCategory,
        }

        setOnlineProduct(scannedProduct)
        setLinkCategory(suggestedCategory)

        if (onBarcodeSelected) {
          onBarcodeSelected(code, scannedProduct)
        }
      } else {
        setOnlineError('Product not found in online grocery database.')
        setLinkCategory(categories[0] || 'Produce')
      }
    } catch {
      setOnlineError('Could not connect to online product database. You can still add it manually.')
      setLinkCategory(categories[0] || 'Produce')
    } finally {
      setIsSearchingOnline(false)
    }
  }

  // Resume camera scanner for next scan
  const resumeScanner = () => {
    resetScan()
    try {
      if (html5QrCodeRef.current) {
        html5QrCodeRef.current.resume()
      }
    } catch {
      startScanner()
    }
  }

  const resetScan = () => {
    setActiveBarcode(null)
    setMatchedItem(null)
    setOnlineProduct(null)
    setOnlineError(null)
    setShowLinkSelector(false)
    setLinkSearchQuery('')
    setLinkCategory('')
    setShowPriceKeypad(false)
  }

  // Action: Add online product directly to catalog & list
  const handleAddOnlineProduct = async () => {
    if (!onlineProduct) return
    const unit = onlineProduct.packageUnit || 'items'

    const payload = {
      name: onlineProduct.name,
      category: onlineProduct.suggestedCategory || categories[0] || 'Produce',
      quantity: 1,
      unit,
      barcodes: [onlineProduct.barcode],
      barcode: onlineProduct.barcode,
      imageUrl: onlineProduct.imageUrl,
      isNeeded: true,
      inCart: currentShopId ? true : false,
      shops: currentShopId
        ? {
            [currentShopId]: {
              available: true,
              price: null,
              location: '',
              packageSize: onlineProduct.packageSize || null,
              packageUnit: unit,
            },
          }
        : {},
    }

    await addItem(payload)
    setActionNotice(`Added "${onlineProduct.name}" to your list!`)
  }

  // Action: Link scanned barcode to an existing item
  const handleLinkToItem = async (targetItem: ShoppingItem) => {
    if (!activeBarcode) return
    const updatedBarcodes = appendBarcodeToItem(targetItem, activeBarcode)
    const updates: Partial<ShoppingItem> = {
      barcodes: updatedBarcodes,
      barcode: updatedBarcodes[0] || activeBarcode,
      imageUrl: onlineProduct?.imageUrl || targetItem.imageUrl,
      isNeeded: true,
      ...(currentShopId ? { inCart: true } : {}),
    }
    await updateItem(targetItem.id, updates)
    setActionNotice(`Linked barcode to "${targetItem.name}"`)
    setShowLinkSelector(false)
    setLinkSearchQuery('')

    if (onBarcodeSelected) {
      onBarcodeSelected(activeBarcode, {
        name: targetItem.name,
        category: targetItem.category,
        imageUrl: onlineProduct?.imageUrl || targetItem.imageUrl,
      })
    }
  }

  // Action: Create a new custom item and immediately link the active barcode to it
  const handleCreateAndLinkItem = async (customName: string, selectedCategory?: string) => {
    const trimmed = customName.trim()
    if (!activeBarcode || !trimmed) return

    const categoryToUse =
      selectedCategory ||
      linkCategory ||
      onlineProduct?.suggestedCategory ||
      categories[0] ||
      'Produce'

    const unit = onlineProduct?.packageUnit || 'items'

    const payload = {
      name: trimmed,
      category: categoryToUse,
      quantity: 1,
      unit,
      barcodes: [activeBarcode],
      barcode: activeBarcode,
      imageUrl: onlineProduct?.imageUrl || undefined,
      isNeeded: true,
      inCart: currentShopId ? true : false,
      shops: currentShopId
        ? {
            [currentShopId]: {
              available: true,
              price: null,
              location: '',
              packageSize: onlineProduct?.packageSize || null,
              packageUnit: unit,
            },
          }
        : {},
    }

    await addItem(payload)
    setActionNotice(`Created "${trimmed}" & linked barcode!`)
    setShowLinkSelector(false)
    setLinkSearchQuery('')

    if (onBarcodeSelected) {
      onBarcodeSelected(activeBarcode, {
        name: trimmed,
        category: categoryToUse,
        imageUrl: onlineProduct?.imageUrl,
        packageSize: onlineProduct?.packageSize,
        packageUnit: unit,
      })
    }
  }

  // Shared Link Selector with Custom Short Name Support
  const renderLinkSelector = () => {
    if (!showLinkSelector) return null

    const query = linkSearchQuery.trim()
    const filteredItems = items.filter((i) =>
      i.name.toLowerCase().includes(query.toLowerCase())
    )
    const exactMatch = items.find(
      (i) => i.name.trim().toLowerCase() === query.toLowerCase()
    )

    return (
      <div className="mt-3 p-3 sm:p-3.5 bg-white border border-slate-200 rounded-2xl space-y-3 animate-in fade-in duration-150 shadow-xs">
        <div className="flex items-center justify-between">
          <div className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
            <Tag className="w-3.5 h-3.5 text-emerald-600" />
            <span>{onlineProduct ? 'Custom Short Name or Link Catalog Item' : 'Add Item or Link Barcode'}</span>
          </div>
          <button
            type="button"
            onClick={() => {
              setShowLinkSelector(false)
              setLinkSearchQuery('')
            }}
            className="text-slate-400 hover:text-slate-600 p-1 rounded-lg hover:bg-slate-100 transition cursor-pointer"
            title="Close"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Search or Custom Short Name Input */}
        <div className="relative">
          <Search className="w-3.5 h-3.5 absolute left-2.5 top-2.5 text-slate-400" />
          <input
            type="text"
            autoFocus
            placeholder="Type custom short name (e.g. Milk, Coke, Salsa)..."
            value={linkSearchQuery}
            onChange={(e) => setLinkSearchQuery(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault()
                if (query) {
                  if (exactMatch) {
                    handleLinkToItem(exactMatch)
                  } else {
                    handleCreateAndLinkItem(query, linkCategory)
                  }
                }
              }
            }}
            className="w-full pl-8 pr-3 py-2 rounded-xl border border-slate-300 text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500 font-medium bg-slate-50/50 focus:bg-white transition"
          />
        </div>

        {/* Option 1: Create New Item with this Custom Short Name (if not exact match) */}
        {query && !exactMatch && (
          <div className="p-2.5 bg-gradient-to-r from-emerald-50 via-teal-50 to-emerald-50 border border-emerald-300 rounded-xl space-y-2">
            <div className="flex items-center justify-between gap-2">
              <span className="text-xs font-bold text-emerald-950 truncate">
                New item: <span className="text-emerald-700">"{query}"</span>
              </span>
              <select
                value={linkCategory || (categories[0] || 'Produce')}
                onChange={(e) => setLinkCategory(e.target.value)}
                className="text-[11px] font-bold bg-white border border-emerald-300 text-emerald-900 rounded-lg px-2 py-0.5 focus:outline-none shrink-0"
                title="Category for new item"
              >
                {categories.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>
            <button
              type="button"
              onClick={() => handleCreateAndLinkItem(query, linkCategory)}
              className="w-full py-2 px-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl transition flex items-center justify-center gap-1.5 shadow-2xs cursor-pointer active:scale-95"
            >
              <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
              <span>Add as "{query}" & Link Barcode</span>
            </button>
          </div>
        )}

        {/* Option 2: Link to an existing item from catalog */}
        <div className="space-y-1">
          <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
            {query ? 'Matching Existing Items:' : 'Or link to existing catalog item:'}
          </div>
          {filteredItems.length > 0 ? (
            <div className="max-h-36 overflow-y-auto space-y-1 divide-y divide-slate-100">
              {filteredItems.slice(0, 8).map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => handleLinkToItem(item)}
                  className="w-full text-left px-2.5 py-1.5 hover:bg-emerald-50/70 rounded-lg text-xs flex items-center justify-between text-slate-800 font-semibold cursor-pointer group transition"
                >
                  <div className="flex items-center gap-1.5 truncate">
                    <span className="group-hover:text-emerald-700 truncate">{item.name}</span>
                    {item.barcode && <span className="text-[10px] text-slate-400 font-mono">(linked)</span>}
                  </div>
                  <span className="text-[10px] text-slate-400 shrink-0 ml-2">{item.category}</span>
                </button>
              ))}
            </div>
          ) : query ? (
            <div className="text-[11px] text-slate-400 italic text-center py-1">
              No existing catalog items match "{query}".
            </div>
          ) : (
            <div className="text-[11px] text-slate-400 italic text-center py-1">
              Type a custom name above to create and link.
            </div>
          )}
        </div>
      </div>
    )
  }

  // Action: Toggle item in cart (Shop Mode)
  const handleToggleCart = async () => {
    if (!matchedItem) return
    await toggleInCart(matchedItem.id)
    setActionNotice(matchedItem.inCart ? `Removed "${matchedItem.name}" from cart` : `Checked "${matchedItem.name}" in cart!`)
  }

  // Action: Add item to shopping list (matching List menu style)
  const handleAddItem = async (item: ShoppingItem) => {
    triggerHaptic(25)
    const newQty = Math.max(1, item.quantity || 1)
    setMatchedItem((prev) => (prev ? { ...prev, isNeeded: true, quantity: newQty } : prev))
    await updateItem(item.id, {
      isNeeded: true,
      quantity: newQty,
    })
    setActionNotice(`Added "${item.name}" to shopping list!`)
  }

  // Action: Increment quantity (matching List menu style)
  const handleIncrement = async (item: ShoppingItem) => {
    triggerHaptic(20)
    if (!item.isNeeded) {
      const newQty = Math.max(1, item.quantity || 1)
      setMatchedItem((prev) => (prev ? { ...prev, isNeeded: true, quantity: newQty } : prev))
      await updateItem(item.id, {
        isNeeded: true,
        quantity: newQty,
      })
      setActionNotice(`Added "${item.name}" to shopping list!`)
    } else {
      const newQty = (item.quantity || 1) + 1
      setMatchedItem((prev) => (prev ? { ...prev, quantity: newQty } : prev))
      await changeItemQuantity(item.id, 1)
    }
  }

  // Action: Decrement quantity (matching List menu style)
  const handleDecrement = async (item: ShoppingItem) => {
    triggerHaptic(20)
    const currentQty = item.quantity || 1
    if (currentQty > 1) {
      const newQty = currentQty - 1
      setMatchedItem((prev) => (prev ? { ...prev, quantity: newQty } : prev))
      await changeItemQuantity(item.id, -1)
    } else {
      // Reached 1 -> pressing minus removes item from the list
      setMatchedItem((prev) => (prev ? { ...prev, isNeeded: false, inCart: false } : prev))
      await updateItem(item.id, {
        isNeeded: false,
        inCart: false,
      })
      setActionNotice(`Removed "${item.name}" from shopping list`)
    }
  }

  // Action: Update live store price
  const handleApplyShelfPrice = async (newPrice: number) => {
    if (!matchedItem || !currentShopId) return
    await updateItemShopDetail(matchedItem.id, currentShopId, { price: newPrice, available: true })
    setShowPriceKeypad(false)
    setActionNotice(`Updated ${activeShop?.name || 'store'} price to ${formatPrice(newPrice)}`)
  }

  if (!isOpen) return null

  // Price comparison for matched item
  const priceComparison = matchedItem ? compareShopPrices(matchedItem, currentShopId || shops[0]?.id, shops) : null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl w-full max-w-lg shadow-2xl flex flex-col overflow-hidden border border-slate-200 max-h-[92vh]">
        {/* Header */}
        <div className="p-4 border-b border-slate-200 bg-gradient-to-r from-emerald-50 via-teal-50 to-emerald-50 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-emerald-600 text-white flex items-center justify-center shadow-xs">
              <BarcodeIcon className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-black text-slate-900 leading-tight">Barcode Scanner</h2>
              <p className="text-xs text-slate-500 font-medium">
                {activeShop ? `Scanning at ${activeShop.name}` : 'Scan grocery & pantry barcodes'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-600 rounded-xl hover:bg-white/60 transition cursor-pointer"
            title="Close scanner"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto flex flex-col items-center">
          {/* 1. Camera Viewport */}
          <div className="w-full relative bg-black aspect-square max-h-[320px] flex items-center justify-center overflow-hidden">
            <div id={scannerContainerId} className="w-full h-full flex items-center justify-center" />

            {/* Viewfinder Target Graphic (Visible when camera is active and no item card is covering) */}
            {isCameraActive && !activeBarcode && (
              <div className="absolute inset-0 pointer-events-none flex flex-col items-center justify-center p-4">
                {/* Viewfinder frame */}
                <div className="relative w-64 h-40 rounded-2xl border-2 border-emerald-400/80 shadow-[0_0_20px_rgba(52,211,153,0.3)] flex items-center justify-center overflow-hidden">
                  {/* Laser scan animation line */}
                  <div className="absolute left-2 right-2 h-0.5 bg-emerald-400 shadow-[0_0_10px_#34d399] animate-[bounce_2s_infinite]" />
                  {/* Corner Reticle Accents */}
                  <div className="absolute -top-0.5 -left-0.5 w-4 h-4 border-t-4 border-l-4 border-emerald-400 rounded-tl-sm" />
                  <div className="absolute -top-0.5 -right-0.5 w-4 h-4 border-t-4 border-r-4 border-emerald-400 rounded-tr-sm" />
                  <div className="absolute -bottom-0.5 -left-0.5 w-4 h-4 border-b-4 border-l-4 border-emerald-400 rounded-bl-sm" />
                  <div className="absolute -bottom-0.5 -right-0.5 w-4 h-4 border-b-4 border-r-4 border-emerald-400 rounded-br-sm" />
                </div>
                <p className="mt-3 text-xs font-semibold text-white/90 bg-black/60 px-3 py-1 rounded-full backdrop-blur-xs">
                  Align grocery barcode inside frame
                </p>
              </div>
            )}

            {/* Camera Controls Overlay (Flashlight, Camera Switch) */}
            {isCameraActive && (
              <div className="absolute top-3 right-3 flex items-center gap-2 z-10">
                {hasTorch && (
                  <button
                    type="button"
                    onClick={handleToggleTorch}
                    className={`p-2.5 rounded-xl backdrop-blur-md shadow-md transition cursor-pointer ${
                      torchOn ? 'bg-amber-500 text-white' : 'bg-black/50 text-white hover:bg-black/70'
                    }`}
                    title={torchOn ? 'Turn flashlight off' : 'Turn flashlight on'}
                  >
                    {torchOn ? <FlashlightOff className="w-4 h-4" /> : <Flashlight className="w-4 h-4" />}
                  </button>
                )}
                {cameras.length > 1 && (
                  <button
                    type="button"
                    onClick={handleSwitchCamera}
                    className="p-2.5 rounded-xl bg-black/50 hover:bg-black/70 text-white backdrop-blur-md shadow-md transition cursor-pointer"
                    title="Switch camera"
                  >
                    <SwitchCamera className="w-4 h-4" />
                  </button>
                )}
              </div>
            )}

            {/* Error or Permission Denied Message */}
            {scannerError && (
              <div className="absolute inset-0 bg-slate-900/90 text-white p-6 flex flex-col items-center justify-center text-center gap-3">
                <CameraOff className="w-10 h-10 text-rose-400" />
                <p className="text-xs sm:text-sm font-medium text-slate-300 max-w-xs">{scannerError}</p>
                <button
                  type="button"
                  onClick={() => startScanner()}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl transition cursor-pointer"
                >
                  Retry Camera
                </button>
              </div>
            )}
          </div>

          {/* Action Notification Toast Banner */}
          {actionNotice && (
            <div className="w-full bg-emerald-600 text-white px-4 py-2 text-xs font-bold flex items-center justify-center gap-2 animate-in slide-in-from-top-1">
              <Check className="w-4 h-4" />
              <span>{actionNotice}</span>
            </div>
          )}

          {/* 2. Scanned Result View */}
          {activeBarcode ? (
            <div className="w-full p-4 space-y-4">
              {/* Case A: Item found in Catalog */}
              {matchedItem && (
                <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 shadow-2xs space-y-3">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start gap-3">
                      {matchedItem.imageUrl ? (
                        <img
                          src={matchedItem.imageUrl}
                          alt={matchedItem.name}
                          className="w-12 h-12 object-contain rounded-xl bg-white border border-slate-200 shrink-0 p-1"
                        />
                      ) : (
                        <div className="w-12 h-12 rounded-xl bg-emerald-100 text-emerald-800 font-black text-sm flex items-center justify-center shrink-0 border border-emerald-200">
                          {matchedItem.name.substring(0, 2).toUpperCase()}
                        </div>
                      )}
                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-sm sm:text-base font-black text-slate-900">{matchedItem.name}</span>
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-200 text-slate-700">
                            {matchedItem.category}
                          </span>
                        </div>
                        <div className="flex items-center gap-1.5 flex-wrap text-xs text-slate-500 font-mono mt-0.5">
                          <span>Barcode: {activeBarcode}</span>
                          {getItemBarcodes(matchedItem).length > 1 && (
                            <span className="text-[10px] font-bold px-1.5 py-0.5 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-md">
                              +{getItemBarcodes(matchedItem).length - 1} more linked
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Price Comparison Card */}
                  {priceComparison && (
                    <div className="bg-white rounded-xl p-3 border border-slate-200 space-y-2">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-bold text-slate-700 flex items-center gap-1">
                          <Tag className="w-3.5 h-3.5 text-emerald-600" /> Store Prices:
                        </span>
                        {priceComparison.cheapestShop && (
                          <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                            Best: {formatPrice(priceComparison.cheapestPrice)} at {priceComparison.cheapestShop.name}
                          </span>
                        )}
                      </div>

                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                        {shops.map((s) => {
                          const detail = matchedItem.shops[s.id]
                          const price = detail?.price ?? null
                          const isCurrent = s.id === currentShopId
                          return (
                            <div
                              key={s.id}
                              className={`p-2 rounded-xl border text-xs flex flex-col justify-between ${
                                isCurrent
                                  ? 'bg-emerald-50/70 border-emerald-300 ring-1 ring-emerald-400'
                                  : 'bg-slate-50 border-slate-200'
                              }`}
                            >
                              <div className="flex items-center justify-between">
                                <span className="font-bold text-slate-700 truncate">{s.name}</span>
                                {isCurrent && (
                                  <span className="text-[9px] font-extrabold uppercase bg-emerald-600 text-white px-1.5 py-0.5 rounded">
                                    Current
                                  </span>
                                )}
                              </div>
                              <div className="mt-1 flex items-baseline justify-between">
                                <span className="font-extrabold text-slate-900 text-sm">
                                  {price !== null ? formatPrice(price) : 'Unlisted'}
                                </span>
                                {detail?.location && (
                                  <span className="text-[10px] text-slate-500 truncate ml-1">{detail.location}</span>
                                )}
                              </div>
                            </div>
                          )
                        })}
                      </div>

                      {/* Quick Update Shelf Price for Current Store */}
                      {currentShopId && (
                        <div className="pt-1 flex items-center justify-between">
                          <span className="text-[11px] text-slate-500 font-medium">Shelf price changed at {activeShop?.name}?</span>
                          <button
                            type="button"
                            onClick={() => setShowPriceKeypad(true)}
                            className="text-xs font-bold text-emerald-700 hover:text-emerald-800 bg-emerald-100 hover:bg-emerald-200 px-2.5 py-1 rounded-lg transition cursor-pointer flex items-center gap-1"
                          >
                            <DollarSign className="w-3.5 h-3.5" />
                            <span>Update Shelf Price</span>
                          </button>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Actions for Matched Item */}
                  <div className="flex items-center gap-2 pt-1 flex-wrap sm:flex-nowrap">
                    {currentShopId ? (
                      // In Shop Mode: In-Cart Toggle + Stepper / [+] matching main app
                      <>
                        <button
                          type="button"
                          onClick={handleToggleCart}
                          className={`flex-1 py-2 px-3 rounded-xl text-xs sm:text-sm font-bold transition flex items-center justify-center gap-2 cursor-pointer shadow-xs active:scale-95 h-9 ${
                            matchedItem.inCart
                              ? 'bg-emerald-100 text-emerald-900 border border-emerald-300'
                              : 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-600/20'
                          }`}
                        >
                          {matchedItem.inCart ? (
                            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                          ) : (
                            <Circle className="w-4 h-4 text-emerald-200" />
                          )}
                          <span>{matchedItem.inCart ? 'In Cart' : 'Put in Cart'}</span>
                        </button>

                        {/* Quantity Stepper (when needed) or [+] (when quantity is 0 / not needed) */}
                        <div className="w-28 h-9 shrink-0 flex items-center justify-start">
                          {matchedItem.isNeeded && (matchedItem.quantity || 1) > 0 ? (
                            <div className="h-9 w-full flex items-center rounded-xl border border-slate-200 bg-white overflow-hidden shadow-2xs">
                              <button
                                type="button"
                                onClick={() => handleDecrement(matchedItem)}
                                className="w-8 sm:w-9 h-full flex items-center justify-center text-slate-600 hover:bg-slate-100 active:bg-slate-200 transition cursor-pointer"
                                title={matchedItem.quantity <= 1 ? 'Remove from shopping list' : 'Decrease quantity'}
                              >
                                <Minus className="w-3.5 h-3.5 stroke-[2.5]" />
                              </button>

                              <button
                                type="button"
                                onClick={() => setIsQuantityKeypadOpen(true)}
                                className="flex-1 px-1 h-full flex items-center justify-center text-xs sm:text-sm font-bold text-slate-800 hover:bg-slate-100 transition cursor-pointer select-none"
                                title="Click to set quantity with calculator"
                              >
                                {matchedItem.quantity}
                              </button>

                              <button
                                type="button"
                                onClick={() => handleIncrement(matchedItem)}
                                className="w-8 sm:w-9 h-full flex items-center justify-center text-slate-700 hover:bg-slate-100 active:bg-slate-200 transition cursor-pointer"
                                title="Increase quantity"
                              >
                                <Plus className="w-4 h-4 stroke-[2.5]" />
                              </button>
                            </div>
                          ) : (
                            <button
                              type="button"
                              onClick={() => handleAddItem(matchedItem)}
                              className="w-9 h-9 rounded-xl font-bold transition-all flex items-center justify-center shrink-0 shadow-2xs border bg-slate-100 hover:bg-slate-200 text-slate-700 border-slate-200 cursor-pointer active:scale-95"
                              title="Add to shopping list"
                            >
                              <Plus className="w-4 h-4 stroke-[2.5]" />
                            </button>
                          )}
                        </div>
                      </>
                    ) : (
                      // In Add / List Mode: Fixed w-28 slot so Scan Next button size NEVER changes
                      <div className="w-28 h-9 shrink-0 flex items-center justify-start">
                        {matchedItem.isNeeded && (matchedItem.quantity || 1) > 0 ? (
                          <div className="h-9 w-full flex items-center rounded-xl border border-slate-200 bg-white overflow-hidden shadow-2xs">
                            <button
                              type="button"
                              onClick={() => handleDecrement(matchedItem)}
                              className="w-8 sm:w-9 h-full flex items-center justify-center text-slate-600 hover:bg-slate-100 active:bg-slate-200 transition cursor-pointer"
                              title={matchedItem.quantity <= 1 ? 'Remove from shopping list' : 'Decrease quantity'}
                            >
                              <Minus className="w-3.5 h-3.5 stroke-[2.5]" />
                            </button>

                            <button
                              type="button"
                              onClick={() => setIsQuantityKeypadOpen(true)}
                              className="flex-1 px-1 h-full flex items-center justify-center text-xs sm:text-sm font-bold text-slate-800 hover:bg-slate-100 transition cursor-pointer select-none"
                              title="Click to set quantity with calculator"
                            >
                              {matchedItem.quantity}
                            </button>

                            <button
                              type="button"
                              onClick={() => handleIncrement(matchedItem)}
                              className="w-8 sm:w-9 h-full flex items-center justify-center text-slate-700 hover:bg-slate-100 active:bg-slate-200 transition cursor-pointer"
                              title="Increase quantity"
                            >
                              <Plus className="w-4 h-4 stroke-[2.5]" />
                            </button>
                          </div>
                        ) : (
                          <button
                            type="button"
                            onClick={() => handleAddItem(matchedItem)}
                            className="w-9 h-9 rounded-xl font-bold transition-all flex items-center justify-center shrink-0 shadow-2xs border bg-slate-100 hover:bg-slate-200 text-slate-700 border-slate-200 cursor-pointer active:scale-95"
                            title="Add to shopping list"
                          >
                            <Plus className="w-4 h-4 stroke-[2.5]" />
                          </button>
                        )}
                      </div>
                    )}

                    <button
                      type="button"
                      onClick={resumeScanner}
                      className="flex-1 py-2 px-4 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs sm:text-sm font-bold transition flex items-center justify-center gap-1.5 shrink-0 cursor-pointer active:scale-95 h-9"
                    >
                      <RotateCw className="w-3.5 h-3.5" />
                      <span>Scan Next</span>
                    </button>
                  </div>
                </div>
              )}

              {/* Case B: Online search in progress */}
              {isSearchingOnline && (
                <div className="bg-slate-50 border border-slate-200 rounded-2xl p-6 text-center space-y-3">
                  <div className="w-10 h-10 border-3 border-emerald-600 border-t-transparent rounded-full animate-spin mx-auto" />
                  <div>
                    <h3 className="text-sm font-bold text-slate-800">Searching Open Food Facts database...</h3>
                    <p className="text-xs text-slate-500 font-mono mt-0.5">Barcode: {activeBarcode}</p>
                  </div>
                </div>
              )}

              {/* Case C: Found in Open Food Facts */}
              {!matchedItem && onlineProduct && (
                <div className="bg-slate-50 border border-emerald-300 ring-1 ring-emerald-400 rounded-2xl p-4 shadow-2xs space-y-3">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span className="text-xs font-bold text-emerald-800 uppercase tracking-wider">
                      New Product Discovered
                    </span>
                  </div>

                  <div className="flex items-start gap-3">
                    {onlineProduct.imageUrl ? (
                      <img
                        src={onlineProduct.imageUrl}
                        alt={onlineProduct.name}
                        className="w-14 h-14 object-contain rounded-xl bg-white border border-slate-200 shrink-0 p-1"
                      />
                    ) : (
                      <div className="w-14 h-14 rounded-xl bg-emerald-100 text-emerald-800 font-black text-sm flex items-center justify-center shrink-0 border border-emerald-200">
                        {onlineProduct.name.substring(0, 2).toUpperCase()}
                      </div>
                    )}
                    <div className="flex-1">
                      <div className="text-sm sm:text-base font-black text-slate-900 leading-snug">
                        {onlineProduct.name}
                      </div>
                      <div className="flex items-center gap-2 flex-wrap mt-1">
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                          {onlineProduct.suggestedCategory}
                        </span>
                        {onlineProduct.quantityStr && (
                          <span className="text-[11px] text-slate-600 font-medium">
                            Size: {onlineProduct.quantityStr}
                          </span>
                        )}
                      </div>
                      <div className="text-xs text-slate-400 font-mono mt-1">Barcode: {activeBarcode}</div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 pt-1 flex-wrap sm:flex-nowrap">
                    <button
                      type="button"
                      onClick={handleAddOnlineProduct}
                      className="flex-1 py-2.5 px-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs sm:text-sm font-black transition flex items-center justify-center gap-1.5 cursor-pointer shadow-xs active:scale-95"
                    >
                      <Plus className="w-4 h-4 stroke-[2.5]" />
                      <span>Add to Catalog & List</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setShowLinkSelector(!showLinkSelector)
                        if (!showLinkSelector && onlineProduct?.suggestedCategory) {
                          setLinkCategory(onlineProduct.suggestedCategory)
                        }
                      }}
                      className={`py-2.5 px-3.5 rounded-xl text-xs sm:text-sm font-bold transition flex items-center justify-center gap-1.5 cursor-pointer shadow-2xs ${
                        showLinkSelector
                          ? 'bg-emerald-100 text-emerald-900 border border-emerald-300'
                          : 'bg-white hover:bg-slate-100 border border-slate-300 text-slate-700'
                      }`}
                      title="Link barcode to an existing item or create with a custom short name"
                    >
                      <Link2 className="w-4 h-4" />
                      <span>Link</span>
                    </button>

                    <button
                      type="button"
                      onClick={resumeScanner}
                      className="py-2.5 px-3 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition flex items-center justify-center gap-1 shrink-0 cursor-pointer"
                    >
                      <RotateCw className="w-3.5 h-3.5" />
                      <span>Next</span>
                    </button>
                  </div>

                  {/* Shared Link Selector with Custom Short Name Support */}
                  {renderLinkSelector()}
                </div>
              )}

              {/* Case D: Not in Catalog and Not in Open Food Facts */}
              {!matchedItem && !onlineProduct && !isSearchingOnline && (
                <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 space-y-3">
                  <div className="flex items-center gap-2 text-slate-700">
                    <AlertCircle className="w-4 h-4 text-amber-500 shrink-0" />
                    <span className="text-xs font-bold">Unrecognized Product</span>
                  </div>
                  <p className="text-xs text-slate-500">
                    {onlineError ? (
                      onlineError
                    ) : (
                      <>
                        Barcode <span className="font-mono font-bold text-slate-800">{activeBarcode}</span> was not found in your catalog or the online database.
                      </>
                    )}
                  </p>

                  <div className="flex items-center gap-2 pt-1 flex-wrap sm:flex-nowrap">
                    <button
                      type="button"
                      onClick={() => {
                        setShowLinkSelector(!showLinkSelector)
                        if (!showLinkSelector && !linkCategory) {
                          setLinkCategory(categories[0] || 'Produce')
                        }
                      }}
                      className={`flex-1 py-2.5 px-4 rounded-xl text-xs sm:text-sm font-bold transition flex items-center justify-center gap-2 cursor-pointer shadow-xs active:scale-95 ${
                        showLinkSelector
                          ? 'bg-emerald-100 text-emerald-900 border border-emerald-300'
                          : 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-600/20'
                      }`}
                      title="Link this barcode to an existing item or create with a custom short name"
                    >
                      <Link2 className="w-4 h-4" />
                      <span>Link</span>
                    </button>

                    <button
                      type="button"
                      onClick={resumeScanner}
                      className="py-2.5 px-4 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs sm:text-sm font-bold transition flex items-center justify-center gap-1.5 shrink-0 cursor-pointer"
                    >
                      <RotateCw className="w-3.5 h-3.5" />
                      <span>Scan Again</span>
                    </button>
                  </div>

                  {/* Shared Link Selector with Custom Short Name Support */}
                  {renderLinkSelector()}
                </div>
              )}
            </div>
          ) : (
            // Idle View / Manual entry fallback
            <div className="w-full p-4 space-y-3">
              <div className="flex items-center justify-between text-xs text-slate-500">
                <span className="font-semibold">Having trouble scanning?</span>
                <button
                  type="button"
                  onClick={() => setShowManualInput(!showManualInput)}
                  className="text-emerald-700 hover:text-emerald-800 font-bold flex items-center gap-1 cursor-pointer"
                >
                  <Keyboard className="w-3.5 h-3.5" />
                  <span>{showManualInput ? 'Hide Manual Input' : 'Enter Barcode Manually'}</span>
                </button>
              </div>

              {showManualInput && (
                <form
                  onSubmit={(e) => {
                    e.preventDefault()
                    if (manualBarcode.trim()) {
                      processBarcode(manualBarcode.trim())
                    }
                  }}
                  className="flex items-center gap-2 animate-in fade-in duration-150"
                >
                  <input
                    type="text"
                    inputMode="numeric"
                    placeholder="e.g. 049000006346"
                    value={manualBarcode}
                    onChange={(e) => setManualBarcode(e.target.value)}
                    className="flex-1 px-3 py-2 border border-slate-300 rounded-xl text-xs sm:text-sm font-mono focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                  <button
                    type="submit"
                    disabled={!manualBarcode.trim()}
                    className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-40 text-white rounded-xl text-xs sm:text-sm font-bold transition cursor-pointer"
                  >
                    Search
                  </button>
                </form>
              )}
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-3 border-t border-slate-200 bg-slate-50 flex items-center justify-between text-xs text-slate-500 shrink-0">
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block animate-pulse" />
            <span className="font-semibold">HTML5 + Open Food Facts</span>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 bg-white hover:bg-slate-100 border border-slate-200 text-slate-700 font-bold rounded-xl transition cursor-pointer shadow-2xs"
          >
            Done
          </button>
        </div>
      </div>

      {/* Keypad Modal for Quick Shelf Price Updates */}
      {showPriceKeypad && matchedItem && currentShopId && (
        <KeypadCalculatorModal
          isOpen={showPriceKeypad}
          onClose={() => setShowPriceKeypad(false)}
          title="Update Shelf Price"
          itemName={matchedItem.name}
          storeName={activeShop?.name || 'Store'}
          initialValue={matchedItem.shops[currentShopId]?.price ?? 0}
          mode="price"
          onApply={handleApplyShelfPrice}
        />
      )}

      {/* Keypad Modal for Quick Quantity Updates */}
      {isQuantityKeypadOpen && matchedItem && (
        <KeypadCalculatorModal
          isOpen={isQuantityKeypadOpen}
          onClose={() => setIsQuantityKeypadOpen(false)}
          title="Set Quantity"
          itemName={matchedItem.name}
          storeName=""
          initialValue={matchedItem.quantity || 1}
          mode="quantity"
          onApply={async (newQty) => {
            if (newQty <= 0) {
              setMatchedItem((prev) => (prev ? { ...prev, isNeeded: false, inCart: false } : prev))
              await updateItem(matchedItem.id, { isNeeded: false, inCart: false })
              setActionNotice(`Removed "${matchedItem.name}" from shopping list`)
            } else {
              setMatchedItem((prev) => (prev ? { ...prev, isNeeded: true, quantity: newQty } : prev))
              await updateItem(matchedItem.id, { isNeeded: true, quantity: newQty })
              setActionNotice(`Set quantity of "${matchedItem.name}" to ${newQty}`)
            }
            setIsQuantityKeypadOpen(false)
          }}
        />
      )}
    </div>
  )
}
