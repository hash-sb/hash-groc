import React, { useState } from 'react'
import {
  X,
  Trash2,
  Store,
  CheckCircle,
  XCircle,
  Plus,
  Minus,
  Scale,
  Sparkles,
} from 'lucide-react'
import type { ItemShopDetail, ShoppingItem } from '../types'
import { useShopping } from '../context/ShoppingContext'
import { formatUnitPrice } from '../utils/pricing'

interface ItemEditorModalProps {
  item?: ShoppingItem | null
  onClose: () => void
}

const COMMON_UNITS = ['items', 'bags', 'lbs', 'oz', 'gal', 'cartons', 'cans', 'boxes', 'packs', 'jars', 'bottles']
const COMMON_PKG_UNITS = ['oz', 'lb', 'gal', 'fl oz', 'ct', 'can', 'bottle', 'bar']

export const ItemEditorModal: React.FC<ItemEditorModalProps> = ({ item, onClose }) => {
  const { shops, addItem, updateItem, deleteItem, categories, addCategory } = useShopping()

  const [name, setName] = useState(item?.name || '')
  const [category, setCategory] = useState(item?.category || (categories[0] || 'Produce'))
  const [quantity, setQuantity] = useState(item?.quantity || 1)
  const [unit, setUnit] = useState(item?.unit || 'items')
  const [notes, setNotes] = useState(item?.notes || '')
  const [isNeeded, setIsNeeded] = useState(item ? item.isNeeded : true)

  // New Category Input State
  const [isAddingNewCat, setIsAddingNewCat] = useState(false)
  const [newCatInput, setNewCatInput] = useState('')

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

  const [activeTabShopId, setActiveTabShopId] = useState<string>(shops[0]?.id || '')

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

  const activeShop = shops.find((s) => s.id === activeTabShopId) || shops[0]
  const currentShopDetail = (activeShop && shopDetails[activeShop.id]) || {
    available: true,
    price: null,
    location: '',
  }

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
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-xs sm:text-sm bg-white h-10"
                >
                  {COMMON_UNITS.map((u) => (
                    <option key={u} value={u}>
                      {u}
                    </option>
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

            {/* Store Tabs */}
            <div className="flex gap-1.5 overflow-x-auto pb-2 no-scrollbar">
              {shops.map((shop) => {
                const isSelected = shop.id === activeTabShopId
                const detail = shopDetails[shop.id]
                const isAvailable = detail?.available ?? true

                return (
                  <button
                    key={shop.id}
                    type="button"
                    onClick={() => setActiveTabShopId(shop.id)}
                    className={`px-3 py-2 rounded-xl text-xs font-semibold shrink-0 flex items-center gap-1.5 border transition ${
                      isSelected
                        ? 'border-emerald-500 bg-emerald-50 text-emerald-900 shadow-xs'
                        : 'border-slate-200 bg-slate-50 text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    <span
                      className={`w-2 h-2 rounded-full ${
                        isAvailable ? 'bg-emerald-500' : 'bg-rose-400'
                      }`}
                    />
                    <span>{shop.name}</span>
                    {detail?.price ? (
                      <span className="text-[10px] bg-white px-1.5 py-0.5 rounded border border-slate-200 font-mono text-slate-700">
                        ${detail.price.toFixed(2)}
                      </span>
                    ) : null}
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
                            {COMMON_PKG_UNITS.map((pu) => (
                              <option key={pu} value={pu}>
                                {pu}
                              </option>
                            ))}
                          </select>
                        </div>
                      </div>
                    </div>

                    {/* Normalized Unit Price Banner */}
                    {currentShopDetail.unitPrice && (
                      <div className="p-2.5 rounded-xl bg-indigo-50/80 border border-indigo-200 flex items-center justify-between text-xs">
                        <div className="flex items-center gap-1.5 text-indigo-900 font-semibold">
                          <Scale className="w-4 h-4 text-indigo-600" />
                          <span>Normalized Unit Price:</span>
                          <span className="font-mono font-bold text-indigo-950">
                            {formatUnitPrice(
                              currentShopDetail.unitPrice,
                              currentShopDetail.packageUnit
                            )}
                          </span>
                        </div>

                        {/* Best Unit Price Indicator */}
                        {minUnitPriceEntry && minUnitPriceEntry.shopId === activeShop.id && unitPriceEntries.length > 1 && (
                          <span className="text-[10px] font-bold bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-md flex items-center gap-1 border border-emerald-300">
                            <Sparkles className="w-3 h-3 text-emerald-600" />
                            Lowest unit cost!
                          </span>
                        )}
                      </div>
                    )}

                    {/* Location / Aisle */}
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Aisle / Location in {activeShop.name}
                      </label>
                      <input
                        type="text"
                        list={`aisles-${activeShop.id}`}
                        placeholder="e.g. Aisle 14 - Canned & Condiments"
                        value={currentShopDetail.location || ''}
                        onChange={(e) =>
                          handleShopDetailChange(activeShop.id, { location: e.target.value })
                        }
                        className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm bg-white"
                      />
                      <datalist id={`aisles-${activeShop.id}`}>
                        {activeShop.defaultAisles.map((aisle) => (
                          <option key={aisle} value={aisle} />
                        ))}
                      </datalist>
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
