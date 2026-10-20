import React, { useState, useMemo } from 'react'
import {
  Plus,
  Minus,
  Search,
  CheckCircle2,
  Circle,
  Edit2,
  Store,
  ShoppingBag,
  Sparkles,
  ChevronDown,
  ChevronUp,
} from 'lucide-react'
import type { ShoppingItem } from '../types'
import { useShopping } from '../context/ShoppingContext'
import { compareShopPrices, formatPrice, formatUnitPrice } from '../utils/pricing'

interface AddModeViewProps {
  onOpenCreateModal: () => void
  onEditItem: (item: ShoppingItem) => void
  onOpenStoreManager: () => void
}

export const AddModeView: React.FC<AddModeViewProps> = ({
  onOpenCreateModal,
  onEditItem,
  onOpenStoreManager,
}) => {
  const {
    items,
    shops,
    categories,
    toggleNeeded,
    changeItemQuantity,
    quickAddItem,
    addCategory,
  } = useShopping()

  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [activeTab, setActiveTab] = useState<'needed' | 'catalog'>('needed')
  const [quickInput, setQuickInput] = useState('')
  const [expandedItemId, setExpandedItemId] = useState<string | null>(null)

  // New Category State
  const [isAddingCategory, setIsAddingCategory] = useState(false)
  const [newCategoryName, setNewCategoryName] = useState('')

  const neededCount = items.filter((i) => i.isNeeded).length
  const catalogCount = items.length

  const handleQuickAdd = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!quickInput.trim()) return
    const cat = selectedCategory !== 'all' ? selectedCategory : 'Produce'
    await quickAddItem(quickInput.trim(), cat)
    setQuickInput('')
  }

  const handleCreateCategory = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newCategoryName.trim()) return
    await addCategory(newCategoryName.trim())
    setSelectedCategory(newCategoryName.trim())
    setNewCategoryName('')
    setIsAddingCategory(false)
  }

  // Filtered items
  const filteredItems = useMemo(() => {
    return items.filter((item) => {
      // Tab filter
      if (activeTab === 'needed' && !item.isNeeded) return false

      // Search filter
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase()
        const matchesName = item.name.toLowerCase().includes(query)
        const matchesCat = item.category?.toLowerCase().includes(query)
        const matchesNotes = item.notes?.toLowerCase().includes(query)
        if (!matchesName && !matchesCat && !matchesNotes) return false
      }

      // Category filter
      if (selectedCategory !== 'all' && item.category !== selectedCategory) {
        return false
      }

      return true
    })
  }, [items, activeTab, searchQuery, selectedCategory])

  return (
    <div className="pb-28 pt-3 max-w-3xl mx-auto px-3 sm:px-4">
      {/* 1. Header Toolbar */}
      <div className="flex items-center justify-between gap-2 mb-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
            Grocery List
          </h1>
          <p className="text-xs text-slate-500">Quickly pick items and adjust quantities</p>
        </div>

        <div className="flex items-center gap-1.5">
          <button
            onClick={onOpenStoreManager}
            className="px-2.5 py-1.5 rounded-xl border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 text-xs font-semibold flex items-center gap-1.5 transition shadow-xs"
            title="Manage Stores"
          >
            <Store className="w-3.5 h-3.5 text-emerald-600" />
            <span className="hidden sm:inline">Stores</span>
          </button>

          <button
            onClick={onOpenCreateModal}
            className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold flex items-center gap-1 transition shadow-sm"
          >
            <Plus className="w-4 h-4" />
            <span>Full Form</span>
          </button>
        </div>
      </div>

      {/* 2. Quick 1-Tap Add Input */}
      <form onSubmit={handleQuickAdd} className="mb-4">
        <div className="flex items-center gap-2 p-1.5 bg-white border border-slate-300 rounded-2xl shadow-xs focus-within:ring-2 focus-within:ring-emerald-500 focus-within:border-emerald-500 transition">
          <input
            type="text"
            placeholder="Type an item (e.g. Milk, Apples, Eggs) & press enter..."
            value={quickInput}
            onChange={(e) => setQuickInput(e.target.value)}
            className="flex-1 px-3 py-1.5 text-sm bg-transparent border-none outline-none font-medium placeholder:text-slate-400"
          />
          <button
            type="submit"
            disabled={!quickInput.trim()}
            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-40 text-white text-xs font-bold rounded-xl transition flex items-center gap-1 shadow-xs shrink-0"
          >
            <Plus className="w-4 h-4" />
            <span>Add</span>
          </button>
        </div>
      </form>

      {/* 3. Tabs: Needed Now vs All Catalog */}
      <div className="flex items-center justify-between border-b border-slate-200 mb-3 pb-1">
        <div className="flex gap-2">
          <button
            onClick={() => setActiveTab('needed')}
            className={`pb-2 px-3 text-xs sm:text-sm font-bold border-b-2 transition flex items-center gap-1.5 ${
              activeTab === 'needed'
                ? 'border-emerald-600 text-emerald-800'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <span>Need to Buy</span>
            <span
              className={`text-[11px] px-2 py-0.2 rounded-full font-bold ${
                activeTab === 'needed'
                  ? 'bg-emerald-100 text-emerald-800'
                  : 'bg-slate-100 text-slate-600'
              }`}
            >
              {neededCount}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('catalog')}
            className={`pb-2 px-3 text-xs sm:text-sm font-bold border-b-2 transition flex items-center gap-1.5 ${
              activeTab === 'catalog'
                ? 'border-emerald-600 text-emerald-800'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <span>Full Catalog</span>
            <span
              className={`text-[11px] px-2 py-0.2 rounded-full font-bold ${
                activeTab === 'catalog'
                  ? 'bg-emerald-100 text-emerald-800'
                  : 'bg-slate-100 text-slate-600'
              }`}
            >
              {catalogCount}
            </span>
          </button>
        </div>

        <div className="relative w-36 sm:w-48">
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

      {/* 4. Category Filter Pills with + Add Category */}
      <div className="flex gap-1.5 overflow-x-auto pb-2 no-scrollbar text-xs mb-3 items-center">
        <button
          onClick={() => setSelectedCategory('all')}
          className={`px-3 py-1 rounded-full text-xs font-semibold capitalize shrink-0 transition ${
            selectedCategory === 'all'
              ? 'bg-slate-900 text-white'
              : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
          }`}
        >
          All Items
        </button>

        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`px-3 py-1 rounded-full text-xs font-semibold capitalize shrink-0 transition ${
              selectedCategory === cat
                ? 'bg-slate-900 text-white'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            {cat}
          </button>
        ))}

        {isAddingCategory ? (
          <form onSubmit={handleCreateCategory} className="flex items-center gap-1 shrink-0">
            <input
              type="text"
              autoFocus
              placeholder="Category name"
              value={newCategoryName}
              onChange={(e) => setNewCategoryName(e.target.value)}
              className="px-2 py-0.5 text-xs rounded-lg border border-emerald-500 bg-white"
            />
            <button
              type="submit"
              className="px-2 py-0.5 bg-emerald-600 text-white rounded-lg text-xs font-bold"
            >
              Save
            </button>
            <button
              type="button"
              onClick={() => setIsAddingCategory(false)}
              className="text-xs text-slate-400 px-1"
            >
              ✕
            </button>
          </form>
        ) : (
          <button
            onClick={() => setIsAddingCategory(true)}
            className="px-2.5 py-1 rounded-full text-xs font-semibold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 shrink-0 flex items-center gap-1 transition"
          >
            <Plus className="w-3 h-3" />
            <span>Category</span>
          </button>
        )}
      </div>

      {/* 5. Simplified, Compact List View */}
      {filteredItems.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-2xl border border-dashed border-slate-200 p-6">
          <ShoppingBag className="w-10 h-10 text-slate-300 mx-auto mb-2" />
          <h3 className="text-sm font-bold text-slate-800">No items found</h3>
          <p className="text-xs text-slate-500 mt-1 max-w-xs mx-auto">
            {activeTab === 'needed'
              ? 'Your active shopping list is empty! Check items from "Full Catalog" or use the quick add bar above.'
              : 'No items match your filter.'}
          </p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-slate-200 divide-y divide-slate-100 shadow-xs overflow-hidden">
          {filteredItems.map((item) => {
            const priceStats = compareShopPrices(item, '', shops)
            const isExpanded = expandedItemId === item.id

            return (
              <div
                key={item.id}
                className={`transition-colors ${
                  item.isNeeded ? 'bg-emerald-50/20' : 'hover:bg-slate-50/50'
                }`}
              >
                {/* Main Compact Row */}
                <div className="p-3 sm:p-3.5 flex items-center justify-between gap-2.5">
                  {/* Left: Quick Add / Remove Checkbox + Name */}
                  <div className="flex items-center gap-2.5 min-w-0 flex-1">
                    <button
                      onClick={() => toggleNeeded(item.id)}
                      className="text-slate-300 hover:text-emerald-600 transition shrink-0"
                      title={item.isNeeded ? 'Remove from active list' : 'Add to active list'}
                    >
                      {item.isNeeded ? (
                        <CheckCircle2 className="w-6 h-6 text-emerald-600 fill-emerald-50" />
                      ) : (
                        <Circle className="w-6 h-6 text-slate-300 hover:text-emerald-500" />
                      )}
                    </button>

                    <div className="min-w-0 flex-1 cursor-pointer" onClick={() => onEditItem(item)}>
                      <div className="flex items-center gap-2 flex-wrap">
                        <span
                          className={`font-bold text-sm tracking-tight truncate ${
                            item.isNeeded ? 'text-slate-900' : 'text-slate-700'
                          }`}
                        >
                          {item.name}
                        </span>

                        {item.category && (
                          <span className="text-[10px] font-semibold text-slate-500 bg-slate-100 px-1.5 py-0.2 rounded-md">
                            {item.category}
                          </span>
                        )}
                      </div>

                      {/* Best Price Preview chip */}
                      <div className="flex items-center gap-1.5 text-[11px] text-slate-500 mt-0.5">
                        {priceStats.cheapestPrice !== null && priceStats.cheapestShop ? (
                          <span className="text-emerald-700 font-semibold flex items-center gap-1">
                            <Sparkles className="w-3 h-3 text-emerald-600" />
                            From {formatPrice(priceStats.cheapestPrice)} @ {priceStats.cheapestShop.name}
                            {priceStats.cheapestUnitPrice && (
                              <span className="text-slate-400 font-normal">
                                ({formatUnitPrice(priceStats.cheapestUnitPrice, item.shops[priceStats.cheapestShop.id]?.packageUnit)})
                              </span>
                            )}
                          </span>
                        ) : (
                          <span className="text-slate-400 italic">No price recorded</span>
                        )}
                        {item.notes && <span className="text-slate-400 truncate">• {item.notes}</span>}
                      </div>
                    </div>
                  </div>

                  {/* Right: Quantity Stepper & Edit */}
                  <div className="flex items-center gap-2 shrink-0">
                    {/* Stepper (+ and - buttons) */}
                    <div className="flex items-center rounded-xl border border-slate-200 bg-slate-50 overflow-hidden shadow-2xs">
                      <button
                        onClick={() => changeItemQuantity(item.id, -1)}
                        className="w-8 h-8 flex items-center justify-center text-slate-600 hover:bg-slate-200 active:bg-slate-300 transition"
                        title="Decrease quantity"
                      >
                        <Minus className="w-3.5 h-3.5" />
                      </button>

                      <span className="w-7 text-center font-bold text-xs text-slate-800">
                        {item.quantity}
                      </span>

                      <button
                        onClick={() => changeItemQuantity(item.id, 1)}
                        className="w-8 h-8 flex items-center justify-center text-emerald-700 hover:bg-emerald-100 active:bg-emerald-200 transition"
                        title="Increase quantity"
                      >
                        <Plus className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <button
                      onClick={() => setExpandedItemId(isExpanded ? null : item.id)}
                      className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100 transition"
                      title={isExpanded ? 'Hide store details' : 'View store details'}
                    >
                      {isExpanded ? (
                        <ChevronUp className="w-4 h-4" />
                      ) : (
                        <ChevronDown className="w-4 h-4" />
                      )}
                    </button>

                    <button
                      onClick={() => onEditItem(item)}
                      className="p-1.5 text-slate-400 hover:text-emerald-700 rounded-lg hover:bg-emerald-50 transition"
                      title="Edit item details"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Optional Expanded Store Details */}
                {isExpanded && (
                  <div className="px-3.5 pb-3 pt-1 bg-slate-50/70 border-t border-slate-100 text-xs">
                    <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                      Store Availability & Locations
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                      {shops.map((s) => {
                        const detail = item.shops[s.id]
                        const isCarried = detail?.available ?? true
                        return (
                          <div
                            key={s.id}
                            className={`p-2 rounded-xl border text-[11px] ${
                              !isCarried
                                ? 'bg-slate-100/50 border-slate-200/50 opacity-50'
                                : 'bg-white border-slate-200'
                            }`}
                          >
                            <div className="font-bold text-slate-800 truncate">{s.name}</div>
                            {isCarried ? (
                              <>
                                <div className="text-emerald-700 font-mono font-bold mt-0.5">
                                  {formatPrice(detail?.price)}
                                </div>
                                <div className="text-slate-500 text-[10px] truncate mt-0.5">
                                  {detail?.location || 'No aisle'}
                                </div>
                              </>
                            ) : (
                              <div className="text-rose-600 font-semibold mt-0.5">Not carried</div>
                            )}
                          </div>
                        )
                      })}
                    </div>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
