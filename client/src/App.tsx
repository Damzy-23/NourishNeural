import { useState, useEffect, lazy, Suspense } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { Helmet } from 'react-helmet-async'
import { WifiOff } from 'lucide-react'
import { useAuth } from './hooks/useAuth'
import Layout from './components/Layout'
import ProtectedRoute from './components/ProtectedRoute'

const LandingPage = lazy(() => import('./pages/LandingPage'))
const Login = lazy(() => import('./pages/Login'))
const Register = lazy(() => import('./pages/Register'))
const ForgotPassword = lazy(() => import('./pages/ForgotPassword'))
const ResetPassword = lazy(() => import('./pages/ResetPassword'))
const TermsOfService = lazy(() => import('./pages/TermsOfService'))
const PrivacyPolicy = lazy(() => import('./pages/PrivacyPolicy'))
const Support = lazy(() => import('./pages/Support'))
const Contact = lazy(() => import('./pages/Contact'))
const HowItWorks = lazy(() => import('./pages/HowItWorks'))
const AIExplainability = lazy(() => import('./pages/AIExplainability'))
const NutritionalInsights = lazy(() => import('./pages/NutritionalInsights'))
const PromptLab = lazy(() => import('./pages/PromptLab'))
const AIGovernance = lazy(() => import('./pages/AIGovernance'))
const AgentEvaluation = lazy(() => import('./pages/AgentEvaluation'))
const Dashboard = lazy(() => import('./pages/Dashboard'))
const GroceryLists = lazy(() => import('./pages/GroceryLists'))
const Pantry = lazy(() => import('./pages/Pantry'))
const Stores = lazy(() => import('./pages/Stores'))
const AIAssistant = lazy(() => import('./pages/AIAssistant'))
const Profile = lazy(() => import('./pages/Profile'))
const MealPlanCalendar = lazy(() => import('./pages/MealPlanCalendar'))
const Recipes = lazy(() => import('./pages/Recipes'))
const Challenges = lazy(() => import('./pages/Challenges'))
const AuthCallback = lazy(() => import('./pages/AuthCallback'))
const NotFound = lazy(() => import('./pages/NotFound'))

function PageLoader() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <div className="loading-dots">
          <div></div>
          <div></div>
          <div></div>
        </div>
        <p className="mt-4 text-neutral-600">Loading...</p>
      </div>
    </div>
  )
}

function App() {
  const { isLoading } = useAuth()
  const [isOffline, setIsOffline] = useState(!navigator.onLine)

  useEffect(() => {
    const goOffline = () => setIsOffline(true)
    const goOnline = () => setIsOffline(false)
    window.addEventListener('offline', goOffline)
    window.addEventListener('online', goOnline)
    return () => {
      window.removeEventListener('offline', goOffline)
      window.removeEventListener('online', goOnline)
    }
  }, [])

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="loading-dots">
            <div></div>
            <div></div>
            <div></div>
          </div>
          <p className="mt-4 text-neutral-600">Loading Nourish Neural...</p>
        </div>
      </div>
    )
  }

  return (
    <>
      <Helmet>
        <title>Nourish Neural - AI Culinary Intelligence</title>
        <meta name="description" content="Your smart grocery companion – find, plan, and shop smarter." />
      </Helmet>

      {isOffline && (
        <div className="fixed top-0 left-0 right-0 z-[9999] bg-amber-500 text-white text-center py-2 px-4 text-sm font-medium flex items-center justify-center gap-2">
          <WifiOff className="w-4 h-4" />
          You're offline — showing cached data
        </div>
      )}

      <Suspense fallback={<PageLoader />}>
        <Routes>
          {/* Public routes */}
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password" element={<ResetPassword />} />
          <Route path="/terms" element={<TermsOfService />} />
          <Route path="/privacy" element={<PrivacyPolicy />} />
          <Route path="/support" element={<Support />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/how-it-works" element={<HowItWorks />} />
          <Route path="/ai-explainability" element={<AIExplainability />} />
          <Route path="/nutrition-insights" element={<NutritionalInsights />} />
          <Route path="/prompt-lab" element={<PromptLab />} />
          <Route path="/ai-governance" element={<AIGovernance />} />
          <Route path="/agent-evaluation" element={<AgentEvaluation />} />
          <Route path="/auth/callback" element={<AuthCallback />} />

          {/* Protected routes */}
          <Route path="/app" element={
            <ProtectedRoute>
              <Layout />
            </ProtectedRoute>
          }>
            <Route index element={<Navigate to="/app/dashboard" replace />} />
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="grocery-lists" element={<GroceryLists />} />
            <Route path="pantry" element={<Pantry />} />
            <Route path="stores" element={<Stores />} />
            <Route path="ai-assistant" element={<AIAssistant />} />
            <Route path="recipes" element={<Recipes />} />
            <Route path="meal-plan" element={<MealPlanCalendar />} />
            <Route path="challenges" element={<Challenges />} />
            <Route path="profile" element={<Profile />} />
          </Route>

          {/* 404 */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Suspense>
    </>
  )
}

export default App
