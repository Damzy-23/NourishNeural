import { Helmet } from 'react-helmet-async'
import { Link } from 'react-router-dom'
import { ArrowLeft, Brain, TreePine, BarChart3, Target, ShieldCheck, Eye, Lock, RefreshCw, AlertTriangle, ChevronDown, Layers, Cpu, Network } from 'lucide-react'
import { motion } from 'framer-motion'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis
} from 'recharts'

// --- Static Data ---

const featureImportanceData = [
  { feature: 'Storage Temperature', importance: 0.18 },
  { feature: 'Days Since Purchase', importance: 0.15 },
  { feature: 'Category (Perishability)', importance: 0.14 },
  { feature: 'Package Integrity', importance: 0.11 },
  { feature: 'Humidity Level', importance: 0.09 },
  { feature: 'Historical Waste Rate', importance: 0.08 },
  { feature: 'Seasonal Factor', importance: 0.07 },
  { feature: 'Household Size', importance: 0.06 },
  { feature: 'Price Point', importance: 0.04 },
  { feature: 'Consumption Pattern', importance: 0.04 },
  { feature: 'Storage Method', importance: 0.03 },
  { feature: 'Brand Quality', importance: 0.01 },
]

const modelPerformanceData = [
  { label: 'Accuracy', value: 94.2, description: 'Overall correct predictions across all classes' },
  { label: 'Precision', value: 91.8, description: 'Of items flagged as waste, how many truly were' },
  { label: 'Recall', value: 93.5, description: 'Of all actual waste events, how many we caught' },
  { label: 'F1 Score', value: 92.6, description: 'Harmonic mean balancing precision and recall' },
]

