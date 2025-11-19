import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from 'react-query'
import { motion } from 'framer-motion'
import { useAuth } from '../hooks/useAuth'
import {
  Recycle,
  ArrowRightLeft,
  Calculator,
  Target,
  Users,
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
  Search
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
  const [activeTab, setActiveTab] = useState<'leftover' | 'substitution' | 'cost' | 'nutrition' | 'voting' | 'depletion'>('leftover')

  // State for each feature
  const [substitutionQuery, setSubstitutionQuery] = useState('')
  const [selectedRecipeForCost, setSelectedRecipeForCost] = useState('')
  const [newGoal, setNewGoal] = useState({ nutrient: '', target: 0, unit: 'g' })
  const [newMealForVote, setNewMealForVote] = useState('')

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

  const tabs = [
    { id: 'leftover', label: 'Leftover Matcher', icon: Recycle, gradient: 'from-emerald-500 to-teal-500' },
    { id: 'substitution', label: 'Substitutions', icon: ArrowRightLeft, gradient: 'from-blue-500 to-cyan-500' },
    { id: 'cost', label: 'Cost Calculator', icon: Calculator, gradient: 'from-green-500 to-emerald-500' },
    { id: 'nutrition', label: 'Nutrition Goals', icon: Target, gradient: 'from-purple-500 to-pink-500' },
    { id: 'voting', label: 'Meal Voting', icon: Users, gradient: 'from-indigo-500 to-purple-500' },
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
            className={`group relative flex items-center gap-2 px-5 py-3 rounded-2xl text-sm font-semibold transition-all duration-300 ${
              activeTab === tab.id
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
                      className={`px-4 py-2 rounded-xl text-sm font-medium backdrop-blur-sm ${
                        item.daysUntilExpiry <= 1
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
                        <div className={`text-2xl font-bold ${
                          recipe.matchScore >= 80 ? 'text-emerald-500' :
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
                      <span className={`px-3 py-1.5 rounded-xl text-xs font-bold ${
                        sub.quality === 'excellent' ? 'bg-emerald-500/20 text-emerald-600 dark:text-emerald-400' :
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
                            ${item.totalCost.toFixed(2)}
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
                      ${costBreakdown.totalCost.toFixed(2)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-neutral-600 dark:text-neutral-400">Cost per Serving</span>
                    <span className="text-xl font-bold text-green-600 dark:text-green-400">
                      ${costBreakdown.costPerServing.toFixed(2)}
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
                        className={`h-4 rounded-full ${
                          progress >= 100 ? 'bg-gradient-to-r from-emerald-500 to-green-500' :
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
                        className={`px-3 py-1.5 rounded-lg text-xs font-medium ${
                          vote.vote === 'yes' ? 'bg-emerald-500/20 text-emerald-700 dark:text-emerald-300' :
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
                    <div className={`text-right ${
                      item.predictedDaysUntilEmpty <= 3 ? 'text-red-500' :
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

                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-neutral-600 dark:text-neutral-400">Auto-add to grocery list</span>
                    <motion.button
                      onClick={() => toggleAutoAddMutation.mutate({ itemName: item.itemName, autoAdd: !item.autoAddToList })}
                      className={`relative w-14 h-7 rounded-full transition-colors ${
                        item.autoAddToList
                          ? 'bg-gradient-to-r from-rose-500 to-orange-500'
                          : 'bg-neutral-300 dark:bg-neutral-600'
                      }`}
                      whileTap={{ scale: 0.95 }}
                    >
                      <motion.span
                        className="absolute top-1 w-5 h-5 bg-white rounded-full shadow-md"
                        animate={{ x: item.autoAddToList ? 30 : 4 }}
                        transition={{ type: "spring", stiffness: 500, damping: 30 }}
                      />
                    </motion.button>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          </motion.div>
        )}
      </motion.div>
    </div>
  )
}
