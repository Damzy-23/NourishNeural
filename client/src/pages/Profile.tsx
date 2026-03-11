import { useState, useEffect } from 'react'
import { Helmet } from 'react-helmet-async'
import { useQuery, useMutation, useQueryClient } from 'react-query'
import { motion } from 'framer-motion'
import {
  User,
  Settings,
  Save,
  Edit,
  Camera,
  Bell,
  Shield,
  Heart,
  DollarSign,
  CheckCircle,
  CreditCard,
  Plus,
  Trash2,
  X,
  Users,
  Copy,
  LogOut,
  RefreshCw,
  Home
} from 'lucide-react'
import { apiService } from '../services/api'
import { useAuth } from '../hooks/useAuth'
import { useHousehold } from '../hooks/useHousehold'
import { fadeUp, staggerContainer } from '../utils/motion'

interface UserProfile {
  id: string
  email: string
  firstName?: string
  lastName?: string
  name?: string
  age?: number
  avatar?: string
  phone?: string
  address?: string
  city?: string
  postalCode?: string
  country?: string
  createdAt: string
  lastLoginAt: string
}

interface UserPreferences {
  id: string
  userId: string
  dietaryRestrictions: string[]
  allergies: string[]
  cuisinePreferences: string[]
  budgetLimit?: number
  householdSize: number
  shoppingFrequency: string
  preferredStores: string[]
  notificationSettings: {
    emailNotifications: boolean
    pushNotifications: boolean
    expiryReminders: boolean
    shoppingReminders: boolean
    dealAlerts: boolean
  }
  privacySettings: {
    shareDataWithPartners: boolean
    allowAnalytics: boolean
    publicProfile: boolean
  }
}

const DIETARY_RESTRICTIONS = [
  'Vegetarian',
  'Vegan',
  'Gluten-Free',
  'Dairy-Free',
  'Nut-Free',
  'Soy-Free',
  'Keto',
  'Paleo',
  'Low-Carb',
  'Low-Fat',
  'Halal',
  'Kosher'
]

const CUISINE_PREFERENCES = [
  'Italian',
  'Chinese',
  'Indian',
  'Mexican',
  'Thai',
  'Japanese',
  'Mediterranean',
  'French',
  'American',
  'British',
  'Korean',
  'Vietnamese'
]

const SHOPPING_FREQUENCIES = [
  'Daily',
  'Every few days',
  'Weekly',
  'Bi-weekly',
  'Monthly'
]

