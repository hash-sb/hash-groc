import React, { useState } from 'react'
import {
  X,
  Cloud,
  CheckCircle2,
  AlertCircle,
  Save,
  RotateCcw,
  ExternalLink,
} from 'lucide-react'
import {
  getStoredFirebaseConfig,
  saveFirebaseConfig,
  clearFirebaseConfig,
  isConfigured,
  type FirebaseConfigObject,
} from '../firebase/config'

interface FirebaseConfigModalProps {
  onClose: () => void
}

export const FirebaseConfigModal: React.FC<FirebaseConfigModalProps> = ({ onClose }) => {
  const current = getStoredFirebaseConfig()
  const [apiKey, setApiKey] = useState(current?.apiKey || '')
  const [authDomain, setAuthDomain] = useState(current?.authDomain || '')
  const [projectId, setProjectId] = useState(current?.projectId || '')
  const [appId, setAppId] = useState(current?.appId || '')
  const [jsonInput, setJsonInput] = useState('')
  const [showJsonMode, setShowJsonMode] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleParseJson = () => {
    try {
      setError(null)
      // Extract JS object or JSON
      const cleaned = jsonInput
        .replace(/const firebaseConfig = /g, '')
        .replace(/;/g, '')
        .trim()

      const parsed = JSON.parse(cleaned)
      if (parsed.apiKey) setApiKey(parsed.apiKey)
      if (parsed.authDomain) setAuthDomain(parsed.authDomain)
      if (parsed.projectId) setProjectId(parsed.projectId)
      if (parsed.appId) setAppId(parsed.appId)
      setShowJsonMode(false)
    } catch {
      setError('Could not parse JSON. Please check formatting or fill fields manually.')
    }
  }

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault()
    if (!apiKey.trim() || !projectId.trim()) {
      setError('API Key and Project ID are required.')
      return
    }

    const config: FirebaseConfigObject = {
      apiKey: apiKey.trim(),
      authDomain: authDomain.trim() || `${projectId.trim()}.firebaseapp.com`,
      projectId: projectId.trim(),
      appId: appId.trim(),
    }

    saveFirebaseConfig(config)
  }

  const handleClear = () => {
    if (window.confirm('Reset to Local / Demo mode?')) {
      clearFirebaseConfig()
    }
  }

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 z-50 animate-in fade-in">
      <div className="bg-white rounded-2xl max-w-lg w-full max-h-[92vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="px-5 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50/80">
          <div className="flex items-center gap-2">
            <div
              className={`p-2 rounded-xl ${
                isConfigured
                  ? 'bg-emerald-100 text-emerald-700'
                  : 'bg-amber-100 text-amber-800'
              }`}
            >
              <Cloud className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-slate-900">
                Cloud Sync & Google Auth Setup
              </h2>
              <p className="text-xs text-slate-500">Firebase configuration for real-time family sharing</p>
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
        <div className="flex-1 overflow-y-auto p-5 space-y-5">
          {/* Status Badge */}
          <div
            className={`p-4 rounded-xl border flex items-start gap-3 ${
              isConfigured
                ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
                : 'bg-amber-50 border-amber-200 text-amber-900'
            }`}
          >
            {isConfigured ? (
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
            ) : (
              <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
            )}
            <div className="text-xs space-y-1">
              <div className="font-bold">
                {isConfigured ? 'Firebase Cloud is Connected' : 'Running in Local / Demo Mode'}
              </div>
              <div className="text-[11px] leading-relaxed">
                {isConfigured
                  ? `Your app is syncing in real-time with Firestore project "${projectId}". Changes sync instantly across all family devices.`
                  : 'Currently storing items locally in your browser with full features. To enable real-time sync across family phones & Google Sign-In, provide your Firebase config below.'}
              </div>
            </div>
          </div>

          {error && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700 font-semibold">
              {error}
            </div>
          )}

          {/* Quick Paste JSON toggle */}
          <div className="flex items-center justify-between text-xs">
            <span className="font-bold text-slate-700 uppercase tracking-wider">
              Firebase Credentials
            </span>
            <button
              type="button"
              onClick={() => setShowJsonMode(!showJsonMode)}
              className="text-emerald-700 hover:text-emerald-900 font-semibold underline"
            >
              {showJsonMode ? 'Switch to Form Fields' : 'Paste firebaseConfig object'}
            </button>
          </div>

          {showJsonMode ? (
            <div className="space-y-2">
              <textarea
                rows={5}
                placeholder={`const firebaseConfig = {\n  apiKey: "AIza...",\n  authDomain: "...",\n  projectId: "...",\n  appId: "..."\n};`}
                value={jsonInput}
                onChange={(e) => setJsonInput(e.target.value)}
                className="w-full p-2.5 rounded-xl border border-slate-300 font-mono text-xs bg-slate-50 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
              <button
                type="button"
                onClick={handleParseJson}
                className="px-4 py-1.5 bg-slate-900 text-white rounded-lg text-xs font-bold"
              >
                Parse & Fill Form
              </button>
            </div>
          ) : (
            <form onSubmit={handleSave} className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  apiKey *
                </label>
                <input
                  type="text"
                  required
                  placeholder="AIzaSy..."
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-mono bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  projectId *
                </label>
                <input
                  type="text"
                  required
                  placeholder="my-grocery-app-123"
                  value={projectId}
                  onChange={(e) => setProjectId(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-mono bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  authDomain (optional)
                </label>
                <input
                  type="text"
                  placeholder={`${projectId || 'project'}.firebaseapp.com`}
                  value={authDomain}
                  onChange={(e) => setAuthDomain(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-mono bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  appId (optional)
                </label>
                <input
                  type="text"
                  placeholder="1:123456789:web:abcdef..."
                  value={appId}
                  onChange={(e) => setAppId(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-mono bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div className="pt-2 flex items-center justify-between">
                {isConfigured ? (
                  <button
                    type="button"
                    onClick={handleClear}
                    className="text-xs text-rose-600 hover:text-rose-800 font-bold flex items-center gap-1"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>Switch to Local Mode</span>
                  </button>
                ) : (
                  <div />
                )}

                <button
                  type="submit"
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-sm transition flex items-center gap-1.5"
                >
                  <Save className="w-4 h-4" />
                  <span>Save & Connect</span>
                </button>
              </div>
            </form>
          )}

          {/* Quick Setup Instructions */}
          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-600 space-y-1.5">
            <div className="font-bold text-slate-800">Quick Firebase Setup (Free Tier):</div>
            <ol className="list-decimal list-inside space-y-1 text-[11px] text-slate-600">
              <li>
                Create a free project at{' '}
                <a
                  href="https://console.firebase.google.com"
                  target="_blank"
                  rel="noreferrer"
                  className="text-emerald-700 underline font-semibold inline-flex items-center gap-0.5"
                >
                  Firebase Console <ExternalLink className="w-2.5 h-2.5" />
                </a>
              </li>
              <li>Under <strong>Authentication</strong>, enable the <strong>Google</strong> sign-in provider.</li>
              <li>Under <strong>Firestore Database</strong>, create a database in production or test mode.</li>
              <li>In Project Settings, register a Web App and copy the config object here.</li>
            </ol>
          </div>
        </div>

        {/* Footer */}
        <div className="px-5 py-3 border-t border-slate-200 bg-slate-50/80 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-slate-800 text-white text-xs font-bold hover:bg-slate-700 transition"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  )
}
