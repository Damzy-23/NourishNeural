import { apiService } from './api';

export interface Store {
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
    [key: string]: string;
  };
  features: string[];
  distance?: number;
}

export interface Product {
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

export interface Category {
  id: string;
  name: string;
  subcategories: {
    id: string;
    name: string;
  }[];
}

export interface StoreSearchParams {
  chain?: string;
  city?: string;
  postcode?: string;
  latitude?: number;
  longitude?: number;
  radius?: number;
}

export interface ProductSearchParams {
  category?: string;
  subcategory?: string;
  search?: string;
}

class StoreService {
  // Store operations
  async getAllStores(params?: StoreSearchParams): Promise<{ stores: Store[]; metadata: any }> {
    const queryParams = new URLSearchParams();
    
    if (params?.chain) queryParams.append('chain', params.chain);
    if (params?.city) queryParams.append('city', params.city);
    if (params?.postcode) queryParams.append('postcode', params.postcode);
    
    const response = await apiService.get(`/api/stores?${queryParams.toString()}`);
    return response as any;
  }

  async getNearbyStores(latitude: number, longitude: number, radius: number = 10): Promise<{ stores: Store[]; metadata: any }> {
    const response = await apiService.get(`/api/stores/nearby?latitude=${latitude}&longitude=${longitude}&radius=${radius}`);
    return response as any;
  }

  async getStoreById(storeId: string): Promise<{ store: Store }> {
    const response = await apiService.get(`/api/stores/${storeId}`);
    return response as any;
  }

  // Product operations
  async getProductsByChain(chain: string, params?: ProductSearchParams): Promise<{ products: Product[]; metadata: any }> {
    const queryParams = new URLSearchParams();
    
    if (params?.category) queryParams.append('category', params.category);
    if (params?.subcategory) queryParams.append('subcategory', params.subcategory);
    if (params?.search) queryParams.append('search', params.search);
    
    const response = await apiService.get(`/api/stores/${chain}/products?${queryParams.toString()}`);
    return response as any;
  }

  // Category operations
  async getCategories(): Promise<{ categories: Category[]; metadata: any }> {
    const response = await apiService.get('/api/stores/categories');
    return response as any;
  }

  // Utility functions
  async searchProducts(query: string, chain?: string): Promise<Product[]> {
    const params: ProductSearchParams = { search: query };
    const result = await this.getProductsByChain(chain || 'tesco', params);
    return result.products;
  }

  async findStoresByLocation(latitude: number, longitude: number, radius: number = 5): Promise<Store[]> {
    const result = await this.getNearbyStores(latitude, longitude, radius);
    return result.stores;
  }

  async getStoresByChain(chain: string): Promise<Store[]> {
    const result = await this.getAllStores({ chain });
    return result.stores;
  }

  // Price comparison
  async comparePrices(productName: string): Promise<{ [chain: string]: Product[] }> {
    const chains = ['tesco', 'sainsburys', 'asda', 'morrisons', 'waitrose', 'aldi', 'lidl'];
    const results: { [chain: string]: Product[] } = {};

    for (const chain of chains) {
      try {
        const result = await this.searchProducts(productName, chain);
        results[chain] = result;
      } catch (error) {
        console.warn(`Failed to search products in ${chain}:`, error);
        results[chain] = [];
      }
    }

    return results;
  }

  // Store features
  async getStoresWithDelivery(): Promise<Store[]> {
    const result = await this.getAllStores();
    return result.stores.filter(store => store.services.deliveryAvailable);
  }

  async getStoresWithClickAndCollect(): Promise<Store[]> {
    const result = await this.getAllStores();
    return result.stores.filter(store => store.services.clickAndCollect);
  }

  async getStoresByLoyaltyProgram(program: string): Promise<Store[]> {
    const result = await this.getAllStores();
    return result.stores.filter(store => 
      store.services.loyaltyProgram.toLowerCase().includes(program.toLowerCase())
    );
  }

  // Location helpers
  getCurrentLocation(): Promise<{ latitude: number; longitude: number }> {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error('Geolocation is not supported by this browser'));
        return;
      }

      navigator.geolocation.getCurrentPosition(
        (position) => {
          resolve({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude
          });
        },
        (error) => {
          reject(error);
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 60000
        }
      );
    });
  }

  // Distance calculation
  calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
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

  // Format distance for display
  formatDistance(distance: number): string {
    if (distance < 1) {
      return `${Math.round(distance * 1000)}m`;
    }
    return `${distance.toFixed(1)}km`;
  }

  // Format price for display
  formatPrice(price: number, currency: string = 'GBP'): string {
    return new Intl.NumberFormat('en-GB', {
      style: 'currency',
      currency: currency
    }).format(price);
  }
}

export const storeService = new StoreService();
