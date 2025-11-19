import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { BrowserMultiFormatReader, NotFoundException } from '@zxing/library'
import { X, Camera, Loader2, AlertCircle, CheckCircle, ScanLine } from 'lucide-react'
import { lookupBarcode, ProductInfo, estimatePrice } from '../services/barcodeService'

interface BarcodeScannerProps {
  isOpen: boolean
  onClose: () => void
  onProductFound: (product: ProductInfo & { estimatedPrice?: number }) => void
}

export default function BarcodeScanner({ isOpen, onClose, onProductFound }: BarcodeScannerProps) {
  const [isScanning, setIsScanning] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [scannedBarcode, setScannedBarcode] = useState<string | null>(null)
  const [isLookingUp, setIsLookingUp] = useState(false)
  const [productInfo, setProductInfo] = useState<ProductInfo | null>(null)
  const [cameraPermission, setCameraPermission] = useState<'granted' | 'denied' | 'prompt'>('prompt')

  const videoRef = useRef<HTMLVideoElement>(null)
  const codeReaderRef = useRef<BrowserMultiFormatReader | null>(null)

  useEffect(() => {
    if (isOpen) {
      checkCameraPermission()
    } else {
      stopScanning()
      resetState()
    }

    return () => {
      stopScanning()
    }
  }, [isOpen])

  const checkCameraPermission = async () => {
    try {
      const result = await navigator.permissions.query({ name: 'camera' as PermissionName })
      setCameraPermission(result.state as 'granted' | 'denied' | 'prompt')

      if (result.state === 'granted') {
        startScanning()
      }
    } catch {
      // Permissions API not supported, try to start scanning directly
      startScanning()
    }
  }

  const startScanning = async () => {
    setError(null)
    setIsScanning(true)

    try {
      codeReaderRef.current = new BrowserMultiFormatReader()

      const videoInputDevices = await codeReaderRef.current.listVideoInputDevices()

      if (videoInputDevices.length === 0) {
        throw new Error('No camera found on this device')
      }

      // Prefer back camera on mobile devices
      const backCamera = videoInputDevices.find(device =>
        device.label.toLowerCase().includes('back') ||
        device.label.toLowerCase().includes('rear')
      )
      const selectedDeviceId = backCamera?.deviceId || videoInputDevices[0].deviceId

      await codeReaderRef.current.decodeFromVideoDevice(
        selectedDeviceId,
        videoRef.current!,
        async (result, err) => {
          if (result) {
            const barcode = result.getText()
            setScannedBarcode(barcode)
            stopScanning()
            await handleBarcodeScanned(barcode)
          }
          if (err && !(err instanceof NotFoundException)) {
            console.error('Scanning error:', err)
          }
        }
      )

      setCameraPermission('granted')
    } catch (err: any) {
      console.error('Camera error:', err)
      setIsScanning(false)

      if (err.name === 'NotAllowedError') {
        setCameraPermission('denied')
        setError('Camera access denied. Please enable camera permissions in your browser settings.')
      } else if (err.name === 'NotFoundError') {
        setError('No camera found on this device.')
      } else {
        setError(err.message || 'Failed to access camera. Please try again.')
      }
    }
  }

  const stopScanning = () => {
    if (codeReaderRef.current) {
      codeReaderRef.current.reset()
      codeReaderRef.current = null
    }
    setIsScanning(false)
  }

  const resetState = () => {
    setScannedBarcode(null)
    setProductInfo(null)
    setError(null)
    setIsLookingUp(false)
  }

  const handleBarcodeScanned = async (barcode: string) => {
    setIsLookingUp(true)
    setError(null)

    const result = await lookupBarcode(barcode)

    setIsLookingUp(false)

    if (result.found && result.product) {
      setProductInfo(result.product)
    } else {
      setError(result.error || 'Product not found')
      // Allow manual entry with just the barcode
      setProductInfo({
        barcode,
        name: '',
        category: 'Other'
      })
    }
  }

  const handleConfirm = () => {
    if (productInfo) {
      const price = estimatePrice(productInfo.category || 'Other')
      onProductFound({
        ...productInfo,
        estimatedPrice: price
      })
      onClose()
    }
  }

  const handleRetry = () => {
    resetState()
    startScanning()
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
        >
          <motion.div
            className="relative w-full max-w-md bg-white dark:bg-neutral-800 rounded-2xl shadow-2xl overflow-hidden"
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            onClick={e => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-neutral-200 dark:border-neutral-700">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-primary-100 dark:bg-primary-900/30 rounded-xl flex items-center justify-center">
                  <ScanLine className="w-5 h-5 text-primary-600 dark:text-primary-400" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-neutral-900 dark:text-neutral-100">Scan Barcode</h2>
                  <p className="text-sm text-neutral-500 dark:text-neutral-400">Point camera at product barcode</p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="p-2 hover:bg-neutral-100 dark:hover:bg-neutral-700 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-neutral-500" />
              </button>
            </div>

            {/* Content */}
            <div className="p-4">
              {/* Camera View */}
              {!scannedBarcode && (
                <div className="relative aspect-[4/3] bg-neutral-900 rounded-xl overflow-hidden">
                  <video
                    ref={videoRef}
                    className="w-full h-full object-cover"
                    playsInline
                    muted
                  />

                  {/* Scanning overlay */}
                  {isScanning && (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="relative w-3/4 aspect-[3/2]">
                        {/* Corner markers */}
                        <div className="absolute top-0 left-0 w-6 h-6 border-t-4 border-l-4 border-primary-500 rounded-tl-lg" />
                        <div className="absolute top-0 right-0 w-6 h-6 border-t-4 border-r-4 border-primary-500 rounded-tr-lg" />
                        <div className="absolute bottom-0 left-0 w-6 h-6 border-b-4 border-l-4 border-primary-500 rounded-bl-lg" />
                        <div className="absolute bottom-0 right-0 w-6 h-6 border-b-4 border-r-4 border-primary-500 rounded-br-lg" />

                        {/* Scanning line animation */}
                        <motion.div
                          className="absolute left-0 right-0 h-0.5 bg-primary-500 shadow-lg shadow-primary-500/50"
                          animate={{ top: ['10%', '90%', '10%'] }}
                          transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
                        />
                      </div>
                    </div>
                  )}

                  {/* Permission denied message */}
                  {cameraPermission === 'denied' && (
                    <div className="absolute inset-0 flex items-center justify-center bg-neutral-900/90 p-4">
                      <div className="text-center">
                        <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-3" />
                        <p className="text-white text-sm">Camera access denied</p>
                        <p className="text-neutral-400 text-xs mt-1">
                          Enable camera in browser settings
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Request permission button */}
                  {cameraPermission === 'prompt' && !isScanning && !error && (
                    <div className="absolute inset-0 flex items-center justify-center bg-neutral-900/90">
                      <button
                        onClick={startScanning}
                        className="flex flex-col items-center space-y-3 p-6"
                      >
                        <div className="w-16 h-16 bg-primary-500 rounded-full flex items-center justify-center">
                          <Camera className="w-8 h-8 text-white" />
                        </div>
                        <span className="text-white font-medium">Start Camera</span>
                      </button>
                    </div>
                  )}
                </div>
              )}

              {/* Looking up product */}
              {isLookingUp && (
                <div className="py-8 text-center">
                  <Loader2 className="w-10 h-10 text-primary-500 animate-spin mx-auto mb-4" />
                  <p className="text-neutral-600 dark:text-neutral-400">Looking up product...</p>
                  <p className="text-sm text-neutral-500 dark:text-neutral-500 mt-1">
                    Barcode: {scannedBarcode}
                  </p>
                </div>
              )}

              {/* Product found */}
              {productInfo && !isLookingUp && (
                <div className="space-y-4">
                  {productInfo.name ? (
                    <div className="flex items-start space-x-4">
                      {productInfo.imageUrl ? (
                        <img
                          src={productInfo.imageUrl}
                          alt={productInfo.name}
                          className="w-20 h-20 rounded-lg object-cover bg-neutral-100"
                        />
                      ) : (
                        <div className="w-20 h-20 rounded-lg bg-neutral-100 dark:bg-neutral-700 flex items-center justify-center">
                          <ScanLine className="w-8 h-8 text-neutral-400" />
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center space-x-2">
                          <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
                          <span className="text-sm font-medium text-green-600 dark:text-green-400">Product found!</span>
                        </div>
                        <h3 className="font-bold text-neutral-900 dark:text-neutral-100 mt-1 line-clamp-2">
                          {productInfo.name}
                        </h3>
                        {productInfo.brand && (
                          <p className="text-sm text-neutral-600 dark:text-neutral-400">{productInfo.brand}</p>
                        )}
                        <div className="flex items-center space-x-2 mt-2">
                          <span className="px-2 py-0.5 bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300 text-xs font-medium rounded-full">
                            {productInfo.category}
                          </span>
                          {productInfo.quantity && (
                            <span className="text-xs text-neutral-500">{productInfo.quantity}</span>
                          )}
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-4">
                      <AlertCircle className="w-10 h-10 text-amber-500 mx-auto mb-3" />
                      <p className="font-medium text-neutral-900 dark:text-neutral-100">Product not in database</p>
                      <p className="text-sm text-neutral-500 mt-1">
                        Barcode: {scannedBarcode}
                      </p>
                      <p className="text-sm text-neutral-600 dark:text-neutral-400 mt-2">
                        You can add this item manually
                      </p>
                    </div>
                  )}

                  {/* Nutrition info if available */}
                  {productInfo.nutritionInfo && productInfo.nutritionInfo.calories && (
                    <div className="bg-neutral-50 dark:bg-neutral-700/50 rounded-lg p-3">
                      <p className="text-xs font-semibold text-neutral-600 dark:text-neutral-400 uppercase tracking-wide mb-2">
                        Nutrition per 100g
                      </p>
                      <div className="grid grid-cols-4 gap-2 text-center">
                        <div>
                          <p className="text-lg font-bold text-neutral-900 dark:text-neutral-100">
                            {Math.round(productInfo.nutritionInfo.calories || 0)}
                          </p>
                          <p className="text-xs text-neutral-500">kcal</p>
                        </div>
                        <div>
                          <p className="text-lg font-bold text-neutral-900 dark:text-neutral-100">
                            {productInfo.nutritionInfo.protein?.toFixed(1) || '-'}
                          </p>
                          <p className="text-xs text-neutral-500">protein</p>
                        </div>
                        <div>
                          <p className="text-lg font-bold text-neutral-900 dark:text-neutral-100">
                            {productInfo.nutritionInfo.carbs?.toFixed(1) || '-'}
                          </p>
                          <p className="text-xs text-neutral-500">carbs</p>
                        </div>
                        <div>
                          <p className="text-lg font-bold text-neutral-900 dark:text-neutral-100">
                            {productInfo.nutritionInfo.fat?.toFixed(1) || '-'}
                          </p>
                          <p className="text-xs text-neutral-500">fat</p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Error message */}
              {error && !productInfo && (
                <div className="text-center py-6">
                  <AlertCircle className="w-10 h-10 text-red-500 mx-auto mb-3" />
                  <p className="text-red-600 dark:text-red-400 font-medium">{error}</p>
                </div>
              )}
            </div>

            {/* Footer actions */}
            <div className="p-4 border-t border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-900/50">
              <div className="flex space-x-3">
                {productInfo && !isLookingUp && (
                  <>
                    <button
                      onClick={handleRetry}
                      className="flex-1 px-4 py-2.5 border border-neutral-300 dark:border-neutral-600 rounded-lg text-neutral-700 dark:text-neutral-300 font-medium hover:bg-neutral-100 dark:hover:bg-neutral-700 transition-colors"
                    >
                      Scan Again
                    </button>
                    <button
                      onClick={handleConfirm}
                      className="flex-1 px-4 py-2.5 bg-primary-500 text-white rounded-lg font-medium hover:bg-primary-600 transition-colors"
                    >
                      {productInfo.name ? 'Add Item' : 'Add Manually'}
                    </button>
                  </>
                )}
                {!productInfo && !isLookingUp && error && (
                  <button
                    onClick={handleRetry}
                    className="flex-1 px-4 py-2.5 bg-primary-500 text-white rounded-lg font-medium hover:bg-primary-600 transition-colors"
                  >
                    Try Again
                  </button>
                )}
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
