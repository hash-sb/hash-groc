import type { ShoppingItem } from '../types'

/**
 * Returns all barcodes associated with an item, deduplicated and trimmed.
 * Backwards compatible with legacy single `barcode` property.
 */
export function getItemBarcodes(item: Partial<ShoppingItem> | null | undefined): string[] {
  if (!item) return []
  const list: string[] = []

  if (Array.isArray(item.barcodes)) {
    for (const b of item.barcodes) {
      if (b && typeof b === 'string' && b.trim()) {
        const trimmed = b.trim()
        if (!list.includes(trimmed)) {
          list.push(trimmed)
        }
      }
    }
  }

  if (item.barcode && typeof item.barcode === 'string' && item.barcode.trim()) {
    const legacy = item.barcode.trim()
    if (!list.includes(legacy)) {
      list.push(legacy)
    }
  }

  return list
}

/**
 * Checks if a given barcode matches any of the item's barcodes.
 * Handles leading zeros comparison (e.g. 049000006346 vs 49000006346).
 */
export function doesItemMatchBarcode(
  item: Partial<ShoppingItem> | null | undefined,
  rawCode: string | null | undefined
): boolean {
  if (!item || !rawCode) return false
  const code = rawCode.trim()
  if (!code) return false

  const codeNoLeadingZeros = code.replace(/^0+/, '')
  const allBarcodes = getItemBarcodes(item)

  return allBarcodes.some((b) => {
    if (b === code) return true
    const bNoLeading = b.replace(/^0+/, '')
    return Boolean(bNoLeading && bNoLeading === codeNoLeadingZeros)
  })
}

/**
 * Appends a new barcode to an item's barcode list without duplicates.
 */
export function appendBarcodeToItem(
  item: Partial<ShoppingItem> | null | undefined,
  newCode: string | null | undefined
): string[] {
  const current = getItemBarcodes(item)
  if (!newCode || !newCode.trim()) return current
  const trimmed = newCode.trim()
  if (!current.includes(trimmed)) {
    return [...current, trimmed]
  }
  return current
}

/**
 * Removes a barcode from an item's barcode list.
 */
export function removeBarcodeFromItem(
  item: Partial<ShoppingItem> | null | undefined,
  codeToRemove: string | null | undefined
): string[] {
  const current = getItemBarcodes(item)
  if (!codeToRemove) return current
  const target = codeToRemove.trim()
  const targetNoLeading = target.replace(/^0+/, '')

  return current.filter((b) => {
    if (b === target) return false
    const bNoLeading = b.replace(/^0+/, '')
    return !(bNoLeading && bNoLeading === targetNoLeading)
  })
}
