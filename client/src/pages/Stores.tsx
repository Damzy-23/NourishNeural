import { useState, useEffect } from 'react'
import { Helmet } from 'react-helmet-async'
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
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null)
  const [locationError, setLocationError] = useState<string | null>(null)
  const [showFilters, setShowFilters] = useState(false)
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
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude
          })
          setLocationError(null)
        },
        (error) => {
          console.log('Location access denied:', error)
          setLocationError('Location access denied. Please enable location permissions to find nearby stores.')
        }
      )
    } else {
      setLocationError('Geolocation is not supported by this browser.')
    }
  }, [])

  // Fetch stores
  const { data: storesResponse, isLoading } = useQuery(
    ['stores', { location: userLocation, search: searchLocation, filters }],
    () => {
      const params = new URLSearchParams()
      
      if (userLocation) {
        params.append('lat', userLocation.lat.toString())
        params.append('lng', userLocation.lng.toString())
      }
      
      if (searchLocation) {
        params.append('location', searchLocation)
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
    }
  )

  const stores: Store[] = (storesResponse as any)?.stores || []

  const handleLocationSearch = () => {
    // Trigger search with the entered location
    // The query will automatically refetch when searchLocation changes
  }

  const handleUseMyLocation = () => {
    if (userLocation) {
      // Clear manual search and use GPS coordinates
      setSearchLocation('')
      // The query will automatically refetch with userLocation
    }
  }

  const handleCallStore = (phone: string) => {
    window.open(`tel:${phone}`, '_self')
  }

  const handleGetDirections = (store: Store) => {
    const { latitude, longitude } = store.coordinates
    const address = `${store.address.street}, ${store.address.city}, ${store.address.postcode}`
    
    // Try to use device's default maps app
    if (/iPhone|iPad|iPod/.test(navigator.userAgent)) {
      // iOS - use Apple Maps
      window.open(`maps://maps.google.com/maps?daddr=${latitude},${longitude}`, '_blank')
    } else if (/Android/.test(navigator.userAgent)) {
      // Android - use Google Maps
      window.open(`geo:${latitude},${longitude}?q=${encodeURIComponent(address)}`, '_blank')
    } else {
      // Desktop/other - use Google Maps web
      window.open(`https://www.google.com/maps/dir/?api=1&destination=${latitude},${longitude}`, '_blank')
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
      <div key={store.id} className="card hover:shadow-medium transition-shadow">
        {store.imageUrl && (
          <div className="h-48 bg-cover bg-center rounded-t-lg" 
               style={{ backgroundImage: `url(${store.imageUrl})` }} />
        )}
        
        <div className="card-header">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <h3 className="card-title text-lg">{store.name}</h3>
              <p className="text-sm text-neutral-600">{store.chain}</p>
            </div>
            <div className="flex items-center space-x-2">
              {store.rating && (
                <div className="flex items-center space-x-1">
                  <Star className="h-4 w-4 text-yellow-400 fill-current" />
                  <span className="text-sm font-medium">{store.rating.toFixed(1)}</span>
                </div>
              )}
              <span className={`badge ${
                openStatus.isOpen === true ? 'bg-green-100 text-green-800' :
                openStatus.isOpen === false ? 'bg-red-100 text-red-800' :
                'bg-neutral-100 text-neutral-800'
              }`}>
                {openStatus.isOpen === true ? 'Open' : 
                 openStatus.isOpen === false ? 'Closed' : 'Unknown'}
              </span>
            </div>
          </div>
        </div>
        
        <div className="card-content">
          {/* Address */}
          <div className="flex items-start space-x-2 mb-3">
            <MapPin className="h-4 w-4 text-neutral-500 mt-0.5" />
            <div className="text-sm text-neutral-600">
              <p>{store.address.street}</p>
              <p>{store.address.city}, {store.address.postcode}</p>
            </div>
          </div>
          
          {/* Distance and Travel */}
          {store.distance && (
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center space-x-1 text-sm text-neutral-600">
                <Navigation className="h-4 w-4" />
                <span>{store.distance.toFixed(1)} km away</span>
              </div>
              <div className="flex space-x-2">
                <div className="flex items-center space-x-1 text-xs text-neutral-500">
                  <Car className="h-3 w-3" />
                  <span>{Math.round(store.distance * 2)} min</span>
                </div>
                <div className="flex items-center space-x-1 text-xs text-neutral-500">
                  <Bike className="h-3 w-3" />
                  <span>{Math.round(store.distance * 4)} min</span>
                </div>
              </div>
            </div>
          )}
          
          {/* Opening Hours */}
          <div className="flex items-center space-x-2 mb-3">
            <Clock className="h-4 w-4 text-neutral-500" />
            <span className="text-sm text-neutral-600">{openStatus.message}</span>
          </div>
          
          {/* Services */}
          <div className="flex items-center space-x-2 mb-3">
            <span className="text-sm text-neutral-600">Services:</span>
            <div className="flex space-x-2">
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
          
          {/* Actions */}
          <div className="flex space-x-2 pt-3 border-t border-neutral-200">
            {store.contact.phone && (
              <button 
                className="btn btn-outline btn-sm flex-1"
                onClick={() => handleCallStore(store.contact.phone)}
              >
                <Phone className="h-4 w-4 mr-1" />
                Call
              </button>
            )}
            <button 
              className="btn btn-outline btn-sm flex-1"
              onClick={() => handleGetDirections(store)}
            >
              <Navigation className="h-4 w-4 mr-1" />
              Directions
            </button>
            {store.contact.website && (
              <button 
                className="btn btn-outline btn-sm flex-1"
                onClick={() => handleVisitWebsite(store.contact.website)}
              >
                <Smartphone className="h-4 w-4 mr-1" />
                Website
              </button>
            )}
          </div>
        </div>
      </div>
    )
  }

  const renderStoreList = (store: Store) => {
    const openStatus = getOpenStatus(store)
    
    return (
      <div key={store.id} className="card">
        <div className="card-content">
          <div className="flex items-start space-x-4">
            {store.imageUrl && (
              <div className="w-24 h-24 bg-cover bg-center rounded-lg flex-shrink-0" 
                   style={{ backgroundImage: `url(${store.imageUrl})` }} />
            )}
            
            <div className="flex-1">
              <div className="flex items-start justify-between mb-2">
                <div>
                  <h3 className="font-semibold text-lg">{store.name}</h3>
                  <p className="text-sm text-neutral-600">{store.chain}</p>
                </div>
                <div className="flex items-center space-x-2">
                  {store.rating && (
                    <div className="flex items-center space-x-1">
                      <Star className="h-4 w-4 text-yellow-400 fill-current" />
                      <span className="text-sm font-medium">{store.rating.toFixed(1)}</span>
                    </div>
                  )}
                  <span className={`badge ${
                    openStatus.isOpen === true ? 'bg-green-100 text-green-800' :
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
                    <MapPin className="h-4 w-4 text-neutral-500" />
                    <span className="text-neutral-600">{store.address.street}, {store.address.city}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Clock className="h-4 w-4 text-neutral-500" />
                    <span className="text-neutral-600">{openStatus.message}</span>
                  </div>
                </div>
                
                <div className="space-y-1">
                  {store.distance && (
                    <div className="flex items-center space-x-2">
                      <Navigation className="h-4 w-4 text-neutral-500" />
                      <span className="text-neutral-600">{store.distance.toFixed(1)} km away</span>
                    </div>
                  )}
                  <div className="flex items-center space-x-2">
                    <span className="text-neutral-600">Services:</span>
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
                {store.contact.phone && (
                  <button 
                    className="btn btn-outline btn-sm"
                    onClick={() => handleCallStore(store.contact.phone)}
                  >
                    <Phone className="h-4 w-4 mr-1" />
                    Call
                  </button>
                )}
                <button 
                  className="btn btn-outline btn-sm"
                  onClick={() => handleGetDirections(store)}
                >
                  <Navigation className="h-4 w-4 mr-1" />
                  Directions
                </button>
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
      </div>
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
        <title>Stores - PantryPal</title>
      </Helmet>

      <div className="space-y-6">
        {/* Header */}
        <div className="relative">
          <div className="absolute inset-0 bg-gradient-to-r from-primary-600/5 to-accent-500/5 rounded-3xl"></div>
          <div className="relative glass-card rounded-3xl p-8">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-4xl font-bold gradient-text mb-2">Stores</h1>
                <p className="text-lg text-neutral-600">
                  Find grocery stores near you and compare prices
                </p>
              </div>
              <div className="flex space-x-2">
                <button
                  onClick={() => setShowFilters(!showFilters)}
                  className="btn btn-outline"
                >
                  <Filter className="h-4 w-4 mr-2" />
                  Filters
                </button>
                <div className="flex border border-neutral-300 rounded-lg">
                  <button
                    onClick={() => setViewMode('grid')}
                    className={`px-3 py-2 ${
                      viewMode === 'grid' 
                        ? 'bg-primary-100 text-primary-700' 
                        : 'text-neutral-600 hover:bg-neutral-50'
                    }`}
                  >
                    <Grid className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => setViewMode('list')}
                    className={`px-3 py-2 ${
                      viewMode === 'list' 
                        ? 'bg-primary-100 text-primary-700' 
                        : 'text-neutral-600 hover:bg-neutral-50'
                    }`}
                  >
                    <List className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Location Search */}
        <div className="card">
          <div className="card-content">
            <div className="flex space-x-3">
              <div className="flex-1">
                <div className="relative">
                  <Search className="h-4 w-4 absolute left-3 top-3 text-neutral-400" />
                  <input
                    type="text"
                    value={searchLocation}
                    onChange={(e) => setSearchLocation(e.target.value)}
                    placeholder="Enter city, postcode, or address..."
                    className="input pl-10"
                  />
                </div>
              </div>
              <button
                onClick={handleLocationSearch}
                className="btn btn-primary"
              >
                Search
              </button>
              {userLocation && (
                <button
                  onClick={handleUseMyLocation}
                  className="btn btn-outline"
                  title="Find stores near your current location"
                >
                  <Navigation className="h-4 w-4 mr-2" />
                  Use My Location
                </button>
              )}
            </div>
            {/* Location Status */}
            {locationError && (
              <div className="mt-3 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                <p className="text-sm text-yellow-800">
                  <Navigation className="h-4 w-4 inline mr-1" />
                  {locationError}
                </p>
              </div>
            )}
            {userLocation && (
              <div className="mt-3 p-3 bg-green-50 border border-green-200 rounded-lg">
                <p className="text-sm text-green-800">
                  <Navigation className="h-4 w-4 inline mr-1" />
                  Location found! Showing stores within {filters.radius}km of your location.
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Filters */}
        {showFilters && (
          <div className="card">
            <div className="card-header">
              <h2 className="card-title">Filters</h2>
            </div>
            <div className="card-content space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-2">
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
                  <label className="block text-sm font-medium text-neutral-700 mb-2">
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
                  <label className="block text-sm font-medium text-neutral-700 mb-2">
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
                  <label className="block text-sm font-medium text-neutral-700 mb-2">
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
                <label className="block text-sm font-medium text-neutral-700 mb-2">
                  Features
                </label>
                <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
                  {STORE_FEATURES.map(feature => (
                    <label key={feature} className="flex items-center space-x-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={filters.features.includes(feature)}
                        onChange={() => handleFeatureToggle(feature)}
                        className="rounded border-neutral-300 text-primary-600 focus:ring-primary-500"
                      />
                      <span className="text-sm text-neutral-700">{feature}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Results */}
        {stores.length === 0 ? (
          <div className="card">
            <div className="card-content">
              <div className="text-center py-12">
                <MapPin className="h-12 w-12 text-neutral-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-neutral-900 mb-2">
                  No stores found
                </h3>
                <p className="text-neutral-600 mb-4">
                  Try expanding your search radius or changing your location.
                </p>
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <p className="text-sm text-neutral-600">
                Found {stores.length} store{stores.length !== 1 ? 's' : ''}
              </p>
            </div>
            
            {viewMode === 'grid' ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {stores.map(renderStoreCard)}
              </div>
            ) : (
              <div className="space-y-4">
                {stores.map(renderStoreList)}
              </div>
            )}
          </div>
        )}
      </div>
    </>
  )
} 