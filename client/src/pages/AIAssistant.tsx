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
  MessageSquare,
  RefreshCw
} from 'lucide-react'
import { apiService } from '../services/api'
import { fadeUp, staggerContainer } from '../utils/motion'

interface Message {
  id: string
  content: string
  sender: 'user' | 'ai'
  timestamp: Date
  type?: 'text' | 'recipe' | 'nutrition' | 'substitution' | 'shopping_tip'
  data?: any
}

interface AIFeature {
  id: string
  name: string
  description: string
  icon: any
  endpoint: string
  prompt: string
}

const AI_FEATURES: AIFeature[] = [
  {
    id: 'recipe',
    name: 'Recipe Suggestions',
    description: 'Get personalized recipes based on your pantry items',
    icon: ChefHat,
    endpoint: '/api/ai/recipe-suggestions',
    prompt: 'What can I cook with my current pantry items?'
  },
  {
    id: 'nutrition',
    name: 'Nutrition Analysis',
    description: 'Analyze the nutritional content of your meals',
    icon: TrendingUp,
    endpoint: '/api/ai/nutrition-analysis',
    prompt: 'Can you analyze the nutrition of grilled chicken with rice and vegetables?'
  },
  {
    id: 'substitution',
    name: 'Food Substitutions',
    description: 'Find alternatives for ingredients you don\'t have',
    icon: Lightbulb,
    endpoint: '/api/ai/food-substitutions',
    prompt: 'What can I use instead of eggs in baking?'
  },
  {
    id: 'shopping',
    name: 'Shopping Tips',
    description: 'Get smart shopping advice and deals',
    icon: ShoppingCart,
    endpoint: '/api/ai/shopping-tips',
    prompt: 'Give me tips for budget-friendly grocery shopping'
  }
]

