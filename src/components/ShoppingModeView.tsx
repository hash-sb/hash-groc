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
  Search,
  ShoppingCart,
  Zap,
  Eye,
  EyeOff,
  ArrowDownNarrowWide,
  Sun,
  Moon,
  PackageX,
  Check,
  X,
  MoreVertical,
  SlidersHorizontal,
  Layers,
  Hash,
  Undo2,
  Trash2,
  RotateCcw,
  Barcode,
  GripVertical,
  ArrowUpDown,
  Receipt,
} from 'lucide-react'
import confetti from 'canvas-confetti'
import { useShopping } from '../context/ShoppingContext'
import type { ShoppingItem, PurchasedItemRecord, Shop, ItemShopDetail } from '../types'
import { KeypadCalculatorModal } from './KeypadCalculatorModal'
import { BarcodeScannerModal } from './BarcodeScannerModal'
import { ReceiptScannerModal } from './ReceiptScannerModal'
import {
  compareShopPrices,
  formatPrice,
  formatUnitPrice,
  getOptimalStorePackage,
  groupItemsByShopLocation,
  isCheapestAtStore,
  isShopSkippedForTrip,
  type EvaluatedPackageOption,
} from '../utils/pricing'
import { matchesWordPrefix, scoreWordPrefixMatch } from '../utils/search'

