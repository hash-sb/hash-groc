import React, { useState, useMemo } from 'react'
import {
  Plus,
  Minus,
  Check,
  Search,
  ShoppingBag,
  Edit2,
  CheckCheck,
} from 'lucide-react'
import type { ShoppingItem } from '../types'
import { useShopping } from '../context/ShoppingContext'

const COMMON_UNITS = [
  'items',
  'bags',
  'lbs',
  'oz',
  'gal',
  'cartons',
  'cans',
  'boxes',
  'packs',
  'jars',
  'bottles',
]

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
  } = useShopping()

  const [searchQuery, setSearchQuery] = useState('')
  const [activeTab, setActiveTab] = useState<'all' | 'needed'>('all')
  const [quickInput, setQuickInput] = useState('')
  const [quickCategory, setQuickCategory] = useState<string>(categories[0] || 'Produce')
  const [quickQuantity, setQuickQuantity] = useState<number>(1)
  const [quickUnit, setQuickUnit] = useState<string>('items')
  const [putUncheckedAtBottom, setPutUncheckedAtBottom] = useState<boolean>(true)
  const [isEditMode, setIsEditMode] = useState<boolean>(false)

  const neededCount = items.filter((i) => i.isNeeded).length
  const totalCount = items.length

  const handleQuickAdd = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!quickInput.trim()) return
    await quickAddItem(quickInput.trim(), quickCategory, quickQuantity, quickUnit)
    setQuickInput('')
    setQuickQuantity(1)
  }

  // Filter items based on activeTab and search query
  const filteredItems = useMemo(() => {
    return items.filter((item) => {
      if (activeTab === 'needed' && !item.isNeeded) return false

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

      {/* 2. View Controls & EDIT MODE TOGGLE BUTTON */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5 mb-3">
        {/* Left: View Tabs (All Items vs Need to Buy) */}
        <div className="flex items-center gap-2">
          <div className="flex bg-slate-200/80 p-1 rounded-xl shrink-0">
            <button
              onClick={() => setActiveTab('all')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${
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
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${
                activeTab === 'needed'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <span>Need to Buy</span>
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
          </div>

          {/* EDIT MODE TOGGLE BUTTON (Requested) */}
          <button
            type="button"
            onClick={() => setIsEditMode(!isEditMode)}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-2xs ${
              isEditMode
                ? 'bg-amber-500 hover:bg-amber-600 text-white ring-2 ring-amber-300'
                : 'bg-white hover:bg-slate-100 text-slate-700 border border-slate-200'
            }`}
            title="Toggle Edit Mode to configure prices, stores & aisles"
          >
            {isEditMode ? (
              <>
                <CheckCheck className="w-3.5 h-3.5" />
                <span>Done Editing</span>
              </>
            ) : (
              <>
                <Edit2 className="w-3.5 h-3.5 text-amber-600" />
                <span>Edit Items</span>
              </>
            )}
          </button>
        </div>

        {/* Right: Search & Unchecked at bottom toggle */}
        <div className="flex items-center gap-2 justify-between sm:justify-end">
          {activeTab === 'all' && (
            <label className="flex items-center gap-1.5 text-[11px] text-slate-600 font-medium cursor-pointer select-none">
              <input
                type="checkbox"
                checked={putUncheckedAtBottom}
                onChange={(e) => setPutUncheckedAtBottom(e.target.checked)}
                className="w-3.5 h-3.5 rounded text-emerald-600 focus:ring-emerald-500 accent-emerald-600"
              />
              <span>Unchecked at bottom</span>
            </label>
          )}

          <div className="relative w-36 sm:w-40">
            <Search className="w-3.5 h-3.5 absolute left-2.5 top-2 text-slate-400" />
            <input
              type="text"
              placeholder="Search..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-8 pr-2 py-1 rounded-xl border border-slate-200 bg-white text-xs focus:outline-none focus:ring-1 focus:ring-emerald-500"
            />
          </div>
        </div>
      </div>

      {/* Edit Mode Active Banner */}
      {isEditMode && (
        <div className="mb-4 p-2.5 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-900 flex items-center justify-between animate-in fade-in">
          <div className="flex items-center gap-1.5">
            <Edit2 className="w-3.5 h-3.5 text-amber-600 shrink-0" />
            <span>
              <strong>Edit Mode is ON:</strong> Tap <strong>Edit</strong> on any item to set store prices, aisle locations, or package sizes.
            </span>
          </div>
          <button
            onClick={() => setIsEditMode(false)}
            className="text-[11px] font-bold text-amber-700 underline shrink-0 ml-2"
          >
            Done
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
              : 'No items match your search'}
          </h3>
          <p className="text-xs text-slate-500 mt-1 max-w-xs mx-auto">
            {activeTab === 'needed'
              ? 'Switch to "All Items" above to pick items from your catalog, or add a new item.'
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
                        {/* Left: Item Name & Unit (Clickable to edit if in Edit Mode) */}
                        <div
                          className={`min-w-0 flex-1 ${
                            isEditMode ? 'cursor-pointer group' : ''
                          }`}
                          onClick={() => {
                            if (isEditMode) onEditItem(item)
                          }}
                        >
                          <div className="flex items-center gap-2">
                            <span
                              className={`text-sm tracking-tight block truncate ${
                                item.isNeeded
                                  ? 'font-bold text-slate-900'
                                  : 'font-medium text-slate-600'
                              } ${isEditMode ? 'group-hover:text-amber-700 underline decoration-amber-300' : ''}`}
                            >
                              {item.name}
                            </span>

                            {/* Edit pill if in edit mode */}
                            {isEditMode && (
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation()
                                  onEditItem(item)
                                }}
                                className="px-2 py-0.5 rounded-lg bg-amber-100 hover:bg-amber-200 text-amber-900 text-[10px] font-bold flex items-center gap-1 transition shrink-0 shadow-2xs"
                                title="Edit prices & aisles"
                              >
                                <Edit2 className="w-2.5 h-2.5" />
                                <span>Edit</span>
                              </button>
                            )}
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

                        {/* Right: "Need to buy" Toggle Button */}
                        <button
                          type="button"
                          onClick={() => toggleNeeded(item.id)}
                          className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 shrink-0 shadow-2xs ${
                            item.isNeeded
                              ? 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-600/20'
                              : 'bg-slate-100 hover:bg-slate-200 text-slate-600 border border-slate-200'
                          }`}
                        >
                          {item.isNeeded ? (
                            <>
                              <Check className="w-3.5 h-3.5 stroke-[3]" />
                              <span>Need to Buy</span>
                            </>
                          ) : (
                            <>
                              <Plus className="w-3.5 h-3.5 text-slate-400" />
                              <span>Need to Buy</span>
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
