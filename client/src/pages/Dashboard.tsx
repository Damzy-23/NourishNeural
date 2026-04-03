import { useState } from 'react'
import { Helmet } from 'react-helmet-async'
import { useQuery } from 'react-query'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  BarChart3,
  ShoppingCart,
  Package,
  Plus,
  AlertTriangle,
  Clock,
  Zap,
  Heart,
  DollarSign,
  MapPin,
  CheckCircle,
  Target,
  Search,
  Activity,
  Sparkles,
  TrendingDown,
  TrendingUp,
  Minus,
  Trash2,
  ArrowRight
} from 'lucide-react'
import { apiService } from '../services/api'
import { useAuth } from '../hooks/useAuth'
import SmartFoodClassifier from '../components/SmartFoodClassifier'
import SustainabilityWidget from '../components/SustainabilityWidget'
import { fadeUp, staggerContainer } from '../utils/motion'
import { cn } from '../utils/cn'

const MotionLink = motion(Link)

interface DashboardStats {
  groceryLists: {
    total: number
    active: number
    completed: number
    itemsCount: number
  }
  pantry: {
    totalItems: number
    totalValue: number
    expiringSoon: number
    lowStock: number
    categories: { [key: string]: number }
  }
  spending: {
    thisMonth: number
    lastMonth: number
    saved: number
    budget: number
    trend: 'up' | 'down' | 'stable'
  }
  activity: {
    recentLists: any[]
    recentPantryItems: any[]
    completedTasks: number
  }
}

interface QuickAction {
  id: string
  title: string
  subtitle: string
  icon: any
  color: string
  iconBg: string
  link: string
}

const quickActions: QuickAction[] = [
  {
    id: 'new-list',
    title: 'New List',
    subtitle: 'Grocery list',
    icon: Plus,
    color: 'text-blue-600 dark:text-blue-400',
    iconBg: 'bg-blue-50 dark:bg-blue-900/20',
    link: '/app/grocery-lists'
  },
  {
    id: 'add-pantry',
    title: 'Add Item',
    subtitle: 'Track food',
    icon: Package,
    color: 'text-primary-600 dark:text-primary-400',
    iconBg: 'bg-primary-50 dark:bg-primary-900/20',
    link: '/app/pantry'
  },
  {
    id: 'find-stores',
    title: 'Stores',
    subtitle: 'Nearby shops',
    icon: MapPin,
    color: 'text-accent-600 dark:text-accent-400',
    iconBg: 'bg-accent-50 dark:bg-accent-900/20',
    link: '/app/stores'
  },
  {
    id: 'ai-chat',
    title: 'Nurexa',
    subtitle: 'AI assistant',
    icon: Zap,
    color: 'text-amber-600 dark:text-amber-400',
    iconBg: 'bg-amber-50 dark:bg-amber-900/20',
    link: '/app/ai-assistant'
  }
]

