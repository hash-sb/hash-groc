import React, { useState, useMemo } from 'react'
import {
  BarChart3,
  Search,
  Scale,
  MapPin,
  Trophy,
  Share2,
  Check,
  Edit2,
} from 'lucide-react'
import { useShopping } from '../context/ShoppingContext'
import type { ShoppingItem } from '../types'
import {
  compareShopPrices,
  formatPrice,
  formatUnitPrice,
  isCheapestAtStore,
} from '../utils/pricing'

interface AnalysisModeViewProps {
  onEditItem: (item: ShoppingItem) => void
}

export const AnalysisModeView: React.FC<AnalysisModeViewProps> = ({ onEditItem }) => {
  const { items, shops, categories } = useShopping()

  const [activeTab, setActiveTab] = useState<'needed' | 'catalog'>('needed')
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [copiedShare, setCopiedShare] = useState(false)

  // Filtered items for matrix
  const matrixItems = useMemo(() => {
    return items.filter((item) => {
      if (activeTab === 'needed' && !item.isNeeded) return false

      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase()
        if (
          !item.name.toLowerCase().includes(q) &&
          !item.category?.toLowerCase().includes(q) &&
          !item.notes?.toLowerCase().includes(q)
        ) {
          return false
        }
      }

      if (selectedCategory !== 'all' && item.category !== selectedCategory) {
        return false
      }

      return true
    })
  }, [items, activeTab, searchQuery, selectedCategory])

  // Total Basket Calculations
  const basketStats = useMemo(() => {
    // Single store totals for the filtered items
    const storeTotals: Record<string, { total: number; itemCount: number }> = {}
    shops.forEach((s) => {
      storeTotals[s.id] = { total: 0, itemCount: 0 }
    })

    let optimalTotal = 0
    let optimalCount = 0

    matrixItems.forEach((item) => {
      const comp = compareShopPrices(item, '', shops)
      const qty = item.quantity || 1

      // Add to optimal basket
      if (comp.cheapestPrice !== null && comp.cheapestPrice > 0) {
        optimalTotal += comp.cheapestPrice * qty
        optimalCount++
      }

      // Add to each individual store basket
      shops.forEach((shop) => {
        const detail = item.shops[shop.id]
        if (detail && detail.available && typeof detail.price === 'number' && detail.price > 0) {
          storeTotals[shop.id].total += detail.price * qty
          storeTotals[shop.id].itemCount++
        }
      })
    })

    return { storeTotals, optimalTotal, optimalCount }
  }, [matrixItems, shops])

  // Quick WhatsApp / Text Summary Share (Requirement 9)
  const handleShareSummary = () => {
    let text = `🛒 *Family Grocery Price Matrix & Plan*\n`
    text += `Items: ${matrixItems.length}\n`
    text += `Optimal Multi-Store Total: ${formatPrice(basketStats.optimalTotal)}\n\n`

    shops.forEach((s) => {
      const cheapestAtThisStore = matrixItems.filter((i) => isCheapestAtStore(i, s.id, shops))
      if (cheapestAtThisStore.length > 0) {
        text += `*${s.name} (${cheapestAtThisStore.length} best deals):*\n`
        cheapestAtThisStore.forEach((i) => {
          const p = i.shops[s.id]?.price
          text += ` • ${i.name} (${i.quantity} ${i.unit}) - ${formatPrice(p)}\n`
        })
        text += `\n`
      }
    })

    navigator.clipboard.writeText(text)
    setCopiedShare(true)
    setTimeout(() => setCopiedShare(false), 2000)
  }

  return (
    <div className="pb-28 pt-3 max-w-7xl mx-auto px-3 sm:px-6">
      {/* 1. Header Toolbar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 mb-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-indigo-100 text-indigo-700">
              <BarChart3 className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                Store Price Matrix
              </h1>
              <p className="text-xs text-slate-500">
                Compare prices side-by-side across all stores with normalized sizes
              </p>
            </div>
          </div>
        </div>

        <button
          onClick={handleShareSummary}
          className="px-3.5 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition shadow-sm"
        >
          {copiedShare ? (
            <>
              <Check className="w-4 h-4 text-emerald-400" />
              <span>Summary Copied!</span>
            </>
          ) : (
            <>
              <Share2 className="w-4 h-4" />
              <span>Copy Family Trip Summary</span>
            </>
          )}
        </button>
      </div>

      {/* 2. Basket Cost Breakdown Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5 mb-5">
        {/* Optimal Smart Split Basket */}
        <div className="col-span-2 sm:col-span-1 p-3.5 rounded-2xl bg-gradient-to-br from-emerald-600 to-teal-700 text-white shadow-md flex flex-col justify-between">
          <div>
            <div className="text-[10px] font-extrabold uppercase tracking-wider text-emerald-200 flex items-center gap-1">
              <Trophy className="w-3.5 h-3.5 text-yellow-300" />
              <span>Optimal Split Trip</span>
            </div>
            <div className="text-2xl font-black mt-1">
              {formatPrice(basketStats.optimalTotal)}
            </div>
          </div>
          <div className="text-[11px] text-emerald-100 mt-2">
            Cheapest store per item ({basketStats.optimalCount} items)
          </div>
        </div>

        {/* Each Individual Store Basket */}
        {shops.map((shop) => {
          const data = basketStats.storeTotals[shop.id] || { total: 0, itemCount: 0 }
          const diffFromOptimal = data.total > 0 ? data.total - basketStats.optimalTotal : 0

          return (
            <div
              key={shop.id}
              className="p-3.5 rounded-2xl bg-white border border-slate-200 shadow-xs flex flex-col justify-between"
            >
              <div>
                <div className="text-xs font-bold text-slate-800 truncate flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-600 shrink-0" />
                  <span className="truncate">{shop.name}</span>
                </div>
                <div className="text-xl font-extrabold text-slate-900 mt-1">
                  {formatPrice(data.total)}
                </div>
              </div>

              <div className="text-[11px] text-slate-500 mt-2">
                <span>{data.itemCount} of {matrixItems.length} carried</span>
                {diffFromOptimal > 0.05 && (
                  <div className="text-amber-700 font-semibold text-[10px] mt-0.5">
                    +${diffFromOptimal.toFixed(2)} vs optimal
                  </div>
                )}
              </div>
            </div>
          )
        })}
      </div>

      {/* 3. Filters: Tab (Needed vs All), Categories & Search */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5 mb-4">
        {/* Tab switch */}
        <div className="flex bg-slate-100 p-1 rounded-xl border border-slate-200">
          <button
            onClick={() => setActiveTab('needed')}
            className={`px-3 py-1 rounded-lg text-xs font-bold transition ${
              activeTab === 'needed' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600'
            }`}
          >
            Needed to Buy ({items.filter((i) => i.isNeeded).length})
          </button>
          <button
            onClick={() => setActiveTab('catalog')}
            className={`px-3 py-1 rounded-lg text-xs font-bold transition ${
              activeTab === 'catalog' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600'
            }`}
          >
            All Catalog ({items.length})
          </button>
        </div>

        {/* Category & Search */}
        <div className="flex gap-2">
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-3 py-1.5 rounded-xl border border-slate-200 bg-white text-xs font-semibold text-slate-700 focus:outline-none focus:ring-1 focus:ring-emerald-500"
          >
            <option value="all">All Categories</option>
            {categories.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>

          <div className="relative w-44 sm:w-56">
            <Search className="w-3.5 h-3.5 absolute left-2.5 top-2.5 text-slate-400" />
            <input
              type="text"
              placeholder="Search matrix..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 rounded-xl border border-slate-200 bg-white text-xs focus:outline-none focus:ring-1 focus:ring-emerald-500"
            />
          </div>
        </div>
      </div>

      {/* 4. The Price Comparison Grid / Matrix (Requirement 8) */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-left text-xs">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-700">
                <th className="py-3 px-4 font-bold text-slate-900 sticky left-0 bg-slate-50 z-10 min-w-[200px]">
                  Product / Item
                </th>
                {shops.map((shop) => (
                  <th key={shop.id} className="py-3 px-4 font-bold text-slate-900 min-w-[150px]">
                    <div className="flex items-center gap-1.5">
                      <span className="w-2.5 h-2.5 rounded-full bg-emerald-600 shrink-0" />
                      <span>{shop.name}</span>
                    </div>
                  </th>
                ))}
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100">
              {matrixItems.length === 0 ? (
                <tr>
                  <td colSpan={shops.length + 1} className="py-12 text-center text-slate-400">
                    No items match the selected filter.
                  </td>
                </tr>
              ) : (
                matrixItems.map((item) => {
                  return (
                    <tr key={item.id} className="hover:bg-slate-50/50 transition">
                      {/* Sticky Left Column: Product Info */}
                      <td className="py-3 px-4 sticky left-0 bg-white hover:bg-slate-50/50 z-10 border-r border-slate-100">
                        <div className="flex items-start justify-between gap-1.5">
                          <div className="min-w-0">
                            <div className="font-bold text-slate-900 text-xs sm:text-sm">
                              {item.name}
                            </div>
                            <div className="flex items-center gap-1.5 mt-0.5 text-[11px] text-slate-500">
                              <span className="font-semibold">
                                {item.quantity} {item.unit}
                              </span>
                              <span>•</span>
                              <span>{item.category}</span>
                            </div>
                          </div>
                          <button
                            onClick={() => onEditItem(item)}
                            className="p-1 text-slate-400 hover:text-emerald-700 rounded transition shrink-0"
                            title="Edit Item"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>

                      {/* Store Price Cells */}
                      {shops.map((shop) => {
                        const detail = item.shops[shop.id]
                        const isCarried = detail?.available ?? true
                        const price = detail?.price ?? null
                        const unitPrice = detail?.unitPrice ?? null
                        const isCheapest =
                          isCarried &&
                          price !== null &&
                          price > 0 &&
                          isCheapestAtStore(item, shop.id, shops)

                        return (
                          <td
                            key={shop.id}
                            className={`py-3 px-4 align-top transition-colors ${
                              !isCarried
                                ? 'bg-slate-50/60 opacity-50'
                                : isCheapest
                                ? 'bg-emerald-50/70 border-x border-emerald-200'
                                : ''
                            }`}
                          >
                            {isCarried ? (
                              price !== null && price > 0 ? (
                                <div className="space-y-0.5">
                                  <div className="flex items-center gap-1.5">
                                    <span
                                      className={`text-sm font-black font-mono ${
                                        isCheapest ? 'text-emerald-800' : 'text-slate-800'
                                      }`}
                                    >
                                      {formatPrice(price)}
                                    </span>

                                    {/* Cheapest Price Highlight Badge */}
                                    {isCheapest && (
                                      <span className="inline-flex items-center gap-0.5 px-1.5 py-0.2 rounded text-[10px] font-black bg-emerald-600 text-white shadow-2xs">
                                        <Trophy className="w-2.5 h-2.5" />
                                        <span>Best</span>
                                      </span>
                                    )}
                                  </div>

                                  {/* Normalized Unit Price if present */}
                                  {unitPrice && (
                                    <div className="text-[10px] text-indigo-700 font-mono font-medium flex items-center gap-0.5">
                                      <Scale className="w-2.5 h-2.5" />
                                      <span>{formatUnitPrice(unitPrice, detail.packageUnit)}</span>
                                    </div>
                                  )}

                                  {/* Location / Aisle */}
                                  {detail.location && (
                                    <div className="text-[10px] text-slate-500 truncate flex items-center gap-1 mt-1">
                                      <MapPin className="w-2.5 h-2.5 text-slate-400 shrink-0" />
                                      <span className="truncate">{detail.location}</span>
                                    </div>
                                  )}
                                </div>
                              ) : (
                                <button
                                  onClick={() => onEditItem(item)}
                                  className="text-slate-400 hover:text-emerald-700 italic text-[11px] underline"
                                >
                                  + Add price
                                </button>
                              )
                            ) : (
                              <div className="text-slate-400 text-[11px] line-through">
                                Not carried
                              </div>
                            )}
                          </td>
                        )
                      })}
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
