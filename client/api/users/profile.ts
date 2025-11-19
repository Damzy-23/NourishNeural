import { createClient } from '@supabase/supabase-js'
import type { VercelRequest, VercelResponse } from '@vercel/node'

const supabase = createClient(
  process.env.VITE_SUPABASE_URL!,
  process.env.VITE_SUPABASE_ANON_KEY!
)

export default async function handler(req: VercelRequest, res: VercelResponse) {
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

    if (req.method === 'GET') {
      // Get user profile
      const { data: profile, error } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('id', user.id)
        .single()

      if (error) {
        return res.status(404).json({ error: 'Profile not found' })
      }

      return res.status(200).json(profile)
    }

    if (req.method === 'PUT') {
      const updateData = req.body

      // Update profile
      const { data: profile, error } = await supabase
        .from('user_profiles')
        .update({
          first_name: updateData.firstName,
          last_name: updateData.lastName,
          age: updateData.age,
          phone: updateData.phone,
          address: updateData.address,
          city: updateData.city,
          postal_code: updateData.postalCode,
          country: updateData.country,
          avatar_url: updateData.avatarUrl,
          updated_at: new Date().toISOString()
        })
        .eq('id', user.id)
        .select()
        .single()

      if (error) {
        console.error('Profile update error:', error)
        return res.status(500).json({ error: 'Failed to update profile' })
      }

      // Return formatted response
      const userData = {
        id: user.id,
        email: user.email,
        firstName: profile.first_name,
        lastName: profile.last_name,
        age: profile.age,
        phone: profile.phone,
        address: profile.address,
        city: profile.city,
        postalCode: profile.postal_code,
        country: profile.country,
        avatarUrl: profile.avatar_url,
        isVerified: user.email_confirmed_at != null,
        role: user.role || 'authenticated',
        createdAt: user.created_at,
        updatedAt: profile.updated_at
      }

      return res.status(200).json({ user: userData })
    }

    return res.status(405).json({ error: 'Method not allowed' })
  } catch (error: any) {
    console.error('Profile error:', error)
    return res.status(500).json({ error: 'Internal server error' })
  }
}
