import React, { useState } from 'react'
import {
  X,
  Users,
  Copy,
  Check,
  Share2,
  LogIn,
  RotateCcw,
  ShieldCheck,
} from 'lucide-react'
import { useShopping } from '../context/ShoppingContext'
import { useAuth } from '../firebase/AuthContext'

interface HouseholdModalProps {
  onClose: () => void
}

export const HouseholdModal: React.FC<HouseholdModalProps> = ({ onClose }) => {
  const { household, joinHouseholdByCode, createHousehold, resetToSampleData } = useShopping()
  const { user, signInWithGoogle, isConfigured } = useAuth()

  const [copiedLink, setCopiedLink] = useState(false)
  const [copiedCode, setCopiedCode] = useState(false)
  const [joinCodeInput, setJoinCodeInput] = useState('')
  const [newHouseholdName, setNewHouseholdName] = useState('')
  const [statusMessage, setStatusMessage] = useState<string | null>(null)

  const inviteUrl = `${window.location.origin}${window.location.pathname}?join=${household.inviteCode}`

  const handleCopyLink = () => {
    navigator.clipboard.writeText(inviteUrl)
    setCopiedLink(true)
    setTimeout(() => setCopiedLink(false), 2000)
  }

  const handleCopyCode = () => {
    navigator.clipboard.writeText(household.inviteCode)
    setCopiedCode(true)
    setTimeout(() => setCopiedCode(false), 2000)
  }

  const handleJoin = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!joinCodeInput.trim()) return
    const success = await joinHouseholdByCode(joinCodeInput)
    if (success) {
      setStatusMessage(`Joined household #${joinCodeInput.toUpperCase()}!`)
      setJoinCodeInput('')
      setTimeout(() => setStatusMessage(null), 3000)
    }
  }

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newHouseholdName.trim()) return
    const code = await createHousehold(newHouseholdName)
    setStatusMessage(`Created "${newHouseholdName}" (Code: ${code})!`)
    setNewHouseholdName('')
    setTimeout(() => setStatusMessage(null), 3000)
  }

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 z-50 animate-in fade-in">
      <div className="bg-white rounded-2xl max-w-lg w-full max-h-[92vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="px-5 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50/80">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-emerald-100 text-emerald-700">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-slate-900">Family & Household Sync</h2>
              <p className="text-xs text-slate-500">Collaborate with family members in real-time</p>
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
          {statusMessage && (
            <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs font-semibold text-emerald-800 flex items-center gap-2">
              <Check className="w-4 h-4 text-emerald-600" />
              <span>{statusMessage}</span>
            </div>
          )}

          {/* Active Household Box */}
          <div className="p-4 rounded-2xl bg-gradient-to-br from-emerald-50 to-teal-50 border border-emerald-200 space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-800">
                  Current Household
                </span>
                <h3 className="text-base font-extrabold text-slate-900">{household.name}</h3>
              </div>
              <div className="text-right">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                  Invite Code
                </span>
                <div className="font-mono text-base font-black text-emerald-700 tracking-wider">
                  #{household.inviteCode}
                </div>
              </div>
            </div>

            {/* Quick Actions: Share Link or Code */}
            <div className="pt-2 flex flex-col sm:flex-row gap-2">
              <button
                type="button"
                onClick={handleCopyLink}
                className="flex-1 py-2 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center justify-center gap-1.5 shadow-sm transition"
              >
                {copiedLink ? (
                  <>
                    <Check className="w-4 h-4" />
                    <span>Link Copied!</span>
                  </>
                ) : (
                  <>
                    <Share2 className="w-4 h-4" />
                    <span>Copy Family Invite Link</span>
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={handleCopyCode}
                className="py-2 px-3 rounded-xl bg-white border border-emerald-300 text-emerald-900 text-xs font-semibold hover:bg-emerald-50 flex items-center justify-center gap-1.5 transition"
              >
                {copiedCode ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                <span>Copy Code</span>
              </button>
            </div>

            <p className="text-[11px] text-emerald-800/80">
              Anyone with this link or code joins this shared grocery list instantly.
            </p>
          </div>

          {/* Google Auth Status Box */}
          <div className="p-4 rounded-xl border border-slate-200 bg-white space-y-2">
            <div className="flex items-center justify-between">
              <div className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                <span>Google Account Status</span>
              </div>
              <span className="text-[11px] text-slate-500">
                {isConfigured ? 'Firebase Auth' : 'Local / Demo Auth'}
              </span>
            </div>

            {user ? (
              <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                <div className="flex items-center gap-2.5 min-w-0">
                  {user.photoURL ? (
                    <img
                      src={user.photoURL}
                      alt={user.displayName || 'User'}
                      className="w-7 h-7 rounded-full"
                    />
                  ) : (
                    <div className="w-7 h-7 rounded-full bg-slate-800 text-white text-xs flex items-center justify-center font-bold">
                      {(user.displayName || user.email || 'U')[0].toUpperCase()}
                    </div>
                  )}
                  <div className="truncate">
                    <div className="text-xs font-bold text-slate-900 truncate">
                      {user.displayName || 'Google User'}
                    </div>
                    <div className="text-[11px] text-slate-500 truncate">{user.email}</div>
                  </div>
                </div>
                <span className="text-[10px] bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full font-bold">
                  Signed In
                </span>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => signInWithGoogle()}
                className="w-full py-2 px-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold flex items-center justify-center gap-2 transition shadow-xs"
              >
                <LogIn className="w-4 h-4" />
                <span>Sign in with Google</span>
              </button>
            )}
          </div>

          {/* Join Another Household Form */}
          <form
            onSubmit={handleJoin}
            className="p-4 rounded-xl border border-slate-200 bg-slate-50/70 space-y-3"
          >
            <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider">
              Join another family list
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Enter 6-character Code (e.g. HASH88)"
                value={joinCodeInput}
                onChange={(e) => setJoinCodeInput(e.target.value.toUpperCase())}
                className="flex-1 px-3 py-2 rounded-xl border border-slate-300 text-xs font-mono font-bold bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500 uppercase"
              />
              <button
                type="submit"
                disabled={!joinCodeInput.trim()}
                className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition disabled:opacity-50"
              >
                Join
              </button>
            </div>
          </form>

          {/* Create New Household Form */}
          <form
            onSubmit={handleCreate}
            className="p-4 rounded-xl border border-slate-200 bg-slate-50/70 space-y-3"
          >
            <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider">
              Create a new household list
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="e.g. Vacation Cabin List, Parents Home"
                value={newHouseholdName}
                onChange={(e) => setNewHouseholdName(e.target.value)}
                className="flex-1 px-3 py-2 rounded-xl border border-slate-300 text-xs bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
              <button
                type="submit"
                disabled={!newHouseholdName.trim()}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition disabled:opacity-50"
              >
                Create
              </button>
            </div>
          </form>

          {/* Reset Demo Data */}
          <div className="pt-2 border-t border-slate-200 flex items-center justify-between text-xs text-slate-500">
            <span>Want to restore default demo shops & items?</span>
            <button
              type="button"
              onClick={async () => {
                if (window.confirm('Reset this household list back to sample items and stores?')) {
                  await resetToSampleData()
                  setStatusMessage('Reset to sample data successfully!')
                }
              }}
              className="text-emerald-700 hover:text-emerald-900 font-bold flex items-center gap-1"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset Sample Data</span>
            </button>
          </div>
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
