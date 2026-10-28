import React, { useState, useEffect, useRef, useMemo } from 'react'
import {
  X,
  Trash2,
  Store,
  CheckCircle,
  XCircle,
  Plus,
  Minus,
  ChevronDown,
  Check,
  MapPin,
  Repeat,
  ShoppingCart,
  Tag,
  Sparkles,
} from 'lucide-react'
import type { ItemShopDetail, ShoppingItem, StorePackageOption } from '../types'
import { useShopping } from '../context/ShoppingContext'
import {
  formatUnitPrice,
  getOptimalStorePackage,
  getNormalizedUnitPrice,
  UNIT_GROUPS,
} from '../utils/pricing'
import { KeypadCalculatorModal } from './KeypadCalculatorModal'

interface ItemEditorModalProps {
  item?: ShoppingItem | null
  initialShopId?: string
  onClose: () => void
}

export const ItemEditorModal: React.FC<ItemEditorModalProps> = ({ item, initialShopId, onClose }) => {
  const {
    shops,
    addItem,
    updateItem,
    deleteItem,
    categories,
    addCategory,
    updateShop,
    selectedShopId,
    items,
  } = useShopping()

  // Always reference the live item from context to ensure the modal shows the exact quantity from the List
  const liveItem = useMemo(() => {
    if (!item?.id) return item
    return items.find((i) => i.id === item.id) || item
  }, [items, item])

  const [name, setName] = useState(liveItem?.name || '')
  const [category, setCategory] = useState(liveItem?.category || (categories[0] || 'Produce'))
  const [quantity, setQuantity] = useState(liveItem?.quantity || 1)
  const [notes, setNotes] = useState(liveItem?.notes || '')
  const [isNeeded, setIsNeeded] = useState(liveItem ? liveItem.isNeeded : true)
  const [isWeekly, setIsWeekly] = useState(Boolean(liveItem?.isWeekly))

  // Discover initial common package measurement unit across stores and alternatives
  const getInitialCommonUnit = (): string => {
    if (item?.shops) {
      for (const sDetail of Object.values(item.shops)) {
        if (sDetail.packageUnit) return sDetail.packageUnit
        if (sDetail.packageOptions && sDetail.packageOptions[0]?.packageUnit) {
          return sDetail.packageOptions[0].packageUnit
        }
      }
    }
    if (item?.unit && item.unit !== 'items' && item.unit !== 'pieces') {
      return item.unit
    }
    if (item?.unit) {
      return item.unit
    }
    return 'oz'
  }

  // Common measurement unit for all stores and all alternative sizes
  const [commonUnit, setCommonUnit] = useState<string>(getInitialCommonUnit)

  // Re-sync form state when item changes or modal opens
  useEffect(() => {
    if (liveItem) {
      setName(liveItem.name || '')
      setCategory(liveItem.category || (categories[0] || 'Produce'))
      setQuantity(liveItem.quantity || 1)
      setNotes(liveItem.notes || '')
      setIsNeeded(liveItem.isNeeded)
      setIsWeekly(Boolean(liveItem.isWeekly))

      let detectedUnit = ''
      if (liveItem.shops) {
        for (const sDetail of Object.values(liveItem.shops)) {
          if (sDetail.packageUnit) {
            detectedUnit = sDetail.packageUnit
            break
          }
          if (sDetail.packageOptions && sDetail.packageOptions[0]?.packageUnit) {
            detectedUnit = sDetail.packageOptions[0].packageUnit
            break
          }
        }
      }
      if (!detectedUnit && liveItem.unit) {
        detectedUnit = liveItem.unit
      }
      if (detectedUnit) {
        setCommonUnit(detectedUnit)
      }
    }
  }, [liveItem?.id, liveItem?.quantity, liveItem?.updatedAt])

  // New Category Input State
  const [isAddingNewCat, setIsAddingNewCat] = useState(false)
  const [newCatInput, setNewCatInput] = useState('')

  // New Aisle Input State
  const [newAisleInput, setNewAisleInput] = useState('')

  // Shop configurations: availability, price, location, packageSize, packageUnit per store
  const [shopDetails, setShopDetails] = useState<Record<string, ItemShopDetail>>(() => {
    const defaultUnit = getInitialCommonUnit()
    const initial: Record<string, ItemShopDetail> = {}
    shops.forEach((shop) => {
      if (item && item.shops[shop.id]) {
        initial[shop.id] = {
          ...item.shops[shop.id],
          packageUnit: item.shops[shop.id].packageUnit || defaultUnit,
        }
      } else {
        initial[shop.id] = {
          available: true,
          price: null,
          location: '',
          unitSize: '',
          packageSize: null,
          packageUnit: defaultUnit,
          unitPrice: null,
        }
      }
    })
    return initial
  })

  // When common unit changes, seamlessly synchronize across all stores & package options
  const handleCommonUnitChange = (newUnit: string) => {
    setCommonUnit(newUnit)
    setShopDetails((prev) => {
      const updated: Record<string, ItemShopDetail> = {}
      for (const [shopId, detail] of Object.entries(prev)) {
        const updatedOptions = detail.packageOptions?.map((opt) => ({
          ...opt,
          packageUnit: newUnit,
        }))

        updated[shopId] = {
          ...detail,
          packageUnit: newUnit,
          packageOptions: updatedOptions,
        }
      }
      return updated
    })
  }

  const [activeTabShopId, setActiveTabShopId] = useState<string>(() => {
    if (initialShopId && shops.some((s) => s.id === initialShopId)) {
      return initialShopId
    }
    if (selectedShopId && shops.some((s) => s.id === selectedShopId)) {
      return selectedShopId
    }
    return shops[0]?.id || ''
  })

  useEffect(() => {
    const target = initialShopId || selectedShopId
    if (target && shops.some((s) => s.id === target)) {
      setActiveTabShopId(target)
    }
  }, [initialShopId, selectedShopId, shops])

  const handleShopDetailChange = (shopId: string, patch: Partial<ItemShopDetail>) => {
    setShopDetails((prev) => {
      const existing = prev[shopId] || {
        available: true,
        price: null,
        location: '',
      }
      const merged: ItemShopDetail = {
        ...existing,
        ...patch,
        unitSize:
          'unitSize' in patch
            ? patch.unitSize && patch.unitSize.trim()
              ? patch.unitSize.trim()
              : undefined
            : existing.unitSize,
      }

      // Auto-compute unit price if price and packageSize exist
      if (
        typeof merged.price === 'number' &&
        typeof merged.packageSize === 'number' &&
        merged.packageSize > 0
      ) {
        merged.unitPrice = Number((merged.price / merged.packageSize).toFixed(4))
      } else if (patch.packageSize === null || patch.price === null) {
        merged.unitPrice = null
      }

      return {
        ...prev,
        [shopId]: merged,
      }
    })
  }

  const handleCreateCategory = async () => {
    if (newCatInput.trim()) {
      await addCategory(newCatInput.trim())
      setCategory(newCatInput.trim())
      setNewCatInput('')
      setIsAddingNewCat(false)
    }
  }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim()) return

    // Clean up empty/incomplete packageOptions
    const cleanedShopDetails: Record<string, ItemShopDetail> = {}
    for (const [sId, detail] of Object.entries(shopDetails)) {
      if (detail.packageOptions && detail.packageOptions.length > 0) {
        const validOptions = detail.packageOptions
          .filter((opt) => {
            const p = typeof opt.price === 'number' ? opt.price : parseFloat(String(opt.price))
            const s =
              typeof opt.packageSize === 'number'
                ? opt.packageSize
                : parseFloat(String(opt.packageSize))
            return !isNaN(p) && p > 0 && !isNaN(s) && s > 0
          })
          .map((opt) => {
            const p = typeof opt.price === 'number' ? opt.price : parseFloat(String(opt.price))
            const s =
              typeof opt.packageSize === 'number'
                ? opt.packageSize
                : parseFloat(String(opt.packageSize))
            const rawLabel = opt.label?.trim()
            const isRedundant =
              rawLabel &&
              (rawLabel.toLowerCase() === `${s} ${commonUnit}`.toLowerCase() ||
                rawLabel.toLowerCase() === `${s}`.toLowerCase())
            return {
              ...opt,
              label: rawLabel && !isRedundant ? rawLabel : undefined,
              price: p,
              packageSize: s,
              packageUnit: commonUnit,
              unitPrice: Number((p / s).toFixed(4)),
            }
          })

        if (validOptions.length >= 2) {
          const sorted = [...validOptions].sort((a, b) => {
            const uA = getNormalizedUnitPrice(a.unitPrice, a.packageUnit)
            const uB = getNormalizedUnitPrice(b.unitPrice, b.packageUnit)
            if (typeof uA === 'number' && typeof uB === 'number' && uA > 0 && uB > 0) {
              if (Math.abs(uA - uB) > 0.0001) return uA - uB
            }
            return a.price - b.price
          })
          const best = sorted[0] || validOptions[0]

          cleanedShopDetails[sId] = {
            ...detail,
            packageOptions: validOptions,
            price: best.price,
            packageSize: best.packageSize,
            packageUnit: commonUnit,
            unitPrice: best.unitPrice,
            unitSize: best.label && best.label.trim() ? best.label.trim() : undefined,
          }
        } else if (validOptions.length === 1) {
          cleanedShopDetails[sId] = {
            ...detail,
            packageOptions: undefined,
            price: validOptions[0].price,
            packageSize: validOptions[0].packageSize,
            packageUnit: commonUnit,
            unitPrice: validOptions[0].unitPrice,
            unitSize: validOptions[0].label && validOptions[0].label.trim() ? validOptions[0].label.trim() : undefined,
          }
        } else {
          cleanedShopDetails[sId] = {
            ...detail,
            packageUnit: commonUnit,
            packageOptions: undefined,
            unitSize: detail.unitSize && detail.unitSize.trim() ? detail.unitSize.trim() : undefined,
          }
        }
      } else {
        cleanedShopDetails[sId] = {
          ...detail,
          packageUnit: commonUnit,
          unitSize: detail.unitSize && detail.unitSize.trim() ? detail.unitSize.trim() : undefined,
        }
      }
    }

    const payload = {
      name: name.trim(),
      category,
      quantity: Number(quantity) || 1,
      unit: commonUnit,
      notes: notes.trim(),
      isNeeded,
      isWeekly,
      inCart: item ? item.inCart : false,
      shops: cleanedShopDetails,
    }

    if (item) {
      await updateItem(item.id, payload)
    } else {
      await addItem(payload)
    }

    onClose()
  }

  const handleDelete = async () => {
    if (item && window.confirm(`Delete "${item.name}" from your catalog?`)) {
      await deleteItem(item.id)
      onClose()
    }
  }

  const handleAddNewAisle = async () => {
    const trimmed = newAisleInput.trim()
    if (!trimmed || !activeShop) return

    const existingAisles = activeShop.defaultAisles || []
    if (!existingAisles.includes(trimmed)) {
      const updatedAisles = [...existingAisles, trimmed]
      await updateShop(activeShop.id, { defaultAisles: updatedAisles })
    }

    handleShopDetailChange(activeShop.id, { location: trimmed })
    setNewAisleInput('')
    setIsAisleModalOpen(false)
  }

  const activeShop = shops.find((s) => s.id === activeTabShopId) || shops[0]
  const currentShopDetail = (activeShop && shopDetails[activeShop.id]) || {
    available: true,
    price: null,
    location: '',
  }

  // Multi-size evaluation for the current store
  const optimalStorePackageResult = useMemo(() => {
    if (!activeShop) return null
    return getOptimalStorePackage(
      {
        id: item?.id || '',
        name,
        category,
        quantity: Number(quantity) || 1,
        unit: commonUnit,
        isNeeded,
        inCart: false,
        shops: shopDetails,
        createdAt: 0,
        updatedAt: 0,
      },
      activeShop.id
    )
  }, [item?.id, name, category, quantity, commonUnit, isNeeded, shopDetails, activeShop])

  const hasMultipleSizes = Boolean(
    currentShopDetail.packageOptions && currentShopDetail.packageOptions.length >= 2
  )

  // Focus tracking for newly added alternative size
  const [focusOptionId, setFocusOptionId] = useState<string | null>(null)
  const priceButtonRefs = useRef<Record<string, HTMLButtonElement | null>>({})

  // On-demand label input visibility per size row (#1)
  const [showLabelInputMap, setShowLabelInputMap] = useState<Record<string, boolean>>({})

  // Handle Adding an Alternative Size row
  const handleAddAlternativeSize = (shopId: string) => {
    const newOptionId = 'opt-alt-' + Date.now() + '-' + Math.random().toString(36).substring(2, 6)

    setShopDetails((prev) => {
      const existing = prev[shopId] || {
        available: true,
        price: null,
        location: '',
      }

      let existingOptions = existing.packageOptions ? [...existing.packageOptions] : []

      // If existingOptions is empty or has only 1 item, wrap existing single size as Option #1
      if (existingOptions.length === 0) {
        const primarySize =
          typeof existing.packageSize === 'number' && existing.packageSize > 0
            ? existing.packageSize
            : 1 // Auto-default to 1 (#2)
        const primaryPrice =
          typeof existing.price === 'number' && existing.price > 0 ? existing.price : null

        existingOptions.push({
          id: 'opt-primary-' + Date.now(),
          label: existing.unitSize || undefined,
          packageSize: primarySize,
          packageUnit: commonUnit,
          price: (primaryPrice ?? '') as unknown as number,
          unitPrice:
            primaryPrice && primarySize > 0
              ? Number((primaryPrice / primarySize).toFixed(4))
              : null,
        })
      }

      existingOptions.push({
        id: newOptionId,
        label: undefined,
        packageSize: 1, // Pre-fill with 1 (#2)
        packageUnit: commonUnit,
        price: '' as unknown as number,
        unitPrice: null,
      })

      return {
        ...prev,
        [shopId]: {
          ...existing,
          packageOptions: existingOptions,
        },
      }
    })

    setFocusOptionId(newOptionId)
  }

  // Handle live inline editing of any package size option (Price, Package Size, or Label)
  const handleUpdateOption = (
    shopId: string,
    optionIndex: number,
    patch: Partial<StorePackageOption> | { price?: number | null; packageSize?: number | null; label?: string }
  ) => {
    setShopDetails((prev) => {
      const existing = prev[shopId] || {
        available: true,
        price: null,
        location: '',
      }
      const currentOptions = existing.packageOptions ? [...existing.packageOptions] : []
      if (optionIndex < 0 || optionIndex >= currentOptions.length) return prev

      const oldOpt = currentOptions[optionIndex]
      const updatedOpt: StorePackageOption = {
        ...oldOpt,
        ...(patch as Partial<StorePackageOption>),
        packageUnit: commonUnit,
      }
      if ('label' in patch) {
        updatedOpt.label = patch.label && patch.label.trim() ? patch.label.trim() : undefined
      }

      // Auto-default packageSize to 1 if price is entered and size is blank/0 (#2)
      if (patch.price !== undefined) {
        const p = typeof patch.price === 'number' ? patch.price : parseFloat(String(patch.price))
        if (!isNaN(p) && p > 0) {
          const currentSize =
            typeof updatedOpt.packageSize === 'number'
              ? updatedOpt.packageSize
              : parseFloat(String(updatedOpt.packageSize))
          if (isNaN(currentSize) || currentSize <= 0) {
            updatedOpt.packageSize = 1
          }
        }
      }

      const numPrice =
        typeof updatedOpt.price === 'number' ? updatedOpt.price : parseFloat(String(updatedOpt.price))
      const numSize =
        typeof updatedOpt.packageSize === 'number'
          ? updatedOpt.packageSize
          : parseFloat(String(updatedOpt.packageSize))

      if (!isNaN(numPrice) && numPrice > 0 && !isNaN(numSize) && numSize > 0) {
        updatedOpt.unitPrice = Number((numPrice / numSize).toFixed(4))
      } else {
        updatedOpt.unitPrice = null
      }

      currentOptions[optionIndex] = updatedOpt

      // Keep the shop's top-level fields in sync with the best value option
      const shopPatch: Partial<ItemShopDetail> = {
        packageOptions: currentOptions,
        packageUnit: commonUnit,
      }
      const validOpts = currentOptions.filter(
        (o) => {
          const p = typeof o.price === 'number' ? o.price : parseFloat(String(o.price))
          const s = typeof o.packageSize === 'number' ? o.packageSize : parseFloat(String(o.packageSize))
          return !isNaN(p) && p > 0 && !isNaN(s) && s > 0
        }
      )
      if (validOpts.length > 0) {
        const sorted = [...validOpts].sort((a, b) => {
          const uA = getNormalizedUnitPrice(a.unitPrice, a.packageUnit)
          const uB = getNormalizedUnitPrice(b.unitPrice, b.packageUnit)
          if (typeof uA === 'number' && typeof uB === 'number' && uA > 0 && uB > 0) {
            if (Math.abs(uA - uB) > 0.0001) return uA - uB
          }
          return a.price - b.price
        })
        const best = sorted[0]
        shopPatch.price = best.price
        shopPatch.packageSize = best.packageSize
        shopPatch.packageUnit = commonUnit
        shopPatch.unitPrice = best.unitPrice
        shopPatch.unitSize = best.label && best.label.trim() ? best.label.trim() : undefined
      } else if (optionIndex === 0) {
        shopPatch.price = !isNaN(numPrice) && numPrice > 0 ? numPrice : null
        shopPatch.packageSize = !isNaN(numSize) && numSize > 0 ? numSize : null
        shopPatch.packageUnit = commonUnit
        shopPatch.unitPrice = updatedOpt.unitPrice
        shopPatch.unitSize = updatedOpt.label && updatedOpt.label.trim() ? updatedOpt.label.trim() : undefined
      }

      return {
        ...prev,
        [shopId]: {
          ...existing,
          ...shopPatch,
        },
      }
    })
  }

  // Handle removing a package size option
  const handleRemovePackageOption = (shopId: string, target: number | string) => {
    setShopDetails((prev) => {
      const existing = prev[shopId]
      if (!existing || !existing.packageOptions) return prev

      const updatedOptions = existing.packageOptions.filter((o, idx) =>
        typeof target === 'number' ? idx !== target : o.id !== target
      )

      if (updatedOptions.length <= 1) {
        const remaining = updatedOptions[0]
        const remPrice =
          remaining && typeof remaining.price === 'number' && remaining.price > 0
            ? remaining.price
            : typeof existing.price === 'number' && existing.price > 0
            ? existing.price
            : null
        const remSize =
          remaining && typeof remaining.packageSize === 'number' && remaining.packageSize > 0
            ? remaining.packageSize
            : typeof existing.packageSize === 'number' && existing.packageSize > 0
            ? existing.packageSize
            : null
        const remUnitPrice = remPrice && remSize ? Number((remPrice / remSize).toFixed(4)) : null

        return {
          ...prev,
          [shopId]: {
            ...existing,
            price: remPrice,
            packageSize: remSize,
            packageUnit: commonUnit,
            unitPrice: remUnitPrice,
            unitSize: remaining?.label && remaining.label.trim() ? remaining.label.trim() : undefined,
            packageOptions: undefined,
          },
        }
      }

      const validOpts = updatedOptions.filter(
        (o) => {
          const p = typeof o.price === 'number' ? o.price : parseFloat(String(o.price))
          const s = typeof o.packageSize === 'number' ? o.packageSize : parseFloat(String(o.packageSize))
          return !isNaN(p) && p > 0 && !isNaN(s) && s > 0
        }
      )
      let bestPatch: Partial<ItemShopDetail> = {
        packageUnit: commonUnit,
      }
      if (validOpts.length > 0) {
        const sorted = [...validOpts].sort((a, b) => {
          const uA = getNormalizedUnitPrice(a.unitPrice, a.packageUnit)
          const uB = getNormalizedUnitPrice(b.unitPrice, b.packageUnit)
          if (typeof uA === 'number' && typeof uB === 'number' && uA > 0 && uB > 0) {
            if (Math.abs(uA - uB) > 0.0001) return uA - uB
          }
          return a.price - b.price
        })
        const best = sorted[0]
        bestPatch = {
          price: best.price,
          packageSize: best.packageSize,
          packageUnit: commonUnit,
          unitPrice: best.unitPrice,
          unitSize: best.label && best.label.trim() ? best.label.trim() : undefined,
        }
      }

      return {
        ...prev,
        [shopId]: {
          ...existing,
          ...bestPatch,
          packageOptions: updatedOptions,
        },
      }
    })
  }

  // Unified field updater for any size option (handles single or multi-size transparently)
  const handleUpdateOptionField = (
    idx: number,
    patch: Partial<StorePackageOption> | { price?: number | null; packageSize?: number | null; label?: string }
  ) => {
    if (hasMultipleSizes) {
      handleUpdateOption(activeShop.id, idx, patch)
    } else {
      const shopPatch: Partial<ItemShopDetail> = {
        packageUnit: commonUnit,
      }
      if (patch.price !== undefined) {
        shopPatch.price = patch.price
        // Auto-default packageSize to 1 if price is entered and size is blank/0 (#2)
        const p = typeof patch.price === 'number' ? patch.price : parseFloat(String(patch.price))
        if (!isNaN(p) && p > 0) {
          const currentSize =
            typeof currentShopDetail.packageSize === 'number'
              ? currentShopDetail.packageSize
              : parseFloat(String(currentShopDetail.packageSize))
          if (isNaN(currentSize) || currentSize <= 0) {
            shopPatch.packageSize = 1
          }
        }
      }
      if (patch.packageSize !== undefined) {
        shopPatch.packageSize = patch.packageSize
      }
      if ('label' in patch) {
        shopPatch.unitSize = patch.label && patch.label.trim() ? patch.label.trim() : undefined
      }
      handleShopDetailChange(activeShop.id, shopPatch)
    }
  }

  // Unified options list to render size cards with identical framing in 1-size or multi-size
  const renderedOptions: StorePackageOption[] = useMemo(() => {
    if (hasMultipleSizes) {
      return currentShopDetail.packageOptions!
    }
    return [
      {
        id: 'primary',
        label: currentShopDetail.unitSize && currentShopDetail.unitSize.trim() ? currentShopDetail.unitSize.trim() : undefined,
        packageSize: (currentShopDetail.packageSize ?? '') as unknown as number,
        packageUnit: commonUnit,
        price: (currentShopDetail.price ?? '') as unknown as number,
        unitPrice: currentShopDetail.unitPrice,
      },
    ]
  }, [hasMultipleSizes, currentShopDetail, commonUnit])

  // Focus newly added alternative size shelf price button
  useEffect(() => {
    if (focusOptionId && priceButtonRefs.current[focusOptionId]) {
      const el = priceButtonRefs.current[focusOptionId]
      if (el) {
        el.focus()
        el.scrollIntoView({ behavior: 'smooth', block: 'nearest' })
      }
      setFocusOptionId(null)
    }
  }, [focusOptionId, renderedOptions])

  // Aisle / Location modal window state
  const [isAisleModalOpen, setIsAisleModalOpen] = useState(false)

  // Calculator modal state for quantity, price, and size
  const [calcModal, setCalcModal] = useState<{
    isOpen: boolean
    title: string
    mode: 'price' | 'quantity'
    initialValue: number | null
    unit?: string
    packageSize?: number | null
    packageUnit?: string
    onApply: (val: number) => void
  } | null>(null)

  useEffect(() => {
    setIsAisleModalOpen(false)
    setNewAisleInput('')
    setFocusOptionId(null)
  }, [activeTabShopId])

  // Strictly use predefined store aisles to disallow random aisle names
  const availableAislesForShop = useMemo(() => {
    if (!activeShop) return []
    return activeShop.defaultAisles || []
  }, [activeShop])

  // Find lowest unit price across all configured shops for live comparison
  const unitPriceEntries = Object.entries(shopDetails)
    .filter(([_, d]) => d.available && d.unitPrice && d.unitPrice > 0)
    .map(([sId, d]) => ({
      shopId: sId,
      shop: shops.find((s) => s.id === sId),
      unitPrice: d.unitPrice!,
      packageUnit: d.packageUnit || commonUnit,
    }))

  const minUnitPriceEntry =
    unitPriceEntries.length > 0
      ? unitPriceEntries.reduce((prev, curr) => (curr.unitPrice < prev.unitPrice ? curr : prev))
      : null

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-2 sm:p-4 z-50 animate-in fade-in">
      <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[94vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="px-4 sm:px-5 py-3 sm:py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50/80">
          <div>
            <h2 className="text-base sm:text-lg font-bold text-slate-900">
              {item ? 'Edit Grocery Item' : 'Add New Item'}
            </h2>
            <p className="text-xs text-slate-500">
              Set availability, normalized package prices & aisles
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-200 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Form Content */}
        <form onSubmit={handleSave} className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-5">
          {/* 1. Basic Info */}
          <div className="space-y-3.5">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Item Name *
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Organic Whole Milk, Hass Avocados, Peanut Butter"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-sm font-medium"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* Category Selection + Add Custom Category */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                    Category
                  </label>
                  {!isAddingNewCat && (
                    <button
                      type="button"
                      onClick={() => setIsAddingNewCat(true)}
                      className="text-[11px] text-emerald-700 hover:underline font-bold"
                    >
                      + New
                    </button>
                  )}
                </div>

                {isAddingNewCat ? (
                  <div className="flex gap-1">
                    <input
                      type="text"
                      autoFocus
                      placeholder="Category name"
                      value={newCatInput}
                      onChange={(e) => setNewCatInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault()
                          handleCreateCategory()
                        }
                      }}
                      className="w-full px-2 py-1.5 text-xs rounded-lg border border-emerald-500"
                    />
                    <button
                      type="button"
                      onClick={handleCreateCategory}
                      className="px-2 py-1 bg-emerald-600 text-white text-xs rounded-lg font-bold"
                    >
                      Add
                    </button>
                    <button
                      type="button"
                      onClick={() => setIsAddingNewCat(false)}
                      className="p-1 text-slate-400 text-xs"
                    >
                      ✕
                    </button>
                  </div>
                ) : (
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-xs sm:text-sm bg-white"
                  >
                    {categories.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                )}
              </div>

              {/* Quantity Stepper (+ and - buttons for mobile UX) */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Quantity
                </label>
                <div className="flex items-center rounded-xl border border-slate-300 bg-white overflow-hidden shadow-xs">
                  <button
                    type="button"
                    onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                    className="w-10 h-10 flex items-center justify-center bg-slate-50 hover:bg-slate-100 text-slate-600 active:bg-slate-200 transition shrink-0"
                    title="Decrease quantity"
                  >
                    <Minus className="w-4 h-4" />
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setCalcModal({
                        isOpen: true,
                        title: 'Set Quantity',
                        mode: 'quantity',
                        initialValue: quantity,
                        unit: commonUnit || '',
                        onApply: (newVal) => setQuantity(Math.max(1, newVal)),
                      })
                    }}
                    className="w-full h-10 flex items-center justify-center font-bold text-slate-900 text-sm hover:bg-slate-50 active:bg-slate-100 transition cursor-pointer"
                    title="Tap to change quantity with keypad"
                  >
                    <span>{quantity}</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setQuantity((q) => q + 1)}
                    className="w-10 h-10 flex items-center justify-center bg-slate-50 hover:bg-slate-100 text-emerald-700 active:bg-emerald-100 transition shrink-0"
                    title="Increase quantity"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Notes / Brand Preference
              </label>
              <input
                type="text"
                placeholder="e.g. Organic preferred, firm green ones"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-xs sm:text-sm"
              />
            </div>

            {/* Shopping List & Weekly Staple Toggles on the same row */}
            <div className="grid grid-cols-2 gap-2 sm:gap-2.5">
              {/* Need to Buy Switch */}
              <div className="flex items-center justify-between p-2.5 sm:p-3 rounded-xl bg-emerald-50/70 border border-emerald-200 min-w-0">
                <div className="flex items-center gap-2 min-w-0">
                  <ShoppingCart className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span className="text-[11px] sm:text-xs font-bold text-emerald-950 leading-tight">
                    Add to Shopping List
                  </span>
                </div>
                <label className="relative inline-flex items-center cursor-pointer shrink-0 ml-1.5 sm:ml-2">
                  <input
                    type="checkbox"
                    checked={isNeeded}
                    onChange={(e) => setIsNeeded(e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-9 sm:w-10 h-5 sm:h-5.5 bg-slate-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 sm:after:h-4.5 after:w-4 sm:after:w-4.5 after:transition-all peer-checked:bg-emerald-600"></div>
                </label>
              </div>

              {/* Weekly Recurring Staple Switch */}
              <div className="flex items-center justify-between p-2.5 sm:p-3 rounded-xl bg-blue-50/70 border border-blue-200 min-w-0">
                <div className="flex items-center gap-2 min-w-0">
                  <Repeat className="w-4 h-4 text-blue-600 shrink-0" />
                  <span className="text-[11px] sm:text-xs font-bold text-blue-950 leading-tight">
                    Weekly Household Staple
                  </span>
                </div>
                <label className="relative inline-flex items-center cursor-pointer shrink-0 ml-1.5 sm:ml-2">
                  <input
                    type="checkbox"
                    checked={isWeekly}
                    onChange={(e) => setIsWeekly(e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-9 sm:w-10 h-5 sm:h-5.5 bg-slate-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 sm:after:h-4.5 after:w-4 sm:after:w-4.5 after:transition-all peer-checked:bg-blue-600"></div>
                </label>
              </div>
            </div>
          </div>

          {/* 2. Store Pricing & Package Size Normalization */}
          <div className="pt-2 border-t border-slate-200">
            <div className="flex flex-wrap items-center justify-between gap-2 mb-2.5">
              <div>
                <label className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                  <Store className="w-4 h-4 text-emerald-600" />
                  <span>Store Prices, Sizes & Aisles</span>
                </label>
                <p className="text-[11px] text-slate-500">
                  Select package unit once for all stores & size comparisons
                </p>
              </div>

              {/* Single Common Unit Selector */}
              <div className="flex items-center gap-1.5 bg-slate-100 hover:bg-slate-200/80 px-2.5 py-1 rounded-xl border border-slate-200 transition">
                <label htmlFor="common-unit-select" className="text-[11px] font-bold text-slate-600 uppercase tracking-wider cursor-pointer">
                  Unit:
                </label>
                <select
                  id="common-unit-select"
                  value={commonUnit}
                  onChange={(e) => handleCommonUnitChange(e.target.value)}
                  className="bg-transparent text-xs font-bold text-slate-900 focus:outline-none cursor-pointer pr-1"
                >
                  {!UNIT_GROUPS.some((g) => g.units.includes(commonUnit)) && (
                    <option value={commonUnit}>{commonUnit}</option>
                  )}
                  {UNIT_GROUPS.map((grp) => (
                    <optgroup key={grp.label} label={grp.label}>
                      {grp.units.map((u) => (
                        <option key={u} value={u}>
                          {u}
                        </option>
                      ))}
                    </optgroup>
                  ))}
                </select>
              </div>
            </div>

            {/* Store Grid (2x2 on mobile, 4-col on desktop) — No Horizontal Scrolling */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-3">
              {shops.map((shop) => {
                const isSelected = shop.id === activeTabShopId
                const detail = shopDetails[shop.id]
                const isAvailable = detail?.available ?? true
                const isLowest =
                  minUnitPriceEntry?.shopId === shop.id && unitPriceEntries.length > 1

                return (
                  <button
                    key={shop.id}
                    type="button"
                    onClick={() => setActiveTabShopId(shop.id)}
                    className={`p-2.5 rounded-xl text-left border transition-all flex flex-col justify-between ${
                      isSelected
                        ? 'border-emerald-500 bg-emerald-50/90 text-emerald-950 font-bold shadow-xs ring-2 ring-emerald-500/20'
                        : isLowest
                        ? 'border-emerald-200 bg-emerald-50/40 text-slate-700 hover:bg-emerald-50/70'
                        : 'border-slate-200 bg-slate-50/80 text-slate-700 hover:bg-slate-100 hover:border-slate-300'
                    }`}
                  >
                    {/* Top: Dot + Store Name + Best Badge */}
                    <div className="flex items-center justify-between gap-1">
                      <div className="flex items-center gap-1.5 min-w-0">
                        <span
                          className={`w-2 h-2 rounded-full shrink-0 ${
                            isAvailable ? 'bg-emerald-500' : 'bg-rose-400'
                          }`}
                        />
                        <span className="text-xs font-bold truncate">{shop.name}</span>
                      </div>

                      {isLowest && isAvailable && (
                        <span
                          className="inline-flex items-center p-0.5 text-emerald-600 shrink-0"
                          title="Lowest price across stores"
                        >
                          <Sparkles className="w-3.5 h-3.5" />
                        </span>
                      )}
                    </div>

                    {/* Bottom: Stacked Normalized Unit Price */}
                    <div className="mt-1">
                      {isAvailable ? (
                        detail?.price ? (
                          <div className="text-[11px] font-mono font-bold text-slate-800 leading-tight">
                            {detail.unitPrice
                              ? formatUnitPrice(detail.unitPrice, detail.packageUnit || commonUnit)
                              : `$${detail.price.toFixed(2)}`}
                          </div>
                        ) : (
                          <div className="text-[10px] text-slate-400 italic">No price</div>
                        )
                      ) : (
                        <div className="text-[10px] text-rose-600 font-semibold">Not carried</div>
                      )}
                    </div>
                  </button>
                )
              })}
            </div>

            {/* Active Shop Configuration */}
            {activeShop && (
              <div className="mt-3 p-3.5 sm:p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
                {/* Compact Store Control Bar: Aisle Picker + Availability Toggle */}
                <div className="flex items-center justify-between gap-2 pb-2.5 border-b border-slate-200">
                  {/* Left: Compact Aisle Picker (Opens Aisle Window) */}
                  {currentShopDetail.available ? (
                    <button
                      type="button"
                      onClick={() => setIsAisleModalOpen(true)}
                      className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs font-medium border transition cursor-pointer ${
                        currentShopDetail.location
                          ? 'bg-emerald-50 text-emerald-900 border-emerald-300 font-bold'
                          : 'bg-white text-slate-600 border-slate-300 hover:border-slate-400'
                      }`}
                      title="Select aisle location"
                    >
                      <MapPin className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                      <span className="max-w-[130px] sm:max-w-[180px] truncate">
                        {currentShopDetail.location || 'Select Aisle'}
                      </span>
                      <ChevronDown className="w-3 h-3 text-slate-400 shrink-0" />
                    </button>
                  ) : (
                    <span className="text-xs text-slate-400 italic">Not Carried</span>
                  )}

                  {/* Right: Availability Toggle (Icon Only) */}
                  <button
                    type="button"
                    onClick={() =>
                      handleShopDetailChange(activeShop.id, {
                        available: !currentShopDetail.available,
                      })
                    }
                    className={`p-1.5 rounded-xl border transition cursor-pointer shadow-2xs ${
                      currentShopDetail.available
                        ? 'bg-emerald-100 text-emerald-800 border-emerald-300 hover:bg-emerald-200'
                        : 'bg-rose-100 text-rose-800 border-rose-300 hover:bg-rose-200'
                    }`}
                    title={
                      currentShopDetail.available
                        ? 'Item is carried here (tap to exclude)'
                        : 'Item is not carried here (tap to include)'
                    }
                    aria-label={currentShopDetail.available ? 'Included in this store' : 'Excluded from this store'}
                  >
                    {currentShopDetail.available ? (
                      <CheckCircle className="w-4 h-4 text-emerald-700" />
                    ) : (
                      <XCircle className="w-4 h-4 text-rose-700" />
                    )}
                  </button>
                </div>

                {currentShopDetail.available ? (
                  <div className="space-y-2">
                    {/* Rows for Primary and Alternative Sizes */}
                    <div className="space-y-2">
                      {renderedOptions.map((opt, idx) => {
                        const isOptimal =
                          hasMultipleSizes &&
                          optimalStorePackageResult?.bestOption.id === opt.id
                        const optPriceNum =
                          typeof opt.price === 'number'
                            ? opt.price
                            : parseFloat(String(opt.price))
                        const optSizeNum =
                          typeof opt.packageSize === 'number'
                            ? opt.packageSize
                            : parseFloat(String(opt.packageSize))
                        const optUnitPrice =
                          typeof opt.unitPrice === 'number' && opt.unitPrice > 0
                            ? opt.unitPrice
                            : !isNaN(optPriceNum) &&
                              optPriceNum > 0 &&
                              !isNaN(optSizeNum) &&
                              optSizeNum > 0
                            ? Number((optPriceNum / optSizeNum).toFixed(4))
                            : null

                        const optionKey = opt.id || `opt-${idx}`
                        const hasLabel = Boolean(opt.label && opt.label.trim())
                        const isLabelOpen = hasLabel || Boolean(showLabelInputMap[optionKey])

                        return (
                          <div
                            key={optionKey}
                            className={`p-2.5 rounded-xl border transition-all space-y-1.5 ${
                              isOptimal
                                ? 'bg-emerald-50/70 border-emerald-300 shadow-2xs ring-1 ring-emerald-400/30'
                                : 'bg-white border-slate-200 shadow-2xs hover:border-slate-300'
                            }`}
                          >
                            <div className="grid grid-cols-[minmax(0,1fr)_minmax(0,1fr)_auto_auto] gap-1.5 sm:gap-2 items-center">
                              {/* Column 1: Shelf Price ($) */}
                              <div className="relative min-w-0">
                                <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400 text-xs font-bold pointer-events-none">
                                  $
                                </span>
                                <button
                                  type="button"
                                  ref={(el) => {
                                    if (opt.id) {
                                      priceButtonRefs.current[opt.id] = el
                                    }
                                  }}
                                  onClick={() => {
                                    setCalcModal({
                                      isOpen: true,
                                      title: `Set Price (${activeShop.name})`,
                                      mode: 'price',
                                      initialValue:
                                        typeof opt.price === 'number' && !isNaN(opt.price)
                                          ? opt.price
                                          : null,
                                      packageSize: optSizeNum,
                                      packageUnit: commonUnit,
                                      onApply: (val) => {
                                        handleUpdateOptionField(idx, { price: val > 0 ? val : null })
                                      },
                                    })
                                  }}
                                  className="w-full h-9 pl-6 pr-2 rounded-lg border border-slate-300 text-sm font-semibold text-slate-900 bg-white hover:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-left flex items-center cursor-pointer transition truncate"
                                  title="Tap to change price with calculator"
                                >
                                  {typeof opt.price === 'number' && !isNaN(opt.price) && opt.price > 0 ? (
                                    opt.price.toFixed(2)
                                  ) : (
                                    <span className="text-slate-400 font-normal">0.00</span>
                                  )}
                                </button>
                              </div>

                              {/* Column 2: Quantity / Size ({commonUnit}) with auto-default placeholder '1' */}
                              <div className="relative min-w-0">
                                <button
                                  type="button"
                                  onClick={() => {
                                    setCalcModal({
                                      isOpen: true,
                                      title: `Set Package Size (${activeShop.name})`,
                                      mode: 'quantity',
                                      initialValue:
                                        typeof opt.packageSize === 'number' &&
                                        !isNaN(opt.packageSize)
                                          ? opt.packageSize
                                          : 1,
                                      unit: commonUnit,
                                      onApply: (val) => {
                                        handleUpdateOptionField(idx, { packageSize: val > 0 ? val : null })
                                      },
                                    })
                                  }}
                                  className="w-full h-9 pl-2.5 pr-8 rounded-lg border border-slate-300 text-sm font-bold text-slate-900 bg-white hover:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-left flex items-center cursor-pointer transition truncate"
                                  title="Tap to change size with calculator"
                                >
                                  {typeof opt.packageSize === 'number' &&
                                  !isNaN(opt.packageSize) &&
                                  opt.packageSize > 0 ? (
                                    <span>{Number(opt.packageSize.toFixed(2))}</span>
                                  ) : (
                                    <span className="text-slate-400 font-normal">1</span>
                                  )}
                                </button>
                                <span className="absolute right-2 top-1/2 -translate-y-1/2 text-[10px] font-bold text-slate-400 pointer-events-none truncate max-w-[28px]">
                                  {commonUnit}
                                </span>
                              </div>

                              {/* Column 3: Read-Only Result (Unit Price / Value) */}
                              <div className="flex items-center gap-1 shrink-0">
                                {optUnitPrice ? (
                                  <>
                                    <span className="h-9 px-2 font-mono text-xs font-bold text-indigo-700 bg-indigo-50 border border-indigo-100 rounded-lg shrink-0 inline-flex items-center justify-center whitespace-nowrap">
                                      {formatUnitPrice(optUnitPrice, commonUnit)}
                                    </span>
                                    {isOptimal && (
                                      <span
                                        className="inline-flex items-center p-0.5 text-emerald-600 shrink-0"
                                        title="Lowest price (best value)"
                                      >
                                        <Sparkles className="w-3.5 h-3.5" />
                                      </span>
                                    )}
                                    {hasMultipleSizes &&
                                      optimalStorePackageResult?.lowestCashOption?.id === opt.id &&
                                      !isOptimal && (
                                        <span
                                          className="text-[10px] font-bold text-slate-600 bg-slate-100 px-1.5 py-0.5 rounded-full border border-slate-200 shrink-0 whitespace-nowrap"
                                          title="Lowest upfront cash"
                                        >
                                          $
                                        </span>
                                      )}
                                  </>
                                ) : (
                                  <span className="h-9 px-2 text-xs text-slate-400 italic inline-flex items-center justify-center">—</span>
                                )}
                              </div>

                              {/* Column 4: Row Actions (Tag button + Remove alternative size) */}
                              <div className="flex items-center gap-0.5 justify-end shrink-0">
                                {/* If label is not open, offer subtle tag icon button */}
                                {!isLabelOpen && (
                                  <button
                                    type="button"
                                    onClick={() =>
                                      setShowLabelInputMap((prev) => ({
                                        ...prev,
                                        [optionKey]: true,
                                      }))
                                    }
                                    className="h-9 w-7 sm:w-8 flex items-center justify-center text-slate-400 hover:text-indigo-600 rounded-lg hover:bg-slate-100 transition shrink-0 cursor-pointer"
                                    title="Add custom label (e.g. Family Size, Club Pack)"
                                    aria-label="Add custom label"
                                  >
                                    <Tag className="w-3.5 h-3.5" />
                                  </button>
                                )}

                                {hasMultipleSizes && idx > 0 ? (
                                  <button
                                    type="button"
                                    onClick={() => handleRemovePackageOption(activeShop.id, idx)}
                                    className="h-9 w-7 sm:w-8 flex items-center justify-center rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition shrink-0 cursor-pointer"
                                    title="Remove this size option"
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </button>
                                ) : (
                                  !isLabelOpen ? null : <span className="w-7 sm:w-8 shrink-0" />
                                )}
                              </div>
                            </div>

                            {/* On-Demand Label Row: ONLY displayed if label exists or user clicked '+ label' (#1) */}
                            {isLabelOpen && (
                              <div className="flex items-center gap-1.5 pt-0.5 animate-in fade-in duration-100">
                                <input
                                  type="text"
                                  autoFocus={!hasLabel}
                                  placeholder="e.g. Family Size, Club Pack, 12-pack"
                                  value={opt.label || ''}
                                  onChange={(e) =>
                                    handleUpdateOptionField(idx, {
                                      label: e.target.value,
                                    })
                                  }
                                  className="flex-1 px-2.5 py-1 text-xs text-slate-700 bg-slate-50 hover:bg-slate-100/80 focus:bg-white rounded-lg border border-slate-200 focus:border-slate-300 focus:outline-none transition"
                                />
                                <button
                                  type="button"
                                  onClick={() => {
                                    handleUpdateOptionField(idx, { label: '' })
                                    setShowLabelInputMap((prev) => ({
                                      ...prev,
                                      [optionKey]: false,
                                    }))
                                  }}
                                  className="text-slate-400 hover:text-rose-500 p-1 rounded-lg transition cursor-pointer"
                                  title="Clear label"
                                >
                                  <X className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            )}
                          </div>
                        )
                      })}
                    </div>

                    {/* Add Alternative Size button */}
                    <button
                      type="button"
                      onClick={() => handleAddAlternativeSize(activeShop.id)}
                      className="w-full py-2 px-3 rounded-xl border border-dashed border-indigo-300 text-indigo-700 hover:bg-indigo-50/70 text-xs font-bold flex items-center justify-center gap-1.5 transition mt-2"
                    >
                      <Plus className="w-4 h-4 text-indigo-600" />
                      <span>{hasMultipleSizes ? 'Add Another Size Option' : 'Add Alternative Size'}</span>
                    </button>
                  </div>
                ) : (
                  <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-800 flex items-center gap-2">
                    <XCircle className="w-4 h-4 text-rose-600 shrink-0" />
                    <span>
                      Marked as <strong>not carried</strong> at {activeShop.name}. It will be excluded
                      from your shopping list when at this store.
                    </span>
                  </div>
                )}
              </div>
            )}
          </div>
        </form>

        {/* Footer */}
        <div className="px-4 sm:px-5 py-3 border-t border-slate-200 bg-slate-50/80 flex items-center justify-between">
          {item ? (
            <button
              type="button"
              onClick={handleDelete}
              className="text-xs font-bold text-rose-600 hover:text-rose-800 flex items-center gap-1 px-2.5 py-1.5 rounded-lg hover:bg-rose-50 transition"
            >
              <Trash2 className="w-4 h-4" />
              <span>Delete</span>
            </button>
          ) : (
            <div />
          )}

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl border border-slate-300 text-xs font-semibold text-slate-700 hover:bg-slate-100 transition"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSave}
              className="px-5 py-2 rounded-xl bg-emerald-600 text-white text-xs sm:text-sm font-bold shadow-md hover:bg-emerald-700 transition"
            >
              {item ? 'Save Changes' : 'Add Item'}
            </button>
          </div>
        </div>
      </div>

      {/* Aisle Selection Modal Dialog Window (#4) */}
      {isAisleModalOpen && activeShop && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-3 sm:p-4 bg-black/50 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="relative bg-white rounded-3xl w-full max-w-sm sm:max-w-md max-h-[85vh] shadow-2xl flex flex-col overflow-hidden border border-slate-200">
            {/* Header */}
            <div className="p-4 border-b border-slate-200 bg-gradient-to-r from-emerald-50 via-teal-50 to-emerald-50 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-emerald-600 text-white flex items-center justify-center shadow-xs">
                  <MapPin className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm sm:text-base font-bold text-slate-900">
                    Select Aisle / Location
                  </h3>
                  <p className="text-[11px] text-slate-500">
                    {activeShop.name}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsAisleModalOpen(false)}
                className="p-1.5 text-slate-400 hover:text-slate-700 rounded-xl hover:bg-slate-200/60 transition cursor-pointer"
                title="Close"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Body: Scrollable list of aisles */}
            <div className="p-3 sm:p-4 overflow-y-auto space-y-2 flex-1">
              {/* Unassigned / Clear button */}
              <button
                type="button"
                onClick={() => {
                  handleShopDetailChange(activeShop.id, { location: '' })
                  setIsAisleModalOpen(false)
                }}
                className={`w-full py-2.5 px-3 rounded-xl border text-xs font-semibold flex items-center justify-between transition cursor-pointer ${
                  !currentShopDetail.location
                    ? 'bg-slate-100 border-slate-400 text-slate-900'
                    : 'border-dashed border-slate-200 text-slate-500 hover:bg-slate-50'
                }`}
              >
                <div className="flex items-center gap-2">
                  <X className="w-3.5 h-3.5 text-slate-400" />
                  <span>No Aisle / Unassigned</span>
                </div>
                {!currentShopDetail.location && (
                  <Check className="w-4 h-4 text-emerald-600" />
                )}
              </button>

              {/* Existing predefined aisles */}
              {availableAislesForShop.map((aisle) => {
                const isSelected = currentShopDetail.location === aisle
                return (
                  <button
                    key={aisle}
                    type="button"
                    onClick={() => {
                      handleShopDetailChange(activeShop.id, { location: aisle })
                      setIsAisleModalOpen(false)
                    }}
                    className={`w-full py-2.5 px-3 rounded-xl border text-xs font-semibold flex items-center justify-between transition cursor-pointer ${
                      isSelected
                        ? 'bg-emerald-50 border-emerald-400 text-emerald-900 font-bold shadow-2xs'
                        : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <MapPin className={`w-3.5 h-3.5 ${isSelected ? 'text-emerald-600' : 'text-slate-400'}`} />
                      <span>{aisle}</span>
                    </div>
                    {isSelected && (
                      <Check className="w-4 h-4 text-emerald-600" />
                    )}
                  </button>
                )
              })}

              {availableAislesForShop.length === 0 && (
                <div className="py-4 text-center text-xs text-slate-400 italic">
                  No aisles configured for {activeShop.name} yet.
                </div>
              )}

              {/* Add custom aisle form */}
              <div className="pt-2 border-t border-slate-100">
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    placeholder="Add new aisle (e.g. Aisle 5, Produce)"
                    value={newAisleInput}
                    onChange={(e) => setNewAisleInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault()
                        handleAddNewAisle()
                      }
                    }}
                    className="flex-1 px-3 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                  <button
                    type="button"
                    onClick={handleAddNewAisle}
                    disabled={!newAisleInput.trim()}
                    className="px-3 py-2 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-40 text-white rounded-xl text-xs font-bold transition shrink-0 cursor-pointer"
                  >
                    Add
                  </button>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="p-3 bg-slate-50 border-t border-slate-200 flex justify-end">
              <button
                type="button"
                onClick={() => setIsAisleModalOpen(false)}
                className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-800 text-xs font-bold rounded-xl transition cursor-pointer"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Keypad Calculator Modal (#3) */}
      {calcModal && calcModal.isOpen && (
        <KeypadCalculatorModal
          isOpen={calcModal.isOpen}
          onClose={() => setCalcModal(null)}
          title={calcModal.title}
          itemName={name || 'Item'}
          storeName={activeShop ? activeShop.name : ''}
          initialValue={calcModal.initialValue}
          mode={calcModal.mode}
          unit={calcModal.unit}
          packageSize={calcModal.packageSize}
          packageUnit={calcModal.packageUnit}
          onApply={(val) => {
            calcModal.onApply(val)
            setCalcModal(null)
          }}
        />
      )}
    </div>
  )
}
