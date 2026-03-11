import { useState } from 'react'
import { Helmet } from 'react-helmet-async'
import { useQuery, useMutation, useQueryClient } from 'react-query'
import { motion, AnimatePresence } from 'framer-motion'
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts'
import {
  Apple,
  Plus,
  Trash2,
  X,
  ChevronLeft,
  ChevronRight,
  Target,
  Zap,
  Settings,
  Loader2
} from 'lucide-react'
import { apiService } from '../services/api'
import { useAuth } from '../hooks/useAuth'
import toast from 'react-hot-toast'

interface NutritionLog {
  id: string
  date: string
  meal_type: 'breakfast' | 'lunch' | 'dinner' | 'snack'
  food_name: string
  calories: number
  protein: number
  carbs: number
  fat: number
  servings: number
  notes?: string
}

interface NutritionTotals {
  calories: number
  protein: number
  carbs: number
  fat: number
}

interface NutritionGoals {
  daily_calories: number
  daily_protein: number
  daily_carbs: number
  daily_fat: number
}

interface WeeklyEntry {
  date: string
  label: string
  calories: number
  protein: number
  carbs: number
  fat: number
}

const MEAL_TYPES = ['breakfast', 'lunch', 'dinner', 'snack'] as const
const MEAL_LABELS: Record<string, string> = {
  breakfast: 'Breakfast',
  lunch: 'Lunch',
  dinner: 'Dinner',
  snack: 'Snacks'
}
const MEAL_COLORS: Record<string, string> = {
  breakfast: 'orange',
  lunch: 'blue',
  dinner: 'purple',
  snack: 'green'
}

function formatDate(dateStr: string) {
  const d = new Date(dateStr + 'T12:00:00')
  const today = new Date().toISOString().split('T')[0]
  const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0]
  if (dateStr === today) return 'Today'
  if (dateStr === yesterday) return 'Yesterday'
  return d.toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long' })
}

function MacroRing({ value, goal, color, label, unit = 'g' }: { value: number; goal: number; color: string; label: string; unit?: string }) {
  const pct = Math.min((value / Math.max(goal, 1)) * 100, 100)
  const colorMap: Record<string, string> = {
    orange: '#f97316',
    blue: '#3b82f6',
    purple: '#a855f7',
    green: '#22c55e',
    red: '#ef4444'
  }
  const hex = colorMap[color] || colorMap.blue
  const radius = 28
  const circumference = 2 * Math.PI * radius
  const strokeDashoffset = circumference - (pct / 100) * circumference

  return (
    <div className="flex flex-col items-center">
      <div className="relative w-16 h-16">
        <svg className="w-16 h-16 -rotate-90" viewBox="0 0 72 72">
          <circle cx="36" cy="36" r={radius} fill="none" stroke="#e5e7eb" strokeWidth="7" className="dark:stroke-neutral-700" />
          <circle
            cx="36" cy="36" r={radius}
            fill="none"
            stroke={hex}
            strokeWidth="7"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            style={{ transition: 'stroke-dashoffset 0.8s ease' }}
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-xs font-black text-neutral-900 dark:text-neutral-100">{Math.round(pct)}%</span>
        </div>
      </div>
      <p className="text-sm font-bold text-neutral-900 dark:text-neutral-100 mt-1">{Math.round(value)}{unit}</p>
      <p className="text-xs text-neutral-500 dark:text-neutral-400">{label}</p>
      <p className="text-xs text-neutral-400 dark:text-neutral-500">/ {goal}{unit}</p>
    </div>
  )
}

