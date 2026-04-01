import { useState, useRef, useEffect } from 'react'
import { Bell, AlertTriangle, X, ChefHat } from 'lucide-react'
import { useWasteAlerts, WasteAlert } from '../hooks/useWasteAlerts'
import { cn } from '../utils/cn'

export default function WasteAlertBell() {
  const { alerts, unreadCount, highRiskCount, dismissAlert } = useWasteAlerts()
  const [isOpen, setIsOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const activeAlerts = alerts.filter((a: WasteAlert) => !a.is_dismissed)

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          'relative p-2 rounded-lg transition-colors',
          unreadCount > 0
            ? 'text-amber-600 dark:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-900/20'
            : 'text-neutral-500 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-700'
        )}
        title={`${unreadCount} waste alerts`}
      >
        <Bell className="w-5 h-5" />
        {unreadCount > 0 && (
          <span className="absolute -top-0.5 -right-0.5 flex items-center justify-center w-4.5 h-4.5 min-w-[18px] text-[10px] font-bold text-white bg-red-500 rounded-full px-1">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 top-full mt-2 w-80 bg-white dark:bg-neutral-800 rounded-xl shadow-2xl border border-neutral-200 dark:border-neutral-700 z-50 overflow-hidden">
          {/* Header */}
          <div className="px-4 py-3 border-b border-neutral-200 dark:border-neutral-700 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-500" />
              <h3 className="text-sm font-semibold text-neutral-800 dark:text-neutral-200">Waste Alerts</h3>
            </div>
            {highRiskCount > 0 && (
              <span className="text-xs font-medium text-red-500 bg-red-50 dark:bg-red-900/20 px-2 py-0.5 rounded-full">
                {highRiskCount} high risk
              </span>
            )}
          </div>

          {/* Alert list */}
          <div className="max-h-80 overflow-y-auto">
            {activeAlerts.length === 0 ? (
              <div className="p-6 text-center">
                <div className="w-12 h-12 mx-auto bg-green-50 dark:bg-green-900/20 rounded-full flex items-center justify-center mb-3">
                  <Bell className="w-6 h-6 text-green-500" />
                </div>
                <p className="text-sm text-neutral-500 dark:text-neutral-400">No waste alerts right now</p>
                <p className="text-xs text-neutral-400 dark:text-neutral-500 mt-1">Your pantry is looking good!</p>
              </div>
            ) : (
              activeAlerts.map((alert: WasteAlert) => (
                <div
                  key={alert.id}
                  className={cn(
                    'px-4 py-3 border-b border-neutral-100 dark:border-neutral-700/50 last:border-b-0 transition-colors',
                    !alert.is_read && 'bg-amber-50/50 dark:bg-amber-900/10'
                  )}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className={cn(
                          'inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-bold uppercase',
                          alert.risk_level === 'high'
                            ? 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400'
                            : 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400'
                        )}>
                          {alert.risk_level}
                        </span>
                        <span className="text-sm font-medium text-neutral-800 dark:text-neutral-200 truncate">
                          {alert.item_name}
                        </span>
                      </div>
                      <p className="text-xs text-neutral-500 dark:text-neutral-400">
                        {alert.predicted_days_left <= 0
                          ? 'Likely already expired'
                          : `~${alert.predicted_days_left} day${alert.predicted_days_left !== 1 ? 's' : ''} left`}
                        {' '}&middot; {Math.round(alert.waste_probability * 100)}% waste risk
                      </p>
                      {alert.suggestion && (
                        <p className="text-xs text-primary-600 dark:text-primary-400 mt-1 flex items-center gap-1">
                          <ChefHat className="w-3 h-3" />
                          {alert.suggestion}
                        </p>
                      )}
                    </div>
                    <button
                      onClick={() => dismissAlert(alert.id)}
                      className="p-1 text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-300 transition-colors shrink-0"
                      title="Dismiss"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  )
}
