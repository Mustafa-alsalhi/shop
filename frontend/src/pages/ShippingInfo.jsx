import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { 
  TruckIcon,
  ClockIcon,
  ShieldCheckIcon,
  CurrencyDollarIcon,
  MapPinIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  InformationCircleIcon,
  RocketLaunchIcon
} from '@heroicons/react/24/outline'
import { Helmet } from 'react-helmet-async'

const ShippingInfo = () => {
  const [selectedCity, setSelectedCity] = useState('riyadh')
  
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

  const shippingOptions = [
    {
      type: "Standard Delivery",
      icon: TruckIcon,
      time: "3-5 Business Days",
      price: "Free (Orders over SAR 200)",
      description: "Reliable standard delivery to all major cities in Saudi Arabia."
    },
    {
      type: "Express Delivery",
      icon: ClockIcon,
      time: "1-2 Business Days",
      price: "SAR 25",
      description: "Fast delivery for urgent orders within Riyadh, Jeddah, and Dammam."
    },
    {
      type: "Same Day Delivery",
      icon: RocketLaunchIcon,
      time: "Same Day",
      price: "SAR 50",
      description: "Available for Riyadh orders placed before 12 PM."
    }
  ]

  const cities = [
    { id: 'riyadh', name: 'Riyadh', deliveryTime: '1-3 days', expressAvailable: true },
    { id: 'jeddah', name: 'Jeddah', deliveryTime: '2-4 days', expressAvailable: true },
    { id: 'dammam', name: 'Dammam', deliveryTime: '2-4 days', expressAvailable: true },
    { id: 'mecca', name: 'Mecca', deliveryTime: '3-5 days', expressAvailable: false },
    { id: 'medina', name: 'Medina', deliveryTime: '3-5 days', expressAvailable: false },
    { id: 'khobar', name: 'Khobar', deliveryTime: '2-4 days', expressAvailable: true }
  ]

  const shippingPolicies = [
    {
      title: "Order Processing Time",
      icon: ClockIcon,
      content: "Orders are processed within 24 hours on business days. Orders placed after 2 PM will be processed the next business day."
    },
    {
      title: "Shipping Confirmation",
      icon: CheckCircleIcon,
      content: "You'll receive a confirmation email with tracking information once your order ships. Track your package in real-time through our website or the carrier's tracking system."
    },
    {
      title: "Shipping Insurance",
      icon: ShieldCheckIcon,
      content: "All orders are automatically insured against loss or damage during transit. If your package is lost or damaged, we'll either reship or refund your order."
    },
    {
      title: "Customs & Duties",
      icon: CurrencyDollarIcon,
      content: "For domestic orders within Saudi Arabia, there are no additional customs fees. All prices include applicable taxes."
    }
  ]

  const restrictions = [
    "Large furniture items over 50kg",
    "Hazardous materials and chemicals",
    "Perishable items",
    "Live animals or plants",
    "Items requiring special handling or temperature control"
  ]

  return (
    <>
      <Helmet>
        <title>Shipping Information - My Store</title>
        <meta name="description" content="Complete shipping information for My Store Saudi Arabia. Delivery options, rates, and policies." />
      </Helmet>

      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
        {/* Hero Section */}
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
                <TruckIcon className="h-10 w-10 text-white" />
              </motion.div>
              <h1 className="text-4xl md:text-5xl font-bold mb-4">Shipping Information</h1>
              <p className="text-xl text-primary-100 max-w-3xl mx-auto">
                Fast, reliable, and affordable shipping across Saudi Arabia. Track your orders every step of the way.
              </p>
            </div>
          </div>
        </motion.div>

        <motion.div 
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12"
        >
          
          {/* Shipping Options */}
          <motion.div variants={itemVariants} className="mb-16">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">Shipping Options</h2>
              <p className="text-gray-600 max-w-2xl mx-auto">
                Choose the delivery method that best suits your needs and timeline.
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {shippingOptions.map((option, index) => (
                <div key={index} className="bg-white rounded-2xl shadow-xl p-6 hover:shadow-2xl transition-shadow">
                  <div className="flex items-center mb-4">
                    <div className="flex-shrink-0 w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center mr-4">
                      <option.icon className="h-6 w-6 text-primary-600" />
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold text-gray-900">{option.type}</h3>
                      <p className="text-sm text-gray-500">{option.time}</p>
                    </div>
                  </div>
                  <p className="text-lg font-semibold text-primary-600 mb-2">{option.price}</p>
                  <p className="text-gray-600 text-sm">{option.description}</p>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Delivery Areas */}
          <motion.div variants={itemVariants} className="mb-16">
            <div className="bg-white rounded-2xl shadow-xl p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Delivery Areas & Times</h2>
              
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Select Your City</h3>
                  <div className="grid grid-cols-2 gap-3">
                    {cities.map((city) => (
                      <button
                        key={city.id}
                        onClick={() => setSelectedCity(city.id)}
                        className={`p-3 rounded-lg border-2 transition-all ${
                          selectedCity === city.id
                            ? 'border-primary-500 bg-primary-50 text-primary-700'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <div className="font-medium">{city.name}</div>
                        <div className="text-sm text-gray-500">{city.deliveryTime}</div>
                        {city.expressAvailable && (
                          <div className="text-xs text-primary-600 mt-1">Express Available</div>
                        )}
                      </button>
                    ))}
                  </div>
                </div>
                
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Delivery Information</h3>
                  <div className="bg-gray-50 rounded-lg p-4">
                    {(() => {
                      const city = cities.find(c => c.id === selectedCity)
                      return (
                        <div className="space-y-3">
                          <div className="flex items-center">
                            <MapPinIcon className="h-5 w-5 text-gray-400 mr-2" />
                            <span className="font-medium">{city?.name}</span>
                          </div>
                          <div className="flex items-center">
                            <ClockIcon className="h-5 w-5 text-gray-400 mr-2" />
                            <span>Standard: {city?.deliveryTime}</span>
                          </div>
                          {city?.expressAvailable && (
                            <div className="flex items-center">
                              <TruckIcon className="h-5 w-5 text-gray-400 mr-2" />
                              <span>Express: 1-2 days</span>
                            </div>
                          )}
                        </div>
                      )
                    })()}
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Shipping Policies */}
          <motion.div variants={itemVariants} className="mb-16">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">Shipping Policies</h2>
              <p className="text-gray-600 max-w-2xl mx-auto">
                Everything you need to know about our shipping process and policies.
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {shippingPolicies.map((policy, index) => (
                <div key={index} className="bg-white rounded-2xl shadow-xl p-6">
                  <div className="flex items-start mb-4">
                    <div className="flex-shrink-0 w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center mr-4">
                      <policy.icon className="h-5 w-5 text-primary-600" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900">{policy.title}</h3>
                  </div>
                  <p className="text-gray-600">{policy.content}</p>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Shipping Restrictions */}
          <motion.div variants={itemVariants} className="mb-16">
            <div className="bg-amber-50 border-2 border-amber-200 rounded-2xl p-8">
              <div className="flex items-center mb-4">
                <ExclamationTriangleIcon className="h-8 w-8 text-amber-600 mr-3" />
                <h3 className="text-xl font-bold text-gray-900">Shipping Restrictions</h3>
              </div>
              <p className="text-gray-700 mb-4">
                The following items cannot be shipped through our standard delivery service:
              </p>
              <ul className="space-y-2">
                {restrictions.map((restriction, index) => (
                  <li key={index} className="flex items-center text-gray-700">
                    <div className="w-2 h-2 bg-amber-500 rounded-full mr-3"></div>
                    {restriction}
                  </li>
                ))}
              </ul>
              <p className="text-gray-600 mt-4 text-sm">
                For special handling requirements, please contact our customer service team.
              </p>
            </div>
          </motion.div>

          {/* Tracking Information */}
          <motion.div variants={itemVariants} className="mb-16">
            <div className="bg-gradient-to-r from-primary-600 to-primary-700 rounded-2xl p-8 text-white">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
                <div>
                  <h3 className="text-2xl font-bold mb-4">Track Your Order</h3>
                  <p className="text-primary-100 mb-6">
                    Stay updated on your order status with our real-time tracking system. Get notifications at every step of your delivery journey.
                  </p>
                  <button className="px-6 py-3 bg-white text-primary-600 font-semibold rounded-lg hover:bg-gray-50 transition-colors">
                    Track Order
                  </button>
                </div>
                <div className="flex justify-center">
                  <div className="w-32 h-32 bg-white/20 rounded-full flex items-center justify-center">
                    <TruckIcon className="h-16 w-16 text-white" />
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

          {/* FAQ Section */}
          <motion.div variants={itemVariants}>
            <div className="bg-white rounded-2xl shadow-xl p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Frequently Asked Questions</h2>
              
              <div className="space-y-6">
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">How much does shipping cost?</h3>
                  <p className="text-gray-600">Standard shipping is free for orders over SAR 200. For orders below this amount, shipping costs SAR 15. Express and same-day delivery have additional charges.</p>
                </div>
                
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">Can I change my delivery address after placing an order?</h3>
                  <p className="text-gray-600">Address changes are possible within 2 hours of order placement. After this time, please contact customer service immediately for assistance.</p>
                </div>
                
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">What if I'm not home when my package arrives?</h3>
                  <p className="text-gray-600">Our delivery team will attempt delivery twice. If unsuccessful, your package will be available for pickup at the nearest collection point.</p>
                </div>
                
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">Do you ship to PO boxes?</h3>
                  <p className="text-gray-600">No, we only deliver to physical addresses within Saudi Arabia. Please provide a complete and accurate delivery address.</p>
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </>
  )
}

export default ShippingInfo
