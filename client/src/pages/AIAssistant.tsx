import { useState, useRef, useEffect } from 'react'
import { Helmet } from 'react-helmet-async'
import { useMutation } from 'react-query'
import { motion } from 'framer-motion'
import {
  Bot,
  Send,
  User,
  ChefHat,
  TrendingUp,
  Lightbulb,
  ShoppingCart,
  Loader2,
  Sparkles,
  RefreshCw,
  Zap
} from 'lucide-react'
import { apiService } from '../services/api'
import { fadeUp, staggerContainer } from '../utils/motion'

interface Message {
  id: string
  content: string
  sender: 'user' | 'ai'
  timestamp: Date
  type?: 'text' | 'recipe' | 'nutrition' | 'substitution' | 'shopping_tip' | 'agent'
  data?: any
  toolsUsed?: any[]
}

interface AIFeature {
  id: string
  name: string
  description: string
  icon: any
  endpoint: string
  prompt: string
  color: string
}

const AI_FEATURES: AIFeature[] = [
  {
    id: 'recipe',
    name: 'Recipe Ideas',
    description: 'Get personalized recipes',
    icon: ChefHat,
    endpoint: '/api/ai/recipes',
    prompt: 'What can I cook with my current pantry items?',
    color: 'from-orange-500 to-red-500'
  },
  {
    id: 'nutrition',
    name: 'Nutrition Analysis',
    description: 'Analyze meal nutrition',
    icon: TrendingUp,
    endpoint: '/api/ai/nutrition',
    prompt: 'Can you analyze the nutrition of grilled chicken with rice and vegetables?',
    color: 'from-green-500 to-emerald-500'
  },
  {
    id: 'substitution',
    name: 'Substitutions',
    description: 'Find ingredient alternatives',
    icon: Lightbulb,
    endpoint: '/api/ai/substitutions',
    prompt: 'What can I use instead of eggs in baking?',
    color: 'from-yellow-500 to-orange-500'
  },
  {
    id: 'shopping',
    name: 'Shopping Tips',
    description: 'Smart shopping advice',
    icon: ShoppingCart,
    endpoint: '/api/ai/shopping-tips',
    prompt: 'Give me tips for budget-friendly grocery shopping',
    color: 'from-blue-500 to-primary-500'
  }
]

