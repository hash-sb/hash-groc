import type { Shop, ShoppingItem } from '../types'
import { scoreWordPrefixMatch } from './search'

export interface ParsedReceiptItem {
  id: string
  rawName: string
  cleanedName: string
  price: number
  unitPrice?: number | null
  quantity: number
  packageSize?: string | null
  category?: string | null
  matchedItemId?: string
  isNewItem?: boolean
  selected: boolean
}

export interface ParsedReceiptResult {
  detectedStoreName: string | null
  detectedDate: string | null
  detectedTotal: number | null
  matchedShopId?: string
  items: ParsedReceiptItem[]
}

const STORAGE_GEMINI_KEY = 'hash_groc_gemini_api_key'

export function getGeminiApiKey(): string {
  const stored = localStorage.getItem(STORAGE_GEMINI_KEY)
  if (stored && stored.trim()) return stored.trim()
  return (import.meta.env.VITE_GEMINI_API_KEY || '').trim()
}

export function saveGeminiApiKey(key: string): void {
  if (!key.trim()) {
    localStorage.removeItem(STORAGE_GEMINI_KEY)
  } else {
    localStorage.setItem(STORAGE_GEMINI_KEY, key.trim())
  }
}

/**
 * Resizes and compresses an image file/blob to optimize for OCR speed and network efficiency.
 */
export async function compressImageForOcr(
  fileOrBlob: File | Blob,
  maxDimension = 1600,
  quality = 0.85
): Promise<{ base64Data: string; mimeType: string }> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onerror = reject
    reader.onload = () => {
      const img = new Image()
      img.onerror = reject
      img.onload = () => {
        let { width, height } = img

        if (width > maxDimension || height > maxDimension) {
          if (width > height) {
            height = Math.round((height * maxDimension) / width)
            width = maxDimension
          } else {
            width = Math.round((width * maxDimension) / height)
            height = maxDimension
          }
        }

        const canvas = document.createElement('canvas')
        canvas.width = width
        canvas.height = height

        const ctx = canvas.getContext('2d')
        if (!ctx) {
          reject(new Error('Failed to get canvas 2D context'))
          return
        }

        ctx.drawImage(img, 0, 0, width, height)
        const dataUrl = canvas.toDataURL('image/jpeg', quality)
        const base64Data = dataUrl.split(',')[1]
        resolve({ base64Data, mimeType: 'image/jpeg' })
      }
      img.src = reader.result as string
    }
    reader.readAsDataURL(fileOrBlob)
  })
}

/**
 * Calls Gemini Vision API to analyze receipt image and extract structured items & prices.
 */
