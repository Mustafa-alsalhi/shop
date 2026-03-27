import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { 
  FireIcon,
  ClockIcon,
  TagIcon,
  GiftIcon,
  StarIcon,
  ArrowRightIcon,
  SparklesIcon,
  BoltIcon,
  CurrencyDollarIcon,
  ShoppingBagIcon
} from '@heroicons/react/24/outline'
import { Helmet } from 'react-helmet-async'

const DealsOffers = () => {
  const [timeLeft, setTimeLeft] = useState({})
  const [activeTab, setActiveTab] = useState('all')

  // Calculate time left for deals
  useEffect(() => {
    const calculateTimeLeft = () => {
      const now = new Date()
      const tomorrow = new Date(now)
      tomorrow.setDate(tomorrow.getDate() + 1)
      tomorrow.setHours(0, 0, 0, 0)

      const difference = tomorrow - now
      
      setTimeLeft({
        hours: Math.floor(difference / (1000 * 60 * 60)),
        minutes: Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60)),
        seconds: Math.floor((difference % (1000 * 60)) / 1000)
      })
    }

    calculateTimeLeft()
    const timer = setInterval(calculateTimeLeft, 1000)

    return () => clearInterval(timer)
  }, [])

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        duration: 0.6,
        staggerChildren: 0.2
      }
    }
  }

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { duration: 0.5 }
    }
  }

  const featuredDeals = [
    {
      id: 1,
      title: "Flash Sale - Electronics",
      discount: "50% OFF",
      originalPrice: 2999,
      salePrice: 1499,
      image: "/api/placeholder/400/300",
      category: "Electronics",
      endTime: "23:59:59",
      badge: "Limited Time"
    },
    {
      id: 2,
      title: "Weekend Special - Fashion",
      discount: "40% OFF",
      originalPrice: 599,
      salePrice: 359,
      image: "/api/placeholder/400/300",
      category: "Fashion",
      endTime: "23:59:59",
      badge: "Hot Deal"
    },
    {
      id: 3,
      title: "Clearance Sale - Home & Living",
      discount: "70% OFF",
      originalPrice: 1299,
      salePrice: 389,
      image: "/api/placeholder/400/300",
      category: "Home",
      endTime: "23:59:59",
      badge: "Clearance"
    }
  ]

  const categories = [
    { id: 'all', name: 'All Deals', icon: FireIcon, count: 156 },
    { id: 'electronics', name: 'Electronics', icon: BoltIcon, count: 45 },
    { id: 'fashion', name: 'Fashion', icon: ShoppingBagIcon, count: 38 },
    { id: 'home', name: 'Home & Living', icon: SparklesIcon, count: 29 },
    { id: 'beauty', name: 'Beauty', icon: StarIcon, count: 22 },
    { id: 'sports', name: 'Sports', icon: BoltIcon, count: 22 }
  ]

  const dealTypes = [
    {
      title: "Flash Deals",
      description: "Limited time offers that update every hour",
      icon: ClockIcon,
      color: "from-red-500 to-orange-500",
      deals: 23
    },
    {
      title: "Clearance Sale",
      description: "Last chance to grab these amazing deals",
      icon: TagIcon,
      color: "from-purple-500 to-pink-500",
      deals: 45
    },
    {
      title: "Bundle Offers",
      description: "Save more when you buy together",
      icon: GiftIcon,
      color: "from-green-500 to-teal-500",
      deals: 18
    },
    {
      title: "Member Exclusive",
      description: "Special prices for our loyal customers",
      icon: StarIcon,
      color: "from-blue-500 to-indigo-500",
      deals: 12
    }
  ]

  const upcomingDeals = [
    {
      title: "Black Friday Preview",
      date: "Nov 29, 2024",
      discount: "Up to 80% OFF",
      description: "Get ready for our biggest sale of the year"
    },
    {
      title: "Cyber Monday Special",
      date: "Dec 2, 2024",
      discount: "Tech Deals",
      description: "Exclusive discounts on electronics and gadgets"
    },
    {
      title: "New Year Sale",
      date: "Jan 1, 2025",
      discount: "Start the year right",
      description: "Massive savings across all categories"
    }
  ]

  return (
    <>
      <Helmet>
        <title>Deals & Offers - My Store</title>
        <meta name="description" content="Discover amazing deals and exclusive offers at My Store Saudi Arabia. Flash sales, clearance items, and special promotions." />
      </Helmet>

      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
        {/* Hero Section with Timer */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="bg-gradient-to-r from-primary-600 to-primary-700 text-white py-16"
        >
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center">
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.2, duration: 0.5 }}
                className="inline-flex items-center justify-center w-20 h-20 bg-white/20 rounded-full mb-6"
              >
                <FireIcon className="h-10 w-10 text-white" />
              </motion.div>
              <h1 className="text-4xl md:text-5xl font-bold mb-4">Deals & Offers</h1>
              <p className="text-xl text-primary-100 max-w-3xl mx-auto mb-8">
                Discover amazing deals and exclusive offers. Save big on your favorite products!
              </p>
              
              {/* Countdown Timer */}
              <div className="inline-flex items-center bg-white/20 backdrop-blur-sm rounded-2xl p-6">
                <div className="text-center px-4">
                  <div className="text-3xl font-bold">{String(timeLeft.hours || 0).padStart(2, '0')}</div>
                  <div className="text-sm text-primary-200">Hours</div>
                </div>
                <div className="text-2xl font-bold mx-2">:</div>
                <div className="text-center px-4">
                  <div className="text-3xl font-bold">{String(timeLeft.minutes || 0).padStart(2, '0')}</div>
                  <div className="text-sm text-primary-200">Minutes</div>
                </div>
                <div className="text-2xl font-bold mx-2">:</div>
                <div className="text-center px-4">
                  <div className="text-3xl font-bold">{String(timeLeft.seconds || 0).padStart(2, '0')}</div>
                  <div className="text-sm text-primary-200">Seconds</div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        <motion.div 
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12"
        >
          
          {/* Deal Categories */}
          <motion.div variants={itemVariants} className="mb-12">
            <div className="flex flex-wrap gap-3 justify-center">
              {categories.map((category) => (
                <button
                  key={category.id}
                  onClick={() => setActiveTab(category.id)}
                  className={`flex items-center px-4 py-2 rounded-full font-medium transition-all ${
                    activeTab === category.id
                      ? 'bg-primary-600 text-white shadow-lg'
                      : 'bg-white text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  <category.icon className="h-5 w-5 mr-2" />
                  {category.name}
                  <span className="ml-2 bg-gray-200 text-gray-700 text-xs px-2 py-1 rounded-full">
                    {category.count}
                  </span>
                </button>
              ))}
            </div>
          </motion.div>

          {/* Featured Deals */}
          <motion.div variants={itemVariants} className="mb-16">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">Today's Hot Deals</h2>
              <p className="text-gray-600 max-w-2xl mx-auto">
                Limited time offers you don't want to miss!
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {featuredDeals.map((deal) => (
                <motion.div
                  key={deal.id}
                  whileHover={{ y: -5 }}
                  className="bg-white rounded-2xl shadow-xl overflow-hidden hover:shadow-2xl transition-all"
                >
                  <div className="relative">
                    <div className="aspect-video bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
                      <SparklesIcon className="h-12 w-12 text-gray-400" />
                    </div>
                    <div className="absolute top-4 left-4">
                      <span className="bg-red-500 text-white px-3 py-1 rounded-full text-sm font-semibold">
                        {deal.badge}
                      </span>
                    </div>
                    <div className="absolute top-4 right-4">
                      <span className="bg-black/70 text-white px-3 py-1 rounded-full text-sm font-semibold">
                        {deal.discount}
                      </span>
                    </div>
                  </div>
                  <div className="p-6">
                    <div className="text-sm text-primary-600 font-medium mb-2">{deal.category}</div>
                    <h3 className="text-xl font-bold text-gray-900 mb-4">{deal.title}</h3>
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <div className="text-2xl font-bold text-primary-600">SAR {deal.salePrice}</div>
                        <div className="text-gray-500 line-through">SAR {deal.originalPrice}</div>
                      </div>
                      <div className="text-right">
                        <div className="text-sm text-gray-500">Ends in</div>
                        <div className="font-semibold text-red-600">{deal.endTime}</div>
                      </div>
                    </div>
                    <button className="w-full bg-primary-600 text-white py-3 rounded-lg font-semibold hover:bg-primary-700 transition-colors flex items-center justify-center">
                      Shop Now
                      <ArrowRightIcon className="h-5 w-5 ml-2" />
                    </button>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Deal Types */}
          <motion.div variants={itemVariants} className="mb-16">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">Deal Types</h2>
              <p className="text-gray-600 max-w-2xl mx-auto">
                Different ways to save on your favorite products
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {dealTypes.map((type, index) => (
                <div key={index} className="bg-white rounded-2xl shadow-xl p-6 text-center">
                  <div className={`inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r ${type.color} rounded-full mb-4`}>
                    <type.icon className="h-8 w-8 text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">{type.title}</h3>
                  <p className="text-gray-600 text-sm mb-3">{type.description}</p>
                  <div className="text-primary-600 font-semibold">{type.deals} deals</div>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Upcoming Deals */}
          <motion.div variants={itemVariants} className="mb-16">
            <div className="bg-gradient-to-r from-gray-900 to-gray-800 rounded-2xl p-8 text-white">
              <h2 className="text-2xl font-bold mb-6">Upcoming Deals</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {upcomingDeals.map((deal, index) => (
                  <div key={index} className="bg-white/10 backdrop-blur-sm rounded-xl p-6">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-semibold">{deal.title}</h3>
                      <ClockIcon className="h-5 w-5 text-gray-400" />
                    </div>
                    <div className="text-2xl font-bold text-primary-400 mb-2">{deal.discount}</div>
                    <div className="text-gray-300 text-sm mb-4">{deal.description}</div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-400">{deal.date}</span>
                      <button className="text-primary-400 hover:text-primary-300 font-medium text-sm">
                        Set Reminder
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>

          {/* Newsletter Signup */}
          <motion.div variants={itemVariants}>
            <div className="bg-gradient-to-r from-primary-600 to-primary-700 rounded-2xl p-8 text-center text-white">
              <GiftIcon className="h-16 w-16 mx-auto mb-4" />
              <h2 className="text-3xl font-bold mb-4">Never Miss a Deal!</h2>
              <p className="text-xl text-primary-100 mb-8 max-w-2xl mx-auto">
                Subscribe to our newsletter and get exclusive deals delivered to your inbox
              </p>
              <div className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
                <input
                  type="email"
                  placeholder="Enter your email"
                  className="flex-1 px-4 py-3 rounded-lg text-gray-900 focus:outline-none focus:ring-4 focus:ring-primary-300"
                />
                <button className="px-6 py-3 bg-white text-primary-600 font-semibold rounded-lg hover:bg-gray-50 transition-colors">
                  Subscribe
                </button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </>
  )
}

export default DealsOffers
