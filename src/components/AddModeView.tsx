import React, { useState, useMemo, useRef, useEffect } from 'react'
import {
  Plus,
  Minus,
  Check,
  Search,
  ShoppingBag,
  MoreVertical,
  ArrowDownWideNarrow,
  SlidersHorizontal,
  Lock,
  Unlock,
  BookmarkCheck,
  RotateCcw,
  Repeat,
  Sparkles,
  X,
  Square,
  FileText,
} from 'lucide-react'
import type { ShoppingItem } from '../types'
import { useShopping } from '../context/ShoppingContext'
import { WeeklyManagerModal } from './WeeklyManagerModal'
import { KeypadCalculatorModal } from './KeypadCalculatorModal'

interface AddModeViewProps {
  onOpenCreateModal: () => void
  onEditItem: (item: ShoppingItem) => void
  onOpenStoreManager: () => void
}

export const AddModeView: React.FC<AddModeViewProps> = ({
  onEditItem,
}) => {
  const {
    items,
    categories,
    changeItemQuantity,
    updateItem,
    quickAddItem,
    hasCustomDefault,
    saveCurrentAsDefault,
    restoreDefaultList,
    selectWeeklyItems,
    saveCurrentNeededAsWeekly,
    unselectAllItems,
    resetAllItemCounts,
    resetAllItemDescriptions,
  } = useShopping()

  const [searchQuery, setSearchQuery] = useState('')
  const [activeTab, setActiveTab] = useState<'all' | 'needed' | 'weekly'>('all')
  const [quickInput, setQuickInput] = useState('')
  const [quickCategory, setQuickCategory] = useState<string>(() => {
    return categories.find((c) => c.toLowerCase() === 'other') || 'Other'
  })
  const [quickQuantity, setQuickQuantity] = useState<number>(1)
  const [templateSavedFeedback, setTemplateSavedFeedback] = useState(false)
  const [isWeeklyManagerOpen, setIsWeeklyManagerOpen] = useState(false)
  const [weeklyBannerMessage, setWeeklyBannerMessage] = useState<{
    text: string
    count: number
  } | null>(null)
  const [putUncheckedAtBottom, setPutUncheckedAtBottom] = useState<boolean>(() => {
    const saved = localStorage.getItem('hash_groc_unchecked_bottom')
    return saved !== null ? saved === 'true' : false
  })
  const [isLockedItems, setIsLockedItems] = useState<boolean>(() => {
    return localStorage.getItem('hash_groc_lock_items') === 'true'
  })
  const [showOptionsPopover, setShowOptionsPopover] = useState<boolean>(false)

  // Category options guaranteeing 'Other' is present
  const categoryOptions = useMemo(() => {
    if (categories.some((c) => c.toLowerCase() === 'other')) return categories
    return [...categories, 'Other']
  }, [categories])

  // Calculator modal for list mode quantity editing
  const [calcItem, setCalcItem] = useState<ShoppingItem | null>(null)
  const [isQuickAddCalcOpen, setIsQuickAddCalcOpen] = useState<boolean>(false)

  const popoverRef = useRef<HTMLDivElement>(null)

  // Persist lock items setting
  useEffect(() => {
    localStorage.setItem('hash_groc_lock_items', String(isLockedItems))
  }, [isLockedItems])

  // Persist unchecked at bottom setting
  useEffect(() => {
    localStorage.setItem('hash_groc_unchecked_bottom', String(putUncheckedAtBottom))
  }, [putUncheckedAtBottom])

  // Close popover when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (popoverRef.current && !popoverRef.current.contains(event.target as Node)) {
        setShowOptionsPopover(false)
      }
    }
    if (showOptionsPopover) {
      document.addEventListener('mousedown', handleClickOutside)
      return () => document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [showOptionsPopover])

  const neededCount = items.filter((i) => i.isNeeded).length
  const totalCount = items.length
  const weeklyCount = items.filter((i) => i.isWeekly).length

  const triggerHaptic = (ms: number = 25) => {
    if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
      try {
        navigator.vibrate(ms)
      } catch {
        // ignore
      }
    }
  }

  const handleAddItem = async (item: ShoppingItem) => {
    triggerHaptic(30)
    await updateItem(item.id, {
      isNeeded: true,
      quantity: Math.max(1, item.quantity || 1),
    })
  }

  const handleIncrement = async (item: ShoppingItem) => {
    triggerHaptic(20)
    if (!item.isNeeded) {
      await updateItem(item.id, {
        isNeeded: true,
        quantity: Math.max(1, item.quantity || 1),
      })
    } else {
      await changeItemQuantity(item.id, 1)
    }
  }

  const handleDecrement = async (item: ShoppingItem) => {
    triggerHaptic(20)
    const currentQty = item.quantity || 1
    if (currentQty > 1) {
      await changeItemQuantity(item.id, -1)
    } else {
      // Reached 1 -> pressing minus removes item from the list
      await updateItem(item.id, {
        isNeeded: false,
        inCart: false,
      })
    }
  }

  const handleDirectQuantityChange = async (item: ShoppingItem, newQty: number) => {
    triggerHaptic(20)
    if (newQty <= 0) {
      await updateItem(item.id, {
        isNeeded: false,
        inCart: false,
      })
    } else {
      await updateItem(item.id, {
        isNeeded: true,
        quantity: newQty,
      })
    }
  }

  const handleQuickAdd = async (e: React.FormEvent) => {
    e.preventDefault()
    const trimmed = quickInput.trim()
    if (!trimmed) return

    triggerHaptic(30)
    // If already exists in catalog, update existing item to needed rather than duplicating
    const existing = items.find((i) => i.name.trim().toLowerCase() === trimmed.toLowerCase())
    const categoryToUse = quickCategory || 'Other'
    if (existing) {
      const newQty = existing.isNeeded
        ? (existing.quantity || 1) + quickQuantity
        : Math.max(existing.quantity || 1, quickQuantity)
      await updateItem(existing.id, {
        isNeeded: true,
        quantity: newQty,
      })
    } else {
      await quickAddItem(trimmed, categoryToUse, quickQuantity)
    }

    setQuickInput('')
    setQuickQuantity(1)
    setQuickCategory(categories.find((c) => c.toLowerCase() === 'other') || 'Other')
  }

  const handleSelectWeekly = async (resetOthers: boolean = false) => {
    const count = await selectWeeklyItems(resetOthers)
    setActiveTab('needed')
    setWeeklyBannerMessage({
      text: resetOthers
        ? `Reset shopping list to ${count} weekly essentials! Scan your fridge and deselect any you have in stock.`
        : `Added ${count} weekly essentials to your list! Scan your fridge and deselect any you have in stock.`,
      count,
    })
  }

  // Filter items based on activeTab and search query
  const filteredItems = useMemo(() => {
    return items.filter((item) => {
      if (activeTab === 'needed' && !item.isNeeded) return false
      if (activeTab === 'weekly' && !item.isWeekly) return false

      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase()
        return (
          item.name.toLowerCase().includes(query) ||
          item.category?.toLowerCase().includes(query)
        )
      }

      return true
    })
  }, [items, activeTab, searchQuery])

  // Group items by category, with unchecked items sorted to bottom of each category if option checked
  const categorizedGroups = useMemo(() => {
    const groups: Record<string, { needed: ShoppingItem[]; unneeded: ShoppingItem[] }> = {}

    filteredItems.forEach((item) => {
      const cat = item.category || 'Other'
      if (!groups[cat]) {
        groups[cat] = { needed: [], unneeded: [] }
      }
      if (item.isNeeded) {
        groups[cat].needed.push(item)
      } else {
        groups[cat].unneeded.push(item)
      }
    })

    const sortedCats = Object.keys(groups).sort((a, b) => a.localeCompare(b))

    return sortedCats.map((cat) => {
      const { needed, unneeded } = groups[cat]
      needed.sort((a, b) => a.name.localeCompare(b.name))
      unneeded.sort((a, b) => a.name.localeCompare(b.name))

      let orderedItems: ShoppingItem[] = []
      if (putUncheckedAtBottom) {
        orderedItems = [...needed, ...unneeded]
      } else {
        orderedItems = [...needed, ...unneeded].sort((a, b) => a.name.localeCompare(b.name))
      }

      return {
        category: cat,
        items: orderedItems,
        neededCount: needed.length,
        totalCount: needed.length + unneeded.length,
      }
    })
  }, [filteredItems, putUncheckedAtBottom])

  return (
    <div className="pb-28 pt-3 max-w-2xl mx-auto px-3 sm:px-4">
      {/* 1. Quick Add Bar: Single Line with Quantity & Category */}
      <form onSubmit={handleQuickAdd} className="mb-4 bg-white border border-slate-300 rounded-2xl p-1.5 sm:p-2 shadow-xs focus-within:ring-2 focus-within:ring-emerald-500 focus-within:border-emerald-500 transition">
        <div className="flex items-center gap-1.5 sm:gap-2">
          {/* Item Name Input */}
          <input
            type="text"
            placeholder="Add an item to buy..."
            value={quickInput}
            onChange={(e) => setQuickInput(e.target.value)}
            className="flex-1 min-w-[90px] sm:min-w-[140px] px-2 py-1 text-xs sm:text-sm bg-transparent border-none outline-none font-medium placeholder:text-slate-400"
          />

          {/* Quantity Stepper (No label) */}
          <div className="flex items-center rounded-xl border border-slate-200 bg-slate-50 overflow-hidden shadow-2xs shrink-0">
            <button
              type="button"
              onClick={() => setQuickQuantity((q) => Math.max(1, q - 1))}
              className="w-6 sm:w-7 h-7 flex items-center justify-center text-slate-600 hover:bg-slate-200 active:bg-slate-300 transition cursor-pointer"
              title="Decrease quantity"
            >
              <Minus className="w-3 h-3" />
            </button>

            <button
              type="button"
              onClick={() => setIsQuickAddCalcOpen(true)}
              className="min-w-[20px] sm:min-w-[24px] px-1 text-center font-bold text-xs text-slate-800 hover:bg-slate-200/60 rounded transition cursor-pointer select-none"
              title="Click to set quantity with calculator"
            >
              {quickQuantity}
            </button>

            <button
              type="button"
              onClick={() => setQuickQuantity((q) => q + 1)}
              className="w-6 sm:w-7 h-7 flex items-center justify-center text-emerald-700 hover:bg-emerald-100 active:bg-emerald-200 transition cursor-pointer"
              title="Increase quantity"
            >
              <Plus className="w-3 h-3" />
            </button>
          </div>

          {/* Category Dropdown (No label, defaults to Other) */}
          <select
            value={quickCategory}
            onChange={(e) => setQuickCategory(e.target.value)}
            className="text-xs bg-slate-50 border border-slate-200 rounded-xl px-1.5 sm:px-2 py-1.5 font-semibold text-slate-700 outline-none max-w-[85px] sm:max-w-[130px] truncate shrink-0 cursor-pointer"
            title="Category"
          >
            {categoryOptions.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>

          {/* Add Button */}
          <button
            type="submit"
            disabled={!quickInput.trim()}
            className="w-8 h-8 sm:w-9 sm:h-9 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-40 text-white font-bold rounded-xl transition flex items-center justify-center shadow-xs shrink-0 cursor-pointer active:scale-95"
            title="Add item to list"
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
          </button>
        </div>
      </form>

      {/* Dismissible Feedback Banner */}
      {weeklyBannerMessage && (
        <div className="mb-3 bg-teal-50 border border-teal-200 text-teal-900 rounded-xl p-3 flex items-start justify-between gap-2 shadow-xs animate-in fade-in duration-150">
          <div className="flex items-start gap-2">
            <Check className="w-4 h-4 text-teal-600 mt-0.5 shrink-0" />
            <div className="text-xs font-semibold leading-relaxed">
              {weeklyBannerMessage.text}
            </div>
          </div>
          <button
            type="button"
            onClick={() => setWeeklyBannerMessage(null)}
            className="text-teal-700 hover:text-teal-900 p-0.5 rounded-md hover:bg-teal-100 cursor-pointer"
            title="Dismiss"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* 3. Clean View Controls: All / Buy / Weekly + Search + View Options (Single Line on All Screens) */}
      <div className="flex items-center justify-between gap-1 sm:gap-2 mb-3">
        {/* Left: View Tabs (All vs Buy vs Weekly) */}
        <div className="flex bg-slate-200/80 p-0.5 sm:p-1 rounded-xl shrink-0 gap-0.5">
          <button
            onClick={() => setActiveTab('all')}
            title={`All: Master pantry catalog (${totalCount} total items)`}
            className={`px-1.5 sm:px-2.5 py-1 rounded-lg text-xs font-bold transition flex items-center gap-1 cursor-pointer shrink-0 ${
              activeTab === 'all'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <span>All</span>
            <span className="text-[10px] bg-slate-100 text-slate-600 px-1 py-0.2 rounded-full font-bold">
              {totalCount}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('needed')}
            title={`Buy: Active shopping list (${neededCount} items needed)`}
            className={`px-1.5 sm:px-2.5 py-1 rounded-lg text-xs font-bold transition flex items-center gap-1 cursor-pointer shrink-0 ${
              activeTab === 'needed'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <span>Buy</span>
            <span
              className={`text-[10px] px-1 py-0.2 rounded-full font-bold ${
                activeTab === 'needed'
                  ? 'bg-white/25 text-white'
                  : 'bg-emerald-100 text-emerald-800'
              }`}
            >
              {neededCount}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('weekly')}
            title={`Weekly: Items consumed weekly (${weeklyCount} items)`}
            aria-label="Weekly staples"
            className={`px-1.5 sm:px-2.5 py-1 rounded-lg text-xs font-bold transition flex items-center gap-1 cursor-pointer shrink-0 ${
              activeTab === 'weekly'
                ? 'bg-teal-700 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Repeat className="w-3.5 h-3.5" />
            <span
              className={`text-[10px] px-1 py-0.2 rounded-full font-bold ${
                activeTab === 'weekly'
                  ? 'bg-white/25 text-white'
                  : 'bg-teal-100 text-teal-800'
              }`}
            >
              {weeklyCount}
            </span>
          </button>
        </div>

        {/* Right: Search & Vertical 3-Dot Options Button */}
        <div className="flex items-center gap-1 sm:gap-1.5 flex-1 min-w-0 justify-end">
          <div className="relative flex-1 min-w-[60px] max-w-[120px] sm:max-w-[160px]">
            <Search className="w-3.5 h-3.5 absolute left-2 top-2 text-slate-400 pointer-events-none" />
            <input
              type="text"
              placeholder="Search..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-6.5 sm:pl-7 pr-2 py-1 rounded-xl border border-slate-200 bg-white text-xs focus:outline-none focus:ring-1 focus:ring-emerald-500"
            />
          </div>

          {/* 3 Vertical Dots View Options Button & Dropdown */}
          <div className="relative shrink-0" ref={popoverRef}>
            <button
              type="button"
              onClick={() => setShowOptionsPopover(!showOptionsPopover)}
              className={`p-1.5 rounded-xl border transition shadow-2xs flex items-center justify-center cursor-pointer ${
                showOptionsPopover || isLockedItems
                  ? 'border-amber-400 bg-amber-50 text-amber-800'
                  : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-100'
              }`}
              title="View Options & Settings"
            >
              {isLockedItems ? (
                <Lock className="w-3.5 h-3.5 text-amber-600" />
              ) : (
                <MoreVertical className="w-4 h-4" />
              )}
            </button>

            {/* Dropdown Popover */}
            {showOptionsPopover && (
              <div className="absolute right-0 top-9 w-64 max-h-[80vh] overflow-y-auto bg-white rounded-2xl border border-slate-200 shadow-xl p-3 z-30 animate-in fade-in duration-150">
                <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-2 px-1 flex items-center gap-1">
                  <SlidersHorizontal className="w-3 h-3 text-slate-400" />
                  <span>List Settings</span>
                </div>

                <div className="space-y-1.5">
                  {/* Option 1: Lock Items */}
                  <label className="flex items-center justify-between p-2 rounded-xl hover:bg-slate-50 cursor-pointer text-xs">
                    <div className="flex items-center gap-2">
                      {isLockedItems ? (
                        <Lock className="w-4 h-4 text-amber-600 shrink-0" />
                      ) : (
                        <Unlock className="w-4 h-4 text-slate-400 shrink-0" />
                      )}
                      <div>
                        <div className="font-semibold text-slate-800">Lock Items</div>
                        <div className="text-[10px] text-slate-400">
                          {isLockedItems ? 'Tapping title is disabled' : 'Tap item title to edit'}
                        </div>
                      </div>
                    </div>
                    <input
                      type="checkbox"
                      checked={isLockedItems}
                      onChange={(e) => {
                        setIsLockedItems(e.target.checked)
                      }}
                      className="w-4 h-4 rounded text-amber-500 focus:ring-amber-400 accent-amber-500 shrink-0 ml-2"
                    />
                  </label>

                  {/* Option 2: Put unchecked at bottom Switch */}
                  <label className="flex items-center justify-between p-2 rounded-xl hover:bg-slate-50 cursor-pointer text-xs">
                    <div className="flex items-center gap-2">
                      <ArrowDownWideNarrow className="w-4 h-4 text-emerald-600 shrink-0" />
                      <div>
                        <div className="font-semibold text-slate-800">Unchecked at bottom</div>
                        <div className="text-[10px] text-slate-400">Sort needed items to top</div>
                      </div>
                    </div>
                    <input
                      type="checkbox"
                      checked={putUncheckedAtBottom}
                      onChange={(e) => {
                        setPutUncheckedAtBottom(e.target.checked)
                      }}
                      className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500 accent-emerald-600 shrink-0 ml-2"
                    />
                  </label>
                </div>

                {/* Reset Actions */}
                <div className="pt-2 mt-2 border-t border-slate-100 space-y-1.5">
                  <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 px-1">
                    Reset Actions
                  </div>

                  {/* 1. Unselect Everything */}
                  <button
                    type="button"
                    onClick={async () => {
                      if (neededCount === 0) {
                        alert('All items are already unselected.')
                        return
                      }
                      if (
                        window.confirm(
                          `Unselect all ${neededCount} item${neededCount === 1 ? '' : 's'} from your shopping list?`
                        )
                      ) {
                        await unselectAllItems()
                        setShowOptionsPopover(false)
                      }
                    }}
                    className="w-full py-1.5 px-2.5 rounded-xl text-xs font-semibold text-rose-700 bg-rose-50/70 hover:bg-rose-100 transition flex items-center justify-between cursor-pointer"
                    title="Unselect everything from the active shopping list"
                  >
                    <div className="flex items-center gap-1.5">
                      <Square className="w-3.5 h-3.5 text-rose-600" />
                      <span>Unselect Everything</span>
                    </div>
                    <span className="text-[10px] text-rose-600 font-bold">
                      {neededCount}
                    </span>
                  </button>

                  {/* 2. Reset Counts to 1 */}
                  <button
                    type="button"
                    onClick={async () => {
                      if (
                        window.confirm(
                          `Reset quantity of all ${items.length} items to 1?`
                        )
                      ) {
                        await resetAllItemCounts()
                        setShowOptionsPopover(false)
                      }
                    }}
                    className="w-full py-1.5 px-2.5 rounded-xl text-xs font-semibold text-slate-700 bg-slate-50 hover:bg-slate-100 transition flex items-center justify-between cursor-pointer"
                    title="Reset all item quantities to 1"
                  >
                    <div className="flex items-center gap-1.5">
                      <RotateCcw className="w-3.5 h-3.5 text-slate-500" />
                      <span>Reset Counts to 1</span>
                    </div>
                    <span className="text-[10px] text-slate-500 font-bold">
                      1 ea
                    </span>
                  </button>

                  {/* 3. Reset All Descriptions */}
                  <button
                    type="button"
                    onClick={async () => {
                      if (
                        window.confirm(
                          `Reset and clear descriptions (notes) for all ${items.length} items?`
                        )
                      ) {
                        await resetAllItemDescriptions()
                        setShowOptionsPopover(false)
                      }
                    }}
                    className="w-full py-1.5 px-2.5 rounded-xl text-xs font-semibold text-slate-700 bg-slate-50 hover:bg-slate-100 transition flex items-center justify-between cursor-pointer"
                    title="Clear descriptions/notes for all items"
                  >
                    <div className="flex items-center gap-1.5">
                      <FileText className="w-3.5 h-3.5 text-slate-500" />
                      <span>Reset Descriptions</span>
                    </div>
                    <span className="text-[10px] text-slate-500 font-bold">
                      Clear
                    </span>
                  </button>
                </div>

                {/* Weekly Routine Actions */}
                <div className="pt-2 mt-2 border-t border-slate-100 space-y-1.5">
                  <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 px-1">
                    Weekly Routine
                  </div>

                  {/* 1-Click: Select Weekly Staples */}
                  <button
                    type="button"
                    onClick={async () => {
                      await handleSelectWeekly(false)
                      setShowOptionsPopover(false)
                    }}
                    className="w-full py-1.5 px-2.5 rounded-xl text-xs font-semibold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 transition flex items-center justify-between cursor-pointer"
                    title="Select all recurring staples and go to To Buy"
                  >
                    <div className="flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
                      <span>Select Weekly Staples</span>
                    </div>
                    <span className="text-[10px] text-emerald-700 font-bold">
                      +{weeklyCount}
                    </span>
                  </button>

                  {/* Start Fresh with Weekly Only */}
                  <button
                    type="button"
                    onClick={async () => {
                      if (
                        window.confirm(
                          `Start fresh trip with only your ${weeklyCount} weekly staples? (Other items will be unchecked)`
                        )
                      ) {
                        await handleSelectWeekly(true)
                        setShowOptionsPopover(false)
                      }
                    }}
                    className="w-full py-1.5 px-2.5 rounded-xl text-xs font-semibold text-slate-700 bg-slate-50 hover:bg-slate-100 transition flex items-center justify-between cursor-pointer"
                  >
                    <div className="flex items-center gap-1.5">
                      <RotateCcw className="w-3.5 h-3.5 text-slate-500" />
                      <span>Start Fresh (Weekly Only)</span>
                    </div>
                    <span className="text-[10px] text-slate-500 font-bold">
                      {weeklyCount}
                    </span>
                  </button>

                  {/* Set Current 'To Buy' as Weekly */}
                  <button
                    type="button"
                    onClick={async () => {
                      if (neededCount === 0) {
                        alert('Your "To Buy" list is currently empty. Mark items first.')
                        return
                      }
                      const count = await saveCurrentNeededAsWeekly(false)
                      setShowOptionsPopover(false)
                      setWeeklyBannerMessage({
                        text: `Saved your ${neededCount} active items as weekly staples! (Total: ${count})`,
                        count,
                      })
                    }}
                    className="w-full py-1.5 px-2.5 rounded-xl text-xs font-semibold text-slate-700 bg-slate-50 hover:bg-slate-100 transition flex items-center justify-between cursor-pointer"
                    title="Save current trip's items as your weekly staples"
                  >
                    <div className="flex items-center gap-1.5">
                      <BookmarkCheck className="w-3.5 h-3.5 text-slate-500" />
                      <span>Set "To Buy" as Weekly</span>
                    </div>
                    <span className="text-[10px] text-slate-500 font-bold">
                      {neededCount} items
                    </span>
                  </button>

                  {/* Open Checklist Modal */}
                  <button
                    type="button"
                    onClick={() => {
                      setIsWeeklyManagerOpen(true)
                      setShowOptionsPopover(false)
                    }}
                    className="w-full py-1.5 px-2.5 rounded-xl text-xs font-semibold text-teal-800 bg-teal-50 hover:bg-teal-100 transition flex items-center justify-between cursor-pointer"
                  >
                    <div className="flex items-center gap-1.5">
                      <SlidersHorizontal className="w-3.5 h-3.5 text-teal-600" />
                      <span>Manage Staples Checklist</span>
                    </div>
                    <span className="text-[10px] text-teal-700 font-bold">
                      {weeklyCount} staples
                    </span>
                  </button>
                </div>

                {/* Default Template Actions */}
                <div className="pt-2 mt-2 border-t border-slate-100 space-y-1.5">
                  <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 px-1">
                    Default Template
                  </div>

                  <button
                    type="button"
                    onClick={async () => {
                      await saveCurrentAsDefault()
                      setTemplateSavedFeedback(true)
                      setTimeout(() => {
                        setTemplateSavedFeedback(false)
                        setShowOptionsPopover(false)
                      }, 1800)
                    }}
                    className="w-full py-1.5 px-2.5 rounded-xl text-xs font-semibold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 transition flex items-center justify-between cursor-pointer"
                  >
                    <div className="flex items-center gap-1.5">
                      {templateSavedFeedback ? (
                        <Check className="w-3.5 h-3.5 text-emerald-600" />
                      ) : (
                        <BookmarkCheck className="w-3.5 h-3.5 text-emerald-600" />
                      )}
                      <span>
                        {templateSavedFeedback ? 'Saved as Default!' : 'Save Current as Default'}
                      </span>
                    </div>
                    <span className="text-[10px] text-emerald-600 font-bold">
                      {items.length} items
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={async () => {
                      const confirmMsg = hasCustomDefault
                        ? `Restore your saved default template (${items.length} items will be replaced)?`
                        : 'Restore default list? Current list items will be replaced.'
                      if (window.confirm(confirmMsg)) {
                        await restoreDefaultList()
                        setShowOptionsPopover(false)
                      }
                    }}
                    className="w-full py-1.5 px-2.5 rounded-xl text-xs font-semibold text-slate-700 bg-slate-50 hover:bg-slate-100 transition flex items-center justify-between cursor-pointer"
                  >
                    <div className="flex items-center gap-1.5">
                      <RotateCcw className="w-3.5 h-3.5 text-slate-500" />
                      <span>
                        {hasCustomDefault ? 'Restore Saved Default' : 'Restore Default List'}
                      </span>
                    </div>
                    {hasCustomDefault && (
                      <span className="text-[9px] bg-emerald-100 text-emerald-800 px-1.5 py-0.5 rounded-full font-bold">
                        Custom
                      </span>
                    )}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Weekly Tab Helper Bar */}
      {activeTab === 'weekly' && (
        <div className="mb-3 p-3 bg-gradient-to-r from-teal-50 to-emerald-50 border border-teal-200 rounded-2xl flex items-center justify-between gap-2 shadow-2xs">
          <div className="flex items-center gap-2 min-w-0">
            <Repeat className="w-4 h-4 text-teal-600 shrink-0" />
            <div className="min-w-0 text-xs text-teal-950 font-semibold truncate">
              {weeklyCount > 0 ? (
                <span>
                  {weeklyCount} recurring staples • Use "Manage" to configure
                </span>
              ) : (
                <span>No weekly staples designated yet</span>
              )}
            </div>
          </div>
          <button
            type="button"
            onClick={() => setIsWeeklyManagerOpen(true)}
            className="px-3 py-1.5 bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold rounded-xl transition flex items-center gap-1 shadow-2xs shrink-0 cursor-pointer"
          >
            <SlidersHorizontal className="w-3.5 h-3.5" />
            <span>Manage Staples</span>
          </button>
        </div>
      )}

      {/* 3. Categorized Items List */}
      {categorizedGroups.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-2xl border border-dashed border-slate-200 p-6">
          <ShoppingBag className="w-10 h-10 text-slate-300 mx-auto mb-2" />
          <h3 className="text-sm font-bold text-slate-800">
            {activeTab === 'needed'
              ? 'No items marked as needed to buy'
              : activeTab === 'weekly'
              ? 'No weekly staples marked yet'
              : 'No items match your search'}
          </h3>
          <p className="text-xs text-slate-500 mt-1 max-w-xs mx-auto">
            {activeTab === 'needed'
              ? 'Tap "Select Weekly" above or browse "All Items" to pick items for your trip.'
              : activeTab === 'weekly'
              ? 'Quickly pick staples using the Rapid Checklist, or mark items in All Items.'
              : 'Try clearing your search query.'}
          </p>
          {activeTab === 'weekly' && (
            <div className="mt-4">
              <button
                type="button"
                onClick={() => setIsWeeklyManagerOpen(true)}
                className="px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold rounded-xl transition shadow-xs inline-flex items-center gap-1.5 cursor-pointer"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Open Rapid Staples Checklist</span>
              </button>
            </div>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          {categorizedGroups.map(({ category, items: groupItems, neededCount: catNeeded }) => {
            return (
              <div
                key={category}
                className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden"
              >
                {/* Category Header */}
                <div className="px-4 py-2.5 bg-slate-50/80 border-b border-slate-100 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-emerald-600" />
                    <span className="font-extrabold text-xs text-slate-800 uppercase tracking-wider">
                      {category}
                    </span>
                  </div>
                  <span className="text-[11px] font-semibold text-slate-500">
                    {catNeeded > 0 ? (
                      <span className="text-emerald-700 font-bold">{catNeeded} to buy</span>
                    ) : (
                      <span>0 to buy</span>
                    )}{' '}
                    • {groupItems.length} total
                  </span>
                </div>

                {/* Items in Category */}
                <div className="divide-y divide-slate-100">
                  {groupItems.map((item) => {
                    return (
                      <div
                        key={item.id}
                        className="p-3 sm:p-3.5 flex items-center justify-between gap-3 transition-colors hover:bg-slate-50/50"
                      >
                        {/* Left: Item Name & Indicators (Clickable to edit when not locked) */}
                        <div
                          className={`min-w-0 flex-1 ${
                            !isLockedItems ? 'cursor-pointer group' : ''
                          }`}
                          onClick={() => {
                            if (!isLockedItems) onEditItem(item)
                          }}
                          title={!isLockedItems ? 'Click to edit item & details' : undefined}
                        >
                          <div className="flex items-center gap-1.5 min-w-0">
                            <span
                              className={`text-sm tracking-tight truncate ${
                                item.isNeeded
                                  ? 'font-bold text-slate-900'
                                  : 'font-medium text-slate-600'
                              } ${!isLockedItems ? 'group-hover:text-emerald-700' : ''}`}
                            >
                              {item.name}
                            </span>

                            {/* Weekly Recurring Icon (shown on All Items & To Buy tabs) */}
                            {item.isWeekly && (activeTab === 'all' || activeTab === 'needed') && (
                              <span
                                title="Weekly recurring staple"
                                className="inline-flex items-center text-blue-600 shrink-0"
                              >
                                <Repeat className="w-3.5 h-3.5" />
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Right: Unified Action Stepper (When needed) or [+] (When not needed) */}
                        {item.isNeeded ? (
                          <div className="h-8 sm:h-9 flex items-center rounded-xl border border-slate-200 bg-slate-50 overflow-hidden shadow-2xs shrink-0">
                            <button
                              type="button"
                              onClick={() => handleDecrement(item)}
                              className="w-8 sm:w-9 h-full flex items-center justify-center text-slate-600 hover:bg-slate-200 active:bg-slate-300 transition cursor-pointer"
                              title={item.quantity <= 1 ? 'Remove from shopping list' : 'Decrease quantity'}
                            >
                              <Minus className="w-3.5 h-3.5 stroke-[2.5]" />
                            </button>

                            <button
                              type="button"
                              onClick={() => setCalcItem(item)}
                              className="min-w-[28px] sm:min-w-[32px] px-1.5 h-full flex items-center justify-center text-xs sm:text-sm font-bold text-slate-800 hover:bg-slate-200/60 transition cursor-pointer select-none"
                              title="Click to set quantity with calculator"
                            >
                              {item.quantity}
                            </button>

                            <button
                              type="button"
                              onClick={() => handleIncrement(item)}
                              className="w-8 sm:w-9 h-full flex items-center justify-center text-slate-700 hover:bg-slate-200 active:bg-slate-300 transition cursor-pointer"
                              title="Increase quantity"
                            >
                              <Plus className="w-4 h-4 stroke-[2.5]" />
                            </button>
                          </div>
                        ) : (
                          <button
                            type="button"
                            onClick={() => handleAddItem(item)}
                            className="w-8 sm:w-9 h-8 sm:h-9 rounded-xl font-bold transition-all flex items-center justify-center shrink-0 shadow-2xs border bg-slate-100 hover:bg-slate-200 text-slate-700 border-slate-200 cursor-pointer active:scale-95"
                            title="Add to shopping list"
                          >
                            <Plus className="w-4 h-4 stroke-[2.5]" />
                          </button>
                        )}
                      </div>
                    )
                  })}
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Rapid Weekly Staples Manager Modal */}
      <WeeklyManagerModal
        isOpen={isWeeklyManagerOpen}
        onClose={() => setIsWeeklyManagerOpen(false)}
      />

      {/* Calculator Modal for Item Quantity in List */}
      {calcItem && (
        <KeypadCalculatorModal
          isOpen={Boolean(calcItem)}
          onClose={() => setCalcItem(null)}
          title="Set Quantity"
          itemName={calcItem.name}
          storeName=""
          initialValue={calcItem.quantity || 1}
          mode="quantity"
          unit={calcItem.unit || ''}
          onApply={async (newQty) => {
            await handleDirectQuantityChange(calcItem, newQty)
            setCalcItem(null)
          }}
        />
      )}

      {/* Calculator Modal for Quick Add Quantity */}
      {isQuickAddCalcOpen && (
        <KeypadCalculatorModal
          isOpen={isQuickAddCalcOpen}
          onClose={() => setIsQuickAddCalcOpen(false)}
          title="Set Add Quantity"
          itemName={quickInput.trim() || 'New Item'}
          storeName=""
          initialValue={quickQuantity}
          mode="quantity"
          onApply={(newQty) => {
            setQuickQuantity(newQty)
            setIsQuickAddCalcOpen(false)
          }}
        />
      )}
    </div>
  )
}
