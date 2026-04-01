import { useState } from 'react'
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
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
  Moon,
  Sun,
  CalendarDays,
  ChefHat,
  Trophy,
  MoreHorizontal
} from 'lucide-react'
import { useAuth } from '../hooks/useAuth'
import { useExpiryAlerts } from '../hooks/useExpiryAlerts'
import { useTheme } from '../contexts/ThemeContext'
import WasteAlertBell from './WasteAlertBell'
import { cn } from '../utils/cn'

/* Full navigation for sidebar */
const navigation = [
  { name: 'Dashboard', href: '/app/dashboard', icon: Home },
  { name: 'Grocery Lists', href: '/app/grocery-lists', icon: ShoppingCart },
  { name: 'Pantry', href: '/app/pantry', icon: Package },
  { name: 'Stores', href: '/app/stores', icon: Store },
  { name: 'Nurexa AI', href: '/app/ai-assistant', icon: Bot },
  { name: 'Recipes', href: '/app/recipes', icon: ChefHat },
  { name: 'Meal Plan', href: '/app/meal-plan', icon: CalendarDays },
  { name: 'Challenges', href: '/app/challenges', icon: Trophy },
  { name: 'Profile', href: '/app/profile', icon: User },
]

/* Bottom tab bar — 5 core destinations (mobile only) */
const bottomTabs = [
  { name: 'Home', href: '/app/dashboard', icon: Home },
  { name: 'Lists', href: '/app/grocery-lists', icon: ShoppingCart },
  { name: 'Pantry', href: '/app/pantry', icon: Package },
  { name: 'Nurexa', href: '/app/ai-assistant', icon: Bot },
  { name: 'More', href: '__more__', icon: MoreHorizontal },
]

/* Get current page title from path */
function getPageTitle(pathname: string): string {
  const match = navigation.find((n) => n.href === pathname)
  return match?.name || 'Nourish Neural'
}

