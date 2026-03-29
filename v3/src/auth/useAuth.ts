import { useContext } from 'react'
import { AuthContext } from './AuthContext'
import type { AuthContextValue } from './AuthContext'

export function useAuth(): AuthContextValue {
  return useContext(AuthContext)
}
