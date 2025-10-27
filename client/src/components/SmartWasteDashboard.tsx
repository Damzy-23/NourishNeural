import { useState, useEffect } from 'react';
import { AlertTriangle, TrendingDown, TrendingUp, Brain, Target } from 'lucide-react';
import { mlService } from '../services/mlService';

interface WastePrediction {
  itemName: string;
  category: string;
  currentStock: number;
  predictedWasteProbability: number;
  riskLevel: 'low' | 'medium' | 'high';
  daysUntilExpiry: number;
  recommendedAction: string;
  potentialSavings: number;
}

interface SmartWasteDashboardProps {
  pantryItems: any[];
}

export default function SmartWasteDashboard({ pantryItems }: SmartWasteDashboardProps) {
  const [wastePredictions, setWastePredictions] = useState<WastePrediction[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [totalPotentialSavings, setTotalPotentialSavings] = useState(0);
  const [highRiskItems, setHighRiskItems] = useState(0);

  useEffect(() => {
    if (pantryItems.length > 0) {
      analyzeWasteRisk();
    }
  }, [pantryItems]);

  const analyzeWasteRisk = async () => {
    setIsAnalyzing(true);
    
    const predictions: WastePrediction[] = [];
    
    for (const item of pantryItems) {
      try {
        // Predict waste probability using ML
        const wastePrediction = await mlService.predictWaste([], {
          category: item.category,
          storage_type: 'fridge',
          purchase_date: item.purchaseDate,
          estimated_price: item.estimatedPrice || 3.00
        });

        // Calculate days until expiry
        const daysUntilExpiry = item.expiryDate 
          ? Math.ceil((new Date(item.expiryDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))
          : 7; // Default to 7 days if no expiry date

        // Determine risk level
        let riskLevel: 'low' | 'medium' | 'high' = 'low';
        let recommendedAction = '';
        let potentialSavings = 0;

        if (wastePrediction.waste_probability > 0.6) {
          riskLevel = 'high';
          recommendedAction = 'Use immediately or freeze';
          potentialSavings = (item.estimatedPrice || 3.00) * 0.8;
        } else if (wastePrediction.waste_probability > 0.4) {
          riskLevel = 'medium';
          recommendedAction = 'Plan to use within 2-3 days';
          potentialSavings = (item.estimatedPrice || 3.00) * 0.5;
        } else {
          riskLevel = 'low';
          recommendedAction = 'Monitor expiry date';
          potentialSavings = (item.estimatedPrice || 3.00) * 0.1;
        }

        predictions.push({
          itemName: item.name,
          category: item.category,
          currentStock: item.quantity,
          predictedWasteProbability: wastePrediction.waste_probability,
          riskLevel,
          daysUntilExpiry,
          recommendedAction,
          potentialSavings
        });
      } catch (error) {
        console.error('Error predicting waste for item:', item.name, error);
      }
    }

    // Sort by risk level and waste probability
    const sortedPredictions = predictions.sort((a, b) => {
      const riskOrder = { high: 3, medium: 2, low: 1 };
      if (riskOrder[a.riskLevel] !== riskOrder[b.riskLevel]) {
        return riskOrder[b.riskLevel] - riskOrder[a.riskLevel];
      }
      return b.predictedWasteProbability - a.predictedWasteProbability;
    });

    setWastePredictions(sortedPredictions);
    setTotalPotentialSavings(predictions.reduce((sum, p) => sum + p.potentialSavings, 0));
    setHighRiskItems(predictions.filter(p => p.riskLevel === 'high').length);

    setIsAnalyzing(false);
  };

  const getRiskColor = (riskLevel: string) => {
    switch (riskLevel) {
      case 'high': return 'text-red-600 bg-red-100 border-red-200';
      case 'medium': return 'text-yellow-600 bg-yellow-100 border-yellow-200';
      case 'low': return 'text-green-600 bg-green-100 border-green-200';
      default: return 'text-gray-600 bg-gray-100 border-gray-200';
    }
  };

  const getExpiryColor = (days: number) => {
    if (days <= 0) return 'text-red-600 bg-red-100';
    if (days <= 2) return 'text-orange-600 bg-orange-100';
    if (days <= 7) return 'text-yellow-600 bg-yellow-100';
    return 'text-green-600 bg-green-100';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <AlertTriangle className="h-5 w-5 text-red-600" />
          <h2 className="text-xl font-semibold text-neutral-900">AI Waste Prevention Dashboard</h2>
          <span className="px-2 py-1 bg-red-100 text-red-600 text-xs font-medium rounded-full">
            SMART
          </span>
        </div>
        
        <button 
          onClick={analyzeWasteRisk}
          disabled={isAnalyzing}
          className="btn btn-outline btn-sm"
        >
          {isAnalyzing ? (
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current mr-2"></div>
          ) : (
            <Brain className="h-4 w-4 mr-2" />
          )}
          Reanalyze
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="card">
          <div className="card-content">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-neutral-600">High Risk Items</p>
                <p className="text-2xl font-bold text-red-600">{highRiskItems}</p>
              </div>
              <AlertTriangle className="h-8 w-8 text-red-500" />
            </div>
          </div>
        </div>
        
        <div className="card">
          <div className="card-content">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-neutral-600">Potential Savings</p>
                <p className="text-2xl font-bold text-green-600">£{totalPotentialSavings.toFixed(2)}</p>
              </div>
              <TrendingUp className="h-8 w-8 text-green-500" />
            </div>
          </div>
        </div>
        
        <div className="card">
          <div className="card-content">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-neutral-600">Items Analyzed</p>
                <p className="text-2xl font-bold text-blue-600">{wastePredictions.length}</p>
              </div>
              <Target className="h-8 w-8 text-blue-500" />
            </div>
          </div>
        </div>
        
        <div className="card">
          <div className="card-content">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-neutral-600">Avg Waste Risk</p>
                <p className="text-2xl font-bold text-orange-600">
                  {wastePredictions.length > 0 
                    ? Math.round(wastePredictions.reduce((sum, p) => sum + p.predictedWasteProbability, 0) / wastePredictions.length * 100)
                    : 0}%
                </p>
              </div>
              <TrendingDown className="h-8 w-8 text-orange-500" />
            </div>
          </div>
        </div>
      </div>

      {/* Waste Predictions List */}
      {isAnalyzing ? (
        <div className="card">
          <div className="card-content">
            <div className="flex items-center space-x-3">
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-red-500"></div>
              <span className="text-neutral-600">Analyzing waste risk for your pantry items...</span>
            </div>
          </div>
        </div>
      ) : (
        <div className="space-y-3">
          {wastePredictions.map((prediction, index) => (
            <div key={index} className={`card border-l-4 ${getRiskColor(prediction.riskLevel).split(' ')[2]}`}>
              <div className="card-content">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <h3 className="font-semibold text-neutral-900">{prediction.itemName}</h3>
                      <div className={`px-2 py-1 rounded-full text-xs font-medium ${getRiskColor(prediction.riskLevel)}`}>
                        {prediction.riskLevel.toUpperCase()} RISK
                      </div>
                      {prediction.daysUntilExpiry > 0 && (
                        <div className={`px-2 py-1 rounded-full text-xs font-medium ${getExpiryColor(prediction.daysUntilExpiry)}`}>
                          {prediction.daysUntilExpiry} days left
                        </div>
                      )}
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                      <div>
                        <p className="text-neutral-600">Waste Probability</p>
                        <div className="flex items-center space-x-2">
                          <div className="w-16 bg-neutral-200 rounded-full h-2">
                            <div 
                              className="bg-red-500 h-2 rounded-full"
                              style={{ width: `${prediction.predictedWasteProbability * 100}%` }}
                            ></div>
                          </div>
                          <span className="font-medium text-neutral-900">
                            {Math.round(prediction.predictedWasteProbability * 100)}%
                          </span>
                        </div>
                      </div>
                      
                      <div>
                        <p className="text-neutral-600">Recommendation</p>
                        <p className="font-medium text-neutral-900">{prediction.recommendedAction}</p>
                      </div>
                      
                      <div>
                        <p className="text-neutral-600">Potential Savings</p>
                        <p className="font-medium text-green-600">£{prediction.potentialSavings.toFixed(2)}</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Brain className="h-4 w-4 text-purple-500" />
                    <span className="text-xs text-purple-600 font-medium">AI Predicted</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* AI Insights */}
      <div className="card bg-red-50 border-red-200">
        <div className="card-content">
          <div className="flex items-start space-x-3">
            <Brain className="h-5 w-5 text-red-600 mt-0.5" />
            <div>
              <h3 className="font-semibold text-red-900 mb-2">AI Waste Prevention Insights</h3>
              <ul className="text-sm text-red-800 space-y-1">
                <li>• High-risk items should be used within 1-2 days to prevent waste</li>
                <li>• Consider freezing items that are close to expiry</li>
                <li>• Plan meals around items with highest waste probability</li>
                <li>• You could save £{totalPotentialSavings.toFixed(2)} by following AI recommendations</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
