<div align="center">
  <img src="./assets/nourish-logo.png" alt="Nourish Neural Logo" width="120" />
  <h1>Nourish Neural 🧠🥗</h1>
  <p><strong>Predictive kitchen orchestration blending machine learning, behavioural insights, and premium UI craft.</strong></p>

  <!-- Badges -->
  <p>
    <img src="https://img.shields.io/badge/React-18.0-61DAFB?logo=react&logoColor=white&style=for-the-badge" alt="React" />
    <img src="https://img.shields.io/badge/Express.js-Backend-000000?logo=express&logoColor=white&style=for-the-badge" alt="Express" />
    <img src="https://img.shields.io/badge/Capacitor-Android_%7C_iOS-119EFF?logo=capacitor&logoColor=white&style=for-the-badge" alt="Capacitor" />
    <img src="https://img.shields.io/badge/Supabase-Database_%7C_Auth-3ECF8E?logo=supabase&logoColor=white&style=for-the-badge" alt="Supabase" />
    <img src="https://img.shields.io/badge/TensorFlow-Ensemble_ML-FF6F00?logo=tensorflow&logoColor=white&style=for-the-badge" alt="TensorFlow" />
    <img src="https://img.shields.io/badge/Ollama-Local_LLM-000000?logo=ollama&logoColor=white&style=for-the-badge" alt="Ollama" />
  </p>

  <p>
    <i>An AI-first household food management platform built to eradicate food waste through predictive forecasting.</i>
  </p>
</div>

---

## 📱 App Showcase

| Dashboard & Waste Analytics | Smart Pantry & Expiry | ReAct AI Assistant |
|:---:|:---:|:---:|
| <img src="./assets/screenshots/dashboard.jpg" width="250" alt="Dashboard UI"> | <img src="./assets/screenshots/pantry.jpg" width="250" alt="Pantry UI"> | <img src="./assets/screenshots/ai.jpg" width="250" alt="Nurexa AI"> |
| **Real-time Waste Metric Cards** | **Visual Expiry Badges & Risk** | **Agentic Tool-Calling Chat** |

---

## ✨ Overview

Nourish Neural is designed for UK households. A dedicated **Machine Learning Ensemble** (Gradient Boosting + Random Forest + Neural Networks) powers dynamic expiry forecasting and waste prediction logic, while a locally hosted **LLM (Ollama)** drives a true **ReAct AI Agent** that can autonomously query your pantry, predict waste scenarios, and structure real-time recipes. 

The platform runs as a tightly optimized **Progressive Web App (PWA)**, complete with intelligent caching, network resilience, and installability, while also building to a **Native Android APK** via Capacitor.

### Core Architecture
- **Nurexa AI Agent** - Utilises a Thought/Action/Observation execution loop across 7 exclusive tools (`check_pantry`, `predict_waste`, etc.)
- **Waste Forecasting** - Evaluates probability per item; the LLM explicitly explains *why* the item is at risk.
- **Smart Grocery Automation** - Checking an item off functionally patches the database and inserts it directly into the Pantry map.
- **Meal Plan to List** - Full-week AI plan generation that cross-references your current expiry list and pushes missing components to a distinct Grocery List.
- **Image Classifier** - Upload food images; the model automatically detects the category and populates the schema.

---

## 🚀 Quick Start Boot

### Prerequisites
- Node.js 18+ and npm 9+
- Supabase account (database + auth)
- Ollama installed locally (or OpenAI API key)
- Python 3.8+ (for ML prediction layers)

### 1. Initialization
```bash
git clone <repository-url>
cd NourishNeural

# Install Client Stack
cd client && npm install

# Install Server Stack
cd ../server && npm install
```

### 2. Environment Matrix
```bash
cp server/.env.example server/.env
cp client/.env.example client/.env
```
Ensure `SUPABASE_URL`, `SUPABASE_SERVICE_KEY`, and `OLLAMA_BASE_URL` are strictly set.

### 3. Execution
```bash
# Terminal 1: Application Server
cd server && node src/index.js

# Terminal 2: Vite Hot-Reload Client
cd client && npx vite --host 0.0.0.0 --port 3050
```

---

## 🛠️ Tech Stack Topography

- **Frontend Environment**: React 18, TypeScript, TailwindCSS, Framer Motion, React Query.
- **Native Bridges**: Capacitor (Android native APK + iOS PWA), Haptics, Camera, Geolocation.
- **Backend Environment**: Node.js, Express, Rate Limiters, Custom Google/Cloudflare DNS fallback resolution.
- **Data Persistence**: Supabase (PostgreSQL + RLS Auth).
- **Machine Learning**: Scikit-Learn, TensorFlow, Numpy. Piped strictly to Python inference daemons.
- **Maps / Geo**: TomTom SDK (Routing, Directions, Geocoding).

---

## 📂 System Architecture Topology

The application relies on highly isolated bounded contexts:

```text
┌─────────────────────────────┐        ┌──────────────────────────────────┐
│   Vite/React Frontend (PWA) │        │         Express Backend          │
│   + Capacitor Native Shell  │        │   (DNS resilience overrides)     │
│                             │        │                                  │
│  Dashboard + AI Flow        │◄──────►│  /api/ai/agent       (ReAct)     │
│  Pantry + Grocery Sync      │  HTTP  │  /api/waste/predict  (Forest)    │
│  Community Tracking         │        │  /api/appliance      (IoT)       │
└──────────┬──────────────────┘        └──────────┬───────────────────────┘
           │                                      │
           ▼                                      ▼
┌────────────────────┐                 ┌──────────────────────────────────┐
│   Supabase Auth    │                 │   Python ML Inference Engine     │
│   (JWT + RLS Base) │                 │   (Scikit, Tensorflow, H5)       │
└────────────────────┘                 └──────────────────────────────────┘
```

See the specific architectural `.bpmn` diagrams in the root directory for a visual representation of tool-calling execution and automated pantry tracking.

---

## 📄 License
This project is licensed under the MIT License - see the `LICENSE` file for execution terms.
