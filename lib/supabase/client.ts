import { createBrowserClient } from "@supabase/ssr"

export function createClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://kxrwibjymytjihvhsbtq.supabase.co"
  const supabaseAnonKey =
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imt4cndpYmp5bXl0amlodmhzYnRxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTg1ODQ0OTYsImV4cCI6MjA3NDE2MDQ5Nn0.LdA-4HbABxyqVM2UHWP6Q6FhiDABgxeYqmCu89qadpg"

  return createBrowserClient(supabaseUrl, supabaseAnonKey)
}
