import React, { useState, useEffect, useRef, useMemo } from 'react'
import {
  X,
  Trash2,
  Store,
  CheckCircle,
  XCircle,
  Plus,
  Minus,
  Scale,
  ChevronDown,
  ChevronUp,
  Check,
  MapPin,
  AlertTriangle,
  Sparkles,
  Layers,
} from 'lucide-react'
import type { ItemShopDetail, ShoppingItem, StorePackageOption } from '../types'
import { useShopping } from '../context/ShoppingContext'
import {
  formatUnitPrice,
  formatPrice,
  getPacksNeeded,
  getOptimalStorePackage,
  getUnitFamily,
  checkUnitCompatibility,
  UNIT_GROUPS,
} from '../utils/pricing'

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
  } = useShopping()

  const [name, setName] = useState(item?.name || '')
  const [category, setCategory] = useState(item?.category || (categories[0] || 'Produce'))
  const [quantity, setQuantity] = useState(item?.quantity || 1)
  const [unit, setUnit] = useState(
    item?.unit && item.unit !== 'items' ? item.unit : 'pieces'
  )
  const [notes, setNotes] = useState(item?.notes || '')
  const [isNeeded, setIsNeeded] = useState(item ? item.isNeeded : true)

  // New Category Input State
  const [isAddingNewCat, setIsAddingNewCat] = useState(false)
  const [newCatInput, setNewCatInput] = useState('')

  // New Aisle Input State
  const [isAddingNewAisle, setIsAddingNewAisle] = useState(false)
  const [newAisleInput, setNewAisleInput] = useState('')

  // Shop configurations: availability, price, location, packageSize, packageUnit per store
  const [shopDetails, setShopDetails] = useState<Record<string, ItemShopDetail>>(() => {
    const initial: Record<string, ItemShopDetail> = {}
    shops.forEach((shop) => {
      if (item && item.shops[shop.id]) {
        initial[shop.id] = { ...item.shops[shop.id] }
      } else {
        initial[shop.id] = {
          available: true,
          price: null,
          location: '',
          unitSize: '',
          packageSize: null,
          packageUnit: 'oz',
          unitPrice: null,
        }
      }
    })
    return initial
  })

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
      const merged = { ...existing, ...patch }

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

    const payload = {
      name: name.trim(),
      category,
      quantity: Number(quantity) || 1,
      unit,
      notes: notes.trim(),
      isNeeded,
      inCart: item ? item.inCart : false,
      shops: shopDetails,
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
    setIsAddingNewAisle(false)
    setIsAisleDropdownOpen(false)
  }

  const activeShop = shops.find((s) => s.id === activeTabShopId) || shops[0]
  const currentShopDetail = (activeShop && shopDetails[activeShop.id]) || {
    available: true,
    price: null,
    location: '',
  }

  // Calculate packs needed for current shop based on target quantity and package size
  const calculatedPacks = useMemo(() => {
    if (!activeShop) return Number(quantity) || 1
    return getPacksNeeded(
      {
        id: item?.id || '',
        name,
        category,
        quantity: Number(quantity) || 1,
        unit,
        isNeeded,
        inCart: false,
        shops: shopDetails,
        createdAt: 0,
        updatedAt: 0,
      },
      activeShop.id
    )
  }, [item?.id, name, category, quantity, unit, isNeeded, shopDetails, activeShop])

  // Unit compatibility between item target demand and current shop's package unit
  const unitCompatibility = useMemo(() => {
    return checkUnitCompatibility(
      Number(quantity) || 1,
      unit,
      currentShopDetail.packageUnit || unit
    )
  }, [quantity, unit, currentShopDetail.packageUnit])

  // Dynamically prioritize compatible package units at the top of the dropdown
  const organizedPackageUnitGroups = useMemo(() => {
    const targetFamily = getUnitFamily(unit)
    const matching = UNIT_GROUPS.filter((g) => g.family === targetFamily)
    const others = UNIT_GROUPS.filter((g) => g.family !== targetFamily)

    return [
      ...matching.map((g) => ({
        ...g,
        label: `★ Compatible (${g.label})`,
      })),
      ...others,
    ]
  }, [unit])

  // Multi-size evaluation for the current store
  const optimalStorePackageResult = useMemo(() => {
    if (!activeShop) return null
    return getOptimalStorePackage(
      {
        id: item?.id || '',
        name,
        category,
        quantity: Number(quantity) || 1,
        unit,
        isNeeded,
        inCart: false,
        shops: shopDetails,
        createdAt: 0,
        updatedAt: 0,
      },
      activeShop.id
    )
  }, [item?.id, name, category, quantity, unit, isNeeded, shopDetails, activeShop])

  // New Package Option Input State
  const [isAddingSizeOption, setIsAddingSizeOption] = useState(false)
  const [newSizeLabel, setNewSizeLabel] = useState('')
  const [newSizeVal, setNewSizeVal] = useState('')
  const [newSizeUnit, setNewSizeUnit] = useState('oz')
  const [newSizePrice, setNewSizePrice] = useState('')

  useEffect(() => {
    setIsAddingSizeOption(false)
    setNewSizeLabel('')
    setNewSizeVal('')
    setNewSizePrice('')
  }, [activeTabShopId])

  const handleAddPackageOption = (shopId: string) => {
    const size = parseFloat(newSizeVal)
    const price = parseFloat(newSizePrice)
    if (isNaN(size) || size <= 0 || isNaN(price) || price <= 0) return

    setShopDetails((prev) => {
      const existing = prev[shopId] || {
        available: true,
        price: null,
        location: '',
      }

      const existingOptions = existing.packageOptions ? [...existing.packageOptions] : []

      // If existingOptions is empty and primary size/price exists, include primary as option #1
      if (
        existingOptions.length === 0 &&
        typeof existing.packageSize === 'number' &&
        existing.packageSize > 0 &&
        typeof existing.price === 'number' &&
        existing.price > 0
      ) {
        existingOptions.push({
          id: 'primary-' + Date.now(),
          label: existing.unitSize || `${existing.packageSize} ${existing.packageUnit || unit}`,
          packageSize: existing.packageSize,
          packageUnit: existing.packageUnit || unit,
          price: existing.price,
          unitPrice: existing.unitPrice,
        })
      }

      const newOpt: StorePackageOption = {
        id: 'opt-' + Date.now(),
        label: newSizeLabel.trim() || undefined,
        packageSize: size,
        packageUnit: newSizeUnit || unit,
        price,
        unitPrice: Number((price / size).toFixed(4)),
      }

      existingOptions.push(newOpt)

      return {
        ...prev,
        [shopId]: {
          ...existing,
          packageOptions: existingOptions,
        },
      }
    })

    setNewSizeLabel('')
    setNewSizeVal('')
    setNewSizePrice('')
    setIsAddingSizeOption(false)
  }

  const handleRemovePackageOption = (shopId: string, optionId: string) => {
    setShopDetails((prev) => {
      const existing = prev[shopId]
      if (!existing || !existing.packageOptions) return prev
      const updated = existing.packageOptions.filter((o) => o.id !== optionId)
      return {
        ...prev,
        [shopId]: {
          ...existing,
          packageOptions: updated.length > 0 ? updated : undefined,
        },
      }
    })
  }

  const handleSetPrimaryFromOption = (shopId: string, option: StorePackageOption) => {
    handleShopDetailChange(shopId, {
      price: option.price,
      packageSize: option.packageSize,
      packageUnit: option.packageUnit,
      unitPrice: option.unitPrice,
      unitSize: option.label || `${option.packageSize} ${option.packageUnit}`,
    })
  }

  // Aisle / Location combobox state & ref
  const [isAisleDropdownOpen, setIsAisleDropdownOpen] = useState(false)
  const aisleDropdownRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    setIsAisleDropdownOpen(false)
    setIsAddingNewAisle(false)
    setNewAisleInput('')
  }, [activeTabShopId])

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (
        aisleDropdownRef.current &&
        !aisleDropdownRef.current.contains(e.target as Node)
      ) {
        setIsAisleDropdownOpen(false)
      }
    }
    if (isAisleDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside)
      return () => document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isAisleDropdownOpen])

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
      packageUnit: d.packageUnit,
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

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
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

                  <input
                    type="number"
                    min="1"
                    max="999"
                    value={quantity}
                    onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                    className="w-full h-10 text-center font-bold text-slate-900 focus:outline-none text-sm"
                  />

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

              {/* Unit */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Unit
                </label>
                <select
                  value={unit}
                  onChange={(e) => setUnit(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-xs sm:text-sm bg-white h-10 font-medium"
                >
                  {UNIT_GROUPS.map((group) => (
                    <optgroup key={group.label} label={group.label}>
                      {group.units.map((u) => (
                        <option key={u} value={u}>
                          {u}
                        </option>
                      ))}
                    </optgroup>
                  ))}
                </select>
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

            {/* Need to Buy Switch */}
            <div className="flex items-center justify-between p-3 rounded-xl bg-emerald-50/70 border border-emerald-200">
              <div>
                <div className="text-xs font-bold text-emerald-900">
                  Add to Active Shopping List?
                </div>
                <div className="text-[11px] text-emerald-700">
                  Turn on to have this item appear in Shopping Mode right now
                </div>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={isNeeded}
                  onChange={(e) => setIsNeeded(e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-slate-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-600"></div>
              </label>
            </div>
          </div>

          {/* 2. Store Pricing & Package Size Normalization */}
          <div className="pt-2 border-t border-slate-200">
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                <Store className="w-4 h-4 text-emerald-600" />
                <span>Store Prices, Sizes & Aisles</span>
              </label>
              <span className="text-[11px] text-slate-500">
                Normalize package sizes across stores
              </span>
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
                        <span className="text-[9px] font-black uppercase bg-emerald-600 text-white px-1 py-0.2 rounded shrink-0">
                          Best
                        </span>
                      )}
                    </div>

                    {/* Bottom: Stacked Normalized Unit Price */}
                    <div className="mt-1">
                      {isAvailable ? (
                        detail?.price ? (
                          <div className="text-[11px] font-mono font-bold text-slate-800 leading-tight">
                            {detail.unitPrice && detail.packageUnit
                              ? formatUnitPrice(detail.unitPrice, detail.packageUnit)
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
              <div className="mt-3 p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-slate-200">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-emerald-600" />
                    <span className="text-sm font-bold text-slate-900">{activeShop.name}</span>
                  </div>

                  {/* Availability Toggle */}
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-medium text-slate-600">
                      {currentShopDetail.available ? 'Carried Here' : 'Not Carried (Excluded)'}
                    </span>
                    <button
                      type="button"
                      onClick={() =>
                        handleShopDetailChange(activeShop.id, {
                          available: !currentShopDetail.available,
                        })
                      }
                      className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold transition border ${
                        currentShopDetail.available
                          ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                          : 'bg-rose-100 text-rose-800 border-rose-300'
                      }`}
                    >
                      {currentShopDetail.available ? (
                        <>
                          <CheckCircle className="w-3.5 h-3.5 text-emerald-700" />
                          <span>Included</span>
                        </>
                      ) : (
                        <>
                          <XCircle className="w-3.5 h-3.5 text-rose-700" />
                          <span>Excluded</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>

                {currentShopDetail.available ? (
                  <div className="space-y-4">
                    {/* Row 1: Base Price & Package Size for Unit Pricing */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                      {/* Price Input */}
                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">
                          Shelf Price at {activeShop.name} ($)
                        </label>
                        <div className="relative">
                          <span className="absolute left-3 top-2.5 text-slate-400 text-sm">$</span>
                          <input
                            type="number"
                            step="0.01"
                            placeholder="e.g. 9.99"
                            value={
                              currentShopDetail.price !== null && currentShopDetail.price !== undefined
                                ? currentShopDetail.price
                                : ''
                            }
                            onChange={(e) => {
                              const val = e.target.value === '' ? null : parseFloat(e.target.value)
                              handleShopDetailChange(activeShop.id, { price: val })
                            }}
                            className="w-full pl-7 pr-3 py-2 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm bg-white font-medium"
                          />
                        </div>
                      </div>

                      {/* Package Size for Unit Price Comparison */}
                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1">
                          <Scale className="w-3.5 h-3.5 text-indigo-600" />
                          <span>Package Size (for unit price)</span>
                        </label>
                        <div className="flex gap-1.5">
                          <input
                            type="number"
                            step="any"
                            placeholder="e.g. 56 or 16 or 2"
                            value={
                              currentShopDetail.packageSize !== null &&
                              currentShopDetail.packageSize !== undefined
                                ? currentShopDetail.packageSize
                                : ''
                            }
                            onChange={(e) => {
                              const val = e.target.value === '' ? null : parseFloat(e.target.value)
                              handleShopDetailChange(activeShop.id, { packageSize: val })
                            }}
                            className="w-2/3 px-3 py-2 rounded-xl border border-slate-300 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                          />
                          <select
                            value={currentShopDetail.packageUnit || 'oz'}
                            onChange={(e) =>
                              handleShopDetailChange(activeShop.id, { packageUnit: e.target.value })
                            }
                            className="w-1/3 px-2 py-2 rounded-xl border border-slate-300 text-xs bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500 font-semibold"
                          >
                            {organizedPackageUnitGroups.map((grp) => (
                              <optgroup key={grp.label} label={grp.label}>
                                {grp.units.map((pu) => (
                                  <option key={pu} value={pu}>
                                    {pu}
                                  </option>
                                ))}
                              </optgroup>
                            ))}
                          </select>
                        </div>
                      </div>
                    </div>

                    {/* Live Target Demand vs Store Pack Conversion Card */}
                    {currentShopDetail.packageSize && currentShopDetail.packageSize > 0 ? (
                      unitCompatibility.isCompatible ? (
                        <div className="p-3 bg-indigo-50/80 border border-indigo-200/90 rounded-xl flex flex-col gap-2 text-xs">
                          <div className="flex items-center justify-between">
                            <div>
                              <div className="font-bold text-indigo-950 flex items-center gap-2">
                                <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
                                <span>Store Package Requirement:</span>
                                <span className="bg-indigo-600 text-white px-2 py-0.5 rounded-full text-xs font-black shadow-2xs">
                                  {calculatedPacks} {calculatedPacks === 1 ? 'pack' : 'packs'}
                                </span>
                              </div>
                              <div className="text-[11px] text-indigo-800 mt-1">
                                {unitCompatibility.isConversion ? (
                                  <span>
                                    {unitCompatibility.message}. Buying{' '}
                                    <strong>
                                      {calculatedPacks} × {currentShopDetail.packageSize}{' '}
                                      {currentShopDetail.packageUnit || unit}
                                    </strong>{' '}
                                    satisfies your <strong>{quantity} {unit}</strong> target need.
                                  </span>
                                ) : (
                                  <span>
                                    Buying{' '}
                                    <strong>
                                      {calculatedPacks} × {currentShopDetail.packageSize}{' '}
                                      {currentShopDetail.packageUnit || unit}
                                    </strong>{' '}
                                    satisfies your <strong>{quantity} {unit}</strong> target need.
                                  </span>
                                )}
                              </div>
                            </div>
                            {currentShopDetail.price && (
                              <div className="text-right pl-3 shrink-0">
                                <div className="text-[10px] text-indigo-600 font-bold uppercase tracking-wider">
                                  Total to Buy
                                </div>
                                <div className="text-base font-black text-indigo-950">
                                  {formatPrice(calculatedPacks * currentShopDetail.price)}
                                </div>
                              </div>
                            )}
                          </div>

                          {/* Optional manual override */}
                          <div className="flex items-center justify-between pt-1.5 border-t border-indigo-200/60 text-[11px]">
                            <span className="text-indigo-900 font-medium">
                              Manual pack override for {activeShop.name}:
                            </span>
                            <div className="flex items-center gap-1.5">
                              <input
                                type="number"
                                min="1"
                                placeholder={`Auto (${calculatedPacks})`}
                                value={currentShopDetail.storeQuantity || ''}
                                onChange={(e) => {
                                  const val =
                                    e.target.value === ''
                                      ? null
                                      : Math.max(1, parseInt(e.target.value) || 1)
                                  handleShopDetailChange(activeShop.id, { storeQuantity: val })
                                }}
                                className="w-20 px-2 py-0.5 text-center rounded border border-indigo-300 text-xs bg-white font-bold text-indigo-950 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                              />
                              {currentShopDetail.storeQuantity && (
                                <button
                                  type="button"
                                  onClick={() =>
                                    handleShopDetailChange(activeShop.id, { storeQuantity: null })
                                  }
                                  className="text-[10px] text-indigo-700 hover:text-rose-600 font-bold underline transition"
                                >
                                  Reset
                                </button>
                              )}
                            </div>
                          </div>

                          {/* Multi-Size Optimization Note */}
                          {optimalStorePackageResult && optimalStorePackageResult.hasMultipleOptions && (
                            <div className="p-2 rounded-lg bg-indigo-100/70 border border-indigo-200/80 text-[11px] text-indigo-950 flex items-start gap-1.5 mt-1">
                              <Sparkles className="w-3.5 h-3.5 text-indigo-600 shrink-0 mt-0.5" />
                              <div>
                                <span className="font-bold">Multi-Size Optimization: </span>
                                <span>
                                  Option{' '}
                                  <strong>
                                    {optimalStorePackageResult.bestOption.label ||
                                      `${optimalStorePackageResult.bestOption.packageSize} ${optimalStorePackageResult.bestOption.packageUnit}`}
                                  </strong>{' '}
                                  was selected as the cheapest way to fulfill your demand.
                                </span>
                                {optimalStorePackageResult.savingsVsOther &&
                                  optimalStorePackageResult.savingsVsOther > 0 && (
                                    <span className="block font-bold text-emerald-800 mt-0.5">
                                      🎉 Saves {formatPrice(optimalStorePackageResult.savingsVsOther)}{' '}
                                      compared to {optimalStorePackageResult.otherOptionLabel}!
                                    </span>
                                  )}
                              </div>
                            </div>
                          )}
                        </div>
                      ) : (
                        <div className="p-3 bg-amber-50 border border-amber-300 rounded-xl flex flex-col gap-2 text-xs">
                          <div className="flex items-start justify-between gap-2">
                            <div className="flex items-center gap-1.5 font-bold text-amber-950">
                              <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
                              <span>Unit Compatibility Mismatch</span>
                            </div>
                            <span className="bg-amber-200 text-amber-900 font-bold px-2 py-0.5 rounded text-[10px] uppercase tracking-wide">
                              Defaulting to {calculatedPacks} {calculatedPacks === 1 ? 'pack' : 'packs'}
                            </span>
                          </div>

                          <p className="text-[11px] text-amber-900 leading-relaxed">
                            {unitCompatibility.message} Grocery items cannot be auto-converted across different measurement dimensions.
                          </p>

                          <div className="flex items-center justify-between gap-2 pt-1 border-t border-amber-200/80 text-[11px] flex-wrap">
                            <span className="text-amber-900 font-medium">Quick fix:</span>
                            <div className="flex items-center gap-2">
                              <button
                                type="button"
                                onClick={() => {
                                  handleShopDetailChange(activeShop.id, { packageUnit: unit })
                                }}
                                className="px-2.5 py-1 rounded-lg bg-amber-200 hover:bg-amber-300 text-amber-950 font-bold transition text-xs shadow-2xs"
                              >
                                Match store unit to "{unit}"
                              </button>
                            </div>
                          </div>
                        </div>
                      )
                    ) : null}

                    {/* Multiple Package Sizes / Variants Section */}
                    <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-2.5">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1.5">
                          <Layers className="w-3.5 h-3.5 text-indigo-600" />
                          <span className="text-xs font-bold text-slate-800">
                            Package Size Options at {activeShop.name}
                          </span>
                          {currentShopDetail.packageOptions &&
                            currentShopDetail.packageOptions.length > 0 && (
                              <span className="text-[10px] font-bold bg-indigo-100 text-indigo-800 px-1.5 py-0.2 rounded-full">
                                {currentShopDetail.packageOptions.length} sizes
                              </span>
                            )}
                        </div>

                        {!isAddingSizeOption && (
                          <button
                            type="button"
                            onClick={() => {
                              setNewSizeUnit(currentShopDetail.packageUnit || unit || 'oz')
                              setIsAddingSizeOption(true)
                            }}
                            className="text-[11px] font-bold text-indigo-600 hover:text-indigo-800 flex items-center gap-0.5 transition"
                          >
                            <Plus className="w-3 h-3" />
                            <span>Add Size Option</span>
                          </button>
                        )}
                      </div>

                      {/* List of existing variants */}
                      {currentShopDetail.packageOptions &&
                        currentShopDetail.packageOptions.length > 0 && (
                          <div className="space-y-1.5">
                            {currentShopDetail.packageOptions.map((opt) => {
                              const isOptimal =
                                optimalStorePackageResult?.bestOption.id === opt.id
                              const isCurrentlyPrimary =
                                currentShopDetail.packageSize === opt.packageSize &&
                                currentShopDetail.price === opt.price

                              return (
                                <div
                                  key={opt.id}
                                  className={`p-2 rounded-lg border flex items-center justify-between text-xs transition ${
                                    isOptimal
                                      ? 'bg-emerald-50/80 border-emerald-300 text-emerald-950'
                                      : 'bg-white border-slate-200 text-slate-800'
                                  }`}
                                >
                                  <div className="flex items-center gap-2 min-w-0">
                                    {isOptimal ? (
                                      <Sparkles className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                                    ) : (
                                      <div className="w-2 h-2 rounded-full bg-slate-300 shrink-0" />
                                    )}
                                    <div className="min-w-0">
                                      <div className="flex items-center gap-1.5 flex-wrap">
                                        <span className="font-bold">
                                          {opt.label
                                            ? opt.label
                                            : `${opt.packageSize} ${opt.packageUnit}`}
                                        </span>
                                        {opt.label && (
                                          <span className="text-[10px] text-slate-500 font-normal">
                                            ({opt.packageSize} {opt.packageUnit})
                                          </span>
                                        )}
                                        {isOptimal && (
                                          <span className="bg-emerald-600 text-white text-[9px] font-black uppercase px-1.5 py-0.2 rounded-full">
                                            Best Value
                                          </span>
                                        )}
                                        {isCurrentlyPrimary && (
                                          <span className="bg-slate-200 text-slate-700 text-[9px] font-semibold px-1 rounded">
                                            Primary
                                          </span>
                                        )}
                                      </div>
                                      <div className="text-[10px] text-slate-500 flex items-center gap-2 mt-0.5">
                                        <span>Price: {formatPrice(opt.price)}</span>
                                        {opt.unitPrice && (
                                          <span className="font-mono text-slate-600">
                                            ({formatUnitPrice(opt.unitPrice, opt.packageUnit)})
                                          </span>
                                        )}
                                      </div>
                                    </div>
                                  </div>

                                  <div className="flex items-center gap-1 shrink-0">
                                    {!isCurrentlyPrimary && (
                                      <button
                                        type="button"
                                        onClick={() =>
                                          handleSetPrimaryFromOption(activeShop.id, opt)
                                        }
                                        className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 hover:bg-slate-200 text-slate-700 transition"
                                        title="Make this size the primary shelf entry"
                                      >
                                        Set Primary
                                      </button>
                                    )}
                                    <button
                                      type="button"
                                      onClick={() =>
                                        handleRemovePackageOption(activeShop.id, opt.id)
                                      }
                                      className="p-1 rounded text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition"
                                      title="Remove size option"
                                    >
                                      <Trash2 className="w-3 h-3" />
                                    </button>
                                  </div>
                                </div>
                              )
                            })}
                          </div>
                        )}

                      {/* Inline Add Size Option Form */}
                      {isAddingSizeOption && (
                        <div className="p-2.5 bg-white border border-indigo-200 rounded-xl space-y-2 animate-in fade-in">
                          <div className="text-[11px] font-bold text-indigo-900">
                            Add Alternative Size at {activeShop.name}
                          </div>

                          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                            <div>
                              <label className="block text-[10px] font-bold text-slate-600 mb-0.5">
                                Size Label (opt)
                              </label>
                              <input
                                type="text"
                                placeholder="e.g. Small / Family"
                                value={newSizeLabel}
                                onChange={(e) => setNewSizeLabel(e.target.value)}
                                className="w-full px-2 py-1 text-xs border border-slate-300 rounded-lg outline-none focus:ring-1 focus:ring-indigo-500"
                              />
                            </div>

                            <div>
                              <label className="block text-[10px] font-bold text-slate-600 mb-0.5">
                                Package Size *
                              </label>
                              <input
                                type="number"
                                step="any"
                                placeholder="e.g. 16 or 40"
                                value={newSizeVal}
                                onChange={(e) => setNewSizeVal(e.target.value)}
                                className="w-full px-2 py-1 text-xs border border-slate-300 rounded-lg outline-none focus:ring-1 focus:ring-indigo-500 font-bold"
                              />
                            </div>

                            <div>
                              <label className="block text-[10px] font-bold text-slate-600 mb-0.5">
                                Unit *
                              </label>
                              <select
                                value={newSizeUnit}
                                onChange={(e) => setNewSizeUnit(e.target.value)}
                                className="w-full px-2 py-1 text-xs border border-slate-300 rounded-lg outline-none focus:ring-1 focus:ring-indigo-500 font-semibold bg-white"
                              >
                                {organizedPackageUnitGroups.map((grp) => (
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

                            <div>
                              <label className="block text-[10px] font-bold text-slate-600 mb-0.5">
                                Price ($) *
                              </label>
                              <input
                                type="number"
                                step="0.01"
                                placeholder="e.g. 1.99"
                                value={newSizePrice}
                                onChange={(e) => setNewSizePrice(e.target.value)}
                                className="w-full px-2 py-1 text-xs border border-slate-300 rounded-lg outline-none focus:ring-1 focus:ring-indigo-500 font-bold"
                              />
                            </div>
                          </div>

                          <div className="flex items-center justify-end gap-1.5 pt-1">
                            <button
                              type="button"
                              onClick={() => setIsAddingSizeOption(false)}
                              className="px-2.5 py-1 text-xs font-semibold text-slate-500 hover:text-slate-700"
                            >
                              Cancel
                            </button>
                            <button
                              type="button"
                              onClick={() => handleAddPackageOption(activeShop.id)}
                              disabled={!newSizeVal || !newSizePrice}
                              className="px-3 py-1 bg-indigo-600 disabled:opacity-50 text-white rounded-lg text-xs font-bold hover:bg-indigo-700 transition"
                            >
                              Save Size Option
                            </button>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Location / Aisle Combobox */}
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                          <MapPin className="w-3.5 h-3.5 text-emerald-600" />
                          <span>Aisle / Location in {activeShop.name}</span>
                        </label>
                        <div className="flex items-center gap-2">
                          {currentShopDetail.location && (
                            <button
                              type="button"
                              onClick={() => {
                                handleShopDetailChange(activeShop.id, { location: '' })
                                setIsAisleDropdownOpen(false)
                              }}
                              className="text-[11px] font-semibold text-slate-400 hover:text-rose-600 transition"
                            >
                              Clear
                            </button>
                          )}
                          <button
                            type="button"
                            onClick={() => {
                              setIsAisleDropdownOpen(true)
                              setIsAddingNewAisle(true)
                            }}
                            className="text-[11px] font-bold text-emerald-700 hover:text-emerald-800 flex items-center gap-0.5 transition"
                          >
                            <Plus className="w-3 h-3" />
                            <span>Add Aisle</span>
                          </button>
                        </div>
                      </div>

                      {/* Input Container - directly anchors dropdown under this box */}
                      <div className="relative" ref={aisleDropdownRef}>
                        <input
                          type="text"
                          readOnly
                          placeholder="Select an aisle..."
                          value={currentShopDetail.location || ''}
                          onClick={() => setIsAisleDropdownOpen((prev) => !prev)}
                          className="w-full pl-3 pr-16 py-2 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm bg-white cursor-pointer select-none font-medium text-slate-800"
                        />

                        <div className="absolute right-1.5 top-1/2 -translate-y-1/2 flex items-center gap-0.5">
                          {currentShopDetail.location && (
                            <button
                              type="button"
                              onClick={() => {
                                handleShopDetailChange(activeShop.id, { location: '' })
                              }}
                              className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition"
                              title="Clear location"
                            >
                              <X className="w-3.5 h-3.5" />
                            </button>
                          )}

                          <button
                            type="button"
                            onClick={() => setIsAisleDropdownOpen((prev) => !prev)}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition"
                            title="Show all aisles for this store"
                          >
                            {isAisleDropdownOpen ? (
                              <ChevronUp className="w-4 h-4 text-emerald-600" />
                            ) : (
                              <ChevronDown className="w-4 h-4" />
                            )}
                          </button>
                        </div>

                        {/* Dropdown Menu directly under the Aisle input box */}
                        {isAisleDropdownOpen && (
                          <div className="absolute left-0 right-0 top-full mt-1 bg-white rounded-xl border border-slate-200 shadow-xl z-50 overflow-hidden animate-in fade-in duration-75">
                            <div className="max-h-56 overflow-y-auto divide-y divide-slate-100 p-1">
                              {/* Option: Clear / Unassigned */}
                              {currentShopDetail.location && (
                                <button
                                  type="button"
                                  onClick={() => {
                                    handleShopDetailChange(activeShop.id, { location: '' })
                                    setIsAisleDropdownOpen(false)
                                  }}
                                  className="w-full px-3 py-2 text-left text-xs text-rose-600 hover:bg-rose-50 rounded-lg flex items-center justify-between transition"
                                >
                                  <span>Clear Aisle (Unassigned)</span>
                                  <X className="w-3.5 h-3.5 text-rose-400" />
                                </button>
                              )}

                              {/* List of all available aisles */}
                              {availableAislesForShop.map((aisle) => {
                                const isSelected = currentShopDetail.location === aisle
                                return (
                                  <button
                                    key={aisle}
                                    type="button"
                                    onClick={() => {
                                      handleShopDetailChange(activeShop.id, { location: aisle })
                                      setIsAisleDropdownOpen(false)
                                    }}
                                    className={`w-full px-3 py-2 text-left text-xs rounded-lg flex items-center justify-between transition ${
                                      isSelected
                                        ? 'bg-emerald-50 text-emerald-950 font-bold'
                                        : 'text-slate-700 hover:bg-slate-50'
                                    }`}
                                  >
                                    <div className="flex items-center gap-2 min-w-0">
                                      <MapPin
                                        className={`w-3.5 h-3.5 shrink-0 ${
                                          isSelected ? 'text-emerald-600' : 'text-slate-400'
                                        }`}
                                      />
                                      <span className="truncate">{aisle}</span>
                                    </div>
                                    {isSelected && (
                                      <Check className="w-4 h-4 text-emerald-600 shrink-0 ml-2" />
                                    )}
                                  </button>
                                )
                              })}

                              {availableAislesForShop.length === 0 && (
                                <div className="p-3 text-center text-xs text-slate-400">
                                  No aisles configured for {activeShop.name} yet.
                                </div>
                              )}
                            </div>

                            {/* Add New Aisle Row at bottom of dropdown */}
                            <div className="p-2 border-t border-slate-100 bg-slate-50/70">
                              {isAddingNewAisle ? (
                                <div className="flex items-center gap-1.5">
                                  <input
                                    type="text"
                                    autoFocus
                                    placeholder="New aisle (e.g. Aisle 5 - Pasta)..."
                                    value={newAisleInput}
                                    onChange={(e) => setNewAisleInput(e.target.value)}
                                    onKeyDown={(e) => {
                                      if (e.key === 'Enter') {
                                        e.preventDefault()
                                        handleAddNewAisle()
                                      }
                                      if (e.key === 'Escape') {
                                        setIsAddingNewAisle(false)
                                        setNewAisleInput('')
                                      }
                                    }}
                                    className="flex-1 px-2.5 py-1.5 text-xs bg-white border border-emerald-400 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-500 font-medium text-slate-800"
                                  />
                                  <button
                                    type="button"
                                    onClick={handleAddNewAisle}
                                    disabled={!newAisleInput.trim()}
                                    className="px-2.5 py-1.5 bg-emerald-600 text-white rounded-lg text-xs font-bold hover:bg-emerald-700 disabled:opacity-50 transition shadow-2xs"
                                  >
                                    Add
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => {
                                      setIsAddingNewAisle(false)
                                      setNewAisleInput('')
                                    }}
                                    className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg"
                                  >
                                    <X className="w-3.5 h-3.5" />
                                  </button>
                                </div>
                              ) : (
                                <button
                                  type="button"
                                  onClick={() => setIsAddingNewAisle(true)}
                                  className="w-full py-1.5 px-2 text-xs font-bold text-emerald-700 hover:bg-emerald-100/60 rounded-lg flex items-center justify-center gap-1.5 transition border border-dashed border-emerald-300 bg-white"
                                >
                                  <Plus className="w-3.5 h-3.5 text-emerald-600" />
                                  <span>Add New Aisle to {activeShop.name}</span>
                                </button>
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Store Packaging Note */}
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Packaging Description (Optional)
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. 2-pack 28 oz jars"
                        value={currentShopDetail.unitSize || ''}
                        onChange={(e) =>
                          handleShopDetailChange(activeShop.id, { unitSize: e.target.value })
                        }
                        className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-xs sm:text-sm bg-white"
                      />
                    </div>
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
    </div>
  )
}
