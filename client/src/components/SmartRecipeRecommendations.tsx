import React, { useState, useEffect } from 'react';
import { ChefHat, Clock, Users, Star, TrendingUp, Heart } from 'lucide-react';
import { mlService, type FoodItem } from '../services/mlService';

interface Recipe {
  id: string;
  name: string;
  description: string;
  ingredients: string[];
  cookingTime: number;
  servings: number;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  rating: number;
  category: string;
  imageUrl?: string;
  nutritionInfo?: {
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
  };
}

interface SmartRecipeRecommendationsProps {
  pantryItems: any[];
  userPreferences?: {
    dietaryRestrictions: string[];
    maxCookingTime: number;
    servingSize: number;
  };
}

export default function SmartRecipeRecommendations({ 
  pantryItems, 
  userPreferences 
}: SmartRecipeRecommendationsProps) {
  const [recommendedRecipes, setRecommendedRecipes] = useState<Recipe[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  useEffect(() => {
    if (pantryItems.length > 0) {
      generateRecommendations();
    }
  }, [pantryItems, userPreferences]);

  const generateRecommendations = async () => {
    setIsLoading(true);
    
    // Simulate AI-powered recipe recommendations based on pantry items
    const mockRecipes: Recipe[] = [
      {
        id: '1',
        name: 'Quick Pasta Primavera',
        description: 'Fresh vegetables with pasta in a light cream sauce',
        ingredients: ['Pasta', 'Tomatoes', 'Onions', 'Garlic', 'Cream'],
        cookingTime: 25,
        servings: 4,
        difficulty: 'Easy',
        rating: 4.5,
        category: 'Italian',
        nutritionInfo: { calories: 420, protein: 15, carbs: 65, fat: 12 }
      },
      {
        id: '2',
        name: 'Stir-Fry Chicken & Vegetables',
        description: 'Asian-inspired stir-fry with fresh vegetables',
        ingredients: ['Chicken Breast', 'Bell Peppers', 'Broccoli', 'Soy Sauce', 'Rice'],
        cookingTime: 20,
        servings: 3,
        difficulty: 'Easy',
        rating: 4.3,
        category: 'Asian',
        nutritionInfo: { calories: 380, protein: 28, carbs: 35, fat: 15 }
      },
      {
        id: '3',
        name: 'Mediterranean Quinoa Bowl',
        description: 'Healthy quinoa bowl with fresh vegetables and feta',
        ingredients: ['Quinoa', 'Cucumber', 'Tomatoes', 'Olives', 'Feta Cheese'],
        cookingTime: 30,
        servings: 2,
        difficulty: 'Medium',
        rating: 4.7,
        category: 'Mediterranean',
        nutritionInfo: { calories: 350, protein: 12, carbs: 45, fat: 18 }
      },
      {
        id: '4',
        name: 'Classic Beef Stew',
        description: 'Hearty beef stew with root vegetables',
        ingredients: ['Beef', 'Carrots', 'Potatoes', 'Onions', 'Beef Stock'],
        cookingTime: 120,
        servings: 6,
        difficulty: 'Medium',
        rating: 4.8,
        category: 'Comfort Food',
        nutritionInfo: { calories: 450, protein: 35, carbs: 25, fat: 22 }
      }
    ];

    // Filter recipes based on available pantry items
    const availableRecipes = mockRecipes.filter(recipe => {
      const availableIngredients = recipe.ingredients.filter(ingredient => 
        pantryItems.some(item => 
          item.name.toLowerCase().includes(ingredient.toLowerCase()) ||
          ingredient.toLowerCase().includes(item.category.toLowerCase())
        )
      );
      return availableIngredients.length >= Math.ceil(recipe.ingredients.length * 0.7);
    });

    // Sort by rating and cooking time preferences
    const sortedRecipes = availableRecipes.sort((a, b) => {
      if (userPreferences?.maxCookingTime && a.cookingTime <= userPreferences.maxCookingTime && b.cookingTime > userPreferences.maxCookingTime) {
        return -1;
      }
      return b.rating - a.rating;
    });

    setRecommendedRecipes(sortedRecipes.slice(0, 4));
    setIsLoading(false);
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'Easy': return 'text-green-600 bg-green-100';
      case 'Medium': return 'text-yellow-600 bg-yellow-100';
      case 'Hard': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getCategoryColor = (category: string) => {
    const colors: { [key: string]: string } = {
      'Italian': 'text-red-600 bg-red-100',
      'Asian': 'text-orange-600 bg-orange-100',
      'Mediterranean': 'text-blue-600 bg-blue-100',
      'Comfort Food': 'text-purple-600 bg-purple-100',
      'Healthy': 'text-green-600 bg-green-100'
    };
    return colors[category] || 'text-gray-600 bg-gray-100';
  };

  if (pantryItems.length === 0) {
    return (
      <div className="card">
        <div className="card-content text-center py-8">
          <ChefHat className="h-12 w-12 text-neutral-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-neutral-900 mb-2">No Pantry Items</h3>
          <p className="text-neutral-600 mb-4">
            Add some items to your pantry to get AI-powered recipe recommendations!
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <ChefHat className="h-5 w-5 text-orange-600" />
          <h2 className="text-xl font-semibold text-neutral-900">AI Recipe Recommendations</h2>
          <span className="px-2 py-1 bg-orange-100 text-orange-600 text-xs font-medium rounded-full">
            SMART
          </span>
        </div>
        
        <div className="flex items-center space-x-2">
          <span className="text-sm text-neutral-600">Based on {pantryItems.length} pantry items</span>
          <TrendingUp className="h-4 w-4 text-green-500" />
        </div>
      </div>

      {/* Filter */}
      <div className="flex space-x-2 overflow-x-auto">
        {['all', 'Easy', 'Medium', 'Hard'].map((filter) => (
          <button
            key={filter}
            onClick={() => setSelectedCategory(filter)}
            className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
              selectedCategory === filter
                ? 'bg-orange-500 text-white'
                : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'
            }`}
          >
            {filter === 'all' ? 'All Recipes' : filter}
          </button>
        ))}
      </div>

      {/* Recipes Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="card animate-pulse">
              <div className="card-content">
                <div className="h-4 bg-neutral-200 rounded mb-3"></div>
                <div className="h-3 bg-neutral-200 rounded mb-2"></div>
                <div className="h-3 bg-neutral-200 rounded w-2/3"></div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {recommendedRecipes
            .filter(recipe => selectedCategory === 'all' || recipe.difficulty === selectedCategory)
            .map((recipe) => (
            <div key={recipe.id} className="card hover:shadow-medium transition-all duration-200 group">
              <div className="card-content">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <h3 className="font-semibold text-neutral-900 mb-1 group-hover:text-orange-600 transition-colors">
                      {recipe.name}
                    </h3>
                    <p className="text-sm text-neutral-600 mb-2">{recipe.description}</p>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Star className="h-4 w-4 text-yellow-500 fill-current" />
                    <span className="text-sm font-medium text-neutral-700">{recipe.rating}</span>
                  </div>
                </div>

                {/* Recipe Meta */}
                <div className="flex items-center space-x-4 mb-3 text-xs text-neutral-600">
                  <div className="flex items-center space-x-1">
                    <Clock className="h-3 w-3" />
                    <span>{recipe.cookingTime}min</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Users className="h-3 w-3" />
                    <span>{recipe.servings} servings</span>
                  </div>
                  <div className={`px-2 py-1 rounded-full text-xs font-medium ${getDifficultyColor(recipe.difficulty)}`}>
                    {recipe.difficulty}
                  </div>
                </div>

                {/* Category Badge */}
                <div className="flex items-center justify-between mb-3">
                  <div className={`px-2 py-1 rounded-full text-xs font-medium ${getCategoryColor(recipe.category)}`}>
                    {recipe.category}
                  </div>
                  {recipe.nutritionInfo && (
                    <span className="text-xs text-neutral-500">
                      {recipe.nutritionInfo.calories} cal/serving
                    </span>
                  )}
                </div>

                {/* Ingredients Match */}
                <div className="mb-3">
                  <p className="text-xs text-neutral-600 mb-2">Available ingredients:</p>
                  <div className="flex flex-wrap gap-1">
                    {recipe.ingredients.slice(0, 4).map((ingredient, index) => {
                      const isAvailable = pantryItems.some(item => 
                        item.name.toLowerCase().includes(ingredient.toLowerCase()) ||
                        ingredient.toLowerCase().includes(item.category.toLowerCase())
                      );
                      return (
                        <span
                          key={index}
                          className={`px-2 py-1 rounded-full text-xs ${
                            isAvailable 
                              ? 'bg-green-100 text-green-700' 
                              : 'bg-neutral-100 text-neutral-500'
                          }`}
                        >
                          {ingredient}
                        </span>
                      );
                    })}
                    {recipe.ingredients.length > 4 && (
                      <span className="px-2 py-1 rounded-full text-xs bg-neutral-100 text-neutral-500">
                        +{recipe.ingredients.length - 4} more
                      </span>
                    )}
                  </div>
                </div>

                {/* Action Button */}
                <button className="w-full btn btn-outline btn-sm group-hover:btn-primary transition-colors">
                  <ChefHat className="h-4 w-4 mr-2" />
                  View Recipe
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* No Recipes Message */}
      {!isLoading && recommendedRecipes.length === 0 && (
        <div className="card">
          <div className="card-content text-center py-8">
            <ChefHat className="h-12 w-12 text-neutral-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-neutral-900 mb-2">No Recipes Found</h3>
            <p className="text-neutral-600">
              Try adding more diverse ingredients to your pantry for better recipe suggestions.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
