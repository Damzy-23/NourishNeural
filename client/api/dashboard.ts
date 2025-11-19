import type { VercelRequest, VercelResponse } from '@vercel/node'

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  // Return mock dashboard data for now
  const stats = {
    groceryLists: {
      total: 3,
      active: 2,
      completed: 1,
      itemsCount: 15
    },
    pantry: {
      totalItems: 24,
      totalValue: 85.50,
      expiringSoon: 3,
      lowStock: 2,
      categories: {
        'Dairy': 5,
        'Vegetables': 8,
        'Fruits': 4,
        'Meat': 3,
        'Pantry': 4
      }
    },
    spending: {
      thisMonth: 245.80,
      lastMonth: 280.50,
      saved: 34.70,
      budget: 300,
      trend: 'down'
    },
    activity: {
      recentLists: [],
      recentPantryItems: [],
      completedTasks: 5
    }
  }

  return res.status(200).json({ stats })
}
