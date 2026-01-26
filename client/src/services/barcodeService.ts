import { apiService } from './api'

// Barcode lookup service using Open Food Facts API (with backend integration)
export interface ProductInfo {
  barcode: string
  name: string
  brand?: string
  category?: string
  imageUrl?: string
  quantity?: string
  ingredients?: string
  allergens?: string[]
  estimatedPrice?: number
  estimatedExpiryDays?: number
  nutritionInfo?: {
    calories?: number
    protein?: number
    carbs?: number
    fat?: number
    fiber?: number
    sugar?: number
    sodium?: number
    saturatedFat?: number
    salt?: number
  }
  nutriscore?: string
  novaGroup?: number
  ecoscore?: string
}

export interface BarcodeSearchResult {
  found: boolean
  product?: ProductInfo
  error?: string
}

export interface BarcodeValidation {
  valid: boolean
  format: string
  message?: string
}

export interface BarcodeScan {
  id: string
  barcode: string
  productName: string
  productData?: ProductInfo
  scannedAt: string
  addedToPantry: boolean
}

// Open Food Facts API base URL (fallback for direct client lookup)
const OPEN_FOOD_FACTS_API = 'https://world.openfoodfacts.org/api/v0/product'

/**
 * Validate barcode format via backend
 */
export async function validateBarcode(barcode: string): Promise<BarcodeValidation> {
  try {
    const response = await apiService.post<{ success: boolean; data: BarcodeValidation }>(
      '/api/barcode/validate',
      { barcode }
    )
    return response.data
  } catch (error) {
    // Fallback to client-side validation
    return validateBarcodeLocal(barcode)
  }
}

/**
 * Client-side barcode validation (fallback)
 */
function validateBarcodeLocal(barcode: string): BarcodeValidation {
  const cleanBarcode = barcode.replace(/[\s-]/g, '')

  if (!/^\d+$/.test(cleanBarcode)) {
    return { valid: false, format: 'unknown', message: 'Barcode must contain only digits' }
  }

  if (cleanBarcode.length === 13) {
    // EAN-13 validation
    let sum = 0
    for (let i = 0; i < 12; i++) {
      sum += parseInt(cleanBarcode[i]) * (i % 2 === 0 ? 1 : 3)
    }
    const checkDigit = (10 - (sum % 10)) % 10
    if (checkDigit === parseInt(cleanBarcode[12])) {
      return { valid: true, format: 'EAN-13' }
    }
    return { valid: false, format: 'EAN-13', message: 'Invalid EAN-13 check digit' }
  }

  if (cleanBarcode.length === 12) {
    // UPC-A validation
    let sum = 0
    for (let i = 0; i < 11; i++) {
      sum += parseInt(cleanBarcode[i]) * (i % 2 === 0 ? 3 : 1)
    }
    const checkDigit = (10 - (sum % 10)) % 10
    if (checkDigit === parseInt(cleanBarcode[11])) {
      return { valid: true, format: 'UPC-A' }
    }
    return { valid: false, format: 'UPC-A', message: 'Invalid UPC-A check digit' }
  }

  if (cleanBarcode.length >= 6 && cleanBarcode.length <= 20) {
    return { valid: true, format: 'OTHER' }
  }

  return { valid: false, format: 'unknown', message: `Unsupported barcode length: ${cleanBarcode.length}` }
}

/**
 * Lookup barcode via backend (primary) or direct API (fallback)
 */
export async function lookupBarcode(barcode: string): Promise<BarcodeSearchResult> {
  try {
    // Try backend first
    const response = await apiService.post<{ success: boolean; data: BarcodeSearchResult }>(
      '/api/barcode/lookup',
      { barcode, validateFirst: true }
    )

    if (response.success && response.data) {
      return response.data
    }

    // Fallback to direct API call
    return await lookupBarcodeDirectly(barcode)
  } catch (error) {
    console.error('Backend lookup failed, trying direct API:', error)
    return await lookupBarcodeDirectly(barcode)
  }
}

/**
 * Direct lookup via Open Food Facts API (fallback)
 */
