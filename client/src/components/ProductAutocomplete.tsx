import { useState, useRef, useEffect, useCallback } from 'react'
import { Search, Loader2, Leaf } from 'lucide-react'
import { apiService } from '../services/api'
import { cn } from '../utils/cn'

interface ProductResult {
  name: string
  brand?: string
  barcode?: string
  category?: string
  nutriScore?: string
  ecoScore?: string
  imageUrl?: string
  nutritionPer100g?: {
    energy_kcal?: number
    protein?: number
    fat?: number
    carbs?: number
  }
}

interface ProductAutocompleteProps {
  value: string
  onChange: (value: string) => void
  onSelectProduct?: (product: ProductResult) => void
  placeholder?: string
  className?: string
}

export default function ProductAutocomplete({
  value,
  onChange,
  onSelectProduct,
  placeholder = 'Search product...',
  className,
}: ProductAutocompleteProps) {
  const [results, setResults] = useState<ProductResult[]>([])
  const [isSearching, setIsSearching] = useState(false)
  const [showDropdown, setShowDropdown] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)
  const debounceRef = useRef<ReturnType<typeof setTimeout>>()

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowDropdown(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const searchProducts = useCallback(async (query: string) => {
    if (query.length < 2) {
      setResults([])
      setShowDropdown(false)
      return
    }

    setIsSearching(true)
    try {
      const res = await apiService.post('/api/barcode/search', { query }) as any
      const products: ProductResult[] = (res.data?.products || []).slice(0, 8)
      setResults(products)
      setShowDropdown(products.length > 0)
    } catch {
      setResults([])
      setShowDropdown(false)
    } finally {
      setIsSearching(false)
    }
  }, [])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value
    onChange(val)

    if (debounceRef.current) clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => searchProducts(val), 400)
  }

  const handleSelect = (product: ProductResult) => {
    onChange(product.name)
    setShowDropdown(false)
    onSelectProduct?.(product)
  }

  const nutriScoreColor: Record<string, string> = {
    a: 'bg-green-500', b: 'bg-lime-500', c: 'bg-yellow-500', d: 'bg-orange-500', e: 'bg-red-500',
  }

  return (
    <div className={cn('relative', className)} ref={dropdownRef}>
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
        <input
          type="text"
          value={value}
          onChange={handleInputChange}
          onFocus={() => results.length > 0 && setShowDropdown(true)}
          placeholder={placeholder}
          className="w-full pl-9 pr-8 py-2 text-sm bg-white dark:bg-neutral-900 border border-neutral-300 dark:border-neutral-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 dark:text-neutral-100 transition-colors"
        />
        {isSearching && (
          <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 animate-spin text-neutral-400" />
        )}
      </div>

      {showDropdown && (
        <div className="absolute top-full left-0 right-0 mt-1 z-50 bg-white dark:bg-neutral-800 rounded-lg shadow-xl border border-neutral-200 dark:border-neutral-700 max-h-64 overflow-y-auto">
          {results.map((product, i) => (
            <button
              key={`${product.barcode || product.name}-${i}`}
              type="button"
              onClick={() => handleSelect(product)}
              className="w-full flex items-center gap-3 px-3 py-2.5 text-left hover:bg-neutral-50 dark:hover:bg-neutral-700/50 transition-colors border-b border-neutral-100 dark:border-neutral-700/50 last:border-b-0"
            >
              {product.imageUrl ? (
                <img src={product.imageUrl} alt="" className="w-8 h-8 rounded object-cover shrink-0" />
              ) : (
                <div className="w-8 h-8 rounded bg-neutral-100 dark:bg-neutral-700 flex items-center justify-center shrink-0">
                  <Search className="w-4 h-4 text-neutral-400" />
                </div>
              )}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-neutral-800 dark:text-neutral-200 truncate">{product.name}</p>
                {product.brand && (
                  <p className="text-xs text-neutral-500 dark:text-neutral-400 truncate">{product.brand}</p>
                )}
              </div>
              <div className="flex items-center gap-1 shrink-0">
                {product.nutriScore && (
                  <span className={cn(
                    'text-[10px] font-bold text-white w-5 h-5 rounded flex items-center justify-center uppercase',
                    nutriScoreColor[product.nutriScore.toLowerCase()] || 'bg-neutral-400'
                  )}>
                    {product.nutriScore}
                  </span>
                )}
                {product.ecoScore && (
                  <span className="flex items-center gap-0.5 text-[10px] text-green-600 dark:text-green-400">
                    <Leaf className="w-3 h-3" />
                    {product.ecoScore.toUpperCase()}
                  </span>
                )}
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
