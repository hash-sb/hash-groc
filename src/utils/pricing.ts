import type { Shop, ShoppingItem } from '../types'

export interface PriceComparison {
  currentPrice: number | null
  currentUnitPrice: number | null
  currentPackageUnit: string | null
  cheapestShop: Shop | null
  cheapestPrice: number | null
  cheapestUnitPrice: number | null
  isCheaperElsewhere: boolean
  isBestPriceHere: boolean
  savingsAmount: number
  allStorePrices: Array<{
    shop: Shop
    price: number
    packageSize?: number | null
    packageUnit?: string | null
    unitPrice?: number | null
    available: boolean
    location: string
  }>
}

/**
 * Returns the effective unit price for comparison.
 * If unitPrice is defined and > 0, returns that. Otherwise returns base price.
 */
export function getEffectiveComparisonPrice(
  detail: { price: number | null; unitPrice?: number | null } | undefined
): number | null {
  if (!detail || typeof detail.price !== 'number' || detail.price <= 0) return null
  if (typeof detail.unitPrice === 'number' && detail.unitPrice > 0) {
    return detail.unitPrice
  }
  return detail.price
}

export function compareShopPrices(
  item: ShoppingItem,
  currentShopId: string,
  shops: Shop[]
): PriceComparison {
  const currentDetail = item.shops[currentShopId]
  const currentPrice =
    currentDetail?.available && typeof currentDetail.price === 'number'
      ? currentDetail.price
      : null
  const currentUnitPrice = currentDetail?.unitPrice || null
  const currentPackageUnit = currentDetail?.packageUnit || null

  let cheapestShop: Shop | null = null
  let cheapestCompVal: number | null = null
  let cheapestPrice: number | null = null
  let cheapestUnitPrice: number | null = null

  const allStorePrices: PriceComparison['allStorePrices'] = []

  // Check if any stores have unit prices with matching units for apples-to-apples comparison
  const hasNormalizedUnits = Object.values(item.shops).some(
    (s) => s.available && typeof s.unitPrice === 'number' && s.unitPrice > 0
  )

  for (const shop of shops) {
    const detail = item.shops[shop.id]
    if (detail && detail.available && typeof detail.price === 'number' && detail.price > 0) {
      allStorePrices.push({
        shop,
        price: detail.price,
        packageSize: detail.packageSize,
        packageUnit: detail.packageUnit,
        unitPrice: detail.unitPrice,
        available: true,
        location: detail.location || '',
      })

      const compVal = hasNormalizedUnits && detail.unitPrice ? detail.unitPrice : detail.price

      if (cheapestCompVal === null || compVal < cheapestCompVal) {
        cheapestCompVal = compVal
        cheapestShop = shop
        cheapestPrice = detail.price
        cheapestUnitPrice = detail.unitPrice || null
      }
    } else if (detail) {
      allStorePrices.push({
        shop,
        price: detail.price || 0,
        packageSize: detail.packageSize,
        packageUnit: detail.packageUnit,
        unitPrice: detail.unitPrice,
        available: detail.available,
        location: detail.location || '',
      })
    }
  }

  // Determine if cheaper elsewhere
  let isCheaperElsewhere = false
  let savingsAmount = 0

  const currentCompVal =
    hasNormalizedUnits && currentUnitPrice ? currentUnitPrice : currentPrice

  if (
    currentCompVal !== null &&
    cheapestCompVal !== null &&
    cheapestShop &&
    cheapestShop.id !== currentShopId
  ) {
    if (currentCompVal > cheapestCompVal) {
      isCheaperElsewhere = true
      // Approximate savings amount
      if (currentPrice && cheapestPrice) {
        savingsAmount = Math.max(0, currentPrice - cheapestPrice)
      }
    }
  }

  const isBestPriceHere =
    currentCompVal !== null &&
    cheapestCompVal !== null &&
    currentCompVal <= cheapestCompVal &&
    allStorePrices.filter((p) => p.available && p.price > 0).length > 1

  return {
    currentPrice,
    currentUnitPrice,
    currentPackageUnit,
    cheapestShop,
    cheapestPrice,
    cheapestUnitPrice,
    isCheaperElsewhere,
    isBestPriceHere,
    savingsAmount,
    allStorePrices,
  }
}

/**
 * Checks if the given item is strictly cheapest (or tied cheapest) at targetShopId.
 * Used for "Save Mode".
 */
export function isCheapestAtStore(
  item: ShoppingItem,
  targetShopId: string,
  shops: Shop[]
): boolean {
  const targetDetail = item.shops[targetShopId]
  if (!targetDetail || !targetDetail.available || targetDetail.price === null || targetDetail.price <= 0) {
    return false
  }

  // Compare against all other shops carrying this item
  const comp = compareShopPrices(item, targetShopId, shops)
  // If no other shop carries it or this is best price / cheapest shop:
  if (!comp.isCheaperElsewhere) {
    return true
  }
  return false
}

export function formatPrice(num: number | null | undefined): string {
  if (num === null || num === undefined || isNaN(num)) return '--'
  return `$${num.toFixed(2)}`
}

export function formatUnitPrice(price: number | null | undefined, unit: string | null | undefined): string {
  if (price === null || price === undefined || isNaN(price) || !unit) return ''
  return `$${price < 1 ? price.toFixed(3) : price.toFixed(2)} / ${unit}`
}

/**
 * Group shopping items by their location in the currently selected shop.
 */
export function groupItemsByShopLocation(
  items: ShoppingItem[],
  shop: Shop | undefined
): Array<{ location: string; items: ShoppingItem[] }> {
  if (!shop) return [{ location: 'General', items }]

  const groupsMap: Record<string, ShoppingItem[]> = {}

  items.forEach((item) => {
    const loc = item.shops[shop.id]?.location?.trim() || 'Other / Unassigned'
    if (!groupsMap[loc]) {
      groupsMap[loc] = []
    }
    groupsMap[loc].push(item)
  })

  // Sort groups by shop's default aisles ordering
  const defaultOrder = shop.defaultAisles || []
  const groupNames = Object.keys(groupsMap)

  groupNames.sort((a, b) => {
    if (a === 'Other / Unassigned') return 1
    if (b === 'Other / Unassigned') return -1

    const indexA = defaultOrder.indexOf(a)
    const indexB = defaultOrder.indexOf(b)

    if (indexA !== -1 && indexB !== -1) return indexA - indexB
    if (indexA !== -1) return -1
    if (indexB !== -1) return 1

    return a.localeCompare(b)
  })

  return groupNames.map((location) => ({
    location,
    items: groupsMap[location],
  }))
}
