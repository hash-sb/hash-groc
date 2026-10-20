import { initializeApp, getApps, type FirebaseApp } from 'firebase/app'
import { getAuth, type Auth } from 'firebase/auth'
import { getFirestore, type Firestore } from 'firebase/firestore'

// Local storage key for runtime config override (useful for fast setup without rebuilding)
const STORAGE_CONFIG_KEY = 'hash_groc_firebase_config'

export interface FirebaseConfigObject {
  apiKey: string
  authDomain: string
  projectId: string
  storageBucket?: string
  messagingSenderId?: string
  appId: string
}

export function getStoredFirebaseConfig(): FirebaseConfigObject | null {
  try {
    const raw = localStorage.getItem(STORAGE_CONFIG_KEY)
    if (raw) return JSON.parse(raw)
  } catch {
    // Ignore error
  }

  // Fallback to import.meta.env
  if (import.meta.env.VITE_FIREBASE_API_KEY && import.meta.env.VITE_FIREBASE_PROJECT_ID) {
    return {
      apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
      authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || `${import.meta.env.VITE_FIREBASE_PROJECT_ID}.firebaseapp.com`,
      projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
      storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
      messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
      appId: import.meta.env.VITE_FIREBASE_APP_ID || '',
    }
  }

  return null
}

export function saveFirebaseConfig(config: FirebaseConfigObject) {
  localStorage.setItem(STORAGE_CONFIG_KEY, JSON.stringify(config))
  window.location.reload()
}

export function clearFirebaseConfig() {
  localStorage.removeItem(STORAGE_CONFIG_KEY)
  window.location.reload()
}

const currentConfig = getStoredFirebaseConfig()
export const isConfigured = Boolean(currentConfig && currentConfig.apiKey && currentConfig.projectId)

let app: FirebaseApp | null = null
let auth: Auth | null = null
let db: Firestore | null = null

if (isConfigured && currentConfig) {
  try {
    app = getApps().length === 0 ? initializeApp(currentConfig) : getApps()[0]
    auth = getAuth(app)
    db = getFirestore(app)
  } catch (err) {
    console.error('Failed to initialize Firebase:', err)
  }
}

export { app, auth, db }