function WasteAnalyticsSection() {
  const { user } = useAuth()

  const { data: wasteStats } = useQuery(
    ['waste-stats'],
    () => apiService.get('/api/waste/stats?timeRange=month'),
    { enabled: !!user }
  )

  const { data: wasteForecast } = useQuery(
    ['waste-forecast'],
    () => apiService.post('/api/waste/forecast', {}),
    { enabled: !!user }
  )

  const stats = wasteStats as any
  const forecast = wasteForecast as any

  const trendIcon = forecast?.trend === 'improving'
    ? TrendingDown
    : forecast?.trend === 'worsening'
      ? TrendingUp
      : Minus

  const trendColor = forecast?.trend === 'improving'
    ? 'text-green-600 dark:text-green-400'
    : forecast?.trend === 'worsening'
      ? 'text-red-600 dark:text-red-400'
      : 'text-neutral-500 dark:text-neutral-400'

  const trendLabel = forecast?.trend === 'improving'
    ? 'Improving'
    : forecast?.trend === 'worsening'
      ? 'Needs attention'
      : forecast?.trend === 'insufficient_data'
        ? 'Not enough data'
        : 'Stable'

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3 }}
      className="card overflow-hidden"
    >
      <div className="border-l-4 border-l-accent-500 p-5">
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-accent-50 dark:bg-accent-900/20 flex items-center justify-center">
              <Trash2 className="w-5 h-5 text-accent-600 dark:text-accent-400" />
            </div>
            <div>
              <h2 className="text-lg font-display text-neutral-900 dark:text-neutral-100">Food Waste Tracker</h2>
              <p className="text-xs text-neutral-500 dark:text-neutral-400">This month's overview</p>
            </div>
          </div>
          {forecast?.trend && forecast.trend !== 'insufficient_data' && (
            <div className={cn('flex items-center gap-1.5 px-3 py-1 rounded-full bg-neutral-50 dark:bg-neutral-700/50', trendColor)}>
              {(() => { const Icon = trendIcon; return <Icon className="w-3.5 h-3.5" /> })()}
              <span className="text-xs font-semibold">{trendLabel}</span>
            </div>
          )}
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <div className="p-3 rounded-xl bg-red-50 dark:bg-red-900/10 border border-red-100 dark:border-red-800/30">
            <p className="text-[11px] font-medium text-neutral-500 dark:text-neutral-400 uppercase tracking-wider mb-1">Items Wasted</p>
            <p className="text-2xl font-display text-neutral-900 dark:text-neutral-100">{stats?.summary?.totalItems || 0}</p>
          </div>
          <div className="p-3 rounded-xl bg-orange-50 dark:bg-orange-900/10 border border-orange-100 dark:border-orange-800/30">
            <p className="text-[11px] font-medium text-neutral-500 dark:text-neutral-400 uppercase tracking-wider mb-1">Money Lost</p>
            <p className="text-2xl font-display text-neutral-900 dark:text-neutral-100">
              £{(stats?.summary?.totalLoss || 0).toFixed(2)}
            </p>
          </div>
          <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-900/10 border border-amber-100 dark:border-amber-800/30">
            <p className="text-[11px] font-medium text-neutral-500 dark:text-neutral-400 uppercase tracking-wider mb-1">Top Wasted</p>
            <p className="text-sm font-semibold text-neutral-900 dark:text-neutral-100 truncate">
              {stats?.summary?.mostWastedCategory || 'N/A'}
            </p>
          </div>
          <div className="p-3 rounded-xl bg-blue-50 dark:bg-blue-900/10 border border-blue-100 dark:border-blue-800/30">
            <p className="text-[11px] font-medium text-neutral-500 dark:text-neutral-400 uppercase tracking-wider mb-1">Main Reason</p>
            <p className="text-sm font-semibold text-neutral-900 dark:text-neutral-100 capitalize truncate">
              {stats?.summary?.mostCommonReason || 'N/A'}
            </p>
          </div>
        </div>

        {/* AI Insight */}
        {forecast?.insight && forecast.trend !== 'insufficient_data' && (
          <div className="mt-4 p-3 rounded-xl bg-primary-50/50 dark:bg-primary-900/10 border border-primary-100 dark:border-primary-800/30">
            <div className="flex items-start gap-2">
              <Sparkles className="w-4 h-4 text-primary-500 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-sm text-neutral-700 dark:text-neutral-300">{forecast.insight}</p>
                {forecast?.tips && forecast.tips.length > 0 && (
                  <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1">
                    Tip: {forecast.tips[0]}
                  </p>
                )}
              </div>
            </div>
          </div>
        )}

        {(!stats?.summary?.totalItems && !forecast?.insight) && (
          <div className="text-center py-4">
            <p className="text-sm text-neutral-500 dark:text-neutral-400">
              Start logging waste in your Pantry to see insights here
            </p>
          </div>
        )}
      </div>
    </motion.div>
  )
}

