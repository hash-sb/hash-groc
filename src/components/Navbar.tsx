import React, { useState } from 'react'
import {
  ShoppingCart,
  PlusCircle,
  BarChart3,
  Users,
  Copy,
  Check,
  LogOut,
  LogIn,
  Cloud,
  Database,
} from 'lucide-react'
import { useShopping } from '../context/ShoppingContext'
import { useAuth } from '../firebase/AuthContext'

interface NavbarProps {
  onOpenHousehold: () => void
  onOpenConfig: () => void
}

export const Navbar: React.FC<NavbarProps> = ({ onOpenHousehold, onOpenConfig }) => {
  const { mode, setMode, household, items } = useShopping()
  const { user, signInWithGoogle, signOut, isConfigured } = useAuth()
  const [copiedCode, setCopiedCode] = useState(false)

  const neededCount = items.filter((i) => i.isNeeded).length
  const inCartCount = items.filter((i) => i.isNeeded && i.inCart).length

  const handleCopyInvite = () => {
    const url = `${window.location.origin}${window.location.pathname}?join=${household.inviteCode}`
    navigator.clipboard.writeText(url)
    setCopiedCode(true)
    setTimeout(() => setCopiedCode(false), 2000)
  }

  return (
    <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-xs">
      <div className="max-w-7xl mx-auto px-3 sm:px-6">
        <div className="flex items-center justify-between h-16 gap-2">
          {/* Brand Logo */}
          <div className="flex items-center gap-2.5 shrink-0">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-500 flex items-center justify-center text-white shadow-sm shadow-emerald-600/20">
              <ShoppingCart className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-bold text-slate-900 tracking-tight text-base sm:text-lg">
                  Hash<span className="text-emerald-600">Groc</span>
                </span>
                <span className="hidden sm:inline-block text-[10px] font-semibold bg-emerald-50 text-emerald-700 px-1.5 py-0.5 rounded border border-emerald-200">
                  Family Sync
                </span>
              </div>
              <p className="text-[11px] text-slate-500 hidden sm:block">Smart Multi-Store Shopping</p>
            </div>
          </div>

          {/* Mode Switcher: 3 Modes */}
          <div className="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200">
            {/* 1. Add Mode */}
            <button
              onClick={() => setMode('add')}
              className={`flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-lg text-xs sm:text-sm font-semibold transition-all ${
                mode === 'add'
                  ? 'bg-white text-emerald-700 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <PlusCircle className="w-4 h-4 shrink-0" />
              <span className="hidden md:inline">Add / Edit</span>
              <span className="md:hidden">Add</span>
              {neededCount > 0 && (
                <span className="ml-0.5 bg-slate-200 text-slate-700 text-[10px] px-1.5 py-0.2 rounded-full font-bold">
                  {neededCount}
                </span>
              )}
            </button>

            {/* 2. Shopping Mode */}
            <button
              onClick={() => setMode('shopping')}
              className={`flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-lg text-xs sm:text-sm font-semibold transition-all ${
                mode === 'shopping'
                  ? 'bg-emerald-600 text-white shadow-sm shadow-emerald-600/30'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <ShoppingCart className="w-4 h-4 shrink-0" />
              <span className="hidden md:inline">Shopping</span>
              <span className="md:hidden">Shop</span>
              {inCartCount > 0 && (
                <span className="ml-0.5 bg-white/25 text-white text-[10px] px-1.5 py-0.2 rounded-full font-bold">
                  {inCartCount}/{neededCount}
                </span>
              )}
            </button>

            {/* 3. Analysis Mode */}
            <button
              onClick={() => setMode('analysis')}
              className={`flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-lg text-xs sm:text-sm font-semibold transition-all ${
                mode === 'analysis'
                  ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-600/30'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <BarChart3 className="w-4 h-4 shrink-0" />
              <span className="hidden md:inline">Analysis</span>
              <span className="md:hidden">Matrix</span>
            </button>
          </div>

          {/* Right Area: Household & User */}
          <div className="flex items-center gap-1.5 sm:gap-2">
            {/* Household Pill */}
            <button
              onClick={onOpenHousehold}
              className="hidden lg:flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium bg-slate-50 border border-slate-200 text-slate-700 hover:bg-slate-100 transition"
              title="Click to view family code & invite link"
            >
              <Users className="w-3.5 h-3.5 text-emerald-600" />
              <span className="font-semibold text-slate-800 truncate max-w-[100px]">
                {household.name}
              </span>
              <span className="text-slate-400 font-mono text-[11px]">#{household.inviteCode}</span>
            </button>

            {/* Quick Share Link Button */}
            <button
              onClick={handleCopyInvite}
              className="hidden xl:flex items-center gap-1 px-2 py-1.5 rounded-lg text-xs text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition border border-transparent hover:border-slate-200"
              title="Copy Family Invite Link"
            >
              {copiedCode ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-600" />
                  <span className="text-emerald-700 font-medium">Copied!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>Share</span>
                </>
              )}
            </button>

            {/* Cloud Status */}
            <button
              onClick={onOpenConfig}
              className={`p-2 rounded-lg border text-xs flex items-center gap-1 transition ${
                isConfigured
                  ? 'border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
                  : 'border-amber-200 bg-amber-50 text-amber-800 hover:bg-amber-100'
              }`}
              title={isConfigured ? 'Firebase Cloud Connected' : 'Running in Local Demo Mode'}
            >
              {isConfigured ? (
                <Cloud className="w-4 h-4 text-emerald-600" />
              ) : (
                <Database className="w-4 h-4 text-amber-600" />
              )}
            </button>

            {/* User Profile */}
            {user ? (
              <div className="flex items-center gap-1 pl-1">
                {user.photoURL ? (
                  <img
                    src={user.photoURL}
                    alt={user.displayName || 'User'}
                    className="w-8 h-8 rounded-full border border-slate-200 ring-2 ring-emerald-500/20"
                  />
                ) : (
                  <div className="w-8 h-8 rounded-full bg-slate-800 text-white flex items-center justify-center font-bold text-xs">
                    {(user.displayName || user.email || 'U')[0].toUpperCase()}
                  </div>
                )}
                <button
                  onClick={() => signOut()}
                  className="p-1.5 text-slate-400 hover:text-rose-600 transition"
                  title="Sign Out"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <button
                onClick={() => signInWithGoogle()}
                className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-slate-900 text-white hover:bg-slate-800 text-xs font-semibold shadow-xs transition"
              >
                <LogIn className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Sign In</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </header>
  )
}
