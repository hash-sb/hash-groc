import React from 'react'
import {
  ShoppingCart,
  CheckSquare,
  Menu,
} from 'lucide-react'
import { useShopping } from '../context/ShoppingContext'
import { useAuth } from '../firebase/AuthContext'

interface NavbarProps {
  onOpenMenu: () => void
}

export const Navbar: React.FC<NavbarProps> = ({ onOpenMenu }) => {
  const { mode, setMode, items } = useShopping()
  const { user } = useAuth()

  const neededCount = items.filter((i) => i.isNeeded).length
  const inCartCount = items.filter((i) => i.isNeeded && i.inCart).length

  return (
    <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-xs">
      <div className="max-w-4xl mx-auto px-3 sm:px-4">
        <div className="flex items-center justify-between h-15 gap-2">
          {/* Brand Logo */}
          <div className="flex items-center gap-2 shrink-0">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-500 flex items-center justify-center text-white shadow-sm shadow-emerald-600/20">
              <ShoppingCart className="w-4 h-4" />
            </div>
            <div className="font-extrabold text-slate-900 tracking-tight text-base sm:text-lg">
              Hash<span className="text-emerald-600">Groc</span>
            </div>
          </div>

          {/* Simple Mode Switcher: List vs Shopping */}
          <div className="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200">
            {/* List / Landing Mode */}
            <button
              onClick={() => setMode('add')}
              title={`List: ${neededCount} to buy out of ${items.length} master items`}
              className={`flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-lg text-xs sm:text-sm font-bold transition-all ${
                mode === 'add'
                  ? 'bg-white text-emerald-700 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <CheckSquare className="w-4 h-4" />
              <span>List</span>
              {items.length > 0 && (
                <span
                  className={`ml-0.5 text-[10px] px-1.5 py-0.2 rounded-full font-bold transition-colors ${
                    mode === 'add'
                      ? 'bg-emerald-100 text-emerald-800'
                      : 'bg-slate-200 text-slate-700'
                  }`}
                >
                  {neededCount}/{items.length}
                </span>
              )}
            </button>

            {/* Shopping Mode */}
            <button
              onClick={() => setMode('shopping')}
              title={`Shopping: ${inCartCount} in cart out of ${neededCount} needed`}
              className={`flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-lg text-xs sm:text-sm font-bold transition-all ${
                mode === 'shopping'
                  ? 'bg-emerald-600 text-white shadow-sm shadow-emerald-600/30'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <ShoppingCart className="w-4 h-4" />
              <span>Shopping</span>
              {neededCount > 0 && (
                <span
                  className={`ml-0.5 text-[10px] px-1.5 py-0.2 rounded-full font-bold transition-colors ${
                    mode === 'shopping'
                      ? 'bg-white/25 text-white'
                      : 'bg-slate-200 text-slate-700'
                  }`}
                >
                  {inCartCount}/{neededCount}
                </span>
              )}
            </button>
          </div>

          {/* Right Area: Single Menu Button */}
          <div className="flex items-center gap-1.5">
            <button
              onClick={onOpenMenu}
              className="p-2 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-100 hover:text-slate-900 transition flex items-center gap-1.5 shadow-2xs"
              title="Open Menu"
            >
              <Menu className="w-4 h-4" />
              <span className="text-xs font-bold hidden sm:inline">Menu</span>
              {user && (
                <div className="w-2 h-2 rounded-full bg-emerald-500 ml-0.5" />
              )}
            </button>
          </div>
        </div>
      </div>
    </header>
  )
}
