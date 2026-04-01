import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { apiService } from '../services/api'
import { useAuth } from '../hooks/useAuth'
import { Leaf, Droplets, PoundSterling } from 'lucide-react'

interface SustainabilityStats {
    carbonSavedKg: number;
    waterSavedLiters: number;
    moneySaved: number;
    badge: {
        level: number;
        title: string;
        icon: string;
    };
    consumedItemsCount: number;
}

export default function SustainabilityWidget({ scope = 'personal' }: { scope?: 'personal' | 'household' }) {
    const { user } = useAuth()
    const [stats, setStats] = useState<SustainabilityStats | null>(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        if (user) {
            loadStats()
        }
    }, [user, scope])

    const loadStats = async () => {
        try {
            setLoading(true)
            const data = await apiService.get<SustainabilityStats>(`/api/sustainability/stats?scope=${scope}`)
            setStats(data)
        } catch (err) {
            console.error('Failed to load sustainability stats', err)
        } finally {
            setLoading(false)
        }
    }

    if (loading || !stats) {
        return (
            <div className="card h-full flex flex-col items-center justify-center p-6 animate-pulse">
                <div className="h-12 w-12 bg-neutral-200 dark:bg-neutral-700 rounded-full mb-4"></div>
                <div className="h-4 w-32 bg-neutral-200 dark:bg-neutral-700 rounded mb-2"></div>
                <div className="h-3 w-24 bg-neutral-200 dark:bg-neutral-800 rounded"></div>
            </div>
        )
    }

    return (
        <motion.div
            className="card relative overflow-hidden"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
        >
            <div className="absolute top-0 right-0 w-32 h-32 bg-primary-500/10 rounded-full blur-3xl -mr-10 -mt-10 pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-24 h-24 bg-accent-500/10 rounded-full blur-2xl -ml-8 -mb-8 pointer-events-none" />

            <div className="card-header border-b border-neutral-100 dark:border-neutral-800 pb-4">
                <h2 className="text-xl font-bold flex items-center space-x-2">
                    <Leaf className="w-5 h-5 text-primary-500" />
                    <span className="gradient-text bg-gradient-to-r from-primary-600 to-accent-500">Eco Impact</span>
                </h2>
                <span className="text-xs font-semibold px-2 py-1 rounded bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400 capitalize">
                    {scope} Scope
                </span>
            </div>

            <div className="card-content pt-4 space-y-5">

                {/* Badge Section */}
                <div className="flex items-center space-x-4 bg-white dark:bg-neutral-800 rounded-2xl p-4 border border-neutral-100 dark:border-neutral-700 shadow-sm">
                    <div className="flex-shrink-0 w-14 h-14 bg-gradient-to-br from-primary-400 to-accent-500 rounded-full flex items-center justify-center text-3xl shadow-lg shadow-primary-500/30">
                        {stats.badge.icon}
                    </div>
                    <div>
                        <p className="text-sm text-neutral-500 dark:text-neutral-400 font-medium tracking-wide uppercase">Current Hero Status</p>
                        <h3 className="text-xl font-black text-neutral-900 dark:text-neutral-100">{stats.badge.title}</h3>
                        <p className="text-xs text-primary-600 dark:text-primary-400 font-bold mt-0.5">Level {stats.badge.level}</p>
                    </div>
                </div>

                {/* Metrics Grid */}
                <div className="grid grid-cols-2 gap-3">
                    <div className="bg-primary-50 dark:bg-primary-900/20 rounded-2xl p-4 border border-primary-100 dark:border-primary-800/50 relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-16 h-16 bg-primary-200/30 rounded-full blur-xl -mr-4 -mt-4" />
                        <div className="flex items-center space-x-2 mb-2 relative z-10">
                            <Leaf className="w-5 h-5 text-primary-600 dark:text-primary-400" />
                            <span className="text-xs font-bold text-primary-800 dark:text-primary-300 uppercase tracking-wide">CO₂ Saved</span>
                        </div>
                        <p className="text-3xl font-black text-primary-900 dark:text-primary-100 relative z-10">{stats.carbonSavedKg.toFixed(1)} <span className="text-sm font-semibold opacity-70">kg</span></p>
                    </div>

                    <div className="bg-blue-50 dark:bg-blue-900/20 rounded-2xl p-4 border border-blue-100 dark:border-blue-800/50 relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-16 h-16 bg-blue-200/30 rounded-full blur-xl -mr-4 -mt-4" />
                        <div className="flex items-center space-x-2 mb-2 relative z-10">
                            <Droplets className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                            <span className="text-xs font-bold text-blue-800 dark:text-blue-300 uppercase tracking-wide">Water Kept</span>
                        </div>
                        <p className="text-3xl font-black text-blue-900 dark:text-blue-100 relative z-10">{stats.waterSavedLiters.toLocaleString()} <span className="text-sm font-semibold opacity-70">L</span></p>
                    </div>
                </div>

                {/* Footnote */}
                <div className="flex items-center justify-between pt-3 pl-1 pr-1 border-t border-neutral-100 dark:border-neutral-800">
                    <p className="text-sm text-neutral-500 dark:text-neutral-400">
                        <span className="font-bold text-neutral-700 dark:text-neutral-300">{stats.consumedItemsCount}</span> items fully utilized
                    </p>
                    <div className="flex items-center space-x-1.5 text-accent-600 dark:text-accent-400">
                        <PoundSterling className="w-4 h-4" />
                        <span className="text-sm font-bold">£{stats.moneySaved.toFixed(2)} saved</span>
                    </div>
                </div>
            </div>
        </motion.div>
    )
}
