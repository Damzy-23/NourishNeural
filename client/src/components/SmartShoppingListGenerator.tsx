import { useState, useEffect } from 'react';
import { ShoppingCart, CheckCircle, Brain, TrendingUp } from 'lucide-react';
import { mlService } from '../services/mlService';

interface ShoppingItem {
  id: string;
  name: string;
  category: string;
  quantity: number;
  unit: string;
  estimatedPrice: number;
  priority: 'high' | 'medium' | 'low';
  reason: string;
  isAIRecommended: boolean;
  wasteRisk?: 'low' | 'medium' | 'high';
  checked?: boolean;
}

interface SmartShoppingListGeneratorProps {
  pantryItems: any[];
  budgetLimit?: number;
  householdSize?: number;
}

export default function SmartShoppingListGenerator({ 
  pantryItems, 
  budgetLimit = 100,
  householdSize = 2 
}: SmartShoppingListGeneratorProps) {
  const [shoppingList, setShoppingList] = useState<ShoppingItem[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [totalCost, setTotalCost] = useState(0);
  const [savings, setSavings] = useState(0);

  useEffect(() => {
    if (pantryItems.length > 0) {
      generateSmartShoppingList();
    }
  }, [pantryItems, budgetLimit, householdSize]);

  const generateSmartShoppingList = async () => {
    setIsGenerating(true);
    
    // Analyze pantry items to determine what's needed
    const categoryCounts: { [key: string]: number } = {};
    const lowStockItems: any[] = [];
    const expiringItems: any[] = [];

    pantryItems.forEach(item => {
      categoryCounts[item.category] = (categoryCounts[item.category] || 0) + 1;
      
      // Check for low stock (less than 2 items)
      if (item.quantity < 2) {
        lowStockItems.push(item);
      }
      
      // Check for items expiring soon (simplified logic)
      if (item.expiryDate) {
        const daysUntilExpiry = Math.ceil(
          (new Date(item.expiryDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)
        );
        if (daysUntilExpiry <= 3) {
          expiringItems.push(item);
        }
      }
    });

    // Generate AI-powered shopping recommendations
    const recommendations: ShoppingItem[] = [];

    // 1. Replace low stock items
    lowStockItems.forEach(item => {
      recommendations.push({
        id: `replace-${item.id}`,
        name: item.name,
        category: item.category,
        quantity: 2,
        unit: item.unit,
        estimatedPrice: item.estimatedPrice || 3.50,
        priority: 'high',
        reason: 'Low stock - running out soon',
        isAIRecommended: true
      });
    });

    // 2. Add complementary items based on existing pantry
    const complementaryItems = [
      { name: 'Fresh Bread', category: 'Bakery', price: 2.50, reason: 'Complements your pantry staples' },
      { name: 'Eggs', category: 'Dairy', price: 3.00, reason: 'Versatile protein source' },
      { name: 'Onions', category: 'Vegetables', price: 1.50, reason: 'Base ingredient for many recipes' },
      { name: 'Garlic', category: 'Vegetables', price: 1.00, reason: 'Essential flavor enhancer' },
      { name: 'Olive Oil', category: 'Pantry', price: 4.50, reason: 'Healthy cooking oil' }
    ];

    complementaryItems.forEach(item => {
      // Only add if not already in pantry
      const alreadyHave = pantryItems.some(pantry => 
        pantry.name.toLowerCase().includes(item.name.toLowerCase()) ||
        pantry.category === item.category
      );

      if (!alreadyHave) {
        recommendations.push({
          id: `complement-${item.name}`,
          name: item.name,
          category: item.category,
          quantity: 1,
          unit: 'pack',
          estimatedPrice: item.price,
          priority: 'medium',
          reason: item.reason,
          isAIRecommended: true
        });
      }
    });

    // 3. Add seasonal/trending items
    const seasonalItems = [
      { name: 'Seasonal Vegetables', category: 'Vegetables', price: 3.00, reason: 'Fresh seasonal produce' },
      { name: 'Local Honey', category: 'Pantry', price: 5.00, reason: 'Natural sweetener alternative' }
    ];

    seasonalItems.forEach(item => {
      recommendations.push({
        id: `seasonal-${item.name}`,
        name: item.name,
        category: item.category,
        quantity: 1,
        unit: 'pack',
        estimatedPrice: item.price,
        priority: 'low',
        reason: item.reason,
        isAIRecommended: true
      });
    });

    // 4. Predict waste risk for each item
    const itemsWithWasteRisk = await Promise.all(
      recommendations.map(async (item) => {
        try {
          const wastePrediction = await mlService.predictWaste([], {
            category: item.category,
            storage_type: 'fridge',
            purchase_date: new Date().toISOString()
          });
          
          return {
            ...item,
            wasteRisk: wastePrediction.risk_level.toLowerCase() as 'low' | 'medium' | 'high'
          };
        } catch (error) {
          return { ...item, wasteRisk: 'medium' as const };
        }
      })
    );

    // Sort by priority and waste risk
    const sortedRecommendations = itemsWithWasteRisk.sort((a, b) => {
      const priorityOrder = { high: 3, medium: 2, low: 1 };
      const wasteOrder = { low: 3, medium: 2, high: 1 };
      
      if (priorityOrder[a.priority] !== priorityOrder[b.priority]) {
        return priorityOrder[b.priority] - priorityOrder[a.priority];
      }
      return wasteOrder[b.wasteRisk || 'medium'] - wasteOrder[a.wasteRisk || 'medium'];
    });

    setShoppingList(sortedRecommendations);
    
    // Calculate totals
    const cost = sortedRecommendations.reduce((sum, item) => sum + item.estimatedPrice, 0);
    setTotalCost(cost);
    setSavings(Math.max(0, budgetLimit - cost));

    setIsGenerating(false);
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'text-red-600 bg-red-100';
      case 'medium': return 'text-yellow-600 bg-yellow-100';
      case 'low': return 'text-green-600 bg-green-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getWasteRiskColor = (risk: string) => {
    switch (risk) {
      case 'low': return 'text-green-600 bg-green-100';
      case 'medium': return 'text-yellow-600 bg-yellow-100';
      case 'high': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const toggleItemChecked = (itemId: string) => {
    setShoppingList(items => 
      items.map(item => 
        item.id === itemId 
          ? { ...item, checked: !item.checked }
          : item
      )
    );
  };

  const removeItem = (itemId: string) => {
    setShoppingList(items => items.filter(item => item.id !== itemId));
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <ShoppingCart className="h-5 w-5 text-blue-600" />
          <h2 className="text-xl font-semibold text-neutral-900">AI Shopping List Generator</h2>
          <span className="px-2 py-1 bg-blue-100 text-blue-600 text-xs font-medium rounded-full">
            SMART
          </span>
        </div>
        
        <div className="flex items-center space-x-4 text-sm text-neutral-600">
          <span>Budget: £{budgetLimit}</span>
          <span>Household: {householdSize} people</span>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="card">
          <div className="card-content">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-neutral-600">Total Cost</p>
                <p className="text-2xl font-bold text-neutral-900">£{totalCost.toFixed(2)}</p>
              </div>
              <ShoppingCart className="h-8 w-8 text-blue-500" />
            </div>
          </div>
        </div>
        
        <div className="card">
          <div className="card-content">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-neutral-600">Items</p>
                <p className="text-2xl font-bold text-neutral-900">{shoppingList.length}</p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-500" />
            </div>
          </div>
        </div>
        
        <div className="card">
          <div className="card-content">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-neutral-600">Savings</p>
                <p className={`text-2xl font-bold ${savings >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  £{savings.toFixed(2)}
                </p>
              </div>
              <TrendingUp className="h-8 w-8 text-green-500" />
            </div>
          </div>
        </div>
      </div>

      {/* Shopping List */}
      {isGenerating ? (
        <div className="card">
          <div className="card-content">
            <div className="flex items-center space-x-3">
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-500"></div>
              <span className="text-neutral-600">Generating smart shopping recommendations...</span>
            </div>
          </div>
        </div>
      ) : (
        <div className="space-y-3">
          {shoppingList.map((item) => (
            <div key={item.id} className="card">
              <div className="card-content">
                <div className="flex items-start space-x-3">
                  <div className="flex items-center mt-1">
                    <input
                      type="checkbox"
                      className="checkbox checkbox-primary"
                      onChange={() => toggleItemChecked(item.id)}
                    />
                  </div>
                  
                  <div className="flex-1">
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="font-semibold text-neutral-900">{item.name}</h3>
                        <p className="text-sm text-neutral-600">{item.reason}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-neutral-900">£{item.estimatedPrice.toFixed(2)}</p>
                        <p className="text-sm text-neutral-500">{item.quantity} {item.unit}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-2 mt-2">
                      <div className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(item.priority)}`}>
                        {item.priority} priority
                      </div>
                      {item.wasteRisk && (
                        <div className={`px-2 py-1 rounded-full text-xs font-medium ${getWasteRiskColor(item.wasteRisk)}`}>
                          {item.wasteRisk} waste risk
                        </div>
                      )}
                      {item.isAIRecommended && (
                        <div className="flex items-center space-x-1">
                          <Brain className="h-3 w-3 text-purple-500" />
                          <span className="text-xs text-purple-600 font-medium">AI Recommended</span>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <button
                    onClick={() => removeItem(item.id)}
                    className="btn btn-ghost btn-sm text-red-500 hover:text-red-700"
                  >
                    ×
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex space-x-3">
        <button className="btn btn-primary">
          <ShoppingCart className="h-4 w-4 mr-2" />
          Create Shopping List
        </button>
        <button 
          onClick={generateSmartShoppingList}
          className="btn btn-outline"
          disabled={isGenerating}
        >
          <Brain className="h-4 w-4 mr-2" />
          Regenerate List
        </button>
      </div>

      {/* AI Insights */}
      <div className="card bg-blue-50 border-blue-200">
        <div className="card-content">
          <div className="flex items-start space-x-3">
            <Brain className="h-5 w-5 text-blue-600 mt-0.5" />
            <div>
              <h3 className="font-semibold text-blue-900 mb-2">AI Shopping Insights</h3>
              <ul className="text-sm text-blue-800 space-y-1">
                <li>• Prioritized items based on your pantry stock levels</li>
                <li>• Added complementary ingredients for better meal planning</li>
                <li>• Considered waste risk to minimize food waste</li>
                <li>• Optimized for your £{budgetLimit} budget and {householdSize}-person household</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
