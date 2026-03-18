import { useEffect, useState } from 'react'
import { Helmet } from 'react-helmet-async'
import { motion } from 'framer-motion'
import { useQuery } from 'react-query'
import {
  MapPin,
  Search,
  Star,
  Clock,
  Phone,
  Navigation,
  Filter,
  Grid,
  List,
  Car,
  Bike,
  Smartphone
} from 'lucide-react'
import { apiService } from '../services/api'
import { useAuth } from '../hooks/useAuth'
import { fadeUp, staggerContainer } from '../utils/motion'
import DirectionsMap from '../components/DirectionsMap'

interface Store {
  id: string
  name: string
  chain: string
  brand: string
  address: {
    street: string
    city: string
    postcode: string
    country: string
  }
  coordinates: {
    latitude: number
    longitude: number
  }
  contact: {
    phone: string
    website: string
  }
  services: {
    deliveryAvailable: boolean
    clickAndCollect: boolean
    loyaltyProgram: string
    petrolStation: boolean
    pharmacy: boolean
    cafe: boolean
  }
  hours: {
    [key: string]: string
  }
  features: string[]
  distance?: number
  rating?: number
  priceLevel?: number // 1-4 scale
  isOpen?: boolean
  openingHours?: OpeningHours[]
  imageUrl?: string
  description?: string
}

interface OpeningHours {
  dayOfWeek: number // 0 = Sunday, 1 = Monday, etc.
  openTime: string
  closeTime: string
  isClosed: boolean
}

interface StoreFilters {
  chain: string
  category: string
  priceLevel: number
  features: string[]
  radius: number
  sortBy: 'distance' | 'rating' | 'name'
}

const STORE_CHAINS = [
  'All Chains',
  'Tesco',
  'Sainsbury\'s',
  'ASDA',
  'Morrisons',
  'Waitrose',
  'ALDI',
  'Lidl',
  'Co-op',
  'Iceland',
  'Marks & Spencer',
  'Booths',
  'Costcutter',
  'SPAR',
  'Nisa',
  'Budgens'
]

const STORE_CATEGORIES = [
  'All Categories',
  'Supermarket',
  'Convenience',
  'Pharmacy',
  'Organic',
  'Specialty'
]

const STORE_FEATURES = [
  'Parking',
  'Online Delivery',
  'Click & Collect',
  'Pharmacy',
  'Café',
  'ATM',
  'Petrol Station',
  'Car Wash',
  'Accessible',
  'Free WiFi'
]

