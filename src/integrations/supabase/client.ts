
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

let supabaseClient;

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('Supabase environment variables are missing. Using fallback configuration.')
  // Fallback for development - replace with your actual Supabase URL and anon key
  const fallbackUrl = 'https://your-project.supabase.co'
  const fallbackKey = 'your-anon-key'
  supabaseClient = createClient(fallbackUrl, fallbackKey)
} else {
  supabaseClient = createClient(supabaseUrl, supabaseAnonKey)
}

export const supabase = supabaseClient