export default function Profile() {
  const { user, updateUser } = useAuth()
  const queryClient = useQueryClient()
  const [activeTab, setActiveTab] = useState<'profile' | 'preferences' | 'notifications' | 'privacy' | 'loyalty' | 'household'>('profile')
  const [isEditing, setIsEditing] = useState(false)
  const [profileForm, setProfileForm] = useState<Partial<UserProfile>>({})
  const [preferencesForm, setPreferencesForm] = useState<Partial<UserPreferences>>({})
  const [saveSuccess, setSaveSuccess] = useState(false)
  const [showAddLoyaltyModal, setShowAddLoyaltyModal] = useState(false)
  const [selectedProgram, setSelectedProgram] = useState<string>('')
  const [cardNumber, setCardNumber] = useState('')

  // Household
  const { household, isAdmin, isMember, refreshHousehold } = useHousehold()
  const [householdName, setHouseholdName] = useState('')
  const [inviteCode, setInviteCode] = useState('')
  const [editingHouseholdName, setEditingHouseholdName] = useState(false)
  const [newHouseholdName, setNewHouseholdName] = useState('')
  const [copiedInvite, setCopiedInvite] = useState(false)

  // Fetch user profile
  const { data: profileResponse, refetch: refetchProfile } = useQuery(
    ['user-profile', user?.id],
    async () => {
      const token = localStorage.getItem('nourish_neural_token')
      const response = await fetch('/api/users/profile', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })

      if (!response.ok) {
        throw new Error('Failed to fetch profile')
      }

      return response.json()
    },
    {
      enabled: !!user,
      onSuccess: (data: any) => {
        setProfileForm(data.profile)
      },
      onError: () => {
        // If profile fetch fails, use user data from auth context
        if (user) {
          setProfileForm(user)
        }
      }
    }
  )

  // Force refresh profile when user changes
  useEffect(() => {
    if (user) {
      refetchProfile()
      // Force update profile form with user data
      setProfileForm(user)
    }
  }, [user, refetchProfile])

  // Debug: Log user data
  useEffect(() => {
    console.log('Profile Page - User Data:', user)
    console.log('Profile Page - Profile Response:', profileResponse)
    console.log('Profile Page - Profile Form:', profileForm)
  }, [user, profileResponse, profileForm])

  // Fetch user preferences
  useQuery(
    ['user-preferences'],
    () => apiService.get('/api/users/preferences'),
    {
      enabled: !!user,
      onSuccess: (data: any) => {
        setPreferencesForm(data.preferences)
      }
    }
  )

  // Fetch user statistics
  const { data: statsResponse } = useQuery(
    ['user-stats'],
    () => apiService.get('/api/users/stats'),
    {
      enabled: !!user,
    }
  )

  // Fetch loyalty programs
  const { data: loyaltyProgramsResponse } = useQuery(
    ['loyalty-programs'],
    () => apiService.get('/api/loyalty/programs'),
    {
      enabled: !!user,
    }
  )

  // Fetch user's loyalty accounts
  const { data: loyaltyAccountsResponse, refetch: refetchLoyaltyAccounts } = useQuery(
    ['loyalty-accounts'],
    () => apiService.get('/api/loyalty/accounts'),
    {
      enabled: !!user,
    }
  )

  const loyaltyPrograms = (loyaltyProgramsResponse as any)?.data?.programs || []
  const loyaltyAccounts = (loyaltyAccountsResponse as any)?.data?.accounts || []

  // Add loyalty account mutation
  const addLoyaltyMutation = useMutation(
    async ({ programId, cardNumber }: { programId: string; cardNumber: string }) => {
      return apiService.post('/api/loyalty/accounts', { programId, cardNumber })
    },
    {
      onSuccess: () => {
        refetchLoyaltyAccounts()
        setShowAddLoyaltyModal(false)
        setSelectedProgram('')
        setCardNumber('')
        setSaveSuccess(true)
        setTimeout(() => setSaveSuccess(false), 3000)
      },
    }
  )

  // Remove loyalty account mutation
  const removeLoyaltyMutation = useMutation(
    async (accountId: string) => {
      return apiService.delete(`/api/loyalty/accounts/${accountId}`)
    },
    {
      onSuccess: () => {
        refetchLoyaltyAccounts()
      },
    }
  )

  // Prioritize authenticated user data over API response
  const profile: UserProfile = user || (profileResponse as any)?.profile || {}
  const stats = (statsResponse as any)?.stats || {}

  // Update profile mutation
  const updateProfileMutation = useMutation(
    async (profileData: Partial<UserProfile>) => {
      const token = localStorage.getItem('nourish_neural_token')
      const response = await fetch('/api/users/profile', {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(profileData)
      })

      if (!response.ok) {
        throw new Error('Failed to update profile')
      }

      return response.json()
    },
    {
      onSuccess: (data: any) => {
        queryClient.invalidateQueries(['user-profile'])
        // Update the user in the auth context
        updateUser(data.user)
        // Update the profile form with the returned data
        setProfileForm({
          ...profileForm,
          firstName: data.user.firstName,
          lastName: data.user.lastName,
          email: data.user.email,
          phone: data.user.phone,
          age: data.user.age,
          address: data.user.address,
          city: data.user.city,
          postalCode: data.user.postalCode,
          country: data.user.country
        })
        setIsEditing(false)
        // Show success message
        setSaveSuccess(true)
        setTimeout(() => setSaveSuccess(false), 3000)
      },
    }
  )

  // Update preferences mutation
  const updatePreferencesMutation = useMutation(
    (prefsData: Partial<UserPreferences>) => apiService.put('/api/users/preferences', prefsData),
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['user-preferences'])
      },
    }
  )

  // Household mutations
  const createHouseholdMutation = useMutation(
    (name: string) => apiService.post('/api/households', { name }),
    {
      onSuccess: () => {
        refreshHousehold()
        setHouseholdName('')
        setSaveSuccess(true)
        setTimeout(() => setSaveSuccess(false), 3000)
      },
    }
  )

  const joinHouseholdMutation = useMutation(
    (code: string) => apiService.post('/api/households/join', { inviteCode: code }),
    {
      onSuccess: () => {
        refreshHousehold()
        setInviteCode('')
        setSaveSuccess(true)
        setTimeout(() => setSaveSuccess(false), 3000)
      },
    }
  )

  const updateHouseholdMutation = useMutation(
    (name: string) => apiService.put('/api/households', { name }),
    {
      onSuccess: () => {
        refreshHousehold()
        setEditingHouseholdName(false)
        setSaveSuccess(true)
        setTimeout(() => setSaveSuccess(false), 3000)
      },
    }
  )

  const regenerateInviteMutation = useMutation(
    () => apiService.post('/api/households/regenerate-invite', {}),
    {
      onSuccess: () => {
        refreshHousehold()
      },
    }
  )

  const removeMemberMutation = useMutation(
    (userId: string) => apiService.delete(`/api/households/members/${userId}`),
    {
      onSuccess: () => {
        refreshHousehold()
      },
    }
  )

  const deleteHouseholdMutation = useMutation(
    () => apiService.delete('/api/households'),
    {
      onSuccess: () => {
        refreshHousehold()
      },
    }
  )

  const copyInviteCode = async (code: string) => {
    await navigator.clipboard.writeText(code)
    setCopiedInvite(true)
    setTimeout(() => setCopiedInvite(false), 2000)
  }

  const handleProfileSave = () => {
    // Prepare the data to send - convert name to firstName/lastName if needed
    const dataToSend = { ...profileForm }

    // If we have a name field, split it into firstName and lastName
    if (dataToSend.name) {
      const nameParts = dataToSend.name.split(' ')
      dataToSend.firstName = nameParts[0] || ''
      dataToSend.lastName = nameParts.slice(1).join(' ') || ''
    }

    updateProfileMutation.mutate(dataToSend)
  }

  const handlePreferencesSave = () => {
    updatePreferencesMutation.mutate(preferencesForm)
  }

  const handleArrayToggle = (field: string, value: string) => {
    setPreferencesForm(prev => {
      const currentArray = prev[field as keyof UserPreferences] as string[] || []
      const newArray = currentArray.includes(value)
        ? currentArray.filter(item => item !== value)
        : [...currentArray, value]

      return {
        ...prev,
        [field]: newArray
      }
    })
  }

  const handleNotificationChange = (key: string, value: boolean) => {
    setPreferencesForm(prev => ({
      ...prev,
      notificationSettings: {
        emailNotifications: true,
        pushNotifications: true,
        expiryReminders: true,
        shoppingReminders: true,
        dealAlerts: false,
        ...prev.notificationSettings,
        [key]: value
      }
    }))
  }

  const handlePrivacyChange = (key: string, value: boolean) => {
    setPreferencesForm(prev => ({
      ...prev,
      privacySettings: {
        shareDataWithPartners: false,
        allowAnalytics: true,
        publicProfile: false,
        ...prev.privacySettings,
        [key]: value
      }
    }))
  }

  const handleAddLoyaltyCard = () => {
    if (!selectedProgram || !cardNumber) return
    addLoyaltyMutation.mutate({ programId: selectedProgram, cardNumber })
  }

  const handleRemoveLoyaltyCard = (accountId: string) => {
    if (window.confirm('Are you sure you want to remove this loyalty card?')) {
      removeLoyaltyMutation.mutate(accountId)
    }
  }

  const getStoreColor = (color: string) => {
    const colorMap: { [key: string]: string } = {
      '#00539F': 'bg-[#00539F]',
      '#7B2D8E': 'bg-[#7B2D8E]',
      '#00A550': 'bg-[#00A550]',
      '#5A5A5A': 'bg-[#5A5A5A]',
      '#0050AA': 'bg-[#0050AA]',
      '#00205B': 'bg-[#00205B]',
      '#78BE20': 'bg-[#78BE20]',
      '#00B1EB': 'bg-[#00B1EB]',
      '#0F4C8A': 'bg-[#0F4C8A]',
      '#EC1C24': 'bg-[#EC1C24]'
    }
    return colorMap[color] || 'bg-primary-600'
  }

  const tabs = [
    { id: 'profile', label: 'Profile', icon: User },
    { id: 'preferences', label: 'Preferences', icon: Heart },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'privacy', label: 'Privacy', icon: Shield },
    { id: 'loyalty', label: 'Loyalty Cards', icon: CreditCard },
    { id: 'household', label: 'Household', icon: Home }
  ]

  return (
    <>
      <Helmet>
        <title>Profile - Nourish Neural</title>
      </Helmet>

      <div className="relative space-y-8 pb-12">
        <motion.div
          className="pointer-events-none absolute -top-24 right-[-12%] h-72 w-72 rounded-full bg-primary-200/35 blur-3xl"
          animate={{ y: [0, 18, 0], opacity: [0.35, 0.6, 0.35] }}
          transition={{ duration: 18, repeat: Infinity, ease: 'easeInOut' }}
        />
        <motion.div
          className="pointer-events-none absolute -bottom-36 left-[-14%] h-80 w-80 rounded-full bg-accent-200/30 blur-3xl"
          animate={{ y: [0, -16, 0], opacity: [0.3, 0.55, 0.3] }}
          transition={{ duration: 20, repeat: Infinity, ease: 'easeInOut' }}
        />

        {/* Header */}
        <motion.div
          className="relative"
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
        >
          <div className="absolute inset-0 bg-gradient-to-r from-primary-600/5 to-accent-500/5 rounded-3xl"></div>
          <div className="relative glass-card rounded-3xl p-8">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-4xl font-bold gradient-text mb-2">Profile</h1>
                <p className="text-lg text-neutral-600 dark:text-neutral-400">
                  Manage your account settings and preferences
                </p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* User Stats Cards */}
        <motion.section
          className="grid grid-cols-1 md:grid-cols-4 gap-4"
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.3 }}
        >
          {[
            { key: 'lists', label: 'Grocery Lists', value: stats.totalLists || 0, Icon: Settings, color: 'text-blue-500' },
            { key: 'pantry', label: 'Pantry Items', value: stats.totalPantryItems || 0, Icon: User, color: 'text-green-500' },
            { key: 'saved', label: 'Money Saved', value: `£${stats.moneySaved || 0}`, Icon: DollarSign, color: 'text-yellow-500' },
            { key: 'member', label: 'Member Since', value: profile.createdAt ? new Date(profile.createdAt).getFullYear() : 'New', Icon: Heart, color: 'text-red-500' }
          ].map(({ key, label, value, Icon, color }, index) => (
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
                    <p className="text-sm font-medium text-neutral-600 dark:text-neutral-400">{label}</p>
                    <p className="text-2xl font-bold text-neutral-900 dark:text-neutral-100">{value}</p>
                  </div>
                  <Icon className={`h-8 w-8 ${color} dark:opacity-80`} />
                </div>
              </div>
            </motion.div>
          ))}
        </motion.section>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Sidebar Navigation */}
          <div className="lg:col-span-1">
            <motion.div
              className="card"
              variants={fadeUp}
              initial="hidden"
              animate="visible"
              transition={{ duration: 0.45 }}
            >
              <div className="card-content">
                <nav className="space-y-1">
                  {tabs.map((tab) => {
                    const Icon = tab.icon
                    return (
                      <motion.button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id as any)}
                        className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${activeTab === tab.id
                            ? 'bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300'
                            : 'text-neutral-600 dark:text-neutral-400 hover:bg-neutral-50 dark:hover:bg-neutral-700'
                          }`}
                        whileHover={{ x: 4 }}
                      >
                        <Icon className="h-4 w-4" />
                        <span>{tab.label}</span>
                      </motion.button>
                    )
                  })}
                </nav>
              </div>
            </motion.div>
          </div>

          {/* Content Area */}
          <div className="lg:col-span-3">
            {activeTab === 'profile' && (
              <motion.div
                className="card"
                key="profile-tab"
                variants={fadeUp}
                initial="hidden"
                animate="visible"
                transition={{ duration: 0.45 }}
              >
                <div className="card-header">
                  <div className="flex items-center justify-between">
                    <h2 className="card-title">Personal Information</h2>
                    <motion.button
                      onClick={() => setIsEditing(!isEditing)}
                      className="btn btn-outline btn-sm"
                      whileHover={{ y: -1 }}
                      whileTap={{ scale: 0.97 }}
                    >
                      <Edit className="h-4 w-4 mr-2" />
                      {isEditing ? 'Cancel' : 'Edit'}
                    </motion.button>
                  </div>
                </div>
                <div className="card-content space-y-6">
                  {/* Avatar */}
                  <div className="flex items-center space-x-4">
                    <div className="relative">
                      <div className="w-20 h-20 bg-primary-100 dark:bg-primary-900/30 rounded-full flex items-center justify-center">
                        {user?.avatarUrl ? (
                          <img src={user.avatarUrl} alt="Avatar" className="w-20 h-20 rounded-full object-cover" />
                        ) : (
                          <User className="h-8 w-8 text-primary-600 dark:text-primary-400" />
                        )}
                      </div>
                      {isEditing && (
                        <button className="absolute -bottom-1 -right-1 w-6 h-6 bg-white dark:bg-neutral-700 border border-neutral-300 dark:border-neutral-600 rounded-full flex items-center justify-center shadow-sm">
                          <Camera className="h-3 w-3 text-neutral-600 dark:text-neutral-300" />
                        </button>
                      )}
                    </div>
                    <div>
                      <h3 className="font-medium text-neutral-900 dark:text-neutral-100">
                        {user ? `${user.firstName} ${user.lastName}` : 'User'}
                      </h3>
                      <p className="text-sm text-neutral-600 dark:text-neutral-400">
                        {user?.email || 'user@example.com'}
                      </p>
                    </div>
                  </div>

                  {/* Form Fields */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                        Full Name
                      </label>
                      <input
                        type="text"
                        value={profileForm.name || (user ? `${user.firstName} ${user.lastName}` : '')}
                        onChange={(e) => setProfileForm(prev => ({ ...prev, name: e.target.value }))}
                        disabled={!isEditing}
                        className="input"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                        Email
                      </label>
                      <input
                        type="email"
                        value={profileForm.email || user?.email || ''}
                        onChange={(e) => setProfileForm(prev => ({ ...prev, email: e.target.value }))}
                        disabled={!isEditing}
                        className="input"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                        Phone
                      </label>
                      <input
                        type="tel"
                        value={profileForm.phone || ''}
                        onChange={(e) => setProfileForm(prev => ({ ...prev, phone: e.target.value }))}
                        disabled={!isEditing}
                        className="input"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                        Age
                      </label>
                      <input
                        type="number"
                        min="13"
                        max="120"
                        value={profileForm.age || user?.age || ''}
                        onChange={(e) => setProfileForm(prev => ({ ...prev, age: parseInt(e.target.value) || undefined }))}
                        disabled={!isEditing}
                        className="input"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                        Country
                      </label>
                      <input
                        type="text"
                        value={profileForm.country || ''}
                        onChange={(e) => setProfileForm(prev => ({ ...prev, country: e.target.value }))}
                        disabled={!isEditing}
                        className="input"
                      />
                    </div>

                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                        Address
                      </label>
                      <input
                        type="text"
                        value={profileForm.address || ''}
                        onChange={(e) => setProfileForm(prev => ({ ...prev, address: e.target.value }))}
                        disabled={!isEditing}
                        className="input"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                        City
                      </label>
                      <input
                        type="text"
                        value={profileForm.city || ''}
                        onChange={(e) => setProfileForm(prev => ({ ...prev, city: e.target.value }))}
                        disabled={!isEditing}
                        className="input"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                        Postal Code
                      </label>
                      <input
                        type="text"
                        value={profileForm.postalCode || ''}
                        onChange={(e) => setProfileForm(prev => ({ ...prev, postalCode: e.target.value }))}
                        disabled={!isEditing}
                        className="input"
                      />
                    </div>
                  </div>

                  {isEditing && (
                    <div className="flex space-x-3">
                      <motion.button
                        onClick={handleProfileSave}
                        disabled={updateProfileMutation.isLoading}
                        className="btn btn-primary"
                        whileHover={{ y: -1 }}
                        whileTap={{ scale: 0.97 }}
                      >
                        <Save className="h-4 w-4 mr-2" />
                        {updateProfileMutation.isLoading ? 'Saving...' : 'Save Changes'}
                      </motion.button>
                      <motion.button
                        onClick={() => setIsEditing(false)}
                        className="btn btn-outline"
                        whileHover={{ y: -1 }}
                        whileTap={{ scale: 0.97 }}
                      >
                        Cancel
                      </motion.button>
                    </div>
                  )}

                  {saveSuccess && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="flex items-center space-x-2 p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg"
                    >
                      <CheckCircle className="h-5 w-5 text-green-500" />
                      <span className="text-green-700 dark:text-green-300 text-sm font-medium">
                        Profile saved successfully!
                      </span>
                    </motion.div>
                  )}
                </div>
              </motion.div>
            )}

            {activeTab === 'preferences' && (
              <motion.div
                className="card"
                key="preferences-tab"
                variants={fadeUp}
                initial="hidden"
                animate="visible"
                transition={{ duration: 0.45 }}
              >
                <div className="card-header">
                  <h2 className="card-title">Food Preferences</h2>
                </div>
                <div className="card-content space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                      Dietary Restrictions
                    </label>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                      {DIETARY_RESTRICTIONS.map(restriction => (
                        <label key={restriction} className="flex items-center space-x-2 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={(preferencesForm.dietaryRestrictions || []).includes(restriction)}
                            onChange={() => handleArrayToggle('dietaryRestrictions', restriction)}
                            className="rounded border-neutral-300 dark:border-neutral-600 text-primary-600 focus:ring-primary-500"
                          />
                          <span className="text-sm text-neutral-700 dark:text-neutral-300">{restriction}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                      Cuisine Preferences
                    </label>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                      {CUISINE_PREFERENCES.map(cuisine => (
                        <label key={cuisine} className="flex items-center space-x-2 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={(preferencesForm.cuisinePreferences || []).includes(cuisine)}
                            onChange={() => handleArrayToggle('cuisinePreferences', cuisine)}
                            className="rounded border-neutral-300 dark:border-neutral-600 text-primary-600 focus:ring-primary-500"
                          />
                          <span className="text-sm text-neutral-700 dark:text-neutral-300">{cuisine}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                        Household Size
                      </label>
                      <input
                        type="number"
                        min="1"
                        max="20"
                        value={preferencesForm.householdSize || 1}
                        onChange={(e) => setPreferencesForm(prev => ({ ...prev, householdSize: parseInt(e.target.value) || 1 }))}
                        className="input"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                        Shopping Frequency
                      </label>
                      <select
                        value={preferencesForm.shoppingFrequency || 'Weekly'}
                        onChange={(e) => setPreferencesForm(prev => ({ ...prev, shoppingFrequency: e.target.value }))}
                        className="input"
                      >
                        {SHOPPING_FREQUENCIES.map(freq => (
                          <option key={freq} value={freq}>{freq}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                        Budget Limit (£/month)
                      </label>
                      <input
                        type="number"
                        min="0"
                        step="10"
                        value={preferencesForm.budgetLimit || ''}
                        onChange={(e) => setPreferencesForm(prev => ({ ...prev, budgetLimit: parseFloat(e.target.value) || undefined }))}
                        className="input"
                        placeholder="Optional"
                      />
                    </div>
                  </div>

                  <div className="flex justify-end">
                    <motion.button
                      onClick={handlePreferencesSave}
                      disabled={updatePreferencesMutation.isLoading}
                      className="btn btn-primary"
                      whileHover={{ y: -1 }}
                      whileTap={{ scale: 0.97 }}
                    >
                      <Save className="h-4 w-4 mr-2" />
                      {updatePreferencesMutation.isLoading ? 'Saving...' : 'Save Preferences'}
                    </motion.button>
                  </div>
                </div>
              </motion.div>
            )}

            {activeTab === 'notifications' && (
              <motion.div
                className="card"
                key="notifications-tab"
                variants={fadeUp}
                initial="hidden"
                animate="visible"
                transition={{ duration: 0.45 }}
              >
                <div className="card-header">
                  <h2 className="card-title">Notifications</h2>
                </div>
                <div className="card-content space-y-4">
                  {[
                    { key: 'emailNotifications', label: 'Email Notifications', description: 'Receive updates via email' },
                    { key: 'pushNotifications', label: 'Push Notifications', description: 'Receive browser notifications' },
                    { key: 'expiryReminders', label: 'Expiry Reminders', description: 'Get notified when items are about to expire' },
                    { key: 'shoppingReminders', label: 'Shopping Reminders', description: 'Reminders for your shopping schedule' },
                    { key: 'dealAlerts', label: 'Deal Alerts', description: 'Notifications about discounts and special offers' }
                  ].map(setting => (
                    <div key={setting.key} className="flex items-center justify-between py-3 border-b border-neutral-200 dark:border-neutral-700 last:border-b-0">
                      <div>
                        <h3 className="font-medium text-neutral-900 dark:text-neutral-100">{setting.label}</h3>
                        <p className="text-sm text-neutral-600 dark:text-neutral-400">{setting.description}</p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={preferencesForm.notificationSettings?.[setting.key as keyof UserPreferences['notificationSettings']] || false}
                          onChange={(e) => handleNotificationChange(setting.key, e.target.checked)}
                          className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-neutral-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-neutral-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
                      </label>
                    </div>
                  ))}

                  <div className="flex justify-end">
                    <motion.button
                      onClick={handlePreferencesSave}
                      disabled={updatePreferencesMutation.isLoading}
                      className="btn btn-primary"
                      whileHover={{ y: -1 }}
                      whileTap={{ scale: 0.97 }}
                    >
                      <Save className="h-4 w-4 mr-2" />
                      {updatePreferencesMutation.isLoading ? 'Saving...' : 'Save Settings'}
                    </motion.button>
                  </div>
                </div>
              </motion.div>
            )}

            {activeTab === 'privacy' && (
              <motion.div
                className="card"
                key="privacy-tab"
                variants={fadeUp}
                initial="hidden"
                animate="visible"
                transition={{ duration: 0.45 }}
              >
                <div className="card-header">
                  <h2 className="card-title">Privacy & Security</h2>
                </div>
                <div className="card-content space-y-4">
                  {[
                    { key: 'shareDataWithPartners', label: 'Share Data with Partners', description: 'Allow sharing anonymized data with trusted partners' },
                    { key: 'allowAnalytics', label: 'Analytics', description: 'Help us improve by sharing usage analytics' },
                    { key: 'publicProfile', label: 'Public Profile', description: 'Make your profile visible to other users' }
                  ].map(setting => (
                    <div key={setting.key} className="flex items-center justify-between py-3 border-b border-neutral-200 dark:border-neutral-700 last:border-b-0">
                      <div>
                        <h3 className="font-medium text-neutral-900 dark:text-neutral-100">{setting.label}</h3>
                        <p className="text-sm text-neutral-600 dark:text-neutral-400">{setting.description}</p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={preferencesForm.privacySettings?.[setting.key as keyof UserPreferences['privacySettings']] || false}
                          onChange={(e) => handlePrivacyChange(setting.key, e.target.checked)}
                          className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-neutral-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-neutral-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
                      </label>
                    </div>
                  ))}

                  <div className="flex justify-end">
                    <motion.button
                      onClick={handlePreferencesSave}
                      disabled={updatePreferencesMutation.isLoading}
                      className="btn btn-primary"
                      whileHover={{ y: -1 }}
                      whileTap={{ scale: 0.97 }}
                    >
                      <Save className="h-4 w-4 mr-2" />
                      {updatePreferencesMutation.isLoading ? 'Saving...' : 'Save Settings'}
                    </motion.button>
                  </div>
                </div>
              </motion.div>
            )}

            {activeTab === 'loyalty' && (
              <motion.div
                className="card"
                key="loyalty-tab"
                variants={fadeUp}
                initial="hidden"
                animate="visible"
                transition={{ duration: 0.45 }}
              >
                <div className="card-header">
                  <div className="flex items-center justify-between">
                    <h2 className="card-title">Loyalty Cards</h2>
                    <motion.button
                      onClick={() => setShowAddLoyaltyModal(true)}
                      className="btn btn-primary btn-sm"
                      whileHover={{ y: -1 }}
                      whileTap={{ scale: 0.97 }}
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Add Card
                    </motion.button>
                  </div>
                </div>
                <div className="card-content">
                  {loyaltyAccounts.length === 0 ? (
                    <div className="text-center py-8">
                      <CreditCard className="h-12 w-12 mx-auto text-neutral-400 mb-3" />
                      <h3 className="text-lg font-medium text-neutral-900 dark:text-neutral-100 mb-1">
                        No loyalty cards linked
                      </h3>
                      <p className="text-neutral-600 dark:text-neutral-400 mb-4">
                        Link your supermarket loyalty cards to track rewards and get personalized offers.
                      </p>
                      <motion.button
                        onClick={() => setShowAddLoyaltyModal(true)}
                        className="btn btn-outline"
                        whileHover={{ y: -1 }}
                        whileTap={{ scale: 0.97 }}
                      >
                        <Plus className="h-4 w-4 mr-2" />
                        Add Your First Card
                      </motion.button>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {loyaltyAccounts.map((account: any) => (
                        <motion.div
                          key={account.id}
                          className="flex items-center justify-between p-4 bg-neutral-50 dark:bg-neutral-800 rounded-xl"
                          whileHover={{ scale: 1.01 }}
                        >
                          <div className="flex items-center space-x-4">
                            <div
                              className={`w-12 h-12 rounded-lg flex items-center justify-center text-white ${getStoreColor(account.program?.color)}`}
                            >
                              <CreditCard className="h-6 w-6" />
                            </div>
                            <div>
                              <h3 className="font-medium text-neutral-900 dark:text-neutral-100">
                                {account.program?.name || 'Loyalty Card'}
                              </h3>
                              <p className="text-sm text-neutral-600 dark:text-neutral-400">
                                {account.program?.store} - {account.maskedCardNumber}
                              </p>
                              <p className="text-xs text-neutral-500 dark:text-neutral-500">
                                Linked {new Date(account.linkedAt).toLocaleDateString()}
                              </p>
                            </div>
                          </div>
                          <motion.button
                            onClick={() => handleRemoveLoyaltyCard(account.id)}
                            className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.95 }}
                            disabled={removeLoyaltyMutation.isLoading}
                          >
                            <Trash2 className="h-5 w-5" />
                          </motion.button>
                        </motion.div>
                      ))}
                    </div>
                  )}

                  {saveSuccess && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="flex items-center space-x-2 p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg mt-4"
                    >
                      <CheckCircle className="h-5 w-5 text-green-500" />
                      <span className="text-green-700 dark:text-green-300 text-sm font-medium">
                        Loyalty card added successfully!
                      </span>
                    </motion.div>
                  )}
                </div>
              </motion.div>
            )}

            {/* Household Tab */}
            {activeTab === 'household' && (
              <motion.div
                variants={fadeUp}
                initial="hidden"
                animate="show"
                className="bg-white dark:bg-neutral-800 rounded-2xl p-8 shadow-sm border border-neutral-200 dark:border-neutral-700"
              >
                <h2 className="text-xl font-bold text-neutral-900 dark:text-neutral-100 mb-6 flex items-center">
                  <Home className="h-5 w-5 mr-2 text-primary-600 dark:text-primary-400" />
                  Household
                </h2>

                {!isMember ? (
                  /* No household — Create or Join */
                  <div className="space-y-8">
                    <div className="text-center py-6">
                      <Users className="h-12 w-12 text-neutral-300 dark:text-neutral-600 mx-auto mb-3" />
                      <p className="text-neutral-600 dark:text-neutral-400 mb-1">You're not part of a household yet.</p>
                      <p className="text-sm text-neutral-500 dark:text-neutral-500">Create one or join an existing household with an invite code.</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {/* Create Household */}
                      <div className="p-6 rounded-xl border-2 border-dashed border-neutral-300 dark:border-neutral-600">
                        <h3 className="font-semibold text-neutral-900 dark:text-neutral-100 mb-4">Create a Household</h3>
                        <div className="space-y-3">
                          <input
                            type="text"
                            value={householdName}
                            onChange={(e) => setHouseholdName(e.target.value)}
                            placeholder="e.g. The Smith Family"
                            className="input w-full"
                          />
                          <motion.button
                            onClick={() => createHouseholdMutation.mutate(householdName)}
                            disabled={!householdName.trim() || createHouseholdMutation.isLoading}
                            className="btn btn-primary w-full"
                            whileHover={{ y: -1 }}
                            whileTap={{ scale: 0.97 }}
                          >
                            {createHouseholdMutation.isLoading ? 'Creating...' : 'Create Household'}
                          </motion.button>
                        </div>
                      </div>

                      {/* Join Household */}
                      <div className="p-6 rounded-xl border-2 border-dashed border-neutral-300 dark:border-neutral-600">
                        <h3 className="font-semibold text-neutral-900 dark:text-neutral-100 mb-4">Join a Household</h3>
                        <div className="space-y-3">
                          <input
                            type="text"
                            value={inviteCode}
                            onChange={(e) => setInviteCode(e.target.value)}
                            placeholder="Paste invite code"
                            className="input w-full"
                          />
                          <motion.button
                            onClick={() => joinHouseholdMutation.mutate(inviteCode)}
                            disabled={!inviteCode.trim() || joinHouseholdMutation.isLoading}
                            className="btn btn-primary w-full"
                            whileHover={{ y: -1 }}
                            whileTap={{ scale: 0.97 }}
                          >
                            {joinHouseholdMutation.isLoading ? 'Joining...' : 'Join Household'}
                          </motion.button>
                        </div>
                      </div>
                    </div>

                    {(createHouseholdMutation.isError || joinHouseholdMutation.isError) && (
                      <p className="text-red-500 text-sm text-center">
                        {(createHouseholdMutation.error as any)?.response?.data?.error ||
                         (joinHouseholdMutation.error as any)?.response?.data?.error ||
                         'Something went wrong. Please try again.'}
                      </p>
                    )}
                  </div>
                ) : (
                  /* Has household — Show details */
                  <div className="space-y-6">
                    {/* Household Name */}
                    <div className="flex items-center justify-between p-4 bg-neutral-50 dark:bg-neutral-700/50 rounded-xl">
                      {editingHouseholdName && isAdmin ? (
                        <div className="flex items-center space-x-3 flex-1">
                          <input
                            type="text"
                            value={newHouseholdName}
                            onChange={(e) => setNewHouseholdName(e.target.value)}
                            className="input flex-1"
                            autoFocus
                          />
                          <motion.button
                            onClick={() => updateHouseholdMutation.mutate(newHouseholdName)}
                            disabled={!newHouseholdName.trim() || updateHouseholdMutation.isLoading}
                            className="btn btn-primary btn-sm"
                            whileTap={{ scale: 0.97 }}
                          >
                            <Save className="h-4 w-4" />
                          </motion.button>
                          <motion.button
                            onClick={() => setEditingHouseholdName(false)}
                            className="btn btn-outline btn-sm"
                            whileTap={{ scale: 0.97 }}
                          >
                            <X className="h-4 w-4" />
                          </motion.button>
                        </div>
                      ) : (
                        <>
                          <div>
                            <p className="text-sm text-neutral-500 dark:text-neutral-400">Household Name</p>
                            <p className="text-lg font-semibold text-neutral-900 dark:text-neutral-100">
                              {household?.name}
                            </p>
                          </div>
                          {isAdmin && (
                            <motion.button
                              onClick={() => {
                                setNewHouseholdName(household?.name || '')
                                setEditingHouseholdName(true)
                              }}
                              className="p-2 hover:bg-neutral-200 dark:hover:bg-neutral-600 rounded-lg transition-colors"
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                            >
                              <Edit className="h-4 w-4 text-neutral-600 dark:text-neutral-400" />
                            </motion.button>
                          )}
                        </>
                      )}
                    </div>

                    {/* Invite Code */}
                    <div className="p-4 bg-primary-50 dark:bg-primary-900/20 border border-primary-200 dark:border-primary-800 rounded-xl">
                      <p className="text-sm text-primary-700 dark:text-primary-300 mb-2 font-medium">Invite Code</p>
                      <div className="flex items-center space-x-3">
                        <code className="flex-1 bg-white dark:bg-neutral-800 px-4 py-2 rounded-lg text-sm font-mono text-neutral-900 dark:text-neutral-100 border border-primary-200 dark:border-primary-700">
                          {household?.inviteCode}
                        </code>
                        <motion.button
                          onClick={() => copyInviteCode(household?.inviteCode || '')}
                          className="btn btn-outline btn-sm flex items-center space-x-1"
                          whileTap={{ scale: 0.97 }}
                        >
                          <Copy className="h-4 w-4" />
                          <span>{copiedInvite ? 'Copied!' : 'Copy'}</span>
                        </motion.button>
                        {isAdmin && (
                          <motion.button
                            onClick={() => regenerateInviteMutation.mutate()}
                            disabled={regenerateInviteMutation.isLoading}
                            className="btn btn-outline btn-sm flex items-center space-x-1"
                            whileTap={{ scale: 0.97 }}
                            title="Generate new invite code"
                          >
                            <RefreshCw className={`h-4 w-4 ${regenerateInviteMutation.isLoading ? 'animate-spin' : ''}`} />
                          </motion.button>
                        )}
                      </div>
                      <p className="text-xs text-primary-600 dark:text-primary-400 mt-2">
                        Share this code with family members so they can join your household.
                      </p>
                    </div>

                    {/* Members List */}
                    <div>
                      <h3 className="font-semibold text-neutral-900 dark:text-neutral-100 mb-3 flex items-center">
                        <Users className="h-4 w-4 mr-2" />
                        Members ({household?.members?.length || 0})
                      </h3>
                      <div className="space-y-2">
                        {household?.members?.map((member) => (
                          <div
                            key={member.userId}
                            className="flex items-center justify-between p-3 bg-neutral-50 dark:bg-neutral-700/50 rounded-xl"
                          >
                            <div className="flex items-center space-x-3">
                              <div className="w-9 h-9 rounded-full bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center">
                                <User className="h-4 w-4 text-primary-600 dark:text-primary-400" />
                              </div>
                              <div>
                                <p className="font-medium text-neutral-900 dark:text-neutral-100 text-sm">
                                  {member.firstName} {member.lastName}
                                  {member.userId === user?.id && (
                                    <span className="ml-2 text-xs text-neutral-500">(You)</span>
                                  )}
                                </p>
                                <p className="text-xs text-neutral-500 capitalize">{member.role}</p>
                              </div>
                            </div>
                            {isAdmin && member.userId !== user?.id && (
                              <motion.button
                                onClick={() => {
                                  if (confirm(`Remove ${member.firstName} from the household?`)) {
                                    removeMemberMutation.mutate(member.userId)
                                  }
                                }}
                                className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                                whileHover={{ scale: 1.1 }}
                                whileTap={{ scale: 0.95 }}
                                disabled={removeMemberMutation.isLoading}
                              >
                                <Trash2 className="h-4 w-4" />
                              </motion.button>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="pt-4 border-t border-neutral-200 dark:border-neutral-700">
                      {isAdmin ? (
                        <motion.button
                          onClick={() => {
                            if (confirm('Are you sure you want to delete this household? All shared items will become personal items for their original owners.')) {
                              deleteHouseholdMutation.mutate()
                            }
                          }}
                          disabled={deleteHouseholdMutation.isLoading}
                          className="btn bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/30 border border-red-200 dark:border-red-800 flex items-center space-x-2"
                          whileHover={{ y: -1 }}
                          whileTap={{ scale: 0.97 }}
                        >
                          <Trash2 className="h-4 w-4" />
                          <span>{deleteHouseholdMutation.isLoading ? 'Deleting...' : 'Delete Household'}</span>
                        </motion.button>
                      ) : (
                        <motion.button
                          onClick={() => {
                            if (confirm('Are you sure you want to leave this household?')) {
                              removeMemberMutation.mutate(user?.id || '')
                            }
                          }}
                          disabled={removeMemberMutation.isLoading}
                          className="btn bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/30 border border-red-200 dark:border-red-800 flex items-center space-x-2"
                          whileHover={{ y: -1 }}
                          whileTap={{ scale: 0.97 }}
                        >
                          <LogOut className="h-4 w-4" />
                          <span>{removeMemberMutation.isLoading ? 'Leaving...' : 'Leave Household'}</span>
                        </motion.button>
                      )}
                    </div>

                    {saveSuccess && (
                      <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="flex items-center space-x-2 p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg"
                      >
                        <CheckCircle className="h-5 w-5 text-green-500" />
                        <span className="text-green-700 dark:text-green-300 text-sm font-medium">
                          Household updated successfully!
                        </span>
                      </motion.div>
                    )}
                  </div>
                )}
              </motion.div>
            )}
          </div>
        </div>

        {/* Add Loyalty Card Modal */}
        {showAddLoyaltyModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-white dark:bg-neutral-800 rounded-2xl p-6 max-w-lg w-full max-h-[90vh] overflow-y-auto"
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-neutral-900 dark:text-neutral-100">
                  Add Loyalty Card
                </h2>
                <button
                  onClick={() => {
                    setShowAddLoyaltyModal(false)
                    setSelectedProgram('')
                    setCardNumber('')
                  }}
                  className="p-2 hover:bg-neutral-100 dark:hover:bg-neutral-700 rounded-lg"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                    Select Loyalty Program
                  </label>
                  <div className="grid grid-cols-2 gap-2 max-h-48 overflow-y-auto">
                    {loyaltyPrograms.map((program: any) => (
                      <motion.button
                        key={program.id}
                        onClick={() => setSelectedProgram(program.id)}
                        className={`p-3 rounded-lg border-2 text-left transition-all ${selectedProgram === program.id
                            ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20'
                            : 'border-neutral-200 dark:border-neutral-700 hover:border-neutral-300'
                          }`}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        <div className="flex items-center space-x-2">
                          <div
                            className={`w-8 h-8 rounded-md flex items-center justify-center text-white ${getStoreColor(program.color)}`}
                          >
                            <CreditCard className="h-4 w-4" />
                          </div>
                          <div>
                            <p className="font-medium text-neutral-900 dark:text-neutral-100 text-sm">
                              {program.name}
                            </p>
                            <p className="text-xs text-neutral-500">{program.store}</p>
                          </div>
                        </div>
                      </motion.button>
                    ))}
                  </div>
                </div>

                {selectedProgram && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                  >
                    <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                      Card Number
                    </label>
                    <input
                      type="text"
                      value={cardNumber}
                      onChange={(e) => setCardNumber(e.target.value)}
                      placeholder={
                        loyaltyPrograms.find((p: any) => p.id === selectedProgram)?.requirements ||
                        'Enter card number'
                      }
                      className="input w-full"
                    />
                    <p className="text-xs text-neutral-500 mt-1">
                      {loyaltyPrograms.find((p: any) => p.id === selectedProgram)?.description}
                    </p>
                  </motion.div>
                )}

                <div className="flex space-x-3 pt-4">
                  <motion.button
                    onClick={handleAddLoyaltyCard}
                    disabled={!selectedProgram || !cardNumber || addLoyaltyMutation.isLoading}
                    className="btn btn-primary flex-1"
                    whileHover={{ y: -1 }}
                    whileTap={{ scale: 0.97 }}
                  >
                    {addLoyaltyMutation.isLoading ? 'Adding...' : 'Add Card'}
                  </motion.button>
                  <motion.button
                    onClick={() => {
                      setShowAddLoyaltyModal(false)
                      setSelectedProgram('')
                      setCardNumber('')
                    }}
                    className="btn btn-outline"
                    whileHover={{ y: -1 }}
                    whileTap={{ scale: 0.97 }}
                  >
                    Cancel
                  </motion.button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </div>
    </>
  )
} 