export default function Stores() {
  const { user } = useAuth()
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [searchLocation, setSearchLocation] = useState('')
  const [committedSearch, setCommittedSearch] = useState('')
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null)
  const [locationError, setLocationError] = useState<string | null>(null)
  const [showFilters, setShowFilters] = useState(false)
  const [showDirections, setShowDirections] = useState(false)
  const [selectedStore, setSelectedStore] = useState<Store | null>(null)
  const [filters, setFilters] = useState<StoreFilters>({
    chain: 'All Chains',
    category: 'All Categories',
    priceLevel: 0,
    features: [],
    radius: 10,
    sortBy: 'distance'
  })

  // Get user's location
  useEffect(() => {
    if (!navigator.geolocation) {
      setLocationError('Geolocation is not supported by this browser.')
      return
    }

    const onSuccess = (position: GeolocationPosition) => {
      setUserLocation({
        lat: position.coords.latitude,
        lng: position.coords.longitude
      })
      setLocationError(null)
    }

    const onError = (error: GeolocationPositionError) => {
      if (error.code === 1) {
        setLocationError('Location permission denied. Allow location access in your browser settings, then refresh.')
      } else if (error.code === 2) {
        // POSITION_UNAVAILABLE — retry without high accuracy
        navigator.geolocation.getCurrentPosition(
          onSuccess,
          () => {
            setLocationError(
              'Could not determine your location. Check that Windows Location Services is on (Settings > Privacy & security > Location), then refresh. You can also search by postcode below.'
            )
          },
          { enableHighAccuracy: false, timeout: 15000, maximumAge: 300000 }
        )
        return
      } else {
        setLocationError('Location request timed out. Try searching by postcode instead.')
      }
    }

    navigator.geolocation.getCurrentPosition(onSuccess, onError, {
      enableHighAccuracy: true,
      timeout: 10000,
      maximumAge: 60000
    })
  }, [])

  // Fetch stores — stable query key using primitives only
  const { data: storesResponse, isLoading } = useQuery(
    [
      'stores',
      userLocation?.lat ?? null,
      userLocation?.lng ?? null,
      committedSearch,
      filters.chain,
      filters.category,
      filters.priceLevel,
      filters.features.join(','),
      filters.radius,
      filters.sortBy
    ],
    () => {
      const params = new URLSearchParams()

      if (userLocation) {
        params.append('lat', userLocation.lat.toString())
        params.append('lng', userLocation.lng.toString())
      }

      if (committedSearch) {
        params.append('location', committedSearch)
      }

      if (filters.chain !== 'All Chains') {
        params.append('chain', filters.chain)
      }

      if (filters.category !== 'All Categories') {
        params.append('category', filters.category)
      }

      if (filters.priceLevel > 0) {
        params.append('priceLevel', filters.priceLevel.toString())
      }

      if (filters.features.length > 0) {
        params.append('features', filters.features.join(','))
      }

      params.append('radius', filters.radius.toString())
      params.append('sortBy', filters.sortBy)

      const queryString = params.toString()
      return apiService.get(`/api/stores${queryString ? `?${queryString}` : ''}`)
    },
    {
      enabled: !!user,
      staleTime: 60000,
      keepPreviousData: true,
      refetchOnWindowFocus: false,
    }
  )

  const stores: Store[] = (storesResponse as any)?.stores || []

  const handleLocationSearch = () => {
    setCommittedSearch(searchLocation.trim())
  }

  const handleUseMyLocation = () => {
    if (userLocation) {
      setSearchLocation('')
      setCommittedSearch('')
    }
  }

  const handleCallStore = (phone: string) => {
    window.open(`tel:${phone}`, '_self')
  }

  const handleGetDirections = (store: Store) => {
    if (!userLocation) {
      // If no user location, ask for permission or show error
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            setUserLocation({
              lat: position.coords.latitude,
              lng: position.coords.longitude
            })
            setSelectedStore(store)
            setShowDirections(true)
          },
          () => {
            // Fallback to external maps if location denied
            const { latitude, longitude } = store.coordinates
            window.open(`https://www.google.com/maps/dir/?api=1&destination=${latitude},${longitude}`, '_blank')
          }
        )
      } else {
        // Fallback for browsers without geolocation
        const { latitude, longitude } = store.coordinates
        window.open(`https://www.google.com/maps/dir/?api=1&destination=${latitude},${longitude}`, '_blank')
      }
    } else {
      // User location available, show in-app directions
      setSelectedStore(store)
      setShowDirections(true)
    }
  }

  const handleVisitWebsite = (website: string) => {
    window.open(website, '_blank')
  }

  const handleFilterChange = (key: keyof StoreFilters, value: any) => {
    setFilters(prev => ({
      ...prev,
      [key]: value
    }))
  }

  const handleFeatureToggle = (feature: string) => {
    setFilters(prev => ({
      ...prev,
      features: prev.features.includes(feature)
        ? prev.features.filter(f => f !== feature)
        : [...prev.features, feature]
    }))
  }

  const getOpenStatus = (store: Store) => {
    if (!store.hours) return { isOpen: null, message: 'Hours not available' }
    
    const now = new Date()
    const currentDay = now.getDay()
    const dayNames = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday']
    const todayKey = dayNames[currentDay]
    
    const todayHours = store.hours[todayKey]
    
    if (!todayHours) {
      return { isOpen: null, message: 'Hours not available' }
    }
    
    // Parse hours like "06:00-23:00"
    const [openTime, closeTime] = todayHours.split('-')
    const [openHour, openMin] = openTime.split(':').map(Number)
    const [closeHour, closeMin] = closeTime.split(':').map(Number)
    
    const currentTime = now.getHours() * 60 + now.getMinutes()
    const storeOpenTime = openHour * 60 + openMin
    const storeCloseTime = closeHour * 60 + closeMin
    
    if (currentTime >= storeOpenTime && currentTime <= storeCloseTime) {
      return { isOpen: true, message: `Open until ${closeTime}` }
    }
    
    return { isOpen: false, message: `Closed (${todayHours})` }
  }

  const renderStoreCard = (store: Store) => {
     const openStatus = getOpenStatus(store)

     return (
      <motion.div
        key={store.id}
        className="card overflow-hidden"
        variants={fadeUp}
        whileHover={{ y: -6, boxShadow: '0 32px 55px -35px rgba(37,99,235,0.35)' }}
      >
        {/* Open/Closed status banner */}
        <div className={`px-4 py-1.5 text-xs font-bold text-center ${
          openStatus.isOpen === true
            ? 'bg-green-500 text-white'
            : openStatus.isOpen === false
              ? 'bg-red-500 text-white'
              : 'bg-neutral-200 dark:bg-neutral-700 text-neutral-600 dark:text-neutral-300'
        }`}>
          {openStatus.isOpen === true ? `Open — ${openStatus.message}` :
           openStatus.isOpen === false ? `Closed — ${openStatus.message}` : 'Hours unknown'}
        </div>

        {store.imageUrl && (
          <div className="h-48 bg-cover bg-center"
               style={{ backgroundImage: `url(${store.imageUrl})` }} />
        )}

        <div className="card-header">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <h3 className="card-title text-lg">{store.name}</h3>
              <p className="text-sm text-neutral-600 dark:text-neutral-400">{store.chain}</p>
            </div>
            {store.rating && (
              <div className="flex items-center space-x-1">
                <Star className="h-4 w-4 text-yellow-400 fill-current" />
                <span className="text-sm font-medium">{store.rating.toFixed(1)}</span>
              </div>
            )}
          </div>
        </div>

        <div className="card-content">
          {/* Address */}
          <div className="flex items-start space-x-2 mb-3">
            <MapPin className="h-4 w-4 text-neutral-500 dark:text-neutral-400 mt-0.5" />
            <div className="text-sm text-neutral-600 dark:text-neutral-400">
              <p>{store.address.street}</p>
              <p>{store.address.city}, {store.address.postcode}</p>
            </div>
          </div>

          {/* Distance and Travel */}
          {store.distance && (
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center space-x-1 text-sm text-neutral-600 dark:text-neutral-400">
                <Navigation className="h-4 w-4" />
                <span>{store.distance.toFixed(1)} km away</span>
              </div>
              <div className="flex space-x-2">
                <div className="flex items-center space-x-1 text-xs text-neutral-500 dark:text-neutral-400">
                  <Car className="h-3 w-3" />
                  <span>{Math.round(store.distance * 2)} min</span>
                </div>
                <div className="flex items-center space-x-1 text-xs text-neutral-500 dark:text-neutral-400">
                  <Bike className="h-3 w-3" />
                  <span>{Math.round(store.distance * 4)} min</span>
                </div>
              </div>
            </div>
          )}

          {/* Services */}
          <div className="flex flex-wrap gap-1.5 mb-3">
            {store.services.deliveryAvailable && (
              <span className="badge badge-outline text-xs">Delivery</span>
            )}
            {store.services.clickAndCollect && (
              <span className="badge badge-outline text-xs">Click & Collect</span>
            )}
            {store.services.loyaltyProgram && (
              <span className="badge badge-outline text-xs">{store.services.loyaltyProgram}</span>
            )}
          </div>

          {/* Features */}
          {store.features && store.features.length > 0 && (
            <div className="mb-3">
              <div className="flex flex-wrap gap-1">
                {store.features.slice(0, 4).map((feature) => (
                  <span key={feature} className="badge badge-outline text-xs">
                    {feature}
                  </span>
                ))}
                {store.features.length > 4 && (
                  <span className="badge badge-outline text-xs">
                    +{store.features.length - 4} more
                  </span>
                )}
              </div>
            </div>
          )}

          {/* Actions — Directions is primary */}
          <div className="flex space-x-2 pt-3 border-t border-neutral-200 dark:border-neutral-700">
            <button
              className="btn btn-primary btn-sm flex-1"
              onClick={() => handleGetDirections(store)}
            >
              <Navigation className="h-4 w-4 mr-1" />
              Directions
            </button>
            {store.contact.phone && (
              <button
                className="btn btn-outline btn-sm"
                onClick={() => handleCallStore(store.contact.phone)}
              >
                <Phone className="h-4 w-4" />
              </button>
            )}
            {store.contact.website && (
              <button
                className="btn btn-outline btn-sm"
                onClick={() => handleVisitWebsite(store.contact.website)}
              >
                <Smartphone className="h-4 w-4" />
              </button>
            )}
          </div>
        </div>
      </motion.div>
    )
  }

  const renderStoreList = (store: Store) => {
    const openStatus = getOpenStatus(store)
    
    return (
      <motion.div
        key={store.id}
        className="card"
        variants={fadeUp}
        whileHover={{ y: -4, boxShadow: '0 26px 50px -30px rgba(37,99,235,0.28)' }}
      >
        <div className="card-content">
          <div className="flex items-start space-x-4">
            {store.imageUrl && (
              <div className="w-24 h-24 bg-cover bg-center rounded-lg flex-shrink-0" 
                   style={{ backgroundImage: `url(${store.imageUrl})` }} />
            )}
            
            <div className="flex-1">
              <div className="flex items-start justify-between mb-2">
                <div>
                  <h3 className="font-semibold text-lg text-neutral-900 dark:text-neutral-100">{store.name}</h3>
                  <p className="text-sm text-neutral-600 dark:text-neutral-400">{store.chain}</p>
                </div>
                <div className="flex items-center space-x-2">
                  {store.rating && (
                    <div className="flex items-center space-x-1">
                      <Star className="h-4 w-4 text-yellow-400 fill-current" />
                      <span className="text-sm font-medium">{store.rating.toFixed(1)}</span>
                    </div>
                  )}
                  <span className={`badge ${
                    openStatus.isOpen === true ? 'bg-primary-100 text-primary-800' :
                    openStatus.isOpen === false ? 'bg-red-100 text-red-800' :
                    'bg-neutral-100 text-neutral-800'
                  }`}>
                    {openStatus.isOpen === true ? 'Open' : 
                     openStatus.isOpen === false ? 'Closed' : 'Unknown'}
                  </span>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="space-y-1">
                  <div className="flex items-center space-x-2">
                    <MapPin className="h-4 w-4 text-neutral-500 dark:text-neutral-400" />
                    <span className="text-neutral-600 dark:text-neutral-400">{store.address.street}, {store.address.city}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Clock className="h-4 w-4 text-neutral-500 dark:text-neutral-400" />
                    <span className="text-neutral-600 dark:text-neutral-400">{openStatus.message}</span>
                  </div>
                </div>

                <div className="space-y-1">
                  {store.distance && (
                    <div className="flex items-center space-x-2">
                      <Navigation className="h-4 w-4 text-neutral-500 dark:text-neutral-400" />
                      <span className="text-neutral-600 dark:text-neutral-400">{store.distance.toFixed(1)} km away</span>
                    </div>
                  )}
                  <div className="flex items-center space-x-2">
                    <span className="text-neutral-600 dark:text-neutral-400">Services:</span>
                    <div className="flex space-x-1">
                      {store.services.deliveryAvailable && (
                        <span className="badge badge-outline text-xs">Delivery</span>
                      )}
                      {store.services.clickAndCollect && (
                        <span className="badge badge-outline text-xs">Click & Collect</span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
              
              {store.features && store.features.length > 0 && (
                <div className="mt-2">
                  <div className="flex flex-wrap gap-1">
                    {store.features.slice(0, 6).map((feature) => (
                      <span key={feature} className="badge badge-outline text-xs">
                        {feature}
                      </span>
                    ))}
                  </div>
                </div>
              )}
              
              <div className="flex space-x-2 mt-3">
                <button
                  className="btn btn-primary btn-sm"
                  onClick={() => handleGetDirections(store)}
                >
                  <Navigation className="h-4 w-4 mr-1" />
                  Directions
                </button>
                {store.contact.phone && (
                  <button
                    className="btn btn-outline btn-sm"
                    onClick={() => handleCallStore(store.contact.phone)}
                  >
                    <Phone className="h-4 w-4 mr-1" />
                    Call
                  </button>
                )}
                {store.contact.website && (
                  <button
                    className="btn btn-outline btn-sm"
                    onClick={() => handleVisitWebsite(store.contact.website)}
                  >
                    <Smartphone className="h-4 w-4 mr-1" />
                    Website
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    )
  }

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
        <title>Stores - Nourish Neural</title>
      </Helmet>

      <div className="relative space-y-8 pb-12">
        <motion.div
          className="pointer-events-none absolute -top-28 left-[-12%] h-72 w-72 rounded-full bg-primary-200/35 blur-3xl"
          animate={{ y: [0, 20, 0], opacity: [0.35, 0.6, 0.35] }}
          transition={{ duration: 18, repeat: Infinity, ease: 'easeInOut' }}
        />
        <motion.div
          className="pointer-events-none absolute -bottom-32 right-[-15%] h-80 w-80 rounded-full bg-accent-200/30 blur-3xl"
          animate={{ y: [0, -18, 0], opacity: [0.3, 0.55, 0.3] }}
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
                  <MapPin className="h-7 w-7 text-white" />
                </motion.div>
                <div>
                  <motion.h1
                    className="text-3xl md:text-4xl font-bold gradient-text"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.6, delay: 0.3 }}
                  >
                    Store Atlas
                  </motion.h1>
                  <motion.p
                    className="mt-1 text-neutral-600 dark:text-neutral-400 text-sm md:text-base"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.6, delay: 0.4 }}
                  >
                    Compare store assortments, hours, and pricing across your area
                  </motion.p>
                </div>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <motion.button
                  onClick={() => setShowFilters(!showFilters)}
                  className="btn btn-outline shadow-md hover:shadow-lg"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.6, delay: 0.5 }}
                  whileHover={{ y: -2 }}
                  whileTap={{ scale: 0.97 }}
                >
                  <Filter className="h-4 w-4 mr-2" />
                  Filters
                </motion.button>
                <motion.div
                  className="flex border-2 border-neutral-300 rounded-xl overflow-hidden shadow-sm"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.6, delay: 0.6 }}
                >
                  <button
                    onClick={() => setViewMode('grid')}
                    className={`px-3 py-2 transition-all duration-200 ${
                      viewMode === 'grid'
                        ? 'bg-primary-500 text-white shadow-inner'
                        : 'text-neutral-600 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-700'
                    }`}
                  >
                    <Grid className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => setViewMode('list')}
                    className={`px-3 py-2 transition-all duration-200 ${
                      viewMode === 'list'
                        ? 'bg-primary-500 text-white shadow-inner'
                        : 'text-neutral-600 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-700'
                    }`}
                  >
                    <List className="h-4 w-4" />
                  </button>
                </motion.div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Location Search */}
        <motion.div
          className="card"
          variants={fadeUp}
          initial="hidden"
          animate="visible"
          transition={{ duration: 0.45 }}
        >
          <div className="card-content">
            <div className="flex space-x-3 items-center">
              <div className="hidden sm:flex h-11 w-11 rounded-xl bg-gradient-to-br from-primary-500 to-accent-500 items-center justify-center flex-shrink-0">
                <MapPin className="h-5 w-5 text-white" />
              </div>
              <div className="flex-1">
                <div className="relative">
                  <Search className="h-4 w-4 absolute left-3 top-3 text-neutral-400" />
                  <input
                    type="text"
                    value={searchLocation}
                    onChange={(e) => setSearchLocation(e.target.value)}
                    onKeyDown={(e) => { if (e.key === 'Enter') handleLocationSearch() }}
                    placeholder="Enter city, postcode, or address..."
                    className="input pl-10"
                  />
                </div>
              </div>
              <motion.button
                onClick={handleLocationSearch}
                className="btn btn-primary"
                whileHover={{ y: -2 }}
                whileTap={{ scale: 0.97 }}
              >
                Search
              </motion.button>
              {userLocation && (
                <motion.button
                  onClick={handleUseMyLocation}
                  className="btn btn-outline"
                  title="Find stores near your current location"
                  whileHover={{ y: -2 }}
                  whileTap={{ scale: 0.97 }}
                >
                  <Navigation className="h-4 w-4 mr-2" />
                  Use My Location
                </motion.button>
              )}
            </div>
            {/* Location Status */}
            {locationError && (
              <motion.div
                className="mt-3 p-3 bg-yellow-50 border border-yellow-200 rounded-lg"
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <p className="text-sm text-yellow-800">
                  <Navigation className="h-4 w-4 inline mr-1" />
                  {locationError}
                </p>
              </motion.div>
            )}
            {userLocation && (
              <motion.div
                className="mt-3 p-3 bg-primary-50 border border-primary-200 rounded-lg"
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <p className="text-sm text-primary-800">
                  <Navigation className="h-4 w-4 inline mr-1" />
                  Location found! Showing stores within {filters.radius}km of your location.
                </p>
              </motion.div>
            )}
          </div>
        </motion.div>

        {/* Filters */}
         {showFilters && (
          <motion.div
            className="card"
            initial={{ opacity: 0, y: -16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
          >
            <div className="card-header">
              <h2 className="card-title">Filters</h2>
            </div>
            <div className="card-content space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div>
                  <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                    Store Chain
                  </label>
                  <select
                    value={filters.chain}
                    onChange={(e) => handleFilterChange('chain', e.target.value)}
                    className="input"
                  >
                    {STORE_CHAINS.map(chain => (
                      <option key={chain} value={chain}>{chain}</option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                    Category
                  </label>
                  <select
                    value={filters.category}
                    onChange={(e) => handleFilterChange('category', e.target.value)}
                    className="input"
                  >
                    {STORE_CATEGORIES.map(category => (
                      <option key={category} value={category}>{category}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                    Radius (km)
                  </label>
                  <select
                    value={filters.radius}
                    onChange={(e) => handleFilterChange('radius', parseInt(e.target.value))}
                    className="input"
                  >
                    <option value={5}>5 km</option>
                    <option value={10}>10 km</option>
                    <option value={25}>25 km</option>
                    <option value={50}>50 km</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                    Sort By
                  </label>
                  <select
                    value={filters.sortBy}
                    onChange={(e) => handleFilterChange('sortBy', e.target.value as any)}
                    className="input"
                  >
                    <option value="distance">Distance</option>
                    <option value="rating">Rating</option>
                    <option value="name">Name</option>
                  </select>
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                  Features
                </label>
                <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
                  {STORE_FEATURES.map(feature => (
                    <label key={feature} className="flex items-center space-x-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={filters.features.includes(feature)}
                        onChange={() => handleFeatureToggle(feature)}
                        className="rounded border-neutral-300 dark:border-neutral-600 text-primary-600 focus:ring-primary-500"
                      />
                      <span className="text-sm text-neutral-700 dark:text-neutral-300">{feature}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* Results */}
        {stores.length === 0 ? (
          <motion.div
            className="card"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45 }}
          >
            <div className="card-content">
              <div className="text-center py-12">
                <MapPin className="h-12 w-12 text-neutral-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-neutral-900 dark:text-neutral-100 mb-2">
                  No stores found
                </h3>
                <p className="text-neutral-600 dark:text-neutral-400 mb-4">
                  Try expanding your search radius or changing your location.
                </p>
              </div>
            </div>
          </motion.div>
        ) : (
          <motion.div
            className="space-y-4"
            variants={staggerContainer}
            initial="hidden"
            animate="visible"
          >
            <motion.div className="flex items-center space-x-2 mb-1" variants={fadeUp}>
              <h2 className="text-lg font-bold text-neutral-900 dark:text-neutral-100">Results</h2>
              <span className="badge badge-primary">{stores.length}</span>
            </motion.div>

            {viewMode === 'grid' ? (
              <motion.div
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 items-start"
                variants={staggerContainer}
              >
                {stores.map(renderStoreCard)}
              </motion.div>
            ) : (
              <motion.div className="space-y-4" variants={staggerContainer}>
                {stores.map(renderStoreList)}
              </motion.div>
            )}
          </motion.div>
        )}
      </div>

      {/* Directions Map Modal */}
      {userLocation && selectedStore && (
        <DirectionsMap
          isOpen={showDirections}
          onClose={() => {
            setShowDirections(false)
            setSelectedStore(null)
          }}
          userLocation={userLocation}
          destination={{
            lat: selectedStore.coordinates.latitude,
            lng: selectedStore.coordinates.longitude,
            name: selectedStore.name,
            address: `${selectedStore.address.street}, ${selectedStore.address.city}, ${selectedStore.address.postcode}`,
            chain: selectedStore.chain
          }}
        />
      )}
    </>
  )
} 