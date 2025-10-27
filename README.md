# 🛒 PantryPal – AI Grocery Assistant

> Your smart grocery companion – find, plan, and shop smarter.

## 🌟 Overview

PantryPal is an AI-powered grocery assistant app that helps users create and manage shopping lists, locate the nearest stores with items in stock, compare prices, and receive food-related insights. The app integrates AI for natural food-related queries, recipe suggestions, and pantry inventory tracking.

## ✨ Core Features

- **🛒 Smart Grocery Management**: Create lists manually, by voice, or AI-generated
- **📍 Store & Price Finder**: Real-time integration with UK supermarkets
- **🤖 AI Assistant**: Food queries, recipe suggestions, and nutrition guidance
- **📦 Pantry Tracking**: Auto-inventory management with expiry reminders
- **💰 Budget Analysis**: Track spending and optimize grocery costs
- **🚚 Multiple Fulfillment**: Click & Collect, delivery partners, future in-house logistics

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

3. **Environment Setup**
   ```bash
   # Copy environment files
   cp server/.env.example server/.env
   cp client/.env.example client/.env
   
   # Edit with your credentials
   ```

4. **Start development servers**
   ```bash
   npm run dev
   ```

5. **Open your browser**
   - Frontend: http://localhost:3000
   - Backend: http://localhost:5000

## 🏗️ Architecture

```
PantryPal/
├── client/                 # React frontend
│   ├── src/
│   │   ├── components/     # Reusable UI components
│   │   ├── pages/         # Main app pages
│   │   ├── hooks/         # Custom React hooks
│   │   ├── services/      # API services
│   │   └── utils/         # Utility functions
├── server/                 # Node.js backend
│   ├── src/
│   │   ├── controllers/   # Route controllers
│   │   ├── models/        # Database models
│   │   ├── routes/        # API routes
│   │   ├── services/      # Business logic
│   │   └── middleware/    # Custom middleware
└── shared/                 # Shared types and utilities
```

## 🛠️ Tech Stack

- **Frontend**: React 18, TypeScript, TailwindCSS
- **Backend**: Node.js, Express, GraphQL
- **Database**: PostgreSQL with Supabase
- **AI**: OpenAI GPT models
- **Auth**: Google OAuth 2.0
- **Deployment**: Vercel (frontend), Render (backend)

## 📱 Key User Flows

1. **Onboarding**: Gmail OAuth → Dietary preferences → Budget setup
2. **Grocery List**: Manual/Voice/AI creation → Barcode scanning → AI suggestions
3. **Store Finder**: AI locates nearest stores → Price comparison → Route optimization
4. **AI Assistant**: Natural language queries → Recipe suggestions → Nutrition info
5. **Checkout**: Multiple fulfillment options → Payment → Post-purchase insights

## 🔌 Integrations

- **UK Supermarkets**: Tesco, Sainsbury's, Asda, Morrisons, Aldi, Lidl, Co-op, Waitrose, M&S, Iceland
- **Loyalty Programs**: Clubcard, Nectar, MyWaitrose, etc.
- **Delivery Partners**: Uber Eats, Deliveroo (future)
- **Payment**: Google Pay, Apple Pay, Stripe

## 🎯 Development Roadmap

- **Phase 1 (MVP)**: Authentication, basic grocery lists, AI chatbot, store integration
- **Phase 2**: Full supermarket integration, barcode scanning, loyalty cards
- **Phase 3**: Recipe generator, nutrition tracking, delivery partnerships
- **Phase 4**: AR scanning, in-house logistics, local market partnerships

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

- **Documentation**: [docs.pantrypal.app](https://docs.pantrypal.app)
- **Issues**: [GitHub Issues](https://github.com/pantrypal/pantrypal/issues)
- **Discord**: [Join our community](https://discord.gg/pantrypal)

---

Built with ❤️ by the PantryPal Team 