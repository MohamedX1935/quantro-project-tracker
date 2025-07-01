
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('Supabase environment variables are missing. Using fallback configuration.')
  // Fallback for development - replace with your actual Supabase URL and anon key
  const fallbackUrl = 'https://your-project.supabase.co'
  const fallbackKey = 'your-anon-key'
  export const supabase = createClient(fallbackUrl, fallbackKey)
} else {
  export const supabase = createClient(supabaseUrl, supabaseAnonKey)
}
