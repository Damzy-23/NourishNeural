const express = require('express');
const router = express.Router();
const path = require('path');
const fs = require('fs');

// Load store data
const loadStoreData = () => {
  try {
    const storesPath = path.join(__dirname, '../../uk-stores-dataset/stores.json');
    const data = fs.readFileSync(storesPath, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    console.error('Error loading store data:', error);
    return { stores: [], metadata: {} };
  }
};

// Load product data for a specific store
const loadProductData = (storeChain) => {
  try {
    const productsPath = path.join(__dirname, `../../uk-stores-dataset/products/${storeChain.toLowerCase()}-products.json`);
    if (fs.existsSync(productsPath)) {
      const data = fs.readFileSync(productsPath, 'utf8');
      return JSON.parse(data);
    }
    return { products: [], metadata: {} };
  } catch (error) {
    console.error(`Error loading ${storeChain} product data:`, error);
    return { products: [], metadata: {} };
  }
};

// Load categories
const loadCategories = () => {
  try {
    const categoriesPath = path.join(__dirname, '../../uk-stores-dataset/categories.json');
    const data = fs.readFileSync(categoriesPath, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    console.error('Error loading categories:', error);
    return { categories: [], metadata: {} };
  }
};

// GET /api/stores - Get all stores
router.get('/', (req, res) => {
  try {
    const storeData = loadStoreData();
    
    // Apply filters if provided
    let filteredStores = storeData.stores;
    
    if (req.query.chain) {
      filteredStores = filteredStores.filter(store => 
        store.chain.toLowerCase() === req.query.chain.toLowerCase()
      );
    }
    
    if (req.query.city) {
      filteredStores = filteredStores.filter(store => 
        store.address.city.toLowerCase().includes(req.query.city.toLowerCase())
      );
    }
    
    if (req.query.postcode) {
      filteredStores = filteredStores.filter(store => 
        store.address.postcode.toLowerCase().includes(req.query.postcode.toLowerCase())
      );
    }
    
    res.json({
      success: true,
      stores: filteredStores,
      metadata: {
        ...storeData.metadata,
        filteredCount: filteredStores.length
      }
    });
  } catch (error) {
    console.error('Error fetching stores:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch stores',
      details: error.message
    });
  }
});

// GET /api/stores/nearby - Find stores near a location
router.get('/nearby', (req, res) => {
  try {
    const { latitude, longitude, radius = 10 } = req.query;
    
    if (!latitude || !longitude) {
      return res.status(400).json({
        success: false,
        error: 'Latitude and longitude are required'
      });
    }
    
    const storeData = loadStoreData();
    const userLat = parseFloat(latitude);
    const userLng = parseFloat(longitude);
    const searchRadius = parseFloat(radius);
    
    // Calculate distance and filter stores
    const nearbyStores = storeData.stores
      .map(store => {
        const distance = calculateDistance(
          userLat, userLng,
          store.coordinates.latitude, store.coordinates.longitude
        );
        return { ...store, distance };
      })
      .filter(store => store.distance <= searchRadius)
      .sort((a, b) => a.distance - b.distance);
    
    res.json({
      success: true,
      stores: nearbyStores,
      metadata: {
        userLocation: { latitude: userLat, longitude: userLng },
        searchRadius: searchRadius,
        foundCount: nearbyStores.length
      }
    });
  } catch (error) {
    console.error('Error finding nearby stores:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to find nearby stores',
      details: error.message
    });
  }
});

// GET /api/stores/:id - Get specific store details
router.get('/:id', (req, res) => {
  try {
    const storeData = loadStoreData();
    const store = storeData.stores.find(s => s.id === req.params.id);
    
    if (!store) {
      return res.status(404).json({
        success: false,
        error: 'Store not found'
      });
    }
    
    res.json({
      success: true,
      store
    });
  } catch (error) {
    console.error('Error fetching store:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch store',
      details: error.message
    });
  }
});

// GET /api/stores/:chain/products - Get products for a specific store chain
router.get('/:chain/products', (req, res) => {
  try {
    const { chain } = req.params;
    const { category, subcategory, search } = req.query;
    
    const productData = loadProductData(chain);
    
    // Apply filters
    let filteredProducts = productData.products;
    
    if (category) {
      filteredProducts = filteredProducts.filter(product => 
        product.category === category
      );
    }
    
    if (subcategory) {
      filteredProducts = filteredProducts.filter(product => 
        product.subcategory === subcategory
      );
    }
    
    if (search) {
      const searchTerm = search.toLowerCase();
      filteredProducts = filteredProducts.filter(product => 
        product.name.toLowerCase().includes(searchTerm) ||
        product.description.toLowerCase().includes(searchTerm)
      );
    }
    
    res.json({
      success: true,
      products: filteredProducts,
      metadata: {
        ...productData.metadata,
        filteredCount: filteredProducts.length
      }
    });
  } catch (error) {
    console.error('Error fetching products:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch products',
      details: error.message
    });
  }
});

// GET /api/stores/categories - Get product categories
router.get('/categories', (req, res) => {
  try {
    const categoriesData = loadCategories();
    res.json({
      success: true,
      ...categoriesData
    });
  } catch (error) {
    console.error('Error fetching categories:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch categories',
      details: error.message
    });
  }
});

// Helper function to calculate distance between two points
function calculateDistance(lat1, lon1, lat2, lon2) {
  const R = 6371; // Earth's radius in kilometers
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
    Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
}

module.exports = router;