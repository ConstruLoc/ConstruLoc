"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"
import { createClient } from "@/lib/supabase/client"

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

export function UserProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(true)
  const [supabaseError, setSupabaseError] = useState<string | null>(null)
  const supabase = createClient()

  useEffect(() => {
    fetchUser()
  }, [])

  const fetchUser = async () => {
    try {
      setLoading(true)

      // Tenta buscar o ID do perfil do localStorage
      let profileId = localStorage.getItem("construloc_profile_id")

      if (profileId) {
        try {
          // Busca o perfil existente
          const { data: profileData, error: profileError } = await supabase
            .from("profiles")
            .select("*")
            .eq("id", profileId)
            .single()

          if (profileError) {
            console.error("Error fetching profile:", profileError)
            // Se o perfil não existe mais, remove do localStorage
            localStorage.removeItem("construloc_profile_id")
            profileId = null
          } else if (profileData) {
            setProfile(profileData)
            setUser({ id: profileData.id, email: profileData.email })
            setLoading(false)
            return
          }
        } catch (fetchError) {
          console.error("Error fetching profile:", fetchError)
          localStorage.removeItem("construloc_profile_id")
          profileId = null
        }
      }

      try {
        const { data: existingProfiles, error: fetchError } = await supabase
          .from("profiles")
          .select("*")
          .limit(1)
          .single()

        if (fetchError && fetchError.code !== "PGRST116") {
          console.error("Error fetching profiles:", fetchError)
        }

        if (existingProfiles) {
          // Usa o primeiro perfil encontrado
          setProfile(existingProfiles)
          setUser({ id: existingProfiles.id, email: existingProfiles.email })
          localStorage.setItem("construloc_profile_id", existingProfiles.id)
          setLoading(false)
          return
        }
      } catch (fetchError) {
        console.error("Error fetching existing profiles:", fetchError)
      }

      try {
        const newProfile = {
          email: "admin@construloc.com",
          nome: "Administrador",
          empresa: "ConstruLoc",
          role: "admin" as const,
        }

        const { data: createdProfile, error: createError } = await supabase
          .from("profiles")
          .insert(newProfile)
          .select()
          .single()

        if (createError) {
          console.error("Error creating profile:", createError)
          setSupabaseError(createError.message)
        } else if (createdProfile) {
          setProfile(createdProfile)
          setUser({ id: createdProfile.id, email: createdProfile.email })
          localStorage.setItem("construloc_profile_id", createdProfile.id)
        }
      } catch (createError: any) {
        console.error("Error creating new profile:", createError)
        setSupabaseError(createError.message)
      }
    } catch (error: any) {
      console.error("Error in fetchUser:", error)
      setSupabaseError(error.message)
      setProfile({
        id: "default",
        nome: "Administrador",
        email: "admin@construloc.com",
        role: "admin",
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      setUser({ id: "default", email: "admin@construloc.com" })
    } finally {
      setLoading(false)
    }
  }

  const refreshProfile = async () => {
    await fetchUser()
  }

  const updateProfile = async (updates: Partial<Profile>) => {
    if (!profile) {
      throw new Error("No profile loaded")
    }

    try {
      const { data, error } = await supabase.from("profiles").update(updates).eq("id", profile.id).select().single()

      if (error) {
        throw error
      }

      setProfile(data)
    } catch (error: any) {
      console.error("Error updating profile:", error)
      throw error
    }
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
