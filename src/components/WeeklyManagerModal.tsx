import React, { useState, useMemo } from 'react'
import {
  X,
  Search,
  Check,
  Repeat,
  Sparkles,
  ShoppingBag,
  Trash2,
  CheckSquare,
  Square,
} from 'lucide-react'
import { useShopping } from '../context/ShoppingContext'

interface WeeklyManagerModalProps {
  isOpen: boolean
  onClose: () => void
}

export const WeeklyManagerModal: React.FC<WeeklyManagerModalProps> = ({
  isOpen,
  onClose,
}) => {
  const {
    items,
    categories,
    toggleWeeklyItem,
    saveCurrentNeededAsWeekly,
    bulkSetWeekly,
    clearAllWeekly,
    selectWeeklyItems,
  } = useShopping()

  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<string>('All')
  const [filterMode, setFilterMode] = useState<'all' | 'weekly_only' | 'non_weekly'>('all')
  const [feedbackMsg, setFeedbackMsg] = useState<string | null>(null)

  const neededCount = items.filter((i) => i.isNeeded).length
  const weeklyCount = items.filter((i) => i.isWeekly).length
  const totalCount = items.length

  const filteredItems = useMemo(() => {
    return items.filter((item) => {
      // Filter by category
      if (selectedCategory !== 'All' && item.category !== selectedCategory) {
        return false
      }

      // Filter by weekly status
      if (filterMode === 'weekly_only' && !item.isWeekly) return false
      if (filterMode === 'non_weekly' && item.isWeekly) return false

      // Filter by search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase()
        return (
          item.name.toLowerCase().includes(q) ||
          item.category?.toLowerCase().includes(q)
        )
      }

      return true
    })
  }, [items, selectedCategory, filterMode, searchQuery])

  // Count weekly items in the current filtered view
  const weeklyInViewCount = filteredItems.filter((i) => i.isWeekly).length
  const allInViewAreWeekly =
    filteredItems.length > 0 && weeklyInViewCount === filteredItems.length

  const showFeedback = (msg: string) => {
    setFeedbackMsg(msg)
    setTimeout(() => setFeedbackMsg(null), 3000)
  }

  const handleUseCurrentToBuy = async () => {
    if (neededCount === 0) {
      showFeedback('Your "To Buy" list is currently empty!')
      return
    }
    const count = await saveCurrentNeededAsWeekly(false)
    showFeedback(`Saved ${neededCount} active items as weekly staples (Total: ${count})!`)
  }

  const handleToggleSelectAllInView = async () => {
    const itemIds = filteredItems.map((i) => i.id)
    if (itemIds.length === 0) return

    if (allInViewAreWeekly) {
      // Unmark all in view
      await bulkSetWeekly(itemIds, false)
      showFeedback(`Unmarked ${itemIds.length} items from weekly staples`)
    } else {
      // Mark all in view
      await bulkSetWeekly(itemIds, true)
      showFeedback(`Marked ${itemIds.length} items as weekly staples!`)
    }
  }

  const handleClearAll = async () => {
    if (
      window.confirm(
        `Are you sure you want to remove weekly staple status from all ${weeklyCount} items?`
      )
    ) {
      await clearAllWeekly()
      showFeedback('Cleared all weekly staples.')
    }
  }

  const handleSelectWeeklyAndShop = async () => {
    await selectWeeklyItems(false)
    onClose()
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/50 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl w-full max-w-2xl max-h-[90vh] shadow-2xl flex flex-col overflow-hidden border border-slate-200">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-200 bg-gradient-to-r from-teal-50 via-emerald-50 to-teal-50 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-teal-600 text-white flex items-center justify-center shadow-xs">
              <Repeat className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-extrabold text-slate-900">
                  Manage Weekly Staples
                </h2>
                <span className="text-xs bg-teal-600 text-white px-2 py-0.5 rounded-full font-bold">
                  {weeklyCount} / {totalCount}
                </span>
              </div>
              <p className="text-xs text-slate-500">
                Tap any item to quickly toggle it as a recurring weekly staple
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

        {/* Feedback Message Banner */}
        {feedbackMsg && (
          <div className="bg-teal-600 text-white text-xs font-bold px-4 py-2 flex items-center justify-between shrink-0 animate-in fade-in">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4" />
              <span>{feedbackMsg}</span>
            </div>
            <button
              onClick={() => setFeedbackMsg(null)}
              className="text-teal-200 hover:text-white"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        {/* 1-Click Fast Action Bar */}
        <div className="p-3 bg-slate-50 border-b border-slate-200 flex flex-wrap items-center justify-between gap-2 shrink-0">
          <div className="flex flex-wrap items-center gap-2">
            {/* Quick Button: Copy To Buy list to weekly staples */}
            <button
              type="button"
              onClick={handleUseCurrentToBuy}
              disabled={neededCount === 0}
              className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-40 text-white text-xs font-bold rounded-xl transition flex items-center gap-1.5 shadow-2xs cursor-pointer active:scale-95"
              title="Save every item currently on your 'To Buy' list as a weekly staple"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Set Current "To Buy" as Weekly</span>
              <span className="text-[10px] bg-white/25 px-1.5 py-0.2 rounded-full font-bold">
                {neededCount}
              </span>
            </button>

            {/* Toggle all currently filtered items */}
            {filteredItems.length > 0 && (
              <button
                type="button"
                onClick={handleToggleSelectAllInView}
                className="px-2.5 py-1.5 bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 text-xs font-bold rounded-xl transition flex items-center gap-1.5 shadow-2xs cursor-pointer"
                title={allInViewAreWeekly ? 'Unmark all in view' : 'Mark all in view as weekly'}
              >
                {allInViewAreWeekly ? (
                  <>
                    <CheckSquare className="w-3.5 h-3.5 text-teal-600" />
                    <span>Unmark View ({filteredItems.length})</span>
                  </>
                ) : (
                  <>
                    <Square className="w-3.5 h-3.5 text-slate-400" />
                    <span>Select View ({filteredItems.length})</span>
                  </>
                )}
              </button>
            )}
          </div>

          {weeklyCount > 0 && (
            <button
              type="button"
              onClick={handleClearAll}
              className="px-2.5 py-1.5 text-rose-600 hover:bg-rose-50 text-xs font-semibold rounded-xl transition flex items-center gap-1 cursor-pointer"
              title="Remove weekly tag from all items"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Clear All</span>
            </button>
          )}
        </div>

        {/* Search & Filter Controls */}
        <div className="p-3 border-b border-slate-200 bg-white space-y-2 shrink-0">
          <div className="flex items-center gap-2">
            <div className="relative flex-1">
              <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
              <input
                type="text"
                placeholder="Quick search items (e.g. Milk, Eggs, Bread)..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm font-medium focus:outline-none focus:ring-2 focus:ring-teal-500"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2.5 top-2.5 text-slate-400 hover:text-slate-600"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Filter Toggle (All vs Weekly vs Non-Weekly) */}
            <div className="flex bg-slate-100 p-0.5 rounded-xl border border-slate-200 text-xs font-bold shrink-0">
              <button
                type="button"
                onClick={() => setFilterMode('all')}
                className={`px-2.5 py-1 rounded-lg transition cursor-pointer ${
                  filterMode === 'all'
                    ? 'bg-white text-slate-900 shadow-2xs'
                    : 'text-slate-500 hover:text-slate-900'
                }`}
              >
                All
              </button>
              <button
                type="button"
                onClick={() => setFilterMode('weekly_only')}
                className={`px-2.5 py-1 rounded-lg transition cursor-pointer ${
                  filterMode === 'weekly_only'
                    ? 'bg-teal-600 text-white shadow-2xs'
                    : 'text-slate-500 hover:text-slate-900'
                }`}
              >
                Weekly ({weeklyCount})
              </button>
              <button
                type="button"
                onClick={() => setFilterMode('non_weekly')}
                className={`px-2.5 py-1 rounded-lg transition cursor-pointer ${
                  filterMode === 'non_weekly'
                    ? 'bg-white text-slate-900 shadow-2xs'
                    : 'text-slate-500 hover:text-slate-900'
                }`}
              >
                Other
              </button>
            </div>
          </div>

          {/* Category Filter Pills (Scrollable horizontally) */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none text-xs">
            <button
              type="button"
              onClick={() => setSelectedCategory('All')}
              className={`px-2.5 py-1 rounded-full font-bold whitespace-nowrap transition cursor-pointer ${
                selectedCategory === 'All'
                  ? 'bg-slate-900 text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              All Categories
            </button>
            {categories.map((cat) => {
              const catWeeklyCount = items.filter(
                (i) => i.category === cat && i.isWeekly
              ).length
              return (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-2.5 py-1 rounded-full font-semibold whitespace-nowrap transition flex items-center gap-1 cursor-pointer ${
                    selectedCategory === cat
                      ? 'bg-teal-700 text-white font-bold'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  <span>{cat}</span>
                  {catWeeklyCount > 0 && (
                    <span
                      className={`text-[10px] px-1 rounded-full font-bold ${
                        selectedCategory === cat
                          ? 'bg-white/30 text-white'
                          : 'bg-teal-100 text-teal-800'
                      }`}
                    >
                      {catWeeklyCount}
                    </span>
                  )}
                </button>
              )
            })}
          </div>
        </div>

        {/* Items Checklist (Fast 1-Tap Toggle) */}
        <div className="flex-1 overflow-y-auto p-3 sm:p-4 divide-y divide-slate-100">
          {filteredItems.length === 0 ? (
            <div className="text-center py-12 text-slate-400">
              <ShoppingBag className="w-8 h-8 mx-auto mb-2 opacity-40" />
              <p className="text-xs font-semibold">No items match your filter</p>
            </div>
          ) : (
            filteredItems.map((item) => {
              const isW = !!item.isWeekly
              return (
                <div
                  key={item.id}
                  onClick={() => toggleWeeklyItem(item.id)}
                  className={`py-2.5 px-3 rounded-2xl flex items-center justify-between gap-3 transition-colors cursor-pointer select-none mb-1 ${
                    isW
                      ? 'bg-teal-50/70 hover:bg-teal-100/70 border border-teal-200/80 shadow-2xs'
                      : 'hover:bg-slate-50 border border-transparent'
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0 flex-1">
                    {/* Checkbox Icon */}
                    <div
                      className={`w-5 h-5 rounded-lg flex items-center justify-center shrink-0 transition-colors ${
                        isW
                          ? 'bg-teal-600 text-white shadow-xs'
                          : 'border-2 border-slate-300 bg-white'
                      }`}
                    >
                      {isW && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                    </div>

                    {/* Item Details */}
                    <div className="min-w-0">
                      <div
                        className={`text-sm truncate ${
                          isW ? 'font-bold text-teal-950' : 'font-medium text-slate-800'
                        }`}
                      >
                        {item.name}
                      </div>
                      <div className="text-[11px] text-slate-400 flex items-center gap-1.5">
                        <span>{item.category || 'Other'}</span>
                        <span>•</span>
                        <span>
                          {item.quantity} {item.unit}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Status Tag */}
                  <div className="shrink-0">
                    {isW ? (
                      <span className="text-[10px] font-extrabold bg-teal-600 text-white px-2 py-0.5 rounded-full flex items-center gap-1">
                        <Repeat className="w-2.5 h-2.5" />
                        <span>Weekly</span>
                      </span>
                    ) : (
                      <span className="text-[10px] font-semibold text-slate-400 px-2 py-0.5 rounded-full hover:bg-slate-200">
                        + Add
                      </span>
                    )}
                  </div>
                </div>
              )
            })
          )}
        </div>

        {/* Footer */}
        <div className="p-3 sm:p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between gap-3 shrink-0">
          <div className="text-xs text-slate-600 font-semibold">
            <span className="text-teal-700 font-bold">{weeklyCount}</span> weekly staples selected
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleSelectWeeklyAndShop}
              className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl transition flex items-center gap-1.5 shadow-xs cursor-pointer active:scale-95"
              title="Select all weekly staples and view To Buy list"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Select For Trip</span>
            </button>

            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl transition shadow-xs cursor-pointer"
            >
              Done
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
