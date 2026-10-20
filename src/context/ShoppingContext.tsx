import React, { createContext, useContext, useEffect, useMemo, useState } from 'react'
import type { AppMode, ItemShopDetail, Shop, ShoppingItem, Household } from '../types'
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
  updateItemShopDetail: (
    itemId: string,
    shopId: string,
    detail: Partial<ItemShopDetail>
  ) => Promise<void>
  clearCart: (markCompletedAsPurchased?: boolean) => Promise<void>
  // Category operations
  addCategory: (newCategory: string) => Promise<void>
  // Household operations
  joinHouseholdByCode: (code: string) => Promise<boolean>
  createHousehold: (name: string) => Promise<string>
  resetToSampleData: () => Promise<void>
}

const ShoppingContext = createContext<ShoppingContextType | undefined>(undefined)

const STORAGE_KEY_ITEMS = 'hash_groc_items_v2'
const STORAGE_KEY_SHOPS = 'hash_groc_shops_v2'
const STORAGE_KEY_HH = 'hash_groc_current_hh_v2'
const STORAGE_KEY_SAVEMODE = 'hash_groc_savemode_v2'
const STORAGE_KEY_CUSTOM_CATS = 'hash_groc_cats_v2'

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

        // Listen for household metadata (e.g. custom categories)
        unsubscribeHH = onSnapshot(hhDocRef, (snap) => {
          if (snap.exists()) {
            const data = snap.data() as Household
            if (data.customCategories) {
              setCustomCategories(data.customCategories)
            }
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
      }

      initFirestore()

      return () => {
        unsubscribeShops()
        unsubscribeItems()
        unsubscribeHH()
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

  const resetToSampleData = async () => {
    if (isConfigured && db) {
      const batch = writeBatch(db)
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
      updateItemShopDetail,
      clearCart,
      addCategory,
      joinHouseholdByCode,
      createHousehold,
      resetToSampleData,
    }),
    [mode, selectedShopId, saveMode, shops, items, categories, household, loading, user]
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
