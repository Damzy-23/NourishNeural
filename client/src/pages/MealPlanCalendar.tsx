import { useState } from 'react'
import { Helmet } from 'react-helmet-async'
import { useQuery, useMutation, useQueryClient } from 'react-query'
import { motion, AnimatePresence } from 'framer-motion'
import {
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  Plus,
  X,
  Sparkles,
  ShoppingCart,
  Pencil,
  Trash2,
  Loader2,
  Coffee,
  UtensilsCrossed,
  Moon
} from 'lucide-react'
import { apiService } from '../services/api'
import { useAuth } from '../hooks/useAuth'
import toast from 'react-hot-toast'

type MealType = 'Breakfast' | 'Lunch' | 'Dinner'

interface MealSlot {
  name: string
  ingredients?: string[]
}

interface DayMeals {
  Breakfast?: MealSlot
  Lunch?: MealSlot
  Dinner?: MealSlot
}

interface MealPlan {
  id: string
  name: string
  start_date: string
  end_date?: string
  meals: Record<string, DayMeals>
  notes?: string
}

const MEAL_TYPES: MealType[] = ['Breakfast', 'Lunch', 'Dinner']

const MEAL_ICONS: Record<MealType, React.ElementType> = {
  Breakfast: Coffee,
  Lunch: UtensilsCrossed,
  Dinner: Moon
}

const MEAL_STYLES: Record<MealType, {
  filledBg: string
  filledBorder: string
  iconColor: string
  textColor: string
  hoverColor: string
  hoverBg: string
}> = {
  Breakfast: {
    filledBg: 'bg-orange-50 dark:bg-orange-900/20',
    filledBorder: 'border border-orange-200 dark:border-orange-800',
    iconColor: 'text-orange-500',
    textColor: 'text-orange-700 dark:text-orange-300',
    hoverColor: 'hover:text-orange-500',
    hoverBg: 'hover:bg-orange-50 dark:hover:bg-orange-900/20'
  },
  Lunch: {
    filledBg: 'bg-blue-50 dark:bg-blue-900/20',
    filledBorder: 'border border-blue-200 dark:border-blue-800',
    iconColor: 'text-blue-500',
    textColor: 'text-blue-700 dark:text-blue-300',
    hoverColor: 'hover:text-blue-500',
    hoverBg: 'hover:bg-blue-50 dark:hover:bg-blue-900/20'
  },
  Dinner: {
    filledBg: 'bg-purple-50 dark:bg-purple-900/20',
    filledBorder: 'border border-purple-200 dark:border-purple-800',
    iconColor: 'text-purple-500',
    textColor: 'text-purple-700 dark:text-purple-300',
    hoverColor: 'hover:text-purple-500',
    hoverBg: 'hover:bg-purple-50 dark:hover:bg-purple-900/20'
  }
}

function getMondayOf(date: Date): Date {
  const d = new Date(date)
  const day = d.getDay()
  const diff = (day === 0 ? -6 : 1 - day)
  d.setDate(d.getDate() + diff)
  d.setHours(0, 0, 0, 0)
  return d
}

function addDays(date: Date, days: number): Date {
  const d = new Date(date)
  d.setDate(d.getDate() + days)
  return d
}

function toDateStr(date: Date): string {
  return date.toISOString().split('T')[0]
}

function formatWeekRange(monday: Date): string {
  const sunday = addDays(monday, 6)
  const opts: Intl.DateTimeFormatOptions = { day: 'numeric', month: 'short' }
  return `${monday.toLocaleDateString('en-GB', opts)} – ${sunday.toLocaleDateString('en-GB', { ...opts, year: 'numeric' })}`
}

