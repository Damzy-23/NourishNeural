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
    const { data: { user }, error: authError } = await supabase.auth.getUser(token)

    if (authError || !user) {
      return res.status(401).json({ error: 'Invalid token' })
    }

    if (req.method === 'GET') {
      const { data: preferences, error } = await supabase
        .from('user_preferences')
        .select('*')
        .eq('user_id', user.id)
        .single()

      if (error) {
        // Return default preferences if not found
        return res.status(200).json({
          preferences: {
            id: null,
            userId: user.id,
            dietaryRestrictions: [],
            budgetLimit: 100,
            householdSize: 1,
            preferredStores: [],
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          }
        })
      }

      return res.status(200).json({ preferences })
    }

    return res.status(405).json({ error: 'Method not allowed' })
  } catch (error: any) {
    console.error('Preferences error:', error)
    return res.status(500).json({ error: 'Internal server error' })
  }
}
