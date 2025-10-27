import React, { useState } from 'react';
import { Search, Brain, CheckCircle, XCircle } from 'lucide-react';
import { mlService, type FoodClassification } from '../services/mlService';

interface SmartFoodClassifierProps {
  onClassification?: (classification: FoodClassification) => void;
  placeholder?: string;
}

export default function SmartFoodClassifier({ 
  onClassification, 
  placeholder = "Enter food name (e.g., 'Whole Milk 1L')" 
}: SmartFoodClassifierProps) {
  const [foodName, setFoodName] = useState('');
  const [classification, setClassification] = useState<FoodClassification | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleClassify = async () => {
    if (!foodName.trim()) return;

    try {
      setIsLoading(true);
      setError(null);
      setClassification(null);

      const result = await mlService.classifyFood(foodName.trim());
      setClassification(result);
      
      if (onClassification) {
        onClassification(result);
      }
    } catch (err) {
      console.error('Classification failed:', err);
      setError('Failed to classify food item');
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleClassify();
    }
  };

  const getCategoryColor = (category: string) => {
    const colors: { [key: string]: string } = {
      'Dairy': 'text-blue-600 bg-blue-100',
      'Meat': 'text-red-600 bg-red-100',
      'Fish': 'text-cyan-600 bg-cyan-100',
      'Vegetables': 'text-green-600 bg-green-100',
      'Fruits': 'text-orange-600 bg-orange-100',
      'Bakery': 'text-amber-600 bg-amber-100',
      'Pantry': 'text-purple-600 bg-purple-100',
      'Frozen': 'text-indigo-600 bg-indigo-100',
      'Beverages': 'text-teal-600 bg-teal-100',
      'Unknown': 'text-gray-600 bg-gray-100'
    };
    return colors[category] || colors['Unknown'];
  };

  const getCategoryIcon = (category: string) => {
    // Simple emoji-based icons for categories
    const icons: { [key: string]: string } = {
      'Dairy': '🥛',
      'Meat': '🥩',
      'Fish': '🐟',
      'Vegetables': '🥬',
      'Fruits': '🍎',
      'Bakery': '🥖',
      'Pantry': '🥫',
      'Frozen': '🧊',
      'Beverages': '🥤',
      'Unknown': '❓'
    };
    return icons[category] || icons['Unknown'];
  };

  return (
    <div className="space-y-4">
      {/* Input Section */}
      <div className="flex space-x-3">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-neutral-400" />
          <input
            type="text"
            value={foodName}
            onChange={(e) => setFoodName(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder={placeholder}
            className="input input-bordered w-full pl-10"
            disabled={isLoading}
          />
        </div>
        <button
          onClick={handleClassify}
          disabled={!foodName.trim() || isLoading}
          className="btn btn-primary"
        >
          {isLoading ? (
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
          ) : (
            <>
              <Brain className="h-4 w-4 mr-2" />
              Classify
            </>
          )}
        </button>
      </div>

      {/* Error Display */}
      {error && (
        <div className="alert alert-error">
          <XCircle className="h-4 w-4" />
          <span>{error}</span>
        </div>
      )}

      {/* Classification Result */}
      {classification && (
        <div className="card">
          <div className="card-content">
            <div className="flex items-center space-x-3 mb-4">
              <div className="text-2xl">{getCategoryIcon(classification.category)}</div>
              <div className="flex-1">
                <h3 className="font-semibold text-neutral-900">{classification.food_name}</h3>
                <p className="text-sm text-neutral-600">AI Classification Result</p>
              </div>
              <div className="flex items-center space-x-2">
                <Brain className="h-4 w-4 text-purple-500" />
                <span className="text-xs text-purple-600 font-medium">AI Enhanced</span>
              </div>
            </div>

            <div className="space-y-3">
              {/* Category */}
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-neutral-700">Category:</span>
                <div className={`px-3 py-1 rounded-full text-sm font-medium ${getCategoryColor(classification.category)}`}>
                  {classification.category}
                </div>
              </div>

              {/* Confidence */}
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-neutral-700">Confidence:</span>
                <div className="flex items-center space-x-2">
                  <div className="w-16 bg-neutral-200 rounded-full h-2">
                    <div 
                      className="bg-purple-500 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${classification.confidence * 100}%` }}
                    ></div>
                  </div>
                  <span className="text-sm font-medium text-neutral-600">
                    {mlService.formatConfidence(classification.confidence)}
                  </span>
                </div>
              </div>

              {/* Method */}
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-neutral-700">Method:</span>
                <div className="flex items-center space-x-2">
                  {classification.method === 'fallback' ? (
                    <>
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      <span className="text-sm text-green-600 font-medium">Smart Rules</span>
                    </>
                  ) : (
                    <>
                      <Brain className="h-4 w-4 text-purple-500" />
                      <span className="text-sm text-purple-600 font-medium">ML Model</span>
                    </>
                  )}
                </div>
              </div>
            </div>

            {/* Success Message */}
            <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg">
              <div className="flex items-center space-x-2">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <span className="text-sm font-medium text-green-800">
                  Food item successfully classified!
                </span>
              </div>
              <p className="text-xs text-green-700 mt-1">
                This classification can be used for expiry predictions and waste risk assessment.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
