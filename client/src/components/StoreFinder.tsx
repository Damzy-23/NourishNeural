import { useState, useEffect } from 'react'
import { MapPin, Phone, Clock, Truck, ShoppingCart, Star, Search } from 'lucide-react'
import { storeService, Store, Product } from '../services/storeService'
import toast from 'react-hot-toast'

interface StoreFinderProps {
  onStoreSelect?: (store: Store) => void
  showProducts?: boolean
}

export default function StoreFinder({ onStoreSelect, showProducts = false }: StoreFinderProps) {
  const [stores, setStores] = useState<Store[]>([])
  const [filteredStores, setFilteredStores] = useState<Store[]>([])
  const [loading, setLoading] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedChain, setSelectedChain] = useState('')
  const [showNearby, setShowNearby] = useState(false)
  const [userLocation, setUserLocation] = useState<{ latitude: number; longitude: number } | null>(null)
  const [products, setProducts] = useState<{ [storeId: string]: Product[] }>({})
  const [selectedStore, setSelectedStore] = useState<Store | null>(null)

  // Load stores on component mount
  useEffect(() => {
    loadStores()
  }, [])

  // Filter stores based on search term and selected chain
  useEffect(() => {
    let filtered = stores

    if (searchTerm) {
      filtered = filtered.filter(store =>
        store.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        store.address.city.toLowerCase().includes(searchTerm.toLowerCase()) ||
        store.address.postcode.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    if (selectedChain) {
      filtered = filtered.filter(store =>
        store.chain.toLowerCase() === selectedChain.toLowerCase()
      )
    }

    setFilteredStores(filtered)
  }, [stores, searchTerm, selectedChain])

  const loadStores = async () => {
    setLoading(true)
    try {
      const result = await storeService.getAllStores()
      setStores(result.stores)
    } catch (error) {
      console.error('Error loading stores:', error)
      toast.error('Failed to load stores')
    } finally {
      setLoading(false)
    }
  }

  const loadNearbyStores = async () => {
    if (!userLocation) {
      try {
        const location = await storeService.getCurrentLocation()
        setUserLocation(location)
        setShowNearby(true)
        
        const result = await storeService.getNearbyStores(location.latitude, location.longitude, 10)
        setStores(result.stores)
      } catch (error) {
        console.error('Error getting location:', error)
        toast.error('Unable to get your location')
      }
    } else {
      setShowNearby(true)
      const result = await storeService.getNearbyStores(userLocation.latitude, userLocation.longitude, 10)
      setStores(result.stores)
    }
  }

  const loadStoreProducts = async (store: Store) => {
    try {
      const result = await storeService.getProductsByChain(store.chain.toLowerCase())
      setProducts(prev => ({ ...prev, [store.id]: result.products }))
    } catch (error) {
      console.error('Error loading products:', error)
    }
  }

  const handleStoreSelect = (store: Store) => {
    setSelectedStore(store)
    if (showProducts) {
      loadStoreProducts(store)
    }
    if (onStoreSelect) {
      onStoreSelect(store)
    }
  }

  const getUniqueChains = () => {
    const chains = [...new Set(stores.map(store => store.chain))]
    return chains.sort()
  }

  return (
    <div className="space-y-6">
      {/* Search and Filters */}
      <div className="card">
        <div className="card-content">
          <div className="flex flex-col md:flex-row gap-4">
            {/* Search */}
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-neutral-400" />
                <input
                  type="text"
                  placeholder="Search stores by name, city, or postcode..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="input pl-10"
                />
              </div>
            </div>

            {/* Chain Filter */}
            <div className="md:w-48">
              <select
                value={selectedChain}
                onChange={(e) => setSelectedChain(e.target.value)}
                className="input"
              >
                <option value="">All Chains</option>
                {getUniqueChains().map(chain => (
                  <option key={chain} value={chain}>{chain}</option>
                ))}
              </select>
            </div>

            {/* Nearby Button */}
            <button
              onClick={loadNearbyStores}
              className="btn btn-outline"
            >
              <MapPin className="h-4 w-4 mr-2" />
              {showNearby ? 'Show All' : 'Nearby'}
            </button>
          </div>
        </div>
      </div>

      {/* Results */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Store List */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">
            Stores ({filteredStores.length})
          </h3>

          {loading ? (
            <div className="space-y-3">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="card animate-pulse">
                  <div className="card-content">
                    <div className="h-4 bg-neutral-200 rounded w-3/4 mb-2"></div>
                    <div className="h-3 bg-neutral-200 rounded w-1/2"></div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="space-y-3">
              {filteredStores.map(store => (
                <div
                  key={store.id}
                  className={`card cursor-pointer transition-colors ${
                    selectedStore?.id === store.id ? 'ring-2 ring-primary-500' : 'hover:bg-neutral-50'
                  }`}
                  onClick={() => handleStoreSelect(store)}
                >
                  <div className="card-content">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h4 className="font-medium text-neutral-900">{store.name}</h4>
                        <p className="text-sm text-neutral-600">{store.chain}</p>
                        
                        <div className="flex items-center mt-1 text-sm text-neutral-500">
                          <MapPin className="h-3 w-3 mr-1" />
                          {store.address.street}, {store.address.city}, {store.address.postcode}
                        </div>

                        {store.distance && (
                          <p className="text-xs text-neutral-500 mt-1">
                            {storeService.formatDistance(store.distance)} away
                          </p>
                        )}
                      </div>

                      <div className="flex items-center space-x-2">
                        {store.services.deliveryAvailable && (
                          <div title="Delivery Available">
                            <Truck className="h-4 w-4 text-green-600" />
                          </div>
                        )}
                        {store.services.clickAndCollect && (
                          <div title="Click & Collect">
                            <ShoppingCart className="h-4 w-4 text-blue-600" />
                          </div>
                        )}
                        {store.services.loyaltyProgram && (
                          <div title={store.services.loyaltyProgram}>
                            <Star className="h-4 w-4 text-yellow-600" />
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center justify-between mt-3 text-sm text-neutral-500">
                      <div className="flex items-center">
                        <Phone className="h-3 w-3 mr-1" />
                        {store.contact.phone}
                      </div>
                      <div className="flex items-center">
                        <Clock className="h-3 w-3 mr-1" />
                        {store.hours.monday}
                      </div>
                    </div>

                    {store.features && store.features.length > 0 && (
                      <div className="mt-2">
                        <div className="flex flex-wrap gap-1">
                          {store.features.slice(0, 3).map((feature, index) => (
                            <span
                              key={index}
                              className="px-2 py-1 bg-neutral-100 text-xs text-neutral-600 rounded"
                            >
                              {feature}
                            </span>
                          ))}
                          {store.features.length > 3 && (
                            <span className="px-2 py-1 bg-neutral-100 text-xs text-neutral-600 rounded">
                              +{store.features.length - 3} more
                            </span>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Store Details & Products */}
        {selectedStore && (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Store Details</h3>
            
            <div className="card">
              <div className="card-content">
                <h4 className="font-medium text-lg mb-3">{selectedStore.name}</h4>
                
                <div className="space-y-3">
                  <div>
                    <h5 className="font-medium text-sm text-neutral-700">Address</h5>
                    <p className="text-sm text-neutral-600">
                      {selectedStore.address.street}<br />
                      {selectedStore.address.city}, {selectedStore.address.postcode}
                    </p>
                  </div>

                  <div>
                    <h5 className="font-medium text-sm text-neutral-700">Contact</h5>
                    <p className="text-sm text-neutral-600">{selectedStore.contact.phone}</p>
                    <a 
                      href={selectedStore.contact.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-primary-600 hover:text-primary-500"
                    >
                      Visit Website
                    </a>
                  </div>

                  <div>
                    <h5 className="font-medium text-sm text-neutral-700">Services</h5>
                    <div className="flex items-center space-x-4 text-sm text-neutral-600">
                      {selectedStore.services.deliveryAvailable && (
                        <span className="flex items-center">
                          <Truck className="h-3 w-3 mr-1 text-green-600" />
                          Delivery
                        </span>
                      )}
                      {selectedStore.services.clickAndCollect && (
                        <span className="flex items-center">
                          <ShoppingCart className="h-3 w-3 mr-1 text-blue-600" />
                          Click & Collect
                        </span>
                      )}
                      {selectedStore.services.loyaltyProgram && (
                        <span className="flex items-center">
                          <Star className="h-3 w-3 mr-1 text-yellow-600" />
                          {selectedStore.services.loyaltyProgram}
                        </span>
                      )}
                    </div>
                  </div>

                  <div>
                    <h5 className="font-medium text-sm text-neutral-700">Opening Hours</h5>
                    <div className="text-sm text-neutral-600">
                      <div>Mon-Fri: {selectedStore.hours.monday}</div>
                      <div>Saturday: {selectedStore.hours.saturday}</div>
                      <div>Sunday: {selectedStore.hours.sunday}</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Products */}
            {showProducts && products[selectedStore.id] && (
              <div className="card">
                <div className="card-header">
                  <h4 className="card-title">Available Products</h4>
                </div>
                <div className="card-content">
                  <div className="space-y-3">
                    {products[selectedStore.id].slice(0, 10).map(product => (
                      <div key={product.id} className="flex items-center justify-between p-3 bg-neutral-50 rounded-lg">
                        <div>
                          <h5 className="font-medium text-sm">{product.name}</h5>
                          <p className="text-xs text-neutral-600">{product.brand}</p>
                        </div>
                        <div className="text-right">
                          <p className="font-medium text-sm">{storeService.formatPrice(product.price.current)}</p>
                          <p className="text-xs text-neutral-600">{product.availability}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
