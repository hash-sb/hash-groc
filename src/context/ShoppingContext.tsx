import React, { createContext, useContext, useEffect, useMemo, useState } from 'react'
import type { AppMode, ItemShopDetail, Shop, ShoppingItem, Household, TripReceipt } from '../types'
import { INITIAL_ITEMS, INITIAL_SHOPS } from '../data/seedData'
import { db, isConfigured } from '../firebase/config'
import { useAuth } from '../firebase/AuthContext'
import {
  collection,
  doc,
  setDoc,
  deleteDoc,
  onSnapshot,
  getDocs,
  writeBatch,
  updateDoc,
} from 'firebase/firestore'

interface ShoppingContextType {
  mode: AppMode
  setMode: (mode: AppMode) => void
  selectedShopId: string
  setSelectedShopId: (shopId: string) => void
  saveMode: boolean
  setSaveMode: React.Dispatch<React.SetStateAction<boolean>>
  shops: Shop[]
  items: ShoppingItem[]
  categories: string[]
  household: Household
  loading: boolean
  // Shop operations
  addShop: (shop: Omit<Shop, 'id'>) => Promise<string>
  updateShop: (id: string, updates: Partial<Shop>) => Promise<void>
  deleteShop: (id: string) => Promise<void>
  moveShopOrder: (shopId: string, direction: 'left' | 'right', targetShopId?: string) => Promise<void>
  // Item operations
  addItem: (itemData: Omit<ShoppingItem, 'id' | 'createdAt' | 'updatedAt'>) => Promise<string>
  quickAddItem: (
    name: string,
    category?: string,
    quantity?: number,
    unit?: string
  ) => Promise<string>
  updateItem: (id: string, updates: Partial<ShoppingItem>) => Promise<void>
  deleteItem: (id: string) => Promise<void>
  changeItemQuantity: (id: string, delta: number) => Promise<void>
  toggleNeeded: (id: string) => Promise<void>
  toggleInCart: (id: string) => Promise<void>
  selectWeeklyItems: (resetOthers?: boolean) => Promise<number>
  toggleWeeklyItem: (itemId: string) => Promise<void>
  saveCurrentNeededAsWeekly: (replaceExisting?: boolean) => Promise<number>
  bulkSetWeekly: (itemIds: string[], isWeekly: boolean) => Promise<void>
  clearAllWeekly: () => Promise<void>
  updateItemShopDetail: (
    itemId: string,
    shopId: string,
    detail: Partial<ItemShopDetail>
  ) => Promise<void>
  clearCart: (markCompletedAsPurchased?: boolean) => Promise<void>
  // Receipt / Spending History operations
  receipts: TripReceipt[]
  recordTripReceipt: (
    receipt: Omit<TripReceipt, 'id' | 'timestamp'> & { timestamp?: number }
  ) => Promise<string>
  deleteReceipt: (id: string) => Promise<void>
  clearAllReceipts: () => Promise<void>
  // Category operations
  addCategory: (newCategory: string) => Promise<void>
  // Household operations
  joinHouseholdByCode: (code: string) => Promise<boolean>
  createHousehold: (name: string) => Promise<string>
  hasCustomDefault: boolean
  customDefaultSavedAt: number | null
  saveCurrentAsDefault: () => Promise<void>
  restoreDefaultList: () => Promise<void>
  clearCustomDefault: () => Promise<void>
  resetToSampleData: () => Promise<void>
}

const ShoppingContext = createContext<ShoppingContextType | undefined>(undefined)

const STORAGE_KEY_ITEMS = 'hash_groc_items_v6'
const STORAGE_KEY_SHOPS = 'hash_groc_shops_v6'
const STORAGE_KEY_HH = 'hash_groc_current_hh_v6'
const STORAGE_KEY_SAVEMODE = 'hash_groc_savemode_v6'
const STORAGE_KEY_CUSTOM_CATS = 'hash_groc_cats_v6'
const STORAGE_KEY_CUSTOM_DEFAULT_ITEMS = 'hash_groc_custom_default_items_v1'
const STORAGE_KEY_CUSTOM_DEFAULT_SHOPS = 'hash_groc_custom_default_shops_v1'
const STORAGE_KEY_CUSTOM_DEFAULT_TIME = 'hash_groc_custom_default_time_v1'
const STORAGE_KEY_RECEIPTS = 'hash_groc_receipts_v1'

const DEFAULT_CATEGORIES = [
  'Produce',
  'Dairy & Eggs',
  'Meat & Seafood',
  'Pantry & Grains',
  'Frozen Foods',
  'Bakery & Bread',
  'Snacks & Sweets',
  'Beverages',
  'Household & Cleaning',
  'Personal Care',
  'Other',
]

