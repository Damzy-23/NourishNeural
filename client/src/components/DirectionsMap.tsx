import { useEffect, useRef, useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  X,
  Navigation,
  MapPin,
  Car,
  Bike,
  Footprints,
  RotateCcw,
  Maximize2,
  Minimize2,
  ChevronUp,
  ChevronDown,
  AlertTriangle,
  Zap,
  Layers
} from 'lucide-react'
import L from 'leaflet'

// TomTom API Key
const TOMTOM_API_KEY = import.meta.env.VITE_TOMTOM_API_KEY || ''

interface DirectionsMapProps {
  isOpen: boolean
  onClose: () => void
  userLocation: { lat: number; lng: number }
  destination: {
    lat: number
    lng: number
    name: string
    address: string
    chain?: string
  }
}

type TravelMode = 'car' | 'bicycle' | 'pedestrian'

interface RouteInfo {
  distance: number
  duration: number
  durationInTraffic: number
  trafficDelay: number
  instructions: RouteInstruction[]
  departureTime: string
  arrivalTime: string
  trafficLevel: 'low' | 'moderate' | 'heavy' | 'severe'
  geometry: [number, number][] | null // Cache geometry to avoid re-fetching
}

interface RouteInstruction {
  instruction: string
  distance: number
  duration: number
  maneuver: string
}

interface AllRoutesInfo {
  car: RouteInfo | null
  bicycle: RouteInfo | null
  pedestrian: RouteInfo | null
}

// Simple in-memory cache for routes
const routeCache = new Map<string, { data: AllRoutesInfo; timestamp: number }>()
const CACHE_TTL = 2 * 60 * 1000 // 2 minutes cache

