import React, { useState } from 'react'
import { X, Plus, Trash2, Store, Edit2 } from 'lucide-react'
import type { Shop } from '../types'
import { useShopping } from '../context/ShoppingContext'

interface ShopManagerModalProps {
  onClose: () => void
}

export const ShopManagerModal: React.FC<ShopManagerModalProps> = ({ onClose }) => {
  const { shops, addShop, updateShop, deleteShop } = useShopping()
  const [editingShop, setEditingShop] = useState<Shop | null>(null)
  const [newShopName, setNewShopName] = useState('')
  const [newShopAisles, setNewShopAisles] = useState('')

  const handleCreateShop = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newShopName.trim()) return

    const aisles = newShopAisles
      .split('\n')
      .map((a) => a.trim())
      .filter(Boolean)

    await addShop({
      name: newShopName.trim(),
      color: 'emerald',
      defaultAisles: aisles.length > 0 ? aisles : ['Produce', 'Dairy', 'Pantry', 'Frozen', 'Checkout'],
    })

    setNewShopName('')
    setNewShopAisles('')
  }

  const handleSaveEdit = async () => {
    if (!editingShop || !editingShop.name.trim()) return

    await updateShop(editingShop.id, {
      name: editingShop.name.trim(),
      defaultAisles: editingShop.defaultAisles,
    })
    setEditingShop(null)
  }

  const handleDelete = async (shop: Shop) => {
    if (shops.length <= 1) {
      alert('You must have at least one store in your app.')
      return
    }
    if (window.confirm(`Delete store "${shop.name}"? Existing item notes for this store will remain.`)) {
      await deleteShop(shop.id)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 z-50 animate-in fade-in">
      <div className="bg-white rounded-2xl max-w-xl w-full max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="px-5 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50/80">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-emerald-100 text-emerald-700">
              <Store className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-slate-900">Manage Stores</h2>
              <p className="text-xs text-slate-500">Configure your family's favorite grocery shops</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-200 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-5 space-y-6">
          {/* Current Stores List */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
              Current Stores ({shops.length})
            </label>
            <div className="space-y-2">
              {shops.map((shop) => (
                <div
                  key={shop.id}
                  className="p-3 rounded-xl border border-slate-200 bg-white flex items-center justify-between gap-3 shadow-xs"
                >
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full bg-emerald-600" />
                      <span className="font-bold text-slate-900 text-sm">{shop.name}</span>
                    </div>
                    <div className="text-[11px] text-slate-500 mt-0.5 truncate">
                      {shop.defaultAisles.length} suggested aisles (
                      {shop.defaultAisles.slice(0, 3).join(', ')}
                      {shop.defaultAisles.length > 3 ? '...' : ''})
                    </div>
                  </div>

                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      onClick={() => setEditingShop(shop)}
                      className="p-1.5 text-slate-500 hover:text-emerald-700 rounded-lg hover:bg-slate-100 transition"
                      title="Edit Aisles"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(shop)}
                      className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 transition"
                      title="Delete Store"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Edit Shop Drawer */}
          {editingShop && (
            <div className="p-4 rounded-xl bg-emerald-50/70 border border-emerald-200 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-emerald-900 uppercase">
                  Edit {editingShop.name} Aisles
                </span>
                <button
                  onClick={() => setEditingShop(null)}
                  className="text-xs text-slate-400 hover:text-slate-600"
                >
                  Cancel
                </button>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">Store Name</label>
                <input
                  type="text"
                  value={editingShop.name}
                  onChange={(e) => setEditingShop({ ...editingShop, name: e.target.value })}
                  className="w-full px-3 py-1.5 rounded-lg border border-slate-300 text-xs bg-white"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Default Aisles / Locations (one per line, in walk order)
                </label>
                <textarea
                  rows={4}
                  value={editingShop.defaultAisles.join('\n')}
                  onChange={(e) =>
                    setEditingShop({
                      ...editingShop,
                      defaultAisles: e.target.value
                        .split('\n')
                        .map((a) => a.trim())
                        .filter(Boolean),
                    })
                  }
                  className="w-full p-2.5 rounded-lg border border-slate-300 text-xs bg-white font-mono"
                />
              </div>

              <button
                type="button"
                onClick={handleSaveEdit}
                className="px-4 py-1.5 bg-emerald-600 text-white rounded-lg text-xs font-bold shadow-xs hover:bg-emerald-700 transition"
              >
                Save Store Aisles
              </button>
            </div>
          )}

          {/* Add New Store Form */}
          <form
            onSubmit={handleCreateShop}
            className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3"
          >
            <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider">
              Add a New Store
            </label>

            <div>
              <input
                type="text"
                placeholder="Store Name (e.g. Whole Foods, Kroger, Sam's Club)"
                value={newShopName}
                onChange={(e) => setNewShopName(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-xs sm:text-sm bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500 font-medium"
              />
            </div>

            <div>
              <label className="block text-[11px] font-medium text-slate-600 mb-1">
                Common Aisles / Sections (Optional, one per line)
              </label>
              <textarea
                rows={3}
                placeholder={"Entrance Produce\nAisle 1 - Dairy\nAisle 2 - Pantry\nAisle 3 - Frozen"}
                value={newShopAisles}
                onChange={(e) => setNewShopAisles(e.target.value)}
                className="w-full p-2.5 rounded-xl border border-slate-300 text-xs bg-white font-mono focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <button
              type="submit"
              disabled={!newShopName.trim()}
              className="w-full py-2 px-4 rounded-xl bg-slate-900 text-white text-xs font-bold hover:bg-slate-800 disabled:opacity-50 transition flex items-center justify-center gap-1.5 shadow-sm"
            >
              <Plus className="w-4 h-4" />
              <span>Add Store</span>
            </button>
          </form>
        </div>

        {/* Footer */}
        <div className="px-5 py-3 border-t border-slate-200 bg-slate-50/80 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-emerald-600 text-white text-xs font-bold hover:bg-emerald-700 transition"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  )
}
