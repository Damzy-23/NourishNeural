import type { VercelRequest, VercelResponse } from '@vercel/node'

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const recommendations = [
    {
      id: '1',
      type: 'expiry',
      title: 'Items expiring soon',
      description: '3 items in your pantry are expiring within the next 3 days',
      action: 'View items',
      link: '/app/pantry',
      priority: 'high'
    },
    {
      id: '2',
      type: 'recipe',
      title: 'Try a new recipe',
      description: 'Based on your pantry, you can make Pasta Primavera',
      action: 'View recipe',
      link: '/app/ai-assistant',
      priority: 'medium'
    }
  ]

  return res.status(200).json({ recommendations })
}
