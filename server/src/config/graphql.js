const { ApolloServer } = require('apollo-server-express');
const { gql } = require('apollo-server-express');

// GraphQL schema definition
const typeDefs = gql`
  type User {
    id: ID!
    email: String!
    firstName: String!
    lastName: String!
    avatarUrl: String
    isVerified: Boolean!
    role: String!
    createdAt: String!
    updatedAt: String!
    preferences: UserPreferences
    groceryLists: [GroceryList!]!
    pantry: [PantryItem!]!
  }

  type UserPreferences {
    id: ID!
    userId: ID!
    dietaryRestrictions: [String!]!
    budgetLimit: Float!
    householdSize: Int!
    preferredStores: [String!]!
    createdAt: String!
    updatedAt: String!
  }

  type GroceryList {
    id: ID!
    name: String!
    userId: ID!
    items: [GroceryItem!]!
    totalEstimatedCost: Float
    store: Store
    status: String!
    createdAt: String!
    updatedAt: String!
  }

  type GroceryItem {
    id: ID!
    name: String!
    quantity: Float!
    unit: String!
    category: String!
    estimatedPrice: Float
    isChecked: Boolean!
    notes: String
    barcode: String
    storeAvailability: [StoreAvailability!]
  }

  type Store {
    id: ID!
    name: String!
    chain: String!
    address: String!
    latitude: Float!
    longitude: Float!
    phone: String
    website: String
    openingHours: [OpeningHours!]
    loyaltyProgram: String
    deliveryAvailable: Boolean!
    clickAndCollect: Boolean!
  }

  type StoreAvailability {
    storeId: ID!
    store: Store!
    price: Float!
    inStock: Boolean!
    lastUpdated: String!
  }

  type OpeningHours {
    day: String!
    open: String!
    close: String!
  }

  type PantryItem {
    id: ID!
    name: String!
    quantity: Float!
    unit: String!
    category: String!
    expiryDate: String
    purchaseDate: String!
    estimatedPrice: Float
    barcode: String
    notes: String
    createdAt: String!
    updatedAt: String!
  }

  type AIResponse {
    message: String!
    suggestions: [String!]
    recipes: [Recipe!]
    nutritionInfo: NutritionInfo
    substitutions: [String!]
  }

  type Recipe {
    id: ID!
    name: String!
    ingredients: [RecipeIngredient!]!
    instructions: [String!]!
    prepTime: Int!
    cookTime: Int!
    servings: Int!
    difficulty: String!
    cuisine: String!
    nutritionPerServing: NutritionInfo
    tags: [String!]!
  }

  type RecipeIngredient {
    name: String!
    quantity: Float!
    unit: String!
    notes: String
  }

  type NutritionInfo {
    calories: Float
    protein: Float
    carbs: Float
    fat: Float
    fiber: Float
    sugar: Float
    sodium: Float
  }

  type Query {
    # User queries
    me: User
    user(id: ID!): User
    
    # Grocery list queries
    groceryLists: [GroceryList!]!
    groceryList(id: ID!): GroceryList
    
    # Store queries
    stores(near: LocationInput, chain: String): [Store!]!
    store(id: ID!): Store
    storeAvailability(storeId: ID!, items: [String!]!): [StoreAvailability!]!
    
    # Pantry queries
    pantry: [PantryItem!]!
    pantryItem(id: ID!): PantryItem
    
    # AI queries
    aiChat(message: String!): AIResponse!
    recipeSuggestions(ingredients: [String!]!, dietaryRestrictions: [String!]): [Recipe!]!
    nutritionAnalysis(food: String!): NutritionInfo!
  }

  input LocationInput {
    latitude: Float!
    longitude: Float!
    radius: Float
  }

  input GroceryItemInput {
    name: String!
    quantity: Float!
    unit: String!
    category: String!
    estimatedPrice: Float
    notes: String
    barcode: String
  }

  input GroceryListInput {
    name: String!
    items: [GroceryItemInput!]!
    storeId: ID
  }

  input PantryItemInput {
    name: String!
    quantity: Float!
    unit: String!
    category: String!
    expiryDate: String
    estimatedPrice: Float
    barcode: String
    notes: String
  }

  input UserPreferencesInput {
    dietaryRestrictions: [String!]!
    budgetLimit: Float!
    householdSize: Int!
    preferredStores: [String!]!
  }

  type Mutation {
    # User mutations
    updatePreferences(preferences: UserPreferencesInput!): UserPreferences!
    
    # Grocery list mutations
    createGroceryList(input: GroceryListInput!): GroceryList!
    updateGroceryList(id: ID!, input: GroceryListInput!): GroceryList!
    deleteGroceryList(id: ID!): Boolean!
    addItemToList(listId: ID!, item: GroceryItemInput!): GroceryList!
    removeItemFromList(listId: ID!, itemId: ID!): GroceryList!
    toggleItemChecked(listId: ID!, itemId: ID!): GroceryList!
    
    # Pantry mutations
    addPantryItem(input: PantryItemInput!): PantryItem!
    updatePantryItem(id: ID!, input: PantryItemInput!): PantryItem!
    deletePantryItem(id: ID!): Boolean!
    updatePantryQuantity(id: ID!, quantity: Float!): PantryItem!
    
    # AI interactions
    processReceipt(imageUrl: String!): [PantryItem!]!
    scanBarcode(barcode: String!): GroceryItem!
  }

  type Subscription {
    groceryListUpdated(userId: ID!): GroceryList!
    pantryUpdated(userId: ID!): [PantryItem!]!
  }
`;

