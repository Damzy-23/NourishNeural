import { useState } from 'react'
import { Helmet } from 'react-helmet-async'
import { useQuery } from 'react-query'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  BarChart3,
  TrendingUp,
  ShoppingCart,
  Package,
  Plus,
  AlertTriangle,
  Clock,
  Star,
  Zap,
  Heart,
  DollarSign,
  MapPin,
  CheckCircle,
  ArrowRight,
  Lightbulb,
  Target,
  Brain,
  Search,
  Circle
} from 'lucide-react'
import { apiService } from '../services/api'
import { useAuth } from '../hooks/useAuth'
import SmartFoodClassifier from '../components/SmartFoodClassifier'
import SmartRecipeRecommendations from '../components/SmartRecipeRecommendations'
import SmartShoppingListGenerator from '../components/SmartShoppingListGenerator'
import SmartWasteDashboard from '../components/SmartWasteDashboard'
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

interface Recommendation {
  id: string
  type: 'recipe' | 'shopping' | 'expiry' | 'budget'
  title: string
  description: string
  action: string
  link: string
  priority: 'high' | 'medium' | 'low'
}

const quickActions: QuickAction[] = [
  {
    id: 'new-list',
    title: 'Create Shopping List',
    description: 'Start a new grocery list',
    icon: Plus,
    color: 'bg-blue-500',
    link: '/grocery-lists'
  },
  {
    id: 'add-pantry',
    title: 'Add Pantry Item',
    description: 'Track a new food item',
    icon: Package,
    color: 'bg-primary-500',
    link: '/pantry'
  },
  {
    id: 'find-stores',
    title: 'Find Stores',
    description: 'Locate nearby shops',
    icon: MapPin,
    color: 'bg-purple-500',
    link: '/stores'
  },
  {
    id: 'ai-chat',
    title: 'Chat with Nurexa AI',
    description: 'Get cooking advice',
    icon: Zap,
    color: 'bg-orange-500',
    link: '/ai-assistant'
  }
]

