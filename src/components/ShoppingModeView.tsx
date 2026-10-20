import React, { useState, useEffect, useMemo } from 'react'
import {
  CheckCircle2,
  Circle,
  AlertTriangle,
  Sparkles,
  TrendingDown,
  MapPin,
  Store,
  ChevronDown,
  ChevronUp,
  Edit2,
  PartyPopper,
  PackageOpen,
  ArrowRight,
  ArrowLeft,
  DollarSign,
  Plus,
  Zap,
  Eye,
  EyeOff,
} from 'lucide-react'
import confetti from 'canvas-confetti'
import { useShopping } from '../context/ShoppingContext'
import type { ShoppingItem } from '../types'
import {
  compareShopPrices,
  formatPrice,
  formatUnitPrice,
  groupItemsByShopLocation,
  isCheapestAtStore,
} from '../utils/pricing'

interface ShoppingModeViewProps {
  onEditItem: (item: ShoppingItem) => void
  onOpenStoreModal: () => void
}

export const ShoppingModeView: React.FC<ShoppingModeViewProps> = ({
  onEditItem,
  onOpenStoreModal,
}) => {
  const {
    shops,
    selectedShopId,
    setSelectedShopId,
    saveMode,
    setSaveMode,
    moveShopOrder,
    items,
    toggleInCart,
    updateItemShopDetail,
    clearCart,
  } = useShopping()

  const [editingPriceItemId, setEditingPriceItemId] = useState<string | null>(null)
  const [tempPriceInput, setTempPriceInput] = useState<string>('')
  const [showUnavailableDrawer, setShowUnavailableDrawer] = useState<boolean>(false)
  const [showTripSummary, setShowTripSummary] = useState<boolean>(false)
  const [collapsedSections, setCollapsedSections] = useState<Record<string, boolean>>({})

  // Option: Hide stores with 0 items to shop
  const [hideEmptyStores, setHideEmptyStores] = useState<boolean>(() => {
    const saved = localStorage.getItem('hash_groc_hide_empty_stores')
    return saved !== null ? saved === 'true' : false
  })

  useEffect(() => {
    localStorage.setItem('hash_groc_hide_empty_stores', String(hideEmptyStores))
  }, [hideEmptyStores])

  // All needed items on active shopping list
  const allNeededItems = items.filter((item) => item.isNeeded)

  // Count items needed to buy at a specific shop (taking into account Save Mode)
  const getShopItemCount = (shopId: string) => {
    return allNeededItems.filter((item) => {
      const detail = item.shops[shopId]
      const isCarried = detail ? detail.available : true
      if (!isCarried) return false
      if (saveMode) return isCheapestAtStore(item, shopId, shops)
      return true
    }).length
  }

  // Filter stores that have items to shop
  const nonEmptyShops = shops.filter((s) => getShopItemCount(s.id) > 0)
  const hiddenCount = shops.length - nonEmptyShops.length

  const visibleShops = useMemo(() => {
    if (!hideEmptyStores) return shops
    // Fall back to all shops if every shop has 0 items (so user isn't stuck with empty UI)
    return nonEmptyShops.length > 0 ? nonEmptyShops : shops
  }, [shops, hideEmptyStores, nonEmptyShops])

  // Current active shop (guaranteed to be within visibleShops if available)
  const currentShop =
    visibleShops.find((s) => s.id === selectedShopId) || visibleShops[0] || shops[0]

  useEffect(() => {
    if (hideEmptyStores && visibleShops.length > 0) {
      const isCurrentVisible = visibleShops.some((s) => s.id === selectedShopId)
      if (!isCurrentVisible) {
        setSelectedShopId(visibleShops[0].id)
      }
    }
  }, [hideEmptyStores, visibleShops, selectedShopId, setSelectedShopId])

  // Items available at this store
  const carriedAtShopItems = allNeededItems.filter((item) => {
    const detail = item.shops[currentShop?.id]
    return detail ? detail.available : true
  })

  // Items needed but NOT carried at this store (excluded)
  const unavailableItems = allNeededItems.filter((item) => {
    const detail = item.shops[currentShop?.id]
    return detail && detail.available === false
  })

  // (6) SAVE MODE FILTER:
  // If saveMode is ON, only show items that are strictly cheapest at THIS store!
  const availableItems = saveMode
    ? carriedAtShopItems.filter((item) => isCheapestAtStore(item, currentShop.id, shops))
    : carriedAtShopItems

  // Items hidden by Save Mode because they're cheaper at other stops
  const savedForOtherStores = saveMode
    ? carriedAtShopItems.filter((item) => !isCheapestAtStore(item, currentShop.id, shops))
    : []

  // Split into pending and in-cart
  const pendingItems = availableItems.filter((item) => !item.inCart)
  const cartItems = availableItems.filter((item) => item.inCart)

  // Running Totals Calculation
  const cartTotal = cartItems.reduce((sum, item) => {
    const price = item.shops[currentShop?.id]?.price || 0
    return sum + price * (item.quantity || 1)
  }, 0)

  const remainingTotal = pendingItems.reduce((sum, item) => {
    const price = item.shops[currentShop?.id]?.price || 0
    return sum + price * (item.quantity || 1)
  }, 0)

  const tripEstimatedTotal = cartTotal + remainingTotal

  // Estimated Savings calculation
  const estimatedSavings = availableItems.reduce((sum, item) => {
    const comp = compareShopPrices(item, currentShop?.id, shops)
    const validPrices = comp.allStorePrices.filter((p) => p.available && p.price > 0)
    if (validPrices.length > 1 && comp.currentPrice) {
      const maxPrice = Math.max(...validPrices.map((p) => p.price))
      if (maxPrice > comp.currentPrice) {
        return sum + (maxPrice - comp.currentPrice) * (item.quantity || 1)
      }
    }
    return sum
  }, 0)

  // Group pending items by location in THIS store
  const locationGroups = groupItemsByShopLocation(pendingItems, currentShop)

  const toggleSectionCollapse = (location: string) => {
    setCollapsedSections((prev) => ({
      ...prev,
      [location]: !prev[location],
    }))
  }

  const handlePriceUpdate = async (itemId: string) => {
    const parsed = parseFloat(tempPriceInput)
    if (!isNaN(parsed) && parsed >= 0) {
      await updateItemShopDetail(itemId, currentShop.id, { price: parsed })
    }
    setEditingPriceItemId(null)
    setTempPriceInput('')
  }

  const handleFinishTrip = () => {
    confetti({
      particleCount: 90,
      spread: 75,
      origin: { y: 0.6 },
    })
    setShowTripSummary(true)
  }

  return (
    <div className="pb-32 pt-3 max-w-4xl mx-auto px-3 sm:px-6">
      {/* 1. Trip Planner: Reorderable Store Tabs */}
      <div className="mb-4">
        <div className="flex items-center justify-between mb-2 flex-wrap gap-2">
          <div className="flex items-center gap-2">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
              <Store className="w-4 h-4 text-emerald-600" />
              <span>Trip Plan / Store Stops</span>
            </label>
            {hideEmptyStores && hiddenCount > 0 && (
              <span className="text-[10px] font-bold bg-slate-100 text-slate-600 border border-slate-200 px-1.5 py-0.5 rounded-full">
                {visibleShops.length} of {shops.length} stops
              </span>
            )}
          </div>

          {/* Option: Hide stores without items to shop */}
          <button
            type="button"
            onClick={() => setHideEmptyStores((prev) => !prev)}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-xs font-semibold transition border ${
              hideEmptyStores
                ? 'bg-emerald-50 text-emerald-800 border-emerald-300 shadow-2xs'
                : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
            }`}
            title="Toggle hiding stores without any items to shop"
          >
            {hideEmptyStores ? (
              <EyeOff className="w-3.5 h-3.5 text-emerald-600" />
            ) : (
              <Eye className="w-3.5 h-3.5 text-slate-400" />
            )}
            <span>Hide empty stores</span>
            {hideEmptyStores && hiddenCount > 0 && (
              <span className="text-[10px] bg-emerald-200 text-emerald-900 px-1.5 py-0.2 rounded-full font-bold">
                {hiddenCount}
              </span>
            )}
          </button>
        </div>

        <div className="flex gap-2 overflow-x-auto pb-2 no-scrollbar">
          {visibleShops.map((shop, index) => {
            const isSelected = shop.id === currentShop.id
            const count = getShopItemCount(shop.id)
            const pickedCount = allNeededItems.filter((item) => {
              const detail = item.shops[shop.id]
              const isCarried = detail ? detail.available : true
              if (!isCarried) return false
              if (saveMode && !isCheapestAtStore(item, shop.id, shops)) return false
              return item.inCart
            }).length
            const isFullyPicked = count > 0 && pickedCount === count

            return (
              <div
                key={shop.id}
                className={`flex items-center rounded-2xl border shrink-0 transition-all ${
                  isSelected
                    ? 'border-emerald-500 bg-emerald-50/90 text-emerald-950 font-bold shadow-xs ring-2 ring-emerald-500/20'
                    : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300'
                }`}
              >
                {/* Left/Right Reordering Controls (Requirement 7) */}
                <div className="flex flex-col border-r border-slate-200/80 p-0.5">
                  <button
                    disabled={index === 0}
                    onClick={() => moveShopOrder(shop.id, 'left', visibleShops[index - 1]?.id)}
                    className="p-1 text-slate-400 hover:text-slate-800 disabled:opacity-20 transition"
                    title="Move stop earlier in trip"
                  >
                    <ArrowLeft className="w-3 h-3" />
                  </button>
                  <button
                    disabled={index === visibleShops.length - 1}
                    onClick={() => moveShopOrder(shop.id, 'right', visibleShops[index + 1]?.id)}
                    className="p-1 text-slate-400 hover:text-slate-800 disabled:opacity-20 transition"
                    title="Move stop later in trip"
                  >
                    <ArrowRight className="w-3 h-3" />
                  </button>
                </div>

                {/* Main Store Tab Click Target */}
                <button
                  onClick={() => setSelectedShopId(shop.id)}
                  className="px-3.5 py-2.5 text-left flex items-center gap-2.5"
                >
                  <div>
                    <div className="flex items-center gap-1.5">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 bg-slate-100 px-1.5 py-0.2 rounded">
                        Stop {index + 1}
                      </span>
                      <span className="text-sm font-bold tracking-tight">{shop.name}</span>
                    </div>
                    <div className="text-[11px] text-slate-500 mt-0.5">
                      {isFullyPicked ? (
                        <span className="text-emerald-700 font-semibold">✓ All {count} picked</span>
                      ) : (
                        <span>
                          {count} {count === 1 ? 'item' : 'items'} to buy
                        </span>
                      )}
                    </div>
                  </div>
                </button>
              </div>
            )
          })}

          <button
            onClick={onOpenStoreModal}
            className="flex items-center gap-1 px-3 py-2.5 rounded-2xl border border-dashed border-slate-300 text-slate-500 hover:text-slate-800 hover:border-slate-400 bg-white/50 shrink-0 text-xs font-semibold transition"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Stores</span>
          </button>
        </div>
      </div>

      {/* 2. Save Mode Toggle Banner (Requirement 6) */}
      <div className="mb-4 p-3 rounded-2xl bg-gradient-to-r from-emerald-500/10 via-teal-500/10 to-indigo-500/10 border border-emerald-300 flex items-center justify-between gap-3 shadow-2xs">
        <div className="flex items-center gap-2.5 min-w-0">
          <div
            className={`p-2 rounded-xl text-white ${
              saveMode ? 'bg-emerald-600 shadow-sm' : 'bg-slate-400'
            }`}
          >
            <Zap className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-slate-900">
                Save Mode {saveMode ? '(Active)' : '(Off)'}
              </span>
              {saveMode && (
                <span className="text-[10px] font-extrabold bg-emerald-600 text-white px-1.5 py-0.2 rounded-full uppercase">
                  Best Prices Only
                </span>
              )}
            </div>
            <p className="text-[11px] text-slate-600 leading-tight">
              {saveMode
                ? `Only showing items cheapest at ${currentShop.name}. Items cheaper elsewhere are hidden for other stops.`
                : `Showing all items available at ${currentShop.name}, even if cheaper at another store.`}
            </p>
          </div>
        </div>

        {/* Toggle switch */}
        <label className="relative inline-flex items-center cursor-pointer shrink-0">
          <input
            type="checkbox"
            checked={saveMode}
            onChange={(e) => setSaveMode(e.target.checked)}
            className="sr-only peer"
          />
          <div className="w-11 h-6 bg-slate-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-600"></div>
        </label>
      </div>

      {/* Save Mode Notice when items are moved to other stores */}
      {saveMode && savedForOtherStores.length > 0 && (
        <div className="mb-4 p-2.5 rounded-xl bg-indigo-50 border border-indigo-200 text-xs text-indigo-900 flex items-center justify-between">
          <span className="text-[11px]">
            💡 <strong>{savedForOtherStores.length}</strong> {savedForOtherStores.length === 1 ? 'item was' : 'items were'} cheaper at other stops and {savedForOtherStores.length === 1 ? 'is' : 'are'} hidden here for maximum family savings.
          </span>
          <button
            onClick={() => setSaveMode(false)}
            className="text-[11px] font-bold underline text-indigo-700 hover:text-indigo-900 shrink-0 ml-2"
          >
            Show All
          </button>
        </div>
      )}

      {/* 3. Running Total Summary Card */}
      <div className="bg-gradient-to-br from-slate-900 to-slate-800 text-white rounded-2xl p-4 sm:p-5 shadow-lg mb-5">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <div className="text-xs font-medium text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
              <span>Running Cart Total</span>
              <span className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            </div>
            <div className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight mt-0.5">
              {formatPrice(cartTotal)}
            </div>
            <div className="text-xs text-slate-400 mt-1 flex items-center gap-2">
              <span>Remaining: {formatPrice(remainingTotal)}</span>
              <span>•</span>
              <span>Trip Est: {formatPrice(tripEstimatedTotal)}</span>
            </div>
          </div>

          <div className="flex flex-col sm:items-end gap-1.5">
            <div className="text-xs font-medium text-slate-300">
              Cart Progress:{' '}
              <span className="font-bold text-white">
                {cartItems.length} of {availableItems.length}
              </span>{' '}
              picked
            </div>
            <div className="w-40 sm:w-52 h-2.5 bg-slate-700 rounded-full overflow-hidden">
              <div
                className="h-full bg-emerald-400 transition-all duration-300 rounded-full"
                style={{
                  width: `${
                    availableItems.length > 0
                      ? Math.round((cartItems.length / availableItems.length) * 100)
                      : 0
                  }%`,
                }}
              />
            </div>
            {estimatedSavings > 0 && (
              <div className="flex items-center gap-1 text-[11px] text-emerald-300 font-semibold bg-emerald-950/60 border border-emerald-500/30 px-2 py-0.5 rounded-full">
                <Sparkles className="w-3 h-3 text-emerald-400" />
                <span>Saving ~{formatPrice(estimatedSavings)} vs other stores!</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 4. Items Not Carried at this Store Banner */}
      {unavailableItems.length > 0 && (
        <div className="mb-4 bg-amber-50 border border-amber-200 rounded-xl p-3 text-xs text-amber-900 flex items-start justify-between gap-3 shadow-xs">
          <div className="flex items-start gap-2">
            <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <div>
              <span className="font-semibold">
                {unavailableItems.length}{' '}
                {unavailableItems.length === 1 ? 'item is' : 'items are'} not carried at{' '}
                {currentShop.name}:
              </span>{' '}
              <span className="text-amber-800">
                {unavailableItems.map((i) => i.name).slice(0, 3).join(', ')}
                {unavailableItems.length > 3 && ` +${unavailableItems.length - 3} more`}
              </span>
            </div>
          </div>
          <button
            onClick={() => setShowUnavailableDrawer(!showUnavailableDrawer)}
            className="text-[11px] font-bold text-amber-700 hover:text-amber-900 underline shrink-0"
          >
            {showUnavailableDrawer ? 'Hide' : 'View'}
          </button>
        </div>
      )}

      {/* Expanded Unavailable Items List */}
      {showUnavailableDrawer && unavailableItems.length > 0 && (
        <div className="mb-5 p-4 bg-white border border-amber-200 rounded-xl shadow-xs">
          <div className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2 flex items-center gap-1.5">
            <PackageOpen className="w-4 h-4 text-amber-600" />
            <span>Items to buy at other stores:</span>
          </div>
          <div className="space-y-2">
            {unavailableItems.map((item) => {
              const carryingShops = shops.filter(
                (s) => item.shops[s.id]?.available && item.shops[s.id]?.price !== null
              )
              return (
                <div
                  key={item.id}
                  className="flex items-center justify-between p-2 rounded-lg bg-slate-50 border border-slate-100 text-xs"
                >
                  <div>
                    <span className="font-semibold text-slate-800">{item.name}</span>
                    <span className="text-slate-500 ml-1.5">
                      ({item.quantity} {item.unit})
                    </span>
                  </div>
                  <div className="text-slate-600 text-[11px]">
                    Available at:{' '}
                    {carryingShops.length > 0 ? (
                      <span className="font-medium text-emerald-700">
                        {carryingShops.map((s) => s.name).join(', ')}
                      </span>
                    ) : (
                      <span className="italic text-slate-400">Add shop details</span>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* 5. Active Items - Grouped by Location in THIS Store */}
      {availableItems.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-2xl border border-dashed border-slate-300 p-6">
          <PackageOpen className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h3 className="text-base font-bold text-slate-800">No items to pick at this store!</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1">
            {saveMode
              ? `Save Mode filtered out items that are cheaper at your other planned stops. Switch store tabs or turn off Save Mode to view all available items.`
              : `Either no items are on your list, or none are carried at ${currentShop.name}.`}
          </p>
        </div>
      ) : pendingItems.length === 0 ? (
        <div className="text-center py-10 bg-emerald-50 rounded-2xl border border-emerald-200 p-6 mb-6">
          <PartyPopper className="w-12 h-12 text-emerald-600 mx-auto mb-2 animate-bounce" />
          <h3 className="text-lg font-bold text-emerald-900">All items picked for {currentShop.name}!</h3>
          <p className="text-xs text-emerald-700 mt-1">
            Ready to checkout or proceed to your next store stop?
          </p>
          <button
            onClick={handleFinishTrip}
            className="mt-4 px-5 py-2.5 bg-emerald-600 text-white rounded-xl text-sm font-bold shadow-md hover:bg-emerald-700 transition"
          >
            Review & Finish Trip
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {locationGroups.map(({ location, items: groupItems }) => {
            const isCollapsed = collapsedSections[location]
            return (
              <div
                key={location}
                className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden transition-all"
              >
                {/* Location / Aisle Category Header */}
                <button
                  onClick={() => toggleSectionCollapse(location)}
                  className="w-full flex items-center justify-between px-4 py-3 bg-slate-50/80 border-b border-slate-100 hover:bg-slate-100/80 transition text-left"
                >
                  <div className="flex items-center gap-2">
                    <div className="p-1.5 rounded-lg bg-emerald-100 text-emerald-700">
                      <MapPin className="w-3.5 h-3.5" />
                    </div>
                    <div>
                      <span className="text-xs font-bold text-slate-900 tracking-tight">
                        {location}
                      </span>
                      <span className="text-[11px] text-slate-500 ml-2">
                        ({groupItems.length} {groupItems.length === 1 ? 'item' : 'items'})
                      </span>
                    </div>
                  </div>
                  {isCollapsed ? (
                    <ChevronDown className="w-4 h-4 text-slate-400" />
                  ) : (
                    <ChevronUp className="w-4 h-4 text-slate-400" />
                  )}
                </button>

                {/* Items in this Aisle */}
                {!isCollapsed && (
                  <div className="divide-y divide-slate-100">
                    {groupItems.map((item) => {
                      const comp = compareShopPrices(item, currentShop.id, shops)
                      const shopDetail = item.shops[currentShop.id]
                      const itemUnitPrice = shopDetail?.price || null
                      const quantity = item.quantity || 1
                      const totalItemPrice = itemUnitPrice !== null ? itemUnitPrice * quantity : null

                      return (
                        <div
                          key={item.id}
                          className="p-3.5 sm:p-4 hover:bg-slate-50/60 transition flex items-center justify-between gap-3"
                        >
                          {/* Left: Checkbox & Item details */}
                          <div className="flex items-start gap-3 min-w-0 flex-1">
                            <button
                              onClick={() => toggleInCart(item.id)}
                              className="text-slate-300 hover:text-emerald-600 transition shrink-0 mt-0.5"
                              title="Mark as picked into cart"
                            >
                              <Circle className="w-6 h-6" />
                            </button>

                            <div className="min-w-0 flex-1">
                              <div className="flex items-baseline gap-2 flex-wrap">
                                <span className="text-sm font-bold text-slate-900">
                                  {item.name}
                                </span>
                                <span className="text-xs font-semibold px-2 py-0.5 rounded-md bg-slate-100 text-slate-700">
                                  {quantity} {item.unit}
                                </span>
                                <button
                                  onClick={() => onEditItem(item)}
                                  className="text-slate-400 hover:text-emerald-700 p-0.5 rounded transition"
                                  title="Edit item / aisles"
                                >
                                  <Edit2 className="w-3 h-3" />
                                </button>
                              </div>

                              {item.notes && (
                                <p className="text-xs text-slate-500 mt-0.5 italic">
                                  {item.notes}
                                </p>
                              )}

                              {/* Price Comparison Highlights */}
                              <div className="mt-1 flex items-center gap-2 flex-wrap">
                                {comp.isCheaperElsewhere && comp.cheapestShop && (
                                  <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-semibold bg-rose-50 text-rose-700 border border-rose-200">
                                    <TrendingDown className="w-3 h-3 text-rose-600" />
                                    <span>
                                      Cheaper at {comp.cheapestShop.name}:{' '}
                                      {formatPrice(comp.cheapestPrice)}
                                      {comp.cheapestUnitPrice && (
                                        <span className="font-normal ml-0.5">
                                          ({formatUnitPrice(comp.cheapestUnitPrice, item.shops[comp.cheapestShop.id]?.packageUnit)})
                                        </span>
                                      )}
                                    </span>
                                  </div>
                                )}

                                {comp.isBestPriceHere && (
                                  <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                                    <Sparkles className="w-3 h-3 text-emerald-600" />
                                    <span>Best Price Here!</span>
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>

                          {/* Right: Requirement (5) - Total cost on top line, unit price on second line */}
                          <div className="shrink-0 flex items-center gap-2">
                            {editingPriceItemId === item.id ? (
                              <div className="flex items-center gap-1">
                                <span className="text-xs text-slate-500">$</span>
                                <input
                                  type="number"
                                  step="0.01"
                                  autoFocus
                                  value={tempPriceInput}
                                  onChange={(e) => setTempPriceInput(e.target.value)}
                                  onKeyDown={(e) => {
                                    if (e.key === 'Enter') handlePriceUpdate(item.id)
                                    if (e.key === 'Escape') setEditingPriceItemId(null)
                                  }}
                                  className="w-16 px-1.5 py-1 text-xs border border-emerald-500 rounded font-bold"
                                />
                                <button
                                  onClick={() => handlePriceUpdate(item.id)}
                                  className="text-xs bg-emerald-600 text-white px-2 py-1 rounded font-bold"
                                >
                                  Save
                                </button>
                              </div>
                            ) : (
                              <button
                                onClick={() => {
                                  setEditingPriceItemId(item.id)
                                  setTempPriceInput(itemUnitPrice !== null ? itemUnitPrice.toString() : '')
                                }}
                                className="group flex flex-col items-end px-2.5 py-1 rounded-lg border border-slate-200 hover:border-emerald-300 hover:bg-emerald-50/50 transition text-right"
                                title="Click to update shelf price"
                              >
                                {/* Top line: Total cost */}
                                <div className="flex items-center gap-1">
                                  <span className="text-sm font-extrabold text-slate-900 tracking-tight">
                                    {formatPrice(totalItemPrice)}
                                  </span>
                                  <Edit2 className="w-3 h-3 text-slate-300 group-hover:text-emerald-600" />
                                </div>

                                {/* Second line: Price per item when quantity > 1 (Requirement 5) */}
                                {quantity > 1 && itemUnitPrice !== null && (
                                  <div className="text-[10px] text-slate-500 font-medium">
                                    ({formatPrice(itemUnitPrice)} ea × {quantity})
                                  </div>
                                )}

                                {/* Normalized package unit price if present */}
                                {shopDetail?.unitPrice && (
                                  <div className="text-[9px] text-indigo-700 font-mono">
                                    {formatUnitPrice(shopDetail.unitPrice, shopDetail.packageUnit)}
                                  </div>
                                )}
                              </button>
                            )}
                          </div>
                        </div>
                      )
                    })}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}

      {/* 6. In-Cart (Checked Off) Items Section */}
      {cartItems.length > 0 && (
        <div className="mt-8 bg-slate-100/70 rounded-2xl border border-slate-200 p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span className="text-xs font-bold uppercase tracking-wider text-slate-700">
                In Cart ({cartItems.length})
              </span>
              <span className="text-xs font-semibold text-slate-500">
                • {formatPrice(cartTotal)}
              </span>
            </div>
            <button
              onClick={handleFinishTrip}
              className="text-xs font-bold text-emerald-700 hover:text-emerald-900 flex items-center gap-1"
            >
              <span>Finish Trip</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="space-y-1.5">
            {cartItems.map((item) => {
              const itemPrice = item.shops[currentShop.id]?.price || 0
              return (
                <div
                  key={item.id}
                  className="flex items-center justify-between p-2.5 rounded-xl bg-white/80 border border-slate-200/80 text-xs transition"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <button
                      onClick={() => toggleInCart(item.id)}
                      className="text-emerald-600 hover:text-slate-400 transition shrink-0"
                      title="Undo check"
                    >
                      <CheckCircle2 className="w-5 h-5 fill-emerald-600 text-white" />
                    </button>
                    <span className="line-through text-slate-400 font-medium truncate">
                      {item.name}
                    </span>
                    <span className="text-slate-400 text-[11px]">
                      ({item.quantity} {item.unit})
                    </span>
                  </div>

                  <span className="text-slate-400 font-semibold shrink-0">
                    {formatPrice(itemPrice * item.quantity)}
                  </span>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* 7. Sticky Bottom Summary Bar */}
      <div className="fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-md border-t border-slate-200 p-3 sm:p-4 z-20 shadow-xl">
        <div className="max-w-4xl mx-auto flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-emerald-50 text-emerald-700 border border-emerald-200">
              <DollarSign className="w-5 h-5" />
            </div>
            <div>
              <div className="text-[11px] uppercase tracking-wider font-bold text-slate-400">
                In Cart Total
              </div>
              <div className="text-lg sm:text-xl font-black text-slate-900 leading-tight">
                {formatPrice(cartTotal)}{' '}
                <span className="text-xs font-normal text-slate-500">
                  ({cartItems.length}/{availableItems.length} picked)
                </span>
              </div>
            </div>
          </div>

          <button
            onClick={handleFinishTrip}
            disabled={cartItems.length === 0}
            className={`px-4 sm:px-6 py-2.5 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-2 transition shadow-md ${
              cartItems.length > 0
                ? 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-600/30'
                : 'bg-slate-200 text-slate-400 cursor-not-allowed shadow-none'
            }`}
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>Finish Stop</span>
          </button>
        </div>
      </div>

      {/* 8. Trip Summary Modal */}
      {showTripSummary && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl">
            <div className="text-center mb-5">
              <div className="w-14 h-14 bg-emerald-100 text-emerald-700 rounded-full flex items-center justify-center mx-auto mb-3 shadow-inner">
                <PartyPopper className="w-7 h-7" />
              </div>
              <h2 className="text-xl font-black text-slate-900">Stop Completed!</h2>
              <p className="text-xs text-slate-500 mt-1">
                Shopping at <span className="font-bold text-slate-800">{currentShop.name}</span>
              </p>
            </div>

            <div className="bg-slate-50 rounded-xl p-4 border border-slate-200 space-y-2 mb-5">
              <div className="flex justify-between text-xs text-slate-600">
                <span>Items Purchased:</span>
                <span className="font-bold text-slate-900">{cartItems.length} items</span>
              </div>
              <div className="flex justify-between text-xs text-slate-600">
                <span>Total Amount Spent:</span>
                <span className="font-extrabold text-slate-900 text-sm">
                  {formatPrice(cartTotal)}
                </span>
              </div>
              {estimatedSavings > 0 && (
                <div className="flex justify-between text-xs text-emerald-700 pt-2 border-t border-slate-200 font-semibold">
                  <span>Estimated Savings:</span>
                  <span className="font-bold text-emerald-600">
                    +{formatPrice(estimatedSavings)}
                  </span>
                </div>
              )}
            </div>

            <div className="space-y-2">
              <button
                onClick={async () => {
                  await clearCart(true)
                  setShowTripSummary(false)
                }}
                className="w-full py-2.5 px-4 bg-emerald-600 text-white rounded-xl text-xs sm:text-sm font-bold shadow-sm hover:bg-emerald-700 transition"
              >
                Mark Purchased & Clear from List
              </button>
              <button
                onClick={() => setShowTripSummary(false)}
                className="w-full py-2 px-4 bg-white border border-slate-200 text-slate-700 rounded-xl text-xs font-semibold hover:bg-slate-50 transition"
              >
                Keep On List / Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
