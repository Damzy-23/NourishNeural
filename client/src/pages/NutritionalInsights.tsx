import { Helmet } from 'react-helmet-async'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  ArrowLeft,
  Heart,
  Activity,
  AlertTriangle,
  Sun,
  TrendingDown,
  CheckCircle,
  Flame,
  Layers,
  Target,
} from 'lucide-react'
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  RadarChart,
  Radar,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
} from 'recharts'

/* ─── Animation variants ─── */
const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
}

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.12, when: 'beforeChildren' as const },
  },
}

const scaleIn = {
  hidden: { opacity: 0, scale: 0.92 },
  visible: { opacity: 1, scale: 1, transition: { duration: 0.45 } },
}

/* ─── Demo data ─── */
const macroData = [
  { name: 'Protein', value: 22, color: '#3b82f6' },
  { name: 'Carbs', value: 48, color: '#f59e0b' },
  { name: 'Fat', value: 27, color: '#f43f5e' },
  { name: 'Fibre', value: 3, color: '#22c55e' },
]

const PIE_COLORS = ['#3b82f6', '#f59e0b', '#f43f5e', '#22c55e']

const nutrientComparison = [
  { nutrient: 'Protein', current: 68, recommended: 50, unit: 'g', status: 'good' as const },
  { nutrient: 'Carbohydrates', current: 290, recommended: 260, unit: 'g', status: 'good' as const },
  { nutrient: 'Fat', current: 78, recommended: 70, unit: 'g', status: 'caution' as const },
  { nutrient: 'Saturated Fat', current: 24, recommended: 20, unit: 'g', status: 'bad' as const },
  { nutrient: 'Fibre', current: 22, recommended: 30, unit: 'g', status: 'bad' as const },
  { nutrient: 'Sugar', current: 55, recommended: 30, unit: 'g', status: 'bad' as const },
]

const micronutrientData = [
  { nutrient: 'Vitamin A', coverage: 85 },
  { nutrient: 'Vitamin C', coverage: 92 },
  { nutrient: 'Vitamin D', coverage: 45 },
  { nutrient: 'Iron', coverage: 78 },
  { nutrient: 'Calcium', coverage: 65 },
  { nutrient: 'Potassium', coverage: 58 },
  { nutrient: 'Zinc', coverage: 72 },
  { nutrient: 'Vitamin B12', coverage: 88 },
]

const pantryNutritionData = [
  { category: 'Vegetables', score: 92 },
  { category: 'Fruits', score: 88 },
  { category: 'Fish', score: 85 },
  { category: 'Dairy', score: 72 },
  { category: 'Meat', score: 68 },
  { category: 'Bakery', score: 45 },
  { category: 'Beverages', score: 35 },
  { category: 'Snacks', score: 28 },
]

const eatwellData = [
  { group: 'Fruit & Vegetables', current: 32, target: 33, met: false },
  { group: 'Starchy Carbs', current: 35, target: 33, met: true },
  { group: 'Protein', current: 15, target: 12, met: true },
  { group: 'Dairy', current: 12, target: 15, met: false },
  { group: 'Oils & Spreads', current: 6, target: 5, met: false },
]

const recommendations = [
  {
    icon: AlertTriangle,
    iconColor: 'text-amber-500',
    bgColor: 'bg-amber-50 dark:bg-amber-900/20',
    borderColor: 'border-amber-200 dark:border-amber-800',
    title: 'Increase Fibre Intake',
    body: 'Your fibre intake is 22g/day vs the recommended 30g. Add wholegrain bread, oats, lentils, or chickpeas to your grocery list.',
  },
  {
    icon: Sun,
    iconColor: 'text-amber-500',
    bgColor: 'bg-amber-50 dark:bg-amber-900/20',
    borderColor: 'border-amber-200 dark:border-amber-800',
    title: 'Boost Vitamin D',
    body: 'At 45% of recommended levels, consider oily fish (salmon, mackerel), fortified cereals, or eggs. Particularly important during UK winters.',
  },
  {
    icon: TrendingDown,
    iconColor: 'text-green-600 dark:text-green-400',
    bgColor: 'bg-green-50 dark:bg-green-900/20',
    borderColor: 'border-green-200 dark:border-green-800',
    title: 'Reduce Saturated Fat',
    body: 'Currently 20% above the NHS limit. Swap butter for olive oil and choose leaner cuts of meat.',
  },
  {
    icon: CheckCircle,
    iconColor: 'text-green-600 dark:text-green-400',
    bgColor: 'bg-green-50 dark:bg-green-900/20',
    borderColor: 'border-green-200 dark:border-green-800',
    title: 'Strong Protein Profile',
    body: 'Excellent protein diversity from both animal and plant sources. Maintain current variety.',
  },
]

