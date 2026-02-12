import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from 'react-query'
import toast from 'react-hot-toast'
import { motion } from 'framer-motion'
import { useAuth } from '../hooks/useAuth'
import { apiService } from '../services/api'
import {
  Recycle,
  ArrowRightLeft,
  Calculator,
  Target,
  Users,
  Brain,
  TrendingDown,
  ChefHat,
  AlertTriangle,
  ThumbsUp,
  ThumbsDown,
  Clock,
  Plus,
  RefreshCw,
  Sparkles,
  Zap,
  Search,
  X,
  ShoppingBasket,
  ChefHat as ChefIcon,
  Calendar,
  ShoppingBag,
  CheckCircle,
  Trash2
} from 'lucide-react'

// Types
interface ExpiringItem {
  id: string
  name: string
  quantity: number
  unit: string
  expiryDate: string
  daysUntilExpiry: number
}

interface LeftoverRecipe {
  id: string
  name: string
  matchingIngredients: string[]
  missingIngredients: string[]
  matchScore: number
  prepTime: number
  servings: number
  imageUrl?: string
  extendedIngredients?: string[]
  instructions?: string[]
}

interface Substitution {
  original: string
  substitute: string
  ratio: string
  notes: string
  quality: 'excellent' | 'good' | 'acceptable'
}

interface CostBreakdown {
  ingredient: string
  quantity: string
  pricePerUnit: number
  totalCost: number
  store: string
}

interface NutritionGoal {
  id: string
  nutrient: string
  target: number
  current: number
  unit: string
}

interface MealVote {
  mealId: string
  mealName: string
  votes: { memberId: string; memberName: string; vote: 'yes' | 'no' | 'maybe' }[]
  totalYes: number
  totalNo: number
}

interface DepletionPrediction {
  itemName: string
  currentQuantity: number
  unit: string
  predictedDaysUntilEmpty: number
  avgDailyUsage: number
  suggestedReorderDate: string
  autoAddToList: boolean
}

interface WasteStats {
  summary: {
    totalItems: number
    totalLoss: number
    mostWastedCategory: string | null
    mostCommonReason: string | null
  }
  categories: { name: string; count: number; value: number }[]
  reasons: Record<string, number>
  logs: any[]
}

interface Meal {
  id: string
  name: string
  ingredients: string[]
  tags: string[]
}

interface WeeklyPlan {
  [day: string]: {
    [type: string]: Meal
  }
}

interface ShoppingListItem {
  name: string
  quantity: number
  checked: boolean
}

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 }
}

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1 }
  }
}

