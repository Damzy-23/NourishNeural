import { createClient } from '@supabase/supabase-js'
import type { VercelRequest, VercelResponse } from '@vercel/node'

const supabase = createClient(
  process.env.VITE_SUPABASE_URL!,
  process.env.VITE_SUPABASE_ANON_KEY!
)

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const authHeader = req.headers.authorization
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'No token provided' })
  }

  const token = authHeader.split(' ')[1]

  try {
    // Verify the token with Supabase
    const { data: { user }, error: authError } = await supabase.auth.getUser(token)

    if (authError || !user) {
      return res.status(401).json({ error: 'Invalid token' })
    }

    // Get user profile
    const { data: profile } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('id', user.id)
      .single()

    const userData = {
      id: user.id,
      email: user.email,
      firstName: profile?.first_name || user.user_metadata?.first_name || '',
      lastName: profile?.last_name || user.user_metadata?.last_name || '',
      age: profile?.age || user.user_metadata?.age,
      phone: profile?.phone || null,
      address: profile?.address || null,
      city: profile?.city || null,
      postalCode: profile?.postal_code || null,
      country: profile?.country || null,
      avatarUrl: profile?.avatar_url || null,
      isVerified: user.email_confirmed_at != null,
      role: user.role || 'authenticated',
      createdAt: user.created_at,
      updatedAt: profile?.updated_at || user.updated_at
    }

    return res.status(200).json(userData)
  } catch (error: any) {
    console.error('Auth me error:', error)
    return res.status(500).json({ error: 'Internal server error' })
  }
}