async function lookupBarcodeDirectly(barcode: string): Promise<BarcodeSearchResult> {
  try {
    const response = await fetch(`${OPEN_FOOD_FACTS_API}/${barcode}.json`)
    const data = await response.json()

    if (data.status === 1 && data.product) {
      const product = data.product

      // Extract nutrition info per 100g
      const nutriments = product.nutriments || {}

      return {
        found: true,
        product: {
          barcode,
          name: product.product_name || product.product_name_en || 'Unknown Product',
          brand: product.brands || undefined,
          category: extractCategory(product.categories_tags || product.categories || ''),
          imageUrl: product.image_url || product.image_front_url || undefined,
          quantity: product.quantity || undefined,
          nutritionInfo: {
            calories: nutriments['energy-kcal_100g'] || nutriments['energy-kcal'] || undefined,
            protein: nutriments.proteins_100g || nutriments.proteins || undefined,
            carbs: nutriments.carbohydrates_100g || nutriments.carbohydrates || undefined,
            fat: nutriments.fat_100g || nutriments.fat || undefined,
            fiber: nutriments.fiber_100g || nutriments.fiber || undefined,
            sugar: nutriments.sugars_100g || nutriments.sugars || undefined,
            sodium: nutriments.sodium_100g || nutriments.sodium || undefined,
          }
        }
      }
    }

    return {
      found: false,
      error: 'Product not found in database'
    }
  } catch (error) {
    console.error('Barcode lookup error:', error)
    return {
      found: false,
      error: 'Failed to lookup barcode. Please check your internet connection.'
    }
  }
}

/**
 * Save barcode scan to history
 */
export async function saveScan(
  barcode: string,
  productName: string,
  productData?: ProductInfo,
  addedToPantry = false
): Promise<{ scan: BarcodeScan; isDuplicate: boolean }> {
  try {
    const response = await apiService.post<{
      success: boolean
      data: { scan: BarcodeScan; isDuplicate: boolean; message?: string }
    }>('/api/barcode/save', {
      barcode,
      productName,
      productData,
      addedToPantry
    })
    return response.data
  } catch (error) {
    console.error('Failed to save scan:', error)
    // Return a local scan if backend fails
    return {
      scan: {
        id: `local_${Date.now()}`,
        barcode,
        productName,
        productData,
        scannedAt: new Date().toISOString(),
        addedToPantry
      },
      isDuplicate: false
    }
  }
}

/**
 * Get scan history
 */
export async function getScanHistory(): Promise<BarcodeScan[]> {
  try {
    const response = await apiService.get<{
      success: boolean
      data: { scans: BarcodeScan[]; total: number }
    }>('/api/barcode/history')
    return response.data.scans
  } catch (error) {
    console.error('Failed to get scan history:', error)
    return []
  }
}

/**
 * Delete scan from history
 */
export async function deleteScan(scanId: string): Promise<boolean> {
  try {
    await apiService.delete(`/api/barcode/history/${scanId}`)
    return true
  } catch (error) {
    console.error('Failed to delete scan:', error)
    return false
  }
}

/**
 * Check if barcode already exists in pantry
 */
export async function checkDuplicate(barcode: string): Promise<{ exists: boolean; existingItem?: BarcodeScan }> {
  try {
    const response = await apiService.post<{
      success: boolean
      data: { exists: boolean; existingItem?: BarcodeScan }
    }>('/api/barcode/check-duplicate', { barcode })
    return response.data
  } catch (error) {
    console.error('Failed to check duplicate:', error)
    return { exists: false }
  }
}

// Helper to extract a readable category from Open Food Facts tags
function extractCategory(categories: string | string[]): string {
  const categoryMap: Record<string, string> = {
    'dairy': 'Dairy',
    'milk': 'Dairy',
    'cheese': 'Dairy',
    'yogurt': 'Dairy',
    'meat': 'Meat',
    'poultry': 'Meat',
    'fish': 'Seafood',
    'seafood': 'Seafood',
    'vegetable': 'Vegetables',
    'fruit': 'Fruits',
    'bread': 'Bakery',
    'cereal': 'Grains',
    'pasta': 'Grains',
    'rice': 'Grains',
    'beverage': 'Beverages',
    'drink': 'Beverages',
    'juice': 'Beverages',
    'snack': 'Snacks',
    'chocolate': 'Snacks',
    'candy': 'Snacks',
    'sauce': 'Condiments',
    'condiment': 'Condiments',
    'spice': 'Spices',
    'frozen': 'Frozen',
    'canned': 'Canned Goods',
  }

  const categoryString = Array.isArray(categories) ? categories.join(' ') : categories
  const lowerCategory = categoryString.toLowerCase()

  for (const [key, value] of Object.entries(categoryMap)) {
    if (lowerCategory.includes(key)) {
      return value
    }
  }

  return 'Other'
}

// Estimate price based on category (placeholder - could be enhanced with actual pricing APIs)
export function estimatePrice(category: string): number {
  const priceEstimates: Record<string, number> = {
    'Dairy': 1.45,
    'Meat': 4.50,
    'Seafood': 4.00,
    'Vegetables': 1.00,
    'Fruits': 1.50,
    'Bakery': 1.20,
    'Grains': 1.10,
    'Beverages': 1.80,
    'Snacks': 1.50,
    'Condiments': 1.90,
    'Spices': 0.80,
    'Frozen': 2.50,
    'Canned Goods': 1.30,
    'Other': 2.00,
  }

  return priceEstimates[category] || 3.00
}
