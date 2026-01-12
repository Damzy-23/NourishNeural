import { apiService } from './api';

export interface FoodItem {
  category?: string;
  storage_type?: string;
  purchase_date?: string;
  storage_temp?: number;
  package_quality?: number;
  estimated_price?: number;
}

export interface UserHistory {
  category: string;
  purchase_date: string;
  consumption_date: string;
  was_wasted: boolean;
}

export interface ExpiryPrediction {
  expiry_days: number;
  confidence: number;
  category: string;
  method: string;
}

export interface WastePrediction {
  waste_probability: number;
  risk_level: string;
  confidence: number;
  method?: string;
}

export interface FoodClassification {
  category: string;
  confidence: number;
  food_name: string;
  method?: string;
}

export interface MLHealthStatus {
  status: string;
  test_prediction: ExpiryPrediction;
}

class MLService {
  /**
   * Check ML service health
   */
  async checkHealth(): Promise<MLHealthStatus> {
    try {
      const response = await apiService.get('/api/ml/health') as any;
      // apiService already extracts response.data, so we just need .data from the API response structure
      return response.data;
    } catch (error) {
      console.error('ML health check failed:', error);
      throw error;
    }
  }

  /**
   * Predict food expiry date
   */
  async predictExpiry(foodItem: FoodItem): Promise<ExpiryPrediction> {
    try {
      const response = await apiService.post('/api/ml/predict-expiry', {
        foodItem
      }) as any;
      // apiService already extracts response.data, so we just need .data from the API response structure
      return response.data;
    } catch (error) {
      console.error('Expiry prediction failed:', error);
      throw error;
    }
  }

  /**
   * Predict waste probability
   */
  async predictWaste(userHistory: UserHistory[], foodItem: FoodItem): Promise<WastePrediction> {
    try {
      const response = await apiService.post('/api/ml/predict-waste', {
        userHistory,
        foodItem
      }) as any;
      // apiService already extracts response.data, so we just need .data from the API response structure
      return response.data;
    } catch (error) {
      console.error('Waste prediction failed:', error);
      throw error;
    }
  }

  /**
   * Classify food item
   */
  async classifyFood(foodName: string): Promise<FoodClassification> {
    try {
      const response = await apiService.post('/api/ml/classify-food', {
        foodName
      }) as any;
      // apiService already extracts response.data, so we just need .data from the API response structure
      return response.data;
    } catch (error) {
      console.error('Food classification failed:', error);
      throw error;
    }
  }

  /**
   * Get expiry date from prediction
   */
  getExpiryDate(purchaseDate: string, expiryDays: number): Date {
    const purchase = new Date(purchaseDate);
    const expiry = new Date(purchase);
    expiry.setDate(purchase.getDate() + expiryDays);
    return expiry;
  }

  /**
   * Get days until expiry
   */
  getDaysUntilExpiry(expiryDate: Date): number {
    const now = new Date();
    const diffTime = expiryDate.getTime() - now.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }

  /**
   * Get expiry status color
   */
  getExpiryStatusColor(daysUntilExpiry: number): string {
    if (daysUntilExpiry <= 0) return 'text-red-600 bg-red-100';
    if (daysUntilExpiry <= 2) return 'text-orange-600 bg-orange-100';
    if (daysUntilExpiry <= 7) return 'text-yellow-600 bg-yellow-100';
    return 'text-green-600 bg-green-100';
  }

  /**
   * Get waste risk color
   */
  getWasteRiskColor(riskLevel: string): string {
    switch (riskLevel) {
      case 'High': return 'text-red-600 bg-red-100';
      case 'Medium': return 'text-yellow-600 bg-yellow-100';
      case 'Low': return 'text-green-600 bg-green-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  }

  /**
   * Format confidence as percentage
   */
  formatConfidence(confidence: number): string {
    return `${Math.round(confidence * 100)}%`;
  }

  /**
   * Get risk level description
   */
  getRiskLevelDescription(riskLevel: string): string {
    switch (riskLevel) {
      case 'High': return 'High waste risk - use soon or freeze';
      case 'Medium': return 'Medium waste risk - plan to use within a few days';
      case 'Low': return 'Low waste risk - should keep well';
      default: return 'Unknown risk level';
    }
  }
}

export const mlService = new MLService();
