import { useState } from 'react'
import { Helmet } from 'react-helmet-async'
import { useQuery } from 'react-query'
import { Link } from 'react-router-dom'
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
  Search
} from 'lucide-react'
import { apiService } from '../services/api'
import { useAuth } from '../hooks/useAuth'
import SmartFoodClassifier from '../components/SmartFoodClassifier'
import SmartRecipeRecommendations from '../components/SmartRecipeRecommendations'
import SmartShoppingListGenerator from '../components/SmartShoppingListGenerator'
import SmartWasteDashboard from '../components/SmartWasteDashboard'

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
    color: 'bg-green-500',
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
    title: 'Ask AI Assistant',
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
        <title>Dashboard - PantryPal</title>
      </Helmet>

      <div className="space-y-6">
        {/* Welcome Header */}
        <div className="relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-green-500 via-green-600 to-green-700 rounded-3xl"></div>
          <div className="absolute inset-0 bg-gradient-to-r from-green-600/20 to-green-700/20 rounded-3xl"></div>
          <div className="relative glass-card rounded-3xl p-8 border border-green-200/20">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-4xl font-bold mb-2 text-green-900">
                  {getGreeting()}, <span className="text-green-600">{(user as any)?.name?.split(' ')[0] || 'there'}</span>!
                </h1>
                <p className="text-lg text-green-700">
                  Here's what's happening with your food management today.
                </p>
              </div>
            <div className="text-right">
              <p className="text-sm text-green-600 font-medium">
                {new Date().toLocaleDateString('en-US', { 
                  weekday: 'long', 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric' 
                })}
              </p>
            </div>
          </div>
          </div>
        </div>

        {/* AI-Powered Features */}
        <div>
          <div className="flex items-center space-x-2 mb-4">
            <Brain className="h-5 w-5 text-purple-600" />
            <h2 className="text-xl font-semibold text-neutral-900">AI-Powered Features</h2>
            <span className="px-2 py-1 bg-purple-100 text-purple-600 text-xs font-medium rounded-full">
              NEW
            </span>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Food Classifier */}
            <div className="card">
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
                    // You could add this to pantry or show a success message
                  }}
                />
              </div>
            </div>

            {/* ML Health Status */}
            <div className="card">
              <div className="card-content">
                <div className="flex items-center space-x-2 mb-4">
                  <CheckCircle className="h-5 w-5 text-green-600" />
                  <h3 className="font-semibold text-neutral-900">AI Service Status</h3>
                </div>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-neutral-600">ML Models:</span>
                    <span className="px-2 py-1 bg-green-100 text-green-600 text-xs font-medium rounded-full">
                      Operational
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-neutral-600">Expiry Predictions:</span>
                    <span className="px-2 py-1 bg-blue-100 text-blue-600 text-xs font-medium rounded-full">
                      Active
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-neutral-600">Waste Predictions:</span>
                    <span className="px-2 py-1 bg-orange-100 text-orange-600 text-xs font-medium rounded-full">
                      Active
                    </span>
                  </div>
                  <div className="bg-purple-50 border border-purple-200 rounded-lg p-3">
                    <div className="flex items-center space-x-2">
                      <Lightbulb className="h-4 w-4 text-purple-600" />
                      <p className="text-sm text-purple-800">
                        <strong>Pro Tip:</strong> AI predictions help reduce food waste by up to 50%!
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

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
        <div>
          <h2 className="text-xl font-semibold text-neutral-900 mb-4">Quick Actions</h2>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {quickActions.map((action) => {
              const Icon = action.icon
              return (
                <Link
                  key={action.id}
                  to={action.link}
                  className="card hover:shadow-medium transition-all duration-200 group"
                >
                  <div className="card-content text-center">
                    <div className="flex justify-center mb-3">
                      <div className={`w-12 h-12 ${action.color} rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform`}>
                        <Icon className="h-6 w-6 text-white" />
                      </div>
                    </div>
                    <h3 className="font-medium text-neutral-900 mb-1">{action.title}</h3>
                    <p className="text-sm text-neutral-600">{action.description}</p>
                  </div>
                </Link>
              )
            })}
          </div>
        </div>

        {/* Statistics Overview */}
        <div>
          <div className="flex items-center justify-between mb-4">
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
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="card">
              <div className="card-content">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-neutral-600">Active Lists</p>
                    <p className="text-2xl font-bold text-neutral-900">{stats.groceryLists.active}</p>
                    <p className="text-xs text-neutral-500">{stats.groceryLists.itemsCount} items total</p>
                  </div>
                  <ShoppingCart className="h-8 w-8 text-blue-500" />
                </div>
              </div>
            </div>
            
            <div className="card">
              <div className="card-content">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-neutral-600">Pantry Items</p>
                    <p className="text-2xl font-bold text-neutral-900">{stats.pantry.totalItems}</p>
                    <p className="text-xs text-neutral-500">£{stats.pantry.totalValue.toFixed(2)} value</p>
                  </div>
                  <Package className="h-8 w-8 text-green-500" />
                </div>
              </div>
            </div>
            
            <div className="card">
              <div className="card-content">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-neutral-600">This Month</p>
                    <p className="text-2xl font-bold text-neutral-900">£{stats.spending.thisMonth.toFixed(2)}</p>
                    <div className="flex items-center text-xs">
                      {stats.spending.trend === 'up' ? (
                        <TrendingUp className="h-3 w-3 text-red-500 mr-1" />
                      ) : stats.spending.trend === 'down' ? (
                        <TrendingUp className="h-3 w-3 text-green-500 mr-1 rotate-180" />
                      ) : null}
                      <span className={stats.spending.trend === 'up' ? 'text-red-500' : 'text-green-500'}>
                        vs last month
                      </span>
                    </div>
                  </div>
                  <DollarSign className="h-8 w-8 text-yellow-500" />
                </div>
              </div>
            </div>
            
            <div className="card">
              <div className="card-content">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-neutral-600">Expiring Soon</p>
                    <p className="text-2xl font-bold text-orange-600">{stats.pantry.expiringSoon}</p>
                    <p className="text-xs text-neutral-500">{stats.pantry.lowStock} low stock</p>
                  </div>
                  <AlertTriangle className="h-8 w-8 text-orange-500" />
                </div>
              </div>
            </div>
          </div>
        </div>

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
                            <CheckCircle className="h-4 w-4 text-green-500 ml-auto mt-1" />
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
                  <Target className="h-5 w-5 text-green-500 mr-2" />
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
                    <div className="bg-green-500 h-2 rounded-full" style={{ width: '67%' }}></div>
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
                    <CheckCircle className="h-4 w-4 text-green-500" />
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