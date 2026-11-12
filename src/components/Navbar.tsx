import React, { useState, useEffect } from 'react'
import {
  ShoppingCart,
  CheckSquare,
  BarChart3,
  Menu,
  WifiOff,
} from 'lucide-react'
import { useShopping } from '../context/ShoppingContext'
import { useAuth } from '../firebase/AuthContext'

interface NavbarProps {
  onOpenMenu: () => void
}

export const Navbar: React.FC<NavbarProps> = ({ onOpenMenu }) => {
  const { mode, setMode, items } = useShopping()
  const { user } = useAuth()
  const [isOnline, setIsOnline] = useState<boolean>(() => {
    return typeof navigator !== 'undefined' ? navigator.onLine : true
  })

  useEffect(() => {
    const handleOnline = () => setIsOnline(true)
    const handleOffline = () => setIsOnline(false)

    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)
    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [])

  const neededCount = items.filter((i) => i.isNeeded).length
  const inCartCount = items.filter((i) => i.isNeeded && i.inCart).length

  return (
    <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-xs">
      <div className="max-w-4xl mx-auto px-2.5 sm:px-4">
        <div className="flex items-center justify-between h-15 gap-1.5 sm:gap-2">
          {/* Brand Logo */}
          <button
            type="button"
            onClick={() => setMode('add')}
            className="flex items-center gap-1.5 sm:gap-2 shrink-0 cursor-pointer focus:outline-none"
            title="HashGroc Home (List)"
          >
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-500 flex items-center justify-center text-white shadow-sm shadow-emerald-600/20">
              <ShoppingCart className="w-4 h-4" />
            </div>
            <div className="font-extrabold text-slate-900 tracking-tight text-sm sm:text-lg">
              Hash<span className="text-emerald-600">Groc</span>
            </div>
          </button>

          {/* Header Center: 1-Tap Mode Switcher (List • Shop • Prices) */}
          <nav
            aria-label="Primary app modes"
            className="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200/80 gap-0.5"
          >
            <button
              type="button"
              onClick={() => setMode('add')}
              aria-current={mode === 'add' ? 'page' : undefined}
              className={`flex items-center gap-1 px-2.5 sm:px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                mode === 'add'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
              title="Build and manage your grocery list"
            >
              <CheckSquare className={`w-3.5 h-3.5 shrink-0 ${mode === 'add' ? 'text-emerald-600' : 'text-slate-500'}`} />
              <span>List</span>
              {neededCount > 0 && (
                <span
                  className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                    mode === 'add'
                      ? 'bg-emerald-100 text-emerald-800'
                      : 'bg-slate-200/80 text-slate-700'
                  }`}
                >
                  {neededCount}
                </span>
              )}
            </button>

            <button
              type="button"
              onClick={() => setMode('shopping')}
              aria-current={mode === 'shopping' ? 'page' : undefined}
              className={`flex items-center gap-1 px-2.5 sm:px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                mode === 'shopping'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
              title="In-store shopping runner with aisle grouping"
            >
              <ShoppingCart className="w-3.5 h-3.5 shrink-0" />
              <span>Shop</span>
              {neededCount > 0 && (
                <span
                  className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                    mode === 'shopping'
                      ? 'bg-white/25 text-white'
                      : 'bg-emerald-100 text-emerald-800'
                  }`}
                >
                  {inCartCount}/{neededCount}
                </span>
              )}
            </button>

            <button
              type="button"
              onClick={() => setMode('analysis')}
              aria-current={mode === 'analysis' ? 'page' : undefined}
              className={`flex items-center gap-1 px-2.5 sm:px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                mode === 'analysis'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
              title="Compare store prices and spending history"
            >
              <BarChart3 className={`w-3.5 h-3.5 shrink-0 ${mode === 'analysis' ? 'text-indigo-600' : 'text-slate-500'}`} />
              <span className="hidden xs:inline sm:inline">Prices</span>
            </button>
          </nav>

          {/* Right Area: Single Menu Button + Offline Indicator */}
          <div className="flex items-center gap-1.5 shrink-0">
            {!isOnline && (
              <div
                className="flex items-center gap-1 px-2 py-1 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 text-[11px] font-bold shadow-2xs"
                title="Working offline. Changes are saved locally and will sync when reconnected."
              >
                <WifiOff className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                <span className="hidden sm:inline">Offline</span>
              </div>
            )}

            <button
              type="button"
              onClick={onOpenMenu}
              aria-label="Open App Menu"
              className="p-2 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-100 hover:text-slate-900 transition flex items-center gap-1.5 shadow-2xs cursor-pointer"
              title="Open Menu"
            >
              <Menu className="w-4 h-4" />
              <span className="text-xs font-bold hidden sm:inline">Menu</span>
              {user && (
                <div className="w-2 h-2 rounded-full bg-emerald-500 ml-0.5" title="Signed in" />
              )}
            </button>
          </div>
        </div>
      </div>
    </header>
  )
}
