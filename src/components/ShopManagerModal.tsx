import React, { useState } from 'react'
import {
  X,
  Plus,
  Trash2,
  Store,
  Edit2,
  GripVertical,
  Check,
} from 'lucide-react'
import type { Shop } from '../types'
import { useShopping } from '../context/ShoppingContext'

interface ShopManagerModalProps {
  onClose: () => void
}

const COMMON_DEPARTMENT_SUGGESTIONS = [
  'Produce',
  'Bakery',
  'Deli',
  'Meat & Poultry',
  'Seafood',
  'Dairy & Eggs',
  'Frozen',
  'Pantry Staples',
  'Snacks',
  'Beverages',
  'Household',
  'Checkout',
]

function reorderArray<T>(list: T[], startIndex: number, endIndex: number): T[] {
  const result = Array.from(list)
  const [removed] = result.splice(startIndex, 1)
  result.splice(endIndex, 0, removed)
  return result
}

export const ShopManagerModal: React.FC<ShopManagerModalProps> = ({ onClose }) => {
  const { shops, items, addShop, updateShop, deleteShop, moveShopOrder } = useShopping()

  // Creation State
  const [isCreatingNew, setIsCreatingNew] = useState(false)
  const [newName, setNewName] = useState('')
  const [newAisles, setNewAisles] = useState<string[]>([
    'Produce',
    'Dairy',
    'Pantry',
    'Frozen',
    'Checkout',
  ])
  const [isAddingNewAisle, setIsAddingNewAisle] = useState(false)
  const [newAisleInput, setNewAisleInput] = useState('')

  // Edit State
  const [editingShopId, setEditingShopId] = useState<string | null>(null)
  const [editName, setEditName] = useState('')
  const [editAisles, setEditAisles] = useState<string[]>([])
  const [isAddingEditAisle, setIsAddingEditAisle] = useState(false)
  const [editAisleInput, setEditAisleInput] = useState('')

  // Drag and drop state for Stores
  const [draggedStoreIdx, setDraggedStoreIdx] = useState<number | null>(null)
  const [dragOverStoreIdx, setDragOverStoreIdx] = useState<number | null>(null)

  // Drag and drop state for Aisles
  const [draggedAisleIdx, setDraggedAisleIdx] = useState<number | null>(null)
  const [dragOverAisleIdx, setDragOverAisleIdx] = useState<number | null>(null)

  // Live item counts
  const getPricedCount = (shopId: string) => {
    return items.filter((i) => {
      const p = i.shops[shopId]?.price
      return typeof p === 'number' && p > 0
    }).length
  }

  // Store reordering
  const handleReorderStores = async (fromIdx: number, toIdx: number) => {
    if (fromIdx === toIdx || fromIdx < 0 || toIdx < 0 || fromIdx >= shops.length || toIdx >= shops.length) return
    const sourceShop = shops[fromIdx]
    const targetShop = shops[toIdx]
    if (!sourceShop || !targetShop) return

    await moveShopOrder(sourceShop.id, fromIdx < toIdx ? 'right' : 'left', targetShop.id)
  }

  // Touch handlers for store drag
  const handleTouchStartStore = (index: number) => {
    setDraggedStoreIdx(index)
  }

  const handleTouchMoveStore = (e: React.TouchEvent) => {
    if (draggedStoreIdx === null) return
    const touch = e.touches[0]
    if (!touch) return
    const targetEl = document.elementFromPoint(touch.clientX, touch.clientY)
    const storeEl = targetEl?.closest('[data-store-index]')
    if (storeEl) {
      const targetIdx = Number(storeEl.getAttribute('data-store-index'))
      if (!isNaN(targetIdx) && targetIdx !== dragOverStoreIdx) {
        setDragOverStoreIdx(targetIdx)
      }
    }
  }

  const handleTouchEndStore = () => {
    if (draggedStoreIdx !== null && dragOverStoreIdx !== null && draggedStoreIdx !== dragOverStoreIdx) {
      handleReorderStores(draggedStoreIdx, dragOverStoreIdx)
    }
    setDraggedStoreIdx(null)
    setDragOverStoreIdx(null)
  }

  // Aisle reordering for edited store
  const handleReorderEditAisles = (fromIdx: number, toIdx: number) => {
    if (fromIdx === toIdx || fromIdx < 0 || toIdx < 0 || fromIdx >= editAisles.length || toIdx >= editAisles.length) return
    setEditAisles((prev) => reorderArray(prev, fromIdx, toIdx))
  }

  // Touch handlers for edit aisles drag
  const handleTouchStartEditAisle = (index: number) => {
    setDraggedAisleIdx(index)
  }

  const handleTouchMoveEditAisle = (e: React.TouchEvent) => {
    if (draggedAisleIdx === null) return
    const touch = e.touches[0]
    if (!touch) return
    const targetEl = document.elementFromPoint(touch.clientX, touch.clientY)
    const aisleEl = targetEl?.closest('[data-aisle-index]')
    if (aisleEl) {
      const targetIdx = Number(aisleEl.getAttribute('data-aisle-index'))
      if (!isNaN(targetIdx) && targetIdx !== dragOverAisleIdx) {
        setDragOverAisleIdx(targetIdx)
      }
    }
  }

  const handleTouchEndEditAisle = () => {
    if (draggedAisleIdx !== null && dragOverAisleIdx !== null && draggedAisleIdx !== dragOverAisleIdx) {
      handleReorderEditAisles(draggedAisleIdx, dragOverAisleIdx)
    }
    setDraggedAisleIdx(null)
    setDragOverAisleIdx(null)
  }

  // Aisle reordering for new store
  const handleReorderNewAisles = (fromIdx: number, toIdx: number) => {
    if (fromIdx === toIdx || fromIdx < 0 || toIdx < 0 || fromIdx >= newAisles.length || toIdx >= newAisles.length) return
    setNewAisles((prev) => reorderArray(prev, fromIdx, toIdx))
  }

  // Touch handlers for new aisles drag
  const handleTouchStartNewAisle = (index: number) => {
    setDraggedAisleIdx(index)
  }

  const handleTouchMoveNewAisle = (e: React.TouchEvent) => {
    if (draggedAisleIdx === null) return
    const touch = e.touches[0]
    if (!touch) return
    const targetEl = document.elementFromPoint(touch.clientX, touch.clientY)
    const aisleEl = targetEl?.closest('[data-aisle-index]')
    if (aisleEl) {
      const targetIdx = Number(aisleEl.getAttribute('data-aisle-index'))
      if (!isNaN(targetIdx) && targetIdx !== dragOverAisleIdx) {
        setDragOverAisleIdx(targetIdx)
      }
    }
  }

  const handleTouchEndNewAisle = () => {
    if (draggedAisleIdx !== null && dragOverAisleIdx !== null && draggedAisleIdx !== dragOverAisleIdx) {
      handleReorderNewAisles(draggedAisleIdx, dragOverAisleIdx)
    }
    setDraggedAisleIdx(null)
    setDragOverAisleIdx(null)
  }

  // Open store editor
  const handleStartEditing = (shop: Shop) => {
    if (editingShopId === shop.id) {
      setEditingShopId(null)
      return
    }
    setEditingShopId(shop.id)
    setEditName(shop.name)
    setEditAisles(shop.defaultAisles && shop.defaultAisles.length > 0
      ? [...shop.defaultAisles]
      : ['Produce', 'Dairy', 'Pantry', 'Frozen', 'Checkout']
    )
    setIsAddingEditAisle(false)
    setEditAisleInput('')
  }

  // Save edits
  const handleSaveEdit = async () => {
    if (!editingShopId || !editName.trim()) return

    const cleanedAisles = editAisles
      .map((a) => a.trim())
      .filter(Boolean)

    await updateShop(editingShopId, {
      name: editName.trim(),
      defaultAisles: cleanedAisles.length > 0 ? cleanedAisles : ['Produce', 'Checkout'],
    })

    setEditingShopId(null)
  }

  // Create store
  const handleCreateShop = async () => {
    if (!newName.trim()) return

    const cleanedAisles = newAisles
      .map((a) => a.trim())
      .filter(Boolean)

    await addShop({
      name: newName.trim(),
      color: 'emerald',
      defaultAisles: cleanedAisles.length > 0 ? cleanedAisles : ['Produce', 'Dairy', 'Pantry', 'Frozen', 'Checkout'],
    })

    setNewName('')
    setNewAisles(['Produce', 'Dairy', 'Pantry', 'Frozen', 'Checkout'])
    setIsCreatingNew(false)
  }

  // Delete store
  const handleDelete = async (shop: Shop) => {
    if (shops.length <= 1) {
      alert('You must have at least one store in your app.')
      return
    }

    const pricedCount = getPricedCount(shop.id)
    const confirmMsg =
      pricedCount > 0
        ? `Delete store "${shop.name}"? It has ${pricedCount} item price${pricedCount === 1 ? '' : 's'} recorded.`
        : `Delete store "${shop.name}"?`

    if (window.confirm(confirmMsg)) {
      await deleteShop(shop.id)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 z-50 animate-in fade-in duration-150">
      <div className="bg-white rounded-3xl max-w-xl w-full max-h-[90vh] flex flex-col shadow-2xl overflow-hidden border border-slate-200">
        {/* Header */}
        <div className="px-5 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-slate-100 text-slate-700 flex items-center justify-center">
              <Store className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-slate-900">Manage Stores</h2>
              <p className="text-xs text-slate-500">Drag to arrange store and aisle order</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 rounded-xl hover:bg-slate-200/60 transition cursor-pointer"
            title="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-3">
          {/* Store List */}
          <div className="space-y-2">
            {shops.map((shop, index) => {
              const isBeingEdited = editingShopId === shop.id
              const pricedCount = getPricedCount(shop.id)

              return (
                <div
                  key={shop.id}
                  data-store-index={index}
                  draggable={!isBeingEdited}
                  onDragStart={(e) => {
                    setDraggedStoreIdx(index)
                    e.dataTransfer.effectAllowed = 'move'
                  }}
                  onDragOver={(e) => {
                    e.preventDefault()
                    e.dataTransfer.dropEffect = 'move'
                    if (dragOverStoreIdx !== index) {
                      setDragOverStoreIdx(index)
                    }
                  }}
                  onDrop={(e) => {
                    e.preventDefault()
                    if (draggedStoreIdx !== null && draggedStoreIdx !== index) {
                      handleReorderStores(draggedStoreIdx, index)
                    }
                    setDraggedStoreIdx(null)
                    setDragOverStoreIdx(null)
                  }}
                  onDragEnd={() => {
                    setDraggedStoreIdx(null)
                    setDragOverStoreIdx(null)
                  }}
                  className={`rounded-2xl border transition-all ${
                    isBeingEdited
                      ? 'border-slate-400 bg-slate-50/60 p-3.5 space-y-3 shadow-2xs'
                      : draggedStoreIdx === index
                      ? 'opacity-40 border-slate-300 bg-slate-50 p-3.5'
                      : dragOverStoreIdx === index
                      ? 'border-t-2 border-t-slate-800 border-slate-200 bg-slate-50/50 p-3.5'
                      : 'border-slate-200 bg-white p-3.5 shadow-2xs hover:border-slate-300'
                  }`}
                >
                  {/* Store Row Card */}
                  <div className="flex items-center justify-between gap-3">
                    {/* Left: Drag Handle + Store Info (editable inline when editing) */}
                    <div className="flex items-center gap-2.5 min-w-0 flex-1">
                      <div
                        className="touch-none cursor-grab active:cursor-grabbing p-1.5 text-slate-400 hover:text-slate-700 shrink-0"
                        onTouchStart={() => handleTouchStartStore(index)}
                        onTouchMove={handleTouchMoveStore}
                        onTouchEnd={handleTouchEndStore}
                        title="Click and drag to reorder"
                      >
                        <GripVertical className="w-4 h-4" />
                      </div>

                      <div className="min-w-0 flex-1">
                        {isBeingEdited ? (
                          <input
                            type="text"
                            autoFocus
                            value={editName}
                            onChange={(e) => setEditName(e.target.value)}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') {
                                e.preventDefault()
                                handleSaveEdit()
                              } else if (e.key === 'Escape') {
                                setEditingShopId(null)
                              }
                            }}
                            placeholder="Store name..."
                            className="w-full px-2.5 py-1 text-sm font-bold text-slate-900 bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-slate-900"
                          />
                        ) : (
                          <>
                            <div className="font-bold text-slate-900 text-sm truncate">
                              {shop.name}
                            </div>
                            <div className="text-[11px] text-slate-400 mt-0.5">
                              {shop.defaultAisles.length} aisles • {pricedCount} priced
                            </div>
                          </>
                        )}
                      </div>
                    </div>

                    {/* Right: Edit & Delete buttons */}
                    <div className="flex items-center gap-1 shrink-0">
                      <button
                        type="button"
                        onClick={() => {
                          if (isBeingEdited) {
                            handleSaveEdit()
                          } else {
                            handleStartEditing(shop)
                          }
                        }}
                        className={`p-2 rounded-xl transition cursor-pointer ${
                          isBeingEdited
                            ? 'bg-slate-900 text-white hover:bg-slate-800'
                            : 'text-slate-500 hover:text-slate-800 hover:bg-slate-100'
                        }`}
                        title={isBeingEdited ? 'Save changes' : 'Edit Store'}
                      >
                        {isBeingEdited ? <Check className="w-4 h-4" /> : <Edit2 className="w-4 h-4" />}
                      </button>

                      <button
                        type="button"
                        onClick={() => handleDelete(shop)}
                        className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition cursor-pointer"
                        title="Delete Store"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* Inline Store Editor (Aisles only, store name is edited inline above) */}
                  {isBeingEdited && (
                    <div className="pt-3 border-t border-slate-200 space-y-3">
                      {/* Aisles Section with Drag and Drop */}
                      <div className="space-y-1.5">
                        <div className="flex items-center justify-between">
                          <label className="text-xs font-bold text-slate-700">
                            Aisles ({editAisles.length})
                          </label>
                          <span className="text-[10px] text-slate-400">
                            Tap name to edit • Drag to reorder
                          </span>
                        </div>

                        {/* Draggable & Editable Aisles List */}
                        <div className="space-y-1">
                          {editAisles.map((aisle, idx) => (
                            <div
                              key={`edit-aisle-${idx}`}
                              data-aisle-index={idx}
                              draggable
                              onDragStart={(e) => {
                                setDraggedAisleIdx(idx)
                                e.dataTransfer.effectAllowed = 'move'
                              }}
                              onDragOver={(e) => {
                                e.preventDefault()
                                e.dataTransfer.dropEffect = 'move'
                                if (dragOverAisleIdx !== idx) setDragOverAisleIdx(idx)
                              }}
                              onDrop={(e) => {
                                e.preventDefault()
                                if (draggedAisleIdx !== null && draggedAisleIdx !== idx) {
                                  handleReorderEditAisles(draggedAisleIdx, idx)
                                }
                                setDraggedAisleIdx(null)
                                setDragOverAisleIdx(null)
                              }}
                              onDragEnd={() => {
                                setDraggedAisleIdx(null)
                                setDragOverAisleIdx(null)
                              }}
                              className={`flex items-center justify-between p-1.5 rounded-xl bg-white border transition ${
                                draggedAisleIdx === idx
                                  ? 'opacity-40 border-slate-300'
                                  : dragOverAisleIdx === idx
                                  ? 'border-t-2 border-t-slate-800 border-slate-200 bg-slate-50'
                                  : 'border-slate-200'
                              }`}
                            >
                              <div className="flex items-center gap-1.5 min-w-0 flex-1">
                                <div
                                  className="touch-none cursor-grab active:cursor-grabbing p-1 text-slate-400 hover:text-slate-700 shrink-0"
                                  onTouchStart={() => handleTouchStartEditAisle(idx)}
                                  onTouchMove={handleTouchMoveEditAisle}
                                  onTouchEnd={handleTouchEndEditAisle}
                                  title="Drag to reorder"
                                >
                                  <GripVertical className="w-3.5 h-3.5" />
                                </div>
                                <input
                                  type="text"
                                  value={aisle}
                                  onChange={(e) => {
                                    const val = e.target.value
                                    setEditAisles((prev) => {
                                      const updated = [...prev]
                                      updated[idx] = val
                                      return updated
                                    })
                                  }}
                                  placeholder="Aisle name..."
                                  className="w-full px-2 py-0.5 text-xs font-medium text-slate-800 bg-transparent hover:bg-slate-50 focus:bg-white rounded-lg border border-transparent hover:border-slate-200 focus:border-slate-300 focus:outline-none transition"
                                />
                              </div>

                              <button
                                type="button"
                                onClick={() =>
                                  setEditAisles((prev) => prev.filter((_, i) => i !== idx))
                                }
                                className="p-1 text-slate-400 hover:text-rose-600 rounded-lg transition cursor-pointer shrink-0 ml-1"
                                title="Remove aisle"
                              >
                                <X className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          ))}
                        </div>

                        {/* Add Aisle at the bottom (similar to add alternative price) */}
                        {isAddingEditAisle ? (
                          <div className="p-2.5 rounded-xl border border-slate-300 bg-white space-y-2 mt-1.5 animate-in fade-in duration-100">
                            <div className="flex items-center gap-2">
                              <input
                                type="text"
                                autoFocus
                                placeholder="Aisle name..."
                                value={editAisleInput}
                                onChange={(e) => setEditAisleInput(e.target.value)}
                                onKeyDown={(e) => {
                                  if (e.key === 'Enter') {
                                    e.preventDefault()
                                    if (editAisleInput.trim()) {
                                      setEditAisles((prev) => [...prev, editAisleInput.trim()])
                                      setEditAisleInput('')
                                    }
                                  } else if (e.key === 'Escape') {
                                    setIsAddingEditAisle(false)
                                  }
                                }}
                                className="flex-1 px-3 py-1.5 rounded-lg border border-slate-300 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-slate-900 bg-white"
                              />
                              <button
                                type="button"
                                onClick={() => {
                                  if (editAisleInput.trim()) {
                                    setEditAisles((prev) => [...prev, editAisleInput.trim()])
                                    setEditAisleInput('')
                                  }
                                }}
                                disabled={!editAisleInput.trim()}
                                className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 disabled:opacity-40 text-white rounded-lg text-xs font-bold transition shrink-0 cursor-pointer"
                              >
                                Add
                              </button>
                              <button
                                type="button"
                                onClick={() => setIsAddingEditAisle(false)}
                                className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg transition cursor-pointer"
                                title="Cancel"
                              >
                                <X className="w-4 h-4" />
                              </button>
                            </div>

                            {/* Suggestions when wanting to add a new aisle */}
                            <div>
                              <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                                Suggestions:
                              </div>
                              <div className="flex flex-wrap gap-1">
                                {COMMON_DEPARTMENT_SUGGESTIONS.map((dept) => {
                                  const isAlreadyAdded = editAisles.some(
                                    (a) => a.toLowerCase() === dept.toLowerCase()
                                  )
                                  return (
                                    <button
                                      key={dept}
                                      type="button"
                                      disabled={isAlreadyAdded}
                                      onClick={() => {
                                        setEditAisles((prev) => [...prev, dept])
                                      }}
                                      className={`text-[10px] px-2 py-0.5 rounded-md border transition cursor-pointer font-medium ${
                                        isAlreadyAdded
                                          ? 'bg-slate-100 text-slate-300 border-slate-200 cursor-not-allowed'
                                          : 'bg-white hover:bg-slate-100 text-slate-700 border-slate-200'
                                      }`}
                                    >
                                      +{dept}
                                    </button>
                                  )
                                })}
                              </div>
                            </div>
                          </div>
                        ) : (
                          <button
                            type="button"
                            onClick={() => {
                              setIsAddingEditAisle(true)
                              setEditAisleInput('')
                            }}
                            className="w-full py-2 px-3 rounded-xl border border-dashed border-slate-300 hover:border-slate-400 hover:bg-slate-100 text-slate-700 text-xs font-semibold flex items-center justify-center gap-1.5 transition cursor-pointer mt-1"
                          >
                            <Plus className="w-4 h-4 text-slate-500" />
                            <span>Add Aisle</span>
                          </button>
                        )}
                      </div>

                      {/* Save & Cancel */}
                      <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-200">
                        <button
                          type="button"
                          onClick={() => setEditingShopId(null)}
                          className="px-3.5 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-200/50 rounded-xl cursor-pointer"
                        >
                          Cancel
                        </button>
                        <button
                          type="button"
                          onClick={handleSaveEdit}
                          disabled={!editName.trim()}
                          className="px-4 py-1.5 bg-slate-900 hover:bg-slate-800 disabled:opacity-40 text-white rounded-xl text-xs font-bold transition shadow-xs cursor-pointer"
                        >
                          Save Changes
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )
            })}
          </div>

          {/* Add New Store Drawer / Form */}
          {isCreatingNew ? (
            <div className="p-4 rounded-2xl border border-slate-300 bg-slate-50/60 space-y-3 animate-in fade-in duration-150">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                  New Store
                </span>
                <button
                  type="button"
                  onClick={() => setIsCreatingNew(false)}
                  className="text-xs text-slate-400 hover:text-slate-600 cursor-pointer"
                >
                  Cancel
                </button>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Store Name
                </label>
                <input
                  type="text"
                  placeholder="e.g. Costco, Trader Joe's, Kroger..."
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  className="w-full px-3 py-1.5 rounded-xl border border-slate-300 text-xs sm:text-sm bg-white font-medium focus:outline-none focus:ring-2 focus:ring-slate-900"
                  autoFocus
                />
              </div>

              {/* Aisles Section with Drag and Drop */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-slate-700">
                    Aisles ({newAisles.length})
                  </label>
                  <span className="text-[10px] text-slate-400">
                    Tap name to edit • Drag to reorder
                  </span>
                </div>

                {/* Draggable & Editable Aisles List */}
                <div className="space-y-1">
                  {newAisles.map((aisle, idx) => (
                    <div
                      key={`new-aisle-${idx}`}
                      data-aisle-index={idx}
                      draggable
                      onDragStart={(e) => {
                        setDraggedAisleIdx(idx)
                        e.dataTransfer.effectAllowed = 'move'
                      }}
                      onDragOver={(e) => {
                        e.preventDefault()
                        e.dataTransfer.dropEffect = 'move'
                        if (dragOverAisleIdx !== idx) setDragOverAisleIdx(idx)
                      }}
                      onDrop={(e) => {
                        e.preventDefault()
                        if (draggedAisleIdx !== null && draggedAisleIdx !== idx) {
                          handleReorderNewAisles(draggedAisleIdx, idx)
                        }
                        setDraggedAisleIdx(null)
                        setDragOverAisleIdx(null)
                      }}
                      onDragEnd={() => {
                        setDraggedAisleIdx(null)
                        setDragOverAisleIdx(null)
                      }}
                      className={`flex items-center justify-between p-1.5 rounded-xl bg-white border transition ${
                        draggedAisleIdx === idx
                          ? 'opacity-40 border-slate-300'
                          : dragOverAisleIdx === idx
                          ? 'border-t-2 border-t-slate-800 border-slate-200 bg-slate-50'
                          : 'border-slate-200'
                      }`}
                    >
                      <div className="flex items-center gap-1.5 min-w-0 flex-1">
                        <div
                          className="touch-none cursor-grab active:cursor-grabbing p-1 text-slate-400 hover:text-slate-700 shrink-0"
                          onTouchStart={() => handleTouchStartNewAisle(idx)}
                          onTouchMove={handleTouchMoveNewAisle}
                          onTouchEnd={handleTouchEndNewAisle}
                          title="Drag to reorder"
                        >
                          <GripVertical className="w-3.5 h-3.5" />
                        </div>
                        <input
                          type="text"
                          value={aisle}
                          onChange={(e) => {
                            const val = e.target.value
                            setNewAisles((prev) => {
                              const updated = [...prev]
                              updated[idx] = val
                              return updated
                            })
                          }}
                          placeholder="Aisle name..."
                          className="w-full px-2 py-0.5 text-xs font-medium text-slate-800 bg-transparent hover:bg-slate-50 focus:bg-white rounded-lg border border-transparent hover:border-slate-200 focus:border-slate-300 focus:outline-none transition"
                        />
                      </div>

                      <button
                        type="button"
                        onClick={() =>
                          setNewAisles((prev) => prev.filter((_, i) => i !== idx))
                        }
                        className="p-1 text-slate-400 hover:text-rose-600 rounded-lg transition cursor-pointer shrink-0 ml-1"
                        title="Remove aisle"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>

                {/* Add Aisle at the bottom */}
                {isAddingNewAisle ? (
                  <div className="p-2.5 rounded-xl border border-slate-300 bg-white space-y-2 mt-1.5 animate-in fade-in duration-100">
                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        autoFocus
                        placeholder="Aisle name..."
                        value={newAisleInput}
                        onChange={(e) => setNewAisleInput(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault()
                            if (newAisleInput.trim()) {
                              setNewAisles((prev) => [...prev, newAisleInput.trim()])
                              setNewAisleInput('')
                            }
                          } else if (e.key === 'Escape') {
                            setIsAddingNewAisle(false)
                          }
                        }}
                        className="flex-1 px-3 py-1.5 rounded-lg border border-slate-300 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-slate-900 bg-white"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          if (newAisleInput.trim()) {
                            setNewAisles((prev) => [...prev, newAisleInput.trim()])
                            setNewAisleInput('')
                          }
                        }}
                        disabled={!newAisleInput.trim()}
                        className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 disabled:opacity-40 text-white rounded-lg text-xs font-bold transition shrink-0 cursor-pointer"
                      >
                        Add
                      </button>
                      <button
                        type="button"
                        onClick={() => setIsAddingNewAisle(false)}
                        className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg transition cursor-pointer"
                        title="Cancel"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>

                    {/* Suggestions when wanting to add a new aisle */}
                    <div>
                      <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                        Suggestions:
                      </div>
                      <div className="flex flex-wrap gap-1">
                        {COMMON_DEPARTMENT_SUGGESTIONS.map((dept) => {
                          const isAlreadyAdded = newAisles.some(
                            (a) => a.toLowerCase() === dept.toLowerCase()
                          )
                          return (
                            <button
                              key={dept}
                              type="button"
                              disabled={isAlreadyAdded}
                              onClick={() => {
                                setNewAisles((prev) => [...prev, dept])
                              }}
                              className={`text-[10px] px-2 py-0.5 rounded-md border transition cursor-pointer font-medium ${
                                isAlreadyAdded
                                  ? 'bg-slate-100 text-slate-300 border-slate-200 cursor-not-allowed'
                                  : 'bg-white hover:bg-slate-100 text-slate-700 border-slate-200'
                              }`}
                            >
                              +{dept}
                            </button>
                          )
                        })}
                      </div>
                    </div>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => {
                      setIsAddingNewAisle(true)
                      setNewAisleInput('')
                    }}
                    className="w-full py-2 px-3 rounded-xl border border-dashed border-slate-300 hover:border-slate-400 hover:bg-slate-100 text-slate-700 text-xs font-semibold flex items-center justify-center gap-1.5 transition cursor-pointer mt-1"
                  >
                    <Plus className="w-4 h-4 text-slate-500" />
                    <span>Add Aisle</span>
                  </button>
                )}
              </div>

              {/* Save & Cancel */}
              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setIsCreatingNew(false)}
                  className="px-3.5 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-200/50 rounded-xl cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleCreateShop}
                  disabled={!newName.trim()}
                  className="px-4 py-1.5 bg-slate-900 hover:bg-slate-800 disabled:opacity-40 text-white rounded-xl text-xs font-bold transition shadow-xs cursor-pointer"
                >
                  Save Store
                </button>
              </div>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => {
                setIsCreatingNew(true)
                setNewName('')
                setNewAisles(['Produce', 'Dairy', 'Pantry', 'Frozen', 'Checkout'])
                if (editingShopId) setEditingShopId(null)
              }}
              className="w-full py-2.5 px-3 rounded-2xl border border-dashed border-slate-300 hover:border-slate-400 hover:bg-slate-50 text-slate-700 text-xs font-bold flex items-center justify-center gap-1.5 transition cursor-pointer"
            >
              <Plus className="w-4 h-4 text-slate-600" />
              <span>Add Store</span>
            </button>
          )}
        </div>

        {/* Footer */}
        <div className="px-5 py-3 border-t border-slate-200 bg-slate-50 flex justify-end shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-slate-900 text-white text-xs font-bold hover:bg-slate-800 transition shadow-xs cursor-pointer"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  )
}
