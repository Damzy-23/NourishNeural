// Barcode lookup service using Open Food Facts API
export interface ProductInfo {
  barcode: string
  name: string
  brand?: string
  category?: string
  imageUrl?: string
  quantity?: string
  nutritionInfo?: {
    calories?: number
    protein?: number
    carbs?: number
    fat?: number
    fiber?: number
    sugar?: number
    sodium?: number
  }
}

export interface BarcodeSearchResult {
  found: boolean
  product?: ProductInfo
  error?: string
}

// Open Food Facts API base URL
const OPEN_FOOD_FACTS_API = 'https://world.openfoodfacts.org/api/v0/product'

export async function lookupBarcode(barcode: string): Promise<BarcodeSearchResult> {
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
    'Dairy': 2.50,
    'Meat': 6.00,
    'Seafood': 8.00,
    'Vegetables': 1.50,
    'Fruits': 2.00,
    'Bakery': 2.00,
    'Grains': 1.50,
    'Beverages': 2.00,
    'Snacks': 2.50,
    'Condiments': 3.00,
    'Spices': 2.50,
    'Frozen': 4.00,
    'Canned Goods': 1.50,
    'Other': 3.00,
  }

  return priceEstimates[category] || 3.00
}