// Resolvers
const resolvers = {
  Query: {
    me: (parent, args, { user }) => {
      if (!user) throw new Error('Not authenticated');
      return user;
    },
    user: async (parent, { id }, { db }) => {
      return await db('users').where({ id }).first();
    },
    groceryLists: async (parent, args, { user, db }) => {
      if (!user) throw new Error('Not authenticated');
      return await db('grocery_lists').where({ user_id: user.id });
    },
    groceryList: async (parent, { id }, { user, db }) => {
      if (!user) throw new Error('Not authenticated');
      return await db('grocery_lists').where({ id, user_id: user.id }).first();
    },
    stores: async (parent, { near, chain }, { db }) => {
      let query = db('stores');
      
      if (chain) {
        query = query.where({ chain });
      }
      
      if (near) {
        // Simple distance calculation (in production, use PostGIS)
        query = query.select('*')
          .select(db.raw(`
            (6371 * acos(cos(radians(?)) * cos(radians(latitude)) * 
             cos(radians(longitude) - radians(?)) + 
             sin(radians(?)) * sin(radians(latitude)))) AS distance
          `, [near.latitude, near.longitude, near.latitude]))
          .orderBy('distance');
      }
      
      return await query;
    },
    store: async (parent, { id }, { db }) => {
      return await db('stores').where({ id }).first();
    },
    pantry: async (parent, args, { user, db }) => {
      if (!user) throw new Error('Not authenticated');
      return await db('pantry_items').where({ user_id: user.id });
    },
    aiChat: async (parent, { message }, { user, openai }) => {
      // AI chat implementation
      return {
        message: "AI response placeholder",
        suggestions: [],
        recipes: [],
        nutritionInfo: null,
        substitutions: []
      };
    }
  },
  
  Mutation: {
    createGroceryList: async (parent, { input }, { user, db }) => {
      if (!user) throw new Error('Not authenticated');
      
      const [list] = await db('grocery_lists').insert({
        name: input.name,
        user_id: user.id,
        store_id: input.storeId,
        status: 'active',
        created_at: new Date(),
        updated_at: new Date()
      }).returning('*');
      
      // Add items
      if (input.items && input.items.length > 0) {
        const items = input.items.map(item => ({
          list_id: list.id,
          name: item.name,
          quantity: item.quantity,
          unit: item.unit,
          category: item.category,
          estimated_price: item.estimatedPrice,
          notes: item.notes,
          barcode: item.barcode,
          is_checked: false,
          created_at: new Date()
        }));
        
        await db('grocery_items').insert(items);
      }
      
      return list;
    },
    
    addPantryItem: async (parent, { input }, { user, db }) => {
      if (!user) throw new Error('Not authenticated');
      
      const [item] = await db('pantry_items').insert({
        user_id: user.id,
        name: input.name,
        quantity: input.quantity,
        unit: input.unit,
        category: input.category,
        expiry_date: input.expiryDate,
        purchase_date: new Date(),
        estimated_price: input.estimatedPrice,
        barcode: input.barcode,
        notes: input.notes,
        created_at: new Date(),
        updated_at: new Date()
      }).returning('*');
      
      return item;
    }
  },
  
  User: {
    preferences: async (parent, args, { db }) => {
      return await db('user_preferences').where({ user_id: parent.id }).first();
    },
    groceryLists: async (parent, args, { db }) => {
      return await db('grocery_lists').where({ user_id: parent.id });
    },
    pantry: async (parent, args, { db }) => {
      return await db('pantry_items').where({ user_id: parent.id });
    }
  },
  
  GroceryList: {
    items: async (parent, args, { db }) => {
      return await db('grocery_items').where({ list_id: parent.id });
    },
    store: async (parent, args, { db }) => {
      if (!parent.store_id) return null;
      return await db('stores').where({ id: parent.store_id }).first();
    }
  },
  
  GroceryItem: {
    storeAvailability: async (parent, args, { db }) => {
      // This would integrate with external store APIs
      return [];
    }
  }
};

// Apollo Server setup
async function setupGraphQL(app) {
  const server = new ApolloServer({
    typeDefs,
    resolvers,
    context: ({ req }) => ({
      user: req.user,
      db: require('./database').db,
      openai: require('openai')
    }),
    formatError: (error) => {
      console.error('GraphQL Error:', error);
      return {
        message: error.message,
        path: error.path
      };
    }
  });

  await server.start();
  server.applyMiddleware({ app, path: '/graphql' });
  
  console.log('✅ GraphQL server ready at /graphql');
}

module.exports = {
  setupGraphQL
}; 