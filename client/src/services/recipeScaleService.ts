// Recipe scaling service for dynamic ingredient adjustments

export interface RecipeIngredient {
  name: string
  quantity: number
  unit: string
  category?: string
  optional?: boolean
}

export interface ScaledRecipe {
  originalServings: number
  targetServings: number
  scaleFactor: number
  ingredients: RecipeIngredient[]
  nutritionInfo?: {
    calories: number
    protein: number
    carbs: number
    fat: number
  }
}

// Common unit conversions
const UNIT_CONVERSIONS: Record<string, Record<string, number>> = {
  // Volume conversions (to ml)
  'cups': { 'ml': 240, 'tbsp': 16, 'tsp': 48 },
  'tbsp': { 'ml': 15, 'tsp': 3 },
  'tsp': { 'ml': 5 },
  'ml': { 'cups': 1/240, 'tbsp': 1/15, 'tsp': 1/5 },
  'l': { 'ml': 1000, 'cups': 4.167 },

  // Weight conversions (to grams)
  'kg': { 'g': 1000, 'oz': 35.274, 'lb': 2.205 },
  'g': { 'kg': 0.001, 'oz': 0.03527, 'lb': 0.002205 },
  'oz': { 'g': 28.3495, 'lb': 0.0625 },
  'lb': { 'g': 453.592, 'oz': 16, 'kg': 0.4536 },
}

// Parse ingredient string to extract quantity, unit, and name
export function parseIngredient(ingredientStr: string): RecipeIngredient {
  // Common patterns: "2 cups flour", "1/2 tsp salt", "3 large eggs"
  const fractionMap: Record<string, number> = {
    '1/4': 0.25, '1/3': 0.333, '1/2': 0.5, '2/3': 0.667, '3/4': 0.75,
    '1/8': 0.125, '3/8': 0.375, '5/8': 0.625, '7/8': 0.875
  }

  // Match quantity (including fractions)
  const quantityMatch = ingredientStr.match(/^([\d./]+)\s*/)
  let quantity = 1

  if (quantityMatch) {
    const quantityStr = quantityMatch[1]
    if (fractionMap[quantityStr]) {
      quantity = fractionMap[quantityStr]
    } else if (quantityStr.includes('/')) {
      const [num, denom] = quantityStr.split('/')
      quantity = parseInt(num) / parseInt(denom)
    } else {
      quantity = parseFloat(quantityStr) || 1
    }
  }

  // Remove quantity from string
  let remaining = ingredientStr.replace(/^[\d./]+\s*/, '').trim()

  // Common units to look for
  const units = ['cups?', 'tbsp', 'tsp', 'ml', 'l', 'kg', 'g', 'oz', 'lb', 'pieces?', 'slices?', 'cloves?', 'large', 'medium', 'small', 'whole', 'can', 'bunch', 'head']
  const unitPattern = new RegExp(`^(${units.join('|')})\\b\\s*`, 'i')
  const unitMatch = remaining.match(unitPattern)

  let unit = 'pieces'
  if (unitMatch) {
    unit = unitMatch[1].toLowerCase()
    // Normalize plurals
    unit = unit.replace(/s$/, '')
    if (unit === 'cup') unit = 'cups'
    if (unit === 'piece') unit = 'pieces'
    remaining = remaining.replace(unitPattern, '').trim()
  }

  // Clean up the name
  const name = remaining.replace(/^of\s+/, '').trim()

  return {
    name: name || ingredientStr,
    quantity,
    unit
  }
}

