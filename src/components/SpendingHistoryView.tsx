import React, { useState, useMemo } from 'react'
import {
  DollarSign,
  Download,
  Calendar,
  Store,
  Tag,
  ChevronDown,
  ChevronUp,
  Trash2,
  ShoppingBag,
  TrendingDown,
  CheckCircle2,
} from 'lucide-react'
import { useShopping } from '../context/ShoppingContext'
import { formatPrice } from '../utils/pricing'

export const SpendingHistoryView: React.FC = () => {
  const { receipts, deleteReceipt, clearAllReceipts } = useShopping()
  const [selectedPeriod, setSelectedPeriod] = useState<'all' | 'month' | '30days' | '90days'>('all')
  const [expandedReceiptId, setExpandedReceiptId] = useState<string | null>(null)
  const [downloadSuccess, setDownloadSuccess] = useState(false)

  // Filter receipts based on selected period
  const filteredReceipts = useMemo(() => {
    const now = Date.now()
    const oneDay = 24 * 60 * 60 * 1000

    return receipts.filter((receipt) => {
      if (selectedPeriod === 'all') return true

      if (selectedPeriod === 'month') {
        const receiptDate = new Date(receipt.timestamp)
        const nowDate = new Date(now)
        return (
          receiptDate.getMonth() === nowDate.getMonth() &&
          receiptDate.getFullYear() === nowDate.getFullYear()
        )
      }

      if (selectedPeriod === '30days') {
        return now - receipt.timestamp <= 30 * oneDay
      }

      if (selectedPeriod === '90days') {
        return now - receipt.timestamp <= 90 * oneDay
      }

      return true
    })
  }, [receipts, selectedPeriod])

  // Summary Metrics
  const summary = useMemo(() => {
    let totalSpend = 0
    let totalSavings = 0
    let totalItems = 0

    filteredReceipts.forEach((r) => {
      totalSpend += r.totalAmount
      totalSavings += r.totalSavings || 0
      totalItems += r.itemsCount
    })

    const avgPerTrip = filteredReceipts.length > 0 ? totalSpend / filteredReceipts.length : 0

    return { totalSpend, totalSavings, totalItems, avgPerTrip }
  }, [filteredReceipts])

  // Store Breakdown
  const storeBreakdown = useMemo(() => {
    const storeMap: Record<
      string,
      { name: string; color?: string; total: number; count: number }
    > = {}

    filteredReceipts.forEach((r) => {
      if (!storeMap[r.shopId]) {
        storeMap[r.shopId] = {
          name: r.shopName,
          color: r.shopColor,
          total: 0,
          count: 0,
        }
      }
      storeMap[r.shopId].total += r.totalAmount
      storeMap[r.shopId].count += 1
    })

    const list = Object.values(storeMap)
    list.sort((a, b) => b.total - a.total)
    return list
  }, [filteredReceipts])

  // Category Breakdown
  const categoryBreakdown = useMemo(() => {
    const catMap: Record<string, { total: number; count: number }> = {}

    filteredReceipts.forEach((r) => {
      r.items.forEach((item) => {
        const cat = item.category || 'Other'
        if (!catMap[cat]) {
          catMap[cat] = { total: 0, count: 0 }
        }
        catMap[cat].total += item.totalPrice
        catMap[cat].count += 1
      })
    })

    const list = Object.entries(catMap).map(([name, data]) => ({
      name,
      total: data.total,
      count: data.count,
    }))
    list.sort((a, b) => b.total - a.total)
    return list
  }, [filteredReceipts])

  // Monthly Spending Timeline
  const monthlyTimeline = useMemo(() => {
    const monthsMap: Record<string, { label: string; total: number; timestamp: number }> = {}

    receipts.forEach((r) => {
      const d = new Date(r.timestamp)
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
      const label = d.toLocaleDateString(undefined, { month: 'short', year: '2-digit' })

      if (!monthsMap[key]) {
        monthsMap[key] = { label, total: 0, timestamp: new Date(d.getFullYear(), d.getMonth(), 1).getTime() }
      }
      monthsMap[key].total += r.totalAmount
    })

    const list = Object.values(monthsMap)
    list.sort((a, b) => a.timestamp - b.timestamp)
    // take last 6 months
    const recent = list.slice(-6)
    const maxVal = Math.max(...recent.map((m) => m.total), 1)

    return { months: recent, maxVal }
  }, [receipts])

  // CSV Export Handler
  const handleExportCSV = () => {
    if (filteredReceipts.length === 0) return

    const rows: string[] = []
    rows.push('Receipt_ID,Date,Time,Store,Item_Name,Category,Quantity,Unit,Packs_Bought,Pack_Price,Line_Total')

    filteredReceipts.forEach((r) => {
      const d = new Date(r.timestamp)
      const dateStr = d.toLocaleDateString()
      const timeStr = d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })

      r.items.forEach((item) => {
        const cleanName = `"${item.name.replace(/"/g, '""')}"`
        const cleanCat = `"${(item.category || 'Other').replace(/"/g, '""')}"`
        const cleanStore = `"${r.shopName.replace(/"/g, '""')}"`

        rows.push(
          `${r.id},${dateStr},${timeStr},${cleanStore},${cleanName},${cleanCat},${item.quantity},${item.unit},${item.packs},${item.price.toFixed(2)},${item.totalPrice.toFixed(2)}`
        )
      })
    })

    const csvContent = 'data:text/csv;charset=utf-8,' + encodeURIComponent(rows.join('\n'))
    const link = document.createElement('a')
    link.setAttribute('href', csvContent)
    const dateTag = new Date().toISOString().split('T')[0]
    link.setAttribute('download', `grocery_spending_${dateTag}.csv`)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)

    setDownloadSuccess(true)
    setTimeout(() => setDownloadSuccess(false), 2500)
  }

  const handleClearHistory = async () => {
    if (window.confirm('Are you sure you want to delete all historical purchase receipts? This cannot be undone.')) {
      await clearAllReceipts()
    }
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-150">
      {/* 1. Header Toolbar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-white border border-slate-200 rounded-2xl p-4 shadow-xs">
        <div>
          <h2 className="text-base sm:text-lg font-black text-slate-900 tracking-tight flex items-center gap-2">
            <span>Grocery Spending & Receipts</span>
            <span className="text-xs bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded-full">
              {filteredReceipts.length} trips
            </span>
          </h2>
          <p className="text-xs text-slate-500">
            Track historical grocery expenses, store distribution, and export data
          </p>
        </div>

        {/* Action Controls */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Period Selector */}
          <div className="flex bg-slate-100 p-0.5 rounded-xl border border-slate-200 text-xs font-bold">
            <button
              onClick={() => setSelectedPeriod('all')}
              className={`px-2.5 py-1 rounded-lg transition cursor-pointer ${
                selectedPeriod === 'all' ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              All Time
            </button>
            <button
              onClick={() => setSelectedPeriod('month')}
              className={`px-2.5 py-1 rounded-lg transition cursor-pointer ${
                selectedPeriod === 'month' ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              This Month
            </button>
            <button
              onClick={() => setSelectedPeriod('30days')}
              className={`px-2.5 py-1 rounded-lg transition cursor-pointer ${
                selectedPeriod === '30days' ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              Past 30d
            </button>
          </div>

          {/* Export to CSV */}
          <button
            onClick={handleExportCSV}
            disabled={filteredReceipts.length === 0}
            className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-40 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-xs cursor-pointer active:scale-95"
            title="Download spending history as CSV for Excel / Google Sheets"
          >
            {downloadSuccess ? (
              <>
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Downloaded!</span>
              </>
            ) : (
              <>
                <Download className="w-3.5 h-3.5" />
                <span>Export CSV</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* 2. KPI Metrics Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {/* Total Spend */}
        <div className="bg-white border border-slate-200 rounded-2xl p-3.5 shadow-xs">
          <div className="flex items-center justify-between text-slate-400 mb-1">
            <span className="text-[11px] font-bold uppercase tracking-wider">Total Spent</span>
            <DollarSign className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
            {formatPrice(summary.totalSpend)}
          </div>
          <div className="text-[10px] text-slate-400 mt-0.5">
            across {filteredReceipts.length} shopping stops
          </div>
        </div>

        {/* Avg per Trip */}
        <div className="bg-white border border-slate-200 rounded-2xl p-3.5 shadow-xs">
          <div className="flex items-center justify-between text-slate-400 mb-1">
            <span className="text-[11px] font-bold uppercase tracking-wider">Avg Per Stop</span>
            <Calendar className="w-4 h-4 text-teal-600" />
          </div>
          <div className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
            {formatPrice(summary.avgPerTrip)}
          </div>
          <div className="text-[10px] text-slate-400 mt-0.5">
            average fulfillment basket
          </div>
        </div>

        {/* Estimated Savings */}
        <div className="bg-white border border-slate-200 rounded-2xl p-3.5 shadow-xs">
          <div className="flex items-center justify-between text-slate-400 mb-1">
            <span className="text-[11px] font-bold uppercase tracking-wider">Money Saved</span>
            <TrendingDown className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-xl sm:text-2xl font-black text-emerald-600 tracking-tight">
            +{formatPrice(summary.totalSavings)}
          </div>
          <div className="text-[10px] text-emerald-600 font-semibold mt-0.5">
            via smart store comparison
          </div>
        </div>

        {/* Total Items */}
        <div className="bg-white border border-slate-200 rounded-2xl p-3.5 shadow-xs">
          <div className="flex items-center justify-between text-slate-400 mb-1">
            <span className="text-[11px] font-bold uppercase tracking-wider">Items Purchased</span>
            <ShoppingBag className="w-4 h-4 text-indigo-600" />
          </div>
          <div className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
            {summary.totalItems}
          </div>
          <div className="text-[10px] text-slate-400 mt-0.5">
            total products fulfilled
          </div>
        </div>
      </div>

      {/* 3. Monthly Spend Timeline Bar Chart */}
      {monthlyTimeline.months.length > 0 && (
        <div className="bg-white border border-slate-200 rounded-2xl p-4 sm:p-5 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-xs sm:text-sm font-extrabold text-slate-800 uppercase tracking-wider">
                Monthly Spending Trend
              </h3>
              <p className="text-xs text-slate-400">Monthly grocery fulfillment over time</p>
            </div>
            <span className="text-xs font-bold text-slate-600">
              Peak: {formatPrice(monthlyTimeline.maxVal)}
            </span>
          </div>

          <div className="h-32 flex items-end gap-2 sm:gap-4 pt-4 border-b border-slate-100">
            {monthlyTimeline.months.map((m) => {
              const heightPct = Math.max(12, Math.round((m.total / monthlyTimeline.maxVal) * 100))
              return (
                <div key={m.label} className="flex-1 flex flex-col items-center gap-1.5 h-full justify-end group">
                  <span className="text-[10px] font-bold text-slate-700 opacity-80 group-hover:opacity-100">
                    {formatPrice(m.total)}
                  </span>
                  <div
                    style={{ height: `${heightPct}%` }}
                    className="w-full max-w-[48px] bg-gradient-to-t from-emerald-600 to-teal-500 rounded-t-lg transition-all group-hover:from-emerald-500 group-hover:to-teal-400 shadow-2xs"
                  />
                  <span className="text-[10px] font-semibold text-slate-400">{m.label}</span>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* 4. Store Distribution & Category Breakdown Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Store Distribution */}
        <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-xs font-extrabold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
              <Store className="w-4 h-4 text-emerald-600" />
              <span>Spend by Store</span>
            </h3>
            <span className="text-[11px] text-slate-400 font-semibold">
              {storeBreakdown.length} stores
            </span>
          </div>

          {storeBreakdown.length === 0 ? (
            <p className="text-xs text-slate-400 py-4 text-center">No purchases recorded yet</p>
          ) : (
            <div className="space-y-3">
              {storeBreakdown.map((s) => {
                const pct = summary.totalSpend > 0 ? Math.round((s.total / summary.totalSpend) * 100) : 0
                return (
                  <div key={s.name} className="space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-bold text-slate-800">{s.name}</span>
                      <div className="flex items-center gap-2">
                        <span className="text-slate-400 text-[11px]">
                          {s.count} {s.count === 1 ? 'trip' : 'trips'}
                        </span>
                        <span className="font-black text-slate-900">{formatPrice(s.total)}</span>
                        <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.2 rounded-md">
                          {pct}%
                        </span>
                      </div>
                    </div>
                    {/* Progress Bar */}
                    <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                      <div
                        style={{ width: `${pct}%` }}
                        className="h-full bg-emerald-600 rounded-full transition-all duration-300"
                      />
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>

        {/* Category Breakdown */}
        <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-xs font-extrabold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
              <Tag className="w-4 h-4 text-teal-600" />
              <span>Spend by Department</span>
            </h3>
            <span className="text-[11px] text-slate-400 font-semibold">
              {categoryBreakdown.length} departments
            </span>
          </div>

          {categoryBreakdown.length === 0 ? (
            <p className="text-xs text-slate-400 py-4 text-center">No purchases recorded yet</p>
          ) : (
            <div className="space-y-3">
              {categoryBreakdown.slice(0, 5).map((c) => {
                const pct = summary.totalSpend > 0 ? Math.round((c.total / summary.totalSpend) * 100) : 0
                return (
                  <div key={c.name} className="space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-bold text-slate-800 truncate max-w-[150px]">{c.name}</span>
                      <div className="flex items-center gap-2">
                        <span className="text-slate-400 text-[11px]">{c.count} items</span>
                        <span className="font-black text-slate-900">{formatPrice(c.total)}</span>
                        <span className="text-[11px] font-bold text-teal-700 bg-teal-50 px-1.5 py-0.2 rounded-md">
                          {pct}%
                        </span>
                      </div>
                    </div>
                    <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                      <div
                        style={{ width: `${pct}%` }}
                        className="h-full bg-teal-600 rounded-full transition-all duration-300"
                      />
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>

      {/* 5. Past Trip Receipts Log */}
      <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-xs">
        <div className="p-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
          <div>
            <h3 className="text-xs sm:text-sm font-extrabold text-slate-900 uppercase tracking-wider">
              Itemized Trip Receipts
            </h3>
            <p className="text-xs text-slate-400">Click any receipt to view purchased items and bill</p>
          </div>

          {receipts.length > 0 && (
            <button
              onClick={handleClearHistory}
              className="text-xs text-rose-600 hover:text-rose-700 font-semibold hover:bg-rose-50 px-2.5 py-1 rounded-lg transition cursor-pointer"
            >
              Clear Log
            </button>
          )}
        </div>

        {filteredReceipts.length === 0 ? (
          <div className="text-center py-12 p-4 text-slate-400">
            <ShoppingBag className="w-8 h-8 mx-auto mb-2 opacity-40" />
            <p className="text-xs font-semibold">No trip receipts logged for this time period</p>
            <p className="text-[11px] text-slate-400 mt-1">
              Receipts are automatically generated whenever you tap "Finish Stop" in Shopping mode.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {filteredReceipts.map((receipt) => {
              const isExpanded = expandedReceiptId === receipt.id
              const d = new Date(receipt.timestamp)
              const dateFormatted = d.toLocaleDateString(undefined, {
                weekday: 'short',
                month: 'short',
                day: 'numeric',
                year: 'numeric',
              })
              const timeFormatted = d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })

              return (
                <div key={receipt.id} className="transition-colors hover:bg-slate-50/50">
                  {/* Receipt Header Card */}
                  <div
                    onClick={() => setExpandedReceiptId(isExpanded ? null : receipt.id)}
                    className="p-3.5 sm:p-4 flex items-center justify-between gap-3 cursor-pointer select-none"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center text-slate-700 shrink-0 border border-slate-200 font-bold">
                        <Store className="w-5 h-5 text-emerald-600" />
                      </div>

                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="font-extrabold text-sm text-slate-900 truncate">
                            {receipt.shopName}
                          </span>
                          {receipt.totalSavings && receipt.totalSavings > 0 ? (
                            <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.2 rounded-full border border-emerald-200">
                              Saved {formatPrice(receipt.totalSavings)}
                            </span>
                          ) : null}
                        </div>
                        <div className="text-[11px] text-slate-400 flex items-center gap-1.5">
                          <span>{dateFormatted}</span>
                          <span>•</span>
                          <span>{timeFormatted}</span>
                          <span>•</span>
                          <span>{receipt.itemsCount} items</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 shrink-0">
                      <div className="text-right">
                        <div className="text-base font-black text-slate-900">
                          {formatPrice(receipt.totalAmount)}
                        </div>
                      </div>

                      <div className="text-slate-400 p-1">
                        {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                      </div>
                    </div>
                  </div>

                  {/* Expanded Itemized Bill */}
                  {isExpanded && (
                    <div className="px-4 pb-4 pt-1 bg-slate-50/70 border-t border-slate-100 animate-in fade-in duration-150">
                      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-2xs">
                        <table className="w-full text-left text-xs">
                          <thead className="bg-slate-50 border-b border-slate-200 text-[10px] font-extrabold uppercase text-slate-400 tracking-wider">
                            <tr>
                              <th className="py-2 px-3">Item</th>
                              <th className="py-2 px-3">Category</th>
                              <th className="py-2 px-3 text-center">Packs</th>
                              <th className="py-2 px-3 text-right">Pack Price</th>
                              <th className="py-2 px-3 text-right">Total</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                            {receipt.items.map((item, idx) => (
                              <tr key={idx} className="hover:bg-slate-50">
                                <td className="py-2 px-3 font-bold text-slate-900">
                                  {item.name}
                                  <span className="block text-[10px] font-normal text-slate-400">
                                    {item.quantity} {item.unit}
                                  </span>
                                </td>
                                <td className="py-2 px-3 text-slate-500">
                                  {item.category || 'Other'}
                                </td>
                                <td className="py-2 px-3 text-center font-bold">
                                  {item.packs}
                                </td>
                                <td className="py-2 px-3 text-right">
                                  {formatPrice(item.price)}
                                </td>
                                <td className="py-2 px-3 text-right font-bold text-slate-900">
                                  {formatPrice(item.totalPrice)}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                          <tfoot className="bg-slate-50/80 border-t border-slate-200 font-bold text-slate-900">
                            <tr>
                              <td colSpan={4} className="py-2.5 px-3 text-right">
                                Stop Total:
                              </td>
                              <td className="py-2.5 px-3 text-right text-sm font-black text-emerald-700">
                                {formatPrice(receipt.totalAmount)}
                              </td>
                            </tr>
                          </tfoot>
                        </table>
                      </div>

                      {/* Delete Receipt Option */}
                      <div className="mt-2.5 flex justify-end">
                        <button
                          type="button"
                          onClick={() => {
                            if (window.confirm('Delete this receipt from history?')) {
                              deleteReceipt(receipt.id)
                            }
                          }}
                          className="text-[11px] text-rose-500 hover:text-rose-700 hover:bg-rose-50 px-2 py-1 rounded-lg transition flex items-center gap-1 cursor-pointer"
                        >
                          <Trash2 className="w-3 h-3" />
                          <span>Delete Receipt</span>
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
