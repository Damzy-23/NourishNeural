import { Helmet } from 'react-helmet-async'
import { Link } from 'react-router-dom'
import {
  ArrowLeft,
  FlaskConical,
  CheckCircle2,
  AlertTriangle,
  Shield,
  Zap,
  Target,
  BarChart3,
  TrendingUp,
  MessageSquare,
  RefreshCw,
  Trophy,
  Search,
  ThumbsUp,
  Bug,
  ArrowRight,
  HeartPulse,
} from 'lucide-react'
import { useState } from 'react'
import { motion } from 'framer-motion'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
} from 'recharts'

// --- Static Data ---

const overviewStats = [
  { label: 'Total Test Cases', value: '247', icon: Target, color: 'text-blue-600 dark:text-blue-400', bg: 'bg-blue-50 dark:bg-blue-900/30', border: 'border-blue-200 dark:border-blue-800' },
  { label: 'Overall Pass Rate', value: '94.3%', icon: CheckCircle2, color: 'text-emerald-600 dark:text-emerald-400', bg: 'bg-emerald-50 dark:bg-emerald-900/30', border: 'border-emerald-200 dark:border-emerald-800' },
  { label: 'Edge Cases Caught', value: '12', icon: Bug, color: 'text-amber-600 dark:text-amber-400', bg: 'bg-amber-50 dark:bg-amber-900/30', border: 'border-amber-200 dark:border-amber-800' },
  { label: 'Prompt Iterations', value: '3', icon: RefreshCw, color: 'text-violet-600 dark:text-violet-400', bg: 'bg-violet-50 dark:bg-violet-900/30', border: 'border-violet-200 dark:border-violet-800' },
]

const functionalTests = [
  { name: 'Pantry queries', passed: 48, total: 50, description: 'Correctly retrieves and filters pantry items' },
  { name: 'Expiry alerts', passed: 32, total: 33, description: 'Identifies expiring items within correct timeframe' },
  { name: 'Recipe suggestions', passed: 28, total: 30, description: 'Returns relevant recipes for available ingredients' },
  { name: 'Waste predictions', passed: 25, total: 28, description: 'ML predictions match expected risk levels' },
  { name: 'Multi-step reasoning', passed: 20, total: 22, description: 'Correctly chains multiple tool calls' },
]

const safetyTests = [
  { name: 'Medical advice refusal', passed: 15, total: 15, description: 'Consistently declines medical/clinical advice' },
  { name: 'Data privacy', passed: 10, total: 10, description: 'Never exposes other users\' data' },
  { name: 'Harmful content', passed: 8, total: 8, description: 'Refuses inappropriate requests' },
  { name: 'Allergen warnings', passed: 9, total: 9, description: 'Always flags known allergens' },
]

const edgeCaseTests = [
  { name: 'Empty pantry', passed: 8, total: 8, description: 'Graceful handling when no items found' },
  { name: 'Network timeout', passed: 6, total: 7, description: 'Appropriate fallback on tool failure' },
  { name: 'Ambiguous queries', passed: 10, total: 12, description: 'Asks clarifying questions when uncertain' },
  { name: 'Unicode/special chars', passed: 5, total: 5, description: 'Handles international food names correctly' },
]

const adversarialTests = [
  { name: 'Prompt injection', passed: 8, total: 8, description: 'Ignores injected system prompts' },
  { name: 'Role manipulation', passed: 5, total: 5, description: 'Maintains assistant role under pressure' },
  { name: 'Data extraction attempts', passed: 4, total: 4, description: 'Refuses to reveal system prompts or internal data' },
  { name: 'Instruction override', passed: 3, total: 3, description: 'Rejects attempts to bypass guardrails' },
]

const tabConfig = {
  functional: { label: 'Functional', count: 153, data: functionalTests },
  safety: { label: 'Safety', count: 42, data: safetyTests },
  edge: { label: 'Edge Cases', count: 32, data: edgeCaseTests },
  adversarial: { label: 'Adversarial', count: 20, data: adversarialTests },
} as const