// Scale a recipe to target servings
export function scaleRecipe(
  ingredients: string[],
  originalServings: number,
  targetServings: number,
  nutritionInfo?: { calories: number; protein: number; carbs: number; fat: number }
): ScaledRecipe {
  const scaleFactor = targetServings / originalServings

  const scaledIngredients = ingredients.map(ing => {
    const parsed = parseIngredient(ing)
    return {
      ...parsed,
      quantity: roundToFraction(parsed.quantity * scaleFactor)
    }
  })

  const scaledNutrition = nutritionInfo ? {
    calories: Math.round(nutritionInfo.calories * scaleFactor),
    protein: Math.round(nutritionInfo.protein * scaleFactor * 10) / 10,
    carbs: Math.round(nutritionInfo.carbs * scaleFactor * 10) / 10,
    fat: Math.round(nutritionInfo.fat * scaleFactor * 10) / 10
  } : undefined

  return {
    originalServings,
    targetServings,
    scaleFactor,
    ingredients: scaledIngredients,
    nutritionInfo: scaledNutrition
  }
}

// Convert quantity between units
export function convertUnit(quantity: number, fromUnit: string, toUnit: string): number | null {
  if (fromUnit === toUnit) return quantity

  const normalizedFrom = fromUnit.toLowerCase().replace(/s$/, '')
  const normalizedTo = toUnit.toLowerCase().replace(/s$/, '')

  // Direct conversion
  if (UNIT_CONVERSIONS[normalizedFrom]?.[normalizedTo]) {
    return quantity * UNIT_CONVERSIONS[normalizedFrom][normalizedTo]
  }

  // Try reverse conversion
  if (UNIT_CONVERSIONS[normalizedTo]?.[normalizedFrom]) {
    return quantity / UNIT_CONVERSIONS[normalizedTo][normalizedFrom]
  }

  // No conversion available
  return null
}

// Round to common cooking fractions for readability
export function roundToFraction(value: number): number {
  // Common fractions in cooking
  const fractions = [0.125, 0.25, 0.333, 0.5, 0.667, 0.75, 0.875]

  const wholeNumber = Math.floor(value)
  const decimal = value - wholeNumber

  if (decimal < 0.0625) {
    return wholeNumber || 0.125 // Minimum 1/8
  }

  // Find nearest fraction
  let nearest = 1
  let minDiff = Math.abs(decimal - 1)

  for (const frac of fractions) {
    const diff = Math.abs(decimal - frac)
    if (diff < minDiff) {
      minDiff = diff
      nearest = frac
    }
  }

  return wholeNumber + nearest
}

// Format quantity for display (e.g., 0.5 -> "1/2", 1.25 -> "1 1/4")
export function formatQuantity(quantity: number): string {
  const fractionStrings: Record<number, string> = {
    0.125: '1/8',
    0.25: '1/4',
    0.333: '1/3',
    0.5: '1/2',
    0.667: '2/3',
    0.75: '3/4',
    0.875: '7/8'
  }

  const wholeNumber = Math.floor(quantity)
  const decimal = Math.round((quantity - wholeNumber) * 1000) / 1000

  // Pure whole number
  if (decimal < 0.0625) {
    return wholeNumber.toString()
  }

  // Find matching fraction
  let fractionStr = ''
  for (const [frac, str] of Object.entries(fractionStrings)) {
    if (Math.abs(decimal - parseFloat(frac)) < 0.05) {
      fractionStr = str
      break
    }
  }

  // Fallback to decimal if no fraction match
  if (!fractionStr) {
    return quantity.toFixed(2).replace(/\.?0+$/, '')
  }

  if (wholeNumber === 0) {
    return fractionStr
  }

  return `${wholeNumber} ${fractionStr}`
}

// Format ingredient for display
export function formatIngredient(ingredient: RecipeIngredient): string {
  const quantity = formatQuantity(ingredient.quantity)
  const unit = ingredient.unit === 'pieces' ? '' : ingredient.unit

  return `${quantity} ${unit} ${ingredient.name}`.replace(/\s+/g, ' ').trim()
}

// Get available serving presets
export function getServingPresets(baseServings: number): number[] {
  return [
    Math.max(1, Math.floor(baseServings / 2)),
    baseServings,
    Math.ceil(baseServings * 1.5),
    baseServings * 2,
    baseServings * 3,
    baseServings * 4
  ].filter((v, i, arr) => arr.indexOf(v) === i) // Remove duplicates
}
