/**
 * Barcode Service
 * Handles barcode validation, lookup via Open Food Facts, and history management
 */

const OPEN_FOOD_FACTS_API = 'https://world.openfoodfacts.org/api/v0/product';

/**
 * Validate EAN-13 barcode check digit
 * @param {string} barcode - 13-digit barcode string
 * @returns {boolean} - True if valid
 */
function validateEAN13(barcode) {
  if (!/^\d{13}$/.test(barcode)) return false;

  let sum = 0;
  for (let i = 0; i < 12; i++) {
    const digit = parseInt(barcode[i], 10);
    sum += (i % 2 === 0) ? digit : digit * 3;
  }

  const checkDigit = (10 - (sum % 10)) % 10;
  return checkDigit === parseInt(barcode[12], 10);
}

/**
 * Validate UPC-A barcode check digit
 * @param {string} barcode - 12-digit barcode string
 * @returns {boolean} - True if valid
 */
function validateUPCA(barcode) {
  if (!/^\d{12}$/.test(barcode)) return false;

  let sum = 0;
  for (let i = 0; i < 11; i++) {
    const digit = parseInt(barcode[i], 10);
    sum += (i % 2 === 0) ? digit * 3 : digit;
  }

  const checkDigit = (10 - (sum % 10)) % 10;
  return checkDigit === parseInt(barcode[11], 10);
}

/**
 * Validate EAN-8 barcode check digit
 * @param {string} barcode - 8-digit barcode string
 * @returns {boolean} - True if valid
 */
function validateEAN8(barcode) {
  if (!/^\d{8}$/.test(barcode)) return false;

  let sum = 0;
  for (let i = 0; i < 7; i++) {
    const digit = parseInt(barcode[i], 10);
    sum += (i % 2 === 0) ? digit * 3 : digit;
  }

  const checkDigit = (10 - (sum % 10)) % 10;
  return checkDigit === parseInt(barcode[7], 10);
}

/**
 * Detect barcode format and validate
 * @param {string} barcode - Barcode string
 * @returns {{ valid: boolean, format: string, message?: string }}
 */
function validateBarcode(barcode) {
  // Remove any spaces or dashes
  const cleanBarcode = barcode.replace(/[\s-]/g, '');

  // Check if all digits
  if (!/^\d+$/.test(cleanBarcode)) {
    return {
      valid: false,
      format: 'unknown',
      message: 'Barcode must contain only digits'
    };
  }

  // Detect format based on length
  switch (cleanBarcode.length) {
    case 13:
      if (validateEAN13(cleanBarcode)) {
        return { valid: true, format: 'EAN-13' };
      }
      return {
        valid: false,
        format: 'EAN-13',
        message: 'Invalid EAN-13 check digit'
      };

    case 12:
      if (validateUPCA(cleanBarcode)) {
        return { valid: true, format: 'UPC-A' };
      }
      return {
        valid: false,
        format: 'UPC-A',
        message: 'Invalid UPC-A check digit'
      };

    case 8:
      if (validateEAN8(cleanBarcode)) {
        return { valid: true, format: 'EAN-8' };
      }
      return {
        valid: false,
        format: 'EAN-8',
        message: 'Invalid EAN-8 check digit'
      };

    default:
      // Allow other formats like CODE128 without strict validation
      if (cleanBarcode.length >= 6 && cleanBarcode.length <= 20) {
        return { valid: true, format: 'OTHER' };
      }
      return {
        valid: false,
        format: 'unknown',
        message: `Unsupported barcode length: ${cleanBarcode.length}`
      };
  }
}

/**
 * Category mapping for Open Food Facts tags
 */
const categoryMap = {
  'dairy': 'Dairy',
  'milk': 'Dairy',
  'cheese': 'Dairy',
  'yogurt': 'Dairy',
  'butter': 'Dairy',
  'cream': 'Dairy',
  'meat': 'Meat',
  'poultry': 'Meat',
  'beef': 'Meat',
  'pork': 'Meat',
  'chicken': 'Meat',
  'fish': 'Fish',
  'seafood': 'Fish',
  'vegetable': 'Vegetables',
  'fruit': 'Fruits',
  'bread': 'Bakery',
  'pastry': 'Bakery',
  'cake': 'Bakery',
  'cereal': 'Grains',
  'pasta': 'Grains',
  'rice': 'Grains',
  'beverage': 'Beverages',
  'drink': 'Beverages',
  'juice': 'Beverages',
  'water': 'Beverages',
  'soda': 'Beverages',
  'snack': 'Snacks',
  'chocolate': 'Snacks',
  'candy': 'Snacks',
  'chips': 'Snacks',
  'sauce': 'Condiments',
  'condiment': 'Condiments',
  'ketchup': 'Condiments',
  'mayonnaise': 'Condiments',
  'spice': 'Pantry',
  'herb': 'Herbs',
  'frozen': 'Frozen',
  'canned': 'Pantry',
  'egg': 'Eggs',
  'eggs': 'Eggs'
};

