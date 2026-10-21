import React, { useState, useMemo, useRef, useEffect } from 'react'
import {
  Plus,
  Minus,
  Check,
  Search,
  ShoppingBag,
  MoreHorizontal,
  ArrowDownWideNarrow,
  SlidersHorizontal,
  Lock,
  Unlock,
  BookmarkCheck,
  RotateCcw,
  Repeat,
  Sparkles,
  X,
} from 'lucide-react'
import type { ShoppingItem } from '../types'
import { COMMON_UNITS } from '../types'
import { useShopping } from '../context/ShoppingContext'

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
    toggleNeeded,
    changeItemQuantity,
    quickAddItem,
    hasCustomDefault,
    saveCurrentAsDefault,
    restoreDefaultList,
    selectWeeklyItems,
    toggleWeeklyItem,
  } = useShopping()

  const [searchQuery, setSearchQuery] = useState('')
  const [activeTab, setActiveTab] = useState<'all' | 'needed' | 'weekly'>('all')
  const [quickInput, setQuickInput] = useState('')
  const [quickCategory, setQuickCategory] = useState<string>(categories[0] || 'Produce')
  const [quickQuantity, setQuickQuantity] = useState<number>(1)
  const [quickUnit, setQuickUnit] = useState<string>('pieces')
  const [templateSavedFeedback, setTemplateSavedFeedback] = useState(false)
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

  const handleQuickAdd = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!quickInput.trim()) return
    await quickAddItem(quickInput.trim(), quickCategory, quickQuantity, quickUnit)
    setQuickInput('')
    setQuickQuantity(1)
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
      {/* 1. Quick Add Bar: Item Name, Quantity, Unit, & Category */}
      <form onSubmit={handleQuickAdd} className="mb-4 bg-white border border-slate-300 rounded-2xl p-2 sm:p-2.5 shadow-xs focus-within:ring-2 focus-within:ring-emerald-500 focus-within:border-emerald-500 transition">
        {/* Top: Name Input + Add Button */}
        <div className="flex items-center gap-2">
          <input
            type="text"
            placeholder="Add an item to buy (e.g. Milk, Bananas)..."
            value={quickInput}
            onChange={(e) => setQuickInput(e.target.value)}
            className="flex-1 px-2.5 py-1 text-sm sm:text-base bg-transparent border-none outline-none font-medium placeholder:text-slate-400"
          />
          <button
            type="submit"
            disabled={!quickInput.trim()}
            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-40 text-white text-xs sm:text-sm font-bold rounded-xl transition flex items-center gap-1 shadow-xs shrink-0"
          >
            <Plus className="w-4 h-4" />
            <span>Add</span>
          </button>
        </div>

        {/* Bottom Options Row: Quantity Stepper, Unit Selector, and Category */}
        <div className="mt-2 pt-2 border-t border-slate-100 flex flex-wrap items-center gap-2 text-xs">
          {/* Quantity Stepper */}
          <div className="flex items-center gap-1">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider hidden sm:inline">
              Qty:
            </span>
            <div className="flex items-center rounded-xl border border-slate-200 bg-slate-50 overflow-hidden shadow-2xs">
              <button
                type="button"
                onClick={() => setQuickQuantity((q) => Math.max(1, q - 1))}
                className="w-7 h-7 flex items-center justify-center text-slate-600 hover:bg-slate-200 active:bg-slate-300 transition"
                title="Decrease quantity"
              >
                <Minus className="w-3 h-3" />
              </button>

              <span className="w-6 text-center font-bold text-xs text-slate-800">
                {quickQuantity}
              </span>

              <button
                type="button"
                onClick={() => setQuickQuantity((q) => q + 1)}
                className="w-7 h-7 flex items-center justify-center text-emerald-700 hover:bg-emerald-100 active:bg-emerald-200 transition"
                title="Increase quantity"
              >
                <Plus className="w-3 h-3" />
              </button>
            </div>
          </div>

          {/* Unit Selector */}
          <div className="flex items-center gap-1">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider hidden sm:inline">
              Unit:
            </span>
            <select
              value={quickUnit}
              onChange={(e) => setQuickUnit(e.target.value)}
              className="text-xs bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-1.5 font-semibold text-slate-700 outline-none"
            >
              {COMMON_UNITS.map((u) => (
                <option key={u} value={u}>
                  {u}
                </option>
              ))}
            </select>
          </div>

          {/* Category Selector */}
          <div className="flex items-center gap-1 flex-1 min-w-[130px]">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider hidden sm:inline">
              Category:
            </span>
            <select
              value={quickCategory}
              onChange={(e) => setQuickCategory(e.target.value)}
              className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-1.5 font-semibold text-slate-700 outline-none truncate"
            >
              {categories.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>
        </div>
      </form>

      {/* 2. 1-Click Weekly Routine Action Bar */}
      <div className="mb-3 bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 text-white rounded-2xl p-2.5 sm:p-3 shadow-xs flex items-center justify-between gap-2">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-8 h-8 rounded-xl bg-white/20 flex items-center justify-center shrink-0">
            <Repeat className="w-4 h-4 text-white" />
          </div>
          <div className="min-w-0">
            <div className="text-xs font-extrabold tracking-tight flex items-center gap-1.5">
              <span>Weekly Routine</span>
              <span className="text-[10px] bg-white/25 text-white font-bold px-1.5 py-0.2 rounded-full">
                {weeklyCount} staples
              </span>
            </div>
            <div className="text-[11px] text-emerald-100 truncate">
              Select staples in 1 click, then deselect items you already have
            </div>
          </div>
        </div>

        <button
          type="button"
          onClick={() => handleSelectWeekly(false)}
          className="px-3.5 py-1.5 bg-white text-emerald-800 hover:bg-emerald-50 active:scale-95 text-xs font-bold rounded-xl transition shadow-xs flex items-center gap-1 shrink-0 cursor-pointer"
          title="Select all weekly staples and review To Buy list"
        >
          <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
          <span>Select Weekly</span>
        </button>
      </div>

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

      {/* 3. Clean View Controls: All Items / To Buy / Weekly + Search + View Options */}
      <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
        {/* Left: View Tabs (All Items vs To Buy vs Weekly) */}
        <div className="flex bg-slate-200/80 p-1 rounded-xl shrink-0 overflow-x-auto max-w-full">
          <button
            onClick={() => setActiveTab('all')}
            title={`All Items: Master pantry catalog (${totalCount} total items)`}
            className={`px-2.5 sm:px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'all'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <span>All Items</span>
            <span className="text-[10px] bg-slate-100 text-slate-600 px-1.5 py-0.2 rounded-full font-bold">
              {totalCount}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('needed')}
            title={`To Buy: Active shopping list (${neededCount} items needed)`}
            className={`px-2.5 sm:px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'needed'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <span>To Buy</span>
            <span
              className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
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
            title={`Weekly Staples: Items consumed weekly (${weeklyCount} items)`}
            className={`px-2.5 sm:px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'weekly'
                ? 'bg-teal-700 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Repeat className="w-3 h-3" />
            <span>Weekly</span>
            <span
              className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                activeTab === 'weekly'
                  ? 'bg-white/25 text-white'
                  : 'bg-teal-100 text-teal-800'
              }`}
            >
              {weeklyCount}
            </span>
          </button>
        </div>

        {/* Right: Compact Search & Subtle '···' View Options Icon */}
        <div className="flex items-center gap-1.5">
          <div className="relative w-28 sm:w-36">
            <Search className="w-3.5 h-3.5 absolute left-2.5 top-2 text-slate-400" />
            <input
              type="text"
              placeholder="Search..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-8 pr-2 py-1 rounded-xl border border-slate-200 bg-white text-xs focus:outline-none focus:ring-1 focus:ring-emerald-500"
            />
          </div>

          {/* Subtle '···' View Options Button & Dropdown */}
          <div className="relative" ref={popoverRef}>
            <button
              type="button"
              onClick={() => setShowOptionsPopover(!showOptionsPopover)}
              className={`p-1.5 rounded-xl border transition shadow-2xs flex items-center gap-1 cursor-pointer ${
                showOptionsPopover || isLockedItems
                  ? 'border-amber-400 bg-amber-50 text-amber-800'
                  : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-100'
              }`}
              title="View Options & Settings"
            >
              {isLockedItems ? (
                <Lock className="w-3.5 h-3.5 text-amber-600" />
              ) : (
                <MoreHorizontal className="w-4 h-4" />
              )}
            </button>

            {/* Dropdown Popover */}
            {showOptionsPopover && (
              <div className="absolute right-0 top-9 w-64 bg-white rounded-2xl border border-slate-200 shadow-xl p-3 z-30 animate-in fade-in duration-150">
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

                {/* Weekly Routine Actions */}
                <div className="pt-2 mt-2 border-t border-slate-100 space-y-1.5">
                  <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 px-1">
                    Weekly Routine
                  </div>

                  <button
                    type="button"
                    onClick={async () => {
                      await handleSelectWeekly(false)
                      setShowOptionsPopover(false)
                    }}
                    className="w-full py-1.5 px-2.5 rounded-xl text-xs font-semibold text-teal-800 bg-teal-50 hover:bg-teal-100 transition flex items-center justify-between cursor-pointer"
                  >
                    <div className="flex items-center gap-1.5">
                      <Repeat className="w-3.5 h-3.5 text-teal-600" />
                      <span>Add Weekly Staples</span>
                    </div>
                    <span className="text-[10px] text-teal-700 font-bold">
                      +{weeklyCount}
                    </span>
                  </button>

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
                      <Sparkles className="w-3.5 h-3.5 text-slate-500" />
                      <span>Start Fresh (Weekly Only)</span>
                    </div>
                    <span className="text-[10px] text-slate-500 font-bold">
                      {weeklyCount}
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
              ? 'Click the "Weekly" badge next to any item in All Items to include it in your weekly routine.'
              : 'Try clearing your search query.'}
          </p>
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
                        className={`p-3 sm:p-3.5 flex items-center justify-between gap-3 transition-colors ${
                          item.isNeeded ? 'bg-emerald-50/30' : 'hover:bg-slate-50/50'
                        }`}
                      >
                        {/* Left: Item Name & Unit (Clickable to edit when not locked) */}
                        <div
                          className={`min-w-0 flex-1 ${
                            !isLockedItems ? 'cursor-pointer group' : ''
                          }`}
                          onClick={() => {
                            if (!isLockedItems) onEditItem(item)
                          }}
                          title={!isLockedItems ? 'Click to edit item & prices' : undefined}
                        >
                          <div className="flex items-center gap-1.5 flex-wrap sm:flex-nowrap">
                            <span
                              className={`text-sm tracking-tight truncate ${
                                item.isNeeded
                                  ? 'font-bold text-slate-900'
                                  : 'font-medium text-slate-600'
                              } ${!isLockedItems ? 'group-hover:text-emerald-700' : ''}`}
                            >
                              {item.name}
                            </span>

                            {/* Weekly Staple Badge / Quick Toggle */}
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation()
                                toggleWeeklyItem(item.id)
                              }}
                              title={
                                item.isWeekly
                                  ? 'Weekly staple (click to unmark)'
                                  : 'Click to mark as weekly staple'
                              }
                              className={`text-[10px] px-1.5 py-0.5 rounded-md font-bold transition flex items-center gap-0.5 shrink-0 cursor-pointer ${
                                item.isWeekly
                                  ? 'bg-teal-100 text-teal-800 hover:bg-teal-200'
                                  : 'opacity-0 group-hover:opacity-70 hover:!opacity-100 text-slate-400 hover:text-slate-700 hover:bg-slate-200/60'
                              }`}
                            >
                              <Repeat className="w-2.5 h-2.5" />
                              <span>Weekly</span>
                            </button>
                          </div>
                        </div>

                        {/* Middle: Quantity Stepper ([-] [ qty unit ] [+]) */}
                        <div className="flex items-center rounded-xl border border-slate-200 bg-slate-50 overflow-hidden shadow-2xs shrink-0">
                          <button
                            type="button"
                            onClick={() => changeItemQuantity(item.id, -1)}
                            className="w-8 h-8 flex items-center justify-center text-slate-600 hover:bg-slate-200 active:bg-slate-300 transition"
                            title="Decrease quantity"
                          >
                            <Minus className="w-3.5 h-3.5" />
                          </button>

                          <div className="px-2 text-center text-xs font-bold text-slate-800 whitespace-nowrap">
                            {item.quantity}{' '}
                            <span className="text-[11px] font-medium text-slate-500">
                              {item.unit}
                            </span>
                          </div>

                          <button
                            type="button"
                            onClick={() => changeItemQuantity(item.id, 1)}
                            className="w-8 h-8 flex items-center justify-center text-emerald-700 hover:bg-emerald-100 active:bg-emerald-200 transition"
                            title="Increase quantity"
                          >
                            <Plus className="w-3.5 h-3.5" />
                          </button>
                        </div>

                        {/* Right: Buy / Remove Toggle Button (Fixed Width w-20 to prevent layout shift) */}
                        <button
                          type="button"
                          onClick={() => toggleNeeded(item.id)}
                          className={`w-20 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1 shrink-0 shadow-2xs ${
                            item.isNeeded
                              ? 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-600/20'
                              : 'bg-slate-100 hover:bg-slate-200 text-slate-600 border border-slate-200'
                          }`}
                          title={item.isNeeded ? 'Remove from shopping list' : 'Mark to buy on shopping list'}
                        >
                          {item.isNeeded ? (
                            <>
                              <Check className="w-3.5 h-3.5 stroke-[3]" />
                              <span>Remove</span>
                            </>
                          ) : (
                            <>
                              <Plus className="w-3.5 h-3.5 text-slate-400" />
                              <span>Buy</span>
                            </>
                          )}
                        </button>
                      </div>
                    )
                  })}
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
