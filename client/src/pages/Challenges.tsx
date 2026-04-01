import { useState } from 'react'
import { Helmet } from 'react-helmet-async'
import { useQuery, useMutation, useQueryClient } from 'react-query'
import { motion } from 'framer-motion'
import {
  Trophy, Users, Target, Flame, Star, Medal,
  ChevronRight, Calendar, TrendingUp, Award, Loader2, Leaf
} from 'lucide-react'
import toast from 'react-hot-toast'
import { apiService } from '../services/api'
import { cn } from '../utils/cn'
import { fadeUp, staggerContainer } from '../utils/motion'

interface Challenge {
  id: string
  title: string
  description: string
  challenge_type: string
  target_value: number
  start_date: string
  end_date: string
  participant_count: number
}

interface Participation {
  id: string
  challenge_id: string
  score: number
  items_saved: number
  waste_avoided_kg: number
  joined_at: string
  challenge: Challenge
}

interface LeaderboardEntry {
  household_id: string
  household_name: string
  score: number
  items_saved: number
  rank: number
}

interface Badge {
  id: string
  badge_type: string
  badge_name: string
  badge_description: string
  awarded_at: string
}

const CHALLENGE_ICONS: Record<string, typeof Trophy> = {
  zero_waste: Target,
  use_expiring: Flame,
  carbon_cut: Leaf,
}

const CHALLENGE_COLORS: Record<string, string> = {
  zero_waste: 'from-emerald-500 to-green-600',
  use_expiring: 'from-amber-500 to-orange-600',
  carbon_cut: 'from-teal-500 to-cyan-600',
}

const BADGE_ICONS: Record<string, { icon: typeof Star; color: string }> = {
  first_save: { icon: Star, color: 'text-yellow-500' },
  ten_saved: { icon: Medal, color: 'text-blue-500' },
  fifty_saved: { icon: Trophy, color: 'text-purple-500' },
  challenge_winner: { icon: Award, color: 'text-amber-500' },
}

