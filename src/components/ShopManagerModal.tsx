import React, { useState } from 'react'
import {
  X,
  Plus,
  Trash2,
  Store,
  Edit2,
  ArrowUp,
  ArrowDown,
  Check,
  Sparkles,
  Palette,
  FileText,
  MapPin,
} from 'lucide-react'
import type { Shop } from '../types'
import { useShopping } from '../context/ShoppingContext'

interface ShopManagerModalProps {
  onClose: () => void
}

interface StorePreset {
  name: string
  icon: string
  color: string
  aisles: string[]
}

const STORE_PRESETS: StorePreset[] = [
  {
    name: 'Costco',
    icon: '📦',
    color: 'blue',
    aisles: [
      'Entrance / Electronics',
      'Bakery & Breads',
      'Fresh Produce',
      'Meat & Poultry',
      'Dairy & Eggs Cooler',
      'Frozen Foods',
      'Pantry & Snacks',
      'Paper & Household',
      'Checkout / Food Court',
    ],
  },
  {
    name: "Trader Joe's",
    icon: '🍎',
    color: 'amber',
    aisles: [
      'Flowers & Produce',
      'Bakery & Breads',
      'Dips, Cheeses & Deli',
      'Wine & Beverages',
      'Frozen Favorites',
      'Pantry, Cereal & Pasta',
      'Snacks, Chips & Nuts',
      'Checkout',
    ],
  },
  {
    name: 'Target',
    icon: '🎯',
    color: 'rose',
    aisles: [
      'Fresh Produce',
      'Bakery & Deli',
      'Dairy, Eggs & Cheese',
      'Meat & Seafood',
      'Frozen Grocery',
      'Pantry & Canned Goods',
      'Snacks & Candy',
      'Beverages',
      'Health & Beauty',
      'Household Essentials',
      'Checkout',
    ],
  },
  {
    name: 'Whole Foods',
    icon: '🌿',
    color: 'emerald',
    aisles: [
      'Floral & Greenery',
      'Organic Produce',
      'Artisan Bakery',
      'Specialty Cheese & Deli',
      'Meat & Seafood',
      'Dairy & Plant-Based',
      'Bulk & Pantry',
      'Frozen Foods',
      'Wellness & Body Care',
      'Checkout',
    ],
  },
  {
    name: 'Aldi',
    icon: '🛒',
    color: 'teal',
    aisles: [
      'Fresh Produce',
      'Fresh Bakery',
      'Fresh Meat & Poultry',
      'Dairy & Refrigerated',
      'Aldi Finds',
      'Pantry Staples & Canned',
      'Snacks & Sweets',
      'Frozen Foods',
      'Checkout',
    ],
  },
  {
    name: 'Supermarket',
    icon: '🏪',
    color: 'indigo',
    aisles: [
      'Produce',
      'Deli & Prepared Foods',
      'Bakery',
      'Meat & Seafood',
      'Dairy & Eggs',
      'Center Aisles (Pantry)',
      'Snacks & Beverages',
      'Frozen Foods',
      'Household & Cleaning',
      'Checkout',
    ],
  },
]

const STORE_COLORS: Record<
  string,
  { label: string; bg: string; text: string; border: string; badge: string; pill: string }
> = {
  emerald: {
    label: 'Emerald',
    bg: 'bg-emerald-600',
    text: 'text-emerald-800',
    border: 'border-emerald-300',
    badge: 'bg-emerald-100 text-emerald-800 border-emerald-200',
    pill: 'bg-emerald-500 text-white',
  },
  blue: {
    label: 'Blue',
    bg: 'bg-blue-600',
    text: 'text-blue-800',
    border: 'border-blue-300',
    badge: 'bg-blue-100 text-blue-800 border-blue-200',
    pill: 'bg-blue-500 text-white',
  },
  rose: {
    label: 'Rose',
    bg: 'bg-rose-600',
    text: 'text-rose-800',
    border: 'border-rose-300',
    badge: 'bg-rose-100 text-rose-800 border-rose-200',
    pill: 'bg-rose-500 text-white',
  },
  amber: {
    label: 'Amber',
    bg: 'bg-amber-600',
    text: 'text-amber-800',
    border: 'border-amber-300',
    badge: 'bg-amber-100 text-amber-800 border-amber-200',
    pill: 'bg-amber-500 text-white',
  },
  purple: {
    label: 'Purple',
    bg: 'bg-purple-600',
    text: 'text-purple-800',
    border: 'border-purple-300',
    badge: 'bg-purple-100 text-purple-800 border-purple-200',
    pill: 'bg-purple-500 text-white',
  },
  teal: {
    label: 'Teal',
    bg: 'bg-teal-600',
    text: 'text-teal-800',
    border: 'border-teal-300',
    badge: 'bg-teal-100 text-teal-800 border-teal-200',
    pill: 'bg-teal-500 text-white',
  },
  indigo: {
    label: 'Indigo',
    bg: 'bg-indigo-600',
    text: 'text-indigo-800',
    border: 'border-indigo-300',
    badge: 'bg-indigo-100 text-indigo-800 border-indigo-200',
    pill: 'bg-indigo-500 text-white',
  },
  slate: {
    label: 'Slate',
    bg: 'bg-slate-600',
    text: 'text-slate-800',
    border: 'border-slate-300',
    badge: 'bg-slate-100 text-slate-800 border-slate-200',
    pill: 'bg-slate-500 text-white',
  },
}