const getSampleReceipts = (): TripReceipt[] => {
  const now = Date.now()
  const oneDay = 24 * 60 * 60 * 1000
  return [
    {
      id: 'receipt-sample-1',
      timestamp: now - 3 * oneDay,
      shopId: 'costco',
      shopName: 'Costco',
      shopColor: 'rose',
      totalAmount: 68.4,
      totalSavings: 14.2,
      itemsCount: 5,
      items: [
        {
          itemId: 'item-costco-1',
          name: 'Bananas',
          category: 'Produce',
          quantity: 2,
          unit: 'bunches',
          packs: 2,
          price: 1.89,
          totalPrice: 3.78,
        },
        {
          itemId: 'item-costco-2',
          name: 'Olive Oil',
          category: 'Pantry & Grains',
          quantity: 1,
          unit: 'bottle',
          packs: 1,
          price: 16.99,
          totalPrice: 16.99,
        },
        {
          itemId: 'item-costco-3',
          name: 'Eggs (2 Dozen)',
          category: 'Dairy & Eggs',
          quantity: 2,
          unit: 'cartons',
          packs: 2,
          price: 5.49,
          totalPrice: 10.98,
        },
        {
          itemId: 'item-costco-4',
          name: 'Chicken Breast',
          category: 'Meat & Seafood',
          quantity: 3,
          unit: 'packs',
          packs: 3,
          price: 8.99,
          totalPrice: 26.97,
        },
        {
          itemId: 'item-costco-5',
          name: 'Paper Towels',
          category: 'Household & Cleaning',
          quantity: 1,
          unit: 'pack',
          packs: 1,
          price: 9.68,
          totalPrice: 9.68,
        },
      ],
    },
    {
      id: 'receipt-sample-2',
      timestamp: now - 7 * oneDay,
      shopId: 'trader_joes',
      shopName: "Trader Joe's",
      shopColor: 'emerald',
      totalAmount: 34.75,
      totalSavings: 6.5,
      itemsCount: 4,
      items: [
        {
          itemId: 'item-tj-1',
          name: 'Greek Yogurt',
          category: 'Dairy & Eggs',
          quantity: 2,
          unit: 'tubs',
          packs: 2,
          price: 4.99,
          totalPrice: 9.98,
        },
        {
          itemId: 'item-tj-2',
          name: 'Sliced Bread',
          category: 'Bakery & Bread',
          quantity: 1,
          unit: 'loaf',
          packs: 1,
          price: 2.99,
          totalPrice: 2.99,
        },
        {
          itemId: 'item-tj-3',
          name: 'Baby Spinach',
          category: 'Produce',
          quantity: 2,
          unit: 'bags',
          packs: 2,
          price: 2.49,
          totalPrice: 4.98,
        },
        {
          itemId: 'item-tj-4',
          name: 'Peanut Butter',
          category: 'Pantry & Grains',
          quantity: 2,
          unit: 'jars',
          packs: 2,
          price: 3.4,
          totalPrice: 6.8,
        },
      ],
    },
    {
      id: 'receipt-sample-3',
      timestamp: now - 12 * oneDay,
      shopId: 'target',
      shopName: 'Target',
      shopColor: 'rose',
      totalAmount: 22.15,
      totalSavings: 3.8,
      itemsCount: 3,
      items: [
        {
          itemId: 'item-tgt-1',
          name: 'Rolled Oats',
          category: 'Pantry & Grains',
          quantity: 1,
          unit: 'box',
          packs: 1,
          price: 4.29,
          totalPrice: 4.29,
        },
        {
          itemId: 'item-tgt-2',
          name: 'Ground Coffee',
          category: 'Beverages',
          quantity: 1,
          unit: 'bag',
          packs: 1,
          price: 8.99,
          totalPrice: 8.99,
        },
        {
          itemId: 'item-tgt-3',
          name: 'Dish Soap',
          category: 'Household & Cleaning',
          quantity: 2,
          unit: 'bottles',
          packs: 2,
          price: 3.29,
          totalPrice: 6.58,
        },
      ],
    },
  ]
}

