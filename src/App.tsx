import React, { useState } from 'react'
import { AuthProvider } from './firebase/AuthContext'
import { ShoppingProvider, useShopping } from './context/ShoppingContext'
import { Navbar } from './components/Navbar'
import { AddModeView } from './components/AddModeView'
import { ShoppingModeView } from './components/ShoppingModeView'
import { AnalysisModeView } from './components/AnalysisModeView'
import { MenuDrawer } from './components/MenuDrawer'
import { ItemEditorModal } from './components/ItemEditorModal'
import { ShopManagerModal } from './components/ShopManagerModal'
import { HouseholdModal } from './components/HouseholdModal'
import { FirebaseConfigModal } from './components/FirebaseConfigModal'
import type { ShoppingItem } from './types'

const AppContent: React.FC = () => {
  const { mode, setMode, loading } = useShopping()

  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [editingItem, setEditingItem] = useState<ShoppingItem | null>(null)
  const [editingShopId, setEditingShopId] = useState<string | undefined>(undefined)
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [isStoreManagerOpen, setIsStoreManagerOpen] = useState(false)
  const [isHouseholdModalOpen, setIsHouseholdModalOpen] = useState(false)
  const [isConfigModalOpen, setIsConfigModalOpen] = useState(false)

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin" />
          <p className="text-sm font-semibold text-slate-600">Loading your grocery list...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans">
      <Navbar onOpenMenu={() => setIsMenuOpen(true)} />

      <main>
        {mode === 'add' && (
          <AddModeView
            onOpenCreateModal={() => setIsCreateModalOpen(true)}
            onEditItem={(item) => setEditingItem(item)}
            onOpenStoreManager={() => setIsStoreManagerOpen(true)}
          />
        )}

        {mode === 'shopping' && (
          <ShoppingModeView
            onEditItem={(item, shopId) => {
              setEditingItem(item)
              setEditingShopId(shopId)
            }}
            onOpenStoreModal={() => setIsStoreManagerOpen(true)}
          />
        )}

        {mode === 'analysis' && (
          <div>
            <div className="max-w-7xl mx-auto px-4 pt-3 pb-1">
              <button
                onClick={() => setMode('add')}
                className="text-xs font-bold text-slate-500 hover:text-slate-800 flex items-center gap-1"
              >
                <span>← Back to Simple List</span>
              </button>
            </div>
            <AnalysisModeView onEditItem={(item) => setEditingItem(item)} />
          </div>
        )}
      </main>

      {/* Slide-out Menu Drawer for all secondary options */}
      <MenuDrawer
        isOpen={isMenuOpen}
        onClose={() => setIsMenuOpen(false)}
        onOpenStoreManager={() => setIsStoreManagerOpen(true)}
        onOpenHousehold={() => setIsHouseholdModalOpen(true)}
        onOpenConfig={() => setIsConfigModalOpen(true)}
      />

      {/* Item Create / Edit Modal */}
      {(isCreateModalOpen || editingItem) && (
        <ItemEditorModal
          item={editingItem}
          initialShopId={editingShopId}
          onClose={() => {
            setIsCreateModalOpen(false)
            setEditingItem(null)
            setEditingShopId(undefined)
          }}
        />
      )}

      {/* Store Manager Modal */}
      {isStoreManagerOpen && (
        <ShopManagerModal onClose={() => setIsStoreManagerOpen(false)} />
      )}

      {/* Household / Family Share Modal */}
      {isHouseholdModalOpen && (
        <HouseholdModal onClose={() => setIsHouseholdModalOpen(false)} />
      )}

      {/* Cloud Config Modal */}
      {isConfigModalOpen && (
        <FirebaseConfigModal onClose={() => setIsConfigModalOpen(false)} />
      )}
    </div>
  )
}

export default function App() {
  return (
    <AuthProvider>
      <ShoppingProvider>
        <AppContent />
      </ShoppingProvider>
    </AuthProvider>
  )
}