export default function NutritionTracker() {
  const { user } = useAuth()
  const queryClient = useQueryClient()
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0])
  const [showAddModal, setShowAddModal] = useState(false)
  const [showGoalsPanel, setShowGoalsPanel] = useState(false)
  const [addMealType, setAddMealType] = useState<'breakfast' | 'lunch' | 'dinner' | 'snack'>('snack')

  // Add food form state
  const [foodName, setFoodName] = useState('')
  const [servings, setServings] = useState('1')
  const [calories, setCalories] = useState('')
  const [protein, setProtein] = useState('')
  const [carbs, setCarbs] = useState('')
  const [fat, setFat] = useState('')
  const [aiLookupLoading, setAiLookupLoading] = useState(false)

  // Goals form state
  const [goalCalories, setGoalCalories] = useState('')
  const [goalProtein, setGoalProtein] = useState('')
  const [goalCarbs, setGoalCarbs] = useState('')
  const [goalFat, setGoalFat] = useState('')

  // Fetch today's logs
  const { data: todayData, isLoading: logsLoading } = useQuery(
    ['nutrition-today', selectedDate],
    () => apiService.get(`/api/nutrition/today?date=${selectedDate}`),
    { enabled: !!user }
  )

  // Fetch goals
  const { data: goalsData } = useQuery(
    ['nutrition-goals'],
    () => apiService.get('/api/nutrition/goals'),
    {
      enabled: !!user,
      onSuccess: (data: any) => {
        setGoalCalories(String(data?.goals?.daily_calories ?? 2000))
        setGoalProtein(String(data?.goals?.daily_protein ?? 150))
        setGoalCarbs(String(data?.goals?.daily_carbs ?? 250))
        setGoalFat(String(data?.goals?.daily_fat ?? 65))
      }
    }
  )

  // Fetch weekly data
  const { data: weeklyData } = useQuery(
    ['nutrition-weekly'],
    () => apiService.get('/api/nutrition/weekly'),
    { enabled: !!user }
  )

  const logs: NutritionLog[] = (todayData as any)?.logs || []
  const totals: NutritionTotals = (todayData as any)?.totals || { calories: 0, protein: 0, carbs: 0, fat: 0 }
  const goals: NutritionGoals = (goalsData as any)?.goals || { daily_calories: 2000, daily_protein: 150, daily_carbs: 250, daily_fat: 65 }
  const weekly: WeeklyEntry[] = (weeklyData as any)?.weekly || []

  // Add log mutation
  const addLogMutation = useMutation(
    (data: object) => apiService.post('/api/nutrition/log', data),
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['nutrition-today', selectedDate])
        queryClient.invalidateQueries(['nutrition-weekly'])
        toast.success('Food logged!')
        resetAddForm()
        setShowAddModal(false)
      },
      onError: () => { toast.error('Failed to log food') }
    }
  )

  // Delete log mutation
  const deleteLogMutation = useMutation(
    (id: string) => apiService.delete(`/api/nutrition/log/${id}`),
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['nutrition-today', selectedDate])
        queryClient.invalidateQueries(['nutrition-weekly'])
        toast.success('Entry removed')
      },
      onError: () => { toast.error('Failed to remove entry') }
    }
  )

  // Save goals mutation
  const saveGoalsMutation = useMutation(
    (data: object) => apiService.put('/api/nutrition/goals', data),
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['nutrition-goals'])
        toast.success('Goals updated!')
        setShowGoalsPanel(false)
      },
      onError: () => { toast.error('Failed to save goals') }
    }
  )

  function resetAddForm() {
    setFoodName('')
    setServings('1')
    setCalories('')
    setProtein('')
    setCarbs('')
    setFat('')
  }

  function shiftDate(days: number) {
    const d = new Date(selectedDate + 'T12:00:00')
    d.setDate(d.getDate() + days)
    setSelectedDate(d.toISOString().split('T')[0])
  }

  async function handleAiLookup() {
    if (!foodName.trim()) return toast.error('Enter a food name first')
    setAiLookupLoading(true)
    try {
      const result: any = await apiService.post('/api/ai/nutrition', {
        foodItem: foodName,
        quantity: Number(servings) || 1,
        unit: 'serving'
      })
      const n = result?.nutrition
      if (n) {
        setCalories(String(Math.round(n.calories || 0)))
        setProtein(String(Math.round(n.protein || 0)))
        setCarbs(String(Math.round(n.carbs || 0)))
        setFat(String(Math.round(n.fat || 0)))
        toast.success('Nutrition data fetched!')
      } else {
        toast.error('Could not parse nutrition data')
      }
    } catch {
      toast.error('AI lookup failed — enter macros manually')
    } finally {
      setAiLookupLoading(false)
    }
  }

  function handleAddFood() {
    if (!foodName.trim()) return toast.error('Enter a food name')
    addLogMutation.mutate({
      date: selectedDate,
      meal_type: addMealType,
      food_name: foodName.trim(),
      calories: Number(calories) || 0,
      protein: Number(protein) || 0,
      carbs: Number(carbs) || 0,
      fat: Number(fat) || 0,
      servings: Number(servings) || 1
    })
  }

  function handleSaveGoals() {
    saveGoalsMutation.mutate({
      daily_calories: Number(goalCalories) || 2000,
      daily_protein: Number(goalProtein) || 150,
      daily_carbs: Number(goalCarbs) || 250,
      daily_fat: Number(goalFat) || 65
    })
  }

  const isToday = selectedDate === new Date().toISOString().split('T')[0]

  return (
    <>
      <Helmet>
        <title>Nutrition Tracker - Nourish Neural</title>
      </Helmet>

      <div className="relative min-h-screen pb-16">
        <div className="pointer-events-none fixed inset-0 bg-gradient-to-br from-orange-50/30 via-white to-green-50/20 dark:from-neutral-900 dark:via-neutral-900 dark:to-neutral-800" />

        <div className="relative">
          {/* Header */}
          <motion.div className="mb-8" initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-orange-400 to-green-500 flex items-center justify-center shadow-lg">
                  <Apple className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h1 className="text-3xl font-black text-neutral-900 dark:text-neutral-100">Nutrition Tracker</h1>
                  <p className="text-sm text-neutral-500 dark:text-neutral-400">Track your daily macros and calories</p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setShowGoalsPanel(true)}
                  className="flex items-center space-x-2 px-4 py-2 rounded-xl border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-50 dark:hover:bg-neutral-700 transition-colors text-sm font-semibold"
                >
                  <Settings className="w-4 h-4" />
                  <span>Goals</span>
                </button>
                <button
                  onClick={() => { setShowAddModal(true) }}
                  className="flex items-center space-x-2 px-4 py-2 rounded-xl bg-gradient-to-r from-orange-500 to-green-500 text-white font-semibold text-sm hover:opacity-90 transition-opacity shadow-md"
                >
                  <Plus className="w-4 h-4" />
                  <span>Log Food</span>
                </button>
              </div>
            </div>
          </motion.div>

          {/* Date Navigation */}
          <motion.div
            className="flex items-center justify-between mb-6 bg-white dark:bg-neutral-800 rounded-2xl border border-neutral-200 dark:border-neutral-700 px-4 py-3"
            initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
          >
            <button onClick={() => shiftDate(-1)} className="p-2 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-700 transition-colors">
              <ChevronLeft className="w-5 h-5 text-neutral-600 dark:text-neutral-400" />
            </button>
            <div className="text-center">
              <p className="font-bold text-neutral-900 dark:text-neutral-100">{formatDate(selectedDate)}</p>
              <p className="text-xs text-neutral-500 dark:text-neutral-400">{selectedDate}</p>
            </div>
            <button
              onClick={() => shiftDate(1)}
              disabled={isToday}
              className="p-2 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-700 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
            >
              <ChevronRight className="w-5 h-5 text-neutral-600 dark:text-neutral-400" />
            </button>
          </motion.div>

          {/* Macro Summary Cards */}
          <motion.div
            className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8"
            initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}
          >
            {/* Calories - large card */}
            <div className="col-span-2 bg-white dark:bg-neutral-800 rounded-2xl border border-neutral-200 dark:border-neutral-700 p-5">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center space-x-2">
                  <Zap className="w-5 h-5 text-orange-500" />
                  <span className="font-bold text-neutral-900 dark:text-neutral-100">Calories</span>
                </div>
                <span className="text-sm text-neutral-500 dark:text-neutral-400">
                  {Math.round(totals.calories)} / {goals.daily_calories} kcal
                </span>
              </div>
              <div className="w-full bg-neutral-100 dark:bg-neutral-700 rounded-full h-3 mb-2">
                <motion.div
                  className="bg-gradient-to-r from-orange-400 to-orange-600 h-3 rounded-full"
                  initial={{ width: 0 }}
                  animate={{ width: `${Math.min((totals.calories / Math.max(goals.daily_calories, 1)) * 100, 100)}%` }}
                  transition={{ duration: 0.8, delay: 0.3 }}
                />
              </div>
              <p className="text-3xl font-black text-neutral-900 dark:text-neutral-100">{Math.round(totals.calories)}</p>
              <p className="text-xs text-neutral-500 dark:text-neutral-400">
                {Math.max(0, goals.daily_calories - Math.round(totals.calories))} kcal remaining
              </p>
            </div>

            {/* Macros - rings */}
            {[
              { key: 'protein', label: 'Protein', value: totals.protein, goal: goals.daily_protein, color: 'blue' },
              { key: 'carbs', label: 'Carbs', value: totals.carbs, goal: goals.daily_carbs, color: 'purple' },
              { key: 'fat', label: 'Fat', value: totals.fat, goal: goals.daily_fat, color: 'green' }
            ].map((macro) => (
              <div key={macro.key} className="bg-white dark:bg-neutral-800 rounded-2xl border border-neutral-200 dark:border-neutral-700 p-4 flex items-center justify-center">
                <MacroRing value={macro.value} goal={macro.goal} color={macro.color} label={macro.label} />
              </div>
            ))}
          </motion.div>

          {/* Meal Sections */}
          <motion.div
            className="space-y-4 mb-8"
            initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
          >
            {logsLoading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="w-8 h-8 text-orange-500 animate-spin" />
              </div>
            ) : (
              MEAL_TYPES.map((mealType) => {
                const mealLogs = logs.filter(l => l.meal_type === mealType)
                const mealCals = mealLogs.reduce((s, l) => s + Number(l.calories), 0)
                const color = MEAL_COLORS[mealType]

                return (
                  <div key={mealType} className="bg-white dark:bg-neutral-800 rounded-2xl border border-neutral-200 dark:border-neutral-700 overflow-hidden">
                    <div className="flex items-center justify-between px-5 py-4 border-b border-neutral-100 dark:border-neutral-700">
                      <div className="flex items-center space-x-2">
                        <div className={`w-2.5 h-2.5 rounded-full bg-${color}-500`} />
                        <h3 className="font-bold text-neutral-900 dark:text-neutral-100">{MEAL_LABELS[mealType]}</h3>
                        {mealCals > 0 && (
                          <span className="text-xs font-semibold text-neutral-500 dark:text-neutral-400 ml-1">{Math.round(mealCals)} kcal</span>
                        )}
                      </div>
                      <button
                        onClick={() => { setAddMealType(mealType); setShowAddModal(true) }}
                        className={`p-1.5 rounded-lg bg-${color}-50 dark:bg-${color}-900/20 text-${color}-600 dark:text-${color}-400 hover:bg-${color}-100 dark:hover:bg-${color}-900/30 transition-colors`}
                      >
                        <Plus className="w-4 h-4" />
                      </button>
                    </div>

                    {mealLogs.length === 0 ? (
                      <div className="px-5 py-4 text-sm text-neutral-400 dark:text-neutral-500">Nothing logged yet</div>
                    ) : (
                      <div className="divide-y divide-neutral-50 dark:divide-neutral-700/50">
                        {mealLogs.map((log) => (
                          <div key={log.id} className="flex items-center justify-between px-5 py-3 hover:bg-neutral-50 dark:hover:bg-neutral-700/30 transition-colors">
                            <div className="flex-1 min-w-0">
                              <p className="font-medium text-neutral-900 dark:text-neutral-100 truncate">{log.food_name}</p>
                              <p className="text-xs text-neutral-500 dark:text-neutral-400">
                                {log.servings} serving{log.servings !== 1 ? 's' : ''} · {Math.round(log.calories)} kcal · P {Math.round(log.protein)}g · C {Math.round(log.carbs)}g · F {Math.round(log.fat)}g
                              </p>
                            </div>
                            <button
                              onClick={() => deleteLogMutation.mutate(log.id)}
                              className="ml-3 p-1.5 rounded-lg text-neutral-400 dark:text-neutral-500 hover:text-red-500 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors flex-shrink-0"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )
              })
            )}
          </motion.div>

          {/* Weekly Chart */}
          {weekly.length > 0 && (
            <motion.div
              className="bg-white dark:bg-neutral-800 rounded-2xl border border-neutral-200 dark:border-neutral-700 p-5 mb-8"
              initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}
            >
              <div className="flex items-center space-x-2 mb-5">
                <Target className="w-5 h-5 text-orange-500" />
                <h3 className="font-bold text-neutral-900 dark:text-neutral-100">7-Day Calorie History</h3>
              </div>
              <ResponsiveContainer width="100%" height={200}>
                <AreaChart data={weekly} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="calGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#f97316" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#f97316" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" className="dark:stroke-neutral-700" />
                  <XAxis dataKey="label" tick={{ fontSize: 12, fill: '#6b7280' }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 11, fill: '#6b7280' }} axisLine={false} tickLine={false} />
                  <Tooltip
                    contentStyle={{ background: '#1f2937', border: 'none', borderRadius: '8px', color: '#f9fafb', fontSize: 12 }}
                    formatter={(v: number | undefined) => [`${Math.round(v ?? 0)} kcal`, 'Calories']}
                  />
                  <ReferenceLine y={goals.daily_calories} stroke="#22c55e" strokeDasharray="4 4" strokeWidth={2} label={{ value: 'Goal', position: 'right', fontSize: 11, fill: '#22c55e' }} />
                  <Area type="monotone" dataKey="calories" stroke="#f97316" strokeWidth={2} fill="url(#calGradient)" dot={{ fill: '#f97316', r: 4 }} activeDot={{ r: 6 }} />
                </AreaChart>
              </ResponsiveContainer>
            </motion.div>
          )}
        </div>
      </div>

      {/* Add Food Modal */}
      <AnimatePresence>
        {showAddModal && (
          <motion.div
            className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          >
            <div className="absolute inset-0 bg-black/60" onClick={() => { setShowAddModal(false); resetAddForm() }} />
            <motion.div
              className="relative bg-white dark:bg-neutral-800 rounded-2xl shadow-2xl w-full max-w-md p-6 z-10"
              initial={{ y: 40, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 40, opacity: 0 }}
            >
              <div className="flex items-center justify-between mb-5">
                <h2 className="text-lg font-bold text-neutral-900 dark:text-neutral-100">Log Food</h2>
                <button onClick={() => { setShowAddModal(false); resetAddForm() }} className="p-1.5 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-700 transition-colors">
                  <X className="w-5 h-5 text-neutral-500 dark:text-neutral-400" />
                </button>
              </div>

              {/* Meal type selector */}
              <div className="flex space-x-2 mb-4">
                {MEAL_TYPES.map(t => (
                  <button
                    key={t}
                    onClick={() => setAddMealType(t)}
                    className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition-colors ${addMealType === t ? 'bg-orange-500 text-white' : 'bg-neutral-100 dark:bg-neutral-700 text-neutral-600 dark:text-neutral-300 hover:bg-neutral-200 dark:hover:bg-neutral-600'}`}
                  >
                    {MEAL_LABELS[t]}
                  </button>
                ))}
              </div>

              {/* Food name + AI lookup */}
              <div className="mb-3">
                <label className="block text-sm font-semibold text-neutral-700 dark:text-neutral-300 mb-1">Food Name</label>
                <div className="flex space-x-2">
                  <input
                    value={foodName}
                    onChange={e => setFoodName(e.target.value)}
                    placeholder="e.g. Grilled chicken breast"
                    className="flex-1 px-3 py-2 rounded-xl border border-neutral-200 dark:border-neutral-600 bg-neutral-50 dark:bg-neutral-700 text-neutral-900 dark:text-neutral-100 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400"
                  />
                  <button
                    onClick={handleAiLookup}
                    disabled={aiLookupLoading || !foodName.trim()}
                    className="px-3 py-2 rounded-xl bg-gradient-to-r from-orange-500 to-green-500 text-white text-xs font-semibold hover:opacity-90 disabled:opacity-50 transition-opacity flex items-center space-x-1 whitespace-nowrap"
                  >
                    {aiLookupLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Zap className="w-3.5 h-3.5" />}
                    <span>AI Lookup</span>
                  </button>
                </div>
              </div>

              {/* Servings */}
              <div className="mb-4">
                <label className="block text-sm font-semibold text-neutral-700 dark:text-neutral-300 mb-1">Servings</label>
                <input
                  type="number" min="0.25" step="0.25"
                  value={servings} onChange={e => setServings(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-neutral-200 dark:border-neutral-600 bg-neutral-50 dark:bg-neutral-700 text-neutral-900 dark:text-neutral-100 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400"
                />
              </div>

              {/* Macro inputs */}
              <div className="grid grid-cols-2 gap-3 mb-5">
                {[
                  { label: 'Calories (kcal)', val: calories, set: setCalories, color: 'orange' },
                  { label: 'Protein (g)', val: protein, set: setProtein, color: 'blue' },
                  { label: 'Carbs (g)', val: carbs, set: setCarbs, color: 'purple' },
                  { label: 'Fat (g)', val: fat, set: setFat, color: 'green' }
                ].map(f => (
                  <div key={f.label}>
                    <label className="block text-xs font-semibold text-neutral-600 dark:text-neutral-400 mb-1">{f.label}</label>
                    <input
                      type="number" min="0" step="1"
                      value={f.val} onChange={e => f.set(e.target.value)}
                      placeholder="0"
                      className="w-full px-3 py-2 rounded-xl border border-neutral-200 dark:border-neutral-600 bg-neutral-50 dark:bg-neutral-700 text-neutral-900 dark:text-neutral-100 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400"
                    />
                  </div>
                ))}
              </div>

              <button
                onClick={handleAddFood}
                disabled={addLogMutation.isLoading || !foodName.trim()}
                className="w-full py-3 rounded-xl bg-gradient-to-r from-orange-500 to-green-500 text-white font-bold text-sm hover:opacity-90 disabled:opacity-50 transition-opacity flex items-center justify-center space-x-2"
              >
                {addLogMutation.isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
                <span>Save to Log</span>
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Goals Panel */}
      <AnimatePresence>
        {showGoalsPanel && (
          <motion.div
            className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          >
            <div className="absolute inset-0 bg-black/60" onClick={() => setShowGoalsPanel(false)} />
            <motion.div
              className="relative bg-white dark:bg-neutral-800 rounded-2xl shadow-2xl w-full max-w-sm p-6 z-10"
              initial={{ y: 40, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 40, opacity: 0 }}
            >
              <div className="flex items-center justify-between mb-5">
                <h2 className="text-lg font-bold text-neutral-900 dark:text-neutral-100">Daily Goals</h2>
                <button onClick={() => setShowGoalsPanel(false)} className="p-1.5 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-700 transition-colors">
                  <X className="w-5 h-5 text-neutral-500 dark:text-neutral-400" />
                </button>
              </div>

              <div className="space-y-3 mb-5">
                {[
                  { label: 'Daily Calories (kcal)', val: goalCalories, set: setGoalCalories },
                  { label: 'Daily Protein (g)', val: goalProtein, set: setGoalProtein },
                  { label: 'Daily Carbs (g)', val: goalCarbs, set: setGoalCarbs },
                  { label: 'Daily Fat (g)', val: goalFat, set: setGoalFat }
                ].map(f => (
                  <div key={f.label}>
                    <label className="block text-sm font-semibold text-neutral-700 dark:text-neutral-300 mb-1">{f.label}</label>
                    <input
                      type="number" min="0" step="1"
                      value={f.val} onChange={e => f.set(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-neutral-200 dark:border-neutral-600 bg-neutral-50 dark:bg-neutral-700 text-neutral-900 dark:text-neutral-100 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400"
                    />
                  </div>
                ))}
              </div>

              <button
                onClick={handleSaveGoals}
                disabled={saveGoalsMutation.isLoading}
                className="w-full py-3 rounded-xl bg-gradient-to-r from-orange-500 to-green-500 text-white font-bold text-sm hover:opacity-90 disabled:opacity-50 transition-opacity flex items-center justify-center space-x-2"
              >
                {saveGoalsMutation.isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Target className="w-4 h-4" />}
                <span>Save Goals</span>
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
