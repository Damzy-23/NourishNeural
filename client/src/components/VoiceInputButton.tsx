import { useState } from 'react'
import { Mic, MicOff, Check, X, Loader2 } from 'lucide-react'
import { useVoiceInput } from '../hooks/useVoiceInput'
import { cn } from '../utils/cn'

interface VoiceInputButtonProps {
  onCommand: (command: { action: string; item: string; quantity: number; unit: string }) => void
  className?: string
  context?: 'pantry' | 'grocery' | 'ai'
}

export default function VoiceInputButton({ onCommand, className, context }: VoiceInputButtonProps) {
  const { isListening, transcript, isSupported, parsedCommand, startListening, stopListening, resetTranscript } = useVoiceInput()
  const [showConfirm, setShowConfirm] = useState(false)

  if (!isSupported) return null

  const handleConfirm = () => {
    if (parsedCommand && parsedCommand.item) {
      const action = context === 'grocery' ? 'add_grocery'
        : context === 'ai' ? 'ask_ai'
        : parsedCommand.action
      onCommand({
        action,
        item: parsedCommand.item,
        quantity: parsedCommand.quantity || 1,
        unit: parsedCommand.unit || 'pieces',
      })
    }
    setShowConfirm(false)
    resetTranscript()
  }

  const handleCancel = () => {
    setShowConfirm(false)
    resetTranscript()
  }

  const handleMicClick = () => {
    if (isListening) {
      stopListening()
      if (transcript) {
        setShowConfirm(true)
      }
    } else {
      setShowConfirm(false)
      startListening()
    }
  }

  return (
    <div className={cn('relative inline-flex items-center gap-2', className)}>
      {/* Mic button */}
      <button
        type="button"
        onClick={handleMicClick}
        className={cn(
          'relative flex items-center justify-center w-10 h-10 rounded-full transition-all duration-200',
          isListening
            ? 'bg-red-500 text-white shadow-lg shadow-red-500/30 animate-pulse'
            : 'bg-primary-100 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400 hover:bg-primary-200 dark:hover:bg-primary-800/40'
        )}
        title={isListening ? 'Stop listening' : 'Voice input'}
      >
        {isListening ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
        {isListening && (
          <span className="absolute -inset-1 rounded-full border-2 border-red-400 animate-ping opacity-30" />
        )}
      </button>

      {/* Live transcript */}
      {isListening && transcript && (
        <div className="absolute top-full left-0 mt-2 z-50 w-64 bg-white dark:bg-neutral-800 rounded-lg shadow-xl border border-neutral-200 dark:border-neutral-700 p-3">
          <div className="flex items-center gap-2 mb-1">
            <Loader2 className="w-3 h-3 animate-spin text-red-500" />
            <span className="text-xs font-medium text-red-500">Listening...</span>
          </div>
          <p className="text-sm text-neutral-700 dark:text-neutral-300 italic">"{transcript}"</p>
        </div>
      )}

      {/* Confirm dialog */}
      {showConfirm && parsedCommand && (
        <div className="absolute top-full left-0 mt-2 z-50 w-72 bg-white dark:bg-neutral-800 rounded-lg shadow-xl border border-neutral-200 dark:border-neutral-700 p-4">
          <p className="text-xs text-neutral-500 dark:text-neutral-400 mb-2">I heard:</p>
          <p className="text-sm font-medium text-neutral-800 dark:text-neutral-200 mb-3">
            "{parsedCommand.raw}"
          </p>
          <div className="bg-neutral-50 dark:bg-neutral-900 rounded-md p-2 mb-3 text-sm">
            <div className="flex justify-between">
              <span className="text-neutral-500">Item:</span>
              <span className="font-medium text-neutral-800 dark:text-neutral-200">{parsedCommand.item}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-neutral-500">Qty:</span>
              <span className="font-medium text-neutral-800 dark:text-neutral-200">{parsedCommand.quantity} {parsedCommand.unit}</span>
            </div>
          </div>
          <div className="flex gap-2">
            <button
              onClick={handleConfirm}
              className="flex-1 flex items-center justify-center gap-1 bg-primary-500 text-white text-sm py-1.5 rounded-md hover:bg-primary-600 transition-colors"
            >
              <Check className="w-4 h-4" /> Confirm
            </button>
            <button
              onClick={handleCancel}
              className="flex-1 flex items-center justify-center gap-1 bg-neutral-200 dark:bg-neutral-700 text-neutral-700 dark:text-neutral-300 text-sm py-1.5 rounded-md hover:bg-neutral-300 dark:hover:bg-neutral-600 transition-colors"
            >
              <X className="w-4 h-4" /> Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