export const ShoppingProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth()
  const [mode, setMode] = useState<AppMode>('add')
  const [selectedShopId, setSelectedShopId] = useState<string>('aldi')
  const [saveMode, setSaveMode] = useState<boolean>(() => {
    return localStorage.getItem(STORAGE_KEY_SAVEMODE) === 'true'
  })
  const [shops, setShops] = useState<Shop[]>([])
  const [items, setItems] = useState<ShoppingItem[]>([])
  const [customCategories, setCustomCategories] = useState<string[]>([])
  const [loading, setLoading] = useState(true)
  const [receipts, setReceipts] = useState<TripReceipt[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEY_RECEIPTS)
    if (saved) {
      try {
        const parsed = JSON.parse(saved)
        if (Array.isArray(parsed)) return parsed
      } catch (e) {
        console.error('Failed to parse receipts from storage', e)
      }
    }
    return getSampleReceipts()
  })
  const [hasCustomDefault, setHasCustomDefault] = useState<boolean>(() => {
    return localStorage.getItem(STORAGE_KEY_CUSTOM_DEFAULT_ITEMS) !== null
  })
  const [customDefaultSavedAt, setCustomDefaultSavedAt] = useState<number | null>(() => {
    const t = localStorage.getItem(STORAGE_KEY_CUSTOM_DEFAULT_TIME)
    return t ? Number(t) : null
  })

  // Persist receipts
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_RECEIPTS, JSON.stringify(receipts))
  }, [receipts])

  // Save saveMode changes
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_SAVEMODE, String(saveMode))
  }, [saveMode])

  // Current Household
  const [household, setHousehold] = useState<Household>(() => {
    const urlParams = new URLSearchParams(window.location.search)
    const joinCode = urlParams.get('join') || urlParams.get('household')

    const savedHH = localStorage.getItem(STORAGE_KEY_HH)
    if (savedHH) {
      try {
        const parsed = JSON.parse(savedHH)
        if (joinCode && joinCode.toUpperCase() !== parsed.inviteCode) {
          return {
            id: 'hh_' + joinCode.toLowerCase(),
            name: 'Shared Family List',
            inviteCode: joinCode.toUpperCase(),
          }
        }
        return parsed
      } catch {
        // Fallback
      }
    }

    const defaultCode = joinCode ? joinCode.toUpperCase() : 'HASH88'
    return {
      id: 'hh_' + defaultCode.toLowerCase(),
      name: 'Family Grocery List',
      inviteCode: defaultCode,
    }
  })

  // Keep selectedShopId valid if shops list changes
  useEffect(() => {
    if (shops.length > 0 && !shops.some((s) => s.id === selectedShopId)) {
      setSelectedShopId(shops[0].id)
    }
  }, [shops, selectedShopId])

  // Sync Data (Firestore or LocalStorage)
  useEffect(() => {
    setLoading(true)

    if (isConfigured && db) {
      const hhId = household.id
      const itemsColRef = collection(db, 'households', hhId, 'items')
      const shopsColRef = collection(db, 'households', hhId, 'shops')
      const hhDocRef = doc(db, 'households', hhId)

      let unsubscribeItems = () => {}
      let unsubscribeShops = () => {}
      let unsubscribeHH = () => {}
      let unsubscribeReceipts = () => {}

      const initFirestore = async () => {
        try {
          const shopsSnap = await getDocs(shopsColRef)
          if (shopsSnap.empty) {
            const batch = writeBatch(db!)
            for (let i = 0; i < INITIAL_SHOPS.length; i++) {
              const s = { ...INITIAL_SHOPS[i], orderIndex: i }
              batch.set(doc(shopsColRef, s.id), s)
            }
            for (const item of INITIAL_ITEMS) {
              batch.set(doc(itemsColRef, item.id), item)
            }
            batch.set(hhDocRef, {
              ...household,
              customCategories: DEFAULT_CATEGORIES,
            })
            await batch.commit()
          }
        } catch (e) {
          console.error('Error seeding initial Firestore data:', e)
        }

        // Listen for household metadata (e.g. custom categories & saved templates)
        unsubscribeHH = onSnapshot(hhDocRef, (snap) => {
          if (snap.exists()) {
            const data = snap.data() as Household
            if (data.customCategories) {
              setCustomCategories(data.customCategories)
            }
            if (data.customDefaultSavedAt !== undefined) {
              setCustomDefaultSavedAt(data.customDefaultSavedAt || null)
              setHasCustomDefault(Boolean(data.customDefaultItems && data.customDefaultItems.length > 0))
            }
            setHousehold((prev) => ({ ...prev, ...data }))
          }
        })

        // Listen for shops
        unsubscribeShops = onSnapshot(shopsColRef, (snapshot) => {
          const loadedShops: Shop[] = []
          snapshot.forEach((d) => loadedShops.push(d.data() as Shop))
          loadedShops.sort((a, b) => (a.orderIndex ?? 0) - (b.orderIndex ?? 0))
          setShops(loadedShops.length > 0 ? loadedShops : INITIAL_SHOPS)
        })

        // Listen for items
        unsubscribeItems = onSnapshot(itemsColRef, (snapshot) => {
          const loadedItems: ShoppingItem[] = []
          snapshot.forEach((d) => loadedItems.push(d.data() as ShoppingItem))
          loadedItems.sort((a, b) => {
            if (a.isNeeded === b.isNeeded) return a.name.localeCompare(b.name)
            return a.isNeeded ? -1 : 1
          })
          setItems(loadedItems.length > 0 ? loadedItems : INITIAL_ITEMS)
          setLoading(false)
        })

        // Listen for receipts
        const receiptsColRef = collection(db!, 'households', household.id, 'receipts')
        unsubscribeReceipts = onSnapshot(receiptsColRef, (snapshot) => {
          if (!snapshot.empty) {
            const loadedReceipts: TripReceipt[] = []
            snapshot.forEach((d) => loadedReceipts.push(d.data() as TripReceipt))
            loadedReceipts.sort((a, b) => b.timestamp - a.timestamp)
            setReceipts(loadedReceipts)
            localStorage.setItem(STORAGE_KEY_RECEIPTS, JSON.stringify(loadedReceipts))
          }
        })
      }

      initFirestore()

      return () => {
        unsubscribeShops()
        unsubscribeItems()
        unsubscribeHH()
        unsubscribeReceipts()
      }
    } else {
      // LocalStorage fallback
      try {
        const savedShops = localStorage.getItem(STORAGE_KEY_SHOPS)
        const savedItems = localStorage.getItem(STORAGE_KEY_ITEMS)
        const savedCats = localStorage.getItem(STORAGE_KEY_CUSTOM_CATS)

        if (savedCats) {
          setCustomCategories(JSON.parse(savedCats))
        } else {
          setCustomCategories(DEFAULT_CATEGORIES)
          localStorage.setItem(STORAGE_KEY_CUSTOM_CATS, JSON.stringify(DEFAULT_CATEGORIES))
        }

        if (savedShops) {
          const parsedShops: Shop[] = JSON.parse(savedShops)
          parsedShops.sort((a, b) => (a.orderIndex ?? 0) - (b.orderIndex ?? 0))
          setShops(parsedShops)
        } else {
          setShops(INITIAL_SHOPS)
          localStorage.setItem(STORAGE_KEY_SHOPS, JSON.stringify(INITIAL_SHOPS))
        }

        if (savedItems) {
          setItems(JSON.parse(savedItems))
        } else {
          setItems(INITIAL_ITEMS)
          localStorage.setItem(STORAGE_KEY_ITEMS, JSON.stringify(INITIAL_ITEMS))
        }
      } catch (e) {
        console.error('Local storage read error:', e)
        setShops(INITIAL_SHOPS)
        setItems(INITIAL_ITEMS)
      } finally {
        setLoading(false)
      }

      const handleStorage = (e: StorageEvent) => {
        if (e.key === STORAGE_KEY_ITEMS && e.newValue) setItems(JSON.parse(e.newValue))
        if (e.key === STORAGE_KEY_SHOPS && e.newValue) setShops(JSON.parse(e.newValue))
        if (e.key === STORAGE_KEY_CUSTOM_CATS && e.newValue) setCustomCategories(JSON.parse(e.newValue))
      }
      window.addEventListener('storage', handleStorage)
      return () => window.removeEventListener('storage', handleStorage)
    }
  }, [household.id])

  const persistLocally = (newShops?: Shop[], newItems?: ShoppingItem[], newCats?: string[]) => {
    if (!isConfigured || !db) {
      if (newShops) localStorage.setItem(STORAGE_KEY_SHOPS, JSON.stringify(newShops))
      if (newItems) localStorage.setItem(STORAGE_KEY_ITEMS, JSON.stringify(newItems))
      if (newCats) localStorage.setItem(STORAGE_KEY_CUSTOM_CATS, JSON.stringify(newCats))
    }
  }

  // Combined categories
  const categories = useMemo(() => {
    const set = new Set<string>(DEFAULT_CATEGORIES)
    customCategories.forEach((c) => set.add(c))
    items.forEach((i) => {
      if (i.category) set.add(i.category)
    })
    return Array.from(set)
  }, [customCategories, items])

  const addCategory = async (newCat: string) => {
    const trimmed = newCat.trim()
    if (!trimmed || categories.includes(trimmed)) return

    const updated = [...customCategories, trimmed]
    setCustomCategories(updated)

    if (isConfigured && db) {
      await setDoc(
        doc(db, 'households', household.id),
        { customCategories: updated },
        { merge: true }
      )
    } else {
      persistLocally(undefined, undefined, updated)
    }
  }

  // SHOP ACTIONS
  const addShop = async (shopData: Omit<Shop, 'id'>) => {
    const id =
      shopData.name.toLowerCase().replace(/[^a-z0-9]+/g, '-') + '-' + Date.now().toString(36).slice(-4)
    const newShop: Shop = {
      ...shopData,
      id,
      orderIndex: shops.length,
    }

    if (isConfigured && db) {
      await setDoc(doc(db, 'households', household.id, 'shops', id), newShop)
    } else {
      const updated = [...shops, newShop]
      setShops(updated)
      persistLocally(updated, undefined)
    }
    return id
  }

  const updateShop = async (id: string, updates: Partial<Shop>) => {
    if (isConfigured && db) {
      await setDoc(doc(db, 'households', household.id, 'shops', id), updates, { merge: true })
    } else {
      const updated = shops.map((s) => (s.id === id ? { ...s, ...updates } : s))
      setShops(updated)
      persistLocally(updated, undefined)
    }
  }

  const deleteShop = async (id: string) => {
    if (isConfigured && db) {
      await deleteDoc(doc(db, 'households', household.id, 'shops', id))
    } else {
      const updated = shops.filter((s) => s.id !== id)
      setShops(updated)
      persistLocally(updated, undefined)
    }
  }

  const moveShopOrder = async (shopId: string, direction: 'left' | 'right', targetShopId?: string) => {
    const currentIndex = shops.findIndex((s) => s.id === shopId)
    if (currentIndex === -1) return

    let targetIndex: number
    if (targetShopId) {
      targetIndex = shops.findIndex((s) => s.id === targetShopId)
      if (targetIndex === -1) return
    } else {
      targetIndex = direction === 'left' ? currentIndex - 1 : currentIndex + 1
    }

    if (targetIndex < 0 || targetIndex >= shops.length) return

    const reordered = [...shops]
    const [moved] = reordered.splice(currentIndex, 1)
    reordered.splice(targetIndex, 0, moved)

    const updatedWithIndices = reordered.map((s, idx) => ({ ...s, orderIndex: idx }))
    setShops(updatedWithIndices)

    if (isConfigured && db) {
      const batch = writeBatch(db)
      updatedWithIndices.forEach((s) => {
        batch.update(doc(db!, 'households', household.id, 'shops', s.id), { orderIndex: s.orderIndex })
      })
      await batch.commit()
    } else {
      persistLocally(updatedWithIndices, undefined)
    }
  }

  // ITEM ACTIONS
  const addItem = async (itemData: Omit<ShoppingItem, 'id' | 'createdAt' | 'updatedAt'>) => {
    const id = 'item-' + Date.now().toString(36) + '-' + Math.random().toString(36).substring(2, 6)
    const newItem: ShoppingItem = {
      ...itemData,
      id,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    }

    if (isConfigured && db) {
      await setDoc(doc(db, 'households', household.id, 'items', id), newItem)
    } else {
      const updated = [newItem, ...items]
      setItems(updated)
      persistLocally(undefined, updated)
    }
    return id
  }

  const quickAddItem = async (
    name: string,
    category = 'Produce',
    quantity = 1,
    unit = 'pieces'
  ) => {
    const trimmed = name.trim()
    if (!trimmed) return ''

    // Initialize default shops
    const initialShops: Record<string, ItemShopDetail> = {}
    shops.forEach((s) => {
      initialShops[s.id] = {
        available: true,
        price: null,
        location: '',
      }
    })

    return await addItem({
      name: trimmed,
      category,
      quantity: Math.max(1, quantity),
      unit: unit || 'pieces',
      isNeeded: true,
      inCart: false,
      shops: initialShops,
    })
  }

  const updateItem = async (id: string, updates: Partial<ShoppingItem>) => {
    const patch = { ...updates, updatedAt: Date.now() }
    if (isConfigured && db) {
      await setDoc(doc(db, 'households', household.id, 'items', id), patch, { merge: true })
    } else {
      const updated = items.map((item) => (item.id === id ? { ...item, ...patch } : item))
      setItems(updated)
      persistLocally(undefined, updated)
    }
  }

  const deleteItem = async (id: string) => {
    if (isConfigured && db) {
      await deleteDoc(doc(db, 'households', household.id, 'items', id))
    } else {
      const updated = items.filter((item) => item.id !== id)
      setItems(updated)
      persistLocally(undefined, updated)
    }
  }

  const changeItemQuantity = async (id: string, delta: number) => {
    const item = items.find((i) => i.id === id)
    if (!item) return
    const newQty = Math.max(1, (item.quantity || 1) + delta)
    await updateItem(id, { quantity: newQty })
  }

  const toggleNeeded = async (id: string) => {
    const current = items.find((i) => i.id === id)
    if (!current) return
    const nextNeeded = !current.isNeeded
    await updateItem(id, {
      isNeeded: nextNeeded,
      inCart: nextNeeded ? current.inCart : false,
    })
  }

  const toggleInCart = async (id: string) => {
    const current = items.find((i) => i.id === id)
    if (!current) return
    // Haptic feedback for mobile phones!
    if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
      try {
        navigator.vibrate(35)
      } catch {
        // ignore
      }
    }
    await updateItem(id, { inCart: !current.inCart })
  }

  const updateItemShopDetail = async (
    itemId: string,
    shopId: string,
    detail: Partial<ItemShopDetail>
  ) => {
    const item = items.find((i) => i.id === itemId)
    if (!item) return

    const existingDetail = item.shops[shopId] || {
      available: true,
      price: null,
      location: '',
    }

    const merged = { ...existingDetail, ...detail }

    // Recompute unit price if packageSize and price are present
    if (typeof merged.price === 'number' && typeof merged.packageSize === 'number' && merged.packageSize > 0) {
      merged.unitPrice = Number((merged.price / merged.packageSize).toFixed(4))
    }

    const updatedShops = {
      ...item.shops,
      [shopId]: merged,
    }

    await updateItem(itemId, { shops: updatedShops })
  }

  const clearCart = async (markCompletedAsPurchased = true) => {
    if (isConfigured && db) {
      const batch = writeBatch(db)
      items.forEach((item) => {
        if (item.inCart) {
          const itemRef = doc(db!, 'households', household.id, 'items', item.id)
          batch.update(itemRef, {
            inCart: false,
            isNeeded: markCompletedAsPurchased ? false : item.isNeeded,
            updatedAt: Date.now(),
          })
        }
      })
      await batch.commit()
    } else {
      const updated = items.map((item) => {
        if (item.inCart) {
          return {
            ...item,
            inCart: false,
            isNeeded: markCompletedAsPurchased ? false : item.isNeeded,
            updatedAt: Date.now(),
          }
        }
        return item
      })
      setItems(updated)
      persistLocally(undefined, updated)
    }
  }

  // HOUSEHOLD ACTIONS
  const joinHouseholdByCode = async (code: string): Promise<boolean> => {
    const formatted = code.trim().toUpperCase()
    if (!formatted) return false
    const newHousehold: Household = {
      id: 'hh_' + formatted.toLowerCase(),
      name: `${formatted} Family Shopping`,
      inviteCode: formatted,
    }
    setHousehold(newHousehold)
    localStorage.setItem(STORAGE_KEY_HH, JSON.stringify(newHousehold))
    return true
  }

  const createHousehold = async (name: string): Promise<string> => {
    const cleanName = name.trim() || 'My Family List'
    const code = Math.random().toString(36).substring(2, 8).toUpperCase()
    const newHousehold: Household = {
      id: 'hh_' + code.toLowerCase(),
      name: cleanName,
      inviteCode: code,
      createdByUserEmail: user?.email || undefined,
    }
    setHousehold(newHousehold)
    localStorage.setItem(STORAGE_KEY_HH, JSON.stringify(newHousehold))

    if (isConfigured && db) {
      const batch = writeBatch(db)
      for (let i = 0; i < INITIAL_SHOPS.length; i++) {
        const s = { ...INITIAL_SHOPS[i], orderIndex: i }
        batch.set(doc(db, 'households', newHousehold.id, 'shops', s.id), s)
      }
      for (const it of INITIAL_ITEMS) {
        batch.set(doc(db, 'households', newHousehold.id, 'items', it.id), it)
      }
      await batch.commit()
    }
    return code
  }

  const saveCurrentAsDefault = async () => {
    const cleanItems = items.map((item) => ({
      ...item,
      inCart: false,
      updatedAt: Date.now(),
    }))
    const now = Date.now()

    if (isConfigured && db) {
      await setDoc(
        doc(db, 'households', household.id),
        {
          customDefaultItems: cleanItems,
          customDefaultShops: shops,
          customDefaultSavedAt: now,
        },
        { merge: true }
      )
    }

    localStorage.setItem(STORAGE_KEY_CUSTOM_DEFAULT_ITEMS, JSON.stringify(cleanItems))
    localStorage.setItem(STORAGE_KEY_CUSTOM_DEFAULT_SHOPS, JSON.stringify(shops))
    localStorage.setItem(STORAGE_KEY_CUSTOM_DEFAULT_TIME, String(now))

    setHasCustomDefault(true)
    setCustomDefaultSavedAt(now)
  }

  const restoreDefaultList = async () => {
    if (isConfigured && db) {
      if (household.customDefaultItems && household.customDefaultItems.length > 0) {
        const batch = writeBatch(db)
        const existingItemsSnap = await getDocs(collection(db, 'households', household.id, 'items'))
        existingItemsSnap.forEach((d) => batch.delete(d.ref))
        const targetShops =
          household.customDefaultShops && household.customDefaultShops.length > 0
            ? household.customDefaultShops
            : INITIAL_SHOPS
        for (let i = 0; i < targetShops.length; i++) {
          const s = { ...targetShops[i], orderIndex: i }
          batch.set(doc(db, 'households', household.id, 'shops', s.id), s)
        }
        for (const it of household.customDefaultItems) {
          batch.set(doc(db, 'households', household.id, 'items', it.id), it)
        }
        await batch.commit()
        return
      }
    }

    const savedCustomItems = localStorage.getItem(STORAGE_KEY_CUSTOM_DEFAULT_ITEMS)
    const savedCustomShops = localStorage.getItem(STORAGE_KEY_CUSTOM_DEFAULT_SHOPS)
    if (savedCustomItems) {
      try {
        const parsedItems: ShoppingItem[] = JSON.parse(savedCustomItems)
        const parsedShops: Shop[] = savedCustomShops ? JSON.parse(savedCustomShops) : shops
        setShops(parsedShops)
        setItems(parsedItems)
        persistLocally(parsedShops, parsedItems)
        return
      } catch (e) {
        console.error('Failed to parse saved default template', e)
      }
    }

    await resetToSampleData()
  }

  const clearCustomDefault = async () => {
    localStorage.removeItem(STORAGE_KEY_CUSTOM_DEFAULT_ITEMS)
    localStorage.removeItem(STORAGE_KEY_CUSTOM_DEFAULT_SHOPS)
    localStorage.removeItem(STORAGE_KEY_CUSTOM_DEFAULT_TIME)
    if (isConfigured && db) {
      await setDoc(
        doc(db, 'households', household.id),
        {
          customDefaultItems: null,
          customDefaultShops: null,
          customDefaultSavedAt: null,
        },
        { merge: true }
      )
    }
    setHasCustomDefault(false)
    setCustomDefaultSavedAt(null)
  }

  const selectWeeklyItems = async (resetOthers: boolean = false): Promise<number> => {
    let count = 0
    if (isConfigured && db) {
      const batch = writeBatch(db)
      items.forEach((item) => {
        const itemRef = doc(db!, 'households', household.id, 'items', item.id)
        if (item.isWeekly) {
          count++
          if (!item.isNeeded || item.inCart) {
            batch.update(itemRef, { isNeeded: true, inCart: false, updatedAt: Date.now() })
          }
        } else if (resetOthers && item.isNeeded) {
          batch.update(itemRef, { isNeeded: false, inCart: false, updatedAt: Date.now() })
        }
      })
      await batch.commit()
    } else {
      const updated = items.map((item) => {
        if (item.isWeekly) {
          count++
          return { ...item, isNeeded: true, inCart: false, updatedAt: Date.now() }
        }
        if (resetOthers && item.isNeeded) {
          return { ...item, isNeeded: false, inCart: false, updatedAt: Date.now() }
        }
        return item
      })
      setItems(updated)
      persistLocally(undefined, updated)
    }
    return count
  }

  const toggleWeeklyItem = async (itemId: string): Promise<void> => {
    const item = items.find((i) => i.id === itemId)
    if (!item) return
    const newWeekly = !item.isWeekly

    if (isConfigured && db) {
      const itemRef = doc(db, 'households', household.id, 'items', itemId)
      await updateDoc(itemRef, { isWeekly: newWeekly, updatedAt: Date.now() })
    } else {
      const updated = items.map((i) =>
        i.id === itemId ? { ...i, isWeekly: newWeekly, updatedAt: Date.now() } : i
      )
      setItems(updated)
      persistLocally(undefined, updated)
    }
  }

  const saveCurrentNeededAsWeekly = async (replaceExisting: boolean = false): Promise<number> => {
    let count = 0
    if (isConfigured && db) {
      const batch = writeBatch(db)
      items.forEach((item) => {
        const itemRef = doc(db!, 'households', household.id, 'items', item.id)
        if (item.isNeeded) {
          count++
          if (!item.isWeekly) {
            batch.update(itemRef, { isWeekly: true, updatedAt: Date.now() })
          }
        } else if (replaceExisting && item.isWeekly) {
          batch.update(itemRef, { isWeekly: false, updatedAt: Date.now() })
        } else if (item.isWeekly) {
          count++
        }
      })
      await batch.commit()
    } else {
      const updated = items.map((item) => {
        if (item.isNeeded) {
          count++
          return { ...item, isWeekly: true, updatedAt: Date.now() }
        }
        if (replaceExisting && item.isWeekly) {
          return { ...item, isWeekly: false, updatedAt: Date.now() }
        }
        if (item.isWeekly) {
          count++
        }
        return item
      })
      setItems(updated)
      persistLocally(undefined, updated)
    }
    return count
  }

  const bulkSetWeekly = async (itemIds: string[], isWeekly: boolean): Promise<void> => {
    const idSet = new Set(itemIds)
    if (idSet.size === 0) return

    if (isConfigured && db) {
      const batch = writeBatch(db)
      items.forEach((item) => {
        if (idSet.has(item.id) && item.isWeekly !== isWeekly) {
          const itemRef = doc(db!, 'households', household.id, 'items', item.id)
          batch.update(itemRef, { isWeekly, updatedAt: Date.now() })
        }
      })
      await batch.commit()
    } else {
      const updated = items.map((item) =>
        idSet.has(item.id) ? { ...item, isWeekly, updatedAt: Date.now() } : item
      )
      setItems(updated)
      persistLocally(undefined, updated)
    }
  }

  const clearAllWeekly = async (): Promise<void> => {
    if (isConfigured && db) {
      const batch = writeBatch(db)
      items.forEach((item) => {
        if (item.isWeekly) {
          const itemRef = doc(db!, 'households', household.id, 'items', item.id)
          batch.update(itemRef, { isWeekly: false, updatedAt: Date.now() })
        }
      })
      await batch.commit()
    } else {
      const updated = items.map((item) =>
        item.isWeekly ? { ...item, isWeekly: false, updatedAt: Date.now() } : item
      )
      setItems(updated)
      persistLocally(undefined, updated)
    }
  }

  const resetToSampleData = async () => {
    if (isConfigured && db) {
      const batch = writeBatch(db)
      const existingItemsSnap = await getDocs(collection(db, 'households', household.id, 'items'))
      existingItemsSnap.forEach((d) => batch.delete(d.ref))
      const existingShopsSnap = await getDocs(collection(db, 'households', household.id, 'shops'))
      existingShopsSnap.forEach((d) => batch.delete(d.ref))
      for (let i = 0; i < INITIAL_SHOPS.length; i++) {
        const s = { ...INITIAL_SHOPS[i], orderIndex: i }
        batch.set(doc(db, 'households', household.id, 'shops', s.id), s)
      }
      for (const it of INITIAL_ITEMS) {
        batch.set(doc(db, 'households', household.id, 'items', it.id), it)
      }
      await batch.commit()
    } else {
      setShops(INITIAL_SHOPS)
      setItems(INITIAL_ITEMS)
      persistLocally(INITIAL_SHOPS, INITIAL_ITEMS)
    }
  }

  const recordTripReceipt = async (
    receiptData: Omit<TripReceipt, 'id' | 'timestamp'> & { timestamp?: number }
  ): Promise<string> => {
    const id = `rec_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`
    const newReceipt: TripReceipt = {
      ...receiptData,
      id,
      timestamp: receiptData.timestamp || Date.now(),
    }

    if (isConfigured && db) {
      try {
        await setDoc(doc(db!, 'households', household.id, 'receipts', id), newReceipt)
      } catch (e) {
        console.error('Failed to save receipt to cloud', e)
      }
    }

    const updated = [newReceipt, ...receipts]
    setReceipts(updated)
    localStorage.setItem(STORAGE_KEY_RECEIPTS, JSON.stringify(updated))
    return id
  }

  const deleteReceipt = async (id: string) => {
    if (isConfigured && db) {
      try {
        await deleteDoc(doc(db!, 'households', household.id, 'receipts', id))
      } catch (e) {
        console.error('Failed to delete receipt from cloud', e)
      }
    }
    const updated = receipts.filter((r) => r.id !== id)
    setReceipts(updated)
    localStorage.setItem(STORAGE_KEY_RECEIPTS, JSON.stringify(updated))
  }

  const clearAllReceipts = async () => {
    if (isConfigured && db) {
      try {
        const snap = await getDocs(collection(db!, 'households', household.id, 'receipts'))
        const batch = writeBatch(db!)
        snap.forEach((d) => batch.delete(d.ref))
        await batch.commit()
      } catch (e) {
        console.error('Failed to clear cloud receipts', e)
      }
    }
    setReceipts([])
    localStorage.setItem(STORAGE_KEY_RECEIPTS, JSON.stringify([]))
  }

  const value = useMemo(
    () => ({
      mode,
      setMode,
      selectedShopId,
      setSelectedShopId,
      saveMode,
      setSaveMode,
      shops,
      items,
      categories,
      household,
      loading,
      addShop,
      updateShop,
      deleteShop,
      moveShopOrder,
      addItem,
      quickAddItem,
      updateItem,
      deleteItem,
      changeItemQuantity,
      toggleNeeded,
      toggleInCart,
      selectWeeklyItems,
      toggleWeeklyItem,
      saveCurrentNeededAsWeekly,
      bulkSetWeekly,
      clearAllWeekly,
      updateItemShopDetail,
      clearCart,
      receipts,
      recordTripReceipt,
      deleteReceipt,
      clearAllReceipts,
      addCategory,
      joinHouseholdByCode,
      createHousehold,
      hasCustomDefault,
      customDefaultSavedAt,
      saveCurrentAsDefault,
      restoreDefaultList,
      clearCustomDefault,
      resetToSampleData,
    }),
    [
      mode,
      selectedShopId,
      saveMode,
      shops,
      items,
      categories,
      household,
      loading,
      user,
      receipts,
      hasCustomDefault,
      customDefaultSavedAt,
    ]
  )

  return <ShoppingContext.Provider value={value}>{children}</ShoppingContext.Provider>
}

export function useShopping(): ShoppingContextType {
  const context = useContext(ShoppingContext)
  if (!context) {
    throw new Error('useShopping must be used within a ShoppingProvider')
  }
  return context
}
