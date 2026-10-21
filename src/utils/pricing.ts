import type { Shop, ShoppingItem } from '../types'

export interface PriceComparison {
  currentPrice: number | null
  currentPacksNeeded: number
  currentFulfillmentCost: number | null
  currentUnitPrice: number | null
  currentPackageUnit: string | null
  cheapestShop: Shop | null
  cheapestPrice: number | null
  cheapestPacksNeeded: number
  cheapestFulfillmentCost: number | null
  cheapestUnitPrice: number | null
  isCheaperElsewhere: boolean
  isBestPriceHere: boolean
  savingsAmount: number
  allStorePrices: Array<{
    shop: Shop
    price: number
    packsNeeded: number
    fulfillmentCost: number
    packageSize?: number | null
    packageUnit?: string | null
    unitPrice?: number | null
    available: boolean
    location: string
  }>
}

export type UnitFamily = 'weight' | 'volume' | 'count' | 'container' | 'unknown'

/** Standard grocery unit conversion multipliers to base units */
export const WEIGHT_TO_OZ: Record<string, number> = {
  oz: 1,
  ounce: 1,
  ounces: 1,
  lb: 16,
  lbs: 16,
  pound: 16,
  pounds: 16,
  g: 0.035274,
  gram: 0.035274,
  grams: 0.035274,
  kg: 35.274,
  kilo: 35.274,
  kilogram: 35.274,
  kilograms: 35.274,
}

export const VOLUME_TO_FLOZ: Record<string, number> = {
  'fl oz': 1,
  floz: 1,
  'fluid ounce': 1,
  'fluid ounces': 1,
  cup: 8,
  cups: 8,
  pt: 16,
  pint: 16,
  pints: 16,
  qt: 32,
  quart: 32,
  quarts: 32,
  gal: 128,
  gallon: 128,
  gallons: 128,
  ml: 0.033814,
  milliliter: 0.033814,
  milliliters: 0.033814,
  l: 33.814,
  liter: 33.814,
  liters: 33.814,
}

/** Pure discrete items and count multipliers */
export const COUNT_TO_ITEMS: Record<string, number> = {
  item: 1,
  items: 1,
  piece: 1,
  pieces: 1,
  ct: 1,
  count: 1,
  ea: 1,
  each: 1,
  pair: 2,
  pairs: 2,
  dozen: 12,
  dozens: 12,
}

/** Packaging containers and structural form factors */
export const CONTAINER_NORMALIZATION: Record<string, string> = {
  can: 'can',
  cans: 'can',
  bottle: 'bottle',
  bottles: 'bottle',
  box: 'box',
  boxes: 'box',
  carton: 'carton',
  cartons: 'carton',
  bag: 'bag',
  bags: 'bag',
  bar: 'bar',
  bars: 'bar',
  jar: 'jar',
  jars: 'jar',
  tub: 'tub',
  tubs: 'tub',
  roll: 'roll',
  rolls: 'roll',
  loaf: 'loaf',
  loaves: 'loaf',
  bunch: 'bunch',
  bunches: 'bunch',
  head: 'head',
  heads: 'head',
  pk: 'pack',
  pack: 'pack',
  packs: 'pack',
}

export interface UnitOptionGroup {
  label: string
  family: UnitFamily
  units: string[]
}

/** Pre-grouped unit definitions for UI selectors */
export const UNIT_GROUPS: UnitOptionGroup[] = [
  {
    label: 'Weight',
    family: 'weight',
    units: ['oz', 'lb', 'lbs', 'g', 'kg'],
  },
  {
    label: 'Liquid Volume',
    family: 'volume',
    units: ['fl oz', 'cup', 'pt', 'qt', 'gal', 'liters', 'ml'],
  },
  {
    label: 'Discrete Count',
    family: 'count',
    units: ['pieces', 'ct', 'dozens', 'pairs', 'items'],
  },
  {
    label: 'Containers & Packaging',
    family: 'container',
    units: [
      'bottles',
      'cans',
      'boxes',
      'bags',
      'jars',
      'cartons',
      'tubs',
      'rolls',
      'bars',
      'loaves',
      'bunches',
      'heads',
      'packs',
    ],
  },
]

/**
 * Returns the dimensional unit family for a given unit name
 */