const radarData = [
  { metric: 'Accuracy', A: 94.2, fullMark: 100 },
  { metric: 'Precision', A: 91.8, fullMark: 100 },
  { metric: 'Recall', A: 93.5, fullMark: 100 },
  { metric: 'F1', A: 92.6, fullMark: 100 },
  { metric: 'AUC-ROC', A: 96.1, fullMark: 100 },
  { metric: 'Specificity', A: 90.3, fullMark: 100 },
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

// --- Metric Ring Component ---

function MetricRing({ value, size = 100, strokeWidth = 8, color = '#16a34a' }: { value: number; size?: number; strokeWidth?: number; color?: string }) {
  const radius = (size - strokeWidth) / 2
  const circumference = 2 * Math.PI * radius
  const progress = (value / 100) * circumference
  const offset = circumference - progress

  return (
    <svg width={size} height={size} className="transform -rotate-90">
      <circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        fill="none"
        stroke="currentColor"
        strokeWidth={strokeWidth}
        className="text-neutral-200 dark:text-neutral-700"
      />
      <circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        fill="none"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeDasharray={circumference}
        strokeDashoffset={offset}
        className="transition-all duration-1000 ease-out"
      />
    </svg>
  )
}

// --- Custom Tooltip for Feature Importance ---

function FeatureTooltip({ active, payload }: any) {
  if (!active || !payload?.length) return null
  const data = payload[0].payload
  return (
    <div className="bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-lg shadow-xl px-4 py-3">
      <p className="font-semibold text-neutral-900 dark:text-neutral-100 text-sm">{data.feature}</p>
      <p className="text-primary-600 dark:text-primary-400 text-sm mt-1">
        Importance: <span className="font-bold">{(data.importance * 100).toFixed(0)}%</span>
      </p>
    </div>
  )
}

// --- Main Component ---

export default function AIExplainability() {
  return (
    <>
      <Helmet>
        <title>AI Explainability Centre - Nourish Neural</title>
        <meta name="description" content="Understand how our machine learning models make transparent, interpretable predictions about food waste and expiry." />
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
            <div className="bg-gradient-to-r from-primary-600 to-primary-700 px-8 py-12 text-white">
              <div className="flex items-center space-x-4 mb-4">
                <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                  <Brain className="h-7 w-7" />
                </div>
                <div>
                  <h1 className="text-3xl font-bold">AI Explainability Centre</h1>
                  <p className="text-primary-100 mt-1">Transparent, interpretable, and trustworthy AI</p>
                </div>
              </div>
              <p className="text-primary-100 text-lg max-w-3xl">
                Understand how our machine learning models make predictions about food waste, expiry,
                and nutritional recommendations.
              </p>
            </div>

            {/* Page Body */}
            <div className="px-8 py-12 space-y-20">

              {/* ============================================ */}
              {/* 2. Model Architecture Overview               */}
              {/* ============================================ */}
              <motion.section
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, margin: '-60px' }}
                custom={0}
                variants={fadeUp}
              >
                <h2 className="text-2xl font-bold text-neutral-900 dark:text-neutral-100 mb-2 flex items-center">
                  <Layers className="h-6 w-6 text-primary-600 dark:text-primary-400 mr-3 flex-shrink-0" />
                  Model Architecture Overview
                </h2>
                <p className="text-neutral-600 dark:text-neutral-400 mb-8">
                  Our ensemble combines three diverse learners, each contributing a weighted vote to the final prediction.
                  Diversity in model families reduces correlated errors and improves generalisation.
                </p>

                {/* Ensemble Diagram */}
                <div className="space-y-6">
                  {/* Input models */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {/* Random Forest */}
                    <div className="relative rounded-xl border-2 border-green-200 dark:border-green-800 bg-green-50 dark:bg-green-900/20 p-5">
                      <div className="flex items-center space-x-3 mb-3">
                        <div className="w-10 h-10 rounded-lg bg-green-600 flex items-center justify-center">
                          <TreePine className="h-5 w-5 text-white" />
                        </div>
                        <div>
                          <h3 className="font-bold text-neutral-900 dark:text-neutral-100">Random Forest</h3>
                          <span className="text-xs font-semibold text-green-700 dark:text-green-400 bg-green-100 dark:bg-green-900/40 px-2 py-0.5 rounded-full">
                            Weight: 40%
                          </span>
                        </div>
                      </div>
                      <p className="text-sm text-neutral-600 dark:text-neutral-400 leading-relaxed">
                        Bagged ensemble of 200 decision trees. Handles non-linear feature interactions and is inherently
                        resistant to overfitting through bootstrap aggregation.
                      </p>
                    </div>

                    {/* Gradient Boosting */}
                    <div className="relative rounded-xl border-2 border-amber-200 dark:border-amber-800 bg-amber-50 dark:bg-amber-900/20 p-5">
                      <div className="flex items-center space-x-3 mb-3">
                        <div className="w-10 h-10 rounded-lg bg-amber-600 flex items-center justify-center">
                          <BarChart3 className="h-5 w-5 text-white" />
                        </div>
                        <div>
                          <h3 className="font-bold text-neutral-900 dark:text-neutral-100">Gradient Boosting</h3>
                          <span className="text-xs font-semibold text-amber-700 dark:text-amber-400 bg-amber-100 dark:bg-amber-900/40 px-2 py-0.5 rounded-full">
                            Weight: 30%
                          </span>
                        </div>
                      </div>
                      <p className="text-sm text-neutral-600 dark:text-neutral-400 leading-relaxed">
                        Sequential boosting with learning rate 0.05. Excels at capturing subtle residual patterns
                        the forest misses, using early stopping to prevent overfitting.
                      </p>
                    </div>

                    {/* Neural Network */}
                    <div className="relative rounded-xl border-2 border-purple-200 dark:border-purple-800 bg-purple-50 dark:bg-purple-900/20 p-5">
                      <div className="flex items-center space-x-3 mb-3">
                        <div className="w-10 h-10 rounded-lg bg-purple-600 flex items-center justify-center">
                          <Network className="h-5 w-5 text-white" />
                        </div>
                        <div>
                          <h3 className="font-bold text-neutral-900 dark:text-neutral-100">Neural Network</h3>
                          <span className="text-xs font-semibold text-purple-700 dark:text-purple-400 bg-purple-100 dark:bg-purple-900/40 px-2 py-0.5 rounded-full">
                            Weight: 30%
                          </span>
                        </div>
                      </div>
                      <p className="text-sm text-neutral-600 dark:text-neutral-400 leading-relaxed">
                        3-layer MLP (128-64-32) with dropout regularisation. Learns complex embeddings from
                        categorical features and temporal patterns via TensorFlow/Keras.
                      </p>
                    </div>
                  </div>

                  {/* Arrow indicators */}
                  <div className="flex justify-center">
                    <div className="flex items-center space-x-2 text-neutral-400 dark:text-neutral-500">
                      <div className="h-px w-16 bg-neutral-300 dark:bg-neutral-600" />
                      <ChevronDown className="h-6 w-6 animate-bounce" />
                      <div className="h-px w-16 bg-neutral-300 dark:bg-neutral-600" />
                    </div>
                  </div>

                  {/* Ensemble output */}
                  <div className="max-w-lg mx-auto">
                    <div className="rounded-xl border-2 border-primary-300 dark:border-primary-700 bg-primary-50 dark:bg-primary-900/20 p-6 text-center">
                      <div className="flex items-center justify-center space-x-3 mb-2">
                        <div className="w-10 h-10 rounded-lg bg-primary-600 flex items-center justify-center">
                          <Cpu className="h-5 w-5 text-white" />
                        </div>
                        <h3 className="font-bold text-lg text-neutral-900 dark:text-neutral-100">Ensemble Prediction</h3>
                      </div>
                      <p className="text-sm text-neutral-600 dark:text-neutral-400">
                        Weighted soft-voting aggregation. Final probability = 0.4 * RF + 0.3 * GB + 0.3 * NN.
                        Calibrated via Platt scaling to ensure probabilities are well-calibrated.
                      </p>
                    </div>
                  </div>
                </div>
              </motion.section>

              {/* ============================================ */}
              {/* 3. Feature Importance                        */}
              {/* ============================================ */}
              <motion.section
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, margin: '-60px' }}
                custom={1}
                variants={fadeUp}
              >
                <h2 className="text-2xl font-bold text-neutral-900 dark:text-neutral-100 mb-2 flex items-center">
                  <BarChart3 className="h-6 w-6 text-primary-600 dark:text-primary-400 mr-3 flex-shrink-0" />
                  What Drives Our Predictions?
                </h2>
                <p className="text-neutral-600 dark:text-neutral-400 mb-8">
                  Permutation importance scores for the top 12 features in our waste-prediction model.
                </p>

                <div className="bg-neutral-50 dark:bg-neutral-900/50 rounded-xl p-4 sm:p-6">
                  <ResponsiveContainer width="100%" height={420}>
                    <BarChart
                      data={[...featureImportanceData].reverse()}
                      layout="vertical"
                      margin={{ top: 4, right: 30, left: 10, bottom: 4 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#e5e7eb" />
                      <XAxis
                        type="number"
                        domain={[0, 0.2]}
                        tickFormatter={(v: number) => `${(v * 100).toFixed(0)}%`}
                        tick={{ fill: '#6b7280', fontSize: 12 }}
                      />
                      <YAxis
                        type="category"
                        dataKey="feature"
                        width={160}
                        tick={{ fill: '#6b7280', fontSize: 12 }}
                      />
                      <Tooltip content={<FeatureTooltip />} />
                      <defs>
                        <linearGradient id="barGradient" x1="0" y1="0" x2="1" y2="0">
                          <stop offset="0%" stopColor="#4f46e5" />
                          <stop offset="100%" stopColor="#818cf8" />
                        </linearGradient>
                      </defs>
                      <Bar
                        dataKey="importance"
                        fill="url(#barGradient)"
                        radius={[0, 6, 6, 0]}
                        barSize={20}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </div>

                <p className="mt-6 text-sm text-neutral-500 dark:text-neutral-400 leading-relaxed">
                  Feature importance is calculated using permutation importance — measuring how much each feature's
                  removal degrades prediction accuracy. This approach is model-agnostic and avoids the bias
                  inherent in impurity-based importance for high-cardinality features.
                </p>
              </motion.section>

              {/* ============================================ */}
              {/* 4. Model Performance Metrics                 */}
              {/* ============================================ */}
              <motion.section
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, margin: '-60px' }}
                custom={2}
                variants={fadeUp}
              >
                <h2 className="text-2xl font-bold text-neutral-900 dark:text-neutral-100 mb-2 flex items-center">
                  <Target className="h-6 w-6 text-primary-600 dark:text-primary-400 mr-3 flex-shrink-0" />
                  Model Performance Metrics
                </h2>
                <p className="text-neutral-600 dark:text-neutral-400 mb-8">
                  Evaluated on a held-out test set using stratified 80/20 split.
                </p>

                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
                  {modelPerformanceData.map((metric, idx) => {
                    const colors = ['#16a34a', '#2563eb', '#d97706', '#7c3aed']
                    return (
                      <motion.div
                        key={metric.label}
                        initial={{ opacity: 0, scale: 0.9 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        viewport={{ once: true }}
                        transition={{ delay: idx * 0.1, duration: 0.4 }}
                        className="bg-neutral-50 dark:bg-neutral-900/50 rounded-xl p-5 flex flex-col items-center text-center"
                      >
                        <div className="relative mb-3">
                          <MetricRing value={metric.value} size={88} strokeWidth={7} color={colors[idx]} />
                          <span className="absolute inset-0 flex items-center justify-center text-lg font-bold text-neutral-900 dark:text-neutral-100">
                            {metric.value}%
                          </span>
                        </div>
                        <h3 className="font-semibold text-neutral-900 dark:text-neutral-100 text-sm">{metric.label}</h3>
                        <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1 leading-relaxed">{metric.description}</p>
                      </motion.div>
                    )
                  })}
                </div>

                {/* Radar chart */}
                <div className="mt-8 bg-neutral-50 dark:bg-neutral-900/50 rounded-xl p-4 sm:p-6">
                  <h3 className="text-sm font-semibold text-neutral-700 dark:text-neutral-300 mb-4 text-center">
                    Multi-Metric Radar Overview
                  </h3>
                  <ResponsiveContainer width="100%" height={280}>
                    <RadarChart data={radarData} cx="50%" cy="50%" outerRadius="75%">
                      <PolarGrid stroke="#d1d5db" />
                      <PolarAngleAxis dataKey="metric" tick={{ fill: '#6b7280', fontSize: 12 }} />
                      <PolarRadiusAxis angle={30} domain={[80, 100]} tick={{ fill: '#9ca3af', fontSize: 10 }} />
                      <Radar
                        name="Performance"
                        dataKey="A"
                        stroke="#4f46e5"
                        fill="#4f46e5"
                        fillOpacity={0.2}
                        strokeWidth={2}
                      />
                    </RadarChart>
                  </ResponsiveContainer>
                </div>

                <p className="mt-4 text-xs text-neutral-500 dark:text-neutral-400 italic">
                  Metrics computed on held-out test set (20% stratified split). Model retrained monthly on
                  aggregated, anonymised usage data.
                </p>
              </motion.section>

              {/* ============================================ */}
              {/* 5. Prediction Confidence Transparency        */}
              {/* ============================================ */}
              <motion.section
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, margin: '-60px' }}
                custom={3}
                variants={fadeUp}
              >
                <h2 className="text-2xl font-bold text-neutral-900 dark:text-neutral-100 mb-2 flex items-center">
                  <AlertTriangle className="h-6 w-6 text-primary-600 dark:text-primary-400 mr-3 flex-shrink-0" />
                  Confidence &amp; Uncertainty
                </h2>
                <p className="text-neutral-600 dark:text-neutral-400 mb-8">
                  Every prediction surfaces its uncertainty so users — and downstream systems — can make informed decisions.
                </p>

                {/* Demo prediction card */}
                <div className="rounded-xl border border-neutral-200 dark:border-neutral-700 overflow-hidden">
                  {/* Card header */}
                  <div className="bg-neutral-100 dark:bg-neutral-700/50 px-6 py-3 flex items-center justify-between">
                    <span className="text-sm font-semibold text-neutral-700 dark:text-neutral-300">Live Prediction Demo</span>
                    <span className="text-xs text-neutral-500 dark:text-neutral-400">sample output</span>
                  </div>

                  <div className="p-6 space-y-6">
                    {/* Item metadata */}
                    <div className="flex flex-wrap gap-4 items-start">
                      <div>
                        <h3 className="text-lg font-bold text-neutral-900 dark:text-neutral-100">Semi-skimmed Milk</h3>
                        <div className="flex flex-wrap gap-2 mt-2">
                          <span className="text-xs bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 px-2.5 py-1 rounded-full font-medium">Dairy</span>
                          <span className="text-xs bg-cyan-100 dark:bg-cyan-900/40 text-cyan-700 dark:text-cyan-300 px-2.5 py-1 rounded-full font-medium">Fridge</span>
                          <span className="text-xs bg-neutral-200 dark:bg-neutral-700 text-neutral-700 dark:text-neutral-300 px-2.5 py-1 rounded-full font-medium">5 days since purchase</span>
                        </div>
                      </div>
                      <div className="ml-auto">
                        <span className="inline-flex items-center px-3 py-1.5 rounded-lg text-sm font-bold bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 border border-red-200 dark:border-red-800">
                          High Risk
                        </span>
                      </div>
                    </div>

                    {/* Waste probability bar */}
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium text-neutral-700 dark:text-neutral-300">Waste Probability</span>
                        <span className="text-sm font-bold text-neutral-900 dark:text-neutral-100">73% <span className="font-normal text-neutral-500 dark:text-neutral-400">(+/-8%)</span></span>
                      </div>
                      <div className="w-full h-3 bg-neutral-200 dark:bg-neutral-700 rounded-full overflow-hidden">
                        <div
                          className="h-full rounded-full"
                          style={{
                            width: '73%',
                            background: 'linear-gradient(90deg, #22c55e 0%, #eab308 40%, #ef4444 100%)',
                          }}
                        />
                      </div>
                      <div className="flex justify-between text-xs text-neutral-400 dark:text-neutral-500 mt-1">
                        <span>0% Safe</span>
                        <span>100% Waste</span>
                      </div>
                    </div>

                    {/* Per-model breakdown */}
                    <div className="grid grid-cols-3 gap-3">
                      {[
                        { model: 'Random Forest', pct: 78, color: 'bg-green-500' },
                        { model: 'Gradient Boosting', pct: 71, color: 'bg-amber-500' },
                        { model: 'Neural Network', pct: 69, color: 'bg-purple-500' },
                      ].map((m) => (
                        <div key={m.model} className="bg-neutral-50 dark:bg-neutral-900/50 rounded-lg p-3 text-center">
                          <p className="text-xs text-neutral-500 dark:text-neutral-400 mb-1">{m.model}</p>
                          <p className="text-xl font-bold text-neutral-900 dark:text-neutral-100">{m.pct}%</p>
                          <div className="w-full h-1.5 bg-neutral-200 dark:bg-neutral-700 rounded-full mt-2 overflow-hidden">
                            <div className={`h-full rounded-full ${m.color}`} style={{ width: `${m.pct}%` }} />
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Confidence interval note */}
                    <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg px-4 py-3">
                      <p className="text-sm text-amber-800 dark:text-amber-300 leading-relaxed">
                        <span className="font-semibold">Confidence interval: +/-8%.</span>{' '}
                        Model agreement is moderate (spread of 9 percentage points). The ensemble flags this as a
                        reliable prediction but recommends a manual check within 24 hours.
                      </p>
                    </div>
                  </div>
                </div>

                <p className="mt-6 text-sm text-neutral-600 dark:text-neutral-400 leading-relaxed">
                  Every prediction includes confidence scores from each model in our ensemble. When models disagree
                  significantly, we flag lower confidence and recommend manual review — a critical pattern in healthcare
                  AI where over-reliance on single-model outputs can lead to harm.
                </p>
              </motion.section>

              {/* ============================================ */}
              {/* 6. Responsible AI Principles                 */}
              {/* ============================================ */}
              <motion.section
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, margin: '-60px' }}
                custom={4}
                variants={fadeUp}
              >
                <h2 className="text-2xl font-bold text-neutral-900 dark:text-neutral-100 mb-2 flex items-center">
                  <ShieldCheck className="h-6 w-6 text-primary-600 dark:text-primary-400 mr-3 flex-shrink-0" />
                  Responsible AI Principles
                </h2>
                <p className="text-neutral-600 dark:text-neutral-400 mb-8">
                  Our commitment to ethical, accountable machine learning.
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                  {[
                    {
                      icon: <ShieldCheck className="h-6 w-6 text-white" />,
                      bg: 'bg-emerald-600',
                      border: 'border-emerald-200 dark:border-emerald-800',
                      title: 'Bias Monitoring',
                      body: 'We continuously monitor for demographic and geographic bias in predictions, ensuring fair outcomes across all household types.',
                    },
                    {
                      icon: <Eye className="h-6 w-6 text-white" />,
                      bg: 'bg-blue-600',
                      border: 'border-blue-200 dark:border-blue-800',
                      title: 'Transparency',
                      body: 'Every prediction is explainable. Users can always see WHY a prediction was made and WHICH features drove the decision.',
                    },
                    {
                      icon: <Lock className="h-6 w-6 text-white" />,
                      bg: 'bg-violet-600',
                      border: 'border-violet-200 dark:border-violet-800',
                      title: 'Data Privacy',
                      body: 'Models are trained on aggregated, anonymised data. Individual user data never leaves the secure processing pipeline.',
                    },
                    {
                      icon: <RefreshCw className="h-6 w-6 text-white" />,
                      bg: 'bg-orange-600',
                      border: 'border-orange-200 dark:border-orange-800',
                      title: 'Continuous Validation',
                      body: 'Model performance is tracked against ground truth. Predictions that don\'t match reality trigger automated retraining pipelines.',
                    },
                  ].map((card, idx) => (
                    <motion.div
                      key={card.title}
                      initial={{ opacity: 0, y: 16 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: idx * 0.08, duration: 0.4 }}
                      className={`rounded-xl border ${card.border} bg-white dark:bg-neutral-800/60 p-6`}
                    >
                      <div className="flex items-center space-x-3 mb-3">
                        <div className={`w-10 h-10 rounded-lg ${card.bg} flex items-center justify-center`}>
                          {card.icon}
                        </div>
                        <h3 className="font-bold text-neutral-900 dark:text-neutral-100">{card.title}</h3>
                      </div>
                      <p className="text-sm text-neutral-600 dark:text-neutral-400 leading-relaxed">{card.body}</p>
                    </motion.div>
                  ))}
                </div>
              </motion.section>

              {/* ============================================ */}
              {/* 7. Healthcare AI Relevance Callout           */}
              {/* ============================================ */}
              <motion.section
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, margin: '-60px' }}
                custom={5}
                variants={fadeUp}
              >
                <div className="bg-blue-50 dark:bg-blue-900/20 border-l-4 border-blue-500 dark:border-blue-400 rounded-r-xl px-6 py-6 sm:px-8 sm:py-8">
                  <h3 className="text-lg font-bold text-blue-900 dark:text-blue-100 mb-3 flex items-center">
                    <Brain className="h-5 w-5 mr-2 text-blue-600 dark:text-blue-400 flex-shrink-0" />
                    Relevance to Healthcare AI
                  </h3>
                  <p className="text-blue-800 dark:text-blue-200 leading-relaxed">
                    The explainability patterns demonstrated here — ensemble confidence scoring, feature attribution,
                    bias monitoring, and prediction transparency — directly transfer to healthcare applications.
                    Whether predicting patient risk scores, drug interactions, or treatment outcomes, the same
                    principles of interpretable, accountable AI apply. Our architecture is designed with NHS Digital
                    Service Standards and GDPR Article 22 (automated decision-making transparency) in mind.
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
