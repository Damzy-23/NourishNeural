import { useState } from 'react'
import { Helmet } from 'react-helmet-async'
import { useQuery } from 'react-query'
import { motion, AnimatePresence } from 'framer-motion'
import {
  ChefHat,
  Clock,
  AlertTriangle,
  ShoppingCart,
  Loader2,
  RefreshCw,
  Sparkles,
  Check,
  X
} from 'lucide-react'
import { apiService } from '../services/api'
import { useAuth } from '../hooks/useAuth'
import toast from 'react-hot-toast'

interface Recipe {
  name: string
  description: string
  uses: string[]
  missing: string[]
  usesExpiring: string[]
  prepTime: number
  difficulty: string
  matchPercent?: number
}

interface RecommendResponse {
  recipes: Recipe[]
  source: 'ai' | 'database'
  pantryUsed: string[]
  expiringItems: string[]
  message?: string
}

const DIFFICULTY_STYLES: Record<string, string> = {
  easy: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
  medium: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
  hard: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
}

export default function Recipes() {
  const { user } = useAuth()
  const [selectedRecipe, setSelectedRecipe] = useState<Recipe | null>(null)

  const { data, isLoading, isFetching, refetch } = useQuery<RecommendResponse>(
    ['recipe-recommendations'],
    () => apiService.post('/api/ai/recommend', {}) as Promise<RecommendResponse>,
    {
      enabled: !!user,
      staleTime: 5 * 60 * 1000,
      retry: 1
    }
  )

  const recipes = data?.recipes || []
  const expiringItems = data?.expiringItems || []
  const source = data?.source

  const handleAddMissing = async (recipe: Recipe) => {
    if (!recipe.missing || recipe.missing.length === 0) {
      toast.success('You have everything you need!')
      return
    }
    try {
      const items = recipe.missing.map(name => ({
        name,
        quantity: 1,
        unit: 'pieces',
        category: 'General'
      }))
      await apiService.post('/api/groceries', {
        name: `For: ${recipe.name}`,
        items
      })
      toast.success(`${items.length} missing ingredients added to grocery list`)
    } catch {
      toast.error('Failed to create grocery list')
    }
  }

  return (
    <>
      <Helmet>
        <title>Recipes - Nourish Neural</title>
      </Helmet>

      <div className="relative space-y-3 md:space-y-6 pb-12">
        <motion.div
          className="pointer-events-none absolute -top-16 left-[-10%] h-64 w-64 rounded-full bg-orange-200/30 blur-3xl"
          animate={{ y: [0, 18, 0], opacity: [0.4, 0.65, 0.4] }}
          transition={{ duration: 18, repeat: Infinity, ease: 'easeInOut' }}
        />

        {/* Header */}
        <motion.div
          className="relative overflow-hidden"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
        >
          <div className="absolute inset-0 bg-gradient-to-r from-orange-600/5 to-red-500/5 rounded-3xl" />
          <div className="relative glass-card rounded-3xl p-4 md:p-10 border border-neutral-200/60 backdrop-blur-sm">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 md:gap-4">
              <div className="flex items-center space-x-3 md:space-x-4">
                <motion.div
                  className="inline-flex h-11 w-11 md:h-14 md:w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-orange-500 to-red-500 shadow-lg shadow-orange-500/30"
                  initial={{ scale: 0, rotate: -180 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{ duration: 0.6, delay: 0.2, type: 'spring' }}
                >
                  <ChefHat className="h-7 w-7 text-white" />
                </motion.div>
                <div>
                  <motion.h1
                    className="text-xl md:text-4xl font-bold gradient-text"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.6, delay: 0.3 }}
                  >
                    Smart Recipes
                  </motion.h1>
                  <motion.p
                    className="mt-1 text-neutral-600 dark:text-neutral-400 text-sm md:text-base"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.6, delay: 0.4 }}
                  >
                    AI-powered recipes based on what's in your pantry
                  </motion.p>
                </div>
              </div>
              <motion.button
                onClick={() => refetch()}
                disabled={isFetching}
                className="btn btn-primary shadow-lg hover:shadow-xl active:scale-95"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.6, delay: 0.5 }}
                whileHover={{ y: -2 }}
                whileTap={{ scale: 0.98 }}
              >
                {isFetching ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <RefreshCw className="h-4 w-4 mr-2" />}
                Refresh Recipes
              </motion.button>
            </div>
          </div>
        </motion.div>

        {/* Expiring Items Banner */}
        {expiringItems.length > 0 && (
          <motion.div
            className="flex items-start gap-2 md:gap-3 p-3 md:p-4 rounded-2xl border border-amber-200 dark:border-amber-800 bg-amber-50/80 dark:bg-amber-900/20"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <AlertTriangle className="h-5 w-5 text-amber-500 mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-sm font-semibold text-amber-800 dark:text-amber-300">
                {expiringItems.length} item{expiringItems.length > 1 ? 's' : ''} expiring soon
              </p>
              <p className="text-sm text-amber-700 dark:text-amber-400">
                {expiringItems.join(', ')} — recipes below prioritise using these first.
              </p>
            </div>
          </motion.div>
        )}

        {/* Source Badge */}
        {source && (
          <div className="flex items-center gap-2">
            <span className={`inline-flex items-center gap-1 text-xs font-medium px-2.5 py-1 rounded-full ${source === 'ai' ? 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400' : 'bg-neutral-100 text-neutral-600 dark:bg-neutral-800 dark:text-neutral-400'}`}>
              {source === 'ai' ? <Sparkles className="w-3 h-3" /> : null}
              {source === 'ai' ? 'AI-generated' : 'Recipe database'}
            </span>
          </div>
        )}

        {/* Loading */}
        {isLoading && (
          <div className="flex flex-col items-center justify-center py-20">
            <Loader2 className="w-10 h-10 text-orange-500 animate-spin mb-4" />
            <p className="text-neutral-500 dark:text-neutral-400">Scanning your pantry for recipe ideas...</p>
          </div>
        )}

        {/* Empty State */}
        {!isLoading && recipes.length === 0 && (
          <motion.div
            className="card"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div className="card-content text-center py-12">
              <ChefHat className="h-12 w-12 text-neutral-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-neutral-900 dark:text-neutral-100 mb-2">
                {data?.message || 'No recipes found'}
              </h3>
              <p className="text-neutral-600 dark:text-neutral-400">
                Add items to your pantry and we'll suggest recipes you can make.
              </p>
            </div>
          </motion.div>
        )}

        {/* Recipe Cards */}
        {!isLoading && recipes.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2.5 md:gap-5">
            {recipes.map((recipe, idx) => (
              <motion.div
                key={idx}
                className="card cursor-pointer group active:scale-[0.98]"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: idx * 0.08 }}
                whileHover={{ y: -6, boxShadow: '0 28px 55px -35px rgba(249,115,22,0.3)' }}
                onClick={() => setSelectedRecipe(recipe)}
              >
                <div className="card-header">
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="card-title text-base leading-tight">{recipe.name}</h3>
                    {recipe.usesExpiring && recipe.usesExpiring.length > 0 && (
                      <span className="flex-shrink-0 inline-flex items-center gap-1 text-xs font-bold text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/30 px-2 py-0.5 rounded-full">
                        <AlertTriangle className="w-3 h-3" />
                        Uses expiring
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-1">{recipe.description}</p>
                </div>

                <div className="card-content space-y-2 md:space-y-3">
                  {/* Meta row */}
                  <div className="flex items-center gap-2 md:gap-3 text-xs">
                    {recipe.prepTime && (
                      <span className="flex items-center gap-1 text-neutral-500 dark:text-neutral-400">
                        <Clock className="w-3.5 h-3.5" />
                        {recipe.prepTime} min
                      </span>
                    )}
                    {recipe.difficulty && (
                      <span className={`px-2 py-0.5 rounded-full font-medium ${DIFFICULTY_STYLES[recipe.difficulty] || DIFFICULTY_STYLES.easy}`}>
                        {recipe.difficulty}
                      </span>
                    )}
                    {recipe.matchPercent !== undefined && (
                      <span className="text-neutral-500 dark:text-neutral-400">
                        {recipe.matchPercent}% match
                      </span>
                    )}
                  </div>

                  {/* Ingredients you have */}
                  {recipe.uses && recipe.uses.length > 0 && (
                    <div>
                      <p className="text-xs font-semibold text-green-700 dark:text-green-400 mb-1">You have:</p>
                      <div className="flex flex-wrap gap-1">
                        {recipe.uses.slice(0, 6).map((ing, i) => (
                          <span key={i} className="inline-flex items-center gap-0.5 text-xs px-2 py-0.5 rounded-full bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 border border-green-200 dark:border-green-800">
                            <Check className="w-3 h-3" />
                            {ing}
                          </span>
                        ))}
                        {recipe.uses.length > 6 && (
                          <span className="text-xs text-neutral-500">+{recipe.uses.length - 6} more</span>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Missing ingredients */}
                  {recipe.missing && recipe.missing.length > 0 && (
                    <div>
                      <p className="text-xs font-semibold text-red-600 dark:text-red-400 mb-1">Missing:</p>
                      <div className="flex flex-wrap gap-1">
                        {recipe.missing.slice(0, 4).map((ing, i) => (
                          <span key={i} className="text-xs px-2 py-0.5 rounded-full bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 border border-red-200 dark:border-red-800">
                            {ing}
                          </span>
                        ))}
                        {recipe.missing.length > 4 && (
                          <span className="text-xs text-neutral-500">+{recipe.missing.length - 4} more</span>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Add missing to grocery */}
                  {recipe.missing && recipe.missing.length > 0 && (
                    <button
                      onClick={(e) => { e.stopPropagation(); handleAddMissing(recipe) }}
                      className="w-full mt-1 flex items-center justify-center gap-2 text-xs font-semibold py-2.5 md:py-2 rounded-xl border border-orange-200 dark:border-orange-800 text-orange-600 dark:text-orange-400 hover:bg-orange-50 dark:hover:bg-orange-900/20 transition-colors active:scale-95 min-h-[40px]"
                    >
                      <ShoppingCart className="w-3.5 h-3.5" />
                      Add {recipe.missing.length} missing to grocery list
                    </button>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* Recipe Detail Modal */}
      <AnimatePresence>
        {selectedRecipe && (
          <motion.div
            className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          >
            <div className="absolute inset-0 bg-black/60" onClick={() => setSelectedRecipe(null)} />
            <motion.div
              className="relative bg-white dark:bg-neutral-800 rounded-2xl shadow-2xl w-full max-w-md p-6 z-10 max-h-[80vh] overflow-y-auto"
              initial={{ y: 40, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 40, opacity: 0 }}
            >
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h2 className="text-xl font-bold text-neutral-900 dark:text-neutral-100">{selectedRecipe.name}</h2>
                  <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-1">{selectedRecipe.description}</p>
                </div>
                <button onClick={() => setSelectedRecipe(null)} className="p-1.5 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-700 transition-colors">
                  <X className="w-5 h-5 text-neutral-500 dark:text-neutral-400" />
                </button>
              </div>

              <div className="flex items-center gap-3 mb-4">
                {selectedRecipe.prepTime && (
                  <span className="flex items-center gap-1 text-sm text-neutral-600 dark:text-neutral-400">
                    <Clock className="w-4 h-4" />
                    {selectedRecipe.prepTime} min
                  </span>
                )}
                {selectedRecipe.difficulty && (
                  <span className={`text-sm px-2.5 py-0.5 rounded-full font-medium ${DIFFICULTY_STYLES[selectedRecipe.difficulty] || DIFFICULTY_STYLES.easy}`}>
                    {selectedRecipe.difficulty}
                  </span>
                )}
              </div>

              {selectedRecipe.usesExpiring && selectedRecipe.usesExpiring.length > 0 && (
                <div className="mb-4 p-3 rounded-xl bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800">
                  <p className="text-sm font-semibold text-amber-700 dark:text-amber-300 flex items-center gap-1.5">
                    <AlertTriangle className="w-4 h-4" />
                    Uses up expiring items
                  </p>
                  <p className="text-sm text-amber-600 dark:text-amber-400 mt-1">
                    {selectedRecipe.usesExpiring.join(', ')}
                  </p>
                </div>
              )}

              <div className="space-y-3">
                <div>
                  <h3 className="text-sm font-bold text-neutral-800 dark:text-neutral-200 mb-2">Ingredients from your pantry</h3>
                  <div className="flex flex-wrap gap-1.5">
                    {(selectedRecipe.uses || []).map((ing, i) => (
                      <span key={i} className="inline-flex items-center gap-1 text-sm px-2.5 py-1 rounded-full bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 border border-green-200 dark:border-green-800">
                        <Check className="w-3.5 h-3.5" />
                        {ing}
                      </span>
                    ))}
                  </div>
                </div>

                {selectedRecipe.missing && selectedRecipe.missing.length > 0 && (
                  <div>
                    <h3 className="text-sm font-bold text-neutral-800 dark:text-neutral-200 mb-2">You'll need to buy</h3>
                    <div className="flex flex-wrap gap-1.5">
                      {selectedRecipe.missing.map((ing, i) => (
                        <span key={i} className="text-sm px-2.5 py-1 rounded-full bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 border border-red-200 dark:border-red-800">
                          {ing}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {selectedRecipe.missing && selectedRecipe.missing.length > 0 && (
                <button
                  onClick={() => { handleAddMissing(selectedRecipe); setSelectedRecipe(null) }}
                  className="w-full mt-5 py-2.5 rounded-xl bg-gradient-to-r from-orange-500 to-red-500 text-white font-bold text-sm hover:opacity-90 transition-opacity flex items-center justify-center gap-2"
                >
                  <ShoppingCart className="w-4 h-4" />
                  Add {selectedRecipe.missing.length} items to grocery list
                </button>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