export function getUnitFamily(unit?: string | null): UnitFamily {
  if (!unit) return 'unknown'
  const u = unit.toLowerCase().trim()
  if (WEIGHT_TO_OZ[u]) return 'weight'
  if (VOLUME_TO_FLOZ[u]) return 'volume'
  if (COUNT_TO_ITEMS[u]) return 'count'
  if (CONTAINER_NORMALIZATION[u]) return 'container'
  return 'unknown'
}

/**
 * Checks whether two units are physically compatible for automatic conversion
 */
export function areUnitsCompatible(unitA?: string | null, unitB?: string | null): boolean {
  if (!unitA || !unitB) return true
  const normA = unitA.toLowerCase().trim()
  const normB = unitB.toLowerCase().trim()
  if (normA === normB) return true

  const familyA = getUnitFamily(normA)
  const familyB = getUnitFamily(normB)

  if (familyA !== familyB) return false

  if (familyA === 'container') {
    return CONTAINER_NORMALIZATION[normA] === CONTAINER_NORMALIZATION[normB]
  }

  return familyA !== 'unknown'
}

export interface UnitCompatibilityResult {
  isCompatible: boolean
  fromFamily: UnitFamily
  toFamily: UnitFamily
  convertedAmount: number | null
  message: string
  isConversion: boolean
}

/**
 * Detailed compatibility inspector used for real-time validation in the Item Editor
 */
export function checkUnitCompatibility(
  amount: number,
  fromUnit?: string | null,
  toUnit?: string | null
): UnitCompatibilityResult {
  const normFrom = (fromUnit || '').toLowerCase().trim()
  const normTo = (toUnit || '').toLowerCase().trim()

  const fromFamily = getUnitFamily(normFrom)
  const toFamily = getUnitFamily(normTo)

  // Empty unit fallback
  if (!normFrom || !normTo) {
    return {
      isCompatible: true,
      fromFamily,
      toFamily,
      convertedAmount: amount,
      message: 'Unspecified unit',
      isConversion: false,
    }
  }

  // Exact matching string
  if (normFrom === normTo) {
    return {
      isCompatible: true,
      fromFamily,
      toFamily,
      convertedAmount: amount,
      message: `Matching unit (${normFrom})`,
      isConversion: false,
    }
  }

  // Weight family
  if (fromFamily === 'weight' && toFamily === 'weight') {
    const converted = convertUnits(amount, normFrom, normTo)
    const formatted =
      converted !== null
        ? Number.isInteger(converted)
          ? converted
          : Number(converted.toFixed(2))
        : amount
    return {
      isCompatible: true,
      fromFamily,
      toFamily,
      convertedAmount: converted,
      message: `${amount} ${fromUnit} = ${formatted} ${toUnit} (Weight conversion)`,
      isConversion: true,
    }
  }

  // Volume family
  if (fromFamily === 'volume' && toFamily === 'volume') {
    const converted = convertUnits(amount, normFrom, normTo)
    const formatted =
      converted !== null
        ? Number.isInteger(converted)
          ? converted
          : Number(converted.toFixed(2))
        : amount
    return {
      isCompatible: true,
      fromFamily,
      toFamily,
      convertedAmount: converted,
      message: `${amount} ${fromUnit} = ${formatted} ${toUnit} (Volume conversion)`,
      isConversion: true,
    }
  }

  // Discrete Count family (e.g. dozens to ct)
  if (fromFamily === 'count' && toFamily === 'count') {
    const converted = convertUnits(amount, normFrom, normTo)
    const formatted =
      converted !== null
        ? Number.isInteger(converted)
          ? converted
          : Number(converted.toFixed(2))
        : amount
    return {
      isCompatible: true,
      fromFamily,
      toFamily,
      convertedAmount: converted,
      message: `${amount} ${fromUnit} = ${formatted} ${toUnit} (Count conversion)`,
      isConversion: true,
    }
  }

  // Matching container (e.g. bottles <-> bottle)
  if (
    fromFamily === 'container' &&
    toFamily === 'container' &&
    CONTAINER_NORMALIZATION[normFrom] &&
    CONTAINER_NORMALIZATION[normFrom] === CONTAINER_NORMALIZATION[normTo]
  ) {
    return {
      isCompatible: true,
      fromFamily,
      toFamily,
      convertedAmount: amount,
      message: `Matching container (${CONTAINER_NORMALIZATION[normFrom]})`,
      isConversion: false,
    }
  }

  const getLabel = (f: UnitFamily) => {
    switch (f) {
      case 'weight':
        return 'Weight'
      case 'volume':
        return 'Liquid Volume'
      case 'count':
        return 'Discrete Count'
      case 'container':
        return 'Container'
      default:
        return 'Custom'
    }
  }

  return {
    isCompatible: false,
    fromFamily,
    toFamily,
    convertedAmount: null,
    message: `Unit mismatch: "${fromUnit}" (${getLabel(fromFamily)}) cannot convert to "${toUnit}" (${getLabel(toFamily)}).`,
    isConversion: false,
  }
}