/* ─── Helpers ─── */
function getBarColor(score: number) {
  if (score >= 70) return '#22c55e'
  if (score >= 50) return '#f59e0b'
  return '#ef4444'
}

function statusBadge(status: 'good' | 'caution' | 'bad') {
  const map = {
    good: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
    caution: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
    bad: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
  }
  const labels = { good: 'On Track', caution: 'Caution', bad: 'Needs Attention' }
  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${map[status]}`}>
      {labels[status]}
    </span>
  )
}

/* ─── Health Score Ring ─── */
function HealthScoreRing({ score }: { score: number }) {
  const radius = 70
  const circumference = 2 * Math.PI * radius
  const progress = (score / 100) * circumference
  const color = score >= 70 ? '#22c55e' : score >= 50 ? '#f59e0b' : '#ef4444'

  return (
    <div className="relative w-48 h-48 mx-auto">
      <svg className="w-48 h-48 -rotate-90" viewBox="0 0 160 160">
        <circle
          cx="80"
          cy="80"
          r={radius}
          fill="none"
          stroke="currentColor"
          className="text-neutral-200 dark:text-neutral-700"
          strokeWidth="10"
        />
        <motion.circle
          cx="80"
          cy="80"
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth="10"
          strokeLinecap="round"
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: circumference - progress }}
          transition={{ duration: 1.2, ease: 'easeOut' }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-4xl font-bold text-neutral-900 dark:text-neutral-100">{score}</span>
        <span className="text-sm text-neutral-500 dark:text-neutral-400">/100</span>
      </div>
    </div>
  )
}

/* ─── Custom Tooltip for Bar Chart ─── */
function BarTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null
  return (
    <div className="bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-lg px-3 py-2 shadow-lg">
      <p className="text-sm font-medium text-neutral-900 dark:text-neutral-100">{label}</p>
      <p className="text-sm text-neutral-600 dark:text-neutral-400">
        Score: <span className="font-semibold">{payload[0].value}</span>
      </p>
    </div>
  )
}

/* ─── Main Component ─── */
export default function NutritionalInsights() {
  const healthScore = 76

  return (
    <>
      <Helmet>
        <title>Nutritional Insights - Nourish Neural</title>
        <meta
          name="description"
          content="AI-powered nutritional health insights aligned to NHS Eatwell Guide standards"
        />
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

        {/* Main */}
        <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="bg-white dark:bg-neutral-800 rounded-2xl shadow-lg overflow-hidden">
            {/* ─── 1. Gradient Header ─── */}
            <div className="bg-gradient-to-r from-green-600 to-emerald-600 px-8 py-12 text-white">
              <div className="flex items-center space-x-4 mb-4">
                <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                  <Heart className="h-7 w-7" />
                </div>
                <div>
                  <h1 className="text-3xl font-bold">Nutritional Health Insights</h1>
                  <p className="text-green-100 mt-1">AI-powered dietary analysis</p>
                </div>
              </div>
              <p className="text-green-100 max-w-2xl">
                Track nutritional balance across your pantry and meal plans, with recommendations aligned to NHS
                Eatwell Guide standards.
              </p>
            </div>

            <div className="px-8 py-10 space-y-14">
              {/* ─── 2. Health Score Overview ─── */}
              <motion.section variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }}>
                <div className="flex flex-col lg:flex-row gap-8 items-center">
                  {/* Score Ring */}
                  <div className="flex-shrink-0 text-center">
                    <HealthScoreRing score={healthScore} />
                    <h2 className="text-lg font-bold text-neutral-900 dark:text-neutral-100 mt-4">
                      Your Health Score
                    </h2>
                    <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-1 max-w-xs mx-auto">
                      Based on pantry composition, dietary diversity, and nutritional balance
                    </p>
                  </div>

                  {/* Stat Cards */}
                  <motion.div
                    className="grid grid-cols-2 gap-4 flex-1 w-full"
                    variants={staggerContainer}
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true }}
                  >
                    {[
                      { value: '2,847 kcal', label: 'Average Daily Intake', icon: Flame, accent: 'text-orange-500' },
                      { value: '12', label: 'Unique Food Groups', icon: Layers, accent: 'text-blue-500' },
                      { value: '3', label: 'Nutritional Gaps', icon: AlertTriangle, accent: 'text-amber-500' },
                      { value: '85%', label: 'Eatwell Alignment', icon: Target, accent: 'text-green-500' },
                    ].map((stat) => (
                      <motion.div
                        key={stat.label}
                        variants={scaleIn}
                        className="rounded-xl border border-neutral-200 dark:border-neutral-700 p-5 bg-neutral-50/50 dark:bg-neutral-700/30"
                      >
                        <stat.icon className={`h-5 w-5 ${stat.accent} mb-2`} />
                        <p className="text-2xl font-bold text-neutral-900 dark:text-neutral-100">{stat.value}</p>
                        <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-0.5">{stat.label}</p>
                      </motion.div>
                    ))}
                  </motion.div>
                </div>
              </motion.section>

              {/* ─── 3. Macronutrient Breakdown ─── */}
              <motion.section variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }}>
                <h2 className="text-2xl font-bold text-neutral-900 dark:text-neutral-100 mb-6">
                  Daily Macronutrient Distribution
                </h2>
                <div className="grid lg:grid-cols-2 gap-8">
                  {/* Pie Chart */}
                  <div className="flex flex-col items-center">
                    <div className="w-full h-72">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={macroData}
                            cx="50%"
                            cy="50%"
                            innerRadius={60}
                            outerRadius={100}
                            paddingAngle={3}
                            dataKey="value"
                            animationBegin={200}
                            animationDuration={800}
                          >
                            {macroData.map((_, i) => (
                              <Cell key={i} fill={PIE_COLORS[i]} />
                            ))}
                          </Pie>
                          <Tooltip
                            formatter={(value: number, name: string) => [`${value}%`, name]}
                            contentStyle={{
                              backgroundColor: 'var(--tooltip-bg, #fff)',
                              border: '1px solid #e5e7eb',
                              borderRadius: '0.5rem',
                            }}
                          />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                    {/* Legend */}
                    <div className="flex flex-wrap justify-center gap-4 mt-2">
                      {macroData.map((m) => (
                        <div key={m.name} className="flex items-center space-x-2">
                          <span className="w-3 h-3 rounded-full" style={{ backgroundColor: m.color }} />
                          <span className="text-sm text-neutral-600 dark:text-neutral-400">
                            {m.name} ({m.value}%)
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Comparison Table */}
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b border-neutral-200 dark:border-neutral-700">
                          <th className="text-left py-3 pr-4 font-semibold text-neutral-900 dark:text-neutral-100">
                            Nutrient
                          </th>
                          <th className="text-right py-3 px-4 font-semibold text-neutral-900 dark:text-neutral-100">
                            Current
                          </th>
                          <th className="text-right py-3 px-4 font-semibold text-neutral-900 dark:text-neutral-100">
                            NHS Target
                          </th>
                          <th className="text-right py-3 pl-4 font-semibold text-neutral-900 dark:text-neutral-100">
                            Status
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {nutrientComparison.map((row) => (
                          <tr
                            key={row.nutrient}
                            className="border-b border-neutral-100 dark:border-neutral-700/50 last:border-0"
                          >
                            <td className="py-3 pr-4 text-neutral-800 dark:text-neutral-200 font-medium">
                              {row.nutrient}
                            </td>
                            <td className="py-3 px-4 text-right text-neutral-700 dark:text-neutral-300">
                              {row.current}
                              {row.unit}
                            </td>
                            <td className="py-3 px-4 text-right text-neutral-500 dark:text-neutral-400">
                              {row.recommended}
                              {row.unit}
                            </td>
                            <td className="py-3 pl-4 text-right">{statusBadge(row.status)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </motion.section>

              {/* ─── 4. Micronutrient Radar Chart ─── */}
              <motion.section variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }}>
                <h2 className="text-2xl font-bold text-neutral-900 dark:text-neutral-100 mb-6">
                  Micronutrient Coverage
                </h2>
                <div className="flex flex-col items-center">
                  <div className="w-full h-80 max-w-lg mx-auto">
                    <ResponsiveContainer width="100%" height="100%">
                      <RadarChart data={micronutrientData} cx="50%" cy="50%" outerRadius="75%">
                        <PolarGrid stroke="#d4d4d4" />
                        <PolarAngleAxis
                          dataKey="nutrient"
                          tick={{ fill: '#737373', fontSize: 12 }}
                        />
                        <PolarRadiusAxis
                          angle={90}
                          domain={[0, 100]}
                          tick={{ fill: '#a3a3a3', fontSize: 10 }}
                        />
                        <Radar
                          name="Coverage"
                          dataKey="coverage"
                          stroke="#22c55e"
                          fill="#22c55e"
                          fillOpacity={0.25}
                          strokeWidth={2}
                          animationDuration={1000}
                        />
                        <Tooltip
                          formatter={(value: number) => [`${value}%`, 'Coverage']}
                          contentStyle={{
                            backgroundColor: 'var(--tooltip-bg, #fff)',
                            border: '1px solid #e5e7eb',
                            borderRadius: '0.5rem',
                          }}
                        />
                      </RadarChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="mt-4 rounded-xl bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 p-4 max-w-2xl w-full">
                    <div className="flex items-start space-x-3">
                      <AlertTriangle className="h-5 w-5 text-amber-500 mt-0.5 flex-shrink-0" />
                      <p className="text-sm text-neutral-700 dark:text-neutral-300">
                        <span className="font-semibold">Vitamin D (45%)</span> and{' '}
                        <span className="font-semibold">Potassium (58%)</span> are below recommended levels. Consider
                        adding oily fish, eggs, bananas, and sweet potatoes to your pantry.
                      </p>
                    </div>
                  </div>
                </div>
              </motion.section>

              {/* ─── 5. Pantry Nutritional Analysis ─── */}
              <motion.section variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }}>
                <h2 className="text-2xl font-bold text-neutral-900 dark:text-neutral-100 mb-6">
                  Pantry Health Breakdown
                </h2>
                <div className="w-full h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={pantryNutritionData}
                      margin={{ top: 5, right: 20, left: 0, bottom: 5 }}
                      layout="vertical"
                    >
                      <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#e5e7eb" />
                      <XAxis type="number" domain={[0, 100]} tick={{ fill: '#737373', fontSize: 12 }} />
                      <YAxis
                        dataKey="category"
                        type="category"
                        width={90}
                        tick={{ fill: '#737373', fontSize: 12 }}
                      />
                      <Tooltip content={<BarTooltip />} />
                      <Bar dataKey="score" radius={[0, 6, 6, 0]} animationDuration={800}>
                        {pantryNutritionData.map((entry, i) => (
                          <Cell key={i} fill={getBarColor(entry.score)} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
                {/* Bar chart legend */}
                <div className="flex flex-wrap gap-4 mt-4 justify-center">
                  {[
                    { color: '#22c55e', label: 'Excellent (70+)' },
                    { color: '#f59e0b', label: 'Moderate (50-69)' },
                    { color: '#ef4444', label: 'Low (<50)' },
                  ].map((l) => (
                    <div key={l.label} className="flex items-center space-x-2">
                      <span className="w-3 h-3 rounded-full" style={{ backgroundColor: l.color }} />
                      <span className="text-sm text-neutral-500 dark:text-neutral-400">{l.label}</span>
                    </div>
                  ))}
                </div>
              </motion.section>

              {/* ─── 6. NHS Eatwell Guide Alignment ─── */}
              <motion.section variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }}>
                <h2 className="text-2xl font-bold text-neutral-900 dark:text-neutral-100 mb-6">
                  NHS Eatwell Guide Alignment
                </h2>
                <div className="space-y-5">
                  {eatwellData.map((item) => {
                    const isOver = item.group === 'Oils & Spreads'
                    const barColor = item.met
                      ? 'bg-green-500'
                      : isOver
                        ? 'bg-amber-500'
                        : 'bg-amber-500'
                    const statusIcon = item.met ? (
                      <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0" />
                    ) : (
                      <AlertTriangle className="h-5 w-5 text-amber-500 flex-shrink-0" />
                    )
                    const maxWidth = Math.max(item.current, item.target) + 10

                    return (
                      <div key={item.group}>
                        <div className="flex items-center justify-between mb-1.5">
                          <div className="flex items-center space-x-2">
                            {statusIcon}
                            <span className="text-sm font-medium text-neutral-800 dark:text-neutral-200">
                              {item.group}
                            </span>
                          </div>
                          <span className="text-sm text-neutral-500 dark:text-neutral-400">
                            {item.current}% / target {isOver ? '<' : ''}{item.target}%
                          </span>
                        </div>
                        <div className="relative h-4 bg-neutral-200 dark:bg-neutral-700 rounded-full overflow-hidden">
                          <motion.div
                            className={`absolute inset-y-0 left-0 rounded-full ${barColor}`}
                            initial={{ width: 0 }}
                            whileInView={{ width: `${(item.current / maxWidth) * 100}%` }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.8, ease: 'easeOut' }}
                          />
                          {/* Target marker */}
                          <div
                            className="absolute top-0 bottom-0 w-0.5 bg-neutral-900 dark:bg-neutral-100"
                            style={{ left: `${(item.target / maxWidth) * 100}%` }}
                            title={`Target: ${item.target}%`}
                          />
                        </div>
                      </div>
                    )
                  })}
                  <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-2">
                    Black markers indicate NHS recommended targets.
                  </p>
                </div>
              </motion.section>

              {/* ─── 7. AI-Generated Recommendations ─── */}
              <motion.section
                variants={staggerContainer}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
              >
                <h2 className="text-2xl font-bold text-neutral-900 dark:text-neutral-100 mb-6">
                  Personalised Recommendations
                </h2>
                <div className="grid gap-4 sm:grid-cols-2">
                  {recommendations.map((rec) => (
                    <motion.div
                      key={rec.title}
                      variants={scaleIn}
                      className={`rounded-xl border p-5 ${rec.bgColor} ${rec.borderColor}`}
                    >
                      <div className="flex items-start space-x-3">
                        <rec.icon className={`h-6 w-6 ${rec.iconColor} mt-0.5 flex-shrink-0`} />
                        <div>
                          <h3 className="font-semibold text-neutral-900 dark:text-neutral-100 mb-1">{rec.title}</h3>
                          <p className="text-sm text-neutral-700 dark:text-neutral-300 leading-relaxed">{rec.body}</p>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </motion.section>

              {/* ─── 8. Healthcare Relevance Callout ─── */}
              <motion.section variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }}>
                <div className="rounded-xl bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 p-6">
                  <div className="flex items-start space-x-4">
                    <div className="w-10 h-10 bg-blue-100 dark:bg-blue-800/50 rounded-lg flex items-center justify-center flex-shrink-0">
                      <Activity className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100 mb-2">
                        Healthcare Application
                      </h3>
                      <p className="text-sm text-neutral-700 dark:text-neutral-300 leading-relaxed">
                        This nutritional analysis engine demonstrates core healthcare AI competencies: real-time health
                        metric tracking, guideline-based risk flagging (NHS Eatwell Guide), personalised intervention
                        recommendations, and longitudinal trend analysis. The same architecture powers patient dietary
                        monitoring in clinical nutrition, chronic disease management (diabetes, cardiovascular), and
                        public health surveillance systems.
                      </p>
                    </div>
                  </div>
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
                  <Link
                    to="/support"
                    className="text-sm text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 transition-colors"
                  >
                    Support
                  </Link>
                  <Link
                    to="/privacy"
                    className="text-sm text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 transition-colors"
                  >
                    Privacy Policy
                  </Link>
                  <Link
                    to="/"
                    className="text-sm text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 transition-colors"
                  >
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
