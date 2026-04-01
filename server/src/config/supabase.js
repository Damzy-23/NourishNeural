const { createClient } = require('@supabase/supabase-js')

const supabaseUrl = process.env.SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY

// Debug logging
console.log('🔧 Supabase Config:')
console.log('   - SUPABASE_URL:', supabaseUrl ? `${supabaseUrl.substring(0, 30)}...` : 'NOT SET')
console.log('   - SUPABASE_SERVICE_KEY:', supabaseServiceKey ? 'SET (hidden)' : 'NOT SET')

if (!supabaseUrl || !supabaseServiceKey) {
  console.warn('⚠️  Supabase environment variables not set. Using mock database.')
}

// Data client — service role key, bypasses RLS. Used for all .from() queries.
let supabase = null
// Auth client — separate instance so auth.getUser() doesn't contaminate the data client's headers.
let supabaseAuth = null

try {
  if (supabaseUrl && supabaseServiceKey) {
    const clientOpts = {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    }
    supabase = createClient(supabaseUrl, supabaseServiceKey, clientOpts)
    supabaseAuth = createClient(supabaseUrl, supabaseServiceKey, clientOpts)
    console.log('✅ Supabase client created successfully')
  }
} catch (error) {
  console.error('❌ Failed to create Supabase client:', error.message)
}

module.exports = { supabase, supabaseAuth }
