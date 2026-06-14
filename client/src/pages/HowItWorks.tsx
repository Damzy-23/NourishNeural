import { Helmet } from 'react-helmet-async'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  ArrowLeft,
  Layers,
  Database,
  Brain,
  Shield,
  Cpu,
  MessageSquare,
  Search,
  Apple,
  ChefHat,
  Leaf,
  BarChart3,
  Utensils,
  ArrowDown,
  Lock,
  FileCheck,
  ShieldCheck,
  HeartPulse,
  Zap,
  GitBranch,
  Eye,
  Lightbulb,
  MonitorSmartphone,
  Globe,
  Workflow,
} from 'lucide-react'

/* ─── Animation variants ─── */
const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: 'easeOut' } },
}

const fadeIn = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.6 } },
}

const stagger = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1, when: 'beforeChildren' },
  },
}

const scaleIn = {
  hidden: { opacity: 0, scale: 0.92 },
  visible: { opacity: 1, scale: 1, transition: { duration: 0.4, ease: 'easeOut' } },
}

/* ─── Data ─── */
const techStack = [
  {
    category: 'Frontend',
    border: 'border-primary-500',
    items: [
      'React 18 + TypeScript',
      'Vite (build tooling)',
      'Tailwind CSS (utility-first styling)',
      'Framer Motion (animations)',
      'Recharts (data visualisation)',
      'React Query (server state)',
      'React Hook Form (form management)',
    ],
  },
  {
    category: 'Backend',
    border: 'border-green-500',
    items: [
      'Node.js + Express',
      'RESTful API design',
      'JWT Authentication',
      'Rate Limiting (express-rate-limit)',
      'Helmet security headers',
    ],
  },
  {
    category: 'Database & Auth',
    border: 'border-blue-500',
    items: [
      'Supabase (PostgreSQL)',
      'Row-Level Security policies',
      'Supabase Auth (JWT tokens)',
      'Real-time subscriptions',
    ],
  },
  {
    category: 'AI / Machine Learning',
    border: 'border-purple-500',
    items: [
      'TensorFlow + scikit-learn',
      'Ensemble Models (RF + GB + NN)',
      'Python ML pipeline',
      'Custom NumpyEncoder',
    ],
  },
  {
    category: 'LLM & Agent',
    border: 'border-amber-500',
    items: [
      'Ollama (local LLM)',
      'Qwen 2.5 3B (custom fine-tuned)',
      'ReAct Agent Framework',
      '7 specialised tools',
    ],
  },
  {
    category: 'DevOps & Platform',
    border: 'border-rose-500',
    items: [
      'PWA (Workbox service worker)',
      'Capacitor (iOS + Android)',
      'Offline-first architecture',
      'Browser Notifications API',
    ],
  },
]

const pipelineSteps = [
  {
    num: 1,
    title: 'Data Collection',
    desc: 'Pantry items, purchase history, waste logs, storage conditions, and seasonal patterns are collected from user interactions.',
    icon: Database,
  },
  {
    num: 2,
    title: 'Feature Engineering',
    desc: '45 features extracted including user behaviour metrics, food characteristics, environmental factors, and temporal patterns (sine/cosine seasonal encoding).',
    icon: GitBranch,
  },
  {
    num: 3,
    title: 'Model Training',
    desc: 'Three models trained independently: Random Forest (tree-based, handles non-linear relationships), Gradient Boosting (sequential error correction), Neural Network (complex pattern recognition via TensorFlow).',
    icon: Cpu,
  },
  {
    num: 4,
    title: 'Ensemble Prediction',
    desc: 'Weighted combination: RF 40% + GB 30% + NN 30%. Disagreement between models flags uncertainty — critical for healthcare-grade reliability.',
    icon: Workflow,
  },
  {
    num: 5,
    title: 'Explainability Layer',
    desc: 'Feature importance, confidence intervals, and natural language explanations generated for every prediction. Supports GDPR Article 22 compliance.',
    icon: Eye,
  },
]

const reactLoop = [
  { label: 'User Query', icon: MessageSquare, color: 'bg-blue-500' },
  { label: 'Thought', icon: Lightbulb, color: 'bg-amber-500' },
  { label: 'Action', icon: Zap, color: 'bg-primary-500' },
  { label: 'Observation', icon: Eye, color: 'bg-green-500' },
  { label: 'Final Answer', icon: FileCheck, color: 'bg-purple-500' },
]