export async function parseReceiptWithGemini(
  fileOrBlob: File | Blob,
  availableItems: ShoppingItem[],
  availableShops: Shop[],
  customApiKey?: string
): Promise<ParsedReceiptResult> {
  const apiKey = customApiKey?.trim() || getGeminiApiKey()

  if (!apiKey) {
    throw new Error('MISSING_API_KEY')
  }

  const { base64Data, mimeType } = await compressImageForOcr(fileOrBlob)

  const prompt = `You are a high-accuracy grocery receipt parser. Analyze this receipt photo and extract all purchased items, prices, store details, and total.

Format your response as a valid JSON object matching this schema:
{
  "storeName": "Store Brand Name (e.g. Costco, Trader Joe's, ALDI, Walmart, Target, Kroger, HEB, Whole Foods, Safeway) or null if unreadable",
  "date": "YYYY-MM-DD or null if not found",
  "total": 0.00,
  "items": [
    {
      "rawName": "Exact text line from receipt (e.g. KS ORG WHOLE MILK 1GAL)",
      "cleanedName": "Clean human-readable grocery item name (e.g. Organic Whole Milk)",
      "price": 4.29,
      "quantity": 1,
      "packageSize": "1 gal or 16 oz or null",
      "category": "Produce | Dairy & Eggs | Meat & Poultry | Bakery | Pantry | Snacks | Frozen | Beverages | Household | Other"
    }
  ]
}

Guidelines:
- Include ONLY actual grocery/household items purchased. Exclude sales tax lines, subtotal, coupons, discount summaries, savings summaries, change due, or payment method lines (like VISA/CASH).
- Ensure price is the final item price after line-item discounts.
- Clean names should be friendly and match common grocery list entries (e.g. "Avocados", "Eggs", "Sourdough Bread").
- Return strictly raw JSON with no markdown wrapping or code blocks.`

  const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`

  const response = await fetch(endpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      contents: [
        {
          parts: [
            { text: prompt },
            {
              inline_data: {
                mime_type: mimeType,
                data: base64Data,
              },
            },
          ],
        },
      ],
      generationConfig: {
        response_mime_type: 'application/json',
        temperature: 0.1,
      },
    }),
  })

  if (!response.ok) {
    const errorText = await response.text()
    throw new Error(`Gemini API error (${response.status}): ${errorText}`)
  }

  const jsonResponse = await response.json()
  const textOutput = jsonResponse?.candidates?.[0]?.content?.parts?.[0]?.text

  if (!textOutput) {
    throw new Error('Gemini did not return any text for this receipt image.')
  }

  let parsed: any
  try {
    // Strip any accidental markdown formatting
    const sanitized = textOutput.replace(/```json/gi, '').replace(/```/g, '').trim()
    parsed = JSON.parse(sanitized)
  } catch (err) {
    console.error('Failed to parse Gemini JSON output:', textOutput)
    throw new Error('Failed to parse receipt data structure. Please try a clearer photo.')
  }

  // Match store with available shops
  const detectedStore = parsed.storeName || null
  let matchedShopId: string | undefined

  if (detectedStore) {
    const lowerDetected = detectedStore.toLowerCase()
    const foundShop = availableShops.find(
      (s) =>
        s.name.toLowerCase().includes(lowerDetected) ||
        lowerDetected.includes(s.name.toLowerCase())
    )
    if (foundShop) matchedShopId = foundShop.id
  }

  // Map and match items to catalog
  const mappedItems: ParsedReceiptItem[] = (parsed.items || []).map((it: any, index: number) => {
    const rawName = String(it.rawName || '').trim()
    const cleanedName = String(it.cleanedName || rawName).trim()
    const price = typeof it.price === 'number' ? Math.max(0, it.price) : Number(it.price) || 0
    const quantity = typeof it.quantity === 'number' ? Math.max(1, it.quantity) : 1
    const packageSize = it.packageSize ? String(it.packageSize).trim() : null
    const category = it.category ? String(it.category).trim() : 'Pantry'

    // Smart matching against existing catalog
    const matchedItem = matchItemToCatalog(cleanedName, availableItems)

    return {
      id: `ocr_item_${Date.now()}_${index}`,
      rawName,
      cleanedName: matchedItem ? matchedItem.name : cleanedName,
      price,
      quantity,
      packageSize,
      category: matchedItem?.category || category,
      matchedItemId: matchedItem?.id,
      isNewItem: !matchedItem,
      selected: true,
    }
  })

  return {
    detectedStoreName: detectedStore,
    detectedDate: parsed.date || new Date().toISOString().split('T')[0],
    detectedTotal: typeof parsed.total === 'number' ? parsed.total : mappedItems.reduce((acc, i) => acc + i.price, 0),
    matchedShopId,
    items: mappedItems,
  }
}

/**
 * Fuzzy matches an OCR string against existing items in the household catalog.
 */
export function matchItemToCatalog(
  extractedName: string,
  catalog: ShoppingItem[]
): ShoppingItem | null {
  if (!extractedName || catalog.length === 0) return null

  const target = extractedName.toLowerCase().trim()

  // 1. Exact match
  const exact = catalog.find((i) => i.name.toLowerCase().trim() === target)
  if (exact) return exact

  // 2. Starts with / prefix match
  const prefix = catalog.find((i) => {
    const name = i.name.toLowerCase().trim()
    return name.startsWith(target) || target.startsWith(name)
  })
  if (prefix) return prefix

  // 3. Word score matching using existing search utility
  let bestItem: ShoppingItem | null = null
  let bestScore = 0

  for (const item of catalog) {
    const score = scoreWordPrefixMatch(item.name, extractedName)
    if (score > bestScore && score >= 40) {
      bestScore = score
      bestItem = item
    }
  }

  return bestItem
}

/**
 * Realistic mock sample receipt for fast zero-config testing without an API key.
 */
export function getSampleReceiptData(
  storeName: 'Costco' | 'Trader Joe’s' | 'ALDI',
  availableItems: ShoppingItem[],
  availableShops: Shop[]
): ParsedReceiptResult {
  const samples: Record<string, Array<{ raw: string; clean: string; price: number; qty: number; size: string; cat: string }>> = {
    Costco: [
      { raw: 'KS ORG WHOLE MILK 3PK 1GAL', clean: 'Organic Whole Milk', price: 11.49, qty: 1, size: '3 gal', cat: 'Dairy & Eggs' },
      { raw: 'KS CAGE FREE LARGE EGGS 24CT', clean: 'Cage-Free Eggs', price: 4.89, qty: 1, size: '24 ct', cat: 'Dairy & Eggs' },
      { raw: 'ORGANIC BANANAS 3LB', clean: 'Organic Bananas', price: 2.19, qty: 1, size: '3 lb', cat: 'Produce' },
      { raw: 'HASS AVOCADOS 6CT BAG', clean: 'Avocados', price: 5.99, qty: 1, size: '6 ct', cat: 'Produce' },
      { raw: 'SAN FRANCISCO SOURDOUGH 2PK', clean: 'Sourdough Bread', price: 6.49, qty: 1, size: '2 loaves', cat: 'Bakery' },
      { raw: 'KS CHICKEN BREAST B/S 6LB', clean: 'Chicken Breast', price: 18.99, qty: 1, size: '6 lb', cat: 'Meat & Poultry' },
    ],
    "Trader Joe’s": [
      { raw: 'TJ ORGANIC PASTURE EGGS DZ', clean: 'Organic Pasture Eggs', price: 4.49, qty: 1, size: '12 ct', cat: 'Dairy & Eggs' },
      { raw: 'TJ WHOLE MILK 1/2 GAL', clean: 'Whole Milk', price: 2.99, qty: 1, size: '0.5 gal', cat: 'Dairy & Eggs' },
      { raw: 'EVERYTHING BAGEL PACK', clean: 'Everything Bagels', price: 2.99, qty: 1, size: '6 pack', cat: 'Bakery' },
      { raw: 'CREAMY ALMOND BUTTER 16OZ', clean: 'Almond Butter', price: 5.99, qty: 1, size: '16 oz', cat: 'Pantry' },
      { raw: 'TJ PERUVIAN COFFEE 12OZ', clean: 'Peruvian Coffee', price: 8.99, qty: 1, size: '12 oz', cat: 'Pantry' },
    ],
    ALDI: [
      { raw: 'FRIENDLY FARMS WHOLE MILK 1GAL', clean: 'Whole Milk', price: 2.89, qty: 1, size: '1 gal', cat: 'Dairy & Eggs' },
      { raw: 'GOLDHEN LARGE WHITE EGGS 12CT', clean: 'Large Eggs', price: 2.19, qty: 1, size: '12 ct', cat: 'Dairy & Eggs' },
      { raw: 'SPECIALLY SELECTED SOURDOUGH', clean: 'Sourdough Bread', price: 3.49, qty: 1, size: '1 loaf', cat: 'Bakery' },
      { raw: 'FRESH STRAWBERRIES 1LB PK', clean: 'Strawberries', price: 2.49, qty: 1, size: '1 lb', cat: 'Produce' },
      { raw: 'PARK STREET HUMMUS 10OZ', clean: 'Hummus', price: 1.99, qty: 1, size: '10 oz', cat: 'Snacks' },
    ],
  }

  const itemsData = samples[storeName] || samples.Costco
  const matchedShop = availableShops.find(
    (s) => s.name.toLowerCase().includes(storeName.toLowerCase())
  )

  const mappedItems: ParsedReceiptItem[] = itemsData.map((it, idx) => {
    const matchedItem = matchItemToCatalog(it.clean, availableItems)
    return {
      id: `sample_item_${idx}`,
      rawName: it.raw,
      cleanedName: matchedItem ? matchedItem.name : it.clean,
      price: it.price,
      quantity: it.qty,
      packageSize: it.size,
      category: matchedItem?.category || it.cat,
      matchedItemId: matchedItem?.id,
      isNewItem: !matchedItem,
      selected: true,
    }
  })

  const total = mappedItems.reduce((acc, i) => acc + i.price, 0)

  return {
    detectedStoreName: storeName,
    detectedDate: new Date().toISOString().split('T')[0],
    detectedTotal: Number(total.toFixed(2)),
    matchedShopId: matchedShop?.id || availableShops[0]?.id,
    items: mappedItems,
  }
}