export default function DirectionsMap({
  isOpen,
  onClose,
  userLocation,
  destination
}: DirectionsMapProps) {
  const mapRef = useRef<HTMLDivElement>(null)
  const mapInstanceRef = useRef<L.Map | null>(null)
  const routeLayerRef = useRef<L.LayerGroup | null>(null)
  const trafficLayerRef = useRef<L.TileLayer | null>(null)

  const [travelMode, setTravelMode] = useState<TravelMode>('car')
  const [allRoutes, setAllRoutes] = useState<AllRoutesInfo>({ car: null, bicycle: null, pedestrian: null })
  const [loadingModes, setLoadingModes] = useState<Set<TravelMode>>(new Set())
  const [error, setError] = useState<string | null>(null)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [showInstructions, setShowInstructions] = useState(false)
  const [showTrafficLayer, setShowTrafficLayer] = useState(true)
  const [apiKeyMissing, setApiKeyMissing] = useState(false)
  const [mapReady, setMapReady] = useState(false)

  const currentRoute = allRoutes[travelMode]

  // Generate cache key
  const getCacheKey = useCallback(() => {
    return `${userLocation.lat},${userLocation.lng}-${destination.lat},${destination.lng}`
  }, [userLocation, destination])

  // Initialize map immediately when opened
  useEffect(() => {
    if (!isOpen || !mapRef.current || mapInstanceRef.current) return

    const map = L.map(mapRef.current, {
      center: [userLocation.lat, userLocation.lng],
      zoom: 13,
      zoomControl: true,
    })

    // Add map tiles
    if (TOMTOM_API_KEY) {
      L.tileLayer(`https://api.tomtom.com/map/1/tile/basic/main/{z}/{x}/{y}.png?key=${TOMTOM_API_KEY}&tileSize=256`, {
        attribution: '&copy; TomTom',
        maxZoom: 19,
      }).addTo(map)

      // Add traffic layer
      const trafficLayer = L.tileLayer(
        `https://api.tomtom.com/traffic/map/4/tile/flow/relative0/{z}/{x}/{y}.png?key=${TOMTOM_API_KEY}&tileSize=256`,
        { opacity: 0.7, maxZoom: 19 }
      )
      trafficLayer.addTo(map)
      trafficLayerRef.current = trafficLayer
    } else {
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap',
        maxZoom: 19,
      }).addTo(map)
      setApiKeyMissing(true)
    }

    // Custom markers
    const userIcon = L.divIcon({
      className: 'custom-marker',
      html: `<div style="width:28px;height:28px;background:linear-gradient(135deg,#3B82F6,#1D4ED8);border:3px solid white;border-radius:50%;box-shadow:0 2px 10px rgba(59,130,246,0.5);display:flex;align-items:center;justify-content:center;"><div style="width:10px;height:10px;background:white;border-radius:50%;"></div></div>`,
      iconSize: [28, 28],
      iconAnchor: [14, 14],
    })

    const storeIcon = L.divIcon({
      className: 'custom-marker',
      html: `<div style="width:40px;height:40px;background:linear-gradient(135deg,#10B981,#059669);border:3px solid white;border-radius:50%;box-shadow:0 4px 15px rgba(16,185,129,0.4);display:flex;align-items:center;justify-content:center;"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.5"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg></div>`,
      iconSize: [40, 40],
      iconAnchor: [20, 40],
    })

    L.marker([userLocation.lat, userLocation.lng], { icon: userIcon })
      .addTo(map)
      .bindPopup('<strong>Your Location</strong>')

    L.marker([destination.lat, destination.lng], { icon: storeIcon })
      .addTo(map)
      .bindPopup(`<strong>${destination.name}</strong><br/>${destination.address}`)

    routeLayerRef.current = L.layerGroup().addTo(map)

    const bounds = L.latLngBounds([
      [userLocation.lat, userLocation.lng],
      [destination.lat, destination.lng]
    ])
    map.fitBounds(bounds, { padding: [60, 60] })

    mapInstanceRef.current = map
    setMapReady(true)

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove()
        mapInstanceRef.current = null
        trafficLayerRef.current = null
        setMapReady(false)
      }
    }
  }, [isOpen, userLocation, destination])

  // Toggle traffic layer
  useEffect(() => {
    if (trafficLayerRef.current && mapInstanceRef.current) {
      if (showTrafficLayer) {
        trafficLayerRef.current.addTo(mapInstanceRef.current)
      } else {
        trafficLayerRef.current.remove()
      }
    }
  }, [showTrafficLayer])

  // Fetch routes - optimized with caching and progressive loading
  useEffect(() => {
    if (!isOpen || !mapReady) return

    const cacheKey = getCacheKey()
    const cached = routeCache.get(cacheKey)

    // Use cache if fresh
    if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
      setAllRoutes(cached.data)
      if (cached.data.car?.geometry) {
        drawRouteFromGeometry(cached.data.car.geometry, cached.data.car, 'car')
      }
      return
    }

    // Fetch routes progressively - car first (most common), then others
    fetchRoutesProgressively()
  }, [isOpen, mapReady, userLocation, destination])

  // Draw route when mode changes (instant - uses cached geometry)
  useEffect(() => {
    if (!mapReady || !currentRoute?.geometry) return
    drawRouteFromGeometry(currentRoute.geometry, currentRoute, travelMode)
  }, [travelMode, currentRoute, mapReady])

  const fetchRoutesProgressively = async () => {
    setError(null)
    setLoadingModes(new Set(['car', 'bicycle', 'pedestrian']))

    const results: AllRoutesInfo = { car: null, bicycle: null, pedestrian: null }

    // Fetch car first (priority) - this shows immediately
    try {
      const carRoute = await fetchSingleRoute('car')
      results.car = carRoute
      setAllRoutes({ ...results })
      setLoadingModes(prev => { const next = new Set(prev); next.delete('car'); return next })

      // Draw car route immediately
      if (carRoute.geometry) {
        drawRouteFromGeometry(carRoute.geometry, carRoute, 'car')
      }
    } catch (err) {
      console.error('Failed to fetch car route:', err)
      setLoadingModes(prev => { const next = new Set(prev); next.delete('car'); return next })
    }

    // Fetch bike and walk in parallel (background)
    const [bikeResult, walkResult] = await Promise.allSettled([
      fetchSingleRoute('bicycle'),
      fetchSingleRoute('pedestrian')
    ])

    if (bikeResult.status === 'fulfilled') {
      results.bicycle = bikeResult.value
    }
    setLoadingModes(prev => { const next = new Set(prev); next.delete('bicycle'); return next })

    if (walkResult.status === 'fulfilled') {
      results.pedestrian = walkResult.value
    }
    setLoadingModes(prev => { const next = new Set(prev); next.delete('pedestrian'); return next })

    setAllRoutes(results)

    // Cache results
    routeCache.set(getCacheKey(), { data: results, timestamp: Date.now() })
  }

  const fetchSingleRoute = async (mode: TravelMode): Promise<RouteInfo> => {
    if (TOMTOM_API_KEY) {
      return fetchTomTomRoute(mode)
    }
    return fetchOSRMRoute(mode)
  }

  const fetchTomTomRoute = async (mode: TravelMode): Promise<RouteInfo> => {
    const response = await fetch(
      `https://api.tomtom.com/routing/1/calculateRoute/` +
      `${userLocation.lat},${userLocation.lng}:${destination.lat},${destination.lng}/json` +
      `?key=${TOMTOM_API_KEY}` +
      `&travelMode=${mode}` +
      `&traffic=true` +
      `&computeTravelTimeFor=all`
    )

    if (!response.ok) throw new Error(`TomTom API error: ${response.status}`)

    const data = await response.json()
    if (!data.routes?.[0]) throw new Error('No route found')

    const route = data.routes[0]
    const summary = route.summary

    // Extract geometry immediately
    const geometry: [number, number][] = []
    route.legs?.forEach((leg: any) => {
      leg.points?.forEach((p: any) => geometry.push([p.latitude, p.longitude]))
    })

    // Extract instructions
    const instructions: RouteInstruction[] = route.guidance?.instructions?.map((inst: any) => ({
      instruction: inst.message || inst.maneuver || 'Continue',
      distance: inst.routeOffsetInMeters || 0,
      duration: 0,
      maneuver: inst.maneuver || ''
    })) || [
      { instruction: 'Head towards destination', distance: 0, duration: 0, maneuver: 'start' },
      { instruction: `Arrive at ${destination.name}`, distance: summary.lengthInMeters, duration: summary.travelTimeInSeconds, maneuver: 'arrive' }
    ]

    // Calculate traffic level
    const trafficDelay = Math.max(0, (summary.travelTimeInSeconds || 0) - (summary.noTrafficTravelTimeInSeconds || summary.travelTimeInSeconds || 0))
    const trafficRatio = summary.noTrafficTravelTimeInSeconds > 0
      ? summary.travelTimeInSeconds / summary.noTrafficTravelTimeInSeconds
      : 1

    let trafficLevel: 'low' | 'moderate' | 'heavy' | 'severe' = 'low'
    if (trafficRatio > 1.5) trafficLevel = 'severe'
    else if (trafficRatio > 1.3) trafficLevel = 'heavy'
    else if (trafficRatio > 1.1) trafficLevel = 'moderate'

    const departureTime = new Date()
    const arrivalTime = new Date(departureTime.getTime() + (summary.travelTimeInSeconds * 1000))

    return {
      distance: summary.lengthInMeters,
      duration: summary.noTrafficTravelTimeInSeconds || summary.travelTimeInSeconds,
      durationInTraffic: summary.travelTimeInSeconds,
      trafficDelay,
      instructions,
      departureTime: formatTime(departureTime),
      arrivalTime: formatTime(arrivalTime),
      trafficLevel,
      geometry: geometry.length > 0 ? geometry : null
    }
  }

  const fetchOSRMRoute = async (mode: TravelMode): Promise<RouteInfo> => {
    const profile = mode === 'car' ? 'car' : mode === 'bicycle' ? 'bike' : 'foot'

    const response = await fetch(
      `https://router.project-osrm.org/route/v1/${profile}/` +
      `${userLocation.lng},${userLocation.lat};${destination.lng},${destination.lat}` +
      `?overview=full&geometries=geojson&steps=true`
    )

    if (!response.ok) throw new Error('OSRM API error')

    const data = await response.json()
    if (data.code !== 'Ok' || !data.routes?.[0]) throw new Error('No route found')

    const route = data.routes[0]

    // Convert GeoJSON to [lat, lng] array
    const geometry: [number, number][] = route.geometry?.coordinates?.map(
      (coord: [number, number]) => [coord[1], coord[0]] // GeoJSON is [lng, lat], Leaflet wants [lat, lng]
    ) || null

    const instructions: RouteInstruction[] = route.legs?.[0]?.steps?.map((step: any) => ({
      instruction: step.maneuver?.instruction || 'Continue',
      distance: step.distance || 0,
      duration: step.duration || 0,
      maneuver: step.maneuver?.type || ''
    })) || []

    const departureTime = new Date()
    const arrivalTime = new Date(departureTime.getTime() + (route.duration * 1000))

    return {
      distance: route.distance,
      duration: route.duration,
      durationInTraffic: route.duration,
      trafficDelay: 0,
      instructions: instructions.length > 0 ? instructions : [
        { instruction: 'Head towards destination', distance: 0, duration: 0, maneuver: 'start' },
        { instruction: 'Arrive at destination', distance: route.distance, duration: route.duration, maneuver: 'arrive' }
      ],
      departureTime: formatTime(departureTime),
      arrivalTime: formatTime(arrivalTime),
      trafficLevel: 'low',
      geometry
    }
  }

  // Draw route from cached geometry (instant, no API call)
  const drawRouteFromGeometry = useCallback((
    geometry: [number, number][],
    routeInfo: RouteInfo,
    mode: TravelMode
  ) => {
    if (!routeLayerRef.current || !mapInstanceRef.current) return

    routeLayerRef.current.clearLayers()

    const getRouteColor = () => {
      if (mode === 'car') {
        switch (routeInfo.trafficLevel) {
          case 'severe': return '#DC2626'
          case 'heavy': return '#F97316'
          case 'moderate': return '#EAB308'
          default: return '#3B82F6'
        }
      }
      if (mode === 'bicycle') return '#10B981'
      return '#F59E0B'
    }

    const routeLine = L.polyline(geometry, {
      color: getRouteColor(),
      weight: 6,
      opacity: 0.85,
      lineCap: 'round',
      lineJoin: 'round'
    })

    routeLayerRef.current.addLayer(routeLine)
    mapInstanceRef.current.fitBounds(routeLine.getBounds(), { padding: [60, 60] })
  }, [])

  const formatTime = (date: Date): string => {
    return date.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })
  }

  const formatDistance = (meters: number): string => {
    if (meters < 1000) return `${Math.round(meters)} m`
    return `${(meters / 1000).toFixed(1)} km`
  }

  const formatDuration = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600)
    const minutes = Math.round((seconds % 3600) / 60)
    if (hours > 0) return `${hours}h ${minutes}min`
    return `${minutes} min`
  }

  const getTrafficBadge = (level: string) => {
    const badges: Record<string, JSX.Element> = {
      severe: <span className="px-2 py-0.5 text-xs font-medium rounded-full bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400">Heavy</span>,
      heavy: <span className="px-2 py-0.5 text-xs font-medium rounded-full bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400">Slow</span>,
      moderate: <span className="px-2 py-0.5 text-xs font-medium rounded-full bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400">Moderate</span>,
      low: <span className="px-2 py-0.5 text-xs font-medium rounded-full bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400">Clear</span>
    }
    return badges[level] || badges.low
  }

  const handleRecenter = () => {
    if (mapInstanceRef.current) {
      const bounds = L.latLngBounds([
        [userLocation.lat, userLocation.lng],
        [destination.lat, destination.lng]
      ])
      mapInstanceRef.current.fitBounds(bounds, { padding: [60, 60] })
    }
  }

  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen)
    setTimeout(() => mapInstanceRef.current?.invalidateSize(), 300)
  }

  const getModeIcon = (mode: TravelMode) => {
    const icons = { car: Car, bicycle: Bike, pedestrian: Footprints }
    return icons[mode]
  }

  if (!isOpen) return null

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 z-50 flex items-center justify-center"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        {/* Backdrop */}
        <motion.div
          className="absolute inset-0 bg-black/60 backdrop-blur-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
        />

        {/* Modal */}
        <motion.div
          className={`relative bg-white dark:bg-neutral-900 rounded-2xl shadow-2xl overflow-hidden flex flex-col ${
            isFullscreen ? 'w-full h-full m-0 rounded-none' : 'w-[95vw] max-w-5xl h-[90vh] max-h-[800px] m-4'
          }`}
          initial={{ scale: 0.9, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.9, opacity: 0, y: 20 }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
        >
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-neutral-200 dark:border-neutral-700 bg-gradient-to-r from-primary-500/10 to-accent-500/10">
            <div className="flex items-center space-x-3">
              <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center shadow-lg">
                <Navigation className="h-5 w-5 text-white" />
              </div>
              <div>
                <h2 className="font-semibold text-neutral-900 dark:text-neutral-100">
                  Directions to {destination.name}
                </h2>
                <p className="text-sm text-neutral-500 dark:text-neutral-400">
                  {destination.chain && `${destination.chain} • `}{destination.address}
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              {TOMTOM_API_KEY && (
                <button
                  onClick={() => setShowTrafficLayer(!showTrafficLayer)}
                  className={`p-2 rounded-lg transition-colors ${
                    showTrafficLayer
                      ? 'bg-primary-100 dark:bg-primary-900/30 text-primary-600'
                      : 'hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-600 dark:text-neutral-400'
                  }`}
                  title={showTrafficLayer ? 'Hide traffic' : 'Show traffic'}
                >
                  <Layers className="h-5 w-5" />
                </button>
              )}
              <button
                onClick={toggleFullscreen}
                className="p-2 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
              >
                {isFullscreen ? <Minimize2 className="h-5 w-5 text-neutral-600 dark:text-neutral-400" /> : <Maximize2 className="h-5 w-5 text-neutral-600 dark:text-neutral-400" />}
              </button>
              <button onClick={onClose} className="p-2 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors">
                <X className="h-5 w-5 text-neutral-600 dark:text-neutral-400" />
              </button>
            </div>
          </div>

          {/* API Key Warning */}
          {apiKeyMissing && (
            <div className="px-4 py-2 bg-yellow-50 dark:bg-yellow-900/20 border-b border-yellow-200 dark:border-yellow-800">
              <div className="flex items-center space-x-2 text-yellow-800 dark:text-yellow-200">
                <AlertTriangle className="h-4 w-4" />
                <span className="text-sm">Add VITE_TOMTOM_API_KEY to .env for real-time traffic</span>
              </div>
            </div>
          )}

          {/* Travel Mode Cards */}
          <div className="grid grid-cols-3 gap-3 p-4 border-b border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800/50">
            {(['car', 'bicycle', 'pedestrian'] as const).map((mode) => {
              const Icon = getModeIcon(mode)
              const route = allRoutes[mode]
              const isSelected = travelMode === mode
              const isLoadingMode = loadingModes.has(mode)
              const label = mode === 'car' ? 'Drive' : mode === 'bicycle' ? 'Bike' : 'Walk'

              return (
                <button
                  key={mode}
                  onClick={() => route && setTravelMode(mode)}
                  disabled={!route && !isLoadingMode}
                  className={`relative p-4 rounded-xl transition-all ${
                    isSelected
                      ? 'bg-white dark:bg-neutral-800 shadow-lg ring-2 ring-primary-500'
                      : 'bg-white/50 dark:bg-neutral-800/50 hover:bg-white dark:hover:bg-neutral-800 hover:shadow'
                  } ${!route && !isLoadingMode ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className={`p-2 rounded-lg ${
                      isSelected
                        ? 'bg-primary-100 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400'
                        : 'bg-neutral-100 dark:bg-neutral-700 text-neutral-600 dark:text-neutral-400'
                    }`}>
                      <Icon className="h-5 w-5" />
                    </div>
                    <span className="text-sm font-medium text-neutral-700 dark:text-neutral-300">{label}</span>
                  </div>

                  {isLoadingMode ? (
                    <div className="space-y-2">
                      <div className="h-6 bg-neutral-200 dark:bg-neutral-700 rounded animate-pulse" />
                      <div className="h-4 bg-neutral-200 dark:bg-neutral-700 rounded w-2/3 animate-pulse" />
                    </div>
                  ) : route ? (
                    <div>
                      <div className="flex items-baseline space-x-1">
                        <span className="text-2xl font-bold text-neutral-900 dark:text-neutral-100">
                          {formatDuration(route.durationInTraffic)}
                        </span>
                        {route.trafficDelay > 60 && mode === 'car' && (
                          <span className="text-xs text-red-500 dark:text-red-400">
                            +{formatDuration(route.trafficDelay)}
                          </span>
                        )}
                      </div>
                      <div className="flex items-center justify-between mt-1">
                        <span className="text-sm text-neutral-500 dark:text-neutral-400">
                          {formatDistance(route.distance)}
                        </span>
                        {mode === 'car' && getTrafficBadge(route.trafficLevel)}
                      </div>
                    </div>
                  ) : (
                    <div className="text-sm text-neutral-400">Unavailable</div>
                  )}
                </button>
              )
            })}
          </div>

          {/* Route Summary Bar */}
          {currentRoute && !loadingModes.has(travelMode) && (
            <div className="flex items-center justify-between px-4 py-2 bg-white dark:bg-neutral-900 border-b border-neutral-200 dark:border-neutral-700">
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                  <Zap className="h-4 w-4 text-primary-500" />
                  <span className="text-sm text-neutral-600 dark:text-neutral-400">
                    Depart <strong className="text-neutral-900 dark:text-neutral-100">{currentRoute.departureTime}</strong>
                  </span>
                </div>
                <div className="text-neutral-300 dark:text-neutral-600">→</div>
                <div className="flex items-center space-x-2">
                  <MapPin className="h-4 w-4 text-accent-500" />
                  <span className="text-sm text-neutral-600 dark:text-neutral-400">
                    Arrive <strong className="text-neutral-900 dark:text-neutral-100">{currentRoute.arrivalTime}</strong>
                  </span>
                </div>
              </div>
              <button
                onClick={handleRecenter}
                className="p-2 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
                title="Recenter"
              >
                <RotateCcw className="h-4 w-4 text-neutral-600 dark:text-neutral-400" />
              </button>
            </div>
          )}

          {/* Map Container */}
          <div className="flex-1 relative">
            <div ref={mapRef} className="absolute inset-0" />

            {error && (
              <div className="absolute top-4 left-4 right-4 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-700 rounded-lg p-3 z-[1000]">
                <p className="text-sm text-red-800 dark:text-red-200">{error}</p>
              </div>
            )}

            {/* Instructions Panel */}
            <motion.div
              className="absolute bottom-0 left-0 right-0 bg-white dark:bg-neutral-900 border-t border-neutral-200 dark:border-neutral-700 z-[1000]"
              initial={false}
              animate={{ height: showInstructions ? 'auto' : '48px' }}
            >
              <button
                onClick={() => setShowInstructions(!showInstructions)}
                className="w-full flex items-center justify-between px-4 py-3 hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-colors"
              >
                <span className="text-sm font-medium text-neutral-700 dark:text-neutral-300">
                  Turn-by-turn directions ({currentRoute?.instructions.length || 0} steps)
                </span>
                {showInstructions ? <ChevronDown className="h-4 w-4 text-neutral-500" /> : <ChevronUp className="h-4 w-4 text-neutral-500" />}
              </button>

              <AnimatePresence>
                {showInstructions && currentRoute && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="max-h-48 overflow-y-auto px-4 pb-4"
                  >
                    <ol className="space-y-2">
                      {currentRoute.instructions.map((inst, index) => (
                        <li key={index} className="flex items-start space-x-3 text-sm text-neutral-600 dark:text-neutral-400">
                          <span className="flex-shrink-0 w-6 h-6 rounded-full bg-primary-100 dark:bg-primary-900 text-primary-600 dark:text-primary-400 flex items-center justify-center text-xs font-medium">
                            {index + 1}
                          </span>
                          <div className="flex-1">
                            <span>{inst.instruction}</span>
                            {inst.distance > 0 && (
                              <span className="ml-2 text-neutral-400 dark:text-neutral-500">({formatDistance(inst.distance)})</span>
                            )}
                          </div>
                        </li>
                      ))}
                    </ol>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between px-4 py-3 border-t border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800/50">
            <p className="text-xs text-neutral-500 dark:text-neutral-400">
              {TOMTOM_API_KEY ? 'Map & Traffic © TomTom' : 'Map © OpenStreetMap | Routing by OSRM'}
            </p>
            <div className="flex items-center space-x-2">
              <button onClick={onClose} className="btn btn-outline btn-sm">Close</button>
              <button
                onClick={() => {
                  const mode = travelMode === 'car' ? 'driving' : travelMode === 'bicycle' ? 'bicycling' : 'walking'
                  window.open(`https://www.google.com/maps/dir/?api=1&origin=${userLocation.lat},${userLocation.lng}&destination=${destination.lat},${destination.lng}&travelmode=${mode}`, '_blank')
                }}
                className="btn btn-primary btn-sm"
              >
                <Navigation className="h-4 w-4 mr-1" />
                Google Maps
              </button>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}
