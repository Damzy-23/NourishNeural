import { Helmet } from 'react-helmet-async'
import { Link } from 'react-router-dom'
import { Home, Search, AlertTriangle } from 'lucide-react'

export default function NotFound() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-neutral-50 to-white dark:from-neutral-950 dark:to-neutral-900">
      <Helmet>
        <title>404 - Page Not Found | Nourish Neural</title>
      </Helmet>

      <div className="max-w-2xl mx-auto px-4 py-32 text-center">
        <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-amber-100 dark:bg-amber-900/30 mb-8">
          <AlertTriangle className="w-10 h-10 text-amber-600 dark:text-amber-400" />
        </div>

        <h1 className="text-7xl font-bold text-neutral-900 dark:text-white mb-4">404</h1>
        <h2 className="text-2xl font-semibold text-neutral-700 dark:text-neutral-200 mb-4">Page Not Found</h2>
        <p className="text-neutral-500 dark:text-neutral-400 mb-10 max-w-md mx-auto">
          The page you're looking for doesn't exist or has been moved. Let's get you back on track.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            to="/"
            className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-green-600 text-white rounded-xl font-medium hover:bg-green-700 transition-colors"
          >
            <Home className="w-4 h-4" />
            Back to Home
          </Link>
          <Link
            to="/support"
            className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-200 rounded-xl font-medium hover:bg-neutral-200 dark:hover:bg-neutral-700 transition-colors"
          >
            <Search className="w-4 h-4" />
            Visit Support
          </Link>
        </div>

        <div className="mt-16 pt-8 border-t border-neutral-200 dark:border-neutral-800">
          <p className="text-sm text-neutral-400 dark:text-neutral-500 mb-4">Quick links</p>
          <div className="flex flex-wrap justify-center gap-4 text-sm">
            {[
              { label: 'Dashboard', to: '/app/dashboard' },
              { label: 'Pantry', to: '/app/pantry' },
              { label: 'AI Assistant', to: '/app/ai-assistant' },
              { label: 'How It Works', to: '/how-it-works' },
              { label: 'Contact', to: '/contact' },
            ].map((link) => (
              <Link
                key={link.to}
                to={link.to}
                className="text-green-600 dark:text-green-400 hover:underline"
              >
                {link.label}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
