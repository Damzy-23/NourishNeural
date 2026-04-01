import { useQuery } from 'react-query'
import { Leaf, TrendingDown, TrendingUp, Minus, Info } from 'lucide-react'
import { apiService } from '../services/api'
import { cn } from '../utils/cn'

interface CarbonStats {
  totalCo2Kg: number
  itemCount: number
  averageCo2PerItem: number
  rating: 'low' | 'medium' | 'high'
  topItems: { name: string; co2: number }[]
  breakdown: { category: string; co2: number }[]
}

export default function CarbonFootprintWidget() {
  const { data: stats, isLoading } = useQuery<CarbonStats>(
    'carbon-stats',
    async () => {
      const res = await apiService.get('/api/carbon/stats') as any
      return res.data
    },
    { staleTime: 10 * 60 * 1000, retry: 1 }
  )

  if (isLoading) {
    return (
      <div className="bg-white dark:bg-neutral-800 rounded-xl p-5 border border-neutral-200 dark:border-neutral-700 animate-pulse">
        <div className="h-4 bg-neutral-200 dark:bg-neutral-700 rounded w-32 mb-3" />
        <div className="h-8 bg-neutral-200 dark:bg-neutral-700 rounded w-20" />
      </div>
    )
  }

  if (!stats) return null

  const ratingConfig = {
    low: { color: 'text-green-600 dark:text-green-400', bg: 'bg-green-50 dark:bg-green-900/20', icon: TrendingDown, label: 'Low impact' },
    medium: { color: 'text-amber-600 dark:text-amber-400', bg: 'bg-amber-50 dark:bg-amber-900/20', icon: Minus, label: 'Moderate impact' },
    high: { color: 'text-red-600 dark:text-red-400', bg: 'bg-red-50 dark:bg-red-900/20', icon: TrendingUp, label: 'High impact' },
  }

  const cfg = ratingConfig[stats.rating] || ratingConfig.medium
  const TrendIcon = cfg.icon

  return (
    <div className={cn('rounded-xl p-5 border border-neutral-200 dark:border-neutral-700', cfg.bg)}>
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Leaf className={cn('w-5 h-5', cfg.color)} />
          <h3 className="text-sm font-semibold text-neutral-700 dark:text-neutral-300">Carbon Footprint</h3>
        </div>
        <div className={cn('flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full', cfg.color, cfg.bg)}>
          <TrendIcon className="w-3 h-3" />
          {cfg.label}
        </div>
      </div>

      <div className="flex items-baseline gap-1 mb-4">
        <span className={cn('text-3xl font-bold', cfg.color)}>
          {stats.totalCo2Kg.toFixed(1)}
        </span>
        <span className="text-sm text-neutral-500 dark:text-neutral-400">kg CO2e</span>
      </div>

      <div className="flex items-center gap-1 text-xs text-neutral-500 dark:text-neutral-400 mb-3">
        <Info className="w-3 h-3" />
        <span>From {stats.itemCount} pantry items this month</span>
      </div>

      {stats.topItems.length > 0 && (
        <div className="border-t border-neutral-200/50 dark:border-neutral-700/50 pt-3">
          <p className="text-xs font-medium text-neutral-500 dark:text-neutral-400 mb-2">Highest impact items</p>
          <div className="space-y-1.5">
            {stats.topItems.slice(0, 3).map((item, i) => (
              <div key={i} className="flex items-center justify-between text-sm">
                <span className="text-neutral-700 dark:text-neutral-300">{item.name}</span>
                <span className={cn('font-medium', item.co2 > 10 ? 'text-red-500' : item.co2 > 3 ? 'text-amber-500' : 'text-green-500')}>
                  {item.co2.toFixed(1)} kg
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
