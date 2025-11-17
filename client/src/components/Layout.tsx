import { useState } from 'react'
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom'
import {
  ShoppingCart,
  Home,
  Store,
  Bot,
  User,
  LogOut,
  Menu,
  X,
  Package,
  BrainCircuit
} from 'lucide-react'
import { useAuth } from '../hooks/useAuth'
import { cn } from '../utils/cn'

const navigation = [
  { name: 'Dashboard', href: '/app/dashboard', icon: Home },
  { name: 'Grocery Lists', href: '/app/grocery-lists', icon: ShoppingCart },
  { name: 'Pantry', href: '/app/pantry', icon: Package },
  { name: 'Stores', href: '/app/stores', icon: Store },
  { name: 'Nurexa AI', href: '/app/ai-assistant', icon: Bot },
  { name: 'Profile', href: '/app/profile', icon: User },
]

export default function Layout() {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const { user, logout } = useAuth()
  const location = useLocation()
  const navigate = useNavigate()

  const handleLogout = async () => {
    try {
      await logout()
      navigate('/')
    } catch (error) {
      console.error('Logout failed:', error)
    }
  }

  return (
    <div className="min-h-screen bg-neutral-50">
      {/* Mobile sidebar */}
      <div className={cn(
        'fixed inset-0 z-50 lg:hidden',
        sidebarOpen ? 'block' : 'hidden'
      )}>
        <div className="fixed inset-0 bg-neutral-900/80" onClick={() => setSidebarOpen(false)} />
        <div className="fixed inset-y-0 left-0 w-64 glass-card shadow-2xl border-r border-white/20">
          <div className="flex h-full flex-col">
            {/* Logo */}
            <div className="flex h-16 items-center justify-between px-6">
              <Link to="/app/dashboard" className="flex items-center space-x-3">
                <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-primary-500 via-primary-500 to-accent-500 flex items-center justify-center shadow-lg">
                  <BrainCircuit className="h-6 w-6 text-white" />
                </div>
                <span className="text-xl font-bold gradient-text">Nourish Neural</span>
              </Link>
              <button
                onClick={() => setSidebarOpen(false)}
                className="text-neutral-500 hover:text-neutral-700"
              >
                <X className="h-6 w-6" />
              </button>
            </div>

            {/* Navigation */}
            <nav className="flex-1 space-y-1 px-3 py-4">
              {navigation.map((item) => {
                const isActive = location.pathname === item.href
                return (
                  <Link
                    key={item.name}
                    to={item.href}
                    onClick={() => setSidebarOpen(false)}
                    className={cn(
                      'group flex items-center rounded-xl px-4 py-3 text-sm font-semibold transition-all duration-200',
                      isActive
                        ? 'bg-gradient-to-r from-primary-100 to-primary-200 text-primary-700 shadow-md border-l-4 border-primary-500'
                        : 'text-neutral-700 hover:bg-gradient-to-r hover:from-neutral-100 hover:to-neutral-200 hover:text-neutral-900 hover:shadow-sm'
                    )}
                  >
                    <item.icon
                      className={cn(
                        'mr-3 h-5 w-5 transition-colors',
                        isActive ? 'text-primary-500' : 'text-neutral-400 group-hover:text-neutral-500'
                      )}
                    />
                    {item.name}
                  </Link>
                )
              })}
            </nav>

            {/* User section */}
            <div className="border-t border-neutral-200 p-4">
              <div className="flex items-center space-x-3">
                {user?.avatarUrl ? (
                  <img
                    src={user.avatarUrl}
                    alt={user.firstName}
                    className="h-8 w-8 rounded-full"
                  />
                ) : (
                  <div className="h-8 w-8 rounded-full bg-primary-100 flex items-center justify-center">
                    <span className="text-sm font-medium text-primary-700">
                      {user?.firstName?.charAt(0)}
                    </span>
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-neutral-900 truncate">
                    {user?.firstName} {user?.lastName}
                  </p>
                  <p className="text-xs text-neutral-500 truncate">{user?.email}</p>
                </div>
              </div>
              <button
                onClick={handleLogout}
                className="mt-3 flex w-full items-center rounded-lg px-3 py-2 text-sm font-medium text-neutral-700 hover:bg-neutral-100 hover:text-neutral-900 transition-colors"
              >
                <LogOut className="mr-3 h-4 w-4" />
                Sign out
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Desktop sidebar */}
      <div className="hidden lg:fixed lg:inset-y-0 lg:z-50 lg:flex lg:w-64 lg:flex-col">
        <div className="flex h-full flex-col bg-white shadow-xl">
          {/* Logo */}
          <div className="flex h-16 items-center px-6">
            <Link to="/app/dashboard" className="flex items-center space-x-2">
              <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-primary-500 via-primary-500 to-accent-500" />
              <span className="text-xl font-bold text-neutral-900">Nourish Neural</span>
            </Link>
          </div>

          {/* Navigation */}
          <nav className="flex-1 space-y-1 px-3 py-4">
            {navigation.map((item) => {
              const isActive = location.pathname === item.href
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  className={cn(
                    'group flex items-center rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                    isActive
                      ? 'bg-primary-50 text-primary-700 border-r-2 border-primary-500'
                      : 'text-neutral-700 hover:bg-neutral-100 hover:text-neutral-900'
                  )}
                >
                  <item.icon
                    className={cn(
                      'mr-3 h-5 w-5 transition-colors',
                      isActive ? 'text-primary-500' : 'text-neutral-400 group-hover:text-neutral-500'
                    )}
                  />
                  {item.name}
                </Link>
              )
            })}
          </nav>

          {/* User section */}
          <div className="border-t border-neutral-200 p-4">
            <div className="flex items-center space-x-3">
              {user?.avatarUrl ? (
                <img
                  src={user.avatarUrl}
                  alt={user.firstName}
                  className="h-8 w-8 rounded-full"
                />
              ) : (
                <div className="h-8 w-8 rounded-full bg-primary-100 flex items-center justify-center">
                  <span className="text-sm font-medium text-primary-700">
                    {user?.firstName?.charAt(0)}
                  </span>
                </div>
              )}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-neutral-900 truncate">
                  {user?.firstName} {user?.lastName}
                </p>
                <p className="text-xs text-neutral-500 truncate">{user?.email}</p>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="mt-3 flex w-full items-center rounded-lg px-3 py-2 text-sm font-medium text-neutral-700 hover:bg-neutral-100 hover:text-neutral-900 transition-colors"
            >
              <LogOut className="mr-3 h-4 w-4" />
              Sign out
            </button>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="lg:pl-64">
        {/* Mobile header */}
        <div className="sticky top-0 z-40 flex h-16 shrink-0 items-center gap-x-4 border-b border-neutral-200 bg-white px-4 shadow-sm sm:gap-x-6 sm:px-6 lg:hidden">
          <button
            type="button"
            className="-m-2.5 p-2.5 text-neutral-700 lg:hidden"
            onClick={() => setSidebarOpen(true)}
          >
            <Menu className="h-6 w-6" />
          </button>

          {/* Separator */}
          <div className="h-6 w-px bg-neutral-200 lg:hidden" />

          <div className="flex flex-1 gap-x-4 self-stretch lg:gap-x-6">
            <div className="flex flex-1"></div>
            <div className="flex items-center gap-x-4 lg:gap-x-6">
              {/* User menu for mobile */}
              <div className="flex items-center space-x-3">
                {user?.avatarUrl ? (
                  <img
                    src={user.avatarUrl}
                    alt={user.firstName}
                    className="h-8 w-8 rounded-full"
                  />
                ) : (
                  <div className="h-8 w-8 rounded-full bg-primary-100 flex items-center justify-center">
                    <span className="text-sm font-medium text-primary-700">
                      {user?.firstName?.charAt(0)}
                    </span>
                  </div>
                )}
                <span className="text-sm font-medium text-neutral-900 lg:hidden">
                  {user?.firstName} {user?.lastName}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Page content */}
        <main className="py-6">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  )
} 