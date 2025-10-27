# 🚀 PantryPal Setup Guide

Welcome to PantryPal! This guide will help you get the application up and running on your local machine.

## 📋 Prerequisites

Before you begin, make sure you have the following installed:

- **Node.js** (version 18 or higher)
- **npm** (version 9 or higher)
- **PostgreSQL** (version 12 or higher)
- **Git**

## 🗄️ Database Setup

1. **Install PostgreSQL** (if not already installed)
   - [Download from postgresql.org](https://www.postgresql.org/download/)
   - Or use Docker: `docker run --name postgres -e POSTGRES_PASSWORD=password -p 5432:5432 -d postgres`

2. **Create Database**
   ```sql
   CREATE DATABASE pantrypal;
   CREATE DATABASE pantrypal_test;
   ```

## 🔑 Environment Configuration

1. **Backend Environment**
   ```bash
   cd server
   cp env.example .env
   ```
   
   Edit `.env` with your configuration:
   ```env
   # Database
   DB_HOST=localhost
   DB_PORT=5432
   DB_NAME=pantrypal
   DB_USER=your_username
   DB_PASSWORD=your_password
   
   # JWT Secret (generate a random string)
   JWT_SECRET=your-super-secret-jwt-key-here
   
   # Google OAuth (get from Google Cloud Console)
   GOOGLE_CLIENT_ID=your-google-client-id
   GOOGLE_CLIENT_SECRET=your-google-client-secret
   GOOGLE_CALLBACK_URL=http://localhost:5000/auth/google/callback
   
   # OpenAI API (get from openai.com)
   OPENAI_API_KEY=your-openai-api-key
   ```

2. **Frontend Environment** (optional)
   ```bash
   cd client
   # Create .env.local if needed
   echo "VITE_API_URL=http://localhost:5000" > .env.local
   ```

## 📦 Installation

1. **Install Root Dependencies**
   ```bash
   npm install
   ```

2. **Install Backend Dependencies**
   ```bash
   cd server
   npm install
   ```

3. **Install Frontend Dependencies**
   ```bash
   cd ../client
   npm install
   ```

4. **Return to Root**
   ```bash
   cd ..
   ```

## 🗃️ Database Migration

1. **Run Migrations**
   ```bash
   cd server
   npm run migrate
   ```

2. **Seed Sample Data** (optional)
   ```bash
   npm run seed
   ```

## 🚀 Running the Application

### Development Mode (Recommended)

Run both frontend and backend simultaneously:
```bash
npm run dev
```

This will start:
- **Backend**: http://localhost:5000
- **Frontend**: http://localhost:3000
- **GraphQL**: http://localhost:5000/graphql

### Production Mode

1. **Build Frontend**
   ```bash
   cd client
   npm run build
   ```

2. **Start Backend**
   ```bash
   cd ../server
   npm start
   ```

## 🔐 Google OAuth Setup

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing one
3. Enable Google+ API
4. Go to Credentials → Create Credentials → OAuth 2.0 Client IDs
5. Set authorized redirect URIs:
   - `http://localhost:5000/auth/google/callback` (development)
   - `https://yourdomain.com/auth/google/callback` (production)
6. Copy Client ID and Client Secret to your `.env` file

## 🤖 OpenAI API Setup

1. Go to [OpenAI Platform](https://platform.openai.com/)
2. Create an account and get your API key
3. Add the API key to your `.env` file

## 🧪 Testing

1. **Backend Tests**
   ```bash
   cd server
   npm test
   ```

2. **Frontend Tests**
   ```bash
   cd client
   npm test
   ```

## 📁 Project Structure

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
│   │   ├── config/        # Configuration files
│   │   ├── controllers/   # Route controllers
│   │   ├── models/        # Database models
│   │   ├── routes/        # API routes
│   │   ├── services/      # Business logic
│   │   └── middleware/    # Custom middleware
│   ├── migrations/        # Database migrations
│   └── seeds/            # Sample data
└── shared/                 # Shared types and utilities
```

## 🐛 Troubleshooting

### Common Issues

1. **Database Connection Failed**
   - Check PostgreSQL is running
   - Verify database credentials in `.env`
   - Ensure database exists

2. **Port Already in Use**
   - Change ports in `.env` files
   - Kill processes using the ports

3. **Google OAuth Not Working**
   - Verify redirect URI matches exactly
   - Check Client ID and Secret
   - Ensure Google+ API is enabled

4. **OpenAI API Errors**
   - Verify API key is correct
   - Check API key has sufficient credits
   - Ensure API key is active

### Getting Help

- Check the console for error messages
- Review the logs in the terminal
- Check the browser's Network tab for API errors
- Verify all environment variables are set correctly

## 🚀 Next Steps

Once the application is running:

1. **Visit the landing page**: http://localhost:3000
2. **Sign in with Google**: Click "Get Started"
3. **Explore the dashboard**: Navigate through the app
4. **Check the API**: Visit http://localhost:5000/health
5. **Explore GraphQL**: Visit http://localhost:5000/graphql

## 📚 Additional Resources

- [React Documentation](https://react.dev/)
- [Node.js Documentation](https://nodejs.org/docs/)
- [PostgreSQL Documentation](https://www.postgresql.org/docs/)
- [TailwindCSS Documentation](https://tailwindcss.com/docs)
- [OpenAI API Documentation](https://platform.openai.com/docs)

---

Happy coding! 🎉 If you encounter any issues, please check the troubleshooting section or create an issue in the repository. 