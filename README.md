# Nourish Neural - AI Culinary Intelligence

> Predictive kitchen orchestration blending machine learning, behavioural insights, and premium UI craft.

## Overview

Nourish Neural is an AI-first household food management platform built for UK households. Ensemble ML models (GradientBoosting + RandomForest + Neural Networks) power expiry forecasting and waste prediction, while a local LLM (Ollama) drives a ReAct agent that can query your pantry, predict waste, and suggest recipes in real-time. The platform automates pantry tracking, predicts shortages, maps UK supermarket pricing, and nudges sustainable habits through a polished, mobile-first interface.

## Core Capabilities

### AI & Machine Learning
- **Nurexa AI (ReAct Agent)** - Data-aware AI assistant using a Thought/Action/Observation reasoning loop with 5 tools: `check_pantry`, `get_expiring_items`, `check_waste_stats`, `predict_waste`, `suggest_recipes`.
- **Waste Prediction & Explanation** - ML ensemble predicts waste probability per item; LLM explains *why* an item is at risk and what to do about it.
- **Waste Trend Forecasting** - LLM-powered forecasting from historical waste data with actionable reduction tips on the Dashboard.
- **Smart Meal Planning** - LLM-generated weekly meal plans that prioritise expiring pantry items. Falls back to a built-in recipe database when the LLM is offline.
- **Food Image Classifier** - Upload a photo of food and the ML model auto-detects the category to pre-fill pantry item details.

### Smart Automation
- **Grocery to Pantry Auto-Add** - Check off a grocery item as purchased and it automatically appears in your pantry. Existing items get their quantity incremented; new items are created with today's purchase date.
- **Meal Plan to Grocery List** - Generate a shopping list of missing ingredients from your meal plan, then one-click "Add All to Grocery List" to create a ready-to-use shopping list.
- **Expiry Alerts** - Browser push notifications for items expiring within 2 days via the Notification API.
- **Smart Shopping List Generator** - AI-powered grocery list generation based on pantry gaps and consumption patterns.

### Scanning & Recognition
- **Barcode Scanner** - Scan product barcodes to auto-populate item details from a product database.
- **Receipt Scanner** - Photograph a receipt to bulk-import purchased items with prices into your pantry.
- **Food Image Classifier** - Camera-based food category detection for quick pantry additions.

### Household & Social
- **Household Management** - Create or join a household with invite codes. Shared pantry, grocery lists, and meal plans across members with admin/member roles.
- **Loyalty Card Management** - Store and manage supermarket loyalty cards with validation and store-specific lookups.
- **List Sharing & Export** - Share grocery lists via native share or clipboard, export to PDF.

### Store Discovery
- **Store Atlas** - UK store finder across 15+ retailers with distance, opening hours, and chain filtering.
- **Directions & Navigation** - TomTom-powered routing with car/bicycle/pedestrian modes, traffic levels, and turn-by-turn instructions.

### Production & Reliability
- **Progressive Web App (PWA)** - Installable on mobile/desktop with Workbox service worker, NetworkFirst API caching, and CacheFirst static asset caching.
- **Offline Support** - Cached data displayed when offline with an amber "You're offline" banner.
- **Error Boundary** - Graceful crash recovery with reset button and dashboard redirect.
- **Auth Rate Limiting** - 15 requests per 15 minutes on login/register/forgot-password to prevent brute-force.
- **Dark Mode** - System-aware theme toggle via ThemeContext.

## Quick Start