export default function AIAssistant() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      content: "Hello! I'm Nurexa, your smart food assistant. I can check your pantry, predict what's about to expire, suggest recipes to reduce waste, and give you personalised food advice. Try asking me what you should cook tonight!",
      sender: 'ai',
      timestamp: new Date(),
      type: 'text'
    }
  ])
  const [inputMessage, setInputMessage] = useState('')
  const [selectedFeature, setSelectedFeature] = useState<string | null>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  // Determine if a message should use the ReAct agent (data-aware queries)
  const shouldUseAgent = (msg: string): boolean => {
    const lower = msg.toLowerCase()
    const agentTriggers = [
      'pantry', 'expir', 'waste', 'what should i cook', 'what can i make',
      'what do i have', 'going off', 'use up', 'running out', 'fridge',
      'going bad', 'meal plan', 'predict', 'how much waste', 'food waste',
      'my items', 'my food', 'what\'s in my', 'suggest recipe', 'cook tonight'
    ]
    return agentTriggers.some(trigger => lower.includes(trigger))
  }

  // Chat mutation - routes to agent for data-aware queries, chat for general
  const chatMutation = useMutation(
    ({ message, endpoint }: { message: string; endpoint?: string }) => {
      const useAgent = !endpoint && shouldUseAgent(message)
      const url = endpoint || (useAgent ? '/api/ai/agent' : '/api/ai/chat')
      return apiService.post(url, { message })
    },
    {
      onSuccess: (response: any) => {
        const aiMessage: Message = {
          id: Date.now().toString(),
          content: response.response || response.message,
          sender: 'ai',
          timestamp: new Date(),
          type: response.type || 'text',
          data: response.data,
          toolsUsed: response.toolsUsed
        }
        setMessages(prev => [...prev, aiMessage])
      },
      onError: () => {
        const errorMessage: Message = {
          id: Date.now().toString(),
          content: "I'm sorry, I'm having trouble responding right now. Please try again later.",
          sender: 'ai',
          timestamp: new Date(),
          type: 'text'
        }
        setMessages(prev => [...prev, errorMessage])
      }
    }
  )

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const handleSendMessage = (message?: string, endpoint?: string) => {
    const messageText = message || inputMessage.trim()
    if (!messageText) return

    // Add user message
    const userMessage: Message = {
      id: Date.now().toString(),
      content: messageText,
      sender: 'user',
      timestamp: new Date(),
      type: 'text'
    }
    setMessages(prev => [...prev, userMessage])

    // Send to AI
    chatMutation.mutate({ message: messageText, endpoint })

    // Clear input
    setInputMessage('')
    setSelectedFeature(null)
  }

  const handleFeatureClick = (feature: AIFeature) => {
    setSelectedFeature(feature.id)
    handleSendMessage(feature.prompt, feature.endpoint)
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  const clearChat = () => {
    setMessages([
      {
        id: '1',
        content: "Hello! I'm Nurexa, your smart food assistant. I can check your pantry, predict what's about to expire, suggest recipes to reduce waste, and give you personalised food advice. Try asking me what you should cook tonight!",
        sender: 'ai',
        timestamp: new Date(),
        type: 'text'
      }
    ])
  }

  const renderMessage = (message: Message) => {
    const isUser = message.sender === 'user'

    return (
      <motion.div
        key={message.id}
        className={`flex items-start space-x-3 ${isUser ? 'flex-row-reverse space-x-reverse' : ''}`}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        {/* Avatar */}
        <div className={`flex-shrink-0 w-10 h-10 rounded-2xl flex items-center justify-center ${isUser
            ? 'bg-gradient-to-br from-blue-500 to-primary-500 shadow-lg shadow-blue-500/30'
            : 'bg-white border-2 border-neutral-200'
          }`}>
          {isUser ? (
            <User className="h-5 w-5 text-white" />
          ) : (
            <Bot className="h-5 w-5 text-primary-600" />
          )}
        </div>

        {/* Message Content */}
        <div className={`flex-1 max-w-2xl ${isUser ? 'text-right' : ''}`}>
          <div className={`inline-block px-5 py-3 rounded-2xl ${isUser
              ? 'bg-gradient-to-br from-blue-500 to-primary-500 text-white shadow-lg shadow-blue-500/20 rounded-br-md'
              : 'bg-white text-neutral-900 border-2 border-neutral-200 rounded-bl-md'
            }`}>
            {/* Special rendering for different message types */}
            {message.type === 'recipe' && message.data ? (
              <div className="space-y-3">
                <p className="font-medium">{message.content}</p>
                {message.data.recipes && (
                  <div className="space-y-2">
                    {message.data.recipes.slice(0, 3).map((recipe: any, index: number) => (
                      <div key={index} className="bg-white bg-opacity-20 p-3 rounded-xl backdrop-blur-sm">
                        <h4 className="font-semibold">{recipe.name}</h4>
                        <p className="text-sm opacity-90 mt-1">{recipe.description}</p>
                        {recipe.cookTime && (
                          <p className="text-xs opacity-75 mt-1">Cook time: {recipe.cookTime}</p>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ) : message.type === 'nutrition' && message.data ? (
              <div className="space-y-3">
                <p className="font-medium">{message.content}</p>
                {message.data.analysis && (
                  <div className="bg-white bg-opacity-20 p-3 rounded-xl text-sm backdrop-blur-sm">
                    <div className="grid grid-cols-2 gap-2">
                      {Object.entries(message.data.analysis).map(([key, value]) => (
                        <div key={key} className="flex justify-between">
                          <span className="capitalize">{key}:</span>
                          <span className="font-semibold">{value as string}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <p className="whitespace-pre-wrap leading-relaxed">{message.content}</p>
            )}
          </div>

          {/* Timestamp */}
          <p className={`text-xs text-neutral-400 mt-1.5 ${isUser ? 'text-right' : 'text-left'}`}>
            {message.timestamp.toLocaleTimeString([], {
              hour: '2-digit',
              minute: '2-digit'
            })}
          </p>
        </div>
      </motion.div>
    )
  }

  return (
    <>
      <Helmet>
        <title>Nurexa AI - Nourish Neural</title>
      </Helmet>

      <div className="relative min-h-screen pb-8">
        {/* Subtle gradient background blurs */}
        <motion.div
          className="pointer-events-none fixed top-0 right-0 h-[500px] w-[500px] rounded-full bg-purple-100/40 blur-3xl"
          animate={{ scale: [1, 1.1, 1], opacity: [0.3, 0.5, 0.3] }}
          transition={{ duration: 20, repeat: Infinity, ease: 'easeInOut' }}
        />
        <motion.div
          className="pointer-events-none fixed bottom-0 left-0 h-[400px] w-[400px] rounded-full bg-blue-100/30 blur-3xl"
          animate={{ scale: [1, 1.15, 1], opacity: [0.25, 0.4, 0.25] }}
          transition={{ duration: 25, repeat: Infinity, ease: 'easeInOut' }}
        />

        {/* Header */}
        <motion.div
          className="mb-8"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="flex items-start justify-between">
            <div>
              <motion.div
                className="flex items-center space-x-4 mb-3"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: 0.1 }}
              >
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-purple-500 to-blue-500 shadow-lg shadow-purple-500/30">
                  <Sparkles className="w-8 h-8 text-white" />
                </div>
                <div>
                  <h1 className="text-5xl font-black text-neutral-900 dark:text-neutral-100">
                    Nurexa <span className="bg-gradient-to-r from-purple-600 via-blue-600 to-primary-500 bg-clip-text text-transparent">AI</span>
                  </h1>
                  <p className="text-lg text-neutral-500 dark:text-neutral-400 mt-1">
                    Your intelligent culinary assistant
                  </p>
                </div>
              </motion.div>
            </div>
            <motion.button
              onClick={clearChat}
              className="hidden md:flex items-center space-x-2 px-4 py-2.5 bg-white border-2 border-neutral-200 rounded-xl text-neutral-700 font-semibold hover:border-neutral-300 hover:shadow-md transition-all"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              whileHover={{ y: -2 }}
              whileTap={{ scale: 0.98 }}
            >
              <RefreshCw className="h-4 w-4" />
              <span>Clear Chat</span>
            </motion.button>
          </div>
        </motion.div>

        {/* AI Features Quick Access */}
        <motion.div
          className="mb-8"
          variants={staggerContainer}
          initial="hidden"
          animate="visible"
        >
          <h2 className="text-xl font-bold text-neutral-900 dark:text-neutral-100 mb-4">Quick Actions</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {AI_FEATURES.map((feature) => {
              const Icon = feature.icon
              return (
                <motion.button
                  key={feature.id}
                  onClick={() => handleFeatureClick(feature)}
                  disabled={chatMutation.isLoading}
                  className={`relative overflow-hidden bg-white dark:bg-neutral-800 rounded-2xl border-2 p-5 transition-all duration-300 ${selectedFeature === feature.id
                      ? 'border-primary-400 dark:border-primary-500 shadow-lg shadow-primary-500/20'
                      : 'border-neutral-200 dark:border-neutral-700 hover:border-neutral-300 dark:hover:border-neutral-600 hover:shadow-md'
                    }`}
                  variants={fadeUp}
                  whileHover={{ y: -4, scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  transition={{ duration: 0.2 }}
                >
                  <div className="flex flex-col items-center text-center">
                    <div className={`w-12 h-12 bg-gradient-to-br ${feature.color} rounded-xl flex items-center justify-center mb-3 shadow-lg`}>
                      <Icon className="h-6 w-6 text-white" />
                    </div>
                    <h3 className="font-bold text-neutral-900 dark:text-neutral-100 text-sm mb-1">{feature.name}</h3>
                    <p className="text-xs text-neutral-600 dark:text-neutral-400">{feature.description}</p>
                  </div>
                </motion.button>
              )
            })}
          </div>
        </motion.div>

        {/* Chat Interface */}
        <motion.div
          className="bg-white rounded-3xl border-2 border-neutral-200 overflow-hidden shadow-xl"
          variants={fadeUp}
          initial="hidden"
          animate="visible"
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          {/* Messages Area */}
          <div className="h-[500px] overflow-y-auto p-6 space-y-4 bg-gradient-to-b from-neutral-50/50 to-white dark:from-neutral-900/50 dark:to-neutral-800">
            {messages.map(renderMessage)}

            {/* Loading indicator */}
            {chatMutation.isLoading && (
              <motion.div
                className="flex items-start space-x-3"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
              >
                <div className="flex-shrink-0 w-10 h-10 rounded-2xl bg-white border-2 border-neutral-200 flex items-center justify-center">
                  <Bot className="h-5 w-5 text-primary-600" />
                </div>
                <div className="flex-1">
                  <div className="inline-block px-5 py-3 rounded-2xl bg-white border-2 border-neutral-200 rounded-bl-md">
                    <div className="flex items-center space-x-2">
                      <Loader2 className="h-4 w-4 animate-spin text-primary-600" />
                      <span className="text-neutral-600">Thinking...</span>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <div className="border-t-2 border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 p-5">
            <div className="flex space-x-3 mb-3">
              <div className="flex-1">
                <textarea
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Ask me anything about cooking, nutrition, or food shopping..."
                  className="w-full px-4 py-3 border-2 border-neutral-200 dark:border-neutral-600 rounded-xl resize-none focus:outline-none focus:border-primary-400 dark:focus:border-primary-500 focus:ring-4 focus:ring-primary-100 dark:focus:ring-primary-900/30 transition-all text-neutral-900 dark:text-neutral-100 placeholder-neutral-400 dark:placeholder-neutral-500 bg-white dark:bg-neutral-700"
                  rows={2}
                  disabled={chatMutation.isLoading}
                />
              </div>
              <motion.button
                onClick={() => handleSendMessage()}
                disabled={!inputMessage.trim() || chatMutation.isLoading}
                className="px-6 py-3 bg-gradient-to-br from-blue-500 to-primary-500 text-white rounded-xl font-semibold shadow-lg shadow-blue-500/30 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                whileHover={{ y: -2, scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                {chatMutation.isLoading ? (
                  <Loader2 className="h-5 w-5 animate-spin" />
                ) : (
                  <Send className="h-5 w-5" />
                )}
              </motion.button>
            </div>

            {/* Quick suggestions */}
            <div className="flex flex-wrap gap-2">
              {[
                "What's a healthy breakfast recipe?",
                "How can I meal prep for the week?",
                "What's in season right now?",
                "Help me use up my leftovers"
              ].map((suggestion, idx) => (
                <motion.button
                  key={idx}
                  onClick={() => handleSendMessage(suggestion)}
                  disabled={chatMutation.isLoading}
                  className="px-3 py-1.5 bg-neutral-100 dark:bg-neutral-700 border border-neutral-200 dark:border-neutral-600 rounded-lg text-xs font-medium text-neutral-700 dark:text-neutral-300 hover:bg-neutral-200 dark:hover:bg-neutral-600 hover:border-neutral-300 dark:hover:border-neutral-500 transition-all disabled:opacity-50"
                  whileHover={{ y: -1 }}
                  whileTap={{ scale: 0.98 }}
                >
                  {suggestion}
                </motion.button>
              ))}
            </div>
          </div>
        </motion.div>

        {/* Info Banner */}

        <motion.div
          className="mt-6 bg-gradient-to-r from-blue-50 to-purple-50 border-2 border-blue-200/60 rounded-2xl p-5"
          variants={fadeUp}
          initial="hidden"
          animate="visible"
          transition={{ duration: 0.45, delay: 0.3 }}
        >
          <div className="flex items-start space-x-3">
            <div className="flex-shrink-0 w-10 h-10 bg-blue-500/10 rounded-xl flex items-center justify-center">
              <Zap className="h-5 w-5 text-blue-600" />
            </div>
            <div className="flex-1">
              <h3 className="text-sm font-bold text-blue-900 dark:text-blue-300 mb-1">Pro Tips for Best Results</h3>
              <p className="text-sm text-blue-700 dark:text-blue-400 leading-relaxed">
                Be specific about your dietary preferences, allergies, and available ingredients.
                I can provide personalized suggestions based on your pantry contents and shopping lists.
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </>
  )
}
