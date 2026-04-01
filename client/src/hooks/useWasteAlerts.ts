import { useQuery, useMutation, useQueryClient } from 'react-query'
import { apiService } from '../services/api'

export interface WasteAlert {
  id: string
  pantry_item_id: string | null
  item_name: string
  risk_level: 'high' | 'medium'
  waste_probability: number
  predicted_days_left: number
  alert_type: string
  suggestion: string | null
  is_read: boolean
  is_dismissed: boolean
  created_at: string
}

export function useWasteAlerts() {
  const queryClient = useQueryClient()

  const { data: alerts = [], isLoading } = useQuery<WasteAlert[]>(
    'waste-alerts',
    async () => {
      const res = await apiService.get('/api/waste/alerts') as any
      return res.data?.alerts || []
    },
    {
      refetchInterval: 5 * 60 * 1000, // every 5 minutes
      staleTime: 2 * 60 * 1000,
      retry: 1,
    }
  )

  const dismissMutation = useMutation(
    (alertId: string) => apiService.patch(`/api/waste/alerts/${alertId}/dismiss`),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('waste-alerts')
      },
    }
  )

  const scanMutation = useMutation(
    () => apiService.post('/api/waste/alerts/scan'),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('waste-alerts')
      },
    }
  )

  const unreadCount = alerts.filter((a) => !a.is_read && !a.is_dismissed).length
  const highRiskCount = alerts.filter((a) => a.risk_level === 'high' && !a.is_dismissed).length

  return {
    alerts,
    isLoading,
    unreadCount,
    highRiskCount,
    dismissAlert: dismissMutation.mutate,
    triggerScan: scanMutation.mutate,
    isScanning: scanMutation.isLoading,
  }
}
