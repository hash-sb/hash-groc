import React, { createContext, useContext, useEffect, useState } from 'react'
import {
  GoogleAuthProvider,
  signInWithPopup,
  signOut as fbSignOut,
  onAuthStateChanged,
  type User as FirebaseUser,
} from 'firebase/auth'
import { auth, isConfigured } from './config'

export interface AppUser {
  uid: string
  displayName: string | null
  email: string | null
  photoURL: string | null
  isDemo?: boolean
}

interface AuthContextType {
  user: AppUser | null
  loading: boolean
  isConfigured: boolean
  signInWithGoogle: () => Promise<void>
  signOut: () => Promise<void>
  demoSignIn: (name?: string, email?: string) => void
}

const LOCAL_USER_KEY = 'hash_groc_demo_user'

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AppUser | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (isConfigured && auth) {
      const unsubscribe = onAuthStateChanged(auth, (fbUser: FirebaseUser | null) => {
        if (fbUser) {
          setUser({
            uid: fbUser.uid,
            displayName: fbUser.displayName,
            email: fbUser.email,
            photoURL: fbUser.photoURL,
            isDemo: false,
          })
        } else {
          setUser(null)
        }
        setLoading(false)
      })
      return () => unsubscribe()
    } else {
      // Local demo mode fallback
      const savedUser = localStorage.getItem(LOCAL_USER_KEY)
      if (savedUser) {
        try {
          setUser(JSON.parse(savedUser))
        } catch {
          setUser(null)
        }
      } else {
        // Default demo family member so user can start testing instantly
        const defaultFamilyUser: AppUser = {
          uid: 'demo_user_1',
          displayName: 'Family Member',
          email: 'family@example.com',
          photoURL: null,
          isDemo: true,
        }
        setUser(defaultFamilyUser)
        localStorage.setItem(LOCAL_USER_KEY, JSON.stringify(defaultFamilyUser))
      }
      setLoading(false)
    }
  }, [])

  const signInWithGoogle = async () => {
    if (isConfigured && auth) {
      const provider = new GoogleAuthProvider()
      provider.setCustomParameters({ prompt: 'select_account' })
      await signInWithPopup(auth, provider)
    } else {
      // Simulate Google Sign In for testing without credentials
      demoSignIn('Amin (Demo Family)', 'amin@example.com')
    }
  }

  const demoSignIn = (name = 'Amin (Demo Family)', email = 'amin@example.com') => {
    const fakeUser: AppUser = {
      uid: 'demo_user_' + Math.random().toString(36).substring(2, 7),
      displayName: name,
      email: email,
      photoURL: `https://api.dicebear.com/7.x/bottts/svg?seed=${name}`,
      isDemo: true,
    }
    setUser(fakeUser)
    localStorage.setItem(LOCAL_USER_KEY, JSON.stringify(fakeUser))
  }

  const signOut = async () => {
    if (isConfigured && auth) {
      await fbSignOut(auth)
    } else {
      localStorage.removeItem(LOCAL_USER_KEY)
      setUser(null)
    }
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        isConfigured,
        signInWithGoogle,
        signOut,
        demoSignIn,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
