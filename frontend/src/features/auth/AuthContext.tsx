import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'
import { api, setAuthToken, setUnauthorizedHandler } from '@/api/client'
import type { AppUserResponse } from '@/api/types'

const TOKEN_STORAGE_KEY = 'greenthumb.authToken'

interface AuthContextValue {
  user: AppUserResponse | null
  isLoading: boolean
  login: (token: string, user: AppUserResponse) => void
  logout: () => void
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AppUserResponse | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  const logout = () => {
    localStorage.removeItem(TOKEN_STORAGE_KEY)
    setAuthToken(null)
    setUser(null)
  }

  const login = (token: string, nextUser: AppUserResponse) => {
    localStorage.setItem(TOKEN_STORAGE_KEY, token)
    setAuthToken(token)
    setUser(nextUser)
  }

  useEffect(() => {
    setUnauthorizedHandler(logout)
    return () => setUnauthorizedHandler(null)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    const storedToken = localStorage.getItem(TOKEN_STORAGE_KEY)
    if (!storedToken) {
      setIsLoading(false)
      return
    }

    setAuthToken(storedToken)
    api
      .get<AppUserResponse>('/api/v1/me')
      .then((me) => setUser(me))
      .catch(() => logout())
      .finally(() => setIsLoading(false))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return <AuthContext.Provider value={{ user, isLoading, login, logout }}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
