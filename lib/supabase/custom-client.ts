type SupabaseAuthResponse = {
  access_token?: string
  refresh_token?: string
  user?: any
  error?: { message: string }
}

type SupabaseQueryResponse = {
  data?: any[]
  error?: { message: string }
  count?: number
}

class CustomSupabaseClient {
  private url: string
  private anonKey: string
  private accessToken: string | null = null
  private authListeners: Array<(event: string, session: any) => void> = []

  constructor(url: string, anonKey: string) {
    this.url = url
    this.anonKey = anonKey

    // Try to get token from localStorage if available
    if (typeof window !== "undefined") {
      this.accessToken = localStorage.getItem("supabase_access_token")
    }
  }

  private getHeaders(useAuth = true): HeadersInit {
    const headers: HeadersInit = {
      apikey: this.anonKey,
      "Content-Type": "application/json",
    }

    if (useAuth && this.accessToken) {
      headers["Authorization"] = `Bearer ${this.accessToken}`
    }

    return headers
  }

  // Auth methods
  auth = {
    signInWithPassword: async ({ email, password }: { email: string; password: string }) => {
      try {
        const response = await fetch(`${this.url}/auth/v1/token?grant_type=password`, {
          method: "POST",
          headers: this.getHeaders(false),
          body: JSON.stringify({ email, password }),
        })

        const data: SupabaseAuthResponse = await response.json()

        if (data.access_token && typeof window !== "undefined") {
          this.accessToken = data.access_token
          localStorage.setItem("supabase_access_token", data.access_token)
          if (data.refresh_token) {
            localStorage.setItem("supabase_refresh_token", data.refresh_token)
          }
        }

        this.notifyAuthListeners("SIGNED_IN", data)

        return { data, error: data.error || null }
      } catch (error) {
        return { data: null, error: { message: (error as Error).message } }
      }
    },

    signUp: async ({ email, password }: { email: string; password: string }) => {
      try {
        const response = await fetch(`${this.url}/auth/v1/signup`, {
          method: "POST",
          headers: this.getHeaders(false),
          body: JSON.stringify({ email, password }),
        })

        const data: SupabaseAuthResponse = await response.json()

        if (data.access_token && typeof window !== "undefined") {
          this.accessToken = data.access_token
          localStorage.setItem("supabase_access_token", data.access_token)
          if (data.refresh_token) {
            localStorage.setItem("supabase_refresh_token", data.refresh_token)
          }
        }

        this.notifyAuthListeners("SIGNED_UP", data)

        return { data, error: data.error || null }
      } catch (error) {
        return { data: null, error: { message: (error as Error).message } }
      }
    },

    signOut: async () => {
      try {
        await fetch(`${this.url}/auth/v1/logout`, {
          method: "POST",
          headers: this.getHeaders(),
        })

        if (typeof window !== "undefined") {
          localStorage.removeItem("supabase_access_token")
          localStorage.removeItem("supabase_refresh_token")
        }
        this.accessToken = null

        this.notifyAuthListeners("SIGNED_OUT", null)

        return { error: null }
      } catch (error) {
        return { error: { message: (error as Error).message } }
      }
    },

    getUser: async () => {
      try {
        const response = await fetch(`${this.url}/auth/v1/user`, {
          method: "GET",
          headers: this.getHeaders(),
        })

        const data = await response.json()
        return { data: { user: data }, error: null }
      } catch (error) {
        return { data: { user: null }, error: { message: (error as Error).message } }
      }
    },

    getSession: async () => {
      try {
        if (!this.accessToken) {
          return { data: { session: null }, error: null }
        }

        const response = await fetch(`${this.url}/auth/v1/user`, {
          method: "GET",
          headers: this.getHeaders(),
        })

        if (!response.ok) {
          return { data: { session: null }, error: null }
        }

        const user = await response.json()

        return {
          data: {
            session: {
              user,
              access_token: this.accessToken,
            },
          },
          error: null,
        }
      } catch (error) {
        return { data: { session: null }, error: { message: (error as Error).message } }
      }
    },

    onAuthStateChange: (callback: (event: string, session: any) => void) => {
      this.authListeners.push(callback)

      // Check initial session
      if (typeof window !== "undefined") {
        const token = localStorage.getItem("supabase_access_token")
        if (token) {
          this.accessToken = token
          this.auth.getSession().then(({ data }) => {
            if (data.session) {
              callback("SIGNED_IN", data.session)
            }
          })
        }
      }

      return {
        data: {
          subscription: {
            unsubscribe: () => {
              const index = this.authListeners.indexOf(callback)
              if (index > -1) {
                this.authListeners.splice(index, 1)
              }
            },
          },
        },
      }
    },
  }

