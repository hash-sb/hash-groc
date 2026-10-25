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
  Navigation,
  Check,
  X,
  MoreVertical,
  SlidersHorizontal,
  Layers,
} from 'lucide-react'
import confetti from 'canvas-confetti'
import { useShopping } from '../context/ShoppingContext'
import type { ShoppingItem, PurchasedItemRecord } from '../types'
import {
  compareShopPrices,
  formatPrice,
  formatUnitPrice,
  getOptimalStorePackage,
  groupItemsByShopLocation,
  isCheapestAtStore,
  type EvaluatedPackageOption,
} from '../utils/pricing'

interface ShoppingModeViewProps {
  onEditItem: (item: ShoppingItem, shopId?: string) => void
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
    items,
    updateItem,
    toggleInCart,
    updateItemShopDetail,
    clearCart,
    recordTripReceipt,
  } = useShopping()

  const [showUnavailableDrawer, setShowUnavailableDrawer] = useState<boolean>(false)
  const [showTripSummary, setShowTripSummary] = useState<boolean>(false)
  const [collapsedSections, setCollapsedSections] = useState<Record<string, boolean>>({})
  const [itemMenuModal, setItemMenuModal] = useState<ShoppingItem | null>(null)

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

  // Fast In-Store Shelf Price Modal (Sale price override for trip)
  const [shelfPriceItem, setShelfPriceItem] = useState<ShoppingItem | null>(null)
  const [shelfPriceInput, setShelfPriceInput] = useState<string>('')

  // Feature: Interactive Package Size Picker & Quick Quantity
  const [sizePickerItem, setSizePickerItem] = useState<{
    item: ShoppingItem
    options: EvaluatedPackageOption[]
    bestOptId: string
    activeOptId: string
  } | null>(null)

  const [quickQuantityItem, setQuickQuantityItem] = useState<{
    item: ShoppingItem
    currentQty: number
  } | null>(null)

  const handleSelectPackageOption = async (item: ShoppingItem, optionId: string) => {
    triggerHaptic(15)
    await updateItemShopDetail(item.id, currentShop.id, {
      selectedOptionId: optionId,
    })
  }

  const handleUpdateItemQuantity = async (item: ShoppingItem, newPacks: number) => {
    if (newPacks < 1) return
    triggerHaptic(15)
    await updateItemShopDetail(item.id, currentShop.id, {
      storeQuantity: newPacks,
    })
    const shopDetail = item.shops[currentShop.id]
    if (!shopDetail?.packageOptions || shopDetail.packageOptions.length === 0) {
      await updateItem(item.id, { quantity: newPacks })
    }
  }

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

  // Running Totals Calculation (uses store-specific optimal package fulfillment)
  const cartTotal = cartItems.reduce((sum, item) => {
    const optResult = getOptimalStorePackage(item, currentShop?.id)
    return sum + (optResult.selectedOption.fulfillmentCost || 0)
  }, 0)

  const remainingTotal = pendingItems.reduce((sum, item) => {
    const optResult = getOptimalStorePackage(item, currentShop?.id)
    return sum + (optResult.selectedOption.fulfillmentCost || 0)
  }, 0)

  const tripEstimatedTotal = cartTotal + remainingTotal

  // Estimated Savings calculation based on fulfillment costs
  const estimatedSavings = availableItems.reduce((sum, item) => {
    const comp = compareShopPrices(item, currentShop?.id, shops)
    if (comp.isBestPriceHere && comp.currentFulfillmentCost !== null) {
      const otherCosts = comp.allStorePrices
        .filter((p) => p.shop.id !== currentShop?.id && p.available && p.fulfillmentCost > 0)
        .map((p) => p.fulfillmentCost)
      if (otherCosts.length > 0) {
        const maxOtherCost = Math.max(...otherCosts)
        if (maxOtherCost > comp.currentFulfillmentCost) {
          return sum + (maxOtherCost - comp.currentFulfillmentCost)
        }
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

  const openShelfPriceModal = (item: ShoppingItem) => {
    const optResult = getOptimalStorePackage(item, currentShop.id)
    const activeOpt = optResult.selectedOption
    const detail = item.shops[currentShop.id]
    const currentPrice = activeOpt.price > 0 ? activeOpt.price : detail?.price

    setShelfPriceItem(item)
    setShelfPriceInput(
      currentPrice !== null && currentPrice !== undefined ? currentPrice.toString() : ''
    )
    triggerHaptic(15)
  }

  const handleSaveShelfPrice = async () => {
    if (!shelfPriceItem) return
    const p = parseFloat(shelfPriceInput)
    if (isNaN(p) || p < 0) {
      setShelfPriceItem(null)
      return
    }

    const roundedPrice = Number(p.toFixed(2))
    const detail = shelfPriceItem.shops[currentShop.id]
    const optResult = getOptimalStorePackage(shelfPriceItem, currentShop.id)
    const activeOpt = optResult.selectedOption

    if (detail?.packageOptions && detail.packageOptions.length > 0) {
      const updatedOptions = detail.packageOptions.map((opt) => {
        if (opt.id === activeOpt.id) {
          const newUnitPrice =
            opt.packageSize && opt.packageSize > 0
              ? Number((roundedPrice / opt.packageSize).toFixed(4))
              : null
          return {
            ...opt,
            price: roundedPrice,
            unitPrice: newUnitPrice,
          }
        }
        return opt
      })
      await updateItemShopDetail(shelfPriceItem.id, currentShop.id, {
        price: roundedPrice,
        packageOptions: updatedOptions,
      })
    } else {
      await updateItemShopDetail(shelfPriceItem.id, currentShop.id, {
        price: roundedPrice,
      })
    }

    triggerHaptic(30)
    setToastMessage(`Updated shelf price for ${shelfPriceItem.name} to $${roundedPrice.toFixed(2)}`)
    setShelfPriceItem(null)
  }

  // Feature 2: Next pending aisle for runner navigation
  const nextPendingAisle = locationGroups.find((g) => g.pickedCount < g.totalCount)

  // Count items still needed to be picked at a specific shop (excluding items already in cart at current stop)
  const getShopPendingItemCount = (shopId: string) => {
    return allNeededItems.filter((item) => {
      // Items currently in cart at the active stop are about to be checked out / purchased
      if (item.inCart) return false
      const detail = item.shops[shopId]
      const isCarried = detail ? detail.available : true
      if (!isCarried) return false
      if (saveMode) return isCheapestAtStore(item, shopId, shops)
      return true
    }).length
  }

  // Feature 5: Multi-store stop sequencing (Finding the next shop that actually has items to pick)
  const currentShopIndex = shops.findIndex((s) => s.id === currentShop.id)
  const shopsAfterCurrentWithItems = shops
    .slice(currentShopIndex + 1)
    .filter((s) => getShopPendingItemCount(s.id) > 0)
  const shopsBeforeCurrentWithItems = shops
    .slice(0, Math.max(0, currentShopIndex))
    .filter((s) => getShopPendingItemCount(s.id) > 0)

  // Next shop with items: first check sequence ahead, then wrap around if earlier stops still have items
  const nextShop = shopsAfterCurrentWithItems[0] || shopsBeforeCurrentWithItems[0] || null
  const nextShopItemCount = nextShop ? getShopPendingItemCount(nextShop.id) : 0

  const handleSaveReceiptAndCheckout = async () => {
    if (cartItems.length > 0) {
      const purchasedItems: PurchasedItemRecord[] = cartItems.map((item) => {
        const optResult = getOptimalStorePackage(item, currentShop.id)
        const activeOpt = optResult.selectedOption
        const packs = activeOpt.packsNeeded
        const price = activeOpt.price > 0 ? activeOpt.price : (item.shops[currentShop.id]?.price || 0)
        return {
          itemId: item.id,
          name: item.name,
          category: item.category,
          quantity: item.quantity,
          unit: activeOpt.packageUnit || item.unit,
          packs,
          price,
          totalPrice: Number((price * packs).toFixed(2)),
        }
      })

      await recordTripReceipt({
        shopId: currentShop.id,
        shopName: currentShop.name,
        shopColor: currentShop.color,
        totalAmount: Number(cartTotal.toFixed(2)),
        totalSavings: Number((estimatedSavings || 0).toFixed(2)),
        itemsCount: cartItems.length,
        items: purchasedItems,
      })
    }
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
      {/* 1. Store Stops Bar & Quick Controls */}
      <div className="mb-3">
        <div className="flex items-center justify-between mb-2 flex-wrap gap-2">
          <div className="flex items-center gap-2">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
              <Store className="w-4 h-4 text-emerald-600" />
              <span>Store Stops</span>
            </label>
            {hideEmptyStores && hiddenCount > 0 && (
              <span className="text-[10px] font-bold bg-slate-100 text-slate-600 border border-slate-200 px-1.5 py-0.5 rounded-full">
                {visibleShops.length} of {shops.length}
              </span>
            )}
          </div>

          {/* Quick Header Micro-Chips: Save Mode & Hide Empty */}
          <div className="flex items-center gap-1.5">
            {/* Save Mode Micro-Toggle */}
            <button
              type="button"
              onClick={() => {
                triggerHaptic(15)
                setSaveMode((prev) => !prev)
              }}
              className={`flex items-center gap-1 px-2.5 py-1 rounded-xl text-xs font-semibold transition border ${
                saveMode
                  ? 'bg-emerald-600 text-white border-emerald-600 shadow-2xs'
                  : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
              }`}
              title="Save Mode: Only show items cheapest at this store"
            >
              <Zap className={`w-3.5 h-3.5 ${saveMode ? 'text-amber-300 fill-amber-300' : 'text-slate-400'}`} />
              <span>Best Prices Only</span>
            </button>

            {/* Hide Empty Stores Toggle */}
            <button
              type="button"
              onClick={() => setHideEmptyStores((prev) => !prev)}
              className={`flex items-center gap-1 px-2 py-1 rounded-xl text-xs font-semibold transition border ${
                hideEmptyStores
                  ? 'bg-slate-800 text-white border-slate-800 shadow-2xs'
                  : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
              }`}
              title="Toggle hiding stores without any items to shop"
            >
              {hideEmptyStores ? (
                <EyeOff className="w-3.5 h-3.5" />
              ) : (
                <Eye className="w-3.5 h-3.5 text-slate-400" />
              )}
              <span>Hide empty</span>
            </button>
          </div>
        </div>

        {/* Store Tabs (Clean, swipeable pills) */}
        <div className="flex gap-2 overflow-x-auto pb-1.5 no-scrollbar">
          {visibleShops.map((shop) => {
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
              <button
                key={shop.id}
                onClick={() => setSelectedShopId(shop.id)}
                className={`px-3 py-1.5 rounded-xl border shrink-0 transition-all text-left flex items-center gap-2 ${
                  isSelected
                    ? 'border-emerald-500 bg-emerald-50 text-emerald-950 font-bold shadow-xs ring-2 ring-emerald-500/20'
                    : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300 hover:bg-slate-50'
                }`}
              >
                <div className="flex flex-col">
                  <span className="text-xs font-bold tracking-tight">{shop.name}</span>
                  <div className="text-[10px] text-slate-500">
                    {isFullyPicked ? (
                      <span className="text-emerald-700 font-semibold">✓ Done ({count})</span>
                    ) : (
                      <span>
                        {count} {count === 1 ? 'item' : 'items'}
                      </span>
                    )}
                  </div>
                </div>
              </button>
            )
          })}

          <button
            onClick={onOpenStoreModal}
            className="flex items-center gap-1 px-3 py-1.5 rounded-xl border border-dashed border-slate-300 text-slate-500 hover:text-slate-800 hover:border-slate-400 bg-white/50 shrink-0 text-xs font-semibold transition"
            title="Manage stores"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Store</span>
          </button>
        </div>
      </div>

      {/* Save Mode 1-line Hint when items are hidden */}
      {saveMode && savedForOtherStores.length > 0 && (
        <div className="mb-3 px-3 py-1.5 rounded-xl bg-indigo-50 border border-indigo-200/70 text-xs text-indigo-900 flex items-center justify-between">
          <span className="text-[11px]">
            💡 <strong>{savedForOtherStores.length}</strong> {savedForOtherStores.length === 1 ? 'item was' : 'items were'} cheaper elsewhere and hidden here.
          </span>
          <button
            onClick={() => setSaveMode(false)}
            className="text-[11px] font-bold underline text-indigo-700 hover:text-indigo-900 shrink-0 ml-2 cursor-pointer"
          >
            Show All
          </button>
        </div>
      )}

      {/* Items Not Carried at this Store Banner (Compact) */}
      {unavailableItems.length > 0 && (
        <div className="mb-3 bg-amber-50/90 border border-amber-200/80 rounded-xl px-3 py-2 text-xs text-amber-900 flex items-center justify-between gap-2 shadow-2xs">
          <div className="flex items-center gap-2 min-w-0 truncate">
            <AlertTriangle className="w-3.5 h-3.5 text-amber-600 shrink-0" />
            <span className="truncate">
              <strong>{unavailableItems.length}</strong> {unavailableItems.length === 1 ? 'item not' : 'items not'} carried here:{' '}
              <span className="text-amber-800">
                {unavailableItems.map((i) => i.name).slice(0, 2).join(', ')}
                {unavailableItems.length > 2 && ` +${unavailableItems.length - 2} more`}
              </span>
            </span>
          </div>
          <button
            onClick={() => setShowUnavailableDrawer(!showUnavailableDrawer)}
            className="text-[11px] font-bold text-amber-700 hover:text-amber-900 underline shrink-0 ml-1 cursor-pointer"
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
                  <SlidersHorizontal className="w-4 h-4" />
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
                className={`rounded-2xl border transition-all scroll-mt-24 overflow-hidden ${
                  isAllPickedInAisle
                    ? 'bg-slate-50/50 border-slate-200/60 opacity-80'
                    : 'bg-white border-slate-200 shadow-xs'
                }`}
              >
                {/* Location / Aisle Category Header */}
                <button
                  onClick={() => toggleSectionCollapse(location)}
                  className={`w-full flex items-center justify-between px-4 py-2.5 transition text-left cursor-pointer ${
                    isAllPickedInAisle
                      ? 'bg-slate-50/50 hover:bg-slate-100/50 text-slate-500'
                      : 'bg-slate-50/80 hover:bg-slate-100/80 border-b border-slate-100 text-slate-900'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <div
                      className={`p-1.5 rounded-lg ${
                        isAllPickedInAisle
                          ? 'bg-emerald-100/80 text-emerald-800'
                          : 'bg-emerald-50 text-emerald-700'
                      }`}
                    >
                      <MapPin className="w-3.5 h-3.5" />
                    </div>
                    <div>
                      <span className="text-xs font-bold tracking-tight">
                        {location}
                      </span>
                      {isAllPickedInAisle ? (
                        <span className="text-[11px] text-emerald-700 font-semibold ml-2">
                          ✓ All {totalCount} picked
                        </span>
                      ) : (
                        <span className="text-[11px] text-slate-500 ml-2 font-medium">
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
                      const optResult = getOptimalStorePackage(item, currentShop.id)
                      const bestOpt = optResult.bestOption
                      const activeOpt = optResult.selectedOption
                      const itemUnitPrice = activeOpt.price > 0 ? activeOpt.price : (shopDetail?.price || null)
                      const packsNeeded = activeOpt.packsNeeded
                      const totalItemPrice = itemUnitPrice !== null ? itemUnitPrice * packsNeeded : null
                      const itemSizeText = activeOpt.label
                        ? (activeOpt.packageSize ? `${activeOpt.packageSize} ${activeOpt.packageUnit} (${activeOpt.label})` : activeOpt.label)
                        : activeOpt.packageSize
                          ? `${activeOpt.packageSize} ${activeOpt.packageUnit}`
                          : shopDetail?.packageSize
                            ? `${shopDetail.packageSize} ${shopDetail.packageUnit || item.unit}`
                            : `${item.quantity || 1} ${item.unit || ''}`.trim()

                      return (
                        <div
                          key={item.id}
                          className={`p-3 sm:p-3.5 transition flex items-center justify-between gap-3 ${
                            isPicked
                              ? 'bg-slate-50/70 hover:bg-slate-100/70'
                              : 'hover:bg-slate-50/60 bg-white'
                          }`}
                        >
                          {/* Left: Checkbox & Item details */}
                          <div className="flex items-center gap-3 min-w-0 flex-1">
                            <button
                              type="button"
                              onClick={() => handleToggleInCart(item.id)}
                              className="transition shrink-0 cursor-pointer p-0.5 active:scale-90"
                              title={isPicked ? 'Mark as unpicked' : 'Mark as picked into cart'}
                            >
                              {isPicked ? (
                                <CheckCircle2 className="w-6 h-6 text-emerald-600 fill-emerald-100" />
                              ) : (
                                <Circle className="w-6 h-6 text-slate-300 hover:text-emerald-600" />
                              )}
                            </button>

                            <div className="min-w-0 flex-1">
                              {/* Row 1: Item Name, Best Price badge (icon only), Cheaper elsewhere tag */}
                              <div className="flex items-center gap-1.5 flex-wrap">
                                <span
                                  onClick={() => handleToggleInCart(item.id)}
                                  className={`text-sm tracking-tight cursor-pointer select-none ${
                                    isPicked
                                      ? 'line-through text-slate-400 font-medium'
                                      : 'text-slate-900 font-bold'
                                  }`}
                                >
                                  {item.name}
                                </span>

                                {/* Best Price (icon only) */}
                                {comp.isBestPriceHere && (
                                  <span
                                    className={`inline-flex items-center p-0.5 rounded transition ${
                                      isPicked ? 'text-slate-400' : 'text-emerald-600'
                                    }`}
                                    title="Best price at this store"
                                  >
                                    <Sparkles className="w-3.5 h-3.5 shrink-0" />
                                  </span>
                                )}

                                {comp.isCheaperElsewhere && comp.cheapestShop && (
                                  <span
                                    className={`inline-flex items-center gap-1 text-[10px] font-semibold px-1.5 py-0.2 rounded-md transition ${
                                      isPicked
                                        ? 'bg-slate-100 text-slate-400 line-through'
                                        : 'bg-rose-100/70 text-rose-800'
                                    }`}
                                    title={`Cheaper at ${comp.cheapestShop.name}: ${
                                      comp.cheapestUnitPrice
                                        ? `${formatUnitPrice(comp.cheapestUnitPrice, comp.cheapestPackageUnit || item.shops[comp.cheapestShop.id]?.packageUnit)}`
                                        : formatPrice(comp.cheapestFulfillmentCost)
                                    }`}
                                  >
                                    <TrendingDown className={`w-2.5 h-2.5 shrink-0 ${isPicked ? 'text-slate-400' : 'text-rose-600'}`} />
                                    <span>{comp.cheapestShop.name}</span>
                                  </span>
                                )}
                              </div>

                              {/* Row 2: Packs count (number only) & Quantity Size (always show!) */}
                              <div className="flex items-center gap-1.5 flex-wrap mt-1">
                                {/* Packs count (number only, tap to change) */}
                                <button
                                  type="button"
                                  onClick={() => setQuickQuantityItem({ item, currentQty: packsNeeded })}
                                  className={`inline-flex items-center justify-center min-w-[22px] px-1.5 py-0.5 rounded-lg text-xs font-bold font-mono border transition cursor-pointer active:scale-95 ${
                                    isPicked
                                      ? 'bg-slate-100 text-slate-400 border-slate-200/60'
                                      : 'bg-slate-100 hover:bg-slate-200/80 text-slate-800 border-slate-200'
                                  }`}
                                  title="Tap to change quantity / packs needed"
                                >
                                  <span>{packsNeeded}</span>
                                </button>

                                {/* Quantity Size (Always show!) */}
                                {optResult.hasMultipleOptions ? (
                                  <button
                                    type="button"
                                    onClick={() =>
                                      setSizePickerItem({
                                        item,
                                        options: optResult.allOptions,
                                        bestOptId: bestOpt.id,
                                        activeOptId: activeOpt.id,
                                      })
                                    }
                                    className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-lg text-xs font-semibold border transition cursor-pointer active:scale-95 ${
                                      isPicked
                                        ? 'bg-slate-100 text-slate-400 border-slate-200/60'
                                        : activeOpt.id === bestOpt.id
                                        ? 'bg-indigo-50/90 hover:bg-indigo-100 text-indigo-900 border-indigo-200'
                                        : 'bg-amber-50 hover:bg-amber-100 text-amber-900 border-amber-200'
                                    }`}
                                    title="Tap to switch package size"
                                  >
                                    <Layers className="w-3 h-3 text-indigo-600 shrink-0" />
                                    <span>{activeOpt.label || `${activeOpt.packageSize} ${activeOpt.packageUnit}`}</span>
                                    <ChevronDown className="w-2.5 h-2.5 opacity-60 shrink-0 ml-0.5" />
                                  </button>
                                ) : (
                                  <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-xs font-medium bg-slate-50 text-slate-700 border border-slate-200/60">
                                    <span>{itemSizeText}</span>
                                  </span>
                                )}

                                {item.notes && (
                                  <span
                                    className={`text-[11px] italic truncate max-w-[140px] ${
                                      isPicked ? 'text-slate-400 line-through' : 'text-slate-500'
                                    }`}
                                    title={item.notes}
                                  >
                                    {item.notes}
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>

                          {/* Right: Price box & Vertical 3-dot item menu */}
                          <div className={`shrink-0 flex items-center gap-1 sm:gap-1.5 ${isPicked ? 'opacity-60' : ''}`}>
                            <button
                              type="button"
                              onClick={() => openShelfPriceModal(item)}
                              className="group flex flex-col items-end px-2 py-1 rounded-xl border border-transparent hover:border-emerald-300 hover:bg-emerald-50/40 active:scale-95 transition text-right cursor-pointer"
                              title="Tap to enter shelf / sale price"
                            >
                              <div className="flex items-center gap-1">
                                <span
                                  className={`text-sm font-extrabold tracking-tight ${
                                    isPicked ? 'line-through text-slate-400' : 'text-slate-900'
                                  }`}
                                >
                                  {formatPrice(totalItemPrice)}
                                </span>
                              </div>

                              {packsNeeded > 1 && itemUnitPrice !== null && (
                                <div className="text-[10px] text-slate-400 font-medium">
                                  ({packsNeeded} × {formatPrice(itemUnitPrice)})
                                </div>
                              )}

                              {(activeOpt.unitPrice || shopDetail?.unitPrice) && (
                                <div className="text-[9px] text-indigo-700/80 font-mono font-medium">
                                  {formatUnitPrice(activeOpt.unitPrice || shopDetail?.unitPrice, activeOpt.packageUnit || shopDetail?.packageUnit)}
                                </div>
                              )}
                            </button>

                            {/* Vertical 3-Dot Item Actions Menu */}
                            <button
                              type="button"
                              onClick={() => {
                                triggerHaptic(15)
                                setItemMenuModal(item)
                              }}
                              className="p-1 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition cursor-pointer"
                              title="Item actions"
                            >
                              <MoreVertical className="w-4 h-4" />
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
      <div className="fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-md border-t border-slate-200 px-3 py-2.5 sm:px-6 sm:py-3 z-20 shadow-xl">
        <div className="max-w-4xl mx-auto flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-emerald-50 text-emerald-700 border border-emerald-200 shrink-0">
              <DollarSign className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="text-lg sm:text-xl font-black text-slate-900 leading-tight">
                  {formatPrice(cartTotal)}
                </span>
                <span className="text-xs font-semibold text-slate-500">
                  ({cartItems.length} of {availableItems.length} picked)
                </span>
              </div>
              <div className="text-[11px] text-slate-400 flex items-center gap-1.5 flex-wrap">
                <span>Left: {formatPrice(remainingTotal)}</span>
                <span>•</span>
                <span>Trip: {formatPrice(tripEstimatedTotal)}</span>
                {estimatedSavings > 0 && (
                  <>
                    <span>•</span>
                    <span className="text-emerald-700 font-semibold">
                      Save {formatPrice(estimatedSavings)}
                    </span>
                  </>
                )}
              </div>
            </div>
          </div>

          <button
            onClick={handleFinishTrip}
            disabled={cartItems.length === 0}
            className={`px-4 sm:px-6 py-2.5 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-2 transition shadow-md shrink-0 ${
              cartItems.length > 0
                ? 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-600/30 active:scale-95 cursor-pointer'
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
              {nextShop ? (
                <>
                  <button
                    onClick={async () => {
                      await handleSaveReceiptAndCheckout()
                      await clearCart(true)
                      setShowTripSummary(false)
                      setSelectedShopId(nextShop.id)
                      triggerHaptic(40)
                      confetti({ particleCount: 60, spread: 60, origin: { y: 0.5 } })
                    }}
                    className="w-full py-3 px-4 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white rounded-xl text-xs sm:text-sm font-bold shadow-md transition flex items-center justify-center gap-2 cursor-pointer active:scale-95"
                  >
                    <span>Complete Stop & Continue to {nextShop.name}</span>
                    <span className="bg-white/20 px-2 py-0.5 rounded-full text-xs font-bold">
                      {nextShopItemCount} {nextShopItemCount === 1 ? 'item' : 'items'}
                    </span>
                    <ArrowRight className="w-4 h-4 ml-1" />
                  </button>

                  <button
                    onClick={async () => {
                      await handleSaveReceiptAndCheckout()
                      await clearCart(true)
                      setShowTripSummary(false)
                    }}
                    className="w-full py-2.5 px-4 rounded-xl text-xs sm:text-sm font-bold transition bg-slate-100 hover:bg-slate-200 text-slate-700 cursor-pointer"
                  >
                    Mark Purchased & End Trip Here
                  </button>
                </>
              ) : (
                <button
                  onClick={async () => {
                    await handleSaveReceiptAndCheckout()
                    await clearCart(true)
                    setShowTripSummary(false)
                    confetti({ particleCount: 100, spread: 80, origin: { y: 0.5 } })
                  }}
                  className="w-full py-3 px-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs sm:text-sm font-bold shadow-md transition flex items-center justify-center gap-2 cursor-pointer active:scale-95"
                >
                  <PartyPopper className="w-4 h-4" />
                  <span>Mark Purchased & Finish Entire Trip (All Done!)</span>
                </button>
              )}

              <button
                onClick={() => setShowTripSummary(false)}
                className="w-full py-2 px-4 bg-white border border-slate-200 text-slate-700 rounded-xl text-xs font-semibold hover:bg-slate-50 transition cursor-pointer"
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

      {/* 11. Fast Shelf / Sale Price Modal */}
      {shelfPriceItem && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in"
          onClick={() => setShelfPriceItem(null)}
        >
          <div
            className="bg-white rounded-2xl max-w-sm w-full p-5 shadow-2xl border border-slate-200"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between gap-3 mb-3">
              <div>
                <h3 className="text-base font-extrabold text-slate-900">
                  Update Shelf Price
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  <span className="font-bold text-slate-800">{shelfPriceItem.name}</span>
                  {' '}at {currentShop.name}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShelfPriceItem(null)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg hover:bg-slate-100 transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4 mb-4">
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1">
                  Shelf / Sale Price ($)
                </label>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 font-extrabold text-xl">
                    $
                  </span>
                  <input
                    type="number"
                    step="0.01"
                    autoFocus
                    placeholder="0.00"
                    value={shelfPriceInput}
                    onChange={(e) => setShelfPriceInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault()
                        handleSaveShelfPrice()
                      }
                    }}
                    className="w-full pl-9 pr-3 py-2.5 text-2xl font-black text-slate-900 border border-slate-300 rounded-xl focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 outline-none"
                  />
                </div>
              </div>

              {/* Quick Stepper Buttons */}
              <div>
                <div className="text-[11px] font-semibold text-slate-400 mb-1">
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
                        const cur = parseFloat(shelfPriceInput) || 0
                        const nextVal = Math.max(0, cur + step.delta)
                        setShelfPriceInput(nextVal.toFixed(2))
                      }}
                      className="py-1.5 px-2 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-lg text-xs font-bold text-slate-700 active:scale-95 transition flex items-center justify-center gap-0.5 cursor-pointer"
                    >
                      {step.isMinus ? <Minus className="w-3 h-3 text-slate-400" /> : <Plus className="w-3 h-3 text-slate-400" />}
                      <span>{step.label.replace(/^[+-]/, '')}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2 pt-1">
              <button
                type="button"
                onClick={() => setShelfPriceItem(null)}
                className="flex-1 py-2.5 rounded-xl border border-slate-200 text-slate-700 font-bold text-xs hover:bg-slate-50 cursor-pointer transition"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSaveShelfPrice}
                className="flex-1 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-sm cursor-pointer transition active:scale-95"
              >
                Save Price
              </button>
            </div>
          </div>
        </div>
      )}



      {/* Interactive Size Picker Modal Sheet */}
      {sizePickerItem && (
        <div
          className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4 z-50 animate-in fade-in duration-150"
          onClick={() => setSizePickerItem(null)}
        >
          <div
            className="bg-white rounded-t-2xl sm:rounded-2xl shadow-2xl border border-slate-200 max-w-md w-full p-5 space-y-4 max-h-[85vh] overflow-y-auto animate-in slide-in-from-bottom sm:zoom-in-95 duration-150"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <div className="flex items-center gap-1.5">
                  <Layers className="w-4 h-4 text-indigo-600" />
                  <h3 className="text-base font-extrabold text-slate-900">
                    Pick Package Size
                  </h3>
                </div>
                <p className="text-xs text-slate-500 mt-0.5">
                  {sizePickerItem.item.name} at <span className="font-bold text-slate-700">{currentShop.name}</span>
                </p>
              </div>
              <button
                type="button"
                onClick={() => setSizePickerItem(null)}
                className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-100 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="text-[11px] font-semibold text-slate-600 bg-emerald-50/80 p-2.5 rounded-xl border border-emerald-100 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>The best unit price is selected by default for maximum grocery savings.</span>
            </div>

            <div className="space-y-2">
              {sizePickerItem.options.map((opt) => {
                const isSelected = opt.id === sizePickerItem.activeOptId
                const isBestValue = opt.id === sizePickerItem.bestOptId
                return (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={async () => {
                      await handleSelectPackageOption(sizePickerItem.item, opt.id)
                      setSizePickerItem(null)
                    }}
                    className={`w-full p-3.5 rounded-xl text-left transition flex items-center justify-between gap-3 cursor-pointer border ${
                      isSelected
                        ? 'bg-indigo-50/90 border-indigo-300 text-indigo-950 shadow-xs'
                        : 'bg-white hover:bg-slate-50 border-slate-200 text-slate-800'
                    }`}
                  >
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-sm font-bold text-slate-900">
                          {opt.label || `${opt.packageSize} ${opt.packageUnit}`}
                        </span>
                        {isBestValue && (
                          <span className="inline-flex items-center gap-0.5 px-2 py-0.5 rounded text-[10px] font-black bg-emerald-600 text-white shadow-2xs">
                            <Sparkles className="w-2.5 h-2.5" />
                            Best Price
                          </span>
                        )}
                        {opt.isLowestCashOutlay && !isBestValue && (
                          <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-200">
                            Lowest Upfront Cash
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-3 mt-1.5 text-xs text-slate-600 font-mono">
                        <span className="font-extrabold text-slate-900 text-sm">
                          {formatPrice(opt.price)}
                        </span>
                        {opt.unitPrice && (
                          <span className="text-indigo-700 font-medium">
                            ({formatUnitPrice(opt.unitPrice, opt.packageUnit)})
                          </span>
                        )}
                        {opt.packageSize > 0 && (
                          <span className="text-slate-400 font-sans text-[11px]">
                            {opt.packageSize} {opt.packageUnit}
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="shrink-0">
                      {isSelected ? (
                        <div className="w-6 h-6 rounded-full bg-indigo-600 text-white flex items-center justify-center shadow-xs">
                          <Check className="w-3.5 h-3.5 stroke-[3]" />
                        </div>
                      ) : (
                        <div className="w-6 h-6 rounded-full border-2 border-slate-200 hover:border-slate-300" />
                      )}
                    </div>
                  </button>
                )
              })}
            </div>

            <div className="pt-2">
              <button
                type="button"
                onClick={() => setSizePickerItem(null)}
                className="w-full py-2.5 rounded-xl border border-slate-200 text-slate-700 font-bold text-xs hover:bg-slate-50 cursor-pointer"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Quick Quantity Picker Modal */}
      {quickQuantityItem && (
        <div
          className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in duration-150"
          onClick={() => setQuickQuantityItem(null)}
        >
          <div
            className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-sm w-full p-5 space-y-4 animate-in zoom-in-95 duration-150"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-base font-extrabold text-slate-900">
                  {quickQuantityItem.item.name}
                </h3>
                <p className="text-xs text-slate-500">
                  Set purchase quantity at <span className="font-bold text-slate-700">{currentShop.name}</span>
                </p>
              </div>
              <button
                type="button"
                onClick={() => setQuickQuantityItem(null)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Quick Presets */}
            <div>
              <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-2">
                Quick Presets
              </label>
              <div className="grid grid-cols-4 gap-2">
                {[1, 2, 3, 4, 5, 6, 8, 10].map((qty) => (
                  <button
                    key={qty}
                    type="button"
                    onClick={async () => {
                      await handleUpdateItemQuantity(quickQuantityItem.item, qty)
                      setQuickQuantityItem(null)
                    }}
                    className={`py-2 rounded-xl text-sm font-bold font-mono transition cursor-pointer ${
                      quickQuantityItem.currentQty === qty
                        ? 'bg-emerald-600 text-white shadow-sm'
                        : 'bg-slate-100 hover:bg-slate-200 text-slate-800'
                    }`}
                  >
                    {qty}
                  </button>
                ))}
              </div>
            </div>

            {/* Custom Stepper Input */}
            <div>
              <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-2">
                Custom Quantity
              </label>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() =>
                    setQuickQuantityItem((prev) =>
                      prev ? { ...prev, currentQty: Math.max(1, prev.currentQty - 1) } : null
                    )
                  }
                  disabled={quickQuantityItem.currentQty <= 1}
                  className="p-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 disabled:opacity-40 text-slate-700 cursor-pointer"
                >
                  <Minus className="w-4 h-4" />
                </button>
                <input
                  type="number"
                  min="1"
                  value={quickQuantityItem.currentQty}
                  onChange={(e) => {
                    const val = parseInt(e.target.value, 10)
                    if (!isNaN(val) && val >= 1) {
                      setQuickQuantityItem((prev) => (prev ? { ...prev, currentQty: val } : null))
                    }
                  }}
                  className="w-full text-center text-lg font-black font-mono py-2 rounded-xl border border-slate-200 focus:outline-emerald-600"
                />
                <button
                  type="button"
                  onClick={() =>
                    setQuickQuantityItem((prev) =>
                      prev ? { ...prev, currentQty: prev.currentQty + 1 } : null
                    )
                  }
                  className="p-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div className="flex items-center gap-2 pt-2">
              <button
                type="button"
                onClick={() => setQuickQuantityItem(null)}
                className="flex-1 py-2.5 rounded-xl border border-slate-200 text-slate-700 font-bold text-xs hover:bg-slate-50 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={async () => {
                  await handleUpdateItemQuantity(quickQuantityItem.item, quickQuantityItem.currentQty)
                  setQuickQuantityItem(null)
                }}
                className="flex-1 py-2.5 rounded-xl bg-emerald-600 text-white font-bold text-xs hover:bg-emerald-700 shadow-sm cursor-pointer"
              >
                Apply Quantity
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 9. Item Actions Mini Modal / Action Sheet */}
      {itemMenuModal && (
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4 z-50 animate-in fade-in"
          onClick={() => setItemMenuModal(null)}
        >
          <div
            className="bg-white w-full sm:max-w-xs rounded-t-2xl sm:rounded-2xl p-4 shadow-2xl border border-slate-200"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-2">
              <div className="min-w-0 pr-2">
                <div className="text-[10px] text-slate-400 uppercase tracking-wider font-bold">Item Actions</div>
                <div className="font-bold text-sm text-slate-900 truncate">{itemMenuModal.name}</div>
              </div>
              <button
                type="button"
                onClick={() => setItemMenuModal(null)}
                className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100 transition cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-1">
              <button
                type="button"
                onClick={() => {
                  const it = itemMenuModal
                  setItemMenuModal(null)
                  onEditItem(it, currentShop.id)
                }}
                className="w-full px-3 py-2.5 text-left text-xs font-semibold text-slate-700 hover:bg-slate-50 rounded-xl flex items-center gap-2.5 transition cursor-pointer"
              >
                <Edit2 className="w-4 h-4 text-emerald-600" />
                <span>Edit Item & Aisles</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  const it = itemMenuModal
                  setItemMenuModal(null)
                  triggerHaptic(15)
                  setOutOfStockItem(it)
                }}
                className="w-full px-3 py-2.5 text-left text-xs font-semibold text-rose-600 hover:bg-rose-50 rounded-xl flex items-center gap-2.5 transition cursor-pointer"
              >
                <PackageX className="w-4 h-4 text-rose-500" />
                <span>Mark Out of Stock / Move Stop</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  const it = itemMenuModal
                  setItemMenuModal(null)
                  openShelfPriceModal(it)
                }}
                className="w-full px-3 py-2.5 text-left text-xs font-semibold text-slate-700 hover:bg-slate-50 rounded-xl flex items-center gap-2.5 transition cursor-pointer"
              >
                <DollarSign className="w-4 h-4 text-emerald-600" />
                <span>Update Shelf / Sale Price</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