/**
 * Converts an amount from one unit to another if they belong to the same dimensional family
 */
export function convertUnits(
  amount: number,
  fromUnit?: string | null,
  toUnit?: string | null
): number | null {
  if (!fromUnit || !toUnit || isNaN(amount) || amount <= 0) return null
  const from = fromUnit.toLowerCase().trim()
  const to = toUnit.toLowerCase().trim()

  if (from === to) return amount

  // Weight family
  if (WEIGHT_TO_OZ[from] && WEIGHT_TO_OZ[to]) {
    const inOz = amount * WEIGHT_TO_OZ[from]
    return inOz / WEIGHT_TO_OZ[to]
  }

  // Volume family
  if (VOLUME_TO_FLOZ[from] && VOLUME_TO_FLOZ[to]) {
    const inFlOz = amount * VOLUME_TO_FLOZ[from]
    return inFlOz / VOLUME_TO_FLOZ[to]
  }

  // Discrete Count family (pure counts only)
  if (COUNT_TO_ITEMS[from] && COUNT_TO_ITEMS[to]) {
    const inCount = amount * COUNT_TO_ITEMS[from]
    return inCount / COUNT_TO_ITEMS[to]
  }

  // Matching container plural/singular
  if (
    CONTAINER_NORMALIZATION[from] &&
    CONTAINER_NORMALIZATION[to] &&
    CONTAINER_NORMALIZATION[from] === CONTAINER_NORMALIZATION[to]
  ) {
    return amount
  }

  return null
}

/**
 * Normalizes a unit price to standard base units (per oz, per fl oz, or per item)
 * so unit prices across different package units can be fairly compared and tie-broken.
 */
export function getNormalizedUnitPrice(
  unitPrice: number | null | undefined,
  unit: string | null | undefined
): number | null {
  if (unitPrice === null || unitPrice === undefined || isNaN(unitPrice) || !unit) return null
  const u = unit.toLowerCase().trim()
  if (WEIGHT_TO_OZ[u]) {
    return unitPrice / WEIGHT_TO_OZ[u]
  }
  if (VOLUME_TO_FLOZ[u]) {
    return unitPrice / VOLUME_TO_FLOZ[u]
  }
  if (COUNT_TO_ITEMS[u]) {
    return unitPrice / COUNT_TO_ITEMS[u]
  }
  return unitPrice
}

/**
 * Calculates how many store packages are needed to fulfill the item's target demand.
 * Formula: ceil(targetAmount / storePackageSize) with unit normalization.
 */