export default function Challenges() {
  const queryClient = useQueryClient()
  const [selectedChallenge, setSelectedChallenge] = useState<string | null>(null)

  const { data: challenges = [], isLoading: loadingChallenges } = useQuery<Challenge[]>(
    'challenges',
    async () => {
      const res = await apiService.get('/api/challenges') as any
      return res.data?.challenges || []
    }
  )

  const { data: myParticipations = [] } = useQuery<Participation[]>(
    'my-challenges',
    async () => {
      const res = await apiService.get('/api/challenges/my') as any
      return res.data?.participations || []
    }
  )

  const { data: badges = [] } = useQuery<Badge[]>(
    'my-badges',
    async () => {
      const res = await apiService.get('/api/challenges/badges') as any
      return res.data?.badges || []
    }
  )

  const { data: leaderboard = [] } = useQuery<LeaderboardEntry[]>(
    ['leaderboard', selectedChallenge],
    async () => {
      if (!selectedChallenge) return []
      const res = await apiService.get(`/api/challenges/${selectedChallenge}/leaderboard`) as any
      return res.data?.leaderboard || []
    },
    { enabled: !!selectedChallenge }
  )

  const joinMutation = useMutation(
    (challengeId: string) => apiService.post(`/api/challenges/${challengeId}/join`),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('challenges')
        queryClient.invalidateQueries('my-challenges')
        toast.success('Joined challenge!')
      },
      onError: (err: any) => {
        const msg = err?.response?.data?.error || 'Failed to join'
        toast.error(msg)
      },
    }
  )

  const joinedIds = new Set(myParticipations.map((p) => p.challenge_id))

  const daysLeft = (endDate: string) => {
    const diff = Math.ceil((new Date(endDate).getTime() - Date.now()) / 86400000)
    return Math.max(0, diff)
  }

  if (loadingChallenges) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-8 h-8 animate-spin text-primary-500" />
      </div>
    )
  }

  return (
    <>
      <Helmet>
        <title>Challenges - Nourish Neural</title>
      </Helmet>

      <motion.div variants={staggerContainer} initial="hidden" animate="visible" className="space-y-8">
        {/* Header */}
        <motion.div variants={fadeUp} className="flex flex-col md:flex-row md:items-end md:justify-between gap-2">
          <div>
            <h1 className="text-3xl md:text-4xl font-display text-neutral-900 dark:text-neutral-100">
              Waste <span className="gradient-text">Challenges</span>
            </h1>
            <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-1">Compete with households to reduce food waste</p>
          </div>
          <div className="flex items-center gap-2 text-sm text-neutral-500 dark:text-neutral-400">
            <Trophy className="w-4 h-4 text-amber-500" />
            <span className="font-mono">{badges.length} badge{badges.length !== 1 ? 's' : ''} earned</span>
          </div>
        </motion.div>

        {/* Badges */}
        {badges.length > 0 && (
          <motion.div variants={fadeUp}>
            <h2 className="text-sm font-semibold text-neutral-700 dark:text-neutral-300 mb-3">Your Badges</h2>
            <div className="flex flex-wrap gap-3">
              {badges.map((badge) => {
                const cfg = BADGE_ICONS[badge.badge_type] || { icon: Star, color: 'text-neutral-400' }
                const BadgeIcon = cfg.icon
                return (
                  <div
                    key={badge.id}
                    className="flex items-center gap-2 bg-white dark:bg-neutral-800 rounded-lg px-3 py-2 border border-neutral-200 dark:border-neutral-700 shadow-sm"
                    title={badge.badge_description}
                  >
                    <BadgeIcon className={cn('w-5 h-5', cfg.color)} />
                    <span className="text-sm font-medium text-neutral-700 dark:text-neutral-300">{badge.badge_name}</span>
                  </div>
                )
              })}
            </div>
          </motion.div>
        )}

        {/* Active Challenges Grid */}
        <motion.div variants={fadeUp}>
          <h2 className="text-sm font-semibold text-neutral-700 dark:text-neutral-300 mb-3">Active Challenges</h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {challenges.map((challenge) => {
              const isJoined = joinedIds.has(challenge.id)
              const ChallengeIcon = CHALLENGE_ICONS[challenge.challenge_type] || Trophy
              const colorGrad = CHALLENGE_COLORS[challenge.challenge_type] || 'from-primary-500 to-primary-600'
              const participation = myParticipations.find((p) => p.challenge_id === challenge.id)
              const progress = participation ? Math.min(100, (participation.score / Math.max(challenge.target_value, 1)) * 100) : 0
              const remaining = daysLeft(challenge.end_date)

              return (
                <div
                  key={challenge.id}
                  className="bg-white dark:bg-neutral-800 rounded-xl border border-neutral-200 dark:border-neutral-700 overflow-hidden shadow-sm hover:shadow-md transition-shadow"
                >
                  <div className={cn('bg-gradient-to-r p-4 text-white', colorGrad)}>
                    <div className="flex items-center gap-2 mb-2">
                      <ChallengeIcon className="w-5 h-5" />
                      <h3 className="font-semibold text-sm">{challenge.title}</h3>
                    </div>
                    <p className="text-xs text-white/80">{challenge.description}</p>
                  </div>

                  <div className="p-4">
                    <div className="flex items-center justify-between text-xs text-neutral-500 dark:text-neutral-400 mb-3">
                      <div className="flex items-center gap-1">
                        <Users className="w-3 h-3" />
                        {challenge.participant_count} household{challenge.participant_count !== 1 ? 's' : ''}
                      </div>
                      <div className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {remaining} day{remaining !== 1 ? 's' : ''} left
                      </div>
                    </div>

                    {isJoined && participation && (
                      <div className="mb-3">
                        <div className="flex items-center justify-between text-xs mb-1">
                          <span className="text-neutral-600 dark:text-neutral-400">Progress</span>
                          <span className="font-medium text-neutral-800 dark:text-neutral-200">{Math.round(progress)}%</span>
                        </div>
                        <div className="h-2 bg-neutral-200 dark:bg-neutral-700 rounded-full overflow-hidden">
                          <div
                            className={cn('h-full rounded-full bg-gradient-to-r transition-all duration-500', colorGrad)}
                            style={{ width: `${progress}%` }}
                          />
                        </div>
                        <div className="flex items-center justify-between mt-2 text-xs text-neutral-500 dark:text-neutral-400">
                          <span>{participation.items_saved} items saved</span>
                          <span>{participation.score} pts</span>
                        </div>
                      </div>
                    )}

                    <div className="flex gap-2">
                      {isJoined ? (
                        <button
                          onClick={() => setSelectedChallenge(selectedChallenge === challenge.id ? null : challenge.id)}
                          className="flex-1 flex items-center justify-center gap-1 text-sm py-2 rounded-lg bg-neutral-100 dark:bg-neutral-700 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-200 dark:hover:bg-neutral-600 transition-colors"
                        >
                          <TrendingUp className="w-4 h-4" />
                          Leaderboard
                        </button>
                      ) : (
                        <button
                          onClick={() => joinMutation.mutate(challenge.id)}
                          disabled={joinMutation.isLoading}
                          className="flex-1 flex items-center justify-center gap-1 text-sm py-2 rounded-lg bg-primary-500 text-white hover:bg-primary-600 disabled:opacity-50 transition-colors"
                        >
                          {joinMutation.isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <ChevronRight className="w-4 h-4" />}
                          Join Challenge
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>

          {challenges.length === 0 && (
            <div className="text-center py-12 bg-white dark:bg-neutral-800 rounded-xl border border-neutral-200 dark:border-neutral-700">
              <Trophy className="w-12 h-12 mx-auto text-neutral-300 dark:text-neutral-600 mb-3" />
              <p className="text-neutral-500 dark:text-neutral-400">No active challenges right now</p>
              <p className="text-sm text-neutral-400 dark:text-neutral-500 mt-1">Check back soon for new community challenges</p>
            </div>
          )}
        </motion.div>

        {/* Leaderboard */}
        {selectedChallenge && leaderboard.length > 0 && (
          <motion.div variants={fadeUp} className="bg-white dark:bg-neutral-800 rounded-xl border border-neutral-200 dark:border-neutral-700 overflow-hidden">
            <div className="px-4 py-3 border-b border-neutral-200 dark:border-neutral-700 flex items-center gap-2">
              <Trophy className="w-4 h-4 text-amber-500" />
              <h3 className="text-sm font-semibold text-neutral-800 dark:text-neutral-200">Leaderboard</h3>
            </div>
            <div className="divide-y divide-neutral-100 dark:divide-neutral-700/50">
              {leaderboard.map((entry, i) => (
                <div key={entry.household_id} className="flex items-center gap-3 px-4 py-3">
                  <div className={cn(
                    'w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold shrink-0',
                    i === 0 ? 'bg-amber-100 dark:bg-amber-900/30 text-amber-600' :
                    i === 1 ? 'bg-neutral-200 dark:bg-neutral-700 text-neutral-600 dark:text-neutral-300' :
                    i === 2 ? 'bg-orange-100 dark:bg-orange-900/30 text-orange-600' :
                    'bg-neutral-100 dark:bg-neutral-800 text-neutral-500'
                  )}>
                    {i + 1}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-neutral-800 dark:text-neutral-200 truncate">
                      {entry.household_name}
                    </p>
                    <p className="text-xs text-neutral-500 dark:text-neutral-400">
                      {entry.items_saved} items saved
                    </p>
                  </div>
                  <span className="text-sm font-bold text-primary-600 dark:text-primary-400">
                    {entry.score} pts
                  </span>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </motion.div>
    </>
  )
}
