import { Helmet } from 'react-helmet-async'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  ArrowRight,
  BrainCircuit,
  CircleDashed,
  MessageSquare,
  Package,
  Scan,
  ShieldCheck,
  ShoppingCart,
  Sparkles,
  Sprout,
  Star,
  Waves
} from 'lucide-react'

const MotionLink = motion(Link)

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.18, when: 'beforeChildren' }
  }
}

const fadeUp = {
  hidden: { opacity: 0, y: 28 },
  visible: { opacity: 1, y: 0 }
}

const scaleIn = {
  hidden: { opacity: 0, scale: 0.9 },
  visible: { opacity: 1, scale: 1 }
}

const metrics = [
  { label: 'Households Assisted', value: '18k+', accent: 'from-primary-500 to-accent-500' },
  { label: 'Average Waste Reduction', value: '52%', accent: 'from-accent-500 to-primary-500' },
  { label: 'Monthly Savings', value: '£220', accent: 'from-primary-400 to-primary-600' },
  { label: 'Stores Indexed', value: '16+', accent: 'from-accent-400 to-accent-600' },
]

const features = [
  {
    icon: BrainCircuit,
    title: 'Predictive Pantry Engine',
    description: 'Forecast stock-outs and expiries with temporal LSTM models tuned to your household cadence.',
    tone: 'from-primary-500/10 to-primary-500/5',
  },
  {
    icon: Scan,
    title: 'Vision-Powered Intake',
    description: 'Classify groceries instantly with EfficientNet-based computer vision and auto-log nutrition data.',
    tone: 'from-accent-500/10 to-accent-500/5',
  },
  {
    icon: Waves,
    title: 'Dynamic Price Graph',
    description: 'Track real-time price movements across 15 UK supermarket chains and surface smart swaps.',
    tone: 'from-primary-400/10 to-accent-400/5',
  },
  {
    icon: Sprout,
    title: 'Behavioral Nudging',
    description: 'Blend behavioral insights with AI prompts to reinforce sustainable cooking and consumption habits.',
    tone: 'from-accent-400/10 to-primary-400/5',
  },
]

const journey = [
  {
    title: 'Sense',
    description: 'Capture pantry state via barcode scans, receipt imports, or camera intake with instant classification.',
  },
  {
    title: 'Predict',
    description: 'Blend consumption sequences, waste history, and seasonal datasets to anticipate needs and risks.',
  },
  {
    title: 'Orchestrate',
    description: 'Auto-generate grocery lists, reorder reminders, and recipe rotations that honor dietary goals.',
  },
  {
    title: 'Elevate',
    description: 'Close the loop with actionable insights, savings dashboards, and impact visualisations for the home.',
  },
]

const testimonials = [
  {
    name: 'Dr. Amara Lewis',
    role: 'Public Health Researcher',
    content: 'Nourish Neural bridges AI and nutrition elegantly—our pilot households cut waste in half within six weeks.',
  },
  {
    name: 'Owen Patel',
    role: 'Tech-Savvy Chef',
    content: 'The predictive pantry engine feels magical—my mise en place is always ready, and the AI knows my staples.',
  },
  {
    name: 'Sophie Clarke',
    role: 'Budget-Conscious Student',
    content: 'It spots hyperlocal deals, redesigns my meal plan, and keeps me on budget without sacrificing quality.',
  },
]

const quickLinks = [
  {
    href: '/app/grocery-lists',
    label: 'Intelligent Lists',
    description: 'AI-ranked shopping routes with real-time savings.',
    icon: ShoppingCart,
  },
  {
    href: '/app/pantry',
    label: 'Neural Pantry',
    description: 'Glassmorphism cards with freshness indicators.',
    icon: Package,
  },
  {
    href: '/app/stores',
    label: 'Store Atlas',
    description: 'Compare store assortments, hours, and pricing.',
    icon: CircleDashed,
  },
  {
    href: '/app/ai-assistant',
    label: 'Culinary Copilot',
    description: 'Chat with an AI trained on recipes and nutrition.',
    icon: MessageSquare,
  },
]

