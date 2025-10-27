import { Helmet } from 'react-helmet-async'
import { Link } from 'react-router-dom'
import { 
  ShoppingCart, 
  Package, 
  MapPin, 
  Bot, 
  Zap, 
  Star,
  ArrowRight,
  MessageSquare,
  ChefHat,
  Users,
  Sparkles
} from 'lucide-react'

export default function LandingPage() {
  const features = [
    {
      icon: ShoppingCart,
      title: 'Smart Grocery Lists',
      description: 'Create and manage intelligent shopping lists with price tracking and store optimization.',
      color: 'text-blue-600 bg-blue-100'
    },
    {
      icon: Package,
      title: 'Pantry Management',
      description: 'Track your food inventory, expiry dates, and never waste food again.',
      color: 'text-green-600 bg-green-100'
    },
    {
      icon: Bot,
      title: 'AI Food Assistant',
      description: 'Get personalized recipe suggestions, nutrition advice, and cooking tips from our AI.',
      color: 'text-purple-600 bg-purple-100'
    },
    {
      icon: MapPin,
      title: 'Store Finder',
      description: 'Find nearby stores, compare prices, and get the best deals in your area.',
      color: 'text-orange-600 bg-orange-100'
    }
  ]

  const testimonials = [
    {
      name: 'Sarah Johnson',
      role: 'Busy Mom',
      content: 'PantryPal has revolutionized how I shop and manage our family meals. The AI suggestions are incredible!',
      rating: 5
    },
    {
      name: 'Mark Chen',
      role: 'Food Enthusiast',
      content: 'I love how it tracks my pantry and suggests recipes based on what I have. No more food waste!',
      rating: 5
    },
    {
      name: 'Emma Davis',
      role: 'Student',
      content: 'Perfect for my budget! It helps me find the best deals and plan meals efficiently.',
      rating: 5
    }
  ]

  return (
    <>
      <Helmet>
        <title>PantryPal - Your AI-Powered Grocery Assistant</title>
        <meta name="description" content="Smart grocery management with AI-powered recommendations, pantry tracking, and intelligent shopping lists." />
      </Helmet>

      <div className="min-h-screen bg-white">
        {/* Navigation */}
        <nav className="bg-white shadow-sm border-b border-neutral-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-primary-500 rounded-lg flex items-center justify-center">
                  <ChefHat className="h-5 w-5 text-white" />
                </div>
                <span className="text-xl font-bold text-neutral-900">PantryPal</span>
              </div>
                             <div className="flex items-center space-x-4">
                <Link
                  to="/login"
                  className="btn btn-ghost"
                >
                  Sign In
                </Link>
                <Link
                  to="/register"
                  className="btn btn-primary"
                >
                  Get Started Free
                </Link>
              </div>
            </div>
          </div>
        </nav>

        {/* Hero Section */}
        <section className="gradient-bg-primary py-24 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-primary-600/5 to-accent-500/5"></div>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
            <div className="text-center">
              <div className="inline-flex items-center px-4 py-2 rounded-full bg-white/80 backdrop-blur-sm border border-primary-200/50 shadow-lg mb-8 animate-float">
                <Sparkles className="h-4 w-4 text-primary-600 mr-2" />
                <span className="text-sm font-semibold text-primary-700">AI-Powered Smart Grocery Management</span>
              </div>
              <h1 className="text-5xl md:text-7xl font-bold mb-6">
                <span className="block text-neutral-900">Your AI-Powered</span>
                <span className="block gradient-text text-6xl md:text-8xl">Grocery Assistant</span>
              </h1>
              <p className="text-xl md:text-2xl text-neutral-700 mb-10 max-w-4xl mx-auto leading-relaxed">
                Transform your food management with intelligent shopping lists, smart pantry tracking, 
                and personalized AI recommendations. Never waste food or miss a deal again.
              </p>
              
              {/* CTA Buttons */}
              <div className="flex flex-col sm:flex-row gap-6 justify-center items-center mb-16">
                <Link
                  to="/register"
                  className="btn btn-primary btn-lg px-10 py-4 text-lg shadow-xl hover:shadow-2xl transform hover:scale-105 transition-all duration-300"
                >
                  <Zap className="h-5 w-5 mr-2" />
                  Get Started Free
                </Link>
                <Link
                  to="/login"
                  className="btn btn-outline btn-lg px-10 py-4 text-lg shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300"
                >
                  <Bot className="h-5 w-5 mr-2" />
                  Sign In
                </Link>
              </div>
              
              {/* Quick Stats */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
                <div className="glass-card rounded-2xl p-6 text-center hover:scale-105 transition-transform duration-300">
                  <div className="text-3xl font-bold gradient-text mb-2">10k+</div>
                  <div className="text-sm text-neutral-600 font-medium">Happy Users</div>
                </div>
                <div className="glass-card rounded-2xl p-6 text-center hover:scale-105 transition-transform duration-300">
                  <div className="text-3xl font-bold gradient-text mb-2">50%</div>
                  <div className="text-sm text-neutral-600 font-medium">Food Waste Reduction</div>
                </div>
                <div className="glass-card rounded-2xl p-6 text-center hover:scale-105 transition-transform duration-300">
                  <div className="text-3xl font-bold gradient-text mb-2">£200</div>
                  <div className="text-sm text-neutral-600 font-medium">Average Monthly Savings</div>
                </div>
                <div className="glass-card rounded-2xl p-6 text-center hover:scale-105 transition-transform duration-300">
                  <div className="text-3xl font-bold gradient-text mb-2">4.9★</div>
                  <div className="text-sm text-neutral-600 font-medium">User Rating</div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-20 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold text-neutral-900 mb-4">
                Everything You Need for Smart Food Management
              </h2>
              <p className="text-xl text-neutral-600 max-w-2xl mx-auto">
                Our comprehensive platform combines AI intelligence with practical tools 
                to revolutionize how you shop, cook, and manage food.
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {features.map((feature, index) => {
                const Icon = feature.icon
                return (
                  <div key={index} className="text-center group hover:scale-105 transition-transform duration-200">
                    <div className={`w-16 h-16 rounded-xl ${feature.color} flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform`}>
                      <Icon className="h-8 w-8" />
                    </div>
                    <h3 className="text-xl font-semibold text-neutral-900 mb-2">{feature.title}</h3>
                    <p className="text-neutral-600">{feature.description}</p>
                  </div>
                )
              })}
            </div>
          </div>
        </section>

        {/* AI Chat Spotlight */}
        <section className="py-20 bg-gradient-to-r from-purple-600 to-blue-600 text-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center">
              <Bot className="h-16 w-16 mx-auto mb-6 text-white/90" />
              <h2 className="text-3xl md:text-4xl font-bold mb-4">
                Meet Your Personal Food AI
              </h2>
              <p className="text-xl text-white/90 mb-8 max-w-2xl mx-auto">
                Get instant recipe suggestions, nutrition analysis, and smart cooking tips. 
                Our AI learns your preferences and helps you make better food choices.
              </p>
              
              <div className="flex flex-wrap justify-center gap-4 mb-8">
                <div className="bg-white/10 backdrop-blur-sm rounded-lg px-4 py-2">
                  <span className="text-sm">💡 Recipe Suggestions</span>
                </div>
                <div className="bg-white/10 backdrop-blur-sm rounded-lg px-4 py-2">
                  <span className="text-sm">📊 Nutrition Analysis</span>
                </div>
                <div className="bg-white/10 backdrop-blur-sm rounded-lg px-4 py-2">
                  <span className="text-sm">🔄 Food Substitutions</span>
                </div>
                <div className="bg-white/10 backdrop-blur-sm rounded-lg px-4 py-2">
                  <span className="text-sm">💰 Shopping Tips</span>
                </div>
              </div>
              
                             <Link
                 to="/register"
                 className="btn bg-white text-purple-600 hover:bg-white/90 btn-lg px-8 py-4 text-lg font-semibold"
               >
                 <MessageSquare className="h-5 w-5 mr-2" />
                 Start Your Journey
                 <ArrowRight className="h-5 w-5 ml-2" />
               </Link>
            </div>
          </div>
        </section>

        {/* Quick Access Section */}
        <section className="py-20 bg-neutral-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-neutral-900 mb-4">
                Quick Access to Your Tools
              </h2>
              <p className="text-xl text-neutral-600">
                Jump right into any feature and start managing your food smarter
              </p>
            </div>
            
                         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
               <Link
                 to="/app/grocery-lists"
                 className="card hover:shadow-medium transition-all duration-200 group"
               >
                 <div className="card-content text-center">
                   <div className="w-12 h-12 bg-blue-500 rounded-lg flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                     <ShoppingCart className="h-6 w-6 text-white" />
                   </div>
                   <h3 className="font-semibold text-neutral-900 mb-2">Grocery Lists</h3>
                   <p className="text-sm text-neutral-600">Create and manage shopping lists</p>
                   <ArrowRight className="h-4 w-4 mt-2 mx-auto text-neutral-400 group-hover:text-primary-600 transition-colors" />
                 </div>
               </Link>
               
               <Link
                 to="/app/pantry"
                 className="card hover:shadow-medium transition-all duration-200 group"
               >
                 <div className="card-content text-center">
                   <div className="w-12 h-12 bg-green-500 rounded-lg flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                     <Package className="h-6 w-6 text-white" />
                   </div>
                   <h3 className="font-semibold text-neutral-900 mb-2">Pantry</h3>
                   <p className="text-sm text-neutral-600">Track food inventory and expiry</p>
                   <ArrowRight className="h-4 w-4 mt-2 mx-auto text-neutral-400 group-hover:text-primary-600 transition-colors" />
                 </div>
               </Link>
               
               <Link
                 to="/app/stores"
                 className="card hover:shadow-medium transition-all duration-200 group"
               >
                 <div className="card-content text-center">
                   <div className="w-12 h-12 bg-purple-500 rounded-lg flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                     <MapPin className="h-6 w-6 text-white" />
                   </div>
                   <h3 className="font-semibold text-neutral-900 mb-2">Find Stores</h3>
                   <p className="text-sm text-neutral-600">Locate nearby shops and deals</p>
                   <ArrowRight className="h-4 w-4 mt-2 mx-auto text-neutral-400 group-hover:text-primary-600 transition-colors" />
                 </div>
               </Link>
               
               <Link
                 to="/app/profile"
                 className="card hover:shadow-medium transition-all duration-200 group"
               >
                 <div className="card-content text-center">
                   <div className="w-12 h-12 bg-orange-500 rounded-lg flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                     <Users className="h-6 w-6 text-white" />
                   </div>
                   <h3 className="font-semibold text-neutral-900 mb-2">Profile</h3>
                   <p className="text-sm text-neutral-600">Manage preferences and settings</p>
                   <ArrowRight className="h-4 w-4 mt-2 mx-auto text-neutral-400 group-hover:text-primary-600 transition-colors" />
                 </div>
               </Link>
             </div>
          </div>
        </section>

        {/* Testimonials */}
        <section className="py-20 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-3xl font-bold text-neutral-900 mb-4">
                Loved by Thousands of Users
              </h2>
              <p className="text-xl text-neutral-600">
                See what our community says about PantryPal
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {testimonials.map((testimonial, index) => (
                <div key={index} className="card">
                  <div className="card-content">
                    <div className="flex items-center mb-4">
                      {[...Array(testimonial.rating)].map((_, i) => (
                        <Star key={i} className="h-4 w-4 text-yellow-400 fill-current" />
                      ))}
                    </div>
                    <p className="text-neutral-700 mb-4">"{testimonial.content}"</p>
                    <div>
                      <p className="font-semibold text-neutral-900">{testimonial.name}</p>
                      <p className="text-sm text-neutral-600">{testimonial.role}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20 bg-primary-600 text-white">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Ready to Transform Your Food Management?
            </h2>
            <p className="text-xl text-primary-100 mb-8">
              Join thousands of users who are already saving money, reducing waste, and eating better with PantryPal.
            </p>
                         <div className="flex flex-col sm:flex-row gap-4 justify-center">
               <Link
                 to="/register"
                 className="btn bg-white text-primary-600 hover:bg-primary-50 btn-lg px-8 py-4 text-lg font-semibold"
               >
                 <Zap className="h-5 w-5 mr-2" />
                 Start Your Journey
               </Link>
               <Link
                 to="/login"
                 className="btn btn-outline border-white text-white hover:bg-white hover:text-primary-600 btn-lg px-8 py-4 text-lg font-semibold"
               >
                 <Bot className="h-5 w-5 mr-2" />
                 Sign In
               </Link>
             </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="bg-neutral-900 text-white py-12">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
              <div>
                <div className="flex items-center space-x-3 mb-4">
                  <div className="w-8 h-8 bg-primary-500 rounded-lg flex items-center justify-center">
                    <ChefHat className="h-5 w-5 text-white" />
                  </div>
                  <span className="text-xl font-bold">PantryPal</span>
                </div>
                <p className="text-neutral-400">
                  Your intelligent companion for smarter food management and cooking.
                </p>
              </div>
              
              <div>
                <h3 className="font-semibold mb-4">Features</h3>
                <ul className="space-y-2 text-neutral-400">
                  <li><Link to="/grocery-lists" className="hover:text-white transition-colors">Grocery Lists</Link></li>
                  <li><Link to="/pantry" className="hover:text-white transition-colors">Pantry Tracking</Link></li>
                  <li><Link to="/ai-assistant" className="hover:text-white transition-colors">AI Assistant</Link></li>
                  <li><Link to="/stores" className="hover:text-white transition-colors">Store Finder</Link></li>
                </ul>
              </div>
              
              <div>
                <h3 className="font-semibold mb-4">Account</h3>
                <ul className="space-y-2 text-neutral-400">
                  <li><Link to="/login" className="hover:text-white transition-colors">Sign In</Link></li>
                  <li><Link to="/register" className="hover:text-white transition-colors">Sign Up</Link></li>
                  <li><a href="#" className="hover:text-white transition-colors">Settings</a></li>
                  <li><a href="#" className="hover:text-white transition-colors">Help</a></li>
                </ul>
              </div>
              
              <div>
                <h3 className="font-semibold mb-4">Legal</h3>
                <ul className="space-y-2 text-neutral-400">
                  <li><Link to="/terms" className="hover:text-white transition-colors">Terms of Service</Link></li>
                  <li><Link to="/privacy" className="hover:text-white transition-colors">Privacy Policy</Link></li>
                  <li><a href="#" className="hover:text-white transition-colors">Support</a></li>
                  <li><a href="#" className="hover:text-white transition-colors">Contact</a></li>
                </ul>
              </div>
            </div>
            
            <div className="border-t border-neutral-800 mt-8 pt-8 text-center text-neutral-400">
              <p>&copy; 2025 PantryPal. All rights reserved.</p>
            </div>
          </div>
        </footer>
      </div>
    </>
  )
} 