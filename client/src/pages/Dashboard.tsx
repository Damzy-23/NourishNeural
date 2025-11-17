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
  Circle,
  Activity,
  Sparkles
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

      <div className="relative min-h-screen pb-16">
        {/* Subtle gradient background blurs */}
        <motion.div
          className="pointer-events-none fixed top-0 right-0 h-[500px] w-[500px] rounded-full bg-blue-100/40 blur-3xl"
          animate={{ scale: [1, 1.1, 1], opacity: [0.3, 0.5, 0.3] }}
          transition={{ duration: 20, repeat: Infinity, ease: 'easeInOut' }}
        />
        <motion.div
          className="pointer-events-none fixed bottom-0 left-0 h-[400px] w-[400px] rounded-full bg-primary-100/30 blur-3xl"
          animate={{ scale: [1, 1.15, 1], opacity: [0.25, 0.4, 0.25] }}
          transition={{ duration: 25, repeat: Infinity, ease: 'easeInOut' }}
        />

        {/* Header */}
        <motion.div
          className="mb-12"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="flex items-start justify-between">
            <div>
              <motion.h1
                className="text-5xl md:text-6xl font-black text-neutral-900 mb-3"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: 0.1 }}
              >
                {getGreeting()}, <span className="bg-gradient-to-r from-blue-600 via-primary-600 to-blue-500 bg-clip-text text-transparent">{(user as any)?.firstName || 'there'}</span>
              </motion.h1>
              <motion.p
                className="text-lg text-neutral-500 max-w-2xl"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
              >
                Here's your intelligent kitchen overview
              </motion.p>
            </div>
            <motion.div
              className="hidden md:flex items-center space-x-3"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, delay: 0.3 }}
            >
              <div className="text-right">
                <p className="text-sm text-neutral-400 uppercase tracking-wide font-semibold">
                  {new Date().toLocaleDateString('en-US', { weekday: 'long' })}
                </p>
                <p className="text-lg font-bold text-neutral-900">
                  {new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                </p>
              </div>
            </motion.div>
          </div>
        </motion.div>

        {/* Bento Grid Layout */}
        <motion.div
          className="grid grid-cols-1 md:grid-cols-6 lg:grid-cols-12 gap-6 mb-12"
          variants={staggerContainer}
          initial="hidden"
          animate="visible"
        >
          {/* Hero Stat - Active Lists (Large) */}
          <motion.div
            className="md:col-span-3 lg:col-span-4 row-span-2"
            variants={fadeUp}
          >
            <motion.div
              className="relative h-full bg-white rounded-3xl border border-neutral-200/60 overflow-hidden group"
              whileHover={{ y: -4, boxShadow: '0 20px 40px -15px rgba(59, 130, 246, 0.15)' }}
              transition={{ duration: 0.3 }}
            >
              <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-white to-blue-50/50"></div>
              <div className="relative p-8 h-full flex flex-col justify-between">
                <div>
                  <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-blue-500/10 mb-6 group-hover:scale-110 transition-transform duration-300">
                    <ShoppingCart className="w-7 h-7 text-blue-600" />
                  </div>
                  <p className="text-sm font-semibold text-neutral-500 uppercase tracking-wider mb-2">Active Lists</p>
                  <div className="flex items-baseline space-x-3 mb-3">
                    <h2 className="text-7xl font-black text-neutral-900">{stats.groceryLists.active}</h2>
                    <span className="text-2xl font-bold text-neutral-400">/ {stats.groceryLists.total}</span>
                  </div>
                  <p className="text-base text-neutral-600">{stats.groceryLists.itemsCount} items across all lists</p>
                </div>
                <div className="flex items-center space-x-2 text-blue-600 font-medium">
                  <span className="text-sm">View all lists</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            </motion.div>
          </motion.div>

          {/* Pantry Items (Medium) */}
          <motion.div
            className="md:col-span-3 lg:col-span-4"
            variants={fadeUp}
            transition={{ delay: 0.1 }}
          >
            <motion.div
              className="relative h-full bg-white rounded-3xl border border-neutral-200/60 overflow-hidden group"
              whileHover={{ y: -4, boxShadow: '0 20px 40px -15px rgba(14, 165, 233, 0.15)' }}
              transition={{ duration: 0.3 }}
            >
              <div className="absolute inset-0 bg-gradient-to-br from-primary-50 via-white to-primary-50/30"></div>
              <div className="relative p-8">
                <div className="flex items-start justify-between mb-6">
                  <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-primary-500/10 group-hover:scale-110 transition-transform duration-300">
                    <Package className="w-6 h-6 text-primary-600" />
                  </div>
                  <span className="text-xs font-semibold text-neutral-500 uppercase tracking-wider">Pantry</span>
                </div>
                <div className="flex items-baseline space-x-2 mb-2">
                  <h3 className="text-5xl font-black text-neutral-900">{stats.pantry.totalItems}</h3>
                  <span className="text-lg font-bold text-neutral-400">items</span>
                </div>
                <p className="text-sm text-neutral-600">Worth £{stats.pantry.totalValue.toFixed(2)}</p>
              </div>
            </motion.div>
          </motion.div>

          {/* Spending This Month (Medium) */}
          <motion.div
            className="md:col-span-3 lg:col-span-4"
            variants={fadeUp}
            transition={{ delay: 0.15 }}
          >
            <motion.div
              className="relative h-full bg-white rounded-3xl border border-neutral-200/60 overflow-hidden group"
              whileHover={{ y: -4, boxShadow: '0 20px 40px -15px rgba(251, 146, 60, 0.15)' }}
              transition={{ duration: 0.3 }}
            >
              <div className="absolute inset-0 bg-gradient-to-br from-orange-50 via-white to-orange-50/30"></div>
              <div className="relative p-8">
                <div className="flex items-start justify-between mb-6">
                  <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-orange-500/10 group-hover:scale-110 transition-transform duration-300">
                    <DollarSign className="w-6 h-6 text-orange-600" />
                  </div>
                  {stats.spending.trend !== 'stable' && (
                    <div className={`flex items-center space-x-1 px-2 py-1 rounded-lg ${stats.spending.trend === 'up' ? 'bg-red-50' : 'bg-green-50'}`}>
                      <TrendingUp className={`w-4 h-4 ${stats.spending.trend === 'up' ? 'text-red-500' : 'text-green-500 rotate-180'}`} />
                      <span className={`text-xs font-bold ${stats.spending.trend === 'up' ? 'text-red-600' : 'text-green-600'}`}>
                        {stats.spending.trend === 'up' ? 'Up' : 'Down'}
                      </span>
                    </div>
                  )}
                </div>
                <p className="text-xs font-semibold text-neutral-500 uppercase tracking-wider mb-2">This Month</p>
                <h3 className="text-5xl font-black text-neutral-900 mb-2">£{stats.spending.thisMonth.toFixed(2)}</h3>
                <p className="text-sm text-neutral-600">vs £{stats.spending.lastMonth.toFixed(2)} last month</p>
              </div>
            </motion.div>
          </motion.div>

          {/* Expiring Soon (Small Alert) */}
          <motion.div
            className="md:col-span-3 lg:col-span-4"
            variants={fadeUp}
            transition={{ delay: 0.2 }}
          >
            <motion.div
              className="relative h-full bg-white rounded-3xl border border-red-200/60 overflow-hidden group"
              whileHover={{ y: -4, boxShadow: '0 20px 40px -15px rgba(239, 68, 68, 0.15)' }}
              transition={{ duration: 0.3 }}
            >
              <div className="absolute inset-0 bg-gradient-to-br from-red-50 via-white to-red-50/30"></div>
              <div className="relative p-8">
                <div className="flex items-start justify-between mb-4">
                  <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-red-500/10 group-hover:scale-110 transition-transform duration-300">
                    <AlertTriangle className="w-6 h-6 text-red-600" />
                  </div>
                  {stats.pantry.expiringSoon > 0 && (
                    <motion.div
                      className="w-2 h-2 rounded-full bg-red-500"
                      animate={{ scale: [1, 1.3, 1], opacity: [1, 0.5, 1] }}
                      transition={{ duration: 2, repeat: Infinity }}
                    />
                  )}
                </div>
                <p className="text-xs font-semibold text-neutral-500 uppercase tracking-wider mb-2">Expiring Soon</p>
                <div className="flex items-baseline space-x-2 mb-2">
                  <h3 className="text-5xl font-black text-neutral-900">{stats.pantry.expiringSoon}</h3>
                  <span className="text-lg font-bold text-neutral-400">items</span>
                </div>
                <p className="text-sm text-neutral-600">{stats.pantry.lowStock} low stock</p>
              </div>
            </motion.div>
          </motion.div>
        </motion.div>

        {/* Quick Actions - Horizontal Scroll */}
        <motion.div
          className="mb-12"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
        >
          <h2 className="text-2xl font-bold text-neutral-900 mb-6">Quick Actions</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {quickActions.map((action, index) => {
              const Icon = action.icon
              return (
                <MotionLink
                  key={action.id}
                  to={action.link}
                  whileHover={{ y: -6, scale: 1.02 }}
                  transition={{ duration: 0.2, type: 'spring', stiffness: 300 }}
                >
                  <div className="relative bg-white rounded-2xl border border-neutral-200/60 p-6 overflow-hidden group">
                    <div className="absolute inset-0 bg-gradient-to-br from-blue-50/50 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                    <div className="relative">
                      <motion.div
                        className={`inline-flex items-center justify-center w-12 h-12 ${action.color} rounded-xl mb-4 shadow-lg`}
                        whileHover={{ rotate: [0, -10, 10, 0], scale: 1.1 }}
                        transition={{ duration: 0.4 }}
                      >
                        <Icon className="w-6 h-6 text-white" />
                      </motion.div>
                      <h3 className="font-bold text-neutral-900 mb-1 group-hover:text-blue-600 transition-colors">
                        {action.title}
                      </h3>
                      <p className="text-xs text-neutral-600">{action.description}</p>
                    </div>
                  </div>
                </MotionLink>
              )
            })}
          </div>
        </motion.div>

        {/* AI Features Section */}
        <motion.div
          className="mb-12"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.5 }}
        >
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-3">
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-gradient-to-br from-purple-500 to-blue-500 shadow-lg shadow-purple-500/30">
                <Sparkles className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-neutral-900">AI Intelligence</h2>
                <p className="text-sm text-neutral-500">Powered by neural networks</p>
              </div>
            </div>
            <motion.span
              className="px-4 py-2 bg-gradient-to-r from-purple-50 to-blue-50 border border-purple-200/50 text-purple-700 text-xs font-bold rounded-full"
              animate={{ scale: [1, 1.05, 1] }}
              transition={{ duration: 3, repeat: Infinity }}
            >
              ✨ Beta
            </motion.span>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Food Classifier */}
            <motion.div
              className="bg-white rounded-3xl border border-neutral-200/60 p-8 hover:border-blue-300/60 transition-all duration-300"
              whileHover={{ y: -4, boxShadow: '0 20px 40px -15px rgba(59, 130, 246, 0.15)' }}
            >
              <div className="flex items-center space-x-3 mb-6">
                <div className="inline-flex items-center justify-center w-10 h-10 rounded-xl bg-blue-500/10">
                  <Search className="w-5 h-5 text-blue-600" />
                </div>
                <h3 className="text-xl font-bold text-neutral-900">Smart Food Classifier</h3>
              </div>
              <p className="text-sm text-neutral-600 mb-6 leading-relaxed">
                Use AI to automatically categorize food items for better pantry management.
              </p>
              <SmartFoodClassifier
                placeholder="Enter food name (e.g., 'Whole Milk 1L')"
                onClassification={(result) => {
                  console.log('Classification result:', result);
                }}
              />
            </motion.div>

            {/* AI Status */}
            <motion.div
              className="bg-white rounded-3xl border border-neutral-200/60 p-8 hover:border-green-300/60 transition-all duration-300"
              whileHover={{ y: -4, boxShadow: '0 20px 40px -15px rgba(34, 197, 94, 0.15)' }}
            >
              <div className="flex items-center space-x-3 mb-6">
                <div className="inline-flex items-center justify-center w-10 h-10 rounded-xl bg-green-500/10">
                  <Activity className="w-5 h-5 text-green-600" />
                </div>
                <h3 className="text-xl font-bold text-neutral-900">AI Service Status</h3>
              </div>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 rounded-xl bg-gradient-to-r from-green-50 to-transparent border border-green-100">
                  <span className="text-sm font-semibold text-neutral-700">Neural Models</span>
                  <div className="flex items-center space-x-2">
                    <motion.div
                      className="w-2 h-2 rounded-full bg-green-500"
                      animate={{ scale: [1, 1.2, 1], opacity: [1, 0.7, 1] }}
                      transition={{ duration: 2, repeat: Infinity }}
                    />
                    <span className="text-sm font-bold text-green-600">Online</span>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 rounded-xl bg-blue-50 border border-blue-100">
                    <p className="text-xs text-neutral-500 mb-1 font-semibold">Accuracy</p>
                    <p className="text-3xl font-black text-neutral-900">97%</p>
                  </div>
                  <div className="p-4 rounded-xl bg-blue-50 border border-blue-100">
                    <p className="text-xs text-neutral-500 mb-1 font-semibold">Response</p>
                    <p className="text-3xl font-black text-neutral-900">420ms</p>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </motion.div>

        {/* Smart Components */}
        <div className="space-y-8 mb-12">
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

        {/* Bottom Grid - Activity & Insights */}
        <motion.div
          className="grid grid-cols-1 lg:grid-cols-3 gap-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.6 }}
        >
          {/* Recent Activity - 2 columns */}
          <div className="lg:col-span-2 space-y-6">
            {/* Recommendations */}
            {recommendations.length > 0 && (
              <div className="bg-white rounded-3xl border border-neutral-200/60 p-8">
                <div className="flex items-center space-x-3 mb-6">
                  <Star className="h-6 w-6 text-yellow-500" />
                  <h3 className="text-xl font-bold text-neutral-900">Smart Recommendations</h3>
                </div>
                <div className="space-y-3">
                  {recommendations.slice(0, 3).map((rec) => {
                    const Icon = getRecommendationIcon(rec.type)
                    return (
                      <motion.div
                        key={rec.id}
                        className="flex items-start space-x-4 p-4 bg-neutral-50 rounded-2xl border border-neutral-100 hover:border-blue-200 hover:bg-blue-50/50 transition-all"
                        whileHover={{ x: 4 }}
                      >
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${getPriorityColor(rec.priority)}`}>
                          <Icon className="h-5 w-5" />
                        </div>
                        <div className="flex-1">
                          <h4 className="font-semibold text-neutral-900 mb-1">{rec.title}</h4>
                          <p className="text-sm text-neutral-600 mb-2">{rec.description}</p>
                          <Link
                            to={rec.link}
                            className="text-sm text-blue-600 hover:text-blue-700 font-medium inline-flex items-center group"
                          >
                            {rec.action}
                            <ArrowRight className="h-4 w-4 ml-1 group-hover:translate-x-1 transition-transform" />
                          </Link>
                        </div>
                      </motion.div>
                    )
                  })}
                </div>
              </div>
            )}

            {/* Recent Lists */}
            <div className="bg-white rounded-3xl border border-neutral-200/60 p-8">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-neutral-900">Recent Lists</h3>
                <Link to="/grocery-lists" className="text-sm font-semibold text-blue-600 hover:text-blue-700">
                  View all
                </Link>
              </div>
              {stats.activity.recentLists.length > 0 ? (
                <div className="space-y-3">
                  {stats.activity.recentLists.slice(0, 3).map((list: any) => (
                    <motion.div
                      key={list.id}
                      className="flex items-center justify-between p-4 bg-neutral-50 rounded-2xl border border-neutral-100 hover:border-blue-200 hover:bg-blue-50/50 transition-all"
                      whileHover={{ x: 4 }}
                    >
                      <div className="flex items-center space-x-4">
                        <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
                          <ShoppingCart className="h-5 w-5 text-blue-600" />
                        </div>
                        <div>
                          <h4 className="font-semibold text-neutral-900">{list.name}</h4>
                          <p className="text-sm text-neutral-600">
                            {list.items?.length || 0} items • {list.progress || 0}% complete
                          </p>
                        </div>
                      </div>
                      {list.status === 'completed' && (
                        <CheckCircle className="h-5 w-5 text-green-500" />
                      )}
                    </motion.div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <ShoppingCart className="h-12 w-12 text-neutral-300 mx-auto mb-3" />
                  <p className="text-neutral-600 mb-4">No grocery lists yet</p>
                  <Link to="/grocery-lists" className="btn btn-primary">
                    Create Your First List
                  </Link>
                </div>
              )}
            </div>
          </div>

          {/* Sidebar - 1 column */}
          <div className="space-y-6">
            {/* Goals */}
            <div className="bg-white rounded-3xl border border-neutral-200/60 p-8">
              <div className="flex items-center space-x-3 mb-6">
                <Target className="h-6 w-6 text-primary-500" />
                <h3 className="text-xl font-bold text-neutral-900">Weekly Goals</h3>
              </div>
              <div className="space-y-5">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-neutral-700">Shopping lists</span>
                    <span className="text-sm font-bold text-neutral-900">2/3</span>
                  </div>
                  <div className="w-full bg-neutral-100 rounded-full h-2 overflow-hidden">
                    <motion.div
                      className="bg-gradient-to-r from-primary-500 to-blue-500 h-2 rounded-full"
                      initial={{ width: 0 }}
                      animate={{ width: '67%' }}
                      transition={{ duration: 1, delay: 0.2 }}
                    />
                  </div>
                </div>
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-neutral-700">Expiry checks</span>
                    <span className="text-sm font-bold text-neutral-900">5/8</span>
                  </div>
                  <div className="w-full bg-neutral-100 rounded-full h-2 overflow-hidden">
                    <motion.div
                      className="bg-gradient-to-r from-blue-500 to-blue-600 h-2 rounded-full"
                      initial={{ width: 0 }}
                      animate={{ width: '63%' }}
                      transition={{ duration: 1, delay: 0.3 }}
                    />
                  </div>
                </div>
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-neutral-700">New recipes</span>
                    <span className="text-sm font-bold text-neutral-900">1/2</span>
                  </div>
                  <div className="w-full bg-neutral-100 rounded-full h-2 overflow-hidden">
                    <motion.div
                      className="bg-gradient-to-r from-orange-500 to-red-500 h-2 rounded-full"
                      initial={{ width: 0 }}
                      animate={{ width: '50%' }}
                      transition={{ duration: 1, delay: 0.4 }}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Pantry Breakdown */}
            <div className="bg-white rounded-3xl border border-neutral-200/60 p-8">
              <div className="flex items-center space-x-3 mb-6">
                <BarChart3 className="h-6 w-6 text-purple-500" />
                <h3 className="text-xl font-bold text-neutral-900">Pantry Mix</h3>
              </div>
              {Object.keys(stats.pantry.categories).length > 0 ? (
                <div className="space-y-4">
                  {Object.entries(stats.pantry.categories)
                    .sort(([,a], [,b]) => b - a)
                    .slice(0, 5)
                    .map(([category, count]) => (
                    <div key={category} className="flex items-center justify-between">
                      <span className="text-sm font-medium text-neutral-700">{category}</span>
                      <div className="flex items-center space-x-3">
                        <div className="w-20 bg-neutral-100 rounded-full h-2 overflow-hidden">
                          <motion.div
                            className="bg-gradient-to-r from-purple-500 to-blue-500 h-2 rounded-full"
                            initial={{ width: 0 }}
                            animate={{ width: `${(count / stats.pantry.totalItems) * 100}%` }}
                            transition={{ duration: 1, delay: 0.2 }}
                          />
                        </div>
                        <span className="text-sm font-bold text-neutral-900 w-8 text-right">{count}</span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Package className="h-10 w-10 text-neutral-300 mx-auto mb-3" />
                  <p className="text-sm text-neutral-600">No items yet</p>
                </div>
              )}
            </div>

            {/* Today's Activity */}
            <div className="bg-white rounded-3xl border border-neutral-200/60 p-8">
              <h3 className="text-xl font-bold text-neutral-900 mb-6">Today</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <CheckCircle className="h-5 w-5 text-green-500" />
                    <span className="text-sm font-medium text-neutral-700">Tasks done</span>
                  </div>
                  <span className="font-bold text-neutral-900">{stats.activity.completedTasks}</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <Clock className="h-5 w-5 text-blue-500" />
                    <span className="text-sm font-medium text-neutral-700">Time saved</span>
                  </div>
                  <span className="font-bold text-neutral-900">2.5h</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <Heart className="h-5 w-5 text-red-500" />
                    <span className="text-sm font-medium text-neutral-700">Money saved</span>
                  </div>
                  <span className="font-bold text-neutral-900">£{stats.spending.saved.toFixed(2)}</span>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </>
  )
}
