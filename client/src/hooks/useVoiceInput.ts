import { useState, useCallback, useRef, useEffect } from 'react'

interface ParsedVoiceCommand {
  action: 'add_pantry' | 'add_grocery' | 'ask_ai' | 'unknown'
  item?: string
  quantity?: number
  unit?: string
  raw: string
}

interface UseVoiceInputReturn {
  isListening: boolean
  transcript: string
  isSupported: boolean
  parsedCommand: ParsedVoiceCommand | null
  startListening: () => void
  stopListening: () => void
  resetTranscript: () => void
}

const UNIT_MAP: Record<string, string> = {
  kilo: 'kg', kilos: 'kg', kilogram: 'kg', kilograms: 'kg',
  gram: 'g', grams: 'g',
  litre: 'litres', litres: 'litres', liter: 'litres', liters: 'litres',
  millilitre: 'ml', millilitres: 'ml',
  pack: 'packs', packs: 'packs', packet: 'packs', packets: 'packs',
  piece: 'pieces', pieces: 'pieces',
  tin: 'tins', tins: 'tins', can: 'tins', cans: 'tins',
  bottle: 'bottles', bottles: 'bottles',
  bag: 'bags', bags: 'bags',
  bunch: 'bunches', bunches: 'bunches',
  dozen: 'dozen', box: 'boxes', boxes: 'boxes',
  slice: 'slices', slices: 'slices',
  loaf: 'loaves', loaves: 'loaves',
}

const NUMBER_WORDS: Record<string, number> = {
  one: 1, two: 2, three: 3, four: 4, five: 5,
  six: 6, seven: 7, eight: 8, nine: 9, ten: 10,
  a: 1, an: 1, some: 2,
}

function parseVoiceCommand(transcript: string): ParsedVoiceCommand {
  const raw = transcript.trim()
  const lower = raw.toLowerCase()

  // Determine target
  let action: ParsedVoiceCommand['action'] = 'unknown'
  if (/(?:add|put|stick).+(?:pantry|fridge|cupboard|freezer)/i.test(lower)) {
    action = 'add_pantry'
  } else if (/(?:add|put|stick).+(?:shopping|grocery|list)/i.test(lower)) {
    action = 'add_grocery'
  } else if (/(?:add|put)\s/i.test(lower)) {
    action = 'add_pantry' // default add target
  } else {
    action = 'ask_ai'
  }

  // Extract quantity + unit + item name
  // Pattern: "add (number/word) (unit) (of)? (item) to (target)"
  const addPattern = /(?:add|put|stick)\s+(\d+|one|two|three|four|five|six|seven|eight|nine|ten|a|an|some)?\s*(kg|kilos?|grams?|litres?|liters?|ml|packs?|packets?|pieces?|tins?|cans?|bottles?|bags?|bunche?s?|dozen|boxes?|slices?|loave?s?)?\s*(?:of\s+)?(.+?)(?:\s+(?:to|on|in)\s+(?:my\s+)?(?:pantry|fridge|shopping|grocery|list|cupboard|freezer))?$/i
  const match = lower.match(addPattern)

  let quantity = 1
  let unit = 'pieces'
  let item = raw

  if (match) {
    // Quantity
    if (match[1]) {
      const num = parseInt(match[1])
      quantity = isNaN(num) ? (NUMBER_WORDS[match[1]] || 1) : num
    }
    // Unit
    if (match[2]) {
      unit = UNIT_MAP[match[2].toLowerCase()] || match[2]
    }
    // Item name
    if (match[3]) {
      item = match[3].trim()
      // Capitalize first letter
      item = item.charAt(0).toUpperCase() + item.slice(1)
    }
  }

  return { action, item, quantity, unit, raw }
}

export function useVoiceInput(): UseVoiceInputReturn {
  const [isListening, setIsListening] = useState(false)
  const [transcript, setTranscript] = useState('')
  const [parsedCommand, setParsedCommand] = useState<ParsedVoiceCommand | null>(null)
  const recognitionRef = useRef<any>(null)

  const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
  const isSupported = !!SpeechRecognition

  useEffect(() => {
    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.abort()
      }
    }
  }, [])

  const startListening = useCallback(() => {
    if (!isSupported) return

    const recognition = new SpeechRecognition()
    recognition.lang = 'en-GB'
    recognition.continuous = false
    recognition.interimResults = true
    recognition.maxAlternatives = 1

    recognition.onstart = () => {
      setIsListening(true)
      setTranscript('')
      setParsedCommand(null)
    }

    recognition.onresult = (event: any) => {
      let finalTranscript = ''
      let interimTranscript = ''

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const result = event.results[i]
        if (result.isFinal) {
          finalTranscript += result[0].transcript
        } else {
          interimTranscript += result[0].transcript
        }
      }

      const currentTranscript = finalTranscript || interimTranscript
      setTranscript(currentTranscript)

      if (finalTranscript) {
        const parsed = parseVoiceCommand(finalTranscript)
        setParsedCommand(parsed)
      }
    }

    recognition.onerror = (event: any) => {
      console.error('Speech recognition error:', event.error)
      setIsListening(false)
    }

    recognition.onend = () => {
      setIsListening(false)
    }

    recognitionRef.current = recognition
    recognition.start()
  }, [isSupported])

  const stopListening = useCallback(() => {
    if (recognitionRef.current) {
      recognitionRef.current.stop()
    }
  }, [])

  const resetTranscript = useCallback(() => {
    setTranscript('')
    setParsedCommand(null)
  }, [])

  return {
    isListening,
    transcript,
    isSupported,
    parsedCommand,
    startListening,
    stopListening,
    resetTranscript,
  }
}
