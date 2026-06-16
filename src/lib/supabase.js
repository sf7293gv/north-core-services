import { createClient } from '@supabase/supabase-js'

// Fall back to placeholder values so the module doesn't throw at load time
// when .env.local credentials are not yet set. API calls will fail with
// network errors until real values are added to .env.local.
const supabaseUrl     = import.meta.env.VITE_SUPABASE_URL     || 'http://localhost:54321'
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'placeholder-anon-key'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
