<div align="center">
  <img src="https://raw.githubusercontent.com/Nourish-Neural/assets/main/logo.png" alt="Nourish Neural Concept" width="140" />
  <h1>Nourish Neural 🧠🥗</h1>
  <p><strong>Predictive kitchen orchestration blending machine learning, behavioural insights, and premium UI craft.</strong></p>

  <p>
    <img src="https://img.shields.io/badge/React-18.0-61DAFB?logo=react&logoColor=white&style=flat-square" alt="React" />
    <img src="https://img.shields.io/badge/Express.js-Backend-000000?logo=express&logoColor=white&style=flat-square" alt="Express" />
    <img src="https://img.shields.io/badge/Capacitor-Android_%7C_iOS-119EFF?logo=capacitor&logoColor=white&style=flat-square" alt="Capacitor" />
    <img src="https://img.shields.io/badge/Supabase-Database_%7C_Auth-3ECF8E?logo=supabase&logoColor=white&style=flat-square" alt="Supabase" />
    <img src="https://img.shields.io/badge/TensorFlow-Ensemble_ML-FF6F00?logo=tensorflow&logoColor=white&style=flat-square" alt="TensorFlow" />
    <img src="https://img.shields.io/badge/Ollama-Local_LLM-000000?logo=ollama&logoColor=white&style=flat-square" alt="Ollama" />
  </p>
  <p><i>An AI-first household food management platform built to eradicate food waste through predictive forecasting.</i></p>
</div>

---

## ✦ The Problem
Annually, households globally waste millions of tonnes of perfectly edible food due to poor tracking and lack of cohesive meal planning. Existing pantry managers are manual tracking chores. 

## ✦ The Solution: Nourish Neural
Nourish Neural bridges the gap. By leveraging an **Ensemble Machine Learning** architecture (Gradient Boosting + Random Forests + Neural Networks) and a locally hosted **LLM Agent** (Ollama), the platform takes the cognitive load entirely off the user. Nourish Neural *predicts* when your food goes bad before you even know, builds meal plans to use those exact expiring ingredients, and autonomously patches your grocery list.

---

## ⚡ Core Modalities

| 🧠 Intelligent Architecture | ♻️ Smart Automation | 🌍 Sustainability |
| :--- | :--- | :--- |
| **Nurexa AI Agent**<br>A fully-fledged ReAct agent operating with tool-calling precision to act autonomously on your pantry data. | **Auto-Add Synchronization**<br>Checking off a grocery item perfectly auto-maps it to the active pantry stock via Express REST APIs. | **Carbon Matrix Tracking**<br>Quantifies ecological footprints (CO2e/kg) utilizing the Poore & Nemecek reference models. |
| **Waste Forecasting**<br>Predicts exact waste parameters per item, with the LLM actively diagnosing item degradation factors. | **LLM Meal Planning**<br>Generates entire weekly calendars constructed explicitly around the subset of ingredients about to expire. | **Community Leaderboards**<br>Gamified Zero-Waste challenges and metrics across your local household clusters. |

---

## 📐 Systems Topology

The physical infrastructure divides cleanly into separated bounds, operating resiliently behind protective routing.

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

---

## 🚀 Execution Guide

### Prerequisites
* **Node.js**: v18.0.0 or higher.
* **Supabase**: Active DB + Auth configured.
* **Ollama**: Hosted locally, pre-pulled with `llama3.2:1b`.
* **Python**: 3.8+ context for ML inference processing.

### Initialization & Boot
Clone down and pull the dependencies across both contexts.
```bash
git clone https://github.com/yourusername/NourishNeural.git
cd NourishNeural

# Hydrate Client Modules
cd client && npm install

# Hydrate Backend Modules
cd ../server && npm install
```

Configure the `.env` pipelines precisely.
```bash
cp server/.env.example server/.env
# Requires: SUPABASE_URL, SUPABASE_SERVICE_KEY, OLLAMA_BASE_URL
```

Execute the system daemons in separate TTYs:
```bash
# Server Daemon
cd server && node src/index.js

# Hot-Reload Visual Client
cd client && npx vite --host 0.0.0.0 --port 3050
```

---

## 📱 Mobile Architecture
Nourish Neural is constructed heavily prioritizing the mobile interface.
- **Android App:** Fully native hooks via Capacitor plugins (Haptics, Geolocation bounding). Build directly to `.apk` utilizing Android Studio.
- **iOS App:** Fully standalone-compliant Progressive Web App framework. Installs natively via Safari's "Add to Home Screen".
- **Offline Integrity:** Deep Service Worker intercepts (`workbox`) guarantee your pantry data renders globally even when physically disconnected from cell towers.

---

## 📄 Licensing & Open Source
This architecture is licensed strictly under the MIT License. See the `LICENSE` document for deployment bounds.
