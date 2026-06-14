<div align="center">
  <img src="assets/logo.png" alt="Nourish Neural" width="120" />
  <h1>Nourish Neural</h1>
  <p><strong>AI-first household food management platform for predictive pantry orchestration, waste reduction, and nutritional intelligence.</strong></p>

  <p>
    <img src="https://img.shields.io/badge/React-18.0-61DAFB?logo=react&logoColor=white&style=flat-square" alt="React" />
    <img src="https://img.shields.io/badge/TypeScript-Frontend-3178C6?logo=typescript&logoColor=white&style=flat-square" alt="TypeScript" />
    <img src="https://img.shields.io/badge/Node.js-Express-339933?logo=nodedotjs&logoColor=white&style=flat-square" alt="Node.js" />
    <img src="https://img.shields.io/badge/Supabase-PostgreSQL-3ECF8E?logo=supabase&logoColor=white&style=flat-square" alt="Supabase" />
    <img src="https://img.shields.io/badge/TensorFlow-ML_Ensemble-FF6F00?logo=tensorflow&logoColor=white&style=flat-square" alt="TensorFlow" />
    <img src="https://img.shields.io/badge/Ollama-ReAct_Agent-000000?logo=ollama&logoColor=white&style=flat-square" alt="Ollama" />
    <img src="https://img.shields.io/badge/Capacitor-Mobile-119EFF?logo=capacitor&logoColor=white&style=flat-square" alt="Capacitor" />
  </p>
</div>

---

## The Problem

UK households waste 9.5 million tonnes of food annually. Most pantry management tools are manual checklists that add cognitive load rather than removing it. Users forget what they have, miss expiry dates, and buy duplicates.

## The Solution

Nourish Neural removes the guesswork. An ensemble of three ML models predicts waste risk and expiry dates. A conversational AI agent (Nurexa) reasons through your pantry data using a ReAct loop with 7 specialised tools. The platform auto-generates meal plans around expiring ingredients, tracks nutritional balance against NHS guidelines, and surfaces actionable insights — all while running the LLM locally for data privacy.

---

## Key Features

| Feature | Description |
|---|---|
| **Waste Prediction** | Ensemble ML (Random Forest 40% + Gradient Boosting 30% + Neural Network 30%) trained on 45 features including storage conditions, seasonal patterns, and user behaviour |
| **Nurexa AI Agent** | ReAct-based conversational agent with 7 tools: pantry search, expiry alerts, waste prediction, recipe suggestions, waste stats, household nutrition, carbon footprint |
| **Nutritional Analysis** | Health scoring against NHS Eatwell Guide, macro/micronutrient tracking, dietary gap detection, personalised recommendations |
| **Smart Grocery Lists** | AI-ranked shopping with real-time store pricing across 16+ UK supermarkets |
| **Meal Planning** | LLM-generated weekly meal plans built around expiring ingredients and dietary restrictions |
| **Food Recognition** | MobileNetV3-based image classification with storage recommendations and quality scoring |
| **Carbon Tracking** | CO2e footprint calculation per item using Poore & Nemecek reference data |
| **PWA + Mobile** | Offline-first Progressive Web App with Capacitor for native Android/iOS builds |

---

## Architecture

```
                        ┌──────────────────────────────┐
                        │     React 18 + TypeScript     │
                        │   Vite  |  Tailwind  |  PWA   │
                        │   Recharts  |  Framer Motion  │
                        └──────────────┬───────────────┘
                                       │ HTTPS / JWT
                        ┌──────────────┴───────────────┐
                        │    Express REST API (Node)    │
                        │  Helmet | CORS | Rate Limit   │
                        │     JWT Auth Middleware        │
                        └───────┬──────────┬────────────┘
                                │          │
                 ┌──────────────┴──┐   ┌───┴──────────────────┐
                 │    Supabase     │   │   AI / ML Layer       │
                 │  PostgreSQL +   │   │                       │
                 │  Auth + RLS     │   │  Ollama LLM (local)   │
                 │                 │   │  ReAct Agent (7 tools) │
                 └─────────────────┘   │  Python ML Pipeline   │
                                       │  TensorFlow + sklearn │
                                       └───────────────────────┘
```

### Tech Stack

| Layer | Technologies |
|---|---|
| **Frontend** | React 18, TypeScript, Vite, Tailwind CSS, Framer Motion, Recharts, React Query, React Hook Form |
| **Backend** | Node.js, Express, JWT, Helmet, CORS, express-rate-limit, Joi validation |
| **Database** | Supabase (PostgreSQL), Row-Level Security, real-time subscriptions |
| **AI/ML** | TensorFlow, scikit-learn, 3-model ensemble, 45-feature pipeline, custom NumpyEncoder |
| **LLM** | Ollama (local), Qwen 2.5 3B custom model, ReAct agent framework |
| **Mobile** | Capacitor (iOS + Android), Workbox service worker, offline-first caching |

---

## ML Pipeline

1. **Data Collection** — Pantry items, purchase history, waste logs, storage conditions, seasonal patterns
2. **Feature Engineering** — 45 features including user behaviour metrics, food characteristics, environmental factors, and temporal sine/cosine encoding
3. **Model Training** — Random Forest (tree-based), Gradient Boosting (sequential error correction), Neural Network (TensorFlow/Keras, 128-64-32 MLP)
4. **Ensemble Prediction** — Weighted soft-voting: RF 40% + GB 30% + NN 30%, calibrated via Platt scaling
5. **Explainability** — Feature importance, per-model confidence scores, natural language explanations, GDPR Article 22 compliance

