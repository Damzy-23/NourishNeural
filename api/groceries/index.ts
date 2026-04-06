import type { VercelRequest, VercelResponse } from '@vercel/node'

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method === 'GET') {
    // Return mock grocery lists
    const lists = [
      {
        id: '1',
        name: 'Weekly Essentials',
        userId: 'user-1',
        items: [
          { id: '1', name: 'Milk', quantity: 2, unit: 'litres', category: 'Dairy', estimatedPrice: 2.50, isChecked: false },
          { id: '2', name: 'Bread', quantity: 1, unit: 'loaf', category: 'Bakery', estimatedPrice: 1.50, isChecked: true },
          { id: '3', name: 'Eggs', quantity: 12, unit: 'pieces', category: 'Dairy', estimatedPrice: 3.00, isChecked: false }
        ],
        status: 'active',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
    ]

    return res.status(200).json({ lists })
  }

  if (req.method === 'POST') {
    const listData = req.body

    const newList = {
      id: `list-${Date.now()}`,
      name: listData.name,
      userId: 'user-1',
      items: (listData.items || []).map((item: any, index: number) => ({
        id: `item-${index}`,
        ...item,
        isChecked: false
      })),
      status: 'active',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }

    return res.status(201).json(newList)
  }

  return res.status(405).json({ error: 'Method not allowed' })
}