const agentTools = [
  { name: 'check_pantry', icon: Search },
  { name: 'get_expiring_items', icon: Apple },
  { name: 'check_waste_stats', icon: BarChart3 },
  { name: 'predict_waste', icon: Brain },
  { name: 'get_household_nutrition', icon: Utensils },
  { name: 'check_carbon_footprint', icon: Leaf },
  { name: 'suggest_recipes', icon: ChefHat },
]

const archLayers = [
  {
    label: 'Client Layer',
    detail: 'React SPA + PWA + Capacitor Mobile',
    bg: 'bg-blue-50 dark:bg-blue-950/40 border-blue-200 dark:border-blue-800',
    text: 'text-blue-700 dark:text-blue-300',
    icon: MonitorSmartphone,
  },
  {
    label: 'API Layer',
    detail: 'Express REST API + JWT Auth + Rate Limiting',
    bg: 'bg-green-50 dark:bg-green-950/40 border-green-200 dark:border-green-800',
    text: 'text-green-700 dark:text-green-300',
    icon: Globe,
  },
  {
    label: 'AI Layer',
    detail: 'Ollama LLM + Python ML Pipeline + ReAct Agent',
    bg: 'bg-purple-50 dark:bg-purple-950/40 border-purple-200 dark:border-purple-800',
    text: 'text-purple-700 dark:text-purple-300',
    icon: Brain,
  },
  {
    label: 'Data Layer',
    detail: 'Supabase PostgreSQL + Row-Level Security',
    bg: 'bg-amber-50 dark:bg-amber-950/40 border-amber-200 dark:border-amber-800',
    text: 'text-amber-700 dark:text-amber-300',
    icon: Database,
  },
]

const securityCards = [
  {
    title: 'Authentication',
    desc: 'Supabase JWT tokens, bcrypt password hashing, rate-limited auth endpoints (15 req/15min).',
    icon: Lock,
  },
  {
    title: 'Data Protection',
    desc: 'GDPR-compliant data handling, user data export, right to deletion, anonymised ML training data.',
    icon: ShieldCheck,
  },
  {
    title: 'API Security',
    desc: 'Helmet.js security headers, CORS whitelist, input validation (Joi), request body size limits.',
    icon: Shield,
  },
  {
    title: 'Healthcare Readiness',
    desc: 'Architecture patterns align with NHS Digital Service Standards, OWASP Top 10 mitigations, and ICO data protection guidelines.',
    icon: HeartPulse,
  },
]

const stats = [
  { value: '45', label: 'ML Features' },
  { value: '3', label: 'Ensemble Models' },
  { value: '7', label: 'AI Agent Tools' },
  { value: '97%', label: 'Model Accuracy' },
  { value: '<500ms', label: 'Avg Response Time' },
]

