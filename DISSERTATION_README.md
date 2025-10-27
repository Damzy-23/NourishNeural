# 🛒 PantryPal - AI-Powered Food Waste Reduction System

> **Dissertation Project**: *"AI-Powered Food Waste Reduction: A Machine Learning Approach to Intelligent Household Pantry Management"*

[![Build Status](https://img.shields.io/badge/build-passing-brightgreen)](https://github.com/yourusername/pantrypal)
[![License](https://img.shields.io/badge/license-MIT-blue)](LICENSE)
[![Node Version](https://img.shields.io/badge/node-%3E%3D18.0.0-brightgreen)](package.json)
[![React](https://img.shields.io/badge/react-18.2.0-blue)](client/package.json)

## 🌟 Project Overview

PantryPal is an intelligent grocery assistant that leverages artificial intelligence and machine learning to reduce household food waste, optimize shopping efficiency, and improve budget management. This project serves as the foundation for a comprehensive dissertation research study on AI-driven household management systems.

### 🎯 Core Mission
- **Reduce Food Waste**: Use AI to predict food expiry and suggest consumption
- **Optimize Shopping**: Provide intelligent recommendations and price comparisons
- **Improve Efficiency**: Streamline meal planning and pantry management
- **Save Money**: Help users make cost-effective grocery decisions

## 🚀 Key Features

### ✅ Implemented Features
- **🔐 Authentication**: Google OAuth integration with JWT tokens
- **📦 Pantry Management**: Track food items, quantities, and expiry dates
- **🛒 Grocery Lists**: Create and manage shopping lists with AI suggestions
- **🏪 Store Finder**: Locate nearby stores with geospatial queries
- **🤖 AI Assistant**: OpenAI-powered food recommendations and nutrition advice
- **📊 Dashboard**: Analytics and insights for food management
- **🎨 Modern UI**: Responsive React frontend with TailwindCSS

### 🔄 In Development
- **📱 Barcode Scanning**: Camera integration for product recognition
- **🧾 Receipt Processing**: OCR for automatic pantry updates
- **💰 Price Comparison**: Real-time supermarket price data
- **🔔 Smart Notifications**: Expiry alerts and price drop notifications
- **📈 Advanced Analytics**: Waste reduction metrics and spending insights

### 🎯 Planned Features
- **🤖 Custom ML Models**: Food recognition and expiry prediction
- **🗺️ Route Optimization**: Multi-store shopping optimization
- **👥 Social Features**: Share lists and collaborative shopping
- **📱 Mobile App**: Native iOS/Android applications
- **🔗 IoT Integration**: Smart fridge connectivity

## 🏗️ Technical Architecture

### Frontend Stack
```
React 18 + TypeScript + TailwindCSS
├── Components: Reusable UI components
├── Pages: Main application views
├── Hooks: Custom React hooks
├── Services: API communication
└── Utils: Helper functions
```

### Backend Stack
```
Node.js + Express + GraphQL
├── Routes: RESTful API endpoints
├── Config: Database, authentication, GraphQL
├── Middleware: Rate limiting, security, validation
├── Models: Database schemas and relationships
└── Services: Business logic and AI integration
```

### Database Design
```
PostgreSQL with Geospatial Extensions
├── Users & Preferences
├── Pantry Items & Categories
├── Grocery Lists & Items
├── Stores & Locations
├── Recipes & Ingredients
└── AI Interactions & Analytics
```

### AI/ML Components
```
Machine Learning Pipeline
├── OpenAI GPT-4: Natural language processing
├── Custom Models: Food recognition (planned)
├── Recommendation Engine: Collaborative filtering
├── Prediction Models: Expiry forecasting
└── Analytics: User behavior insights
```

## 📊 Research Methodology

### User Study Design
- **Phase 1**: User needs assessment (n=20 interviews)
- **Phase 2**: Usability testing (n=15 participants)
- **Phase 3**: Longitudinal study (n=50 households, 4 months)

### Success Metrics
- **Food Waste Reduction**: Target 30% decrease
- **Cost Efficiency**: Target £5-10 savings per trip
- **User Engagement**: Target 70% retention rate
- **AI Accuracy**: Target 85% prediction accuracy

### Data Collection
- **Quantitative**: Waste measurements, cost tracking, usage analytics
- **Qualitative**: User interviews, feedback, behavioral observations
- **Technical**: Performance metrics, error rates, API response times

## 🛠️ Development Roadmap

### Phase 1: Foundation (Months 1-3) ✅
- [x] Project setup and architecture
- [x] Basic authentication system
- [x] Core database schema
- [x] MVP frontend and backend
- [x] Initial AI integration

### Phase 2: Core Features (Months 4-6) 🔄
- [ ] Advanced pantry management
- [ ] Barcode scanning implementation
- [ ] Supermarket API integrations
- [ ] Receipt processing (OCR)
- [ ] Enhanced AI recommendations
- [ ] Real-time notifications

### Phase 3: AI Enhancement (Months 7-9) 📋
- [ ] Custom ML models development
- [ ] Predictive analytics dashboard
- [ ] Advanced recommendation algorithms
- [ ] Computer vision for food recognition
- [ ] Route optimization algorithms
- [ ] Social features implementation

### Phase 4: Research & Evaluation (Months 10-12) 📋
- [ ] User research studies
- [ ] Longitudinal evaluation
- [ ] Performance optimization
- [ ] Dissertation documentation
- [ ] Results analysis and reporting

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ and npm 9+
- PostgreSQL 12+
- OpenAI API key
- Google OAuth credentials

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/pantrypal.git
   cd pantrypal
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
   
   # Edit with your credentials (see setup.md for details)
   ```

4. **Database Setup**
   ```bash
   cd server
   npm run migrate
   npm run seed
   cd ..
   ```

5. **Start development servers**
   ```bash
   npm run dev
   ```

6. **Access the application**
   - Frontend: http://localhost:3000
   - Backend: http://localhost:5000
   - GraphQL: http://localhost:5000/graphql

## 📁 Project Structure

```
PantryPal/
├── 📁 client/                    # React frontend
│   ├── 📁 src/
│   │   ├── 📁 components/        # Reusable UI components
│   │   ├── 📁 pages/            # Main application pages
│   │   ├── 📁 hooks/            # Custom React hooks
│   │   ├── 📁 services/         # API communication
│   │   └── 📁 utils/            # Utility functions
│   ├── 📄 package.json
│   └── 📄 vite.config.ts
├── 📁 server/                    # Node.js backend
│   ├── 📁 src/
│   │   ├── 📁 config/           # Configuration files
│   │   ├── 📁 routes/           # API route handlers
│   │   ├── 📁 middleware/       # Custom middleware
│   │   └── 📄 index.js          # Server entry point
│   ├── 📁 migrations/           # Database migrations
│   ├── 📁 seeds/               # Sample data
│   └── 📄 package.json
├── 📄 DISSERTATION_PLAN.md      # Research methodology
├── 📄 DISSERTATION_README.md    # This file
├── 📄 README.md                # Main project README
├── 📄 setup.md                 # Setup instructions
└── 📄 package.json             # Root package.json
```

## 🔧 API Documentation

### Authentication Endpoints
```
POST /api/auth/google          # Google OAuth login
POST /api/auth/refresh         # Refresh JWT token
POST /api/auth/logout          # User logout
```

### Pantry Management
```
GET    /api/pantry             # Get user's pantry items
POST   /api/pantry             # Add new pantry item
PUT    /api/pantry/:id         # Update pantry item
DELETE /api/pantry/:id         # Delete pantry item
GET    /api/pantry/stats       # Get pantry analytics
```

### Grocery Lists
```
GET    /api/groceries          # Get user's grocery lists
POST   /api/groceries          # Create new grocery list
PUT    /api/groceries/:id      # Update grocery list
DELETE /api/groceries/:id      # Delete grocery list
```

### Store Integration
```
GET    /api/stores             # Get nearby stores
GET    /api/stores/:id         # Get store details
POST   /api/stores/nearby      # Find stores by location
GET    /api/stores/chains      # Get available store chains
```

### AI Assistant
```
POST   /api/ai/chat            # Chat with AI assistant
POST   /api/ai/recipes         # Get recipe suggestions
POST   /api/ai/nutrition       # Analyze nutrition info
POST   /api/ai/substitutions   # Find food substitutions
```

## 🧪 Testing

### Backend Testing
```bash
cd server
npm test                    # Run all tests
npm run test:watch         # Watch mode
npm run test:coverage      # Coverage report
```

### Frontend Testing
```bash
cd client
npm test                   # Run all tests
npm run test:watch        # Watch mode
npm run test:coverage     # Coverage report
```

### Integration Testing
```bash
npm run test:integration   # Full system tests
npm run test:e2e          # End-to-end tests
```

## 📊 Performance Monitoring

### Key Metrics
- **API Response Time**: < 2 seconds
- **Database Queries**: < 100ms average
- **Frontend Load Time**: < 3 seconds
- **AI Response Time**: < 5 seconds
- **Uptime Target**: 99.9%

### Monitoring Tools
- **Backend**: Morgan logging, custom metrics
- **Frontend**: React DevTools, performance profiling
- **Database**: Query analysis, connection pooling
- **AI**: OpenAI usage tracking, response time monitoring

## 🔒 Security Considerations

### Data Protection
- **Encryption**: All sensitive data encrypted at rest and in transit
- **Authentication**: JWT tokens with secure expiration
- **Authorization**: Role-based access control
- **Input Validation**: Comprehensive input sanitization

### Privacy Compliance
- **GDPR**: Full compliance with data protection regulations
- **Consent Management**: Explicit user consent for data collection
- **Data Minimization**: Collect only necessary data
- **Right to Deletion**: Users can request data removal

## 🤝 Contributing

### For Dissertation Research
1. **Literature Review**: Contribute to research background
2. **User Studies**: Participate in user research activities
3. **Data Analysis**: Help with research data interpretation
4. **Documentation**: Improve research documentation

### For Development
1. **Fork** the repository
2. **Create** a feature branch (`git checkout -b feature/amazing-feature`)
3. **Commit** your changes (`git commit -m 'Add amazing feature'`)
4. **Push** to the branch (`git push origin feature/amazing-feature`)
5. **Open** a Pull Request

### Code Standards
- **TypeScript**: Strict type checking enabled
- **ESLint**: Consistent code formatting
- **Prettier**: Automatic code formatting
- **Testing**: Minimum 80% code coverage
- **Documentation**: Comprehensive inline comments

## 📚 Research Resources

### Academic References
- [Food Waste Statistics - WRAP UK](https://wrap.org.uk/food-waste)
- [AI in Consumer Applications - ACM Digital Library](https://dl.acm.org/)
- [User-Centered Design - Nielsen Norman Group](https://www.nngroup.com/)
- [Machine Learning for Recommendations - IEEE Xplore](https://ieeexplore.ieee.org/)

### Technical Documentation
- [React Documentation](https://react.dev/)
- [Node.js Best Practices](https://github.com/goldbergyoni/nodebestpractices)
- [PostgreSQL Documentation](https://www.postgresql.org/docs/)
- [OpenAI API Reference](https://platform.openai.com/docs)

### Industry Resources
- [Food Tech Trends 2024](https://foodtechconnect.com/)
- [Sustainable Food Systems](https://www.fao.org/sustainable-development-goals)
- [Consumer Behavior Research](https://www.consumerpsychologist.com/)

## 📈 Future Enhancements

### Short-term (6 months)
- **Mobile App**: Native iOS/Android applications
- **Voice Interface**: Voice commands for hands-free operation
- **Offline Mode**: Core functionality without internet connection
- **Multi-language**: Support for multiple languages

### Medium-term (12 months)
- **IoT Integration**: Smart fridge and pantry sensors
- **Blockchain**: Supply chain transparency
- **AR Features**: Augmented reality for food information
- **Advanced Analytics**: Predictive insights and recommendations

### Long-term (18+ months)
- **Commercial Launch**: Full-scale product launch
- **Enterprise Version**: B2B solutions for restaurants and retailers
- **Global Expansion**: International market penetration
- **AI Research**: Advanced machine learning research collaboration

## 📞 Contact Information

**Research Student**: [Your Name]  
**University**: [Your University]  
**Department**: [Your Department]  
**Supervisor**: [Supervisor Name]  
**Email**: [your.email@university.ac.uk]  
**GitHub**: [github.com/yourusername](https://github.com/yourusername)  
**LinkedIn**: [linkedin.com/in/yourprofile](https://linkedin.com/in/yourprofile)  

### Research Collaboration
Interested in collaborating on this research? Please contact us to discuss:
- **User Study Participation**: Join our longitudinal study
- **Technical Contributions**: Help with development
- **Academic Partnerships**: Research collaboration opportunities
- **Industry Partnerships**: Commercial application discussions

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **OpenAI** for providing AI capabilities
- **Google** for OAuth authentication services
- **University Research Community** for academic guidance
- **Open Source Community** for foundational technologies
- **Research Participants** for contributing to user studies

---

**⚠️ Research Disclaimer**: This project is part of academic research. All data collection follows institutional ethics guidelines and GDPR compliance. Participation in research studies is voluntary and confidential.

**📊 Research Status**: Active - Currently in Phase 2 (Core Features Development)

**🎓 Dissertation Timeline**: 12 months (September 2024 - August 2025)

---

*Last Updated: [Current Date]*  
*Version: 1.0.0*  
*Status: Active Development*
