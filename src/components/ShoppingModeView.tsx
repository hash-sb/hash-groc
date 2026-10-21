import React, { useState, useEffect, useMemo, useRef } from 'react'
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
  Minus,
  Zap,
  Eye,
  EyeOff,
  ArrowDownNarrowWide,
  Sun,
  Moon,
  PackageX,
  Scale,
  Calculator,
  Navigation,
  Check,
  X,
  MoreHorizontal,
  SlidersHorizontal,
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
    updateItem,
    toggleInCart,
    updateItemShopDetail,
    clearCart,
  } = useShopping()

  const [showUnavailableDrawer, setShowUnavailableDrawer] = useState<boolean>(false)
  const [showTripSummary, setShowTripSummary] = useState<boolean>(false)
  const [collapsedSections, setCollapsedSections] = useState<Record<string, boolean>>({})

  // View Options Popover (Menu)
  const [showOptionsPopover, setShowOptionsPopover] = useState<boolean>(false)
  const optionsPopoverRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (optionsPopoverRef.current && !optionsPopoverRef.current.contains(event.target as Node)) {
        setShowOptionsPopover(false)
      }
    }
    if (showOptionsPopover) {
      document.addEventListener('mousedown', handleClickOutside)
      return () => document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [showOptionsPopover])

  // Option: Hide stores with 0 items to shop
  const [hideEmptyStores, setHideEmptyStores] = useState<boolean>(() => {
    const saved = localStorage.getItem('hash_groc_hide_empty_stores')
    return saved !== null ? saved === 'true' : false
  })

  useEffect(() => {
    localStorage.setItem('hash_groc_hide_empty_stores', String(hideEmptyStores))
  }, [hideEmptyStores])

  // Option: Hide checked items from the aisle categories
  const [hideCheckedItems, setHideCheckedItems] = useState<boolean>(() => {
    const saved = localStorage.getItem('hash_groc_shopping_hide_checked')
    return saved !== null ? saved === 'true' : false
  })

  useEffect(() => {
    localStorage.setItem('hash_groc_shopping_hide_checked', String(hideCheckedItems))
  }, [hideCheckedItems])

  // Option: Move checked items to bottom of each aisle category
  const [moveCheckedToBottom, setMoveCheckedToBottom] = useState<boolean>(() => {
    const saved = localStorage.getItem('hash_groc_shopping_checked_bottom')
    return saved !== null ? saved === 'true' : true
  })

  useEffect(() => {
    localStorage.setItem('hash_groc_shopping_checked_bottom', String(moveCheckedToBottom))
  }, [moveCheckedToBottom])

  // Feature 1: Screen Wake Lock (keep screen awake while shopping)
  const [keepScreenAwake, setKeepScreenAwake] = useState<boolean>(() => {
    const saved = localStorage.getItem('hash_groc_wake_lock')
    return saved !== null ? saved === 'true' : true
  })
  const [wakeLockActive, setWakeLockActive] = useState<boolean>(false)
  const wakeLockRef = useRef<any>(null)

  useEffect(() => {
    localStorage.setItem('hash_groc_wake_lock', String(keepScreenAwake))
  }, [keepScreenAwake])

  useEffect(() => {
    if (typeof navigator === 'undefined' || !('wakeLock' in navigator) || !keepScreenAwake) {
      if (wakeLockRef.current) {
        wakeLockRef.current.release().catch(() => {})
        wakeLockRef.current = null
        setWakeLockActive(false)
      }
      return
    }

    let isMounted = true
    const requestLock = async () => {
      try {
        const lock = await (navigator as any).wakeLock.request('screen')
        if (isMounted) {
          wakeLockRef.current = lock
          setWakeLockActive(true)
          lock.addEventListener('release', () => {
            if (isMounted) setWakeLockActive(false)
          })
        }
      } catch {
        if (isMounted) setWakeLockActive(false)
      }
    }

    requestLock()

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible' && keepScreenAwake) {
        requestLock()
      }
    }

    document.addEventListener('visibilitychange', handleVisibilityChange)

    return () => {
      isMounted = false
      document.removeEventListener('visibilitychange', handleVisibilityChange)
      if (wakeLockRef.current) {
        wakeLockRef.current.release().catch(() => {})
        wakeLockRef.current = null
      }
    }
  }, [keepScreenAwake])

  // Feature 1: Haptic feedback helper
  const triggerHaptic = (ms = 20) => {
    if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
      try {
        navigator.vibrate(ms)
      } catch {
        // ignore
      }
    }
  }

  // Feature 2: Auto-collapse completed aisles
  const [autoCollapseCompleted, setAutoCollapseCompleted] = useState<boolean>(() => {
    const saved = localStorage.getItem('hash_groc_auto_collapse_aisles')
    return saved !== null ? saved === 'true' : true
  })

  useEffect(() => {
    localStorage.setItem('hash_groc_auto_collapse_aisles', String(autoCollapseCompleted))
  }, [autoCollapseCompleted])

  // Feature 3: Out of stock state & feedback toast
  const [outOfStockItem, setOutOfStockItem] = useState<ShoppingItem | null>(null)
  const [toastMessage, setToastMessage] = useState<string | null>(null)

  useEffect(() => {
    if (toastMessage) {
      const timer = setTimeout(() => setToastMessage(null), 3500)
      return () => clearTimeout(timer)
    }
  }, [toastMessage])

  // Feature 4: Fast In-Store Price & Weighted Scale Calculator Modal
  const [calcModalItem, setCalcModalItem] = useState<ShoppingItem | null>(null)
  const [calcMode, setCalcMode] = useState<'price' | 'scale'>('price')
  const [calcShelfPrice, setCalcShelfPrice] = useState<string>('')
  const [calcWeight, setCalcWeight] = useState<string>('')
  const [calcPricePerUnit, setCalcPricePerUnit] = useState<string>('')
  const [calcWeightUnit, setCalcWeightUnit] = useState<string>('lb')

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

  // Group all available items by location in THIS store
  const allLocationGroups = useMemo(() => {
    return groupItemsByShopLocation(availableItems, currentShop)
  }, [availableItems, currentShop])

  // Filter and sort items within each location group according to user preferences
  const locationGroups = useMemo(() => {
    return allLocationGroups
      .map(({ location, items: groupItems }) => {
        let itemsToShow = groupItems
        if (hideCheckedItems) {
          itemsToShow = itemsToShow.filter((i) => !i.inCart)
        }
        if (moveCheckedToBottom) {
          itemsToShow = [...itemsToShow].sort((a, b) => {
            if (a.inCart !== b.inCart) {
              return a.inCart ? 1 : -1 // unchecked first, checked at bottom
            }
            return a.name.localeCompare(b.name)
          })
        }
        return {
          location,
          items: itemsToShow,
          pickedCount: groupItems.filter((i) => i.inCart).length,
          totalCount: groupItems.length,
        }
      })
      .filter((g) => (hideCheckedItems ? g.items.length > 0 : true))
  }, [allLocationGroups, hideCheckedItems, moveCheckedToBottom])

  const toggleSectionCollapse = (location: string) => {
    setCollapsedSections((prev) => {
      const group = locationGroups.find((g) => g.location === location)
      const isAllDone = group ? group.totalCount > 0 && group.pickedCount === group.totalCount : false
      const defaultState = autoCollapseCompleted && isAllDone
      const currentVal = prev[location] !== undefined ? prev[location] : defaultState
      return {
        ...prev,
        [location]: !currentVal,
      }
    })
  }

  const handleToggleInCart = async (itemId: string) => {
    triggerHaptic(25)
    await toggleInCart(itemId)
  }

  const scrollToAisle = (loc: string) => {
    const el = document.getElementById(`aisle-section-${encodeURIComponent(loc)}`)
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' })
      triggerHaptic(15)
    }
  }

  const handleMoveOutOfStock = async (item: ShoppingItem, targetShopId?: string) => {
    const currentDetail = item.shops[currentShop.id] || { available: true, price: null, location: '' }
    const updatedShops = {
      ...item.shops,
      [currentShop.id]: {
        ...currentDetail,
        available: false, // Mark out of stock / excluded from this store stop
      },
    }

    let targetShopName = ''
    if (targetShopId) {
      const targetDetail = item.shops[targetShopId] || { available: true, price: null, location: '' }
      updatedShops[targetShopId] = {
        ...targetDetail,
        available: true, // Make sure it is included at target store
      }
      targetShopName = shops.find((s) => s.id === targetShopId)?.name || 'next stop'
    }

    await updateItem(item.id, { shops: updatedShops })
    triggerHaptic(30)
    setOutOfStockItem(null)

    if (targetShopId) {
      setToastMessage(`Moved "${item.name}" to ${targetShopName}`)
    } else {
      setToastMessage(`Excluded "${item.name}" from ${currentShop.name} (kept on list)`)
    }
  }

  const openPriceCalculator = (item: ShoppingItem) => {
    const currentPrice = item.shops[currentShop.id]?.price
    const isWeightUnit = ['lb', 'lbs', 'oz', 'kg'].includes(item.unit?.toLowerCase())

    setCalcModalItem(item)
    setCalcShelfPrice(currentPrice !== null && currentPrice !== undefined ? currentPrice.toString() : '')
    setCalcWeight(item.quantity ? item.quantity.toString() : '1')
    setCalcPricePerUnit(
      item.shops[currentShop.id]?.unitPrice?.toString() ||
        (currentPrice !== null && currentPrice !== undefined ? currentPrice.toString() : '')
    )
    setCalcWeightUnit(isWeightUnit ? item.unit : 'lb')
    setCalcMode(isWeightUnit ? 'scale' : 'price')
    triggerHaptic(15)
  }

  const handleSaveCalculatorPrice = async () => {
    if (!calcModalItem) return
    let finalPrice: number | null = null

    if (calcMode === 'scale') {
      const w = parseFloat(calcWeight)
      const ppu = parseFloat(calcPricePerUnit)
      if (!isNaN(w) && !isNaN(ppu)) {
        finalPrice = Number((w * ppu).toFixed(2))
      }
    } else {
      const p = parseFloat(calcShelfPrice)
      if (!isNaN(p)) {
        finalPrice = p
      }
    }

    if (finalPrice !== null) {
      await updateItemShopDetail(calcModalItem.id, currentShop.id, {
        price: finalPrice,
      })
      triggerHaptic(30)
      setToastMessage(`Updated price for ${calcModalItem.name} to $${finalPrice.toFixed(2)}`)
    }

    setCalcModalItem(null)
  }

  // Feature 2: Next pending aisle for runner navigation
  const nextPendingAisle = locationGroups.find((g) => g.pickedCount < g.totalCount)

  // Feature 5: Multi-store stop sequencing
  const currentStopIndex = visibleShops.findIndex((s) => s.id === currentShop.id)
  const nextShop =
    currentStopIndex !== -1 && currentStopIndex < visibleShops.length - 1
      ? visibleShops[currentStopIndex + 1]
      : null
  const nextShopItemCount = nextShop ? getShopItemCount(nextShop.id) : 0

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
      ) : (
        <div className="space-y-4">
          {/* Celebration Card when all items are picked */}
          {pendingItems.length === 0 && (
            <div className="text-center py-8 bg-emerald-50 rounded-2xl border border-emerald-200 p-6 mb-2">
              <PartyPopper className="w-10 h-10 text-emerald-600 mx-auto mb-2 animate-bounce" />
              <h3 className="text-base sm:text-lg font-bold text-emerald-900">
                All items picked for {currentShop.name}!
              </h3>
              <p className="text-xs text-emerald-700 mt-1">
                Ready to checkout or proceed to your next store stop?
              </p>
              <button
                onClick={handleFinishTrip}
                className="mt-3 px-5 py-2.5 bg-emerald-600 text-white rounded-xl text-xs sm:text-sm font-bold shadow-md hover:bg-emerald-700 transition"
              >
                Review & Finish Trip
              </button>
            </div>
          )}

          {/* View Options Toolbar: Next Aisle pill & Subtle '···' View Options Dropdown */}
          <div className="flex items-center justify-between mb-2 gap-2 pt-1">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Aisles & Items
              </span>
              <span className="text-[11px] font-semibold text-slate-400">
                ({cartItems.length} of {availableItems.length} picked)
              </span>
            </div>

            <div className="flex items-center gap-1.5">
              {/* Feature 2: Next pending aisle jump pill */}
              {nextPendingAisle && (
                <button
                  type="button"
                  onClick={() => scrollToAisle(nextPendingAisle.location)}
                  className="px-2.5 py-1 rounded-xl text-[11px] font-bold bg-slate-900 text-white hover:bg-slate-800 active:scale-95 transition flex items-center gap-1 shadow-2xs"
                  title={`Scroll directly to next pending aisle: ${nextPendingAisle.location}`}
                >
                  <Navigation className="w-3 h-3 text-emerald-400" />
                  <span>Next: {nextPendingAisle.location}</span>
                  <ChevronDown className="w-2.5 h-2.5 text-slate-400" />
                </button>
              )}

              {/* Subtle '···' View Options Button & Dropdown */}
              <div className="relative" ref={optionsPopoverRef}>
                <button
                  type="button"
                  onClick={() => setShowOptionsPopover(!showOptionsPopover)}
                  className={`p-1.5 rounded-xl border transition shadow-2xs flex items-center justify-center relative ${
                    showOptionsPopover || hideCheckedItems || (keepScreenAwake && wakeLockActive)
                      ? 'border-emerald-500 bg-emerald-50 text-emerald-800'
                      : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-100'
                  }`}
                  title="Shopping View Options & Settings"
                  aria-label="Shopping View Options & Settings"
                >
                  <MoreHorizontal className="w-4 h-4" />
                  {/* Subtle active badge dot if non-default option is set */}
                  {hideCheckedItems && (
                    <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-emerald-600 rounded-full border-2 border-white" />
                  )}
                </button>

                {/* Dropdown Popover */}
                {showOptionsPopover && (
                  <div className="absolute right-0 top-9 w-72 bg-white rounded-2xl border border-slate-200 shadow-xl p-3 z-30 animate-in fade-in duration-150">
                    <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-2 px-1 flex items-center gap-1.5">
                      <SlidersHorizontal className="w-3 h-3 text-slate-400" />
                      <span>Shopping View Options</span>
                    </div>

                    <div className="space-y-1">
                      {/* Option 1: Keep Screen Awake */}
                      <label className="flex items-center justify-between p-2 rounded-xl hover:bg-slate-50 cursor-pointer text-xs transition">
                        <div className="flex items-center gap-2.5">
                          {keepScreenAwake ? (
                            <Sun className="w-4 h-4 text-amber-500 shrink-0" />
                          ) : (
                            <Moon className="w-4 h-4 text-slate-400 shrink-0" />
                          )}
                          <div>
                            <div className="font-semibold text-slate-800">Keep Screen Awake</div>
                            <div className="text-[10px] text-slate-400">
                              {keepScreenAwake ? 'Screen stays on while shopping' : 'Standard phone sleep'}
                            </div>
                          </div>
                        </div>
                        <input
                          type="checkbox"
                          checked={keepScreenAwake}
                          onChange={(e) => {
                            triggerHaptic(15)
                            setKeepScreenAwake(e.target.checked)
                          }}
                          className="w-4 h-4 rounded text-amber-500 focus:ring-amber-400 accent-amber-500 shrink-0 ml-2"
                        />
                      </label>

                      {/* Option 2: Auto-collapse Done */}
                      <label className="flex items-center justify-between p-2 rounded-xl hover:bg-slate-50 cursor-pointer text-xs transition">
                        <div className="flex items-center gap-2.5">
                          <ChevronUp className="w-4 h-4 text-blue-500 shrink-0" />
                          <div>
                            <div className="font-semibold text-slate-800">Auto-collapse Done</div>
                            <div className="text-[10px] text-slate-400">
                              Fold aisles once all items are picked
                            </div>
                          </div>
                        </div>
                        <input
                          type="checkbox"
                          checked={autoCollapseCompleted}
                          onChange={(e) => {
                            triggerHaptic(15)
                            setAutoCollapseCompleted(e.target.checked)
                          }}
                          className="w-4 h-4 rounded text-blue-500 focus:ring-blue-400 accent-blue-500 shrink-0 ml-2"
                        />
                      </label>

                      {/* Option 3: Checked at bottom */}
                      <label className="flex items-center justify-between p-2 rounded-xl hover:bg-slate-50 cursor-pointer text-xs transition">
                        <div className="flex items-center gap-2.5">
                          <ArrowDownNarrowWide className="w-4 h-4 text-slate-600 shrink-0" />
                          <div>
                            <div className="font-semibold text-slate-800">Checked at bottom</div>
                            <div className="text-[10px] text-slate-400">
                              Sort crossed-off items to bottom
                            </div>
                          </div>
                        </div>
                        <input
                          type="checkbox"
                          checked={moveCheckedToBottom}
                          onChange={(e) => {
                            triggerHaptic(15)
                            setMoveCheckedToBottom(e.target.checked)
                          }}
                          className="w-4 h-4 rounded text-slate-600 focus:ring-slate-500 accent-slate-600 shrink-0 ml-2"
                        />
                      </label>

                      {/* Option 4: Hide checked */}
                      <label className="flex items-center justify-between p-2 rounded-xl hover:bg-slate-50 cursor-pointer text-xs transition">
                        <div className="flex items-center gap-2.5">
                          {hideCheckedItems ? (
                            <EyeOff className="w-4 h-4 text-emerald-600 shrink-0" />
                          ) : (
                            <Eye className="w-4 h-4 text-slate-400 shrink-0" />
                          )}
                          <div>
                            <div className="font-semibold text-slate-800">Hide checked items</div>
                            <div className="text-[10px] text-slate-400">
                              {hideCheckedItems
                                ? `Hidden (${cartItems.length} picked)`
                                : 'Show all picked items'}
                            </div>
                          </div>
                        </div>
                        <input
                          type="checkbox"
                          checked={hideCheckedItems}
                          onChange={(e) => {
                            triggerHaptic(15)
                            setHideCheckedItems(e.target.checked)
                          }}
                          className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500 accent-emerald-600 shrink-0 ml-2"
                        />
                      </label>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* When all items are checked and hideCheckedItems is ON */}
          {hideCheckedItems && locationGroups.length === 0 && (
            <div className="p-6 text-center bg-slate-50 rounded-2xl border border-dashed border-slate-300">
              <CheckCircle2 className="w-8 h-8 text-emerald-600 mx-auto mb-2" />
              <div className="text-sm font-bold text-slate-800">
                All {cartItems.length} {cartItems.length === 1 ? 'item is' : 'items are'} checked off and hidden
              </div>
              <button
                type="button"
                onClick={() => setHideCheckedItems(false)}
                className="mt-2 text-xs text-emerald-700 font-bold hover:underline"
              >
                Show checked items
              </button>
            </div>
          )}

          {/* Location / Aisle Groups */}
          {locationGroups.map(({ location, items: groupItems, pickedCount, totalCount }) => {
            const isAllPickedInAisle = totalCount > 0 && pickedCount === totalCount
            const isAutoCollapsed = autoCollapseCompleted && isAllPickedInAisle
            const isCollapsed =
              collapsedSections[location] !== undefined
                ? collapsedSections[location]
                : isAutoCollapsed

            return (
              <div
                key={location}
                id={`aisle-section-${encodeURIComponent(location)}`}
                className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden transition-all scroll-mt-24"
              >
                {/* Location / Aisle Category Header */}
                <button
                  onClick={() => toggleSectionCollapse(location)}
                  className="w-full flex items-center justify-between px-4 py-3 bg-slate-50/80 border-b border-slate-100 hover:bg-slate-100/80 transition text-left"
                >
                  <div className="flex items-center gap-2">
                    <div
                      className={`p-1.5 rounded-lg ${
                        isAllPickedInAisle
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-emerald-50 text-emerald-700'
                      }`}
                    >
                      <MapPin className="w-3.5 h-3.5" />
                    </div>
                    <div>
                      <span className="text-xs font-bold text-slate-900 tracking-tight">
                        {location}
                      </span>
                      {isAllPickedInAisle ? (
                        <span className="text-[11px] text-emerald-700 font-semibold ml-2">
                          ✓ All {totalCount} picked
                        </span>
                      ) : (
                        <span className="text-[11px] text-slate-500 ml-2">
                          ({totalCount - pickedCount} to pick • {totalCount} total)
                        </span>
                      )}
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
                      const isPicked = item.inCart
                      const comp = compareShopPrices(item, currentShop.id, shops)
                      const shopDetail = item.shops[currentShop.id]
                      const itemUnitPrice = shopDetail?.price || null
                      const quantity = item.quantity || 1
                      const totalItemPrice = itemUnitPrice !== null ? itemUnitPrice * quantity : null

                      return (
                        <div
                          key={item.id}
                          className={`p-3.5 sm:p-4 transition flex items-center justify-between gap-3 ${
                            isPicked
                              ? 'bg-slate-50/70 hover:bg-slate-100/70'
                              : 'hover:bg-slate-50/60 bg-white'
                          }`}
                        >
                          {/* Left: Checkbox & Item details */}
                          <div className="flex items-start gap-3 min-w-0 flex-1">
                            <button
                              onClick={() => handleToggleInCart(item.id)}
                              className="transition shrink-0 mt-0.5"
                              title={isPicked ? 'Mark as unpicked' : 'Mark as picked into cart'}
                            >
                              {isPicked ? (
                                <CheckCircle2 className="w-6 h-6 text-emerald-600 fill-emerald-100" />
                              ) : (
                                <Circle className="w-6 h-6 text-slate-300 hover:text-emerald-600" />
                              )}
                            </button>

                            <div className="min-w-0 flex-1">
                              <div className="flex items-center gap-1.5 flex-wrap">
                                <span
                                  className={`text-sm tracking-tight ${
                                    isPicked
                                      ? 'line-through text-slate-400 font-medium'
                                      : 'text-slate-900 font-bold'
                                  }`}
                                >
                                  {item.name}
                                </span>
                                <span
                                  className={`inline-flex items-center text-xs font-semibold px-2 py-0.5 rounded-md ${
                                    isPicked
                                      ? 'bg-slate-200/60 text-slate-400'
                                      : 'bg-slate-100 text-slate-700'
                                  }`}
                                >
                                  {quantity} {item.unit}
                                </span>

                                {/* Inline Price Comparison Micro-Chips */}
                                {comp.isBestPriceHere && (
                                  <span
                                    className={`inline-flex items-center gap-1 text-xs font-bold px-2 py-0.5 rounded-md transition ${
                                      isPicked
                                        ? 'bg-slate-100 text-slate-400 line-through'
                                        : 'bg-emerald-100/70 text-emerald-800'
                                    }`}
                                  >
                                    <Sparkles className={`w-3 h-3 shrink-0 ${isPicked ? 'text-slate-400' : 'text-emerald-600'}`} />
                                    <span>Best Price</span>
                                  </span>
                                )}

                                {comp.isCheaperElsewhere && comp.cheapestShop && (
                                  <span
                                    className={`inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-md transition ${
                                      isPicked
                                        ? 'bg-slate-100 text-slate-400 line-through'
                                        : 'bg-rose-100/70 text-rose-800'
                                    }`}
                                    title={`Cheaper at ${comp.cheapestShop.name}: ${formatPrice(comp.cheapestPrice)}${
                                      comp.cheapestUnitPrice
                                        ? ` (${formatUnitPrice(comp.cheapestUnitPrice, item.shops[comp.cheapestShop.id]?.packageUnit)})`
                                        : ''
                                    }`}
                                  >
                                    <TrendingDown className={`w-3 h-3 shrink-0 ${isPicked ? 'text-slate-400' : 'text-rose-600'}`} />
                                    <span>
                                      {comp.cheapestShop.name}: {formatPrice(comp.cheapestPrice)}
                                    </span>
                                  </span>
                                )}

                                <button
                                  onClick={() => onEditItem(item)}
                                  className="text-slate-400 hover:text-emerald-700 p-0.5 rounded transition"
                                  title="Edit item / aisles"
                                >
                                  <Edit2 className="w-3 h-3" />
                                </button>
                                <button
                                  type="button"
                                  onClick={() => {
                                    triggerHaptic(15)
                                    setOutOfStockItem(item)
                                  }}
                                  className="text-slate-400 hover:text-rose-600 p-0.5 rounded transition"
                                  title="Out of stock? Shift to another store stop or exclude"
                                >
                                  <PackageX className="w-3 h-3" />
                                </button>
                              </div>

                              {item.notes && (
                                <p
                                  className={`text-xs mt-0.5 italic ${
                                    isPicked ? 'text-slate-400 line-through' : 'text-slate-500'
                                  }`}
                                >
                                  {item.notes}
                                </p>
                              )}
                            </div>
                          </div>

                          {/* Right: Price box */}
                          <div className={`shrink-0 flex items-center gap-2 ${isPicked ? 'opacity-70' : ''}`}>
                            <button
                              type="button"
                              onClick={() => openPriceCalculator(item)}
                              className="group flex flex-col items-end px-2.5 py-1 rounded-lg border border-slate-200 hover:border-emerald-300 hover:bg-emerald-50/50 active:scale-95 transition text-right shadow-2xs"
                              title="Tap to update price or calculate produce scale weight"
                            >
                              {/* Top line: Total cost */}
                              <div className="flex items-center gap-1.5">
                                <span
                                  className={`text-sm font-extrabold tracking-tight ${
                                    isPicked ? 'line-through text-slate-400' : 'text-slate-900'
                                  }`}
                                >
                                  {formatPrice(totalItemPrice)}
                                </span>
                                <Calculator className="w-3 h-3 text-slate-400 group-hover:text-emerald-600 transition" />
                              </div>

                              {/* Second line: Price per item when quantity > 1 */}
                              {quantity > 1 && itemUnitPrice !== null && (
                                <div className="text-[10px] text-slate-400 font-medium">
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

      {/* 6. Sticky Bottom Summary Bar */}
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
              {nextShop && (
                <button
                  onClick={async () => {
                    await clearCart(true)
                    setShowTripSummary(false)
                    setSelectedShopId(nextShop.id)
                    triggerHaptic(40)
                    confetti({ particleCount: 60, spread: 60, origin: { y: 0.5 } })
                  }}
                  className="w-full py-3 px-4 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white rounded-xl text-xs sm:text-sm font-bold shadow-md transition flex items-center justify-center gap-2"
                >
                  <span>Complete Stop & Start Stop {currentStopIndex + 2}: {nextShop.name}</span>
                  {nextShopItemCount > 0 && (
                    <span className="bg-white/20 px-2 py-0.5 rounded-full text-xs font-bold">
                      {nextShopItemCount} items
                    </span>
                  )}
                  <ArrowRight className="w-4 h-4 ml-1" />
                </button>
              )}

              <button
                onClick={async () => {
                  await clearCart(true)
                  setShowTripSummary(false)
                }}
                className={`w-full py-2.5 px-4 rounded-xl text-xs sm:text-sm font-bold transition ${
                  nextShop
                    ? 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                    : 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm'
                }`}
              >
                {nextShop ? 'Mark Purchased & End Trip Here' : 'Mark Purchased & Clear from List'}
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

      {/* 9. Toast Notification Banner */}
      {toastMessage && (
        <div className="fixed bottom-20 left-1/2 -translate-x-1/2 z-50 bg-slate-900/95 text-white px-4 py-2.5 rounded-xl shadow-xl border border-slate-700 text-xs font-semibold flex items-center gap-2 backdrop-blur animate-in fade-in slide-in-from-bottom-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* 10. Out of Stock & Move Store Modal */}
      {outOfStockItem && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl">
            <div className="flex items-start justify-between gap-3 mb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-rose-100 text-rose-600 flex items-center justify-center shrink-0">
                  <PackageX className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900 leading-tight">
                    Item Out of Stock?
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    <span className="font-bold text-slate-800">{outOfStockItem.name}</span> at {currentShop.name}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setOutOfStockItem(null)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-slate-600 mb-4">
              Choose what to do with this item for your shopping trip:
            </p>

            <div className="space-y-2 mb-4">
              {/* Option to move to other shops */}
              {shops
                .filter((s) => s.id !== currentShop.id)
                .map((targetShop) => {
                  const isNextStop = nextShop?.id === targetShop.id
                  return (
                    <button
                      key={targetShop.id}
                      onClick={() => handleMoveOutOfStock(outOfStockItem, targetShop.id)}
                      className={`w-full p-3 rounded-xl border text-left flex items-center justify-between transition ${
                        isNextStop
                          ? 'bg-emerald-50/70 border-emerald-300 hover:bg-emerald-100/70 text-emerald-900'
                          : 'bg-white border-slate-200 hover:bg-slate-50 text-slate-800'
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <Store className={`w-4 h-4 ${isNextStop ? 'text-emerald-600' : 'text-slate-400'}`} />
                        <div>
                          <div className="text-xs font-bold">
                            Move to {targetShop.name}
                            {isNextStop && (
                              <span className="ml-1.5 text-[10px] font-extrabold uppercase bg-emerald-600 text-white px-1.5 py-0.2 rounded-full">
                                Next Stop
                              </span>
                            )}
                          </div>
                          <div className="text-[11px] text-slate-500">
                            Remove from {currentShop.name} and pick up at {targetShop.name}
                          </div>
                        </div>
                      </div>
                      <ArrowRight className="w-4 h-4 text-slate-400 shrink-0" />
                    </button>
                  )
                })}

              {/* Option to just exclude from this store stop without reassigning */}
              <button
                onClick={() => handleMoveOutOfStock(outOfStockItem)}
                className="w-full p-3 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 text-left flex items-center justify-between transition"
              >
                <div>
                  <div className="text-xs font-bold text-slate-800">
                    Exclude from {currentShop.name} Only
                  </div>
                  <div className="text-[11px] text-slate-500">
                    Keep on your list for future trips, but remove from today's {currentShop.name} stop
                  </div>
                </div>
                <X className="w-4 h-4 text-slate-400 shrink-0" />
              </button>
            </div>

            <button
              onClick={() => setOutOfStockItem(null)}
              className="w-full py-2 text-xs font-semibold text-slate-500 hover:text-slate-700"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* 11. Quick Price & Produce Scale Calculator Modal */}
      {calcModalItem && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl">
            <div className="flex items-start justify-between gap-3 mb-4">
              <div>
                <h3 className="text-base font-bold text-slate-900">
                  Update Price at {currentShop.name}
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  <span className="font-bold text-slate-800">{calcModalItem.name}</span>
                  {calcModalItem.quantity ? ` (${calcModalItem.quantity} ${calcModalItem.unit})` : ''}
                </p>
              </div>
              <button
                onClick={() => setCalcModalItem(null)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Mode Switcher */}
            <div className="grid grid-cols-2 gap-1.5 p-1 bg-slate-100 rounded-xl mb-4">
              <button
                type="button"
                onClick={() => setCalcMode('price')}
                className={`py-1.5 px-3 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 transition ${
                  calcMode === 'price'
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Calculator className="w-3.5 h-3.5 text-emerald-600" />
                <span>Direct Shelf Price</span>
              </button>
              <button
                type="button"
                onClick={() => setCalcMode('scale')}
                className={`py-1.5 px-3 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 transition ${
                  calcMode === 'scale'
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Scale className="w-3.5 h-3.5 text-emerald-600" />
                <span>Produce / Scale</span>
              </button>
            </div>

            {/* Mode 1: Shelf Price with Steppers */}
            {calcMode === 'price' && (
              <div className="space-y-4 mb-5">
                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1">
                    Shelf Price per item
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-lg">
                      $
                    </span>
                    <input
                      type="number"
                      step="0.01"
                      autoFocus
                      placeholder="0.00"
                      value={calcShelfPrice}
                      onChange={(e) => setCalcShelfPrice(e.target.value)}
                      className="w-full pl-8 pr-3 py-2.5 text-xl font-black text-slate-900 border border-slate-300 rounded-xl focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 outline-none"
                    />
                  </div>
                </div>

                {/* Quick Stepper Buttons */}
                <div>
                  <div className="text-[11px] font-semibold text-slate-500 mb-1.5">
                    Quick Adjust:
                  </div>
                  <div className="grid grid-cols-4 gap-1.5">
                    {[
                      { label: '-$1.00', delta: -1.0, isMinus: true },
                      { label: '-$0.10', delta: -0.1, isMinus: true },
                      { label: '+$0.10', delta: 0.1, isMinus: false },
                      { label: '+$1.00', delta: 1.0, isMinus: false },
                    ].map((step) => (
                      <button
                        key={step.label}
                        type="button"
                        onClick={() => {
                          triggerHaptic(10)
                          const cur = parseFloat(calcShelfPrice) || 0
                          const nextVal = Math.max(0, cur + step.delta)
                          setCalcShelfPrice(nextVal.toFixed(2))
                        }}
                        className="py-1.5 px-2 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-lg text-xs font-bold text-slate-700 active:scale-95 transition flex items-center justify-center gap-0.5"
                      >
                        {step.isMinus ? <Minus className="w-3 h-3 text-slate-400" /> : <Plus className="w-3 h-3 text-slate-400" />}
                        <span>{step.label.replace(/^[+-]/, '')}</span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Mode 2: Scale Weight x Price/Unit */}
            {calcMode === 'scale' && (
              <div className="space-y-4 mb-5">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1">
                      Scale Weight
                    </label>
                    <div className="flex items-center gap-1.5">
                      <input
                        type="number"
                        step="0.01"
                        autoFocus
                        placeholder="e.g. 2.45"
                        value={calcWeight}
                        onChange={(e) => setCalcWeight(e.target.value)}
                        className="w-full px-3 py-2 text-base font-bold text-slate-900 border border-slate-300 rounded-xl focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 outline-none"
                      />
                      <span className="text-xs font-semibold text-slate-500">
                        {calcWeightUnit}
                      </span>
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1">
                      Price per {calcWeightUnit}
                    </label>
                    <div className="relative">
                      <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-sm">
                        $
                      </span>
                      <input
                        type="number"
                        step="0.01"
                        placeholder="e.g. 1.99"
                        value={calcPricePerUnit}
                        onChange={(e) => setCalcPricePerUnit(e.target.value)}
                        className="w-full pl-6 pr-2 py-2 text-base font-bold text-slate-900 border border-slate-300 rounded-xl focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 outline-none"
                      />
                    </div>
                  </div>
                </div>

                {/* Calculation preview */}
                <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center justify-between">
                  <div className="text-xs text-emerald-800">
                    <span className="font-semibold">{calcWeight || '0'} {calcWeightUnit}</span>
                    <span> × </span>
                    <span className="font-semibold">${calcPricePerUnit || '0.00'}/{calcWeightUnit}</span>
                  </div>
                  <div className="text-sm font-extrabold text-emerald-900">
                    ={' '}
                    {formatPrice(
                      (parseFloat(calcWeight) || 0) * (parseFloat(calcPricePerUnit) || 0)
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Modal Actions */}
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setCalcModalItem(null)}
                className="w-1/3 py-2.5 px-3 bg-slate-100 text-slate-700 rounded-xl text-xs font-semibold hover:bg-slate-200 transition"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSaveCalculatorPrice}
                className="w-2/3 py-2.5 px-3 bg-emerald-600 text-white rounded-xl text-xs sm:text-sm font-bold shadow-md hover:bg-emerald-700 transition flex items-center justify-center gap-1.5"
              >
                <Check className="w-4 h-4" />
                <span>Save Price to Store</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
