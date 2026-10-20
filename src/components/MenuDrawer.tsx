import React, { useState } from 'react'
import {
  X,
  BarChart3,
  Store,
  Users,
  Cloud,
  Edit3,
  LogIn,
  ChevronRight,
  RotateCcw,
} from 'lucide-react'
import { useShopping } from '../context/ShoppingContext'
import { useAuth } from '../firebase/AuthContext'
import type { ShoppingItem } from '../types'

interface MenuDrawerProps {
  isOpen: boolean
  onClose: () => void
  onOpenStoreManager: () => void
  onOpenHousehold: () => void
  onOpenConfig: () => void
  onEditItem: (item: ShoppingItem) => void
}

export const MenuDrawer: React.FC<MenuDrawerProps> = ({
  isOpen,
  onClose,
  onOpenStoreManager,
  onOpenHousehold,
  onOpenConfig,
  onEditItem,
}) => {
  const { setMode, items, household, resetToSampleData } = useShopping()
  const { user, signInWithGoogle, signOut, isConfigured } = useAuth()
  const [showItemPicker, setShowItemPicker] = useState(false)

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex justify-end animate-in fade-in duration-200">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 backdrop-blur-xs transition-opacity"
        onClick={onClose}
      />

      {/* Drawer Panel */}
      <div className="relative w-full max-w-sm bg-white h-full shadow-2xl flex flex-col z-10 overflow-hidden">
        {/* Drawer Header */}
        <div className="p-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
          <div>
            <h2 className="text-base font-bold text-slate-900">App Menu</h2>
            <p className="text-xs text-slate-500">Advanced settings, stores & analysis</p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-200 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Drawer Content */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {/* User & Household Card */}
          <div className="p-3.5 rounded-2xl bg-gradient-to-br from-emerald-50 to-teal-50 border border-emerald-200">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-800">
                Shared Family Space
              </span>
              <span className="font-mono text-xs font-black text-emerald-700">
                #{household.inviteCode}
              </span>
            </div>
            <div className="font-extrabold text-slate-900 text-sm">{household.name}</div>

            {user ? (
              <div className="flex items-center justify-between mt-2 pt-2 border-t border-emerald-200/60 text-xs">
                <span className="text-slate-600 truncate">{user.displayName || user.email}</span>
                <button
                  onClick={() => signOut()}
                  className="text-rose-600 font-bold hover:underline shrink-0 ml-2"
                >
                  Sign Out
                </button>
              </div>
            ) : (
              <button
                onClick={() => {
                  signInWithGoogle()
                  onClose()
                }}
                className="mt-2 w-full py-1.5 bg-slate-900 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5"
              >
                <LogIn className="w-3.5 h-3.5" />
                <span>Google Sign In</span>
              </button>
            )}
          </div>

          {/* Menu Sections */}
          <div className="space-y-1">
            <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400 px-2 py-1">
              Features & Tools
            </div>

            {/* 1. Price Analysis Matrix */}
            <button
              onClick={() => {
                setMode('analysis')
                onClose()
              }}
              className="w-full flex items-center justify-between p-3 rounded-xl hover:bg-slate-50 transition text-left group border border-transparent hover:border-slate-200"
            >
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-indigo-50 text-indigo-700">
                  <BarChart3 className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-sm font-bold text-slate-900">Price Matrix & Analysis</div>
                  <div className="text-xs text-slate-500">
                    Compare store prices & normalized sizes
                  </div>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-slate-700" />
            </button>

            {/* 2. Edit Store Details, Aisles & Prices */}
            <button
              onClick={() => setShowItemPicker(!showItemPicker)}
              className="w-full flex items-center justify-between p-3 rounded-xl hover:bg-slate-50 transition text-left group border border-transparent hover:border-slate-200"
            >
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-amber-50 text-amber-700">
                  <Edit3 className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-sm font-bold text-slate-900">
                    Edit Item Details & Prices
                  </div>
                  <div className="text-xs text-slate-500">Set store aisles, prices & packages</div>
                </div>
              </div>
              <ChevronRight
                className={`w-4 h-4 text-slate-400 transition-transform ${
                  showItemPicker ? 'rotate-90' : ''
                }`}
              />
            </button>

            {/* Item Picker for Editing Details */}
            {showItemPicker && (
              <div className="pl-12 pr-2 py-1 space-y-1 max-h-48 overflow-y-auto">
                <div className="text-[11px] text-slate-400 font-semibold mb-1">
                  Select an item to edit store details:
                </div>
                {items.map((i) => (
                  <button
                    key={i.id}
                    onClick={() => {
                      onEditItem(i)
                      onClose()
                    }}
                    className="w-full text-left p-2 rounded-lg bg-slate-50 hover:bg-emerald-50 hover:text-emerald-900 text-xs font-semibold text-slate-700 truncate transition flex justify-between items-center"
                  >
                    <span className="truncate">{i.name}</span>
                    <span className="text-[10px] text-slate-400 shrink-0">Edit →</span>
                  </button>
                ))}
              </div>
            )}

            {/* 3. Manage Stores */}
            <button
              onClick={() => {
                onOpenStoreManager()
                onClose()
              }}
              className="w-full flex items-center justify-between p-3 rounded-xl hover:bg-slate-50 transition text-left group border border-transparent hover:border-slate-200"
            >
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-blue-50 text-blue-700">
                  <Store className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-sm font-bold text-slate-900">Manage Stores</div>
                  <div className="text-xs text-slate-500">
                    Add custom stores & default aisle orders
                  </div>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-slate-700" />
            </button>

            {/* 4. Household & Sync Sharing */}
            <button
              onClick={() => {
                onOpenHousehold()
                onClose()
              }}
              className="w-full flex items-center justify-between p-3 rounded-xl hover:bg-slate-50 transition text-left group border border-transparent hover:border-slate-200"
            >
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-emerald-50 text-emerald-700">
                  <Users className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-sm font-bold text-slate-900">Family & Household Sync</div>
                  <div className="text-xs text-slate-500">Share invite code with family</div>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-slate-700" />
            </button>

            {/* 5. Cloud / Firebase Settings */}
            <button
              onClick={() => {
                onOpenConfig()
                onClose()
              }}
              className="w-full flex items-center justify-between p-3 rounded-xl hover:bg-slate-50 transition text-left group border border-transparent hover:border-slate-200"
            >
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-purple-50 text-purple-700">
                  <Cloud className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-sm font-bold text-slate-900">Cloud & Database Setup</div>
                  <div className="text-xs text-slate-500">
                    {isConfigured ? 'Connected to Firebase' : 'Running in local mode'}
                  </div>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-slate-700" />
            </button>
          </div>

          {/* Reset Demo Data */}
          <div className="pt-4 border-t border-slate-200">
            <button
              onClick={async () => {
                if (window.confirm('Reset catalog back to sample items and stores?')) {
                  await resetToSampleData()
                  onClose()
                }
              }}
              className="w-full py-2 px-3 rounded-xl border border-slate-200 text-xs font-semibold text-slate-600 hover:bg-slate-50 transition flex items-center justify-center gap-1.5"
            >
              <RotateCcw className="w-3.5 h-3.5 text-slate-400" />
              <span>Reset Sample Grocery Data</span>
            </button>
          </div>
        </div>

        {/* Drawer Footer */}
        <div className="p-4 border-t border-slate-200 bg-slate-50 text-center">
          <button
            onClick={onClose}
            className="w-full py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition"
          >
            Close Menu
          </button>
        </div>
      </div>
    </div>
  )
}
