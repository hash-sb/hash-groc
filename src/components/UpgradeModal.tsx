import React, { useState } from 'react'
import {
  Sparkles,
  Check,
  X,
  ShieldCheck,
  Users,
  Store,
  ArrowRight,
  TrendingUp,
} from 'lucide-react'

export type UpgradeTrigger = 'household' | 'store_limit' | 'general'

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
  const [selectedPlan, setSelectedPlan] = useState<'annual' | 'monthly'>('annual')
  const [isLoading, setIsLoading] = useState(false)

  if (!isOpen) return null

  const details = TRIGGER_DETAILS[trigger] || TRIGGER_DETAILS.general

  const handleStartTrial = async () => {
    setIsLoading(true)
    if (onSelectPlan) {
      await onSelectPlan(selectedPlan)
    } else {
      // Demo fallback when payment provider isn't wired yet
      window.alert(
        `Groc Plus trial initiated for the ${selectedPlan.toUpperCase()} plan ($${
          selectedPlan === 'annual' ? '24.99/year' : '2.99/month'
        })! Stripe integration can be connected here.`
      )
      onClose()
    }
    setIsLoading(false)
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose()
      }}
    >
      <div
        className="relative bg-white rounded-3xl w-full max-w-md shadow-2xl flex flex-col overflow-hidden border border-slate-200 animate-in zoom-in-95 duration-150"
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
