"use client"

import { createContext, useContext, useEffect, useState, type ReactNode } from "react"
import { AuthService, type AuthState } from "@/lib/auth"

interface AuthContextType extends AuthState {
  login: (username: string, password: string) => Promise<{ success: boolean; error?: string }>
  signup: (username: string, password: string) => Promise<{ success: boolean; error?: string }>
  logout: () => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    isAuthenticated: false,
  })

  useEffect(() => {
    // Check for existing user on mount
    const currentUser = AuthService.getCurrentUser()
    if (currentUser) {
      setAuthState({
        user: currentUser,
        isAuthenticated: true,
      })
    }
  }, [])

  const login = async (username: string, password: string) => {
    const result = AuthService.login(username, password)

    if (result.success) {
      const user = AuthService.getCurrentUser()
      setAuthState({
        user,
        isAuthenticated: true,
      })
    }

    return result
  }

  const signup = async (username: string, password: string) => {
    const result = AuthService.signup(username, password)

    if (result.success) {
      const user = AuthService.getCurrentUser()
      setAuthState({
        user,
        isAuthenticated: true,
      })
    }

    return result
  }

  const logout = () => {
    AuthService.logout()
    setAuthState({
      user: null,
      isAuthenticated: false,
    })
  }

  return (
    <AuthContext.Provider
      value={{
        ...authState,
        login,
        signup,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
