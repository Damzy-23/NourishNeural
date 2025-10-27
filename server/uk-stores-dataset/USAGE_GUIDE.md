# UK Supermarket Dataset Usage Guide

## Overview

This dataset provides comprehensive information about UK supermarket chains, their store locations, and product catalogs. It's designed for PantryPal and similar applications that need store finder, product comparison, and location-based services.

## Quick Start

### 1. Basic Store Search

```javascript
import { storeService } from './services/storeService';

// Get all stores
const stores = await storeService.getAllStores();

// Get stores by chain
const tescoStores = await storeService.getStoresByChain('Tesco');

// Search stores by location
const nearbyStores = await storeService.getNearbyStores(51.4545, -2.5879, 5);
```

### 2. Product Search

```javascript
// Get products from a specific chain
const products = await storeService.getProductsByChain('tesco');

// Search for specific products
const milkProducts = await storeService.searchProducts('milk', 'tesco');

// Compare prices across chains
const priceComparison = await storeService.comparePrices('whole milk');
```

### 3. Frontend Integration

```jsx
import StoreFinder from './components/StoreFinder';

function App() {
  const handleStoreSelect = (store) => {
    console.log('Selected store:', store);
  };

  return (
    <StoreFinder 
      onStoreSelect={handleStoreSelect}
      showProducts={true}
    />
  );
}
```

## API Endpoints

### Store Endpoints

#### GET /api/stores
Get all stores with optional filtering.

**Query Parameters:**
- `chain` - Filter by store chain (e.g., "Tesco", "Sainsbury's")
- `city` - Filter by city name
- `postcode` - Filter by postcode

**Example:**
```
GET /api/stores?chain=Tesco&city=Bristol
```

#### GET /api/stores/nearby
Find stores near a specific location.

**Query Parameters:**
- `latitude` - User's latitude (required)
- `longitude` - User's longitude (required)
- `radius` - Search radius in kilometers (default: 10)

**Example:**
```
GET /api/stores/nearby?latitude=51.4545&longitude=-2.5879&radius=5
```

#### GET /api/stores/:id
Get details for a specific store.

**Example:**
```
GET /api/stores/tesco-001
```

### Product Endpoints

#### GET /api/stores/:chain/products
Get products for a specific store chain.

**Query Parameters:**
- `category` - Filter by product category
- `subcategory` - Filter by product subcategory
- `search` - Search in product names and descriptions

**Example:**
```
GET /api/stores/tesco/products?category=dairy-eggs&search=milk
```

#### GET /api/stores/categories
Get all product categories and subcategories.

**Example:**
```
GET /api/stores/categories
```

## Data Structure

### Store Object
```typescript
interface Store {
  id: string;
  name: string;
  chain: string;
  brand: string;
  address: {
    street: string;
    city: string;
    postcode: string;
    country: string;
  };
  coordinates: {
    latitude: number;
    longitude: number;
  };
  contact: {
    phone: string;
    website: string;
  };
  services: {
    deliveryAvailable: boolean;
    clickAndCollect: boolean;
    loyaltyProgram: string;
    petrolStation: boolean;
    pharmacy: boolean;
    cafe: boolean;
  };
  hours: {
    [day: string]: string;
  };
  features: string[];
  distance?: number; // Added when searching nearby
}
```

### Product Object
```typescript
interface Product {
  id: string;
  name: string;
  brand: string;
  category: string;
  subcategory: string;
  description: string;
  price: {
    current: number;
    currency: string;
    unit: string;
  };
  nutrition?: {
    [key: string]: any;
  };
  allergens: string[];
  dietary: string[];
  availability: string;
  lastUpdated: string;
}
```

## Advanced Features

### 1. Price Comparison
Compare prices across multiple chains:

```javascript
const priceComparison = await storeService.comparePrices('whole milk');
console.log(priceComparison);
// {
//   tesco: [...],
//   sainsburys: [...],
//   asda: [...]
// }
```

### 2. Store Filtering
Find stores with specific services:

```javascript
// Stores with delivery
const deliveryStores = await storeService.getStoresWithDelivery();

// Stores with click & collect
const clickCollectStores = await storeService.getStoresWithClickAndCollect();

// Stores by loyalty program
const clubcardStores = await storeService.getStoresByLoyaltyProgram('Clubcard');
```

### 3. Location Services
Get user's current location and find nearby stores:

```javascript
try {
  const location = await storeService.getCurrentLocation();
  const nearbyStores = await storeService.findStoresByLocation(
    location.latitude, 
    location.longitude, 
    5 // 5km radius
  );
} catch (error) {
  console.error('Location access denied:', error);
}
```

### 4. Distance Calculations
Calculate distances between locations:

```javascript
const distance = storeService.calculateDistance(
  51.4545, -2.5879, // Store coordinates
  51.4565, -2.5889  // User coordinates
);
console.log(storeService.formatDistance(distance)); // "2.1km"
```

## Data Collection

### Running the Data Collector

```bash
# Collect store data
python uk-stores-dataset/data-collector.py --stores

# Collect product data
python uk-stores-dataset/data-collector.py --products

# Collect all data
python uk-stores-dataset/data-collector.py --all
```

### Adding New Store Chains

1. Add store data to `stores.json`
2. Create product catalog in `products/[chain]-products.json`
3. Update the data collector script
4. Test the new endpoints

## Best Practices

### 1. Caching
Cache store and product data to reduce API calls:

```javascript
// Cache stores for 1 hour
const cachedStores = await storeService.getAllStores();
localStorage.setItem('stores', JSON.stringify(cachedStores));
```

### 2. Error Handling
Always handle API errors gracefully:

```javascript
try {
  const stores = await storeService.getAllStores();
} catch (error) {
  console.error('Failed to load stores:', error);
  // Show fallback UI
}
```

### 3. Loading States
Show loading indicators for better UX:

```javascript
const [loading, setLoading] = useState(false);

const loadStores = async () => {
  setLoading(true);
  try {
    const stores = await storeService.getAllStores();
    setStores(stores);
  } finally {
    setLoading(false);
  }
};
```

### 4. Pagination
For large datasets, implement pagination:

```javascript
const [page, setPage] = useState(1);
const [limit] = useState(20);

const loadStores = async () => {
  const stores = await storeService.getAllStores({
    page,
    limit
  });
};
```

## Troubleshooting

### Common Issues

1. **CORS Errors**: Ensure the backend is running and CORS is configured
2. **Location Access**: Handle geolocation permission denials
3. **API Rate Limits**: Implement request throttling
4. **Data Updates**: Refresh data periodically

### Debug Mode

Enable debug logging:

```javascript
// In browser console
localStorage.setItem('debug', 'true');
```

## Contributing

1. Fork the repository
2. Add new store chains or improve existing data
3. Update the data collector script
4. Test thoroughly
5. Submit a pull request

## License

Please ensure compliance with individual data source licenses and terms of use.