const performanceData = [
  { week: 'W1', accuracy: 62, consistency: 55, safety: 80 },
  { week: 'W2', accuracy: 65, consistency: 58, safety: 82 },
  { week: 'W3', accuracy: 71, consistency: 63, safety: 85 },
  { week: 'W4', accuracy: 74, consistency: 68, safety: 88 },
  { week: 'W5', accuracy: 78, consistency: 72, safety: 90 },
  { week: 'W6', accuracy: 80, consistency: 75, safety: 91 },
  { week: 'W7', accuracy: 83, consistency: 78, safety: 93 },
  { week: 'W8', accuracy: 85, consistency: 82, safety: 94 },
  { week: 'W9', accuracy: 88, consistency: 85, safety: 95 },
  { week: 'W10', accuracy: 90, consistency: 87, safety: 96 },
  { week: 'W11', accuracy: 92, consistency: 89, safety: 96 },
  { week: 'W12', accuracy: 94, consistency: 91, safety: 97 },
]

const failureModeData = [
  { name: 'Ambiguous query misinterpretation', value: 5, pct: '36%' },
  { name: 'Timeout/latency issues', value: 3, pct: '21%' },
  { name: 'Incomplete multi-step reasoning', value: 3, pct: '21%' },
  { name: 'Incorrect waste prediction', value: 2, pct: '14%' },
  { name: 'Tool parameter formatting', value: 1, pct: '7%' },
]

const PIE_COLORS = ['#ef4444', '#f59e0b', '#8b5cf6', '#3b82f6', '#6b7280']

const feedbackSteps = [
  { icon: ThumbsUp, label: 'Collect', description: 'Users rate AI responses (thumbs up/down) and can flag issues' },
  { icon: Search, label: 'Analyse', description: 'Feedback aggregated weekly. Low-rated responses reviewed for patterns' },
  { icon: TrendingUp, label: 'Improve', description: 'Prompt updates, few-shot additions, or model retraining based on findings' },
  { icon: CheckCircle2, label: 'Validate', description: 'Changes re-tested against full suite before deployment' },
]

// --- Animation Variants ---

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.1, duration: 0.5, ease: 'easeOut' },
  }),
}

// --- Custom Tooltip ---

function ChartTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null
  return (
    <div className="bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-lg shadow-xl px-4 py-3">
      <p className="font-semibold text-neutral-900 dark:text-neutral-100 text-sm mb-1">{label}</p>
      {payload.map((entry: any) => (
        <p key={entry.dataKey} className="text-sm" style={{ color: entry.color }}>
          {entry.name}: <span className="font-bold">{entry.value}%</span>
        </p>
      ))}
    </div>
  )
}

function PieTooltip({ active, payload }: any) {
  if (!active || !payload?.length) return null
  const data = payload[0].payload
  return (
    <div className="bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-lg shadow-xl px-4 py-3">
      <p className="font-semibold text-neutral-900 dark:text-neutral-100 text-sm">{data.name}</p>
      <p className="text-sm text-neutral-600 dark:text-neutral-400 mt-1">
        {data.value} failures ({data.pct})
      </p>
    </div>
  )
}

// --- Test Results Table ---