### Model Performance (held-out test set)

| Metric | Score |
|---|---|
| Accuracy | 94.2% |
| Precision | 91.8% |
| Recall | 93.5% |
| F1 Score | 92.6% |

---

## ReAct Agent

The conversational AI (Nurexa) follows a Thought → Action → Observation loop with a maximum of 5 reasoning steps:

**Available Tools:**
- `check_pantry` — Search items by name or category
- `get_expiring_items` — Find items expiring within N days
- `predict_waste` — ML-powered waste risk prediction
- `suggest_recipes` — Recipes based on available ingredients
- `check_waste_stats` — Waste history and trends
- `get_household_nutrition` — Household dietary needs
- `check_carbon_footprint` — Environmental impact calculation

**Safety Guardrails:**
- No medical or clinical advice — redirects to qualified professionals
- Mandatory source attribution on all recommendations
- Explicit uncertainty acknowledgement — no hallucinated information
- Adversarial prompt injection resistance (100% pass rate)

---

## AI Governance

Nourish Neural voluntarily applies high-risk governance practices despite operating at the EU AI Act's limited-risk tier, because food safety predictions can indirectly affect health outcomes.

- **Explainability** — Every prediction includes feature importance, per-model scores, and confidence intervals
- **Safety** — Medical advice boundaries, food safety conservatism (false positives > false negatives), allergen cross-referencing
- **Privacy** — GDPR-compliant data handling, user data export (Article 20), right to erasure (Article 17), anonymised ML training data
- **Auditability** — All AI decisions logged with timestamps, input data, model versions, and output scores
- **Testing** — 247 test cases across functional, safety, edge case, and adversarial categories (94.3% pass rate, 100% safety pass rate)
- **Compliance** — Aligned with GDPR, NHS Digital Service Standards, NICE Evidence Framework, EU AI Act, ICO AI Guidance

---

## Getting Started

### Prerequisites

- **Node.js** 18.0.0+
- **Python** 3.8+ (for ML inference)
- **Supabase** project with Auth and PostgreSQL configured
- **Ollama** (optional, for local LLM — agent falls back gracefully when offline)

### Installation

```bash
git clone https://github.com/damzydesigns/NourishNeural.git
cd NourishNeural

# Install all dependencies (client + server)
npm run install:all

# Configure environment
cp server/.env.example server/.env
# Set: SUPABASE_URL, SUPABASE_SERVICE_KEY, OLLAMA_BASE_URL
```

### Running

```bash
# Start both frontend and backend
npm run dev

# Frontend: http://localhost:3050
# Backend:  http://localhost:5000
```

### Python ML Environment (optional)

```bash
cd ml-models
python -m venv .venv
.venv/Scripts/activate    # Windows
# .venv/bin/activate      # macOS/Linux
pip install -r requirements.txt
```

---

## Project Structure

```
NourishNeural/
├── client/                  # React + TypeScript frontend
│   ├── src/
│   │   ├── components/      # Reusable UI components
│   │   ├── hooks/           # Custom React hooks (useAuth, useHousehold, useExpiryAlerts)
│   │   ├── pages/           # Page components (22 pages)
│   │   ├── services/        # API service layer
│   │   └── utils/           # Utilities and motion variants
│   └── public/              # Static assets, PWA manifest
├── server/                  # Node.js + Express backend
│   ├── src/
│   │   ├── config/          # Supabase client configuration
│   │   ├── middleware/      # JWT auth, rate limiting
│   │   └── routes/          # API route handlers (15 route files)
│   └── .env                 # Environment configuration
├── ml-models/               # Python ML pipeline
│   └── src/models/          # Waste prediction, expiry prediction, food recognition
├── api/                     # Vercel serverless functions
└── assets/                  # Logos, icons, PWA assets
```

---

## Pages

### Core Application (authenticated)
- Dashboard, Grocery Lists, Pantry, Stores, Nurexa AI Assistant, Recipes, Meal Plan Calendar, Challenges, Profile

### Public Showcase
- Landing Page, How It Works, AI Explainability Centre, Nutritional Health Insights, Prompt Engineering Lab, AI Governance & Compliance, Agent Testing & Evaluation

### Utility
- Support Centre, Contact, Terms of Service, Privacy Policy

---

## API Endpoints

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| POST | `/api/auth/register` | No | Register new user |
| POST | `/api/auth/login` | No | Login |
| GET | `/api/dashboard` | Optional | Dashboard stats |
| GET | `/api/pantry` | JWT | List pantry items |
| POST | `/api/waste/predict` | JWT | ML waste prediction |
| POST | `/api/waste/predict/explain` | JWT | Prediction + NL explanation |
| GET | `/api/waste/stats` | JWT | Waste analytics |
| POST | `/api/ai/agent` | JWT | ReAct agent conversation |
| GET | `/api/nutrition` | JWT | Nutrition profile |
| GET | `/api/users/export` | JWT | GDPR data export |
| POST | `/api/contact` | No | Contact form submission |

---

## Security

- JWT authentication via Supabase Auth
- Bcrypt password hashing
- Rate limiting on auth endpoints (15 requests / 15 minutes)
- Helmet.js security headers
- CORS whitelist with Capacitor native support
- Joi input validation
- Row-Level Security on all Supabase tables
- No sensitive data in URL parameters

---

## Licence

MIT License. See [LICENSE](LICENSE) for details.
