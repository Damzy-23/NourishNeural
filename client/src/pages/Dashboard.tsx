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
  ChevronRight,
  TrendingDown,
  TrendingUp,
  Minus,
  Trash2
} from 'lucide-react'
import { apiService } from '../services/api'
import { useAuth } from '../hooks/useAuth'
import SmartFoodClassifier from '../components/SmartFoodClassifier'
import { fadeUp, staggerContainer } from '../utils/motion'

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
  description: string
  icon: any
  color: string
  link: string
}

// Interface for future use
// interface Recommendation {
//   id: string
//   type: 'recipe' | 'shopping' | 'expiry' | 'budget'
//   title: string
//   description: string
//   action: string
//   link: string
//   priority: 'high' | 'medium' | 'low'
// }

const quickActions: QuickAction[] = [
  {
    id: 'new-list',
    title: 'Create Shopping List',
    description: 'Start a new grocery list',
    icon: Plus,
    color: 'bg-blue-500',
    link: '/app/grocery-lists'
  },
  {
    id: 'add-pantry',
    title: 'Add Pantry Item',
    description: 'Track a new food item',
    icon: Package,
    color: 'bg-primary-500',
    link: '/app/pantry'
  },
  {
    id: 'find-stores',
    title: 'Find Stores',
    description: 'Locate nearby shops',
    icon: MapPin,
    color: 'bg-purple-500',
    link: '/app/stores'
  },
  {
    id: 'ai-chat',
    title: 'Chat with Nurexa AI',
    description: 'Get cooking advice',
    icon: Zap,
    color: 'bg-orange-500',
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
    <motion.section
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.5 }}
    >
      <div className="bg-white dark:bg-neutral-800 rounded-xl border border-neutral-200 dark:border-neutral-700 p-5">
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-red-500 to-orange-500 flex items-center justify-center">
              <Trash2 className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-neutral-900 dark:text-neutral-100">Food Waste Tracker</h2>
              <p className="text-sm text-neutral-600 dark:text-neutral-400">This month's waste overview</p>
            </div>
          </div>
          {forecast?.trend && forecast.trend !== 'insufficient_data' && (
            <div className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-full bg-neutral-50 dark:bg-neutral-700/50 ${trendColor}`}>
              {(() => { const Icon = trendIcon; return <Icon className="w-4 h-4" /> })()}
              <span className="text-xs font-bold">{trendLabel}</span>
            </div>
          )}
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-5">
          <div className="p-3 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800">
            <p className="text-xs text-neutral-500 dark:text-neutral-400 mb-1">Items Wasted</p>
            <p className="text-2xl font-black text-neutral-900 dark:text-neutral-100">{stats?.summary?.totalItems || 0}</p>
          </div>
          <div className="p-3 rounded-lg bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800">
            <p className="text-xs text-neutral-500 dark:text-neutral-400 mb-1">Money Lost</p>
            <p className="text-2xl font-black text-neutral-900 dark:text-neutral-100">
              £{(stats?.summary?.totalLoss || 0).toFixed(2)}
            </p>
          </div>
          <div className="p-3 rounded-lg bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800">
            <p className="text-xs text-neutral-500 dark:text-neutral-400 mb-1">Top Wasted</p>
            <p className="text-sm font-bold text-neutral-900 dark:text-neutral-100 truncate">
              {stats?.summary?.mostWastedCategory || 'N/A'}
            </p>
          </div>
          <div className="p-3 rounded-lg bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800">
            <p className="text-xs text-neutral-500 dark:text-neutral-400 mb-1">Main Reason</p>
            <p className="text-sm font-bold text-neutral-900 dark:text-neutral-100 capitalize truncate">
              {stats?.summary?.mostCommonReason || 'N/A'}
            </p>
          </div>
        </div>

        {/* AI Insight */}
        {forecast?.insight && forecast.trend !== 'insufficient_data' && (
          <div className="p-4 rounded-lg bg-gradient-to-r from-purple-50 to-blue-50 dark:from-purple-900/20 dark:to-blue-900/20 border border-purple-200 dark:border-purple-800">
            <div className="flex items-start space-x-2">
              <Sparkles className="w-4 h-4 text-purple-500 dark:text-purple-400 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-sm font-medium text-neutral-700 dark:text-neutral-300">{forecast.insight}</p>
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
    </motion.section>
  )
}

export default function Dashboard() {
  const { user } = useAuth()
  const [selectedPeriod] = useState<'week' | 'month' | 'year'>('month')

  // Fetch dashboard data
  const { data: dashboardResponse, isLoading } = useQuery(
    ['dashboard', selectedPeriod],
    () => apiService.get(`/api/dashboard?period=${selectedPeriod}`),
    {
      enabled: !!user,
    }
  )

  // Fetch recommendations (available for future use)
  useQuery(
    ['recommendations'],
    () => apiService.get('/api/dashboard/recommendations'),
    {
      enabled: !!user,
    }
  )

  const stats: DashboardStats = (dashboardResponse as any)?.stats || {
    groceryLists: { total: 0, active: 0, completed: 0, itemsCount: 0 },
    pantry: { totalItems: 0, totalValue: 0, expiringSoon: 0, lowStock: 0, categories: {} },
    spending: { thisMonth: 0, lastMonth: 0, saved: 0, budget: 0, trend: 'stable' },
    activity: { recentLists: [], recentPantryItems: [], completedTasks: 0 }
  }

  // Recommendations available for future use
  // const recommendations: Recommendation[] = (recommendationsResponse as any)?.recommendations || []

  const getGreeting = () => {
    const hour = new Date().getHours()
    if (hour < 12) return 'Good morning'
    if (hour < 18) return 'Good afternoon'
    return 'Good evening'
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="loading-dots">
          <div></div>
          <div></div>
          <div></div>
        </div>
      </div>
    )
  }

  return (
    <>
      <Helmet>
        <title>Dashboard - Nourish Neural</title>
      </Helmet>

      <div className="relative min-h-screen pb-16">
        {/* Subtle gradient background */}
        <div className="pointer-events-none fixed inset-0 bg-gradient-to-br from-blue-50/30 via-white to-primary-50/20 dark:from-neutral-900 dark:via-neutral-900 dark:to-neutral-800"></div>

        <div className="relative">
          {/* Header */}
          <motion.div
            className="mb-8"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div>
                <h1 className="text-4xl font-black text-neutral-900 dark:text-neutral-100 mb-2">
                  {getGreeting()}, <span className="text-primary-600 dark:text-primary-400">{(user as any)?.firstName || 'there'}</span>
                </h1>
                <p className="text-neutral-600 dark:text-neutral-400">
                  {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}
                </p>
              </div>
            </div>
          </motion.div>

          {/* Key Metrics Row */}
          <motion.div
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8"
            variants={staggerContainer}
            initial="hidden"
            animate="visible"
          >
            {[
              {
                label: 'Active Lists',
                value: stats.groceryLists.active,
                total: stats.groceryLists.total,
                icon: ShoppingCart,
                color: 'blue',
                trend: null
              },
              {
                label: 'Pantry Items',
                value: stats.pantry.totalItems,
                subtitle: `£${stats.pantry.totalValue.toFixed(2)}`,
                icon: Package,
                color: 'primary',
                trend: null
              },
              {
                label: 'This Month',
                value: `£${stats.spending.thisMonth.toFixed(2)}`,
                subtitle: stats.spending.trend === 'up' ? '↑ vs last' : stats.spending.trend === 'down' ? '↓ vs last' : '— stable',
                icon: DollarSign,
                color: 'green',
                trend: stats.spending.trend
              },
              {
                label: 'Expiring Soon',
                value: stats.pantry.expiringSoon,
                subtitle: `${stats.pantry.lowStock} low stock`,
                icon: AlertTriangle,
                color: stats.pantry.expiringSoon > 0 ? 'red' : 'neutral',
                trend: null
              }
            ].map((metric, index) => (
              <motion.div
                key={metric.label}
                variants={fadeUp}
                transition={{ delay: index * 0.05 }}
              >
                <div className="bg-white dark:bg-neutral-800 rounded-2xl border border-neutral-200 dark:border-neutral-700 p-5 hover:shadow-md transition-shadow">
                  <div className="flex items-start justify-between mb-3">
                    <div className={`w-10 h-10 rounded-xl bg-${metric.color}-100 dark:bg-${metric.color}-900/30 flex items-center justify-center`}>
                      <metric.icon className={`w-5 h-5 text-${metric.color}-600 dark:text-${metric.color}-400`} />
                    </div>
                    {metric.trend && metric.trend !== 'stable' && (
                      <div className={`text-xs font-semibold ${metric.trend === 'up' ? 'text-red-600 dark:text-red-400' : 'text-green-600 dark:text-green-400'}`}>
                        {metric.trend === 'up' ? '↑' : '↓'}
                      </div>
                    )}
                  </div>
                  <p className="text-xs font-semibold text-neutral-500 dark:text-neutral-400 uppercase tracking-wider mb-1">{metric.label}</p>
                  <p className="text-2xl font-black text-neutral-900 dark:text-neutral-100">
                    {metric.value}
                    {metric.total !== undefined && <span className="text-lg text-neutral-400 dark:text-neutral-500 font-bold ml-1">/ {metric.total}</span>}
                  </p>
                  {metric.subtitle && (
                    <p className="text-xs text-neutral-600 dark:text-neutral-400 mt-1">{metric.subtitle}</p>
                  )}
                </div>
              </motion.div>
            ))}
          </motion.div>

          {/* Main Content Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
            {/* Left Column - 2/3 width */}
            <div className="lg:col-span-2 space-y-8">
              {/* Quick Actions */}
              <motion.section
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
              >
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-bold text-neutral-900 dark:text-neutral-100">Quick Actions</h2>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {quickActions.map((action) => {
                    const Icon = action.icon
                    return (
                      <MotionLink
                        key={action.id}
                        to={action.link}
                        className="group"
                        whileHover={{ y: -4 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        <div className="bg-white dark:bg-neutral-800 rounded-xl border border-neutral-200 dark:border-neutral-700 p-4 hover:border-primary-300 dark:hover:border-primary-600 hover:shadow-md transition-all">
                          <div className={`w-10 h-10 ${action.color} rounded-lg flex items-center justify-center mb-3 group-hover:scale-110 transition-transform`}>
                            <Icon className="w-5 h-5 text-white" />
                          </div>
                          <p className="font-semibold text-neutral-900 dark:text-neutral-100 text-sm mb-0.5">{action.title}</p>
                          <p className="text-xs text-neutral-500 dark:text-neutral-400">{action.description}</p>
                        </div>
                      </MotionLink>
                    )
                  })}
                </div>
              </motion.section>

              {/* AI Features */}
              <motion.section
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-2">
                    <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center">
                      <Sparkles className="w-4 h-4 text-white" />
                    </div>
                    <h2 className="text-lg font-bold text-neutral-900 dark:text-neutral-100">AI Intelligence</h2>
                  </div>
                  <span className="px-3 py-1 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 text-xs font-bold rounded-full">Beta</span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Food Classifier */}
                  <div className="bg-white dark:bg-neutral-800 rounded-xl border border-neutral-200 dark:border-neutral-700 p-5 hover:shadow-md transition-shadow">
                    <div className="flex items-center space-x-2 mb-4">
                      <div className="w-8 h-8 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                        <Search className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                      </div>
                      <h3 className="font-bold text-neutral-900 dark:text-neutral-100">Food Classifier</h3>
                    </div>
                    <SmartFoodClassifier
                      placeholder="Enter food name..."
                      onClassification={(result) => console.log(result)}
                    />
                  </div>

                  {/* AI Status */}
                  <div className="bg-white dark:bg-neutral-800 rounded-xl border border-neutral-200 dark:border-neutral-700 p-5 hover:shadow-md transition-shadow">
                    <div className="flex items-center space-x-2 mb-4">
                      <div className="w-8 h-8 rounded-lg bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                        <Activity className="w-4 h-4 text-green-600 dark:text-green-400" />
                      </div>
                      <h3 className="font-bold text-neutral-900 dark:text-neutral-100">Service Status</h3>
                    </div>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between p-3 rounded-lg bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800">
                        <span className="text-sm font-medium text-neutral-700 dark:text-neutral-300">Neural Models</span>
                        <div className="flex items-center space-x-1.5">
                          <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
                          <span className="text-xs font-bold text-green-600 dark:text-green-400">Online</span>
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <div className="p-3 rounded-lg bg-neutral-50 dark:bg-neutral-700/50 border border-neutral-200 dark:border-neutral-600">
                          <p className="text-xs text-neutral-500 dark:text-neutral-400 mb-1">Accuracy</p>
                          <p className="text-xl font-black text-neutral-900 dark:text-neutral-100">97%</p>
                        </div>
                        <div className="p-3 rounded-lg bg-neutral-50 dark:bg-neutral-700/50 border border-neutral-200 dark:border-neutral-600">
                          <p className="text-xs text-neutral-500 dark:text-neutral-400 mb-1">Response</p>
                          <p className="text-xl font-black text-neutral-900 dark:text-neutral-100">420ms</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.section>

              {/* Recent Activity */}
              {stats.activity.recentLists.length > 0 && (
                <motion.section
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                >
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-lg font-bold text-neutral-900 dark:text-neutral-100">Recent Lists</h2>
                    <Link to="/app/grocery-lists" className="text-sm font-semibold text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 flex items-center">
                      View all <ChevronRight className="w-4 h-4 ml-1" />
                    </Link>
                  </div>
                  <div className="bg-white dark:bg-neutral-800 rounded-xl border border-neutral-200 dark:border-neutral-700 divide-y divide-neutral-200 dark:divide-neutral-700">
                    {stats.activity.recentLists.slice(0, 3).map((list: any) => (
                      <div key={list.id} className="p-4 hover:bg-neutral-50 dark:hover:bg-neutral-700/50 transition-colors">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                            <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
                              <ShoppingCart className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                            </div>
                            <div>
                              <p className="font-semibold text-neutral-900 dark:text-neutral-100">{list.name}</p>
                              <p className="text-sm text-neutral-600 dark:text-neutral-400">
                                {list.items?.length || 0} items • {list.progress || 0}% complete
                              </p>
                            </div>
                          </div>
                          {list.status === 'completed' && (
                            <CheckCircle className="w-5 h-5 text-green-500 dark:text-green-400" />
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </motion.section>
              )}
            </div>

            {/* Right Column - 1/3 width */}
            <div className="space-y-6">
              {/* Weekly Goals */}
              <motion.section
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 }}
              >
                <div className="bg-white dark:bg-neutral-800 rounded-xl border border-neutral-200 dark:border-neutral-700 p-5">
                  <div className="flex items-center space-x-2 mb-5">
                    <Target className="w-5 h-5 text-primary-600 dark:text-primary-400" />
                    <h3 className="font-bold text-neutral-900 dark:text-neutral-100">Weekly Goals</h3>
                  </div>
                  <div className="space-y-4">
                    {[
                      { label: 'Shopping lists', current: 2, target: 3, color: 'primary' },
                      { label: 'Expiry checks', current: 5, target: 8, color: 'blue' },
                      { label: 'New recipes', current: 1, target: 2, color: 'orange' }
                    ].map((goal) => (
                      <div key={goal.label}>
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-medium text-neutral-700 dark:text-neutral-300">{goal.label}</span>
                          <span className="text-sm font-bold text-neutral-900 dark:text-neutral-100">{goal.current}/{goal.target}</span>
                        </div>
                        <div className="w-full bg-neutral-100 dark:bg-neutral-700 rounded-full h-2">
                          <motion.div
                            className={`bg-gradient-to-r from-${goal.color}-500 to-${goal.color}-600 h-2 rounded-full`}
                            initial={{ width: 0 }}
                            animate={{ width: `${(goal.current / goal.target) * 100}%` }}
                            transition={{ duration: 1, delay: 0.3 }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </motion.section>

              {/* Pantry Breakdown */}
              <motion.section
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 }}
              >
                <div className="bg-white dark:bg-neutral-800 rounded-xl border border-neutral-200 dark:border-neutral-700 p-5">
                  <div className="flex items-center space-x-2 mb-5">
                    <BarChart3 className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                    <h3 className="font-bold text-neutral-900 dark:text-neutral-100">Pantry Mix</h3>
                  </div>
                  {Object.keys(stats.pantry.categories).length > 0 ? (
                    <div className="space-y-3">
                      {Object.entries(stats.pantry.categories)
                        .sort(([,a], [,b]) => b - a)
                        .slice(0, 5)
                        .map(([category, count]) => (
                        <div key={category} className="flex items-center justify-between">
                          <span className="text-sm font-medium text-neutral-700 dark:text-neutral-300">{category}</span>
                          <div className="flex items-center space-x-2">
                            <div className="w-16 bg-neutral-100 dark:bg-neutral-700 rounded-full h-1.5">
                              <motion.div
                                className="bg-gradient-to-r from-purple-500 to-blue-500 h-1.5 rounded-full"
                                initial={{ width: 0 }}
                                animate={{ width: `${(count / stats.pantry.totalItems) * 100}%` }}
                                transition={{ duration: 1, delay: 0.2 }}
                              />
                            </div>
                            <span className="text-sm font-bold text-neutral-900 dark:text-neutral-100 w-6 text-right">{count}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-6">
                      <Package className="w-8 h-8 text-neutral-300 dark:text-neutral-600 mx-auto mb-2" />
                      <p className="text-sm text-neutral-600 dark:text-neutral-400">No items yet</p>
                    </div>
                  )}
                </div>
              </motion.section>

              {/* Today's Activity */}
              <motion.section
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4 }}
              >
                <div className="bg-white dark:bg-neutral-800 rounded-xl border border-neutral-200 dark:border-neutral-700 p-5">
                  <h3 className="font-bold text-neutral-900 dark:text-neutral-100 mb-4">Today</h3>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <CheckCircle className="w-4 h-4 text-green-500 dark:text-green-400" />
                        <span className="text-sm font-medium text-neutral-700 dark:text-neutral-300">Tasks done</span>
                      </div>
                      <span className="font-bold text-neutral-900 dark:text-neutral-100">{stats.activity.completedTasks}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <Clock className="w-4 h-4 text-blue-500 dark:text-blue-400" />
                        <span className="text-sm font-medium text-neutral-700 dark:text-neutral-300">Time saved</span>
                      </div>
                      <span className="font-bold text-neutral-900 dark:text-neutral-100">2.5h</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <Heart className="w-4 h-4 text-red-500 dark:text-red-400" />
                        <span className="text-sm font-medium text-neutral-700 dark:text-neutral-300">Money saved</span>
                      </div>
                      <span className="font-bold text-neutral-900 dark:text-neutral-100">£{stats.spending.saved.toFixed(2)}</span>
                    </div>
                  </div>
                </div>
              </motion.section>
            </div>
          </div>

          {/* Waste Analytics Section */}
          <WasteAnalyticsSection />
        </div>
      </div>
    </>
  )
}