/**
 * Extract readable category from Open Food Facts tags
 * @param {string|string[]} categories - Category tags
 * @returns {string} - Mapped category name
 */
function extractCategory(categories) {
  const categoryString = Array.isArray(categories) ? categories.join(' ') : (categories || '');
  const lowerCategory = categoryString.toLowerCase();

  for (const [key, value] of Object.entries(categoryMap)) {
    if (lowerCategory.includes(key)) {
      return value;
    }
  }

  return 'General';
}

/**
 * Lookup product by barcode via Open Food Facts API
 * @param {string} barcode - Barcode string
 * @returns {Promise<{ found: boolean, product?: object, error?: string }>}
 */
async function lookupBarcode(barcode) {
  try {
    const cleanBarcode = barcode.replace(/[\s-]/g, '');

    const response = await fetch(`${OPEN_FOOD_FACTS_API}/${cleanBarcode}.json`);

    if (!response.ok) {
      throw new Error(`API returned status ${response.status}`);
    }

    const data = await response.json();

    if (data.status === 1 && data.product) {
      const product = data.product;
      const nutriments = product.nutriments || {};

      return {
        found: true,
        product: {
          barcode: cleanBarcode,
          name: product.product_name || product.product_name_en || 'Unknown Product',
          brand: product.brands || null,
          category: extractCategory(product.categories_tags || product.categories || ''),
          imageUrl: product.image_url || product.image_front_url || null,
          quantity: product.quantity || null,
          ingredients: product.ingredients_text || null,
          allergens: product.allergens_tags || [],
          nutritionInfo: {
            calories: nutriments['energy-kcal_100g'] || nutriments['energy-kcal'] || null,
            protein: nutriments.proteins_100g || nutriments.proteins || null,
            carbs: nutriments.carbohydrates_100g || nutriments.carbohydrates || null,
            fat: nutriments.fat_100g || nutriments.fat || null,
            fiber: nutriments.fiber_100g || nutriments.fiber || null,
            sugar: nutriments.sugars_100g || nutriments.sugars || null,
            sodium: nutriments.sodium_100g || nutriments.sodium || null,
            saturatedFat: nutriments['saturated-fat_100g'] || null,
            salt: nutriments.salt_100g || null
          },
          nutriscore: product.nutriscore_grade || null,
          novaGroup: product.nova_group || null,
          ecoscore: product.ecoscore_grade || null
        }
      };
    }

    return {
      found: false,
      error: 'Product not found in Open Food Facts database'
    };
  } catch (error) {
    console.error('Barcode lookup error:', error);
    return {
      found: false,
      error: `Failed to lookup barcode: ${error.message}`
    };
  }
}

/**
 * Estimate price based on category
 * @param {string} category - Product category
 * @returns {number} - Estimated price in GBP
 */
function estimatePrice(category) {
  // Estimated prices in GBP (£) for UK market
  const priceEstimates = {
    'Dairy': 1.45,       // Milk/Yogurt
    'Meat': 4.50,        // Chicken/Beef pack
    'Fish': 4.00,        // Salmon/Cod fillets
    'Vegetables': 1.00,  // Bag of carrots/pack of peppers
    'Fruits': 1.50,      // Apples/Bananas
    'Bakery': 1.20,      // Loaf of bread
    'Grains': 1.10,      // Pasta/Rice
    'Beverages': 1.80,   // Juice/Soda
    'Snacks': 1.50,      // Crisps/Chocolate
    'Condiments': 1.90,  // Ketchup/Sauces
    'Pantry': 1.30,      // Tinned goods
    'Herbs': 0.80,       // Fresh/Dried herbs
    'Frozen': 2.50,      // Chips/Peas
    'Eggs': 2.20,        // Free range eggs
    'General': 2.00
  };

  return priceEstimates[category] || 2.00;
}

/**
 * Estimate default expiry days based on category
 * @param {string} category - Product category
 * @returns {number} - Estimated days until expiry
 */
function estimateExpiryDays(category) {
  const expiryEstimates = {
    'Dairy': 7,
    'Meat': 3,
    'Fish': 2,
    'Vegetables': 5,
    'Fruits': 5,
    'Bakery': 3,
    'Grains': 180,
    'Beverages': 90,
    'Snacks': 60,
    'Condiments': 180,
    'Pantry': 365,
    'Herbs': 7,
    'Frozen': 90,
    'Eggs': 21,
    'General': 30
  };

  return expiryEstimates[category] || 30;
}

module.exports = {
  validateBarcode,
  validateEAN13,
  validateUPCA,
  validateEAN8,
  lookupBarcode,
  extractCategory,
  estimatePrice,
  estimateExpiryDays
};
