import { useState, useEffect, useRef, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { BrowserMultiFormatReader, NotFoundException, DecodeHintType, BarcodeFormat } from '@zxing/library'
import { X, Camera, Loader2, AlertCircle, CheckCircle, ScanLine, ImageIcon } from 'lucide-react'
import { lookupBarcode, ProductInfo, estimatePrice } from '../services/barcodeService'

/** Check if live camera streaming is available (requires HTTPS or localhost) */
const hasCameraAPI = !!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia)

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
  const [manualBarcode, setManualBarcode] = useState('')

  const videoRef = useRef<HTMLVideoElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const codeReaderRef = useRef<BrowserMultiFormatReader | null>(null)
  const streamRef = useRef<MediaStream | null>(null)

  const stopScanning = useCallback(() => {
    if (codeReaderRef.current) {
      codeReaderRef.current.reset()
      codeReaderRef.current = null
    }
    // Explicitly stop all camera tracks to release the camera
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop())
      streamRef.current = null
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null
    }
    setIsScanning(false)
  }, [])

  const resetState = useCallback(() => {
    setScannedBarcode(null)
    setProductInfo(null)
    setError(null)
    setIsLookingUp(false)
  }, [])

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
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen])

  const checkCameraPermission = async () => {
    try {
      // Permissions API not supported on iOS Safari — go straight to scanning
      if (!navigator.permissions || !navigator.permissions.query) {
        startScanning()
        return
      }
      const result = await navigator.permissions.query({ name: 'camera' as PermissionName })
      setCameraPermission(result.state as 'granted' | 'denied' | 'prompt')

      if (result.state === 'granted') {
        startScanning()
      }
    } catch {
      // Permissions API not supported (common on iOS), try to start scanning directly
      startScanning()
    }
  }

  const startScanning = async () => {
    setError(null)
    setIsScanning(true)

    try {
      // First, get camera access with facingMode constraint for mobile rear camera
      const constraints: MediaStreamConstraints = {
        video: {
          facingMode: { ideal: 'environment' },
          width: { ideal: 1280 },
          height: { ideal: 720 },
        }
      }

      // Get the stream first — this triggers the permission prompt on mobile
      const stream = await navigator.mediaDevices.getUserMedia(constraints)
      streamRef.current = stream

      // Attach stream to video element
      if (videoRef.current) {
        videoRef.current.srcObject = stream
        await videoRef.current.play()
      }

      // Configure ZXing for common barcode formats
      const hints = new Map()
      hints.set(DecodeHintType.POSSIBLE_FORMATS, [
        BarcodeFormat.EAN_13,
        BarcodeFormat.EAN_8,
        BarcodeFormat.UPC_A,
        BarcodeFormat.UPC_E,
        BarcodeFormat.CODE_128,
        BarcodeFormat.CODE_39,
        BarcodeFormat.QR_CODE,
      ])
      hints.set(DecodeHintType.TRY_HARDER, true)

      codeReaderRef.current = new BrowserMultiFormatReader(hints)

      // Decode from the stream we already have, not from a device ID
      codeReaderRef.current.decodeFromStream(stream, videoRef.current!, (result, err) => {
        if (result) {
          const barcode = result.getText()
          setScannedBarcode(barcode)
          stopScanning()
          handleBarcodeScanned(barcode)
        }
        if (err && !(err instanceof NotFoundException)) {
          // Ignore NotFoundException — that just means no barcode in this frame
        }
      })

      setCameraPermission('granted')
    } catch (err: any) {
      setIsScanning(false)

      if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
        setCameraPermission('denied')
        setError('Camera access denied. Please enable camera permissions in your browser settings.')
      } else if (err.name === 'NotFoundError' || err.name === 'DevicesNotFoundError') {
        setError('No camera found on this device.')
      } else if (err.name === 'NotReadableError' || err.name === 'TrackStartError') {
        setError('Camera is in use by another app. Close other camera apps and try again.')
      } else if (err.name === 'OverconstrainedError') {
        // facingMode constraint failed — retry without it (e.g. desktop webcam)
        try {
          const fallbackStream = await navigator.mediaDevices.getUserMedia({ video: true })
          streamRef.current = fallbackStream
          if (videoRef.current) {
            videoRef.current.srcObject = fallbackStream
            await videoRef.current.play()
          }
          const hints = new Map()
          hints.set(DecodeHintType.TRY_HARDER, true)
          codeReaderRef.current = new BrowserMultiFormatReader(hints)
          codeReaderRef.current.decodeFromStream(fallbackStream, videoRef.current!, (result, decErr) => {
            if (result) {
              const barcode = result.getText()
              setScannedBarcode(barcode)
              stopScanning()
              handleBarcodeScanned(barcode)
            }
            if (decErr && !(decErr instanceof NotFoundException)) {
              // ignore
            }
          })
          setCameraPermission('granted')
          setIsScanning(true)
        } catch {
          setError('Failed to access camera. Please try again.')
        }
      } else {
        setError(err.message || 'Failed to access camera. Please try again.')
      }
    }
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
      const price = productInfo.estimatedPrice || estimatePrice(productInfo.category || 'Other')
      onProductFound({
        ...productInfo,
        estimatedPrice: price
      })
      onClose()
    }
  }

  const handleRetry = () => {
    resetState()
    if (hasCameraAPI) {
      startScanning()
    }
  }

  /** Decode barcode from a photo (file input / camera capture fallback) */
  const handleImageCapture = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setError(null)
    setIsLookingUp(true)

    try {
      const hints = new Map()
      hints.set(DecodeHintType.POSSIBLE_FORMATS, [
        BarcodeFormat.EAN_13, BarcodeFormat.EAN_8,
        BarcodeFormat.UPC_A, BarcodeFormat.UPC_E,
        BarcodeFormat.CODE_128, BarcodeFormat.CODE_39,
        BarcodeFormat.QR_CODE,
      ])
      hints.set(DecodeHintType.TRY_HARDER, true)

      const reader = new BrowserMultiFormatReader(hints)
      const img = new Image()
      const url = URL.createObjectURL(file)

      await new Promise<void>((resolve, reject) => {
        img.onload = () => resolve()
        img.onerror = () => reject(new Error('Failed to load image'))
        img.src = url
      })

      // Draw to canvas so ZXing can decode it
      const canvas = document.createElement('canvas')
      canvas.width = img.naturalWidth
      canvas.height = img.naturalHeight
      const ctx = canvas.getContext('2d')!
      ctx.drawImage(img, 0, 0)
      URL.revokeObjectURL(url)

      const result = reader.decodeFromCanvas(canvas)
      const barcode = result.getText()
      setScannedBarcode(barcode)
      setIsLookingUp(false)
      handleBarcodeScanned(barcode)
    } catch {
      setIsLookingUp(false)
      setError('No barcode detected in photo. Try again with a clearer image, or enter the number manually.')
    }

    // Reset file input so the same file can be re-selected
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  /** Manual barcode entry */
  const handleManualSubmit = () => {
    const code = manualBarcode.trim()
    if (code.length >= 8) {
      setScannedBarcode(code)
      handleBarcodeScanned(code)
    }
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
        >
          <motion.div
            className="relative w-full sm:max-w-md bg-white dark:bg-neutral-800 rounded-t-2xl sm:rounded-2xl shadow-2xl overflow-hidden max-h-[90vh] overflow-y-auto"
            initial={{ y: 40, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 40, opacity: 0 }}
            onClick={e => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between p-3 md:p-4 border-b border-neutral-200 dark:border-neutral-700">
              <div className="flex items-center space-x-3">
                <div className="w-9 h-9 md:w-10 md:h-10 bg-primary-100 dark:bg-primary-900/30 rounded-xl flex items-center justify-center">
                  <ScanLine className="w-5 h-5 text-primary-600 dark:text-primary-400" />
                </div>
                <div>
                  <h2 className="text-base md:text-lg font-bold text-neutral-900 dark:text-neutral-100">Scan Barcode</h2>
                  <p className="text-xs md:text-sm text-neutral-500 dark:text-neutral-400">Point camera at product barcode</p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="p-2 hover:bg-neutral-100 dark:hover:bg-neutral-700 rounded-lg transition-colors min-w-[40px] min-h-[40px] flex items-center justify-center"
              >
                <X className="w-5 h-5 text-neutral-500" />
              </button>
            </div>

            {/* Content */}
            <div className="p-3 md:p-4">
              {/* Hidden file input for photo capture fallback */}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                capture="environment"
                className="hidden"
                onChange={handleImageCapture}
              />

              {/* Camera View — live stream when available, photo capture fallback otherwise */}
              {!scannedBarcode && !isLookingUp && (
                <>
                  {hasCameraAPI ? (
                    /* Live camera stream */
                    <div className="relative aspect-[4/3] bg-neutral-900 rounded-xl overflow-hidden">
                      <video
                        ref={videoRef}
                        className="w-full h-full object-cover"
                        playsInline
                        muted
                        autoPlay
                      />

                      {/* Scanning overlay */}
                      {isScanning && (
                        <div className="absolute inset-0 flex items-center justify-center">
                          <div className="relative w-3/4 aspect-[3/2]">
                            <div className="absolute top-0 left-0 w-6 h-6 border-t-4 border-l-4 border-primary-500 rounded-tl-lg" />
                            <div className="absolute top-0 right-0 w-6 h-6 border-t-4 border-r-4 border-primary-500 rounded-tr-lg" />
                            <div className="absolute bottom-0 left-0 w-6 h-6 border-b-4 border-l-4 border-primary-500 rounded-bl-lg" />
                            <div className="absolute bottom-0 right-0 w-6 h-6 border-b-4 border-r-4 border-primary-500 rounded-br-lg" />
                            <motion.div
                              className="absolute left-0 right-0 h-0.5 bg-primary-500 shadow-lg shadow-primary-500/50"
                              animate={{ top: ['10%', '90%', '10%'] }}
                              transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
                            />
                          </div>
                        </div>
                      )}

                      {!isScanning && !error && cameraPermission !== 'denied' && cameraPermission !== 'prompt' && (
                        <div className="absolute inset-0 flex items-center justify-center bg-neutral-900/90">
                          <Loader2 className="w-8 h-8 text-primary-500 animate-spin" />
                        </div>
                      )}

                      {cameraPermission === 'denied' && (
                        <div className="absolute inset-0 flex items-center justify-center bg-neutral-900/90 p-4">
                          <div className="text-center">
                            <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-3" />
                            <p className="text-white text-sm font-medium">Camera access denied</p>
                            <p className="text-neutral-400 text-xs mt-1">
                              Enable camera in your browser or phone settings
                            </p>
                          </div>
                        </div>
                      )}

                      {cameraPermission === 'prompt' && !isScanning && !error && (
                        <div className="absolute inset-0 flex items-center justify-center bg-neutral-900/90">
                          <button
                            onClick={startScanning}
                            className="flex flex-col items-center space-y-3 p-6 active:scale-95 transition-transform"
                          >
                            <div className="w-16 h-16 bg-primary-500 rounded-full flex items-center justify-center shadow-lg shadow-primary-500/30">
                              <Camera className="w-8 h-8 text-white" />
                            </div>
                            <span className="text-white font-medium">Tap to Start Camera</span>
                          </button>
                        </div>
                      )}
                    </div>
                  ) : (
                    /* No camera API — photo capture + manual entry fallback */
                    <div className="space-y-4">
                      <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-xl p-3 text-sm text-amber-800 dark:text-amber-300">
                        Live camera requires HTTPS. Use photo capture or enter the barcode manually.
                      </div>

                      {/* Photo capture button */}
                      <button
                        onClick={() => fileInputRef.current?.click()}
                        className="w-full flex flex-col items-center justify-center space-y-3 p-8 border-2 border-dashed border-neutral-300 dark:border-neutral-600 rounded-xl hover:border-primary-400 dark:hover:border-primary-500 transition-colors active:scale-[0.98]"
                      >
                        <div className="w-16 h-16 bg-primary-100 dark:bg-primary-900/30 rounded-full flex items-center justify-center">
                          <ImageIcon className="w-8 h-8 text-primary-600 dark:text-primary-400" />
                        </div>
                        <div className="text-center">
                          <p className="font-semibold text-neutral-900 dark:text-neutral-100">Take Photo of Barcode</p>
                          <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1">Opens your camera to snap a photo</p>
                        </div>
                      </button>

                      {/* Manual barcode entry */}
                      <div className="flex items-center space-x-2">
                        <div className="flex-1 relative">
                          <input
                            type="text"
                            inputMode="numeric"
                            pattern="[0-9]*"
                            placeholder="Or type barcode number..."
                            value={manualBarcode}
                            onChange={e => setManualBarcode(e.target.value.replace(/\D/g, ''))}
                            onKeyDown={e => e.key === 'Enter' && handleManualSubmit()}
                            className="w-full px-4 py-3 border border-neutral-300 dark:border-neutral-600 rounded-xl bg-white dark:bg-neutral-700 text-neutral-900 dark:text-neutral-100 text-base placeholder:text-neutral-400"
                          />
                        </div>
                        <button
                          onClick={handleManualSubmit}
                          disabled={manualBarcode.trim().length < 8}
                          className="px-5 py-3 bg-primary-500 text-white rounded-xl font-medium disabled:opacity-40 disabled:cursor-not-allowed hover:bg-primary-600 transition-colors min-h-[44px] active:scale-95"
                        >
                          Look Up
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Photo capture button below live camera (as secondary option) */}
                  {hasCameraAPI && (
                    <button
                      onClick={() => fileInputRef.current?.click()}
                      className="mt-3 w-full flex items-center justify-center space-x-2 py-2.5 text-sm text-neutral-600 dark:text-neutral-400 hover:text-primary-600 dark:hover:text-primary-400 transition-colors min-h-[44px]"
                    >
                      <ImageIcon className="w-4 h-4" />
                      <span>Use photo instead</span>
                    </button>
                  )}
                </>
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
            <div className="p-3 md:p-4 border-t border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-900/50">
              <div className="flex space-x-3">
                {productInfo && !isLookingUp && (
                  <>
                    <button
                      onClick={handleRetry}
                      className="flex-1 px-4 py-2.5 border border-neutral-300 dark:border-neutral-600 rounded-lg text-neutral-700 dark:text-neutral-300 font-medium hover:bg-neutral-100 dark:hover:bg-neutral-700 transition-colors min-h-[44px] active:scale-95"
                    >
                      Scan Again
                    </button>
                    <button
                      onClick={handleConfirm}
                      className="flex-1 px-4 py-2.5 bg-primary-500 text-white rounded-lg font-medium hover:bg-primary-600 transition-colors min-h-[44px] active:scale-95"
                    >
                      {productInfo.name ? 'Add Item' : 'Add Manually'}
                    </button>
                  </>
                )}
                {!productInfo && !isLookingUp && error && (
                  <button
                    onClick={handleRetry}
                    className="flex-1 px-4 py-2.5 bg-primary-500 text-white rounded-lg font-medium hover:bg-primary-600 transition-colors min-h-[44px] active:scale-95"
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