### Prerequisites
- Node.js 18+ and npm 9+
- Supabase account (database + auth)
- Ollama installed locally (or OpenAI API key)
- Python 3.8+ (for ML prediction models)

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd NourishNeural
   ```

2. **Install dependencies**
   ```bash
   cd client && npm install && cd ../server && npm install && cd ..
   ```

3. **Environment setup**
   ```bash
   cp server/.env.example server/.env
   cp client/.env.example client/.env
   ```

   Key server `.env` variables:
   ```
   SUPABASE_URL=your-supabase-url
   SUPABASE_SERVICE_KEY=your-service-key
   USE_OLLAMA=true
   OLLAMA_BASE_URL=http://localhost:11434/v1
   OLLAMA_MODEL=llama3.2:1b
   OLLAMA_AGENT_MODEL=llama3.2:3b   # Optional: larger model for ReAct agent
   OPENAI_API_KEY=ollama             # Set to 'ollama' when using local models
   ```

4. **Database migration**
   Run `PREFERENCES_MIGRATION.sql` in your Supabase SQL Editor to add user preferences columns.

5. **Start Ollama** (if using local AI)
   ```bash
   ollama serve
   ollama pull llama3.2:1b
   ```

6. **Start development servers**
   ```bash
   # Terminal 1: Backend
   cd server && npm run dev

   # Terminal 2: Frontend
   cd client && npm run dev
   ```

7. **Access the app**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:5000
   - Health check: http://localhost:5000/health

See `QUICK_START_SUPABASE.md` for detailed Supabase setup.

## Architecture

```
NourishNeural/
├── client/                 # React + TypeScript + Tailwind frontend
│   ├── src/pages/          # Dashboard, Pantry, Stores, AIAssistant,
│   │                       # MealPlanCalendar, GroceryLists, Profile, LandingPage
│   ├── src/components/     # BarcodeScanner, ReceiptScanner, SmartFoodClassifier,
│   │                       # SmartWasteDashboard, SmartShoppingListGenerator,
│   │                       # StoreFinder, DirectionsMap, ErrorBoundary, Layout
│   ├── src/hooks/          # useAuth, useHousehold, useExpiryAlerts
│   ├── src/contexts/       # ThemeContext (dark mode)
│   └── src/services/       # API abstraction layer (axios)
├── server/                 # Node/Express backend
│   └── src/
│       ├── routes/         # REST endpoints
│       │   ├── ai.js           # Chat + ReAct agent with tool-calling
│       │   ├── waste.js        # Waste logging, prediction, explanation, forecasting
│       │   ├── meal-planner.js # LLM-powered meal planning + shopping list
│       │   ├── pantry.js       # Pantry CRUD with deduplication
│       │   ├── supabase-groceries.js  # Grocery lists + auto-add to pantry
│       │   ├── supabase-auth.js       # Auth with rate limiting
│       │   ├── stores.js       # UK store discovery
│       │   ├── households.js   # Household creation, invites, members
│       │   ├── loyalty.js      # Loyalty card management
│       │   ├── barcode.js      # Product barcode lookup
│       │   └── ml.js           # ML model bridge (Node → Python)
│       ├── services/       # barcodeService, loyaltyService, mlService
│       └── middleware/     # JWT auth, rate limiting
├── ml-models/              # Python ML pipeline
│   ├── src/models/         # ExpiryPrediction, WastePrediction, FoodRecognition
│   ├── predict.py          # Inference endpoint (with NumpyEncoder, rule-based fallback)
│   └── training/           # Model training scripts
└── uk-stores-dataset/      # Aggregated UK supermarket dataset
```

### System Architecture

```
┌─────────────────────────────┐        ┌──────────────────────────────────┐
│   Vite/React Frontend (PWA) │        │         Express Backend          │
│                              │        │                                  │
│  Landing Page                │  HTTP  │  /api/ai/chat        (Chat)     │
│  Dashboard + Waste Analytics │◄──────►│  /api/ai/agent       (ReAct)    │
│  Pantry + Barcode/Receipt    │        │  /api/waste/*        (Waste)    │
│  Meal Plan + Shopping List   │        │  /api/meal-planner   (Meals)    │
│  Grocery Lists (→ Pantry)    │        │  /api/pantry         (CRUD)     │
│  AI Assistant (Nurexa)       │        │  /api/groceries      (Lists)    │
│  Stores + Directions         │        │  /api/stores         (Search)   │
│  Profile + Preferences       │        │  /api/households     (Groups)   │
│  Household Management        │        │  /api/loyalty        (Cards)    │
│                              │        │  /api/barcode        (Lookup)   │
└──────────┬───────────────────┘        └──────────┬───────────────────────┘
           │                                       │
           ▼                                       ▼
┌────────────────────┐    ┌──────────────────────────────────────────────┐
│   Supabase Auth    │    │              Supabase DB                     │
│   (JWT + OAuth)    │    │  pantry_items, waste_logs, meal_plans,       │
│   Rate-limited     │    │  grocery_lists, grocery_list_items,          │
└────────────────────┘    │  user_preferences, households,               │
                          │  household_members, loyalty_accounts         │
                          └──────────┬───────────────────────────────────┘
                                     │
                          ┌──────────┴─────────────────────────┐
                          │                                    │
                    ┌─────┴──────┐                  ┌──────────┴──────┐
                    │  Ollama    │                  │  Python ML      │
                    │  Local LLM │                  │  Ensemble       │
                    │  (ReAct +  │                  │  (GradientBoost │
                    │   Meals +  │                  │   + RandomForest│
                    │   Forecast)│                  │   + NeuralNet)  │
                    └────────────┘                  └─────────────────┘
```

### Smart Automation Flows

**Grocery → Pantry (auto-add on purchase)**
```
Check off item in grocery list
  → Backend toggles is_checked = true
  → Checks if item exists in pantry (by name + scope)
  → Yes: increments quantity
  → No: creates new pantry item with today's date
  → Frontend shows toast: "Chicken added to pantry 🥫"
```

**Meal Plan → Grocery List (one-click)**
```
View meal plan → Click "Shopping List"
  → Backend extracts all ingredients from planned meals
  → Filters out items already in pantry
  → Shows missing ingredients in modal
  → Click "Add All to Grocery List"
  → Creates grocery list: "Meal Plan — 17 Mar – 23 Mar 2026"
```

**ReAct Agent**
```
User: "What should I cook tonight?"
  │
  ▼
Thought: I need to check what's expiring soon.
Action: get_expiring_items(days: 2)
Observation: [milk (1 day), spinach (2 days), chicken (3 days)]
  │
  ▼
Thought: I should find recipes using these ingredients.
Action: suggest_recipes(ingredients: ["milk", "spinach", "chicken"])
Observation: [Creamy Chicken & Spinach - 3/5 match, ...]
  │
  ▼
Final Answer: "Your milk and spinach expire soon! Try Creamy Chicken &
              Spinach tonight - it uses all three expiring items..."
```

## API Endpoints

### AI & Agent
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/ai/chat` | General chat with Nurexa AI |
| POST | `/api/ai/agent` | ReAct agent (data-aware, tool-calling) |
| POST | `/api/ai/recipes` | Recipe suggestions from ingredients |
| POST | `/api/ai/nutrition` | Nutrition analysis for foods |
| POST | `/api/ai/substitutions` | Ingredient substitution suggestions |

### Waste Management
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/waste/stats` | Waste statistics by time range |
| POST | `/api/waste` | Log a wasted item |
| POST | `/api/waste/predict` | ML waste probability prediction |
| POST | `/api/waste/predict/explain` | ML prediction + LLM explanation |
| POST | `/api/waste/forecast` | LLM-based waste trend forecasting |

### Meal Planning
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/meal-planner` | List user's meal plans |
| POST | `/api/meal-planner` | Create a meal plan |
| PUT | `/api/meal-planner/:id` | Update a meal plan |
| DELETE | `/api/meal-planner/:id` | Delete a meal plan |
| POST | `/api/meal-planner/generate` | LLM-powered plan (prioritises expiring items) |
| POST | `/api/meal-planner/shopping-list` | Generate shopping list from plan |

### Grocery Lists
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/groceries` | List all grocery lists (personal or household scope) |
| POST | `/api/groceries` | Create a grocery list with items |
| PUT | `/api/groceries/:id` | Update list name/status |
| DELETE | `/api/groceries/:id` | Delete a list (cascades items) |
| POST | `/api/groceries/:id/items` | Add item to a list |
| PATCH | `/api/groceries/:listId/items/:itemId/toggle` | Toggle purchased (auto-adds to pantry) |
| DELETE | `/api/groceries/:listId/items/:itemId` | Remove item from list |

### Pantry
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/pantry` | List pantry items with filters (category, expiring, low stock) |
| GET | `/api/pantry/stats` | Pantry statistics (totals, value, category breakdown) |
| GET | `/api/pantry/categories` | Unique categories used by user |
| POST | `/api/pantry` | Add item (deduplicates by barcode or name) |
| PUT | `/api/pantry/:id` | Update item |
| DELETE | `/api/pantry/:id` | Soft delete (archive) or hard delete |
| POST | `/api/pantry/:id/consume` | Reduce quantity (auto-archives at 0) |

### Stores & Barcode
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/stores/search` | UK store discovery with distance, hours, chain filtering |
| GET | `/api/barcode/:code` | Product lookup by barcode |

### Households
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/households` | Create a household |
| POST | `/api/households/join` | Join via invite code |
| GET | `/api/households/mine` | Get user's household with members |
| PUT | `/api/households/:id` | Update household details |
| DELETE | `/api/households/:id` | Delete household (admin only) |

### Loyalty
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/loyalty` | List user's loyalty accounts |
| POST | `/api/loyalty` | Add a loyalty card |
| PUT | `/api/loyalty/:id` | Update loyalty card |
| DELETE | `/api/loyalty/:id` | Remove loyalty card |

### Auth
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Register (rate-limited: 15/15min) |
| POST | `/api/auth/login` | Login (rate-limited: 15/15min) |
| POST | `/api/auth/forgot-password` | Password reset (rate-limited: 15/15min) |

## Tech Stack

- **Frontend**: React 18, TypeScript, TailwindCSS, React Query, Framer Motion, Lucide Icons
- **Backend**: Node.js, Express, express-rate-limit
- **Database**: Supabase (PostgreSQL + Auth + Row Level Security)
- **AI/LLM**: Ollama (local, qwen2.5:3b via custom nurexa model) or OpenAI API
- **ML Models**: GradientBoosting + RandomForest + Neural Network ensemble (Python, scikit-learn, TensorFlow)
- **PWA**: vite-plugin-pwa, Workbox (NetworkFirst + CacheFirst strategies)
- **Maps**: TomTom SDK (routing, directions, geocoding)
- **Tooling**: Vite, ESLint, React Helmet Async, jsPDF, react-hot-toast

## App Pages

| Page | Purpose |
|------|---------|
| **Landing Page** | Public marketing page with feature highlights and sign-up CTAs |
| **Dashboard** | Overview metrics, waste analytics with AI forecasting, food classifier, quick actions |
| **Grocery Lists** | Create/manage shopping lists with progress tracking, PDF export, sharing. Purchased items auto-add to pantry |
| **Pantry** | Food inventory with expiry tracking, barcode/receipt scanning, image classification, waste risk indicators, consume/archive |
| **Stores** | UK store finder across 15+ retailers with distance, hours, directions, and TomTom routing |
| **Nurexa AI** | Chat with ReAct agent that queries pantry, predicts waste, and suggests recipes |
| **Meal Plan** | Weekly calendar with LLM-powered generation, manual editing, and one-click grocery list creation |
| **Profile** | 6-tab settings hub: Profile info, Preferences (dietary/allergies/cuisine/budget), Notifications, Privacy, Loyalty cards, Household management |

## Roadmap

- **Phase 1**: Done - Core auth, pantry, Nurexa AI chat, store integration, branding
- **Phase 2**: Done - Waste analytics, ReAct agent, LLM meal planning, waste forecasting
- **Phase 3**: Done - Household management, PWA/offline, barcode/receipt scanning, grocery-pantry automation, meal-plan-to-grocery flow, user preferences, loyalty cards, expiry alerts, production hardening
- **Phase 4**: Hyper-personalised nutrition, meal kits, sustainability scoring, AR inventory, smart appliance integrations

## Research Artifacts

- `DISSERTATION_PLAN.md` - Research methodology and timeline
- `DISSERTATION_README.md` - Dissertation-specific project overview
- `LITERATURE_REVIEW.md` - Literature review on AI, behavioural science, and food waste
- `RESEARCH_PROPOSAL_REVISED.md` - Research proposal and objectives
- `OLLAMA_TRANSITION.md` - Technical log of cloud-to-local LLM transition

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/neural-upgrade`)
3. Commit (`git commit -m "feat: add neural pantry animation"`)
4. Push (`git push origin feature/neural-upgrade`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file.
