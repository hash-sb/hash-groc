export interface Shop {
  id: string
  name: string
  color: string // Tailwind color key, e.g. 'emerald', 'amber', 'rose', 'blue', 'purple'
  icon?: string // icon name or emoji
  defaultAisles: string[] // common aisle/location suggestions in this shop
  notes?: string
  orderIndex?: number // Custom sequence for shopping trip planning (Stop 1, Stop 2...)
}

export interface StorePackageOption {
  id: string
  label?: string // e.g. 'Small', 'Regular', 'Family Size', 'Club Pack'
  packageSize: number // e.g. 16
  packageUnit: string // e.g. 'oz'
  price: number // e.g. 2.00
  unitPrice?: number | null // Computed price per unit
}

export interface ItemShopDetail {
  available: boolean // Include / Exclude in this shop
  price: number | null // Base price in USD
  location: string // Location / Aisle in this particular shop (e.g. 'Aisle 3', 'Back Cooler')
  unitSize?: string // e.g. '2-pack', '32 oz'
  packageSize?: number | null // e.g. 56 (for 56 oz) or 2 (for 2 gal)
  packageUnit?: string // e.g. 'oz', 'lb', 'gal', 'ct', 'can', 'bottle'
  unitPrice?: number | null // Computed price per packageUnit (e.g. $0.18 / oz)
  storeQuantity?: number | null // Optional manual override for number of packages to buy at this store
  packageOptions?: StorePackageOption[] // Multiple package sizes/variants available at this store
  selectedOptionId?: string // User-selected package size option for this store (defaults to best value)
  notes?: string
}

export interface ShoppingItem {
  id: string
  name: string
  category: string // e.g. 'Produce', 'Dairy & Eggs', 'Pantry'
  quantity: number
  unit: string // e.g., 'items', 'bags', 'lbs', 'gallons', 'cans', 'boxes'
  isNeeded: boolean // True if currently on the active shopping list
  inCart: boolean // True if picked up in the current shopping session
  isWeekly?: boolean // True if recurring weekly staple
  notes?: string
  barcode?: string // UPC / EAN / Code-128 barcode
  imageUrl?: string // Optional product image URL (from barcode lookup)
  shops: Record<string, ItemShopDetail> // Keyed by Shop.id
  createdAt: number
  updatedAt: number
}

export interface Household {
  id: string
  name: string
  inviteCode: string
  createdByUserEmail?: string
  memberEmails?: string[]
  customCategories?: string[]
  storeOrder?: string[]
  customDefaultItems?: ShoppingItem[]
  customDefaultShops?: Shop[]
  customDefaultSavedAt?: number
}

export interface PurchasedItemRecord {
  itemId: string
  name: string
  category?: string
  quantity: number
  unit: string
  packs: number
  price: number
  totalPrice: number
}

export interface TripReceipt {
  id: string
  timestamp: number
  shopId: string
  shopName: string
  shopColor?: string
  totalAmount: number
  totalSavings?: number
  itemsCount: number
  items: PurchasedItemRecord[]
}

export const COMMON_UNITS = [
  'pieces',
  'dozens',
  'bags',
  'lbs',
  'oz',
  'kg',
  'gal',
  'qt',
  'pt',
  'liters',
  'fl oz',
  'cartons',
  'cans',
  'boxes',
  'packs',
  'jars',
  'bottles',
  'bunches',
  'heads',
  'loaves',
  'tubs',
  'rolls',
] as const

export type AppMode = 'add' | 'shopping' | 'analysis'