interface ShoppingModeViewProps {
  onEditItem: (item: ShoppingItem, shopId?: string, focusField?: 'price' | 'name', focusOptionId?: string) => void
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
    categories,
    quickAddItem,
    updateItem,
    toggleInCart,
    updateItemShopDetail,
    clearCart,
    recordTripReceipt,
    reorderStoreItems,
  } = useShopping()

  // In-Store Quick Add Sheet (Solution 1)
  const [isQuickAddOpen, setIsQuickAddOpen] = useState<boolean>(false)
  const [quickAddSearch, setQuickAddSearch] = useState<string>('')
  const [quickAddCategory, setQuickAddCategory] = useState<string>('Other')
  const [quickAddQty, setQuickAddQty] = useState<number>(1)

  const [showUnavailableDrawer, setShowUnavailableDrawer] = useState<boolean>(false)
  const [showTripSummary, setShowTripSummary] = useState<boolean>(false)
  const [showStoreSwitcherModal, setShowStoreSwitcherModal] = useState<boolean>(false)
  const [collapsedSections, setCollapsedSections] = useState<Record<string, boolean>>({})
  const [itemMenuModal, setItemMenuModal] = useState<ShoppingItem | null>(null)

  // Reorder mode state for store walk-through shelf ordering
  const [isReorderMode, setIsReorderMode] = useState<boolean>(false)
  const [draggedItemId, setDraggedItemId] = useState<string | null>(null)
  const [dragOverItemId, setDragOverItemId] = useState<string | null>(null)
  const [dragLocation, setDragLocation] = useState<string | null>(null)

  // View Options Modal (Menu)
  const [showOptionsPopover, setShowOptionsPopover] = useState<boolean>(false)

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
  const [undoMoveState, setUndoMoveState] = useState<{
    itemId: string
    itemName: string
    previousSkippedShopIds?: string[]
    previousSkippedAt?: number
  } | null>(null)
  const [undoCheckState, setUndoCheckState] = useState<{
    itemId: string
    itemName: string
    previousInCart: boolean
  } | null>(null)
  const [undoRemoveState, setUndoRemoveState] = useState<{
    itemId: string
    itemName: string
    previousQuantity: number
  } | null>(null)
  const [zeroQtyConfirmItem, setZeroQtyConfirmItem] = useState<{
    item: ShoppingItem
    previousQuantity: number
  } | null>(null)

  useEffect(() => {
    if (toastMessage) {
      const timer = setTimeout(() => {
        setToastMessage(null)
        setUndoMoveState(null)
        setUndoCheckState(null)
        setUndoRemoveState(null)
      }, 5000)
      return () => clearTimeout(timer)
    }
  }, [toastMessage])

  // In-Store Barcode Scanner Modal
  const [isBarcodeScannerOpen, setIsBarcodeScannerOpen] = useState<boolean>(false)

  // AI Receipt Scanner Modal
  const [isReceiptScannerOpen, setIsReceiptScannerOpen] = useState<boolean>(false)

  // Feature: Interactive Package Size Picker & Quick Quantity (Calculator)
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
    if (isNaN(newPacks) || newPacks < 0) return
    triggerHaptic(15)
    if (newPacks === 0) {
      setZeroQtyConfirmItem({
        item,
        previousQuantity: item.quantity || 1,
      })
      return
    }
    await updateItem(item.id, { quantity: newPacks })
  }

  const handleConfirmRemoveZeroQty = async () => {
    if (!zeroQtyConfirmItem) return
    const { item, previousQuantity } = zeroQtyConfirmItem
    triggerHaptic(25)
    await updateItem(item.id, { isNeeded: false, inCart: false })
    setZeroQtyConfirmItem(null)

    setUndoMoveState(null)
    setUndoCheckState(null)
    setUndoRemoveState({
      itemId: item.id,
      itemName: item.name,
      previousQuantity,
    })
    setToastMessage(`Removed "${item.name}" from shopping list`)
  }

  const handleUndoRemove = async () => {
    if (!undoRemoveState) return
    triggerHaptic(20)
    await updateItem(undoRemoveState.itemId, {
      isNeeded: true,
      quantity: undoRemoveState.previousQuantity,
    })
    setToastMessage(`Restored "${undoRemoveState.itemName}" to list`)
    setUndoRemoveState(null)
  }

  // All needed items on active shopping list
  const allNeededItems = items.filter((item) => item.isNeeded)

  // Count items needed to buy at a specific shop (taking into account Save Mode & trip skips)
  const getShopItemCount = (shopId: string) => {
    return allNeededItems.filter((item) => {
      const detail = item.shops[shopId]
      const isCarried = detail ? detail.available !== false : true
      if (!isCarried || isShopSkippedForTrip(item, shopId)) return false
      if (saveMode) return isCheapestAtStore(item, shopId, shops)
      return true
    }).length
  }

  // Filter stores that have items to shop
  const nonEmptyShops = shops.filter((s) => getShopItemCount(s.id) > 0)

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

  // Precompute comprehensive trip overview per store
  const tripStoreBreakdown = useMemo(() => {
    return visibleShops.map((shop) => {
      const carriedItems = allNeededItems.filter((item) => {
        const detail = item.shops[shop.id]
        const isCarried = detail ? detail.available !== false : true
        if (!isCarried || isShopSkippedForTrip(item, shop.id)) return false
        if (saveMode) return isCheapestAtStore(item, shop.id, shops)
        return true
      })

      const pickedItems = carriedItems.filter((i) => i.inCart)
      const pendingItems = carriedItems.filter((i) => !i.inCart)

      const storeTotalCost = carriedItems.reduce((sum, item) => {
        const optResult = getOptimalStorePackage(item, shop.id)
        return sum + (optResult.selectedOption.fulfillmentCost || 0)
      }, 0)

      return {
        shop,
        items: carriedItems,
        pendingItems,
        pickedItems,
        totalCount: carriedItems.length,
        pickedCount: pickedItems.length,
        pendingCount: pendingItems.length,
        isFullyPicked: carriedItems.length > 0 && pickedItems.length === carriedItems.length,
        totalCost: storeTotalCost,
      }
    })
  }, [visibleShops, allNeededItems, saveMode, shops])

  const currentShopData = tripStoreBreakdown.find((b) => b.shop.id === currentShop?.id)

  // Items available at this store (carried and not skipped for this trip)
  const carriedAtShopItems = allNeededItems.filter((item) => {
    const detail = item.shops[currentShop?.id]
    const isCarried = detail ? detail.available !== false : true
    return isCarried && !isShopSkippedForTrip(item, currentShop.id)
  })

  // Items needed but NOT carried at this store (permanently excluded)
  const unavailableItems = allNeededItems.filter((item) => {
    const detail = item.shops[currentShop?.id]
    return detail && detail.available === false
  })

  // Items skipped at this store for this trip only (e.g. out of stock or poor quality)
  const skippedAtShopItems = allNeededItems.filter((item) => {
    const detail = item.shops[currentShop?.id]
    const isCarried = detail ? detail.available !== false : true
    return isCarried && isShopSkippedForTrip(item, currentShop.id)
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

  // Filter and sort items within each location group according to user preferences & custom store shelf order
  const locationGroups = useMemo(() => {
    return allLocationGroups
      .map(({ location, items: groupItems }) => {
        let itemsToShow = groupItems
        if (hideCheckedItems && !isReorderMode) {
          itemsToShow = itemsToShow.filter((i) => !i.inCart)
        }

        const sortByShelfOrder = (a: ShoppingItem, b: ShoppingItem) => {
          const orderA = a.shops[currentShop.id]?.orderIndex ?? 9999
          const orderB = b.shops[currentShop.id]?.orderIndex ?? 9999
          if (orderA !== orderB) return orderA - orderB
          return a.name.localeCompare(b.name)
        }

        if (moveCheckedToBottom && !isReorderMode) {
          itemsToShow = [...itemsToShow].sort((a, b) => {
            if (a.inCart !== b.inCart) {
              return a.inCart ? 1 : -1 // unchecked first, checked at bottom
            }
            return sortByShelfOrder(a, b)
          })
        } else {
          itemsToShow = [...itemsToShow].sort(sortByShelfOrder)
        }

        return {
          location,
          items: itemsToShow,
          pickedCount: groupItems.filter((i) => i.inCart).length,
          totalCount: groupItems.length,
        }
      })
      .filter((g) => (hideCheckedItems && !isReorderMode ? g.items.length > 0 : true))
  }, [allLocationGroups, hideCheckedItems, moveCheckedToBottom, currentShop.id, isReorderMode])

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
    const item = items.find((i) => i.id === itemId)
    if (!item) return
    const wasInCart = Boolean(item.inCart)
    triggerHaptic(25)
    await toggleInCart(itemId)

    setUndoMoveState(null)
    setUndoRemoveState(null)
    setUndoCheckState({
      itemId,
      itemName: item.name,
      previousInCart: wasInCart,
    })

    if (!wasInCart) {
      setToastMessage(`Checked off "${item.name}"`)
    } else {
      setToastMessage(`Unchecked "${item.name}"`)
    }
  }

  const handleUndoCheck = async () => {
    if (!undoCheckState) return
    triggerHaptic(20)
    await updateItem(undoCheckState.itemId, { inCart: undoCheckState.previousInCart })
    setToastMessage(
      undoCheckState.previousInCart
        ? `Re-checked "${undoCheckState.itemName}"`
        : `Unchecked "${undoCheckState.itemName}"`
    )
    setUndoCheckState(null)
    setUndoRemoveState(null)
  }

  // Quick Add Helpers & Handlers (Solution 1)
  const quickAddMatches = useMemo(() => {
    const q = quickAddSearch.trim()
    if (!q) {
      return items.filter((item) => !item.isNeeded).slice(0, 20)
    }
    return items
      .filter((item) => matchesWordPrefix(item.name, q))
      .sort((a, b) => {
        const scoreA = scoreWordPrefixMatch(a.name, q)
        const scoreB = scoreWordPrefixMatch(b.name, q)
        if (scoreB !== scoreA) return scoreB - scoreA
        return a.name.localeCompare(b.name)
      })
  }, [items, quickAddSearch])

  const quickAddExactMatch = useMemo(() => {
    const q = quickAddSearch.trim().toLowerCase()
    if (!q) return null
    return items.find((item) => item.name.trim().toLowerCase() === q)
  }, [items, quickAddSearch])

  const quickAddCategoryOptions = useMemo(() => {
    const cats = categories && categories.length > 0 ? categories : ['Produce', 'Dairy', 'Meat', 'Bakery', 'Pantry', 'Frozen', 'Household', 'Other']
    if (cats.some((c) => c.toLowerCase() === 'other')) return cats
    return [...cats, 'Other']
  }, [categories])

  const handleQuickAddExisting = async (item: ShoppingItem, inCart: boolean, overrideQty?: number) => {
    triggerHaptic(30)
    const qty = overrideQty !== undefined && overrideQty > 0 ? overrideQty : Math.max(1, item.quantity || 1)
    const currentDetail = item.shops[currentShop.id]
    const updatedShops = {
      ...item.shops,
      [currentShop.id]: {
        ...(currentDetail || {
          price: null,
          unitPrice: null,
          location: '',
          packageSize: null,
          packageUnit: item.unit || 'ea',
        }),
        available: true,
      },
    }
    const updates: Partial<ShoppingItem> = {
      isNeeded: true,
      inCart,
      quantity: qty,
      shops: updatedShops,
    }
    await updateItem(item.id, updates)
    setToastMessage(inCart ? `Added "${item.name}" to cart!` : `Added "${item.name}" to shopping trip!`)
    setQuickAddSearch('')
    setQuickAddQty(1)
    setIsQuickAddOpen(false)

    const updatedItem: ShoppingItem = {
      ...item,
      ...updates,
      shops: updatedShops,
    }
    onEditItem(updatedItem, currentShop.id, 'price')
  }

  const handleQuickCreateNew = async (inCart: boolean) => {
    const name = quickAddSearch.trim()
    if (!name) return
    triggerHaptic(35)
    const newId = await quickAddItem(name, quickAddCategory || 'Other', quickAddQty)
    const newShops: Record<string, ItemShopDetail> = {}
    shops.forEach((s) => {
      newShops[s.id] = {
        available: true,
        price: null,
        unitPrice: null,
        location: '',
        packageSize: null,
        packageUnit: 'ea',
      }
    })
    const updates: Partial<ShoppingItem> = {
      isNeeded: true,
      inCart,
      shops: newShops,
    }
    await updateItem(newId, updates)
    setToastMessage(inCart ? `Added "${name}" to cart!` : `Added "${name}" to shopping trip!`)
    setQuickAddSearch('')
    setQuickAddQty(1)
    setIsQuickAddOpen(false)

    const now = Date.now()
    const createdItem: ShoppingItem = {
      id: newId,
      name,
      category: quickAddCategory || 'Other',
      quantity: quickAddQty,
      unit: 'pieces',
      isNeeded: true,
      inCart,
      shops: newShops,
      createdAt: now,
      updatedAt: now,
    }
    onEditItem(createdItem, currentShop.id, 'price')
  }

  // Feature 5: Multi-store stop sequencing (Finding the next shop that actually has items to pick)
  const getShopPendingItemCount = (shopId: string) => {
    return allNeededItems.filter((item) => {
      // Items currently in cart at the active stop are about to be checked out / purchased
      if (item.inCart) return false
      const detail = item.shops[shopId]
      const isCarried = detail ? detail.available !== false : true
      if (!isCarried || isShopSkippedForTrip(item, shopId)) return false
      if (saveMode) return isCheapestAtStore(item, shopId, shops)
      return true
    }).length
  }

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

  // Helper to determine the best target shop when shifting an out-of-stock item
  const getTargetShopForMove = (item: ShoppingItem): Shop | null => {
    const currentSkipped = item.skippedShopIds || []
    const simulatedSkipped = currentSkipped.includes(currentShop.id)
      ? currentSkipped
      : [...currentSkipped, currentShop.id]

    const otherShops = shops.filter(
      (s) => s.id !== currentShop.id && !simulatedSkipped.includes(s.id) && item.shops[s.id]?.available !== false
    )
    if (otherShops.length === 0) return null

    // Create a copy simulating that the item is skipped for this trip at currentShop
    const simulatedItem: ShoppingItem = {
      ...item,
      skippedShopIds: simulatedSkipped,
      skippedAt: Date.now(),
    }

    // 1. If Save Mode is active, pick the store where the item will actually be routed (lowest price store)
    if (saveMode) {
      const cheapestShop = otherShops.find((s) =>
        isCheapestAtStore(simulatedItem, s.id, shops)
      )
      if (cheapestShop) return cheapestShop
    }

    // 2. Find any other active store carrying the item with the lowest price
    const pricedShops = otherShops
      .map((shop) => {
        const opt = getOptimalStorePackage(item, shop.id)
        const price = opt.bestOption.price > 0 ? opt.bestOption.price : (item.shops[shop.id]?.price || 0)
        const fulfillmentCost = opt.bestOption.fulfillmentCost || (price * (item.quantity || 1))
        const unitPrice = opt.bestOption.normalizedUnitPrice ?? opt.bestOption.unitPrice ?? null
        return {
          shop,
          price,
          unitPrice,
          fulfillmentCost,
        }
      })
      .filter((entry) => entry.price > 0)

    if (pricedShops.length > 0) {
      pricedShops.sort((a, b) => {
        if (a.unitPrice !== null && b.unitPrice !== null && Math.abs(a.unitPrice - b.unitPrice) > 0.0001) {
          return a.unitPrice - b.unitPrice
        }
        return a.fulfillmentCost - b.fulfillmentCost
      })
      return pricedShops[0].shop
    }

    // 3. Fallback: Next stop in itinerary sequence carrying the item
    if (nextShop && nextShop.id !== currentShop.id && !simulatedSkipped.includes(nextShop.id) && (item.shops[nextShop.id]?.available !== false)) {
      return nextShop
    }

    const nextInSequence = shops
      .slice(currentShopIndex + 1)
      .find((s) => !simulatedSkipped.includes(s.id) && item.shops[s.id]?.available !== false)
    if (nextInSequence) return nextInSequence

    const prevInSequence = shops
      .slice(0, Math.max(0, currentShopIndex))
      .find((s) => !simulatedSkipped.includes(s.id) && item.shops[s.id]?.available !== false)
    if (prevInSequence) return prevInSequence

    return otherShops[0] || null
  }

  const handleSkipItemForTrip = async (item: ShoppingItem, targetShopId?: string) => {
    const currentSkipped = item.skippedShopIds || []
    const updatedSkipped = currentSkipped.includes(currentShop.id)
      ? currentSkipped
      : [...currentSkipped, currentShop.id]

    // Determine the actual store where the item will now be placed
    let destinationShop: Shop | null = null

    const simulatedItem: ShoppingItem = {
      ...item,
      skippedShopIds: updatedSkipped,
      skippedAt: Date.now(),
    }

    if (saveMode) {
      // In Save Mode, the item goes to whichever remaining store is cheapest
      const otherShops = shops.filter((s) => s.id !== currentShop.id)
      const cheapestRemainingShop = otherShops.find((s) =>
        isCheapestAtStore(simulatedItem, s.id, shops)
      )
      if (cheapestRemainingShop) {
        destinationShop = cheapestRemainingShop
      }
    }

    if (!destinationShop && targetShopId) {
      destinationShop = shops.find((s) => s.id === targetShopId) || null
    }

    if (!destinationShop) {
      destinationShop = getTargetShopForMove(simulatedItem)
    }

    // Save previous state for 1-tap Undo
    setUndoCheckState(null)
    setUndoRemoveState(null)
    setUndoMoveState({
      itemId: item.id,
      itemName: item.name,
      previousSkippedShopIds: currentSkipped,
      previousSkippedAt: item.skippedAt,
    })

    triggerHaptic(30)
    setOutOfStockItem(null)

    await updateItem(item.id, {
      skippedShopIds: updatedSkipped,
      skippedAt: Date.now(),
    })

    if (destinationShop) {
      setToastMessage(`Skipped at ${currentShop.name} today → moved to ${destinationShop.name}`)
    } else {
      setToastMessage(`Skipped "${item.name}" at ${currentShop.name} for this trip (resets next trip)`)
    }
  }

  const handleRestoreSkippedItem = async (item: ShoppingItem) => {
    const updatedSkipped = (item.skippedShopIds || []).filter((id) => id !== currentShop.id)
    triggerHaptic(20)
    await updateItem(item.id, {
      skippedShopIds: updatedSkipped,
      skippedAt: updatedSkipped.length === 0 ? undefined : item.skippedAt,
    })
    setToastMessage(`Restored "${item.name}" to ${currentShop.name}`)
  }

  const handleUndoMove = async () => {
    if (!undoMoveState) return
    triggerHaptic(20)
    await updateItem(undoMoveState.itemId, {
      skippedShopIds: undoMoveState.previousSkippedShopIds || [],
      skippedAt: undoMoveState.previousSkippedAt,
    })
    setToastMessage(`Restored "${undoMoveState.itemName}" to ${currentShop.name}`)
    setUndoMoveState(null)
    setUndoCheckState(null)
    setUndoRemoveState(null)
  }

  const handleMoveItemInAisle = async (
    location: string,
    fromIndex: number,
    toIndex: number
  ) => {
    const group = locationGroups.find((g) => g.location === location)
    if (!group) return
    if (
      fromIndex === toIndex ||
      fromIndex < 0 ||
      toIndex < 0 ||
      fromIndex >= group.items.length ||
      toIndex >= group.items.length
    ) {
      return
    }

    triggerHaptic(25)
    const reordered = [...group.items]
    const [moved] = reordered.splice(fromIndex, 1)
    reordered.splice(toIndex, 0, moved)

    const updates = reordered.map((item, idx) => ({
      itemId: item.id,
      orderIndex: idx,
      location,
    }))

    await reorderStoreItems(currentShop.id, updates)
  }

  const handleTouchStartItem = (itemId: string, location: string) => {
    setDraggedItemId(itemId)
    setDragLocation(location)
  }

  const handleTouchMoveItem = (e: React.TouchEvent, location: string) => {
    if (!draggedItemId || dragLocation !== location) return
    const touch = e.touches[0]
    if (!touch) return
    const targetEl = document.elementFromPoint(touch.clientX, touch.clientY)
    const itemEl = targetEl?.closest('[data-reorder-item-id]')
    if (itemEl) {
      const targetId = itemEl.getAttribute('data-reorder-item-id')
      if (targetId && targetId !== dragOverItemId) {
        setDragOverItemId(targetId)
      }
    }
  }

  const handleTouchEndItem = (location: string) => {
    if (
      draggedItemId &&
      dragOverItemId &&
      draggedItemId !== dragOverItemId &&
      dragLocation === location
    ) {
      const group = locationGroups.find((g) => g.location === location)
      if (group) {
        const fromIdx = group.items.findIndex((i) => i.id === draggedItemId)
        const toIdx = group.items.findIndex((i) => i.id === dragOverItemId)
        if (fromIdx !== -1 && toIdx !== -1) {
          handleMoveItemInAisle(location, fromIdx, toIdx)
        }
      }
    }
    setDraggedItemId(null)
    setDragOverItemId(null)
    setDragLocation(null)
  }

  const handleDragStartItem = (e: React.DragEvent, itemId: string, location: string) => {
    setDraggedItemId(itemId)
    setDragLocation(location)
    e.dataTransfer.setData('text/plain', itemId)
    e.dataTransfer.effectAllowed = 'move'
  }

  const handleDragOverItem = (e: React.DragEvent, itemId: string, location: string) => {
    e.preventDefault()
    if (dragLocation === location && dragOverItemId !== itemId) {
      setDragOverItemId(itemId)
    }
  }

  const handleDropItem = (location: string, targetItemId: string) => {
    if (draggedItemId && draggedItemId !== targetItemId && dragLocation === location) {
      const group = locationGroups.find((g) => g.location === location)
      if (group) {
        const fromIdx = group.items.findIndex((i) => i.id === draggedItemId)
        const toIdx = group.items.findIndex((i) => i.id === targetItemId)
        if (fromIdx !== -1 && toIdx !== -1) {
          handleMoveItemInAisle(location, fromIdx, toIdx)
        }
      }
    }
    setDraggedItemId(null)
    setDragOverItemId(null)
    setDragLocation(null)
  }

  const handleResetAisleAlphabetical = async (location: string) => {
    const group = allLocationGroups.find((g) => g.location === location)
    if (!group || group.items.length <= 1) return
    triggerHaptic(20)
    const sorted = [...group.items].sort((a, b) => a.name.localeCompare(b.name))
    const updates = sorted.map((item, idx) => ({
      itemId: item.id,
      orderIndex: idx,
      location,
    }))
    await reorderStoreItems(currentShop.id, updates)
    setToastMessage(`Sorted "${location}" alphabetically`)
  }

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
    <div className="pb-32 max-w-4xl mx-auto px-3 sm:px-6">
      {/* 1. Sticky Store Tabs Header: Store Tabs (Left) + Options (Right) */}
      <div className="sticky top-[60px] z-20 bg-slate-50/95 backdrop-blur-md pt-2 pb-2 -mx-3 px-3 sm:-mx-6 sm:px-6 mb-2.5 flex items-center justify-between gap-2 border-b border-slate-200/60 shadow-2xs">
        {/* Mobile: 1-Tap Store Switcher Dropdown */}
        <div className="flex sm:hidden items-center flex-1 min-w-0">
          {/* Store Switcher Dropdown Button */}
          <button
            type="button"
            onClick={() => setShowStoreSwitcherModal(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-emerald-500 bg-emerald-50 text-emerald-950 font-bold shadow-2xs text-left min-w-0 max-w-[220px] truncate cursor-pointer active:scale-95 transition"
            title="Switch store"
          >
            <div
              className="w-2.5 h-2.5 rounded-full shrink-0"
              style={{ backgroundColor: currentShop.color || '#10b981' }}
            />
            <span className="text-xs font-extrabold truncate">
              {currentShop.name}
            </span>
            <span className="text-[10px] px-1.5 py-0.2 rounded-full font-bold bg-emerald-200/80 text-emerald-900 shrink-0">
              {currentShopData?.isFullyPicked
                ? `✓ ${currentShopData.totalCount}`
                : `${currentShopData?.pendingCount ?? 0} left`}
            </span>
            <ChevronDown className="w-3.5 h-3.5 text-emerald-700 shrink-0" />
          </button>
        </div>

        {/* Desktop: Horizontal Store Tabs Strip */}
        <div className="hidden sm:flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5 flex-1 min-w-0">
          {visibleShops.map((shop) => {
            const isSelected = shop.id === currentShop.id
            const shopData = tripStoreBreakdown.find((b) => b.shop.id === shop.id)
            const count = shopData?.totalCount || 0
            const isFullyPicked = shopData?.isFullyPicked || false

            return (
              <button
                key={shop.id}
                type="button"
                onClick={() => setSelectedShopId(shop.id)}
                className={`px-3 py-1.5 rounded-xl border shrink-0 transition-all text-left flex items-center gap-1.5 cursor-pointer select-none ${
                  isSelected
                    ? 'border-emerald-500 bg-emerald-50 text-emerald-950 font-bold shadow-2xs ring-1 ring-emerald-500/20'
                    : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300 hover:bg-slate-50'
                }`}
              >
                <div
                  className="w-2 h-2 rounded-full shrink-0"
                  style={{ backgroundColor: shop.color || '#10b981' }}
                />
                <span className="text-xs font-bold tracking-tight truncate max-w-[110px] sm:max-w-none">
                  {shop.name}
                </span>
                <span
                  className={`text-[10px] px-1.5 py-0.5 rounded-full font-bold shrink-0 ${
                    isFullyPicked
                      ? 'bg-emerald-200 text-emerald-900'
                      : isSelected
                      ? 'bg-emerald-100 text-emerald-800'
                      : 'bg-slate-100 text-slate-600'
                  }`}
                >
                  {isFullyPicked ? `✓ ${count}` : count}
                </span>
              </button>
            )
          })}

          <button
            type="button"
            onClick={onOpenStoreModal}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl border border-dashed border-slate-300 text-slate-400 hover:text-slate-700 hover:border-slate-400 bg-white/50 shrink-0 text-xs font-semibold transition cursor-pointer"
            title="Manage stores"
          >
            <Plus className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Right: Reorder Mode & View Options Buttons */}
        <div className="flex items-center gap-1.5 shrink-0">
          <button
            type="button"
            onClick={() => {
              triggerHaptic(20)
              setIsReorderMode(!isReorderMode)
              if (isReorderMode) {
                setToastMessage(`Shelf walk-through order saved for ${currentShop.name}`)
              }
            }}
            className={`px-2.5 py-1.5 rounded-xl border transition shadow-2xs flex items-center gap-1.5 cursor-pointer text-xs font-bold ${
              isReorderMode
                ? 'bg-amber-500 border-amber-600 text-white shadow-xs'
                : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-100 hover:border-slate-300'
            }`}
            title={isReorderMode ? 'Done reordering shelf order' : 'Reorder items to match store shelf order'}
          >
            <ArrowUpDown className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">{isReorderMode ? 'Done' : 'Reorder'}</span>
          </button>

          <button
            type="button"
            onClick={() => setShowOptionsPopover(!showOptionsPopover)}
            className={`p-2 rounded-xl border transition shadow-2xs flex items-center justify-center relative cursor-pointer ${
              showOptionsPopover || hideCheckedItems || saveMode || hideEmptyStores || (keepScreenAwake && wakeLockActive)
                ? 'border-emerald-500 bg-emerald-50 text-emerald-800'
                : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-100'
            }`}
            title="Shopping View Options & Settings"
            aria-label="Shopping View Options & Settings"
          >
            <MoreVertical className="w-4 h-4" />
            {/* Subtle active badge dot if any view option is set */}
            {(hideCheckedItems || saveMode || hideEmptyStores || (keepScreenAwake && wakeLockActive)) && (
              <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-emerald-600 rounded-full border-2 border-white" />
            )}
          </button>
        </div>
      </div>

      {/* 2. Compact 1-Line Status Strip for Skipped or Unavailable Items */}
      {(skippedAtShopItems.length > 0 || unavailableItems.length > 0 || (saveMode && savedForOtherStores.length > 0)) && (
        <div className="mb-2.5 px-3 py-1.5 rounded-xl bg-amber-50/90 border border-amber-200/80 text-xs text-amber-900 flex items-center justify-between gap-2 shadow-2xs">
          <div className="flex items-center gap-1.5 min-w-0 truncate text-[11px]">
            {skippedAtShopItems.length > 0 ? (
              <>
                <PackageX className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                <span className="truncate">
                  <strong>{skippedAtShopItems.length}</strong> {skippedAtShopItems.length === 1 ? 'item' : 'items'} skipped today (out of stock/quality)
                  <span className="text-amber-800/80 ml-1">
                    ({skippedAtShopItems.map((i) => i.name).slice(0, 2).join(', ')}{skippedAtShopItems.length > 2 ? ` +${skippedAtShopItems.length - 2}` : ''})
                  </span>
                </span>
              </>
            ) : unavailableItems.length > 0 ? (
              <>
                <AlertTriangle className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                <span className="truncate">
                  <strong>{unavailableItems.length}</strong> {unavailableItems.length === 1 ? 'item not' : 'items not'} carried here
                  <span className="text-amber-800/80 ml-1">
                    ({unavailableItems.map((i) => i.name).slice(0, 2).join(', ')}{unavailableItems.length > 2 ? ` +${unavailableItems.length - 2}` : ''})
                  </span>
                </span>
              </>
            ) : (
              <>
                <Zap className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
                <span className="truncate">
                  <strong>{savedForOtherStores.length}</strong> {savedForOtherStores.length === 1 ? 'item is' : 'items are'} cheaper at other stops
                </span>
              </>
            )}
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {saveMode && savedForOtherStores.length > 0 && (skippedAtShopItems.length > 0 || unavailableItems.length > 0) && (
              <span className="text-[10px] text-indigo-700 font-semibold bg-indigo-100/70 px-1.5 py-0.2 rounded">
                +{savedForOtherStores.length} cheaper elsewhere
              </span>
            )}
            {skippedAtShopItems.length > 0 || unavailableItems.length > 0 ? (
              <button
                type="button"
                onClick={() => setShowUnavailableDrawer(!showUnavailableDrawer)}
                className="text-[11px] font-bold text-amber-800 hover:text-amber-950 underline cursor-pointer"
              >
                {showUnavailableDrawer ? 'Hide' : skippedAtShopItems.length > 0 ? 'View / Restore' : 'View'}
              </button>
            ) : (
              <button
                type="button"
                onClick={() => setSaveMode(false)}
                className="text-[11px] font-bold text-indigo-700 hover:text-indigo-900 underline cursor-pointer"
              >
                Show All
              </button>
            )}
          </div>
        </div>
      )}

      {/* Expanded Skipped / Unavailable Items List */}
      {showUnavailableDrawer && (skippedAtShopItems.length > 0 || unavailableItems.length > 0) && (
        <div className="mb-5 space-y-3">
          {skippedAtShopItems.length > 0 && (
            <div className="p-3.5 bg-amber-50/70 border border-amber-200 rounded-2xl shadow-xs">
              <div className="text-xs font-bold text-amber-950 uppercase tracking-wide mb-2 flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <PackageX className="w-3.5 h-3.5 text-amber-600" />
                  <span>Skipped for today&apos;s trip at {currentShop.name} ({skippedAtShopItems.length}):</span>
                </div>
                <span className="text-[10px] text-amber-700 bg-amber-100 font-semibold px-2 py-0.5 rounded-full normal-case">
                  Resets next trip
                </span>
              </div>
              <div className="space-y-1.5">
                {skippedAtShopItems.map((item) => {
                  const targetShop = getTargetShopForMove(item)
                  return (
                    <div
                      key={item.id}
                      className="flex items-center justify-between p-2 rounded-xl bg-white border border-amber-200/80 text-xs shadow-2xs gap-2"
                    >
                      <div className="min-w-0 flex-1">
                        <span className="font-bold text-slate-800">{item.name}</span>
                        <div className="text-[11px] text-slate-500 flex items-center gap-1 mt-0.5">
                          <span>Moved to:</span>
                          <strong className="text-emerald-700">
                            {targetShop ? targetShop.name : 'another store'}
                          </strong>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleRestoreSkippedItem(item)}
                        className="px-2.5 py-1 bg-amber-100 hover:bg-amber-200 active:bg-amber-300 text-amber-900 font-bold text-xs rounded-lg transition cursor-pointer shrink-0 flex items-center gap-1 active:scale-95"
                      >
                        <RotateCcw className="w-3 h-3" />
                        <span>Restore</span>
                      </button>
                    </div>
                  )
                })}
              </div>
            </div>
          )}

          {unavailableItems.length > 0 && (
            <div className="p-4 bg-white border border-amber-200 rounded-2xl shadow-xs">
              <div className="text-sm font-extrabold text-amber-950 uppercase tracking-wide mb-2.5 flex items-center gap-2">
                <div className="w-6 h-6 rounded-lg bg-amber-500 text-white flex items-center justify-center shrink-0 shadow-2xs">
                  <PackageOpen className="w-3.5 h-3.5" />
                </div>
                <span>Items not carried here ({unavailableItems.length}):</span>
              </div>
              <div className="space-y-2">
                {unavailableItems.map((item) => {
                  const carryingShops = shops.filter(
                    (s) => item.shops[s.id]?.available !== false && item.shops[s.id]?.price !== null
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
            const isCollapsed = isReorderMode
              ? false
              : collapsedSections[location] !== undefined
                ? collapsedSections[location]
                : isAutoCollapsed

            return (
              <div
                key={location}
                id={`aisle-section-${encodeURIComponent(location)}`}
                className={`rounded-2xl border transition-all scroll-mt-28 overflow-hidden ${
                  isAllPickedInAisle && !isReorderMode
                    ? 'bg-slate-50/50 border-slate-200/60 opacity-80'
                    : 'bg-white border-slate-200 shadow-xs'
                }`}
              >
                {/* Location / Aisle Category Header (Theme-fitting emerald banner for high contrast against items) */}
                <button
                  onClick={() => toggleSectionCollapse(location)}
                  className={`w-full flex items-center justify-between px-4 py-3 transition text-left cursor-pointer ${
                    isAllPickedInAisle && !isReorderMode
                      ? 'bg-emerald-800/75 hover:bg-emerald-800 text-emerald-100 border-b border-emerald-900/30'
                      : 'bg-emerald-700 hover:bg-emerald-600 border-b border-emerald-800/40 text-white'
                  }`}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div
                      className={`w-7 h-7 rounded-xl flex items-center justify-center shrink-0 shadow-2xs border ${
                        isAllPickedInAisle && !isReorderMode
                          ? 'bg-emerald-900/50 text-emerald-200 border-emerald-700/50'
                          : 'bg-white/20 text-white border-white/25'
                      }`}
                    >
                      {isAllPickedInAisle && !isReorderMode ? (
                        <Check className="w-4 h-4 stroke-[2.5]" />
                      ) : (
                        <MapPin className="w-3.5 h-3.5 stroke-[2.5]" />
                      )}
                    </div>
                    <div className="flex items-center gap-2 min-w-0 flex-wrap">
                      <span
                        className={`text-sm sm:text-base font-extrabold tracking-tight truncate ${
                          isAllPickedInAisle && !isReorderMode ? 'text-emerald-100' : 'text-white'
                        }`}
                      >
                        {location}
                      </span>
                      {isReorderMode ? (
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className="px-2.5 py-0.5 rounded-full bg-amber-500 text-white text-xs font-bold shadow-2xs">
                            {totalCount} {totalCount === 1 ? 'item' : 'items'}
                          </span>
                          {groupItems.length > 1 && (
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation()
                                handleResetAisleAlphabetical(location)
                              }}
                              className="px-2.5 py-0.5 rounded-full bg-white/20 hover:bg-white/30 text-white text-xs font-bold transition border border-white/30 cursor-pointer active:scale-95"
                              title="Reset this aisle to alphabetical order"
                            >
                              Sort A-Z
                            </button>
                          )}
                        </div>
                      ) : isAllPickedInAisle ? (
                        <span className="px-2.5 py-0.5 rounded-full bg-emerald-900/50 text-emerald-200 border border-emerald-700/50 text-xs font-bold shadow-2xs">
                          ✓ All {totalCount} picked
                        </span>
                      ) : (
                        <div className="flex items-center gap-1.5">
                          <span className="px-2.5 py-0.5 rounded-full bg-white text-emerald-800 text-xs font-black shadow-2xs">
                            {totalCount - pickedCount} to pick
                          </span>
                          <span className="text-xs text-emerald-100/90 font-semibold">
                            • {totalCount} total
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                  {isCollapsed ? (
                    <ChevronDown className="w-5 h-5 text-emerald-200 stroke-[2.2] shrink-0 ml-2" />
                  ) : (
                    <ChevronUp className="w-5 h-5 text-emerald-200 stroke-[2.2] shrink-0 ml-2" />
                  )}
                </button>

                {/* Items in this Aisle */}
                {!isCollapsed && (
                  <div className="divide-y divide-slate-100">
                    {groupItems.map((item, itemIdx) => {
                      const isPicked = item.inCart
                      const comp = compareShopPrices(item, currentShop.id, shops)
                      const shopDetail = item.shops[currentShop.id]
                      const optResult = getOptimalStorePackage(item, currentShop.id)
                      const activeOpt = optResult.selectedOption
                      const itemUnitPrice = activeOpt.price > 0 ? activeOpt.price : (shopDetail?.price || null)
                      const packsNeeded = activeOpt.packsNeeded
                      const totalItemPrice = itemUnitPrice !== null ? itemUnitPrice * packsNeeded : null
                      const formattedSize = activeOpt.packageSize
                        ? `${activeOpt.packageSize} ${activeOpt.packageUnit || ''}`.trim()
                        : shopDetail?.packageSize
                          ? `${shopDetail.packageSize} ${shopDetail.packageUnit || item.unit || ''}`.trim()
                          : `${item.quantity || 1} ${item.unit || ''}`.trim()

                      const rawLabel = activeOpt.label?.trim()
                      const hasCustomLabel = Boolean(
                        rawLabel &&
                        rawLabel.toLowerCase() !== 'standard' &&
                        rawLabel.toLowerCase() !== formattedSize.toLowerCase() &&
                        rawLabel.toLowerCase() !== `${activeOpt.packageSize}`.toLowerCase()
                      )

                      const itemSizeText = hasCustomLabel
                        ? (formattedSize ? `${formattedSize} (${rawLabel})` : rawLabel)
                        : formattedSize

                      const isDragging = draggedItemId === item.id
                      const isDragOver = dragOverItemId === item.id && draggedItemId !== item.id

                      // Render Reorder Row when isReorderMode is active
                      if (isReorderMode) {
                        return (
                          <div
                            key={item.id}
                            data-reorder-item-id={item.id}
                            data-reorder-location={location}
                            draggable
                            onDragStart={(e) => handleDragStartItem(e, item.id, location)}
                            onDragOver={(e) => handleDragOverItem(e, item.id, location)}
                            onDrop={() => handleDropItem(location, item.id)}
                            onTouchStart={() => handleTouchStartItem(item.id, location)}
                            onTouchMove={(e) => handleTouchMoveItem(e, location)}
                            onTouchEnd={() => handleTouchEndItem(location)}
                            className={`p-3 sm:p-3.5 transition flex items-center justify-between gap-3 select-none ${
                              isDragging
                                ? 'opacity-40 bg-amber-100/60 border-2 border-dashed border-amber-400'
                                : isDragOver
                                  ? 'bg-amber-50/70 border-t-2 border-amber-500'
                                  : 'hover:bg-slate-50/80 bg-white'
                            }`}
                          >
                            {/* Left: Drag Handle + Sequence Badge + Item Name & Size */}
                            <div className="flex items-center gap-3 min-w-0 flex-1">
                              {/* Grip Handle */}
                              <div
                                className="cursor-grab active:cursor-grabbing p-1 text-slate-400 hover:text-amber-600 transition shrink-0 touch-none"
                                title="Drag to reorder shelf position"
                              >
                                <GripVertical className="w-5 h-5" />
                              </div>

                              {/* Sequence Badge */}
                              <div className="w-7 h-7 rounded-xl bg-amber-50 text-amber-800 border border-amber-200/80 flex items-center justify-center shrink-0 text-xs font-black shadow-2xs">
                                {itemIdx + 1}
                              </div>

                              {/* Name & Size */}
                              <div className="min-w-0 flex-1">
                                <div className="text-sm font-bold text-slate-900 truncate">
                                  {item.name}
                                </div>
                                <div className="text-xs text-slate-500 truncate mt-0.5">
                                  {packsNeeded > 1
                                    ? `${Number(packsNeeded.toFixed(2))} × ${itemSizeText}`
                                    : itemSizeText}
                                  {item.notes ? ` • ${item.notes}` : ''}
                                </div>
                              </div>
                            </div>

                            {/* Right: Precision Up/Down Step Buttons */}
                            <div className="shrink-0 flex items-center gap-1">
                              <button
                                type="button"
                                disabled={itemIdx === 0}
                                onClick={() => handleMoveItemInAisle(location, itemIdx, itemIdx - 1)}
                                className="w-8 h-8 rounded-xl bg-slate-100 hover:bg-amber-100 text-slate-700 hover:text-amber-800 disabled:opacity-25 disabled:pointer-events-none flex items-center justify-center transition active:scale-90 cursor-pointer shadow-2xs"
                                title="Move up shelf"
                                aria-label="Move up"
                              >
                                <ChevronUp className="w-4 h-4 stroke-[2.5]" />
                              </button>
                              <button
                                type="button"
                                disabled={itemIdx === groupItems.length - 1}
                                onClick={() => handleMoveItemInAisle(location, itemIdx, itemIdx + 1)}
                                className="w-8 h-8 rounded-xl bg-slate-100 hover:bg-amber-100 text-slate-700 hover:text-amber-800 disabled:opacity-25 disabled:pointer-events-none flex items-center justify-center transition active:scale-90 cursor-pointer shadow-2xs"
                                title="Move down shelf"
                                aria-label="Move down"
                              >
                                <ChevronDown className="w-4 h-4 stroke-[2.5]" />
                              </button>
                            </div>
                          </div>
                        )
                      }

                      return (
                        <div
                          key={item.id}
                          className={`p-3 sm:p-3.5 transition flex items-center justify-between gap-3 ${
                            isPicked
                              ? 'bg-slate-50/70 hover:bg-slate-100/70'
                              : 'hover:bg-slate-50/60 bg-white'
                          }`}
                        >
                          {/* Left: Generous single tap zone to toggle in/out of cart */}
                          <div
                            onClick={() => handleToggleInCart(item.id)}
                            className="flex items-center gap-3 min-w-0 flex-1 cursor-pointer select-none py-0.5"
                          >
                            <div className="shrink-0 p-0.5 transition active:scale-90">
                              {isPicked ? (
                                <CheckCircle2 className="w-6 h-6 text-emerald-600 fill-emerald-100" />
                              ) : (
                                <Circle className="w-6 h-6 text-slate-300 hover:text-emerald-600" />
                              )}
                            </div>

                            <div className="min-w-0 flex-1">
                              {/* Row 1: Item Name, Best Price badge (icon only), Cheaper elsewhere tag */}
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

                              {/* Row 2: Clean unified subtitle for Quantity, Package Size & Notes */}
                              <div className="flex items-center gap-2 flex-wrap mt-0.5 text-xs">
                                <span
                                  className={`font-semibold ${
                                    isPicked ? 'text-slate-400 line-through' : 'text-slate-600'
                                  }`}
                                >
                                  {packsNeeded > 1
                                    ? `${Number(packsNeeded.toFixed(2))} × ${itemSizeText}`
                                    : itemSizeText}
                                </span>

                                {item.notes && (
                                  <span
                                    className={`text-[11px] italic truncate max-w-[160px] ${
                                      isPicked ? 'text-slate-400 line-through' : 'text-slate-500'
                                    }`}
                                    title={item.notes}
                                  >
                                    • {item.notes}
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>

                          {/* Right: Clean Price & Vertical 3-dot item menu */}
                          <div className={`shrink-0 flex items-center gap-1 sm:gap-2 ${isPicked ? 'opacity-60' : ''}`}>
                            <button
                              type="button"
                              onClick={() => {
                                triggerHaptic(15)
                                onEditItem(item, currentShop.id, 'price', activeOpt.id)
                              }}
                              className="group flex flex-col items-end px-2 py-1 rounded-xl border border-transparent hover:border-emerald-300 hover:bg-emerald-50/40 active:scale-95 transition text-right cursor-pointer"
                              title="Tap to edit item price & details"
                            >
                              <span
                                className={`text-sm font-extrabold tracking-tight ${
                                  isPicked ? 'line-through text-slate-400' : 'text-slate-900'
                                }`}
                              >
                                {formatPrice(totalItemPrice)}
                              </span>

                              {packsNeeded !== 1 && itemUnitPrice !== null && (
                                <span className="text-[10px] text-slate-400 font-medium">
                                  ({Number(packsNeeded.toFixed(2))} × {formatPrice(itemUnitPrice)})
                                </span>
                              )}
                            </button>

                            {/* Vertical 3-Dot Item Actions Menu */}
                            <button
                              type="button"
                              onClick={() => {
                                triggerHaptic(15)
                                setItemMenuModal(item)
                              }}
                              className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition cursor-pointer active:scale-90"
                              title="Item actions"
                              aria-label="Item actions"
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

          <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
            {/* Quick Add item to trip button (Solution 1) */}
            <button
              type="button"
              onClick={() => {
                triggerHaptic(20)
                setIsQuickAddOpen(true)
              }}
              className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl border border-emerald-200 bg-emerald-50 hover:bg-emerald-100 active:bg-emerald-200 text-emerald-700 active:scale-95 transition flex items-center justify-center shrink-0 shadow-2xs cursor-pointer"
              title="Add item to trip (Search catalog or create new)"
              aria-label="Add item to trip"
            >
              <Plus className="w-5 h-5 stroke-[2.5]" />
            </button>

            {/* In-store Barcode Scanner (Solution 3) */}
            <button
              type="button"
              onClick={() => {
                triggerHaptic(20)
                setIsBarcodeScannerOpen(true)
              }}
              className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl border border-slate-200 bg-slate-100 hover:bg-slate-200 active:bg-slate-300 text-slate-700 active:scale-95 transition flex items-center justify-center shrink-0 shadow-2xs cursor-pointer"
              title="Scan barcode to check off or add item"
              aria-label="Scan barcode"
            >
              <Barcode className="w-5 h-5 text-emerald-600" />
            </button>

            {/* AI Receipt Scanner */}
            <button
              type="button"
              onClick={() => {
                triggerHaptic(20)
                setIsReceiptScannerOpen(true)
              }}
              className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl border border-slate-200 bg-slate-100 hover:bg-slate-200 active:bg-slate-300 text-slate-700 active:scale-95 transition flex items-center justify-center shrink-0 shadow-2xs cursor-pointer"
              title="Scan paper receipt with AI to update prices"
              aria-label="Scan receipt"
            >
              <Receipt className="w-5 h-5 text-amber-600" />
            </button>

            {/* Finish Stop Button (Icon Only) */}
            <button
              type="button"
              onClick={handleFinishTrip}
              disabled={cartItems.length === 0}
              className={`w-10 h-10 sm:w-11 sm:h-11 rounded-xl transition shadow-md shrink-0 flex items-center justify-center active:scale-95 ${
                cartItems.length > 0
                  ? 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-600/30 cursor-pointer'
                  : 'bg-slate-200 text-slate-400 cursor-not-allowed shadow-none'
              }`}
              title={
                cartItems.length > 0
                  ? `Finish shopping at ${currentShop.name} (${cartItems.length} items picked)`
                  : 'Pick at least 1 item to finish stop'
              }
              aria-label="Finish stop"
            >
              <CheckCircle2 className="w-5 h-5 stroke-[2.5]" />
            </button>
          </div>
        </div>
      </div>

      {/* Floating Reorder Mode Banner */}
      {isReorderMode && (
        <div className="fixed bottom-20 sm:bottom-24 left-1/2 -translate-x-1/2 z-30 w-[92%] max-w-md animate-in slide-in-from-bottom-4 duration-200 pointer-events-auto">
          <div className="bg-slate-900/95 backdrop-blur-md text-white px-4 py-3 rounded-2xl shadow-2xl border border-slate-700/60 flex items-center justify-between gap-3">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-8 h-8 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/30 flex items-center justify-center shrink-0">
                <ArrowUpDown className="w-4 h-4" />
              </div>
              <div className="min-w-0">
                <div className="text-xs font-black truncate">
                  Reordering {currentShop.name}
                </div>
                <div className="text-[10px] text-slate-300">
                  Drag items or tap ▲/▼ to arrange shelf walk
                </div>
              </div>
            </div>
            <button
              type="button"
              onClick={() => {
                triggerHaptic(20)
                setIsReorderMode(false)
                setToastMessage(`Shelf walk-through order saved for ${currentShop.name}`)
              }}
              className="px-3.5 py-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 active:scale-95 text-white font-black text-xs transition shadow-sm shrink-0 cursor-pointer"
            >
              Done
            </button>
          </div>
        </div>
      )}

      {/* Switch Store Modal */}
      {showStoreSwitcherModal && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4 z-50 animate-in fade-in duration-200"
          onClick={(e) => {
            if (e.target === e.currentTarget) setShowStoreSwitcherModal(false)
          }}
        >
          <div className="bg-white rounded-t-3xl sm:rounded-3xl w-full max-w-lg max-h-[85vh] shadow-2xl flex flex-col overflow-hidden border border-slate-200 animate-in slide-in-from-bottom-6 sm:slide-in-from-bottom-2 duration-200">
            {/* Header */}
            <div className="p-4 sm:p-5 border-b border-slate-200 bg-slate-50 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="w-9 h-9 rounded-2xl bg-emerald-600 text-white flex items-center justify-center shadow-xs shrink-0">
                  <Store className="w-5 h-5" />
                </div>
                <div className="min-w-0">
                  <h2 className="text-base sm:text-lg font-extrabold text-slate-900 truncate">
                    Switch Store
                  </h2>
                  <p className="text-xs text-slate-500 truncate">
                    {visibleShops.length} stores available
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setShowStoreSwitcherModal(false)}
                className="p-2 text-slate-400 hover:text-slate-700 rounded-xl hover:bg-slate-200/60 transition cursor-pointer"
                title="Close"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Store List */}
            <div className="p-4 sm:p-5 overflow-y-auto space-y-2.5 flex-1">
              {tripStoreBreakdown.map(
                ({ shop, items: storeItems, pendingCount, totalCount, isFullyPicked, totalCost }) => {
                  const isCurrent = shop.id === currentShop.id

                  return (
                    <div
                      key={shop.id}
                      onClick={() => {
                        triggerHaptic(20)
                        setSelectedShopId(shop.id)
                        setShowStoreSwitcherModal(false)
                      }}
                      className={`p-3.5 rounded-2xl border transition text-left cursor-pointer active:scale-[0.99] ${
                        isCurrent
                          ? 'border-emerald-500 bg-emerald-50/70 shadow-xs ring-1 ring-emerald-500/20'
                          : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50'
                      }`}
                    >
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2.5 min-w-0">
                          <div
                            className="w-3.5 h-3.5 rounded-full shrink-0 shadow-2xs"
                            style={{ backgroundColor: shop.color || '#10b981' }}
                          />
                          <div className="font-extrabold text-sm text-slate-900 truncate">
                            {shop.name}
                          </div>
                          {isCurrent && (
                            <span className="text-[10px] font-bold bg-emerald-600 text-white px-2 py-0.5 rounded-full shrink-0">
                              Current
                            </span>
                          )}
                        </div>

                        <div className="flex items-center gap-2 shrink-0">
                          {totalCost > 0 && (
                            <span className="text-xs font-bold text-slate-700">
                              {formatPrice(totalCost)}
                            </span>
                          )}
                          <span
                            className={`text-xs px-2.5 py-0.5 rounded-full font-bold ${
                              isFullyPicked
                                ? 'bg-emerald-100 text-emerald-800'
                                : pendingCount > 0
                                ? 'bg-amber-100 text-amber-900'
                                : 'bg-slate-100 text-slate-600'
                            }`}
                          >
                            {isFullyPicked
                              ? `✓ All ${totalCount} picked`
                              : `${pendingCount} of ${totalCount} left`}
                          </span>
                        </div>
                      </div>

                      {/* Preview of Items at this Store */}
                      {storeItems.length > 0 ? (
                        <div className="mt-2.5 pt-2 border-t border-slate-100 flex flex-wrap gap-1.5 items-center">
                          {storeItems.slice(0, 4).map((it) => (
                            <span
                              key={it.id}
                              className={`text-[11px] px-2 py-0.5 rounded-lg font-medium ${
                                it.inCart
                                  ? 'bg-slate-100 text-slate-400 line-through'
                                  : 'bg-slate-100 text-slate-700'
                              }`}
                            >
                              {it.name}
                            </span>
                          ))}
                          {storeItems.length > 4 && (
                            <span className="text-[11px] text-slate-400 font-semibold px-1">
                              +{storeItems.length - 4} more
                            </span>
                          )}
                        </div>
                      ) : (
                        <div className="mt-1.5 text-xs text-slate-400 italic">
                          No items needed from this store
                        </div>
                      )}
                    </div>
                  )
                }
              )}
            </div>

            {/* Modal Footer */}
            <div className="p-3 sm:p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between shrink-0">
              <button
                type="button"
                onClick={() => {
                  setShowStoreSwitcherModal(false)
                  onOpenStoreModal()
                }}
                className="text-xs font-bold text-emerald-700 hover:text-emerald-900 flex items-center gap-1 p-1 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Manage Stores</span>
              </button>

              <button
                type="button"
                onClick={() => setShowStoreSwitcherModal(false)}
                className="px-5 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs sm:text-sm font-bold rounded-xl transition cursor-pointer"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}

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
        <div className="fixed bottom-20 left-1/2 -translate-x-1/2 z-50 bg-slate-900/95 text-white px-4 py-2.5 rounded-xl shadow-xl border border-slate-700 text-xs font-semibold flex items-center gap-2.5 backdrop-blur animate-in fade-in slide-in-from-bottom-2 max-w-[92vw]">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span className="truncate">{toastMessage}</span>
          {(undoMoveState || undoCheckState || undoRemoveState) && (
            <button
              type="button"
              onClick={
                undoMoveState
                  ? handleUndoMove
                  : undoCheckState
                  ? handleUndoCheck
                  : handleUndoRemove
              }
              className="ml-1.5 px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-emerald-400 hover:text-emerald-300 font-bold rounded-lg border border-slate-600 transition text-[11px] shrink-0 flex items-center gap-1 active:scale-95 cursor-pointer shadow-xs"
              title="Undo this action"
            >
              <Undo2 className="w-3 h-3" />
              <span>Undo</span>
            </button>
          )}
        </div>
      )}

      {/* 10. Out of Stock & Move Store Modal */}
      {outOfStockItem && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl">
            <div className="flex items-start justify-between gap-3 mb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center shrink-0">
                  <PackageX className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900 leading-tight">
                    Out of Stock or Poor Quality?
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
              Skip this item at <strong>{currentShop.name}</strong> for today&apos;s trip. It remains carried here for future trips and automatically moves to another store:
            </p>

            <div className="space-y-2 mb-4">
              {/* Option to move to other shops */}
              {shops
                .filter((s) => s.id !== currentShop.id)
                .map((targetShop) => {
                  const isNextStop = nextShop?.id === targetShop.id
                  const bestTarget = outOfStockItem ? getTargetShopForMove(outOfStockItem) : null
                  const isLowestPrice = bestTarget?.id === targetShop.id
                  return (
                    <button
                      key={targetShop.id}
                      onClick={() => handleSkipItemForTrip(outOfStockItem, targetShop.id)}
                      className={`w-full p-3 rounded-xl border text-left flex items-center justify-between transition ${
                        isLowestPrice
                          ? 'bg-emerald-50/80 border-emerald-300 hover:bg-emerald-100/70 text-emerald-950'
                          : isNextStop
                          ? 'bg-indigo-50/50 border-indigo-200 hover:bg-indigo-100/60 text-indigo-950'
                          : 'bg-white border-slate-200 hover:bg-slate-50 text-slate-800'
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <Store className={`w-4 h-4 ${isLowestPrice ? 'text-emerald-600' : isNextStop ? 'text-indigo-600' : 'text-slate-400'}`} />
                        <div>
                          <div className="text-xs font-bold flex items-center gap-1.5 flex-wrap">
                            <span>Move to {targetShop.name}</span>
                            {isLowestPrice && (
                              <span className="text-[10px] font-extrabold uppercase bg-emerald-600 text-white px-1.5 py-0.2 rounded-full">
                                Lowest Price
                              </span>
                            )}
                            {!isLowestPrice && isNextStop && (
                              <span className="text-[10px] font-extrabold uppercase bg-indigo-600 text-white px-1.5 py-0.2 rounded-full">
                                Next Stop
                              </span>
                            )}
                          </div>
                          <div className="text-[11px] text-slate-500">
                            Skip at {currentShop.name} today and pick up at {targetShop.name}
                          </div>
                        </div>
                      </div>
                      <ArrowRight className="w-4 h-4 text-slate-400 shrink-0" />
                    </button>
                  )
                })}

              {/* Option to just exclude from this store stop without reassigning */}
              <button
                onClick={() => handleSkipItemForTrip(outOfStockItem)}
                className="w-full p-3 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 text-left flex items-center justify-between transition"
              >
                <div>
                  <div className="text-xs font-bold text-slate-800">
                    Skip at {currentShop.name} for Today Only
                  </div>
                  <div className="text-[11px] text-slate-500">
                    Remove from today&apos;s trip. Automatically resets on your next trip without changing store settings.
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
                          <span
                            className="inline-flex items-center p-0.5 text-emerald-600 shrink-0"
                            title="Lowest price (best value)"
                          >
                            <Sparkles className="w-3.5 h-3.5" />
                          </span>
                        )}
                        {opt.isLowestCashOutlay && !isBestValue && (
                          <span
                            className="text-[10px] font-bold text-slate-600 bg-slate-100 px-1.5 py-0.5 rounded-full border border-slate-200 shrink-0"
                            title="Lowest upfront cash"
                          >
                            $
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

      {/* Quick Quantity Calculator Modal */}
      {quickQuantityItem && (() => {
        const optResult = getOptimalStorePackage(quickQuantityItem.item, currentShop.id)
        const activeOpt = optResult.selectedOption
        const detail = quickQuantityItem.item.shops[currentShop.id]
        const itemUnitPrice = activeOpt.price > 0 ? activeOpt.price : (detail?.price ?? null)

        return (
          <KeypadCalculatorModal
            isOpen={Boolean(quickQuantityItem)}
            onClose={() => setQuickQuantityItem(null)}
            title="Set Quantity"
            itemName={quickQuantityItem.item.name}
            storeName={currentShop.name}
            initialValue={quickQuantityItem.currentQty}
            mode="quantity"
            unit={activeOpt.packageUnit || quickQuantityItem.item.unit || ''}
            unitPrice={itemUnitPrice}
            onApply={async (newQty) => {
              await handleUpdateItemQuantity(quickQuantityItem.item, newQty)
              setQuickQuantityItem(null)
            }}
          />
        )
      })()}

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
              {/* 1. Instant 1-Tap Out of Stock / Poor Quality Skip */}
              {(() => {
                const isAlreadySkipped = isShopSkippedForTrip(itemMenuModal, currentShop.id)
                if (isAlreadySkipped) {
                  return (
                    <button
                      type="button"
                      onClick={() => {
                        const it = itemMenuModal
                        setItemMenuModal(null)
                        handleRestoreSkippedItem(it)
                      }}
                      className="w-full px-3 py-2.5 text-left text-xs font-semibold text-emerald-700 bg-emerald-50/80 hover:bg-emerald-100 rounded-xl flex items-center justify-between transition cursor-pointer border border-emerald-200/80"
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <RotateCcw className="w-4 h-4 text-emerald-600 shrink-0" />
                        <span className="truncate">Restore to {currentShop.name} for today</span>
                      </div>
                      <span className="text-[10px] font-extrabold uppercase bg-emerald-200 text-emerald-900 px-1.5 py-0.2 rounded-full shrink-0">
                        Restore
                      </span>
                    </button>
                  )
                }

                const target = getTargetShopForMove(itemMenuModal)
                return (
                  <button
                    type="button"
                    onClick={() => {
                      const it = itemMenuModal
                      setItemMenuModal(null)
                      handleSkipItemForTrip(it, target?.id)
                    }}
                    className="w-full px-3 py-2.5 text-left text-xs font-semibold text-amber-800 bg-amber-50/90 hover:bg-amber-100 rounded-xl flex items-center justify-between transition cursor-pointer border border-amber-200/80"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <PackageX className="w-4 h-4 text-amber-600 shrink-0" />
                      <span className="truncate">
                        {target
                          ? `Out of stock / quality → Move to ${target.name}`
                          : `Out of stock / quality → Skip today`}
                      </span>
                    </div>
                    <span className="text-[10px] font-extrabold uppercase bg-amber-200 text-amber-900 px-1.5 py-0.2 rounded-full shrink-0">
                      Today Only
                    </span>
                  </button>
                )
              })()}

              {/* 2. Change Quantity / Packs */}
              {(() => {
                const opt = getOptimalStorePackage(itemMenuModal, currentShop.id)
                return (
                  <button
                    type="button"
                    onClick={() => {
                      const it = itemMenuModal
                      setItemMenuModal(null)
                      setQuickQuantityItem({
                        item: it,
                        currentQty: opt.selectedOption.packsNeeded,
                      })
                    }}
                    className="w-full px-3 py-2.5 text-left text-xs font-semibold text-slate-700 hover:bg-slate-50 rounded-xl flex items-center justify-between transition cursor-pointer"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <Hash className="w-4 h-4 text-emerald-600 shrink-0" />
                      <span>Change Quantity / Packs Needed</span>
                    </div>
                    <span className="text-[11px] font-mono font-bold text-slate-600 bg-slate-100 px-2 py-0.5 rounded-md shrink-0">
                      {Number(opt.selectedOption.packsNeeded.toFixed(2))} pk
                    </span>
                  </button>
                )
              })()}

              {/* 3. Switch Package Size (if multiple options available) */}
              {(() => {
                const opt = getOptimalStorePackage(itemMenuModal, currentShop.id)
                if (!opt.hasMultipleOptions) return null
                return (
                  <button
                    type="button"
                    onClick={() => {
                      const it = itemMenuModal
                      setItemMenuModal(null)
                      setSizePickerItem({
                        item: it,
                        options: opt.allOptions,
                        bestOptId: opt.bestOption.id,
                        activeOptId: opt.selectedOption.id,
                      })
                    }}
                    className="w-full px-3 py-2.5 text-left text-xs font-semibold text-slate-700 hover:bg-slate-50 rounded-xl flex items-center justify-between transition cursor-pointer"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <Layers className="w-4 h-4 text-indigo-600 shrink-0" />
                      <span>Switch Package Size</span>
                    </div>
                    <span className="text-[10px] font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded-md shrink-0">
                      {opt.allOptions.length} sizes
                    </span>
                  </button>
                )
              })()}

              {/* 4. Update Shelf Price */}
              <button
                type="button"
                onClick={() => {
                  const it = itemMenuModal
                  setItemMenuModal(null)
                  if (it) {
                    triggerHaptic(15)
                    const optRes = getOptimalStorePackage(it, currentShop.id)
                    onEditItem(it, currentShop.id, 'price', optRes.selectedOption.id)
                  }
                }}
                className="w-full px-3 py-2.5 text-left text-xs font-semibold text-slate-700 hover:bg-slate-50 rounded-xl flex items-center gap-2.5 transition cursor-pointer"
              >
                <DollarSign className="w-4 h-4 text-emerald-600" />
                <span>Update Shelf / Sale Price</span>
              </button>

              {/* 5. Choose other stores to move for today */}
              {shops.filter((s) => s.id !== currentShop.id).length > 1 && (
                <button
                  type="button"
                  onClick={() => {
                    const it = itemMenuModal
                    setItemMenuModal(null)
                    triggerHaptic(15)
                    setOutOfStockItem(it)
                  }}
                  className="w-full px-3 py-2 text-left text-xs font-semibold text-slate-600 hover:bg-slate-50 rounded-xl flex items-center gap-2.5 transition cursor-pointer"
                >
                  <Store className="w-4 h-4 text-slate-400" />
                  <span>Choose Store to Move For Today...</span>
                </button>
              )}

              {/* 6. Edit Item & Aisles */}
              <button
                type="button"
                onClick={() => {
                  const it = itemMenuModal
                  setItemMenuModal(null)
                  onEditItem(it, currentShop.id)
                }}
                className="w-full px-3 py-2.5 text-left text-xs font-semibold text-slate-700 hover:bg-slate-50 rounded-xl flex items-center gap-2.5 transition cursor-pointer border-t border-slate-100 pt-2 mt-1"
              >
                <Edit2 className="w-4 h-4 text-slate-400" />
                <span>Edit Full Item Details & Aisles</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 11. Zero-Quantity Removal Confirmation Modal */}
      {zeroQtyConfirmItem && (
        <div
          className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4 z-50 animate-in fade-in duration-150"
          onClick={() => setZeroQtyConfirmItem(null)}
        >
          <div
            className="bg-white rounded-t-3xl sm:rounded-3xl shadow-2xl border border-slate-200 max-w-sm w-full p-5 space-y-4 animate-in slide-in-from-bottom sm:zoom-in-95 duration-150"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-2xl bg-rose-50 border border-rose-100 text-rose-600 flex items-center justify-center shrink-0 shadow-2xs">
                  <Trash2 className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-extrabold text-slate-900 tracking-tight">
                    Remove from List?
                  </h3>
                  <p className="text-xs text-slate-500 font-medium">Quantity set to 0</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setZeroQtyConfirmItem(null)}
                className="text-slate-400 hover:text-slate-600 p-1.5 rounded-xl hover:bg-slate-100 transition cursor-pointer"
                aria-label="Close"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-3.5 text-xs text-slate-600 leading-relaxed">
              Setting quantity to <b className="text-slate-900 font-bold">0</b> will remove{' '}
              <span className="font-bold text-slate-900">"{zeroQtyConfirmItem.item.name}"</span> from your active shopping list.
              The item will remain saved in your catalog for future trips.
            </div>

            <div className="grid grid-cols-2 gap-2.5 pt-1">
              <button
                type="button"
                onClick={() => setZeroQtyConfirmItem(null)}
                className="py-2.5 px-4 rounded-xl border border-slate-200 hover:bg-slate-50 active:bg-slate-100 text-slate-700 font-bold text-xs transition cursor-pointer text-center"
              >
                Keep Item
              </button>
              <button
                type="button"
                onClick={handleConfirmRemoveZeroQty}
                className="py-2.5 px-4 rounded-xl bg-rose-600 hover:bg-rose-700 active:bg-rose-800 text-white font-bold text-xs transition cursor-pointer shadow-sm active:scale-98 flex items-center justify-center gap-1.5"
              >
                <Trash2 className="w-4 h-4" />
                <span>Remove from List</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 12. Shopping View Options Modal */}
      {showOptionsPopover && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/50 backdrop-blur-xs animate-in fade-in duration-200"
          onClick={(e) => {
            if (e.target === e.currentTarget) setShowOptionsPopover(false)
          }}
        >
          <div
            className="relative bg-white rounded-3xl w-full max-w-md max-h-[90vh] shadow-2xl flex flex-col overflow-hidden border border-slate-200"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="p-4 sm:p-5 border-b border-slate-200 bg-gradient-to-r from-emerald-50 via-teal-50 to-emerald-50 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-emerald-600 text-white flex items-center justify-center shadow-xs">
                  <SlidersHorizontal className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-base sm:text-lg font-extrabold text-slate-900">
                    Shopping View Options
                  </h2>
                  <p className="text-xs text-slate-500">
                    In-store view & trip settings
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowOptionsPopover(false)}
                className="p-2 text-slate-400 hover:text-slate-700 rounded-xl hover:bg-slate-200/60 transition cursor-pointer"
                title="Close"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Scrollable Body */}
            <div className="p-4 sm:p-5 overflow-y-auto space-y-2.5 flex-1">
              {/* Shelf Walk-through Sequence Reorder */}
              <button
                type="button"
                onClick={() => {
                  triggerHaptic(20)
                  setShowOptionsPopover(false)
                  setIsReorderMode(true)
                }}
                className="w-full flex items-center justify-between p-3 rounded-2xl bg-amber-50/80 border border-amber-200/90 hover:bg-amber-100/80 text-amber-950 cursor-pointer text-xs transition text-left"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0 border bg-amber-500 text-white border-amber-600 shadow-2xs">
                    <ArrowUpDown className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="font-bold text-slate-900">Reorder Shelf Sequence</div>
                    <div className="text-[10px] text-slate-500">
                      Arrange items to match physical aisles in {currentShop.name}
                    </div>
                  </div>
                </div>
                <span className="text-xs font-black text-amber-700 shrink-0">Start →</span>
              </button>

              {/* Option 1: Best Prices Only (Save Mode) */}
              <label className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 border border-slate-200 hover:border-slate-300 cursor-pointer text-xs transition">
                <div className="flex items-center gap-3">
                  <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 border ${
                    saveMode ? 'bg-amber-100 border-amber-300 text-amber-700' : 'bg-white border-slate-200 text-slate-400'
                  }`}>
                    <Zap className="w-4 h-4 fill-current" />
                  </div>
                  <div>
                    <div className="font-bold text-slate-800">Best Prices Only (Save Mode)</div>
                    <div className="text-[10px] text-slate-400">
                      Only show items that are cheapest at this store
                    </div>
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={saveMode}
                  onChange={(e) => {
                    triggerHaptic(15)
                    setSaveMode(e.target.checked)
                  }}
                  className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500 accent-emerald-600 shrink-0 ml-2 cursor-pointer"
                />
              </label>

              {/* Option 2: Hide Empty Stores */}
              <label className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 border border-slate-200 hover:border-slate-300 cursor-pointer text-xs transition">
                <div className="flex items-center gap-3">
                  <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 border ${
                    hideEmptyStores ? 'bg-slate-800 border-slate-800 text-white' : 'bg-white border-slate-200 text-slate-400'
                  }`}>
                    {hideEmptyStores ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </div>
                  <div>
                    <div className="font-bold text-slate-800">Hide Empty Stores</div>
                    <div className="text-[10px] text-slate-400">
                      Hide store tabs that have 0 items left to shop
                    </div>
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={hideEmptyStores}
                  onChange={(e) => {
                    triggerHaptic(15)
                    setHideEmptyStores(e.target.checked)
                  }}
                  className="w-4 h-4 rounded text-slate-800 focus:ring-slate-700 accent-slate-800 shrink-0 ml-2 cursor-pointer"
                />
              </label>

              {/* Option 3: Keep Screen Awake */}
              <label className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 border border-slate-200 hover:border-slate-300 cursor-pointer text-xs transition">
                <div className="flex items-center gap-3">
                  <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 border ${
                    keepScreenAwake ? 'bg-amber-100 border-amber-300 text-amber-700' : 'bg-white border-slate-200 text-slate-400'
                  }`}>
                    {keepScreenAwake ? (
                      <Sun className="w-4 h-4 text-amber-500 shrink-0" />
                    ) : (
                      <Moon className="w-4 h-4 text-slate-400 shrink-0" />
                    )}
                  </div>
                  <div>
                    <div className="font-bold text-slate-800">Keep Screen Awake</div>
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
                  className="w-4 h-4 rounded text-amber-500 focus:ring-amber-400 accent-amber-500 shrink-0 ml-2 cursor-pointer"
                />
              </label>

              {/* Option 4: Auto-collapse Done */}
              <label className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 border border-slate-200 hover:border-slate-300 cursor-pointer text-xs transition">
                <div className="flex items-center gap-3">
                  <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 border ${
                    autoCollapseCompleted ? 'bg-blue-100 border-blue-300 text-blue-700' : 'bg-white border-slate-200 text-slate-400'
                  }`}>
                    <ChevronUp className="w-4 h-4 text-blue-500 shrink-0" />
                  </div>
                  <div>
                    <div className="font-bold text-slate-800">Auto-collapse Done</div>
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
                  className="w-4 h-4 rounded text-blue-500 focus:ring-blue-400 accent-blue-500 shrink-0 ml-2 cursor-pointer"
                />
              </label>

              {/* Option 5: Checked at bottom */}
              <label className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 border border-slate-200 hover:border-slate-300 cursor-pointer text-xs transition">
                <div className="flex items-center gap-3">
                  <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 border ${
                    moveCheckedToBottom ? 'bg-indigo-100 border-indigo-300 text-indigo-700' : 'bg-white border-slate-200 text-slate-400'
                  }`}>
                    <ArrowDownNarrowWide className="w-4 h-4 text-slate-600 shrink-0" />
                  </div>
                  <div>
                    <div className="font-bold text-slate-800">Checked at bottom</div>
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
                  className="w-4 h-4 rounded text-slate-600 focus:ring-slate-500 accent-slate-600 shrink-0 ml-2 cursor-pointer"
                />
              </label>

              {/* Option 6: Hide checked */}
              <label className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 border border-slate-200 hover:border-slate-300 cursor-pointer text-xs transition">
                <div className="flex items-center gap-3">
                  <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 border ${
                    hideCheckedItems ? 'bg-emerald-100 border-emerald-300 text-emerald-700' : 'bg-white border-slate-200 text-slate-400'
                  }`}>
                    {hideCheckedItems ? (
                      <EyeOff className="w-4 h-4 text-emerald-600 shrink-0" />
                    ) : (
                      <Eye className="w-4 h-4 text-slate-400 shrink-0" />
                    )}
                  </div>
                  <div>
                    <div className="font-bold text-slate-800">Hide checked items</div>
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
                  className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500 accent-emerald-600 shrink-0 ml-2 cursor-pointer"
                />
              </label>
            </div>

            {/* Footer */}
            <div className="p-3 sm:p-4 bg-slate-50 border-t border-slate-200 flex justify-end shrink-0">
              <button
                type="button"
                onClick={() => setShowOptionsPopover(false)}
                className="w-full sm:w-auto px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs sm:text-sm font-bold rounded-xl transition cursor-pointer shadow-xs text-center"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 13. In-Store Quick Add Modal (Solution 1) */}
      {isQuickAddOpen && (
        <div
          className="fixed inset-0 z-50 flex items-start justify-center p-2 sm:p-4 pt-1 sm:pt-6 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150 overflow-hidden"
          onClick={() => setIsQuickAddOpen(false)}
        >
          <div
            className="bg-white rounded-2xl sm:rounded-3xl w-full sm:max-w-md shadow-2xl border border-slate-100 overflow-hidden text-left flex flex-col max-h-[calc(100dvh-0.5rem)] sm:max-h-[85vh]"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header (Compact so matching list stays at the very top) */}
            <div className="px-3.5 py-2.5 sm:px-4 sm:py-3 border-b border-slate-100 bg-gradient-to-r from-emerald-50 via-teal-50 to-emerald-50 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-emerald-600 text-white flex items-center justify-center shadow-xs">
                  <Plus className="w-4 h-4 stroke-[2.5]" />
                </div>
                <div>
                  <h2 className="text-xs sm:text-sm font-bold text-slate-900 leading-tight">
                    Add to Trip
                  </h2>
                  <p className="text-[10px] text-slate-500 font-medium">
                    Adding for <span className="font-bold text-slate-800">{currentShop.name}</span>
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsQuickAddOpen(false)}
                className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-200/60 transition cursor-pointer"
                title="Close"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Unified Search & Add Form Area (Directly matches List mode pattern) */}
            <div className="p-2 sm:p-2.5 border-b border-slate-100 bg-slate-50/70 shrink-0">
              <form
                onSubmit={(e) => {
                  e.preventDefault()
                  if (!quickAddSearch.trim()) return
                  if (quickAddExactMatch) {
                    handleQuickAddExisting(quickAddExactMatch, false, quickAddQty)
                  } else {
                    handleQuickCreateNew(false)
                  }
                }}
                className="flex items-center gap-1 sm:gap-1.5 bg-white border border-slate-300 rounded-xl sm:rounded-2xl p-1 sm:p-1.5 focus-within:ring-2 focus-within:ring-emerald-500 focus-within:border-emerald-500 transition shadow-2xs"
              >
                {/* Search Icon */}
                <Search className="w-4 h-4 text-slate-400 shrink-0 ml-1.5" />

                {/* Unified Search / Add Input */}
                <div className="flex-1 min-w-[70px] sm:min-w-[120px] flex items-center relative">
                  <input
                    type="text"
                    autoFocus
                    placeholder="Search or add item..."
                    value={quickAddSearch}
                    onChange={(e) => setQuickAddSearch(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Escape') setQuickAddSearch('')
                    }}
                    className="w-full pl-1 pr-6 py-0.5 text-xs sm:text-sm bg-transparent border-none outline-none font-medium placeholder:text-slate-400"
                  />
                  {quickAddSearch && (
                    <button
                      type="button"
                      onClick={() => setQuickAddSearch('')}
                      className="absolute right-0 text-slate-400 hover:text-slate-600 p-0.5 rounded-lg hover:bg-slate-100 transition cursor-pointer"
                      title="Clear search"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>

                {/* Quantity Stepper (No label, consistent with List mode) */}
                <div className="flex items-center rounded-lg border border-slate-200 bg-slate-50 overflow-hidden shadow-2xs shrink-0">
                  <button
                    type="button"
                    onClick={() => setQuickAddQty((q) => Math.max(1, q - 1))}
                    className="w-6 sm:w-6.5 h-7 flex items-center justify-center text-slate-600 hover:bg-slate-200 active:bg-slate-300 transition cursor-pointer"
                    title="Decrease quantity"
                  >
                    <Minus className="w-3 h-3" />
                  </button>
                  <span className="min-w-[18px] sm:min-w-[20px] px-0.5 text-center font-bold text-xs text-slate-800 select-none">
                    {quickAddQty}
                  </span>
                  <button
                    type="button"
                    onClick={() => setQuickAddQty((q) => q + 1)}
                    className="w-6 sm:w-6.5 h-7 flex items-center justify-center text-emerald-700 hover:bg-emerald-100 active:bg-emerald-200 transition cursor-pointer"
                    title="Increase quantity"
                  >
                    <Plus className="w-3 h-3" />
                  </button>
                </div>

                {/* Category Dropdown (Compact, defaults to Other) */}
                <select
                  value={quickAddCategory}
                  onChange={(e) => setQuickAddCategory(e.target.value)}
                  className="text-xs bg-slate-50 border border-slate-200 rounded-lg px-1 sm:px-1.5 py-1 font-semibold text-slate-700 outline-none max-w-[75px] sm:max-w-[105px] truncate shrink-0 cursor-pointer h-7"
                  title="Category"
                >
                  {quickAddCategoryOptions.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>

                {/* Add to List [+] Button */}
                <button
                  type="submit"
                  disabled={!quickAddSearch.trim()}
                  className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-slate-100 hover:bg-slate-200 disabled:opacity-35 text-slate-700 flex items-center justify-center transition cursor-pointer shrink-0 active:scale-95"
                  title="Add to shopping trip"
                >
                  <Plus className="w-4 h-4 stroke-[2.5]" />
                </button>

                {/* Add to Cart [🛒] Button */}
                <button
                  type="button"
                  disabled={!quickAddSearch.trim()}
                  onClick={() => {
                    if (!quickAddSearch.trim()) return
                    if (quickAddExactMatch) {
                      handleQuickAddExisting(quickAddExactMatch, true, quickAddQty)
                    } else {
                      handleQuickCreateNew(true)
                    }
                  }}
                  className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-slate-100 hover:bg-slate-200 disabled:opacity-35 text-emerald-700 hover:text-emerald-800 flex items-center justify-center transition cursor-pointer shrink-0 active:scale-95"
                  title="Add to trip and put in cart"
                >
                  <ShoppingCart className="w-4 h-4" />
                </button>
              </form>
            </div>

            {/* Scrollable Results List (Directly below input at the top) */}
            <div className="p-2.5 sm:p-3 overflow-y-auto space-y-2 flex-1">

              {/* Matching Catalog Items */}
              <div>
                <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 px-1 mb-1.5">
                  {quickAddSearch.trim()
                    ? `Catalog Matches (${quickAddMatches.length})`
                    : 'Catalog Items Not on Trip (Tap to Add)'}
                </div>

                {quickAddMatches.length === 0 ? (
                  <div className="text-center py-6 px-4 text-xs text-slate-400 font-medium">
                    {quickAddSearch.trim() ? (
                      <div className="space-y-1">
                        <p className="text-slate-600 font-semibold">
                          No existing catalog items match "{quickAddSearch.trim()}".
                        </p>
                        <p className="text-[11px] text-slate-400">
                          Tap <span className="font-bold text-slate-700">[+]</span> or{' '}
                          <span className="font-bold text-emerald-700">[🛒]</span> above (or hit Enter) to add it as a new item.
                        </p>
                      </div>
                    ) : (
                      'All catalog items are currently on your shopping list!'
                    )}
                  </div>
                ) : (
                  <div className="space-y-1.5">
                    {quickAddMatches.map((item) => {
                      const detail = item.shops[currentShop.id]
                      const price = detail?.price
                      const location = detail?.location || 'Unassigned'
                      const isAlreadyOnTrip = item.isNeeded

                      return (
                        <div
                          key={item.id}
                          className="p-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 flex items-center justify-between gap-2 transition"
                        >
                          <div className="min-w-0 flex-1">
                            <div className="font-bold text-xs sm:text-sm text-slate-900 truncate">
                              {item.name}
                            </div>
                            <div className="text-[10px] text-slate-500 flex items-center gap-1.5 truncate">
                              <span className="font-medium text-emerald-700">{location}</span>
                              {price !== null && price !== undefined && (
                                <>
                                  <span>•</span>
                                  <span className="font-semibold text-slate-700">
                                    {formatPrice(price)}
                                  </span>
                                </>
                              )}
                            </div>
                          </div>

                          <div className="flex items-center gap-1.5 shrink-0">
                            {isAlreadyOnTrip ? (
                              item.inCart ? (
                                <span
                                  className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-800 flex items-center justify-center"
                                  title="Already in cart"
                                >
                                  <Check className="w-4 h-4 stroke-[2.5]" />
                                </span>
                              ) : (
                                <button
                                  type="button"
                                  onClick={() => toggleInCart(item.id)}
                                  className="w-8 h-8 rounded-lg bg-slate-100 hover:bg-slate-200 text-emerald-700 hover:text-emerald-800 flex items-center justify-center transition cursor-pointer shrink-0 active:scale-95"
                                  title="Check item into cart"
                                >
                                  <ShoppingCart className="w-4 h-4" />
                                </button>
                              )
                            ) : (
                              <>
                                <button
                                  type="button"
                                  onClick={() => handleQuickAddExisting(item, false, quickAddQty > 1 ? quickAddQty : undefined)}
                                  className="w-8 h-8 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 flex items-center justify-center transition cursor-pointer shrink-0 active:scale-95"
                                  title="Add to shopping trip"
                                >
                                  <Plus className="w-4 h-4 stroke-[2.5]" />
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleQuickAddExisting(item, true, quickAddQty > 1 ? quickAddQty : undefined)}
                                  className="w-8 h-8 rounded-lg bg-slate-100 hover:bg-slate-200 text-emerald-700 hover:text-emerald-800 flex items-center justify-center transition cursor-pointer shrink-0 active:scale-95"
                                  title="Add to trip and put in cart"
                                >
                                  <ShoppingCart className="w-4 h-4" />
                                </button>
                              </>
                            )}
                          </div>
                        </div>
                      )
                    })}
                  </div>
                )}
              </div>
            </div>

            {/* Compact Footer */}
            <div className="px-3 py-2 bg-slate-50 border-t border-slate-100 flex items-center justify-between shrink-0">
              <span className="text-[10px] text-slate-500 flex items-center gap-1.5">
                <span>Tap</span>
                <span className="inline-flex items-center gap-0.5 font-bold text-slate-700 bg-slate-200/70 px-1 py-0.5 rounded">
                  <Plus className="w-2.5 h-2.5 stroke-[2.5]" /> List
                </span>
                <span>or</span>
                <span className="inline-flex items-center gap-0.5 font-bold text-emerald-800 bg-slate-200/70 px-1 py-0.5 rounded">
                  <ShoppingCart className="w-2.5 h-2.5" /> Cart
                </span>
              </span>
              <button
                type="button"
                onClick={() => setIsQuickAddOpen(false)}
                className="px-4 py-1.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-lg transition cursor-pointer shadow-xs"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 10. Barcode Scanner Modal */}
      {isBarcodeScannerOpen && (
        <BarcodeScannerModal
          isOpen={isBarcodeScannerOpen}
          onClose={() => setIsBarcodeScannerOpen(false)}
          currentShopId={currentShop.id}
        />
      )}

      {/* 11. AI Receipt Scanner Modal */}
      {isReceiptScannerOpen && (
        <ReceiptScannerModal
          isOpen={isReceiptScannerOpen}
          onClose={() => setIsReceiptScannerOpen(false)}
          initialShopId={currentShop.id}
        />
      )}
    </div>
  )
}
