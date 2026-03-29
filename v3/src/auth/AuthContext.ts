import { createContext } from 'react'
import type { AuthUser } from './types'

export interface AuthContextValue {
  user: AuthUser | null
  loading: boolean
  signInWithGitHub: () => Promise<void>
  signInWithGoogle: () => Promise<void>
  signOut: () => Promise<void>
}

export const AuthContext = createContext<AuthContextValue>({
  user: null,
  loading: true,
  signInWithGitHub: async () => {},
  signInWithGoogle: async () => {},
  signOut: async () => {},
})
