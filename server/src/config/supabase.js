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

// Server-side client with service role key for admin operations
let supabase = null
try {
  if (supabaseUrl && supabaseServiceKey) {
    supabase = createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    })
    console.log('✅ Supabase client created successfully')
  }
} catch (error) {
  console.error('❌ Failed to create Supabase client:', error.message)
}

module.exports = { supabase }