export default function AIAssistant() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      content: "Hello! I'm your Nurexa AI assistant. I can help you with recipes, nutrition analysis, food substitutions, and smart shopping tips. What would you like to know?",
      sender: 'ai',
      timestamp: new Date(),
      type: 'text'
    }
  ])
  const [inputMessage, setInputMessage] = useState('')
  const [selectedFeature, setSelectedFeature] = useState<string | null>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  // Chat mutation
  const chatMutation = useMutation(
    ({ message, endpoint }: { message: string; endpoint?: string }) =>
      apiService.post(endpoint || '/api/ai/chat', { message }),
    {
      onSuccess: (response: any) => {
        const aiMessage: Message = {
          id: Date.now().toString(),
          content: response.response || response.message,
          sender: 'ai',
          timestamp: new Date(),
          type: response.type || 'text',
          data: response.data
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
        content: "Hello! I'm your Nurexa AI assistant. I can help you with recipes, nutrition analysis, food substitutions, and smart shopping tips. What would you like to know?",
        sender: 'ai',
        timestamp: new Date(),
        type: 'text'
      }
    ])
  }

  const renderMessage = (message: Message) => {
    const isUser = message.sender === 'user'
    
    return (
      <div
        key={message.id}
        className={`flex items-start space-x-3 ${isUser ? 'flex-row-reverse space-x-reverse' : ''}`}
      >
        {/* Avatar */}
        <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
          isUser ? 'bg-primary-500 text-white' : 'bg-neutral-200 text-neutral-600'
        }`}>
          {isUser ? <User className="h-4 w-4" /> : <Bot className="h-4 w-4" />}
        </div>

        {/* Message Content */}
        <div className={`flex-1 max-w-2xl ${isUser ? 'text-right' : ''}`}>
          <div className={`inline-block px-4 py-2 rounded-lg ${
            isUser 
              ? 'bg-primary-500 text-white rounded-br-sm' 
              : 'bg-neutral-100 text-neutral-900 rounded-bl-sm'
          }`}>
            {/* Special rendering for different message types */}
            {message.type === 'recipe' && message.data ? (
              <div className="space-y-2">
                <p className="font-medium">{message.content}</p>
                {message.data.recipes && (
                  <div className="space-y-2">
                    {message.data.recipes.slice(0, 3).map((recipe: any, index: number) => (
                      <div key={index} className="bg-white bg-opacity-20 p-2 rounded">
                        <h4 className="font-medium">{recipe.name}</h4>
                        <p className="text-sm opacity-90">{recipe.description}</p>
                        {recipe.cookTime && (
                          <p className="text-xs opacity-75">Cook time: {recipe.cookTime}</p>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ) : message.type === 'nutrition' && message.data ? (
              <div className="space-y-2">
                <p className="font-medium">{message.content}</p>
                {message.data.analysis && (
                  <div className="bg-white bg-opacity-20 p-2 rounded text-sm">
                    <div className="grid grid-cols-2 gap-2">
                      {Object.entries(message.data.analysis).map(([key, value]) => (
                        <div key={key} className="flex justify-between">
                          <span className="capitalize">{key}:</span>
                          <span>{value as string}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <p className="whitespace-pre-wrap">{message.content}</p>
            )}
          </div>
          
          {/* Timestamp */}
          <p className={`text-xs text-neutral-500 mt-1 ${isUser ? 'text-right' : 'text-left'}`}>
            {message.timestamp.toLocaleTimeString([], { 
              hour: '2-digit', 
              minute: '2-digit' 
            })}
          </p>
        </div>
      </div>
    )
  }

  return (
    <>
      <Helmet>
        <title>Nurexa AI - Nourish Neural</title>
      </Helmet>

      <div className="relative h-[calc(100vh-8rem)] flex flex-col space-y-6">
        <motion.div
          className="pointer-events-none absolute inset-x-0 top-0 h-40 bg-gradient-to-r from-primary-100/50 via-white to-accent-100/50 blur-3xl"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1 }}
        />
        <motion.div
          className="pointer-events-none absolute -bottom-24 right-[-10%] h-72 w-72 rounded-full bg-primary-200/35 blur-3xl"
          animate={{ y: [0, -18, 0], opacity: [0.35, 0.6, 0.35] }}
          transition={{ duration: 18, repeat: Infinity, ease: 'easeInOut' }}
        />

        {/* Header */}
        <motion.div
          className="relative overflow-hidden"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
        >
          <div className="absolute inset-0 bg-gradient-to-r from-primary-600/5 to-accent-500/5 rounded-3xl"></div>
          <div className="relative glass-card rounded-3xl p-8 md:p-10 border border-neutral-200/60 backdrop-blur-sm">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div className="flex items-center space-x-4">
                <motion.div
                  className="inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-primary-500 to-accent-500 shadow-lg shadow-primary-500/30"
                  initial={{ scale: 0, rotate: -180 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{ duration: 0.6, delay: 0.2, type: 'spring' }}
                >
                  <Sparkles className="h-7 w-7 text-white" />
                </motion.div>
                <div>
                  <motion.h1
                    className="text-3xl md:text-4xl font-bold gradient-text"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.6, delay: 0.3 }}
                  >
                    Nurexa AI
                  </motion.h1>
                  <motion.p
                    className="mt-1 text-neutral-600 text-sm md:text-base"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.6, delay: 0.4 }}
                  >
                    Chat with an AI trained on recipes, nutrition, and culinary intelligence
                  </motion.p>
                </div>
              </div>
              <motion.button
                onClick={clearChat}
                className="btn btn-outline shadow-md hover:shadow-lg"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.6, delay: 0.5 }}
                whileHover={{ y: -2 }}
                whileTap={{ scale: 0.97 }}
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Clear Chat
              </motion.button>
            </div>
          </div>
        </motion.div>

        {/* AI Features Quick Access */}
        <motion.div
          className="grid grid-cols-2 md:grid-cols-4 gap-4"
          variants={staggerContainer}
          initial="hidden"
          animate="visible"
        >
          {AI_FEATURES.map((feature) => {
            const Icon = feature.icon
            return (
              <motion.button
                key={feature.id}
                onClick={() => handleFeatureClick(feature)}
                disabled={chatMutation.isLoading}
                className={`card hover:shadow-medium transition-all duration-200 ${
                  selectedFeature === feature.id ? 'ring-2 ring-primary-500' : ''
                }`}
                variants={fadeUp}
                whileHover={{ y: -6, boxShadow: '0 28px 55px -35px rgba(12,74,110,0.35)' }}
                whileTap={{ scale: 0.98 }}
              >
                <div className="card-content text-center">
                  <div className="flex justify-center mb-3">
                    <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center">
                      <Icon className="h-6 w-6 text-primary-600" />
                    </div>
                  </div>
                  <h3 className="font-medium text-neutral-900 mb-1">{feature.name}</h3>
                  <p className="text-xs text-neutral-600">{feature.description}</p>
                </div>
              </motion.button>
            )
          })}
        </motion.div>

        {/* Chat Area */}
        <motion.div
          className="flex-1 flex flex-col bg-white rounded-lg shadow-sm border border-neutral-200"
          variants={fadeUp}
          initial="hidden"
          animate="visible"
          transition={{ duration: 0.5 }}
        >
          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-6 space-y-4">
            {messages.map(renderMessage)}
            
            {/* Loading indicator */}
            {chatMutation.isLoading && (
              <div className="flex items-start space-x-3">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-neutral-200 text-neutral-600 flex items-center justify-center">
                  <Bot className="h-4 w-4" />
                </div>
                <div className="flex-1">
                  <div className="inline-block px-4 py-2 rounded-lg bg-neutral-100 text-neutral-900 rounded-bl-sm">
                    <div className="flex items-center space-x-2">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span>Thinking...</span>
                    </div>
                  </div>
                </div>
              </div>
            )}
            
            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <div className="border-t border-neutral-200 p-4">
            <div className="flex space-x-3">
              <div className="flex-1">
                <textarea
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Ask me anything about cooking, nutrition, or food shopping..."
                  className="input resize-none"
                  rows={2}
                  disabled={chatMutation.isLoading}
                />
              </div>
              <motion.button
                onClick={() => handleSendMessage()}
                disabled={!inputMessage.trim() || chatMutation.isLoading}
                className="btn btn-primary px-6"
                whileHover={{ y: -2 }}
                whileTap={{ scale: 0.97 }}
              >
                {chatMutation.isLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Send className="h-4 w-4" />
                )}
              </motion.button>
            </div>
            
            {/* Quick suggestions */}
            <motion.div className="mt-3 flex flex-wrap gap-2" variants={fadeUp}>
              {[
                "What's a healthy breakfast recipe?",
                "How can I meal prep for the week?",
                "What's in season right now?",
                "Help me use up my leftovers"
              ].map((suggestion, index) => (
                <motion.button
                  key={index}
                  onClick={() => handleSendMessage(suggestion)}
                  disabled={chatMutation.isLoading}
                  className="btn btn-ghost btn-sm text-xs"
                  whileHover={{ y: -1 }}
                  whileTap={{ scale: 0.97 }}
                >
                  {suggestion}
                </motion.button>
              ))}
            </motion.div>
          </div>
        </motion.div>

        {/* Info Banner */}
        <motion.div
          className="bg-blue-50 border border-blue-200 rounded-lg p-4"
          variants={fadeUp}
          initial="hidden"
          animate="visible"
          transition={{ duration: 0.45 }}
        >
          <div className="flex items-start space-x-3">
            <MessageSquare className="h-5 w-5 text-blue-600 mt-0.5" />
            <div className="flex-1">
              <h3 className="text-sm font-medium text-blue-900">Nurexa AI Tips</h3>
              <p className="text-sm text-blue-700 mt-1">
                For the best experience, be specific about your dietary preferences, allergies, 
                and what ingredients you have available. I can provide personalized suggestions 
                based on your pantry contents and shopping lists.
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </>
  )
} 