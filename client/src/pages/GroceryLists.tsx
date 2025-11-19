import { useState } from 'react'
import { Helmet } from 'react-helmet-async'
import { useQuery, useMutation, useQueryClient } from 'react-query'
import { motion } from 'framer-motion'
import {
  ShoppingCart,
  Plus,
  Edit,
  Trash2,
  Check,
  X,
  Calendar,
  DollarSign,
  Package,
  Download,
  Share2,
  Search,
  Filter,
  ArrowUpDown
} from 'lucide-react'
import { apiService } from '../services/api'
import { useAuth } from '../hooks/useAuth'
import { fadeUp } from '../utils/motion'
import jsPDF from 'jspdf'

interface GroceryItem {
  id: string
  name: string
  quantity: number
  unit: string
  category: string
  estimatedPrice?: number
  isChecked: boolean
  notes?: string
  barcode?: string
}

interface GroceryList {
  id: string
  name: string
  userId: string
  items: GroceryItem[]
  totalEstimatedCost?: number
  store?: any
  status: string
  createdAt: string
  updatedAt: string
}

interface CreateListForm {
  name: string
  items: Array<{
    name: string
    quantity: number
    unit: string
    category: string
    estimatedPrice?: number
    notes?: string
  }>
}

export default function GroceryLists() {
  const { user } = useAuth()
  const queryClient = useQueryClient()
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [editingList, setEditingList] = useState<string | null>(null)
  const [newListForm, setNewListForm] = useState<CreateListForm>({
    name: '',
    items: []
  })
  const [newItem, setNewItem] = useState({
    name: '',
    quantity: 1,
    unit: 'pieces',
    category: 'General',
    estimatedPrice: 0,
    notes: ''
  })

  // Search and filter states
  const [searchTerm, setSearchTerm] = useState('')
  const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'completed'>('all')
  const [sortBy, setSortBy] = useState<'name' | 'date' | 'items' | 'cost'>('date')

  // Fetch grocery lists
  const { data: listsResponse, isLoading, error } = useQuery(
    ['grocery-lists'],
    () => apiService.get('/api/groceries'),
    {
      enabled: !!user,
    }
  )

  const groceryLists: GroceryList[] = (listsResponse as any)?.lists || []

  // Create grocery list mutation
  const createListMutation = useMutation(
    (listData: CreateListForm) => apiService.post('/api/groceries', listData),
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['grocery-lists'])
        setShowCreateForm(false)
        setNewListForm({ name: '', items: [] })
      },
    }
  )

  // Delete grocery list mutation
  const deleteListMutation = useMutation(
    (listId: string) => apiService.delete(`/api/groceries/${listId}`),
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['grocery-lists'])
      },
    }
  )

  // Toggle item checked mutation
  const toggleItemMutation = useMutation(
    ({ listId, itemId }: { listId: string; itemId: string }) =>
      apiService.patch(`/api/groceries/${listId}/items/${itemId}/toggle`),
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['grocery-lists'])
      },
    }
  )

  const handleCreateList = () => {
    if (newListForm.name.trim()) {
      createListMutation.mutate(newListForm)
    }
  }

  const handleAddItem = () => {
    if (newItem.name.trim()) {
      setNewListForm({
        ...newListForm,
        items: [...newListForm.items, { ...newItem }]
      })
      setNewItem({
        name: '',
        quantity: 1,
        unit: 'pieces',
        category: 'General',
        estimatedPrice: 0,
        notes: ''
      })
    }
  }

  const handleRemoveItem = (index: number) => {
    setNewListForm({
      ...newListForm,
      items: newListForm.items.filter((_, i) => i !== index)
    })
  }

  const handleToggleItem = (listId: string, itemId: string) => {
    toggleItemMutation.mutate({ listId, itemId })
  }

  const handleExportList = (list: GroceryList) => {
    const doc = new jsPDF();
    const totalCost = list.items.reduce((sum, item) => sum + (item.estimatedPrice || 0), 0);

    // Title
    doc.setFontSize(22);
    doc.setFont('helvetica', 'bold');
    doc.text(list.name, 20, 20);

    // Date
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(100);
    doc.text(`Created: ${new Date(list.createdAt).toLocaleDateString()}`, 20, 28);

    // Summary
    doc.setFontSize(11);
    doc.setTextColor(0);
    doc.text(`Total Items: ${list.items.length}`, 20, 38);
    doc.text(`Completed: ${list.items.filter(i => i.isChecked).length}`, 80, 38);
    doc.text(`Estimated Cost: £${totalCost.toFixed(2)}`, 140, 38);

    // Line separator
    doc.setDrawColor(200);
    doc.line(20, 42, 190, 42);

    // Items header
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('Items', 20, 52);

    // Items list
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    let yPosition = 60;

    list.items.forEach((item) => {
      // Check if we need a new page
      if (yPosition > 270) {
        doc.addPage();
        yPosition = 20;
      }

      // Checkbox
      doc.setDrawColor(150);
      doc.rect(20, yPosition - 3, 4, 4);
      if (item.isChecked) {
        doc.setFillColor(59, 130, 246); // primary-500 blue
        doc.rect(20, yPosition - 3, 4, 4, 'F');
      }

      // Item text
      const itemText = `${item.quantity} ${item.unit} ${item.name}`;
      doc.setTextColor(item.isChecked ? 150 : 0);
      doc.text(itemText, 28, yPosition);

      // Category
      doc.setTextColor(100);
      doc.setFontSize(8);
      doc.text(item.category, 120, yPosition);

      // Price
      if (item.estimatedPrice) {
        doc.text(`£${item.estimatedPrice.toFixed(2)}`, 170, yPosition);
      }

      doc.setFontSize(10);
      yPosition += 8;
    });

    // Footer
    doc.setDrawColor(200);
    doc.line(20, yPosition + 5, 190, yPosition + 5);
    doc.setFontSize(10);
    doc.setTextColor(0);
    doc.setFont('helvetica', 'bold');
    doc.text(`Total Estimated Cost: £${totalCost.toFixed(2)}`, 20, yPosition + 15);

    // Powered by footer
    doc.setFontSize(8);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(150);
    doc.text('Generated by Nourish Neural', 105, 285, { align: 'center' });

    // Save PDF
    doc.save(`${list.name.replace(/\s+/g, '-')}.pdf`);
  }

  const handleShareList = (list: GroceryList) => {
    const text = `*${list.name}*\n\n` +
      list.items.map((item, i) =>
        `${i + 1}. ${item.quantity} ${item.unit} ${item.name}`
      ).join('\n');

    if (navigator.share) {
      navigator.share({
        title: list.name,
        text: text
      }).catch(() => {});
    } else {
      // Fallback: copy to clipboard
      navigator.clipboard.writeText(text).then(() => {
        alert('List copied to clipboard!');
      });
    }
  }

  const calculateProgress = (list: GroceryList) => {
    if (list.items.length === 0) return 0
    const checkedItems = list.items.filter(item => item.isChecked).length
    return Math.round((checkedItems / list.items.length) * 100)
  }

  // Filter and sort grocery lists
  const filteredAndSortedLists = groceryLists
    .filter(list => {
      // Search filter
      const matchesSearch = list.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        list.items.some(item => item.name.toLowerCase().includes(searchTerm.toLowerCase()))

      // Status filter
      const progress = calculateProgress(list)
      const matchesStatus =
        filterStatus === 'all' ? true :
        filterStatus === 'completed' ? progress === 100 :
        filterStatus === 'active' ? progress < 100 : true

      return matchesSearch && matchesStatus
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return a.name.localeCompare(b.name)
        case 'date':
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        case 'items':
          return b.items.length - a.items.length
        case 'cost':
          const costA = a.items.reduce((sum, item) => sum + (item.estimatedPrice || 0), 0)
          const costB = b.items.reduce((sum, item) => sum + (item.estimatedPrice || 0), 0)
          return costB - costA
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
        <title>Grocery Lists - Nourish Neural</title>
      </Helmet>

      <div className="relative space-y-8 pb-12">
        <motion.div
          className="pointer-events-none absolute -top-16 left-[-10%] h-64 w-64 rounded-full bg-primary-200/30 blur-3xl"
          animate={{ y: [0, 18, 0], opacity: [0.4, 0.65, 0.4] }}
          transition={{ duration: 18, repeat: Infinity, ease: 'easeInOut' }}
        />
        <motion.div
          className="pointer-events-none absolute -bottom-10 right-[-12%] h-56 w-56 rounded-full bg-accent-200/30 blur-3xl"
          animate={{ y: [0, -16, 0], opacity: [0.35, 0.6, 0.35] }}
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
                  <ShoppingCart className="h-7 w-7 text-white" />
                </motion.div>
                <div>
                  <motion.h1
                    className="text-3xl md:text-4xl font-bold gradient-text"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.6, delay: 0.3 }}
                  >
                    Intelligent Lists
                  </motion.h1>
                  <motion.p
                    className="mt-1 text-neutral-600 dark:text-neutral-400 text-sm md:text-base"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.6, delay: 0.4 }}
                  >
                    Create and orchestrate neural shopping workflows with AI-ranked routes
                  </motion.p>
                </div>
              </div>
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
                New List
              </motion.button>
            </div>
          </div>
        </motion.div>

        {!!error && (
          <motion.div
            className="card border border-red-200/60 bg-red-50/60"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
          >
            <div className="card-content text-sm text-red-700">
              Unable to load grocery lists right now. {(error as Error)?.message ?? ''}
            </div>
          </motion.div>
        )}

        {/* Create List Form */}
        {showCreateForm && (
          <motion.div
            className="card"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
          >
            <div className="card-header">
              <div className="flex items-center justify-between">
                <h2 className="card-title">Create New Grocery List</h2>
                <button
                  onClick={() => setShowCreateForm(false)}
                  className="btn btn-ghost btn-sm"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>
            <div className="card-content space-y-4">
              <div>
                <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                  List Name
                </label>
                <input
                  type="text"
                  value={newListForm.name}
                  onChange={(e) => setNewListForm({ ...newListForm, name: e.target.value })}
                  className="input"
                  placeholder="e.g., Weekly Shopping"
                />
              </div>

              {/* Add Items Section */}
              <div>
                <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                  Add Items
                </label>
                <div className="grid grid-cols-1 md:grid-cols-5 gap-2 mb-2">
                  <input
                    type="text"
                    value={newItem.name}
                    onChange={(e) => setNewItem({ ...newItem, name: e.target.value })}
                    className="input"
                    placeholder="Item name"
                  />
                  <input
                    type="number"
                    value={newItem.quantity}
                    onChange={(e) => setNewItem({ ...newItem, quantity: parseInt(e.target.value) || 1 })}
                    className="input"
                    min="1"
                  />
                  <select
                    value={newItem.unit}
                    onChange={(e) => setNewItem({ ...newItem, unit: e.target.value })}
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
                  <select
                    value={newItem.category}
                    onChange={(e) => setNewItem({ ...newItem, category: e.target.value })}
                    className="input"
                  >
                    <option value="General">General</option>
                    <option value="Fruits">Fruits</option>
                    <option value="Vegetables">Vegetables</option>
                    <option value="Meat">Meat</option>
                    <option value="Dairy">Dairy</option>
                    <option value="Bakery">Bakery</option>
                    <option value="Pantry">Pantry</option>
                    <option value="Frozen">Frozen</option>
                    <option value="Household">Household</option>
                  </select>
                  <button
                    onClick={handleAddItem}
                    className="btn btn-secondary"
                  >
                    Add
                  </button>
                </div>
              </div>

              {/* Items Preview */}
              {newListForm.items.length > 0 && (
                <div>
                  <h3 className="text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">Items ({newListForm.items.length})</h3>
                  <div className="space-y-2 max-h-32 overflow-y-auto">
                    {newListForm.items.map((item, index) => (
                      <div key={index} className="flex items-center justify-between bg-neutral-50 dark:bg-neutral-700 p-2 rounded">
                        <span className="text-sm text-neutral-900 dark:text-neutral-100">
                          {item.quantity} {item.unit} of {item.name}
                          <span className="text-neutral-500 dark:text-neutral-400 ml-2">({item.category})</span>
                        </span>
                        <button
                          onClick={() => handleRemoveItem(index)}
                          className="text-red-500 hover:text-red-700"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex space-x-2">
                <button
                  onClick={handleCreateList}
                  disabled={!newListForm.name.trim() || createListMutation.isLoading}
                  className="btn btn-primary"
                >
                  {createListMutation.isLoading ? 'Creating...' : 'Create List'}
                </button>
                <button
                  onClick={() => setShowCreateForm(false)}
                  className="btn btn-outline"
                >
                  Cancel
                </button>
              </div>
            </div>
          </motion.div>
        )}

        {/* Search and Filter Section */}
        {groceryLists.length > 0 && (
          <motion.div
            className="card"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
          >
            <div className="card-content">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                {/* Search */}
                <div>
                  <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                    <Search className="h-4 w-4 inline mr-1" />
                    Search Lists
                  </label>
                  <div className="relative">
                    <Search className="h-4 w-4 absolute left-3 top-3 text-neutral-400" />
                    <input
                      type="text"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="input pl-10"
                      placeholder="Search by name or items..."
                    />
                  </div>
                </div>

                {/* Status Filter */}
                <div>
                  <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                    <Filter className="h-4 w-4 inline mr-1" />
                    Status
                  </label>
                  <select
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value as 'all' | 'active' | 'completed')}
                    className="input"
                  >
                    <option value="all">All Lists</option>
                    <option value="active">Active (In Progress)</option>
                    <option value="completed">Completed</option>
                  </select>
                </div>

                {/* Sort By */}
                <div>
                  <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                    <ArrowUpDown className="h-4 w-4 inline mr-1" />
                    Sort By
                  </label>
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value as 'name' | 'date' | 'items' | 'cost')}
                    className="input"
                  >
                    <option value="date">Newest First</option>
                    <option value="name">Name (A-Z)</option>
                    <option value="items">Most Items</option>
                    <option value="cost">Highest Cost</option>
                  </select>
                </div>

                {/* Clear Filters */}
                <div className="flex items-end">
                  <button
                    onClick={() => {
                      setSearchTerm('')
                      setFilterStatus('all')
                      setSortBy('date')
                    }}
                    className="btn btn-outline w-full"
                  >
                    Clear Filters
                  </button>
                </div>
              </div>

              {/* Results Count */}
              <div className="mt-4 pt-4 border-t border-neutral-200 dark:border-neutral-700">
                <p className="text-sm text-neutral-600 dark:text-neutral-400">
                  Showing <span className="font-semibold text-neutral-900 dark:text-neutral-100">{filteredAndSortedLists.length}</span> of{' '}
                  <span className="font-semibold text-neutral-900 dark:text-neutral-100">{groceryLists.length}</span> lists
                </p>
              </div>
            </div>
          </motion.div>
        )}

        {/* Grocery Lists Grid */}
        {groceryLists.length === 0 ? (
          <motion.div
            className="card"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
          >
            <div className="card-content">
              <div className="text-center py-12">
                <ShoppingCart className="h-12 w-12 text-neutral-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-neutral-900 dark:text-neutral-100 mb-2">
                  No grocery lists yet
                </h3>
                <p className="text-neutral-600 dark:text-neutral-400 mb-4">
                  Create your first grocery list to start shopping smarter.
                </p>
                <button
                  onClick={() => setShowCreateForm(true)}
                  className="btn btn-primary"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Create Your First List
                </button>
              </div>
            </div>
          </motion.div>
        ) : filteredAndSortedLists.length === 0 ? (
          <motion.div
            className="card"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
          >
            <div className="card-content">
              <div className="text-center py-12">
                <Search className="h-12 w-12 text-neutral-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-neutral-900 dark:text-neutral-100 mb-2">
                  No lists match your filters
                </h3>
                <p className="text-neutral-600 dark:text-neutral-400 mb-4">
                  Try adjusting your search or filter criteria.
                </p>
                <button
                  onClick={() => {
                    setSearchTerm('')
                    setFilterStatus('all')
                    setSortBy('date')
                  }}
                  className="btn btn-primary"
                >
                  Clear All Filters
                </button>
              </div>
            </div>
          </motion.div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredAndSortedLists.map((list) => {
              const progress = calculateProgress(list)
              const totalCost = list.items.reduce((sum, item) => sum + (item.estimatedPrice || 0), 0)
              const isEditing = editingList === list.id

              return (
                <motion.div
                  key={list.id}
                  className={`card ${isEditing ? 'ring-2 ring-primary-400/60' : ''}`}
                  variants={fadeUp}
                  initial="hidden"
                  animate="visible"
                  transition={{ duration: 0.45 }}
                  whileHover={{ y: -6, boxShadow: '0 28px 55px -35px rgba(14,165,233,0.3)' }}
                >
                  <div className="card-header">
                    <div className="flex items-center justify-between">
                      <h3 className="card-title text-lg">{list.name}</h3>
                      <div className="flex space-x-1">
                        <button
                          onClick={() => handleShareList(list)}
                          className="btn btn-ghost btn-sm"
                          title="Share list"
                        >
                          <Share2 className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleExportList(list)}
                          className="btn btn-ghost btn-sm"
                          title="Export list"
                        >
                          <Download className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => setEditingList(isEditing ? null : list.id)}
                          className="btn btn-ghost btn-sm"
                          title="Edit list"
                        >
                          <Edit className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => {
                            if (confirm('Are you sure you want to delete this list?')) {
                              deleteListMutation.mutate(list.id)
                            }
                          }}
                          className="btn btn-ghost btn-sm text-red-500 hover:text-red-700"
                          title="Delete list"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                    
                    {/* Progress Bar */}
                    <div className="mt-2">
                      <div className="flex items-center justify-between text-sm text-neutral-600 dark:text-neutral-400 mb-1">
                        <span>{list.items.filter(i => i.isChecked).length} of {list.items.length} items</span>
                        <span>{progress}%</span>
                      </div>
                      <div className="w-full bg-neutral-200 dark:bg-neutral-700 rounded-full h-2">
                        <div 
                          className="bg-primary-500 h-2 rounded-full transition-all duration-300"
                          style={{ width: `${progress}%` }}
                        />
                      </div>
                    </div>
                  </div>
                  
                  <div className="card-content">
                    {/* List Stats */}
                    <div className="grid grid-cols-2 gap-4 mb-4">
                      <div className="flex items-center text-sm text-neutral-600 dark:text-neutral-400">
                        <Package className="h-4 w-4 mr-1" />
                        {list.items.length} items
                      </div>
                      <div className="flex items-center text-sm text-neutral-600 dark:text-neutral-400">
                        <DollarSign className="h-4 w-4 mr-1" />
                        £{totalCost.toFixed(2)}
                      </div>
                    </div>

                    {/* Items Preview */}
                    <div className="space-y-2 max-h-32 overflow-y-auto">
                      {list.items.slice(0, 3).map((item) => (
                        <div key={item.id} className="flex items-center space-x-2">
                          <button
                            onClick={() => handleToggleItem(list.id, item.id)}
                            className={`h-4 w-4 rounded border-2 flex items-center justify-center ${
                              item.isChecked 
                                ? 'bg-primary-500 border-primary-500 text-white' 
                                : 'border-neutral-300'
                            }`}
                          >
                            {item.isChecked && <Check className="h-3 w-3" />}
                          </button>
                          <span className={`text-sm ${item.isChecked ? 'line-through text-neutral-500 dark:text-neutral-500' : 'text-neutral-900 dark:text-neutral-100'}`}>
                            {item.quantity} {item.unit} {item.name}
                          </span>
                        </div>
                      ))}
                      {list.items.length > 3 && (
                        <p className="text-xs text-neutral-500 dark:text-neutral-400">
                          +{list.items.length - 3} more items
                        </p>
                      )}
                    </div>

                    {/* Created Date */}
                    <div className="mt-4 pt-4 border-t border-neutral-200 dark:border-neutral-700">
                      <div className="flex items-center text-xs text-neutral-500 dark:text-neutral-400">
                        <Calendar className="h-3 w-3 mr-1" />
                        Created {new Date(list.createdAt).toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                </motion.div>
              )
            })}
          </div>
        )}
      </div>
    </>
  )
} 