export default function Layout() {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [moreMenuOpen, setMoreMenuOpen] = useState(false)
  const { user, logout } = useAuth()
  const { theme, toggleTheme } = useTheme()
  const location = useLocation()
  const navigate = useNavigate()
  useExpiryAlerts()

  const pageTitle = getPageTitle(location.pathname)

  const handleLogout = async () => {
    try {
      await logout()
      navigate('/')
    } catch (error) {
      console.error('Logout failed:', error)
    }
  }

  /* Extra tabs shown in "More" sheet */
  const moreTabs = navigation.filter(
    (n) => !bottomTabs.some((bt) => bt.href === n.href)
  )

  const SidebarContent = ({ onNavClick }: { onNavClick?: () => void }) => (
    <div className="flex h-full flex-col">
      {/* Brand */}
      <div className="flex h-16 items-center px-5">
        <Link to="/app/dashboard" className="flex items-center gap-3" onClick={onNavClick}>
          <img
            src="/logo.png"
            alt="Nourish Neural Logo"
            className="h-9 w-9 object-contain rounded-lg shadow-sm"
          />
          <div className="flex flex-col">
            <span className="text-base font-display text-neutral-900 dark:text-neutral-100 leading-tight">
              Nourish
            </span>
            <span className="text-[10px] font-mono uppercase tracking-[0.2em] text-primary-600 dark:text-primary-400 leading-tight">
              Neural
            </span>
          </div>
        </Link>
      </div>

      {/* Divider */}
      <div className="mx-5 h-px bg-gradient-to-r from-transparent via-neutral-200 dark:via-neutral-700 to-transparent" />

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
        {navigation.map((item) => {
          const isActive = location.pathname === item.href
          return (
            <Link
              key={item.name}
              to={item.href}
              onClick={onNavClick}
              className={cn(
                'nav-item group relative',
                isActive ? 'nav-item-active' : 'nav-item-inactive'
              )}
            >
              {isActive && (
                <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-5 bg-primary-500 rounded-r-full" />
              )}
              <item.icon
                className={cn(
                  'h-[18px] w-[18px] transition-colors flex-shrink-0',
                  isActive
                    ? 'text-primary-600 dark:text-primary-400'
                    : 'text-neutral-400 dark:text-neutral-500 group-hover:text-neutral-600 dark:group-hover:text-neutral-300'
                )}
              />
              <span className="truncate">{item.name}</span>
            </Link>
          )
        })}
      </nav>

      {/* Footer */}
      <div className="px-3 pb-4 space-y-1">
        <div className="mx-2 mb-3 h-px bg-gradient-to-r from-transparent via-neutral-200 dark:via-neutral-700 to-transparent" />

        {/* User card */}
        <div className="flex items-center gap-3 px-3 py-2">
          {user?.avatarUrl ? (
            <img src={user.avatarUrl} alt={user.firstName} className="h-8 w-8 rounded-full object-cover" />
          ) : (
            <div className="h-8 w-8 rounded-full bg-primary-100 dark:bg-primary-900/40 flex items-center justify-center">
              <span className="text-sm font-medium text-primary-700 dark:text-primary-300">
                {user?.firstName?.charAt(0)}
              </span>
            </div>
          )}
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-neutral-800 dark:text-neutral-100 truncate">
              {user?.firstName} {user?.lastName}
            </p>
            <p className="text-xs text-neutral-500 dark:text-neutral-400 truncate">{user?.email}</p>
          </div>
        </div>

        {/* Theme + Logout */}
        <button
          onClick={toggleTheme}
          className="nav-item nav-item-inactive w-full"
          title={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
        >
          {theme === 'dark' ? <Sun className="h-[18px] w-[18px]" /> : <Moon className="h-[18px] w-[18px]" />}
          <span>{theme === 'dark' ? 'Light Mode' : 'Dark Mode'}</span>
        </button>

        <button onClick={handleLogout} className="nav-item nav-item-inactive w-full">
          <LogOut className="h-[18px] w-[18px]" />
          <span>Sign out</span>
        </button>
      </div>
    </div>
  )

  return (
    <div className="min-h-screen bg-cream-50 dark:bg-neutral-900">
      {/* Mobile sidebar overlay (hamburger menu) */}
      <div className={cn('fixed inset-0 z-50 lg:hidden', sidebarOpen ? 'block' : 'hidden')}>
        <div className="fixed inset-0 bg-neutral-900/50 dark:bg-black/70 backdrop-blur-sm" onClick={() => setSidebarOpen(false)} />
        <div className="fixed inset-y-0 left-0 w-[260px] bg-white dark:bg-neutral-800 shadow-2xl">
          <button
            onClick={() => setSidebarOpen(false)}
            className="absolute top-4 right-4 p-1.5 rounded-lg text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-700 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
          <SidebarContent onNavClick={() => setSidebarOpen(false)} />
        </div>
      </div>

      {/* "More" bottom sheet (mobile only) */}
      {moreMenuOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div
            className="fixed inset-0 bg-black/40 backdrop-blur-sm"
            onClick={() => setMoreMenuOpen(false)}
          />
          <motion.div
            className="fixed bottom-0 left-0 right-0 bg-white dark:bg-neutral-800 rounded-t-3xl shadow-2xl pb-safe"
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 28, stiffness: 320 }}
          >
            {/* Drag handle */}
            <div className="flex justify-center pt-3 pb-2">
              <div className="w-10 h-1 rounded-full bg-neutral-300 dark:bg-neutral-600" />
            </div>

            <div className="px-4 pb-2">
              <p className="text-xs font-semibold uppercase tracking-wider text-neutral-400 dark:text-neutral-500 px-2 mb-2">
                More
              </p>
              <div className="grid grid-cols-4 gap-2">
                {moreTabs.map((item) => {
                  const isActive = location.pathname === item.href
                  return (
                    <Link
                      key={item.name}
                      to={item.href}
                      onClick={() => setMoreMenuOpen(false)}
                      className="flex flex-col items-center gap-1.5 py-3 px-1 rounded-2xl active:bg-neutral-100 dark:active:bg-neutral-700 transition-colors"
                    >
                      <div className={cn(
                        'h-11 w-11 rounded-2xl flex items-center justify-center transition-colors',
                        isActive
                          ? 'bg-primary-100 dark:bg-primary-900/40'
                          : 'bg-neutral-100 dark:bg-neutral-700/60'
                      )}>
                        <item.icon className={cn(
                          'h-5 w-5',
                          isActive
                            ? 'text-primary-600 dark:text-primary-400'
                            : 'text-neutral-500 dark:text-neutral-400'
                        )} />
                      </div>
                      <span className={cn(
                        'text-[11px] font-medium text-center leading-tight',
                        isActive
                          ? 'text-primary-600 dark:text-primary-400'
                          : 'text-neutral-600 dark:text-neutral-400'
                      )}>
                        {item.name}
                      </span>
                    </Link>
                  )
                })}
              </div>

              {/* Quick actions in bottom sheet */}
              <div className="mt-3 pt-3 border-t border-neutral-200/80 dark:border-neutral-700/60 space-y-1">
                <button
                  onClick={() => { toggleTheme(); setMoreMenuOpen(false) }}
                  className="flex items-center gap-3 w-full px-3 py-2.5 rounded-xl text-sm text-neutral-700 dark:text-neutral-300 active:bg-neutral-100 dark:active:bg-neutral-700 transition-colors"
                >
                  {theme === 'dark' ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
                  <span>{theme === 'dark' ? 'Light Mode' : 'Dark Mode'}</span>
                </button>
                <button
                  onClick={() => { setMoreMenuOpen(false); handleLogout() }}
                  className="flex items-center gap-3 w-full px-3 py-2.5 rounded-xl text-sm text-red-600 dark:text-red-400 active:bg-red-50 dark:active:bg-red-900/20 transition-colors"
                >
                  <LogOut className="h-5 w-5" />
                  <span>Sign Out</span>
                </button>
              </div>
            </div>

            {/* Bottom spacer for home indicator */}
            <div className="h-4" />
          </motion.div>
        </div>
      )}

      {/* Desktop sidebar */}
      <div className="hidden lg:fixed lg:inset-y-0 lg:z-50 lg:flex lg:w-[260px] lg:flex-col">
        <div className="flex h-full flex-col bg-white dark:bg-neutral-800 border-r border-neutral-200/80 dark:border-neutral-700/60">
          <SidebarContent />
        </div>
      </div>

      {/* Main content */}
      <div className="lg:pl-[260px]">
        {/* Mobile header — app-style with page title */}
        <div className="sticky top-0 z-40 flex h-12 items-center gap-x-3 border-b border-neutral-200/80 dark:border-neutral-700/60 bg-white/90 dark:bg-neutral-800/90 backdrop-blur-md px-4 lg:hidden">
          <button
            type="button"
            className="p-1.5 -ml-1.5 text-neutral-500 dark:text-neutral-400 active:text-neutral-900 dark:active:text-neutral-100 transition-colors rounded-lg active:bg-neutral-100 dark:active:bg-neutral-700"
            onClick={() => setSidebarOpen(true)}
          >
            <Menu className="h-5 w-5" />
          </button>

          {/* Page title — centered */}
          <h1 className="flex-1 text-center text-sm font-semibold text-neutral-900 dark:text-neutral-100 truncate">
            {pageTitle}
          </h1>

          <div className="flex items-center gap-1">
            <WasteAlertBell />
            <Link
              to="/app/profile"
              className="p-1"
            >
              {user?.avatarUrl ? (
                <img src={user.avatarUrl} alt={user.firstName} className="h-7 w-7 rounded-full" />
              ) : (
                <div className="h-7 w-7 rounded-full bg-primary-100 dark:bg-primary-900/40 flex items-center justify-center">
                  <span className="text-xs font-medium text-primary-700 dark:text-primary-300">
                    {user?.firstName?.charAt(0)}
                  </span>
                </div>
              )}
            </Link>
          </div>
        </div>

        {/* Page content — extra bottom padding on mobile for tab bar */}
        <main className="py-4 lg:py-8 pb-24 lg:pb-8">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <Outlet />
          </div>
        </main>
      </div>

      {/* ─── Mobile bottom tab bar ─── */}
      <div className="fixed bottom-0 left-0 right-0 z-40 lg:hidden">
        {/* Frosted glass background */}
        <div className="bg-white/90 dark:bg-neutral-800/90 backdrop-blur-lg border-t border-neutral-200/80 dark:border-neutral-700/60 pb-safe">
          <nav className="flex items-end justify-around px-2 pt-1.5 pb-1.5">
            {bottomTabs.map((tab) => {
              const isMore = tab.href === '__more__'
              const isActive = isMore
                ? moreMenuOpen || moreTabs.some((m) => location.pathname === m.href)
                : location.pathname === tab.href

              return (
                <button
                  key={tab.name}
                  onClick={() => {
                    if (isMore) {
                      setMoreMenuOpen(!moreMenuOpen)
                    } else {
                      setMoreMenuOpen(false)
                      navigate(tab.href)
                    }
                  }}
                  className={cn(
                    'flex flex-col items-center gap-0.5 min-w-[56px] py-1 rounded-xl transition-colors active:scale-95',
                    isActive ? '' : 'text-neutral-400 dark:text-neutral-500'
                  )}
                >
                  <div className={cn(
                    'relative flex items-center justify-center h-8 w-8 rounded-xl transition-all duration-200',
                    isActive
                      ? 'bg-primary-100 dark:bg-primary-900/40'
                      : ''
                  )}>
                    <tab.icon className={cn(
                      'h-[22px] w-[22px] transition-colors',
                      isActive
                        ? 'text-primary-600 dark:text-primary-400'
                        : 'text-neutral-400 dark:text-neutral-500'
                    )} />
                  </div>
                  <span className={cn(
                    'text-[10px] font-medium leading-none transition-colors',
                    isActive
                      ? 'text-primary-600 dark:text-primary-400'
                      : 'text-neutral-400 dark:text-neutral-500'
                  )}>
                    {tab.name}
                  </span>
                </button>
              )
            })}
          </nav>
        </div>
      </div>
    </div>
  )
}