export default function LandingPage() {
  return (
    <>
      <Helmet>
        <title>Nourish Neural – Culinary Intelligence for Modern Homes</title>
        <meta
          name="description"
          content="Nourish Neural uses machine learning to orchestrate grocery planning, pantry intelligence, and sustainable cooking for households across the UK."
        />
      </Helmet>

      <div className="min-h-screen bg-white text-neutral-900">
        {/* Navigation */}
        <header className="sticky top-0 z-40 bg-white/80 backdrop-blur border-b border-neutral-200/60">
          <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex h-16 items-center justify-between">
              <Link to="/" className="flex items-center space-x-3">
                <img
                  src="/favicon.svg"
                  alt="Nourish Neural logo"
                  className="h-10 w-10 rounded-2xl shadow-lg shadow-primary-500/30"
                />
                <span className="text-xl font-bold tracking-tight">Nourish Neural</span>
              </Link>
              <div className="hidden md:flex items-center space-x-3">
                <Link to="/login" className="btn btn-ghost text-sm font-semibold">
                  Sign In
                </Link>
                <Link to="/register" className="btn btn-primary btn-sm md:btn">
                  Join the Beta
                </Link>
              </div>
            </div>
          </nav>
        </header>

        {/* Hero */}
        <section className="relative overflow-hidden">
          <motion.div
            className="absolute inset-0 bg-gradient-to-br from-primary-50 via-white to-accent-50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1.2, ease: 'easeOut' }}
          />
          <motion.div
            className="absolute -top-32 left-1/2 h-96 w-96 -translate-x-1/2 rounded-full bg-accent-400/20 blur-3xl"
            animate={{ y: [0, -24, 0], rotate: [0, 8, -6, 0] }}
            transition={{ duration: 16, repeat: Infinity, ease: 'easeInOut' }}
          />
          <motion.div
            className="absolute -bottom-24 right-[-5%] h-80 w-80 rounded-full bg-primary-400/20 blur-3xl"
            animate={{ y: [0, 18, 0], scale: [1, 1.08, 1] }}
            transition={{ duration: 14, repeat: Infinity, ease: 'easeInOut', repeatDelay: 0.8 }}
          />
          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
            <motion.div
              className="grid gap-16 lg:grid-cols-[1.05fr_0.95fr] items-center"
              variants={staggerContainer}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.45 }}
            >
              <motion.div className="space-y-10" variants={staggerContainer}>
                <motion.div
                  className="inline-flex items-center space-x-3 rounded-full border border-primary-200/70 bg-white/80 px-4 py-2 text-sm font-semibold text-primary-700 shadow-soft"
                  variants={fadeUp}
                  transition={{ duration: 0.6 }}
                >
                  <motion.span
                    className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-primary-500/20 to-accent-500/20"
                    animate={{ rotate: [0, -8, 8, 0] }}
                    transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut' }}
                  >
                    <Sparkles className="h-4 w-4" />
                  </motion.span>
                  <span>AI-first orchestration for household nourishment</span>
                </motion.div>
                <motion.div className="space-y-6" variants={fadeUp} transition={{ duration: 0.7 }}>
                  <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold leading-tight text-balance">
                    Reimagine how your kitchen thinks with <span className="gradient-text">Nourish Neural</span>.
                  </h1>
                  <p className="text-lg sm:text-xl text-neutral-700 leading-relaxed max-w-2xl">
                    Experience a neural pantry that forecasts demand, optimises spend, and curates meals in real time.
                    Built atop EfficientNet, LSTM, and ensemble forecasting, Nourish Neural turns grocery chaos into calm.
                  </p>
                </motion.div>
                <motion.div
                  className="flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-6"
                  variants={fadeUp}
                  transition={{ duration: 0.7, delay: 0.05 }}
                >
                  <MotionLink
                    to="/register"
                    className="btn btn-primary btn-lg px-8 py-4 text-base sm:text-lg shadow-large"
                    whileHover={{ y: -4, boxShadow: '0 24px 45px -20px rgba(14,165,233,0.6)' }}
                    whileTap={{ scale: 0.98 }}
                  >
                    Get Started Free
                  </MotionLink>
                  <MotionLink
                    to="/login"
                    className="btn btn-outline btn-lg px-8 py-4 text-base sm:text-lg hover:border-primary-400 hover:text-primary-600"
                    whileHover={{ y: -3, backgroundColor: 'rgba(14,165,233,0.05)' }}
                    whileTap={{ scale: 0.98 }}
                  >
                    Explore the Demo
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </MotionLink>
                </motion.div>
                <motion.div
                  className="grid grid-cols-2 sm:grid-cols-4 gap-4 sm:gap-6 pt-4"
                  variants={staggerContainer}
                >
                  {metrics.map((metric, index) => (
                    <motion.div
                      key={metric.label}
                      className="glass-card rounded-2xl border border-white/40 bg-white/80 p-5 text-center shadow-soft"
                      variants={scaleIn}
                      transition={{ duration: 0.55, delay: index * 0.08 }}
                      whileHover={{ y: -6, scale: 1.03 }}
                    >
                      <span className="text-2xl font-bold text-neutral-900">{metric.value}</span>
                      <p className="text-xs sm:text-sm text-neutral-600 mt-1">{metric.label}</p>
                    </motion.div>
                  ))}
                </motion.div>
              </motion.div>
              <motion.div
                className="relative"
                variants={scaleIn}
                transition={{ duration: 0.8, delay: 0.15, ease: 'easeOut' }}
              >
                <motion.div
                  className="absolute inset-0 bg-gradient-to-br from-primary-400/30 via-accent-500/20 to-transparent blur-3xl"
                  animate={{ scale: [1, 1.05, 1], opacity: [0.85, 1, 0.85] }}
                  transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
                />
                <motion.div
                  className="relative rounded-[32px] border border-white/40 bg-white/90 shadow-2xl shadow-primary-500/20 backdrop-blur-xl p-8 space-y-6"
                  initial={{ opacity: 0, y: 24 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.7, delay: 0.3, ease: 'easeOut' }}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm uppercase tracking-wide text-primary-600 font-semibold">Live Signal</p>
                      <h3 className="text-2xl font-bold text-neutral-900">Pantry Neural Graph</h3>
                    </div>
                    <motion.div
                      className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-primary-500/10"
                      animate={{ rotate: [0, 12, 0] }}
                      transition={{ duration: 12, repeat: Infinity, ease: 'easeInOut' }}
                    >
                      <ShieldCheck className="h-10 w-10 text-primary-500" />
                    </motion.div>
                  </div>
                  <motion.div
                    className="grid gap-4 rounded-2xl bg-gradient-to-br from-primary-500/10 via-white/70 to-accent-500/10 p-6"
                    variants={staggerContainer}
                  >
                    <motion.div className="flex items-center justify-between" variants={fadeUp}>
                      <div>
                        <p className="text-sm text-neutral-500">Confidence</p>
                        <p className="text-lg font-semibold text-neutral-900">97.4%</p>
                      </div>
                      <span className="inline-flex items-center space-x-2 rounded-full bg-primary-500/10 px-3 py-1 text-sm font-medium text-primary-600">
                        <BrainCircuit className="h-4 w-4" />
                        <span>LSTM | EfficientNet Hybrid</span>
                      </span>
                    </motion.div>
                    <motion.div className="grid grid-cols-3 gap-3 text-left text-sm" variants={staggerContainer}>
                      <motion.div
                        className="rounded-2xl border border-primary-100/60 bg-white/80 p-4 shadow-soft"
                        variants={fadeUp}
                        transition={{ duration: 0.5 }}
                      >
                        <p className="text-neutral-500">Waste Forecast</p>
                        <p className="text-lg font-semibold text-primary-600">↓ 48%</p>
                      </motion.div>
                      <motion.div
                        className="rounded-2xl border border-accent-100/60 bg-white/80 p-4 shadow-soft"
                        variants={fadeUp}
                        transition={{ duration: 0.5, delay: 0.08 }}
                      >
                        <p className="text-neutral-500">Spend Optimised</p>
                        <p className="text-lg font-semibold text-accent-600">£56 / wk</p>
                      </motion.div>
                      <motion.div
                        className="rounded-2xl border border-primary-100/60 bg-white/80 p-4 shadow-soft"
                        variants={fadeUp}
                        transition={{ duration: 0.5, delay: 0.16 }}
                      >
                        <p className="text-neutral-500">Freshness Score</p>
                        <p className="text-lg font-semibold text-primary-600">92 / 100</p>
                      </motion.div>
                    </motion.div>
                  </motion.div>
                  <motion.div
                    className="rounded-2xl border border-neutral-200 bg-white/70 p-5 space-y-3"
                    initial={{ opacity: 0, y: 18 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.45 }}
                  >
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-semibold text-neutral-600 uppercase tracking-wide">Upcoming automations</p>
                      <span className="rounded-full bg-primary-500/10 px-3 py-1 text-xs font-semibold text-primary-600">
                        Real-time
                      </span>
                    </div>
                    <div className="space-y-2 text-sm text-neutral-700">
                      <p>• Auto-adjust meal plan to incorporate Nduja expiring in 2 days.</p>
                      <p>• Send push alert: Waitrose vs Tesco price swing for oat milk.</p>
                      <p>• Trigger low-waste recipe pack for Friday’s family dinner.</p>
                    </div>
                  </motion.div>
                </motion.div>
              </motion.div>
            </motion.div>
          </div>
        </section>

        {/* Feature Grid */}
        <section className="py-20 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid gap-12 lg:grid-cols-[0.65fr_1fr] items-start">
              <motion.div
                className="space-y-6"
                initial={{ opacity: 0, y: 32 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, ease: 'easeOut' }}
                viewport={{ once: true, amount: 0.4 }}
              >
                <p className="text-sm font-semibold uppercase tracking-[0.3em] text-primary-600">Capabilities</p>
                <h2 className="text-3xl sm:text-4xl font-bold text-neutral-900">
                  Neural intelligence meets everyday kitchen flow.
                </h2>
                <p className="text-lg text-neutral-600 leading-relaxed">
                  Every layer of Nourish Neural is engineered for clarity. We fuse predictive analytics, pricing data,
                  and behavior-aware nudges into a UI that mirrors premium food-tech experiences.
                </p>
              </motion.div>
              <motion.div
                className="grid gap-6 sm:grid-cols-2"
                variants={staggerContainer}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, amount: 0.35 }}
              >
                {features.map((feature, index) => (
                  <motion.div
                    key={feature.title}
                    className="group rounded-3xl border border-neutral-200 bg-white p-8 shadow-soft transition-all duration-300"
                    variants={fadeUp}
                    transition={{ duration: 0.6, delay: index * 0.08 }}
                    whileHover={{
                      y: -10,
                      boxShadow: '0 32px 60px -35px rgba(168, 85, 247, 0.45)'
                    }}
                  >
                    <motion.div
                      className={`mb-6 inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br ${feature.tone}`}
                      whileHover={{ scale: 1.08, rotate: 4 }}
                      transition={{ type: 'spring', stiffness: 220, damping: 12 }}
                    >
                      <feature.icon className="h-6 w-6 text-primary-600" />
                    </motion.div>
                    <h3 className="text-xl font-semibold text-neutral-900 mb-3">{feature.title}</h3>
                    <p className="text-neutral-600 leading-relaxed">{feature.description}</p>
                  </motion.div>
                ))}
              </motion.div>
            </div>
          </div>
        </section>

        {/* Journey */}
        <section className="py-20 bg-neutral-50">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div
              className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-10 mb-16"
              initial={{ opacity: 0, y: 32 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true, amount: 0.35 }}
            >
              <div className="space-y-4">
                <p className="text-sm font-semibold uppercase tracking-[0.3em] text-accent-600">Flow</p>
                <h2 className="text-3xl md:text-4xl font-bold text-neutral-900 text-balance">
                  From sensing to orchestration in four graceful steps.
                </h2>
              </div>
              <p className="text-lg text-neutral-600 max-w-xl">
                Our UI breaks complex machine learning outputs into digestible, glanceable micro-interactions so
                households can act in seconds—not hours.
              </p>
            </motion.div>
            <div className="relative">
              <motion.div
                className="absolute inset-y-0 left-6 w-px bg-gradient-to-b from-primary-200 via-accent-200 to-transparent hidden sm:block"
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                transition={{ duration: 0.8 }}
                viewport={{ once: true }}
              />
              <motion.div
                className="space-y-8 sm:space-y-12"
                variants={staggerContainer}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, amount: 0.3 }}
              >
                {journey.map((item, index) => (
                  <motion.div key={item.title} className="relative sm:pl-16" variants={fadeUp}>
                    <div className="absolute left-0 top-2 hidden sm:block">
                      <motion.div
                        className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-primary-500 to-accent-500 text-white font-semibold shadow-soft"
                        animate={{ rotate: [0, 8, -8, 0] }}
                        transition={{ duration: 12, repeat: Infinity, ease: 'easeInOut' }}
                      >
                        {index + 1}
                      </motion.div>
                    </div>
                    <motion.div
                      className="rounded-3xl border border-neutral-200 bg-white p-8 shadow-soft"
                      whileHover={{ y: -6, boxShadow: '0 28px 50px -30px rgba(56, 189, 248, 0.4)' }}
                      transition={{ duration: 0.35 }}
                    >
                      <h3 className="text-xl font-semibold text-neutral-900 mb-3">{item.title}</h3>
                      <p className="text-neutral-600 leading-relaxed">{item.description}</p>
                    </motion.div>
                  </motion.div>
                ))}
              </motion.div>
            </div>
          </div>
        </section>

        {/* Quick Links */}
        <section className="py-20 bg-white">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div
              className="flex flex-col md:flex-row md:items-center md:justify-between gap-8 mb-12"
              initial={{ opacity: 0, y: 28 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true, amount: 0.3 }}
            >
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.3em] text-primary-600">Ecosystem</p>
                <h2 className="text-3xl font-bold text-neutral-900">Tap straight into the neural workspace.</h2>
              </div>
              <MotionLink
                to="/register"
                className="inline-flex items-center text-primary-600 font-semibold hover:text-primary-700"
                whileHover={{ x: 6 }}
              >
                View platform tour
                <ArrowRight className="ml-2 h-4 w-4" />
              </MotionLink>
            </motion.div>
            <motion.div
              className="grid gap-6 md:grid-cols-2"
              variants={staggerContainer}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.3 }}
            >
              {quickLinks.map((link, index) => (
                <MotionLink
                  key={link.label}
                  to={link.href}
                  className="group rounded-3xl border border-neutral-200 bg-white p-8 shadow-soft"
                  variants={fadeUp}
                  transition={{ duration: 0.6, delay: index * 0.08 }}
                  whileHover={{
                    y: -8,
                    boxShadow: '0 30px 55px -35px rgba(14, 165, 233, 0.45)'
                  }}
                  whileTap={{ scale: 0.98 }}
                >
                  <div className="flex items-center justify-between mb-6">
                    <motion.div
                      className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-primary-500/15 to-accent-500/15 text-primary-600"
                      whileHover={{ scale: 1.1 }}
                    >
                      <link.icon className="h-6 w-6" />
                    </motion.div>
                    <span className="inline-flex items-center rounded-full bg-primary-500/10 px-4 py-1 text-xs font-semibold text-primary-600">
                      Open Module
                    </span>
                  </div>
                  <h3 className="text-xl font-semibold text-neutral-900 mb-3">{link.label}</h3>
                  <p className="text-neutral-600 leading-relaxed">{link.description}</p>
                  <motion.div
                    className="mt-6 inline-flex items-center text-sm font-semibold text-primary-600 group-hover:text-primary-700"
                    animate={{ x: [0, 4, 0] }}
                    transition={{ duration: 3.2, repeat: Infinity, ease: 'easeInOut' }}
                  >
                    Enter workspace
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </motion.div>
                </MotionLink>
              ))}
            </motion.div>
          </div>
        </section>

        {/* Testimonials */}
        <section className="py-20 bg-neutral-950 text-white relative overflow-hidden">
          <motion.div
            className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(14,165,233,0.25),transparent_55%)]"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ duration: 1 }}
          />
          <motion.div
            className="absolute -bottom-20 right-[-10%] h-80 w-80 rounded-full bg-accent-400/20 blur-3xl"
            animate={{ y: [0, -18, 0], rotate: [0, -6, 6, 0] }}
            transition={{ duration: 18, repeat: Infinity, ease: 'easeInOut' }}
          />
          <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div
              className="flex flex-col md:flex-row md:items-end md:justify-between gap-8 mb-12"
              initial={{ opacity: 0, y: 32 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true, amount: 0.35 }}
            >
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.3em] text-primary-200">Social Proof</p>
                <h2 className="text-3xl font-bold text-white">Experts and households love Nourish Neural.</h2>
              </div>
              <p className="text-neutral-300 max-w-xl">
                Built with human-centred design and rigorous data science, our platform slots seamlessly into real kitchens.
              </p>
            </motion.div>
            <motion.div
              className="grid gap-6 md:grid-cols-3"
              variants={staggerContainer}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.3 }}
            >
              {testimonials.map((testimonial, index) => (
                <motion.div
                  key={testimonial.name}
                  className="rounded-3xl border border-white/10 bg-white/5 p-8 backdrop-blur-lg shadow-soft"
                  variants={fadeUp}
                  transition={{ duration: 0.65, delay: index * 0.12 }}
                  whileHover={{
                    y: -6,
                    boxShadow: '0 32px 60px -35px rgba(168, 85, 247, 0.45)'
                  }}
                >
                  <motion.div
                    className="flex items-center mb-4 text-primary-200"
                    animate={{ scale: [1, 1.08, 1], opacity: [0.9, 1, 0.9] }}
                    transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
                  >
                    <Star className="h-5 w-5 fill-current" />
                    <Star className="h-5 w-5 fill-current" />
                    <Star className="h-5 w-5 fill-current" />
                    <Star className="h-5 w-5 fill-current" />
                    <Star className="h-5 w-5 fill-current" />
                  </motion.div>
                  <p className="text-neutral-100 leading-relaxed mb-6">“{testimonial.content}”</p>
                  <div>
                    <p className="text-lg font-semibold text-white">{testimonial.name}</p>
                    <p className="text-sm text-neutral-300">{testimonial.role}</p>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </section>

        {/* Final CTA */}
        <section className="py-20 bg-gradient-to-br from-primary-600 via-primary-700 to-accent-700 text-white">
          <motion.div
            className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-8"
            initial={{ opacity: 0, y: 36 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
            viewport={{ once: true, amount: 0.4 }}
          >
            <motion.p
              className="text-sm font-semibold uppercase tracking-[0.3em] text-primary-100"
              animate={{ opacity: [0.6, 1, 0.6] }}
              transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
            >
              Get Started
            </motion.p>
            <h2 className="text-3xl sm:text-4xl font-bold leading-tight">
              Ready to infuse your household with culinary intelligence?
            </h2>
            <p className="text-lg sm:text-xl text-primary-100">
              Join the Nourish Neural beta to unlock predictive grocery planning, intelligent pantry insights, and
              sustainability analytics in one polished workspace.
            </p>
            <div className="flex flex-col sm:flex-row sm:justify-center gap-4 sm:gap-6">
              <MotionLink
                to="/register"
                className="btn bg-white text-primary-700 hover:bg-white/90 btn-lg px-10 py-4 text-lg font-semibold shadow-large"
                whileHover={{ y: -4, boxShadow: '0 32px 55px -35px rgba(255,255,255,0.45)' }}
                whileTap={{ scale: 0.98 }}
              >
                Claim Your Access
              </MotionLink>
              <MotionLink
                to="/login"
                className="btn btn-outline border-white bg-transparent text-white hover:bg-white/10 btn-lg px-10 py-4 text-lg font-semibold"
                whileHover={{ y: -3, backgroundColor: 'rgba(255,255,255,0.08)' }}
                whileTap={{ scale: 0.98 }}
              >
                Log In
              </MotionLink>
            </div>
          </motion.div>
        </section>

        {/* Footer */}
        <footer className="bg-neutral-950 text-neutral-200 py-14">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid gap-10 md:grid-cols-4">
              <div className="space-y-4">
                <div className="flex items-center space-x-3">
                  <span className="inline-flex h-9 w-9 items-center justify-center rounded-2xl bg-gradient-to-br from-primary-500 to-accent-500 text-white">
                    <BrainCircuit className="h-5 w-5" />
                  </span>
                  <span className="text-lg font-semibold">Nourish Neural</span>
                </div>
                <p className="text-sm text-neutral-400 leading-relaxed">
                  Culinary intelligence for modern households—predictive, sustainable, and unapologetically beautiful.
                </p>
              </div>
              <div>
                <h3 className="text-sm font-semibold uppercase tracking-[0.3em] text-neutral-400 mb-4">Platform</h3>
                <ul className="space-y-2 text-sm text-neutral-400">
                  <li><Link to="/app/dashboard" className="hover:text-white transition-colors">Dashboard</Link></li>
                  <li><Link to="/app/grocery-lists" className="hover:text-white transition-colors">Grocery Intelligence</Link></li>
                  <li><Link to="/app/pantry" className="hover:text-white transition-colors">Neural Pantry</Link></li>
                  <li><Link to="/app/ai-assistant" className="hover:text-white transition-colors">Culinary Copilot</Link></li>
                </ul>
              </div>
              <div>
                <h3 className="text-sm font-semibold uppercase tracking-[0.3em] text-neutral-400 mb-4">Company</h3>
                <ul className="space-y-2 text-sm text-neutral-400">
                  <li><Link to="/terms" className="hover:text-white transition-colors">Terms</Link></li>
                  <li><Link to="/privacy" className="hover:text-white transition-colors">Privacy</Link></li>
                  <li><a href="#" className="hover:text-white transition-colors">Support</a></li>
                  <li><a href="#" className="hover:text-white transition-colors">Contact</a></li>
                </ul>
              </div>
              <div className="space-y-4">
                <h3 className="text-sm font-semibold uppercase tracking-[0.3em] text-neutral-400">Stay in the loop</h3>
                <p className="text-sm text-neutral-400">
                  Request early access updates, release notes, and culinary intelligence research.
                </p>
                <Link
                  to="/register"
                  className="inline-flex items-center rounded-full bg-white/10 px-4 py-2 text-sm font-semibold text-white hover:bg-white/20 transition-colors"
                >
                  Join beta waitlist
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </div>
            </div>
            <div className="border-t border-white/10 mt-10 pt-6 text-center text-sm text-neutral-500">
              © {new Date().getFullYear()} Nourish Neural. All rights reserved.
            </div>
          </div>
        </footer>
      </div>
    </>
  )
}