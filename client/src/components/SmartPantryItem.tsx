import React, { useState, useEffect } from 'react';
import { Clock, AlertTriangle, Brain, TrendingUp } from 'lucide-react';
import { mlService, type FoodItem, type ExpiryPrediction, type WastePrediction } from '../services/mlService';

interface PantryItem {
  id: string;
  name: string;
  category: string;
  purchaseDate: string;
  storageType: string;
  quantity: number;
  unit: string;
}

interface SmartPantryItemProps {
  item: PantryItem;
  userHistory?: any[];
  onUpdate?: (item: PantryItem) => void;
}

export default function SmartPantryItem({ item, userHistory = [], onUpdate }: SmartPantryItemProps) {
  const [expiryPrediction, setExpiryPrediction] = useState<ExpiryPrediction | null>(null);
  const [wastePrediction, setWastePrediction] = useState<WastePrediction | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadPredictions();
  }, [item]);

  const loadPredictions = async () => {
    try {
      setIsLoading(true);
      setError(null);

      // Prepare food item data for ML
      const foodItem: FoodItem = {
        category: item.category,
        storage_type: item.storageType,
        purchase_date: item.purchaseDate,
        storage_temp: 4.0, // Default fridge temperature
        package_quality: 0.9 // Default quality
      };

      // Get both predictions in parallel
      const [expiryResult, wasteResult] = await Promise.all([
        mlService.predictExpiry(foodItem),
        mlService.predictWaste(userHistory, foodItem)
      ]);

      setExpiryPrediction(expiryResult);
      setWastePrediction(wasteResult);
    } catch (err) {
      console.error('Failed to load predictions:', err);
      setError('Failed to load AI predictions');
    } finally {
      setIsLoading(false);
    }
  };

  const getExpiryDate = () => {
    if (!expiryPrediction) return null;
    return mlService.getExpiryDate(item.purchaseDate, expiryPrediction.expiry_days);
  };

  const getDaysUntilExpiry = () => {
    const expiryDate = getExpiryDate();
    if (!expiryDate) return null;
    return mlService.getDaysUntilExpiry(expiryDate);
  };

  const getExpiryStatus = () => {
    const days = getDaysUntilExpiry();
    if (days === null) return null;
    
    if (days <= 0) return { text: 'Expired', color: 'text-red-600 bg-red-100' };
    if (days <= 2) return { text: 'Expires Soon', color: 'text-orange-600 bg-orange-100' };
    if (days <= 7) return { text: 'Expires This Week', color: 'text-yellow-600 bg-yellow-100' };
    return { text: 'Fresh', color: 'text-green-600 bg-green-100' };
  };

  const expiryStatus = getExpiryStatus();
  const daysUntilExpiry = getDaysUntilExpiry();

  return (
    <div className="card hover:shadow-medium transition-all duration-200">
      <div className="card-content">
        <div className="flex items-start justify-between mb-3">
          <div className="flex-1 pr-2">
            <h3 className="font-semibold text-neutral-900 mb-1">{item.name}</h3>
            <p className="text-sm text-neutral-600">
              {item.quantity} {item.unit} • {item.category}
            </p>
            <p className="text-xs text-neutral-500">
              Purchased: {new Date(item.purchaseDate).toLocaleDateString()}
            </p>
          </div>
          
          <div className="flex flex-col items-end space-y-1">
            <div className="flex items-center space-x-1">
              <Brain className="h-3 w-3 text-purple-500" />
              <span className="text-xs text-purple-600 font-medium">AI Enhanced</span>
            </div>
            <div className="text-xs text-purple-500 font-medium">ML Model</div>
          </div>
        </div>

        {/* ML Predictions */}
        {isLoading ? (
          <div className="flex items-center space-x-2 text-sm text-neutral-500">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-purple-500"></div>
            <span>Loading AI predictions...</span>
          </div>
        ) : error ? (
          <div className="text-sm text-red-600 bg-red-50 p-2 rounded">
            {error}
          </div>
        ) : (
          <div className="space-y-3">
            {/* Expiry Prediction */}
            {expiryPrediction && expiryStatus && (
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Clock className="h-4 w-4 text-blue-500" />
                  <span className="text-sm font-medium">Expiry Prediction:</span>
                </div>
                <div className={`px-2 py-1 rounded-full text-xs font-medium ${expiryStatus.color}`}>
                  {expiryStatus.text}
                </div>
              </div>
            )}

            {/* Waste Prediction */}
            {wastePrediction && (
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <AlertTriangle className="h-4 w-4 text-orange-500" />
                  <span className="text-sm font-medium">Waste Risk:</span>
                </div>
                <div className={`px-2 py-1 rounded-full text-xs font-medium ${mlService.getWasteRiskColor(wastePrediction.risk_level)}`}>
                  {wastePrediction.risk_level}
                </div>
              </div>
            )}

            {/* Confidence Scores */}
            <div className="flex items-center justify-between text-xs text-neutral-500">
              <div className="flex items-center space-x-4">
                {expiryPrediction && (
                  <span>Expiry: {mlService.formatConfidence(expiryPrediction.confidence)}</span>
                )}
                {wastePrediction && (
                  <span>Waste: {mlService.formatConfidence(wastePrediction.confidence)}</span>
                )}
              </div>
              <span className="text-purple-600">
                {expiryPrediction?.method === 'fallback' ? 'Smart Rules' : 'ML Model'}
              </span>
            </div>

            {/* Recommendations */}
            {wastePrediction && wastePrediction.risk_level === 'High' && (
              <div className="bg-orange-50 border border-orange-200 rounded-lg p-3">
                <div className="flex items-start space-x-2">
                  <TrendingUp className="h-4 w-4 text-orange-600 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-orange-800">Recommendation</p>
                    <p className="text-xs text-orange-700">
                      {mlService.getRiskLevelDescription(wastePrediction.risk_level)}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
