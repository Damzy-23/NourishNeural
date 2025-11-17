# 🍽️ Nourish Neural – AI Culinary Intelligence

> Predictive kitchen orchestration blending machine learning, behavioural insights, and premium UI craft.

## 🌟 Overview

Nourish Neural is an AI-first household food management platform. EfficientNet vision models, LSTM expiry forecasting, and ensemble waste prediction power an interface that automates pantry tracking, predicts shortages, maps supermarket pricing, and nudges sustainable habits. The redesigned experience draws on Framer marketplace aesthetics—glassmorphism layers, gradient accents, and cinematic typography—to make food intelligence approachable and aspirational.

## ✨ Core Capabilities

- **🧠 Neural Pantry Graph** – Real-time freshness scoring, stock forecasting, and AI-driven alerts.
- **🛒 Intelligent Grocery Routes** – Auto-ranked shopping lists with live UK price movements across 15+ chains.
- **🤖 Nurexa AI** – Contextual recipe, nutrition, and substitution guidance tuned to household goals.
- **📊 Waste & Spend Analytics** – Behavioural dashboards highlighting savings, waste reduction, and meal cadence.
- **🛰️ Store Atlas** – Deep store metadata, opening hours, amenity tags, and navigation handoffs.
- **🌱 Behavioural Nudges** – Psychological prompts aligned with sustainability and nutrition outcomes.

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ and npm 9+
- PostgreSQL database
- OpenAI API key
- Google OAuth credentials

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd PantryPal
   ```

2. **Install dependencies**
   ```bash
   npm run install:all
   ```

3. **Environment setup**
   ```bash
   cp server/.env.example server/.env
   cp client/.env.example client/.env
   # Populate values for database, OpenAI, OAuth, maps, etc.
   ```

4. **Start development servers**
   ```bash
   npm run dev
   ```

5. **Access the suite**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:5000

## 🏗️ Architecture

```
NourishNeural/
├── client/                 # React + Tailwind front of house
│   ├── src/components/     # Shared UI primitives & layouts
│   ├── src/pages/          # Experience-driven screens (Landing, Dashboard, Pantry, Stores, etc.)
│   ├── src/hooks/          # Auth, data, and UI logic hooks
│   ├── src/services/       # API abstraction layer
│   └── src/utils/          # Helpers and design tokens
├── server/                 # Node/Express API + data services
│   ├── src/routes/         # REST endpoints (auth, pantry, stores, analytics)
│   ├── src/services/       # Business logic and integrations
│   ├── src/models/         # Data persistence and validation
│   └── src/utils/          # Shared infra helpers
└── uk-stores-dataset/      # Aggregated supermarket dataset & collectors
```

## 🛠️ Tech Stack

- **Frontend**: React 18, TypeScript, TailwindCSS, React Query, Framer Motion
- **Backend**: Node.js, Express, PostgreSQL (Supabase-compatible)
- **ML Layer**: EfficientNet (classification), LSTM (expiry), ensemble forecasting (waste)
- **Auth**: Google OAuth 2.0 + secure session tokens
- **Tooling**: Vite, ESLint, React Helmet Async, Lucide icons

## 📱 Experience Highlights

1. **Neural Onboarding** – OAuth sign-in, dietary profile, household cadence calibration.
2. **Predictive Pantry** – Vision-assisted intake, expiry forecasts, automated reordering tasks.
3. **Grocery Intelligence** – Price-optimised routing, substitution suggestions, budget alerts.
4. **Store Atlas** – Location-aware store discovery with amenity, accessibility, and pricing overlays.
5. **Nurexa AI** – Chat interface delivering recipes, nutrition, and sustainability coaching.

## 🔌 Integrations

- **UK Retailers**: Tesco, Sainsbury’s, Asda, Morrisons, Aldi, Lidl, Co-op, Waitrose, M&S, Iceland, and more.
- **Price Feeds**: Store-specific pricing, promotions, and loyalty adjustments.
- **Logistics**: Click & Collect, delivery partner roadmap (Deliveroo, Uber Eats, etc.).
- **Payments**: Ready for Google Pay, Apple Pay, Stripe (future phases).

## 🎯 Roadmap

- **Phase 1**: Core auth, pantry intelligence, AI chat, store dataset integration.
- **Phase 2**: Barcode scanning, loyalty sync, advanced waste forecasting.
- **Phase 3**: Hyper-personalised nutrition engine, meal kits, sustainability scoring.
- **Phase 4**: AR inventory capture, smart appliance integrations, local market expansion.

## 🤝 Contributing

1. Fork the repository.
2. Create a feature branch (`git checkout -b feature/neural-upgrade`).
3. Commit (`git commit -m "feat: add neural pantry animation"`).
4. Push (`git push origin feature/neural-upgrade`).
5. Open a Pull Request describing impact, testing, and screenshots/GIFs.

## 📄 License

This project is licensed under the MIT License – see the [LICENSE](LICENSE) file.

## 🆘 Support & Links

- **Docs**: Coming soon at `docs.nourishneural.app`
- **Issues**: [GitHub Issues](https://github.com/nourishneural/nourishneural/issues)
- **Community**: Discord channel opening during beta

---

Designed with empathy and intelligence by the Nourish Neural team.

