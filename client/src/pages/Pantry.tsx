import { useState } from 'react'
import { Helmet } from 'react-helmet-async'
import { useQuery, useMutation, useQueryClient } from 'react-query'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Package,
  Plus,
  Edit,
  Trash2,
  X,
  DollarSign,
  AlertTriangle,
  Search,
  Archive,
  ArrowUpDown,
  Filter,
  ScanLine,
  Brain,
  ChevronDown,
  ChevronUp,
  Utensils,
  Clock,
  Calendar,
  Tag,
  ShoppingBag,
  Receipt,
  Home,
  Users
} from 'lucide-react'
import SmartWasteDashboard from '../components/SmartWasteDashboard'
import BarcodeScanner from '../components/BarcodeScanner'
import ReceiptScanner from '../components/ReceiptScanner'
import { ProductInfo } from '../services/barcodeService'
import { fadeUp, staggerContainer } from '../utils/motion'
import { apiService } from '../services/api'
import { useAuth } from '../hooks/useAuth'
import { useHousehold } from '../hooks/useHousehold'
import toast from 'react-hot-toast'

interface PantryItem {
  id: string
  name: string
  quantity: number
  unit: string
  category: string
  // Support both camelCase (from mock API) and snake_case (from real API)
  expiry_date?: string
  expiryDate?: string
  purchase_date?: string
  purchaseDate?: string
  estimated_price?: number
  estimatedPrice?: number
  barcode?: string
  notes?: string
  brand?: string
  store_name?: string
  image_url?: string
  is_archived?: boolean
  household_id?: string | null
  // Computed field
  wasteRisk?: 'low' | 'medium' | 'high' | 'very-high'
}

// Helper to get normalized field values (supports both camelCase and snake_case)
const getExpiryDate = (item: PantryItem): string | undefined =>
  item.expiry_date || item.expiryDate
const getPurchaseDate = (item: PantryItem): string =>
  item.purchase_date || item.purchaseDate || new Date().toISOString()
const getEstimatedPrice = (item: PantryItem): number | undefined =>
  item.estimated_price ?? item.estimatedPrice