const COMMON_DEPARTMENT_SUGGESTIONS = [
  'Produce',
  'Bakery',
  'Deli',
  'Meat & Poultry',
  'Seafood',
  'Dairy & Eggs',
  'Frozen',
  'Pantry Staples',
  'Snacks',
  'Beverages',
  'Household',
  'Personal Care',
  'Checkout',
]

const QUICK_ICONS = ['🛒', '🍎', '📦', '🎯', '🌿', '🏪', '🥩', '🥖', '🥛', '🍷', '🧴']

export const ShopManagerModal: React.FC<ShopManagerModalProps> = ({ onClose }) => {
  const { shops, items, addShop, updateShop, deleteShop, moveShopOrder } = useShopping()

  // Creation State
  const [isCreatingNew, setIsCreatingNew] = useState(false)
  const [newName, setNewName] = useState('')
  const [newColor, setNewColor] = useState('emerald')
  const [newIcon, setNewIcon] = useState('🛒')
  const [newAisles, setNewAisles] = useState<string[]>([
    'Produce',
    'Dairy',
    'Pantry',
    'Frozen',
    'Checkout',
  ])
  const [newQuickAisle, setNewQuickAisle] = useState('')
  const [newIsBulkText, setNewIsBulkText] = useState(false)
  const [newBulkText, setNewBulkText] = useState('')

  // Edit State
  const [editingShopId, setEditingShopId] = useState<string | null>(null)
  const [editName, setEditName] = useState('')
  const [editColor, setEditColor] = useState('emerald')
  const [editIcon, setEditIcon] = useState('🛒')
  const [editAisles, setEditAisles] = useState<string[]>([])
  const [editQuickAisle, setEditQuickAisle] = useState('')
  const [editIsBulkText, setEditIsBulkText] = useState(false)
  const [editBulkText, setEditBulkText] = useState('')

  // Feedback banner
  const [feedback, setFeedback] = useState<string | null>(null)

  const showFeedback = (msg: string) => {
    setFeedback(msg)
    setTimeout(() => setFeedback(null), 3000)
  }

  const triggerHaptic = (ms: number = 15) => {
    if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
      try {
        navigator.vibrate(ms)
      } catch {
        // ignore
      }
    }
  }

  // Live item stats for a store
  const getStoreStats = (shopId: string) => {
    const pricedCount = items.filter((i) => {
      const p = i.shops[shopId]?.price
      return typeof p === 'number' && p > 0
    }).length

    const neededCount = items.filter((i) => {
      const detail = i.shops[shopId]
      const isCarried = detail ? detail.available : true
      return i.isNeeded && isCarried
    }).length

    return { pricedCount, neededCount }
  }

  // Populate from preset
  const handleApplyPreset = (preset: StorePreset) => {
    setNewName(preset.name)
    setNewIcon(preset.icon)
    setNewColor(preset.color)
    setNewAisles([...preset.aisles])
    setNewBulkText(preset.aisles.join('\n'))
    showFeedback(`Loaded "${preset.name}" preset!`)
  }

  // Open store editor
  const handleStartEditing = (shop: Shop) => {
    if (editingShopId === shop.id) {
      setEditingShopId(null)
      return
    }
    setEditingShopId(shop.id)
    setEditName(shop.name)
    setEditColor(shop.color || 'emerald')
    setEditIcon(shop.icon || '🏪')
    const currentAisles = shop.defaultAisles && shop.defaultAisles.length > 0
      ? [...shop.defaultAisles]
      : ['Produce', 'Dairy', 'Pantry', 'Frozen', 'Checkout']
    setEditAisles(currentAisles)
    setEditBulkText(currentAisles.join('\n'))
    setEditQuickAisle('')
    setEditIsBulkText(false)
  }

  // Save edits
  const handleSaveEdit = async () => {
    if (!editingShopId || !editName.trim()) return

    const finalAisles = editIsBulkText
      ? editBulkText.split('\n').map((a) => a.trim()).filter(Boolean)
      : editAisles

    await updateShop(editingShopId, {
      name: editName.trim(),
      color: editColor,
      icon: editIcon,
      defaultAisles: finalAisles.length > 0 ? finalAisles : ['Produce', 'Checkout'],
    })

    setEditingShopId(null)
    showFeedback(`Saved changes for "${editName.trim()}"!`)
  }

  // Create store
  const handleCreateShop = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newName.trim()) return

    const finalAisles = newIsBulkText
      ? newBulkText.split('\n').map((a) => a.trim()).filter(Boolean)
      : newAisles

    await addShop({
      name: newName.trim(),
      color: newColor,
      icon: newIcon,
      defaultAisles: finalAisles.length > 0 ? finalAisles : ['Produce', 'Dairy', 'Pantry', 'Frozen', 'Checkout'],
    })

    showFeedback(`Added "${newName.trim()}" to your stores!`)
    setNewName('')
    setNewAisles(['Produce', 'Dairy', 'Pantry', 'Frozen', 'Checkout'])
    setNewBulkText('')
    setIsCreatingNew(false)
  }

  // Move store sequence
  const handleMoveStore = async (shopId: string, direction: 'up' | 'down') => {
    triggerHaptic(20)
    await moveShopOrder(shopId, direction === 'up' ? 'left' : 'right')
  }

  // Safe delete with item counts
  const handleDelete = async (shop: Shop) => {
    if (shops.length <= 1) {
      alert('You must have at least one store in your app.')
      return
    }

    const { pricedCount, neededCount } = getStoreStats(shop.id)

    const confirmMsg =
      pricedCount > 0 || neededCount > 0
        ? `Delete store "${shop.name}"?\n\n` +
          `• ${pricedCount} item${pricedCount === 1 ? ' has' : 's have'} saved prices at this store.\n` +
          `• ${neededCount} item${neededCount === 1 ? ' is' : 's are'} on your active shopping list.\n\n` +
          `Deleting this store will unassign these items and prices. Are you sure you want to proceed?`
        : `Delete store "${shop.name}"? This action cannot be undone.`

    if (window.confirm(confirmMsg)) {
      await deleteShop(shop.id)
      showFeedback(`Deleted "${shop.name}"`)
    }
  }

  // Aisle manipulation helpers (Edit Mode)
  const handleAddEditAisle = () => {
    const trimmed = editQuickAisle.trim()
    if (!trimmed) return
    if (!editAisles.includes(trimmed)) {
      const updated = [...editAisles, trimmed]
      setEditAisles(updated)
      setEditBulkText(updated.join('\n'))
    }
    setEditQuickAisle('')
  }

  const handleRemoveEditAisle = (index: number) => {
    const updated = editAisles.filter((_, idx) => idx !== index)
    setEditAisles(updated)
    setEditBulkText(updated.join('\n'))
  }

  const handleMoveEditAisle = (index: number, direction: 'up' | 'down') => {
    const targetIndex = direction === 'up' ? index - 1 : index + 1
    if (targetIndex < 0 || targetIndex >= editAisles.length) return
    const updated = [...editAisles]
    const [moved] = updated.splice(index, 1)
    updated.splice(targetIndex, 0, moved)
    setEditAisles(updated)
    setEditBulkText(updated.join('\n'))
  }

  const handleAddEditSuggestion = (dept: string) => {
    if (!editAisles.includes(dept)) {
      const updated = [...editAisles, dept]
      setEditAisles(updated)
      setEditBulkText(updated.join('\n'))
    }
  }

  // Aisle manipulation helpers (Create Mode)
  const handleAddNewAisle = () => {
    const trimmed = newQuickAisle.trim()
    if (!trimmed) return
    if (!newAisles.includes(trimmed)) {
      const updated = [...newAisles, trimmed]
      setNewAisles(updated)
      setNewBulkText(updated.join('\n'))
    }
    setNewQuickAisle('')
  }

  const handleRemoveNewAisle = (index: number) => {
    const updated = newAisles.filter((_, idx) => idx !== index)
    setNewAisles(updated)
    setNewBulkText(updated.join('\n'))
  }

  const handleMoveNewAisle = (index: number, direction: 'up' | 'down') => {
    const targetIndex = direction === 'up' ? index - 1 : index + 1
    if (targetIndex < 0 || targetIndex >= newAisles.length) return
    const updated = [...newAisles]
    const [moved] = updated.splice(index, 1)
    updated.splice(targetIndex, 0, moved)
    setNewAisles(updated)
    setNewBulkText(updated.join('\n'))
  }

  const handleAddNewSuggestion = (dept: string) => {
    if (!newAisles.includes(dept)) {
      const updated = [...newAisles, dept]
      setNewAisles(updated)
      setNewBulkText(updated.join('\n'))
    }
  }

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 z-50 animate-in fade-in duration-150">
      <div className="bg-white rounded-3xl max-w-2xl w-full max-h-[90vh] flex flex-col shadow-2xl overflow-hidden border border-slate-200">
        {/* Header */}
        <div className="px-5 py-4 border-b border-slate-200 flex items-center justify-between bg-gradient-to-r from-emerald-50 via-teal-50 to-emerald-50 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-600 text-white flex items-center justify-center shadow-xs">
              <Store className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-extrabold text-slate-900">Manage Stores</h2>
                <span className="text-xs bg-emerald-600 text-white px-2 py-0.5 rounded-full font-bold">
                  {shops.length} {shops.length === 1 ? 'store' : 'stores'}
                </span>
              </div>
              <p className="text-xs text-slate-500">
                {feedback ? (
                  <span className="text-emerald-700 font-bold flex items-center gap-1 animate-in fade-in">
                    <Sparkles className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    <span>{feedback}</span>
                  </span>
                ) : (
                  <span>Set shopping trip order, walking aisle sequence & brand colors</span>
                )}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-700 rounded-xl hover:bg-slate-200/60 transition cursor-pointer"
            title="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Action Bar (Top Controls) */}
        <div className="px-5 py-3 bg-slate-50 border-b border-slate-200 flex items-center justify-between gap-3 shrink-0">
          <div className="text-xs text-slate-600">
            <span className="font-bold text-slate-800">Trip Sequence</span>
            <span className="text-slate-400 ml-1.5 hidden sm:inline">(Stop 1 to Stop {shops.length})</span>
          </div>

          <button
            type="button"
            onClick={() => {
              setIsCreatingNew(!isCreatingNew)
              if (editingShopId) setEditingShopId(null)
            }}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shadow-2xs ${
              isCreatingNew
                ? 'bg-slate-200 text-slate-800 hover:bg-slate-300'
                : 'bg-emerald-600 text-white hover:bg-emerald-700'
            }`}
          >
            {isCreatingNew ? (
              <>
                <X className="w-3.5 h-3.5" />
                <span>Cancel</span>
              </>
            ) : (
              <>
                <Plus className="w-3.5 h-3.5" />
                <span>Add Store</span>
              </>
            )}
          </button>
        </div>

        {/* Scrollable Content Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4">
          {/* Collapsible "+ Add Store" Drawer */}
          {isCreatingNew && (
            <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-br from-slate-50 to-emerald-50/30 border-2 border-emerald-400 shadow-md space-y-4 animate-in fade-in slide-in-from-top-3 duration-200">
              <div className="flex items-center justify-between pb-2 border-b border-emerald-200">
                <div className="flex items-center gap-2">
                  <span className="text-base font-extrabold text-slate-900">Add a New Grocery Store</span>
                </div>
                <span className="text-[11px] font-semibold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-full">
                  New Store
                </span>
              </div>

              {/* 1-Click Store Presets */}
              <div className="space-y-1.5">
                <div className="flex items-center gap-1.5 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                  <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
                  <span>1-Click Popular Presets</span>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {STORE_PRESETS.map((preset) => (
                    <button
                      key={preset.name}
                      type="button"
                      onClick={() => handleApplyPreset(preset)}
                      className="px-2.5 py-1 rounded-xl bg-white border border-slate-200 hover:border-emerald-400 hover:bg-emerald-50/50 text-xs font-semibold text-slate-700 flex items-center gap-1.5 transition shadow-2xs cursor-pointer active:scale-95"
                    >
                      <span>{preset.icon}</span>
                      <span>{preset.name}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Name & Icon Row */}
              <div className="grid grid-cols-1 sm:grid-cols-[1fr_auto] gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Store Name
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Whole Foods, Trader Joe's, Costco..."
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-xs sm:text-sm bg-white font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    autoFocus
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Store Icon / Emoji
                  </label>
                  <div className="flex items-center gap-1.5 flex-wrap">
                    {QUICK_ICONS.map((icon) => (
                      <button
                        key={icon}
                        type="button"
                        onClick={() => setNewIcon(icon)}
                        className={`w-8 h-8 rounded-xl text-sm flex items-center justify-center border transition cursor-pointer ${
                          newIcon === icon
                            ? 'border-emerald-500 bg-emerald-100 shadow-2xs ring-2 ring-emerald-400/40'
                            : 'border-slate-200 bg-white hover:bg-slate-100'
                        }`}
                      >
                        {icon}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Brand Color Swatch Picker */}
              <div className="space-y-1.5">
                <label className="flex items-center gap-1.5 text-xs font-bold text-slate-700">
                  <Palette className="w-3.5 h-3.5 text-slate-400" />
                  <span>Brand Theme Color</span>
                </label>
                <div className="flex items-center gap-2 flex-wrap">
                  {Object.entries(STORE_COLORS).map(([key, config]) => {
                    const isSelected = newColor === key
                    return (
                      <button
                        key={key}
                        type="button"
                        onClick={() => setNewColor(key)}
                        className={`w-7 h-7 rounded-full flex items-center justify-center transition cursor-pointer shadow-2xs ${config.bg} ${
                          isSelected ? 'ring-3 ring-offset-2 ring-slate-800 scale-105' : 'hover:scale-105 opacity-85'
                        }`}
                        title={config.label}
                      >
                        {isSelected && <Check className="w-3.5 h-3.5 text-white" />}
                      </button>
                    )
                  })}
                </div>
              </div>

              {/* Aisle Walk Order Manager */}
              <div className="space-y-2 pt-2 border-t border-slate-200">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Aisle & Location Walk Order ({newAisles.length})</span>
                  </label>

                  <button
                    type="button"
                    onClick={() => {
                      if (!newIsBulkText) {
                        setNewBulkText(newAisles.join('\n'))
                      } else {
                        const parsed = newBulkText.split('\n').map((a) => a.trim()).filter(Boolean)
                        setNewAisles(parsed)
                      }
                      setNewIsBulkText(!newIsBulkText)
                    }}
                    className="text-[11px] font-semibold text-slate-500 hover:text-emerald-700 flex items-center gap-1 px-2 py-0.5 rounded-lg hover:bg-slate-200/50 transition cursor-pointer"
                  >
                    <FileText className="w-3 h-3" />
                    <span>{newIsBulkText ? 'Chip Mode' : 'Bulk Text Mode'}</span>
                  </button>
                </div>

                {newIsBulkText ? (
                  <div>
                    <textarea
                      rows={5}
                      value={newBulkText}
                      onChange={(e) => setNewBulkText(e.target.value)}
                      placeholder="One aisle per line in your walking order..."
                      className="w-full p-2.5 rounded-xl border border-slate-300 text-xs bg-white font-mono focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                    <p className="text-[10px] text-slate-400 mt-0.5">
                      Tip: Enter sections in the order you walk through the store.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {/* Add Aisle Input Bar */}
                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        placeholder="Add aisle (e.g. Entrance Produce, Aisle 3 - Dairy)..."
                        value={newQuickAisle}
                        onChange={(e) => setNewQuickAisle(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault()
                            handleAddNewAisle()
                          }
                        }}
                        className="flex-1 px-3 py-1.5 rounded-xl border border-slate-300 text-xs bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500 font-medium"
                      />
                      <button
                        type="button"
                        onClick={handleAddNewAisle}
                        disabled={!newQuickAisle.trim()}
                        className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-40 text-white rounded-xl text-xs font-bold transition shrink-0 cursor-pointer"
                      >
                        Add Aisle
                      </button>
                    </div>

                    {/* Department Quick Suggestions */}
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mr-1">
                        Quick Add:
                      </span>
                      {COMMON_DEPARTMENT_SUGGESTIONS.map((dept) => {
                        const isAdded = newAisles.includes(dept)
                        return (
                          <button
                            key={dept}
                            type="button"
                            onClick={() => handleAddNewSuggestion(dept)}
                            disabled={isAdded}
                            className={`text-[10px] px-2 py-0.5 rounded-lg border transition cursor-pointer font-medium ${
                              isAdded
                                ? 'bg-slate-100 text-slate-400 border-slate-200 cursor-default'
                                : 'bg-white hover:bg-emerald-50 text-slate-700 hover:text-emerald-800 border-slate-200 hover:border-emerald-300'
                            }`}
                          >
                            +{dept}
                          </button>
                        )
                      })}
                    </div>

                    {/* Ordered Aisle Chips List */}
                    <div className="max-h-44 overflow-y-auto p-2 bg-white rounded-xl border border-slate-200 space-y-1">
                      {newAisles.map((aisle, idx) => (
                        <div
                          key={`${aisle}-${idx}`}
                          className="flex items-center justify-between p-1.5 rounded-lg bg-slate-50 border border-slate-100 text-xs hover:bg-slate-100/80 transition"
                        >
                          <div className="flex items-center gap-2 min-w-0">
                            <span className="w-5 text-[10px] font-bold text-slate-400 text-center shrink-0">
                              #{idx + 1}
                            </span>
                            <span className="font-semibold text-slate-800 truncate">{aisle}</span>
                          </div>

                          <div className="flex items-center gap-1 shrink-0">
                            <button
                              type="button"
                              onClick={() => handleMoveNewAisle(idx, 'up')}
                              disabled={idx === 0}
                              className="p-1 text-slate-400 hover:text-slate-800 disabled:opacity-20 rounded transition cursor-pointer"
                              title="Move Aisle Up"
                            >
                              <ArrowUp className="w-3.5 h-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={() => handleMoveNewAisle(idx, 'down')}
                              disabled={idx === newAisles.length - 1}
                              className="p-1 text-slate-400 hover:text-slate-800 disabled:opacity-20 rounded transition cursor-pointer"
                              title="Move Aisle Down"
                            >
                              <ArrowDown className="w-3.5 h-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={() => handleRemoveNewAisle(idx)}
                              className="p-1 text-slate-400 hover:text-rose-600 rounded transition cursor-pointer ml-1"
                              title="Remove Aisle"
                            >
                              <X className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      ))}

                      {newAisles.length === 0 && (
                        <div className="py-4 text-center text-xs text-slate-400 italic">
                          No aisles added yet. Type an aisle above or click a suggestion.
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Submit / Cancel Buttons */}
              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsCreatingNew(false)}
                  className="px-4 py-2 rounded-xl border border-slate-300 text-xs font-semibold text-slate-700 hover:bg-slate-100 transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleCreateShop}
                  disabled={!newName.trim()}
                  className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 disabled:opacity-40 text-white text-xs font-bold transition shadow-md cursor-pointer"
                >
                  Add Store
                </button>
              </div>
            </div>
          )}

          {/* Current Stores List */}
          <div className="space-y-2.5">
            {shops.map((shop, index) => {
              const isBeingEdited = editingShopId === shop.id
              const { pricedCount, neededCount } = getStoreStats(shop.id)
              const colorConfig = STORE_COLORS[shop.color || 'emerald'] || STORE_COLORS.emerald

              return (
                <div
                  key={shop.id}
                  className={`rounded-2xl border transition-all ${
                    isBeingEdited
                      ? 'border-emerald-500 bg-emerald-50/20 ring-2 ring-emerald-500/20 p-3.5 sm:p-4 shadow-sm'
                      : 'border-slate-200 bg-white p-3.5 sm:p-4 shadow-xs hover:border-slate-300'
                  }`}
                >
                  {/* Store Row Card */}
                  <div className="flex items-center justify-between gap-3">
                    {/* Left: Reorder Controls + Store Info */}
                    <div className="flex items-center gap-2.5 min-w-0 flex-1">
                      {/* Reorder Up / Down Buttons */}
                      <div className="flex flex-col gap-0.5 shrink-0">
                        <button
                          type="button"
                          onClick={() => handleMoveStore(shop.id, 'up')}
                          disabled={index === 0}
                          className="p-1 rounded-md text-slate-400 hover:text-slate-800 hover:bg-slate-100 disabled:opacity-20 transition cursor-pointer"
                          title="Move Store Earlier in Trip"
                        >
                          <ArrowUp className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleMoveStore(shop.id, 'down')}
                          disabled={index === shops.length - 1}
                          className="p-1 rounded-md text-slate-400 hover:text-slate-800 hover:bg-slate-100 disabled:opacity-20 transition cursor-pointer"
                          title="Move Store Later in Trip"
                        >
                          <ArrowDown className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      {/* Store Avatar / Icon */}
                      <div className={`w-10 h-10 rounded-2xl flex items-center justify-center text-lg shrink-0 border ${colorConfig.badge}`}>
                        <span>{shop.icon || '🏪'}</span>
                      </div>

                      {/* Title & Live Health Stats */}
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-full ${colorConfig.pill}`}>
                            Stop {index + 1}
                          </span>
                          <span className="font-extrabold text-slate-900 text-sm sm:text-base truncate">
                            {shop.name}
                          </span>
                        </div>

                        {/* Live Contextual Stats */}
                        <div className="text-[11px] text-slate-500 mt-0.5 flex items-center gap-1.5 flex-wrap">
                          <span className="font-semibold text-slate-700">
                            {shop.defaultAisles.length} aisles
                          </span>
                          <span className="text-slate-300">•</span>
                          <span>{pricedCount} priced</span>
                          <span className="text-slate-300">•</span>
                          <span className={neededCount > 0 ? 'text-emerald-700 font-bold' : ''}>
                            {neededCount} on trip
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Right: Actions */}
                    <div className="flex items-center gap-1.5 shrink-0">
                      <button
                        type="button"
                        onClick={() => handleStartEditing(shop)}
                        className={`p-2 rounded-xl transition cursor-pointer ${
                          isBeingEdited
                            ? 'bg-emerald-600 text-white shadow-2xs'
                            : 'text-slate-500 hover:text-emerald-700 hover:bg-slate-100 border border-slate-200'
                        }`}
                        title={isBeingEdited ? 'Close Editor' : 'Edit Store Details'}
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>

                      <button
                        type="button"
                        onClick={() => handleDelete(shop)}
                        className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl border border-slate-200 transition cursor-pointer"
                        title="Delete Store"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* Inline Store Editor Drawer */}
                  {isBeingEdited && (
                    <div className="mt-4 pt-4 border-t border-emerald-200 space-y-4 animate-in fade-in slide-in-from-top-2 duration-150">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-emerald-900 uppercase tracking-wider flex items-center gap-1.5">
                          <Edit2 className="w-3.5 h-3.5 text-emerald-600" />
                          <span>Editing {shop.name}</span>
                        </span>
                        <button
                          type="button"
                          onClick={() => setEditingShopId(null)}
                          className="text-xs text-slate-400 hover:text-slate-600 font-medium cursor-pointer"
                        >
                          Cancel
                        </button>
                      </div>

                      {/* Name & Icon Row */}
                      <div className="grid grid-cols-1 sm:grid-cols-[1fr_auto] gap-3">
                        <div>
                          <label className="block text-xs font-bold text-slate-700 mb-1">
                            Store Name
                          </label>
                          <input
                            type="text"
                            value={editName}
                            onChange={(e) => setEditName(e.target.value)}
                            className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs sm:text-sm bg-white font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-500"
                          />
                        </div>

                        <div>
                          <label className="block text-xs font-bold text-slate-700 mb-1">
                            Icon / Emoji
                          </label>
                          <div className="flex items-center gap-1.5 flex-wrap">
                            {QUICK_ICONS.map((icon) => (
                              <button
                                key={icon}
                                type="button"
                                onClick={() => setEditIcon(icon)}
                                className={`w-8 h-8 rounded-xl text-sm flex items-center justify-center border transition cursor-pointer ${
                                  editIcon === icon
                                    ? 'border-emerald-500 bg-emerald-100 shadow-2xs ring-2 ring-emerald-400/40'
                                    : 'border-slate-200 bg-white hover:bg-slate-100'
                                }`}
                              >
                                {icon}
                              </button>
                            ))}
                          </div>
                        </div>
                      </div>

                      {/* Brand Color Swatch Picker */}
                      <div className="space-y-1.5">
                        <label className="flex items-center gap-1.5 text-xs font-bold text-slate-700">
                          <Palette className="w-3.5 h-3.5 text-slate-400" />
                          <span>Brand Theme Color</span>
                        </label>
                        <div className="flex items-center gap-2 flex-wrap">
                          {Object.entries(STORE_COLORS).map(([key, config]) => {
                            const isSelected = editColor === key
                            return (
                              <button
                                key={key}
                                type="button"
                                onClick={() => setEditColor(key)}
                                className={`w-7 h-7 rounded-full flex items-center justify-center transition cursor-pointer shadow-2xs ${config.bg} ${
                                  isSelected ? 'ring-3 ring-offset-2 ring-slate-800 scale-105' : 'hover:scale-105 opacity-85'
                                }`}
                                title={config.label}
                              >
                                {isSelected && <Check className="w-3.5 h-3.5 text-white" />}
                              </button>
                            )
                          })}
                        </div>
                      </div>

                      {/* Aisle Walk Sequence Manager */}
                      <div className="space-y-2 pt-2 border-t border-slate-200">
                        <div className="flex items-center justify-between">
                          <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                            <MapPin className="w-3.5 h-3.5 text-emerald-600" />
                            <span>Aisles & Walking Sequence ({editAisles.length})</span>
                          </label>

                          <button
                            type="button"
                            onClick={() => {
                              if (!editIsBulkText) {
                                setEditBulkText(editAisles.join('\n'))
                              } else {
                                const parsed = editBulkText.split('\n').map((a) => a.trim()).filter(Boolean)
                                setEditAisles(parsed)
                              }
                              setEditIsBulkText(!editIsBulkText)
                            }}
                            className="text-[11px] font-semibold text-slate-500 hover:text-emerald-700 flex items-center gap-1 px-2 py-0.5 rounded-lg hover:bg-slate-200/50 transition cursor-pointer"
                          >
                            <FileText className="w-3 h-3" />
                            <span>{editIsBulkText ? 'Chip Mode' : 'Bulk Text Mode'}</span>
                          </button>
                        </div>

                        {editIsBulkText ? (
                          <div>
                            <textarea
                              rows={5}
                              value={editBulkText}
                              onChange={(e) => setEditBulkText(e.target.value)}
                              placeholder="One aisle per line in your walking order..."
                              className="w-full p-2.5 rounded-xl border border-slate-300 text-xs bg-white font-mono focus:outline-none focus:ring-2 focus:ring-emerald-500"
                            />
                            <p className="text-[10px] text-slate-400 mt-0.5">
                              Tip: In Shopping Mode, items are grouped and ordered exactly as listed here.
                            </p>
                          </div>
                        ) : (
                          <div className="space-y-2">
                            {/* Add Aisle Input Bar */}
                            <div className="flex items-center gap-2">
                              <input
                                type="text"
                                placeholder="Add aisle location (e.g. Aisle 4 - Pasta, Dairy)..."
                                value={editQuickAisle}
                                onChange={(e) => setEditQuickAisle(e.target.value)}
                                onKeyDown={(e) => {
                                  if (e.key === 'Enter') {
                                    e.preventDefault()
                                    handleAddEditAisle()
                                  }
                                }}
                                className="flex-1 px-3 py-1.5 rounded-xl border border-slate-300 text-xs bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500 font-medium"
                              />
                              <button
                                type="button"
                                onClick={handleAddEditAisle}
                                disabled={!editQuickAisle.trim()}
                                className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-40 text-white rounded-xl text-xs font-bold transition shrink-0 cursor-pointer"
                              >
                                Add Aisle
                              </button>
                            </div>

                            {/* Department Quick Suggestions */}
                            <div className="flex items-center gap-1.5 flex-wrap">
                              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mr-1">
                                Quick Add:
                              </span>
                              {COMMON_DEPARTMENT_SUGGESTIONS.map((dept) => {
                                const isAdded = editAisles.includes(dept)
                                return (
                                  <button
                                    key={dept}
                                    type="button"
                                    onClick={() => handleAddEditSuggestion(dept)}
                                    disabled={isAdded}
                                    className={`text-[10px] px-2 py-0.5 rounded-lg border transition cursor-pointer font-medium ${
                                      isAdded
                                        ? 'bg-slate-100 text-slate-400 border-slate-200 cursor-default'
                                        : 'bg-white hover:bg-emerald-50 text-slate-700 hover:text-emerald-800 border-slate-200 hover:border-emerald-300'
                                    }`}
                                  >
                                    +{dept}
                                  </button>
                                )
                              })}
                            </div>

                            {/* Ordered Aisle Chips List */}
                            <div className="max-h-48 overflow-y-auto p-2 bg-white rounded-xl border border-slate-200 space-y-1">
                              {editAisles.map((aisle, idx) => (
                                <div
                                  key={`${aisle}-${idx}`}
                                  className="flex items-center justify-between p-1.5 rounded-lg bg-slate-50 border border-slate-100 text-xs hover:bg-slate-100/80 transition"
                                >
                                  <div className="flex items-center gap-2 min-w-0">
                                    <span className="w-5 text-[10px] font-bold text-slate-400 text-center shrink-0">
                                      #{idx + 1}
                                    </span>
                                    <span className="font-semibold text-slate-800 truncate">{aisle}</span>
                                  </div>

                                  <div className="flex items-center gap-1 shrink-0">
                                    <button
                                      type="button"
                                      onClick={() => handleMoveEditAisle(idx, 'up')}
                                      disabled={idx === 0}
                                      className="p-1 text-slate-400 hover:text-slate-800 disabled:opacity-20 rounded transition cursor-pointer"
                                      title="Move Aisle Up"
                                    >
                                      <ArrowUp className="w-3.5 h-3.5" />
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() => handleMoveEditAisle(idx, 'down')}
                                      disabled={idx === editAisles.length - 1}
                                      className="p-1 text-slate-400 hover:text-slate-800 disabled:opacity-20 rounded transition cursor-pointer"
                                      title="Move Aisle Down"
                                    >
                                      <ArrowDown className="w-3.5 h-3.5" />
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() => handleRemoveEditAisle(idx)}
                                      className="p-1 text-slate-400 hover:text-rose-600 rounded transition cursor-pointer ml-1"
                                      title="Remove Aisle"
                                    >
                                      <X className="w-3.5 h-3.5" />
                                    </button>
                                  </div>
                                </div>
                              ))}

                              {editAisles.length === 0 && (
                                <div className="py-4 text-center text-xs text-slate-400 italic">
                                  No aisles configured. Type above or click a suggestion.
                                </div>
                              )}
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Save & Cancel */}
                      <div className="flex items-center justify-end gap-2 pt-2">
                        <button
                          type="button"
                          onClick={() => setEditingShopId(null)}
                          className="px-4 py-2 bg-white border border-slate-300 text-slate-700 rounded-xl text-xs font-semibold hover:bg-slate-50 transition cursor-pointer"
                        >
                          Cancel
                        </button>
                        <button
                          type="button"
                          onClick={handleSaveEdit}
                          disabled={!editName.trim()}
                          className="px-5 py-2 bg-emerald-600 text-white rounded-xl text-xs font-bold shadow-md hover:bg-emerald-700 transition cursor-pointer"
                        >
                          Save Changes
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </div>

        {/* Footer */}
        <div className="px-5 py-3 border-t border-slate-200 bg-slate-50/80 flex items-center justify-between shrink-0">
          <div className="text-[11px] text-slate-400">
            Changes save automatically to your household.
          </div>
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-emerald-600 text-white text-xs font-bold hover:bg-emerald-700 transition shadow-xs cursor-pointer"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  )
}
