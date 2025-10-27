import { useState } from 'react'
import { Helmet } from 'react-helmet-async'
import { useMutation } from 'react-query'
import { 
  Package, 
  Plus, 
  Edit, 
  Trash2, 
  X,
  DollarSign,
  AlertTriangle,
  Search,
  Archive
} from 'lucide-react'
import SmartPantryItem from '../components/SmartPantryItem'

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
  const [, setEditingItem] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [filterType, setFilterType] = useState('all') // all, expiring, expired, lowStock
  const [newItemForm, setNewItemForm] = useState<CreateItemForm>({
    name: '',
    quantity: 1,
    unit: 'pieces',
    category: 'General',
    expiryDate: '',
    estimatedPrice: 0,
    notes: ''
  })

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

  const filteredItems = pantryItems.filter(item => {
    // Apply filter type
    if (filterType === 'expiring') {
      const status = getExpiryStatus(item.expiryDate)
      return status === 'expiring'
    }
    if (filterType === 'expired') {
      const status = getExpiryStatus(item.expiryDate)
      return status === 'expired'
    }
    if (filterType === 'lowStock') {
      return item.quantity <= 1
    }
    return true
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
        <title>Pantry - PantryPal</title>
      </Helmet>

      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-neutral-900">Pantry</h1>
            <p className="mt-2 text-neutral-600">
              Track your food inventory and manage expiry dates
            </p>
          </div>
          <button
            onClick={() => setShowCreateForm(true)}
            className="btn btn-primary"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Item
          </button>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="card">
            <div className="card-content">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-neutral-600">Total Items</p>
                  <p className="text-2xl font-bold text-neutral-900">{stats.totalItems}</p>
                </div>
                <Package className="h-8 w-8 text-blue-500" />
              </div>
            </div>
          </div>
          
          <div className="card">
            <div className="card-content">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-neutral-600">Total Value</p>
                  <p className="text-2xl font-bold text-neutral-900">£{stats.totalValue.toFixed(2)}</p>
                </div>
                <DollarSign className="h-8 w-8 text-green-500" />
              </div>
            </div>
          </div>
          
          <div className="card">
            <div className="card-content">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-neutral-600">Expiring Soon</p>
                  <p className="text-2xl font-bold text-orange-600">{stats.expiringSoon}</p>
                </div>
                <AlertTriangle className="h-8 w-8 text-orange-500" />
              </div>
            </div>
          </div>
          
          <div className="card">
            <div className="card-content">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-neutral-600">Low Stock</p>
                  <p className="text-2xl font-bold text-red-600">{stats.lowStock}</p>
                </div>
                <Archive className="h-8 w-8 text-red-500" />
              </div>
            </div>
          </div>
        </div>

        {/* Create Item Form */}
        {showCreateForm && (
          <div className="card">
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
                  <label className="block text-sm font-medium text-neutral-700 mb-2">
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
                  <label className="block text-sm font-medium text-neutral-700 mb-2">
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
                  <label className="block text-sm font-medium text-neutral-700 mb-2">
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
                  <label className="block text-sm font-medium text-neutral-700 mb-2">
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
                  <label className="block text-sm font-medium text-neutral-700 mb-2">
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
                  <label className="block text-sm font-medium text-neutral-700 mb-2">
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
                <label className="block text-sm font-medium text-neutral-700 mb-2">
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
                <button
                  onClick={handleCreateItem}
                  disabled={!newItemForm.name.trim() || createItemMutation.isLoading}
                  className="btn btn-primary"
                >
                  {createItemMutation.isLoading ? 'Adding...' : 'Add Item'}
                </button>
                <button
                  onClick={() => setShowCreateForm(false)}
                  className="btn btn-outline"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Filters and Search */}
        <div className="card">
          <div className="card-content">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-2">
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
                <label className="block text-sm font-medium text-neutral-700 mb-2">
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
                <label className="block text-sm font-medium text-neutral-700 mb-2">
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
              
              <div className="flex items-end">
                <button
                  onClick={() => {
                    setSearchTerm('')
                    setSelectedCategory('all')
                    setFilterType('all')
                  }}
                  className="btn btn-outline w-full"
                >
                  Clear Filters
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Items Grid */}
        {filteredItems.length === 0 ? (
          <div className="card">
            <div className="card-content">
              <div className="text-center py-12">
                <Package className="h-12 w-12 text-neutral-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-neutral-900 mb-2">
                  No pantry items found
                </h3>
                <p className="text-neutral-600 mb-4">
                  {pantryItems.length === 0 
                    ? "Start tracking your food inventory by adding your first item."
                    : "Try adjusting your search or filter criteria."
                  }
                </p>
                {pantryItems.length === 0 && (
                  <button
                    onClick={() => setShowCreateForm(true)}
                    className="btn btn-primary"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Add Your First Item
                  </button>
                )}
              </div>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
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
                <div key={item.id} className="relative">
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
                </div>
              );
            })}
          </div>
        )}
      </div>
    </>
  )
} 