export function getPacksNeeded(item: ShoppingItem, shopId: string): number {
  const detail = item.shops[shopId]
  const targetAmount = item.quantity || 1
  if (!detail) return targetAmount

  // Manual storeQuantity override takes priority if defined
  if (typeof detail.storeQuantity === 'number' && detail.storeQuantity > 0) {
    return detail.storeQuantity
  }

  const targetUnit = item.unit || ''
  const packSize = detail.packageSize
  const packUnit = detail.packageUnit || targetUnit

  if (typeof packSize === 'number' && packSize > 0) {
    // Attempt unit conversion (e.g. 4 lbs target into 16 oz store packs -> 4 packs)
    const convertedTarget = convertUnits(targetAmount, targetUnit, packUnit)
    if (convertedTarget !== null && convertedTarget > 0) {
      return Math.max(1, Math.ceil(convertedTarget / packSize))
    }

    // Direct ratio if units match or are identical containers
    const normTarget = targetUnit.toLowerCase().trim()
    const normPack = packUnit.toLowerCase().trim()
    if (
      !targetUnit ||
      normTarget === normPack ||
      (CONTAINER_NORMALIZATION[normTarget] &&
        CONTAINER_NORMALIZATION[normTarget] === CONTAINER_NORMALIZATION[normPack])
    ) {
      return Math.max(1, Math.ceil(targetAmount / packSize))
    }
  }

  return Math.max(1, Math.round(targetAmount))
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
  const currentPacksNeeded = currentShopId ? getPacksNeeded(item, currentShopId) : (item.quantity || 1)
  const currentPrice =
    currentDetail?.available && typeof currentDetail.price === 'number'
      ? currentDetail.price
      : null
  const currentFulfillmentCost =
    currentPrice !== null ? currentPrice * currentPacksNeeded : null
  const currentUnitPrice = currentDetail?.unitPrice || null
  const currentPackageUnit = currentDetail?.packageUnit || null

  let cheapestShop: Shop | null = null
  let cheapestCompVal: number | null = null
  let cheapestPrice: number | null = null
  let cheapestPacksNeeded = 1
  let cheapestFulfillmentCost: number | null = null
  let cheapestUnitPrice: number | null = null
  let cheapestPackageUnit: string | null = null

  const allStorePrices: PriceComparison['allStorePrices'] = []

  for (const shop of shops) {
    const detail = item.shops[shop.id]
    const packsNeeded = getPacksNeeded(item, shop.id)

    if (detail && detail.available && typeof detail.price === 'number' && detail.price > 0) {
      const fulfillmentCost = detail.price * packsNeeded

      allStorePrices.push({
        shop,
        price: detail.price,
        packsNeeded,
        fulfillmentCost,
        packageSize: detail.packageSize,
        packageUnit: detail.packageUnit,
        unitPrice: detail.unitPrice,
        available: true,
        location: detail.location || '',
      })

      // The comparison value is the total fulfillment cost to satisfy the needed amount.
      // If two stores have equal fulfillment cost, normalized unit price breaks ties.
      const compVal = fulfillmentCost

      if (cheapestCompVal === null || compVal < cheapestCompVal) {
        cheapestCompVal = compVal
        cheapestShop = shop
        cheapestPrice = detail.price
        cheapestPacksNeeded = packsNeeded
        cheapestFulfillmentCost = fulfillmentCost
        cheapestUnitPrice = detail.unitPrice || null
        cheapestPackageUnit = detail.packageUnit || null
      } else if (compVal === cheapestCompVal && detail.unitPrice && cheapestUnitPrice) {
        // Tie-breaker: better normalized unit price (fair comparison across oz vs lb, etc.)
        const normCurrent = getNormalizedUnitPrice(detail.unitPrice, detail.packageUnit)
        const normCheapest = getNormalizedUnitPrice(cheapestUnitPrice, cheapestPackageUnit)
        if (normCurrent !== null && normCheapest !== null && normCurrent < normCheapest) {
          cheapestShop = shop
          cheapestPrice = detail.price
          cheapestPacksNeeded = packsNeeded
          cheapestFulfillmentCost = fulfillmentCost
          cheapestUnitPrice = detail.unitPrice
          cheapestPackageUnit = detail.packageUnit || null
        } else if (detail.unitPrice < cheapestUnitPrice) {
          cheapestShop = shop
          cheapestPrice = detail.price
          cheapestPacksNeeded = packsNeeded
          cheapestFulfillmentCost = fulfillmentCost
          cheapestUnitPrice = detail.unitPrice
          cheapestPackageUnit = detail.packageUnit || null
        }
      }
    } else if (detail) {
      allStorePrices.push({
        shop,
        price: detail.price || 0,
        packsNeeded,
        fulfillmentCost: (detail.price || 0) * packsNeeded,
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

  if (
    currentFulfillmentCost !== null &&
    cheapestFulfillmentCost !== null &&
    cheapestShop &&
    cheapestShop.id !== currentShopId
  ) {
    if (currentFulfillmentCost > cheapestFulfillmentCost) {
      isCheaperElsewhere = true
      savingsAmount = Math.max(0, currentFulfillmentCost - cheapestFulfillmentCost)
    }
  }

  const isBestPriceHere =
    currentFulfillmentCost !== null &&
    cheapestFulfillmentCost !== null &&
    currentFulfillmentCost <= cheapestFulfillmentCost &&
    allStorePrices.filter((p) => p.available && p.price > 0).length > 1

  return {
    currentPrice,
    currentPacksNeeded,
    currentFulfillmentCost,
    currentUnitPrice,
    currentPackageUnit,
    cheapestShop,
    cheapestPrice,
    cheapestPacksNeeded,
    cheapestFulfillmentCost,
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