// Waste risk calculation based on category and days until expiry
const calculateWasteRisk = (category: string, expiryDate?: string): 'low' | 'medium' | 'high' | 'very-high' => {
  // Base waste rates by category
  const categoryRiskBase: { [key: string]: number } = {
    'Herbs': 0.55,
    'Fish': 0.45,
    'Vegetables': 0.42,
    'Fruits': 0.38,
    'Meat': 0.35,
    'Bakery': 0.22,
    'Dairy': 0.20,
    'Frozen': 0.12,
    'Eggs': 0.10,
    'Pantry': 0.08,
    'Beverages': 0.06,
    'General': 0.15
  }

  let riskScore = categoryRiskBase[category] || 0.15

  // Adjust based on expiry
  if (expiryDate) {
    const daysUntilExpiry = Math.ceil((new Date(expiryDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))
    if (daysUntilExpiry <= 0) {
      riskScore = 0.99
    } else if (daysUntilExpiry <= 1) {
      riskScore = Math.min(0.95, riskScore + 0.55)
    } else if (daysUntilExpiry <= 3) {
      riskScore = Math.min(0.85, riskScore + 0.40)
    } else if (daysUntilExpiry <= 7) {
      riskScore = Math.min(0.65, riskScore + 0.20)
    }
  }

  if (riskScore >= 0.75) return 'very-high'
  if (riskScore >= 0.50) return 'high'
  if (riskScore >= 0.30) return 'medium'
  return 'low'
}

// Helpers used when calling the ML predict endpoint for a new item
const inferStorageType = (category: string): string => {
  if (['Dairy', 'Meat', 'Fish', 'Fruits', 'Vegetables', 'Eggs'].includes(category)) return 'fridge'
  if (category === 'Frozen') return 'freezer'
  return 'pantry'
}

const inferPerishability = (category: string): number => {
  const scores: Record<string, number> = {
    'Fish': 0.95, 'Meat': 0.85, 'Vegetables': 0.75, 'Fruits': 0.70,
    'Dairy': 0.65, 'Bakery': 0.55, 'Eggs': 0.45, 'Frozen': 0.25,
    'Beverages': 0.15, 'Pantry': 0.10, 'Snacks': 0.20, 'General': 0.40
  }
  return scores[category] ?? 0.40
}

interface CreateItemForm {
  name: string
  quantity: number
  unit: string
  category: string
  expiryDate?: string
  estimatedPrice?: number
  notes?: string
}

interface PantryStats {
  totalItems: number
  totalValue: number
  categoryBreakdown: { [key: string]: number }
  expiringSoon: number
  expired: number
  lowStock: number
  averageItemValue: number
}

export default function Pantry() {
  const { user } = useAuth()
  const { household, isMember } = useHousehold()
  const queryClient = useQueryClient()
  const [scope, setScope] = useState<'personal' | 'household'>('personal')
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [showScanner, setShowScanner] = useState(false)
  const [showReceiptScanner, setShowReceiptScanner] = useState(false)
  const [showWasteDashboard, setShowWasteDashboard] = useState(false)
  const [showConsumeModal, setShowConsumeModal] = useState<string | null>(null)
  const [consumeAmount, setConsumeAmount] = useState(1)
  const [editingItem, setEditingItem] = useState<PantryItem | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [filterType, setFilterType] = useState('all') // all, expiring, expired, lowStock, highRisk
  const [sortBy, setSortBy] = useState<'name' | 'date' | 'expiry' | 'price' | 'wasteRisk'>('date')
  const [newItemForm, setNewItemForm] = useState<CreateItemForm>({
    name: '',
    quantity: 1,
    unit: 'pieces',
    category: 'General',
    expiryDate: '',
    estimatedPrice: 0,
    notes: ''
  })
  const [itemRiskPreview, setItemRiskPreview] = useState<{
    risk_level: string
    waste_probability: number
    recommendations: string[]
  } | null>(null)
  const [checkingItemRisk, setCheckingItemRisk] = useState(false)

  // Fetch pantry items from API
  const { data: pantryData, isLoading: itemsLoading } = useQuery(
    ['pantry-items', scope],
    () => apiService.get<{ items: PantryItem[] }>(`/api/pantry?scope=${scope}`),
    {
      enabled: !!user,
      staleTime: 30000, // 30 seconds
      refetchOnWindowFocus: true,
    }
  )

  // Fetch pantry stats from API
  const { data: statsData } = useQuery(
    ['pantry-stats', scope],
    () => apiService.get<PantryStats>(`/api/pantry/stats?scope=${scope}`),
    {
      enabled: !!user,
      staleTime: 30000,
    }
  )

  // Fetch categories from API
  const { data: categoriesData } = useQuery(
    ['pantry-categories'],
    () => apiService.get<{ categories: string[] }>('/api/pantry/categories'),
    {
      enabled: !!user,
      staleTime: 60000, // 1 minute
    }
  )

  // Use API data or fallback to empty arrays
  const pantryItems: PantryItem[] = pantryData?.items || []
  const stats: PantryStats = statsData || {
    totalItems: 0,
    totalValue: 0,
    categoryBreakdown: {},
    expiringSoon: 0,
    expired: 0,
    lowStock: 0,
    averageItemValue: 0
  }
  const categories: string[] = categoriesData?.categories || ['Dairy', 'Meat', 'Fish', 'Vegetables', 'Fruits', 'Bakery', 'Pantry', 'Frozen', 'Beverages']
  const isLoading = itemsLoading

  // Handle scanned receipt items
  const handleReceiptItems = (items: { name: string; price?: number }[]) => {
    // Sequentially add items (could be optimized with a bulk API)
    items.forEach(item => {
      createItemMutation.mutate({
        name: item.name,
        quantity: 1,
        unit: 'pieces',
        category: 'General', // Could try to infer category from name in the future
        estimatedPrice: item.price || 0
      })
    })
    toast.success(`Processing ${items.length} items from receipt...`)
  }

  // Handle scanned product from barcode scanner
  const handleScannedProduct = (product: ProductInfo & { estimatedPrice?: number }) => {
    setNewItemForm({
      name: product.name || '',
      quantity: 1,
      unit: 'pieces',
      category: product.category || 'General',
      expiryDate: '',
      estimatedPrice: product.estimatedPrice || 0,
      notes: product.brand ? `Brand: ${product.brand}` : ''
    })
    setShowScanner(false)
    setShowCreateForm(true)
  }

  // Create pantry item mutation
  const createItemMutation = useMutation(
    (itemData: CreateItemForm) =>
      apiService.post<{ item: PantryItem; message: string }>('/api/pantry', {
        name: itemData.name,
        quantity: itemData.quantity,
        unit: itemData.unit,
        category: itemData.category,
        expiryDate: itemData.expiryDate || null,
        estimatedPrice: itemData.estimatedPrice || null,
        notes: itemData.notes || null,
        householdId: scope === 'household' && household ? household.id : null,
      }),
    {
      onSuccess: (data) => {
        queryClient.invalidateQueries(['pantry-items'])
        queryClient.invalidateQueries(['pantry-stats'])
        queryClient.invalidateQueries(['pantry-categories'])
        setShowCreateForm(false)
        setItemRiskPreview(null)
        setNewItemForm({
          name: '',
          quantity: 1,
          unit: 'pieces',
          category: 'General',
          expiryDate: '',
          estimatedPrice: 0,
          notes: ''
        })
        toast.success(data.message || 'Item added successfully!')
      },
      onError: () => {
        toast.error('Failed to add item. Please try again.')
      }
    }
  )

  // Update pantry item mutation
  const updateItemMutation = useMutation(
    ({ id, data }: { id: string; data: Partial<CreateItemForm> }) =>
      apiService.put<{ item: PantryItem; message: string }>(`/api/pantry/${id}`, data),
    {
      onSuccess: (data) => {
        queryClient.invalidateQueries(['pantry-items'])
        queryClient.invalidateQueries(['pantry-stats'])
        setEditingItem(null)
        toast.success(data.message || 'Item updated successfully!')
      },
      onError: () => {
        toast.error('Failed to update item. Please try again.')
      }
    }
  )

  // Delete pantry item mutation
  const deleteItemMutation = useMutation(
    (itemId: string) => apiService.delete<{ message: string }>(`/api/pantry/${itemId}`),
    {
      onSuccess: (data) => {
        queryClient.invalidateQueries(['pantry-items'])
        queryClient.invalidateQueries(['pantry-stats'])
        toast.success(data.message || 'Item removed successfully!')
      },
      onError: () => {
        toast.error('Failed to remove item. Please try again.')
      }
    }
  )

  // Consume pantry item mutation
  const consumeItemMutation = useMutation(
    ({ id, amount }: { id: string; amount: number }) =>
      apiService.post<{ item?: PantryItem; message: string; quantity: number }>(`/api/pantry/${id}/consume`, { amount }),
    {
      onSuccess: (data) => {
        queryClient.invalidateQueries(['pantry-items'])
        queryClient.invalidateQueries(['pantry-stats'])
        setShowConsumeModal(null)
        toast.success(data.message || 'Consumption recorded!')
      },
      onError: () => {
        toast.error('Failed to record consumption. Please try again.')
      }
    }
  )

  // Move item between personal and household scope
  const moveItemMutation = useMutation(
    ({ itemId, target }: { itemId: string; target: 'personal' | 'household' }) =>
      apiService.patch<{ message: string }>(`/api/households/items/${itemId}/move`, {
        target,
        householdId: target === 'household' ? household?.id : undefined
      }),
    {
      onSuccess: (data) => {
        queryClient.invalidateQueries(['pantry-items'])
        queryClient.invalidateQueries(['pantry-stats'])
        toast.success(data.message || 'Item moved successfully!')
      },
      onError: () => {
        toast.error('Failed to move item. Please try again.')
      }
    }
  )

  // Note: updateQuantityMutation removed as SmartPantryItem handles quantity updates

  const handleCreateItem = async () => {
    if (!newItemForm.name.trim()) return

    // Already warned — user accepted the risk, save directly
    if (itemRiskPreview !== null) {
      createItemMutation.mutate(newItemForm)
      return
    }

    setCheckingItemRisk(true)
    try {
      const prediction = await apiService.post<{
        risk_level: string
        waste_probability: number
        recommendations: string[]
      }>('/api/waste/predict', {
        food_item: {
          category: newItemForm.category,
          purchase_date: new Date().toISOString().split('T')[0],
          storage_type: inferStorageType(newItemForm.category),
          perishability_score: inferPerishability(newItemForm.category),
          package_quality: 0.85,
          estimated_price: newItemForm.estimatedPrice || 1.0,
          household_size: 2,
        },
        user_history: []
      })

      if (prediction.risk_level === 'High' || prediction.risk_level === 'Very High') {
        // Show inline warning — don't save yet
        setItemRiskPreview(prediction)
      } else {
        // Low / Medium risk — save directly
        createItemMutation.mutate(newItemForm)
      }
    } catch {
      // If predict fails for any reason, just save normally
      createItemMutation.mutate(newItemForm)
    } finally {
      setCheckingItemRisk(false)
    }
  }

  // Note: handleUpdateQuantity removed as SmartPantryItem handles quantity updates

  const getDaysUntilExpiry = (expiryDate: string) => {
    const expiry = new Date(expiryDate)
    const now = new Date()
    const diffTime = expiry.getTime() - now.getTime()
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24))
  }

  const getExpiryStatus = (expiryDate?: string) => {
    if (!expiryDate) return 'none'
    const days = getDaysUntilExpiry(expiryDate)
    if (days < 0) return 'expired'
    if (days <= 7) return 'expiring'
    return 'fresh'
  }

  const getExpiryColor = (expiryDate?: string) => {
    if (!expiryDate) return 'text-neutral-500'
    const days = getDaysUntilExpiry(expiryDate)
    if (days < 0) return 'text-red-600'
    if (days <= 2) return 'text-red-500'
    if (days <= 5) return 'text-orange-500'
    if (days <= 7) return 'text-yellow-500'
    return 'text-green-500'
  }

  const formatExpiryText = (expiryDate?: string) => {
    if (!expiryDate) return 'No expiry set'
    const days = getDaysUntilExpiry(expiryDate)
    if (days < 0) return `Expired ${Math.abs(days)} day${Math.abs(days) !== 1 ? 's' : ''} ago`
    if (days === 0) return 'Expires today'
    if (days === 1) return 'Expires tomorrow'
    if (days <= 7) return `Expires in ${days} days`
    return new Date(expiryDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })
  }

  const getCategoryIcon = (category: string) => {
    const icons: { [key: string]: string } = {
      'Dairy': '🥛',
      'Meat': '🥩',
      'Fish': '🐟',
      'Vegetables': '🥬',
      'Fruits': '🍎',
      'Bakery': '🍞',
      'Pantry': '🥫',
      'Frozen': '🧊',
      'Beverages': '🥤',
      'Grains': '🌾',
      'Canned Goods': '🥫',
      'Condiments': '🧂',
      'Snacks': '🍿',
      'General': '📦'
    }
    return icons[category] || '📦'
  }

  const filteredItems = pantryItems
    .filter(item => {
      // Search filter
      const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase())

      // Category filter
      const matchesCategory = selectedCategory === 'all' || item.category === selectedCategory

      // Apply filter type
      let matchesFilter = true
      if (filterType === 'expiring') {
        const status = getExpiryStatus(getExpiryDate(item))
        matchesFilter = status === 'expiring'
      } else if (filterType === 'expired') {
        const status = getExpiryStatus(getExpiryDate(item))
        matchesFilter = status === 'expired'
      } else if (filterType === 'lowStock') {
        matchesFilter = item.quantity <= 1
      } else if (filterType === 'highRisk') {
        const wasteRisk = calculateWasteRisk(item.category, getExpiryDate(item))
        matchesFilter = wasteRisk === 'high' || wasteRisk === 'very-high'
      }

      return matchesSearch && matchesCategory && matchesFilter
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return a.name.localeCompare(b.name)
        case 'date':
          return new Date(getPurchaseDate(b)).getTime() - new Date(getPurchaseDate(a)).getTime()
        case 'expiry':
          const aExpiry = getExpiryDate(a)
          const bExpiry = getExpiryDate(b)
          if (!aExpiry && !bExpiry) return 0
          if (!aExpiry) return 1
          if (!bExpiry) return -1
          return new Date(aExpiry).getTime() - new Date(bExpiry).getTime()
        case 'price':
          return (getEstimatedPrice(b) || 0) - (getEstimatedPrice(a) || 0)
        case 'wasteRisk':
          const riskOrder: Record<string, number> = { 'very-high': 4, high: 3, medium: 2, low: 1 }
          const aRisk = calculateWasteRisk(a.category, getExpiryDate(a))
          const bRisk = calculateWasteRisk(b.category, getExpiryDate(b))
          return (riskOrder[bRisk] ?? 0) - (riskOrder[aRisk] ?? 0)
        default:
          return 0
      }
    })

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
        <title>Pantry - Nourish Neural</title>
      </Helmet>

      {/* Barcode Scanner Modal */}
      <BarcodeScanner
        isOpen={showScanner}
        onClose={() => setShowScanner(false)}
        onProductFound={handleScannedProduct}
      />

      {/* Receipt Scanner Modal */}
      <ReceiptScanner
        isOpen={showReceiptScanner}
        onClose={() => setShowReceiptScanner(false)}
        onItemsFound={handleReceiptItems}
      />

      {/* Consumption Tracking Modal */}
      <AnimatePresence>
        {showConsumeModal && (
          <motion.div
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowConsumeModal(null)}
          >
            <motion.div
              className="bg-white dark:bg-neutral-800 rounded-2xl p-6 w-full max-w-md mx-4 shadow-2xl"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-2">
                  <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-green-500 to-emerald-500 flex items-center justify-center">
                    <Utensils className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-neutral-900 dark:text-neutral-100">
                      Record Consumption
                    </h3>
                    <p className="text-sm text-neutral-600 dark:text-neutral-400">
                      Track how much you used
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setShowConsumeModal(null)}
                  className="btn btn-ghost btn-sm"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              {(() => {
                const item = pantryItems.find(i => i.id === showConsumeModal)
                if (!item) return null

                return (
                  <div className="space-y-4">
                    <div className="p-4 bg-neutral-100 dark:bg-neutral-700 rounded-xl">
                      <p className="font-medium text-neutral-900 dark:text-neutral-100">
                        {item.name}
                      </p>
                      <p className="text-sm text-neutral-600 dark:text-neutral-400">
                        Current stock: {item.quantity} {item.unit}
                      </p>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                        Amount to use
                      </label>
                      <div className="flex items-center space-x-3">
                        <button
                          onClick={() => setConsumeAmount(Math.max(1, consumeAmount - 1))}
                          className="btn btn-outline btn-sm"
                          disabled={consumeAmount <= 1}
                        >
                          -
                        </button>
                        <input
                          type="number"
                          value={consumeAmount}
                          onChange={(e) => setConsumeAmount(Math.min(item.quantity, Math.max(1, parseInt(e.target.value) || 1)))}
                          className="input text-center w-20"
                          min="1"
                          max={item.quantity}
                        />
                        <button
                          onClick={() => setConsumeAmount(Math.min(item.quantity, consumeAmount + 1))}
                          className="btn btn-outline btn-sm"
                          disabled={consumeAmount >= item.quantity}
                        >
                          +
                        </button>
                        <span className="text-neutral-600 dark:text-neutral-400">
                          {item.unit}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center space-x-2 text-sm text-neutral-600 dark:text-neutral-400">
                      <Brain className="h-4 w-4 text-purple-500" />
                      <span>This helps improve waste predictions</span>
                    </div>

                    <div className="flex space-x-3 pt-2">
                      <motion.button
                        onClick={() => {
                          consumeItemMutation.mutate({ id: item.id, amount: consumeAmount })
                        }}
                        className="btn btn-primary flex-1"
                        whileHover={{ y: -2 }}
                        whileTap={{ scale: 0.97 }}
                        disabled={consumeItemMutation.isLoading}
                      >
                        <Utensils className="h-4 w-4 mr-2" />
                        {consumeItemMutation.isLoading ? 'Recording...' : 'Record Usage'}
                      </motion.button>
                      <motion.button
                        onClick={() => {
                          consumeItemMutation.mutate({ id: item.id, amount: item.quantity })
                        }}
                        className="btn btn-outline"
                        whileHover={{ y: -2 }}
                        whileTap={{ scale: 0.97 }}
                        disabled={consumeItemMutation.isLoading}
                      >
                        Use All
                      </motion.button>
                    </div>
                  </div>
                )
              })()}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="relative space-y-8 pb-12">
        <motion.div
          className="pointer-events-none absolute -top-20 right-[-12%] h-64 w-64 rounded-full bg-primary-200/40 blur-3xl"
          animate={{ y: [0, 18, 0], opacity: [0.35, 0.6, 0.35] }}
          transition={{ duration: 18, repeat: Infinity, ease: 'easeInOut' }}
        />
        <motion.div
          className="pointer-events-none absolute -bottom-24 left-[-10%] h-72 w-72 rounded-full bg-accent-200/35 blur-3xl"
          animate={{ y: [0, -16, 0], opacity: [0.3, 0.55, 0.3] }}
          transition={{ duration: 20, repeat: Infinity, ease: 'easeInOut' }}
        />

        {/* Header */}
        <motion.div
          className="relative overflow-hidden"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
        >
          <div className="absolute inset-0 bg-gradient-to-r from-primary-600/5 to-accent-500/5 rounded-3xl"></div>
          <div className="relative glass-card rounded-3xl p-8 md:p-10 border border-neutral-200/60 backdrop-blur-sm">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div className="flex items-center space-x-4">
                <motion.div
                  className="inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-primary-500 to-accent-500 shadow-lg shadow-primary-500/30"
                  initial={{ scale: 0, rotate: -180 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{ duration: 0.6, delay: 0.2, type: 'spring' }}
                >
                  <Package className="h-7 w-7 text-white" />
                </motion.div>
                <div>
                  <motion.h1
                    className="text-3xl md:text-4xl font-bold gradient-text"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.6, delay: 0.3 }}
                  >
                    Neural Pantry
                  </motion.h1>
                  <motion.p
                    className="mt-1 text-neutral-600 dark:text-neutral-400 text-sm md:text-base"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.6, delay: 0.4 }}
                  >
                    Track and optimize your pantry inventory with AI-powered insights
                  </motion.p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                {/* Scope Toggle */}
                {isMember && (
                  <div className="flex bg-neutral-100 dark:bg-neutral-700 rounded-lg p-1">
                    <button
                      onClick={() => setScope('personal')}
                      className={`px-3 py-1.5 text-sm font-medium rounded-md transition-all ${
                        scope === 'personal'
                          ? 'bg-white dark:bg-neutral-600 text-primary-600 dark:text-primary-400 shadow-sm'
                          : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-200'
                      }`}
                    >
                      Personal
                    </button>
                    <button
                      onClick={() => setScope('household')}
                      className={`px-3 py-1.5 text-sm font-medium rounded-md transition-all ${
                        scope === 'household'
                          ? 'bg-white dark:bg-neutral-600 text-primary-600 dark:text-primary-400 shadow-sm'
                          : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-200'
                      }`}
                    >
                      Household
                    </button>
                  </div>
                )}
              </div>
              <div className="flex space-x-3">
                <motion.button
                  onClick={() => setShowReceiptScanner(true)}
                  className="btn btn-outline shadow-md hover:shadow-lg hidden md:flex"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.6, delay: 0.5 }}
                  whileHover={{ y: -2 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Receipt className="h-4 w-4 mr-2" />
                  Scan Receipt
                </motion.button>
                <motion.button
                  onClick={() => setShowScanner(true)}
                  className="btn btn-outline shadow-md hover:shadow-lg"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.6, delay: 0.5 }}
                  whileHover={{ y: -2 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <ScanLine className="h-4 w-4 mr-2" />
                  Scan
                </motion.button>
                <motion.button
                  onClick={() => setShowCreateForm(true)}
                  className="btn btn-primary shadow-lg hover:shadow-xl"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.6, delay: 0.5 }}
                  whileHover={{ y: -2, boxShadow: '0 24px 45px -20px rgba(14,165,233,0.6)' }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Item
                </motion.button>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Statistics Cards */}
        <motion.section
          className="grid grid-cols-1 md:grid-cols-4 gap-4"
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.3 }}
        >
          {[
            {
              key: 'total-items',
              title: 'Total Items',
              value: stats.totalItems,
              subtitle: 'Pantry inventory',
              Icon: Package,
              iconColor: 'text-blue-500',
              valueClass: 'text-neutral-900'
            },
            {
              key: 'total-value',
              title: 'Total Value',
              value: `£${stats.totalValue.toFixed(2)}`,
              subtitle: 'Estimated replacement cost',
              Icon: DollarSign,
              iconColor: 'text-green-500',
              valueClass: 'text-neutral-900'
            },
            {
              key: 'expiring-soon',
              title: 'Expiring Soon',
              value: stats.expiringSoon,
              subtitle: 'Action within 3 days',
              Icon: AlertTriangle,
              iconColor: 'text-orange-500',
              valueClass: 'text-orange-600'
            },
            {
              key: 'low-stock',
              title: 'Low Stock',
              value: stats.lowStock,
              subtitle: 'Items below threshold',
              Icon: Archive,
              iconColor: 'text-red-500',
              valueClass: 'text-red-600'
            }
          ].map(({ key, title, value, subtitle, Icon, iconColor, valueClass }, index) => (
            <motion.div
              key={key}
              className="card"
              variants={fadeUp}
              transition={{ duration: 0.45, delay: index * 0.05 }}
              whileHover={{ y: -6, boxShadow: '0 28px 55px -35px rgba(14,165,233,0.3)' }}
            >
              <div className="card-content">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-neutral-600 dark:text-neutral-400">{title}</p>
                    <p className={`text-2xl font-bold ${valueClass} dark:text-neutral-100`}>{value}</p>
                    <p className="text-xs text-neutral-500 dark:text-neutral-400">{subtitle}</p>
                  </div>
                  <Icon className={`h-8 w-8 ${iconColor}`} />
                </div>
              </div>
            </motion.div>
          ))}
        </motion.section>

        {/* AI Waste Prevention Dashboard Toggle */}
        <motion.div
          className="card cursor-pointer"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          onClick={() => setShowWasteDashboard(!showWasteDashboard)}
          whileHover={{ y: -2 }}
        >
          <div className="card-content">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-red-500 to-orange-500 flex items-center justify-center shadow-lg">
                  <Brain className="h-5 w-5 text-white" />
                </div>
                <div>
                  <h3 className="font-semibold text-neutral-900 dark:text-neutral-100">
                    AI Waste Prevention Dashboard
                  </h3>
                  <p className="text-sm text-neutral-600 dark:text-neutral-400">
                    Analyze waste risk and get AI recommendations for your pantry items
                  </p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <span className="px-2 py-1 bg-red-100 text-red-600 text-xs font-medium rounded-full">
                  SMART
                </span>
                {showWasteDashboard ? (
                  <ChevronUp className="h-5 w-5 text-neutral-400" />
                ) : (
                  <ChevronDown className="h-5 w-5 text-neutral-400" />
                )}
              </div>
            </div>
          </div>
        </motion.div>

        {/* Waste Dashboard Panel */}
        <AnimatePresence>
          {showWasteDashboard && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
              className="overflow-hidden"
            >
              <div className="card">
                <div className="card-content">
                  <SmartWasteDashboard pantryItems={pantryItems} />
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Create Item Form */}
        {showCreateForm && (
          <motion.div
            className="card"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
          >
            <div className="card-header">
              <div className="flex items-center justify-between">
                <h2 className="card-title">Add New Pantry Item</h2>
                <button
                  onClick={() => { setShowCreateForm(false); setItemRiskPreview(null) }}
                  className="btn btn-ghost btn-sm"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>
            <div className="card-content space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                    Item Name *
                  </label>
                  <input
                    type="text"
                    value={newItemForm.name}
                    onChange={(e) => setNewItemForm({ ...newItemForm, name: e.target.value })}
                    className="input"
                    placeholder="e.g., Milk, Bread, Rice"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                    Category
                  </label>
                  <select
                    value={newItemForm.category}
                    onChange={(e) => { setNewItemForm({ ...newItemForm, category: e.target.value }); setItemRiskPreview(null) }}
                    className="input"
                  >
                    <option value="General">General</option>
                    <option value="Fruits">Fruits</option>
                    <option value="Vegetables">Vegetables</option>
                    <option value="Meat">Meat</option>
                    <option value="Dairy">Dairy</option>
                    <option value="Grains">Grains</option>
                    <option value="Canned Goods">Canned Goods</option>
                    <option value="Frozen">Frozen</option>
                    <option value="Condiments">Condiments</option>
                    <option value="Snacks">Snacks</option>
                    <option value="Beverages">Beverages</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                    Quantity *
                  </label>
                  <input
                    type="number"
                    value={newItemForm.quantity}
                    onChange={(e) => setNewItemForm({ ...newItemForm, quantity: parseInt(e.target.value) || 1 })}
                    className="input"
                    min="1"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                    Unit
                  </label>
                  <select
                    value={newItemForm.unit}
                    onChange={(e) => setNewItemForm({ ...newItemForm, unit: e.target.value })}
                    className="input"
                  >
                    <option value="pieces">pieces</option>
                    <option value="kg">kg</option>
                    <option value="grams">grams</option>
                    <option value="litres">litres</option>
                    <option value="ml">ml</option>
                    <option value="cans">cans</option>
                    <option value="bottles">bottles</option>
                    <option value="packets">packets</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                    Expiry Date
                  </label>
                  <input
                    type="date"
                    value={newItemForm.expiryDate}
                    onChange={(e) => setNewItemForm({ ...newItemForm, expiryDate: e.target.value })}
                    className="input"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                    Estimated Price (£)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={newItemForm.estimatedPrice}
                    onChange={(e) => setNewItemForm({ ...newItemForm, estimatedPrice: parseFloat(e.target.value) || 0 })}
                    className="input"
                    min="0"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                  Notes
                </label>
                <textarea
                  value={newItemForm.notes}
                  onChange={(e) => setNewItemForm({ ...newItemForm, notes: e.target.value })}
                  className="input"
                  rows={3}
                  placeholder="Any additional notes about this item..."
                />
              </div>

              {/* ML Risk Warning — shown when predict returns High / Very High */}
              {itemRiskPreview && (
                <div className="p-4 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 rounded-xl">
                  <div className="flex items-start gap-3">
                    <AlertTriangle className="h-5 w-5 text-red-500 mt-0.5 flex-shrink-0" />
                    <div className="flex-1">
                      <p className="font-semibold text-red-700 dark:text-red-400">
                        {itemRiskPreview.risk_level} Waste Risk Detected
                      </p>
                      <p className="text-sm text-red-600 dark:text-red-400 mt-0.5">
                        {Math.round(itemRiskPreview.waste_probability * 100)}% probability this item will be wasted based on its category and your history.
                      </p>
                      {itemRiskPreview.recommendations?.length > 0 && (
                        <ul className="mt-2 space-y-1">
                          {itemRiskPreview.recommendations.slice(0, 2).map((rec, i) => (
                            <li key={i} className="text-xs text-red-600 dark:text-red-400 flex items-start gap-1.5">
                              <span className="mt-0.5 flex-shrink-0">•</span>
                              <span>{rec}</span>
                            </li>
                          ))}
                        </ul>
                      )}
                      <p className="text-xs text-red-500 dark:text-red-400 mt-2 font-medium">
                        Click "Add Anyway" to save, or adjust the item details above.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              <div className="flex space-x-2">
                {itemRiskPreview ? (
                  <>
                    <motion.button
                      onClick={() => createItemMutation.mutate(newItemForm)}
                      disabled={!newItemForm.name.trim() || createItemMutation.isLoading}
                      className="btn border-red-400 text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30"
                      whileHover={{ y: -2 }}
                      whileTap={{ scale: 0.97 }}
                    >
                      {createItemMutation.isLoading ? 'Adding...' : 'Add Anyway'}
                    </motion.button>
                    <motion.button
                      onClick={() => setItemRiskPreview(null)}
                      className="btn btn-outline"
                      whileHover={{ y: -2 }}
                      whileTap={{ scale: 0.97 }}
                    >
                      Go Back
                    </motion.button>
                  </>
                ) : (
                  <>
                    <motion.button
                      onClick={handleCreateItem}
                      disabled={!newItemForm.name.trim() || createItemMutation.isLoading || checkingItemRisk}
                      className="btn btn-primary"
                      whileHover={{ y: -2 }}
                      whileTap={{ scale: 0.97 }}
                    >
                      {checkingItemRisk ? 'Checking risk...' : createItemMutation.isLoading ? 'Adding...' : 'Add Item'}
                    </motion.button>
                    <motion.button
                      onClick={() => { setShowCreateForm(false); setItemRiskPreview(null) }}
                      className="btn btn-outline"
                      whileHover={{ y: -2 }}
                      whileTap={{ scale: 0.97 }}
                    >
                      Cancel
                    </motion.button>
                  </>
                )}
              </div>
            </div>
          </motion.div>
        )}

        {/* Filters and Search */}
        <motion.div
          className="card"
          variants={fadeUp}
          initial="hidden"
          animate="visible"
          transition={{ duration: 0.45 }}
        >
          <div className="card-content">
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
              <div>
                <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                  <Search className="h-4 w-4 inline mr-1" />
                  Search Items
                </label>
                <div className="relative">
                  <Search className="h-4 w-4 absolute left-3 top-3 text-neutral-400" />
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="input pl-10"
                    placeholder="Search by name..."
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                  <Package className="h-4 w-4 inline mr-1" />
                  Category
                </label>
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="input"
                >
                  <option value="all">All Categories</option>
                  {categories.map(category => (
                    <option key={category} value={category}>{category}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                  <Filter className="h-4 w-4 inline mr-1" />
                  Filter by Status
                </label>
                <select
                  value={filterType}
                  onChange={(e) => setFilterType(e.target.value)}
                  className="input"
                >
                  <option value="all">All Items</option>
                  <option value="expiring">Expiring Soon</option>
                  <option value="expired">Expired</option>
                  <option value="lowStock">Low Stock</option>
                  <option value="highRisk">High Waste Risk</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                  <ArrowUpDown className="h-4 w-4 inline mr-1" />
                  Sort By
                </label>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as 'name' | 'date' | 'expiry' | 'price' | 'wasteRisk')}
                  className="input"
                >
                  <option value="date">Newest First</option>
                  <option value="name">Name (A-Z)</option>
                  <option value="expiry">Expiry Date</option>
                  <option value="price">Highest Price</option>
                  <option value="wasteRisk">Highest Waste Risk</option>
                </select>
              </div>

              <div className="flex items-end">
                <motion.button
                  onClick={() => {
                    setSearchTerm('')
                    setSelectedCategory('all')
                    setFilterType('all')
                    setSortBy('date')
                  }}
                  className="btn btn-outline w-full"
                  whileHover={{ y: -2 }}
                  whileTap={{ scale: 0.97 }}
                >
                  Clear Filters
                </motion.button>
              </div>
            </div>

            {/* Results Count */}
            <div className="mt-4 pt-4 border-t border-neutral-200 dark:border-neutral-700">
              <p className="text-sm text-neutral-600 dark:text-neutral-400">
                Showing <span className="font-semibold text-neutral-900 dark:text-neutral-100">{filteredItems.length}</span> of{' '}
                <span className="font-semibold text-neutral-900 dark:text-neutral-100">{pantryItems.length}</span> items
              </p>
            </div>
          </div>
        </motion.div>

        {/* Items Grid */}
        {filteredItems.length === 0 ? (
          <motion.div
            className="card"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45 }}
          >
            <div className="card-content">
              <div className="text-center py-12">
                <Package className="h-12 w-12 text-neutral-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-neutral-900 dark:text-neutral-100 mb-2">
                  No pantry items found
                </h3>
                <p className="text-neutral-600 dark:text-neutral-400 mb-4">
                  {pantryItems.length === 0
                    ? "Start tracking your food inventory by adding your first item."
                    : "Try adjusting your search or filter criteria."
                  }
                </p>
                {pantryItems.length === 0 && (
                  <div className="flex flex-col sm:flex-row gap-3 justify-center">
                    <motion.button
                      onClick={() => setShowScanner(true)}
                      className="btn btn-outline"
                      whileHover={{ y: -2 }}
                      whileTap={{ scale: 0.97 }}
                    >
                      <ScanLine className="h-4 w-4 mr-2" />
                      Scan Barcode
                    </motion.button>
                    <motion.button
                      onClick={() => setShowCreateForm(true)}
                      className="btn btn-primary"
                      whileHover={{ y: -2 }}
                      whileTap={{ scale: 0.97 }}
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Add Manually
                    </motion.button>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        ) : (
          <motion.div
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4"
            variants={staggerContainer}
            initial="hidden"
            animate="visible"
          >
            {filteredItems.map((item) => {
              const itemExpiryDate = getExpiryDate(item)
              const wasteRisk = calculateWasteRisk(item.category, itemExpiryDate)
              const expiryStatus = getExpiryStatus(itemExpiryDate)

              return (
                <motion.div
                  key={item.id}
                  className="group relative"
                  variants={fadeUp}
                  transition={{ duration: 0.3 }}
                  whileHover={{ y: -4 }}
                >
                  <div className={`
                    card overflow-hidden transition-all duration-300
                    ${expiryStatus === 'expired' ? 'ring-2 ring-red-400 dark:ring-red-500' : ''}
                    ${expiryStatus === 'expiring' ? 'ring-2 ring-orange-400 dark:ring-orange-500' : ''}
                    ${wasteRisk === 'very-high' ? 'bg-gradient-to-br from-red-100 to-white dark:from-red-950/50 dark:to-neutral-800' :
                      wasteRisk === 'high' ? 'bg-gradient-to-br from-red-50 to-white dark:from-red-950/30 dark:to-neutral-800' : ''}
                  `}>
                    {/* Category Header with Icon */}
                    <div className={`
                      px-4 py-2 flex items-center justify-between border-b
                      ${wasteRisk === 'very-high' ? 'bg-red-200/60 dark:bg-red-900/30 border-red-300 dark:border-red-700' :
                        wasteRisk === 'high' ? 'bg-red-100/50 dark:bg-red-900/20 border-red-200 dark:border-red-800' :
                        wasteRisk === 'medium' ? 'bg-yellow-100/50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800' :
                          'bg-neutral-50 dark:bg-neutral-800/50 border-neutral-200 dark:border-neutral-700'}
                    `}>
                      <div className="flex items-center gap-2">
                        <span className="text-lg">{getCategoryIcon(item.category)}</span>
                        <span className="text-xs font-medium text-neutral-600 dark:text-neutral-400 uppercase tracking-wide">
                          {item.category}
                        </span>
                      </div>
                      <span className={`
                        px-2 py-0.5 text-xs font-bold rounded-full
                        ${wasteRisk === 'very-high' ? 'bg-red-600 text-white animate-pulse' :
                          wasteRisk === 'high' ? 'bg-orange-500 text-white' :
                          wasteRisk === 'medium' ? 'bg-yellow-500 text-white' :
                          'bg-green-500 text-white'}
                      `}>
                        {wasteRisk === 'very-high' ? 'VERY HIGH' :
                         wasteRisk === 'high' ? 'HIGH RISK' :
                         wasteRisk === 'medium' ? 'MEDIUM' : 'LOW RISK'}
                      </span>
                    </div>

                    {/* Main Content */}
                    <div className="p-4">
                      {/* Item Name & Brand */}
                      <div className="mb-3">
                        <h3 className="font-semibold text-neutral-900 dark:text-neutral-100 text-base leading-tight line-clamp-2">
                          {item.name}
                        </h3>
                        {item.brand && (
                          <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5">
                            {item.brand}
                          </p>
                        )}
                      </div>

                      {/* Quantity & Price Row */}
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-1.5">
                          <ShoppingBag className="h-4 w-4 text-primary-500" />
                          <span className="font-medium text-neutral-900 dark:text-neutral-100">
                            {item.quantity} {item.unit}
                          </span>
                        </div>
                        {getEstimatedPrice(item) && (
                          <div className="flex items-center gap-1 text-green-600 dark:text-green-400">
                            <DollarSign className="h-3.5 w-3.5" />
                            <span className="font-medium text-sm">£{getEstimatedPrice(item)!.toFixed(2)}</span>
                          </div>
                        )}
                      </div>

                      {/* Expiry Info */}
                      <div className={`
                        flex items-center gap-2 p-2 rounded-lg mb-3
                        ${expiryStatus === 'expired' ? 'bg-red-100 dark:bg-red-900/30' :
                          expiryStatus === 'expiring' ? 'bg-orange-100 dark:bg-orange-900/30' :
                            'bg-neutral-100 dark:bg-neutral-700/50'}
                      `}>
                        <Clock className={`h-4 w-4 ${getExpiryColor(itemExpiryDate)}`} />
                        <span className={`text-sm font-medium ${getExpiryColor(itemExpiryDate)}`}>
                          {formatExpiryText(itemExpiryDate)}
                        </span>
                      </div>

                      {/* Purchase Date */}
                      <div className="flex items-center gap-2 text-xs text-neutral-500 dark:text-neutral-400 mb-3">
                        <Calendar className="h-3.5 w-3.5" />
                        <span>Purchased: {new Date(getPurchaseDate(item)).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                      </div>

                      {/* Notes */}
                      {item.notes && (
                        <div className="flex items-start gap-2 text-xs text-neutral-600 dark:text-neutral-400 mb-3 p-2 bg-neutral-50 dark:bg-neutral-700/30 rounded-lg">
                          <Tag className="h-3.5 w-3.5 mt-0.5 flex-shrink-0" />
                          <span className="line-clamp-2">{item.notes}</span>
                        </div>
                      )}
                    </div>

                    {/* Action Buttons Footer */}
                    <div className="px-4 py-3 border-t border-neutral-200 dark:border-neutral-700 bg-neutral-50/50 dark:bg-neutral-800/30">
                      <div className="flex items-center justify-between gap-2">
                        <motion.button
                          onClick={() => {
                            setShowConsumeModal(item.id)
                            setConsumeAmount(1)
                          }}
                          className="flex-1 btn btn-sm bg-green-500 hover:bg-green-600 text-white border-0"
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                        >
                          <Utensils className="h-3.5 w-3.5 mr-1" />
                          Use
                        </motion.button>
                        <motion.button
                          onClick={() => setEditingItem(item)}
                          className="btn btn-sm btn-outline"
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                        >
                          <Edit className="h-3.5 w-3.5" />
                        </motion.button>
                        {isMember && (
                          <motion.button
                            onClick={() => moveItemMutation.mutate({
                              itemId: item.id,
                              target: item.household_id ? 'personal' : 'household'
                            })}
                            className="btn btn-sm btn-outline"
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            title={item.household_id ? 'Move to Personal' : 'Share with Household'}
                            disabled={moveItemMutation.isLoading}
                          >
                            {item.household_id ? <Home className="h-3.5 w-3.5" /> : <Users className="h-3.5 w-3.5" />}
                          </motion.button>
                        )}
                        <motion.button
                          onClick={() => {
                            if (confirm(`Remove "${item.name}" from your pantry?`)) {
                              deleteItemMutation.mutate(item.id)
                            }
                          }}
                          className="btn btn-sm btn-ghost text-red-500 hover:bg-red-100 dark:hover:bg-red-900/30"
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </motion.button>
                      </div>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </motion.div>
        )}

        {/* Edit Item Modal */}
        <AnimatePresence>
          {editingItem && (
            <motion.div
              className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setEditingItem(null)}
            >
              <motion.div
                className="bg-white dark:bg-neutral-800 rounded-2xl p-6 w-full max-w-lg shadow-2xl"
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                onClick={(e) => e.stopPropagation()}
              >
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center space-x-3">
                    <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center">
                      <Edit className="h-5 w-5 text-white" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-neutral-900 dark:text-neutral-100">
                        Edit Item
                      </h3>
                      <p className="text-sm text-neutral-600 dark:text-neutral-400">
                        Update item details
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => setEditingItem(null)}
                    className="btn btn-ghost btn-sm"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                      Item Name
                    </label>
                    <input
                      type="text"
                      defaultValue={editingItem.name}
                      className="input"
                      id="edit-name"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                        Quantity
                      </label>
                      <input
                        type="number"
                        defaultValue={editingItem.quantity}
                        className="input"
                        min="0"
                        step="0.1"
                        id="edit-quantity"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                        Unit
                      </label>
                      <select defaultValue={editingItem.unit} className="input" id="edit-unit">
                        <option value="pieces">pieces</option>
                        <option value="kg">kg</option>
                        <option value="grams">grams</option>
                        <option value="litres">litres</option>
                        <option value="ml">ml</option>
                        <option value="cans">cans</option>
                        <option value="bottles">bottles</option>
                        <option value="packets">packets</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                      Expiry Date
                    </label>
                    <input
                      type="date"
                      defaultValue={getExpiryDate(editingItem) ? getExpiryDate(editingItem)!.split('T')[0] : ''}
                      className="input"
                      id="edit-expiry"
                    />
                  </div>

                  <div className="flex space-x-3 pt-4">
                    <motion.button
                      onClick={() => {
                        const name = (document.getElementById('edit-name') as HTMLInputElement).value
                        const quantity = parseFloat((document.getElementById('edit-quantity') as HTMLInputElement).value)
                        const unit = (document.getElementById('edit-unit') as HTMLSelectElement).value
                        const expiryDate = (document.getElementById('edit-expiry') as HTMLInputElement).value

                        updateItemMutation.mutate({
                          id: editingItem.id,
                          data: { name, quantity, unit, expiryDate: expiryDate || undefined }
                        })
                      }}
                      className="btn btn-primary flex-1"
                      whileHover={{ y: -2 }}
                      whileTap={{ scale: 0.97 }}
                      disabled={updateItemMutation.isLoading}
                    >
                      {updateItemMutation.isLoading ? 'Saving...' : 'Save Changes'}
                    </motion.button>
                    <motion.button
                      onClick={() => setEditingItem(null)}
                      className="btn btn-outline"
                      whileHover={{ y: -2 }}
                      whileTap={{ scale: 0.97 }}
                    >
                      Cancel
                    </motion.button>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </>
  )
} 