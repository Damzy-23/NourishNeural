import { useState, useEffect } from 'react';
import { ChefHat, Clock, Users, Star, TrendingUp, X, ShoppingCart, ChevronRight, Search, Filter, ArrowUpDown } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import RecipeScaler from './RecipeScaler';

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
  instructions?: string[];
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
  const [selectedRecipe, setSelectedRecipe] = useState<Recipe | null>(null);
  const [showRecipeModal, setShowRecipeModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [difficultyFilter, setDifficultyFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'rating' | 'time' | 'name'>('rating');

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
        ingredients: ['400g Pasta', '3 Tomatoes', '1 Onion', '4 cloves Garlic', '200ml Cream', '2 tbsp Olive Oil', '1/2 tsp Salt', '1/4 tsp Black Pepper', 'Fresh Basil', '50g Parmesan'],
        cookingTime: 25,
        servings: 4,
        difficulty: 'Easy',
        rating: 4.5,
        category: 'Italian',
        instructions: [
          'Boil pasta in salted water until al dente, about 8-10 minutes',
          'Sauté chopped onions and garlic in olive oil until fragrant',
          'Add diced tomatoes and cook for 5 minutes',
          'Pour in cream and simmer for 3 minutes',
          'Toss cooked pasta with the sauce',
          'Season with salt, pepper, and fresh basil',
          'Serve hot with grated Parmesan cheese'
        ],
        nutritionInfo: { calories: 420, protein: 15, carbs: 65, fat: 12 }
      },
      {
        id: '2',
        name: 'Stir-Fry Chicken & Vegetables',
        description: 'Asian-inspired stir-fry with fresh vegetables',
        ingredients: ['500g Chicken Breast', '2 Bell Peppers', '200g Broccoli', '3 tbsp Soy Sauce', '300g Rice', '1 tbsp Sesame Oil', '1 inch Ginger', '3 cloves Garlic', '1 tbsp Cornstarch'],
        cookingTime: 20,
        servings: 3,
        difficulty: 'Easy',
        rating: 4.3,
        category: 'Asian',
        instructions: [
          'Cook rice according to package instructions',
          'Slice chicken into thin strips and season with cornstarch',
          'Heat sesame oil in a wok over high heat',
          'Stir-fry chicken until golden, about 3-4 minutes',
          'Add ginger, garlic, and vegetables, stir-fry for 3 minutes',
          'Add soy sauce and toss to combine',
          'Serve over steamed rice'
        ],
        nutritionInfo: { calories: 380, protein: 28, carbs: 35, fat: 15 }
      },
      {
        id: '3',
        name: 'Mediterranean Quinoa Bowl',
        description: 'Healthy quinoa bowl with fresh vegetables and feta',
        ingredients: ['1 cup Quinoa', '1 Cucumber', '2 Tomatoes', '1/2 cup Olives', '100g Feta Cheese', '2 tbsp Olive Oil', '1 Lemon', '1/4 cup Fresh Parsley', 'Salt and Pepper'],
        cookingTime: 30,
        servings: 2,
        difficulty: 'Medium',
        rating: 4.7,
        category: 'Mediterranean',
        instructions: [
          'Rinse quinoa and cook in 2 cups of water for 15 minutes',
          'Dice cucumber and tomatoes',
          'Slice olives and crumble feta cheese',
          'Fluff quinoa and let cool slightly',
          'Combine all vegetables with quinoa',
          'Dress with olive oil, lemon juice, salt, and pepper',
          'Garnish with fresh parsley and serve'
        ],
        nutritionInfo: { calories: 350, protein: 12, carbs: 45, fat: 18 }
      },
      {
        id: '4',
        name: 'Classic Beef Stew',
        description: 'Hearty beef stew with root vegetables',
        ingredients: ['750g Beef Chuck', '4 Carrots', '500g Potatoes', '2 Onions', '500ml Beef Stock', '2 tbsp Tomato Paste', '2 tbsp Flour', '3 cloves Garlic', '2 Bay Leaves', '1 tsp Thyme'],
        cookingTime: 120,
        servings: 6,
        difficulty: 'Medium',
        rating: 4.8,
        category: 'Comfort Food',
        instructions: [
          'Cut beef into 2-inch cubes and season with salt and pepper',
          'Coat beef in flour and brown in batches in a Dutch oven',
          'Sauté onions and garlic until softened',
          'Add tomato paste and cook for 1 minute',
          'Return beef to pot with stock, bay leaves, and thyme',
          'Bring to boil, then reduce to simmer for 1.5 hours',
          'Add carrots and potatoes, cook for 30 more minutes',
          'Season to taste and serve hot'
        ],
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

      {/* Search and Filters */}
      <div className="card">
        <div className="card-content">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Search */}
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-2">
                <Search className="h-4 w-4 inline mr-1" />
                Search Recipes
              </label>
              <div className="relative">
                <Search className="h-4 w-4 absolute left-3 top-3 text-neutral-400" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="input pl-10"
                  placeholder="Search by name..."
                />
              </div>
            </div>

            {/* Difficulty Filter */}
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-2">
                <Filter className="h-4 w-4 inline mr-1" />
                Difficulty
              </label>
              <select
                value={difficultyFilter}
                onChange={(e) => setDifficultyFilter(e.target.value)}
                className="input"
              >
                <option value="all">All Levels</option>
                <option value="Easy">Easy</option>
                <option value="Medium">Medium</option>
                <option value="Hard">Hard</option>
              </select>
            </div>

            {/* Category Filter */}
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-2">
                <ChefHat className="h-4 w-4 inline mr-1" />
                Category
              </label>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="input"
              >
                <option value="all">All Categories</option>
                <option value="Italian">Italian</option>
                <option value="Asian">Asian</option>
                <option value="Mediterranean">Mediterranean</option>
                <option value="Comfort Food">Comfort Food</option>
                <option value="Healthy">Healthy</option>
              </select>
            </div>

            {/* Sort By */}
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-2">
                <ArrowUpDown className="h-4 w-4 inline mr-1" />
                Sort By
              </label>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as 'rating' | 'time' | 'name')}
                className="input"
              >
                <option value="rating">Highest Rated</option>
                <option value="time">Quickest</option>
                <option value="name">Name (A-Z)</option>
              </select>
            </div>
          </div>

          {/* Clear Filters Button */}
          <div className="mt-4 flex justify-between items-center pt-4 border-t border-neutral-200">
            <p className="text-sm text-neutral-600">
              Showing <span className="font-semibold text-neutral-900">{recommendedRecipes.filter(recipe => {
                const matchesSearch = recipe.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                  recipe.description.toLowerCase().includes(searchTerm.toLowerCase());
                const matchesDifficulty = difficultyFilter === 'all' || recipe.difficulty === difficultyFilter;
                const matchesCategory = selectedCategory === 'all' || recipe.category === selectedCategory;
                return matchesSearch && matchesDifficulty && matchesCategory;
              }).length}</span> of{' '}
              <span className="font-semibold text-neutral-900">{recommendedRecipes.length}</span> recipes
            </p>
            <button
              onClick={() => {
                setSearchTerm('');
                setDifficultyFilter('all');
                setSelectedCategory('all');
                setSortBy('rating');
              }}
              className="btn btn-outline btn-sm"
            >
              Clear Filters
            </button>
          </div>
        </div>
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
            .filter(recipe => {
              const matchesSearch = recipe.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                recipe.description.toLowerCase().includes(searchTerm.toLowerCase());
              const matchesDifficulty = difficultyFilter === 'all' || recipe.difficulty === difficultyFilter;
              const matchesCategory = selectedCategory === 'all' || recipe.category === selectedCategory;
              return matchesSearch && matchesDifficulty && matchesCategory;
            })
            .sort((a, b) => {
              switch (sortBy) {
                case 'rating':
                  return b.rating - a.rating;
                case 'time':
                  return a.cookingTime - b.cookingTime;
                case 'name':
                  return a.name.localeCompare(b.name);
                default:
                  return 0;
              }
            })
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
                <button
                  onClick={() => {
                    setSelectedRecipe(recipe);
                    setShowRecipeModal(true);
                  }}
                  className="w-full btn btn-outline btn-sm group-hover:btn-primary transition-colors"
                >
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

      {/* No Filtered Results Message */}
      {!isLoading && recommendedRecipes.length > 0 && recommendedRecipes.filter(recipe => {
        const matchesSearch = recipe.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          recipe.description.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesDifficulty = difficultyFilter === 'all' || recipe.difficulty === difficultyFilter;
        const matchesCategory = selectedCategory === 'all' || recipe.category === selectedCategory;
        return matchesSearch && matchesDifficulty && matchesCategory;
      }).length === 0 && (
        <div className="card">
          <div className="card-content text-center py-8">
            <Search className="h-12 w-12 text-neutral-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-neutral-900 mb-2">No recipes match your filters</h3>
            <p className="text-neutral-600 mb-4">
              Try adjusting your search or filter criteria.
            </p>
            <button
              onClick={() => {
                setSearchTerm('');
                setDifficultyFilter('all');
                setSelectedCategory('all');
                setSortBy('rating');
              }}
              className="btn btn-primary"
            >
              Clear All Filters
            </button>
          </div>
        </div>
      )}

      {/* Recipe Detail Modal */}
      <AnimatePresence>
        {showRecipeModal && selectedRecipe && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
            >
              {/* Modal Header */}
              <div className="sticky top-0 bg-white border-b border-neutral-200 px-6 py-4 flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold text-neutral-900">{selectedRecipe.name}</h2>
                  <p className="text-sm text-neutral-600 mt-1">{selectedRecipe.description}</p>
                </div>
                <button
                  onClick={() => setShowRecipeModal(false)}
                  className="btn btn-ghost btn-sm"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              {/* Modal Content */}
              <div className="p-6 space-y-6">
                {/* Recipe Meta */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4 text-sm text-neutral-600">
                    <div className="flex items-center space-x-1">
                      <Clock className="h-4 w-4" />
                      <span>{selectedRecipe.cookingTime} min</span>
                    </div>
                    <div className={`px-3 py-1 rounded-full text-xs font-medium ${getDifficultyColor(selectedRecipe.difficulty)}`}>
                      {selectedRecipe.difficulty}
                    </div>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Star className="h-5 w-5 text-yellow-500 fill-current" />
                    <span className="font-semibold text-neutral-900">{selectedRecipe.rating}</span>
                  </div>
                </div>

                {/* Recipe Scaler with Ingredients and Nutrition */}
                <RecipeScaler
                  recipeName={selectedRecipe.name}
                  ingredients={selectedRecipe.ingredients}
                  baseServings={selectedRecipe.servings}
                  nutritionInfo={selectedRecipe.nutritionInfo}
                />

                {/* Instructions */}
                <div>
                  <h3 className="font-semibold text-neutral-900 mb-3 flex items-center">
                    <ChefHat className="h-5 w-5 mr-2 text-orange-600" />
                    Instructions
                  </h3>
                  <ol className="space-y-3">
                    {(selectedRecipe.instructions || ['Instructions coming soon...']).map((instruction, index) => (
                      <li key={index} className="flex items-start space-x-3">
                        <span className="flex-shrink-0 w-6 h-6 rounded-full bg-orange-100 text-orange-600 text-sm font-semibold flex items-center justify-center">
                          {index + 1}
                        </span>
                        <span className="text-neutral-700 flex-1">{instruction}</span>
                      </li>
                    ))}
                  </ol>
                </div>

                {/* Action Buttons */}
                <div className="flex space-x-3 pt-4 border-t border-neutral-200">
                  <button className="flex-1 btn btn-primary">
                    <ShoppingCart className="h-4 w-4 mr-2" />
                    Add Missing to List
                  </button>
                  <button
                    onClick={() => setShowRecipeModal(false)}
                    className="flex-1 btn btn-outline"
                  >
                    Close
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
