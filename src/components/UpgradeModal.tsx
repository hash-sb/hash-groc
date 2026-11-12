import React, { useState, useEffect } from 'react'
import {
  Sparkles,
  Check,
  X,
  ShieldCheck,
  Users,
  Store,
  ArrowRight,
  TrendingUp,
  Receipt,
  AlertTriangle,
  PartyPopper,
} from 'lucide-react'
import { useShopping } from '../context/ShoppingContext'
import { useBodyScrollLock } from '../utils/scrollLock'

export type UpgradeTrigger = 'household' | 'store_limit' | 'general' | 'receipt'

interface UpgradeModalProps {
  isOpen: boolean
  onClose: () => void
  trigger?: UpgradeTrigger
  onSelectPlan?: (plan: 'annual' | 'monthly') => void
}

const TRIGGER_DETAILS: Record<
  UpgradeTrigger,
  { headline: string; subtext: string; icon: React.ReactNode }
> = {
  household: {
    headline: 'Sync Lists in Real-Time with Your Household',
    subtext: 'Invite partners, roommates, and family to shop together across all stores.',
    icon: <Users className="w-5 h-5 text-emerald-200" />,
  },
  store_limit: {
    headline: 'Unlock Unlimited Stores & Maximum Savings',
    subtext: 'Add Costco, Trader Joe’s, ALDI, and more to compare prices across every aisle.',
    icon: <Store className="w-5 h-5 text-emerald-200" />,
  },
  receipt: {
    headline: 'Unlock Unlimited AI Receipt Scans with Groc Plus',
    subtext: 'Never type grocery prices manually again. Snap any receipt to auto-update store prices.',
    icon: <Receipt className="w-5 h-5 text-emerald-200" />,
  },
  general: {
    headline: 'Supercharge Your Grocery Savings with Groc Plus',
    subtext: 'Everything you need for effortless household shopping and price optimization.',
    icon: <Sparkles className="w-5 h-5 text-emerald-200" />,
  },
}