export default function SmartFeatures() {
  const { user } = useAuth()
  const queryClient = useQueryClient()
  const [activeTab, setActiveTab] = useState<'leftover' | 'substitution' | 'cost' | 'nutrition' | 'voting' | 'depletion' | 'meal-planner' | 'waste'>('meal-planner')

  // State for Meal Planner
  const [weeklyPlan, setWeeklyPlan] = useState<WeeklyPlan | null>(null)
  const [shoppingList, setShoppingList] = useState<ShoppingListItem[]>([])
  const [isGeneratingPlan, setIsGeneratingPlan] = useState(false)

  // State for Waste Prediction
  const [predictCategory, setPredictCategory] = useState('Dairy')
  const [predictStorage, setPredictStorage] = useState('fridge')
  const [predictPrice, setPredictPrice] = useState('2.50')
  const [predictionResult, setPredictionResult] = useState<any>(null)
  const [isPredicting, setIsPredicting] = useState(false)

  const handlePredictWaste = async () => {
    setIsPredicting(true)
    try {
      const res = await apiService.post('/api/waste/predict', {
        food_item: {
          category: predictCategory,
          storage_type: predictStorage,
          estimated_price: parseFloat(predictPrice) || 0,
          purchase_date: new Date().toISOString()
        },
        user_history: []
      })
      setPredictionResult(res)
    } catch (err) {
      toast.error('Prediction failed')
    } finally {
      setIsPredicting(false)
    }
  }

  // State for each feature
  const [substitutionQuery, setSubstitutionQuery] = useState('')
  const [selectedRecipeForCost, setSelectedRecipeForCost] = useState('')
  const [newGoal, setNewGoal] = useState({ nutrient: '', target: 0, unit: 'g' })
  const [newMealForVote, setNewMealForVote] = useState('')
  const [selectedRecipe, setSelectedRecipe] = useState<LeftoverRecipe | null>(null)

  // Fetch expiring items for leftover matcher
  const { data: expiringItems } = useQuery<ExpiringItem[]>(
    ['expiring-items'],
    async () => {
      const token = localStorage.getItem('pantrypal_token')
      const res = await fetch('/api/smart/expiring-items', {
        headers: { 'Authorization': `Bearer ${token}` }
      })
      return res.json()
    },
    { enabled: !!user }
  )

  // Fetch pantry items for meal planner
  const { data: pantryItems } = useQuery('pantryItems', async () => {
    const token = localStorage.getItem('pantrypal_token')
    const res = await fetch('/api/pantry', {
      headers: { 'Authorization': `Bearer ${token}` }
    })
    const data = await res.json()
    return data.items || []
  }, { enabled: !!user })

  // Fetch leftover recipes
  const { data: leftoverRecipes, refetch: refetchLeftoverRecipes } = useQuery<LeftoverRecipe[]>(
    ['leftover-recipes'],
    async () => {
      const token = localStorage.getItem('pantrypal_token')
      const res = await fetch('/api/smart/leftover-recipes', {
        headers: { 'Authorization': `Bearer ${token}` }
      })
      return res.json()
    },
    { enabled: !!user }
  )

  // Fetch substitutions
  const { data: substitutions, refetch: refetchSubstitutions } = useQuery<Substitution[]>(
    ['substitutions', substitutionQuery],
    async () => {
      if (!substitutionQuery) return []
      const token = localStorage.getItem('pantrypal_token')
      const res = await fetch(`/api/smart/substitutions?ingredient=${encodeURIComponent(substitutionQuery)}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      })
      return res.json()
    },
    { enabled: !!user && !!substitutionQuery }
  )

  // Fetch cost breakdown
  const { data: costBreakdown } = useQuery<{ breakdown: CostBreakdown[], totalCost: number, costPerServing: number }>(
    ['cost-breakdown', selectedRecipeForCost],
    async () => {
      if (!selectedRecipeForCost) return { breakdown: [], totalCost: 0, costPerServing: 0 }
      const token = localStorage.getItem('pantrypal_token')
      const res = await fetch(`/api/smart/cost-breakdown?recipe=${encodeURIComponent(selectedRecipeForCost)}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      })
      return res.json()
    },
    { enabled: !!user && !!selectedRecipeForCost }
  )

  // Fetch nutrition goals
  const { data: nutritionGoals } = useQuery<NutritionGoal[]>(
    ['nutrition-goals'],
    async () => {
      const token = localStorage.getItem('pantrypal_token')
      const res = await fetch('/api/smart/nutrition-goals', {
        headers: { 'Authorization': `Bearer ${token}` }
      })
      return res.json()
    },
    { enabled: !!user }
  )

  // Fetch meal votes
  const { data: mealVotes } = useQuery<MealVote[]>(
    ['meal-votes'],
    async () => {
      const token = localStorage.getItem('pantrypal_token')
      const res = await fetch('/api/smart/meal-votes', {
        headers: { 'Authorization': `Bearer ${token}` }
      })
      return res.json()
    },
    { enabled: !!user }
  )

  // Fetch depletion predictions
  const { data: depletionPredictions } = useQuery<DepletionPrediction[]>(
    ['depletion-predictions'],
    async () => {
      const token = localStorage.getItem('pantrypal_token')
      const res = await fetch('/api/smart/depletion-predictions', {
        headers: { 'Authorization': `Bearer ${token}` }
      })
      return res.json()
    },
    { enabled: !!user }
  )

  // Mutations
  const addNutritionGoalMutation = useMutation(
    async (goal: { nutrient: string; target: number; unit: string }) => {
      const token = localStorage.getItem('pantrypal_token')
      const res = await fetch('/api/smart/nutrition-goals', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(goal)
      })
      return res.json()
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['nutrition-goals'])
        setNewGoal({ nutrient: '', target: 0, unit: 'g' })
      }
    }
  )

  const voteMealMutation = useMutation(
    async ({ mealId, vote }: { mealId: string; vote: 'yes' | 'no' | 'maybe' }) => {
      const token = localStorage.getItem('pantrypal_token')
      const res = await fetch('/api/smart/meal-votes', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ mealId, vote, memberId: 'you' })
      })
      return res.json()
    },
    {
      onSuccess: () => queryClient.invalidateQueries(['meal-votes'])
    }
  )

  const addMealForVoteMutation = useMutation(
    async (mealName: string) => {
      const token = localStorage.getItem('pantrypal_token')
      const res = await fetch('/api/smart/meal-votes/add', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ mealName })
      })
      return res.json()
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['meal-votes'])
        setNewMealForVote('')
      }
    }
  )

  const { data: wasteStats, refetch: refetchWasteStats } = useQuery<WasteStats>(
    'waste-stats',
    () => apiService.get('/api/waste/stats'),
    { enabled: activeTab === 'waste' }
  )

  const addToGroceryListMutation = useMutation(
    async ({ name, quantity, unit, category }: { name: string; quantity: number; unit: string; category?: string }) => {
      const token = localStorage.getItem('pantrypal_token')

      // 1. Create a "Smart Restock" list if it doesn't exist (optional, or just add to most recent active list)
      // For simplicity here, we'll create a new list for the day if not passed a list ID, but relying on backend to handle simple item add might be better.
      // We will create a new list called "Smart Restock"

      const res = await fetch('/api/groceries', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          name: `Smart Restock - ${new Date().toLocaleDateString()}`,
          items: [{ name, quantity, unit, category: category || 'Pantry' }]
        })
      })
      return res.json()
    },
    {
      onSuccess: () => {
        // Invalidate queries if needed, or show toast
        queryClient.invalidateQueries(['grocery-lists'])
      }
    }
  )

  const toggleAutoAddMutation = useMutation(
    async ({ itemName, autoAdd }: { itemName: string; autoAdd: boolean }) => {
      const token = localStorage.getItem('pantrypal_token')
      const res = await fetch('/api/smart/depletion-auto-add', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ itemName, autoAdd })
      })
      return res.json()
    },
    {
      onSuccess: () => queryClient.invalidateQueries(['depletion-predictions'])
    }
  )

  const generatePlanMutation = useMutation(
    async () => {
      const token = localStorage.getItem('pantrypal_token')
      const res = await fetch('/api/meal-planner/generate', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          pantryItems: pantryItems || [],
          preferences: { diet: 'Standard' }
        })
      })
      return res.json()
    },
    {
      onSuccess: (data) => {
        setWeeklyPlan(data.plan)
        setIsGeneratingPlan(false)
        // Auto-generate shopping list
        generateListMutation.mutate(data.plan)
      },
      onError: () => {
        setIsGeneratingPlan(false)
      }
    }
  )

  const generateListMutation = useMutation(
    async (plan: WeeklyPlan) => {
      const token = localStorage.getItem('pantrypal_token')
      const res = await fetch('/api/meal-planner/shopping-list', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          plan,
          pantryItems: pantryItems || []
        })
      })
      return res.json()
    },
    {
      onSuccess: (data) => {
        setShoppingList(data.shoppingList)
      }
    }
  )

  const handleGeneratePlan = () => {
    setIsGeneratingPlan(true)
    generatePlanMutation.mutate()
  }

  const tabs = [
    { id: 'leftover', label: 'Leftover Matcher', icon: Recycle, gradient: 'from-emerald-500 to-teal-500' },
    { id: 'substitution', label: 'Substitutions', icon: ArrowRightLeft, gradient: 'from-blue-500 to-cyan-500' },
    { id: 'cost', label: 'Cost Calculator', icon: Calculator, gradient: 'from-green-500 to-emerald-500' },
    { id: 'nutrition', label: 'Nutrition Goals', icon: Target, gradient: 'from-purple-500 to-pink-500' },
    { id: 'voting', label: 'Meal Voting', icon: Users, gradient: 'from-indigo-500 to-purple-500' },
    { id: 'meal-planner', label: 'Meal Planner', icon: Calendar, gradient: 'from-violet-500 to-indigo-500' },
    { id: 'waste', label: 'Waste Analytics', icon: Trash2, gradient: 'from-red-500 to-rose-500' },
    { id: 'depletion', label: 'Depletion Predictor', icon: TrendingDown, gradient: 'from-rose-500 to-orange-500' },
  ]

  const activeTabData = tabs.find(t => t.id === activeTab)

  return (
    <div className="space-y-8">
      {/* Hero Header with Glassmorphism */}
      <motion.div
        className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-primary-500/90 via-accent-500/80 to-purple-600/90 p-8 md:p-10"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        {/* Decorative elements */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-accent-300/20 rounded-full blur-2xl translate-y-1/2 -translate-x-1/2" />

        <div className="relative z-10 flex items-center justify-between">
          <div>
            <div className="flex items-center gap-3 mb-3">
              <div className="p-3 bg-white/20 backdrop-blur-sm rounded-2xl">
                <Sparkles className="w-7 h-7 text-white" />
              </div>
              <span className="px-3 py-1 bg-white/20 backdrop-blur-sm rounded-full text-sm font-medium text-white">
                AI-Powered
              </span>
            </div>
            <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">Smart Features</h1>
            <p className="text-white/80 text-lg max-w-xl">
              Intelligent tools to optimize your meal planning, reduce waste, and save money
            </p>
          </div>
          <div className="hidden md:block">
            <div className="p-4 bg-white/10 backdrop-blur-md rounded-2xl border border-white/20">
              <Zap className="w-12 h-12 text-yellow-300" />
            </div>
          </div>
        </div>
      </motion.div>

      {/* Tab Navigation with Glassmorphism */}
      <motion.div
        className="flex flex-wrap gap-3"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
      >
        {tabs.map((tab, index) => (
          <motion.button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`group relative flex items-center gap-2 px-5 py-3 rounded-2xl text-sm font-semibold transition-all duration-300 ${activeTab === tab.id
              ? 'text-white shadow-lg'
              : 'bg-white/60 dark:bg-neutral-800/60 backdrop-blur-sm border border-white/40 dark:border-neutral-700/40 text-neutral-700 dark:text-neutral-300 hover:bg-white/80 dark:hover:bg-neutral-800/80 hover:shadow-md'
              }`}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 * index }}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            {activeTab === tab.id && (
              <motion.div
                className={`absolute inset-0 bg-gradient-to-r ${tab.gradient} rounded-2xl`}
                layoutId="activeTab"
                transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
              />
            )}
            <span className="relative z-10 flex items-center gap-2">
              <tab.icon className={`w-4 h-4 ${activeTab === tab.id ? 'text-white' : ''}`} />
              <span className="hidden sm:inline">{tab.label}</span>
            </span>
          </motion.button>
        ))}
      </motion.div>

      {/* Feature Content with Glassmorphism */}
      <motion.div
        className="relative overflow-hidden rounded-3xl bg-white/70 dark:bg-neutral-800/70 backdrop-blur-xl border border-white/50 dark:border-neutral-700/50 shadow-xl p-6 md:p-8"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        {/* Subtle gradient background */}
        <div className={`absolute top-0 right-0 w-96 h-96 bg-gradient-to-br ${activeTabData?.gradient} opacity-5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2`} />

        {/* 1. Smart Leftover Recipe Matcher */}
        {activeTab === 'leftover' && (
          <motion.div
            className="space-y-6 relative z-10"
            variants={staggerContainer}
            initial="hidden"
            animate="visible"
          >
            <motion.div className="flex items-center justify-between" variants={fadeUp}>
              <div>
                <h2 className="text-2xl font-bold text-neutral-900 dark:text-neutral-100 flex items-center gap-3">
                  <div className="p-2 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-xl">
                    <Recycle className="w-5 h-5 text-white" />
                  </div>
                  Smart Leftover Recipe Matcher
                </h2>
                <p className="text-neutral-600 dark:text-neutral-400 mt-1">
                  Recipes using ingredients nearing expiration
                </p>
              </div>
              <motion.button
                onClick={() => refetchLeftoverRecipes()}
                className="p-3 bg-neutral-100/80 dark:bg-neutral-700/80 hover:bg-neutral-200 dark:hover:bg-neutral-600 rounded-xl transition-colors"
                whileHover={{ rotate: 180 }}
                transition={{ duration: 0.3 }}
              >
                <RefreshCw className="w-5 h-5 text-neutral-600 dark:text-neutral-400" />
              </motion.button>
            </motion.div>

            {/* Expiring Items Alert */}
            {expiringItems && expiringItems.length > 0 && (
              <motion.div
                className="bg-gradient-to-r from-amber-500/10 to-orange-500/10 backdrop-blur-sm border border-amber-200/50 dark:border-amber-700/50 rounded-2xl p-5"
                variants={fadeUp}
              >
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 bg-amber-500/20 rounded-lg">
                    <AlertTriangle className="w-5 h-5 text-amber-600 dark:text-amber-400" />
                  </div>
                  <span className="font-semibold text-amber-800 dark:text-amber-200">Items Expiring Soon</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {expiringItems.map(item => (
                    <motion.span
                      key={item.id}
                      className={`px-4 py-2 rounded-xl text-sm font-medium backdrop-blur-sm ${item.daysUntilExpiry <= 1
                        ? 'bg-red-500/20 text-red-700 dark:text-red-300 border border-red-300/50'
                        : item.daysUntilExpiry <= 3
                          ? 'bg-amber-500/20 text-amber-700 dark:text-amber-300 border border-amber-300/50'
                          : 'bg-yellow-500/20 text-yellow-700 dark:text-yellow-300 border border-yellow-300/50'
                        }`}
                      whileHover={{ scale: 1.05 }}
                    >
                      {item.name} ({item.daysUntilExpiry}d)
                    </motion.span>
                  ))}
                </div>
              </motion.div>
            )}

            {/* Recipe Suggestions */}
            <motion.div className="grid gap-4 md:grid-cols-2" variants={staggerContainer}>
              {leftoverRecipes?.map(recipe => (
                <motion.div
                  key={recipe.id}
                  className="group relative overflow-hidden bg-white/50 dark:bg-neutral-800/50 backdrop-blur-sm border border-white/60 dark:border-neutral-700/60 rounded-2xl p-5 hover:shadow-xl transition-all duration-300"
                  variants={fadeUp}
                  whileHover={{ y: -4 }}
                >
                  <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-primary-500/10 to-accent-500/10 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-500" />

                  <div className="relative z-10">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h3 className="font-bold text-neutral-900 dark:text-neutral-100 text-lg">{recipe.name}</h3>
                        <div className="flex items-center gap-3 text-sm text-neutral-500 dark:text-neutral-400 mt-1">
                          <span className="flex items-center gap-1">
                            <Clock className="w-3.5 h-3.5" />
                            {recipe.prepTime} min
                          </span>
                          <span>{recipe.servings} servings</span>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className={`text-2xl font-bold ${recipe.matchScore >= 80 ? 'text-emerald-500' :
                          recipe.matchScore >= 60 ? 'text-amber-500' : 'text-neutral-400'
                          }`}>
                          {recipe.matchScore}%
                        </div>
                        <p className="text-xs text-neutral-500">match</p>
                      </div>
                    </div>

                    <div className="space-y-3">
                      <div>
                        <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 uppercase tracking-wide">You have</span>
                        <div className="flex flex-wrap gap-1.5 mt-1.5">
                          {recipe.matchingIngredients.map(ing => (
                            <span key={ing} className="px-2.5 py-1 bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 rounded-lg text-xs font-medium">
                              {ing}
                            </span>
                          ))}
                        </div>
                      </div>
                      {recipe.missingIngredients.length > 0 && (
                        <div>
                          <span className="text-xs font-semibold text-neutral-500 uppercase tracking-wide">Missing</span>
                          <div className="flex flex-wrap gap-1.5 mt-1.5">
                            {recipe.missingIngredients.map(ing => (
                              <span key={ing} className="px-2.5 py-1 bg-neutral-200/50 dark:bg-neutral-700/50 text-neutral-600 dark:text-neutral-400 rounded-lg text-xs">
                                {ing}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>

                    <motion.button
                      className="w-full mt-5 py-3 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white rounded-xl text-sm font-semibold shadow-lg shadow-emerald-500/25 transition-all"
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => setSelectedRecipe(recipe)}
                    >
                      View Recipe
                    </motion.button>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          </motion.div>
        )}

        {/* 2. Ingredient Substitution Engine */}
        {activeTab === 'substitution' && (
          <motion.div
            className="space-y-6 relative z-10"
            variants={staggerContainer}
            initial="hidden"
            animate="visible"
          >
            <motion.div variants={fadeUp}>
              <h2 className="text-2xl font-bold text-neutral-900 dark:text-neutral-100 flex items-center gap-3">
                <div className="p-2 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-xl">
                  <ArrowRightLeft className="w-5 h-5 text-white" />
                </div>
                Ingredient Substitution Engine
              </h2>
              <p className="text-neutral-600 dark:text-neutral-400 mt-1">
                Find smart substitutes for missing ingredients
              </p>
            </motion.div>

            {/* Search Input */}
            <motion.div className="flex gap-3" variants={fadeUp}>
              <div className="relative flex-1">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-400" />
                <input
                  type="text"
                  value={substitutionQuery}
                  onChange={(e) => setSubstitutionQuery(e.target.value)}
                  placeholder="Enter ingredient to substitute (e.g., buttermilk, eggs)"
                  className="w-full pl-12 pr-4 py-4 bg-white/50 dark:bg-neutral-800/50 backdrop-blur-sm border border-white/60 dark:border-neutral-700/60 rounded-2xl text-neutral-900 dark:text-neutral-100 placeholder:text-neutral-400 focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all"
                />
              </div>
              <motion.button
                onClick={() => refetchSubstitutions()}
                className="px-8 py-4 bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white rounded-2xl font-semibold shadow-lg shadow-blue-500/25 transition-all"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                Find
              </motion.button>
            </motion.div>

            {/* Substitution Results */}
            {substitutions && substitutions.length > 0 && (
              <motion.div className="space-y-4" variants={staggerContainer}>
                {substitutions.map((sub, idx) => (
                  <motion.div
                    key={idx}
                    className="bg-white/50 dark:bg-neutral-800/50 backdrop-blur-sm border border-white/60 dark:border-neutral-700/60 rounded-2xl p-5 hover:shadow-lg transition-all"
                    variants={fadeUp}
                  >
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-4">
                        <span className="text-neutral-400 line-through">{sub.original}</span>
                        <ArrowRightLeft className="w-4 h-4 text-blue-500" />
                        <span className="font-bold text-neutral-900 dark:text-neutral-100">{sub.substitute}</span>
                      </div>
                      <span className={`px-3 py-1.5 rounded-xl text-xs font-bold ${sub.quality === 'excellent' ? 'bg-emerald-500/20 text-emerald-600 dark:text-emerald-400' :
                        sub.quality === 'good' ? 'bg-blue-500/20 text-blue-600 dark:text-blue-400' :
                          'bg-amber-500/20 text-amber-600 dark:text-amber-400'
                        }`}>
                        {sub.quality.toUpperCase()}
                      </span>
                    </div>
                    <div className="bg-neutral-100/50 dark:bg-neutral-700/50 rounded-xl p-4">
                      <p className="text-sm font-semibold text-neutral-800 dark:text-neutral-200 mb-1">Ratio: {sub.ratio}</p>
                      <p className="text-sm text-neutral-600 dark:text-neutral-400">{sub.notes}</p>
                    </div>
                  </motion.div>
                ))}
              </motion.div>
            )}

            {/* Popular Searches */}
            <motion.div variants={fadeUp}>
              <h3 className="text-sm font-semibold text-neutral-700 dark:text-neutral-300 mb-3 uppercase tracking-wide">Popular Searches</h3>
              <div className="flex flex-wrap gap-2">
                {['Buttermilk', 'Eggs', 'Heavy Cream', 'Butter', 'Honey', 'Sour Cream'].map(ing => (
                  <motion.button
                    key={ing}
                    onClick={() => setSubstitutionQuery(ing)}
                    className="px-4 py-2 bg-white/50 dark:bg-neutral-700/50 backdrop-blur-sm border border-white/60 dark:border-neutral-600/60 text-neutral-700 dark:text-neutral-300 rounded-xl text-sm font-medium hover:bg-blue-500/10 hover:border-blue-500/30 hover:text-blue-600 dark:hover:text-blue-400 transition-all"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    {ing}
                  </motion.button>
                ))}
              </div>
            </motion.div>
          </motion.div>
        )}

        {/* 3. Meal Prep Cost Calculator */}
        {activeTab === 'cost' && (
          <motion.div
            className="space-y-6 relative z-10"
            variants={staggerContainer}
            initial="hidden"
            animate="visible"
          >
            <motion.div variants={fadeUp}>
              <h2 className="text-2xl font-bold text-neutral-900 dark:text-neutral-100 flex items-center gap-3">
                <div className="p-2 bg-gradient-to-br from-green-500 to-emerald-500 rounded-xl">
                  <Calculator className="w-5 h-5 text-white" />
                </div>
                Meal Prep Cost Calculator
              </h2>
              <p className="text-neutral-600 dark:text-neutral-400 mt-1">
                Real-time cost breakdown by ingredient and store
              </p>
            </motion.div>

            {/* Recipe Selector */}
            <motion.div variants={fadeUp}>
              <label className="block text-sm font-semibold text-neutral-700 dark:text-neutral-300 mb-2">
                Select Recipe
              </label>
              <select
                value={selectedRecipeForCost}
                onChange={(e) => setSelectedRecipeForCost(e.target.value)}
                className="w-full px-4 py-4 bg-white/50 dark:bg-neutral-800/50 backdrop-blur-sm border border-white/60 dark:border-neutral-700/60 rounded-2xl text-neutral-900 dark:text-neutral-100 focus:ring-2 focus:ring-green-500/50"
              >
                <option value="">Choose a recipe...</option>
                <option value="spaghetti-bolognese">Spaghetti Bolognese</option>
                <option value="chicken-stir-fry">Chicken Stir Fry</option>
                <option value="vegetable-curry">Vegetable Curry</option>
                <option value="grilled-salmon">Grilled Salmon</option>
              </select>
            </motion.div>

            {/* Cost Breakdown */}
            {costBreakdown && costBreakdown.breakdown.length > 0 && (
              <motion.div className="space-y-4" variants={fadeUp}>
                <div className="overflow-hidden rounded-2xl border border-white/60 dark:border-neutral-700/60">
                  <table className="w-full">
                    <thead className="bg-neutral-100/50 dark:bg-neutral-700/50">
                      <tr>
                        <th className="text-left py-4 px-5 text-sm font-semibold text-neutral-600 dark:text-neutral-400">Ingredient</th>
                        <th className="text-left py-4 px-5 text-sm font-semibold text-neutral-600 dark:text-neutral-400">Quantity</th>
                        <th className="text-left py-4 px-5 text-sm font-semibold text-neutral-600 dark:text-neutral-400">Store</th>
                        <th className="text-right py-4 px-5 text-sm font-semibold text-neutral-600 dark:text-neutral-400">Cost</th>
                      </tr>
                    </thead>
                    <tbody>
                      {costBreakdown.breakdown.map((item, idx) => (
                        <tr key={idx} className="border-t border-neutral-200/50 dark:border-neutral-700/50">
                          <td className="py-4 px-5 font-medium text-neutral-900 dark:text-neutral-100">{item.ingredient}</td>
                          <td className="py-4 px-5 text-neutral-600 dark:text-neutral-400">{item.quantity}</td>
                          <td className="py-4 px-5">
                            <span className="px-3 py-1 bg-neutral-100/50 dark:bg-neutral-700/50 rounded-lg text-xs font-medium text-neutral-600 dark:text-neutral-300">
                              {item.store}
                            </span>
                          </td>
                          <td className="py-4 px-5 text-right font-bold text-neutral-900 dark:text-neutral-100">
                            £{item.totalCost.toFixed(2)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Summary */}
                <div className="bg-gradient-to-r from-green-500/10 to-emerald-500/10 backdrop-blur-sm border border-green-200/50 dark:border-green-700/50 rounded-2xl p-6">
                  <div className="flex justify-between items-center mb-3">
                    <span className="text-neutral-600 dark:text-neutral-400 font-medium">Total Cost</span>
                    <span className="text-3xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
                      £{costBreakdown.totalCost.toFixed(2)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-neutral-600 dark:text-neutral-400">Cost per Serving</span>
                    <span className="text-xl font-bold text-green-600 dark:text-green-400">
                      £{costBreakdown.costPerServing.toFixed(2)}
                    </span>
                  </div>
                </div>
              </motion.div>
            )}
          </motion.div>
        )}

        {/* 4. Nutrition Goal Tracker */}
        {activeTab === 'nutrition' && (
          <motion.div
            className="space-y-6 relative z-10"
            variants={staggerContainer}
            initial="hidden"
            animate="visible"
          >
            <motion.div variants={fadeUp}>
              <h2 className="text-2xl font-bold text-neutral-900 dark:text-neutral-100 flex items-center gap-3">
                <div className="p-2 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl">
                  <Target className="w-5 h-5 text-white" />
                </div>
                Nutrition Goal Tracker
              </h2>
              <p className="text-neutral-600 dark:text-neutral-400 mt-1">
                Set and track weekly nutrition targets
              </p>
            </motion.div>

            {/* Add New Goal */}
            <motion.div className="flex gap-3 items-end flex-wrap" variants={fadeUp}>
              <div className="flex-1 min-w-[200px]">
                <label className="block text-sm font-semibold text-neutral-700 dark:text-neutral-300 mb-2">Nutrient</label>
                <input
                  type="text"
                  value={newGoal.nutrient}
                  onChange={(e) => setNewGoal({ ...newGoal, nutrient: e.target.value })}
                  placeholder="e.g., Protein, Fiber"
                  className="w-full px-4 py-3 bg-white/50 dark:bg-neutral-800/50 backdrop-blur-sm border border-white/60 dark:border-neutral-700/60 rounded-xl text-neutral-900 dark:text-neutral-100"
                />
              </div>
              <div className="w-28">
                <label className="block text-sm font-semibold text-neutral-700 dark:text-neutral-300 mb-2">Target</label>
                <input
                  type="number"
                  value={newGoal.target}
                  onChange={(e) => setNewGoal({ ...newGoal, target: parseInt(e.target.value) })}
                  className="w-full px-4 py-3 bg-white/50 dark:bg-neutral-800/50 backdrop-blur-sm border border-white/60 dark:border-neutral-700/60 rounded-xl text-neutral-900 dark:text-neutral-100"
                />
              </div>
              <div className="w-24">
                <label className="block text-sm font-semibold text-neutral-700 dark:text-neutral-300 mb-2">Unit</label>
                <select
                  value={newGoal.unit}
                  onChange={(e) => setNewGoal({ ...newGoal, unit: e.target.value })}
                  className="w-full px-3 py-3 bg-white/50 dark:bg-neutral-800/50 backdrop-blur-sm border border-white/60 dark:border-neutral-700/60 rounded-xl text-neutral-900 dark:text-neutral-100"
                >
                  <option value="g">g</option>
                  <option value="mg">mg</option>
                  <option value="mcg">mcg</option>
                  <option value="cal">cal</option>
                </select>
              </div>
              <motion.button
                onClick={() => addNutritionGoalMutation.mutate(newGoal)}
                className="p-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl shadow-lg shadow-purple-500/25"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Plus className="w-5 h-5" />
              </motion.button>
            </motion.div>

            {/* Goals Progress */}
            <motion.div className="space-y-4" variants={staggerContainer}>
              {nutritionGoals?.map(goal => {
                const progress = (goal.current / goal.target) * 100
                return (
                  <motion.div
                    key={goal.id}
                    className="bg-white/50 dark:bg-neutral-800/50 backdrop-blur-sm border border-white/60 dark:border-neutral-700/60 rounded-2xl p-5"
                    variants={fadeUp}
                  >
                    <div className="flex justify-between items-center mb-3">
                      <span className="font-bold text-neutral-900 dark:text-neutral-100">{goal.nutrient}</span>
                      <span className="text-sm font-medium text-neutral-600 dark:text-neutral-400">
                        {goal.current} / {goal.target} {goal.unit}
                      </span>
                    </div>
                    <div className="w-full bg-neutral-200/50 dark:bg-neutral-700/50 rounded-full h-4 overflow-hidden">
                      <motion.div
                        className={`h-4 rounded-full ${progress >= 100 ? 'bg-gradient-to-r from-emerald-500 to-green-500' :
                          progress >= 75 ? 'bg-gradient-to-r from-blue-500 to-cyan-500' :
                            progress >= 50 ? 'bg-gradient-to-r from-amber-500 to-yellow-500' : 'bg-gradient-to-r from-red-500 to-orange-500'
                          }`}
                        initial={{ width: 0 }}
                        animate={{ width: `${Math.min(progress, 100)}%` }}
                        transition={{ duration: 1, ease: "easeOut" }}
                      />
                    </div>
                    {progress < 100 && (
                      <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-2">
                        Need {goal.target - goal.current} more {goal.unit} to reach goal
                      </p>
                    )}
                  </motion.div>
                )
              })}
            </motion.div>
          </motion.div>
        )}

        {/* 5. Collaborative Household Meal Voting */}
        {activeTab === 'voting' && (
          <motion.div
            className="space-y-6 relative z-10"
            variants={staggerContainer}
            initial="hidden"
            animate="visible"
          >
            <motion.div variants={fadeUp}>
              <h2 className="text-2xl font-bold text-neutral-900 dark:text-neutral-100 flex items-center gap-3">
                <div className="p-2 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-xl">
                  <Users className="w-5 h-5 text-white" />
                </div>
                Collaborative Meal Voting
              </h2>
              <p className="text-neutral-600 dark:text-neutral-400 mt-1">
                Let everyone vote on this week's meals
              </p>
            </motion.div>

            {/* Add Meal for Voting */}
            <motion.div className="flex gap-3" variants={fadeUp}>
              <input
                type="text"
                value={newMealForVote}
                onChange={(e) => setNewMealForVote(e.target.value)}
                placeholder="Suggest a meal for voting..."
                className="flex-1 px-4 py-4 bg-white/50 dark:bg-neutral-800/50 backdrop-blur-sm border border-white/60 dark:border-neutral-700/60 rounded-2xl text-neutral-900 dark:text-neutral-100"
              />
              <motion.button
                onClick={() => addMealForVoteMutation.mutate(newMealForVote)}
                className="px-8 py-4 bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 text-white rounded-2xl font-semibold shadow-lg shadow-indigo-500/25"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                Add to Vote
              </motion.button>
            </motion.div>

            {/* Voting Cards */}
            <motion.div className="space-y-4" variants={staggerContainer}>
              {mealVotes?.map(meal => (
                <motion.div
                  key={meal.mealId}
                  className="bg-white/50 dark:bg-neutral-800/50 backdrop-blur-sm border border-white/60 dark:border-neutral-700/60 rounded-2xl p-5"
                  variants={fadeUp}
                >
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-bold text-neutral-900 dark:text-neutral-100 flex items-center gap-2 text-lg">
                      <ChefHat className="w-5 h-5 text-indigo-500" />
                      {meal.mealName}
                    </h3>
                    <div className="flex items-center gap-4">
                      <span className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400 font-bold">
                        <ThumbsUp className="w-4 h-4" />
                        {meal.totalYes}
                      </span>
                      <span className="flex items-center gap-1.5 text-red-600 dark:text-red-400 font-bold">
                        <ThumbsDown className="w-4 h-4" />
                        {meal.totalNo}
                      </span>
                    </div>
                  </div>

                  {/* Vote Buttons */}
                  <div className="flex gap-2 mb-4">
                    <motion.button
                      onClick={() => voteMealMutation.mutate({ mealId: meal.mealId, vote: 'yes' })}
                      className="flex-1 py-3 bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-700 dark:text-emerald-300 rounded-xl text-sm font-semibold transition-colors"
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      Yes
                    </motion.button>
                    <motion.button
                      onClick={() => voteMealMutation.mutate({ mealId: meal.mealId, vote: 'maybe' })}
                      className="flex-1 py-3 bg-amber-500/15 hover:bg-amber-500/25 text-amber-700 dark:text-amber-300 rounded-xl text-sm font-semibold transition-colors"
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      Maybe
                    </motion.button>
                    <motion.button
                      onClick={() => voteMealMutation.mutate({ mealId: meal.mealId, vote: 'no' })}
                      className="flex-1 py-3 bg-red-500/15 hover:bg-red-500/25 text-red-700 dark:text-red-300 rounded-xl text-sm font-semibold transition-colors"
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      No
                    </motion.button>
                  </div>

                  {/* Member Votes */}
                  <div className="flex flex-wrap gap-2">
                    {meal.votes.map(vote => (
                      <span
                        key={vote.memberId}
                        className={`px-3 py-1.5 rounded-lg text-xs font-medium ${vote.vote === 'yes' ? 'bg-emerald-500/20 text-emerald-700 dark:text-emerald-300' :
                          vote.vote === 'no' ? 'bg-red-500/20 text-red-700 dark:text-red-300' :
                            'bg-amber-500/20 text-amber-700 dark:text-amber-300'
                          }`}
                      >
                        {vote.memberName}: {vote.vote}
                      </span>
                    ))}
                  </div>
                </motion.div>
              ))}
            </motion.div>
          </motion.div>
        )}

        {/* 6. Pantry Depletion Predictor */}
        {activeTab === 'waste' && (
          <motion.div
            className="space-y-6 relative z-10"
            variants={staggerContainer}
            initial="hidden"
            animate="visible"
          >
            <motion.div className="flex items-center justify-between" variants={fadeUp}>
              <div>
                <h2 className="text-2xl font-bold text-neutral-900 dark:text-neutral-100 flex items-center gap-3">
                  <div className="p-2 bg-gradient-to-br from-red-500 to-rose-500 rounded-xl">
                    <Trash2 className="w-5 h-5 text-white" />
                  </div>
                  Smart Waste Analytics
                </h2>
                <p className="text-neutral-600 dark:text-neutral-400 mt-1">
                  Track food waste impact and save money
                </p>
              </div>
              <motion.button
                onClick={() => refetchWasteStats()}
                className="p-3 bg-neutral-100/80 dark:bg-neutral-700/80 hover:bg-neutral-200 dark:hover:bg-neutral-600 rounded-xl transition-colors"
                whileHover={{ rotate: 180 }}
                transition={{ duration: 0.3 }}
              >
                <RefreshCw className="w-5 h-5 text-neutral-600 dark:text-neutral-400" />
              </motion.button>
            </motion.div>

            {/* Stats Summary */}
            <motion.div className="grid grid-cols-2 md:grid-cols-4 gap-4" variants={staggerContainer}>
              <motion.div className="bg-white/50 dark:bg-neutral-800/50 backdrop-blur-sm border border-red-200/50 dark:border-red-900/50 rounded-2xl p-5" variants={fadeUp}>
                <p className="text-sm text-neutral-600 dark:text-neutral-400 mb-1">Total Loss</p>
                <p className="text-2xl font-bold text-red-600 dark:text-red-400">£{wasteStats?.summary.totalLoss.toFixed(2) || '0.00'}</p>
              </motion.div>
              <motion.div className="bg-white/50 dark:bg-neutral-800/50 backdrop-blur-sm border border-neutral-200/50 dark:border-neutral-700/50 rounded-2xl p-5" variants={fadeUp}>
                <p className="text-sm text-neutral-600 dark:text-neutral-400 mb-1">Items Wasted</p>
                <p className="text-2xl font-bold text-neutral-900 dark:text-neutral-100">{wasteStats?.summary.totalItems || 0}</p>
              </motion.div>
              <motion.div className="bg-white/50 dark:bg-neutral-800/50 backdrop-blur-sm border border-neutral-200/50 dark:border-neutral-700/50 rounded-2xl p-5" variants={fadeUp}>
                <p className="text-sm text-neutral-600 dark:text-neutral-400 mb-1">Most Wasted</p>
                <p className="text-lg font-bold text-neutral-900 dark:text-neutral-100 truncate">{wasteStats?.summary.mostWastedCategory || '-'}</p>
              </motion.div>
              <motion.div className="bg-white/50 dark:bg-neutral-800/50 backdrop-blur-sm border border-neutral-200/50 dark:border-neutral-700/50 rounded-2xl p-5" variants={fadeUp}>
                <p className="text-sm text-neutral-600 dark:text-neutral-400 mb-1">Common Reason</p>
                <p className="text-lg font-bold text-neutral-900 dark:text-neutral-100 truncate capitalize">{wasteStats?.summary.mostCommonReason?.replace(/_/g, ' ') || '-'}</p>
              </motion.div>
            </motion.div>

            {/* Category Breakdown (Simple Bar Chart Visualization) */}
            {wasteStats?.categories && wasteStats.categories.length > 0 && (
              <motion.div
                className="bg-white/50 dark:bg-neutral-800/50 backdrop-blur-sm border border-white/60 dark:border-neutral-700/60 rounded-2xl p-6"
                variants={fadeUp}
              >
                <h3 className="font-semibold text-neutral-900 dark:text-neutral-100 mb-4">Loss by Category</h3>
                <div className="space-y-3">
                  {wasteStats.categories.map((cat, idx) => (
                    <div key={idx} className="space-y-1">
                      <div className="flex justify-between text-sm">
                        <span className="font-medium text-neutral-700 dark:text-neutral-300">{cat.name}</span>
                        <span className="text-neutral-500">£{cat.value.toFixed(2)}</span>
                      </div>
                      <div className="h-2 bg-neutral-100 dark:bg-neutral-700 rounded-full overflow-hidden">
                        <motion.div
                          className="h-full bg-gradient-to-r from-red-500 to-rose-500"
                          initial={{ width: 0 }}
                          animate={{ width: `${(cat.value / (wasteStats.summary.totalLoss || 1)) * 100}%` }}
                          transition={{ duration: 1, delay: idx * 0.1 }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}

            {/* Recent Logs Table */}
            {wasteStats?.logs && wasteStats.logs.length > 0 && (
              <motion.div className="bg-white/50 dark:bg-neutral-800/50 backdrop-blur-sm border border-white/60 dark:border-neutral-700/60 rounded-2xl overflow-hidden" variants={fadeUp}>
                <table className="w-full text-sm">
                  <thead className="bg-neutral-50 dark:bg-neutral-900/50 text-neutral-500">
                    <tr>
                      <th className="px-4 py-3 text-left font-medium">Item</th>
                      <th className="px-4 py-3 text-left font-medium">Date</th>
                      <th className="px-4 py-3 text-left font-medium">Reason</th>
                      <th className="px-4 py-3 text-right font-medium">Loss</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-neutral-200/50 dark:divide-neutral-700/50">
                    {wasteStats.logs.slice(0, 5).map((log: any) => (
                      <tr key={log.id}>
                        <td className="px-4 py-3 font-medium text-neutral-900 dark:text-neutral-100">{log.item_name}</td>
                        <td className="px-4 py-3 text-neutral-500">{new Date(log.wasted_at).toLocaleDateString()}</td>
                        <td className="px-4 py-3 text-neutral-500 capitalize">{log.waste_reason?.replace(/_/g, ' ')}</td>
                        <td className="px-4 py-3 text-right text-red-600 dark:text-red-400 font-medium">£{log.total_loss.toFixed(2)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </motion.div>
            )}

            {/* AI Waste Predictor */}
            <motion.div className="mt-8 bg-white/50 dark:bg-neutral-800/50 backdrop-blur-sm border border-violet-200/50 dark:border-violet-900/50 rounded-2xl p-6" variants={fadeUp}>
              <div className="flex items-start gap-4 mb-6">
                <div className="p-3 bg-violet-100 dark:bg-violet-900/30 rounded-xl">
                  <Brain className="w-6 h-6 text-violet-600 dark:text-violet-400" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-neutral-900 dark:text-neutral-100">AI Waste Predictor</h3>
                  <p className="text-sm text-neutral-600 dark:text-neutral-400">
                    Test your food items against our machine learning model to see waste risk.
                  </p>
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-8">
                {/* Input Form */}
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">Category</label>
                    <select
                      value={predictCategory}
                      onChange={(e) => setPredictCategory(e.target.value)}
                      className="w-full p-3 rounded-xl border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 focus:ring-2 focus:ring-violet-500 outline-none transition-all"
                    >
                      {['Dairy', 'Meat', 'Fish', 'Vegetables', 'Fruits', 'Bakery', 'Pantry', 'Frozen'].map(cat => (
                        <option key={cat} value={cat}>{cat}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">Storage</label>
                    <select
                      value={predictStorage}
                      onChange={(e) => setPredictStorage(e.target.value)}
                      className="w-full p-3 rounded-xl border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 focus:ring-2 focus:ring-violet-500 outline-none transition-all"
                    >
                      <option value="fridge">Fridge</option>
                      <option value="freezer">Freezer</option>
                      <option value="pantry">Pantry</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">Price (£)</label>
                    <input
                      type="number"
                      step="0.01"
                      value={predictPrice}
                      onChange={(e) => setPredictPrice(e.target.value)}
                      className="w-full p-3 rounded-xl border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 focus:ring-2 focus:ring-violet-500 outline-none transition-all"
                    />
                  </div>
                  <motion.button
                    onClick={handlePredictWaste}
                    disabled={isPredicting}
                    className="w-full py-3 bg-violet-500 hover:bg-violet-600 text-white font-semibold rounded-xl shadow-lg shadow-violet-500/20 transition-all flex items-center justify-center gap-2"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    {isPredicting ? <RefreshCw className="w-5 h-5 animate-spin" /> : <Sparkles className="w-5 h-5" />}
                    Analyze Risk
                  </motion.button>
                </div>

                {/* Result Display */}
                <div className="bg-neutral-50 dark:bg-neutral-900/50 rounded-xl p-6 flex flex-col items-center justify-center text-center border dashed border-neutral-200 dark:border-neutral-800">
                  {!predictionResult ? (
                    <div className="text-neutral-400">
                      <Brain className="w-16 h-16 mx-auto mb-4 opacity-20" />
                      <p className="font-medium">Enter details and click Analyze</p>
                      <p className="text-xs mt-1">Our ML model will predict waste probability</p>
                    </div>
                  ) : (
                    <motion.div
                      key="result"
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="w-full space-y-4"
                    >
                      <div className="relative">
                        <div className={`absolute inset-0 blur-xl opacity-20 ${predictionResult.risk_level === 'High' ? 'bg-red-500' :
                          predictionResult.risk_level === 'Medium' ? 'bg-amber-500' : 'bg-emerald-500'
                          }`} />
                        <p className="text-xs text-neutral-500 uppercase tracking-widest font-bold">Risk Level</p>
                        <p className={`text-4xl font-extrabold mt-1 ${predictionResult.risk_level === 'High' ? 'text-red-500' :
                          predictionResult.risk_level === 'Medium' ? 'text-amber-500' : 'text-emerald-500'
                          }`}>
                          {predictionResult.risk_level}
                        </p>
                        <p className="text-sm font-medium text-neutral-500 mt-1 bg-white/50 dark:bg-black/20 inline-block px-3 py-1 rounded-full">
                          Probability: {(predictionResult.waste_probability * 100).toFixed(1)}%
                        </p>
                      </div>

                      {predictionResult.recommendations && (
                        <div className="text-left bg-white dark:bg-neutral-800 p-4 rounded-xl border border-neutral-100 dark:border-neutral-700 shadow-sm">
                          <p className="font-semibold text-neutral-900 dark:text-neutral-100 mb-2 flex items-center gap-2 text-sm">
                            <TrendingDown className="w-4 h-4 text-violet-500" /> AI Recommendations
                          </p>
                          <ul className="space-y-2">
                            {predictionResult.recommendations.map((rec: string, i: number) => (
                              <li key={i} className="flex items-start gap-2 text-sm text-neutral-600 dark:text-neutral-400">
                                <div className="mt-1.5 w-1.5 h-1.5 rounded-full bg-violet-400 flex-shrink-0" />
                                {rec}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </motion.div>
                  )}
                </div>
              </div>
            </motion.div>

          </motion.div>
        )}

        {/* 7. Pantry Depletion Predictor */}
        {activeTab === 'depletion' && (
          <motion.div
            className="space-y-6 relative z-10"
            variants={staggerContainer}
            initial="hidden"
            animate="visible"
          >
            <motion.div variants={fadeUp}>
              <h2 className="text-2xl font-bold text-neutral-900 dark:text-neutral-100 flex items-center gap-3">
                <div className="p-2 bg-gradient-to-br from-rose-500 to-orange-500 rounded-xl">
                  <TrendingDown className="w-5 h-5 text-white" />
                </div>
                Pantry Depletion Predictor
              </h2>
              <p className="text-neutral-600 dark:text-neutral-400 mt-1">
                Predicts when staples will run out based on usage patterns
              </p>
            </motion.div>

            {/* Predictions */}
            <motion.div className="space-y-4" variants={staggerContainer}>
              {depletionPredictions?.map(item => (
                <motion.div
                  key={item.itemName}
                  className="bg-white/50 dark:bg-neutral-800/50 backdrop-blur-sm border border-white/60 dark:border-neutral-700/60 rounded-2xl p-5"
                  variants={fadeUp}
                >
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="font-bold text-neutral-900 dark:text-neutral-100 text-lg">{item.itemName}</h3>
                      <p className="text-sm text-neutral-600 dark:text-neutral-400">
                        {item.currentQuantity} {item.unit} remaining
                      </p>
                    </div>
                    <div className={`text-right ${item.predictedDaysUntilEmpty <= 3 ? 'text-red-500' :
                      item.predictedDaysUntilEmpty <= 7 ? 'text-amber-500' : 'text-emerald-500'
                      }`}>
                      <span className="text-3xl font-bold">{item.predictedDaysUntilEmpty}</span>
                      <p className="text-xs font-medium">days left</p>
                    </div>
                  </div>

                  <div className="bg-neutral-100/50 dark:bg-neutral-700/50 rounded-xl p-4 mb-4">
                    <div className="flex justify-between text-sm mb-2">
                      <span className="text-neutral-600 dark:text-neutral-400">Avg. daily usage</span>
                      <span className="font-semibold text-neutral-900 dark:text-neutral-100">
                        {item.avgDailyUsage.toFixed(1)} {item.unit}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-neutral-600 dark:text-neutral-400">Suggested reorder</span>
                      <span className="font-semibold text-neutral-900 dark:text-neutral-100">
                        {new Date(item.suggestedReorderDate).toLocaleDateString()}
                      </span>
                    </div>
                  </div>

                  <div className="space-y-3 pt-3 border-t border-neutral-200/50 dark:border-neutral-700/50">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-neutral-600 dark:text-neutral-400">Add to grocery list now</span>
                      <motion.button
                        onClick={() => addToGroceryListMutation.mutate({
                          name: item.itemName,
                          quantity: Math.ceil(item.avgDailyUsage * 7),
                          unit: item.unit
                        })}
                        className="flex items-center gap-2 px-3 py-1.5 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/20 rounded-lg transition-colors text-sm font-medium"
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        <ShoppingBasket className="w-4 h-4" />
                        Add
                      </motion.button>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-neutral-600 dark:text-neutral-400">Auto-add when empty</span>
                      <motion.button
                        onClick={() => toggleAutoAddMutation.mutate({ itemName: item.itemName, autoAdd: !item.autoAddToList })}
                        className={`relative w-11 h-6 rounded-full transition-colors ${item.autoAddToList
                          ? 'bg-gradient-to-r from-rose-500 to-orange-500'
                          : 'bg-neutral-300 dark:bg-neutral-600'
                          }`}
                        whileTap={{ scale: 0.95 }}
                      >
                        <motion.span
                          className="absolute top-1 w-4 h-4 bg-white rounded-full shadow-md"
                          animate={{ x: item.autoAddToList ? 22 : 4 }}
                          transition={{ type: "spring", stiffness: 500, damping: 30 }}
                        />
                      </motion.button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          </motion.div>
        )}

        {/* 7. Meal Planner Tab */}
        {activeTab === 'meal-planner' && (
          <motion.div
            className="space-y-6 relative z-10"
            variants={staggerContainer}
            initial="hidden"
            animate="visible"
          >
            <motion.div variants={fadeUp} className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <h2 className="text-2xl font-bold text-neutral-900 dark:text-neutral-100 flex items-center gap-3">
                  <div className="p-2 bg-gradient-to-br from-violet-500 to-indigo-500 rounded-xl">
                    <Calendar className="w-5 h-5 text-white" />
                  </div>
                  AI Meal Planner
                </h2>
                <p className="text-neutral-600 dark:text-neutral-400 mt-1">
                  Weekly plans optimized for your pantry inventory
                </p>
              </div>
              <button
                onClick={handleGeneratePlan}
                disabled={isGeneratingPlan}
                className={`flex items-center px-4 py-2 rounded-xl text-white font-medium transition-all shadow-lg hover:shadow-primary-500/25 ${isGeneratingPlan
                  ? 'bg-neutral-400 cursor-not-allowed'
                  : 'bg-gradient-to-r from-violet-500 to-indigo-500 hover:scale-105'
                  }`}
              >
                {isGeneratingPlan ? (
                  <RefreshCw className="w-5 h-5 mr-2 animate-spin" />
                ) : (
                  <Sparkles className="w-5 h-5 mr-2" />
                )}
                {weeklyPlan ? 'Regenerate Plan' : 'Generate Plan'}
              </button>
            </motion.div>

            <div className="grid lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 space-y-4">
                {!weeklyPlan ? (
                  <div className="text-center py-12 bg-white/50 dark:bg-neutral-800/50 rounded-2xl border-2 border-dashed border-neutral-200 dark:border-neutral-700">
                    <Calendar className="w-12 h-12 text-neutral-300 mx-auto mb-4" />
                    <p className="text-neutral-500">No plan generated yet. click 'Generate Plan' to start.</p>
                  </div>
                ) : (
                  Object.keys(weeklyPlan).map((day) => (
                    <motion.div
                      key={day}
                      variants={fadeUp}
                      className="bg-white/50 dark:bg-neutral-800/50 backdrop-blur-sm border border-white/60 dark:border-neutral-700/60 rounded-xl p-4"
                    >
                      <h3 className="font-bold text-neutral-900 dark:text-neutral-100 mb-3">{day}</h3>
                      <div className="grid md:grid-cols-3 gap-3">
                        {['Breakfast', 'Lunch', 'Dinner'].map((type) => {
                          const meal = weeklyPlan[day]?.[type]
                          return (
                            <div key={type} className="bg-white dark:bg-neutral-700/30 rounded-lg p-3 border border-neutral-100 dark:border-neutral-700">
                              <p className="text-xs font-semibold text-neutral-400 uppercase mb-1">{type}</p>
                              <p className="font-medium text-sm text-neutral-900 dark:text-neutral-100">{meal?.name || 'Free'}</p>
                            </div>
                          )
                        })}
                      </div>
                    </motion.div>
                  ))
                )}
              </div>

              {/* Shopping List */}
              <div className="bg-white/50 dark:bg-neutral-800/50 backdrop-blur-sm border border-white/60 dark:border-neutral-700/60 rounded-2xl p-5 h-fit">
                <h3 className="font-bold text-neutral-900 dark:text-neutral-100 mb-4 flex items-center">
                  <ShoppingBag className="w-5 h-5 mr-2 text-violet-500" />
                  Shopping List
                </h3>
                <div className="space-y-2 max-h-[500px] overflow-y-auto pr-2">
                  {shoppingList.length === 0 ? (
                    <p className="text-sm text-neutral-500 text-center py-4">No missing items!</p>
                  ) : (
                    shoppingList.map((item, idx) => (
                      <div key={idx} className="flex items-center gap-3 p-2 hover:bg-white/50 dark:hover:bg-neutral-700/30 rounded-lg">
                        <button
                          onClick={() => {
                            const newList = [...shoppingList];
                            newList[idx].checked = !newList[idx].checked;
                            setShoppingList(newList);
                          }}
                          className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors ${item.checked ? 'bg-green-500 border-green-500' : 'border-neutral-300'
                            }`}
                        >
                          {item.checked && <CheckCircle className="w-3 h-3 text-white" />}
                        </button>
                        <span className={`text-sm ${item.checked ? 'line-through text-neutral-400' : 'text-neutral-700 dark:text-neutral-200'}`}>
                          {item.name} ({item.quantity})
                        </span>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </motion.div>

      {/* Recipe Modal */}
      {
        selectedRecipe && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto bg-white dark:bg-neutral-800 rounded-3xl shadow-2xl"
            >
              {/* Header */}
              <div className="sticky top-0 z-10 flex items-center justify-between p-6 bg-white/80 dark:bg-neutral-800/80 backdrop-blur-md border-b border-neutral-200 dark:border-neutral-700">
                <div>
                  <h2 className="text-2xl font-bold text-neutral-900 dark:text-neutral-100">{selectedRecipe.name}</h2>
                  <div className="flex items-center gap-4 mt-1 text-sm text-neutral-500 dark:text-neutral-400">
                    <span className="flex items-center gap-1"><Clock className="w-4 h-4" /> {selectedRecipe.prepTime} min</span>
                    <span className="flex items-center gap-1"><Users className="w-4 h-4" /> {selectedRecipe.servings} servings</span>
                    <span className={`font-semibold ${selectedRecipe.matchScore >= 80 ? 'text-emerald-500' :
                      selectedRecipe.matchScore >= 60 ? 'text-amber-500' : 'text-neutral-400'
                      }`}>{selectedRecipe.matchScore}% Match</span>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedRecipe(null)}
                  className="p-2 hover:bg-neutral-100 dark:hover:bg-neutral-700 rounded-full transition-colors"
                >
                  <X className="w-6 h-6 text-neutral-500" />
                </button>
              </div>

              {/* Content */}
              <div className="p-6 space-y-8">
                {/* Ingredients */}
                <div>
                  <h3 className="flex items-center gap-2 text-lg font-bold text-neutral-900 dark:text-neutral-100 mb-4">
                    <ShoppingBasket className="w-5 h-5 text-emerald-500" />
                    Ingredients
                  </h3>
                  <div className="grid md:grid-cols-2 gap-3">
                    {selectedRecipe.extendedIngredients?.map((ingredient, idx) => (
                      <div key={idx} className="flex items-start gap-3 p-3 bg-neutral-50 dark:bg-neutral-700/30 rounded-xl">
                        <div className="mt-1 w-2 h-2 rounded-full bg-emerald-400" />
                        <span className="text-neutral-700 dark:text-neutral-300">{ingredient}</span>
                      </div>
                    )) || (
                        <div className="col-span-2 text-neutral-500 italic">No detailed ingredients available.</div>
                      )}
                  </div>
                </div>

                {/* Instructions */}
                <div>
                  <h3 className="flex items-center gap-2 text-lg font-bold text-neutral-900 dark:text-neutral-100 mb-4">
                    <ChefIcon className="w-5 h-5 text-amber-500" />
                    Instructions
                  </h3>
                  <div className="space-y-4">
                    {selectedRecipe.instructions?.map((step, idx) => (
                      <div key={idx} className="flex gap-4">
                        <div className="flex-shrink-0 w-8 h-8 flex items-center justify-center rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400 font-bold text-sm">
                          {idx + 1}
                        </div>
                        <p className="mt-1 text-neutral-700 dark:text-neutral-300 leading-relaxed">
                          {step}
                        </p>
                      </div>
                    )) || (
                        <div className="text-neutral-500 italic">No instructions available.</div>
                      )}
                  </div>
                </div>

                {/* Action */}
                <div className="pt-6 border-t border-neutral-200 dark:border-neutral-700">
                  <button
                    onClick={() => {
                      // Could implement "Cook This" functionality to deduct inventory
                      // For now just close or show usage
                      setSelectedRecipe(null)
                    }}
                    className="w-full py-3 bg-emerald-500 hover:bg-emerald-600 text-white font-semibold rounded-xl shadow-lg shadow-emerald-500/20 transition-all"
                  >
                    I'm Cooking This!
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )
      }
    </div >
  )
}