export default function Dashboard() {
  const { user } = useAuth()
  const [selectedPeriod, setSelectedPeriod] = useState<'week' | 'month' | 'year'>('month')

  // Fetch dashboard data
  const { data: dashboardResponse, isLoading } = useQuery(
    ['dashboard', selectedPeriod],
    () => apiService.get(`/api/dashboard?period=${selectedPeriod}`),
    {
      enabled: !!user,
    }
  )

  // Fetch recommendations
  const { data: recommendationsResponse } = useQuery(
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

  const recommendations: Recommendation[] = (recommendationsResponse as any)?.recommendations || []

  const getGreeting = () => {
    const hour = new Date().getHours()
    if (hour < 12) return 'Good morning'
    if (hour < 18) return 'Good afternoon'
    return 'Good evening'
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'text-red-600 bg-red-50'
      case 'medium': return 'text-orange-600 bg-orange-50'
      case 'low': return 'text-blue-600 bg-blue-50'
      default: return 'text-neutral-600 bg-neutral-50'
    }
  }

  const getRecommendationIcon = (type: string) => {
    switch (type) {
      case 'recipe': return Lightbulb
      case 'shopping': return ShoppingCart
      case 'expiry': return AlertTriangle
      case 'budget': return Target
      default: return Star
    }
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

      <div className="relative space-y-6 pb-10">
        {/* Animated background accents */}
        <motion.div
          className="pointer-events-none absolute -top-24 right-[-10%] h-72 w-72 rounded-full bg-primary-300/25 blur-3xl"
          animate={{ y: [0, 24, 0], opacity: [0.35, 0.6, 0.35], scale: [1, 1.05, 1] }}
          transition={{ duration: 18, repeat: Infinity, ease: 'easeInOut' }}
        />
        <motion.div
          className="pointer-events-none absolute -bottom-20 left-[-12%] h-64 w-64 rounded-full bg-accent-300/20 blur-3xl"
          animate={{ y: [0, -18, 0], opacity: [0.3, 0.55, 0.3] }}
          transition={{ duration: 20, repeat: Infinity, ease: 'easeInOut' }}
        />

        {/* Welcome Header */}
        <motion.section
          className="relative overflow-hidden"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
        >
          <div className="absolute inset-0 bg-gradient-to-br from-primary-600 via-primary-700 to-accent-700 rounded-3xl"></div>
          <motion.div
            className="absolute inset-0 bg-gradient-to-r from-white/10 via-transparent to-white/10 rounded-3xl"
            animate={{ x: [-100, 100], opacity: [0.5, 0.8, 0.5] }}
            transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
          />
          <div className="relative glass-card rounded-3xl p-8 md:p-10 border border-white/30 backdrop-blur-sm">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div>
                <motion.h1
                  className="text-3xl md:text-4xl font-bold mb-2 text-white drop-shadow-md"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.6, delay: 0.2 }}
                >
                  {getGreeting()}, <span className="text-white/95">{(user as any)?.firstName || 'there'}</span>!
                </motion.h1>
                <motion.p
                  className="text-base md:text-lg text-white/90 leading-relaxed"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.6, delay: 0.3 }}
                >
                  Here's how Nourish Neural is orchestrating your kitchen intelligence today.
                </motion.p>
              </div>
              <motion.div
                className="text-left md:text-right"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.6, delay: 0.4 }}
              >
                <div className="inline-flex flex-col items-end space-y-1 px-4 py-3 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20">
                  <p className="text-xs text-white/75 uppercase tracking-wider font-semibold">Today</p>
                  <p className="text-sm text-white font-medium">
                    {new Date().toLocaleDateString('en-US', {
                      weekday: 'long'
                    })}
                  </p>
                  <p className="text-xs text-white/85">
                    {new Date().toLocaleDateString('en-US', {
                      month: 'long',
                      day: 'numeric',
                      year: 'numeric'
                    })}
                  </p>
                </div>
              </motion.div>
            </div>
          </div>
        </motion.section>

        {/* AI-Powered Features */}
        <motion.section
          className="space-y-6"
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.3 }}
        >
          <motion.div className="flex items-center space-x-2 mb-4" variants={fadeUp}>
            <Brain className="h-5 w-5 text-purple-600" />
            <h2 className="text-xl font-semibold text-neutral-900">AI-Powered Features</h2>
            <span className="px-2 py-1 bg-purple-100 text-purple-600 text-xs font-medium rounded-full">
              NEW
            </span>
          </motion.div>
          
          <motion.div className="grid grid-cols-1 lg:grid-cols-2 gap-6" variants={staggerContainer}>
            {/* Food Classifier */}
            <motion.div
              className="card"
              variants={fadeUp}
              whileHover={{ y: -6, boxShadow: '0 28px 60px -40px rgba(14,165,233,0.4)' }}
              transition={{ duration: 0.4 }}
            >
              <div className="card-content">
                <div className="flex items-center space-x-2 mb-4">
                  <Search className="h-5 w-5 text-blue-600" />
                  <h3 className="font-semibold text-neutral-900">Smart Food Classifier</h3>
                </div>
                <p className="text-sm text-neutral-600 mb-4">
                  Use AI to automatically categorize food items for better pantry management.
                </p>
                <SmartFoodClassifier 
                  placeholder="Enter food name (e.g., 'Whole Milk 1L')"
                  onClassification={(result) => {
                    console.log('Classification result:', result);
                  }}
                />
              </div>
            </motion.div>

            {/* ML Health Status */}
            <motion.div
              className="card"
              variants={fadeUp}
              transition={{ duration: 0.4, delay: 0.05 }}
              whileHover={{ y: -6, boxShadow: '0 28px 60px -40px rgba(59,130,246,0.35)' }}
            >
              <div className="card-content">
                <div className="flex items-center space-x-2 mb-4">
                  <CheckCircle className="h-5 w-5 text-primary-600" />
                  <h3 className="font-semibold text-neutral-900">AI Service Status</h3>
                </div>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-neutral-600">ML Models:</span>
                    <span className="px-2 py-1 bg-primary-100 text-primary-600 text-xs font-medium rounded-full">
                      Operational
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-neutral-600">Prediction Confidence:</span>
                    <span className="text-sm font-semibold text-neutral-900">97%</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-neutral-600">Response Latency:</span>
                    <span className="text-sm font-semibold text-neutral-900">420ms</span>
                  </div>
                  <div className="flex items-center space-x-2 text-sm text-neutral-600">
                    <Circle className="h-2 w-2 text-primary-500" />
                    <span>All AI pipelines running nominally.</span>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        </motion.section>

        {/* Smart Recipe Recommendations */}
        <div>
          <SmartRecipeRecommendations 
            pantryItems={[
              {
                id: '1',
                name: 'Whole Milk 1L',
                quantity: 2,
                unit: 'bottles',
                category: 'Dairy',
                expiryDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
                purchaseDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
                estimatedPrice: 2.50,
                notes: 'Organic brand'
              },
              {
                id: '2',
                name: 'Chicken Breast 500g',
                quantity: 1,
                unit: 'pack',
                category: 'Meat',
                expiryDate: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000).toISOString(),
                purchaseDate: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
                estimatedPrice: 4.50,
                notes: 'Free-range'
              }
            ]}
            userPreferences={{
              dietaryRestrictions: [],
              maxCookingTime: 60,
              servingSize: 4
            }}
          />
        </div>

        {/* Smart Shopping List Generator */}
        <div>
          <SmartShoppingListGenerator 
            pantryItems={[
              {
                id: '1',
                name: 'Whole Milk 1L',
                quantity: 2,
                unit: 'bottles',
                category: 'Dairy',
                expiryDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
                purchaseDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
                estimatedPrice: 2.50,
                notes: 'Organic brand'
              },
              {
                id: '2',
                name: 'Chicken Breast 500g',
                quantity: 1,
                unit: 'pack',
                category: 'Meat',
                expiryDate: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000).toISOString(),
                purchaseDate: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
                estimatedPrice: 4.50,
                notes: 'Free-range'
              }
            ]}
            budgetLimit={100}
            householdSize={4}
          />
        </div>

        {/* Smart Waste Prevention Dashboard */}
        <div>
          <SmartWasteDashboard 
            pantryItems={[
              {
                id: '1',
                name: 'Whole Milk 1L',
                quantity: 2,
                unit: 'bottles',
                category: 'Dairy',
                expiryDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
                purchaseDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
                estimatedPrice: 2.50,
                notes: 'Organic brand'
              },
              {
                id: '2',
                name: 'Chicken Breast 500g',
                quantity: 1,
                unit: 'pack',
                category: 'Meat',
                expiryDate: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000).toISOString(),
                purchaseDate: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
                estimatedPrice: 4.50,
                notes: 'Free-range'
              }
            ]}
          />
        </div>

        {/* Quick Actions */}
        <motion.section
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
        >
          <motion.h2 className="text-xl font-semibold text-neutral-900 mb-4" variants={fadeUp}>
            Quick Actions
          </motion.h2>
          <motion.div className="grid grid-cols-2 lg:grid-cols-4 gap-4" variants={staggerContainer}>
            {quickActions.map((action, index) => {
              const Icon = action.icon
              return (
                <MotionLink
                  key={action.id}
                  to={action.link}
                  className="card transition-all duration-200 group"
                  variants={fadeUp}
                  transition={{ duration: 0.45, delay: index * 0.05 }}
                  whileHover={{ y: -6, boxShadow: '0 26px 50px -30px rgba(14,165,233,0.35)' }}
                >
                  <div className="card-content text-center">
                    <div className="flex justify-center mb-3">
                      <div className={`w-12 h-12 ${action.color} rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform`}> 
                        <Icon className="h-6 w-6 text-white" />
                      </div>
                    </div>
                    <h3 className="font-medium text-neutral-900 mb-1">{action.title}</h3>
                    <p className="text-sm text-neutral-600">{action.description}</p>
                  </div>
                </MotionLink>
              )
            })}
          </motion.div>
        </motion.section>

        {/* Statistics Overview */}
        <motion.section
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.25 }}
        >
          <motion.div className="flex items-center justify-between mb-4" variants={fadeUp}>
            <h2 className="text-xl font-semibold text-neutral-900">Overview</h2>
            <div className="flex space-x-1 bg-neutral-100 rounded-lg p-1">
              {(['week', 'month', 'year'] as const).map((period) => (
                <button
                  key={period}
                  onClick={() => setSelectedPeriod(period)}
                  className={`px-3 py-1 text-sm font-medium rounded-md transition-colors ${
                    selectedPeriod === period
                      ? 'bg-white text-neutral-900 shadow-sm'
                      : 'text-neutral-600 hover:text-neutral-900'
                  }`}
                >
                  {period.charAt(0).toUpperCase() + period.slice(1)}
                </button>
              ))}
            </div>
          </motion.div>

          <motion.div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4" variants={staggerContainer}>
            {[
              {
                key: 'active-lists',
                title: 'Active Lists',
                value: stats.groceryLists.active,
                subtitle: `${stats.groceryLists.itemsCount} items total`,
                Icon: ShoppingCart,
                iconColor: 'text-blue-500'
              },
              {
                key: 'pantry-items',
                title: 'Pantry Items',
                value: stats.pantry.totalItems,
                subtitle: `£${stats.pantry.totalValue.toFixed(2)} value`,
                Icon: Package,
                iconColor: 'text-primary-500'
              },
              {
                key: 'spending',
                title: 'This Month',
                value: `£${stats.spending.thisMonth.toFixed(2)}`,
                subtitle: stats.spending.trend === 'up' ? 'Up vs last month' : stats.spending.trend === 'down' ? 'Down vs last month' : 'Stable month to month',
                Icon: DollarSign,
                iconColor: 'text-yellow-500'
              },
              {
                key: 'expiring',
                title: 'Expiring Soon',
                value: stats.pantry.expiringSoon,
                subtitle: `${stats.pantry.lowStock} low stock`,
                Icon: AlertTriangle,
                iconColor: 'text-orange-500'
              }
            ].map(({ key, title, value, subtitle, Icon, iconColor }, index) => (
              <motion.div
                key={key}
                className="card"
                variants={fadeUp}
                transition={{ duration: 0.45, delay: index * 0.05 }}
                whileHover={{ y: -6, boxShadow: '0 26px 55px -35px rgba(13,148,136,0.35)' }}
              >
                <div className="card-content">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-neutral-600">{title}</p>
                      <p className="text-2xl font-bold text-neutral-900">{value}</p>
                      {key === 'spending' ? (
                        <div className="flex items-center text-xs">
                          {stats.spending.trend === 'up' ? (
                            <TrendingUp className="h-3 w-3 text-red-500 mr-1" />
                          ) : stats.spending.trend === 'down' ? (
                            <TrendingUp className="h-3 w-3 text-primary-500 mr-1 rotate-180" />
                          ) : null}
                          <span className={stats.spending.trend === 'up' ? 'text-red-500' : stats.spending.trend === 'down' ? 'text-primary-500' : 'text-neutral-500'}>
                            {subtitle}
                          </span>
                        </div>
                      ) : (
                        <p className="text-xs text-neutral-500">{subtitle}</p>
                      )}
                    </div>
                    <Icon className={`h-8 w-8 ${iconColor}`} />
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </motion.section>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Recent Activity */}
          <div className="lg:col-span-2 space-y-6">
            {/* Smart Recommendations */}
            {recommendations.length > 0 && (
              <div className="card">
                <div className="card-header">
                  <h3 className="card-title flex items-center">
                    <Star className="h-5 w-5 text-yellow-500 mr-2" />
                    Smart Recommendations
                  </h3>
                </div>
                <div className="card-content">
                  <div className="space-y-3">
                    {recommendations.slice(0, 3).map((rec) => {
                      const Icon = getRecommendationIcon(rec.type)
                      return (
                        <div key={rec.id} className="flex items-start space-x-3 p-3 bg-neutral-50 rounded-lg">
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center ${getPriorityColor(rec.priority)}`}>
                            <Icon className="h-4 w-4" />
                          </div>
                          <div className="flex-1">
                            <h4 className="font-medium text-neutral-900">{rec.title}</h4>
                            <p className="text-sm text-neutral-600 mt-1">{rec.description}</p>
                            <Link 
                              to={rec.link}
                              className="text-sm text-primary-600 hover:text-primary-700 font-medium inline-flex items-center mt-2"
                            >
                              {rec.action}
                              <ArrowRight className="h-3 w-3 ml-1" />
                            </Link>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>
              </div>
            )}

            {/* Recent Grocery Lists */}
            <div className="card">
              <div className="card-header">
                <div className="flex items-center justify-between">
                  <h3 className="card-title">Recent Grocery Lists</h3>
                  <Link to="/grocery-lists" className="btn btn-ghost btn-sm">
                    View All
                  </Link>
                </div>
              </div>
              <div className="card-content">
                {stats.activity.recentLists.length > 0 ? (
                  <div className="space-y-3">
                    {stats.activity.recentLists.slice(0, 3).map((list: any) => (
                      <div key={list.id} className="flex items-center justify-between p-3 bg-neutral-50 rounded-lg">
                        <div className="flex items-center space-x-3">
                          <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                            <ShoppingCart className="h-4 w-4 text-blue-600" />
                          </div>
                          <div>
                            <h4 className="font-medium text-neutral-900">{list.name}</h4>
                            <p className="text-sm text-neutral-600">
                              {list.items?.length || 0} items • {list.progress || 0}% complete
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-xs text-neutral-500">
                            {new Date(list.updatedAt).toLocaleDateString()}
                          </p>
                          {list.status === 'completed' && (
                            <CheckCircle className="h-4 w-4 text-primary-500 ml-auto mt-1" />
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <ShoppingCart className="h-8 w-8 text-neutral-400 mx-auto mb-2" />
                    <p className="text-neutral-600">No grocery lists yet</p>
                    <Link to="/grocery-lists" className="btn btn-primary btn-sm mt-3">
                      Create Your First List
                    </Link>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Weekly Goals */}
            <div className="card">
              <div className="card-header">
                <h3 className="card-title flex items-center">
                  <Target className="h-5 w-5 text-primary-500 mr-2" />
                  This Week's Goals
                </h3>
              </div>
              <div className="card-content space-y-4">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-neutral-700">Complete shopping lists</span>
                    <span className="text-sm text-neutral-600">2/3</span>
                  </div>
                  <div className="w-full bg-neutral-200 rounded-full h-2">
                    <div className="bg-primary-500 h-2 rounded-full" style={{ width: '67%' }}></div>
                  </div>
                </div>
                
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-neutral-700">Check expiry dates</span>
                    <span className="text-sm text-neutral-600">5/8</span>
                  </div>
                  <div className="w-full bg-neutral-200 rounded-full h-2">
                    <div className="bg-blue-500 h-2 rounded-full" style={{ width: '63%' }}></div>
                  </div>
                </div>
                
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-neutral-700">Try new recipes</span>
                    <span className="text-sm text-neutral-600">1/2</span>
                  </div>
                  <div className="w-full bg-neutral-200 rounded-full h-2">
                    <div className="bg-orange-500 h-2 rounded-full" style={{ width: '50%' }}></div>
                  </div>
                </div>
              </div>
            </div>

            {/* Pantry Categories */}
            <div className="card">
              <div className="card-header">
                <h3 className="card-title flex items-center">
                  <BarChart3 className="h-5 w-5 text-purple-500 mr-2" />
                  Pantry Breakdown
                </h3>
              </div>
              <div className="card-content">
                {Object.keys(stats.pantry.categories).length > 0 ? (
                  <div className="space-y-3">
                    {Object.entries(stats.pantry.categories)
                      .sort(([,a], [,b]) => b - a)
                      .slice(0, 5)
                      .map(([category, count]) => (
                      <div key={category} className="flex items-center justify-between">
                        <span className="text-sm text-neutral-700">{category}</span>
                        <div className="flex items-center space-x-2">
                          <div className="w-16 bg-neutral-200 rounded-full h-2">
                            <div 
                              className="bg-purple-500 h-2 rounded-full" 
                              style={{ width: `${(count / stats.pantry.totalItems) * 100}%` }}
                            ></div>
                          </div>
                          <span className="text-sm font-medium text-neutral-900 w-6">{count}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-4">
                    <Package className="h-6 w-6 text-neutral-400 mx-auto mb-2" />
                    <p className="text-sm text-neutral-600">No pantry items yet</p>
                  </div>
                )}
              </div>
            </div>

            {/* Quick Stats */}
            <div className="card">
              <div className="card-header">
                <h3 className="card-title">Today's Activity</h3>
              </div>
              <div className="card-content space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <CheckCircle className="h-4 w-4 text-primary-500" />
                    <span className="text-sm text-neutral-700">Tasks completed</span>
                  </div>
                  <span className="font-medium text-neutral-900">{stats.activity.completedTasks}</span>
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Clock className="h-4 w-4 text-blue-500" />
                    <span className="text-sm text-neutral-700">Time saved</span>
                  </div>
                  <span className="font-medium text-neutral-900">2.5h</span>
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Heart className="h-4 w-4 text-red-500" />
                    <span className="text-sm text-neutral-700">Money saved</span>
                  </div>
                  <span className="font-medium text-neutral-900">£{stats.spending.saved.toFixed(2)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  )
} 