export const UpgradeModal: React.FC<UpgradeModalProps> = ({
  isOpen,
  onClose,
  trigger = 'general',
  onSelectPlan,
}) => {
  const { isPro, household, cancelProSubscription } = useShopping()
  const [selectedPlan, setSelectedPlan] = useState<'annual' | 'monthly'>('annual')
  const [isLoading, setIsLoading] = useState(false)
  const [showCancelConfirm, setShowCancelConfirm] = useState(false)
  const [justActivated, setJustActivated] = useState(false)

  useBodyScrollLock(isOpen)

  // Reset internal states when closed
  useEffect(() => {
    if (!isOpen) {
      setShowCancelConfirm(false)
      setJustActivated(false)
    }
  }, [isOpen])

  if (!isOpen) return null

  // 1. Exciting Celebration Screen when user JUST activated their 14-day free trial
  if (justActivated) {
    const trialDateStr = household?.trialEndsAt
      ? new Date(household.trialEndsAt).toLocaleDateString(undefined, {
          month: 'short',
          day: 'numeric',
          year: 'numeric',
        })
      : new Date(Date.now() + 14 * 86400000).toLocaleDateString(undefined, {
          month: 'short',
          day: 'numeric',
          year: 'numeric',
        })

    const unlockedPerks = [
      {
        icon: <Store className="w-4 h-4 text-emerald-600" />,
        bg: 'bg-emerald-100 border-emerald-200',
        title: 'Unlimited Stores',
        desc: 'Compare prices across Costco, ALDI, Trader Joe’s & more',
      },
      {
        icon: <Users className="w-4 h-4 text-teal-600" />,
        bg: 'bg-teal-100 border-teal-200',
        title: 'Live Family Sync',
        desc: `Instant shared cart for ${household?.name || 'your household'}`,
      },
      {
        icon: <Receipt className="w-4 h-4 text-amber-600" />,
        bg: 'bg-amber-100 border-amber-200',
        title: 'Unlimited AI Receipt Scans',
        desc: 'Snap paper receipts to update store prices in seconds',
      },
      {
        icon: <TrendingUp className="w-4 h-4 text-indigo-600" />,
        bg: 'bg-indigo-100 border-indigo-200',
        title: 'Smart Multi-Store Split',
        desc: 'Automatically find the lowest basket cost every trip',
      },
    ]

    return (
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Welcome to Groc Plus"
        className="fixed inset-0 z-[60] flex flex-col items-center justify-start sm:justify-center p-3 sm:p-4 bg-slate-950/70 backdrop-blur-sm overflow-y-auto overscroll-contain animate-in fade-in duration-200"
        onClick={(e) => {
          if (e.target === e.currentTarget) onClose()
        }}
      >
        <div
          className="relative bg-white rounded-3xl w-full max-w-md shadow-2xl flex flex-col max-h-[calc(100dvh-1.5rem)] sm:max-h-[92dvh] my-auto overflow-hidden border border-emerald-300/60 animate-in zoom-in-95 duration-200 overscroll-contain shrink-0"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Celebratory Hero Header with Animated Confetti Accents */}
          <div className="relative px-6 pt-6 pb-5 bg-gradient-to-br from-emerald-600 via-teal-600 to-emerald-800 text-white text-center overflow-hidden shrink-0">
            {/* Decorative Floating Confetti / Glow Orbs */}
            <div className="pointer-events-none absolute -top-10 -left-10 w-32 h-32 rounded-full bg-amber-400/25 blur-2xl" />
            <div className="pointer-events-none absolute -bottom-10 -right-10 w-36 h-36 rounded-full bg-teal-300/25 blur-2xl" />
            <span className="pointer-events-none select-none absolute top-4 left-6 text-lg animate-bounce">
              🎉
            </span>
            <span className="pointer-events-none select-none absolute top-8 right-12 text-base animate-pulse">
              ✨
            </span>
            <span className="pointer-events-none select-none absolute bottom-4 left-12 text-sm animate-pulse">
              🌟
            </span>
            <span className="pointer-events-none select-none absolute bottom-5 right-7 text-lg animate-bounce">
              🎊
            </span>

            <button
              type="button"
              onClick={onClose}
              aria-label="Close"
              className="absolute top-3.5 right-3.5 p-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white transition cursor-pointer"
              title="Close"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Glowing Center Celebration Medallion */}
            <div className="relative mx-auto w-16 h-16 rounded-3xl bg-gradient-to-tr from-amber-400 via-amber-300 to-yellow-200 text-slate-950 flex items-center justify-center shadow-xl shadow-amber-500/30 ring-4 ring-white/25 mb-3 animate-in zoom-in-50 duration-300">
              <PartyPopper className="w-8 h-8 stroke-[2.2]" />
              <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-emerald-500 border-2 border-white text-white flex items-center justify-center shadow-xs">
                <Check className="w-3.5 h-3.5 stroke-[3]" />
              </div>
            </div>

            <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-amber-400/20 border border-amber-300/40 text-amber-200 text-[11px] font-black uppercase tracking-wider mb-1.5">
              <Sparkles className="w-3 h-3 text-amber-300" />
              <span>14-Day Free Trial Unlocked</span>
            </div>

            <h2 className="text-xl sm:text-2xl font-black tracking-tight">
              You’re on Groc Plus!
            </h2>
            <p className="text-xs sm:text-sm text-emerald-100 mt-1 font-medium max-w-xs mx-auto">
              Every premium superpower is now live for your household. Let’s save on your next trip!
            </p>
          </div>

          {/* Scrollable Celebration Body */}
          <div className="p-4 sm:p-5 space-y-4 overflow-y-auto overscroll-contain">
            {/* Unlocked Superpowers Grid */}
            <div>
              <div className="text-[11px] font-extrabold uppercase tracking-wider text-slate-400 mb-2 flex items-center justify-between px-0.5">
                <span>Your Unlocked Superpowers</span>
                <span className="text-emerald-600 font-black">4 / 4 Active</span>
              </div>
              <div className="grid grid-cols-1 gap-2">
                {unlockedPerks.map((perk) => (
                  <div
                    key={perk.title}
                    className="p-2.5 rounded-2xl bg-slate-50/90 border border-slate-200/80 flex items-center justify-between gap-3 shadow-2xs"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div
                        className={`w-9 h-9 rounded-xl border flex items-center justify-center shrink-0 ${perk.bg}`}
                      >
                        {perk.icon}
                      </div>
                      <div className="min-w-0">
                        <div className="text-xs font-extrabold text-slate-900 truncate">
                          {perk.title}
                        </div>
                        <div className="text-[11px] text-slate-500 truncate">
                          {perk.desc}
                        </div>
                      </div>
                    </div>
                    <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-black uppercase tracking-wider shrink-0 flex items-center gap-0.5">
                      <Check className="w-2.5 h-2.5 stroke-[3]" />
                      Live
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Peace-of-Mind 14-Day Trial Timeline */}
            <div className="p-3.5 rounded-2xl bg-gradient-to-r from-emerald-50 via-teal-50 to-emerald-50 border border-emerald-200/80 flex items-center justify-between gap-3">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-2xs">
                  <ShieldCheck className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-xs font-extrabold text-slate-900">
                    $0.00 Charged Today
                  </div>
                  <div className="text-[11px] text-slate-600">
                    Free until <span className="font-bold text-emerald-800">{trialDateStr}</span> • Cancel anytime in Menu
                  </div>
                </div>
              </div>
            </div>

            {/* Exciting Primary CTA */}
            <button
              type="button"
              onClick={onClose}
              className="w-full py-3.5 px-5 bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-600 hover:from-emerald-700 hover:via-teal-700 hover:to-emerald-700 active:scale-[0.98] text-white font-black text-sm rounded-2xl shadow-lg shadow-emerald-600/30 transition flex items-center justify-center gap-2 cursor-pointer"
            >
              <Sparkles className="w-4 h-4 text-amber-300" />
              <span>Start Exploring Groc Plus</span>
              <ArrowRight className="w-4 h-4 stroke-[2.5]" />
            </button>
          </div>
        </div>
      </div>
    )
  }

  // 2. If user is already on Groc Plus (revisiting from Menu), show the Subscription Management view
  if (isPro) {
    const trialDateStr = household?.trialEndsAt
      ? new Date(household.trialEndsAt).toLocaleDateString(undefined, {
          month: 'short',
          day: 'numeric',
          year: 'numeric',
        })
      : null

    const handleConfirmCancel = async () => {
      setIsLoading(true)
      try {
        await cancelProSubscription()
        setShowCancelConfirm(false)
        setJustActivated(false)
        onClose()
      } catch (err) {
        console.error('Failed to cancel Groc Plus subscription:', err)
      } finally {
        setIsLoading(false)
      }
    }

    return (
      <div
        className="fixed inset-0 z-[60] flex flex-col items-center justify-start sm:justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs overflow-y-auto overscroll-contain animate-in fade-in duration-200"
        onClick={(e) => {
          if (e.target === e.currentTarget && !isLoading) onClose()
        }}
      >
        <div
          className="relative bg-white rounded-3xl w-full max-w-md shadow-2xl flex flex-col max-h-[calc(100dvh-1.5rem)] sm:max-h-[92dvh] my-auto overflow-hidden border border-slate-200 animate-in zoom-in-95 duration-150 overscroll-contain shrink-0"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="relative p-5 sm:p-6 bg-gradient-to-br from-emerald-600 via-teal-600 to-emerald-700 text-white">
            <button
              type="button"
              onClick={onClose}
              className="absolute top-4 right-4 p-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white transition cursor-pointer"
              title="Close"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Pill Badge */}
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/30 border border-emerald-300/40 text-emerald-100 text-xs font-black uppercase tracking-wider mb-2.5 shadow-inner">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Groc Plus Active</span>
            </div>

            <div className="flex items-start gap-2.5">
              <div className="p-2 rounded-xl bg-white/10 border border-white/20 shrink-0 mt-0.5">
                <ShieldCheck className="w-5 h-5 text-emerald-200" />
              </div>
              <div>
                <h2 className="text-lg sm:text-xl font-black tracking-tight leading-snug">
                  Manage Subscription
                </h2>
                <p className="text-xs sm:text-sm text-emerald-100/90 mt-1 font-medium leading-relaxed">
                  Your household has full access to all Groc Plus features across all devices.
                </p>
              </div>
            </div>
          </div>

          {/* Body */}
          <div className="p-5 sm:p-6 space-y-4 overflow-y-auto">
            {/* Status Card */}
            <div className="p-4 rounded-2xl bg-gradient-to-br from-emerald-50 to-teal-50 border border-emerald-200 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-emerald-900">Current Status</span>
                <span className="px-2 py-0.5 rounded-full bg-emerald-600 text-white text-[10px] font-black uppercase tracking-wider">
                  Active
                </span>
              </div>
              <div className="text-sm font-extrabold text-slate-900">
                14-Day Free Trial
              </div>
              {trialDateStr && (
                <div className="text-xs text-slate-600">
                  Active through <span className="font-semibold text-slate-800">{trialDateStr}</span>
                </div>
              )}
              <div className="pt-1.5 text-[11px] text-slate-500 border-t border-emerald-200/60">
                Household: <span className="font-bold text-slate-800">{household?.name}</span> (#{household?.inviteCode})
              </div>
            </div>

            {/* Unlocked Benefits */}
            <div className="space-y-2 text-xs text-slate-700">
              <div className="font-bold text-slate-900">
                Unlocked on this plan:
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0 font-bold text-[10px]">
                  ✓
                </div>
                <span>Unlimited stores & multi-store price comparisons</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0 font-bold text-[10px]">
                  ✓
                </div>
                <span>Real-time household sync across all family phones</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0 font-bold text-[10px]">
                  ✓
                </div>
                <span>Unlimited AI receipt scans with Gemini Vision</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0 font-bold text-[10px]">
                  ✓
                </div>
                <span>In-store shelf walk-through order synchronization</span>
              </div>
            </div>

            {/* Actions */}
            {showCancelConfirm ? (
              <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 space-y-3 animate-in fade-in zoom-in-95 duration-150">
                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-xl bg-rose-100 text-rose-600 shrink-0 mt-0.5">
                    <AlertTriangle className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-rose-950">
                      Cancel Groc Plus Subscription?
                    </h3>
                    <p className="text-xs text-rose-800/90 mt-1 leading-relaxed">
                      Your household will return to the Free Tier (up to 2 stores, 1 device). Your items and stores will remain safe, but household sharing and AI scans will be locked.
                    </p>
                  </div>
                </div>

                <div className="pt-1 flex flex-col sm:flex-row gap-2">
                  <button
                    type="button"
                    disabled={isLoading}
                    onClick={() => setShowCancelConfirm(false)}
                    className="flex-1 py-2.5 px-3 bg-white hover:bg-slate-50 text-slate-700 font-bold text-xs rounded-xl border border-slate-200 shadow-xs transition cursor-pointer"
                  >
                    Keep My Subscription
                  </button>

                  <button
                    type="button"
                    disabled={isLoading}
                    onClick={handleConfirmCancel}
                    className="flex-1 py-2.5 px-3 bg-rose-600 hover:bg-rose-700 active:scale-[0.98] text-white font-bold text-xs rounded-xl shadow-xs transition cursor-pointer disabled:opacity-50"
                  >
                    {isLoading ? 'Canceling...' : 'Yes, Cancel'}
                  </button>
                </div>
              </div>
            ) : (
              <div className="pt-2 space-y-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="w-full py-3.5 px-4 bg-emerald-600 hover:bg-emerald-700 active:scale-[0.98] text-white text-xs sm:text-sm font-bold rounded-2xl shadow-md shadow-emerald-600/20 transition cursor-pointer flex items-center justify-center gap-2"
                >
                  <span>Done</span>
                </button>

                <button
                  type="button"
                  disabled={isLoading}
                  onClick={() => setShowCancelConfirm(true)}
                  className="w-full py-2 px-3 text-rose-600 hover:text-rose-700 hover:bg-rose-50 text-xs font-semibold rounded-xl transition cursor-pointer disabled:opacity-40"
                >
                  Cancel Subscription & Return to Free
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    )
  }

  const details = TRIGGER_DETAILS[trigger] || TRIGGER_DETAILS.general

  const handleStartTrial = async () => {
    setIsLoading(true)
    try {
      if (onSelectPlan) {
        await onSelectPlan(selectedPlan)
      }
      if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
        try {
          navigator.vibrate([30, 50, 70])
        } catch {
          // ignore
        }
      }
      setJustActivated(true)
    } catch (err) {
      console.error('Failed to start trial:', err)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div
      className="fixed inset-0 z-[60] flex flex-col items-center justify-start sm:justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs overflow-y-auto overscroll-contain animate-in fade-in duration-200"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose()
      }}
    >
      <div
        className="relative bg-white rounded-3xl w-full max-w-md shadow-2xl flex flex-col max-h-[calc(100dvh-1.5rem)] sm:max-h-[92dvh] my-auto overflow-hidden border border-slate-200 animate-in zoom-in-95 duration-150 overscroll-contain shrink-0"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Hero Banner */}
        <div className="relative p-5 sm:p-6 bg-gradient-to-br from-emerald-600 via-teal-600 to-emerald-700 text-white">
          <button
            type="button"
            onClick={onClose}
            className="absolute top-4 right-4 p-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white transition cursor-pointer"
            title="Close"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Pill Badge */}
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/30 border border-emerald-300/40 text-emerald-100 text-xs font-black uppercase tracking-wider mb-2.5 shadow-inner">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Groc Plus</span>
          </div>

          <div className="flex items-start gap-2.5">
            <div className="p-2 rounded-xl bg-white/10 border border-white/20 shrink-0 mt-0.5">
              {details.icon}
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-black tracking-tight leading-snug">
                {details.headline}
              </h2>
              <p className="text-xs sm:text-sm text-emerald-100/90 mt-1 font-medium leading-relaxed">
                {details.subtext}
              </p>
            </div>
          </div>

          {/* ROI Anchor Box */}
          <div className="mt-4 p-2.5 rounded-2xl bg-white/10 border border-white/15 flex items-center gap-2.5 backdrop-blur-xs">
            <div className="w-7 h-7 rounded-xl bg-amber-400 text-slate-900 flex items-center justify-center shrink-0 font-black text-xs shadow-xs">
              <TrendingUp className="w-4 h-4 stroke-[2.5]" />
            </div>
            <div className="text-xs text-white/95">
              <span className="font-bold text-amber-300">Saves ~$112/month</span> on average across multiple stores.
            </div>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-5 sm:p-6 space-y-4 overflow-y-auto">
          {/* Feature Checklist */}
          <div className="space-y-2.5 text-xs text-slate-700">
            <div className="flex items-start gap-2.5">
              <div className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0 font-bold mt-0.5">
                <Check className="w-3 h-3 stroke-[3]" />
              </div>
              <div>
                <span className="font-bold text-slate-900">Real-Time Household Sync:</span>
                <span className="text-slate-500"> Shared cart and instant check-offs on all family phones.</span>
              </div>
            </div>

            <div className="flex items-start gap-2.5">
              <div className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0 font-bold mt-0.5">
                <Check className="w-3 h-3 stroke-[3]" />
              </div>
              <div>
                <span className="font-bold text-slate-900">Unlimited Stores:</span>
                <span className="text-slate-500"> Add Costco, Trader Joe’s, ALDI, Walmart, HEB, and more.</span>
              </div>
            </div>

            <div className="flex items-start gap-2.5">
              <div className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0 font-bold mt-0.5">
                <Check className="w-3 h-3 stroke-[3]" />
              </div>
              <div>
                <span className="font-bold text-slate-900">Store Shelf-Order Sync:</span>
                <span className="text-slate-500"> Physical aisle sequence persists for everyone on the trip.</span>
              </div>
            </div>

            <div className="flex items-start gap-2.5">
              <div className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0 font-bold mt-0.5">
                <Check className="w-3 h-3 stroke-[3]" />
              </div>
              <div>
                <span className="font-bold text-slate-900">Multi-Store &quot;Save Mode&quot;:</span>
                <span className="text-slate-500"> Automatically split trips to capture lowest price per item.</span>
              </div>
            </div>
          </div>

          {/* Pricing Tier Selector */}
          <div className="grid grid-cols-2 gap-2.5 pt-1">
            {/* Annual Option (Recommended) */}
            <div
              onClick={() => setSelectedPlan('annual')}
              className={`relative p-3 rounded-2xl cursor-pointer transition text-left ${
                selectedPlan === 'annual'
                  ? 'border-2 border-emerald-600 bg-emerald-50/70 shadow-xs'
                  : 'border border-slate-200 bg-white hover:border-slate-300'
              }`}
            >
              <span className="absolute -top-2.5 right-2 px-2 py-0.5 bg-emerald-600 text-white rounded-full text-[10px] font-black uppercase tracking-wider shadow-xs">
                Save 30%
              </span>
              <div className="text-xs font-bold text-slate-900">Annual Plan</div>
              <div className="text-base font-black text-emerald-700 mt-0.5">
                $24.99 <span className="text-xs font-medium text-slate-500">/ yr</span>
              </div>
              <div className="text-[11px] text-slate-500 mt-0.5 font-medium">Just $2.08 / month</div>
            </div>

            {/* Monthly Option */}
            <div
              onClick={() => setSelectedPlan('monthly')}
              className={`relative p-3 rounded-2xl cursor-pointer transition text-left ${
                selectedPlan === 'monthly'
                  ? 'border-2 border-emerald-600 bg-emerald-50/70 shadow-xs'
                  : 'border border-slate-200 bg-white hover:border-slate-300'
              }`}
            >
              <div className="text-xs font-bold text-slate-900">Monthly Plan</div>
              <div className="text-base font-black text-slate-800 mt-0.5">
                $2.99 <span className="text-xs font-medium text-slate-500">/ mo</span>
              </div>
              <div className="text-[11px] text-slate-500 mt-0.5 font-medium">Billed every month</div>
            </div>
          </div>

          {/* CTA Button */}
          <div className="pt-2 space-y-2">
            <button
              type="button"
              disabled={isLoading}
              onClick={handleStartTrial}
              className="w-full py-3.5 px-4 bg-emerald-600 hover:bg-emerald-700 active:scale-[0.98] text-white font-black text-sm rounded-2xl shadow-lg shadow-emerald-600/25 transition cursor-pointer flex items-center justify-center gap-2 disabled:opacity-50"
            >
              <span>{isLoading ? 'Loading...' : 'Start 14-Day Free Trial'}</span>
              <ArrowRight className="w-4 h-4 stroke-[2.5]" />
            </button>

            <p className="text-center text-[11px] text-slate-400">
              {selectedPlan === 'annual' ? '$24.99/year' : '$2.99/month'} after 14-day trial • Cancel anytime with 1 tap
            </p>
          </div>

          {/* Trust Marks */}
          <div className="pt-2 border-t border-slate-100 flex items-center justify-center gap-4 text-[11px] text-slate-400 font-medium">
            <span className="flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              Secure Stripe billing
            </span>
            <span>•</span>
            <span>Instant activation</span>
          </div>
        </div>
      </div>
    </div>
  )
}
