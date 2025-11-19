import { useState, useMemo } from 'react'
import { motion } from 'framer-motion'
import { Users, Minus, Plus, ChefHat, Scale, Flame, Dumbbell, Wheat, Droplets } from 'lucide-react'
import { scaleRecipe, formatIngredient, formatQuantity, getServingPresets } from '../services/recipeScaleService'

interface RecipeScalerProps {
  recipeName: string
  ingredients: string[]
  baseServings: number
  nutritionInfo?: {
    calories: number
    protein: number
    carbs: number
    fat: number
  }
  onServingsChange?: (servings: number) => void
}

export default function RecipeScaler({
  recipeName,
  ingredients,
  baseServings,
  nutritionInfo,
  onServingsChange
}: RecipeScalerProps) {
  const [targetServings, setTargetServings] = useState(baseServings)

  const scaledRecipe = useMemo(() => {
    return scaleRecipe(ingredients, baseServings, targetServings, nutritionInfo)
  }, [ingredients, baseServings, targetServings, nutritionInfo])

  const servingPresets = useMemo(() => {
    return getServingPresets(baseServings)
  }, [baseServings])

  const handleServingsChange = (newServings: number) => {
    const clamped = Math.max(1, Math.min(20, newServings))
    setTargetServings(clamped)
    onServingsChange?.(clamped)
  }

  const scaleFactor = targetServings / baseServings
  const isScaled = scaleFactor !== 1

  return (
    <div className="space-y-6">
      {/* Servings Control */}
      <div className="bg-gradient-to-r from-primary-50 to-accent-50 dark:from-primary-900/20 dark:to-accent-900/20 rounded-xl p-4 border border-primary-200/50 dark:border-primary-700/50">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2">
            <Users className="w-5 h-5 text-primary-600 dark:text-primary-400" />
            <span className="font-semibold text-neutral-900 dark:text-neutral-100">Servings</span>
          </div>
          {isScaled && (
            <motion.span
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              className="px-2 py-0.5 bg-primary-500/10 dark:bg-primary-500/20 text-primary-600 dark:text-primary-400 text-xs font-semibold rounded-full"
            >
              {scaleFactor > 1 ? `${scaleFactor.toFixed(1)}x` : `${scaleFactor.toFixed(2)}x`}
            </motion.span>
          )}
        </div>

        {/* Servings Input */}
        <div className="flex items-center justify-center space-x-4 mb-4">
          <motion.button
            onClick={() => handleServingsChange(targetServings - 1)}
            disabled={targetServings <= 1}
            className="w-10 h-10 rounded-full bg-white dark:bg-neutral-700 border border-neutral-200 dark:border-neutral-600 flex items-center justify-center text-neutral-600 dark:text-neutral-300 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-neutral-50 dark:hover:bg-neutral-600 transition-colors"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Minus className="w-4 h-4" />
          </motion.button>

          <div className="text-center">
            <motion.span
              key={targetServings}
              initial={{ scale: 1.2, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="text-4xl font-bold text-neutral-900 dark:text-neutral-100"
            >
              {targetServings}
            </motion.span>
            <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1">
              {targetServings === 1 ? 'serving' : 'servings'}
            </p>
          </div>

          <motion.button
            onClick={() => handleServingsChange(targetServings + 1)}
            disabled={targetServings >= 20}
            className="w-10 h-10 rounded-full bg-white dark:bg-neutral-700 border border-neutral-200 dark:border-neutral-600 flex items-center justify-center text-neutral-600 dark:text-neutral-300 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-neutral-50 dark:hover:bg-neutral-600 transition-colors"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Plus className="w-4 h-4" />
          </motion.button>
        </div>

        {/* Quick Presets */}
        <div className="flex flex-wrap justify-center gap-2">
          {servingPresets.map((preset) => (
            <motion.button
              key={preset}
              onClick={() => handleServingsChange(preset)}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                targetServings === preset
                  ? 'bg-primary-500 text-white'
                  : 'bg-white dark:bg-neutral-700 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-600 border border-neutral-200 dark:border-neutral-600'
              }`}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              {preset}
            </motion.button>
          ))}
        </div>

        {/* Reset Button */}
        {isScaled && (
          <motion.button
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            onClick={() => handleServingsChange(baseServings)}
            className="mt-3 w-full py-2 text-sm text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 font-medium"
          >
            Reset to original ({baseServings} servings)
          </motion.button>
        )}
      </div>

      {/* Scaled Ingredients */}
      <div>
        <div className="flex items-center space-x-2 mb-3">
          <ChefHat className="w-5 h-5 text-neutral-600 dark:text-neutral-400" />
          <h4 className="font-semibold text-neutral-900 dark:text-neutral-100">
            Ingredients
            {isScaled && (
              <span className="ml-2 text-sm font-normal text-neutral-500 dark:text-neutral-400">
                (scaled)
              </span>
            )}
          </h4>
        </div>

        <ul className="space-y-2">
          {scaledRecipe.ingredients.map((ingredient, index) => (
            <motion.li
              key={index}
              initial={isScaled ? { x: -10, opacity: 0 } : false}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: index * 0.03 }}
              className="flex items-start space-x-3"
            >
              <span className="flex-shrink-0 w-6 h-6 rounded-full bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center mt-0.5">
                <Scale className="w-3 h-3 text-primary-600 dark:text-primary-400" />
              </span>
              <div className="flex-1">
                <span className="text-neutral-800 dark:text-neutral-200">
                  <span className={`font-semibold ${isScaled ? 'text-primary-600 dark:text-primary-400' : ''}`}>
                    {formatQuantity(ingredient.quantity)}
                  </span>
                  {ingredient.unit !== 'pieces' && (
                    <span className="text-neutral-600 dark:text-neutral-400"> {ingredient.unit}</span>
                  )}
                  <span> {ingredient.name}</span>
                </span>
              </div>
            </motion.li>
          ))}
        </ul>
      </div>

      {/* Scaled Nutrition Info */}
      {scaledRecipe.nutritionInfo && (
        <div>
          <div className="flex items-center space-x-2 mb-3">
            <Flame className="w-5 h-5 text-orange-500" />
            <h4 className="font-semibold text-neutral-900 dark:text-neutral-100">
              Nutrition
              {isScaled && (
                <span className="ml-2 text-sm font-normal text-neutral-500 dark:text-neutral-400">
                  (per {targetServings} {targetServings === 1 ? 'serving' : 'servings'})
                </span>
              )}
            </h4>
          </div>

          <div className="grid grid-cols-4 gap-3">
            <motion.div
              key={`cal-${targetServings}`}
              initial={isScaled ? { scale: 0.9, opacity: 0 } : false}
              animate={{ scale: 1, opacity: 1 }}
              className="bg-orange-50 dark:bg-orange-900/20 rounded-lg p-3 text-center"
            >
              <Flame className="w-4 h-4 text-orange-500 mx-auto mb-1" />
              <p className="text-lg font-bold text-neutral-900 dark:text-neutral-100">
                {scaledRecipe.nutritionInfo.calories}
              </p>
              <p className="text-xs text-neutral-500 dark:text-neutral-400">kcal</p>
            </motion.div>

            <motion.div
              key={`protein-${targetServings}`}
              initial={isScaled ? { scale: 0.9, opacity: 0 } : false}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.05 }}
              className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-3 text-center"
            >
              <Dumbbell className="w-4 h-4 text-blue-500 mx-auto mb-1" />
              <p className="text-lg font-bold text-neutral-900 dark:text-neutral-100">
                {scaledRecipe.nutritionInfo.protein}g
              </p>
              <p className="text-xs text-neutral-500 dark:text-neutral-400">protein</p>
            </motion.div>

            <motion.div
              key={`carbs-${targetServings}`}
              initial={isScaled ? { scale: 0.9, opacity: 0 } : false}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.1 }}
              className="bg-amber-50 dark:bg-amber-900/20 rounded-lg p-3 text-center"
            >
              <Wheat className="w-4 h-4 text-amber-500 mx-auto mb-1" />
              <p className="text-lg font-bold text-neutral-900 dark:text-neutral-100">
                {scaledRecipe.nutritionInfo.carbs}g
              </p>
              <p className="text-xs text-neutral-500 dark:text-neutral-400">carbs</p>
            </motion.div>

            <motion.div
              key={`fat-${targetServings}`}
              initial={isScaled ? { scale: 0.9, opacity: 0 } : false}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.15 }}
              className="bg-purple-50 dark:bg-purple-900/20 rounded-lg p-3 text-center"
            >
              <Droplets className="w-4 h-4 text-purple-500 mx-auto mb-1" />
              <p className="text-lg font-bold text-neutral-900 dark:text-neutral-100">
                {scaledRecipe.nutritionInfo.fat}g
              </p>
              <p className="text-xs text-neutral-500 dark:text-neutral-400">fat</p>
            </motion.div>
          </div>
        </div>
      )}
    </div>
  )
}