export default function MealPlanCalendar() {
  const { user } = useAuth()
  const queryClient = useQueryClient()

  const [weekStart, setWeekStart] = useState<Date>(() => getMondayOf(new Date()))
  const [editSlot, setEditSlot] = useState<{ date: string; mealType: MealType; existing?: string } | null>(null)
  const [mealInput, setMealInput] = useState('')
  const [showShoppingList, setShowShoppingList] = useState(false)
  const [shoppingList, setShoppingList] = useState<{ name: string; quantity: number }[]>([])
  const [isGenerating, setIsGenerating] = useState(false)
  const [isGenShoppingList, setIsGenShoppingList] = useState(false)
  const [isAddingToGrocery, setIsAddingToGrocery] = useState(false)

  // Build array of 7 date strings for current week
  const weekDates = Array.from({ length: 7 }, (_, i) => toDateStr(addDays(weekStart, i)))

  const weekKey = toDateStr(weekStart)

  // Fetch plans
  const { data: plansData, isLoading } = useQuery(
    ['meal-plans'],
    () => apiService.get('/api/meal-planner'),
    { enabled: !!user }
  )

  const plans: MealPlan[] = (plansData as any)?.plans || []

  // Find or create plan for current week
  const currentPlan = plans.find(p => p.start_date === weekKey)

  // Create plan mutation
  const createPlanMutation = useMutation(
    (data: object) => apiService.post('/api/meal-planner', data),
    {
      onSuccess: () => { queryClient.invalidateQueries(['meal-plans']) },
      onError: () => { toast.error('Failed to create plan') }
    }
  )

  // Update plan mutation
  const updatePlanMutation = useMutation(
    ({ id, data }: { id: string; data: object }) => apiService.put(`/api/meal-planner/${id}`, data),
    {
      onSuccess: () => { queryClient.invalidateQueries(['meal-plans']) },
      onError: () => { toast.error('Failed to save meal') }
    }
  )

  function getMeals(): Record<string, DayMeals> {
    return currentPlan?.meals || {}
  }

  function getMealForSlot(dateStr: string, mealType: MealType): MealSlot | undefined {
    return getMeals()[dateStr]?.[mealType]
  }

  async function ensurePlan(): Promise<MealPlan | undefined> {
    if (currentPlan) return currentPlan
    try {
      const result: any = await apiService.post('/api/meal-planner', {
        name: `Week of ${weekKey}`,
        start_date: weekKey,
        end_date: toDateStr(addDays(weekStart, 6)),
        meals: {}
      })
      await queryClient.invalidateQueries(['meal-plans'])
      return result?.plan as MealPlan | undefined
    } catch {
      toast.error('Failed to create plan')
      return undefined
    }
  }

  async function saveMealToSlot(dateStr: string, mealType: MealType, mealName: string) {
    let plan: MealPlan | undefined = currentPlan
    if (!plan) {
      const found = await ensurePlan()
      if (!found) return
      plan = found
    }
    const meals = { ...(plan.meals || {}) }
    if (!meals[dateStr]) meals[dateStr] = {}
    if (mealName.trim()) {
      meals[dateStr][mealType] = { name: mealName.trim() }
    } else {
      delete meals[dateStr][mealType]
      if (Object.keys(meals[dateStr]).length === 0) delete meals[dateStr]
    }
    updatePlanMutation.mutate({ id: plan.id, data: { meals } })
  }

  function openEditSlot(dateStr: string, mealType: MealType) {
    const existing = getMealForSlot(dateStr, mealType)?.name
    setEditSlot({ date: dateStr, mealType, existing })
    setMealInput(existing || '')
  }

  async function handleSaveMeal() {
    if (!editSlot) return
    await saveMealToSlot(editSlot.date, editSlot.mealType, mealInput)
    setEditSlot(null)
    setMealInput('')
  }

  async function handleDeleteMeal(dateStr: string, mealType: MealType) {
    await saveMealToSlot(dateStr, mealType, '')
  }

  async function handleAIGenerate() {
    setIsGenerating(true)
    try {
      const result: any = await apiService.post('/api/meal-planner/generate', {
        pantryItems: [],
        preferences: {}
      }, { timeout: 90000 })
      const generatedPlan: Record<string, DayMeals> = result?.plan || {}

      // Map day names to actual dates
      const dayNames = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']
      const mappedMeals: Record<string, DayMeals> = {}
      dayNames.forEach((dayName, i) => {
        const dateStr = weekDates[i]
        if (generatedPlan[dayName]) {
          mappedMeals[dateStr] = {}
          const dayData: any = generatedPlan[dayName]
          MEAL_TYPES.forEach(mt => {
            if (dayData[mt]) {
              mappedMeals[dateStr][mt] = {
                name: dayData[mt].name || dayData[mt],
                ingredients: dayData[mt].ingredients || []
              }
            }
          })
        }
      })

      let plan: MealPlan | undefined = currentPlan
      if (!plan) {
        await apiService.post('/api/meal-planner', {
          name: `Week of ${weekKey}`,
          start_date: weekKey,
          end_date: toDateStr(addDays(weekStart, 6)),
          meals: mappedMeals
        })
        await queryClient.invalidateQueries(['meal-plans'])
        toast.success('AI meal plan generated!')
        return
      }
      updatePlanMutation.mutate({ id: plan.id, data: { meals: mappedMeals } })
      toast.success('AI meal plan generated!')
    } catch {
      toast.error('AI generation failed')
    } finally {
      setIsGenerating(false)
    }
  }

  async function handleGenerateShoppingList() {
    if (!currentPlan) return toast.error('No meal plan for this week')
    setIsGenShoppingList(true)
    try {
      const result: any = await apiService.post('/api/meal-planner/shopping-list', {
        plan: currentPlan.meals,
        pantryItems: []
      })
      setShoppingList(result?.shoppingList || [])
      setShowShoppingList(true)
    } catch {
      toast.error('Failed to generate shopping list')
    } finally {
      setIsGenShoppingList(false)
    }
  }

  async function handleAddToGroceryList() {
    if (shoppingList.length === 0) return
    setIsAddingToGrocery(true)
    try {
      const items = shoppingList.map(item => ({
        name: item.name,
        quantity: item.quantity || 1,
        unit: 'pieces',
        category: 'General'
      }))
      await apiService.post('/api/groceries', {
        name: `Meal Plan — ${formatWeekRange(weekStart)}`,
        items
      })
      toast.success(`${items.length} ingredients added to grocery list`)
      setShowShoppingList(false)
    } catch {
      toast.error('Failed to create grocery list')
    } finally {
      setIsAddingToGrocery(false)
    }
  }

  const isThisWeek = toDateStr(getMondayOf(new Date())) === weekKey

  return (
    <>
      <Helmet>
        <title>Meal Planner - Nourish Neural</title>
      </Helmet>

      <div className="relative min-h-screen pb-16">
        <div className="pointer-events-none fixed inset-0 bg-gradient-to-br from-purple-50/30 via-white to-blue-50/20 dark:from-neutral-900 dark:via-neutral-900 dark:to-neutral-800" />
        <motion.div
          className="pointer-events-none absolute -top-24 right-[-10%] h-72 w-72 rounded-full bg-purple-200/30 blur-3xl"
          animate={{ y: [0, 18, 0], opacity: [0.3, 0.55, 0.3] }}
          transition={{ duration: 18, repeat: Infinity, ease: 'easeInOut' }}
        />
        <motion.div
          className="pointer-events-none absolute bottom-[-10%] left-[-8%] h-64 w-64 rounded-full bg-blue-200/25 blur-3xl"
          animate={{ y: [0, -14, 0], opacity: [0.25, 0.5, 0.25] }}
          transition={{ duration: 20, repeat: Infinity, ease: 'easeInOut' }}
        />

        <div className="relative">
          {/* Header */}
          <motion.div className="mb-6" initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
            <div className="relative glass-card rounded-3xl p-6">
              <div className="absolute inset-0 bg-gradient-to-r from-purple-600/5 to-blue-500/5 rounded-3xl" />
              <div className="relative flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div className="flex items-center space-x-3">
                  <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center shadow-lg">
                    <CalendarDays className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h1 className="text-3xl font-black gradient-text">Meal Planner</h1>
                    <p className="text-sm text-neutral-500 dark:text-neutral-400">Plan your week, one meal at a time</p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={handleAIGenerate}
                    disabled={isGenerating}
                    className="btn btn-primary flex items-center space-x-2"
                  >
                    {isGenerating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                    <span>AI Generate</span>
                  </button>
                  <button
                    onClick={handleGenerateShoppingList}
                    disabled={isGenShoppingList || !currentPlan}
                    className="btn btn-outline flex items-center space-x-2"
                  >
                    {isGenShoppingList ? <Loader2 className="w-4 h-4 animate-spin" /> : <ShoppingCart className="w-4 h-4" />}
                    <span>Shopping List</span>
                  </button>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Week Navigation */}
          <motion.div
            className="flex items-center justify-between mb-6 glass-card rounded-2xl px-4 py-3"
            initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
          >
            <button
              onClick={() => setWeekStart(prev => addDays(prev, -7))}
              className="p-2 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-700 transition-colors"
            >
              <ChevronLeft className="w-5 h-5 text-neutral-600 dark:text-neutral-400" />
            </button>
            <div className="text-center">
              <p className="font-bold text-neutral-900 dark:text-neutral-100">
                {isThisWeek ? 'This Week' : formatWeekRange(weekStart)}
              </p>
              {isThisWeek && <p className="text-xs text-neutral-500 dark:text-neutral-400">{formatWeekRange(weekStart)}</p>}
            </div>
            <button
              onClick={() => setWeekStart(prev => addDays(prev, 7))}
              className="p-2 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-700 transition-colors"
            >
              <ChevronRight className="w-5 h-5 text-neutral-600 dark:text-neutral-400" />
            </button>
          </motion.div>

          {/* Calendar Grid */}
          {isLoading ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="w-8 h-8 text-purple-500 animate-spin" />
            </div>
          ) : (
            <motion.div
              initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}
            >
              {/* First-use prompt when no meals planned this week */}
              {!currentPlan && (
                <motion.div
                  className="mb-4 p-5 rounded-2xl border border-dashed border-purple-300 dark:border-purple-700 bg-purple-50/50 dark:bg-purple-900/10 text-center"
                  initial={{ opacity: 0, scale: 0.97 }} animate={{ opacity: 1, scale: 1 }}
                >
                  <CalendarDays className="w-10 h-10 text-purple-400 mx-auto mb-2" />
                  <h3 className="text-base font-bold text-neutral-800 dark:text-neutral-200 mb-1">No meals planned this week</h3>
                  <p className="text-sm text-neutral-500 dark:text-neutral-400 mb-3">Tap a slot below to add a meal, or let AI fill in the whole week.</p>
                  <button
                    onClick={handleAIGenerate}
                    disabled={isGenerating}
                    className="btn btn-primary inline-flex items-center space-x-2"
                  >
                    {isGenerating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                    <span>Generate with AI</span>
                  </button>
                </motion.div>
              )}
              {/* Desktop: 7-column grid */}
              <div className="hidden md:grid grid-cols-7 gap-2">
                {weekDates.map((dateStr) => {
                  const date = new Date(dateStr + 'T12:00:00')
                  const isToday = dateStr === toDateStr(new Date())
                  const dayLabel = date.toLocaleDateString('en-GB', { weekday: 'short' })
                  const dayNum = date.getDate()

                  return (
                    <div key={dateStr} className={`rounded-2xl border ${isToday ? 'border-purple-400 dark:border-purple-500 bg-purple-50/50 dark:bg-purple-900/10' : 'border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800'} overflow-hidden`}>
                      {/* Day header */}
                      <div className={`px-3 py-2 border-b ${isToday ? 'border-purple-200 dark:border-purple-700 bg-purple-100/50 dark:bg-purple-900/20' : 'border-neutral-100 dark:border-neutral-700'}`}>
                        <p className={`text-xs font-bold uppercase tracking-wider ${isToday ? 'text-purple-600 dark:text-purple-400' : 'text-neutral-500 dark:text-neutral-400'}`}>{dayLabel}</p>
                        <p className={`text-lg font-black ${isToday ? 'text-purple-700 dark:text-purple-300' : 'text-neutral-900 dark:text-neutral-100'}`}>{dayNum}</p>
                      </div>

                      {/* Meal slots */}
                      <div className="p-2 space-y-1.5">
                        {MEAL_TYPES.map(mealType => {
                          const meal = getMealForSlot(dateStr, mealType)
                          const Icon = MEAL_ICONS[mealType]
                          const styles = MEAL_STYLES[mealType]

                          return (
                            <div key={mealType} className={`rounded-xl p-2 min-h-[52px] ${meal ? `${styles.filledBg} ${styles.filledBorder}` : 'bg-neutral-50 dark:bg-neutral-700/40 border border-dashed border-neutral-200 dark:border-neutral-600'}`}>
                              <div className="flex items-start justify-between gap-1">
                                <div className="flex items-center gap-1 min-w-0">
                                  <Icon className={`w-3 h-3 flex-shrink-0 ${meal ? styles.iconColor : 'text-neutral-400 dark:text-neutral-500'}`} />
                                  {meal ? (
                                    <p className={`text-xs font-semibold ${styles.textColor} leading-tight line-clamp-2`}>{meal.name}</p>
                                  ) : (
                                    <p className="text-xs text-neutral-400 dark:text-neutral-500">{mealType}</p>
                                  )}
                                </div>
                                <div className="flex items-center flex-shrink-0">
                                  {meal ? (
                                    <>
                                      <button onClick={() => openEditSlot(dateStr, mealType)} className="p-0.5 rounded text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-300 transition-colors">
                                        <Pencil className="w-3 h-3" />
                                      </button>
                                      <button onClick={() => handleDeleteMeal(dateStr, mealType)} className="p-0.5 rounded text-neutral-400 hover:text-red-500 dark:hover:text-red-400 transition-colors">
                                        <Trash2 className="w-3 h-3" />
                                      </button>
                                    </>
                                  ) : (
                                    <button onClick={() => openEditSlot(dateStr, mealType)} className={`p-0.5 rounded text-neutral-400 ${styles.hoverColor} transition-colors`}>
                                      <Plus className="w-3.5 h-3.5" />
                                    </button>
                                  )}
                                </div>
                              </div>
                            </div>
                          )
                        })}
                      </div>
                    </div>
                  )
                })}
              </div>

              {/* Mobile: stacked day cards */}
              <div className="md:hidden space-y-4">
                {weekDates.map((dateStr) => {
                  const date = new Date(dateStr + 'T12:00:00')
                  const isToday = dateStr === toDateStr(new Date())
                  const dayLabel = date.toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'short' })

                  return (
                    <div key={dateStr} className={`rounded-2xl border ${isToday ? 'border-purple-400 dark:border-purple-500' : 'border-neutral-200 dark:border-neutral-700'} bg-white dark:bg-neutral-800 overflow-hidden`}>
                      <div className={`px-4 py-3 border-b ${isToday ? 'border-purple-200 dark:border-purple-700 bg-purple-50 dark:bg-purple-900/20' : 'border-neutral-100 dark:border-neutral-700'}`}>
                        <p className={`font-bold ${isToday ? 'text-purple-700 dark:text-purple-300' : 'text-neutral-900 dark:text-neutral-100'}`}>{dayLabel}</p>
                      </div>
                      <div className="p-3 space-y-2">
                        {MEAL_TYPES.map(mealType => {
                          const meal = getMealForSlot(dateStr, mealType)
                          const Icon = MEAL_ICONS[mealType]
                          const styles = MEAL_STYLES[mealType]

                          return (
                            <div key={mealType} className={`flex items-center justify-between rounded-xl px-3 py-2.5 ${meal ? `${styles.filledBg} ${styles.filledBorder}` : 'bg-neutral-50 dark:bg-neutral-700/40 border border-dashed border-neutral-200 dark:border-neutral-600'}`}>
                              <div className="flex items-center space-x-2 min-w-0">
                                <Icon className={`w-4 h-4 flex-shrink-0 ${meal ? styles.iconColor : 'text-neutral-400'}`} />
                                <div className="min-w-0">
                                  <p className="text-xs font-semibold text-neutral-500 dark:text-neutral-400">{mealType}</p>
                                  {meal && <p className={`text-sm font-bold ${styles.textColor} truncate`}>{meal.name}</p>}
                                </div>
                              </div>
                              <div className="flex items-center space-x-1 flex-shrink-0">
                                {meal ? (
                                  <>
                                    <button onClick={() => openEditSlot(dateStr, mealType)} className="p-1.5 rounded-lg text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-300 hover:bg-white dark:hover:bg-neutral-700 transition-colors">
                                      <Pencil className="w-3.5 h-3.5" />
                                    </button>
                                    <button onClick={() => handleDeleteMeal(dateStr, mealType)} className="p-1.5 rounded-lg text-neutral-400 hover:text-red-500 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors">
                                      <Trash2 className="w-3.5 h-3.5" />
                                    </button>
                                  </>
                                ) : (
                                  <button onClick={() => openEditSlot(dateStr, mealType)} className={`p-1.5 rounded-lg text-neutral-400 ${styles.hoverColor} ${styles.hoverBg} transition-colors`}>
                                    <Plus className="w-4 h-4" />
                                  </button>
                                )}
                              </div>
                            </div>
                          )
                        })}
                      </div>
                    </div>
                  )
                })}
              </div>
            </motion.div>
          )}
        </div>
      </div>

      {/* Add/Edit Meal Modal */}
      <AnimatePresence>
        {editSlot && (
          <motion.div
            className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          >
            <div className="absolute inset-0 bg-black/60" onClick={() => { setEditSlot(null); setMealInput('') }} />
            <motion.div
              className="relative bg-white dark:bg-neutral-800 rounded-2xl shadow-2xl w-full max-w-sm p-6 z-10"
              initial={{ y: 40, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 40, opacity: 0 }}
            >
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="text-lg font-bold text-neutral-900 dark:text-neutral-100">
                    {editSlot.existing ? 'Edit' : 'Add'} {editSlot.mealType}
                  </h2>
                  <p className="text-sm text-neutral-500 dark:text-neutral-400">
                    {new Date(editSlot.date + 'T12:00:00').toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long' })}
                  </p>
                </div>
                <button onClick={() => { setEditSlot(null); setMealInput('') }} className="p-1.5 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-700 transition-colors">
                  <X className="w-5 h-5 text-neutral-500 dark:text-neutral-400" />
                </button>
              </div>

              <div className="mb-5">
                <label className="block text-sm font-semibold text-neutral-700 dark:text-neutral-300 mb-2">Meal name</label>
                <input
                  autoFocus
                  value={mealInput}
                  onChange={e => setMealInput(e.target.value)}
                  onKeyDown={e => { if (e.key === 'Enter') handleSaveMeal() }}
                  placeholder={`e.g. ${editSlot.mealType === 'Breakfast' ? 'Avocado toast' : editSlot.mealType === 'Lunch' ? 'Chicken salad' : 'Pasta bolognese'}`}
                  className="w-full px-3 py-2.5 rounded-xl border border-neutral-200 dark:border-neutral-600 bg-neutral-50 dark:bg-neutral-700 text-neutral-900 dark:text-neutral-100 text-sm focus:outline-none focus:ring-2 focus:ring-purple-400"
                />
              </div>

              <div className="flex space-x-3">
                <button
                  onClick={() => { setEditSlot(null); setMealInput('') }}
                  className="flex-1 py-2.5 rounded-xl border border-neutral-200 dark:border-neutral-700 text-neutral-700 dark:text-neutral-300 font-semibold text-sm hover:bg-neutral-50 dark:hover:bg-neutral-700 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveMeal}
                  disabled={updatePlanMutation.isLoading || createPlanMutation.isLoading}
                  className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-purple-500 to-blue-500 text-white font-bold text-sm hover:opacity-90 disabled:opacity-50 transition-opacity flex items-center justify-center space-x-2"
                >
                  {(updatePlanMutation.isLoading || createPlanMutation.isLoading) ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <span>Save</span>
                  )}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Shopping List Modal */}
      <AnimatePresence>
        {showShoppingList && (
          <motion.div
            className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          >
            <div className="absolute inset-0 bg-black/60" onClick={() => setShowShoppingList(false)} />
            <motion.div
              className="relative bg-white dark:bg-neutral-800 rounded-2xl shadow-2xl w-full max-w-sm p-6 z-10 max-h-[80vh] overflow-y-auto"
              initial={{ y: 40, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 40, opacity: 0 }}
            >
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-2">
                  <ShoppingCart className="w-5 h-5 text-purple-500" />
                  <h2 className="text-lg font-bold text-neutral-900 dark:text-neutral-100">Shopping List</h2>
                </div>
                <button onClick={() => setShowShoppingList(false)} className="p-1.5 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-700 transition-colors">
                  <X className="w-5 h-5 text-neutral-500 dark:text-neutral-400" />
                </button>
              </div>

              <p className="text-sm text-neutral-500 dark:text-neutral-400 mb-4">
                Ingredients missing from your pantry for this week's meals:
              </p>

              {shoppingList.length === 0 ? (
                <div className="text-center py-8">
                  <ShoppingCart className="w-10 h-10 text-neutral-300 dark:text-neutral-600 mx-auto mb-2" />
                  <p className="text-sm text-neutral-500 dark:text-neutral-400">All ingredients are in your pantry!</p>
                </div>
              ) : (
                <>
                  <div className="space-y-2">
                    {shoppingList.map((item, idx) => (
                      <div key={idx} className="flex items-center justify-between px-3 py-2.5 rounded-xl bg-neutral-50 dark:bg-neutral-700/50 border border-neutral-100 dark:border-neutral-700">
                        <span className="text-sm font-medium text-neutral-800 dark:text-neutral-200">{item.name}</span>
                        {item.quantity > 1 && (
                          <span className="text-xs font-bold text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-900/30 px-2 py-0.5 rounded-full">×{item.quantity}</span>
                        )}
                      </div>
                    ))}
                  </div>

                  <button
                    onClick={handleAddToGroceryList}
                    disabled={isAddingToGrocery}
                    className="mt-4 w-full py-2.5 rounded-xl bg-gradient-to-r from-purple-500 to-blue-500 text-white font-bold text-sm hover:opacity-90 disabled:opacity-50 transition-opacity flex items-center justify-center space-x-2"
                  >
                    {isAddingToGrocery ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <>
                        <ShoppingCart className="w-4 h-4" />
                        <span>Add All to Grocery List</span>
                      </>
                    )}
                  </button>
                </>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
