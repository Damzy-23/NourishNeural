import { useState } from 'react'
import { Helmet } from 'react-helmet-async'
import { useMutation } from 'react-query'
import { motion } from 'framer-motion'
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
  ScanLine
} from 'lucide-react'
import SmartPantryItem from '../components/SmartPantryItem'
import BarcodeScanner from '../components/BarcodeScanner'
import { ProductInfo } from '../services/barcodeService'
import { fadeUp, staggerContainer } from '../utils/motion'

interface PantryItem {
  id: string
  name: string
  quantity: number
  unit: string
  category: string
  expiryDate?: string
  purchaseDate: string
  estimatedPrice?: number
  barcode?: string
  notes?: string
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
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [showScanner, setShowScanner] = useState(false)
  const [, setEditingItem] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [filterType, setFilterType] = useState('all') // all, expiring, expired, lowStock
  const [sortBy, setSortBy] = useState<'name' | 'date' | 'expiry' | 'price'>('date')
  const [newItemForm, setNewItemForm] = useState<CreateItemForm>({
    name: '',
    quantity: 1,
    unit: 'pieces',
    category: 'General',
    expiryDate: '',
    estimatedPrice: 0,
    notes: ''
  })

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
    setShowCreateForm(true)
  }

  // Mock pantry items data
  const mockPantryItems: PantryItem[] = [
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
    },
    {
      id: '3',
      name: 'Fresh Tomatoes',
      quantity: 6,
      unit: 'pieces',
      category: 'Vegetables',
      expiryDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(),
      purchaseDate: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
      estimatedPrice: 2.00,
      notes: 'Vine tomatoes'
    },
    {
      id: '4',
      name: 'White Bread Loaf',
      quantity: 1,
      unit: 'loaf',
      category: 'Bakery',
      expiryDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(),
      purchaseDate: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
      estimatedPrice: 1.20,
      notes: 'Fresh baked'
    }
  ];

  // Use mock data instead of API calls
  const isLoading = false;

  // Mock pantry stats
  const mockStats: PantryStats = {
    totalItems: mockPantryItems.length,
    totalValue: mockPantryItems.reduce((sum, item) => sum + (item.estimatedPrice || 0), 0),
    categoryBreakdown: {
      'Dairy': 1,
      'Meat': 1,
      'Vegetables': 1,
      'Bakery': 1
    },
    expiringSoon: mockPantryItems.filter(item => {
      if (!item.expiryDate) return false;
      const daysUntilExpiry = Math.ceil((new Date(item.expiryDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
      return daysUntilExpiry <= 3;
    }).length,
    expired: 0,
    lowStock: mockPantryItems.filter(item => item.quantity <= 1).length,
    averageItemValue: mockPantryItems.reduce((sum, item) => sum + (item.estimatedPrice || 0), 0) / mockPantryItems.length
  };

  // Mock categories
  const mockCategories = ['Dairy', 'Meat', 'Fish', 'Vegetables', 'Fruits', 'Bakery', 'Pantry', 'Frozen', 'Beverages'];

  // Use mock data
  const pantryItems: PantryItem[] = mockPantryItems;
  const stats: PantryStats = mockStats;
  const categories: string[] = mockCategories;

  // Create pantry item mutation (mock implementation)
  const createItemMutation = useMutation(
    (itemData: CreateItemForm) => {
      // Mock API call - just return success
      return Promise.resolve({ data: { success: true, item: { ...itemData, id: Date.now().toString() } } });
    },
    {
      onSuccess: () => {
        setShowCreateForm(false)
        setNewItemForm({
          name: '',
          quantity: 1,
          unit: 'pieces',
          category: 'General',
          expiryDate: '',
          estimatedPrice: 0,
          notes: ''
        })
        // Show success message
        alert('Item added successfully! (Demo mode)')
      },
    }
  )

  // Delete pantry item mutation (mock implementation)
  const deleteItemMutation = useMutation(
    (_itemId: string) => {
      // Mock API call - just return success
      return Promise.resolve({ data: { success: true } });
    },
    {
      onSuccess: () => {
        // Show success message
        alert('Item deleted successfully! (Demo mode)')
      },
    }
  )

  // Note: updateQuantityMutation removed as SmartPantryItem handles quantity updates

  const handleCreateItem = () => {
    if (newItemForm.name.trim()) {
      createItemMutation.mutate(newItemForm)
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

  const filteredItems = pantryItems
    .filter(item => {
      // Search filter
      const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase())

      // Category filter
      const matchesCategory = selectedCategory === 'all' || item.category === selectedCategory

      // Apply filter type
      let matchesFilter = true
      if (filterType === 'expiring') {
        const status = getExpiryStatus(item.expiryDate)
        matchesFilter = status === 'expiring'
      } else if (filterType === 'expired') {
        const status = getExpiryStatus(item.expiryDate)
        matchesFilter = status === 'expired'
      } else if (filterType === 'lowStock') {
        matchesFilter = item.quantity <= 1
      }

      return matchesSearch && matchesCategory && matchesFilter
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return a.name.localeCompare(b.name)
        case 'date':
          return new Date(b.purchaseDate).getTime() - new Date(a.purchaseDate).getTime()
        case 'expiry':
          if (!a.expiryDate && !b.expiryDate) return 0
          if (!a.expiryDate) return 1
          if (!b.expiryDate) return -1
          return new Date(a.expiryDate).getTime() - new Date(b.expiryDate).getTime()
        case 'price':
          return (b.estimatedPrice || 0) - (a.estimatedPrice || 0)
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
              <div className="flex space-x-3">
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
                  onClick={() => setShowCreateForm(false)}
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
                    onChange={(e) => setNewItemForm({ ...newItemForm, category: e.target.value })}
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

              <div className="flex space-x-2">
                <motion.button
                  onClick={handleCreateItem}
                  disabled={!newItemForm.name.trim() || createItemMutation.isLoading}
                  className="btn btn-primary"
                  whileHover={{ y: -2 }}
                  whileTap={{ scale: 0.97 }}
                >
                  {createItemMutation.isLoading ? 'Adding...' : 'Add Item'}
                </motion.button>
                <motion.button
                  onClick={() => setShowCreateForm(false)}
                  className="btn btn-outline"
                  whileHover={{ y: -2 }}
                  whileTap={{ scale: 0.97 }}
                >
                  Cancel
                </motion.button>
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
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                  <ArrowUpDown className="h-4 w-4 inline mr-1" />
                  Sort By
                </label>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as 'name' | 'date' | 'expiry' | 'price')}
                  className="input"
                >
                  <option value="date">Newest First</option>
                  <option value="name">Name (A-Z)</option>
                  <option value="expiry">Expiry Date</option>
                  <option value="price">Highest Price</option>
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
                  <motion.button
                    onClick={() => setShowCreateForm(true)}
                    className="btn btn-primary"
                    whileHover={{ y: -2 }}
                    whileTap={{ scale: 0.97 }}
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Add Your First Item
                  </motion.button>
                )}
              </div>
            </div>
          </motion.div>
        ) : (
          <motion.div
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
            variants={staggerContainer}
            initial="hidden"
            animate="visible"
          >
            {filteredItems.map((item) => {
              // Convert to SmartPantryItem format
              const smartItem = {
                id: item.id,
                name: item.name,
                category: item.category,
                purchaseDate: item.purchaseDate,
                storageType: 'fridge', // Default storage type
                quantity: item.quantity,
                unit: item.unit
              };

              return (
                <motion.div
                  key={item.id}
                  className="relative"
                  variants={fadeUp}
                  transition={{ duration: 0.4 }}
                >
                  {/* Action Buttons Overlay */}
                  <div className="absolute top-2 right-2 z-10 flex space-x-1">
                    <button
                      onClick={() => setEditingItem(item.id)}
                      className="btn btn-ghost btn-sm bg-white/95 hover:bg-white shadow-md border border-neutral-200/50"
                    >
                      <Edit className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => {
                        if (confirm('Are you sure you want to delete this item?')) {
                          deleteItemMutation.mutate(item.id)
                        }
                      }}
                      className="btn btn-ghost btn-sm text-red-500 hover:text-red-700 bg-white/95 hover:bg-white shadow-md border border-red-200/50"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>

                  {/* Smart Pantry Item with AI Predictions */}
                  <SmartPantryItem 
                    item={smartItem}
                    userHistory={[]} // TODO: Add user history from context
                    onUpdate={(updatedItem) => {
                      console.log('Item updated:', updatedItem);
                    }}
                  />
                </motion.div>
              );
            })}
          </motion.div>
        )}
      </div>
    </>
  )
} 