export default function Dashboard() {
  const { user } = useAuth()
  const [selectedPeriod] = useState<'week' | 'month' | 'year'>('month')
  const [sidebarTab, setSidebarTab] = useState<'goals' | 'today'>('goals')

  const { data: dashboardResponse, isLoading } = useQuery(
    ['dashboard', selectedPeriod],
    () => apiService.get(`/api/dashboard?period=${selectedPeriod}`),
    { enabled: !!user }
  )

  useQuery(
    ['recommendations'],
    () => apiService.get('/api/dashboard/recommendations'),
    { enabled: !!user }
  )

  const stats: DashboardStats = (dashboardResponse as any)?.stats || {
    groceryLists: { total: 0, active: 0, completed: 0, itemsCount: 0 },
    pantry: { totalItems: 0, totalValue: 0, expiringSoon: 0, lowStock: 0, categories: {} },
    spending: { thisMonth: 0, lastMonth: 0, saved: 0, budget: 0, trend: 'stable' },
    activity: { recentLists: [], recentPantryItems: [], completedTasks: 0 }
  }

  const getGreeting = () => {
    const hour = new Date().getHours()
    if (hour < 12) return 'Good morning'
    if (hour < 18) return 'Good afternoon'
    return 'Good evening'
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="loading-dots">
          <div></div>
          <div></div>
          <div></div>
        </div>
      </div>
    )
  }

  const metricCards = [
    {
      label: 'Active Lists',
      value: stats.groceryLists.active,
      total: stats.groceryLists.total,
      icon: ShoppingCart,
      borderClass: 'border-l-4 border-l-blue-400',
      iconBg: 'bg-blue-50 dark:bg-blue-900/20',
      iconColor: 'text-blue-600 dark:text-blue-400',
      trend: null as string | null
    },
    {
      label: 'Pantry Items',
      value: stats.pantry.totalItems,
      subtitle: `£${stats.pantry.totalValue.toFixed(2)} value`,
      icon: Package,
      borderClass: 'border-l-4 border-l-primary-400',
      iconBg: 'bg-primary-50 dark:bg-primary-900/20',
      iconColor: 'text-primary-600 dark:text-primary-400',
      trend: null as string | null
    },
    {
      label: 'This Month',
      value: `£${stats.spending.thisMonth.toFixed(2)}`,
      subtitle: stats.spending.trend === 'up' ? 'Up vs last month' : stats.spending.trend === 'down' ? 'Down vs last month' : 'Stable',
      icon: DollarSign,
      borderClass: 'border-l-4 border-l-emerald-400',
      iconBg: 'bg-emerald-50 dark:bg-emerald-900/20',
      iconColor: 'text-emerald-600 dark:text-emerald-400',
      trend: stats.spending.trend
    },
    {
      label: 'Expiring Soon',
      value: stats.pantry.expiringSoon,
      subtitle: `${stats.pantry.lowStock} low stock`,
      icon: AlertTriangle,
      borderClass: stats.pantry.expiringSoon > 0 ? 'border-l-4 border-l-red-400' : 'border-l-4 border-l-neutral-300 dark:border-l-neutral-600',
      iconBg: stats.pantry.expiringSoon > 0 ? 'bg-red-50 dark:bg-red-900/20' : 'bg-neutral-50 dark:bg-neutral-700/50',
      iconColor: stats.pantry.expiringSoon > 0 ? 'text-red-600 dark:text-red-400' : 'text-neutral-500 dark:text-neutral-400',
      trend: null as string | null
    }
  ]

  return (
    <>
      <Helmet>
        <title>Dashboard - Nourish Neural</title>
      </Helmet>

      <div className="relative">
        {/* Subtle warm background accents */}
        <div className="pointer-events-none fixed inset-0 overflow-hidden">
          <div className="absolute top-[-10%] right-[-5%] h-96 w-96 rounded-full bg-primary-200/20 dark:bg-primary-800/10 blur-[100px]" />
          <div className="absolute bottom-[-5%] left-[-8%] h-80 w-80 rounded-full bg-accent-200/15 dark:bg-accent-800/10 blur-[100px]" />
        </div>

        <div className="relative space-y-4 md:space-y-6">
          {/* Hero greeting */}
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="flex flex-col md:flex-row md:items-end md:justify-between gap-1 md:gap-2"
          >
            <div>
              <p className="text-xs md:text-sm font-medium text-neutral-500 dark:text-neutral-400 mb-0.5 md:mb-1">
                {new Date().toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long' })}
              </p>
              <h1 className="text-2xl md:text-4xl font-display text-neutral-900 dark:text-neutral-100">
                {getGreeting()}, <span className="gradient-text">{(user as any)?.firstName || 'there'}</span>
              </h1>
            </div>
            <p className="text-xs md:text-sm text-neutral-500 dark:text-neutral-400 pb-1 hidden md:block">
              Your kitchen at a glance
            </p>
          </motion.div>

          {/* Metrics — horizontal scroll on mobile, grid on desktop */}
          <motion.div
            className="flex md:grid md:grid-cols-4 gap-2.5 md:gap-3 overflow-x-auto scrollbar-hide -mx-4 px-4 md:mx-0 md:px-0 snap-x snap-mandatory md:snap-none"
            variants={staggerContainer}
            initial="hidden"
            animate="visible"
          >
            {metricCards.map((metric, i) => (
              <motion.div key={metric.label} variants={fadeUp} transition={{ delay: i * 0.05 }} className="min-w-[140px] md:min-w-0 snap-start">
                <div className={cn('card p-3 md:p-4', metric.borderClass)}>
                  <div className="flex items-center justify-between mb-2 md:mb-3">
                    <div className={cn('w-8 h-8 md:w-9 md:h-9 rounded-lg flex items-center justify-center', metric.iconBg)}>
                      <metric.icon className={cn('w-4 h-4 md:w-[18px] md:h-[18px]', metric.iconColor)} />
                    </div>
                    {metric.trend && metric.trend !== 'stable' && (
                      <span className={cn('text-xs font-semibold', metric.trend === 'up' ? 'text-red-500' : 'text-green-500')}>
                        {metric.trend === 'up' ? '↑' : '↓'}
                      </span>
                    )}
                  </div>
                  <p className="text-[10px] md:text-[11px] font-medium text-neutral-500 dark:text-neutral-400 uppercase tracking-wider mb-0.5">
                    {metric.label}
                  </p>
                  <p className="text-xl md:text-2xl font-display text-neutral-900 dark:text-neutral-100">
                    {metric.value}
                    {metric.total !== undefined && (
                      <span className="text-sm md:text-base text-neutral-400 dark:text-neutral-500 ml-1">/ {metric.total}</span>
                    )}
                  </p>
                  {metric.subtitle && (
                    <p className="text-[10px] md:text-xs text-neutral-500 dark:text-neutral-400 mt-0.5 md:mt-1">{metric.subtitle}</p>
                  )}
                </div>
              </motion.div>
            ))}
          </motion.div>

          {/* Quick Actions — scrollable row on mobile, flex-wrap on desktop */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className="flex gap-2 overflow-x-auto scrollbar-hide -mx-4 px-4 md:mx-0 md:px-0 md:flex-wrap snap-x snap-mandatory md:snap-none"
          >
            {quickActions.map((action) => {
              const Icon = action.icon
              return (
                <MotionLink
                  key={action.id}
                  to={action.link}
                  className="flex items-center gap-2 md:gap-2.5 px-3 md:px-4 py-2 md:py-2.5 rounded-xl bg-white dark:bg-neutral-800 border border-neutral-200/80 dark:border-neutral-700/60 shadow-sm hover:shadow-md transition-all shrink-0 snap-start active:scale-95 md:active:scale-100"
                  whileHover={{ y: -2 }}
                  whileTap={{ scale: 0.97 }}
                >
                  <div className={cn('w-8 h-8 rounded-lg flex items-center justify-center', action.iconBg)}>
                    <Icon className={cn('w-4 h-4', action.color)} />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-neutral-800 dark:text-neutral-100 leading-tight whitespace-nowrap">{action.title}</p>
                    <p className="text-[11px] text-neutral-500 dark:text-neutral-400 whitespace-nowrap">{action.subtitle}</p>
                  </div>
                </MotionLink>
              )
            })}
          </motion.div>

          {/* Main Content Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6">
            {/* Left Column — 2/3 */}
            <div className="lg:col-span-2 space-y-4 md:space-y-6">
              {/* Waste Analytics */}
              <WasteAnalyticsSection />

              {/* Gamified Sustainability Summary */}
              <SustainabilityWidget scope="personal" />

              {/* AI Intelligence */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="card overflow-hidden"
              >
                <div className="border-l-4 border-l-primary-500 p-5">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center">
                        <Sparkles className="w-4 h-4 text-white" />
                      </div>
                      <div>
                        <h2 className="text-lg font-display text-neutral-900 dark:text-neutral-100">AI Intelligence</h2>
                        <p className="text-xs text-neutral-500 dark:text-neutral-400">Powered by local neural models</p>
                      </div>
                    </div>
                    <span className="badge badge-primary text-[10px] font-semibold uppercase tracking-wider">Beta</span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Food Classifier */}
                    <div className="rounded-xl bg-cream-50 dark:bg-neutral-700/30 border border-neutral-200/60 dark:border-neutral-600/40 p-4">
                      <div className="flex items-center gap-2 mb-3">
                        <Search className="w-4 h-4 text-primary-600 dark:text-primary-400" />
                        <h3 className="font-semibold text-sm text-neutral-800 dark:text-neutral-100">Food Classifier</h3>
                      </div>
                      <SmartFoodClassifier
                        placeholder="Enter food name..."
                        onClassification={() => {}}
                      />
                    </div>

                    {/* AI Status */}
                    <div className="rounded-xl bg-cream-50 dark:bg-neutral-700/30 border border-neutral-200/60 dark:border-neutral-600/40 p-4">
                      <div className="flex items-center gap-2 mb-3">
                        <Activity className="w-4 h-4 text-primary-600 dark:text-primary-400" />
                        <h3 className="font-semibold text-sm text-neutral-800 dark:text-neutral-100">Service Status</h3>
                      </div>
                      <div className="space-y-2.5">
                        <div className="flex items-center justify-between p-2.5 rounded-lg bg-white dark:bg-neutral-800 border border-primary-100 dark:border-primary-800/30">
                          <span className="text-sm text-neutral-700 dark:text-neutral-300">Neural Models</span>
                          <div className="flex items-center gap-1.5">
                            <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                            <span className="text-xs font-semibold text-green-600 dark:text-green-400">Online</span>
                          </div>
                        </div>
                        <div className="grid grid-cols-2 gap-2.5">
                          <div className="p-2.5 rounded-lg bg-white dark:bg-neutral-800 border border-neutral-200/60 dark:border-neutral-600/40">
                            <p className="text-[10px] font-medium text-neutral-500 uppercase tracking-wider mb-0.5">Accuracy</p>
                            <p className="text-xl font-display text-neutral-900 dark:text-neutral-100">97%</p>
                          </div>
                          <div className="p-2.5 rounded-lg bg-white dark:bg-neutral-800 border border-neutral-200/60 dark:border-neutral-600/40">
                            <p className="text-[10px] font-medium text-neutral-500 uppercase tracking-wider mb-0.5">Response</p>
                            <p className="text-xl font-display text-neutral-900 dark:text-neutral-100">420ms</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>

              {/* Recent Activity */}
              {stats.activity.recentLists.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                >
                  <div className="flex items-center justify-between mb-3">
                    <h2 className="text-lg font-display text-neutral-900 dark:text-neutral-100">Recent Lists</h2>
                    <Link to="/app/grocery-lists" className="text-sm font-medium text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 flex items-center gap-1">
                      View all <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                  <div className="card divide-y divide-neutral-100 dark:divide-neutral-700/50">
                    {stats.activity.recentLists.slice(0, 3).map((list: any) => (
                      <div key={list.id} className="p-4 hover:bg-neutral-50 dark:hover:bg-neutral-700/30 transition-colors first:rounded-t-2xl last:rounded-b-2xl">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 bg-blue-50 dark:bg-blue-900/20 rounded-lg flex items-center justify-center">
                              <ShoppingCart className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                            </div>
                            <div>
                              <p className="font-medium text-sm text-neutral-800 dark:text-neutral-100">{list.name}</p>
                              <p className="text-xs text-neutral-500 dark:text-neutral-400">
                                {list.items?.length || 0} items · {list.progress || 0}% complete
                              </p>
                            </div>
                          </div>
                          {list.status === 'completed' && (
                            <CheckCircle className="w-4 h-4 text-green-500" />
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}
            </div>

            {/* Right Column — 1/3 */}
            <div className="space-y-4 md:space-y-6">
              {/* Goals & Today */}
              <motion.div
                initial={{ opacity: 0, x: 15 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 }}
                className="card p-5"
              >
                {/* Tab toggle */}
                <div className="flex bg-neutral-100 dark:bg-neutral-700/50 rounded-lg p-0.5 mb-5">
                  <button
                    onClick={() => setSidebarTab('goals')}
                    className={cn(
                      'flex-1 flex items-center justify-center gap-1.5 px-3 py-2 text-sm font-medium rounded-md transition-all',
                      sidebarTab === 'goals'
                        ? 'bg-white dark:bg-neutral-600 text-primary-700 dark:text-primary-300 shadow-sm'
                        : 'text-neutral-500 dark:text-neutral-400'
                    )}
                  >
                    <Target className="w-3.5 h-3.5" />
                    Goals
                  </button>
                  <button
                    onClick={() => setSidebarTab('today')}
                    className={cn(
                      'flex-1 flex items-center justify-center gap-1.5 px-3 py-2 text-sm font-medium rounded-md transition-all',
                      sidebarTab === 'today'
                        ? 'bg-white dark:bg-neutral-600 text-primary-700 dark:text-primary-300 shadow-sm'
                        : 'text-neutral-500 dark:text-neutral-400'
                    )}
                  >
                    <Clock className="w-3.5 h-3.5" />
                    Today
                  </button>
                </div>

                {sidebarTab === 'goals' ? (
                  <div className="space-y-4">
                    {[
                      { label: 'Shopping lists', current: 2, target: 3, barColor: 'bg-primary-500' },
                      { label: 'Expiry checks', current: 5, target: 8, barColor: 'bg-blue-500' },
                      { label: 'New recipes', current: 1, target: 2, barColor: 'bg-accent-500' }
                    ].map((goal) => {
                      const pct = Math.round((goal.current / goal.target) * 100)
                      return (
                        <div key={goal.label}>
                          <div className="flex items-center justify-between mb-1.5">
                            <span className="text-sm text-neutral-700 dark:text-neutral-300">{goal.label}</span>
                            <span className="text-xs font-mono text-neutral-500 dark:text-neutral-400">{goal.current}/{goal.target}</span>
                          </div>
                          <div className="w-full bg-neutral-100 dark:bg-neutral-700 rounded-full h-2">
                            <motion.div
                              className={cn('h-2 rounded-full', goal.barColor)}
                              initial={{ width: 0 }}
                              animate={{ width: `${pct}%` }}
                              transition={{ duration: 0.8, delay: 0.3 }}
                            />
                          </div>
                        </div>
                      )
                    })}
                  </div>
                ) : (
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <CheckCircle className="w-4 h-4 text-green-500" />
                        <span className="text-sm text-neutral-700 dark:text-neutral-300">Tasks done</span>
                      </div>
                      <span className="font-display text-lg text-neutral-900 dark:text-neutral-100">{stats.activity.completedTasks}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4 text-blue-500" />
                        <span className="text-sm text-neutral-700 dark:text-neutral-300">Time saved</span>
                      </div>
                      <span className="font-display text-lg text-neutral-900 dark:text-neutral-100">2.5h</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Heart className="w-4 h-4 text-red-500" />
                        <span className="text-sm text-neutral-700 dark:text-neutral-300">Money saved</span>
                      </div>
                      <span className="font-display text-lg text-neutral-900 dark:text-neutral-100">£{stats.spending.saved.toFixed(2)}</span>
                    </div>
                  </div>
                )}
              </motion.div>

              {/* Pantry Breakdown */}
              <motion.div
                initial={{ opacity: 0, x: 15 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 }}
                className="card p-5"
              >
                <div className="flex items-center gap-2 mb-4">
                  <BarChart3 className="w-4 h-4 text-primary-600 dark:text-primary-400" />
                  <h3 className="font-display text-neutral-900 dark:text-neutral-100">Pantry Mix</h3>
                </div>
                {Object.keys(stats.pantry.categories).length > 0 ? (
                  <div className="space-y-2.5">
                    {Object.entries(stats.pantry.categories)
                      .sort(([, a], [, b]) => b - a)
                      .slice(0, 5)
                      .map(([category, count]) => (
                        <div key={category} className="flex items-center justify-between">
                          <span className="text-sm text-neutral-600 dark:text-neutral-400">{category}</span>
                          <div className="flex items-center gap-2">
                            <div className="w-16 bg-neutral-100 dark:bg-neutral-700 rounded-full h-1.5">
                              <motion.div
                                className="bg-primary-500 h-1.5 rounded-full"
                                initial={{ width: 0 }}
                                animate={{ width: `${(count / stats.pantry.totalItems) * 100}%` }}
                                transition={{ duration: 0.8, delay: 0.2 }}
                              />
                            </div>
                            <span className="text-sm font-mono font-medium text-neutral-800 dark:text-neutral-200 w-5 text-right">{count}</span>
                          </div>
                        </div>
                      ))}
                  </div>
                ) : (
                  <div className="text-center py-6">
                    <Package className="w-8 h-8 text-neutral-300 dark:text-neutral-600 mx-auto mb-2" />
                    <p className="text-sm text-neutral-500 dark:text-neutral-400">No items yet</p>
                  </div>
                )}
              </motion.div>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
