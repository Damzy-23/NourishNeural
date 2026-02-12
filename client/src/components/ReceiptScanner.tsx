import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { createWorker } from 'tesseract.js'
import {
    X,
    Upload,
    Camera,
    CheckCircle,
    FileText,
    Trash2,
    Receipt
} from 'lucide-react'

interface ScannedItem {
    name: string
    price?: number
}

interface ReceiptScannerProps {
    isOpen: boolean
    onClose: () => void
    onItemsFound: (items: ScannedItem[]) => void
}

export default function ReceiptScanner({ isOpen, onClose, onItemsFound }: ReceiptScannerProps) {
    const [isProcessing, setIsProcessing] = useState(false)
    const [progress, setProgress] = useState(0)
    const [statusText, setStatusText] = useState('Initializing...')
    const [error, setError] = useState<string | null>(null)
    const [scannedItems, setScannedItems] = useState<ScannedItem[]>([])
    const [receiptImage, setReceiptImage] = useState<string | null>(null)
    const fileInputRef = useRef<HTMLInputElement>(null)

    // Reset state when opening/closing
    useEffect(() => {
        if (!isOpen) {
            setScannedItems([])
            setReceiptImage(null)
            setError(null)
            setIsProcessing(false)
            setProgress(0)
        }
    }, [isOpen])

    const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0]
        if (file) {
            const reader = new FileReader()
            reader.onload = (e) => {
                setReceiptImage(e.target?.result as string)
                processReceipt(file)
            }
            reader.readAsDataURL(file)
        }
    }

    const processReceipt = async (imageFile: File) => {
        setIsProcessing(true)
        setError(null)
        setProgress(0)
        setStatusText('Loading OCR engine...')

        try {
            const worker = await createWorker('eng', 1, {
                logger: m => {
                    if (m.status === 'recognizing text') {
                        setProgress(Math.round(m.progress * 100))
                        setStatusText(`Reading receipt... ${Math.round(m.progress * 100)}%`)
                    }
                }
            })

            setStatusText('Recognizing text...')

            const { data: { text } } = await worker.recognize(imageFile)

            setStatusText('Parsing items...')
            const items = parseReceiptText(text)

            setScannedItems(items)
            await worker.terminate()
            setIsProcessing(false)

            if (items.length === 0) {
                setError('Could not identify any items. Please try a clearer image or add manually.')
            }
        } catch (err) {
            console.error('OCR Error:', err)
            setError('Failed to process receipt. Please try again.')
            setIsProcessing(false)
        }
    }

    // Heuristic parser for receipt text
    const parseReceiptText = (text: string): ScannedItem[] => {
        const lines = text.split('\n')
        const items: ScannedItem[] = []

        // Regex looking for lines that end with a price: "Item Name ... 1.99"
        // Supports £, $, or just numbers. Robust against OCR errors like 'l' for '1'.
        const priceRegex = /([£$]?)(\d+[.,]\d{2})/

        // Keywords to ignore (common receipt garbage)
        const ignoreKeywords = [
            'total', 'subtotal', 'change', 'cash', 'card', 'visa', 'mastercard',
            'thank', 'visit', 'vat', 'tax', 'balance', 'items', 'count'
        ]

        for (const line of lines) {
            const cleanLine = line.trim()
            if (cleanLine.length < 5) continue

            const lowerLine = cleanLine.toLowerCase()
            if (ignoreKeywords.some(keyword => lowerLine.includes(keyword))) continue

            const priceMatch = cleanLine.match(priceRegex)

            if (priceMatch) {
                // Assume everything before the price matches is the item name
                const namePart = cleanLine.substring(0, priceMatch.index).trim()

                // Clean up name (remove leading quantities like '1x', special chars)
                const cleanName = namePart.replace(/^[\d]+[xX]\s*/, '').replace(/[^a-zA-Z0-9\s&'-]/g, '').trim()

                if (cleanName.length > 2) {
                    const priceValue = parseFloat(priceMatch[2].replace(',', '.'))
                    items.push({
                        name: cleanName,
                        price: priceValue
                    })
                }
            }
        }

        return items
    }

    const removeItem = (index: number) => {
        setScannedItems(items => items.filter((_, i) => i !== index))
    }

    const handleConfirm = () => {
        onItemsFound(scannedItems)
        onClose()
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
                        className="relative w-full max-w-2xl bg-white dark:bg-neutral-800 rounded-3xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col"
                        initial={{ scale: 0.9, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0.9, opacity: 0 }}
                        onClick={e => e.stopPropagation()}
                    >
                        {/* Header */}
                        <div className="flex items-center justify-between p-6 border-b border-neutral-200 dark:border-neutral-700 bg-white/50 dark:bg-neutral-800/50 backdrop-blur-md sticky top-0 z-10">
                            <div className="flex items-center space-x-3">
                                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-500/20">
                                    <Receipt className="w-6 h-6 text-white" />
                                </div>
                                <div>
                                    <h2 className="text-xl font-bold text-neutral-900 dark:text-neutral-100">Scan Receipt</h2>
                                    <p className="text-sm text-neutral-500 dark:text-neutral-400">AI-powered receipt parser</p>
                                </div>
                            </div>
                            <button
                                onClick={onClose}
                                className="p-2 hover:bg-neutral-100 dark:hover:bg-neutral-700 rounded-full transition-colors"
                            >
                                <X className="w-6 h-6 text-neutral-500" />
                            </button>
                        </div>

                        {/* Content */}
                        <div className="p-6 overflow-y-auto flex-1">
                            {!receiptImage ? (
                                <div className="flex flex-col items-center justify-center py-12 border-2 border-dashed border-neutral-300 dark:border-neutral-600 rounded-3xl bg-neutral-50 dark:bg-neutral-900/30">
                                    <div className="w-20 h-20 bg-blue-50 dark:bg-blue-900/20 rounded-full flex items-center justify-center mb-6">
                                        <Camera className="w-10 h-10 text-blue-500" />
                                    </div>
                                    <h3 className="text-xl font-bold text-neutral-900 dark:text-neutral-100 mb-2">Upload Receipt Photo</h3>
                                    <p className="text-neutral-500 text-center max-w-xs mb-8">
                                        Take a clear photo of your grocery receipt. We'll extract the items automatically.
                                    </p>

                                    <input
                                        type="file"
                                        accept="image/*"
                                        className="hidden"
                                        ref={fileInputRef}
                                        onChange={handleFileUpload}
                                    />

                                    <div className="flex gap-4">
                                        <button
                                            onClick={() => fileInputRef.current?.click()}
                                            className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl shadow-lg transition-all transform hover:scale-105 active:scale-95 flex items-center gap-2"
                                        >
                                            <Upload className="w-5 h-5" />
                                            Select Image
                                        </button>
                                        {/* Camera capture could be added here if needed, but file input handles mobile camera usually */}
                                    </div>
                                </div>
                            ) : (
                                <div className="space-y-6">
                                    {/* Processing State */}
                                    {isProcessing && (
                                        <div className="flex flex-col items-center justify-center py-12">
                                            <div className="relative w-24 h-24 mb-6">
                                                <svg className="w-full h-full transform -rotate-90">
                                                    <circle
                                                        className="text-neutral-200 dark:text-neutral-700"
                                                        strokeWidth="8"
                                                        stroke="currentColor"
                                                        fill="transparent"
                                                        r="40"
                                                        cx="48"
                                                        cy="48"
                                                    />
                                                    <circle
                                                        className="text-blue-500 transition-all duration-300 ease-out"
                                                        strokeWidth="8"
                                                        strokeDasharray={251.2}
                                                        strokeDashoffset={251.2 - (progress / 100 * 251.2)}
                                                        strokeLinecap="round"
                                                        stroke="currentColor"
                                                        fill="transparent"
                                                        r="40"
                                                        cx="48"
                                                        cy="48"
                                                    />
                                                </svg>
                                                <div className="absolute inset-0 flex items-center justify-center text-lg font-bold text-blue-600">
                                                    {progress}%
                                                </div>
                                            </div>
                                            <h3 className="text-xl font-bold text-neutral-900 dark:text-neutral-100 mb-2">{statusText}</h3>
                                            <p className="text-neutral-500">This might take a few seconds...</p>
                                        </div>
                                    )}

                                    {/* Results State */}
                                    {!isProcessing && (
                                        <div className="grid md:grid-cols-2 gap-6">
                                            <div className="space-y-4">
                                                <h3 className="font-semibold text-neutral-900 dark:text-neutral-100 flex items-center gap-2">
                                                    <FileText className="w-4 h-4 text-blue-500" />
                                                    Parsed Items ({scannedItems.length})
                                                </h3>

                                                {scannedItems.length > 0 ? (
                                                    <div className="space-y-2 max-h-[400px] overflow-y-auto pr-2">
                                                        {scannedItems.map((item, idx) => (
                                                            <motion.div
                                                                key={idx}
                                                                initial={{ opacity: 0, x: -20 }}
                                                                animate={{ opacity: 1, x: 0 }}
                                                                transition={{ delay: idx * 0.05 }}
                                                                className="flex items-center justify-between p-3 bg-neutral-50 dark:bg-neutral-700/50 rounded-xl border border-neutral-100 dark:border-neutral-700 hover:border-blue-200 dark:hover:border-blue-800 transition-colors group"
                                                            >
                                                                <div>
                                                                    <p className="font-medium text-neutral-900 dark:text-neutral-100">{item.name}</p>
                                                                    {item.price && (
                                                                        <p className="text-sm text-neutral-500">£{item.price.toFixed(2)}</p>
                                                                    )}
                                                                </div>
                                                                <button
                                                                    onClick={() => removeItem(idx)}
                                                                    className="p-2 text-neutral-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg opacity-0 group-hover:opacity-100 transition-all"
                                                                >
                                                                    <Trash2 className="w-4 h-4" />
                                                                </button>
                                                            </motion.div>
                                                        ))}
                                                    </div>
                                                ) : (
                                                    <div className="text-center py-8 bg-neutral-50 dark:bg-neutral-900/30 rounded-2xl border-2 border-dashed border-neutral-200 dark:border-neutral-700">
                                                        <p className="text-neutral-500 mb-2">No items found</p>
                                                        {error && <p className="text-red-500 text-sm px-4">{error}</p>}
                                                    </div>
                                                )}
                                            </div>

                                            {/* Image Preview */}
                                            <div className="relative rounded-2xl overflow-hidden bg-neutral-900 aspect-[3/4] md:aspect-auto">
                                                <img
                                                    src={receiptImage}
                                                    alt="Receipt"
                                                    className="w-full h-full object-contain"
                                                />
                                                <div className="absolute inset-x-0 bottom-0 p-4 bg-gradient-to-t from-black/80 to-transparent">
                                                    <button
                                                        onClick={() => {
                                                            setReceiptImage(null)
                                                            setScannedItems([])
                                                        }}
                                                        className="text-white text-sm hover:underline"
                                                    >
                                                        Retake Photo
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>

                        {/* Footer */}
                        {scannedItems.length > 0 && !isProcessing && (
                            <div className="p-6 border-t border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-900/50 flex justify-end gap-3 sticky bottom-0">
                                <button
                                    onClick={() => setReceiptImage(null)}
                                    className="px-6 py-2.5 text-neutral-600 dark:text-neutral-300 font-medium hover:bg-neutral-200 dark:hover:bg-neutral-700 rounded-xl transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleConfirm}
                                    className="px-6 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl hover:scale-105 active:scale-95 transition-all flex items-center gap-2"
                                >
                                    <CheckCircle className="w-5 h-5" />
                                    Add {scannedItems.length} Items to Pantry
                                </button>
                            </div>
                        )}
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    )
}
