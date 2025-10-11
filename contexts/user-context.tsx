"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"

interface User {
  id: string
  email?: string
  [key: string]: any
}

interface Profile {
  id: string
  nome: string
  email: string
  telefone?: string
  empresa?: string
  documento?: string
  endereco?: string
  role: "admin" | "operador" | "cliente"
  created_at: string
  updated_at: string
}

interface UserContextType {
  user: User | null
  profile: Profile | null
  loading: boolean
  refreshProfile: () => Promise<void>
  updateProfile: (updates: Partial<Profile>) => Promise<void>
  supabaseError: string | null
}

const UserContext = createContext<UserContextType | undefined>(undefined)

const DEFAULT_PROFILE: Profile = {
  id: "admin-default",
  nome: "Administrador",
  email: "admin@construloc.com",
  empresa: "ConstruLoc",
  role: "admin",
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
}

export function UserProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User>({ id: DEFAULT_PROFILE.id, email: DEFAULT_PROFILE.email })
  const [profile, setProfile] = useState<Profile>(DEFAULT_PROFILE)
  const [loading, setLoading] = useState(false)
  const [supabaseError, setSupabaseError] = useState<string | null>(null)

  useEffect(() => {
    const savedProfile = localStorage.getItem("construloc_profile")
    if (savedProfile) {
      try {
        const parsed = JSON.parse(savedProfile)
        setProfile(parsed)
        setUser({ id: parsed.id, email: parsed.email })
      } catch (error) {
        console.error("[v0] Error parsing saved profile:", error)
        // Usa o perfil padrão se houver erro
        localStorage.setItem("construloc_profile", JSON.stringify(DEFAULT_PROFILE))
      }
    } else {
      // Salva o perfil padrão no localStorage
      localStorage.setItem("construloc_profile", JSON.stringify(DEFAULT_PROFILE))
    }
  }, [])

  const refreshProfile = async () => {
    const savedProfile = localStorage.getItem("construloc_profile")
    if (savedProfile) {
      try {
        const parsed = JSON.parse(savedProfile)
        setProfile(parsed)
        setUser({ id: parsed.id, email: parsed.email })
      } catch (error) {
        console.error("[v0] Error refreshing profile:", error)
      }
    }
  }

  const updateProfile = async (updates: Partial<Profile>) => {
    const updatedProfile = {
      ...profile,
      ...updates,
      updated_at: new Date().toISOString(),
    }
    setProfile(updatedProfile)
    setUser({ id: updatedProfile.id, email: updatedProfile.email })
    localStorage.setItem("construloc_profile", JSON.stringify(updatedProfile))
  }

  return (
    <UserContext.Provider
      value={{
        user,
        profile,
        loading,
        refreshProfile,
        updateProfile,
        supabaseError,
      }}
    >
      {children}
    </UserContext.Provider>
  )
}

export function useUser() {
  const context = useContext(UserContext)
  if (context === undefined) {
    throw new Error("useUser must be used within a UserProvider")
  }
  return context
}