  // Helper to notify auth listeners
  private notifyAuthListeners(event: string, session: any) {
    this.authListeners.forEach((listener) => {
      try {
        listener(event, session)
      } catch (error) {
        console.error("Error in auth listener:", error)
      }
    })
  }

  // Database methods
  from(table: string) {
    return {
      select: (columns = "*", options?: { count?: "exact" }) => {
        const selectQuery = {
          eq: async (column: string, value: any) => {
            try {
              const url = new URL(`${this.url}/rest/v1/${table}`)
              url.searchParams.set("select", columns)
              url.searchParams.set(column, `eq.${value}`)

              const headers = this.getHeaders()
              if (options?.count === "exact") {
                headers["Prefer"] = "count=exact"
              }

              const response = await fetch(url.toString(), {
                method: "GET",
                headers,
              })

              const data = await response.json()
              const count = response.headers.get("Content-Range")?.split("/")[1]

              return {
                data,
                error: null,
                count: count ? Number.parseInt(count) : null,
                single: async () => {
                  if (Array.isArray(data) && data.length > 0) {
                    return { data: data[0], error: null }
                  }
                  return { data: null, error: { message: "No rows found", code: "PGRST116" } }
                },
              }
            } catch (error) {
              return {
                data: null,
                error: { message: (error as Error).message },
                count: null,
                single: async () => ({ data: null, error: { message: (error as Error).message } }),
              }
            }
          },
        }

        // Return object with both direct call and eq method
        return Object.assign(async () => {
          try {
            const url = new URL(`${this.url}/rest/v1/${table}`)
            url.searchParams.set("select", columns)

            const headers = this.getHeaders()
            if (options?.count === "exact") {
              headers["Prefer"] = "count=exact"
            }

            const response = await fetch(url.toString(), {
              method: "GET",
              headers,
            })

            const data = await response.json()
            const count = response.headers.get("Content-Range")?.split("/")[1]

            return {
              data,
              error: null,
              count: count ? Number.parseInt(count) : null,
            }
          } catch (error) {
            return { data: null, error: { message: (error as Error).message }, count: null }
          }
        }, selectQuery)
      },

      insert: (values: any) => {
        return {
          select: () => {
            return {
              single: async () => {
                try {
                  const response = await fetch(`${this.url}/rest/v1/${table}`, {
                    method: "POST",
                    headers: {
                      ...this.getHeaders(),
                      Prefer: "return=representation",
                    },
                    body: JSON.stringify(values),
                  })

                  const data = await response.json()
                  if (Array.isArray(data) && data.length > 0) {
                    return { data: data[0], error: null }
                  }
                  return { data, error: null }
                } catch (error) {
                  return { data: null, error: { message: (error as Error).message } }
                }
              },
            }
          },
        }
      },

      update: (values: any) => {
        return {
          eq: (column: string, value: any) => {
            return {
              select: () => {
                return {
                  single: async () => {
                    try {
                      const response = await fetch(`${this.url}/rest/v1/${table}?${column}=eq.${value}`, {
                        method: "PATCH",
                        headers: {
                          ...this.getHeaders(),
                          Prefer: "return=representation",
                        },
                        body: JSON.stringify(values),
                      })

                      const data = await response.json()
                      if (Array.isArray(data) && data.length > 0) {
                        return { data: data[0], error: null }
                      }
                      return { data, error: null }
                    } catch (error) {
                      return { data: null, error: { message: (error as Error).message } }
                    }
                  },
                }
              },
            }
          },
        }
      },

      delete: () => {
        return {
          eq: async (column: string, value: any) => {
            try {
              const response = await fetch(`${this.url}/rest/v1/${table}?${column}=eq.${value}`, {
                method: "DELETE",
                headers: this.getHeaders(),
              })

              return { error: null }
            } catch (error) {
              return { error: { message: (error as Error).message } }
            }
          },
        }
      },
    }
  }
}

export function createCustomClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

  return new CustomSupabaseClient(supabaseUrl, supabaseAnonKey)
}
