# Nourish Neural - AI Culinary Intelligence

> Predictive kitchen orchestration blending machine learning, behavioural insights, and premium UI craft.

## Overview

Nourish Neural is an AI-first household food management platform. Ensemble ML models (GradientBoosting + Neural Networks) power expiry forecasting and waste prediction, while a local LLM (Ollama) drives a ReAct agent that can query your pantry, predict waste, and suggest recipes in real-time. The platform automates pantry tracking, predicts shortages, maps UK supermarket pricing, and nudges sustainable habits through a clean, focused interface.

## Core Capabilities

- **Predictive Pantry** - Real-time freshness scoring, expiry forecasting, and depletion alerts powered by trained ML models.
- **Nurexa AI (ReAct Agent)** - Data-aware AI assistant that queries your actual pantry, checks expiring items, predicts waste risk, and suggests recipes using a Thought/Action/Observation reasoning loop.
- **Waste Analytics & Forecasting** - LLM-powered waste trend forecasting from historical data, with actionable insights and reduction tips on the Dashboard.
- **Smart Meal Planning** - LLM-generated weekly meal plans that prioritise expiring pantry items to prevent waste, with recipe database fallback.
- **Waste Prediction Explanations** - ML predictions augmented with natural-language explanations from the LLM, telling users *why* an item is at risk and what to do.
- **Grocery Lists** - Shopping list management with item tracking, progress, and export.
- **Store Atlas** - UK store discovery with distance, hours, directions, and chain filtering across 15+ retailers.

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

4. **Start Ollama** (if using local AI)
   ```bash
   ollama serve
   ollama pull llama3.2:1b
   ```

5. **Start development servers**
   ```bash
   # Terminal 1: Backend
   cd server && npm run dev

   # Terminal 2: Frontend
   cd client && npm run dev
   ```

6. **Access the app**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:5000
   - Health check: http://localhost:5000/health

See `QUICK_START_SUPABASE.md` for detailed Supabase setup.

## Architecture

```
NourishNeural/
├── client/                 # React + Tailwind frontend
│   ├── src/pages/          # Dashboard, Pantry, Stores, AIAssistant, MealPlan, GroceryLists
│   ├── src/components/     # Shared UI components
│   ├── src/hooks/          # Auth, data, and UI logic hooks
│   └── src/services/       # API abstraction layer
├── server/                 # Node/Express backend
│   └── src/routes/         # REST endpoints
│       ├── ai.js           # Chat + ReAct agent with tool-calling
│       ├── waste.js        # Waste logging, prediction, explanation, forecasting
│       ├── meal-planner.js # LLM-powered meal planning
│       ├── pantry.js       # Pantry CRUD with Supabase
│       └── stores.js       # UK store discovery
├── ml-models/              # Python ML pipeline
│   ├── src/models/         # ExpiryPrediction, WastePrediction, FoodRecognition
│   ├── predict.py          # Inference endpoint called by Node.js
│   └── training/           # Model training scripts
└── uk-stores-dataset/      # Aggregated UK supermarket dataset
```

### System Architecture

```
┌────────────────────────┐        ┌──────────────────────────────┐
│   Vite/React Frontend  │        │       Express Backend        │
│                        │        │                              │
│  Dashboard             │  HTTP  │  /api/ai/chat     (Chat)    │
│  Pantry                │◄──────►│  /api/ai/agent    (ReAct)   │
│  Meal Plan             │        │  /api/waste/*     (Waste)   │
│  Grocery Lists         │        │  /api/meal-planner (Meals)  │
│  AI Assistant (Nurexa) │        │  /api/pantry      (CRUD)   │
│  Stores                │        │  /api/stores      (Search)  │
└────────┬───────────────┘        └──────────┬───────────────────┘
         │                                   │
         ▼                                   ▼
┌────────────────────┐    ┌──────────────────────────────────────┐
│   Supabase Auth    │    │           Supabase DB                │
│   (JWT + OAuth)    │    │  pantry_items, waste_logs,           │
└────────────────────┘    │  meal_plans, user_profiles           │
                          └──────────────────┬───────────────────┘
                                             │
                          ┌──────────────────┴───────────────────┐
                          │                                      │
                    ┌─────┴──────┐                    ┌──────────┴──────┐
                    │  Ollama    │                    │  Python ML      │
                    │  (Local    │                    │  Models         │
                    │  LLM)     │                    │  (Expiry/Waste  │
                    │           │                    │   Prediction)   │
                    └────────────┘                    └─────────────────┘
```

### ReAct Agent Flow
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
Thought: I have enough info.
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
| POST | `/api/meal-planner/generate` | LLM-powered plan (prioritises expiring items) |
| POST | `/api/meal-planner/shopping-list` | Generate shopping list from plan |

### Pantry & Stores
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET/POST | `/api/pantry` | Pantry CRUD operations |
| GET | `/api/stores/search` | UK store discovery with filters |

## Tech Stack

- **Frontend**: React 18, TypeScript, TailwindCSS, React Query, Framer Motion
- **Backend**: Node.js, Express
- **Database**: Supabase (PostgreSQL + Auth + Storage)
- **AI/LLM**: Ollama (local) or OpenAI API, with ReAct agent pattern
- **ML Models**: GradientBoosting + Neural Network ensemble (Python, scikit-learn, PyTorch)
- **Tooling**: Vite, ESLint, React Helmet Async, Lucide icons

## App Pages

| Page | Purpose |
|------|---------|
| **Dashboard** | Overview metrics, quick actions, waste analytics with AI forecasting |
| **Grocery Lists** | Create and manage shopping lists with item tracking |
| **Pantry** | Food inventory with expiry tracking and waste logging |
| **Stores** | UK store finder with distance, hours, and directions |
| **Nurexa AI** | Chat with ReAct agent (queries pantry, predicts waste, suggests recipes) |
| **Meal Plan** | Weekly meal calendar with LLM-powered generation |
| **Profile** | User settings and preferences |

## Roadmap

- **Phase 1**: Done - Core auth, pantry, Nurexa AI chat, store integration, branding
- **Phase 2**: Done - Waste analytics, ReAct agent, LLM meal planning, waste forecasting
- **Phase 3**: Hyper-personalised nutrition, meal kits, sustainability scoring
- **Phase 4**: AR inventory, smart appliance integrations, federated learning

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