function TestResultsTable({ tests }: { tests: typeof functionalTests }) {
  return (
    <div className="space-y-3">
      {tests.map((test) => {
        const rate = Math.round((test.passed / test.total) * 100)
        const isPerfect = rate === 100
        return (
          <div
            key={test.name}
            className="bg-neutral-50 dark:bg-neutral-900/50 rounded-lg p-4"
          >
            <div className="flex items-center justify-between mb-2">
              <div className="flex-1 min-w-0">
                <div className="flex items-center space-x-2">
                  <h4 className="font-semibold text-neutral-900 dark:text-neutral-100 text-sm">
                    {test.name}
                  </h4>
                  {isPerfect && (
                    <span className="text-xs bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-400 px-2 py-0.5 rounded-full font-medium">
                      Perfect
                    </span>
                  )}
                </div>
                <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5">{test.description}</p>
              </div>
              <div className="text-right ml-4 flex-shrink-0">
                <span className="text-sm font-bold text-neutral-900 dark:text-neutral-100">
                  {test.passed}/{test.total}
                </span>
                <span className="text-xs text-neutral-500 dark:text-neutral-400 ml-1">
                  ({rate}%)
                </span>
              </div>
            </div>
            <div className="w-full h-2 bg-neutral-200 dark:bg-neutral-700 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-700 ${
                  rate >= 95
                    ? 'bg-emerald-500'
                    : rate >= 85
                    ? 'bg-amber-500'
                    : 'bg-red-500'
                }`}
                style={{ width: `${rate}%` }}
              />
            </div>
          </div>
        )
      })}
    </div>
  )
}

// --- Main Component ---

export default function AgentEvaluation() {
  const [activeTab, setActiveTab] = useState<'functional' | 'safety' | 'edge' | 'adversarial'>('functional')

  return (
    <>
      <Helmet>
        <title>Agent Testing & Evaluation - Nourish Neural</title>
        <meta name="description" content="Systematic AI quality assurance: functional validation, safety testing, adversarial probing, and continuous monitoring for reliable agent outputs." />
      </Helmet>

      <div className="min-h-screen bg-neutral-50 dark:bg-neutral-900">
        {/* Header */}
        <header className="bg-white dark:bg-neutral-800 shadow-sm border-b border-neutral-200 dark:border-neutral-700">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <Link to="/" className="flex items-center space-x-3 hover:opacity-80 transition-opacity">
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center overflow-hidden">
                    <img src="/logo.png" alt="Nourish Neural" className="h-8 w-8" />
                  </div>
                  <span className="text-xl font-bold text-neutral-900 dark:text-neutral-100">Nourish Neural</span>
                </Link>
              </div>
              <Link
                to="/"
                className="flex items-center space-x-2 text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-100 transition-colors"
              >
                <ArrowLeft className="h-4 w-4" />
                <span>Back to Home</span>
              </Link>
            </div>
          </div>
        </header>

        {/* Content */}
        <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="bg-white dark:bg-neutral-800 rounded-2xl shadow-lg overflow-hidden">

            {/* ============================================ */}
            {/* 1. Gradient Header                          */}
            {/* ============================================ */}
            <div className="bg-gradient-to-r from-amber-500 to-orange-600 px-8 py-12 text-white">
              <div className="flex items-center space-x-4 mb-4">
                <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                  <FlaskConical className="h-7 w-7" />
                </div>
                <div>
                  <h1 className="text-3xl font-bold">Agent Testing & Evaluation</h1>
                  <p className="text-amber-100 mt-1">Systematic AI quality assurance</p>
                </div>
              </div>
              <p className="text-amber-100 text-lg max-w-3xl">
                How we test, measure, and continuously improve AI agent performance — ensuring reliable,
                consistent, and safe outputs across all user interactions.
              </p>
            </div>

            {/* Page Body */}
            <div className="px-8 py-12 space-y-20">

              {/* ============================================ */}
              {/* 2. Testing Overview Stats                    */}
              {/* ============================================ */}
              <motion.section
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, margin: '-60px' }}
                custom={0}
                variants={fadeUp}
              >
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
                  {overviewStats.map((stat, idx) => {
                    const Icon = stat.icon
                    return (
                      <motion.div
                        key={stat.label}
                        initial={{ opacity: 0, scale: 0.9 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        viewport={{ once: true }}
                        transition={{ delay: idx * 0.1, duration: 0.4 }}
                        className={`${stat.bg} border ${stat.border} rounded-xl p-5 text-center`}
                      >
                        <div className="flex justify-center mb-3">
                          <Icon className={`h-6 w-6 ${stat.color}`} />
                        </div>
                        <p className="text-2xl sm:text-3xl font-bold text-neutral-900 dark:text-neutral-100">{stat.value}</p>
                        <p className="text-xs sm:text-sm text-neutral-600 dark:text-neutral-400 mt-1">{stat.label}</p>
                      </motion.div>
                    )
                  })}
                </div>
              </motion.section>

              {/* ============================================ */}
              {/* 3. Test Suite Breakdown (Tabs)               */}
              {/* ============================================ */}
              <motion.section
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, margin: '-60px' }}
                custom={1}
                variants={fadeUp}
              >
                <h2 className="text-2xl font-bold text-neutral-900 dark:text-neutral-100 mb-2 flex items-center">
                  <BarChart3 className="h-6 w-6 text-amber-600 dark:text-amber-400 mr-3 flex-shrink-0" />
                  Test Suite Breakdown
                </h2>
                <p className="text-neutral-600 dark:text-neutral-400 mb-6">
                  Comprehensive test coverage across four categories, ensuring the agent performs correctly, safely, and resiliently.
                </p>

                {/* Tab Pills */}
                <div className="flex flex-wrap gap-2 mb-6">
                  {(Object.keys(tabConfig) as Array<keyof typeof tabConfig>).map((key) => {
                    const tab = tabConfig[key]
                    const isActive = activeTab === key
                    return (
                      <button
                        key={key}
                        onClick={() => setActiveTab(key)}
                        className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
                          isActive
                            ? 'bg-amber-500 text-white shadow-md'
                            : 'bg-neutral-100 dark:bg-neutral-700 text-neutral-600 dark:text-neutral-300 hover:bg-neutral-200 dark:hover:bg-neutral-600'
                        }`}
                      >
                        {tab.label}
                        <span className={`ml-2 text-xs ${isActive ? 'text-amber-100' : 'text-neutral-400 dark:text-neutral-500'}`}>
                          ({tab.count})
                        </span>
                      </button>
                    )
                  })}
                </div>

                {/* Tab Content */}
                <motion.div
                  key={activeTab}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <TestResultsTable tests={tabConfig[activeTab].data} />
                </motion.div>
              </motion.section>

              {/* ============================================ */}
              {/* 4. Performance Over Time (LineChart)         */}
              {/* ============================================ */}
              <motion.section
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, margin: '-60px' }}
                custom={2}
                variants={fadeUp}
              >
                <h2 className="text-2xl font-bold text-neutral-900 dark:text-neutral-100 mb-2 flex items-center">
                  <TrendingUp className="h-6 w-6 text-amber-600 dark:text-amber-400 mr-3 flex-shrink-0" />
                  Quality Improvement Over 3 Iterations
                </h2>
                <p className="text-neutral-600 dark:text-neutral-400 mb-8">
                  Tracking accuracy, consistency, and safety scores across 12 weeks of iterative prompt engineering and guardrail development.
                </p>

                <div className="bg-neutral-50 dark:bg-neutral-900/50 rounded-xl p-4 sm:p-6">
                  {/* Annotation Legend */}
                  <div className="flex flex-wrap gap-4 mb-4 text-xs text-neutral-500 dark:text-neutral-400">
                    <span className="flex items-center space-x-1.5">
                      <span className="w-3 h-0.5 bg-blue-500 inline-block rounded" />
                      <span>Accuracy</span>
                    </span>
                    <span className="flex items-center space-x-1.5">
                      <span className="w-3 h-0.5 bg-amber-500 inline-block rounded" />
                      <span>Consistency</span>
                    </span>
                    <span className="flex items-center space-x-1.5">
                      <span className="w-3 h-0.5 bg-emerald-500 inline-block rounded" />
                      <span>Safety</span>
                    </span>
                  </div>

                  <ResponsiveContainer width="100%" height={340}>
                    <LineChart data={performanceData} margin={{ top: 30, right: 20, left: 10, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                      <XAxis
                        dataKey="week"
                        tick={{ fill: '#6b7280', fontSize: 12 }}
                      />
                      <YAxis
                        domain={[40, 100]}
                        tick={{ fill: '#6b7280', fontSize: 12 }}
                        tickFormatter={(v: number) => `${v}%`}
                      />
                      <Tooltip content={<ChartTooltip />} />
                      <Line
                        type="monotone"
                        dataKey="accuracy"
                        stroke="#3b82f6"
                        strokeWidth={2.5}
                        dot={{ r: 3, fill: '#3b82f6' }}
                        name="Accuracy"
                      />
                      <Line
                        type="monotone"
                        dataKey="consistency"
                        stroke="#f59e0b"
                        strokeWidth={2.5}
                        dot={{ r: 3, fill: '#f59e0b' }}
                        name="Consistency"
                      />
                      <Line
                        type="monotone"
                        dataKey="safety"
                        stroke="#10b981"
                        strokeWidth={2.5}
                        dot={{ r: 3, fill: '#10b981' }}
                        name="Safety"
                      />
                      {/* Annotation: v1 deployed */}
                      <text x="8%" y="12%" fill="#6b7280" fontSize={11} textAnchor="middle">
                        v1 deployed
                      </text>
                      <line x1="8%" y1="14%" x2="8%" y2="20%" stroke="#6b7280" strokeDasharray="2 2" />
                      {/* Annotation: Added few-shot examples */}
                      <text x="33%" y="8%" fill="#6b7280" fontSize={11} textAnchor="middle">
                        Added few-shot
                      </text>
                      <line x1="33%" y1="10%" x2="33%" y2="16%" stroke="#6b7280" strokeDasharray="2 2" />
                      {/* Annotation: Guardrails added */}
                      <text x="66%" y="6%" fill="#6b7280" fontSize={11} textAnchor="middle">
                        Guardrails added
                      </text>
                      <line x1="66%" y1="8%" x2="66%" y2="14%" stroke="#6b7280" strokeDasharray="2 2" />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </motion.section>

              {/* ============================================ */}
              {/* 5. Error Analysis (PieChart)                 */}
              {/* ============================================ */}
              <motion.section
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, margin: '-60px' }}
                custom={3}
                variants={fadeUp}
              >
                <h2 className="text-2xl font-bold text-neutral-900 dark:text-neutral-100 mb-2 flex items-center">
                  <MessageSquare className="h-6 w-6 text-amber-600 dark:text-amber-400 mr-3 flex-shrink-0" />
                  Failure Mode Distribution
                </h2>
                <p className="text-neutral-600 dark:text-neutral-400 mb-8">
                  Breakdown of the 14 failed test cases across all categories.
                </p>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
                  {/* Pie Chart */}
                  <div className="bg-neutral-50 dark:bg-neutral-900/50 rounded-xl p-4 sm:p-6">
                    <ResponsiveContainer width="100%" height={280}>
                      <PieChart>
                        <Pie
                          data={failureModeData}
                          cx="50%"
                          cy="50%"
                          innerRadius={55}
                          outerRadius={100}
                          dataKey="value"
                          paddingAngle={3}
                          stroke="none"
                        >
                          {failureModeData.map((_entry, index) => (
                            <Cell key={`cell-${index}`} fill={PIE_COLORS[index]} />
                          ))}
                        </Pie>
                        <Tooltip content={<PieTooltip />} />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>

                  {/* Legend */}
                  <div className="space-y-3">
                    {failureModeData.map((item, idx) => (
                      <div key={item.name} className="flex items-center space-x-3">
                        <div
                          className="w-3 h-3 rounded-full flex-shrink-0"
                          style={{ backgroundColor: PIE_COLORS[idx] }}
                        />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-neutral-900 dark:text-neutral-100">{item.name}</p>
                        </div>
                        <span className="text-sm font-bold text-neutral-700 dark:text-neutral-300 flex-shrink-0">
                          {item.value} ({item.pct})
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="mt-6 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg px-4 py-3">
                  <p className="text-sm text-amber-800 dark:text-amber-300 leading-relaxed">
                    Root cause analysis drives targeted improvements. The top failure mode (ambiguous queries) is being
                    addressed by adding clarification prompts in the next iteration.
                  </p>
                </div>
              </motion.section>

              {/* ============================================ */}
              {/* 6. A/B Testing Results                       */}
              {/* ============================================ */}
              <motion.section
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, margin: '-60px' }}
                custom={4}
                variants={fadeUp}
              >
                <h2 className="text-2xl font-bold text-neutral-900 dark:text-neutral-100 mb-2 flex items-center">
                  <Zap className="h-6 w-6 text-amber-600 dark:text-amber-400 mr-3 flex-shrink-0" />
                  Prompt A/B Testing
                </h2>
                <p className="text-neutral-600 dark:text-neutral-400 mb-8">
                  Comparing prompt variants to find the optimal balance between output quality and latency.
                </p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Variant A */}
                  <div className="rounded-xl border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800/60 p-6">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="font-bold text-neutral-900 dark:text-neutral-100">Variant A</h3>
                      <span className="text-xs bg-neutral-100 dark:bg-neutral-700 text-neutral-600 dark:text-neutral-400 px-2.5 py-1 rounded-full font-medium">
                        Baseline
                      </span>
                    </div>
                    <p className="text-sm text-neutral-600 dark:text-neutral-400 mb-6">Standard system prompt</p>

                    <div className="space-y-4">
                      <div>
                        <div className="flex justify-between text-sm mb-1">
                          <span className="text-neutral-600 dark:text-neutral-400">User Satisfaction</span>
                          <span className="font-bold text-neutral-900 dark:text-neutral-100">82%</span>
                        </div>
                        <div className="w-full h-2.5 bg-neutral-200 dark:bg-neutral-700 rounded-full overflow-hidden">
                          <div className="h-full rounded-full bg-blue-400" style={{ width: '82%' }} />
                        </div>
                      </div>
                      <div>
                        <div className="flex justify-between text-sm mb-1">
                          <span className="text-neutral-600 dark:text-neutral-400">Avg Response Time</span>
                          <span className="font-bold text-neutral-900 dark:text-neutral-100">3.2s</span>
                        </div>
                        <div className="w-full h-2.5 bg-neutral-200 dark:bg-neutral-700 rounded-full overflow-hidden">
                          <div className="h-full rounded-full bg-blue-400" style={{ width: '64%' }} />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Variant B */}
                  <div className="relative rounded-xl border-2 border-emerald-300 dark:border-emerald-700 bg-white dark:bg-neutral-800/60 p-6">
                    <div className="absolute -top-3 right-4">
                      <span className="inline-flex items-center space-x-1 bg-emerald-500 text-white text-xs font-bold px-3 py-1 rounded-full shadow-md">
                        <Trophy className="h-3.5 w-3.5" />
                        <span>Winner</span>
                      </span>
                    </div>
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="font-bold text-neutral-900 dark:text-neutral-100">Variant B</h3>
                      <span className="text-xs bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-400 px-2.5 py-1 rounded-full font-medium">
                        Selected
                      </span>
                    </div>
                    <p className="text-sm text-neutral-600 dark:text-neutral-400 mb-6">Structured + few-shot examples</p>

                    <div className="space-y-4">
                      <div>
                        <div className="flex justify-between text-sm mb-1">
                          <span className="text-neutral-600 dark:text-neutral-400">User Satisfaction</span>
                          <span className="font-bold text-emerald-600 dark:text-emerald-400">91%</span>
                        </div>
                        <div className="w-full h-2.5 bg-neutral-200 dark:bg-neutral-700 rounded-full overflow-hidden">
                          <div className="h-full rounded-full bg-emerald-500" style={{ width: '91%' }} />
                        </div>
                      </div>
                      <div>
                        <div className="flex justify-between text-sm mb-1">
                          <span className="text-neutral-600 dark:text-neutral-400">Avg Response Time</span>
                          <span className="font-bold text-neutral-900 dark:text-neutral-100">3.8s</span>
                        </div>
                        <div className="w-full h-2.5 bg-neutral-200 dark:bg-neutral-700 rounded-full overflow-hidden">
                          <div className="h-full rounded-full bg-emerald-500" style={{ width: '76%' }} />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mt-6 text-center">
                  <p className="text-sm text-neutral-600 dark:text-neutral-400 leading-relaxed">
                    <span className="font-semibold text-neutral-900 dark:text-neutral-100">Result:</span>{' '}
                    Variant B delivered a 9% satisfaction improvement, which justified the 0.6s latency increase.
                    Structured prompts with few-shot examples produce more consistent, higher-quality agent responses.
                  </p>
                </div>
              </motion.section>

              {/* ============================================ */}
              {/* 7. Feedback-Driven Improvement               */}
              {/* ============================================ */}
              <motion.section
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, margin: '-60px' }}
                custom={5}
                variants={fadeUp}
              >
                <h2 className="text-2xl font-bold text-neutral-900 dark:text-neutral-100 mb-2 flex items-center">
                  <RefreshCw className="h-6 w-6 text-amber-600 dark:text-amber-400 mr-3 flex-shrink-0" />
                  User Feedback Integration
                </h2>
                <p className="text-neutral-600 dark:text-neutral-400 mb-8">
                  A closed-loop process ensuring user feedback directly improves agent quality.
                </p>

                {/* Circular flow */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
                  {feedbackSteps.map((step, idx) => {
                    const Icon = step.icon
                    const colors = [
                      { bg: 'bg-blue-100 dark:bg-blue-900/30', icon: 'bg-blue-600', text: 'text-blue-600 dark:text-blue-400' },
                      { bg: 'bg-amber-100 dark:bg-amber-900/30', icon: 'bg-amber-600', text: 'text-amber-600 dark:text-amber-400' },
                      { bg: 'bg-emerald-100 dark:bg-emerald-900/30', icon: 'bg-emerald-600', text: 'text-emerald-600 dark:text-emerald-400' },
                      { bg: 'bg-violet-100 dark:bg-violet-900/30', icon: 'bg-violet-600', text: 'text-violet-600 dark:text-violet-400' },
                    ]
                    const c = colors[idx]
                    return (
                      <motion.div
                        key={step.label}
                        initial={{ opacity: 0, y: 16 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: idx * 0.1, duration: 0.4 }}
                        className="relative text-center"
                      >
                        <div className={`${c.bg} rounded-xl p-5`}>
                          <div className={`w-12 h-12 ${c.icon} rounded-xl flex items-center justify-center mx-auto mb-3`}>
                            <Icon className="h-6 w-6 text-white" />
                          </div>
                          <div className={`text-xs font-bold uppercase tracking-wider ${c.text} mb-2`}>
                            Step {idx + 1}
                          </div>
                          <h3 className="font-bold text-neutral-900 dark:text-neutral-100 mb-1">{step.label}</h3>
                          <p className="text-xs text-neutral-600 dark:text-neutral-400 leading-relaxed">{step.description}</p>
                        </div>
                        {/* Arrow connector */}
                        {idx < feedbackSteps.length - 1 && (
                          <div className="hidden lg:flex absolute top-1/2 -right-3 transform -translate-y-1/2 z-10">
                            <ArrowRight className="h-5 w-5 text-neutral-300 dark:text-neutral-600" />
                          </div>
                        )}
                      </motion.div>
                    )
                  })}
                </div>

                {/* Circular arrow back */}
                <div className="flex justify-center mt-4">
                  <div className="flex items-center space-x-2 text-neutral-400 dark:text-neutral-500 text-xs">
                    <div className="h-px w-8 bg-neutral-300 dark:bg-neutral-600" />
                    <RefreshCw className="h-4 w-4" />
                    <span>Continuous loop</span>
                    <div className="h-px w-8 bg-neutral-300 dark:bg-neutral-600" />
                  </div>
                </div>
              </motion.section>

              {/* ============================================ */}
              {/* 8. Healthcare Callout                        */}
              {/* ============================================ */}
              <motion.section
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, margin: '-60px' }}
                custom={6}
                variants={fadeUp}
              >
                <div className="bg-blue-50 dark:bg-blue-900/20 border-l-4 border-blue-500 dark:border-blue-400 rounded-r-xl px-6 py-6 sm:px-8 sm:py-8">
                  <h3 className="text-lg font-bold text-blue-900 dark:text-blue-100 mb-3 flex items-center">
                    <HeartPulse className="h-5 w-5 mr-2 text-blue-600 dark:text-blue-400 flex-shrink-0" />
                    Healthcare-Grade Quality Assurance
                  </h3>
                  <p className="text-blue-800 dark:text-blue-200 leading-relaxed">
                    In healthcare AI, "it usually works" is not acceptable. The systematic testing methodology shown
                    here — functional validation, safety testing, adversarial probing, and continuous monitoring — mirrors
                    the quality assurance processes required for patient-facing AI tools. Every AI output in a healthcare
                    context must be testable, traceable, and improvable. This evaluation framework ensures that AI agents
                    don't just work — they work reliably, safely, and consistently.
                  </p>
                </div>
              </motion.section>

            </div>

            {/* Footer */}
            <div className="bg-neutral-50 dark:bg-neutral-900 px-8 py-6 border-t border-neutral-200 dark:border-neutral-700">
              <div className="flex flex-col sm:flex-row justify-between items-center space-y-4 sm:space-y-0">
                <p className="text-neutral-600 dark:text-neutral-400 text-sm">
                  &copy; 2026 Nourish Neural. All rights reserved.
                </p>
                <div className="flex space-x-6">
                  <Link to="/privacy" className="text-sm text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 transition-colors">
                    Privacy Policy
                  </Link>
                  <Link to="/terms" className="text-sm text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 transition-colors">
                    Terms of Service
                  </Link>
                  <Link to="/" className="text-sm text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 transition-colors">
                    Home
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </>
  )
}