/* ─── Component ─── */
export default function HowItWorks() {
  return (
    <>
      <Helmet>
        <title>How It Works - Nourish Neural</title>
        <meta
          name="description"
          content="Technical architecture deep dive into Nourish Neural's AI systems, ML pipeline, and engineering decisions."
        />
      </Helmet>

      <div className="min-h-screen bg-neutral-50 dark:bg-neutral-900">
        {/* ─── Header Bar ─── */}
        <header className="bg-white dark:bg-neutral-800 shadow-sm border-b border-neutral-200 dark:border-neutral-700">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <Link to="/" className="flex items-center space-x-3 hover:opacity-80 transition-opacity">
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center overflow-hidden">
                    <img src="/logo.png" alt="Nourish Neural" className="h-8 w-8" />
                  </div>
                  <span className="text-xl font-bold text-neutral-900 dark:text-neutral-100">
                    Nourish Neural
                  </span>
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

        {/* ─── Main ─── */}
        <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <motion.div
            className="bg-white dark:bg-neutral-800 rounded-2xl shadow-lg overflow-hidden"
            initial="hidden"
            animate="visible"
            variants={fadeIn}
          >
            {/* ─── 1. Gradient Header ─── */}
            <div className="bg-gradient-to-r from-primary-600 via-primary-500 to-accent-600 px-8 py-12 text-white">
              <motion.div variants={fadeUp} initial="hidden" animate="visible">
                <div className="flex items-center space-x-4 mb-4">
                  <div className="w-14 h-14 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center">
                    <Layers className="h-8 w-8" />
                  </div>
                  <div>
                    <h1 className="text-3xl sm:text-4xl font-bold">How It Works</h1>
                    <p className="text-white/80 text-sm font-medium tracking-wide uppercase mt-1">
                      Architecture & Technical Deep Dive
                    </p>
                  </div>
                </div>
                <p className="text-white/90 max-w-2xl text-lg leading-relaxed">
                  A look under the hood at the AI systems, data pipelines, and engineering decisions
                  that power Nourish Neural.
                </p>
              </motion.div>
            </div>

            <div className="px-8 py-10 space-y-16">
              {/* ─── 2. Tech Stack Grid ─── */}
              <motion.section
                variants={stagger}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, margin: '-60px' }}
              >
                <motion.h2
                  variants={fadeUp}
                  className="text-2xl font-bold text-neutral-900 dark:text-neutral-100 mb-2"
                >
                  Technology Stack
                </motion.h2>
                <motion.p variants={fadeUp} className="text-neutral-500 dark:text-neutral-400 mb-8">
                  The full-stack ecosystem behind every feature.
                </motion.p>

                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {techStack.map((group) => (
                    <motion.div
                      key={group.category}
                      variants={scaleIn}
                      className={`border-l-4 ${group.border} rounded-xl bg-neutral-50 dark:bg-neutral-900/60 p-5 hover:shadow-md transition-shadow`}
                    >
                      <span className="text-[11px] font-semibold uppercase tracking-widest text-neutral-400 dark:text-neutral-500">
                        {group.category}
                      </span>
                      <ul className="mt-3 space-y-1.5">
                        {group.items.map((item) => (
                          <li
                            key={item}
                            className="text-sm text-neutral-700 dark:text-neutral-300 flex items-start gap-2"
                          >
                            <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-neutral-300 dark:bg-neutral-600 shrink-0" />
                            {item}
                          </li>
                        ))}
                      </ul>
                    </motion.div>
                  ))}
                </div>
              </motion.section>

              {/* ─── 3. ML Pipeline Flow ─── */}
              <motion.section
                variants={stagger}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, margin: '-60px' }}
              >
                <motion.h2
                  variants={fadeUp}
                  className="text-2xl font-bold text-neutral-900 dark:text-neutral-100 mb-2"
                >
                  Machine Learning Pipeline
                </motion.h2>
                <motion.p variants={fadeUp} className="text-neutral-500 dark:text-neutral-400 mb-8">
                  From raw user interactions to actionable, explainable predictions.
                </motion.p>

                <div className="relative">
                  {/* Vertical connecting line */}
                  <div className="absolute left-6 top-8 bottom-8 w-px border-l-2 border-dashed border-neutral-300 dark:border-neutral-600 hidden sm:block" />

                  <div className="space-y-4">
                    {pipelineSteps.map((step, idx) => {
                      const Icon = step.icon
                      const isEven = idx % 2 === 0
                      return (
                        <motion.div
                          key={step.num}
                          variants={fadeUp}
                          className={`relative flex items-start gap-5 rounded-xl p-5 sm:pl-16 ${
                            isEven
                              ? 'bg-neutral-50 dark:bg-neutral-900/50'
                              : 'bg-white dark:bg-neutral-800'
                          }`}
                        >
                          {/* Number badge */}
                          <div className="absolute left-3 sm:left-3 top-5 z-10 w-7 h-7 rounded-full bg-primary-600 text-white text-xs font-bold flex items-center justify-center shadow-lg shadow-primary-600/30">
                            {step.num}
                          </div>

                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <Icon className="h-4 w-4 text-primary-500 shrink-0" />
                              <h3 className="font-semibold text-neutral-900 dark:text-neutral-100">
                                {step.title}
                              </h3>
                            </div>
                            <p className="text-sm text-neutral-600 dark:text-neutral-400 leading-relaxed">
                              {step.desc}
                            </p>
                          </div>
                        </motion.div>
                      )
                    })}
                  </div>
                </div>
              </motion.section>

              {/* ─── 4. ReAct Agent Architecture ─── */}
              <motion.section
                variants={stagger}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, margin: '-60px' }}
              >
                <motion.h2
                  variants={fadeUp}
                  className="text-2xl font-bold text-neutral-900 dark:text-neutral-100 mb-2"
                >
                  Conversational AI: ReAct Agent
                </motion.h2>
                <motion.p variants={fadeUp} className="text-neutral-500 dark:text-neutral-400 mb-8">
                  Our AI assistant (Nurexa) uses a Reasoning + Acting (ReAct) loop &mdash; the same
                  pattern used in clinical decision support systems.
                </motion.p>

                {/* Loop diagram */}
                <motion.div
                  variants={fadeUp}
                  className="rounded-xl border border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-900/50 p-6 mb-8"
                >
                  <p className="text-xs font-semibold uppercase tracking-widest text-neutral-400 dark:text-neutral-500 mb-5">
                    ReAct Loop
                  </p>

                  {/* Horizontal loop on large screens, vertical on small */}
                  <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-2">
                    {reactLoop.map((step, idx) => (
                      <div key={step.label} className="flex items-center gap-2 sm:gap-2">
                        <motion.div
                          variants={scaleIn}
                          className={`${step.color} text-white rounded-lg px-4 py-2.5 flex items-center gap-2 shadow-sm`}
                        >
                          <step.icon className="h-4 w-4" />
                          <span className="text-sm font-medium whitespace-nowrap">{step.label}</span>
                        </motion.div>

                        {idx < reactLoop.length - 1 && (
                          <>
                            {/* Arrow right on sm+, down on mobile */}
                            <span className="hidden sm:block text-neutral-400 dark:text-neutral-500 text-lg select-none">
                              &rarr;
                            </span>
                            <span className="block sm:hidden text-neutral-400 dark:text-neutral-500 text-lg select-none">
                              &darr;
                            </span>
                          </>
                        )}
                      </div>
                    ))}
                  </div>

                  {/* Loop-back label */}
                  <div className="mt-4 flex items-center justify-center">
                    <div className="flex items-center gap-2 text-xs text-neutral-400 dark:text-neutral-500">
                      <span className="h-px w-8 bg-neutral-300 dark:bg-neutral-600" />
                      <span className="italic">loops back to Thought until resolved</span>
                      <span className="h-px w-8 bg-neutral-300 dark:bg-neutral-600" />
                    </div>
                  </div>
                </motion.div>

                {/* Agent tools grid */}
                <motion.div variants={fadeUp}>
                  <p className="text-sm font-semibold text-neutral-700 dark:text-neutral-300 mb-4">
                    7 Specialised Tools
                  </p>
                  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                    {agentTools.map((tool) => {
                      const Icon = tool.icon
                      return (
                        <motion.div
                          key={tool.name}
                          variants={scaleIn}
                          whileHover={{ y: -2 }}
                          className="flex items-center gap-2.5 rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 px-3.5 py-2.5 shadow-sm hover:shadow-md transition-shadow"
                        >
                          <div className="w-7 h-7 rounded-md bg-primary-50 dark:bg-primary-900/40 flex items-center justify-center shrink-0">
                            <Icon className="h-3.5 w-3.5 text-primary-600 dark:text-primary-400" />
                          </div>
                          <span className="text-xs font-mono text-neutral-700 dark:text-neutral-300 truncate">
                            {tool.name}
                          </span>
                        </motion.div>
                      )
                    })}
                  </div>
                </motion.div>
              </motion.section>

              {/* ─── 5. System Architecture Diagram ─── */}
              <motion.section
                variants={stagger}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, margin: '-60px' }}
              >
                <motion.h2
                  variants={fadeUp}
                  className="text-2xl font-bold text-neutral-900 dark:text-neutral-100 mb-2"
                >
                  System Architecture
                </motion.h2>
                <motion.p variants={fadeUp} className="text-neutral-500 dark:text-neutral-400 mb-8">
                  Four distinct layers, each independently scalable.
                </motion.p>

                <div className="space-y-3">
                  {archLayers.map((layer, idx) => {
                    const Icon = layer.icon
                    return (
                      <div key={layer.label}>
                        <motion.div
                          variants={fadeUp}
                          className={`relative rounded-xl border ${layer.bg} px-6 py-5 flex items-center gap-4`}
                        >
                          <div className="w-10 h-10 rounded-lg bg-white/70 dark:bg-white/10 flex items-center justify-center shrink-0">
                            <Icon className={`h-5 w-5 ${layer.text}`} />
                          </div>
                          <div>
                            <h3 className={`font-semibold ${layer.text}`}>{layer.label}</h3>
                            <p className="text-sm text-neutral-600 dark:text-neutral-400">
                              {layer.detail}
                            </p>
                          </div>
                        </motion.div>

                        {/* Arrow between layers */}
                        {idx < archLayers.length - 1 && (
                          <div className="flex justify-center py-1">
                            <ArrowDown className="h-5 w-5 text-neutral-300 dark:text-neutral-600" />
                          </div>
                        )}
                      </div>
                    )
                  })}
                </div>
              </motion.section>

              {/* ─── 6. Security & Compliance ─── */}
              <motion.section
                variants={stagger}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, margin: '-60px' }}
              >
                <motion.h2
                  variants={fadeUp}
                  className="text-2xl font-bold text-neutral-900 dark:text-neutral-100 mb-2"
                >
                  Security & Data Governance
                </motion.h2>
                <motion.p variants={fadeUp} className="text-neutral-500 dark:text-neutral-400 mb-8">
                  Enterprise-grade safeguards built in from day one.
                </motion.p>

                <div className="grid gap-4 sm:grid-cols-2">
                  {securityCards.map((card) => {
                    const Icon = card.icon
                    return (
                      <motion.div
                        key={card.title}
                        variants={scaleIn}
                        className="rounded-xl border border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-900/50 p-5 hover:shadow-md transition-shadow"
                      >
                        <div className="flex items-center gap-3 mb-3">
                          <div className="w-9 h-9 rounded-lg bg-primary-50 dark:bg-primary-900/40 flex items-center justify-center">
                            <Icon className="h-4.5 w-4.5 text-primary-600 dark:text-primary-400" />
                          </div>
                          <h3 className="font-semibold text-neutral-900 dark:text-neutral-100">
                            {card.title}
                          </h3>
                        </div>
                        <p className="text-sm text-neutral-600 dark:text-neutral-400 leading-relaxed">
                          {card.desc}
                        </p>
                      </motion.div>
                    )
                  })}
                </div>
              </motion.section>

              {/* ─── 7. Numbers at a Glance ─── */}
              <motion.section
                variants={stagger}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, margin: '-60px' }}
              >
                <motion.h2
                  variants={fadeUp}
                  className="text-2xl font-bold text-neutral-900 dark:text-neutral-100 mb-8 text-center"
                >
                  Numbers at a Glance
                </motion.h2>

                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
                  {stats.map((stat) => (
                    <motion.div
                      key={stat.label}
                      variants={scaleIn}
                      whileHover={{ y: -3, scale: 1.03 }}
                      className="rounded-xl bg-gradient-to-br from-primary-50 to-accent-50 dark:from-primary-950/50 dark:to-accent-950/50 border border-primary-100 dark:border-primary-800/40 p-5 text-center shadow-sm"
                    >
                      <p className="text-3xl font-extrabold bg-gradient-to-r from-primary-600 to-accent-600 bg-clip-text text-transparent">
                        {stat.value}
                      </p>
                      <p className="text-xs font-medium text-neutral-500 dark:text-neutral-400 mt-1 uppercase tracking-wide">
                        {stat.label}
                      </p>
                    </motion.div>
                  ))}
                </div>
              </motion.section>
            </div>

            {/* ─── Footer ─── */}
            <div className="bg-neutral-50 dark:bg-neutral-900 px-8 py-6 border-t border-neutral-200 dark:border-neutral-700">
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                <p className="text-sm text-neutral-500 dark:text-neutral-400">
                  &copy; {new Date().getFullYear()} Nourish Neural. All rights reserved.
                </p>
                <div className="flex items-center space-x-6">
                  <Link
                    to="/support"
                    className="text-sm text-neutral-500 dark:text-neutral-400 hover:text-primary-600 dark:hover:text-primary-400 transition-colors"
                  >
                    Support
                  </Link>
                  <Link
                    to="/privacy"
                    className="text-sm text-neutral-500 dark:text-neutral-400 hover:text-primary-600 dark:hover:text-primary-400 transition-colors"
                  >
                    Privacy
                  </Link>
                  <Link
                    to="/"
                    className="text-sm text-neutral-500 dark:text-neutral-400 hover:text-primary-600 dark:hover:text-primary-400 transition-colors"
                  >
                    Home
                  </Link>
                </div>
              </div>
            </div>
          </motion.div>
        </main>
      </div>
    </>
  )
}
