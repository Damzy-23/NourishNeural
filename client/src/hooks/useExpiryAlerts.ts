import { useEffect, useRef } from 'react'
import { apiService } from '../services/api'
import { useAuth } from './useAuth'

interface PantryItem {
  name: string
  expiry_date: string | null
}

export function useExpiryAlerts() {
  const { user } = useAuth()
  const hasChecked = useRef(false)

  useEffect(() => {
    if (!user || hasChecked.current) return
    hasChecked.current = true

    // Don't bother if notifications aren't supported or denied
    if (!('Notification' in window) || Notification.permission === 'denied') return

    checkExpiring()
  }, [user])

  async function checkExpiring() {
    try {
      // Request permission if not yet granted
      if (Notification.permission === 'default') {
        const result = await Notification.requestPermission()
        if (result !== 'granted') return
      }

      // Fetch pantry items
      const data: any = await apiService.get('/api/pantry')
      const items: PantryItem[] = data?.items || []

      const now = new Date()
      const expiring = items.filter(item => {
        if (!item.expiry_date) return false
        const daysLeft = (new Date(item.expiry_date).getTime() - now.getTime()) / 86400000
        return daysLeft >= 0 && daysLeft <= 2
      })

      if (expiring.length === 0) return

      const names = expiring.slice(0, 3).map(i => i.name).join(', ')
      const more = expiring.length > 3 ? ` and ${expiring.length - 3} more` : ''

      new Notification('Items expiring soon', {
        body: `${names}${more} — use them up or freeze them`,
        icon: '/icons/icon-192.png',
        tag: 'expiry-alert', // prevents duplicate notifications
        silent: false
      })
    } catch {
      // Silently fail — this is a best-effort feature
    }
  }
}
