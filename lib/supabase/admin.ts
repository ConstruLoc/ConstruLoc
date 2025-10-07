import { createClient } from "@supabase/supabase-js"

export function createAdminClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://kxrwibjymytjihvhsbtq.supabase.co"
  const supabaseServiceKey =
    process.env.SUPABASE_SERVICE_ROLE_KEY ||
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imt4cndpYmp5bXl0amlodmhzYnRxIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1ODU4NDQ5NiwiZXhwIjoyMDc0MTYwNDk2fQ.rqRq5yslQkVMMVyFPrOUfXn_QYFyULfsx_G8yd-7F5Y"

  if (!supabaseUrl || !supabaseServiceKey) {
    throw new Error(
      "Missing Supabase admin environment variables. Please check that NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are set.",
    )
  }

  return createClient(supabaseUrl, supabaseServiceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  })
}
